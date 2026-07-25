import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { products, priceRange } from "@/lib/products";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop — Hella Hoodys" },
      { name: "description", content: "Browse the full Hella Hoodys catalog: hoodies, tees, and print-on-demand streetwear made to order." },
      { property: "og:title", content: "Shop — Hella Hoodys" },
      { property: "og:description", content: "Browse the full Hella Hoodys print-on-demand catalog." },
    ],
  }),
  component: Shop,
});

const PAGE_SIZE = 24;

function Shop() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<string>("");
  const [page, setPage] = useState(1);

  const types = useMemo(() => {
    const s = new Set<string>();
    products.forEach((p) => p.type && s.add(p.type));
    return Array.from(s).sort();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (type && p.type !== type) return false;
      if (q && !p.title.toLowerCase().includes(q)) return false;
      return p.images.length > 0;
    });
  }, [query, type]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Shop</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {filtered.length} products · made to order
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder="Search products…"
            className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <select
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(1); }}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">All types</option>
            {types.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="py-24 text-center text-muted-foreground">No products match your search.</p>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((p) => (
            <Link
              key={p.handle}
              to="/products/$handle"
              params={{ handle: p.handle }}
              className="group"
            >
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
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={current === 1}
            className="rounded-md border border-border px-4 py-2 text-sm disabled:opacity-40"
          >
            Previous
          </button>
          <span className="px-3 text-sm text-muted-foreground">
            Page {current} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={current === totalPages}
            className="rounded-md border border-border px-4 py-2 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}