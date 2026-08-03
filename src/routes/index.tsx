import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { priceRange } from "@/lib/products";
import { useCatalog } from "@/lib/catalog";
import { collections, collectionCover, collectionCount } from "@/lib/collections";
import { RankingsTicker } from "@/components/RankingsTicker";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const products = useCatalog();
  const featured = products.filter((p) => p.images.length > 0).slice(0, 8);
  const withImages = products.filter((p) => p.images.length > 0);
  const heroImages = [
    { src: "/images/hero-wisconsin.webp", alt: "Hella Wisconsin Badgers hoodie" },
    { src: "/images/hero-okstate.webp", alt: "Hella Oklahoma State hoodie" },
    { src: "/images/hero-ucf.webp", alt: "Hella UCF Knights hoodie" },
    { src: "/images/hero-carolina.webp", alt: "Hella South Carolina Gamecocks hoodie" },
  ];
  return (
    <div>
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-[1400px] gap-12 px-6 lg:px-10 py-12 sm:py-16 lg:grid-cols-2 lg:items-start">
          <div className="lg:pt-2">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand" />
              New drop · Fall '26
            </div>
            <RankingsTicker />
            <h1 className="text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl xl:text-7xl">
              It's always <span className="text-brand">HOODY</span> season.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Hella Hoodys isn't just a clothing store — it's a fashion revolution.
              Made to order, shipped worldwide, no compromise on fit or ink.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/collections"
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

            <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-border pt-6">
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Drops</dt>
                <dd className="mt-1 text-2xl font-black tracking-tight">{products.length}+</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Teams</dt>
                <dd className="mt-1 text-2xl font-black tracking-tight">120+</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Ships</dt>
                <dd className="mt-1 text-2xl font-black tracking-tight">Worldwide Shipping</dd>
              </div>
            </dl>
          </div>
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              {heroImages.map((img, i) => (
                <div
                  key={i}
                  className="aspect-square overflow-hidden rounded-lg bg-brand/15"
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="h-full w-full object-cover mix-blend-multiply"
                  />
                </div>
              ))}
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
              Every HOODY and tee is printed after you order it. No overstock, no landfill,
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
            {withImages
              .filter((p) => /zip/i.test(p.handle))
              .slice(0, 4)
              .map((p) => (
                <Link
                  key={p.handle}
                  to="/products/$handle"
                  params={{ handle: p.handle }}
                  className="group aspect-square overflow-hidden rounded-md bg-muted"
                >
                  <img
                    src={p.images[0]}
                    alt={p.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </Link>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}
