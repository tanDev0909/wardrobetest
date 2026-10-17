"use client";

import type { Outfit } from "@/types";
import { findItUrl, titleCase } from "@/lib/utils";
import ItemImage from "@/components/wardrobe/ItemImage";

interface Props {
  outfit: Outfit;
  elevated?: boolean;
}

export default function OutfitCard({ outfit, elevated }: Props) {
  return (
    <article className="rounded-3xl border border-line bg-surface p-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-swatch px-3 py-1 text-xs font-medium text-muted">
            {outfit.occasion}
          </span>
          {elevated && (
            <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
              ✨ AI elevated
            </span>
          )}
        </div>
        <span className="text-xs text-muted">{outfit.items.length} pieces</span>
      </div>

      <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
        {outfit.items.map((item) => (
          <li key={item.id} className="space-y-1.5">
            <div className="overflow-hidden rounded-xl border border-line">
              <ItemImage item={item} className="aspect-square w-full object-cover" />
            </div>
            <p className="truncate text-xs font-medium" title={item.name}>
              {item.name}
            </p>
            {item.owned ? (
              <p className="text-[10px] uppercase tracking-wide text-muted">
                {titleCase(item.category)}
              </p>
            ) : (
              <a
                href={findItUrl(item.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex text-[11px] font-medium text-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Find it →
              </a>
            )}
          </li>
        ))}
      </ul>

      <p className="mt-4 text-sm leading-relaxed text-muted">{outfit.reason}</p>
    </article>
  );
}
