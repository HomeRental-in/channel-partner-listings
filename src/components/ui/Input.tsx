import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import clsx from "clsx";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: ReactNode;
  hint?: ReactNode;
  error?: string | null;
  /** Text shown inside the field on the left, e.g. "+91" or "https://". */
  prefix?: ReactNode;
  suffix?: ReactNode;
  wrapperClassName?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, prefix, suffix, className, wrapperClassName, id, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;
  return (
    <div className={clsx("flex flex-col gap-1.5", wrapperClassName)}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium">
          {label}
        </label>
      )}
      <div className={clsx("relative flex items-center", (prefix || suffix) && "input !p-0 overflow-hidden", error && "!border-red-500")}>
        {prefix && <span className="pl-4 pr-1 text-muted text-[15px] shrink-0">{prefix}</span>}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={clsx(prefix || suffix ? "flex-1 min-w-0 bg-transparent px-3 py-[.8rem] outline-none text-base" : "input", error && !prefix && !suffix && "!border-red-500", className)}
          {...rest}
        />
        {suffix && <span className="pr-4 pl-1 text-muted text-sm shrink-0">{suffix}</span>}
      </div>
      {error ? (
        <p id={`${inputId}-error`} className="text-sm text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-sm text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
});
