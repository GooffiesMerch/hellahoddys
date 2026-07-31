import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { getProduct, priceRange, type Product } from "@/lib/products";
import { useProduct } from "@/lib/catalog";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/products/$handle")({
  loader: ({ params }) => {
    // Printful-synced products are not in the local file, so a miss here is
    // resolved client-side from the live catalog instead of 404-ing.
    return { product: getProduct(params.handle) ?? null, handle: params.handle };
  },
  head: ({ loaderData }) => {
    if (!loaderData?.product) {
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
  const loaded = Route.useLoaderData() as { product: Product | null; handle: string };
  const fromCatalog = useProduct(loaded.handle);
  const product = loaded.product ?? fromCatalog;
  if (!product) {
    return (
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-24 text-center">
        <h1 className="text-3xl font-black tracking-tight">Product not found</h1>
        <p className="mt-3 text-muted-foreground">This drop is no longer available.</p>
        <Link to="/shop" className="mt-6 inline-block text-sm font-semibold text-primary hover:underline">
          Back to shop →
        </Link>
      </div>
    );
  }
  return <ProductView product={product} />;
}

function ProductView({ product }: { product: Product }) {
  const [activeImg, setActiveImg] = useState(0);
  const { addItem } = useCart();
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [added, setAdded] = useState(false);

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

  const matchedVariant = useMemo(() => {
    return product.variants.find((v) => {
      return product.options.every((name, i) => {
        const key = `opt${i + 1}` as "opt1" | "opt2" | "opt3";
        const chosen = selected[name];
        if (!chosen) return true;
        return v[key] === chosen;
      });
    });
  }, [product, selected]);

  const allSelected = product.options.every((name) => selected[name]);
  const price = matchedVariant?.price
    ? parseFloat(matchedVariant.price)
    : product.minPrice ?? 0;

  const handleAdd = () => {
    const variantLabel = product.options
      .map((n) => selected[n])
      .filter(Boolean)
      .join(" / ");
    addItem({
      handle: product.handle,
      title: product.title,
      image: product.images[0],
      price,
      variantSku: matchedVariant?.sku,
      variantLabel: variantLabel || undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

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

          <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-brand">
            <span className="inline-block h-2 w-2 rounded-full bg-brand" />
            In stock · {product.stock} available
          </p>

          {Object.entries(optionValues).map(([name, vals]) => (
            <div key={name} className="mt-6">
              <p className="text-sm font-medium">{name}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {vals.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setSelected((s) => ({ ...s, [name]: v }))}
                    className={`rounded-md border px-3 py-1 text-sm transition-colors ${
                      selected[name] === v
                        ? "border-brand bg-brand text-brand-foreground"
                        : "border-border hover:border-foreground"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAdd}
            disabled={product.options.length > 0 && !allSelected}
            className="mt-8 w-full rounded-md bg-brand py-3 text-sm font-semibold text-brand-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {added
              ? "Added to cart ✓"
              : product.options.length > 0 && !allSelected
                ? "Select options"
                : "Add to cart"}
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