-- Ashi's Wardrobe — initial schema.
-- Run once in the Supabase dashboard (SQL Editor → paste → Run), or `supabase db push`.
--
-- Security model: the browser talks to Supabase directly with the anon key.
-- Row Level Security limits every user (including anonymous sign-ins) to their
-- own rows and their own `<user_id>/...` folder in the storage bucket.

-- ---------------------------------------------------------------------------
-- items: mirrors the `Item` type in src/types/index.ts
-- ---------------------------------------------------------------------------
create table if not exists public.items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null,
  -- Storage path inside the `wardrobe` bucket, e.g. "<user_id>/<uuid>.webp".
  -- Null = no photo (UI draws a GarmentSwatch). External seed URLs go in image_url.
  image_path  text,
  image_url   text,
  -- SHA-256 of the original upload, so the same photo is never processed twice.
  image_hash  text,
  category    text not null check (category in ('top','bottom','outerwear','footwear','accessory','dress')),
  colors      text[] not null default '{}',
  pattern     text not null default 'solid',
  fabric      text,
  formality   text not null default 'casual' check (formality in ('casual','smart-casual','formal')),
  season      text[] not null default '{}',
  owned       boolean not null default true,
  created_at  timestamptz not null default now()
);

create index if not exists items_user_created_idx on public.items (user_id, created_at desc);
create unique index if not exists items_user_hash_idx on public.items (user_id, image_hash) where image_hash is not null;

alter table public.items enable row level security;

create policy "items: read own"   on public.items for select to authenticated using (user_id = auth.uid());
create policy "items: insert own" on public.items for insert to authenticated with check (user_id = auth.uid());
create policy "items: update own" on public.items for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "items: delete own" on public.items for delete to authenticated using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Storage: one public-read bucket for garment cut-outs.
-- Paths are "<user_id>/<random uuid>.webp" — unguessable, but treat as public.
-- Selfies for try-on are NOT uploaded; they stay in the browser.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('wardrobe', 'wardrobe', true, 2097152, array['image/webp','image/png','image/jpeg'])
on conflict (id) do nothing;

create policy "wardrobe: read own folder" on storage.objects for select to authenticated
  using (bucket_id = 'wardrobe' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "wardrobe: upload to own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'wardrobe' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "wardrobe: update own folder" on storage.objects for update to authenticated
  using (bucket_id = 'wardrobe' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "wardrobe: delete own folder" on storage.objects for delete to authenticated
  using (bucket_id = 'wardrobe' and (storage.foldername(name))[1] = auth.uid()::text);
