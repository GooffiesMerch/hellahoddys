import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { products } from "@/lib/products";

// AP Top 25 → product handle in our catalog. Only teams we actually stock.
const TOP_25: Array<{ rank: number; team: string; handle: string }> = [
  { rank: 1, team: "Georgia", handle: "hella-g-unisex-college-hoodie" },
  { rank: 2, team: "Michigan", handle: "hella-mi-unisex-hoodie" },
  { rank: 3, team: "Alabama", handle: "hella-alabama-unisex-hoodie" },
  { rank: 4, team: "Texas", handle: "hella-texas-unisex-zip-hoodie" },
  { rank: 5, team: "Penn State", handle: "hella-p-s-unisex-college-hoodie" },
  { rank: 6, team: "Tennessee", handle: "hella-t-unisex-hoodie" },
  { rank: 7, team: "LSU", handle: "yellow-tiger-d-version-4-unisex-hoodie" },
  { rank: 8, team: "Oklahoma", handle: "hella-okla-version-2-unisex-hoodie" },
  { rank: 9, team: "Miami", handle: "hella-miami-unisex-hoodie-1" },
  { rank: 10, team: "USC", handle: "hella-usc-unisex-hoodie" },
  { rank: 11, team: "Utah", handle: "hella-utha-unisex-hoodie" },
  { rank: 12, team: "Iowa", handle: "hela-iowa-unisex-zip-hoodie" },
  { rank: 13, team: "Kansas State", handle: "hella-kansas-unisex-zip-hoodie" },
  { rank: 14, team: "Arizona", handle: "hella-arizona-unisex-hoodie-2" },
  { rank: 15, team: "Washington", handle: "hella-washington-unisex-hoodie-1" },
];

const ENTRIES = TOP_25.map((t) => {
  const p = products.find((pr) => pr.handle === t.handle);
  return {
    ...t,
    image: p?.images?.[0] ?? "",
    title: p?.title ?? t.team,
  };
}).filter((e) => e.image);

export function RankingsTicker() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setI((v) => (v + 1) % ENTRIES.length);
    }, 2200);
    return () => window.clearInterval(id);
  }, []);

  if (ENTRIES.length === 0) return null;

  return (
    <div
      className="mb-6 overflow-hidden rounded-lg border border-border bg-background"
      aria-label="AP Top 25 college football — team hoodies"
    >
      <div className="flex items-center justify-between border-b border-border bg-muted/40 px-3 py-1.5">
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          AP Top 25 · Live Drop
        </span>
        <div className="flex gap-1">
          {ENTRIES.map((_, idx) => (
            <span
              key={idx}
              className={`h-1 w-1 rounded-full transition-colors ${
                idx === i ? "bg-brand" : "bg-border"
              }`}
            />
          ))}
        </div>
      </div>
      <div className="relative h-16 overflow-hidden">
        {ENTRIES.map((e, idx) => (
          <Link
            key={e.handle}
            to="/products/$handle"
            params={{ handle: e.handle }}
            className={`absolute inset-0 flex items-center gap-3 px-3 transition-all duration-500 ${
              idx === i
                ? "translate-y-0 opacity-100"
                : "pointer-events-none translate-y-2 opacity-0"
            }`}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-brand text-sm font-black tabular-nums text-brand-foreground">
              #{e.rank}
            </span>
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-sm border border-border bg-muted">
              <img
                src={e.image}
                alt={`${e.team} hoodie`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-extrabold uppercase tracking-tight text-foreground">
                {e.team}
              </div>
              <div className="truncate text-[11px] text-muted-foreground">
                Shop the drop →
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}