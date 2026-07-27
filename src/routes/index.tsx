import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { products, priceRange } from "@/lib/products";
import { collections, collectionCover, collectionCount } from "@/lib/collections";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const featured = products.filter((p) => p.images.length > 0).slice(0, 8);
  const withImages = products.filter((p) => p.images.length > 0);
  const promo = withImages.slice(8, 11);
  const heroImages = withImages.slice(0, 4).map((p) => p.images[0]);
  return (
    <div>
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-[1400px] gap-12 px-6 lg:px-10 py-20 sm:py-28 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-brand">
              Print on demand · Streetwear
            </p>
            <h1 className="text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl xl:text-7xl">
              It's always <span className="text-brand">hoody</span> season.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Hella Hoodys isn't just a clothing store — it's a fashion revolution.
              Made to order, shipped worldwide, no compromise on fit or ink.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                to="/shop"
                className="inline-flex items-center rounded-md bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground transition hover:opacity-90"
              >
                Shop the collection
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center rounded-md border border-border px-6 py-3 text-sm font-semibold hover:bg-accent"
              >
                Our story
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="aspect-[3/4] overflow-hidden rounded-lg bg-muted">
                  <img src={heroImages[0]} alt="Hella Hoodys featured hoodie" className="h-full w-full object-cover" />
                </div>
                <div className="aspect-square overflow-hidden rounded-lg bg-brand/20">
                  <img src={heroImages[1]} alt="" className="h-full w-full object-cover mix-blend-multiply" />
                </div>
              </div>
              <div className="space-y-4 pt-10">
                <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                  <img src={heroImages[2]} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="aspect-[3/4] overflow-hidden rounded-lg bg-muted">
                  <img src={heroImages[3]} alt="" className="h-full w-full object-cover" />
                </div>
              </div>
            </div>
            <Link
              to="/shop"
              aria-label={`Browse all ${products.length} drops`}
              className="absolute -bottom-4 -left-4 hidden rounded-md bg-brand px-4 py-2 text-xs font-bold uppercase tracking-widest text-brand-foreground shadow-lg transition hover:opacity-90 hover:-translate-y-0.5 sm:block"
            >
              {products.length}+ drops →
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-muted/40">
        <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-6 px-6 lg:px-10 py-10 text-center sm:grid-cols-4">
          {[
            { t: "Made to order", d: "Zero waste, zero warehouse" },
            { t: "Worldwide shipping", d: "Ships from the US" },
            { t: "Premium blanks", d: "Softer, heavier fabric" },
            { t: "Easy returns", d: "30-day guarantee" },
          ].map((f) => (
            <div key={f.t}>
              <p className="text-sm font-bold tracking-tight">{f.t}</p>
              <p className="mt-1 text-xs text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 lg:px-10 py-20">
        <div className="mb-10 flex items-end justify-between">
          <h2 className="text-3xl font-black tracking-tight">Featured</h2>
          <Link to="/shop" className="text-sm font-medium hover:underline">
            View all {products.length} →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {featured.map((p) => (
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
      </section>

      <section className="border-t border-border bg-muted/40">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-20">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Collections</p>
              <h2 className="text-3xl font-black tracking-tight">Shop by game</h2>
            </div>
            <Link to="/collections" className="text-sm font-medium hover:underline">All collections →</Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((c) => {
              const cover = collectionCover(c.slug);
              const count = collectionCount(c.slug);
              if (!cover) return null;
              return (
                <Link
                  key={c.slug}
                  to="/collections/$slug"
                  params={{ slug: c.slug }}
                  className="group relative block aspect-[4/5] overflow-hidden rounded-md bg-muted"
                >
                  <img
                    src={cover}
                    alt={c.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
                      {count} drops
                    </p>
                    <p className="mt-1 text-lg font-bold">{c.name}</p>
                    <p className="mt-1 text-sm text-white/80">{c.tagline}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-6 lg:px-10 py-20 md:grid-cols-2 md:items-center">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">The Hella way</p>
            <h2 className="text-4xl font-black tracking-tight sm:text-5xl">
              Streetwear without the waste.
            </h2>
            <p className="mt-5 max-w-lg text-muted-foreground">
              Every hoody and tee is printed after you order it. No overstock, no landfill,
              no compromise on the fit or the ink. Just clean drops, made when you want them.
            </p>
            <Link
              to="/about"
              className="mt-8 inline-flex items-center rounded-md border border-border px-6 py-3 text-sm font-semibold hover:bg-accent"
            >
              Read our story
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {withImages.slice(11, 15).map((p) => (
              <div key={p.handle} className="aspect-square overflow-hidden rounded-md bg-muted">
                <img src={p.images[0]} alt="" loading="lazy" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
