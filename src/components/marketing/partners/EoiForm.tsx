"use client";

import { startTransition, useActionState, useState, type FormEvent } from "react";
import { ArrowRight, Check } from "lucide-react";
import clsx from "clsx";
import { submitEoi, type EoiState } from "@/app/(marketing)/partners/actions";
import { CURRENT_TOOLS, INVENTORY, MONTHLY_LINKS, TEAM_SIZES } from "@/lib/partners";

type CityOption = { slug: string; name: string };
const SOURCE_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "ref"];

export default function EoiForm({ cities, defaultCity }: { cities: CityOption[]; defaultCity?: string }) {
  const [state, action, pending] = useActionState<EoiState, FormData>(submitEoi, { ok: false });
  const [city, setCity] = useState(defaultCity && cities.some((c) => c.slug === defaultCity) ? defaultCity : "");
  const err = state.fieldErrors ?? {};

  // Submit via the dispatcher (not `action={}`) so React doesn't reset the fields when validation fails.
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    // Attribution: which campaign / page brought this firm in.
    const sp = new URLSearchParams(window.location.search);
    data.set("path", window.location.pathname);
    for (const k of SOURCE_KEYS) if (sp.get(k)) data.set(k, sp.get(k)!);
    startTransition(() => action(data));
  }

  if (state.ok) {
    return (
      <div className="card flex flex-col items-start gap-4 p-8 md:p-10" role="status">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-ink text-white">
          <Check size={22} />
        </span>
        <h3 className="mk-h3">You&apos;re on the list{state.tier ? ` as a ${state.tier}` : ""}.</h3>
        <p className="mk-muted text-base md:text-lg">
          We&apos;ve sent a confirmation on WhatsApp. Our partnerships team reviews every registration by hand and will reach you
          within one working day to plan onboarding.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card relative flex flex-col gap-5 p-6 md:p-10" noValidate>
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Your name" error={err.contactName}>
          <input name="contactName" className="input" autoComplete="name" required />
        </Field>
        <Field label="Role" optional>
          <input name="role" className="input" placeholder="Founder, Sales head…" />
        </Field>
        <Field label="Firm / agency name" error={err.agencyName}>
          <input name="agencyName" className="input" autoComplete="organization" required />
        </Field>
        <Field label="WhatsApp number" error={err.phone}>
          <input name="phone" className="input" type="tel" inputMode="tel" autoComplete="tel" placeholder="98xxxxxxxx" required />
        </Field>
        <Field label="Email" optional error={err.email}>
          <input name="email" className="input" type="email" autoComplete="email" />
        </Field>
        <Field label="Main city" error={err.city}>
          <select name={city === "other" ? undefined : "city"} className="input" value={city} onChange={(e) => setCity(e.target.value)} required>
            <option value="" disabled>
              Choose a city
            </option>
            {cities.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
            <option value="other">Other city</option>
          </select>
        </Field>
        {city === "other" && (
          <Field label="Which city?" error={err.city} className="md:col-span-2">
            <input name="city" className="input" required />
          </Field>
        )}
        <Field label="Micro-markets you dominate" optional hint="Comma separated, e.g. Dwarka Expressway, Sector 65" className="md:col-span-2">
          <input name="localities" className="input" />
        </Field>
      </div>

      <Choice name="inventory" legend="Active listings / units you carry in this city" options={INVENTORY} error={err.inventory} />
      <Choice name="monthlyLinks" legend="Property links your team shares a month" options={MONTHLY_LINKS} error={err.monthlyLinks} />
      <Choice name="teamSize" legend="Team size (sales + sourcing)" options={TEAM_SIZES} error={err.teamSize} />

      <fieldset>
        <legend className="mb-2 text-sm font-medium">What do you use today? <span className="mk-muted font-normal">(optional)</span></legend>
        <div className="flex flex-wrap gap-2">
          {CURRENT_TOOLS.map((t) => (
            <label key={t} className="chip cursor-pointer has-[:checked]:bg-ink has-[:checked]:text-white">
              <input type="checkbox" name="currentTools" value={t} className="sr-only" />
              {t}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="RERA agent number" optional>
          <input name="reraNumber" className="input" />
        </Field>
        <Field label="Anything we should know?" optional>
          <input name="message" className="input" placeholder="Developers you represent, launches coming up…" />
        </Field>
      </div>

      {state.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="mk-muted text-sm">Free for you and your whole team. We only use these details to contact you about onboarding.</p>
        <button type="submit" className="btn btn-dark justify-center text-base md:text-lg" disabled={pending}>
          {pending ? "Sending…" : "Register interest"} <ArrowRight size={18} />
        </button>
      </div>
    </form>
  );
}

function Field(props: { label: string; optional?: boolean; hint?: string; error?: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={clsx("flex flex-col gap-1.5", props.className)}>
      <span className="text-sm font-medium">
        {props.label} {props.optional && <span className="mk-muted font-normal">(optional)</span>}
      </span>
      {props.children}
      {props.error ? <span className="text-sm text-red-600">{props.error}</span> : props.hint && <span className="mk-muted text-sm">{props.hint}</span>}
    </label>
  );
}

function Choice(props: { name: string; legend: string; options: { id: string; label: string }[]; error?: string }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium">{props.legend}</legend>
      <div className="flex flex-wrap gap-2">
        {props.options.map((o) => (
          <label key={o.id} className="chip cursor-pointer has-[:checked]:bg-ink has-[:checked]:text-white has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ink">
            <input type="radio" name={props.name} value={o.id} className="sr-only" required />
            {o.label}
          </label>
        ))}
      </div>
      {props.error && <p className="mt-1.5 text-sm text-red-600">{props.error}</p>}
    </fieldset>
  );
}
