import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { CartProvider, useCart } from "@/lib/cart";
import { CatalogProvider } from "@/lib/catalog";
import { collectionCount } from "@/lib/collections";

type MenuItem = { label: string; slug?: string };
const MENU_GROUPS: { title: string; items: MenuItem[] }[] = [
  {
    title: "Professional",
    items: [
      { label: "NFL", slug: "nfl-football" },
      { label: "MLB", slug: "baseball" },
      { label: "NBA", slug: "basketball" },
      { label: "WNBA" },
      { label: "MLS", slug: "soccer" },
      { label: "NHL" },
    ],
  },
  {
    title: "Collegiate",
    items: [
      { label: "All Collegiate", slug: "college-football" },
      { label: "SEC" },
      { label: "Big Ten" },
      { label: "Big 12" },
      { label: "ACC" },
      { label: "Pac-12" },
    ],
  },
  {
    title: "Amateur",
    items: [
      { label: "NIL" },
      { label: "Athletes" },
      { label: "High Schools" },
    ],
  },
];

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
      { title: "Hella Hoodys — Made-to-Order Streetwear" },
      { name: "description", content: "HellaHoodys isn't just a clothing store; it's a fashion revolution. Made-to-order hoodies, tees, and apparel for everyone." },
      { property: "og:title", content: "Hella Hoodys — Made-to-Order Streetwear" },
      { property: "og:description", content: "Made-to-order hoodies, tees, and apparel. Making urban streetwear accessible to everyone." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#3aa8e0" },
      { name: "apple-mobile-web-app-title", content: "Hella Hoodys" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
      { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
      { rel: "icon", type: "image/png", sizes: "48x48", href: "/favicon-48x48.png" },
      { rel: "icon", type: "image/png", sizes: "96x96", href: "/favicon-96x96.png" },
      { rel: "icon", type: "image/png", sizes: "192x192", href: "/favicon-192x192.png" },
      { rel: "icon", type: "image/png", sizes: "512x512", href: "/favicon-512x512.png" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
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
        <CatalogProvider>
          <div className="min-h-screen flex flex-col bg-background text-foreground">
            <SiteHeader />
            <main className="flex-1">
              <Outlet />
            </main>
            <SiteFooter />
          </div>
        </CatalogProvider>
      </CartProvider>
    </QueryClientProvider>
  );
}

function SiteHeader() {
  return (
    <>
      <div className="bg-footer py-2 text-center text-xs font-medium uppercase tracking-[0.2em] text-footer-foreground">
        Free shipping on all U.S orders · <span className="text-brand">It's always HOODY season</span>
      </div>
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 lg:px-10 py-4">
          <Link to="/" className="flex items-center" aria-label="Hella Hoodys home">
            <img src="/images/hella-hoodys-logo.jpg" alt="Hella Hoodys — It's always HOODY season" className="h-10 w-auto" />
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium sm:flex">
            <Link to="/" activeOptions={{ exact: true }} activeProps={{ className: "text-brand" }} className="hover:text-brand transition-colors">Home</Link>
            <Link to="/shop" activeProps={{ className: "text-brand" }} className="hover:text-brand transition-colors">Shop</Link>
            <CollectionsMenu />
            <Link to="/about" activeProps={{ className: "text-brand" }} className="hover:text-brand transition-colors">About</Link>
          </nav>
          <HeaderActions />
        </div>
      </header>
    </>
  );
}

function HeaderActions() {
  return <HeaderActionsInner />;
}

function CollectionsMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 hover:text-brand transition-colors"
      >
        Collections
        <span
          aria-hidden
          className={`text-[10px] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          ▼
        </span>
      </button>

      {open && (
        <div className="absolute left-1/2 top-full z-50 w-[min(92vw,720px)] -translate-x-1/2 pt-4">
          <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-2xl ring-1 ring-brand/20">
            <div className="flex items-center justify-between border-b border-border bg-brand/10 px-5 py-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-brand">Shop by collection</p>
              <Link to="/collections" onClick={() => setOpen(false)} className="text-xs font-semibold hover:text-brand">
                View all →
              </Link>
            </div>
            <div className="grid gap-x-4 gap-y-6 p-5 sm:grid-cols-3">
              {MENU_GROUPS.map((group) => (
                <div key={group.title}>
                  <p className="mb-2 border-b border-border pb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-brand">
                    {group.title}
                  </p>
                  <ul className="space-y-0.5">
                    {group.items.map((item) => {
                      const count = item.slug ? collectionCount(item.slug) : 0;
                      const live = Boolean(item.slug) && count > 0;
                      return (
                        <li key={item.label}>
                          {live && item.slug ? (
                            <Link
                              to="/collections/$slug"
                              params={{ slug: item.slug }}
                              onClick={() => setOpen(false)}
                              className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold uppercase tracking-wide transition-colors hover:bg-muted hover:text-brand"
                            >
                              <span className="truncate">{item.label}</span>
                              <span className="shrink-0 text-[10px] font-medium normal-case text-muted-foreground">
                                {count}
                              </span>
                            </Link>
                          ) : (
                            <span className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold uppercase tracking-wide text-muted-foreground/60">
                              <span className="truncate">{item.label}</span>
                              <span className="shrink-0 text-[9px] font-medium normal-case">Soon</span>
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function HeaderActionsInner() {
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
    <footer className="mt-24 border-t border-border bg-footer text-footer-foreground">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-1">
            <img src="/images/hella-hoodys-logo.jpg" alt="Hella Hoodys" className="h-10 w-auto rounded-sm bg-white p-1.5" />
            <p className="mt-4 max-w-xs text-sm text-footer-foreground/70">
              It's always HOODY season.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-footer-foreground/60">Shop</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link to="/shop" className="hover:text-brand">All products</Link></li>
              <li><Link to="/collections" className="hover:text-brand">All collections</Link></li>
              <li><Link to="/collections/$slug" params={{ slug: "college-football" }} className="hover:text-brand">College Football</Link></li>
              <li><Link to="/collections/$slug" params={{ slug: "soccer" }} className="hover:text-brand">Soccer</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-footer-foreground/60">Help</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-brand">About us</Link></li>
              <li><Link to="/about" className="hover:text-brand">Shipping & returns</Link></li>
              <li><Link to="/about" className="hover:text-brand">Size guide</Link></li>
              <li><Link to="/about" className="hover:text-brand">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-footer-foreground/60">Newsletter</h4>
            <p className="mt-4 text-sm text-footer-foreground/70">
              Drops, restocks, and 10% off your first order.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="mt-4 flex overflow-hidden rounded-md border border-footer-foreground/30"
            >
              <input
                type="email"
                required
                placeholder="you@email.com"
                className="flex-1 bg-transparent px-3 py-2 text-sm placeholder:text-footer-foreground/40 focus:outline-none"
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

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-footer-foreground/20 pt-6 text-xs text-footer-foreground/60 sm:flex-row sm:items-center">
          <p>© {year} Hella Hoodys. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-brand">Privacy</a>
            <a href="#" className="hover:text-brand">Terms</a>
            <a href="#" className="hover:text-brand">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
