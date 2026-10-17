// Small shared helpers: class merge, color mapping, and the "Find it" link.

export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

const COLOR_HEX: Record<string, string> = {
  white: "#ffffff",
  cream: "#f4ecdc",
  beige: "#e3d5bd",
  tan: "#c9a36a",
  brown: "#7c5a3a",
  black: "#211f1d",
  charcoal: "#3a3a3c",
  grey: "#9ca3af",
  gray: "#9ca3af",
  silver: "#c7ccd1",
  navy: "#27374d",
  blue: "#3b6ea5",
  green: "#5b6e4f",
  olive: "#6b7244",
  red: "#b23b3b",
  pink: "#d98aa0",
  gold: "#caa256",
  purple: "#7a5c9e",
  multicolor: "#b06a4f",
};

/**
 * Name a pixel's colour using the wardrobe palette. Works in HSL rather than
 * nearest-RGB so dark greys don't read as green and shaded whites stay white.
 */
export function nearestColorName(r: number, g: number, b: number): string {
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  const l = (max + min) / 2;
  const chroma = max - min;

  // Neutrals: low chroma → decided by lightness alone.
  if (chroma < 0.12 || (l < 0.12 && chroma < 0.2)) {
    if (l >= 0.8) return "white";
    if (l >= 0.52) return "grey";
    if (l >= 0.22) return "charcoal";
    return "black";
  }

  let h: number;
  const rn = r / 255, gn = g / 255, bn = b / 255;
  if (max === rn) h = ((gn - bn) / chroma) % 6;
  else if (max === gn) h = (bn - rn) / chroma + 2;
  else h = (rn - gn) / chroma + 4;
  h = (h * 60 + 360) % 360;
  const s = chroma / (1 - Math.abs(2 * l - 1));

  // Warm, muted, light → cream/beige; warm and darker → tan/brown.
  if (h >= 15 && h < 55) {
    if (s < 0.5 && l >= 0.8) return "cream";
    if (s < 0.6 && l >= 0.62) return "beige";
    if (l >= 0.45) return h >= 38 && s >= 0.6 ? "gold" : "tan";
    return "brown";
  }
  if (h < 15 || h >= 345) return l >= 0.7 ? "pink" : "red";
  if (h < 70) return l >= 0.4 ? "gold" : "olive";
  if (h < 165) return h < 95 && l < 0.45 ? "olive" : "green";
  if (h < 255) return l < 0.32 ? "navy" : "blue";
  if (h < 290) return "purple";
  return "pink";
}

export function colorToHex(name: string): string {
  return COLOR_HEX[name?.toLowerCase?.()] ?? "#9ca3af";
}

/**
 * "Find it" redirect. Google Lens proper needs an uploaded image URL, so for a
 * named inspiration piece we open Google Images search by name — the practical
 * equivalent for "go find something like this to buy".
 */
export function findItUrl(query: string): string {
  return `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`;
}

export function titleCase(s: string): string {
  return s.replace(/(^|[\s-])\w/g, (m) => m.toUpperCase());
}
