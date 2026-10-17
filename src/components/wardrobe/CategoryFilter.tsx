"use client";

import { CATEGORIES, FORMALITIES, type Category, type Formality } from "@/types";
import { cx, titleCase } from "@/lib/utils";

export interface Filters {
  category: Category | "all";
  color: string;
  formality: Formality | "all";
}

interface Props {
  filters: Filters;
  colors: string[];
  onChange: (next: Filters) => void;
}

export default function CategoryFilter({ filters, colors, onChange }: Props) {
  const chips: Array<Category | "all"> = ["all", ...CATEGORIES];

  return (
    <div className="space-y-3">
      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {chips.map((c) => {
          const active = filters.category === c;
          return (
            <button
              key={c}
              type="button"
              onClick={() => onChange({ ...filters, category: c })}
              aria-pressed={active}
              className={cx(
                "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                active
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-line bg-surface text-ink hover:bg-swatch",
              )}
            >
              {c === "all" ? "All" : titleCase(c)}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <label className="flex items-center gap-1.5 text-xs text-muted">
          Color
          <select
            value={filters.color}
            onChange={(e) => onChange({ ...filters, color: e.target.value })}
            className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <option value="all">All</option>
            {colors.map((c) => (
              <option key={c} value={c}>
                {titleCase(c)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-1.5 text-xs text-muted">
          Formality
          <select
            value={filters.formality}
            onChange={(e) =>
              onChange({ ...filters, formality: e.target.value as Formality | "all" })
            }
            className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <option value="all">All</option>
            {FORMALITIES.map((f) => (
              <option key={f} value={f}>
                {titleCase(f)}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
