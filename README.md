# Ashi's Wardrobe — Wardrobe Organizer

A **frontend-only** Next.js (App Router) PWA: a visual digital wardrobe that uses
*mocked* AI to suggest weather- and mood-aware outfits built from clothes you
already own. Built to prove the experience before wiring real AI or a backend.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run build    # production build
npm run lint     # eslint
```

## What it does

- **Wardrobe** (`/`) — a visual grid seeded with ~21 items, filterable by
  category, color, and formality.
- **Add** (`/add`) — upload a photo, watch the (faked) AI tag it, edit the tags,
  save. Items live for the session.
- **Today** (`/today`) — real local weather (Open-Meteo) + a mood pick → a
  swipeable outfit suggestion with a "why this works" blurb. Tap **✨ Elevate
  this look with AI** to have the AI swap in dressier pieces + a statement accent.
- **Inspo** (`/inspo`) — **✨ Generate styles with AI** builds complete looks
  from the pieces you own; or pick any item to get combos around it (plus
  "inspiration" pieces with a **Find it** image-search link).
- **Try on** (`/tryon`) — upload a photo of yourself, pick an AI-styled look, and
  see it composited onto you (simulated virtual try-on).

## Images

All item images are **real product photos** (no models/lifestyle shots), sourced
from free product catalogs: DummyJSON (tops, dresses, shoes, watches, sunglasses,
bags), FakeStoreAPI (outerwear), and the Platzi store (bottoms). If any image URL
fails to load, `ItemImage` falls back to a drawn garment swatch.

## Architecture (deliberate constraints)

- **No backend, no database.** State is in-memory (`src/lib/store.tsx`,
  React Context + reducer) and **resets on refresh by design**. The wardrobe is
  re-seeded on every load so it always looks full.
- **Mocked AI behind one module.** All "AI" lives in `src/lib/aiService.ts`:
  - `tagItem(file)` — pretend vision tagging
  - `suggestOutfits(items, { weather, mood })` — daily suggestions
  - `styleAround(base, items)` — combos around a chosen piece
  - `generateStyles(items)` — full looks from your own wardrobe
  - `elevateOutfit(outfit, items)` — dress a look up a notch
  - `visualizeOnUser(photoUrl, outfit)` — virtual try-on (simulated; a real
    version would call a try-on model like FASHN or Replicate IDM-VTON)

  Each returns believable dummy data after a deliberate delay so it *feels* like
  real inference. Swap the bodies for real API calls later — the UI never changes.
- **Real weather.** `src/lib/weather.ts` calls Open-Meteo (no API key) and
  degrades gracefully to a manual override if geolocation is denied.
- **Item photos** are pulled by keyword from the internet (loremflickr) and fall
  back to a drawn garment swatch (`GarmentSwatch`) if an image fails to load.

## Swapping in real AI later (zero UI changes)

The UI only knows the three function names in `aiService.ts`. To go live, replace
their bodies with calls to a vision/LLM provider (e.g. Claude or GPT-4 vision)
that return the same shapes (`ItemTags`, `Outfit[]`). Nothing in the components
needs to change.

```ts
// src/lib/aiService.ts
export async function suggestOutfits(items, { weather, mood }) {
  // before: return dummyOutfits(...)
  // after:  const res = await fetch("/api/suggest", { ... }); return res.json();
}
```

## Project layout

```
src/
├── app/            # routes: / (wardrobe), /add, /today, /inspo
├── components/     # nav, wardrobe, outfit, add, common
├── lib/            # store, aiService (mock), weather, seed, utils
└── types/          # domain types
```

## Out of scope (v1)

Marketplace scraping, real AI keys, cross-refresh persistence, auth, payments,
native mobile, and a social feed.
