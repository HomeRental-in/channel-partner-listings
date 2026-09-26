import { forwardRef, useId, type ReactNode, type SelectHTMLAttributes } from "react";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";

export type SelectOption = { value: string; label: string; disabled?: boolean };

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: ReactNode;
  hint?: ReactNode;
  error?: string | null;
  options: SelectOption[];
  placeholder?: string;
  wrapperClassName?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, options, placeholder, className, wrapperClassName, id, ...rest },
  ref,
) {
  const autoId = useId();
  const selId = id ?? autoId;
  return (
    <div className={clsx("flex flex-col gap-1.5", wrapperClassName)}>
      {label && (
        <label htmlFor={selId} className="text-sm font-medium">
          {label}
        </label>
      )}
      <div className="relative">
        <select ref={ref} id={selId} aria-invalid={error ? true : undefined} className={clsx("input appearance-none pr-10", error && "!border-red-500", className)} {...rest}>
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : hint ? <p className="text-sm text-muted">{hint}</p> : null}
    </div>
  );
});
