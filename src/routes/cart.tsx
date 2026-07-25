import { createFileRoute, Link } from "@tanstack/react-router";
import { useCart, cartItemKey } from "@/lib/cart";
import { formatPrice } from "@/lib/products";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Bag — Hella Hoodys" },
      { name: "description", content: "Review the items in your Hella Hoodys bag." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, subtotal, updateQty, removeItem, clear } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-[900px] px-6 lg:px-10 py-24 text-center">
        <h1 className="text-4xl font-black tracking-tight">Your bag is empty</h1>
        <p className="mt-3 text-muted-foreground">
          Find something you love — every piece is made to order.
        </p>
        <Link
          to="/shop"
          className="mt-8 inline-flex items-center rounded-md bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground hover:opacity-90"
        >
          Shop the collection
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-6 lg:px-10 py-12">
      <h1 className="text-4xl font-black tracking-tight">Your bag</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        <ul className="divide-y divide-border border-y border-border">
          {items.map((item) => {
            const key = cartItemKey(item);
            return (
              <li key={key} className="flex gap-4 py-5">
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                  {item.image && (
                    <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-4">
                    <Link
                      to="/products/$handle"
                      params={{ handle: item.handle }}
                      className="text-sm font-semibold hover:text-brand"
                    >
                      {item.title}
                    </Link>
                    <p className="text-sm font-semibold">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                  {item.variantLabel && (
                    <p className="mt-1 text-xs text-muted-foreground">{item.variantLabel}</p>
                  )}
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="flex items-center rounded-md border border-border">
                      <button
                        type="button"
                        onClick={() => updateQty(key, item.quantity - 1)}
                        className="px-3 py-1 text-sm hover:bg-accent"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQty(key, item.quantity + 1)}
                        className="px-3 py-1 text-sm hover:bg-accent"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(key)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <aside className="h-fit rounded-md border border-border p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em]">Order summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="text-muted-foreground">Calculated at checkout</span>
            </div>
          </div>
          <div className="mt-4 flex justify-between border-t border-border pt-4 text-base font-bold">
            <span>Total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <button
            type="button"
            disabled
            className="mt-6 w-full rounded-md bg-brand py-3 text-sm font-semibold text-brand-foreground opacity-60"
            title="Checkout coming soon"
          >
            Checkout — coming soon
          </button>
          <button
            type="button"
            onClick={clear}
            className="mt-2 w-full rounded-md border border-border py-2 text-xs text-muted-foreground hover:bg-accent"
          >
            Clear bag
          </button>
        </aside>
      </div>
    </div>
  );
}