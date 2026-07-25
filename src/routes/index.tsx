import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { products, priceRange } from "@/lib/products";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const featured = products.filter((p) => p.images.length > 0).slice(0, 8);
  const withImages = products.filter((p) => p.images.length > 0);
  const promo = withImages.slice(8, 11);
  return (
    <div>
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Print on demand · Streetwear
          </p>
          <h1 className="max-w-3xl text-5xl font-black leading-[1.05] tracking-tight sm:text-7xl">
            Hella Hoodys isn't just a clothing store — it's a fashion revolution.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Making urban streetwear accessible to everyone. Each piece is made to order,
            so we cut waste — not corners.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              to="/shop"
              className="inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
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
      </section>

      <section className="border-b border-border bg-muted/40">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 py-10 text-center sm:grid-cols-4">
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

      <section className="mx-auto max-w-6xl px-6 py-20">
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
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Collections</p>
              <h2 className="text-3xl font-black tracking-tight">Shop by drop</h2>
            </div>
            <Link to="/shop" className="text-sm font-medium hover:underline">Browse all →</Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {promo.map((p, i) => (
              <Link
                key={p.handle}
                to="/products/$handle"
                params={{ handle: p.handle }}
                className="group relative block aspect-[4/5] overflow-hidden rounded-md bg-muted"
              >
                <img
                  src={p.images[0]}
                  alt={p.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-80">
                    {["New", "Trending", "Staff pick"][i] || "Featured"}
                  </p>
                  <p className="mt-1 line-clamp-2 text-lg font-bold">{p.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-2 md:items-center">
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
