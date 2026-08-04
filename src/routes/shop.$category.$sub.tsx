import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useCatalog } from "@/lib/catalog";
import { getCategory, getSub, productsInSub } from "@/lib/taxonomy";
import { ProductGrid } from "@/components/ProductCard";

export const Route = createFileRoute("/shop/$category/$sub")({
  loader: ({ params }) => {
    const c = getCategory(params.category);
    if (!c) throw notFound();
    const s = getSub(c, params.sub);
    if (!s) throw notFound();
    return { category: c.slug, categoryName: c.name, sub: s.slug, subName: s.name };
  },
  head: ({ loaderData }) => {
    if (!loaderData)
      return { meta: [{ title: "Not found — Hella Hoodys" }, { name: "robots", content: "noindex" }] };
    const title = `${loaderData.categoryName} · ${loaderData.subName} — Hella Hoodys`;
    const desc = `Shop ${loaderData.subName} ${loaderData.categoryName} drops from Hella Hoodys.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: SubPage,
});

function SubPage() {
  const { category, categoryName, sub, subName } = Route.useLoaderData();
  const catalog = useCatalog();
  const items = productsInSub(category, sub, catalog);

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-12 lg:px-10">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/shop" className="hover:underline">Shop</Link>
        <span>/</span>
        <Link to="/shop/$category" params={{ category }} className="hover:underline">
          {categoryName}
        </Link>
      </div>
      <div className="mt-4 mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
          {categoryName} · {items.length} drops
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">{subName}</h1>
      </div>
      <ProductGrid items={items} />
    </div>
  );
}
