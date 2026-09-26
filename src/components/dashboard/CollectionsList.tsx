"use client";
import { useState, useTransition } from "react";
import Image from "next/image";
import { ExternalLink, FolderOpen, ImageOff, Pencil, Plus, Trash2 } from "lucide-react";
import { deleteCollection } from "@/app/dashboard/collections/actions";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { CollectionDialog, type CollectionFormValue, type PickableListing } from "./CollectionDialog";
import { CopyButton } from "./CopyButton";

export type CollectionRow = { id: string; slug: string; title: string; description: string | null; url: string; listingIds: string[]; covers: string[]; updatedAt: string };

export function CollectionsList({ collections, listings }: { collections: CollectionRow[]; listings: PickableListing[] }) {
  const [editing, setEditing] = useState<CollectionFormValue | null | undefined>(undefined); // undefined = closed, null = new
  const [confirm, setConfirm] = useState<CollectionRow | null>(null);
  const [pending, start] = useTransition();
  const toast = useToast();

  const openNew = () => setEditing(null);
  const dialogOpen = editing !== undefined;

  return (
    <>
      <div className="flex items-end justify-between gap-3 px-1">
        <div>
          <h1 className="text-3xl">Collections</h1>
          <p className="text-muted mt-1">Group listings for a buyer and share one link.</p>
        </div>
        <button type="button" onClick={openNew} className="btn btn-dark">
          <Plus size={18} /> New collection
        </button>
      </div>

      {collections.length === 0 ? (
        <EmptyState
          icon={<FolderOpen size={22} />}
          title="No collections yet"
          description="Pick a few live listings — “3 BHKs under 3 Cr in Sector 63” — and send the buyer a single link."
          action={
            <button type="button" onClick={openNew} className="btn btn-dark">
              <Plus size={18} /> Create your first collection
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {collections.map((c) => (
            <article key={c.id} className="card overflow-hidden flex flex-col">
              <div className="grid grid-cols-3 gap-0.5 aspect-[3/1.4] bg-soft">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="relative bg-soft">
                    {c.covers[i] ? <Image src={c.covers[i]} alt="" fill sizes="33vw" className="object-cover" unoptimized /> : <ImageOff size={16} className="absolute inset-0 m-auto text-black/20" />}
                  </div>
                ))}
              </div>
              <div className="p-4 flex-1">
                <h2 className="text-lg font-medium leading-snug">{c.title}</h2>
                <p className="text-sm text-muted mt-0.5">
                  {c.listingIds.length} listing{c.listingIds.length === 1 ? "" : "s"}
                </p>
                {c.description && <p className="mt-2 text-sm text-black/70 line-clamp-2">{c.description}</p>}
                <p className="mt-2 truncate text-xs text-muted">{c.url.replace(/^https?:\/\//, "")}</p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 border-t border-line px-3 py-2.5">
                <CopyButton text={c.url} className="btn btn-dark !py-2 !px-3 text-sm" />
                <a href={c.url} target="_blank" rel="noreferrer" className="btn btn-light !py-2 !px-3 text-sm">
                  <ExternalLink size={15} /> Open
                </a>
                <button type="button" onClick={() => setEditing({ id: c.id, title: c.title, description: c.description ?? "", listingIds: c.listingIds })} className="btn btn-light !py-2 !px-3 text-sm ml-auto">
                  <Pencil size={15} /> Edit
                </button>
                <button type="button" onClick={() => setConfirm(c)} className="icon-btn !w-9 !h-9 hover:!bg-red-50 hover:text-red-600" aria-label="Delete collection">
                  <Trash2 size={15} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <CollectionDialog open={dialogOpen} onClose={() => setEditing(undefined)} listings={listings} initial={editing ?? null} />
      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        loading={pending}
        onConfirm={() => {
          const c = confirm;
          if (!c) return;
          start(async () => {
            const r = await deleteCollection(c.id);
            if (r.ok) toast.success("Collection deleted");
            else toast.error(r.error);
            setConfirm(null);
          });
        }}
        title={`Delete “${confirm?.title}”?`}
        description="The shared link will stop working. Listings themselves are not affected."
        confirmLabel="Delete"
        danger
      />
    </>
  );
}
