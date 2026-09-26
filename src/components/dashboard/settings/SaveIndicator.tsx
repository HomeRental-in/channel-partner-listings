"use client";
import clsx from "clsx";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import type { SaveStatus } from "./useAutoSave";

export function SaveIndicator({ status, error }: { status: SaveStatus; error: string | null }) {
  const map: Record<SaveStatus, { icon: React.ReactNode; text: string; cls: string }> = {
    idle: { icon: null, text: "Changes save automatically", cls: "text-muted" },
    dirty: { icon: <Loader2 size={14} className="animate-spin" />, text: "Unsaved changes", cls: "text-muted" },
    saving: { icon: <Loader2 size={14} className="animate-spin" />, text: "Saving…", cls: "text-muted" },
    saved: { icon: <Check size={14} />, text: "Saved", cls: "text-emerald-700" },
    error: { icon: <AlertCircle size={14} />, text: error ?? "Could not save", cls: "text-red-600" },
  };
  const m = map[status];
  return (
    <span role="status" aria-live="polite" className={clsx("inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium shadow-sm border border-line", m.cls)}>
      {m.icon} {m.text}
    </span>
  );
}
