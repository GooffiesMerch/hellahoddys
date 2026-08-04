import { products as staticProducts, type Product } from "./products";

export interface SubCategory {
  slug: string;
  name: string;
  match: (t: string) => boolean;
}

export interface Category {
  slug: string;
  name: string;
  tagline: string;
  match: (t: string) => boolean;
  subs: SubCategory[];
}

export const productText = (p: Product) =>
  (p.title + " " + p.tags + " " + p.type).toLowerCase();
const has = (t: string, words: string[]) => words.some((w) => t.includes(w));
const word = (t: string, words: string[]) =>
  words.some((w) =>
    new RegExp(`(^|[^a-z])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|[^a-z])`).test(t),
  );

const COLLEGE = ["ncaa", "college", "university", "alumni", "campus"];
const HS = ["high school", "highschool", "youth", "prep ", "varsity", "junior"];
const WOMEN = ["women", "womens", "women's", "ladies", "wnba", "nwsl", "crop"];

const isCollege = (t: string) => has(t, COLLEGE);
const isHS = (t: string) => has(t, HS);
const isWomen = (t: string) => has(t, WOMEN);

const NFL = [
  "nfl", "bills", "dolphins", "patriots", "jets", "ravens", "bengals", "browns", "steelers",
  "texans", "colts", "jaguars", "titans", "broncos", "chiefs", "raiders", "chargers",
  "cowboys", "eagles", "commanders", "bears", "lions", "packers", "vikings",
  "falcons", "saints", "buccaneers", "seahawks", "49ers", "niners", "rams",
];
const NBA = [
  "nba", "celtics", "nets", "knicks", "76ers", "sixers", "raptors", "bulls", "cavaliers", "cavs",
  "pistons", "pacers", "bucks", "hawks", "hornets", "heat", "magic", "wizards", "nuggets",
  "timberwolves", "thunder", "blazers", "jazz", "warriors", "clippers", "lakers", "suns",
  "kings", "mavericks", "mavs", "rockets", "grizzlies", "pelicans", "spurs",
];
const MLB = [
  "mlb", "orioles", "red sox", "yankees", "rays", "blue jays", "white sox", "guardians",
  "tigers", "royals", "twins", "astros", "angels", "athletics", "mariners", "rangers",
  "braves", "marlins", "mets", "phillies", "nationals", "cubs", "reds", "brewers",
  "pirates", "cardinals", "diamondbacks", "dbacks", "rockies", "dodgers", "padres",
];
const SOCCER = [
  "soccer", "futbol", "fifa", "world cup", "mls", "nwsl", "fc",
  "barcelona", "madrid", "liverpool", "arsenal", "chelsea", "juventus", "psg", "milan",
  "dortmund", "bayern", "benfica", "porto", "argentina", "brazil", "brasil", "france",
  "germany", "portugal", "mexico", "spain", "england", "netherlands", "japan", "morocco",
  "senegal", "croatia", "uruguay", "colombia", "ecuador", "ghana", "tunisia", "sweden",
  "norway", "belgium", "switzerland", "canada", "australia", "korea", "iran", "egypt",
];
const FOOTBALL_WORDS = ["football", "gridiron", "bowl", "ncaa", "crimson", "longhorns", "buckeyes", "wolverines", "gators", "aggies", "sooners", "badgers", "gamecocks"];
const BASKETBALL_WORDS = ["basketball", "hoops", "wnba"];
const BASEBALL_WORDS = ["baseball", "softball"];
const HOLIDAY = [
  "holiday", "christmas", "santa", "hanukkah", "easter", "faith", "spiritual", "blessed",
  "church", "jesus", "valentine", "halloween", "thanksgiving", "winter", "spring",
  "summer", "fall", "autumn",
];

const isSoccer = (t: string) => word(t.replace(/new england|n england/g, ""), SOCCER);
const NBA_CITIES = [
  "boston", "brooklyn", "philadelphia", "philly", "toronto", "chicago", "cleveland",
  "detroit", "indiana", "indianapolis", "milwaukee", "atlanta", "charlotte", "miami",
  "orlando", "denver", "minnesota", "minneapolis", "oklahoma city", "okc", "portland",
  "utah", "salt lake", "golden state", "phoenix", "sacramento", "dallas", "houston",
  "memphis", "new orleans", "san antonio",
];
const isBasketball = (t: string) =>
  word(t, NBA) || has(t, BASKETBALL_WORDS) || word(t, NBA_CITIES);
const isBaseball = (t: string) => word(t, MLB) || has(t, BASEBALL_WORDS);
const isFootball = (t: string) => word(t, NFL) || has(t, FOOTBALL_WORDS);

