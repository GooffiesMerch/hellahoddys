import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getCollection, productsIn } from "@/lib/collections";
import { priceRange, type Product } from "@/lib/products";
import type { Collection } from "@/lib/collections";

export const Route = createFileRoute("/collections/$slug")({
  loader: ({ params }) => {
    const collection = getCollection(params.slug);
    if (!collection) throw notFound();
    return { collection, items: productsIn(params.slug) };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Collection — Hella Hoodys" }] };
    const { collection, items } = loaderData;
    const title = `${collection.name} — Hella Hoodys`;
    const desc = `${collection.tagline} ${items.length} drops in the ${collection.name} collection.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        ...(items[0]?.images[0]
          ? [
              { property: "og:image", content: items[0].images[0] },
              { name: "twitter:image", content: items[0].images[0] },
            ]
          : []),
      ],
    };
  },
  component: CollectionPage,
});

function CollectionPage() {
  const { collection, items } = Route.useLoaderData() as {
    collection: Collection;
    items: Product[];
  };
  return (
    <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-12">
      <Link to="/collections" className="text-sm text-muted-foreground hover:underline">
        ← All collections
      </Link>
      <div className="mt-4 mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
          Collection · {items.length} drops
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">{collection.name}</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">{collection.tagline}</p>
      </div>

      {items.length === 0 ? (
        <p className="py-24 text-center text-muted-foreground">No products in this collection yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => (
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
    </div>
  );
}