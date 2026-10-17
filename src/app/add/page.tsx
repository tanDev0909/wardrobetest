"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWardrobe } from "@/lib/store";
import { tagItem } from "@/lib/aiService";
import type { Item, ItemTags } from "@/types";
import PhotoPicker from "@/components/add/PhotoPicker";
import TaggingProgress from "@/components/add/TaggingProgress";
import TagChips from "@/components/add/TagChips";
import Button from "@/components/common/Button";

type Step = "pick" | "tagging" | "review";

const DEFAULT_TAGS: ItemTags = {
  category: "top",
  colors: ["blue"],
  pattern: "solid",
  fabric: null,
  formality: "casual",
  season: ["spring", "autumn"],
};

export default function AddPage() {
  const router = useRouter();
  const { addItem, persistent } = useWardrobe();

  const [step, setStep] = useState<Step>("pick");
  const [previewUrl, setPreviewUrl] = useState<string | undefined>();
  const [tags, setTags] = useState<ItemTags>(DEFAULT_TAGS);
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState<File | undefined>();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const runTagging = async (file: File, preview: string) => {
    setPreviewUrl(preview);
    setPhoto(file);
    setSaveError(null);
    setStep("tagging");
    const result = await tagItem(file);
    setTags(result);
    setName(suggestName(result));
    setStep("review");
  };

  const skipPhoto = () => {
    setPreviewUrl(undefined);
    setPhoto(undefined);
    setSaveError(null);
    setTags(DEFAULT_TAGS);
    setName("");
    setStep("review");
  };

  const save = async () => {
    const item: Item = {
      id: crypto.randomUUID(),
      name: name.trim() || suggestName(tags),
      imageUrl: previewUrl,
      ...tags,
      owned: true,
      createdAt: Date.now(),
    };
    setSaving(true);
    setSaveError(null);
    try {
      await addItem(item, photo);
      router.push("/");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Couldn't save. Try again.");
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Add a piece</h1>
        <p className="mt-1 text-sm text-muted">
          Snap or upload a photo — AI tags it for you.
          {!persistent && " (Items last for this session.)"}
        </p>
      </header>

      {step === "pick" && <PhotoPicker onPick={runTagging} onSkip={skipPhoto} />}

      {step === "tagging" && <TaggingProgress previewUrl={previewUrl} />}

      {step === "review" && (
        <div className="space-y-5">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Red knit top"
              className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            />
          </label>

          <TagChips tags={tags} onChange={setTags} />

          {saveError && (
            <p role="alert" className="text-sm font-medium text-accent">
              {saveError}
            </p>
          )}

          <div className="flex items-center justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                setStep("pick");
                setPreviewUrl(undefined);
                setPhoto(undefined);
                setSaveError(null);
              }}
              disabled={saving}
            >
              Start over
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save to wardrobe"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function suggestName(tags: ItemTags): string {
  const color = tags.colors[0] ? `${tags.colors[0]} ` : "";
  return `${color}${tags.category}`.replace(/^\w/, (m) => m.toUpperCase());
}
