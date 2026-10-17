"use client";

import { useEffect, useRef, useState, type TouchEvent } from "react";
import type { Item, Outfit } from "@/types";
import { elevateOutfit } from "@/lib/aiService";
import OutfitCard from "./OutfitCard";

interface Props {
  outfits: Outfit[];
  /** When provided with allowElevate, enables the "Elevate with AI" action. */
  items?: Item[];
  allowElevate?: boolean;
}

export default function SwipeableOutfitDeck({ outfits, items = [], allowElevate }: Props) {
  const [list, setList] = useState<Outfit[]>(outfits);
  const [index, setIndex] = useState(0);
  const [elevatedIds, setElevatedIds] = useState<Set<string>>(new Set());
  const [elevating, setElevating] = useState(false);
  const startX = useRef<number | null>(null);

  // Reset when a new set of outfits comes in (e.g. weather/mood changed).
  useEffect(() => {
    setList(outfits);
    setIndex(0);
    setElevatedIds(new Set());
  }, [outfits]);

  const clamp = (n: number) => Math.max(0, Math.min(list.length - 1, n));
  const go = (delta: number) => setIndex((i) => clamp(i + delta));

  const onTouchStart = (e: TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: TouchEvent) => {
    if (startX.current === null) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
    startX.current = null;
  };

  const elevate = async () => {
    setElevating(true);
    const elevated = await elevateOutfit(list[index], items);
    setList((prev) => prev.map((o, i) => (i === index ? elevated : o)));
    setElevatedIds((prev) => new Set(prev).add(elevated.id));
    setElevating(false);
  };

  if (list.length === 0) return null;
  const current = list[index];
  const isElevated = elevatedIds.has(current.id);

  return (
    <div>
      <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <OutfitCard outfit={current} elevated={isElevated} />
      </div>

      {allowElevate && (
        <button
          type="button"
          onClick={elevate}
          disabled={elevating || isElevated}
          className="accent-gradient mt-4 flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-accent-foreground shadow-sm shadow-accent/30 transition hover:opacity-90 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {elevating ? "Elevating…" : isElevated ? "✨ Elevated" : "✨ Elevate this look with AI"}
        </button>
      )}

      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={index === 0}
          aria-label="Previous outfit"
          className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium transition hover:bg-swatch disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          ← Prev
        </button>

        <div className="flex items-center gap-1.5" aria-hidden="true">
          {list.map((o, i) => (
            <span
              key={o.id}
              className={
                i === index ? "h-2 w-2 rounded-full bg-accent" : "h-2 w-2 rounded-full bg-line"
              }
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => go(1)}
          disabled={index === list.length - 1}
          aria-label="Next outfit"
          className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium transition hover:bg-swatch disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Next →
        </button>
      </div>
      <p className="mt-2 text-center text-xs text-muted">
        Outfit {index + 1} of {list.length} · swipe or use the arrows
      </p>
    </div>
  );
}
