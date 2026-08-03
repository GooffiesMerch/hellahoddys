import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Build a Cloudflare Worker (server build) so Printful sync, webhooks and the
// database work on the Cloudflare-hosted domain — not just a static export.
export default defineConfig({
  nitro: {
    preset: "cloudflare-module",
    output: {
      dir: "dist",
      serverDir: "dist/server",
      publicDir: "dist/client",
    },
    cloudflare: {
      nodeCompat: true,
      deployConfig: true,
    },
  },
});
