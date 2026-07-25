import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import logoAsset from "@/assets/hella-hoodys-logo.jpg.asset.json";
import { CartProvider, useCart } from "@/lib/cart";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Hella Hoodys — Print on Demand Streetwear" },
      { name: "description", content: "HellaHoodys isn't just a clothing store; it's a fashion revolution. Print-on-demand hoodies, tees, and apparel for everyone." },
      { property: "og:title", content: "Hella Hoodys — Print on Demand Streetwear" },
      { property: "og:description", content: "Print-on-demand hoodies, tees, and apparel. Making urban streetwear accessible to everyone." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <div className="min-h-screen flex flex-col bg-background text-foreground">
          <SiteHeader />
          <main className="flex-1">
            <Outlet />
          </main>
          <SiteFooter />
        </div>
      </CartProvider>
    </QueryClientProvider>
  );
}

function SiteHeader() {
  return (
    <>
      <div className="bg-foreground py-2 text-center text-xs font-medium uppercase tracking-[0.2em] text-background">
        Free shipping on orders over $75 · <span className="text-brand">It's always hoody season</span>
      </div>
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 lg:px-10 py-4">
          <Link to="/" className="flex items-center" aria-label="Hella Hoodys home">
            <img src={logoAsset.url} alt="Hella Hoodys — It's always hoody season" className="h-10 w-auto" />
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium sm:flex">
            <Link to="/" activeOptions={{ exact: true }} activeProps={{ className: "text-brand" }} className="hover:text-brand transition-colors">Home</Link>
            <Link to="/shop" activeProps={{ className: "text-brand" }} className="hover:text-brand transition-colors">Shop</Link>
            <Link to="/about" activeProps={{ className: "text-brand" }} className="hover:text-brand transition-colors">About</Link>
          </nav>
          <HeaderActions />
        </div>
      </header>
    </>
  );
}

function HeaderActions() {
  const { count } = useCart();
  return (
    <div className="flex items-center gap-4 text-sm">
      <Link to="/shop" className="hidden sm:inline hover:text-brand transition-colors" aria-label="Search">Search</Link>
      <Link to="/cart" className="rounded-md bg-brand px-3 py-1.5 font-semibold text-brand-foreground hover:opacity-90 transition-opacity">
        Bag ({count})
      </Link>
    </div>
  );
}

function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-border bg-foreground text-background">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-1">
            <img src={logoAsset.url} alt="Hella Hoodys" className="h-10 w-auto rounded-sm bg-background p-1.5" />
            <p className="mt-4 max-w-xs text-sm text-background/70">
              Print-on-demand streetwear. It's always hoody season.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-background/60">Shop</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link to="/shop" className="hover:text-background/70">All products</Link></li>
              <li><Link to="/shop" className="hover:text-background/70">Hoodies</Link></li>
              <li><Link to="/shop" className="hover:text-background/70">T-shirts</Link></li>
              <li><Link to="/shop" className="hover:text-background/70">New arrivals</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-background/60">Help</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-background/70">About us</Link></li>
              <li><Link to="/about" className="hover:text-background/70">Shipping & returns</Link></li>
              <li><Link to="/about" className="hover:text-background/70">Size guide</Link></li>
              <li><Link to="/about" className="hover:text-background/70">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-background/60">Newsletter</h4>
            <p className="mt-4 text-sm text-background/70">
              Drops, restocks, and 10% off your first order.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="mt-4 flex overflow-hidden rounded-md border border-background/30"
            >
              <input
                type="email"
                required
                placeholder="you@email.com"
                className="flex-1 bg-transparent px-3 py-2 text-sm placeholder:text-background/40 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-brand px-4 py-2 text-xs font-semibold uppercase tracking-wider text-brand-foreground hover:opacity-90"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-background/20 pt-6 text-xs text-background/60 sm:flex-row sm:items-center">
          <p>© {year} Hella Hoodys. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-background">Privacy</a>
            <a href="#" className="hover:text-background">Terms</a>
            <a href="#" className="hover:text-background">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
