"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { FileUp, Loader2, Plus, Building2, MapPin, ExternalLink } from "lucide-react";
import clsx from "clsx";
import type { ProjectView } from "@/lib/projects";
import { configLabel, configRange } from "./format";
import { addProjectToListingsAction, createManualProjectAction } from "@/app/dashboard/projects/actions";

type Props = { mine: ProjectView[]; inCity: ProjectView[]; city: string | null };

function PendingButton({ children, className, pendingText }: { children: React.ReactNode; className: string; pendingText: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? (
        <>
          <Loader2 size={16} className="animate-spin" /> {pendingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}

export function ProjectCard({ p, mine }: { p: ProjectView; mine: boolean }) {
  const cover = p.photos[0]?.url ?? null;
  return (
    <article className="card overflow-hidden flex flex-col">
      <div className="h-40 bg-soft relative">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-black/30">
            <Building2 size={36} />
          </div>
        )}
        {mine ? <span className="absolute top-3 left-3 chip !bg-white text-xs">Mine</span> : null}
        {p.listingsCount ? <span className="absolute top-3 right-3 chip !bg-white text-xs">{p.listingsCount} listing{p.listingsCount === 1 ? "" : "s"}</span> : null}
      </div>
      <div className="p-4 flex flex-col gap-1 flex-1">
        <h3 className="text-lg leading-tight">{p.name}</h3>
        {p.developer ? <p className="text-sm text-black/55">{p.developer}</p> : null}
        {p.locality || p.city ? (
          <p className="text-sm text-black/55 flex items-center gap-1">
            <MapPin size={14} /> {[p.locality, p.city].filter(Boolean).join(", ")}
          </p>
        ) : null}
        <p className="text-sm mt-1">
          <span className="font-medium">{configLabel(p.configurations)}</span> · {configRange(p.configurations)}
        </p>
        <div className="flex gap-2 mt-auto pt-3">
          <form action={addProjectToListingsAction.bind(null, p.id)} className="flex-1">
            <PendingButton className="btn btn-dark !py-2.5 !px-4 text-sm w-full justify-center" pendingText="Adding…">
              <Plus size={16} /> Add to my listings
            </PendingButton>
          </form>
          <Link href={`/dashboard/projects/${p.id}`} className="btn btn-light !py-2.5 !px-4 text-sm">
            Open
          </Link>
        </div>
      </div>
    </article>
  );
}

export function ProjectLibrary({ mine, inCity, city }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<"mine" | "city">(mine.length || !inCity.length ? "mine" : "city");
  const [reading, setReading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setError(null);
    setReading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/projects", { method: "POST", body: form });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error ?? "Could not read the brochure");
      router.push(`/dashboard/projects/${json.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read the brochure");
      setReading(false);
    }
  };

  const list = tab === "mine" ? mine : inCity;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 p-1 rounded-full bg-white">
          <button type="button" onClick={() => setTab("mine")} className={clsx("btn !py-2 !px-4 text-sm", tab === "mine" ? "btn-dark" : "")}>
            My projects <span className="opacity-60">{mine.length}</span>
          </button>
          <button type="button" onClick={() => setTab("city")} className={clsx("btn !py-2 !px-4 text-sm", tab === "city" ? "btn-dark" : "")}>
            Projects in {city ?? "my city"} <span className="opacity-60">{inCity.length}</span>
          </button>
        </div>
        <div className="flex gap-2 ml-auto">
          <input ref={fileRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
          <button type="button" className="btn btn-dark" onClick={() => fileRef.current?.click()} disabled={reading}>
            {reading ? <Loader2 size={18} className="animate-spin" /> : <FileUp size={18} />}
            {reading ? "Reading the brochure…" : "Upload brochure"}
          </button>
          <form action={createManualProjectAction}>
            <PendingButton className="btn btn-light" pendingText="Creating…">
              <Plus size={18} /> Create manually
            </PendingButton>
          </form>
        </div>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {reading ? (
        <div className="panel p-8 flex items-center gap-4">
          <Loader2 size={24} className="animate-spin" />
          <div>
            <p className="font-medium">Reading the brochure…</p>
            <p className="text-sm text-black/55">Pulling out configurations, payment plan, amenities and location advantages. This takes 20–60 seconds.</p>
          </div>
        </div>
      ) : null}
      {list.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((p) => (
            <ProjectCard key={p.id} p={p} mine={tab === "mine"} />
          ))}
        </div>
      ) : (
        <div className="panel p-10 text-center">
          <Building2 size={32} className="mx-auto text-black/30" />
          <p className="mt-3 font-medium">{tab === "mine" ? "No projects yet" : city ? `No shared projects in ${city} yet` : "Set your city in Settings to see projects near you"}</p>
          <p className="text-sm text-black/55 mt-1">Upload a developer brochure PDF and we will build the template for you.</p>
        </div>
      )}
      <p className="text-xs text-black/45 flex items-center gap-1">
        <ExternalLink size={12} /> Projects you create are visible to other channel partners in your city so everyone starts from the same developer facts.
      </p>
    </div>
  );
}
