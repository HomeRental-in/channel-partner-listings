# Design language (landing page + dashboard) — modelled on eloqwnt.com

Tokens extracted from the reference:
- Page background `#E5E9EB` (rgb 229,233,235); cards `#FFFFFF`; soft section `#F2F7F9`; ink `#000000`; muted
  text `rgba(0,0,0,.55)`; dark button `#000` with white text; light pill `#E5E9EB` on white.
- Font: reference uses "Mazzard" (commercial). Use **Outfit** (Google) as the substitute for headings and body;
  weights 300/400/500/600. Letter-spacing tight: h1 -1.6px, h2 -0.8px, body -0.4px. Body 20px/24px on desktop,
  18px on mobile. h1 56px/1.05, h2 40px/1.1.
- Radii: cards 32px (large panels) and 20px/16px (inner cards); buttons fully rounded (500px); icon buttons 50%.
- Layout: full-width page with big white rounded "panels" floating on the grey background, 60-80px gutters
  inside panels, section label on the left ("• Selected Work") and content on the right (2-column grid ~35/65).
- Nav: logo left, centre links with "↓" suffix on dropdowns, right side: round icon button + pill CTA
  "Let's chat 👋".
- Motion (GSAP + Lenis smooth scroll): hero headline words fade/blur in one by one; sub-line fades; infinite
  horizontal marquee of "/ STAT" items below hero; sections fade-up on scroll; stacked "work" cards with
  sticky scroll; numbered list rows with arrow that slides right on hover; FAQ accordion with "+" circle
  button; testimonial cards horizontal scroller; buttons scale 0.98 on press; scroll-down circle button in hero.
- Footer: 3 link columns + newsletter block + social row; small print.

Landing page sections (map eloqwnt sections to our product):
1. Hero: eyebrow "LISTING TOOL FOR CHANNEL PARTNERS", h1 "Turn a WhatsApp message into a listing buyers trust.",
   pill CTA "Create a free listing 👋", secondary "Log in". Marquee: "/ FREE FOREVER", "/ < 60 SEC TO A LINK",
   "/ 3 THEMES", "/ PDF + STORY VIDEO", "/ PROJECT PAGES FOR CPS".
2. "Who it's for" panel with a phone mock (listing page) on the left and copy on the right.
3. "Selected work" → "What buyers receive": 3 stacked cards showing the three themes with stats.
4. "How it works": 3 numbered rows (Send on WhatsApp / AI builds the page / Share one link).
5. "Everything included": numbered list rows 01..08 (AI listing writer, WhatsApp-first, your own site,
   PDF brochure, story image & video, collections, project pages, daily report).
6. FAQ accordion (6 items) · Testimonials scroller (placeholder quotes marked as sample) · Final CTA · Footer.
