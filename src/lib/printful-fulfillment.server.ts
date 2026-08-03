import { backend, db } from "./db.server";
import {
  printful,
  parseVariantName,
  listStores,
  type PrintfulSyncVariant,
} from "./printful.server";

export interface ShippingRate {
  id?: string;
  shipping?: string;
  name?: string;
  rate?: string | number;
  currency?: string;
  minDeliveryDays?: number;
  maxDeliveryDays?: number;
  min_delivery_days?: number;
  max_delivery_days?: number;
}

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

export interface PrintfulStoreRef {
  id: number;
  name: string;
}

interface SyncProductSummary {
  id: number;
  external_id?: string;
  name: string;
  thumbnail_url?: string;
}

/** Cache one Printful sync product (and all of its variants) locally. */
async function cacheProduct(store: PrintfulStoreRef, p: SyncProductSummary): Promise<number> {
  const detail = await printful<{ data: PrintfulSyncVariant[] }>(
    `/v2/sync-products/${p.id}/sync-variants?limit=100`,
    {},
    store.id,
  );
  const syncVariants = detail?.data ?? [];
  const now = new Date().toISOString();

  await backend.upsertProducts([
    {
      id: p.id,
      external_id: p.external_id ?? null,
      name: p.name,
      thumbnail_url: p.thumbnail_url ?? null,
      variant_count: syncVariants.length,
      store_id: store.id,
      store_name: store.name,
      synced_at: now,
    },
  ]);

  const rows = syncVariants.map((v) => {
    const parsed = parseVariantName(v.name);
    return {
      id: v.id,
      product_id: p.id,
      store_id: store.id,
      external_id: v.external_id ?? null,
      sku: v.sku ?? null,
      name: v.name,
      size: v.size ?? parsed.size ?? null,
      color: v.color ?? parsed.color ?? null,
      retail_price: v.retail_price ? Number(v.retail_price) : null,
      currency: v.currency ?? "USD",
      thumbnail_url: null,
      availability: v.availability_status ?? null,
      synced_at: now,
    };
  });

  if (rows.length > 0) {
    await backend.upsertVariants(rows);
  }
  return rows.length;
}

/** Drop products (and their variants) that no longer exist in Printful. */
export async function removeProducts(ids: number[]) {
  if (ids.length === 0) return;
  await backend.deleteProducts(ids);
}

/**
 * Incremental catalog refresh across every connected Printful store.
 * Only products that are new or whose variant count changed are re-fetched,
 * so this is cheap enough to run automatically on storefront requests.
 */
export async function syncCatalog(options: { full?: boolean } = {}) {
  const stores = await listStores();
  const limit = 100;
  let products = 0;
  let variants = 0;
  const perStore: Array<{ id: number; name: string; products: number }> = [];

  const { data: cachedRows } = await db
    .from("printful_products")
    .select("id, variant_count");
  const cached = new Map<number, number>(
    (cachedRows ?? []).map((r) => [Number(r.id), Number(r.variant_count ?? 0)]),
  );
  const seen = new Set<number>();

  for (const store of stores) {
    let offset = 0;
    let storeProducts = 0;

    for (;;) {
      const page = await printful<{ data: SyncProductSummary[] }>(
        `/v2/sync-products?offset=${offset}&limit=${limit}`,
        {},
        store.id,
      );
      const list = page?.data ?? [];
      if (list.length === 0) break;

      for (const p of list) {
        seen.add(Number(p.id));
        storeProducts += 1;
        const isKnown = cached.has(Number(p.id));
        if (isKnown && !options.full) continue;

        try {
          variants += await cacheProduct(store, p);
          products += 1;
        } catch (err) {
          // Keep syncing the rest of the catalog if one product call fails.
          console.error(`Printful sync failed for product ${p.id}`, err);
        }
      }

      if (list.length < limit) break;
      offset += limit;
    }

    perStore.push({ id: store.id, name: store.name, products: storeProducts });
  }

  const removed = [...cached.keys()].filter((id) => !seen.has(id));
  await removeProducts(removed);

  return { products, variants, removed: removed.length, stores: perStore };
}

