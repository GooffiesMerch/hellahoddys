import { products, type Product } from "./products";

export interface Collection {
  slug: string;
  name: string;
  tagline: string;
  match: (p: Product) => boolean;
}

const text = (p: Product) => (p.title + " " + p.tags + " " + p.type).toLowerCase();
const has = (t: string, words: string[]) => words.some((w) => t.includes(w));
// whole-word match so "nba" doesn't hit "greenbay" and "hawks" doesn't hit "jayhawks"
const hasWord = (t: string, words: string[]) =>
  words.some((w) => new RegExp(`(^|[^a-z])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|[^a-z])`).test(t));

const SOCCER = ["soccer", "futbol", "barcelona", "madrid", "liverpool", "arsenal", "chelsea", "juventus", "psg", "milan", "dortmund", "bayern", "benfica", "porto", "argentina", "brazil", "portugal", "netherlands", "croatia", "mexico national"];
// Pro basketball — all 30 NBA franchises (mascots + market names)
const BASKETBALL = [
  "basketball", "nba", "wnba", "hoops",
  "celtics", "nets", "knicks", "76ers", "sixers", "raptors",
  "bulls", "cavaliers", "cavs", "pistons", "pacers", "bucks",
  "hawks", "hornets", "heat", "magic", "wizards",
  "nuggets", "timberwolves", "thunder", "blazers", "jazz",
  "warriors", "clippers", "lakers", "suns", "kings",
  "mavericks", "mavs", "rockets", "grizzlies", "pelicans", "spurs",
];
// NBA markets — used for city-name products (e.g. "HELLA BOSTON")
const NBA_CITIES = [
  "boston", "brooklyn", "new york", "philadelphia", "philly", "toronto",
  "chicago", "cleveland", "detroit", "indiana", "indianapolis", "milwaukee",
  "atlanta", "charlotte", "miami", "orlando", "washington",
  "denver", "minnesota", "minneapolis", "oklahoma city", "okc", "portland", "utah", "salt lake",
  "golden state", "san francisco", "los angeles", "l.a.", "phoenix", "sacramento",
  "dallas", "houston", "memphis", "new orleans", "san antonio",
];
const BASEBALL = ["baseball", "mlb", "yankees", "dodgers", "rays", "red sox", "white sox", "cubs", "braves", "astros", "mets"];
const FOOTBALL = ["ncaa", "nfl", "college", "university", "football", "crimson", "bulldogs", "longhorns", "buckeyes", "wolverines", "gators", "aggies", "sooners", "badgers", "gamecocks", "ucf", "wildcats", "cougars", "panthers"];

// Pro football — all 32 franchises (mascots + city/market names)
const NFL_TEAMS = [
  "bills", "buffalo", "dolphins", "miami", "patriots", "new england", "jets",
  "ravens", "baltimore", "bengals", "cincinnati", "cincinatti", "browns", "cleveland", "steelers", "pittsburgh",
  "texans", "houston", "colts", "indianapolis", "indy", "jaguars", "jacksonville", "titans", "tennessee",
  "broncos", "denver", "chiefs", "kansas city", "kansas", "raiders", "las vegas", "chargers",
  "cowboys", "dallas", "giants", "new york", "eagles", "philadelphia", "philly", "commanders", "washington",
  "bears", "chicago", "lions", "detroit", "packers", "green bay", "vikings", "minnesota",
  "falcons", "atlanta", "panthers", "carolina", "saints", "new orleans", "buccaneers", "tampa",
  "cardinals", "arizona", "rams", "los angeles", "49ers", "niners", "san francisco", "seahawks", "seattle",
];

export const collections: Collection[] = [
  {
    slug: "nfl-football",
    name: "NFL Football",
    tagline: "All 32 franchises. Sunday fits, every city.",
    match: (p) => {
      const t = text(p);
      if (t.includes("nfl")) return true;
      // don't pull college or other-sport gear into the pro football drop
      if (has(t, ["ncaa", "university", "college", "baseball", "basketball", "soccer", "mlb", "nba"])) return false;
      return has(t, NFL_TEAMS);
    },
  },
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
