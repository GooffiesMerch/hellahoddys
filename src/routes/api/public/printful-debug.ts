import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/printful-debug")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const { printful } = await import("@/lib/printful.server");
          const url = new URL(request.url).searchParams.get("p") ?? "/stores"; const res = await printful(url);
          return new Response(JSON.stringify({ ok: true, res }).slice(0, 40000), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (e) {
          return new Response(
            JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }).slice(0, 40000),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});