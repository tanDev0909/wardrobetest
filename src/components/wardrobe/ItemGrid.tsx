"use client";

import type { Item } from "@/types";
import ItemCard from "./ItemCard";

interface Props {
  items: Item[];
  onRemove?: (id: string) => void;
}

export default function ItemGrid({ items, onRemove }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <ItemCard key={item.id} item={item} onRemove={onRemove} />
      ))}
    </div>
  );
}
