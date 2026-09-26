import clsx from "clsx";
import { X } from "lucide-react";
import type { ReactNode } from "react";

export type ChipProps = {
  children: ReactNode;
  /** Selected/active state — inverts to dark. */
  active?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  className?: string;
  size?: "sm" | "md";
  title?: string;
};

/** Pill chip. Clickable when onClick is given (renders a button), removable when onRemove is given. */
export function Chip({ children, active, onClick, onRemove, className, size = "md", title }: ChipProps) {
  const cls = clsx("chip transition-colors", size === "sm" && "!text-xs !py-1 !px-2.5", active ? "!bg-black !text-white" : onClick && "hover:bg-[#dde2e5]", className);
  const inner = (
    <>
      <span>{children}</span>
      {onRemove && (
        <button type="button" onClick={(e) => { e.stopPropagation(); onRemove(); }} className={clsx("-mr-1 rounded-full p-0.5", active ? "hover:bg-white/20" : "hover:bg-black/10")} aria-label="Remove">
          <X size={12} />
        </button>
      )}
    </>
  );
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cls} aria-pressed={active} title={title}>
        {inner}
      </button>
    );
  }
  return (
    <span className={cls} title={title}>
      {inner}
    </span>
  );
}
