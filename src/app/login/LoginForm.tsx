"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, ChevronLeft } from "lucide-react";
import { Button, Input } from "@/components/ui";

type Step = "phone" | "code";

export function LoginForm({ next, devHint }: { next: string; devHint: string | null }) {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(devHint);
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function sendOtp(e?: FormEvent) {
    e?.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/auth/otp", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ phone }) });
      const data = (await res.json()) as { ok: boolean; error?: string; phone?: string; devHint?: string | null };
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Something went wrong.");
      setSentTo(data.phone ?? phone);
      if (data.devHint) setHint(data.devHint);
      setStep("code");
      setCooldown(30);
      setTimeout(() => codeRef.current?.focus(), 50);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function verify(e?: FormEvent) {
    e?.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/auth/verify", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ phone: sentTo, code, next }) });
      const data = (await res.json()) as { ok: boolean; error?: string; redirect?: string };
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Could not verify the code.");
      window.location.assign(data.redirect ?? "/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not verify the code.");
      setBusy(false);
    }
  }

  if (step === "phone") {
    return (
      <form onSubmit={sendOtp} className="flex flex-col gap-4">
        <Input
          label="Mobile number"
          prefix="+91"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="98765 43210"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={error}
          autoFocus
          required
        />
        <Button type="submit" size="lg" loading={busy} className="justify-center w-full">
          Send code on WhatsApp <ArrowRight size={18} />
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={verify} className="flex flex-col gap-4">
      <button type="button" onClick={() => { setStep("phone"); setCode(""); setError(null); }} className="self-start inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ChevronLeft size={16} /> {sentTo}
      </button>
      <Input
        ref={codeRef}
        label="6-digit code"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]{6}"
        maxLength={6}
        placeholder="••••••"
        className="tracking-[.5em] text-center text-xl font-medium"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
        error={error}
        hint={hint ? <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 text-amber-900 px-2.5 py-0.5 text-xs font-medium">{hint}</span> : "Sent on WhatsApp. Check your chats."}
        required
      />
      <Button type="submit" size="lg" loading={busy} disabled={code.length !== 6} className="justify-center w-full">
        Log in <ArrowRight size={18} />
      </Button>
      <button type="button" disabled={cooldown > 0 || busy} onClick={() => sendOtp()} className="text-sm text-muted hover:text-ink disabled:opacity-50 self-center">
        {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
      </button>
    </form>
  );
}
