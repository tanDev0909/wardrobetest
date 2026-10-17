"use client";

import type { Item } from "@/types";
import { cx, findItUrl, titleCase } from "@/lib/utils";
import ItemImage from "./ItemImage";

interface Props {
  item: Item;
  onRemove?: (id: string) => void;
  onClick?: (item: Item) => void;
  selected?: boolean;
  /** Show a "Find it" link for inspiration (not-owned) pieces. */
  showFindIt?: boolean;
  compact?: boolean;
}

export default function ItemCard({
  item,
  onRemove,
  onClick,
  selected,
  showFindIt,
  compact,
}: Props) {
  const interactive = Boolean(onClick);

  const media = (
    <ItemImage item={item} className="h-full w-full object-cover" />
  );

  return (
    <div
      className={cx(
        "group relative overflow-hidden rounded-2xl border bg-surface transition",
        selected ? "border-accent ring-2 ring-accent" : "border-line",
      )}
    >
      {interactive ? (
        <button
          type="button"
          onClick={() => onClick?.(item)}
          aria-pressed={selected}
          className="block w-full text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <div className="aspect-square w-full">{media}</div>
        </button>
      ) : (
        <div className="aspect-square w-full">{media}</div>
      )}

      <div className={cx("p-3", compact && "p-2")}>
        <p className="truncate text-sm font-medium">{item.name}</p>
        {!compact && (
          <p className="mt-0.5 truncate text-xs text-muted">
            {titleCase(item.category)} · {titleCase(item.formality)}
          </p>
        )}
        {!item.owned && (
          <span className="mt-1 inline-block rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-accent">
            Inspiration
          </span>
        )}
        {showFindIt && !item.owned && (
          <a
            href={findItUrl(item.name)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Find it →
          </a>
        )}
      </div>

      {onRemove && (
        <button
          type="button"
          aria-label={`Remove ${item.name}`}
          onClick={() => onRemove(item.id)}
          className="absolute right-2 top-2 rounded-full bg-surface/90 p-1.5 text-muted opacity-0 shadow-sm transition group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
