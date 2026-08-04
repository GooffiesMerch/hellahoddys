import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useCatalog } from "@/lib/catalog";
import { categories, productsInCategory, productsInSub } from "@/lib/taxonomy";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/shop/")({
  head: () => ({
    meta: [
      { title: "Shop All Categories — Hella Hoodys" },
      {
        name: "description",
        content:
          "Shop every Hella Hoodys drop by category: Football, Baseball, Soccer, Basketball, Holiday/Spiritual, HellaCollabs and HellaBlanks.",
      },
      { property: "og:title", content: "Shop All Categories — Hella Hoodys" },
      {
        property: "og:description",
        content: "Browse all Hella Hoodys categories and sub-categories in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ShopIndex,
});

function ShopIndex() {
  const catalog = useCatalog();
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const groups = useMemo(
    () =>
      categories.map((c) => {
        const items = productsInCategory(c.slug, catalog);
        return {
          category: c,
          items,
          subs: c.subs.map((s) => ({ sub: s, count: productsInSub(c.slug, s.slug, catalog).length })),
        };
      }),
    [catalog],
  );

  const total = catalog.filter((p) => p.images.length > 0).length;
  const results = q
    ? catalog.filter((p) => p.images.length > 0 && p.title.toLowerCase().includes(q))
    : [];

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-12 lg:px-10">
      <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand">All categories</p>
          <h1 className="mt-1 text-4xl font-black tracking-tight">Shop</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {total} products · organized by category and sub-category
          </p>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products…"
          className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring sm:w-72"
        />
      </div>

      {q ? (
        results.length === 0 ? (
          <p className="py-24 text-center text-muted-foreground">No products match “{query}”.</p>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {results.slice(0, 48).map((p) => <ProductCard key={p.handle} p={p} />)}
          </div>
        )
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map(({ category, items, subs }) => (
            <div
              key={category.slug}
              className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:shadow-lg"
            >
              <Link
                to="/shop/$category"
                params={{ category: category.slug }}
                className="group relative block aspect-[5/3] overflow-hidden bg-brand/10"
              >
                {items[0]?.images[0] ? (
                  <img
                    src={items[0].images[0]}
                    alt={category.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs font-bold uppercase tracking-[0.3em] text-brand">
                    Coming soon
                  </div>
                )}
                <span className="absolute right-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest backdrop-blur">
                  {items.length} drops
                </span>
              </Link>
              <div className="flex flex-1 flex-col gap-4 p-5">
                <div>
                  <Link
                    to="/shop/$category"
                    params={{ category: category.slug }}
                    className="text-xl font-black tracking-tight hover:text-brand"
                  >
                    {category.name}
                  </Link>
                  <p className="mt-1 text-sm text-muted-foreground">{category.tagline}</p>
                </div>
                {subs.length > 0 && (
                  <div className="mt-auto flex flex-wrap gap-2">
                    {subs.map(({ sub, count }) => (
                      <Link
                        key={sub.slug}
                        to="/shop/$category/$sub"
                        params={{ category: category.slug, sub: sub.slug }}
                        className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold uppercase tracking-wide transition hover:border-brand hover:text-brand"
                      >
                        {sub.name} <span className="text-muted-foreground">({count})</span>
                      </Link>
                    ))}
                  </div>
                )}
                <Link
                  to="/shop/$category"
                  params={{ category: category.slug }}
                  className="mt-auto flex items-center justify-between border-t border-border pt-3 text-xs font-semibold uppercase tracking-widest text-brand"
                >
                  Shop {category.name} <span aria-hidden>→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
