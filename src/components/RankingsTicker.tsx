const AP_TOP_25 = [
  "Georgia", "Ohio State", "Michigan", "Alabama", "Texas",
  "Oregon", "Penn State", "Notre Dame", "Ole Miss", "LSU",
  "Tennessee", "Missouri", "Florida St", "Utah", "Oklahoma",
  "Clemson", "Miami", "USC", "Kansas St", "Louisville",
  "NC State", "Iowa", "Arizona", "Washington", "Auburn",
];

function score(i: number) {
  const a = 17 + ((i * 7) % 28);
  const b = 3 + ((i * 5) % 21);
  return `${a}\u2013${b}`;
}

export function RankingsTicker() {
  const items = AP_TOP_25.map((team, i) => ({ rank: i + 1, team, score: score(i) }));
  const loop = [...items, ...items];

  return (
    <div
      className="relative mb-6 overflow-hidden border-y border-border bg-background"
      aria-label="College football AP Top 25 rankings ticker"
    >
      <div className="relative flex h-11 items-center overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent" />

        <div className="flex w-max animate-marquee whitespace-nowrap">
          <div className="flex items-center gap-10 px-6">
            {loop.map((it, idx) => (
              <div key={idx} className="flex items-center gap-2.5">
                <span className="rounded-sm bg-brand px-1.5 py-0.5 text-[10px] font-black tracking-tighter text-brand-foreground">
                  #{it.rank}
                </span>
                <span className="text-sm font-extrabold uppercase tracking-tight text-foreground">
                  {it.team}
                </span>
                <span className="font-mono text-xs font-medium tabular-nums text-muted-foreground">
                  {it.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}