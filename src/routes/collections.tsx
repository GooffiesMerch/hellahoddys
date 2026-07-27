import { createFileRoute, Link } from "@tanstack/react-router";
import { collections, collectionCount, collectionCover } from "@/lib/collections";

export const Route = createFileRoute("/collections")({
  head: () => ({
    meta: [
      { title: "Collections — Hella Hoodys" },
      { name: "description", content: "Shop Hella Hoodys collections by game: NCAA college football, NFL, baseball, Greek life, Valentine's, and street." },
      { property: "og:title", content: "Collections — Hella Hoodys" },
      { property: "og:description", content: "Shop by game: NCAA, NFL, MLB, Greek life, and more." },
    ],
  }),
  component: CollectionsIndex,
});

function CollectionsIndex() {
  return (
    <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-12">
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Shop by game</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">Collections</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Every drop, organized by the game it reps. Pick your league.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((c) => {
          const cover = collectionCover(c.slug);
          const count = collectionCount(c.slug);
          return (
            <Link
              key={c.slug}
              to="/collections/$slug"
              params={{ slug: c.slug }}
              className="group relative block aspect-[4/5] overflow-hidden rounded-lg bg-muted"
            >
              {cover && (
                <img
                  src={cover}
                  alt={c.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
                  {count} drops
                </p>
                <h2 className="mt-1 text-2xl font-bold">{c.name}</h2>
                <p className="mt-1 text-sm text-white/80">{c.tagline}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}