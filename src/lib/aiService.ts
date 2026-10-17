// MOCKED AI. Every "AI" capability lives behind these three functions with the
// exact signatures a real provider would use. They return believable dummy data
// after a deliberate delay so the experience *feels* like real inference.
//
// To go live later: replace the bodies with calls to a vision/LLM provider
// (e.g. Claude or GPT-4 vision). The UI never changes — it only knows these
// function names and their return shapes.

import type {
  Category,
  Formality,
  Item,
  ItemTags,
  Mood,
  Outfit,
  Weather,
} from "@/types";
const CDN = "https://cdn.dummyjson.com/product-images";
const FS = "https://fakestoreapi.com/img";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

let seq = 0;
const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${seq++}`;

// --- Vision tagging ---------------------------------------------------------

const CATEGORY_HINTS: Record<string, Category> = {
  shirt: "top",
  tee: "top",
  top: "top",
  sweater: "top",
  blouse: "top",
  jeans: "bottom",
  trouser: "bottom",
  pant: "bottom",
  skirt: "bottom",
  short: "bottom",
  coat: "outerwear",
  jacket: "outerwear",
  blazer: "outerwear",
  shoe: "footwear",
  sneaker: "footwear",
  boot: "footwear",
  heel: "footwear",
  loafer: "footwear",
  dress: "dress",
  belt: "accessory",
  watch: "accessory",
  bag: "accessory",
  scarf: "accessory",
};

const COLOR_HINTS = [
  "white", "black", "blue", "navy", "red", "green", "beige", "tan",
  "brown", "grey", "cream", "pink", "charcoal",
];

/**
 * Pretend to run a vision model over the photo. We sniff the filename for hints
 * (so a file called "red-dress.jpg" tags sensibly in a demo) and otherwise fall
 * back to a reasonable default the user can edit.
 */
export async function tagItem(file: File): Promise<ItemTags> {
  await delay(1300);
  const name = file?.name?.toLowerCase() ?? "";

  let category: Category = "top";
  for (const [hint, cat] of Object.entries(CATEGORY_HINTS)) {
    if (name.includes(hint)) {
      category = cat;
      break;
    }
  }

  const colors = COLOR_HINTS.filter((c) => name.includes(c));
  if (colors.length === 0) colors.push("blue");

  const formality: Formality =
    category === "dress" || category === "outerwear" ? "smart-casual" : "casual";

  return {
    category,
    colors,
    pattern: "solid",
    fabric: null,
    formality,
    season: ["spring", "autumn"],
  };
}

// --- Styling ----------------------------------------------------------------

// Inspiration pieces the user doesn't own yet — all clean product-only photos.
const INSPIRATION: Omit<Item, "id" | "createdAt">[] = [
  { name: "White leather sneakers", category: "footwear", colors: ["white"], pattern: "solid", fabric: "leather", formality: "casual", season: ["spring", "summer", "autumn"], owned: false, imageUrl: `${CDN}/mens-shoes/sports-sneakers-off-white-red/thumbnail.webp` },
  { name: "Tailored white shirt", category: "top", colors: ["white"], pattern: "solid", fabric: "cotton", formality: "smart-casual", season: ["spring", "summer", "autumn", "winter"], owned: false, imageUrl: `${CDN}/mens-shirts/man-short-sleeve-shirt/thumbnail.webp` },
  { name: "Statement red heels", category: "footwear", colors: ["red"], pattern: "solid", fabric: "leather", formality: "formal", season: ["spring", "summer", "autumn"], owned: false, imageUrl: `${CDN}/womens-shoes/red-shoes/thumbnail.webp` },
  { name: "Designer leather handbag", category: "accessory", colors: ["brown"], pattern: "solid", fabric: "leather", formality: "smart-casual", season: ["spring", "summer", "autumn", "winter"], owned: false, imageUrl: `${CDN}/womens-bags/heshe-women's-leather-bag/thumbnail.webp` },
  { name: "Classic baseball cap", category: "accessory", colors: ["navy"], pattern: "solid", fabric: "cotton", formality: "casual", season: ["spring", "summer", "autumn"], owned: false, imageUrl: "https://i.imgur.com/R3iobJA.jpeg" },
  { name: "Windbreaker jacket", category: "outerwear", colors: ["black"], pattern: "solid", fabric: "nylon", formality: "casual", season: ["spring", "autumn"], owned: false, imageUrl: `${FS}/71HblAHs5xL._AC_UY879_-2t.png` },
  { name: "Black hooded sweatshirt", category: "top", colors: ["black"], pattern: "solid", fabric: "cotton", formality: "casual", season: ["autumn", "winter"], owned: false, imageUrl: "https://i.imgur.com/cSytoSD.jpeg" },
];

function inspirationPiece(i: number): Item {
  const base = INSPIRATION[i % INSPIRATION.length];
  return { ...base, id: uid("inspo"), createdAt: 0 };
}

function moodFormality(mood: Mood): Formality {
  switch (mood) {
    case "professional":
      return "formal";
    case "confident":
      return "smart-casual";
    case "energetic":
    case "relaxed":
    case "cozy":
    default:
      return "casual";
  }
}

