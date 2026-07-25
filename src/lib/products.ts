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

export const products: Product[] = productsData as Product[];

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