import { products, type Product } from "./products";

export interface Collection {
  slug: string;
  name: string;
  tagline: string;
  match: (p: Product) => boolean;
}

const has = (t: string, words: string[]) => words.some((w) => t.includes(w));

export const collections: Collection[] = [
  {
    slug: "ncaa",
    name: "NCAA · College Football",
    tagline: "Reppin' every campus, every Saturday.",
    match: (p) => {
      const t = (p.title + " " + p.tags).toLowerCase();
      return has(t, ["ncaa", "university", "college", "gamecocks", "wildcats", "tigers", "cougars", "panthers"]);
    },
  },
  {
    slug: "nfl",
    name: "NFL · Sunday Kickoff",
    tagline: "Game-day fits for every franchise.",
    match: (p) => (p.title + " " + p.tags).toLowerCase().includes("nfl"),
  },
  {
    slug: "mlb",
    name: "Baseball · Diamond Season",
    tagline: "Bases loaded. Fits stacked.",
    match: (p) => (p.title + " " + p.tags).toLowerCase().includes("baseball"),
  },
  {
    slug: "greek",
    name: "Greek Life",
    tagline: "For the letters that raised you.",
    match: (p) => {
      const t = (p.title + " " + p.tags).toLowerCase();
      return has(t, ["sigma", "kappa", "alpha", "delta", "omega", " phi", " chi", " zeta", " beta"]);
    },
  },
  {
    slug: "valentines",
    name: "Valentine's Drop",
    tagline: "Cupid-approved crewnecks and hoodies.",
    match: (p) => {
      const t = (p.title + " " + p.tags).toLowerCase();
      return has(t, ["valentine", "cupid", "vday", "v-day"]);
    },
  },
  {
    slug: "streetwear",
    name: "Streetwear · Cities & Countries",
    tagline: "From the block to the border.",
    match: (p) => {
      const t = (p.title + " " + p.tags).toLowerCase();
      const isOther =
        has(t, ["ncaa", "university", "college", "nfl", "baseball", "valentine", "cupid", "vday"]) ||
        has(t, ["sigma", "kappa", "alpha", "delta", "omega", " phi", " chi", " zeta", " beta"]);
      return !isOther;
    },
  },
];

export function getCollection(slug: string): Collection | undefined {
  return collections.find((c) => c.slug === slug);
}

export function productsIn(slug: string): Product[] {
  const c = getCollection(slug);
  if (!c) return [];
  return products.filter((p) => p.images.length > 0 && c.match(p));
}

export function collectionCover(slug: string): string | undefined {
  return productsIn(slug)[0]?.images[0];
}

export function collectionCount(slug: string): number {
  return productsIn(slug).length;
}