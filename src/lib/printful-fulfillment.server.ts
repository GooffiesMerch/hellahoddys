import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { printful, parseVariantName, type PrintfulSyncVariant } from "./printful.server";

export interface Recipient {
  name: string;
  email: string;
  address1: string;
  address2?: string;
  city: string;
  state_code?: string;
  country_code: string;
  zip: string;
  phone?: string;
}

export interface OrderLine {
  handle: string;
  title: string;
  sku?: string;
  variantLabel?: string;
  price: number;
  quantity: number;
}

/** Pull every sync product + variant from the Printful store into the cache. */
export async function syncCatalog() {
  let offset = 0;
  const limit = 100;
  let products = 0;
  let variants = 0;

  for (;;) {
    const page = await printful<Array<{ id: number }>>(
      `/store/products?offset=${offset}&limit=${limit}`,
    );
    if (!Array.isArray(page) || page.length === 0) break;

    for (const summary of page) {
      const detail = await printful<{
        sync_product: { id: number; external_id?: string; name: string; thumbnail_url?: string };
        sync_variants: PrintfulSyncVariant[];
      }>(`/store/products/${summary.id}`);

      const p = detail.sync_product;
      await supabaseAdmin.from("printful_products").upsert({
        id: p.id,
        external_id: p.external_id ?? null,
        name: p.name,
        thumbnail_url: p.thumbnail_url ?? null,
        variant_count: detail.sync_variants?.length ?? 0,
        synced_at: new Date().toISOString(),
      });
      products += 1;

      const rows = (detail.sync_variants ?? []).map((v) => {
        const parsed = parseVariantName(v.name);
        return {
          id: v.id,
          product_id: p.id,
          external_id: v.external_id ?? null,
          sku: v.sku ?? null,
          name: v.name,
          size: v.size ?? parsed.size ?? null,
          color: v.color ?? parsed.color ?? null,
          retail_price: v.retail_price ? Number(v.retail_price) : null,
          currency: v.currency ?? "USD",
          thumbnail_url: v.files?.find((f) => f.type === "preview")?.preview_url ?? null,
          availability: v.availability_status ?? null,
          synced_at: new Date().toISOString(),
        };
      });

      if (rows.length > 0) {
        await supabaseAdmin.from("printful_variants").upsert(rows);
        variants += rows.length;
      }
    }

    if (page.length < limit) break;
    offset += limit;
  }

  return { products, variants };
}

/** Resolve a cart line to a Printful sync variant id using the cached catalog. */
async function resolveVariantId(line: OrderLine): Promise<number | null> {
  if (line.sku) {
    const { data } = await supabaseAdmin
      .from("printful_variants")
      .select("id")
      .or(`sku.eq.${line.sku},external_id.eq.${line.sku}`)
      .limit(1)
      .maybeSingle();
    if (data?.id) return Number(data.id);
  }

  // Fall back to matching the product name + variant label (e.g. "Black / L").
  const { data } = await supabaseAdmin
    .from("printful_variants")
    .select("id, name")
    .ilike("name", `%${line.title.replace(/%/g, "")}%`)
    .limit(50);

  if (!data || data.length === 0) return null;
  const label = (line.variantLabel ?? "").toLowerCase();
  const match =
    data.find((v) =>
      label
        .split("/")
        .map((s) => s.trim())
        .filter(Boolean)
        .every((token) => v.name.toLowerCase().includes(token)),
    ) ?? data[0];
  return match ? Number(match.id) : null;
}

async function buildPrintfulItems(items: OrderLine[]) {
  const resolved = await Promise.all(
    items.map(async (line) => {
      const syncVariantId = await resolveVariantId(line);
      return { line, syncVariantId };
    }),
  );

  const unmatched = resolved.filter((r) => r.syncVariantId == null).map((r) => r.line.title);
  const printfulItems = resolved
    .filter((r) => r.syncVariantId != null)
    .map((r) => ({
      sync_variant_id: r.syncVariantId!,
      quantity: r.line.quantity,
      retail_price: r.line.price.toFixed(2),
    }));

  return { printfulItems, unmatched };
}

export async function shippingRates(recipient: Recipient, items: OrderLine[]) {
  const { printfulItems, unmatched } = await buildPrintfulItems(items);
  if (printfulItems.length === 0) {
    return { rates: [], unmatched };
  }

  const rates = await printful<
    Array<{ id: string; name: string; rate: string; currency: string; minDeliveryDays?: number; maxDeliveryDays?: number }>
  >("/shipping/rates", {
    method: "POST",
    body: JSON.stringify({
      recipient: {
        address1: recipient.address1,
        city: recipient.city,
        country_code: recipient.country_code,
        state_code: recipient.state_code || undefined,
        zip: recipient.zip,
      },
      items: printfulItems.map((i) => ({
        variant_id: undefined,
        sync_variant_id: i.sync_variant_id,
        quantity: i.quantity,
      })),
      currency: "USD",
      locale: "en_US",
    }),
  });

  return { rates, unmatched };
}

export async function placeOrder(
  recipient: Recipient,
  items: OrderLine[],
  shippingMethod: string,
) {
  const { printfulItems, unmatched } = await buildPrintfulItems(items);
  if (printfulItems.length === 0) {
    throw new Error(
      "None of these items are linked to a Printful product yet. Run a catalog sync first.",
    );
  }

  const subtotal = items.reduce((n, i) => n + i.price * i.quantity, 0);

  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .insert({
      status: "pending",
      email: recipient.email,
      recipient: recipient as unknown as never,
      items: items as unknown as never,
      subtotal,
      total: subtotal,
      shipping_method: shippingMethod,
    })
    .select("id")
    .single();

  if (error || !order) {
    console.error("Failed to save order", error);
    throw new Error("Could not save your order. Please try again.");
  }

  // confirm=false => the order is created as a draft in Printful and is only
  // charged/fulfilled once it is confirmed (payments are not wired up yet).
  const result = await printful<{
    id: number;
    status: string;
    costs?: { shipping?: string; tax?: string; total?: string; currency?: string };
  }>("/orders?confirm=false", {
    method: "POST",
    body: JSON.stringify({
      external_id: order.id,
      shipping: shippingMethod,
      recipient: {
        name: recipient.name,
        email: recipient.email,
        address1: recipient.address1,
        address2: recipient.address2 || undefined,
        city: recipient.city,
        state_code: recipient.state_code || undefined,
        country_code: recipient.country_code,
        zip: recipient.zip,
        phone: recipient.phone || undefined,
      },
      items: printfulItems,
    }),
  });

  const shippingCost = Number(result.costs?.shipping ?? 0);
  const tax = Number(result.costs?.tax ?? 0);
  const total = Number(result.costs?.total ?? subtotal + shippingCost + tax);

  await supabaseAdmin
    .from("orders")
    .update({
      printful_order_id: result.id,
      status: result.status ?? "draft",
      shipping_cost: shippingCost,
      tax,
      total,
      currency: result.costs?.currency ?? "USD",
      printful_payload: result as unknown as never,
    })
    .eq("id", order.id);

  return {
    orderId: order.id as string,
    printfulOrderId: result.id,
    status: result.status ?? "draft",
    shippingCost,
    tax,
    total,
    unmatched,
  };
}

export async function orderStatus(id: string) {
  const { data } = await supabaseAdmin
    .from("orders")
    .select(
      "id, status, email, items, subtotal, shipping_cost, tax, total, currency, tracking_number, tracking_url, carrier, created_at",
    )
    .eq("id", id)
    .maybeSingle();

  return data ?? null;
}