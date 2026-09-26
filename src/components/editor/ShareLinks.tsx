"use client";
import { useState } from "react";

/** Link row + Copy / Open / WhatsApp share / Personalise for a buyer. Used by the Done step and the review success screen. */
export function ShareLinks({ url, title, priceDisplay }: { url: string; title: string; priceDisplay: string }) {
  const [copied, setCopied] = useState<string | null>(null);
  const [name, setName] = useState("");
  const personal = name.trim() ? `${url}${url.includes("?") ? "&" : "?"}n=${encodeURIComponent(name.trim().replace(/\s+/g, "-"))}` : url;
  const waText = `${title} · ${priceDisplay}\n${personal}`;

  async function copy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      window.prompt("Copy this link", text);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 bg-soft rounded-[var(--radius-inner)] p-2 pl-4">
        <a href={url} target="_blank" rel="noreferrer" className="truncate text-sm font-medium flex-1 hover:underline">
          {url.replace(/^https?:\/\//, "")}
        </a>
        <button type="button" onClick={() => copy(url, "link")} className="btn btn-dark !py-2 text-sm whitespace-nowrap">
          {copied === "link" ? "Copied ✓" : "Copy"}
        </button>
        <a href={url} target="_blank" rel="noreferrer" className="btn btn-light !py-2 text-sm whitespace-nowrap">
          Open ↗
        </a>
      </div>
      <a href={`https://wa.me/?text=${encodeURIComponent(waText)}`} target="_blank" rel="noreferrer" className="btn btn-wa w-full justify-center">
        Share on WhatsApp
      </a>
      <div className="rounded-[var(--radius-inner)] border border-line p-4 space-y-2">
        <span className="block text-sm font-medium">Personalise for a buyer</span>
        <p className="text-xs text-muted">Adds a “Hi Rahul 👋” greeting on the page and tells you who opened it. No buyer data is collected.</p>
        <div className="flex gap-2">
          <input className="input !py-2" placeholder="Buyer's first name" value={name} maxLength={30} onChange={(e) => setName(e.target.value)} />
          <button type="button" disabled={!name.trim()} onClick={() => copy(personal, "personal")} className="btn btn-dark !py-2 text-sm whitespace-nowrap disabled:opacity-50">
            {copied === "personal" ? "Copied ✓" : "Copy link"}
          </button>
        </div>
        {name.trim() && <p className="text-xs text-muted truncate">{personal}</p>}
      </div>
    </div>
  );
}
