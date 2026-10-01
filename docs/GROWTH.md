# Growth plan — SEO, AEO + Founding Partner EOI

**Goal:** sign up as many channel partners as possible, prioritising **large CP firms that can put 1,000+
property links from a single location** on the platform. Every link a buyer opens grows the Meta audience
(SPEC.md), so volume per location is the metric that matters, not the number of accounts.

## 1. What's built (code)

| Piece | Where | Purpose |
|---|---|---|
| Founding Partner page + EOI form | `/partners` · `src/app/(marketing)/partners/` | Converts large firms. Captures city, micro-markets, inventory, links/month, team size, current tools, UTM. |
| Tiering + score | `src/lib/partners.ts` | `FOUNDING` = 1,000+ inventory **or** 1,000+ links/mo **or** 200+ team. Score 0–100 ranks the queue. |
| EOI store | `PartnerEoi` model (`prisma/schema.prisma`) | One row per phone; resubmitting updates it. |
| Notifications | `EOI_NOTIFY_WHATSAPP` | Team gets a WhatsApp summary per EOI; applicant gets an acknowledgement. |
| Admin queue | `/admin/eoi` (gated by `ADMIN_PHONES`) | Founding first, then score. Filter by city/tier/status, notes, CSV export. |
| City landing pages | `/channel-partners`, `/channel-partners/[city]` · `src/lib/seo/cities.ts` | 18 cities with their own micro-markets, market note, live project pages, city FAQ, EOI CTA pre-filled with the city. |
| Technical SEO | `src/app/robots.ts`, `src/app/sitemap.ts`, `src/lib/seo/jsonld.tsx` | robots, one sitemap covering marketing + every live storefront/listing/collection/project on subdomains, Organization / SoftwareApplication / FAQPage / Breadcrumb JSON-LD, canonicals, OG defaults. |
| OG share cards | `src/components/marketing/og.tsx`, `opengraph-image.tsx` under `/partners` and `/channel-partners/[city]` | WhatsApp/LinkedIn previews in the site's visual language; city cards show the city's micro-markets. |
| AEO: answer pages | `/answers`, `/answers/[slug]` · `src/lib/seo/answers.ts` | 7 question-shaped pages: 40–60-word direct answer first, then steps / comparison table / detail, FAQ. Article + FAQPage + HowTo JSON-LD, visible "Updated" date. |
| AEO: facts source | `src/lib/seo/facts.ts` | One canonical one-liner + fact list reused by llms.txt, JSON-LD (`SoftwareApplication.featureList`) and pages, so every engine sees identical claims. |
| AEO: llms.txt | `/llms.txt`, `/llms-full.txt` | Markdown map of the site and full answer text for AI assistants. |
| AEO: crawler access | `src/app/robots.ts` | Explicitly allows OpenAI, Perplexity, Anthropic, Google-Extended, Apple, Bing, Meta and Common Crawl bots on public pages. |
| Entry points | Nav "For CP firms", homepage band, footer city links | Internal links into `/partners` and every city page. |

### Launch checklist
1. Set `ADMIN_PHONES`, `EOI_NOTIFY_WHATSAPP` in production env. Deploy (schema pushes at container start).
2. Google Search Console: add a **Domain property** for `estateinfo.in` via DNS TXT, so one sitemap can list
   subdomain URLs. Submit `https://estateinfo.in/sitemap.xml`. Same for Bing Webmaster Tools (imports from GSC).
3. Test in Rich Results Test: `/`, `/partners`, `/channel-partners/gurugram` (FAQ + breadcrumbs).
4. Create a UTM convention (below) and short links for each channel.
5. Assign an owner for the `/admin/eoi` queue with a **same-working-day** reply SLA for Founding EOIs.

## 2. Who we're targeting

| Tier | Who | How to find them | Motion |
|---|---|---|---|
| **Founding** | CP firms / "channel partner companies" with 50–500 agents carrying 1,000+ units in one city (e.g. mandate firms, large resale networks, developer-empanelled CP firms) | Developer empanelment lists, CP-meet attendee lists, RERA agent registries (firm registrations), LinkedIn ("channel partner" + city, 50+ employees), top sellers on portals | Founder-led outreach, in-person demo, we build their inventory |
| **Growth** | 10–49-agent agencies, 200+ units | Same + local broker associations | Onboarding call + agency code |
| **Partner** | Individual CPs | SEO, WhatsApp groups, referrals from firms' agents | Self-serve on WhatsApp |

