"use client";
import { useState, type ReactNode } from "react";
import clsx from "clsx";
import { Check, Copy } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      return true;
    } catch {
      return false;
    }
  }
}

export function CopyButton({ text, label = "Copy link", copiedLabel = "Copied", className, iconOnly, children }: { text: string; label?: string; copiedLabel?: string; className?: string; iconOnly?: boolean; children?: ReactNode }) {
  const [done, setDone] = useState(false);
  const toast = useToast();
  return (
    <button
      type="button"
      className={clsx(className ?? "btn btn-light !py-2.5 !px-4 text-sm")}
      aria-label={iconOnly ? label : undefined}
      onClick={async () => {
        const ok = await copyText(text);
        if (ok) {
          setDone(true);
          toast.success("Copied to clipboard");
          setTimeout(() => setDone(false), 1500);
        } else toast.error("Could not copy");
      }}
    >
      {done ? <Check size={16} /> : <Copy size={16} />}
      {!iconOnly && <span>{children ?? (done ? copiedLabel : label)}</span>}
    </button>
  );
}
