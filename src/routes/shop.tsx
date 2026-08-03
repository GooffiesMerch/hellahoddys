import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { priceRange, type Product } from "@/lib/products";
import { useCatalog } from "@/lib/catalog";
import { collections, productsIn } from "@/lib/collections";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop — Hella Hoodys" },
      { name: "description", content: "Browse the full Hella Hoodys catalog grouped by game — NFL, NCAA, Baseball, Greek Life and more." },
      { property: "og:title", content: "Shop — Hella Hoodys" },
      { property: "og:description", content: "Browse the full Hella Hoodys print-on-demand catalog, grouped by game." },
    ],
  }),
  component: Shop,
});

function ProductCard({ p }: { p: Product }) {
  return (
    <Link
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
  );
}

function Shop() {
  const [query, setQuery] = useState("");
  const catalog = useCatalog();

  const grouped = useMemo(() => {
    const seen = new Set<string>();
    const groups = collections.map((c) => {
      const items = productsIn(c.slug, catalog).filter((p) => {
        if (seen.has(p.handle)) return false;
        seen.add(p.handle);
        return true;
      });
      return { collection: c, items };
    });
    // Anything not matched by a collection
    const others = catalog.filter((p) => p.images.length > 0 && !seen.has(p.handle));
    return { groups, others };
  }, [catalog]);

  const q = query.trim().toLowerCase();
  const totalCount =
    grouped.groups.reduce((n, g) => n + g.items.length, 0) + grouped.others.length;

  const filterItems = (items: Product[]) =>
    q ? items.filter((p) => p.title.toLowerCase().includes(q)) : items;

  const visibleGroups = grouped.groups
    .map((g) => ({ ...g, items: filterItems(g.items) }))
    .filter((g) => g.items.length > 0);
  const visibleOthers = filterItems(grouped.others);
  const anyVisible = visibleGroups.length > 0 || visibleOthers.length > 0;

  const match = (words: string[]) =>
    catalog.filter(
      (p) =>
        p.images.length > 0 &&
        words.some((w) => (p.title + " " + p.tags + " " + p.type).toLowerCase().includes(w)),
    );
  const collabs = filterItems(match(["collab"]));
  const blanks = filterItems(match(["blank"]));

  return (
    <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-12">
      <div className="mb-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Shop</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {totalCount} products · grouped by game
          </p>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products…"
          className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring sm:w-72"
        />
      </div>

      <div className="mb-16 grid gap-6 md:grid-cols-2">
        <FeatureSection
          title="HellaCollabs"
          tagline="Limited team-ups with artists, creators and campuses."
          items={collabs}
        />
        <FeatureSection
          title="HellaBlanks"
          tagline="Clean, logo-free essentials. Just the fit."
          items={blanks}
        />
      </div>

      {!anyVisible ? (
        <p className="py-24 text-center text-muted-foreground">No products match your search.</p>
      ) : (
        <div className="space-y-16">
          {visibleGroups.map(({ collection, items }) => (
            <section key={collection.slug}>
              <div className="mb-6 flex items-end justify-between border-b border-border pb-3">
                <div>
                  <h2 className="text-2xl font-black tracking-tight">{collection.name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{collection.tagline}</p>
                </div>
                <Link
                  to="/collections/$slug"
                  params={{ slug: collection.slug }}
                  className="text-sm font-medium text-primary hover:underline whitespace-nowrap"
                >
                  View all ({items.length}) →
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
                {items.map((p) => <ProductCard key={p.handle} p={p} />)}
              </div>
            </section>
          ))}

          {visibleOthers.length > 0 && (
            <section>
              <div className="mb-6 flex items-end justify-between border-b border-border pb-3">
                <div>
                  <h2 className="text-2xl font-black tracking-tight">More Drops</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Everything else from the catalog.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
                {visibleOthers.map((p) => <ProductCard key={p.handle} p={p} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}