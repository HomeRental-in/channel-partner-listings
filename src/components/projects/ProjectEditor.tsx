"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { Loader2, Save, Sparkles, Plus, ExternalLink, FileText, Trash2 } from "lucide-react";
import { projectUrl } from "@/lib/site";
import type { ProjectView, ProjectPatch } from "@/lib/projects";
import { addProjectToListingsAction, deleteProjectAction, regenerateProjectDescriptionAction, updateProjectAction } from "@/app/dashboard/projects/actions";
import { ChipListEditor, KeyValueEditor, FeaturesEditor, AMENITY_SUGGESTIONS } from "./ListEditors";
import { ConfigurationsEditor, PaymentPlanEditor, ImageListEditor } from "./TableEditors";

type Props = { project: ProjectView; canEdit: boolean };

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {hint ? <span className="text-xs text-black/50">{hint}</span> : null}
    </label>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="panel p-6 flex flex-col gap-4">
      <div>
        <h2 className="text-xl">{title}</h2>
        {hint ? <p className="text-sm text-black/55">{hint}</p> : null}
      </div>
      {children}
    </section>
  );
}

function PendingButton({ children, className, pendingText }: { children: React.ReactNode; className: string; pendingText: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? <Loader2 size={16} className="animate-spin" /> : null} {pending ? pendingText : children}
    </button>
  );
}

const pick = (p: ProjectView): ProjectPatch => ({
  name: p.name,
  developer: p.developer,
  reraNumber: p.reraNumber,
  reraUrl: p.reraUrl,
  possessionDate: p.possessionDate,
  city: p.city,
  locality: p.locality,
  landmark: p.landmark,
  mapUrl: p.mapUrl,
  description: p.description,
  highlights: p.highlights,
  configurations: p.configurations,
  paymentPlan: p.paymentPlan,
  floorPlans: p.floorPlans,
  amenities: p.amenities,
  locationAdvantages: p.locationAdvantages,
  features: p.features,
  photos: p.photos,
  brochureUrl: p.brochureUrl,
  videoTourUrl: p.videoTourUrl,
});

