import clsx from "clsx";
import type { ReactNode } from "react";

export function EmptyState({ icon, title, description, action, className }: { icon?: ReactNode; title: ReactNode; description?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={clsx("flex flex-col items-center justify-center text-center rounded-[var(--radius-card)] bg-soft px-6 py-14", className)}>
      {icon && <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-muted">{icon}</div>}
      <h3 className="text-lg font-medium">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
