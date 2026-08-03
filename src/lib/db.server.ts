import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

/**
 * Backend database access that does NOT need the master (service role) key.
 *
 * Public catalog rows are read with the publishable key through row-level
 * security. Every privileged write goes through a `backend_*` database
 * function that is gated by BACKEND_DB_SECRET, so this app can be hosted
 * anywhere (e.g. Cloudflare Workers) with only secrets you control.
 */
function createDb() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY");
  }
  return createClient<Database>(url, key, {
    global: {
      // New-style publishable keys are opaque strings, not bearer JWTs.
      fetch: (input, init) => {
        const headers = new Headers(
          typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
        );
        if (init?.headers) new Headers(init.headers).forEach((v, k) => headers.set(k, v));
        if (headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

let _db: ReturnType<typeof createDb> | undefined;

/** Publishable-key client: public catalog reads only (RLS applies). */
export const db = new Proxy({} as ReturnType<typeof createDb>, {
  get(_t, prop, receiver) {
    if (!_db) _db = createDb();
    return Reflect.get(_db, prop, receiver);
  },
});

function secret(): string {
  const s = process.env["BACKEND_DB_SECRET"];
  if (!s) throw new Error("Missing BACKEND_DB_SECRET");
  return s;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function rpc(name: string, args: Record<string, unknown>): Promise<any> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (db as any).rpc(name, { p_secret: secret(), ...args });
  if (error) throw new Error(`${name} failed: ${error.message}`);
  return data;
}

export interface OrderSummary {
  id: string;
  status: string;
  email: string;
  items: Array<{ title: string; variantLabel?: string; quantity: number; price: number }> | null;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  total: number;
  currency: string;
  tracking_number: string | null;
  tracking_url: string | null;
  carrier: string | null;
  created_at: string;
}

export const backend = {
  upsertProducts: (rows: unknown[]) => rpc("backend_upsert_products", { p_rows: rows }),
  upsertVariants: (rows: unknown[]) => rpc("backend_upsert_variants", { p_rows: rows }),
  deleteProducts: (ids: number[]) => rpc("backend_delete_products", { p_ids: ids }),
  createOrder: (order: Record<string, unknown>) =>
    rpc("backend_create_order", { p_order: order }) as Promise<string>,
  updateOrder: (id: string, patch: Record<string, unknown>) =>
    rpc("backend_update_order", { p_id: id, p_patch: patch }),
  updateOrderTracking: (args: {
    printfulOrderId: number;
    status: string | null;
    trackingNumber: string | null;
    trackingUrl: string | null;
    carrier: string | null;
  }) =>
    rpc("backend_update_order_tracking", {
      p_printful_order_id: args.printfulOrderId,
      p_status: args.status,
      p_tracking_number: args.trackingNumber,
      p_tracking_url: args.trackingUrl,
      p_carrier: args.carrier,
    }),
  getOrder: (id: string) => rpc("backend_get_order", { p_id: id }) as Promise<OrderSummary | null>,
  /** Appends a row to the webhook activity log (best effort). */
  logWebhook: (entry: {
    eventType: string | null;
    statusCode: number;
    ok: boolean;
    note: string | null;
    printfulOrderId: number | null;
    payload: unknown;
  }) =>
    rpc("backend_log_webhook", {
      p_event_type: entry.eventType,
      p_status_code: entry.statusCode,
      p_ok: entry.ok,
      p_note: entry.note,
      p_printful_order_id: entry.printfulOrderId,
      p_payload: entry.payload ?? null,
    }),
  listWebhookLogs: (limit = 100) =>
    rpc("backend_list_webhook_logs", { p_limit: limit }) as Promise<WebhookLogRow[]>,
  /** Returns true when the event is new, false when it is a replay. */
  recordWebhookEvent: (eventId: string, type: string | null, orderId: number | null) =>
    rpc("backend_record_webhook_event", {
      p_event_id: eventId,
      p_event_type: type,
      p_printful_order_id: orderId,
    }) as Promise<boolean>,
};
