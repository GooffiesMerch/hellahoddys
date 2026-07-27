import { createFileRoute, Link } from "@tanstack/react-router";
import { collections, collectionCount, collectionCover, productsIn } from "@/lib/collections";
import { products, priceRange } from "@/lib/products";

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
  const total = collections.reduce((n, c) => n + collectionCount(c.slug), 0);
  const [featured, ...rest] = collections;
  const featuredCover = collectionCover(featured.slug);
  const featuredThumbs = productsIn(featured.slug).slice(1, 4).map((p) => p.images[0]);
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-brand/15 via-background to-background">
        <div className="absolute inset-0 -z-10 opacity-40 [background-image:radial-gradient(circle_at_1px_1px,color-mix(in_oklab,var(--color-brand)_45%,transparent)_1px,transparent_0)] [background-size:22px_22px]" />
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-16 sm:py-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand" />
            Shop by game
          </div>
          <div className="mt-5 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl xl:text-7xl">
                Pick your <span className="text-brand">league.</span>
              </h1>
              <p className="mt-4 max-w-xl text-lg text-muted-foreground">
                Every drop, organized by the game it reps. From Saturday campuses to Sunday kickoffs — find your fit.
              </p>
            </div>
            <dl className="grid grid-cols-3 gap-6 border-t border-border pt-5 md:border-t-0 md:pt-0">
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Collections</dt>
                <dd className="mt-1 text-2xl font-black tracking-tight">{collections.length}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Drops</dt>
                <dd className="mt-1 text-2xl font-black tracking-tight">{total}+</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Restocked</dt>
                <dd className="mt-1 text-2xl font-black tracking-tight">Weekly</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 lg:px-10 py-14">
        {/* Featured collection — spotlight */}
        <Link
          to="/collections/$slug"
          params={{ slug: featured.slug }}
          className="group relative mb-8 grid overflow-hidden rounded-2xl border border-border bg-muted lg:grid-cols-[1.4fr_1fr]"
        >
          <div className="relative aspect-[4/3] overflow-hidden bg-brand/10 lg:aspect-auto">
            {featuredCover && (
              <img
                src={featuredCover}
                alt={featured.name}
                className="h-full w-full object-cover mix-blend-multiply transition duration-700 group-hover:scale-105"
              />
            )}
            <div className="absolute left-4 top-4 rounded-full bg-brand px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-foreground shadow-md">
              Featured
            </div>
          </div>
          <div className="flex flex-col justify-between gap-6 p-8 lg:p-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
                {collectionCount(featured.slug)} drops · in stock
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{featured.name}</h2>
              <p className="mt-3 text-muted-foreground">{featured.tagline}</p>
            </div>
            {featuredThumbs.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {featuredThumbs.map((src, i) => (
                  <div key={i} className="aspect-square overflow-hidden rounded-md bg-brand/10">
                    <img src={src} alt="" className="h-full w-full object-cover mix-blend-multiply" />
                  </div>
                ))}
              </div>
            )}
            <span className="inline-flex w-fit items-center gap-2 rounded-md bg-foreground px-5 py-3 text-sm font-semibold text-background transition group-hover:opacity-90">
              Shop {featured.name.split("·")[0].trim()} <span aria-hidden>→</span>
            </span>
          </div>
        </Link>

        {/* Rest of collections — richer cards with preview strip */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((c) => {
            const cover = collectionCover(c.slug);
            const count = collectionCount(c.slug);
            const thumbs = productsIn(c.slug).slice(1, 4).map((p) => p.images[0]);
            return (
              <Link
                key={c.slug}
                to="/collections/$slug"
                params={{ slug: c.slug }}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative aspect-[5/4] overflow-hidden bg-brand/10">
                  {cover && (
                    <img
                      src={cover}
                      alt={c.name}
                      loading="lazy"
                      className="h-full w-full object-cover mix-blend-multiply transition duration-500 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute right-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-foreground backdrop-blur">
                    {count} drops
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-4 p-5">
                  <div>
                    <h3 className="text-lg font-bold tracking-tight">{c.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{c.tagline}</p>
                  </div>
                  {thumbs.length > 0 && (
                    <div className="mt-auto grid grid-cols-3 gap-2">
                      {thumbs.map((src, i) => (
                        <div key={i} className="aspect-square overflow-hidden rounded-md bg-brand/5">
                          <img src={src} alt="" className="h-full w-full object-cover mix-blend-multiply" />
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between border-t border-border pt-3 text-xs font-semibold uppercase tracking-widest">
                    <span className="text-brand">Explore</span>
                    <span aria-hidden className="transition group-hover:translate-x-1">→</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Trending now — horizontal product strip */}
        <section className="mt-20">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand">Trending</p>
              <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Most-wanted drops</h2>
            </div>
            <Link to="/shop" className="text-sm font-semibold text-brand hover:underline">
              View all →
            </Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.slice(0, 4).map((p) => (
              <Link
                key={p.handle}
                to="/products/$handle"
                params={{ handle: p.handle }}
                className="group overflow-hidden rounded-xl border border-border bg-card transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="aspect-square overflow-hidden bg-brand/10">
                  <img
                    src={p.images[0]}
                    alt={p.title}
                    loading="lazy"
                    className="h-full w-full object-cover mix-blend-multiply transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="line-clamp-1 font-bold tracking-tight">{p.title}</h3>
                  <p className="mt-1 text-sm font-semibold text-brand">{priceRange(p)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* New drop banner */}
        <section className="mt-20 overflow-hidden rounded-2xl border border-border bg-gradient-to-r from-brand/20 via-brand/10 to-background">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div className="p-8 lg:p-12">
              <span className="inline-block rounded-full bg-brand px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-foreground">
                New drop
              </span>
              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                Fresh fits just landed.
              </h2>
              <p className="mt-3 max-w-md text-muted-foreground">
                The latest hoodies, crews, and zip-ups are here. Limited runs, made to order, shipped worldwide.
              </p>
              <Link
                to="/shop"
                className="mt-6 inline-flex items-center rounded-md bg-foreground px-6 py-3 text-sm font-semibold text-background transition hover:opacity-90"
              >
                Shop new arrivals →
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-2 p-4 lg:p-8">
              {products.slice(4, 7).map((p) => (
                <Link
                  key={p.handle}
                  to="/products/$handle"
                  params={{ handle: p.handle }}
                  className="group aspect-square overflow-hidden rounded-xl bg-brand/10"
                >
                  <img
                    src={p.images[0]}
                    alt={p.title}
                    loading="lazy"
                    className="h-full w-full object-cover mix-blend-multiply transition duration-500 group-hover:scale-105"
                  />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Why Hella */}
        <section className="mt-20 rounded-2xl border border-border bg-card p-8 sm:p-12">
          <div className="text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand">The Hella way</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Built different. Built to order.</h2>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {[
              { title: "Made to order", body: "Every piece is printed fresh after you order. No wasted stock, no stale inventory." },
              { title: "Worldwide shipping", body: "From campus to coast, we ship Hella drops to fans around the globe." },
              { title: "Premium prints", body: "High-quality ink on soft, durable blanks that hold up wash after wash." },
            ].map((f) => (
              <div key={f.title} className="rounded-xl border border-border bg-background p-6 text-center transition hover:shadow-md">
                <h3 className="text-lg font-bold tracking-tight">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="mt-20 text-center">
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
            Not sure where to start?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            Browse the full catalog and filter by your team, league, or city.
          </p>
          <Link
            to="/shop"
            className="mt-6 inline-flex items-center rounded-full bg-brand px-8 py-4 text-sm font-black uppercase tracking-widest text-brand-foreground shadow-lg transition hover:brightness-105"
          >
            Shop everything
          </Link>
        </section>
      </section>
    </div>
  );
}