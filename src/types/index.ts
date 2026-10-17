// Domain types for Ashi's Wardrobe. Items persist in Supabase when configured
// (see src/lib/wardrobeRepo.ts); otherwise state is in-memory only.

export type Category =
  | "top"
  | "bottom"
  | "outerwear"
  | "footwear"
  | "accessory"
  | "dress";

export type Formality = "casual" | "smart-casual" | "formal";

export type Season = "spring" | "summer" | "autumn" | "winter";

export type Mood =
  | "energetic"
  | "relaxed"
  | "confident"
  | "cozy"
  | "professional";

export interface Item {
  id: string;
  name: string;
  /** Object URL for uploaded photos. If absent, a GarmentSwatch is rendered. */
  imageUrl?: string;
  /** Path in the Supabase `wardrobe` bucket, when the photo was uploaded. */
  imagePath?: string;
  category: Category;
  /** Named colors, e.g. ["red", "white"]. First color drives the swatch. */
  colors: string[];
  pattern: string; // "solid" | "striped" | "floral" | "plaid" | ...
  fabric: string | null; // optional — never required
  formality: Formality;
  season: Season[];
  owned: boolean; // false for AI "inspiration" pieces not in the wardrobe
  createdAt: number;
}

/** Tags returned by the (mocked) vision tagger. */
export interface ItemTags {
  category: Category;
  colors: string[];
  pattern: string;
  fabric: string | null;
  formality: Formality;
  season: Season[];
}

/**
 * An outfit returned by the (mocked) styling AI. Items are resolved inline
 * (rather than by id) so a combo can mix owned items with inspiration pieces
 * that don't live in the wardrobe store.
 */
export interface Outfit {
  id: string;
  items: Item[];
  reason: string;
  occasion: string;
}

export interface Weather {
  tempC: number;
  /** "sunny" | "cloudy" | "rainy" | "snowy" | "cold" | "mild" */
  condition: string;
  /** True when geolocation/weather failed and we fell back to a default. */
  isFallback: boolean;
}

export const CATEGORIES: Category[] = [
  "top",
  "bottom",
  "dress",
  "outerwear",
  "footwear",
  "accessory",
];

export const FORMALITIES: Formality[] = ["casual", "smart-casual", "formal"];

export const SEASONS: Season[] = ["spring", "summer", "autumn", "winter"];

export const MOODS: Mood[] = [
  "energetic",
  "relaxed",
  "confident",
  "cozy",
  "professional",
];
