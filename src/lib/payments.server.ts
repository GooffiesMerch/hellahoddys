import { backend } from "./db.server";
import { paypalRequest } from "./paypal.server";
import {
  placeOrder,
  repriceItems,
  shippingRates,
  type OrderLine,
  type Recipient,
} from "./printful-fulfillment.server";

const money = (n: number) => ({ currency_code: "USD", value: n.toFixed(2) });
const round2 = (n: number) => Math.round(n * 100) / 100;

interface PaypalOrder {
  id: string;
  status: string;
  purchase_units?: Array<{
    amount?: { value?: string; currency_code?: string; breakdown?: Record<string, { value?: string }> };
    payments?: { captures?: Array<{ id: string; status: string; amount?: { value?: string; currency_code?: string } }> };
  }>;
}

/**
 * Creates a pending order in our database and a matching PayPal order.
 * Prices and shipping are always recomputed server-side — never trusted
 * from the browser.
 */
export async function createCheckout(input: {
  recipient: Recipient;
  items: OrderLine[];
  shippingMethod: string;
}) {
  const { lines, unmatched } = await repriceItems(input.items);
  if (unmatched.length === lines.length) {
    throw new Error("These items are not available for fulfillment right now.");
  }

  let shippingCost = 0;
  try {
    const quote = await shippingRates(input.recipient, lines);
    const match =
      quote.rates.find((r) => r.id === input.shippingMethod) ?? quote.rates[0] ?? null;
    if (match) shippingCost = Number(match.rate) || 0;
  } catch (err) {
    console.error("Shipping re-quote failed; charging shipping at $0", err);
  }
  shippingCost = round2(shippingCost);

  const subtotal = round2(lines.reduce((n, l) => n + l.price * l.quantity, 0));
  const total = round2(subtotal + shippingCost);

  const orderId = await backend.createOrder({
    status: "awaiting_payment",
    payment_status: "unpaid",
    email: input.recipient.email,
    recipient: input.recipient,
    items: lines,
    subtotal,
    shipping_cost: shippingCost,
    total,
    shipping_method: input.shippingMethod,
    currency: "USD",
  });

  const paypalOrder = await paypalRequest<PaypalOrder>("/v2/checkout/orders", {
    method: "POST",
    requestId: orderId,
    body: {
      intent: "CAPTURE",
      purchase_units: [
        {
          custom_id: orderId,
          invoice_id: `HH-${orderId.slice(0, 8)}-${Date.now().toString(36)}`,
          description: `Hella Hoodys order ${orderId.slice(0, 8)}`,
          amount: {
            ...money(total),
            breakdown: { item_total: money(subtotal), shipping: money(shippingCost) },
          },
          items: lines.map((l) => ({
            name: `${l.title}${l.variantLabel ? ` — ${l.variantLabel}` : ""}`.slice(0, 127),
            quantity: String(l.quantity),
            unit_amount: money(round2(l.price)),
            category: "PHYSICAL_GOODS",
          })),
          shipping: {
            type: "SHIPPING",
            name: { full_name: input.recipient.name.slice(0, 300) },
            address: {
              address_line_1: input.recipient.address1,
              ...(input.recipient.address2 ? { address_line_2: input.recipient.address2 } : {}),
              admin_area_2: input.recipient.city,
              ...(input.recipient.state_code ? { admin_area_1: input.recipient.state_code } : {}),
              postal_code: input.recipient.zip,
              country_code: input.recipient.country_code,
            },
          },
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            shipping_preference: "SET_PROVIDED_ADDRESS",
            user_action: "PAY_NOW",
            brand_name: "Hella Hoodys",
          },
        },
      },
    },
  });

  await backend.updateOrder(orderId, { paypal_order_id: paypalOrder.id });

  return { paypalOrderId: paypalOrder.id, orderId, unmatched };
}

/**
 * Captures a PayPal order and hands the paid order to Printful.
 * Safe to call more than once — a captured order is simply re-read.
 */
export async function finalizeCheckout(paypalOrderId: string) {
  const order = await backend.getOrderBySession(paypalOrderId);
  if (!order) return { paid: false, orderId: null, status: "unknown" as const };

  const orderId = String(order["id"]);
  if (order["printful_order_id"]) {
    return { paid: true, orderId, status: "fulfilling" as const };
  }

  let remote = await paypalRequest<PaypalOrder>(`/v2/checkout/orders/${paypalOrderId}`);

  if (remote.status === "APPROVED" || remote.status === "SAVED") {
    try {
      remote = await paypalRequest<PaypalOrder>(
        `/v2/checkout/orders/${paypalOrderId}/capture`,
        { method: "POST", body: {}, requestId: `cap-${orderId}` },
      );
    } catch (err) {
      // A concurrent caller may have captured first; re-read before failing.
      const message = err instanceof Error ? err.message : "";
      if (!message.includes("ORDER_ALREADY_CAPTURED")) throw err;
      remote = await paypalRequest<PaypalOrder>(`/v2/checkout/orders/${paypalOrderId}`);
    }
  }

  const capture = remote.purchase_units?.[0]?.payments?.captures?.[0];
  const paid = remote.status === "COMPLETED" && capture?.status === "COMPLETED";
  if (!paid) return { paid: false, orderId, status: "pending" as const };

  const amount = Number(capture?.amount?.value ?? remote.purchase_units?.[0]?.amount?.value ?? 0);

  await backend.updateOrder(orderId, {
    payment_status: "paid",
    status: "paid",
    amount_paid: amount,
    total: amount,
    currency: (capture?.amount?.currency_code ?? "USD").toUpperCase(),
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
