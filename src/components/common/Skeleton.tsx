import { cx } from "@/lib/utils";

export default function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cx("animate-pulse rounded-xl bg-swatch", className)}
      aria-hidden="true"
    />
  );
}
