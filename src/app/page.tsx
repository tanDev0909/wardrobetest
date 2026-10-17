"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useWardrobe } from "@/lib/store";
import ItemGrid from "@/components/wardrobe/ItemGrid";
import CategoryFilter, { type Filters } from "@/components/wardrobe/CategoryFilter";
import EmptyState from "@/components/common/EmptyState";
import Button from "@/components/common/Button";

export default function WardrobePage() {
  const { ownedItems, removeItem } = useWardrobe();
  const [filters, setFilters] = useState<Filters>({
    category: "all",
    color: "all",
    formality: "all",
  });

  const colors = useMemo(
    () => Array.from(new Set(ownedItems.flatMap((i) => i.colors))).sort(),
    [ownedItems],
  );

  const filtered = useMemo(
    () =>
      ownedItems.filter((it) => {
        if (filters.category !== "all" && it.category !== filters.category) return false;
        if (filters.color !== "all" && !it.colors.includes(filters.color)) return false;
        if (filters.formality !== "all" && it.formality !== filters.formality) return false;
        return true;
      }),
    [ownedItems, filters],
  );

  if (ownedItems.length === 0) {
    return (
      <div className="space-y-6">
        <Header count={0} />
        <EmptyState
          title="Your wardrobe is empty"
          description="Add your first piece and the AI will start styling outfits around it."
          action={
            <Link href="/add">
              <Button>Add your first piece</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header count={ownedItems.length} />
      <CategoryFilter filters={filters} colors={colors} onChange={setFilters} />
      {filtered.length === 0 ? (
        <EmptyState
          title="No matches"
          description="Nothing in your wardrobe fits these filters. Try widening them."
          action={
            <Button
              variant="outline"
              onClick={() => setFilters({ category: "all", color: "all", formality: "all" })}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <ItemGrid items={filtered} onRemove={removeItem} />
      )}
    </div>
  );
}

function Header({ count }: { count: number }) {
  return (
    <header className="flex items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Your wardrobe</h1>
        <p className="mt-1 text-sm text-muted">
          {count} {count === 1 ? "piece" : "pieces"} · everything you own, in one place
        </p>
      </div>
      <Link href="/add" className="hidden md:block">
        <Button>+ Add piece</Button>
      </Link>
    </header>
  );
}
