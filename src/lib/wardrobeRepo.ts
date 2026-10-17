// Persistence for wardrobe items (Supabase Postgres + Storage). Only used when
// the backend is enabled; the store falls back to in-memory state otherwise.

import type { Item } from "@/types";
import { publicImageUrl, STORAGE_BUCKET, supabase } from "./supabase";
import { sha256, toWebp } from "./image";

interface ItemRow {
  id: string;
  name: string;
  image_path: string | null;
  image_url: string | null;
  image_hash: string | null;
  category: Item["category"];
  colors: string[];
  pattern: string;
  fabric: string | null;
  formality: Item["formality"];
  season: Item["season"];
  owned: boolean;
  created_at: string;
}

function db() {
  if (!supabase) throw new Error("Backend is not configured");
  return supabase;
}

function fromRow(r: ItemRow): Item {
  return {
    id: r.id,
    name: r.name,
    imageUrl: r.image_path ? publicImageUrl(r.image_path) : r.image_url ?? undefined,
    imagePath: r.image_path ?? undefined,
    category: r.category,
    colors: r.colors,
    pattern: r.pattern,
    fabric: r.fabric,
    formality: r.formality,
    season: r.season,
    owned: r.owned,
    createdAt: new Date(r.created_at).getTime(),
  };
}

function toRow(item: Item) {
  return {
    name: item.name,
    category: item.category,
    colors: item.colors,
    pattern: item.pattern,
    fabric: item.fabric,
    formality: item.formality,
    season: item.season,
    owned: item.owned,
  };
}

/** Load the user's wardrobe. New users start empty (no starter items). */
export async function loadItems(): Promise<Item[]> {
  const { data, error } = await db()
    .from("items")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as ItemRow[]).map(fromRow);
}

export class DuplicatePhotoError extends Error {
  constructor() {
    super("That photo is already in your wardrobe.");
  }
}

/** Upload the (resized) photo if given, then insert the row. */
export async function createItem(item: Item, photo?: File): Promise<Item> {
  const sb = db();
  let imagePath: string | null = null;
  let imageHash: string | null = null;

  if (photo) {
    imageHash = await sha256(photo);
    const { data: existing } = await sb
      .from("items")
      .select("id")
      .eq("image_hash", imageHash)
      .maybeSingle();
    if (existing) throw new DuplicatePhotoError();

    const { data: auth } = await sb.auth.getUser();
    imagePath = `${auth.user!.id}/${crypto.randomUUID()}.webp`;
    const { error: uploadError } = await sb.storage
      .from(STORAGE_BUCKET)
      .upload(imagePath, await toWebp(photo), { contentType: "image/webp" });
    if (uploadError) throw uploadError;
  }

  const { data, error } = await sb
    .from("items")
    .insert({
      id: item.id,
      ...toRow(item),
      image_path: imagePath,
      image_url: imagePath ? null : item.imageUrl?.startsWith("blob:") ? null : item.imageUrl ?? null,
      image_hash: imageHash,
    })
    .select("*")
    .single();
  if (error) {
    if (imagePath) await sb.storage.from(STORAGE_BUCKET).remove([imagePath]);
    throw error;
  }
  return fromRow(data as ItemRow);
}

export async function patchItem(id: string, patch: Partial<Item>): Promise<void> {
  // Only editable tag fields are written; image/id/timestamps are server-owned.
  const editable = ["name", "category", "colors", "pattern", "fabric", "formality", "season", "owned"] as const;
  const fields = Object.fromEntries(
    editable.filter((k) => k in patch).map((k) => [k, patch[k]]),
  );
  const { error } = await db().from("items").update(fields).eq("id", id);
  if (error) throw error;
}

export async function deleteItem(item: Item): Promise<void> {
  const sb = db();
  const { error } = await sb.from("items").delete().eq("id", item.id);
  if (error) throw error;
  if (item.imagePath) await sb.storage.from(STORAGE_BUCKET).remove([item.imagePath]);
}
