"use client";
import { useState, useTransition } from "react";
import { Check, ExternalLink, Globe, Pencil } from "lucide-react";
import { updateUsername } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { normaliseUsername, validateUsername } from "./username";
import { CopyButton } from "./CopyButton";

export function SiteCard({ username, rootDomain, siteHref, suggested }: { username: string | null; rootDomain: string; siteHref: string | null; suggested: string }) {
  const [editing, setEditing] = useState(!username);
  const [value, setValue] = useState(username ?? suggested);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const toast = useToast();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const u = normaliseUsername(value);
    const err = validateUsername(u);
    if (err) return setError(err);
    start(async () => {
      const res = await updateUsername(u);
      if (!res.ok) return setError(res.error);
      setError(null);
      setEditing(false);
      toast.success(username ? "Address updated" : "Your website is live");
    });
  }

  return (
    <section id="address" className="card p-6 md:p-7 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-soft">
            <Globe size={20} />
          </span>
          <div>
            <p className="eyebrow">{username ? "Your website" : "Your address"}</p>
            <h2 className="text-xl md:text-2xl mt-0.5">{username ? "Your website is live" : "Claim your address"}</h2>
          </div>
        </div>
        {username && !editing && (
          <span className="chip !bg-emerald-100 !text-emerald-800 text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Live
          </span>
        )}
      </div>

      {editing ? (
        <form onSubmit={submit} className="flex flex-col gap-3">
          <Input
            label={username ? "New address" : "Pick a short, memorable address"}
            value={value}
            onChange={(e) => { setValue(e.target.value.toLowerCase()); setError(null); }}
            suffix={`.${rootDomain}`}
            error={error}
            hint="3–24 characters, letters and numbers only. Buyers will see this on every link."
            autoComplete="off"
            spellCheck={false}
            autoFocus
          />
          <div className="flex gap-2">
            <Button type="submit" loading={pending}>
              <Check size={16} /> {username ? "Save address" : "Claim address"}
            </Button>
            {username && (
              <Button type="button" variant="light" onClick={() => { setEditing(false); setValue(username); setError(null); }}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      ) : (
        <>
          <div className="flex items-center gap-2 rounded-2xl bg-soft p-2 pl-4">
            <span className="flex-1 truncate text-[15px] font-medium">{siteHref?.replace(/^https?:\/\//, "")}</span>
            <CopyButton text={siteHref ?? ""} className="btn btn-dark !py-2 !px-3.5 text-sm" />
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={siteHref ?? "#"} target="_blank" rel="noreferrer" className="btn btn-light !py-2.5 !px-4 text-sm">
              <ExternalLink size={15} /> Open site
            </a>
            <button type="button" onClick={() => setEditing(true)} className="btn btn-ghost !py-2.5 !px-4 text-sm">
              <Pencil size={15} /> Edit address
            </button>
          </div>
        </>
      )}
    </section>
  );
}
