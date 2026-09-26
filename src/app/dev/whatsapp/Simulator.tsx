"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import type { SimulateTranscript } from "@/app/api/whatsapp/simulate/route";

const DEFAULT_PHONE = "+919650355568";
const DEFAULT_IMAGE = "https://picsum.photos/seed/flat/1200/800";
const POLL_MS = 1500;

type Msg = SimulateTranscript["messages"][number];

export function Simulator() {
  const [phone, setPhone] = useState(DEFAULT_PHONE);
  const [text, setText] = useState("");
  const [imageUrl, setImageUrl] = useState(DEFAULT_IMAGE);
  const [transcript, setTranscript] = useState<SimulateTranscript | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    if (!phone.trim()) return;
    try {
      const res = await fetch(`/api/whatsapp/simulate?from=${encodeURIComponent(phone.trim())}`, { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as SimulateTranscript;
      setTranscript((prev) => (prev && prev.messages.length === data.messages.length && prev.state === data.state ? prev : data));
    } catch {
      /* polling errors are non-fatal */
    }
  }, [phone]);

  useEffect(() => {
    // Poll the transcript; the first tick is deferred so no state is set synchronously in the effect body.
    const first = setTimeout(refresh, 0);
    const id = setInterval(refresh, POLL_MS);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [refresh]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [transcript?.messages.length]);

  async function send(payload: { text?: string; mediaUrl?: string; kind?: string }) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/whatsapp/simulate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ from: phone.trim(), ...payload }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setError(j.error ?? `Request failed (${res.status})`);
      }
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  const sendText = () => {
    const t = text.trim();
    if (!t) return;
    setText("");
    send({ text: t });
  };

  const messages = transcript?.messages ?? [];

  return (
    <div className="grid gap-4 md:grid-cols-[280px_1fr]">
      <aside className="panel p-5 space-y-4 self-start">
        <label className="block">
          <span className="eyebrow">Phone (E.164)</span>
          <input className="input mt-2" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91…" />
        </label>
        <label className="block">
          <span className="eyebrow">Image URL to attach</span>
          <input className="input mt-2" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
        </label>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-light text-sm" disabled={busy || !imageUrl} onClick={() => send({ mediaUrl: imageUrl, kind: "image" })}>
            Attach image
          </button>
          <button type="button" className="btn btn-light text-sm" disabled={busy || !imageUrl} onClick={() => { setImageUrl(`https://picsum.photos/seed/${Math.random().toString(36).slice(2, 8)}/1200/800`); }}>
            Random picsum
          </button>
        </div>
        <div className="hairline pt-4 text-xs text-muted space-y-1">
          <div>
            State: <span className="chip !py-0.5 !text-xs">{transcript?.state ?? "—"}</span>
          </div>
          {transcript?.draftListingId && (
            <div>
              Last listing: <a className="underline" href={`/dashboard/listings/${transcript.draftListingId}`}>{transcript.draftListingId}</a>
            </div>
          )}
          <div>Commands: DONE · HELP · NEW · CANCEL</div>
        </div>
      </aside>

      <section className="panel flex min-h-[560px] flex-col overflow-hidden">
        <div className="flex-1 space-y-2 overflow-y-auto bg-soft p-4">
          {messages.length === 0 && <p className="py-16 text-center text-sm text-muted">No messages yet. Say “Hi” to start.</p>}
          {messages.map((m) => (
            <Bubble key={m.id} m={m} />
          ))}
          <div ref={bottomRef} />
        </div>
        {error && <p className="px-4 pt-2 text-sm text-red-600">{error}</p>}
        <form
          className="flex items-center gap-2 p-3"
          onSubmit={(e) => {
            e.preventDefault();
            sendText();
          }}
        >
          <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message… e.g. 3 BHK 1650 sqft Sector 62 Gurgaon 2.4 Cr" disabled={busy} />
          <button type="submit" className="btn btn-dark text-sm" disabled={busy || !text.trim()}>
            Send
          </button>
          <button type="button" className="btn btn-wa text-sm" disabled={busy} onClick={() => send({ text: "DONE" })}>
            Send DONE
          </button>
        </form>
      </section>
    </div>
  );
}

function Bubble({ m }: { m: Msg }) {
  const out = m.direction === "OUT";
  const time = new Date(m.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  return (
    <div className={clsx("flex", out ? "justify-start" : "justify-end")}>
      <div className={clsx("max-w-[80%] rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap break-words", out ? "bg-white" : "bg-[#d9fdd3]")}>
        {m.kind === "image" && m.mediaUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={m.mediaUrl} alt="" className="mb-1 max-h-48 rounded-lg" />
        )}
        {m.kind !== "text" && m.kind !== "image" && (
          <span className="chip !text-xs mb-1">{m.kind}{m.mediaUrl ? " · stored" : ""}</span>
        )}
        {m.kind === "image" && !m.mediaUrl && <span className="chip !text-xs mb-1">image · downloading…</span>}
        {m.text && <Linkified text={m.text} />}
        <div className={clsx("mt-1 text-[10px]", out ? "text-muted" : "text-black/50 text-right")}>{time}</div>
      </div>
    </div>
  );
}

function Linkified({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/\S+)/g);
  return (
    <>
      {parts.map((p, i) =>
        /^https?:\/\//.test(p) ? (
          <a key={i} href={p} target="_blank" rel="noreferrer" className="underline break-all">
            {p}
          </a>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}
