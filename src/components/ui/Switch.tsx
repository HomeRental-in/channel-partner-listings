"use client";
import { useId, type ReactNode } from "react";
import clsx from "clsx";

export type SwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  size?: "sm" | "md";
  className?: string;
  id?: string;
};

/** Accessible toggle (role="switch"). Renders as a row when label is given. */
export function Switch({ checked, onChange, label, description, disabled, size = "md", className, id }: SwitchProps) {
  const autoId = useId();
  const swId = id ?? autoId;
  const track = size === "sm" ? "h-5 w-9" : "h-7 w-12";
  const knob = size === "sm" ? "h-4 w-4" : "h-6 w-6";
  const shift = size === "sm" ? "translate-x-4" : "translate-x-5";
  const control = (
    <button
      type="button"
      id={swId}
      role="switch"
      aria-checked={checked}
      aria-labelledby={label ? `${swId}-label` : undefined}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={clsx(
        "relative inline-flex shrink-0 items-center rounded-full transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-black/40",
        track,
        checked ? "bg-black" : "bg-black/15",
        disabled && "opacity-50 cursor-not-allowed",
        !label && className,
      )}
    >
      <span className={clsx("inline-block rounded-full bg-white shadow transition-transform duration-200 translate-x-0.5", knob, checked && shift)} />
    </button>
  );
  if (!label) return control;
  return (
    <div className={clsx("flex items-center justify-between gap-4", className)}>
      <div className="min-w-0">
        <label id={`${swId}-label`} htmlFor={swId} className="block text-[15px] font-medium cursor-pointer">
          {label}
        </label>
        {description && <p className="text-sm text-muted">{description}</p>}
      </div>
      {control}
    </div>
  );
}