export const categories: Category[] = [
  {
    slug: "football",
    name: "Football",
    tagline: "Sunday kickoffs to Saturday campuses.",
    match: (t) => isFootball(t) && !isSoccer(t),
    subs: [
      { slug: "nfl", name: "NFL", match: (t) => (t.includes("nfl") || word(t, NFL)) && !isCollege(t) && !isHS(t) },
      { slug: "college", name: "College", match: (t) => isCollege(t) && !isHS(t) },
      { slug: "high-school-youth", name: "High School / Youth", match: isHS },
    ],
  },
  {
    slug: "baseball",
    name: "Baseball",
    tagline: "Bases loaded. Fits stacked.",
    match: (t) => isBaseball(t) && !isFootball(t) && !isSoccer(t),
    subs: [
      { slug: "mlb", name: "MLB", match: (t) => (t.includes("mlb") || word(t, MLB)) && !isCollege(t) && !isHS(t) },
      { slug: "college", name: "College", match: (t) => isCollege(t) && !isHS(t) },
      { slug: "high-school-youth", name: "High School / Youth", match: isHS },
    ],
  },
  {
    slug: "soccer",
    name: "Soccer",
    tagline: "Clubs, countries, and kits worth wearing.",
    match: isSoccer,
    subs: [
      { slug: "pro-men", name: "Pro Men", match: (t) => !isCollege(t) && !isHS(t) && !isWomen(t) },
      { slug: "pro-women", name: "Pro Women", match: (t) => !isCollege(t) && !isHS(t) && isWomen(t) },
      { slug: "college-men", name: "College Men", match: (t) => isCollege(t) && !isWomen(t) },
      { slug: "college-women", name: "College Women", match: (t) => isCollege(t) && isWomen(t) },
      { slug: "high-school-youth", name: "High School / Youth", match: isHS },
    ],
  },
  {
    slug: "basketball",
    name: "Basketball",
    tagline: "Hardwood heat, off-court fits.",
    match: (t) => isBasketball(t) && !isFootball(t) && !isSoccer(t) && !isBaseball(t),
    subs: [
      { slug: "nba", name: "NBA", match: (t) => !isCollege(t) && !isHS(t) && !isWomen(t) },
      { slug: "wnba", name: "WNBA", match: (t) => !isCollege(t) && !isHS(t) && isWomen(t) },
      { slug: "college-men", name: "College Men", match: (t) => isCollege(t) && !isWomen(t) },
      { slug: "college-women", name: "College Women", match: (t) => isCollege(t) && isWomen(t) },
      { slug: "high-school-youth", name: "High School / Youth", match: isHS },
    ],
  },
  {
    slug: "holiday-spiritual",
    name: "Holiday / Spiritual",
    tagline: "Seasonal drops and faith fits.",
    match: (t) => has(t, HOLIDAY),
    subs: [
      { slug: "winter", name: "Winter", match: (t) => has(t, ["winter", "christmas", "santa", "hanukkah", "snow"]) },
      { slug: "spring", name: "Spring", match: (t) => has(t, ["spring", "easter"]) },
      { slug: "summer", name: "Summer", match: (t) => has(t, ["summer", "july 4", "independence"]) },
      { slug: "fall", name: "Fall", match: (t) => has(t, ["fall", "autumn", "halloween", "thanksgiving"]) },
    ],
  },
  {
    slug: "hellacollabs",
    name: "HellaCollabs",
    tagline: "Limited team-ups with artists, creators and campuses.",
    match: (t) => has(t, ["collab"]),
    subs: [
      { slug: "artists", name: "Artists", match: (t) => has(t, ["artist", "art ", "designer", "illustrat"]) },
      { slug: "creators", name: "Creators", match: (t) => has(t, ["creator", "influencer", "streamer", "podcast"]) },
      { slug: "campuses", name: "Campuses", match: (t) => isCollege(t) },
      { slug: "limited", name: "Limited Editions", match: (t) => has(t, ["limited", "drop", "exclusive", "capsule"]) },
    ],
  },
  {
    slug: "hellablanks",
    name: "HellaBlanks",
    tagline: "Clean, logo-free essentials. Just the fit.",
    match: (t) => has(t, ["blank"]),
    subs: [
      { slug: "hoodies", name: "Hoodies", match: (t) => has(t, ["hoody", "hoodie"]) && !has(t, ["zip", "crop"]) },
      { slug: "zip-ups", name: "Zip-Ups", match: (t) => has(t, ["zip"]) },
      { slug: "crops", name: "Crops", match: (t) => has(t, ["crop"]) },
      { slug: "tees", name: "Tees", match: (t) => has(t, ["tee", "t-shirt", "shirt"]) },
    ],
  },
];

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getSub(category: Category, slug: string): SubCategory | undefined {
  return category.subs.find((s) => s.slug === slug);
}

export function productsInCategory(slug: string, catalog: Product[] = staticProducts): Product[] {
  const c = getCategory(slug);
  if (!c) return [];
  return catalog.filter((p) => p.images.length > 0 && c.match(productText(p)));
}

export function productsInSub(
  categorySlug: string,
  subSlug: string,
  catalog: Product[] = staticProducts,
): Product[] {
  const c = getCategory(categorySlug);
  if (!c) return [];
  const sub = getSub(c, subSlug);
  if (!sub) return [];
  return productsInCategory(categorySlug, catalog).filter((p) => sub.match(productText(p)));
}

/** Products in a category that no subcategory claims. */
export function productsUncategorized(
  categorySlug: string,
  catalog: Product[] = staticProducts,
): Product[] {
  const c = getCategory(categorySlug);
  if (!c) return [];
  return productsInCategory(categorySlug, catalog).filter(
    (p) => !c.subs.some((s) => s.match(productText(p))),
  );
}
