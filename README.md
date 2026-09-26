# Channel Partner Listings

Free, WhatsApp-first property listing tool for Indian channel partners. Every CP gets `username.<domain>`, every
listing is a fast branded page with WhatsApp/Call CTAs, a PDF brochure, a story image and a story video.
Product spec: `SPEC.md` · Design language: `DESIGN.md` · Engineering conventions: `CLAUDE.md`.

## Run locally
```bash
cp .env.example .env            # then edit DATABASE_URL etc.
npm install
npx prisma db push && npx prisma generate
npm run db:seed                 # demo user "demo" + three sample listings
npm run dev                     # http://localhost:3000, CP sites at http://demo.localhost:3000
```
Login at `/login` with any phone; in dev the OTP is `DEV_OTP` from `.env` (default 123456).
WhatsApp intake can be simulated at `/dev/whatsapp` (development only) without any provider credentials.
AI calls use the Anthropic SDK; set `ANTHROPIC_API_KEY` or run `ant auth login`.

## Environment
See `.env.example`. Providers: `WHATSAPP_PROVIDER=mock|meta|ultramsg`, `STORAGE_DRIVER=local|s3`,
Meta pixel/CAPI via `NEXT_PUBLIC_META_PIXEL_ID` + `META_CAPI_ACCESS_TOKEN`. Daily report cron:
`POST /api/cron/daily-report` with header `x-cron-secret: $CRON_SECRET` (schedule at 08:00 IST).
