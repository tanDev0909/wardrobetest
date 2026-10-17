"use client";

import { useEffect, useState } from "react";

// Presentational only — the real timing comes from aiService.tagItem(). This
// just animates a few reassuring steps so the "AI is looking at your photo"
// moment feels alive rather than like an instant lookup.
const STEPS = [
  "Looking at your photo…",
  "Detecting colors & pattern…",
  "Guessing category & formality…",
];

export default function TaggingProgress({ previewUrl }: { previewUrl?: string }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    }, 450);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center gap-5 rounded-3xl border border-line bg-surface px-6 py-12 text-center">
      {previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewUrl}
          alt="Item being tagged"
          className="h-28 w-28 rounded-2xl object-cover"
        />
      ) : (
        <div className="h-28 w-28 animate-pulse rounded-2xl bg-swatch" />
      )}
      <div className="flex items-center gap-2 text-sm font-medium text-accent">
        <span className="h-2 w-2 animate-ping rounded-full bg-accent" />
        {STEPS[step]}
      </div>
      <ul className="w-full max-w-xs space-y-1.5 text-left">
        {STEPS.map((s, i) => (
          <li
            key={s}
            className={
              i <= step ? "text-xs text-ink" : "text-xs text-muted/50"
            }
          >
            {i < step ? "✓ " : "• "}
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}