export function ProjectEditor({ project, canEdit }: Props) {
  const [form, setForm] = useState<ProjectPatch>(() => pick(project));
  const [dirty, setDirty] = useState(false);
  const [saving, startSave] = useTransition();
  const [regenerating, startRegen] = useTransition();
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const ro = !canEdit;

  const set = <K extends keyof ProjectPatch>(k: K, v: ProjectPatch[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setDirty(true);
  };
  const text = (k: keyof ProjectPatch) => ({
    value: (form[k] as string | null | undefined) ?? "",
    disabled: ro,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(k, (e.target.value || null) as never),
  });

  const save = () =>
    startSave(async () => {
      setMsg(null);
      const res = await updateProjectAction(project.id, { ...form, name: form.name?.trim() || "Untitled project" });
      if (res.ok) {
        setDirty(false);
        setMsg({ kind: "ok", text: "Saved" });
      } else setMsg({ kind: "err", text: res.error });
    });

  const regenerate = () =>
    startRegen(async () => {
      setMsg(null);
      const res = await regenerateProjectDescriptionAction(form);
      if (res.ok) {
        setForm((f) => ({ ...f, description: res.description, highlights: res.highlights.slice(0, 6) }));
        setDirty(true);
      } else setMsg({ kind: "err", text: res.error });
    });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px] items-start">
      <div className="flex flex-col gap-6">
        <Section title="Basics">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Project name"><input className="input" placeholder="DLF The Aureva" {...text("name")} /></Field>
            <Field label="Developer"><input className="input" placeholder="DLF" {...text("developer")} /></Field>
            <Field label="RERA number"><input className="input" placeholder="HRERA-PKL-..." {...text("reraNumber")} /></Field>
            <Field label="RERA URL"><input className="input" placeholder="https://haryanarera.gov.in/..." {...text("reraUrl")} /></Field>
            <Field label="Possession"><input className="input" placeholder="Dec 2027" {...text("possessionDate")} /></Field>
            <Field label="Video tour URL" hint="YouTube or Instagram link"><input className="input" placeholder="https://youtu.be/..." {...text("videoTourUrl")} /></Field>
          </div>
        </Section>

        <Section title="Location">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="City"><input className="input" placeholder="Gurgaon" {...text("city")} /></Field>
            <Field label="Locality"><input className="input" placeholder="Sector 63" {...text("locality")} /></Field>
            <Field label="Landmark"><input className="input" placeholder="Near Golf Course Extension Road" {...text("landmark")} /></Field>
            <Field label="Google Maps link"><input className="input" placeholder="https://maps.app.goo.gl/..." {...text("mapUrl")} /></Field>
          </div>
          <Field label="Location advantages" hint="Copied to the listing's neighbourhood section">
            <KeyValueEditor value={form.locationAdvantages ?? []} onChange={(v) => set("locationAdvantages", v)} labelPlaceholder="IGI Airport" valuePlaceholder="30 min" disabled={ro} />
          </Field>
        </Section>

        <Section title="Configurations" hint="Prices in rupees, sizes in sq ft. The lowest 'price from' becomes the listing price.">
          <ConfigurationsEditor value={form.configurations ?? []} onChange={(v) => set("configurations", v)} disabled={ro} />
        </Section>

        <Section title="Payment plan">
          <PaymentPlanEditor value={form.paymentPlan ?? []} onChange={(v) => set("paymentPlan", v)} disabled={ro} />
        </Section>

        <Section title="Floor plans">
          <ImageListEditor value={form.floorPlans ?? []} onChange={(v) => set("floorPlans", v)} kind="floorplan" labelled disabled={ro} />
        </Section>

        <Section title="Photos" hint="Become the listing's photos when a CP adds this project. Upload or paste URLs.">
          <ImageListEditor value={form.photos ?? []} onChange={(v) => set("photos", v.map((x) => ({ url: x.url })))} kind="photo" disabled={ro} />
        </Section>

        <Section title="Description & highlights">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium">Description</span>
            {!ro ? (
              <button type="button" className="btn btn-light !py-2 !px-4 text-sm" onClick={regenerate} disabled={regenerating}>
                {regenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} {regenerating ? "Writing…" : "Regenerate"}
              </button>
            ) : null}
          </div>
          <textarea className="input min-h-40" placeholder="150–220 words for buyers" {...text("description")} />
          <Field label="Highlights" hint="Up to 6, max 6 words each">
            <ChipListEditor value={form.highlights ?? []} onChange={(v) => set("highlights", v)} placeholder="Add a highlight" max={6} disabled={ro} />
          </Field>
        </Section>

        <Section title="Amenities">
          <ChipListEditor value={form.amenities ?? []} onChange={(v) => set("amenities", v)} placeholder="Add an amenity" suggestions={AMENITY_SUGGESTIONS} disabled={ro} />
        </Section>

        <Section title="Feature sections" hint="Grouped label/value tiles, e.g. Space & Layout · Building & Lifestyle · Connectivity">
          <FeaturesEditor value={form.features ?? []} onChange={(v) => set("features", v)} disabled={ro} />
        </Section>
      </div>

      <aside className="panel p-5 flex flex-col gap-3 lg:sticky lg:top-6">
        {canEdit ? (
          <button type="button" className="btn btn-dark justify-center" onClick={save} disabled={saving || !dirty}>
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} {saving ? "Saving…" : dirty ? "Save changes" : "Saved"}
          </button>
        ) : (
          <p className="text-sm text-black/55">Created by another channel partner in your city. You can add it to your listings and edit your own copy.</p>
        )}
        <form action={addProjectToListingsAction.bind(null, project.id)}>
          <PendingButton className="btn btn-light justify-center w-full" pendingText="Adding…">
            <Plus size={18} /> Add to my listings
          </PendingButton>
        </form>
        {dirty && canEdit ? <p className="text-xs text-amber-700">Save before adding so the listing gets your latest edits.</p> : null}
        <a href={projectUrl(project.slug)} target="_blank" rel="noreferrer" className="btn btn-ghost justify-center">
          <ExternalLink size={16} /> Public template page
        </a>
        {project.brochureUrl ? (
          <a href={project.brochureUrl} target="_blank" rel="noreferrer" className="btn btn-ghost justify-center">
            <FileText size={16} /> Developer brochure
          </a>
        ) : null}
        {msg ? <p className={`text-sm ${msg.kind === "ok" ? "text-green-700" : "text-red-600"}`}>{msg.text}</p> : null}
        <div className="hairline pt-3 text-xs text-black/50 flex flex-col gap-1">
          <span>Slug: /p/{project.slug}</span>
          <span>{project.listingsCount} listing{project.listingsCount === 1 ? "" : "s"} use this template</span>
          <Link href="/dashboard/projects" className="underline">Back to library</Link>
        </div>
        {canEdit && project.listingsCount === 0 ? (
          <form action={deleteProjectAction.bind(null, project.id)} onSubmit={(e) => !confirm("Delete this project template?") && e.preventDefault()}>
            <PendingButton className="btn btn-ghost justify-center w-full text-red-600" pendingText="Deleting…">
              <Trash2 size={16} /> Delete project
            </PendingButton>
          </form>
        ) : null}
      </aside>
    </div>
  );
}
