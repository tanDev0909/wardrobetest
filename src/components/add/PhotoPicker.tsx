"use client";

import { useRef, useState } from "react";
import Button from "@/components/common/Button";

interface Props {
  onPick: (file: File, previewUrl: string) => void;
  onSkip: () => void;
}

const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

export default function PhotoPicker({ onPick, onSkip }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file?: File) => {
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      setError("That doesn't look like an image. Try a JPG, PNG or WEBP.");
      return;
    }
    setError(null);
    onPick(file, URL.createObjectURL(file));
  };

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-line bg-surface px-6 py-16 text-center transition hover:bg-swatch focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-accent" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="9" cy="11" r="2" />
          <path d="m21 17-5-5-9 7" />
        </svg>
        <span className="text-sm font-medium">Upload a photo of your item</span>
        <span className="text-xs text-muted">JPG, PNG or WEBP</span>
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

      <div className="text-center">
        <Button variant="ghost" onClick={onSkip}>
          or add without a photo
        </Button>
      </div>
    </div>
  );
}
