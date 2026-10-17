"use client";

import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
} from "react";
import type { Item, Mood } from "@/types";
import { seedItems } from "./seed";

interface State {
  items: Item[];
  mood: Mood;
}

type Action =
  | { type: "add"; item: Item }
  | { type: "remove"; id: string }
  | { type: "update"; id: string; patch: Partial<Item> }
  | { type: "setMood"; mood: Mood }
  | { type: "reset" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
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
      return { items: seedItems(), mood: "relaxed" };
    default:
      return state;
  }
}

function init(): State {
  return { items: seedItems(), mood: "relaxed" };
}

interface WardrobeContextValue {
  items: Item[];
  ownedItems: Item[];
  mood: Mood;
  addItem: (item: Item) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, patch: Partial<Item>) => void;
  setMood: (mood: Mood) => void;
  resetToSeed: () => void;
}

const WardrobeContext = createContext<WardrobeContextValue | null>(null);

export function WardrobeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, init);

  const value: WardrobeContextValue = {
    items: state.items,
    ownedItems: state.items.filter((it) => it.owned),
    mood: state.mood,
    addItem: (item) => dispatch({ type: "add", item }),
    removeItem: (id) => dispatch({ type: "remove", id }),
    updateItem: (id, patch) => dispatch({ type: "update", id, patch }),
    setMood: (mood) => dispatch({ type: "setMood", mood }),
    resetToSeed: () => dispatch({ type: "reset" }),
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
