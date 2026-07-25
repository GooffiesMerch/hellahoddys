import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { getProduct, priceRange, type Product } from "@/lib/products";

export const Route = createFileRoute("/products/$handle")({
  loader: ({ params }) => {
    const product = getProduct(params.handle);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Product not found — Hella Hoodys" }, { name: "robots", content: "noindex" }] };
    }
    const { product } = loaderData;
    const desc = `${product.title} — print-on-demand streetwear from Hella Hoodys. ${priceRange(product)}.`;
    const image = product.images[0];
    return {
      meta: [
        { title: `${product.title} — Hella Hoodys` },
        { name: "description", content: desc },
        { property: "og:title", content: `${product.title} — Hella Hoodys` },
        { property: "og:description", content: desc },
        ...(image ? [
          { property: "og:image", content: image },
          { name: "twitter:image", content: image },
        ] : []),
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData() as { product: Product };
  const [activeImg, setActiveImg] = useState(0);

  const optionValues = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    product.options.forEach((_: string, i: number) => {
      const key = `opt${i + 1}` as "opt1" | "opt2" | "opt3";
      map[product.options[i]] = new Set(
        product.variants.map((v) => v[key]).filter(Boolean) as string[],
      );
    });
    return Object.fromEntries(
      Object.entries(map).map(([k, v]) => [k, Array.from(v)]),
    );
  }, [product]);

  return (
    <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-10">
      <Link to="/shop" className="text-sm text-muted-foreground hover:underline">
        ← Back to shop
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div>
          <div className="aspect-square overflow-hidden rounded-lg bg-muted">
            {product.images[activeImg] && (
              <img
                src={product.images[activeImg]}
                alt={product.title}
                className="h-full w-full object-cover"
              />
            )}
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 grid grid-cols-6 gap-2">
              {product.images.slice(0, 12).map((src: string, i: number) => (
                <button
                  key={src}
                  onClick={() => setActiveImg(i)}
                  className={`aspect-square overflow-hidden rounded-md border-2 ${
                    i === activeImg ? "border-primary" : "border-transparent"
                  }`}
                >
                  <img src={src} loading="lazy" alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {product.type && (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {product.type}
            </p>
          )}
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            {product.title}
          </h1>
          <p className="mt-4 text-2xl font-semibold">{priceRange(product)}</p>

          {Object.entries(optionValues).map(([name, vals]) => (
            <div key={name} className="mt-6">
              <p className="text-sm font-medium">{name}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {vals.map((v) => (
                  <span
                    key={v}
                    className="rounded-md border border-border px-3 py-1 text-sm"
                  >
                    {v}
                  </span>
                ))}
              </div>
            </div>
          ))}

          <button
            disabled
            className="mt-8 w-full rounded-md bg-primary py-3 text-sm font-semibold text-primary-foreground opacity-60"
            title="Checkout coming soon"
          >
            Add to cart — coming soon
          </button>
          <p className="mt-2 text-xs text-muted-foreground">
            Made to order · ships in 5–7 business days
          </p>

          {product.body && (
            <div
              className="prose prose-sm mt-10 max-w-none text-sm text-foreground/90 [&_a]:underline [&_strong]:font-semibold"
              dangerouslySetInnerHTML={{ __html: product.body }}
            />
          )}

          <div className="mt-8 text-xs text-muted-foreground">
            <p>SKU: {product.variants[0]?.sku || "—"}</p>
            {product.vendor && <p>Vendor: {product.vendor}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}