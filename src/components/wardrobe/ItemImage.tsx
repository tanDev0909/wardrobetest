"use client";

import { useState } from "react";
import type { Item } from "@/types";
import GarmentSwatch from "./GarmentSwatch";

interface Props {
  item: Item;
  className?: string;
}

// Renders the item's real photo, falling back to the drawn garment swatch if
// the image fails to load (offline, dead URL, etc.) so the UI never breaks.
export default function ItemImage({ item, className }: Props) {
  const [failed, setFailed] = useState(false);

  if (item.imageUrl && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={item.imageUrl}
        alt={item.name}
        loading="lazy"
        onError={() => setFailed(true)}
        className={className}
      />
    );
  }

  return (
    <GarmentSwatch
      category={item.category}
      color={item.colors[0] ?? "grey"}
      className={className}
    />
  );
}
