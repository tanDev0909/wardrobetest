import type { Category } from "@/types";
import { colorToHex } from "@/lib/utils";

// Renders a simple garment silhouette in the item's primary color. Used instead
// of stock photos so the wardrobe looks designed and works fully offline with
// zero external assets. Uploaded items render their real photo instead.

const PATHS: Record<Category, string> = {
  top: "M34 20 L20 28 L26 41 L34 37 L34 80 L66 80 L66 37 L74 41 L80 28 L66 20 C63 27 37 27 34 20 Z",
  bottom: "M35 20 H65 L67 82 H55 L50 44 L45 82 H33 Z",
  outerwear:
    "M33 18 L18 28 L25 43 L33 39 L33 84 L50 84 L50 30 L33 18 Z M67 18 L82 28 L75 43 L67 39 L67 84 L50 84 L50 30 L67 18 Z",
  footwear:
    "M20 60 Q20 49 33 49 L50 49 Q59 49 64 56 L80 64 Q84 66 84 70 V75 H20 Z",
  accessory:
    "M34 44 H66 V78 H34 Z M42 44 Q42 30 50 30 Q58 30 58 44",
  dress:
    "M38 20 L28 28 L34 40 L40 37 L33 82 L67 82 L60 37 L66 40 L72 28 L62 20 C59 27 41 27 38 20 Z",
};

interface Props {
  category: Category;
  color: string;
  className?: string;
}

export default function GarmentSwatch({ category, color, className }: Props) {
  const hex = colorToHex(color);
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label={`${color} ${category}`}
    >
      <rect width="100" height="100" fill="var(--swatch)" />
      <path
        d={PATHS[category]}
        fill={hex}
        stroke="rgba(0,0,0,0.14)"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
