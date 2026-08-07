import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useRef, useState } from "react";
import { listAdminOrders } from "@/lib/admin.functions";
import type { AdminOrderRow } from "@/lib/db.server";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({
    meta: [
      { title: "Orders — Hella Hoodys admin" },
      { name: "description", content: "Payments and fulfillment status for Hella Hoodys orders." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrdersAdmin,
});

function money(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD" }).format(
      Number(amount ?? 0),
    );
  } catch {
    return `$${Number(amount ?? 0).toFixed(2)}`;
  }
}

function Badge({ value, tone }: { value: string; tone: "pay" | "fulfil" }) {
  const v = (value || "unknown").toLowerCase();
  const good = tone === "pay" ? ["paid", "captured", "completed"] : ["fulfilled", "shipped", "delivered"];
  const bad = ["failed", "canceled", "cancelled", "refunded", "error"];
  const cls = good.includes(v)
    ? "bg-brand/15 text-brand-foreground border-brand/40"
    : bad.includes(v)
      ? "bg-destructive/10 text-destructive border-destructive/30"
      : "bg-muted text-muted-foreground border-border";
  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${cls}`}>
      {v}
    </span>
  );
}

function OrdersAdmin() {
  const load = useServerFn(listAdminOrders);
  const [passcode, setPasscode] = useState("");
  const [rows, setRows] = useState<AdminOrderRow[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [live, setLive] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const passcodeRef = useRef("");

  async function run(e?: React.FormEvent) {
    e?.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await load({ data: { passcode, limit: 200 } });
      setRows(res as AdminOrderRow[]);
      passcodeRef.current = passcode;
      setLastSync(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load orders.");
    } finally {
      setBusy(false);
    }
  }

  // Background refresh: keeps fulfillment status and tracking current as
  // Printful webhooks update the orders table. Orders are server-only (RLS
  // blocks browser reads), so we re-poll the passcode-gated server function.
  const refresh = useCallback(async () => {
    if (!passcodeRef.current) return;
    try {
      const res = await load({ data: { passcode: passcodeRef.current, limit: 200 } });
      setRows(res as AdminOrderRow[]);
      setLastSync(new Date());
      setError(null);
    } catch {
      /* transient: keep showing the last good snapshot */
    }
  }, [load]);

  useEffect(() => {
    if (!live || !rows) return;
    const id = setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, 15000);
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [live, rows, refresh]);

  const revenue = (rows ?? [])
    .filter((r) => r.payment_status?.toLowerCase() === "paid")
    .reduce((sum, r) => sum + Number(r.amount_paid ?? 0), 0);

  return (
    <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-16">
      <h1 className="text-4xl font-black tracking-tight">Orders</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Every order with what the customer paid, the PayPal reference, and where fulfillment stands.
      </p>

      <form onSubmit={run} className="mt-8 flex flex-wrap items-center gap-3">
        <input
          type="password"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          placeholder="Admin passcode"
          className="w-64 rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={busy || !passcode}
          className="rounded-md bg-brand px-5 py-2 text-sm font-semibold text-brand-foreground hover:opacity-90 disabled:opacity-60"
        >
          {busy ? "Loading…" : rows ? "Refresh" : "Load orders"}
        </button>
        {rows && (
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={live}
              onChange={(e) => setLive(e.target.checked)}
              className="h-4 w-4 accent-[hsl(var(--brand))]"
            />
            <span className="inline-flex items-center gap-1.5">
              {live && (
                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-brand" />
              )}
              Live updates
            </span>
            {lastSync && (
              <span className="text-xs">· updated {lastSync.toLocaleTimeString()}</span>
            )}
          </label>
        )}
      </form>

      {error && (
        <p className="mt-6 rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </p>
      )}

      {rows && (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Orders</p>
              <p className="mt-1 text-2xl font-black">{rows.length}</p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Paid orders</p>
              <p className="mt-1 text-2xl font-black">
                {rows.filter((r) => r.payment_status?.toLowerCase() === "paid").length}
              </p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Collected</p>
              <p className="mt-1 text-2xl font-black">{money(revenue, rows[0]?.currency ?? "USD")}</p>
            </div>
          </div>

          <div className="mt-8 overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Amount paid</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">PayPal order</th>
                  <th className="px-4 py-3">Fulfillment</th>
                  <th className="px-4 py-3">Tracking</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                      No orders yet.
                    </td>
                  </tr>
                )}
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-border align-top">
                    <td className="px-4 py-3 whitespace-nowrap">
                      {new Date(r.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">{r.email}</td>
                    <td className="px-4 py-3 font-semibold whitespace-nowrap">
                      {money(r.amount_paid, r.currency)}
                      {Number(r.amount_paid ?? 0) !== Number(r.total ?? 0) && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          of {money(r.total, r.currency)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge value={r.payment_status} tone="pay" />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs break-all">
                      {r.paypal_order_id ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge value={r.status} tone="fulfil" />
                      {r.printful_order_id && (
                        <span className="mt-1 block text-xs text-muted-foreground">
                          #{r.printful_order_id}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {r.tracking_number ? (
                        r.tracking_url ? (
                          <a
                            href={r.tracking_url}
                            target="_blank"
                            rel="noreferrer"
                            className="underline"
                          >
                            {r.carrier ? `${r.carrier} · ` : ""}
                            {r.tracking_number}
                          </a>
                        ) : (
                          <>
                            {r.carrier ? `${r.carrier} · ` : ""}
                            {r.tracking_number}
                          </>
                        )
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}