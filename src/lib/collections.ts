import { products, getProduct, type Product } from "./products";

export interface Collection {
  slug: string;
  name: string;
  tagline: string;
  match: (p: Product) => boolean;
  /** explicit product handle to use as the collection cover image */
  coverHandle?: string;
  /** show a "Coming soon" placeholder instead of covers/counts */
  comingSoon?: boolean;
}


const text = (p: Product) => (p.title + " " + p.tags + " " + p.type).toLowerCase();
const has = (t: string, words: string[]) => words.some((w) => t.includes(w));
// whole-word match so "nba" doesn't hit "greenbay" and "hawks" doesn't hit "jayhawks"
const hasWord = (t: string, words: string[]) =>
  words.some((w) => new RegExp(`(^|[^a-z])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|[^a-z])`).test(t));

const SOCCER = [
  "soccer", "futbol", "fifa", "world cup", "mls", "nwsl", "current", "fc",
  // clubs
  "barcelona", "madrid", "liverpool", "arsenal", "chelsea", "juventus", "psg", "milan", "dortmund", "bayern", "benfica", "porto",
  // World Cup 2026 nations
  "mexico", "south korea", "korea", "south africa", "czech republic", "czechia", "belgium", "new zealand",
  "iran", "egypt", "canada", "qatar", "bosnia", "herzegovina", "switzerland", "swiss", "spain", "saudi arabia",
  "cape verde", "uruguay", "brazil", "brasil", "scotland", "morocco", "haiti", "france", "senegal", "norway", "iraq",
  "australia", "paraguay", "turkey", "turkiye", "argentina", "austria", "jordan", "algeria",
  "germany", "ecuador", "ivory coast", "curacao", "portugal", "colombia", "uzbekistan", "el salvador",
  "netherlands", "holland", "japan", "tunisia", "sweden", "england", "croatia", "ghana", "panama",
];
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
// Pro baseball — all 30 MLB franchises (mascots)
const MLB_TEAMS = [
  "baseball", "mlb",
  "orioles", "red sox", "yankees", "rays", "blue jays", "jays",
  "white sox", "guardians", "indians", "tigers", "royals", "twins",
  "astros", "angels", "athletics", "a's", "mariners", "rangers",
  "braves", "marlins", "mets", "phillies", "nationals", "nats",
  "cubs", "reds", "brewers", "pirates", "cardinals",
  "diamondbacks", "dbacks", "rockies", "dodgers", "padres", "giants",
];
// MLB markets — city-name drops (e.g. "HELLA BALTIMORE")
const MLB_CITIES = [
  "baltimore", "boston", "bronx", "tampa", "tampa bay", "toronto",
  "cleveland", "detroit", "kansas city", "minnesota", "minneapolis",
  "houston", "anaheim", "oakland", "seattle", "arlington",
  "atlanta", "miami", "queens", "philadelphia", "philly", "washington",
  "chicago", "cincinnati", "milwaukee", "pittsburgh", "st louis", "st. louis",
  "arizona", "phoenix", "colorado", "denver", "los angeles", "san diego", "san francisco",
];
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
    coverHandle: "hella-hoodie-chicago",
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
    match: (p) => {
      const t = text(p);
      // "New England" is an NFL market, not the England national team
      const cleaned = t.replace(/new england|n england/g, "");
      if (has(cleaned, ["ncaa", "university", "nfl", "mlb", "nba"])) return cleaned.includes("soccer");
      return hasWord(cleaned, SOCCER);
    },
  },
  {
    slug: "basketball",
    name: "Basketball",
    tagline: "Hardwood heat, off-court fits.",
    coverHandle: "hella-new-york-unisex-hoodie",
    match: (p) => {
      const t = text(p);
      if (hasWord(t, BASKETBALL)) return true;
      // city-name drops count as hoops gear unless they're tagged to another league/sport
      if (has(t, ["ncaa", "university", "college", "nfl", "mlb", "baseball", "football", "soccer"])) return false;
      return hasWord(t, NBA_CITIES);
    },
  },
  {
    slug: "baseball",
    name: "Baseball",
    tagline: "Bases loaded. Fits stacked.",
    match: (p) => {
      const t = text(p);
      if (t.includes("mlb") || t.includes("baseball")) return true;
      // keep other leagues/sports out of the diamond drop
      if (has(t, ["ncaa", "university", "college", "nfl", "nba", "basketball", "soccer", "football"])) return false;
      // city-only drops (e.g. "HELLA TAMPA BAY") count when no other league claims them
      return hasWord(t, MLB_TEAMS) || hasWord(t, MLB_CITIES);
    },
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
    comingSoon: true,
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

export function productsIn(slug: string, catalog: Product[] = products): Product[] {
  const c = getCollection(slug);
  if (!c) return [];
  return catalog.filter((p) => p.images.length > 0 && c.match(p));
}

export function collectionCover(slug: string, catalog: Product[] = products): string | undefined {
  const c = getCollection(slug);
  if (c?.coverHandle) {
    const forced = getProduct(c.coverHandle) ?? catalog.find((p) => p.handle === c.coverHandle);
    if (forced?.images[0]) return forced.images[0];
  }
  return productsIn(slug, catalog)[0]?.images[0];
}


export function collectionCount(slug: string, catalog: Product[] = products): number {
  return productsIn(slug, catalog).length;
}
