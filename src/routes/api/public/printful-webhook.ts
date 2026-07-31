import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/printful-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => null)) as {
          type?: string;
          data?: { order?: { id?: number } };
        } | null;

        const orderId = body?.data?.order?.id;
        if (!orderId) {
          return new Response(JSON.stringify({ ok: false, error: "No order id" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { printful } = await import("@/lib/printful.server");

        // Re-fetch from Printful so we only ever trust data from the API itself.
        let verified: {
          id: number;
          status?: string;
          shipments?: Array<{ tracking_number?: string; tracking_url?: string; carrier?: string }>;
        };
        try {
          verified = await printful(`/orders/${orderId}`);
        } catch (err) {
          console.error("Printful webhook verification failed", err);
          return new Response(JSON.stringify({ ok: false }), {
            status: 202,
            headers: { "Content-Type": "application/json" },
          });
        }

        const shipment = verified.shipments?.[verified.shipments.length - 1];

        await supabaseAdmin
          .from("orders")
          .update({
            status: verified.status ?? "updated",
            tracking_number: shipment?.tracking_number ?? null,
            tracking_url: shipment?.tracking_url ?? null,
            carrier: shipment?.carrier ?? null,
          })
          .eq("printful_order_id", verified.id);

        return new Response(JSON.stringify({ ok: true }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});