function isCold(w: Weather): boolean {
  return w.tempC < 14 || ["cold", "snowy"].includes(w.condition);
}
function isWet(w: Weather): boolean {
  return ["rainy", "snowy"].includes(w.condition);
}

function weatherPhrase(w: Weather): string {
  if (w.condition === "rainy") return `a rainy ${Math.round(w.tempC)}°C day`;
  if (w.condition === "snowy") return `cold, snowy weather`;
  if (w.condition === "sunny") return `a bright ${Math.round(w.tempC)}°C day`;
  if (isCold(w)) return `a chilly ${Math.round(w.tempC)}°C day`;
  return `mild ${Math.round(w.tempC)}°C weather`;
}

function pickByFormality(pool: Item[], target: Formality, offset: number): Item | null {
  if (pool.length === 0) return null;
  const ranked = [...pool].sort((a, b) => {
    const da = a.formality === target ? 0 : 1;
    const db = b.formality === target ? 0 : 1;
    return da - db;
  });
  return ranked[offset % ranked.length];
}

function buildReason(items: Item[], target: Formality, mood: Mood, w: Weather): string {
  const anchor = items[0];
  const palette = Array.from(new Set(items.flatMap((i) => i.colors))).slice(0, 3);
  return (
    `A ${target.replace("-", " ")} look for a ${mood} mood. The ${anchor.colors[0]} ` +
    `${anchor.name.toLowerCase()} anchors it, and the ${palette.join(", ")} palette stays ` +
    `easy to wear — a solid choice for ${weatherPhrase(w)}.`
  );
}

function occasionFor(target: Formality, mood: Mood): string {
  if (target === "formal") return mood === "professional" ? "Work / meetings" : "Evening out";
  if (target === "smart-casual") return "Brunch / day out";
  return mood === "energetic" ? "Active day" : "Everyday casual";
}

/**
 * Suggest a handful of complete outfits from the user's wardrobe, biased by the
 * day's weather and the chosen mood.
 */
export async function suggestOutfits(
  items: Item[],
  ctx: { weather: Weather; mood: Mood },
): Promise<Outfit[]> {
  await delay(1100);
  const owned = items.filter((i) => i.owned);
  const target = moodFormality(ctx.mood);
  const { weather } = ctx;

  const tops = owned.filter((i) => i.category === "top");
  const bottoms = owned.filter((i) => i.category === "bottom");
  const dresses = owned.filter((i) => i.category === "dress");
  const shoes = owned.filter((i) => i.category === "footwear");
  const outers = owned.filter((i) => i.category === "outerwear");
  const accs = owned.filter((i) => i.category === "accessory");

  const outfits: Outfit[] = [];

  const addOutfit = (core: (Item | null)[]) => {
    const picked = core.filter((x): x is Item => Boolean(x));
    if (picked.length < 2) return;
    // De-dup by the set of item ids.
    const key = picked.map((p) => p.id).sort().join("|");
    if (outfits.some((o) => o.items.map((i) => i.id).sort().join("|") === key)) return;
    outfits.push({
      id: uid("outfit"),
      items: picked,
      reason: buildReason(picked, target, ctx.mood, weather),
      occasion: occasionFor(target, ctx.mood),
    });
  };

  for (let i = 0; i < 6 && outfits.length < 5; i++) {
    const wantOuter = isCold(weather) || isWet(weather);
    const outer = wantOuter ? pickByFormality(outers, target, i) : null;
    const shoe = pickByFormality(shoes, target, i);
    const acc = pickByFormality(accs, target, i + 1);

    if (dresses.length && i % 2 === 0) {
      addOutfit([pickByFormality(dresses, target, i), shoe, outer, acc]);
    } else {
      addOutfit([
        pickByFormality(tops, target, i),
        pickByFormality(bottoms, target, i),
        shoe,
        outer,
        acc,
      ]);
    }
  }

  return outfits;
}

/**
 * Build outfits *around* a specific item (e.g. "what goes with my red top?").
 * Mixes the user's own pieces with 1-2 inspiration pieces they don't own yet,
 * so the "Find it" redirect always has something to point at.
 */
export async function styleAround(base: Item, items: Item[]): Promise<Outfit[]> {
  await delay(1100);
  const owned = items.filter((i) => i.owned && i.id !== base.id);
  const target = base.formality;

  const byCat = (c: Category) => owned.filter((i) => i.category === c);

  // Which slots do we still need, given the base item's category?
  const needs: Category[] = (() => {
    switch (base.category) {
      case "top":
        return ["bottom", "footwear", "outerwear", "accessory"];
      case "bottom":
        return ["top", "footwear", "outerwear", "accessory"];
      case "dress":
        return ["footwear", "outerwear", "accessory"];
      case "footwear":
        return ["top", "bottom", "outerwear"];
      case "outerwear":
        return ["top", "bottom", "footwear"];
      case "accessory":
        return ["top", "bottom", "footwear"];
      default:
        return ["footwear", "accessory"];
    }
  })();

  const outfits: Outfit[] = [];
  for (let v = 0; v < 3; v++) {
    const picks: Item[] = [base];
    needs.forEach((cat, idx) => {
      const candidate = pickByFormality(byCat(cat), target, v + idx);
      if (candidate) picks.push(candidate);
    });

    // Sprinkle an inspiration piece into the 2nd and 3rd looks so users can
    // explore (and "Find it") things outside their current wardrobe.
    if (v > 0) {
      picks.push(inspirationPiece(v - 1));
    }

    if (picks.length < 2) continue;
    outfits.push({
      id: uid("style"),
      items: picks,
      reason:
        `Built around your ${base.colors[0]} ${base.name.toLowerCase()}. ` +
        `${v === 0 ? "A clean head-to-toe pairing from your own wardrobe." : "A fresh twist that adds a piece worth hunting for."}`,
      occasion: occasionFor(target, "confident"),
    });
  }

  return outfits;
}

