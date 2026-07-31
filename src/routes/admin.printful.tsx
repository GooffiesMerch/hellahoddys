import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { syncPrintfulCatalog } from "@/lib/printful.functions";

export const Route = createFileRoute("/admin/printful")({
  head: () => ({
    meta: [
      { title: "Printful sync — Hella Hoodys" },
      { name: "description", content: "Sync the Hella Hoodys catalog with Printful fulfillment." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PrintfulAdmin,
});

function PrintfulAdmin() {
  const sync = useServerFn(syncPrintfulCatalog);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setResult(null);
    try {
      const res = await sync({});
      const breakdown = (res.stores ?? [])
        .map((s) => `${s.name}: ${s.products}`)
        .join(" · ");
      setResult(
        `Synced ${res.products} products and ${res.variants} variants from Printful.` +
          (breakdown ? ` (${breakdown})` : ""),
      );
    } catch (e) {
      setResult(e instanceof Error ? e.message : "Sync failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-[900px] px-6 lg:px-10 py-16">
      <h1 className="text-4xl font-black tracking-tight">Printful catalog</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Syncing is automatic. Anything you publish in any connected Printful store (HELLA HOODYS,
        Hella&apos;s Store, Square store) appears on the site on its own — instantly if the Printful
        product webhook is set, otherwise within a few minutes. The button below is only a manual
        full re-pull if something ever looks out of date.
      </p>
      <button
        type="button"
        onClick={run}
        disabled={busy}
        className="mt-8 rounded-md bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground hover:opacity-90 disabled:opacity-60"
      >
        {busy ? "Refreshing…" : "Force full refresh"}
      </button>
      {result && <p className="mt-6 rounded-md border border-border p-4 text-sm">{result}</p>}
    </div>
  );
}