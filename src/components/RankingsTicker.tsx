const AP_TOP_25 = [
  "Georgia", "Ohio State", "Michigan", "Alabama", "Texas",
  "Oregon", "Penn State", "Notre Dame", "Ole Miss", "LSU",
  "Tennessee", "Missouri", "Florida State", "Utah", "Oklahoma",
  "Clemson", "Miami", "USC", "Kansas State", "Louisville",
  "NC State", "Iowa", "Arizona", "Washington", "Auburn",
];

function makeScore(i: number) {
  // Deterministic pseudo-scores so SSR and client match.
  const a = 17 + ((i * 7) % 28);
  const b = 10 + ((i * 5) % 21);
  return `${a}–${b}`;
}

export function RankingsTicker() {
  const items = AP_TOP_25.map((team, i) => ({
    rank: i + 1,
    team,
    score: makeScore(i),
  }));
  // Duplicate for a seamless -50% loop.
  const loop = [...items, ...items];

  return (
    <div
      className="mb-6 overflow-hidden rounded-md border border-border bg-foreground text-background"
      aria-label="College football AP Top 25 rankings ticker"
    >
      <div className="flex items-stretch">
        <div className="flex shrink-0 items-center gap-2 bg-brand px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand-foreground">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-foreground" />
          AP Top 25
        </div>
        <div className="relative flex-1 overflow-hidden">
          <div className="flex w-max animate-marquee gap-8 whitespace-nowrap py-2 pl-6 text-xs font-medium">
            {loop.map((it, idx) => (
              <span key={idx} className="flex items-center gap-2">
                <span className="rounded-sm bg-brand/20 px-1.5 py-0.5 text-[10px] font-black text-brand">
                  #{it.rank}
                </span>
                <span className="text-background">{it.team}</span>
                <span className="text-background/50">{it.score}</span>
                <span className="text-background/30">·</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}