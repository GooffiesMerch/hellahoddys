import productsData from "../data/products.json";

export interface Variant {
  sku: string;
  price: string;
  opt1: string;
  opt2: string;
  opt3: string;
  stock: number;
}

export interface Product {
  handle: string;
  title: string;
  body: string;
  vendor: string;
  type: string;
  tags: string;
  price: string;
  images: string[];
  options: string[];
  variants: Variant[];
  minPrice: number | null;
  maxPrice: number | null;
  stock: number;
}

function angleRank(url: string): number {
  // Lower rank = prefer this image. Front-only wins, then anything with
  // "front" in the angle, then side/back as last resort.
  const u = url.toLowerCase();
  if (/-front[-.]/.test(u)) return 0;
  if (/front/.test(u) && !/back/.test(u)) return 1;
  if (/-(left|right)[-.]/.test(u)) return 3;
  if (/back/.test(u)) return 4;
  return 2;
}

const raw = productsData as Product[];
export const products: Product[] = raw.map((p) => ({
  ...p,
  images: [...p.images].sort((a, b) => angleRank(a) - angleRank(b)),
}));

export function getProduct(handle: string): Product | undefined {
  return products.find((p) => p.handle === handle);
}

export function formatPrice(n: number | null | undefined): string {
  if (n == null) return "—";
  return `$${n.toFixed(2)}`;
}

export function priceRange(p: Product): string {
  if (p.minPrice == null) return "—";
  if (p.maxPrice == null || p.minPrice === p.maxPrice) return formatPrice(p.minPrice);
  return `${formatPrice(p.minPrice)} – ${formatPrice(p.maxPrice)}`;
}