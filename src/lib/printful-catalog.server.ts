import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Product, Variant } from "./products";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Reads the synced Printful catalog cache and maps it into the storefront
 * Product shape so published Printful products can render on the site.
 */
export async function loadPrintfulCatalog(): Promise<Product[]> {
  const [{ data: prods }, { data: vars }] = await Promise.all([
    supabaseAdmin
      .from("printful_products")
      .select("id, external_id, name, thumbnail_url")
      .order("name"),
    supabaseAdmin
      .from("printful_variants")
      .select("id, product_id, sku, name, size, color, retail_price, currency"),
  ]);

  if (!prods || prods.length === 0) return [];

  type VariantRow = {
    product_id: number;
    sku: string | null;
    size: string | null;
    color: string | null;
    retail_price: number | null;
  };

  const byProduct = new Map<number, VariantRow[]>();
  for (const v of (vars ?? []) as VariantRow[]) {
    const key = Number(v.product_id);
    const list = byProduct.get(key) ?? [];
    list.push(v);
    byProduct.set(key, list);
  }

  return prods.map((p) => {
    const rows = byProduct.get(Number(p.id)) ?? [];

    const variants: Variant[] = rows.map((v) => ({
      sku: v.sku ?? "",
      price: v.retail_price != null ? String(v.retail_price) : "",
      opt1: v.color ?? "",
      opt2: v.size ?? "",
      opt3: "",
      stock: 10,
    }));

    const prices = rows
      .map((v) => (v.retail_price != null ? Number(v.retail_price) : NaN))
      .filter((n) => Number.isFinite(n));

    const options: string[] = [];
    if (rows.some((v) => v.color)) options.push("Color");
    if (rows.some((v) => v.size)) options.push("Size");

    return {
      handle: slugify(p.external_id || p.name || String(p.id)),
      title: p.name,
      body: "",
      vendor: "Hella Hoodys",
      type: "",
      tags: "printful",
      price: prices.length ? String(Math.min(...prices)) : "",
      images: p.thumbnail_url ? [p.thumbnail_url] : [],
      options,
      variants,
      minPrice: prices.length ? Math.min(...prices) : null,
      maxPrice: prices.length ? Math.max(...prices) : null,
      stock: variants.length ? 10 : 0,
    } satisfies Product;
  });
}