/**
 * "Elevate with AI" — take a finished outfit and push it one notch dressier:
 * swap the footwear/top for a more formal piece if available, then layer in a
 * statement accessory or inspiration piece. Returns a NEW outfit.
 */
export async function elevateOutfit(outfit: Outfit, items: Item[]): Promise<Outfit> {
  await delay(1200);
  const owned = items.filter((i) => i.owned);

  const moreFormal = (it: Item): Item => {
    const upgrade = owned
      .filter((o) => o.category === it.category && o.id !== it.id)
      .sort((a, b) => formalRank(b.formality) - formalRank(a.formality))[0];
    return upgrade && formalRank(upgrade.formality) > formalRank(it.formality)
      ? upgrade
      : it;
  };

  const elevated = outfit.items.map((it) =>
    it.category === "footwear" || it.category === "top" ? moreFormal(it) : it,
  );

  // Add a statement accessory the look doesn't already have.
  const hasAccessory = elevated.some((i) => i.category === "accessory");
  if (!hasAccessory) {
    const acc =
      INSPIRATION.find((i) => i.category === "accessory") ?? INSPIRATION[0];
    elevated.push({ ...acc, id: uid("inspo"), createdAt: 0 });
  }

  // De-dupe by id, preserving order.
  const seen = new Set<string>();
  const finalItems = elevated.filter((i) =>
    seen.has(i.id) ? false : (seen.add(i.id), true),
  );

  return {
    id: uid("elevated"),
    items: finalItems,
    reason:
      "✨ Elevated. AI swapped in your dressier pieces and added a statement " +
      "accent to sharpen the silhouette — same base, more polish.",
    occasion: "Dressed up",
  };
}

function formalRank(f: Formality): number {
  return f === "formal" ? 2 : f === "smart-casual" ? 1 : 0;
}

/**
 * "Generate styles with AI" — produce several distinct outfits purely from the
 * user's own wardrobe (no inspiration pieces), varying the anchor each time.
 */
export async function generateStyles(items: Item[]): Promise<Outfit[]> {
  await delay(1300);
  const owned = items.filter((i) => i.owned);
  const tops = owned.filter((i) => i.category === "top");
  const bottoms = owned.filter((i) => i.category === "bottom");
  const dresses = owned.filter((i) => i.category === "dress");
  const shoes = owned.filter((i) => i.category === "footwear");
  const outers = owned.filter((i) => i.category === "outerwear");
  const accs = owned.filter((i) => i.category === "accessory");

  const out: Outfit[] = [];
  const push = (parts: (Item | undefined)[], reason: string, occasion: string) => {
    const picked = parts.filter((x): x is Item => Boolean(x));
    if (picked.length < 2) return;
    const key = picked.map((p) => p.id).sort().join("|");
    if (out.some((o) => o.items.map((i) => i.id).sort().join("|") === key)) return;
    out.push({ id: uid("gen"), items: picked, reason, occasion });
  };

  for (let i = 0; i < 6 && out.length < 5; i++) {
    if (dresses.length && i % 3 === 0) {
      push(
        [dresses[i % dresses.length], shoes[i % (shoes.length || 1)], accs[i % (accs.length || 1)]],
        "AI styled a dress-led look, keeping shoes and accents tonal so the dress leads.",
        "Day to night",
      );
    } else {
      push(
        [
          tops[i % (tops.length || 1)],
          bottoms[i % (bottoms.length || 1)],
          shoes[i % (shoes.length || 1)],
          i % 2 ? outers[i % (outers.length || 1)] : undefined,
          accs[(i + 1) % (accs.length || 1)],
        ],
        "AI balanced proportions and color across pieces you already own — no shopping required.",
        i % 2 ? "Layered & put-together" : "Easy everyday",
      );
    }
  }
  return out;
}

/**
 * "Visualise on me" — MOCKED virtual try-on. A real version would call a
 * generative try-on model (e.g. FASHN, Replicate IDM-VTON) with the user photo
 * + garment images. Here we just simulate processing time; the UI composites
 * the garments over the user's photo as a preview.
 */
export async function visualizeOnUser(
  userPhotoUrl: string,
  outfit: Outfit,
): Promise<{ photoUrl: string; outfit: Outfit; simulated: true }> {
  await delay(1600);
  return { photoUrl: userPhotoUrl, outfit, simulated: true };
}
