import type { ReactNode } from "react";

interface Props {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-line bg-surface/60 px-6 py-16 text-center">
      {icon && <div className="mb-4 text-accent">{icon}</div>}
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
