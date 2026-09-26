import { forwardRef, useId, type ReactNode, type TextareaHTMLAttributes } from "react";
import clsx from "clsx";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: ReactNode;
  hint?: ReactNode;
  error?: string | null;
  /** Show "n / max" counter (uses maxLength). */
  counter?: boolean;
  wrapperClassName?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, counter, className, wrapperClassName, id, maxLength, value, defaultValue, ...rest },
  ref,
) {
  const autoId = useId();
  const taId = id ?? autoId;
  const len = typeof value === "string" ? value.length : typeof defaultValue === "string" ? defaultValue.length : 0;
  return (
    <div className={clsx("flex flex-col gap-1.5", wrapperClassName)}>
      {(label || (counter && maxLength)) && (
        <div className="flex items-baseline justify-between">
          {label ? (
            <label htmlFor={taId} className="text-sm font-medium">
              {label}
            </label>
          ) : (
            <span />
          )}
          {counter && maxLength ? (
            <span className={clsx("text-xs tabular-nums", len > maxLength ? "text-red-600" : "text-muted")}>
              {len} / {maxLength}
            </span>
          ) : null}
        </div>
      )}
      <textarea
        ref={ref}
        id={taId}
        maxLength={maxLength}
        value={value}
        defaultValue={defaultValue}
        aria-invalid={error ? true : undefined}
        className={clsx("input min-h-[110px] resize-y leading-snug", error && "!border-red-500", className)}
        {...rest}
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : hint ? <p className="text-sm text-muted">{hint}</p> : null}
    </div>
  );
});
