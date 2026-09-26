"use client";
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import clsx from "clsx";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastKind = "success" | "error" | "info";
export type Toast = { id: number; kind: ToastKind; message: string };

type ToastApi = {
  toast: (message: string, kind?: ToastKind) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  dismiss: (id: number) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

const ICON: Record<ToastKind, ReactNode> = {
  success: <CheckCircle2 size={18} className="text-emerald-500" />,
  error: <AlertCircle size={18} className="text-red-500" />,
  info: <Info size={18} className="text-sky-500" />,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const toast = useCallback(
    (message: string, kind: ToastKind = "info") => {
      const id = ++counter.current;
      setToasts((t) => [...t.slice(-3), { id, kind, message }]);
      setTimeout(() => dismiss(id), kind === "error" ? 5000 : 3000);
    },
    [dismiss],
  );
  const api = useMemo<ToastApi>(() => ({ toast, success: (m) => toast(m, "success"), error: (m) => toast(m, "error"), dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-20 md:bottom-6 z-[200] flex flex-col items-center gap-2 px-4" aria-live="polite" aria-atomic="false">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={clsx("pointer-events-auto flex items-center gap-2.5 rounded-full bg-black text-white pl-4 pr-2 py-2.5 shadow-lg text-sm max-w-md animate-[toastIn_.2s_ease]")}
          >
            {ICON[t.kind]}
            <span className="flex-1">{t.message}</span>
            <button type="button" onClick={() => dismiss(t.id)} className="rounded-full p-1 hover:bg-white/15" aria-label="Dismiss">
              <X size={14} />
            </button>
          </div>
        ))}
        <style>{`@keyframes toastIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`}</style>
      </div>
    </ToastContext.Provider>
  );
}

/** Returns a no-op API when rendered outside a ToastProvider so components stay usable in isolation. */
export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  return ctx ?? { toast: () => {}, success: () => {}, error: () => {}, dismiss: () => {} };
}
