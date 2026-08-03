import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { products as staticProducts, type Product } from "@/lib/products";
import { collections } from "@/lib/collections";

const BASE_URL = "https://www.hellahoodys.com";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Mirrors CatalogProvider: the storefront shows every static product plus any
 * Printful product that has imagery and isn't already covered by a static
 * handle/title. A Printful outage must not break the sitemap, so failures fall
 * back to the static catalog.
 */
async function loadCatalogHandles(): Promise<string[]> {
  const known = new Set(staticProducts.map((p) => p.handle));
  const titles = new Set(staticProducts.map((p) => p.title.trim().toLowerCase()));

  let printful: Product[] = [];
  try {
    const { loadPrintfulCatalog } = await import("@/lib/printful-catalog.server");
    printful = await loadPrintfulCatalog();
  } catch (error) {
    console.error("sitemap.xml: Printful catalog unavailable, using static catalog", error);
  }

  const handles = [...known];
  for (const p of printful) {
    if (p.images.length === 0) continue;
    if (known.has(p.handle)) continue;
    if (titles.has(p.title.trim().toLowerCase())) continue;
    known.add(p.handle);
    handles.push(p.handle);
  }

  return handles.filter(Boolean).sort();
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const handles = await loadCatalogHandles();

        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "daily", priority: "1.0" },
          { path: "/shop", changefreq: "daily", priority: "0.9" },
          { path: "/collections", changefreq: "weekly", priority: "0.8" },
          { path: "/about", changefreq: "monthly", priority: "0.5" },
          // Collections without products yet render a "coming soon" placeholder.
          ...collections
            .filter((c) => !c.comingSoon && staticProducts.some((p) => c.match(p)))
            .map((c) => ({
              path: `/collections/${c.slug}`,
              changefreq: "weekly" as const,
              priority: "0.8",
            })),
          ...handles.map((handle) => ({
            path: `/products/${handle}`,
            changefreq: "weekly" as const,
            priority: "0.7",
          })),
        ];

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${xmlEscape(BASE_URL + e.path)}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});