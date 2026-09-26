"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { updateProfile, type ProfilePatch } from "@/app/dashboard/settings/actions";

export type SaveStatus = "idle" | "dirty" | "saving" | "saved" | "error";

/** Merges patches and flushes them to updateProfile after a short debounce. */
export function useAutoSave(onError?: (msg: string) => void) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const pending = useRef<ProfilePatch>({});
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inflight = useRef(false);
  const onErrorRef = useRef<typeof onError>(undefined);
  const flushRef = useRef<() => void>(() => {});

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const schedule = useCallback((delay: number) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => flushRef.current(), delay);
  }, []);

  const flush = useCallback(async () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (inflight.current) return schedule(300);
    const patch = pending.current;
    if (Object.keys(patch).length === 0) return;
    pending.current = {};
    inflight.current = true;
    setStatus("saving");
    try {
      const res = await updateProfile(patch);
      if (res.ok) {
        setError(null);
        setStatus(Object.keys(pending.current).length ? "dirty" : "saved");
      } else {
        setError(res.error);
        setStatus("error");
        onErrorRef.current?.(res.error);
      }
    } catch {
      const msg = "Could not save. Check your connection.";
      setError(msg);
      setStatus("error");
      onErrorRef.current?.(msg);
    } finally {
      inflight.current = false;
      if (Object.keys(pending.current).length) schedule(300);
    }
  }, [schedule]);

  useEffect(() => {
    flushRef.current = () => void flush();
  }, [flush]);

  const save = useCallback(
    (patch: ProfilePatch, delay = 700) => {
      pending.current = { ...pending.current, ...patch };
      setStatus("dirty");
      schedule(delay);
    },
    [schedule],
  );

  useEffect(() => {
    const onLeave = () => {
      if (Object.keys(pending.current).length) flushRef.current();
    };
    window.addEventListener("beforeunload", onLeave);
    window.addEventListener("pagehide", onLeave);
    return () => {
      window.removeEventListener("beforeunload", onLeave);
      window.removeEventListener("pagehide", onLeave);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return { status, error, save, flush };
}
