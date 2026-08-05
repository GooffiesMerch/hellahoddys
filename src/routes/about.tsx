import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Hella Hoodys" },
      { name: "description", content: "Hella Hoodys is making urban streetwear accessible to everyone through made-to-order production and bold, fan-first design." },
      { property: "og:title", content: "About — Hella Hoodys" },
      { property: "og:description", content: "Making urban streetwear accessible to everyone." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="flex-1">
      {/* Hero */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-20 lg:py-28">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            About us
          </p>
          <h1 className="mt-4 max-w-4xl text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl">
            A fashion revolution, one HOODY at a time.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Hella Hoodys isn't just a clothing store; it's a fashion revolution — making
            urban streetwear accessible to everyone, one bold drop at a time.
          </p>
        </div>
      </section>

      {/* Brand story */}
      <section className="mx-auto max-w-[1400px] px-6 lg:px-10 py-16 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6 text-lg text-foreground/90">
            <h2 className="text-3xl font-black tracking-tight">Built for the fans.</h2>
            <p>
              Hella Hoodys started with a simple idea: what if game day energy could live in
              your closet all year long? We grew up in cities where the team colors run deep,
              where Greek letters mean forever, and where the right hoodie is a statement of
              identity.
            </p>
            <p>
              We built this store for fans who want gear that feels like theirs. No cookie-cutter
              designs, no generic mall brand. Every piece is made to represent the teams,
              schools, cultures, and neighborhoods people actually care about.
            </p>
            <p>
              From NCAA Saturdays to NFL Sundays, from Greek Life events to everyday streetwear,
              Hella Hoodys is here to make the hoodie the uniform of every fan.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-brand/10 p-10 lg:p-14">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-4xl font-black text-brand">458+</p>
                <p className="mt-1 text-sm font-medium text-muted-foreground">Unique drops</p>
              </div>
              <div>
                <p className="text-4xl font-black text-brand">6</p>
                <p className="mt-1 text-sm font-medium text-muted-foreground">Collections</p>
              </div>
              <div>
                <p className="text-4xl font-black text-brand">Worldwide</p>
                <p className="mt-1 text-sm font-medium text-muted-foreground">Shipping</p>
              </div>
              <div>
                <p className="text-4xl font-black text-brand">On-demand</p>
                <p className="mt-1 text-sm font-medium text-muted-foreground">Production</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-16 lg:py-24">
          <div className="mb-12 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">What we stand for</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">The Hella way.</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <ValueCard
              number="01"
              title="Made to order"
              description="Every item is printed only after it is ordered. That means no overproduction, no clearance racks, and no waste from unsold stock."
            />
            <ValueCard
              number="02"
              title="Fan-first design"
              description="We create drops around the teams, schools, and communities people love. Our catalog is built from fan culture, not fashion trends."
            />
            <ValueCard
              number="03"
              title="Premium prints"
              description="We use high-quality inks and durable fabrics so colors stay bold and the fit stays comfortable after every wash."
            />
            <ValueCard
              number="04"
              title="Accessible style"
              description="Streetwear should not cost a fortune. We keep our pieces fairly priced so more fans can rep what matters to them."
            />
            <ValueCard
              number="05"
              title="Worldwide shipping"
              description="No matter where you rep your team, we ship to you. Our made-to-order network delivers across the globe."
            />
            <ValueCard
              number="06"
              title="Always improving"
              description="New drops, new collections, and new ideas are always in motion. We listen to our community and build what they want next."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-[1400px] px-6 lg:px-10 py-16 lg:py-24">
        <div className="mb-12 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">How it works</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight">From order to doorstep.</h2>
          <p className="mt-4 text-muted-foreground">
            Made to order means we only make what you buy. No warehouses, no waste, no waiting for a restock.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StepCard
            step="1"
            title="You choose"
            description="Pick your design, color, and size from our catalog. Every drop is made to stand out."
          />
          <StepCard
            step="2"
            title="We print"
            description="Your order goes to our production partner, where it is printed and assembled with care."
          />
          <StepCard
            step="3"
            title="We pack & ship"
            description="Once finished, your hoodie is packed and shipped directly to your door, worldwide."
          />
          <StepCard
            step="4"
            title="You rep"
            description="Throw it on, rep your team, and let the world know what you stand for."
          />
        </div>
      </section>

      {/* Sustainability */}
      <section className="border-y border-border bg-brand/5">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-16 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Sustainability</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight">Less waste, more intent.</h2>
              <div className="mt-6 space-y-4 text-foreground/90">
                <p>
                  Traditional fashion brands guess how much to make. That guessing creates
                  overproduction, landfills, and wasted resources. We do it differently.
                </p>
                <p>
                  Because every Hella Hoodys item is printed on demand, we only produce what
                  people actually order. No unsold stock, no dead inventory, and no clearance
                  waste. Just the pieces people want, made when they want them.
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-brand/20 bg-background p-8 lg:p-12">
              <ul className="space-y-5">
                <li className="flex items-start gap-4">
                  <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-brand text-xs font-bold text-brand-foreground">✓</span>
                  <span className="text-foreground/90">No mass overproduction</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-brand text-xs font-bold text-brand-foreground">✓</span>
                  <span className="text-foreground/90">Reduced inventory waste</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-brand text-xs font-bold text-brand-foreground">✓</span>
                  <span className="text-foreground/90">Printed close to the customer when possible</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-brand text-xs font-bold text-brand-foreground">✓</span>
                  <span className="text-foreground/90">Durable inks and fabrics for longer wear</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Shipping & policies */}
      <section className="mx-auto max-w-[1400px] px-6 lg:px-10 py-16 lg:py-24">
        <div className="mb-12 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Shipping & support</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight">Need to know.</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <InfoCard
            title="Shipping times"
            description="Most orders are printed within 2–5 business days and delivered within 7–14 business days depending on your location. You will receive tracking as soon as it ships."
          />
          <InfoCard
            title="Free shipping"
            description="We offer free standard shipping on orders over $75. Flat-rate shipping is available for smaller orders."
          />
          <InfoCard
            title="Returns & exchanges"
            description="Because items are made to order, we accept returns only for defective or incorrect items. Contact us within 14 days and we will make it right."
          />
          <InfoCard
            title="Size guide"
            description="Each product page includes a size chart. Hoodies are unisex unless noted. When in doubt, size up for a relaxed fit."
          />
          <InfoCard
            title="Order tracking"
            description="You will receive a confirmation email after checkout and a second email with tracking once your order ships."
          />
          <InfoCard
            title="Customer care"
            description="Have a question about your order, a design, or a collaboration? Reach out anytime — we read every message."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-foreground text-background">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-20 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Ready to rep?</p>
          <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
            Find your next favorite HOODY.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-background/70">
            Browse the latest drops, explore collections, and grab the hoodie that reps your team.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/shop"
              className="inline-flex items-center justify-center rounded-md bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90"
            >
              Shop all products
            </Link>
            <Link
              to="/collections"
              className="inline-flex items-center justify-center rounded-md border border-background/30 bg-transparent px-6 py-3 text-sm font-semibold text-background transition-colors hover:bg-background/10"
            >
              Explore collections
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function ValueCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-6 transition-shadow hover:shadow-sm">
      <p className="text-xs font-bold text-brand">{number}</p>
      <h3 className="mt-3 text-lg font-bold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

function StepCard({ step, title, description }: { step: string; title: string; description: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-sm font-black text-brand-foreground">
        {step}
      </div>
      <h3 className="mt-4 text-lg font-bold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

function InfoCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-6">
      <h3 className="text-lg font-bold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}
