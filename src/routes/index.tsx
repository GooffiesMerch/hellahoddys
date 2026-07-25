import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { products, priceRange } from "@/lib/products";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const featured = products.filter((p) => p.images.length > 0).slice(0, 8);
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
    </div>
  );
}
