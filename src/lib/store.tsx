"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import type { Item, Mood } from "@/types";
import { seedItems } from "./seed";
import { ensureUser, isBackendEnabled } from "./supabase";
import * as repo from "./wardrobeRepo";

// With Supabase configured, items persist per (anonymous) user and a new user
// starts empty. Without it the wardrobe is in-memory and filled with sample
// items on every load (demo + e2e mode).

type Status = "loading" | "ready" | "error";

interface State {
  items: Item[];
  mood: Mood;
  status: Status;
  error: string | null;
}

type Action =
  | { type: "loaded"; items: Item[] }
  | { type: "failed"; error: string }
  | { type: "loading" }
  | { type: "add"; item: Item }
  | { type: "remove"; id: string }
  | { type: "update"; id: string; patch: Partial<Item> }
  | { type: "setMood"; mood: Mood }
  | { type: "reset" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "loading":
      return { ...state, status: "loading", error: null };
    case "loaded":
      return { ...state, items: action.items, status: "ready", error: null };
    case "failed":
      return { ...state, status: "error", error: action.error };
    case "add":
      return { ...state, items: [action.item, ...state.items] };
    case "remove": {
      const removed = state.items.find((it) => it.id === action.id);
      // Free uploaded object URLs so we don't leak memory during a session.
      if (removed?.imageUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(removed.imageUrl);
      }
      return { ...state, items: state.items.filter((it) => it.id !== action.id) };
    }
    case "update":
      return {
        ...state,
        items: state.items.map((it) =>
          it.id === action.id ? { ...it, ...action.patch } : it,
        ),
      };
    case "setMood":
      return { ...state, mood: action.mood };
    case "reset":
      return { ...state, items: seedItems(), mood: "relaxed" };
    default:
      return state;
  }
}

function init(): State {
  return isBackendEnabled
    ? { items: [], mood: "relaxed", status: "loading", error: null }
    : { items: seedItems(), mood: "relaxed", status: "ready", error: null };
}

function message(err: unknown): string {
  return err instanceof Error ? err.message : "Something went wrong";
}

interface WardrobeContextValue {
  items: Item[];
  ownedItems: Item[];
  mood: Mood;
  status: Status;
  error: string | null;
  /** True when items are saved to the backend (vs. this session only). */
  persistent: boolean;
  /** Saves the item (uploading `photo` when the backend is on). Throws on failure. */
  addItem: (item: Item, photo?: Blob, dedupeKey?: string) => Promise<void>;
  removeItem: (id: string) => void;
  updateItem: (id: string, patch: Partial<Item>) => void;
  setMood: (mood: Mood) => void;
  resetToSeed: () => void;
  reload: () => void;
}

const WardrobeContext = createContext<WardrobeContextValue | null>(null);

export function WardrobeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, init);
  const itemsRef = useRef(state.items);
  useEffect(() => {
    itemsRef.current = state.items;
  }, [state.items]);

  const load = useCallback(async () => {
    try {
      await ensureUser();
      dispatch({ type: "loaded", items: await repo.loadItems() });
    } catch (err) {
      console.error("Failed to load wardrobe", err);
      dispatch({ type: "failed", error: message(err) });
    }
  }, []);

  // Guard against StrictMode's double effect, which would otherwise create
  // two anonymous users for a brand-new visitor.
  const started = useRef(false);
  useEffect(() => {
    if (!isBackendEnabled || started.current) return;
    started.current = true;
    void load();
  }, [load]);

  const value: WardrobeContextValue = {
    items: state.items,
    ownedItems: state.items.filter((it) => it.owned),
    mood: state.mood,
    status: state.status,
    error: state.error,
    persistent: isBackendEnabled,
    addItem: async (item, photo, dedupeKey) => {
      const saved = isBackendEnabled ? await repo.createItem(item, photo, dedupeKey) : item;
      dispatch({ type: "add", item: saved });
    },
    removeItem: (id) => {
      const item = itemsRef.current.find((it) => it.id === id);
      dispatch({ type: "remove", id });
      if (isBackendEnabled && item) {
        repo.deleteItem(item).catch((err) => {
          console.error("Failed to delete item", err);
          dispatch({ type: "add", item });
        });
      }
    },
    updateItem: (id, patch) => {
      dispatch({ type: "update", id, patch });
      if (isBackendEnabled) {
        repo.patchItem(id, patch).catch((err) => console.error("Failed to update item", err));
      }
    },
    setMood: (mood) => dispatch({ type: "setMood", mood }),
    resetToSeed: () => dispatch({ type: "reset" }),
    reload: () => {
      dispatch({ type: "loading" });
      void load();
    },
  };

  return (
    <WardrobeContext.Provider value={value}>
      {children}
    </WardrobeContext.Provider>
  );
}

export function useWardrobe(): WardrobeContextValue {
  const ctx = useContext(WardrobeContext);
  if (!ctx) {
    throw new Error("useWardrobe must be used within a WardrobeProvider");
  }
  return ctx;
}
