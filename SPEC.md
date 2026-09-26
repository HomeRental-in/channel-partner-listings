# Channel Partner Listings — Product Spec (v1)

Working brand name: **YourAddress** (configurable via `NEXT_PUBLIC_BRAND_NAME`). A free, WhatsApp-first listing
tool for Indian real-estate channel partners (CPs). Every CP gets `username.<ROOT_DOMAIN>`; every listing is a
fast, branded page with WhatsApp/Call CTAs. The product is free. The business value is the Meta pixel audience
built from **buyers who open the links** (never the CPs, never buyer PII).

Competitors we match feature-for-feature: estatedeck.in and propsite.in. See "Parity" below.

## Non-negotiables

1. **Free.** No credits, no plans, no payment gateway, no "credits left" UI anywhere.
2. **No buyer PII.** We never ask a buyer for name/phone/email. The only buyer-adjacent data is the optional
   `?n=` first-name query parameter a CP appends to a link, which is stripped from the URL before any pixel fires
   and is never sent to Meta or written to server logs.
3. **One root domain.** All CP sites are subdomains of `ROOT_DOMAIN` so the Meta cookie is shared across every
   listing. Dev: `username.localhost:3000` (works in Chrome without hosts edits).
4. **Pixel + CAPI on every public page.** `ViewContent` (content_ids=[listingId], content_category=city,
   custom: price_band, configuration, cp_username, project_slug), `Contact` on WhatsApp/Call tap, `Lead` never.
   Server-side CAPI mirrors each browser event with the same `event_id` for deduplication. First-party cookie
   `cd_vid` (random id, 180 days) gives unique-viewer counts.
5. **Everything the competitors have** (list below) ships in v1, except Co-Agent link (v1.5).

## Personas & flows

- **CP (channel partner / broker)** — creates listings via WhatsApp or web, shares links, reads daily report.
- **Buyer** — opens a link on WhatsApp, browses photos, taps WhatsApp/Call. Never signs up.

### Flow A — WhatsApp intake
1. CP messages "Hi" to `WHATSAPP_INTAKE_NUMBER`. Bot replies with instructions (Hindi/Hinglish/English ok).
2. CP sends photos + rough text (any order, multiple messages). Bot acknowledges each ("Got 3 photos so far").
3. CP types **DONE** (also accept "done", "ho gaya", "bas", "finish"). Bot runs AI extraction → creates a
   DRAFT listing → replies with the private review link `https://<ROOT_DOMAIN>/review/<listingId>?t=<token>`.
4. Unknown phone → a User row is created on first message (phone only). Signup is completed at publish time
   (name + username). Existing users skip signup.
5. Review page (no login needed with token): photo grid (drag reorder, star = cover, remove), all extracted
   fields editable, AI description with "Rewrite from details", highlights, "What you originally sent us"
   collapsed. **Publish** → if user has no username, ask name + username → listing goes LIVE →
   show link + WhatsApp share + "Open dashboard".

### Flow B — Web intake
`/dashboard/listings/new`: upload photos, optional video, a free-text "Describe your property" box → AI extracts
→ lands on the same editor at step 2 (Details).

### Flow C — Project (CP-first)
- `Project` is a **template** of developer facts (name, RERA, configurations, payment plan, floor plans,
  amenities, location advantages, brochure). Created by uploading a developer brochure PDF (AI ingestion) or by
  form.
- "Add project to my listings" **copies** template fields into a new Listing owned by the CP (`projectId` kept
  only for analytics grouping). CP overrides anything; contact card is always the CP's.
- Project library page `/dashboard/projects` lists templates in the CP's city + ones they created.

### Flow D — Share & personalise
- Every public listing URL accepts `?n=<FirstName>` (hyphen = space, Unicode ok). Page renders "Hi Rahul 👋"
  strip above the hero and OG title becomes "For Rahul · <title>". The param is read on the server, removed
  client-side via `history.replaceState` before the pixel initialises, and stored on `AnalyticsEvent.viewerName`.
- Share modal on listing card: Copy link, WhatsApp share (prefilled text), "Personalise for a buyer" (name
  field → copies link with `?n=`), Download PDF brochure, Story image, Story video.

### Flow E — Analytics & daily report
- `/dashboard/analytics`: totals (views, unique viewers, WhatsApp taps, call taps, brochure downloads,
  conversion), per-listing table, "Named viewers" table per listing (name, opens, last seen, brochure, repeat),
  "Call tomorrow" list (named rows with ≥2 opens or a download).
- Daily report (cron `POST /api/cron/daily-report` with `CRON_SECRET`, 8:00 IST): stored in `DailyReport` and
  sent via WhatsApp provider. Five lines max + link. Also shown in-app under Notifications.

## Parity checklist (must all exist in v1)

Dashboard: home (greeting, site card with copy/edit address, create button, stat tiles, recent listings,
notifications bell, 5-step "How it works" modal) · My Listings (search, All/Live/Draft, cards with Share/Edit/
Delete, Live/Sold/Rented toggle) · Collections (title, description, pick listings, one link, public page) ·
Projects · Analytics · Agency (create agency → 7-digit code, join by code, member list, shared storefront) ·
Settings/profile (photo, name, agency, phone, WhatsApp, city, username, RERA nudge, bio ≤300, experience, deals,
areas chips, property types, languages, response time, testimonials ≤3, awards ≤6, broker card defaults,
default theme, daily report toggle, sign out, delete account).

Editor (3 steps: Photos / Details / Done): photos ≤20 @10MB, drag reorder, cover, room tags, one video ≤100MB ·
category (6), headline, property type, transaction, currency, negotiable, multiple price lines, all basic
fields, location + map link + form link, custom feature grid with editable sections and "move to section",
amenities checklist (33+), AI description + regenerate, highlights (≤6, reorderable), urgency badge,
neighbourhood highlights, price history note, documents (≤5 PDFs @25MB, custom section title), broker card
per-listing override, theme picker (3 themes with live preview), listing quality score with hints · Done:
link, copy, WhatsApp share, personalise, PDF, story image, story video editor.

Public: storefront (hero, avatar, name, agency, stats, WhatsApp/Call, groups via Organise, listing grid,
"Powered by") · listing page (gallery + lightbox, price + per-sqft, quick-question WhatsApp buttons, highlights,
about + show more, feature tiles by section, amenities, neighbourhood, map embed, documents, video, broker
card, sticky CTA bar, share, OG image) · collection page · theme applies to listing page + storefront.

Outputs: PDF brochure (server-rendered) · Story image 1080×1920 PNG · Story video editor (slides from photos,
editable captions, price slide, contact card, Zoom/Slide/Fade, speed, music toggle, 30s warning, export WebM →
MP4 via ffmpeg when available).

Marketing: landing page in the eloqwnt.com visual language (see DESIGN.md), /how-it-works anchor, /sample
listing, /privacy, /terms, /login.

## Out of scope (v1)
Payments/plans, blog, calculators, public city directory, Co-Agent link (v1.5), buyer forms/CRM, retargeting
product for CPs, custom domains, Hindi dashboard UI.

## Themes (all three ship; must differ in fonts, colours, layout and motion)
- **EDITORIAL** — cream/ink, serif display (Fraunces) + Inter, magazine layout: left sticky price/CTA column,
  large hero photo, hairline dividers, slow fade-up reveals.
- **MIDNIGHT** — near-black/graphite, Space Grotesk, electric accent, full-bleed parallax hero, slide-in cards,
  bottom-sheet CTA on mobile, glowing WhatsApp button.
- **SUNRISE** — warm sand/coral, Outfit rounded, bento grid of photos + facts, spring "pop" reveals, pill chips.
