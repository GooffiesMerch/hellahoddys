import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/printful-debug")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const { printful } = await import("@/lib/printful.server");
          const res = await printful("/stores");
          return new Response(JSON.stringify({ ok: true, res }).slice(0, 2000), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (e) {
          return new Response(
            JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }).slice(0, 2000),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});