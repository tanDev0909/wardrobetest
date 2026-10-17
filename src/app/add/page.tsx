"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWardrobe } from "@/lib/store";
import { extractItems, tagItem, type ExtractProgress } from "@/lib/aiService";
import { sha256 } from "@/lib/image";
import type { Item, ItemTags } from "@/types";
import PhotoPicker from "@/components/add/PhotoPicker";
import TaggingProgress from "@/components/add/TaggingProgress";
import TagChips from "@/components/add/TagChips";
import Button from "@/components/common/Button";

type Step = "pick" | "tagging" | "review";

/** One piece about to be saved: a garment cut out of the photo, or the whole photo. */
interface Draft {
  key: string;
  keep: boolean;
  name: string;
  tags: ItemTags;
  previewUrl?: string;
  photo?: Blob;
  dedupeKey?: string;
}

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
  const [progress, setProgress] = useState<ExtractProgress | null>(null);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const reset = () => {
    drafts.forEach((d) => d.previewUrl?.startsWith("blob:") && d.previewUrl !== previewUrl && URL.revokeObjectURL(d.previewUrl));
    setDrafts([]);
    setPreviewUrl(undefined);
    setProgress(null);
    setSaveError(null);
    setStep("pick");
  };

  const runTagging = async (file: File, preview: string) => {
    setPreviewUrl(preview);
    setSaveError(null);
    setProgress(null);
    setStep("tagging");

    let found: Awaited<ReturnType<typeof extractItems>> = [];
    try {
      found = await extractItems(file, setProgress);
    } catch (err) {
      // Model failed to load (offline, old browser…) — fall back to one item.
      console.error("Garment extraction failed", err);
    }

    if (found.length > 0) {
      const hash = await sha256(file);
      setDrafts(
        found.map((g) => ({
          key: g.key,
          keep: true,
          name: g.name,
          tags: g.tags,
          previewUrl: URL.createObjectURL(g.cutout),
          photo: g.cutout,
          dedupeKey: `${hash}:${g.key}`,
        })),
      );
    } else {
      const tags = await tagItem(file);
      setDrafts([{ key: "photo", keep: true, name: suggestName(tags), tags, previewUrl: preview, photo: file }]);
    }
    setStep("review");
  };

  const skipPhoto = () => {
    setPreviewUrl(undefined);
    setSaveError(null);
    setDrafts([{ key: "manual", keep: true, name: "", tags: DEFAULT_TAGS }]);
    setStep("review");
  };

  const patchDraft = (key: string, patch: Partial<Draft>) =>
    setDrafts((ds) => ds.map((d) => (d.key === key ? { ...d, ...patch } : d)));

  const kept = drafts.filter((d) => d.keep);

  const save = async () => {
    setSaving(true);
    setSaveError(null);
    for (const d of kept) {
      const item: Item = {
        id: crypto.randomUUID(),
        name: d.name.trim() || suggestName(d.tags),
        imageUrl: d.previewUrl,
        ...d.tags,
        owned: true,
        createdAt: Date.now(),
      };
      try {
        await addItem(item, d.photo, d.dedupeKey);
        // Saved — drop it so a retry after a later failure doesn't double-save.
        setDrafts((ds) => ds.filter((x) => x.key !== d.key));
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Couldn't save. Try again.";
        setSaveError(kept.length > 1 ? `${item.name}: ${msg}` : msg);
        setSaving(false);
        return;
      }
    }
    router.push("/");
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Add a piece</h1>
        <p className="mt-1 text-sm text-muted">
          Upload a photo of an item or a whole outfit — AI finds each piece for you.
          {!persistent && " (Items last for this session.)"}
        </p>
      </header>

      {step === "pick" && <PhotoPicker onPick={runTagging} onSkip={skipPhoto} />}

      {step === "tagging" && (
        <TaggingProgress previewUrl={previewUrl} status={progressLabel(progress)} />
      )}

      {step === "review" && (
        <div className="space-y-5">
          {drafts.length === 1 ? (
            <>
              <NameField value={drafts[0].name} onChange={(name) => patchDraft(drafts[0].key, { name })} />
              <TagChips tags={drafts[0].tags} onChange={(tags) => patchDraft(drafts[0].key, { tags })} />
            </>
          ) : (
            <>
              <p className="text-sm font-medium">
                {`Found ${drafts.length} pieces · untick any you don't want`}
              </p>
              <ul className="space-y-3">
                {drafts.map((d) => (
                  <DraftCard key={d.key} draft={d} onChange={(patch) => patchDraft(d.key, patch)} />
                ))}
              </ul>
            </>
          )}

          {saveError && (
            <p role="alert" className="text-sm font-medium text-accent">
              {saveError}
            </p>
          )}

          <div className="flex items-center justify-end gap-3">
            <Button variant="ghost" onClick={reset} disabled={saving}>
              Start over
            </Button>
            <Button onClick={save} disabled={saving || kept.length === 0}>
              {saving
                ? "Saving…"
                : kept.length > 1
                  ? `Save ${kept.length} pieces`
                  : "Save to wardrobe"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function NameField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">Name</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. Red knit top"
        className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      />
    </label>
  );
}

function DraftCard({ draft, onChange }: { draft: Draft; onChange: (p: Partial<Draft>) => void }) {
  const [editing, setEditing] = useState(false);
  return (
    <li className="rounded-2xl border border-line bg-surface p-3">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={draft.keep}
          onChange={(e) => onChange({ keep: e.target.checked })}
          aria-label={`Keep ${draft.name}`}
          className="h-5 w-5 accent-[var(--color-accent)]"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={draft.previewUrl}
          alt={draft.name}
          className="checkerboard h-20 w-20 shrink-0 rounded-xl object-contain"
        />
        <div className="min-w-0 flex-1 space-y-1">
          <input
            value={draft.name}
            onChange={(e) => onChange({ name: e.target.value })}
            aria-label="Name"
            className="w-full rounded-lg border border-line bg-surface px-2 py-1 text-sm"
          />
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className="text-xs font-medium text-accent"
          >
            {editing ? "Hide tags" : `${draft.tags.category} · ${draft.tags.colors.join(", ")} · edit tags`}
          </button>
        </div>
      </div>
      {editing && (
        <div className="mt-3">
          <TagChips tags={draft.tags} onChange={(tags) => onChange({ tags })} />
        </div>
      )}
    </li>
  );
}

function progressLabel(p: ExtractProgress | null): string | undefined {
  if (!p) return undefined;
  if (p.stage === "download") return `Downloading AI model (first time only)… ${p.percent}%`;
  return "Finding each piece in your photo…";
}

function suggestName(tags: ItemTags): string {
  const color = tags.colors[0] ? `${tags.colors[0]} ` : "";
  return `${color}${tags.category}`.replace(/^\w/, (m) => m.toUpperCase());
}
