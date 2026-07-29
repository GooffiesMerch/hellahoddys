import { products, type Product } from "./products";

export interface Collection {
  slug: string;
  name: string;
  tagline: string;
  match: (p: Product) => boolean;
}

const text = (p: Product) => (p.title + " " + p.tags + " " + p.type).toLowerCase();
const has = (t: string, words: string[]) => words.some((w) => t.includes(w));

const SOCCER = ["soccer", "futbol", "barcelona", "madrid", "liverpool", "arsenal", "chelsea", "juventus", "psg", "milan", "dortmund", "bayern", "benfica", "porto", "argentina", "brazil", "portugal", "netherlands", "croatia", "mexico national"];
const BASKETBALL = ["basketball", "nba", "lakers", "celtics", "warriors", "knicks", "bulls", "heat", "hoops", "wnba"];
const BASEBALL = ["baseball", "mlb", "yankees", "dodgers", "rays", "red sox", "white sox", "cubs", "braves", "astros", "mets"];
const FOOTBALL = ["ncaa", "nfl", "college", "university", "football", "crimson", "bulldogs", "longhorns", "buckeyes", "wolverines", "gators", "aggies", "sooners", "badgers", "gamecocks", "ucf", "wildcats", "cougars", "panthers"];

export const collections: Collection[] = [
  {
    slug: "college-football",
    name: "College Football",
    tagline: "Reppin' every campus, every Saturday.",
    match: (p) => has(text(p), FOOTBALL),
  },
  {
    slug: "soccer",
    name: "Soccer",
    tagline: "Clubs, countries, and kits worth wearing.",
    match: (p) => has(text(p), SOCCER),
  },
  {
    slug: "basketball",
    name: "Basketball",
    tagline: "Hardwood heat, off-court fits.",
    match: (p) => has(text(p), BASKETBALL),
  },
  {
    slug: "baseball",
    name: "Baseball",
    tagline: "Bases loaded. Fits stacked.",
    match: (p) => has(text(p), BASEBALL),
  },
  {
    slug: "womens-crop-zip-hoodys",
    name: "Womens Crop Zip Hoodys",
    tagline: "Cropped, zipped, and ready to go.",
    match: (p) => {
      const t = text(p);
      return t.includes("crop") || (t.includes("zip") && t.includes("women"));
    },
  },
  {
    slug: "hella-tees",
    name: "Hella Tees",
    tagline: "Everyday tees, HOODY energy.",
    match: (p) => {
      const t = text(p);
      return has(t, ["tee", "t-shirt", "tshirt"]);
    },
  },
  {
    slug: "nat-leggings",
    name: "N.A.T Leggings",
    tagline: "Not A Typical legging.",
    match: (p) => has(text(p), ["legging", "n.a.t", "nat "]),
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
