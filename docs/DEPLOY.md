# Deploying EstateInfo (estateinfo.in)

The app is one Node process (Next.js 16, standalone build) plus Postgres. It needs: a wildcard domain
(`*.estateinfo.in` → every CP gets a subdomain), persistent storage for uploads (a Docker volume or S3),
`ffmpeg` for story-video MP4 conversion (in the image), a cron hit at 08:00 IST for the daily report, and
outbound HTTPS to Anthropic, UltraMsg and Meta.

## 1. DNS (GoDaddy registrar → Cloudflare DNS)
Keep the domain at GoDaddy, move only the nameservers to Cloudflare (free plan). Cloudflare gives you a
wildcard certificate, HTTPS, a CDN and the `cf-ipcity` header the analytics use for viewer cities.
1. Cloudflare → Add site → estateinfo.in → Free. Copy the two nameservers it shows.
2. GoDaddy → My Products → estateinfo.in → DNS → Nameservers → Change → enter the Cloudflare pair.
3. In Cloudflare DNS add two records, both **Proxied** (orange cloud):
   - `A  @  <server IP>`
   - `A  *  <server IP>`  (the wildcard — this is what makes rahul.estateinfo.in work)
4. Cloudflare → SSL/TLS → set mode **Full (strict)** and under Edge Certificates enable "Always use HTTPS".
   Order an Origin Certificate (SSL/TLS → Origin Server) for `estateinfo.in, *.estateinfo.in` and install it
   in nginx, or use certbot DNS-01 with the Cloudflare plugin. Either way the origin speaks HTTPS.
5. Cloudflare → Rules → Settings → Managed Transforms → turn on **Add visitor location headers** (gives `cf-ipcity`).

## 2. Server
Any Ubuntu 22/24 VM with 2 vCPU / 4 GB works (AWS Lightsail ₹1,600/mo, Hetzner CX22, DigitalOcean).
```bash
# on the server
sudo apt update && sudo apt install -y docker.io docker-compose-v2 nginx git
sudo usermod -aG docker $USER && newgrp docker
git clone <your repo> channel-partner-listings && cd channel-partner-listings
cp .env.production.example .env.production   # fill every value
export POSTGRES_PASSWORD=$(openssl rand -hex 16)   # also put it in .env.production's DATABASE_URL if you run Postgres elsewhere
docker compose up -d --build                 # builds the image, starts Postgres, pushes the schema, starts the app
docker compose logs -f app                   # wait for "Ready"
```
nginx: `sudo cp deploy/nginx.estateinfo.conf /etc/nginx/sites-available/estateinfo && sudo ln -s
/etc/nginx/sites-available/estateinfo /etc/nginx/sites-enabled/ && sudo nginx -t && sudo systemctl reload nginx`.
Add the TLS `listen 443 ssl` block with the Cloudflare origin cert (or run `certbot --nginx` with the DNS plugin).
Uploads live in the `uploads` Docker volume; back it up with the database. To use S3 instead, set the `S3_*`
vars and `STORAGE_DRIVER=s3` (the app signs uploads itself, no SDK needed).

Updates: `git pull && docker compose up -d --build`. Schema changes are applied automatically on start.

## 3. WhatsApp via UltraMsg
UltraMsg links a normal WhatsApp number (no Meta business verification). One instance = one number.
1. Buy a fresh SIM / number for intake (not your personal one). This is `WHATSAPP_INTAKE_NUMBER`.
2. ultramsg.com → Sign up → Create instance → scan the QR from WhatsApp on that phone
   (Linked devices → Link a device). Keep the phone online and charged; UltraMsg needs the session alive.
3. Instance page → copy **Instance ID** and **Token** into `.env.production` as `ULTRAMSG_INSTANCE_ID` and `ULTRAMSG_TOKEN`; set `WHATSAPP_PROVIDER=ultramsg`.
4. Instance → Settings → Webhooks:
   - Webhook URL: `https://estateinfo.in/api/whatsapp/webhook`
   - Enable **Webhook on Received** (message_received). Leave "sent"/"ack" events off.
   - Save. UltraMsg does not sign webhooks; the app rejects bodies whose `instanceId` does not match yours.
5. Restart the app (`docker compose up -d`) and test: from another phone send "Hi" to the intake number.
   You should get the welcome message; send photos + text, then DONE → review link.
6. Put the same number on the landing page (`WHATSAPP_INTAKE_NUMBER` drives the "How it works" modal and login OTP sender).

Meta Cloud API is also supported (`WHATSAPP_PROVIDER=meta`): set `META_WA_PHONE_NUMBER_ID`, `META_WA_ACCESS_TOKEN`,
`META_WA_VERIFY_TOKEN`, and register the same webhook URL in Meta for Developers with the verify token.

## 4. Meta pixel + Conversions API
Events Manager → create a Pixel → copy the Pixel ID into `NEXT_PUBLIC_META_PIXEL_ID` (rebuild the image, it is
baked into the client bundle). Settings → Conversions API → Generate access token → `META_CAPI_ACCESS_TOKEN`.
Use "Test events" with `META_CAPI_TEST_EVENT_CODE` while checking, then clear it. Events sent: ViewContent on
every listing open, Contact on WhatsApp/Call taps, deduplicated by event_id. No buyer PII is ever sent.

## 5. Daily report cron
`crontab -e` on the server and paste `deploy/cron.example` (02:30 UTC = 08:00 IST) with your `CRON_SECRET`.
Dry run: `curl -X POST -H "x-cron-secret: $CRON_SECRET" "https://estateinfo.in/api/cron/daily-report?dryRun=1"`.

## 6. Go-live checklist
- `DEV_OTP` is **not** set in production (otherwise every OTP is 123456).
- `APP_SECRET` and `CRON_SECRET` are random.
- `ANTHROPIC_API_KEY` set; test web intake once.
- Open https://demo.estateinfo.in after `docker compose exec app npx tsx prisma/seed.ts` if you want the demo partner live, or skip the seed for a clean start.
- Your own login: go to https://estateinfo.in/login with your number; the OTP arrives on WhatsApp from the intake number.
