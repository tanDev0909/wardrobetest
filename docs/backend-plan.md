# Backend plan — low-cost

Goal: persist the wardrobe and photos, extract garments from photos, and keep
running costs at ~$0 on free tiers.

## Stack

| Piece | Service | Free limit |
|---|---|---|
| App + server routes | Vercel (Hobby) | preview deploy on every push |
| Database | Supabase Postgres | 500 MB |
| Image storage | Supabase Storage (`wardrobe` bucket) | 1 GB, 5 GB egress/mo |
| Users | Supabase anonymous sign-in, upgradeable to email later | 50k MAU |
| Garment extraction | `Xenova/segformer_b2_clothes` via transformers.js, **in the browser** | $0 |
| Extra tags (pattern/formality/season) | Gemini Flash-Lite free tier via `/api/tag` (optional) | rate-limited |

Supabase free projects pause after 7 days idle → `vercel.json` cron pings
`/api/health` daily.

## Architecture

```
Browser
 ├─ supabase-js (anon key) ── Postgres `items` (RLS: own rows only)
 │                         └─ Storage `wardrobe/<user_id>/…` (RLS: own folder)
 ├─ transformers.js SegFormer → garment cut-outs + category (local, free)
 └─ fetch /api/tag ──► Vercel route (GEMINI_API_KEY, server-only) ──► Gemini
```

The browser does the work. Server routes exist only where a secret key is needed.
Without Supabase env vars the app runs in its original in-memory mode.

## Phases

- [x] **0. Scaffolding** — `@supabase/supabase-js`, `src/lib/supabase.ts`,
      `supabase/migrations/0001_init.sql`, `/api/health`, `vercel.json`, `.env.example`
- [x] **0b. Accounts (owner)** — GitHub repo, Supabase project + run migration,
      enable anonymous sign-ins, Vercel project + env vars, Gemini key
- [x] **1. Persistence** — `store.tsx` loads/saves via Supabase (fallback: in-memory);
      `/add` resizes to ~1200px WebP, hashes, uploads to Storage, inserts row
- [ ] **2. Ingest** — `scripts/ingest.ts`: folder of images + CSV/JSON → Storage + rows
      (real data only; `seed.ts` is demo/e2e-only and never written to the DB)
- [x] **3. In-browser extraction** — `extractItems(file)` in `aiService.ts` using
      SegFormer; review screen "Found N items"; colours from mask pixels
- [ ] **4. Optional AI tags** — `/api/tag` with Gemini Flash-Lite on a 512px thumbnail;
      falls back to manual chips when quota is exhausted
- [ ] **Later** — optional "Enhance" product shot (Gemini Image, rate-limited),
      real try-on, R2 if storage > 1 GB

## Cost expectations

| Usage | Monthly |
|---|---|
| Personal / prototype | $0 |
| Hundreds of users | $0 until ~1 GB of images (~5k cut-outs) |
| Beyond | Cloudflare R2 (10 GB free) or Supabase Pro ($25) |
