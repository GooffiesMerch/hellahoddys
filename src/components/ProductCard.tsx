import { Link } from "@tanstack/react-router";
import { priceRange, type Product } from "@/lib/products";

export function ProductCard({ p }: { p: Product }) {
  return (
    <Link to="/products/$handle" params={{ handle: p.handle }} className="group">
      <div className="aspect-square overflow-hidden rounded-md bg-muted">
        <img
          src={p.images[0]}
          alt={p.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>
      <div className="mt-3">
        <p className="line-clamp-2 text-sm font-medium">{p.title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{priceRange(p)}</p>
      </div>
    </Link>
  );
}

export function ProductGrid({ items }: { items: Product[] }) {
  if (items.length === 0) {
    return <p className="py-16 text-center text-sm text-muted-foreground">Dropping soon — check back.</p>;
  }
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((p) => <ProductCard key={p.handle} p={p} />)}
    </div>
  );
}
