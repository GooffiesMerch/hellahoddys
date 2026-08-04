import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useCatalog } from "@/lib/catalog";
import {
  getCategory,
  productsInCategory,
  productsInSub,
  productsUncategorized,
} from "@/lib/taxonomy";
import { ProductGrid } from "@/components/ProductCard";

export const Route = createFileRoute("/shop/$category/")({
  loader: ({ params }) => {
    const c = getCategory(params.category);
    if (!c) throw notFound();
    return { slug: c.slug, name: c.name, tagline: c.tagline };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Category — Hella Hoodys" }, { name: "robots", content: "noindex" }] };
    const title = `${loaderData.name} — Hella Hoodys`;
    return {
      meta: [
        { title },
        { name: "description", content: loaderData.tagline },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.tagline },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { slug, name, tagline } = Route.useLoaderData();
  const catalog = useCatalog();
  const category = getCategory(slug)!;
  const all = productsInCategory(slug, catalog);
  const extras = productsUncategorized(slug, catalog);

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-12 lg:px-10">
      <Link to="/shop" className="text-sm text-muted-foreground hover:underline">
        ← All categories
      </Link>
      <div className="mt-4 mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
          Category · {all.length} drops
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">{name}</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">{tagline}</p>
      </div>

      {category.subs.length > 0 && (
        <div className="mb-12 flex flex-wrap gap-2">
          {category.subs.map((s) => (
            <Link
              key={s.slug}
              to="/shop/$category/$sub"
              params={{ category: slug, sub: s.slug }}
              className="rounded-full border border-border px-4 py-2 text-xs font-bold uppercase tracking-widest transition hover:border-brand hover:text-brand"
            >
              {s.name} ({productsInSub(slug, s.slug, catalog).length})
            </Link>
          ))}
        </div>
      )}

      <div className="space-y-14">
        {category.subs.map((s) => {
          const items = productsInSub(slug, s.slug, catalog);
          if (items.length === 0) return null;
          return (
            <section key={s.slug}>
              <div className="mb-6 flex items-end justify-between border-b border-border pb-3">
                <h2 className="text-2xl font-black tracking-tight">{s.name}</h2>
                <Link
                  to="/shop/$category/$sub"
                  params={{ category: slug, sub: s.slug }}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  View all ({items.length}) →
                </Link>
              </div>
              <ProductGrid items={items.slice(0, 8)} />
            </section>
          );
        })}

        {extras.length > 0 && (
          <section>
            <div className="mb-6 border-b border-border pb-3">
              <h2 className="text-2xl font-black tracking-tight">
                {category.subs.length > 0 ? `More ${name}` : name}
              </h2>
            </div>
            <ProductGrid items={extras} />
          </section>
        )}

        {all.length === 0 && (
          <p className="py-24 text-center text-muted-foreground">
            Dropping soon — check back for {name}.
          </p>
        )}
      </div>
    </div>
  );
}