/** Refresh (or delete) a single Printful product, used by product webhooks. */
export async function syncSingleProduct(storeId: number, productId: number) {
  const stores = await listStores();
  const store = stores.find((s) => s.id === Number(storeId)) ?? {
    id: Number(storeId),
    name: "Printful",
  };

  try {
    const res = await printful<{ data: { sync_product?: SyncProductSummary } & SyncProductSummary }>(
      `/v2/sync-products/${productId}`,
      {},
      store.id,
    );
    const p = (res?.data as { sync_product?: SyncProductSummary })?.sync_product ??
      (res?.data as SyncProductSummary);
    if (!p?.id) throw new Error("Product not found");
    await cacheProduct(store, p);
    return { updated: true };
  } catch (err) {
    console.error(`Printful product ${productId} refresh failed; removing from cache`, err);
    await removeProducts([Number(productId)]);
    return { updated: false, removed: true };
  }
}

/** Resolve a cart line to a Printful sync variant (+ its store) via the cache. */
async function resolveVariantId(
  line: OrderLine,
): Promise<{ id: number; storeId: number | null } | null> {
  if (line.sku) {
    // PostgREST `or()` takes a comma-separated filter list, so a SKU containing
    // a comma or parenthesis would otherwise corrupt the query.
    const safeSku = line.sku.replace(/[(),]/g, "");
    const { data } = await db
      .from("printful_variants")
      .select("id, store_id")
      .or(`sku.eq.${safeSku},external_id.eq.${safeSku}`)
      .limit(1)
      .maybeSingle();
    if (data?.id) return { id: Number(data.id), storeId: data.store_id ?? null };
  }

  // Fall back to matching the product name + variant label (e.g. "Black / L").
  const { data } = await db
    .from("printful_variants")
    .select("id, name, store_id")
    .ilike("name", `%${line.title.replace(/%/g, "")}%`)
    .limit(50);

  if (!data || data.length === 0) return null;
  const tokens = (line.variantLabel ?? "")
    .toLowerCase()
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean);
  const match = data.find((v) =>
    tokens.every((token) => v.name.toLowerCase().includes(token)),
  );
  // Only fall back to the first hit when the line has no variant to match on.
  // Guessing a variant would silently ship the wrong size or colour; reporting
  // the line as unmatched is the safe failure.
  if (!match) return tokens.length > 0 ? null : { id: Number(data[0].id), storeId: data[0].store_id ?? null };
  return match ? { id: Number(match.id), storeId: match.store_id ?? null } : null;
}

