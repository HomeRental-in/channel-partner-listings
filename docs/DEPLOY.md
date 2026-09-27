# Deploying EstateInfo (estateinfo.in)

Layout: a dedicated **t3.small** (Amazon Linux 2023 or Ubuntu 24.04, Mumbai) runs one container + nginx.
Database is a new database on the existing **RDS Postgres**. Uploads go to **S3**. The image is built by
**GitHub Actions** and pushed to GitHub's registry (GHCR); the server only pulls, never builds.
Cloudflare fronts the domain (wildcard cert, CDN, viewer-city header).

## 1. DNS (GoDaddy registrar → Cloudflare DNS)
1. Cloudflare → Add site → estateinfo.in → Free plan. Copy the two nameservers.
2. GoDaddy → My Products → estateinfo.in → DNS → Nameservers → Change → paste them.
3. Cloudflare DNS, both **Proxied** (orange cloud): `A @ <server IP>` and `A * <server IP>` (the wildcard makes rahul.estateinfo.in work).
4. SSL/TLS → **Full (strict)**; Edge Certificates → Always use HTTPS. SSL/TLS → Origin Server → create an Origin
   Certificate for `estateinfo.in, *.estateinfo.in` and save the cert + key for nginx (step 3).
5. Rules → Settings → Managed Transforms → enable **Add visitor location headers** (gives `cf-ipcity` to analytics).

## 2. AWS pieces
- **EC2**: t3.small, 20 GB gp3, same VPC as RDS. Security group: 443 + 80 from Cloudflare IP ranges only
  (https://www.cloudflare.com/ips/), 22 from the bastion only. Attach an IAM role with `s3:PutObject/GetObject/DeleteObject`
  on the bucket (or use access keys in `.env.production`).
- **RDS**: on the existing PropFocus instance create database `estateinfo` and a user with a strong password.
  Allow the EC2 security group on 5432. `DATABASE_URL=postgresql://estateinfo:<pw>@<rds-endpoint>:5432/estateinfo?schema=public&sslmode=require`
- **S3**: bucket `estateinfo-uploads` in ap-south-1, public read for objects (or CloudFront in front). Env:
  `STORAGE_DRIVER=s3`, `S3_BUCKET`, `S3_REGION=ap-south-1`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`,
  `S3_PUBLIC_BASE_URL=https://estateinfo-uploads.s3.ap-south-1.amazonaws.com` (or the CloudFront URL).

## 3. Server (once)
```bash
sudo apt update && sudo apt install -y docker.io docker-compose-v2 nginx git      # Ubuntu
sudo usermod -aG docker $USER && newgrp docker
git clone git@github.com:HomeRental-in/channel-partner-listings.git && cd channel-partner-listings
cp .env.production.example .env.production && nano .env.production               # fill every value
# GHCR is private: create a GitHub PAT (classic) with read:packages, then
docker login ghcr.io -u <github-user>                                              # paste the PAT as password
./deploy/deploy.sh                                                                 # pulls :latest, starts, applies schema
sudo cp deploy/nginx.estateinfo.conf /etc/nginx/sites-available/estateinfo
sudo ln -s /etc/nginx/sites-available/estateinfo /etc/nginx/sites-enabled/ && sudo rm -f /etc/nginx/sites-enabled/default
# add the TLS block with the Cloudflare origin cert (listen 443 ssl; ssl_certificate /etc/ssl/cf-origin.pem; ssl_certificate_key /etc/ssl/cf-origin.key;)
sudo nginx -t && sudo systemctl reload nginx
```
The container runs as a non-root user, applies the Prisma schema on every start (refuses destructive changes),
and exposes port 3000 on localhost only; nginx is the public face.

## 4. Releasing
Push to `main` → `.github/workflows/build-image.yml` typechecks, lints, builds the image and pushes
`ghcr.io/homerental-in/channel-partner-listings:latest` (+ the commit SHA tag). Then on the server:
```bash
./deploy/deploy.sh
```
Roll back with `IMAGE_TAG=<sha> docker compose -f docker-compose.prod.yml up -d`.
Public build-time values (`NEXT_PUBLIC_ROOT_DOMAIN`, `NEXT_PUBLIC_BRAND_NAME`, `NEXT_PUBLIC_META_PIXEL_ID`) live in
GitHub → Settings → Secrets and variables → Actions → **Variables**; change them and re-run the workflow.

## 5. WhatsApp via UltraMsg
1. A fresh SIM for intake (`WHATSAPP_INTAKE_NUMBER`), not a personal number; the phone must stay online.
2. ultramsg.com → Create instance → scan the QR from that phone (Linked devices → Link a device).
3. Instance ID + Token → `ULTRAMSG_INSTANCE_ID`, `ULTRAMSG_TOKEN`; `WHATSAPP_PROVIDER=ultramsg`.
4. Instance → Settings → Webhooks: URL `https://estateinfo.in/api/whatsapp/webhook`, enable **Webhook on Received** only.
   (UltraMsg does not sign webhooks; the app drops bodies whose `instanceId` is not yours.)
5. `./deploy/deploy.sh`, then from another phone send "Hi" → welcome message → photos + text → DONE → review link.

Meta Cloud API alternative: `WHATSAPP_PROVIDER=meta` + `META_WA_PHONE_NUMBER_ID`, `META_WA_ACCESS_TOKEN`,
`META_WA_VERIFY_TOKEN`; register the same webhook URL in Meta for Developers.

## 6. Meta pixel + Conversions API
Events Manager → Pixel ID → GitHub variable `NEXT_PUBLIC_META_PIXEL_ID` (re-run the build). Conversions API token →
`META_CAPI_ACCESS_TOKEN` in `.env.production`. Use `META_CAPI_TEST_EVENT_CODE` while verifying, then clear it.
Events: ViewContent on listing opens, Contact on WhatsApp/Call taps, deduplicated by event_id, no buyer PII.

## 7. Daily report cron
`crontab -e` → paste `deploy/cron.example` (02:30 UTC = 08:00 IST) with your `CRON_SECRET`.
Dry run: `curl -X POST -H "x-cron-secret: $CRON_SECRET" "https://estateinfo.in/api/cron/daily-report?dryRun=1"`.

## 8. Go-live checklist
- `DEV_OTP` not set in production; `APP_SECRET` and `CRON_SECRET` random (`openssl rand -hex 32`).
- `ANTHROPIC_API_KEY` set; create one listing via the web form to confirm extraction.
- RDS automated backups on; S3 versioning on.
- First login: https://estateinfo.in/login with your number — the OTP arrives on WhatsApp from the intake number.
- Optional demo partner: `docker compose -f docker-compose.prod.yml exec app node cli/node_modules/prisma/build/index.js --version` proves the CLI;
  seeding needs the dev toolchain, so run `npm run db:seed` from a laptop with `DATABASE_URL` pointed at RDS through the bastion.
