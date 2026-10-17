"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useWardrobe } from "@/lib/store";
import { generateStyles, visualizeOnUser } from "@/lib/aiService";
import type { Outfit } from "@/types";
import ItemImage from "@/components/wardrobe/ItemImage";
import TryOnPreview from "@/components/tryon/TryOnPreview";
import EmptyState from "@/components/common/EmptyState";
import Skeleton from "@/components/common/Skeleton";
import Button from "@/components/common/Button";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export default function TryOnPage() {
  const { ownedItems } = useWardrobe();
  const inputRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<string | null>(null);

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [styles, setStyles] = useState<Outfit[]>([]);
  const [stylesLoading, setStylesLoading] = useState(false);
  const [preview, setPreview] = useState<Outfit | null>(null);
  const [rendering, setRendering] = useState(false);

  const loadStyles = async () => {
    setStylesLoading(true);
    const result = await generateStyles(ownedItems);
    setStyles(result);
    setStylesLoading(false);
  };

  const handleFile = async (file?: File) => {
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      setError("Please upload a photo (JPG, PNG or WEBP).");
      return;
    }
    setError(null);
    if (photoRef.current?.startsWith("blob:")) URL.revokeObjectURL(photoRef.current);
    const url = URL.createObjectURL(file);
    photoRef.current = url;
    setPhotoUrl(url);
    setPreview(null);
    loadStyles();
  };

  const tryLook = async (outfit: Outfit) => {
    if (!photoUrl) return;
    setRendering(true);
    setPreview(null);
    const res = await visualizeOnUser(photoUrl, outfit);
    setPreview(res.outfit);
    setRendering(false);
  };

  const changePhoto = () => {
    setPhotoUrl(null);
    setPreview(null);
    setStyles([]);
  };

  if (ownedItems.length === 0) {
    return (
      <div className="space-y-6">
        <Header />
        <EmptyState
          title="Add some clothes first"
          description="Once your wardrobe has a few pieces, you can try complete looks on your own photo."
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

      {!photoUrl && (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-line bg-surface px-6 py-16 text-center transition hover:bg-swatch focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-accent" aria-hidden="true">
              <circle cx="12" cy="8" r="3.5" />
              <path d="M4 21v-1a8 8 0 0 1 16 0v1" />
            </svg>
            <span className="text-sm font-medium">Upload a photo of yourself</span>
            <span className="text-xs text-muted">
              Full-body works best. Stays on your device — nothing is uploaded to a server.
            </span>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          {error && (
            <p role="alert" className="text-sm font-medium text-accent">
              {error}
            </p>
          )}
        </div>
      )}

      {photoUrl && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left: the preview / your photo */}
          <div className="space-y-3">
            {rendering ? (
              <div className="space-y-3">
                <Skeleton className="mx-auto h-[60vh] w-full max-w-sm rounded-3xl" />
                <p className="text-center text-xs text-muted">Rendering the look on you…</p>
              </div>
            ) : preview ? (
              <TryOnPreview photoUrl={photoUrl} outfit={preview} />
            ) : (
              <div className="mx-auto w-full max-w-sm overflow-hidden rounded-3xl border border-line bg-swatch">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoUrl} alt="You" className="block max-h-[60vh] w-full object-contain" />
              </div>
            )}
            <div className="flex justify-center">
              <Button variant="outline" onClick={changePhoto}>
                Change photo
              </Button>
            </div>
          </div>

          {/* Right: choose a look */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Choose a look to try on</h2>
              <Button variant="ghost" onClick={loadStyles} disabled={stylesLoading}>
                {stylesLoading ? "…" : "↻ Regenerate"}
              </Button>
            </div>

            {stylesLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-2xl" />
                ))}
              </div>
            ) : (
              <ul className="space-y-3">
                {styles.map((o) => (
                  <li key={o.id}>
                    <button
                      type="button"
                      onClick={() => tryLook(o)}
                      className="flex w-full items-center gap-3 rounded-2xl border border-line bg-surface p-3 text-left transition hover:bg-swatch focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      <div className="flex -space-x-2">
                        {o.items.slice(0, 4).map((it) => (
                          <div
                            key={it.id}
                            className="h-12 w-12 overflow-hidden rounded-lg border border-line bg-swatch"
                          >
                            <ItemImage item={it} className="h-full w-full object-cover" />
                          </div>
                        ))}
                      </div>
                      <span className="flex-1 text-sm font-medium">{o.occasion}</span>
                      <span className="text-xs font-semibold text-accent">Try on →</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Header() {
  return (
    <header>
      <h1 className="text-2xl font-semibold tracking-tight">Try it on</h1>
      <p className="mt-1 text-sm text-muted">
        Upload your photo and preview AI-styled looks on yourself.
      </p>
    </header>
  );
}
