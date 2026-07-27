import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Hella Hoodys" },
      { name: "description", content: "Hella Hoodys is making urban streetwear accessible to everyone through print-on-demand production." },
      { property: "og:title", content: "About — Hella Hoodys" },
      { property: "og:description", content: "Making urban streetwear accessible to everyone." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        About
      </p>
      <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
        A fashion revolution, one HOODY at a time.
      </h1>
      <div className="mt-8 space-y-6 text-lg text-foreground/90">
        <p>
          Hella Hoodys isn't just a clothing store; it's a fashion revolution — making
          urban streetwear accessible to everyone.
        </p>
        <p>
          Every piece in our catalog is <strong>printed on demand</strong>. That means
          nothing is made until you order it. No warehouses of unsold stock, no
          overproduction, less waste — just the pieces people actually want.
        </p>
        <p>
          From soft fleece pullovers to bold graphic tees, our range is built to make
          bay-area energy wearable anywhere. Thanks for shopping thoughtfully.
        </p>
      </div>
    </div>
  );
}