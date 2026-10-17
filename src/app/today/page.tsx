"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useWardrobe } from "@/lib/store";
import { getWeather } from "@/lib/weather";
import { suggestOutfits } from "@/lib/aiService";
import { MOODS, type Mood, type Outfit, type Weather } from "@/types";
import { cx, titleCase } from "@/lib/utils";
import SwipeableOutfitDeck from "@/components/outfit/SwipeableOutfitDeck";
import EmptyState from "@/components/common/EmptyState";
import Skeleton from "@/components/common/Skeleton";
import Button from "@/components/common/Button";

const CONDITIONS = ["sunny", "cloudy", "rainy", "snowy", "cold", "mild"];

export default function TodayPage() {
  const { ownedItems, mood, setMood } = useWardrobe();
  const [weather, setWeather] = useState<Weather | null>(null);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real weather once on mount.
  useEffect(() => {
    let active = true;
    getWeather().then((w) => active && setWeather(w));
    return () => {
      active = false;
    };
  }, []);

  const regenerate = useCallback(
    async (w: Weather, m: Mood) => {
      setLoading(true);
      const result = await suggestOutfits(ownedItems, { weather: w, mood: m });
      setOutfits(result);
      setLoading(false);
    },
    [ownedItems],
  );

  // Re-suggest whenever weather or mood changes.
  useEffect(() => {
    if (weather) regenerate(weather, mood);
  }, [weather, mood, regenerate]);

  const enoughItems = ownedItems.length >= 2;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Today</h1>
        <p className="mt-1 text-sm text-muted">
          A look picked for your weather and mood.
        </p>
      </header>

      {weather && (
        <WeatherStrip weather={weather} onOverride={(c) => setWeather({ ...weather, condition: c })} />
      )}

      <section aria-label="Mood">
        <p className="mb-2 text-sm font-medium">How do you feel today?</p>
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
          {MOODS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMood(m)}
              aria-pressed={mood === m}
              className={cx(
                "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                mood === m
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-line bg-surface text-ink hover:bg-swatch",
              )}
            >
              {titleCase(m)}
            </button>
          ))}
        </div>
      </section>

      {!enoughItems ? (
        <EmptyState
          title="Add a few more pieces"
          description="We need at least a couple of items to build a full outfit. Add some and come back."
          action={
            <Link href="/add">
              <Button>Add pieces</Button>
            </Link>
          }
        />
      ) : loading ? (
        <DeckSkeleton />
      ) : outfits.length === 0 ? (
        <EmptyState
          title="Couldn't build a full look"
          description="Try a different mood, or add more variety to your wardrobe (a top, a bottom and some shoes)."
        />
      ) : (
        <SwipeableOutfitDeck outfits={outfits} items={ownedItems} allowElevate />
      )}
    </div>
  );
}

function WeatherStrip({
  weather,
  onOverride,
}: {
  weather: Weather;
  onOverride: (condition: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-lg font-semibold">
            {weather.tempC}°C · {titleCase(weather.condition)}
          </p>
          <p className="text-xs text-muted">
            {weather.isFallback ? "Using a default — set it manually" : "Your local weather"}
          </p>
        </div>
        {weather.isFallback && (
          <label className="flex items-center gap-1.5 text-xs text-muted">
            Weather
            <select
              value={weather.condition}
              onChange={(e) => onOverride(e.target.value)}
              className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>
                  {titleCase(c)}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      {weather.isFallback && (
        <p className="mt-2 rounded-lg bg-swatch px-3 py-2 text-xs text-muted">
          We couldn&apos;t get your location, so we&apos;re using mild weather. Pick the
          real conditions above for a better suggestion.
        </p>
      )}
    </div>
  );
}

function DeckSkeleton() {
  return (
    <div className="rounded-3xl border border-line bg-surface p-5">
      <Skeleton className="h-6 w-28" />
      <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square w-full" />
        ))}
      </div>
      <Skeleton className="mt-4 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-2/3" />
    </div>
  );
}
