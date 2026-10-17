"use client";

import type { Category, Outfit } from "@/types";
import type { CSSProperties } from "react";

// MOCKED virtual try-on. Real try-on would generate a single composited image
// from a model; here we overlay each garment's product image over the user's
// photo at rough body zones so the look reads as "on you". Clearly labelled as
// a simulated preview.
const ZONE: Record<Category, CSSProperties> = {
  outerwear: { top: "22%", left: "50%", transform: "translateX(-50%)", width: "54%" },
  top: { top: "24%", left: "50%", transform: "translateX(-50%)", width: "44%" },
  dress: { top: "24%", left: "50%", transform: "translateX(-50%)", width: "50%" },
  bottom: { top: "52%", left: "50%", transform: "translateX(-50%)", width: "40%" },
  footwear: { top: "82%", left: "50%", transform: "translateX(-50%)", width: "30%" },
  accessory: { top: "5%", right: "5%", width: "20%" },
};

const Z: Record<Category, number> = {
  footwear: 10,
  bottom: 20,
  dress: 25,
  top: 30,
  outerwear: 35,
  accessory: 40,
};

export default function TryOnPreview({
  photoUrl,
  outfit,
}: {
  photoUrl: string;
  outfit: Outfit;
}) {
  return (
    <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-3xl border border-line bg-swatch">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photoUrl}
        alt="You"
        className="block max-h-[70vh] w-full object-contain"
      />
      {outfit.items.map((it) =>
        it.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={it.id}
            src={it.imageUrl}
            alt={it.name}
            className="pointer-events-none absolute rounded-lg shadow-lg ring-1 ring-black/10"
            style={{ ...ZONE[it.category], zIndex: Z[it.category] }}
          />
        ) : null,
      )}
      <span className="absolute bottom-2 left-2 z-50 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-medium text-white">
        Simulated preview
      </span>
    </div>
  );
}
