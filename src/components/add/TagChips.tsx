"use client";

import { useState } from "react";
import {
  CATEGORIES,
  FORMALITIES,
  SEASONS,
  type Category,
  type Formality,
  type ItemTags,
  type Season,
} from "@/types";
import { cx, titleCase } from "@/lib/utils";

interface Props {
  tags: ItemTags;
  onChange: (next: ItemTags) => void;
}

const PATTERNS = ["solid", "striped", "plaid", "floral", "print"];

export default function TagChips({ tags, onChange }: Props) {
  const [colorDraft, setColorDraft] = useState("");

  const addColor = () => {
    const c = colorDraft.trim().toLowerCase();
    if (c && !tags.colors.includes(c)) {
      onChange({ ...tags, colors: [...tags.colors, c] });
    }
    setColorDraft("");
  };

  const removeColor = (c: string) =>
    onChange({ ...tags, colors: tags.colors.filter((x) => x !== c) });

  const toggleSeason = (s: Season) =>
    onChange({
      ...tags,
      season: tags.season.includes(s)
        ? tags.season.filter((x) => x !== s)
        : [...tags.season, s],
    });

  return (
    <div className="space-y-5 rounded-3xl border border-line bg-surface p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-accent">
        AI tags · edit anything
      </p>

      <Field label="Category">
        <select
          value={tags.category}
          onChange={(e) => onChange({ ...tags, category: e.target.value as Category })}
          className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {titleCase(c)}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Colors">
        <div className="flex flex-wrap items-center gap-2">
          {tags.colors.map((c) => (
            <span
              key={c}
              className="inline-flex items-center gap-1 rounded-full bg-swatch px-3 py-1 text-sm"
            >
              {titleCase(c)}
              <button
                type="button"
                aria-label={`Remove ${c}`}
                onClick={() => removeColor(c)}
                className="text-muted hover:text-ink"
              >
                ×
              </button>
            </span>
          ))}
          <input
            value={colorDraft}
            onChange={(e) => setColorDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addColor())}
            placeholder="add color"
            className="w-24 rounded-full border border-line bg-surface px-3 py-1 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          />
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Pattern">
          <select
            value={tags.pattern}
            onChange={(e) => onChange({ ...tags, pattern: e.target.value })}
            className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {PATTERNS.map((p) => (
              <option key={p} value={p}>
                {titleCase(p)}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Formality">
          <select
            value={tags.formality}
            onChange={(e) => onChange({ ...tags, formality: e.target.value as Formality })}
            className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {FORMALITIES.map((f) => (
              <option key={f} value={f}>
                {titleCase(f)}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Season">
        <div className="flex flex-wrap gap-2">
          {SEASONS.map((s) => {
            const on = tags.season.includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggleSeason(s)}
                aria-pressed={on}
                className={cx(
                  "rounded-full border px-3 py-1 text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                  on ? "border-accent bg-accent text-accent-foreground" : "border-line",
                )}
              >
                {titleCase(s)}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="Fabric (optional)">
        <input
          value={tags.fabric ?? ""}
          onChange={(e) => onChange({ ...tags, fabric: e.target.value || null })}
          placeholder="e.g. cotton"
          className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        />
      </Field>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
