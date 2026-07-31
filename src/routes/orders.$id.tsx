import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { formatPrice } from "@/lib/products";
import { getOrderStatus } from "@/lib/printful.functions";

export const Route = createFileRoute("/orders/$id")({
  head: () => ({
    meta: [
      { title: "Order status — Hella Hoodys" },
      { name: "description", content: "Track your Hella Hoodys order and shipment." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderPage,
});

function OrderPage() {
  const { id } = Route.useParams();
  const fetchOrder = useServerFn(getOrderStatus);
  const { data, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: () => fetchOrder({ data: { id } }),
    refetchInterval: 30000,
  });

  if (isLoading) {
    return <div className="mx-auto max-w-[900px] px-6 py-24 text-center text-muted-foreground">Loading your order…</div>;
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-[900px] px-6 py-24 text-center">
        <h1 className="text-3xl font-black tracking-tight">Order not found</h1>
        <Link to="/shop" className="mt-6 inline-block text-sm font-semibold text-brand">
          Back to shop
        </Link>
      </div>
    );
  }

  const items = (data.items ?? []) as Array<{
    title: string;
    variantLabel?: string;
    quantity: number;
    price: number;
  }>;

  return (
    <div className="mx-auto max-w-[900px] px-6 lg:px-10 py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">Thank you</p>
      <h1 className="mt-2 text-4xl font-black tracking-tight">Your order is in</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Confirmation sent to {data.email}. Order reference{" "}
        <span className="font-mono text-foreground">{String(data.id).slice(0, 8)}</span>.
      </p>

      <div className="mt-8 rounded-md border border-border p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-semibold uppercase tracking-[0.2em]">Status</span>
          <span className="rounded-full bg-brand px-3 py-1 text-xs font-bold uppercase text-brand-foreground">
            {data.status}
          </span>
        </div>
        {data.tracking_number && (
          <div className="mt-4 border-t border-border pt-4 text-sm">
            <p>
              <span className="text-muted-foreground">Carrier:</span> {data.carrier ?? "—"}
            </p>
            <p className="mt-1">
              <span className="text-muted-foreground">Tracking:</span>{" "}
              {data.tracking_url ? (
                <a href={data.tracking_url} target="_blank" rel="noreferrer" className="font-semibold text-brand">
                  {data.tracking_number}
                </a>
              ) : (
                data.tracking_number
              )}
            </p>
          </div>
        )}
      </div>

      <div className="mt-8 rounded-md border border-border p-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em]">Items</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {items.map((i, idx) => (
            <li key={idx} className="flex justify-between gap-3">
              <span className="text-muted-foreground">
                {i.title}
                {i.variantLabel ? ` — ${i.variantLabel}` : ""} × {i.quantity}
              </span>
              <span className="font-semibold">{formatPrice(i.price * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatPrice(Number(data.subtotal))}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span>{formatPrice(Number(data.shipping_cost))}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>{formatPrice(Number(data.total))}</span>
          </div>
        </div>
      </div>

      <Link
        to="/shop"
        className="mt-8 inline-flex rounded-md bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground hover:opacity-90"
      >
        Keep shopping
      </Link>
    </div>
  );
}