**The flywheel:** one Founding firm = one agency code → dozens of agents → thousands of links in one
micro-market → buyers in that market all carry our cookie → other CPs in the market see our links and sign up.
Sequence cities by where we can sign 2–3 Founding firms first; don't spread thin.

## 3. SEO

### Keyword map (target page → intent)
| Cluster | Example queries | Page |
|---|---|---|
| Tool, generic | property listing tool for brokers · real estate listing software India · free property listing website for agents · property brochure maker | `/` |
| Competitor / alternative | estatedeck alternative · propsite alternative · free estatedeck | `/` (FAQ), later dedicated `/compare/*` pages |
| City | channel partner tool Gurgaon · real estate broker software Pune · property listing app for agents Noida | `/channel-partners/[city]` |
| Firm / programme | channel partner program real estate · CP firm software · real estate agency listing management | `/partners` |
| Output-specific | property story video maker · real estate PDF brochure generator · WhatsApp property listing | future feature pages |
| Long tail (free, compounding) | project name + "floor plan / payment plan / price" · locality + BHK | `/p/[slug]`, CP storefronts & listings (in sitemap) |

Project pages (`/p/[slug]`) are the biggest long-tail asset: every brochure a Founding firm uploads creates an
indexable page for a project name buyers search, with "Listed by" linking to our CPs' sites.

### Next SEO work (not built yet — in priority order)
1. ~~Per-city OG image~~ — done.
2. **Comparison pages** `/compare/estatedeck`, `/compare/propsite` — factual feature tables only, dated, no
   claims we can't verify.
3. **Locality pages** once a city has ≥25 live listings in a locality: `/channel-partners/[city]/[locality]`
   listing live projects + CPs (avoid thin pages; gate on real inventory).
4. **Feature pages** — story video maker, PDF brochure maker, WhatsApp listing bot.
5. **Hindi copy** of city pages for Tier-2 cities (hreflang `hi-IN`).
6. Monitor Core Web Vitals in GSC for listing pages; they're the bulk of indexed URLs.

## 3b. AEO (answer engine optimisation)

Goal: when a CP asks ChatGPT, Perplexity, Gemini, Claude or Google AI Overviews "free property listing tool for
brokers", "EstateDeck alternative" or "how do I make a listing from WhatsApp", the answer names and cites us.

**How engines pick sources:** they retrieve a handful of pages (via Bing/Google indexes and their own crawlers),
then quote short, self-contained sentences that directly answer the question, favouring pages that are
consistent with what *other* sites say about the brand. So: be crawlable, answer first, be consistent, be
mentioned elsewhere.

**On-site (built):** answer-first pages · one facts file · FAQ/HowTo/Article schema · llms.txt · AI bots allowed ·
dated content · entity markup (Organization, SoftwareApplication with price 0 INR).

**On-site (next):**
1. Add 2–3 answer pages a month from real questions (sales calls, WhatsApp support, "People also ask", Reddit).
   Add to `ANSWERS`; bump `updated` whenever facts change.
2. Set `NEXT_PUBLIC_SAME_AS` to the official LinkedIn / Instagram / YouTube URLs once they exist.
3. Submit the site in **Bing Webmaster Tools** (ChatGPT search and Copilot draw on Bing) and use IndexNow.
4. Publish real numbers once they're large (listings live, CPs, cities) — engines love quotable stats.

**Off-site (the bigger lever — engines trust third parties more than you):**
- Get listed in "best real-estate tools / CRM / listing software India" articles; pitch the authors.
- Profiles on G2, Capterra, Product Hunt, Crunchbase, LinkedIn company page — same one-liner everywhere.
- Answer CP questions on Reddit (r/IndiaRealEstate, city subs), Quora and LinkedIn, linking to answer pages.
- YouTube: 60-second "WhatsApp to listing" demo per city/language (YouTube is heavily cited by AI Overviews).
- Founding Partner firms: ask for a line + link on their website ("Listings powered by …").
- Trade press (Realty+, ET Realty, Housing news) around the Founding Partner launch.

