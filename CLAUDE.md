@AGENTS.md

# Channel Partner Listings — conventions for everyone working in this repo

Read `SPEC.md` (product), `DESIGN.md` (visual language), `docs/NEXTJS16.md` (framework gotchas) and
`prisma/schema.prisma` (data model) before writing code.

## Stack
Next.js 16 App Router (Turbopack) · React 19 · TypeScript · Tailwind v4 (tokens in `src/app/globals.css`) ·
Prisma 6 + Postgres (`DATABASE_URL`) · `openai` (`src/lib/ai.ts`) · GSAP + Lenis for motion ·
lucide-react icons · sharp · @react-pdf/renderer · jose · nanoid · zod · date-fns · clsx.
Do **not** add dependencies; everything needed is installed. Do not edit `package.json` or `prisma/schema.prisma`
without coordinating (schema changes: add fields only, then run `npx prisma db push && npx prisma generate`).

## Commands
`npm run dev` (http://localhost:3000; CP sites at http://<username>.localhost:3000) · `npx tsc --noEmit` ·
`npx eslint src` · `npx prisma studio`.

## Shared libraries (use these, don't re-implement)
- `src/lib/db.ts` — `db` Prisma client.
- `src/lib/auth.ts` — `getCurrentUser()`, `requireUser()`, OTP + session helpers, `signReviewToken()/verifyReviewToken()`.
- `src/lib/site.ts` — `ROOT_DOMAIN`, `BRAND`, `siteUrl()`, `listingUrl(username, slug, viewerName?)`, `collectionUrl()`, `waLink()`, `telLink()`.
- `src/lib/format.ts` — `formatINR()`, `parseINR()`, `priceBand()`, `slugify()`, `uniqueSlug()`, `perSqft()`.
- `src/lib/storage.ts` — `storeImage()`, `storeFile()`, `readStored()`, `absoluteUrl()`.
- `src/lib/ai.ts` — `extractListing()`, `rewriteDescription()`, `extractProjectFromBrochure()`, `qualityScore()`.
- `src/lib/analytics.ts` — `recordEvent()`, `getOwnerStats()`, `getListingStats()`, `getNamedViewers()`.
- `src/lib/whatsapp/provider.ts` — `getProvider()` (mock/meta/ultramsg).
- `src/proxy.ts` — subdomain → `/sites/[username]` rewrite + `cd_vid` visitor cookie.

## Route map (URL → file)
Marketing: `/`, `/sample`, `/privacy`, `/terms` → `src/app/(marketing)/…`
Auth: `/login` → `src/app/login/page.tsx`; `POST /api/auth/otp`, `POST /api/auth/verify`, `POST /api/auth/logout`.
Review (token, no login): `/review/[listingId]?t=` → `src/app/review/[listingId]/page.tsx`.
Dashboard (auth): `/dashboard`, `/dashboard/listings`, `/dashboard/listings/new`, `/dashboard/listings/[id]`
(editor, `?step=photos|details|done`), `/dashboard/listings/[id]/story` (video editor), `/dashboard/collections`,
`/dashboard/projects`, `/dashboard/projects/[id]`, `/dashboard/analytics`, `/dashboard/agency`, `/dashboard/settings`.
Public (subdomain-rewritten): `src/app/sites/[username]/page.tsx` (storefront), `sites/[username]/l/[slug]/page.tsx`,
`sites/[username]/c/[slug]/page.tsx`. Root fallbacks: `/l/[slug]`, `/c/[slug]`, `/p/[slug]` (project template page).
Outputs: `GET /api/listings/[id]/brochure.pdf`, `GET /api/listings/[id]/story.png`, `POST /api/listings/[id]/story-video`.
Tracking: `POST /api/track` (browser → server, mirrors to Meta CAPI). WhatsApp: `GET|POST /api/whatsapp/webhook`,
`POST /api/whatsapp/simulate` (dev). Cron: `POST /api/cron/daily-report` (header `x-cron-secret`).
Uploads: `POST /api/upload` (multipart: `file`, `kind=photo|video|document|avatar|brochure`).

## Conventions
- Server Components by default; `"use client"` only for interactivity. Mutations via Server Actions in
  `src/app/**/actions.ts` (always `await requireUser()` and verify ownership: `where: { id, userId: user.id }`).
- `params`/`searchParams` are Promises — `await` them. `cookies()`/`headers()` are async.
- Never enable `cacheComponents`/`'use cache'`. Public pages read fresh data; add `export const dynamic = "force-dynamic"` where needed.
- Money: store rupees as Float; display with `formatINR`. Phones: E.164 with `+`.
- JSON columns: parse defensively (`Array.isArray(x) ? x : []`). Types for JSON shapes live in `src/lib/types.ts`.
- No buyer PII anywhere. `?n=` is stripped client-side before the pixel loads (see `src/components/public/Personalise.tsx`).
- Components: `src/components/ui/*` (shared primitives), `src/components/marketing/*`, `src/components/dashboard/*`,
  `src/components/public/*`, `src/components/themes/{editorial,midnight,sunrise}/*`.
- Use the tokens/classes in `globals.css` (`.panel`, `.card`, `.btn .btn-dark`, `.input`, `.chip`, `.eyebrow`).
- Keep files under ~400 lines; split components. No `any` unless commented.
- Run `npx tsc --noEmit` before you finish; fix every error you introduced.
