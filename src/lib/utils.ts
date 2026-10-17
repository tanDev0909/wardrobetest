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
  multicolor: "#b06a4f",
};

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