async function buildPrintfulItems(items: OrderLine[]) {
  const resolved = await Promise.all(
    items.map(async (line) => {
      const hit = await resolveVariantId(line);
      return { line, syncVariantId: hit?.id ?? null, storeId: hit?.storeId ?? null };
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

  const storeId = resolved.find((r) => r.syncVariantId != null)?.storeId ?? null;
  return { printfulItems, unmatched, storeId };
}

export async function shippingRates(recipient: Recipient, items: OrderLine[]) {
  const { printfulItems, unmatched, storeId } = await buildPrintfulItems(items);
  if (printfulItems.length === 0) {
    return {
      rates: [] as Array<{
        id: string;
        name: string;
        rate: string;
        currency: string;
        minDeliveryDays?: number;
        maxDeliveryDays?: number;
      }>,
      unmatched,
    };
  }

  const res = await printful<{ data: ShippingRate[] }>("/v2/shipping-rates", {
    method: "POST",
    body: JSON.stringify({
      recipient: {
        address1: recipient.address1,
        city: recipient.city,
        country_code: recipient.country_code,
        state_code: recipient.state_code || undefined,
        zip: recipient.zip,
      },
      order_items: printfulItems.map((i) => ({
        sync_variant_id: i.sync_variant_id,
        quantity: i.quantity,
      })),
      currency: "USD",
      locale: "en_US",
    }),
  }, storeId);

  const rates = (res?.data ?? []).map((r) => ({
    id: r.id ?? r.shipping ?? "STANDARD",
    name: r.name ?? "Standard",
    rate: String(r.rate ?? "0"),
    currency: r.currency ?? "USD",
    minDeliveryDays: r.minDeliveryDays ?? r.min_delivery_days,
    maxDeliveryDays: r.maxDeliveryDays ?? r.max_delivery_days,
  }));

  return { rates, unmatched };
}

export async function placeOrder(
  recipient: Recipient,
  items: OrderLine[],
  shippingMethod: string,
  opts: { orderId?: string; confirm?: boolean } = {},
) {
  const { printfulItems, unmatched, storeId } = await buildPrintfulItems(items);
  if (printfulItems.length === 0) {
    throw new Error(
      "None of these items are linked to a Printful product yet. Run a catalog sync first.",
    );
  }

  const subtotal = items.reduce((n, i) => n + i.price * i.quantity, 0);

  let orderId: string;
  if (opts.orderId) {
    orderId = opts.orderId;
  } else {
    try {
      orderId = await backend.createOrder({
        status: "pending",
        email: recipient.email,
        recipient,
        items,
        subtotal,
        total: subtotal,
        shipping_method: shippingMethod,
      });
    } catch (err) {
      console.error("Failed to save order", err);
      throw new Error("Could not save your order. Please try again.");
    }
  }

  // confirm=false => the order is created as a draft in Printful and is only
  // charged/fulfilled once it is confirmed (payments are not wired up yet).
  const created = await printful<{
    data: {
      id: number;
      status: string;
      costs?: { shipping?: string; tax?: string; total?: string; currency?: string };
    };
  }>("/v2/orders", {
    method: "POST",
    body: JSON.stringify({
      // Printful rejects external_id longer than 32 chars; a UUID is 36 with
      // its dashes, so strip them to get a stable 32-char id.
      external_id: orderId.replace(/-/g, ""),
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
      order_items: printfulItems.map((i) => ({
        sync_variant_id: i.sync_variant_id,
        quantity: i.quantity,
        retail_price: i.retail_price,
      })),
    }),
  }, storeId);

  const result = created?.data ?? ({} as { id: number; status: string; costs?: Record<string, string> });

  // Paid orders are confirmed immediately so Printful starts production.
  let confirmed: typeof result | null = null;
  if (opts.confirm && result.id) {
    try {
      const res = await printful<{ data: typeof result }>(
        `/v2/orders/${result.id}/confirmation`,
        { method: "POST" },
        storeId,
      );
      confirmed = res?.data ?? null;
    } catch (err) {
      console.error(`Printful confirmation failed for order ${result.id}`, err);
    }
  }
  const final = confirmed ?? result;

  const shippingCost = Number(final.costs?.shipping ?? 0);
  const tax = Number(final.costs?.tax ?? 0);
  const total = Number(final.costs?.total ?? subtotal + shippingCost + tax);

  await backend.updateOrder(orderId, {
    printful_order_id: final.id,
    status: final.status ?? "draft",
    // Paid orders already carry the amounts the customer was charged.
    ...(opts.orderId
      ? {}
      : {
          shipping_cost: shippingCost,
          tax,
          total,
          currency: final.costs?.currency ?? "USD",
        }),
    printful_payload: final,
  });

  return {
    orderId,
    printfulOrderId: final.id,
    status: final.status ?? "draft",
    shippingCost,
    tax,
    total,
    unmatched,
  };
}

/**
 * Re-prices cart lines from the cached Printful catalog so the amount charged
 * is always the catalog price, never a value supplied by the browser.
 */
export async function repriceItems(items: OrderLine[]) {
  const unmatched: string[] = [];
  const lines: OrderLine[] = [];
  for (const line of items) {
    const hit = await resolveVariantId(line);
    if (!hit) {
      unmatched.push(line.title);
      lines.push(line);
      continue;
    }
    const { data } = await db
      .from("printful_variants")
      .select("retail_price")
      .eq("id", hit.id)
      .maybeSingle();
    const price = data?.retail_price != null ? Number(data.retail_price) : line.price;
    lines.push({ ...line, price });
  }
  return { lines, unmatched };
}

export async function orderStatus(id: string) {
  return (await backend.getOrder(id)) ?? null;
}