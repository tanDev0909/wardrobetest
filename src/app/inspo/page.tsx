"use client";

import { useState } from "react";
import Link from "next/link";
import { useWardrobe } from "@/lib/store";
import { generateStyles, styleAround } from "@/lib/aiService";
import type { Item, Outfit } from "@/types";
import ItemCard from "@/components/wardrobe/ItemCard";
import OutfitCard from "@/components/outfit/OutfitCard";
import EmptyState from "@/components/common/EmptyState";
import Skeleton from "@/components/common/Skeleton";
import Button from "@/components/common/Button";

export default function InspoPage() {
  const { ownedItems } = useWardrobe();
  const [base, setBase] = useState<Item | null>(null);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(false);

  // AI-generated styles from the whole wardrobe (no base item needed).
  const [aiStyles, setAiStyles] = useState<Outfit[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  const generate = async () => {
    setAiLoading(true);
    setAiStyles([]);
    const result = await generateStyles(ownedItems);
    setAiStyles(result);
    setAiLoading(false);
  };

  const select = async (item: Item) => {
    setBase(item);
    setLoading(true);
    setOutfits([]);
    const result = await styleAround(item, ownedItems);
    setOutfits(result);
    setLoading(false);
  };

  if (ownedItems.length === 0) {
    return (
      <div className="space-y-6">
        <Header />
        <EmptyState
          title="Nothing to style yet"
          description="Add a few pieces and the AI will build looks around any of them."
          action={
            <Link href="/add">
              <Button>Add pieces</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header />

      <section
        aria-label="AI styles"
        className="rounded-3xl border border-line bg-surface p-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Generate styles with AI</h2>
            <p className="text-sm text-muted">
              Let AI build complete looks from the pieces you already own.
            </p>
          </div>
          <Button onClick={generate} disabled={aiLoading}>
            {aiLoading ? "Generating…" : "✨ Generate styles"}
          </Button>
        </div>

        {aiLoading && (
          <div className="mt-4 space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-52 w-full rounded-3xl" />
            ))}
          </div>
        )}

        {!aiLoading && aiStyles.length > 0 && (
          <div className="mt-4 space-y-4">
            {aiStyles.map((o) => (
              <OutfitCard key={o.id} outfit={o} />
            ))}
          </div>
        )}
      </section>

      <section aria-label="Pick a piece">
        <p className="mb-2 text-sm font-medium">
          Pick a piece and I&apos;ll build looks around it
        </p>
        <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
          {ownedItems.map((item) => (
            <div key={item.id} className="w-28 shrink-0">
              <ItemCard
                item={item}
                onClick={select}
                selected={base?.id === item.id}
                compact
              />
            </div>
          ))}
        </div>
      </section>

      {!base ? (
        <EmptyState
          title="Style around anything"
          description="Tap an item above — say your red top — and I'll suggest combos from your wardrobe plus a few fresh ideas to hunt for."
        />
      ) : loading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full rounded-3xl" />
          ))}
          <p className="text-center text-xs text-muted">Styling looks around your {base.name.toLowerCase()}…</p>
        </div>
      ) : outfits.length === 0 ? (
        <EmptyState
          title="Not enough to pair with this yet"
          description="Try adding more pieces in other categories so I can complete the look."
        />
      ) : (
        <section className="space-y-4">
          <h2 className="text-sm font-medium text-muted">
            {outfits.length} looks built around your {base.name.toLowerCase()}
          </h2>
          {outfits.map((o) => (
            <OutfitCard key={o.id} outfit={o} />
          ))}
        </section>
      )}
    </div>
  );
}

function Header() {
  return (
    <header>
      <h1 className="text-2xl font-semibold tracking-tight">Inspo</h1>
      <p className="mt-1 text-sm text-muted">
        See what pairs with any piece — from your wardrobe and beyond.
      </p>
    </header>
  );
}
