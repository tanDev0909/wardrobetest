import { cx } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost" | "outline";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const styles: Record<Variant, string> = {
  primary:
    "accent-gradient text-accent-foreground shadow-sm shadow-accent/30 hover:opacity-90 active:opacity-80",
  ghost: "text-ink hover:bg-swatch",
  outline: "border border-line text-ink hover:bg-swatch",
};

export default function Button({
  variant = "primary",
  className,
  ...rest
}: Props) {
  return (
    <button
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        "disabled:cursor-not-allowed disabled:opacity-50",
        styles[variant],
        className,
      )}
      {...rest}
    />
  );
}
