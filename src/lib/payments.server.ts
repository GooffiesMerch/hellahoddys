import { backend } from "./db.server";
import {
  createStripeClient,
  type StripeEnv,
  type StripeCheckoutSession,
} from "./stripe.server";
import {
  placeOrder,
  repriceItems,
  shippingRates,
  type OrderLine,
  type Recipient,
} from "./printful-fulfillment.server";

const TANGIBLE_GOODS_TAX_CODE = "txcd_99999999";

function cents(n: number) {
  return Math.round(n * 100);
}

/** Reuse a Stripe customer per email so repeat buyers keep one record. */
async function resolveCustomer(
  stripe: ReturnType<typeof createStripeClient>,
  recipient: Recipient,
) {
  const address = {
    line1: recipient.address1,
    line2: recipient.address2 || undefined,
    city: recipient.city,
    state: recipient.state_code || undefined,
    postal_code: recipient.zip,
    country: recipient.country_code,
  };
  const existing = await stripe.customers.list({ email: recipient.email, limit: 1 });
  if (existing.data.length) {
    const id = existing.data[0].id;
    await stripe.customers.update(id, { name: recipient.name, address, shipping: { name: recipient.name, address } });
    return id;
  }
  const created = await stripe.customers.create({
    email: recipient.email,
    name: recipient.name,
    address,
    shipping: { name: recipient.name, address },
  });
  return created.id;
}

export async function createCheckout(input: {
  recipient: Recipient;
  items: OrderLine[];
  shippingMethod: string;
  returnUrl: string;
  environment: StripeEnv;
}) {
  const stripe = createStripeClient(input.environment);

  // Never trust browser prices: re-read them from the cached Printful catalog.
  const { lines, unmatched } = await repriceItems(input.items);
  if (unmatched.length === lines.length) {
    throw new Error("These items are not available for fulfillment right now.");
  }

  // Re-quote shipping server-side too, so the charged rate is authoritative.
  let shippingCost = 0;
  let shippingLabel = "Shipping";
  try {
    const quote = await shippingRates(input.recipient, lines);
    const match =
      quote.rates.find((r) => r.id === input.shippingMethod) ?? quote.rates[0] ?? null;
    if (match) {
      shippingCost = Number(match.rate) || 0;
      shippingLabel = match.name;
    }
  } catch (err) {
    console.error("Shipping re-quote failed; charging shipping at $0", err);
  }

  const subtotal = lines.reduce((n, l) => n + l.price * l.quantity, 0);

  const orderId = await backend.createOrder({
    status: "awaiting_payment",
    payment_status: "unpaid",
    email: input.recipient.email,
    recipient: input.recipient,
    items: lines,
    subtotal,
    shipping_cost: shippingCost,
    total: subtotal + shippingCost,
    shipping_method: input.shippingMethod,
    currency: "USD",
  });

  const customer = await resolveCustomer(stripe, input.recipient);

  const params: Record<string, unknown> = {
    mode: "payment",
    ui_mode: "embedded_page",
    return_url: input.returnUrl,
    customer,
    line_items: lines.map((l) => ({
      quantity: l.quantity,
      price_data: {
        currency: "usd",
        unit_amount: cents(l.price),
        tax_behavior: "exclusive",
        product_data: {
          name: `${l.title}${l.variantLabel ? ` — ${l.variantLabel}` : ""}`.slice(0, 250),
          tax_code: TANGIBLE_GOODS_TAX_CODE,
        },
      },
    })),
    ...(shippingCost > 0
      ? {
          shipping_options: [
            {
              shipping_rate_data: {
                type: "fixed_amount",
                display_name: shippingLabel,
                tax_behavior: "exclusive",
                fixed_amount: { amount: cents(shippingCost), currency: "usd" },
              },
            },
          ],
        }
      : {}),
    payment_intent_data: {
      description: `Hella Hoodys order ${orderId.slice(0, 8)}`,
      receipt_email: input.recipient.email,
      metadata: { orderId },
    },
    metadata: { orderId },
    automatic_tax: { enabled: true },
  };

  let session: StripeCheckoutSession;
  try {
    session = await stripe.checkout.sessions.create(params);
  } catch (err) {
    // Stripe Tax may not be activated yet — fall back to a tax-free session
    // rather than blocking the sale.
    console.error("Checkout session with automatic tax failed; retrying without", err);
    delete params["automatic_tax"];
    session = await stripe.checkout.sessions.create(params);
  }

  await backend.updateOrder(orderId, { stripe_session_id: session.id });

  return { clientSecret: session.client_secret ?? "", orderId, unmatched };
}

/**
 * Confirms payment for a checkout session and sends the order to Printful.
 * Safe to call repeatedly (return page + webhook both call it).
 */
export async function finalizeCheckout(sessionId: string, environment: StripeEnv) {
  const stripe = createStripeClient(environment);
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  const order = await backend.getOrderBySession(sessionId);
  if (!order) return { paid: false, orderId: null, status: "unknown" as const };

  const orderId = String(order["id"]);
  if (order["printful_order_id"]) {
    return { paid: true, orderId, status: "fulfilling" as const };
  }
  if (session.payment_status !== "paid") {
    return { paid: false, orderId, status: "pending" as const };
  }

  const total = (session.amount_total ?? 0) / 100;
  const tax = (session.total_details?.amount_tax ?? 0) / 100;
  const shipping = (session.total_details?.amount_shipping ?? 0) / 100;

  await backend.updateOrder(orderId, {
    payment_status: "paid",
    status: "paid",
    amount_paid: total,
    total,
    tax,
    shipping_cost: shipping,
    currency: (session.currency ?? "usd").toUpperCase(),
  });

  try {
    await placeOrder(
      order["recipient"] as Recipient,
      order["items"] as OrderLine[],
      String(order["shipping_method"] ?? "STANDARD"),
      { orderId, confirm: true },
    );
  } catch (err) {
    console.error(`Printful submission failed for paid order ${orderId}`, err);
    await backend.updateOrder(orderId, { status: "fulfillment_failed" });
    return { paid: true, orderId, status: "fulfillment_failed" as const };
  }

  return { paid: true, orderId, status: "fulfilling" as const };
}