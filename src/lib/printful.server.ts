/** Server-only Printful API helpers. Never import from client code. */

const PRINTFUL_BASE = "https://api.printful.com";

export interface PrintfulSyncVariant {
  id: number;
  external_id?: string | null;
  sync_product_id: number;
  name: string;
  sku?: string | null;
  retail_price?: string | null;
  currency?: string | null;
  availability_status?: string | null;
  files?: Array<{ type: string; preview_url?: string | null }>;
  product?: { variant_id: number; product_id: number; name?: string } | null;
  size?: string | null;
  color?: string | null;
}

export async function printful<T = unknown>(
  path: string,
  init: RequestInit = {},
  storeId?: number | null,
): Promise<T> {
  const token = process.env["PRINTFUL_API_KEY"];
  if (!token) throw new Error("Printful is not configured yet.");

  const res = await fetch(`${PRINTFUL_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(storeId ? { "X-PF-Store-Id": String(storeId) } : {}),
      ...(init.headers ?? {}),
    },
  });

  const text = await res.text();
  if (!res.ok) {
    console.error(`Printful ${path} failed [${res.status}]: ${text}`);
    throw new Error(`Printful request failed [${res.status}]: ${text}`);
  }

  const json = text ? JSON.parse(text) : {};
  return (json.result ?? json) as T;
}

export interface PrintfulStore {
  id: number;
  name: string;
}

/** Every Printful store the API token can access. */
export async function listStores(): Promise<PrintfulStore[]> {
  try {
    const res = await printful<{ data?: PrintfulStore[] } | PrintfulStore[]>("/v2/stores?limit=100");
    const list = Array.isArray(res) ? res : (res?.data ?? []);
    if (list.length > 0) return list.map((s) => ({ id: Number(s.id), name: s.name }));
  } catch (err) {
    console.error("Printful /v2/stores failed, falling back to v1", err);
  }
  const v1 = await printful<PrintfulStore[]>("/stores");
  return (v1 ?? []).map((s) => ({ id: Number(s.id), name: s.name }));
}

/** Splits a Printful sync-variant name like "HELLA X Hoodie / Black / L". */
export function parseVariantName(name: string): { size?: string; color?: string } {
  const parts = name.split("/").map((p) => p.trim()).filter(Boolean);
  if (parts.length < 2) return {};
  const last = parts[parts.length - 1];
  const prev = parts.length > 2 ? parts[parts.length - 2] : undefined;
  const sizeLike = /^(2?X{0,3}S|XS|S|M|L|XL|2XL|3XL|4XL|5XL|\d+(\.\d+)?"?)$/i;
  if (sizeLike.test(last)) return { size: last, color: prev };
  return { color: last };
}