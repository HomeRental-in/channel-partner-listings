import { forwardRef, type ButtonHTMLAttributes } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Loader2 } from "lucide-react";

export type ButtonVariant = "dark" | "light" | "ghost" | "wa" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANT: Record<ButtonVariant, string> = {
  dark: "btn-dark",
  light: "btn-light",
  ghost: "btn-ghost",
  wa: "btn-wa",
  danger: "bg-red-600 text-white hover:bg-red-700",
};
const SIZE: Record<ButtonSize, string> = {
  sm: "!px-3.5 !py-2 text-sm",
  md: "text-[15px]",
  lg: "!px-7 !py-4 text-base",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  /** Renders a Next.js Link with button styling. */
  href?: string;
  target?: string;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "dark", size = "md", loading = false, className, children, href, target, disabled, type = "button", ...rest },
  ref,
) {
  const cls = clsx("btn select-none whitespace-nowrap", VARIANT[variant], SIZE[size], (disabled || loading) && "opacity-50 pointer-events-none", className);
  if (href) {
    return (
      <Link href={href} target={target} className={cls} rel={target === "_blank" ? "noreferrer" : undefined}>
        {children}
      </Link>
    );
  }
  return (
    <button ref={ref} type={type} className={cls} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading && <Loader2 size={16} className="animate-spin" aria-hidden />}
      {children}
    </button>
  );
});
