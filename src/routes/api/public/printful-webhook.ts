import { createFileRoute } from "@tanstack/react-router";
import { timingSafeEqual } from "crypto";
import { z } from "zod";

const MAX_EVENT_AGE_SECONDS = 15 * 60;

const payloadSchema = z.object({
  type: z.string().min(1).max(100).optional(),
  created: z.number().int().positive().optional(),
  retries: z.number().int().nonnegative().optional(),
  store: z.number().int().positive().optional(),
  data: z
    .object({
      order: z.object({ id: z.number().int().positive() }).passthrough().optional(),
      sync_product: z.object({ id: z.number().int().positive() }).passthrough().optional(),
    })
    .passthrough()
    .optional(),
});

const PRODUCT_EVENTS = new Set([
  "product_synced",
  "product_updated",
  "product_deleted",
  "catalog_stock_updated",
]);

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** Constant-time string compare that never leaks length via early return. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // Compare against itself so the work done is independent of the guess.
    timingSafeEqual(bufA, bufA);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

export const Route = createFileRoute("/api/public/printful-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // 1. Authenticate the caller with the shared token. Printful can't send
        // custom headers, so the token travels in the webhook URL query string.
        const expected = process.env["PRINTFUL_WEBHOOK_TOKEN"];
        if (!expected) {
          console.error("PRINTFUL_WEBHOOK_TOKEN is not configured");
          return json({ ok: false }, 503);
        }
        const url = new URL(request.url);
        const presented =
          url.searchParams.get("token") ?? request.headers.get("x-printful-token") ?? "";
        if (!safeEqual(presented, expected)) {
          return json({ ok: false, error: "Unauthorized" }, 401);
        }

        // 2. Validate the payload shape.
        const parsed = payloadSchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) {
          return json({ ok: false, error: "Invalid payload" }, 400);
        }
        const body = parsed.data;

        // 3. Reject stale events (replayed captures of old deliveries).
        if (body.created) {
          const ageSeconds = Math.floor(Date.now() / 1000) - body.created;
          if (Math.abs(ageSeconds) > MAX_EVENT_AGE_SECONDS) {
            return json({ ok: false, error: "Event too old" }, 400);
          }
        }

        // Product events keep the storefront catalog in sync automatically:
        // publishing in Printful puts the product on the site with no manual step.
        if (PRODUCT_EVENTS.has(body.type ?? "")) {
          const productId = body.data?.sync_product?.id;
          const storeId = body.store;
          if (!productId || !storeId) {
            return json({ ok: false, error: "No product id" }, 400);
          }
          const { syncSingleProduct } = await import("@/lib/printful-fulfillment.server");
          if (body.type === "product_deleted") {
            const { removeProducts } = await import("@/lib/printful-fulfillment.server");
            await removeProducts([productId]);
          } else {
            await syncSingleProduct(storeId, productId);
          }
          return json({ ok: true, product: productId });
        }

        const orderId = body.data?.order?.id;
        if (!orderId) {
          return json({ ok: false, error: "No order id" }, 400);
        }

        const { backend } = await import("@/lib/db.server");
        const { printful } = await import("@/lib/printful.server");

        // 4. Reject exact replays. Printful has no event id, so the delivery is
        // keyed by type + order + emit timestamp + retry counter; the unique
        // index makes the insert the atomic dedupe check.
        const eventId = [
          body.type ?? "unknown",
          orderId,
          body.created ?? "no-ts",
          body.retries ?? 0,
        ].join(":");

        try {
          const isNew = await backend.recordWebhookEvent(eventId, body.type ?? null, orderId);
          if (!isNew) return json({ ok: true, duplicate: true });
        } catch (err) {
          console.error("Webhook dedupe insert failed", err);
          return json({ ok: false }, 500);
        }

        // 5. Re-fetch from Printful so we only ever trust data from the API itself.
        let verified: {
          id: number;
          status?: string;
          shipments?: Array<{ tracking_number?: string; tracking_url?: string; carrier?: string }>;
        };
        try {
          verified = await printful(`/orders/${orderId}`);
        } catch (err) {
          console.error("Printful webhook verification failed", err);
          return json({ ok: false }, 202);
        }

        const shipment = verified.shipments?.[verified.shipments.length - 1];

        await backend.updateOrderTracking({
          printfulOrderId: verified.id,
          status: verified.status ?? "updated",
          trackingNumber: shipment?.tracking_number ?? null,
          trackingUrl: shipment?.tracking_url ?? null,
          carrier: shipment?.carrier ?? null,
        });

        return new Response(JSON.stringify({ ok: true }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});