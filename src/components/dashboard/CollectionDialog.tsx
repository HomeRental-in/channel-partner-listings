"use client";
import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, Check, ImageOff, Search, X } from "lucide-react";
import { createCollection, updateCollection } from "@/app/dashboard/collections/actions";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";

export type PickableListing = { id: string; title: string; priceDisplay: string; locality: string | null; bhk: string | null; cover: string | null };
export type CollectionFormValue = { id?: string; title: string; description: string; listingIds: string[] };

export function CollectionDialog({ open, onClose, listings, initial }: { open: boolean; onClose: () => void; listings: PickableListing[]; initial?: CollectionFormValue | null }) {
  return (
    <Dialog open={open} onClose={onClose} title={initial?.id ? "Edit collection" : "New collection"} description="Pick a few live listings and share them as one link." size="lg">
      {/* The form mounts fresh each time the dialog opens, so its state resets without effects. */}
      <CollectionForm key={initial?.id ?? "new"} listings={listings} initial={initial ?? null} onClose={onClose} />
    </Dialog>
  );
}

function CollectionForm({ listings, initial, onClose }: { listings: PickableListing[]; initial: CollectionFormValue | null; onClose: () => void }) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [ids, setIds] = useState<string[]>(initial?.listingIds ?? []);
  const [q, setQ] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const toast = useToast();

  const byId = useMemo(() => new Map(listings.map((l) => [l.id, l])), [listings]);
  const selected = ids.map((id) => byId.get(id)).filter((l): l is PickableListing => !!l);
  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return listings.filter((l) => !ids.includes(l.id) && (!needle || [l.title, l.locality, l.bhk, l.priceDisplay].some((v) => v?.toLowerCase().includes(needle))));
  }, [listings, ids, q]);

  function move(i: number, dir: -1 | 1) {
    setIds((cur) => {
      const j = i + dir;
      if (j < 0 || j >= cur.length) return cur;
      const next = [...cur];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const payload = { title, description, listingIds: ids };
      const res = initial?.id ? await updateCollection(initial.id, payload) : await createCollection(payload);
      if (!res.ok) return setError(res.error);
      toast.success(initial?.id ? "Collection updated" : "Collection created");
      onClose();
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Input label="Title" placeholder="3 BHKs under ₹3 Cr in Sector 63" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} error={error} required data-autofocus />
      <Textarea label="Description (optional)" placeholder="A short note buyers see at the top of the page" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={300} counter className="!min-h-[72px]" />

      <div>
        <p className="text-sm font-medium mb-1.5">Listings in this collection ({selected.length})</p>
        {selected.length === 0 ? (
          <p className="rounded-xl bg-soft px-4 py-3 text-sm text-muted">Nothing selected yet — search below to add listings.</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {selected.map((l, i) => (
              <li key={l.id} className="flex items-center gap-3 rounded-xl border border-line p-2">
                <Thumb url={l.cover} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{l.title}</p>
                  <p className="truncate text-xs text-muted">{[l.priceDisplay, l.locality, l.bhk].filter(Boolean).join(" · ")}</p>
                </div>
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="icon-btn !w-8 !h-8 disabled:opacity-30" aria-label="Move up">
                  <ArrowUp size={14} />
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === selected.length - 1} className="icon-btn !w-8 !h-8 disabled:opacity-30" aria-label="Move down">
                  <ArrowDown size={14} />
                </button>
                <button type="button" onClick={() => setIds((c) => c.filter((x) => x !== l.id))} className="icon-btn !w-8 !h-8 hover:!bg-red-50 hover:text-red-600" aria-label="Remove">
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <label className="relative block">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search your live listings…" className="input !pl-11" aria-label="Search listings" />
        </label>
        <ul className="mt-2 max-h-56 overflow-y-auto flex flex-col gap-1">
          {results.length === 0 && <li className="px-2 py-3 text-sm text-muted">{listings.length === 0 ? "You have no live listings yet." : "No more listings match."}</li>}
          {results.map((l) => (
            <li key={l.id}>
              <button type="button" onClick={() => setIds((c) => [...c, l.id])} className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-soft">
                <Thumb url={l.cover} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{l.title}</span>
                  <span className="block truncate text-xs text-muted">{[l.priceDisplay, l.locality, l.bhk].filter(Boolean).join(" · ")}</span>
                </span>
                <span className="chip text-xs">Add</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="light" onClick={onClose} disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" loading={pending}>
          <Check size={16} /> {initial?.id ? "Save changes" : "Create collection"}
        </Button>
      </div>
    </form>
  );
}

function Thumb({ url }: { url: string | null }) {
  return (
    <span className="relative block h-10 w-14 shrink-0 overflow-hidden rounded-lg bg-soft">
      {url ? <Image src={url} alt="" fill sizes="56px" className="object-cover" unoptimized /> : <ImageOff size={14} className="absolute inset-0 m-auto text-muted" />}
    </span>
  );
}
