"use client";
import { useCallback, useState } from "react";
import { ShieldCheck } from "lucide-react";
import type { Award, BrokerCard, Testimonial, ThemeKey } from "@/lib/types";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { useToast } from "@/components/ui/Toast";
import { normaliseUsername, validateUsername } from "../username";
import { AvatarUpload } from "./AvatarUpload";
import { ChipsInput, ToggleChips } from "./ChipsInput";
import { DangerZone } from "./DangerZone";
import { LogoUpload } from "./LogoUpload";
import { AwardsEditor, TestimonialsEditor } from "./ListEditors";
import { SaveIndicator } from "./SaveIndicator";
import { ThemePicker } from "./ThemePicker";
import { BROKER_CARD_FIELDS, LANGUAGE_OPTIONS, PROPERTY_TYPE_OPTIONS, RESPONSE_TIME_OPTIONS, type ProfileData, type ResponseTime } from "./types";
import { useAutoSave } from "./useAutoSave";

function Section({ id, title, description, children }: { id?: string; title: string; description?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="card p-6 md:p-7 scroll-mt-24">
      <div className="mb-5">
        <h2 className="text-xl">{title}</h2>
        {description && <p className="text-sm text-muted mt-0.5">{description}</p>}
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

const intOrNull = (s: string) => (s.trim() === "" ? null : Math.max(0, parseInt(s.replace(/\D/g, "") || "0", 10)));

export function SettingsForm({ initial, rootDomain }: { initial: ProfileData; rootDomain: string }) {
  const toast = useToast();
  const { status, error, save } = useAutoSave(useCallback((m: string) => toast.error(m), [toast]));
  const [p, setP] = useState<ProfileData>(initial);
  const [usernameErr, setUsernameErr] = useState<string | null>(null);

  /** Update local state and queue a save. Text fields debounce; toggles save immediately. */
  function set<K extends keyof ProfileData>(key: K, value: ProfileData[K], opts: { immediate?: boolean; patch?: Record<string, unknown> } = {}) {
    setP((cur) => ({ ...cur, [key]: value }));
    const patch = opts.patch ?? { [key]: value };
    save(patch, opts.immediate ? 0 : 700);
  }

  const cleanTestimonials = (t: Testimonial[]) => t.filter((x) => x.quote.trim() && x.author.trim()).map((x) => ({ quote: x.quote.trim(), author: x.author.trim(), role: x.role?.trim() || null }));
  const cleanAwards = (a: Award[]) => a.filter((x) => x.title.trim()).map((x) => ({ title: x.title.trim(), year: x.year?.trim() || null, by: x.by?.trim() || null }));

  return (
    <div className="flex flex-col gap-4">
      <div className="sticky top-[60px] z-20 flex justify-end -mb-2 pointer-events-none">
        <div className="pointer-events-auto">
          <SaveIndicator status={status} error={error} />
        </div>
      </div>

      <Section id="profile" title="My profile" description="What buyers see on your site and on every listing's broker card.">
        <AvatarUpload url={p.avatarUrl} name={p.name} onChange={(url) => set("avatarUrl", url, { immediate: true })} />
        <LogoUpload url={p.logoUrl} onChange={(url) => set("logoUrl", url, { immediate: true })} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Full name" value={p.name} onChange={(e) => set("name", e.target.value)} placeholder="Your name" maxLength={80} />
          <Input label="Agency" value={p.agencyName} onChange={(e) => set("agencyName", e.target.value)} placeholder="Agency or brand name" maxLength={80} />
          <Input label="Phone (login)" value={p.phone} readOnly hint="Your login identity. Contact support to change it." className="!bg-bg text-muted" />
          <Input label="WhatsApp number" value={p.whatsappNumber} onChange={(e) => set("whatsappNumber", e.target.value)} placeholder={p.phone} hint="Buyers message this number. Leave blank to use your phone." inputMode="tel" />
          <Input label="City" value={p.city} onChange={(e) => set("city", e.target.value)} placeholder="Gurgaon" maxLength={60} />
          <Input
            label="Website address"
            value={p.username}
            suffix={`.${rootDomain}`}
            autoComplete="off"
            spellCheck={false}
            onChange={(e) => {
              const u = e.target.value.toLowerCase();
              setP((cur) => ({ ...cur, username: u }));
              const n = normaliseUsername(u);
              const err = validateUsername(n);
              setUsernameErr(err);
              if (!err) save({ username: n }, 900);
            }}
            error={usernameErr}
            hint="3–24 lowercase letters or numbers."
          />
        </div>
        <div className="rounded-2xl bg-soft p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <ShieldCheck size={22} className="shrink-0 text-emerald-600" />
          <div className="flex-1">
            <p className="text-sm font-medium">Add your RERA number</p>
            <p className="text-xs text-muted">Listings with a RERA number get a verified badge and more replies from buyers.</p>
          </div>
          <Input value={p.reraNumber} onChange={(e) => set("reraNumber", e.target.value)} placeholder="e.g. HRERA-PKL-REA-1234" maxLength={60} wrapperClassName="sm:w-64" className="!bg-white" aria-label="RERA number" />
        </div>
        <Textarea label="Bio" value={p.bio} onChange={(e) => set("bio", e.target.value.slice(0, 300))} maxLength={300} counter placeholder="Two or three lines on who you help and where." />
        <div className="grid gap-4 sm:grid-cols-3">
          <Input label="Years of experience" inputMode="numeric" value={p.yearsExperience ?? ""} onChange={(e) => set("yearsExperience", intOrNull(e.target.value))} placeholder="8" />
          <Input label="Deals closed" inputMode="numeric" value={p.dealsClosed ?? ""} onChange={(e) => set("dealsClosed", intOrNull(e.target.value))} placeholder="120" />
          <Select
            label="Typical response time"
            value={p.responseTime}
            onChange={(e) => set("responseTime", e.target.value as ResponseTime | "", { immediate: true, patch: { responseTime: e.target.value || null } })}
            options={RESPONSE_TIME_OPTIONS}
            placeholder="Choose…"
          />
        </div>
        <ChipsInput label="Areas you serve" hint="Press Enter after each area." value={p.areas} onChange={(v) => set("areas", v, { immediate: true })} placeholder="Sector 63, Golf Course Road, Noida Expressway…" />
        <ToggleChips label="Property types" options={PROPERTY_TYPE_OPTIONS} value={p.propertyTypes} onChange={(v) => set("propertyTypes", v, { immediate: true })} />
        <ToggleChips label="Languages" options={LANGUAGE_OPTIONS} value={p.languages} onChange={(v) => set("languages", v, { immediate: true })} />
      </Section>

      <Section id="social-proof" title="Social proof" description="Shown on your storefront and PDF brochures.">
        <TestimonialsEditor value={p.testimonials} onChange={(v) => set("testimonials", v, { patch: { testimonials: cleanTestimonials(v) } })} />
        <div className="hairline" />
        <AwardsEditor value={p.awards} onChange={(v) => set("awards", v, { patch: { awards: cleanAwards(v) } })} />
      </Section>

      <Section id="broker-card" title="Broker card defaults" description="Applied to every listing unless you override it in the editor.">
        {BROKER_CARD_FIELDS.map((f) => (
          <Switch
            key={f.key}
            label={f.label}
            description={f.description}
            checked={p.brokerCard[f.key]}
            onChange={(on) => {
              const next: BrokerCard = { ...p.brokerCard, [f.key]: on };
              set("brokerCard", next, { immediate: true });
            }}
          />
        ))}
      </Section>

      <Section id="theme" title="Default theme" description="New listings and your storefront use this look. Each listing can pick its own.">
        <ThemePicker value={p.defaultTheme} onChange={(t: ThemeKey) => set("defaultTheme", t, { immediate: true })} />
      </Section>

      <Section id="preferences" title="Preferences">
        <Switch label="Daily report on WhatsApp" description="Every morning at 8:00 IST: views, taps and who to call back. Only sent when there's activity." checked={p.dailyReport} onChange={(on) => set("dailyReport", on, { immediate: true })} />
      </Section>

      <DangerZone phone={p.phone} />
    </div>
  );
}