**Measuring AEO:**
- Weekly prompt panel: run ~20 fixed prompts (the answer-page questions + "best free listing tool for channel
  partners in {city}") in ChatGPT, Perplexity, Gemini, Copilot and Google; log whether we're named and cited.
- Referral traffic from `chatgpt.com`, `perplexity.ai`, `gemini.google.com`, `copilot.microsoft.com`,
  `claude.ai` (server logs / analytics). ChatGPT often appends `utm_source=chatgpt.com` — it's captured in EOI `source`.
- Bot hits on `/llms.txt` and answer pages in nginx logs, by user agent.

## 4. EOI acquisition playbook (large firms)

**Offer (never money):** free forever, unlimited listings for every agent, *we build your inventory for you*,
dedicated manager, Founding Partner badge + mention on our city page, first access to Co-Agent links.
Scarcity is real and honest: a limited number of Founding slots per city because onboarding is manual.

### Channels
1. **Direct founder outreach (highest yield).** Build a list of the top 30 CP firms per launch city. WhatsApp
   + LinkedIn + call. Link: `/partners?city=<slug>&utm_source=outbound&utm_medium=whatsapp&utm_campaign=founding-<city>`.
2. **Developer CP meets & launch events.** Developers already gather their empanelled CPs; attend with a QR to
   `/partners?city=<slug>&utm_source=event&utm_campaign=<developer>-<date>`. Offer to build the launch project page
   live, in front of them, from the developer's brochure.
3. **Developer partnerships.** Pitch developers: "we'll give every one of your CPs a branded project page with
   their own contact card, free." One developer can push the tool to hundreds of CPs.
4. **CP WhatsApp groups & associations.** Share a sample listing link (the product is the ad), not a pitch.
5. **Agent-to-firm referral.** When 3+ agents from the same agency sign up individually, flag the agency for
   Founding outreach (query users by `agencyName`).
6. **Paid (later).** Meta lead ads targeting real-estate-agent job titles in launch cities → `/partners`. Keep
   CP traffic *out of* the buyer pixel audience (the marketing site doesn't fire the buyer pixel).

### Scripts
**First WhatsApp (Founding):**
> Hi {Name}, I'm {you} from EstateInfo. We give channel partners a free, branded page for every property —
> made from a WhatsApp message, with the agent's own WhatsApp/Call buttons, PDF brochure and story video.
> For firms your size in {City} we build your whole inventory for you and give every agent their own link.
> No per-listing cost, ever. Here's what a buyer sees: {sample link}. Worth a 20-min call this week?

**Follow-up (day 3):** send a page we built *from one of their own live projects* (public brochure) with their
logo/contact card. This is the highest-converting touch — show, don't tell.

**After EOI (same working day):** confirm the call, ask for 1 brochure + 1 inventory sheet in advance, and
send back 3 live pages *before* the call.

### Onboarding SLA for Founding firms
- Day 0: EOI → reply same working day. Day 1–3: call, agency created, join code shared.
- Day 3–7: top 10 projects and first 100–300 units live; agents trained in a 15-min WhatsApp session.
- Day 14: review — links shared, opens, taps per agent (Analytics). Mark `LIVE` in `/admin/eoi`.

## 5. Metrics

| Stage | Metric | Source |
|---|---|---|
| Traffic | Organic clicks to `/`, `/partners`, city pages; indexed URLs | GSC |
| EOI | EOIs/week by tier & city; % Founding | `/admin/eoi` CSV |
| Speed | Median hours EOI → first contact (target < 8 working h) | `status` + notes |
| Activation | Founding firms `LIVE`; agents joined per agency | `AgencyMember` |
| **North star** | **Live listings + links opened per city / micro-market per week** | `Listing`, `AnalyticsEvent` |
| Audience | Unique buyer viewers per city (the business value) | `AnalyticsEvent` (`cd_vid`) |

**First 90 days:** pick 3 launch cities (suggest Gurugram, Pune, Noida — high CP share of sales and dense CP
networks) → 30 Founding conversations per city → 3–5 Founding firms live per city → 10,000+ live listings total.

### UTM convention
`utm_source` = outbound | event | developer | group | referral | meta · `utm_medium` = whatsapp | linkedin | qr |
email | paid · `utm_campaign` = `founding-<city>` or `<developer>-<yyyymmdd>`. Stored on every EOI in `source`.
