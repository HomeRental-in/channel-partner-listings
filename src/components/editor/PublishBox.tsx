"use client";
import { useState, useTransition } from "react";
import type { ActionResult, SignupInput } from "./schema";

/**
 * "Publish" button that first collects name + username (+ optional agency) when the CP has no username yet.
 * `publish` is a server action; on success the parent decides what to show next.
 */
export function PublishBox({ needsSignup, rootDomain, publish, onPublished, label = "Publish listing", big = false, extraSaving }: { needsSignup: boolean; rootDomain: string; publish: (signup?: SignupInput) => Promise<ActionResult<{ url: string }>>; onPublished: (url: string) => void; label?: string; big?: boolean; extraSaving?: () => Promise<boolean> }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [agency, setAgency] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const uname = username.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 24);
  const unameOk = /^[a-z0-9]{3,24}$/.test(uname);

  function run(signup?: SignupInput) {
    setError(null);
    start(async () => {
      if (extraSaving && !(await extraSaving())) return setError("Could not save your changes. Please try again.");
      const r = await publish(signup);
      if (r.ok) onPublished(r.data.url);
      else setError(r.error);
    });
  }

  function click() {
    if (needsSignup) setOpen(true);
    else run();
  }

  return (
    <div className="space-y-3">
      {!open && (
        <button type="button" onClick={click} disabled={pending} className={`btn btn-dark ${big ? "w-full justify-center text-lg !py-4" : ""} disabled:opacity-60`}>
          {pending ? "Publishing…" : `${label} 🚀`}
        </button>
      )}
      {open && (
        <form
          className="rounded-[var(--radius-inner)] border border-line p-4 space-y-3 bg-white"
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim().length < 2) return setError("Please enter your name");
            if (!unameOk) return setError("Username must be 3-24 letters or numbers");
            run({ name: name.trim(), username: uname, agencyName: agency.trim() || null });
          }}
        >
          <div>
            <h3 className="text-lg">Almost there — set up your site</h3>
            <p className="text-sm text-muted">Your listing will live at your own address. Takes 10 seconds, free forever.</p>
          </div>
          <label className="block">
            <span className="block text-sm font-medium mb-1">Your name</span>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Rahul Sharma" maxLength={60} autoFocus />
          </label>
          <label className="block">
            <span className="block text-sm font-medium mb-1">Username</span>
            <div className="flex items-center gap-2">
              <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="rahulsharma" maxLength={24} autoCapitalize="off" autoCorrect="off" />
              <span className="text-sm text-muted whitespace-nowrap">.{rootDomain}</span>
            </div>
            <span className="block text-xs text-muted mt-1">{uname ? `Your site: ${uname}.${rootDomain}` : "3-24 letters or numbers, no spaces"}</span>
          </label>
          <label className="block">
            <span className="block text-sm font-medium mb-1">Agency (optional)</span>
            <input className="input" value={agency} onChange={(e) => setAgency(e.target.value)} placeholder="Sharma Realty" maxLength={80} />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2 justify-end">
            <button type="button" className="btn btn-light !py-2.5" onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </button>
            <button type="submit" className="btn btn-dark !py-2.5 disabled:opacity-60" disabled={pending}>
              {pending ? "Publishing…" : "Create my site & publish"}
            </button>
          </div>
        </form>
      )}
      {!open && error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
