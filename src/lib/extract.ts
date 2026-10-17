// In-browser garment extraction. Runs SegFormer (fine-tuned for clothes) via
// transformers.js, so the photo never leaves the device and costs nothing.
// The quantized model (~29 MB) downloads once and is cached by the browser.
//
// Only import this module dynamically from client code (see aiService.ts).

import { pipeline, type ImageSegmentationPipeline, type ProgressInfo } from "@huggingface/transformers";
import type { Category } from "@/types";
import { nearestColorName } from "./utils";

const MODEL = "Xenova/segformer_b2_clothes";
/** Work at this size: plenty for cut-outs and keeps mask arrays small. */
const MAX_EDGE = 1024;
/** Ignore specks: segments smaller than this share of the photo. */
const MIN_AREA = 0.004;

/** Model label → wardrobe category + display name. Body parts are skipped. */
const GARMENTS: Record<string, { category: Category; name: string }> = {
  "Upper-clothes": { category: "top", name: "Top" },
  Pants: { category: "bottom", name: "Pants" },
  Skirt: { category: "bottom", name: "Skirt" },
  Dress: { category: "dress", name: "Dress" },
  "Left-shoe": { category: "footwear", name: "Shoes" },
  "Right-shoe": { category: "footwear", name: "Shoes" },
  Hat: { category: "accessory", name: "Hat" },
  Sunglasses: { category: "accessory", name: "Sunglasses" },
  Belt: { category: "accessory", name: "Belt" },
  Bag: { category: "accessory", name: "Bag" },
  Scarf: { category: "accessory", name: "Scarf" },
};

export interface Garment {
  /** Stable per photo, e.g. "Shoes" — used to dedupe uploads. */
  key: string;
  name: string;
  category: Category;
  colors: string[];
  /** Transparent PNG of just this garment, cropped to its bounds. */
  cutout: Blob;
}

export type ExtractProgress =
  | { stage: "download"; percent: number }
  | { stage: "segment" };

let segmenter: Promise<ImageSegmentationPipeline> | null = null;

function loadSegmenter(onProgress?: (p: ExtractProgress) => void) {
  segmenter ??= pipeline("image-segmentation", MODEL, {
    dtype: "q8",
    progress_callback: (info: ProgressInfo) => {
      if (info.status === "progress_total") {
        onProgress?.({ stage: "download", percent: Math.round(info.progress) });
      }
    },
  }) as Promise<ImageSegmentationPipeline>;
  // Let a failed download be retried on the next photo.
  segmenter.catch(() => (segmenter = null));
  return segmenter;
}

async function toCanvas(file: Blob): Promise<HTMLCanvasElement> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d", { willReadFrequently: true })!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas;
}

/** Find every garment in the photo and cut each one out. */
export async function extractGarments(
  file: Blob,
  onProgress?: (p: ExtractProgress) => void,
): Promise<Garment[]> {
  const seg = await loadSegmenter(onProgress);
  onProgress?.({ stage: "segment" });

  const canvas = await toCanvas(file);
  const { width, height } = canvas;
  const pixels = canvas.getContext("2d")!.getImageData(0, 0, width, height).data;
  const segments = await seg(canvas);

  // Merge masks that map to the same garment (left + right shoe → "Shoes").
  const masks = new Map<string, { category: Category; mask: Uint8Array }>();
  for (const { label, mask } of segments) {
    const garment = label ? GARMENTS[label] : undefined;
    if (!garment) continue;
    const entry = masks.get(garment.name) ?? {
      category: garment.category,
      mask: new Uint8Array(width * height),
    };
    for (let i = 0; i < entry.mask.length; i++) {
      if (mask.data[i] > 127) entry.mask[i] = 1;
    }
    masks.set(garment.name, entry);
  }

  const garments: Garment[] = [];
  for (const [name, { category, mask }] of masks) {
    const cut = await cutOut(pixels, mask, width, height);
    if (cut) garments.push({ key: name, name, category, ...cut });
  }
  return garments;
}

async function cutOut(
  pixels: Uint8ClampedArray,
  mask: Uint8Array,
  width: number,
  height: number,
): Promise<{ cutout: Blob; colors: string[] } | null> {
  let minX = width, minY = height, maxX = -1, maxY = -1, area = 0;
  const colorCounts = new Map<string, number>();

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      if (!mask[i]) continue;
      area++;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      // Sample every 4th pixel for colour — plenty for a dominant-colour vote.
      if ((i & 3) === 0) {
        const name = nearestColorName(pixels[i * 4], pixels[i * 4 + 1], pixels[i * 4 + 2]);
        colorCounts.set(name, (colorCounts.get(name) ?? 0) + 1);
      }
    }
  }
  if (area < width * height * MIN_AREA) return null;

  const pad = Math.round(Math.max(maxX - minX, maxY - minY) * 0.04);
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(width - 1, maxX + pad);
  maxY = Math.min(height - 1, maxY + pad);
  const w = maxX - minX + 1;
  const h = maxY - minY + 1;

  const out = new ImageData(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const src = (y + minY) * width + (x + minX);
      if (!mask[src]) continue;
      const dst = (y * w + x) * 4;
      out.data[dst] = pixels[src * 4];
      out.data[dst + 1] = pixels[src * 4 + 1];
      out.data[dst + 2] = pixels[src * 4 + 2];
      out.data[dst + 3] = 255;
    }
  }
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.putImageData(out, 0, 0);
  const cutout = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not encode cut-out"))), "image/png"),
  );

  // Keep colours that cover at least 20% of the garment (max two).
  const sampled = [...colorCounts.values()].reduce((a, b) => a + b, 0);
  const colors = [...colorCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .filter(([, n], idx) => idx === 0 || n / sampled >= 0.2)
    .slice(0, 2)
    .map(([c]) => c);

  return { cutout, colors };
}
