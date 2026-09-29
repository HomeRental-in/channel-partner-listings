# Deploying EstateInfo (estateinfo.in)

Layout: a **separate AWS account** (no shared VPC, RDS or Route 53 with PropFocus). One t3.small runs the container + nginx,
a db.t4g.micro RDS holds the database, uploads go to S3, Route 53 hosts the zone, certbot issues the wildcard certificate.
GitHub Actions builds the image and pushes it to ECR; the server pulls with its instance role.

## 1. DNS (GoDaddy registrar → Route 53)
1. Create the hosted zone `estateinfo.in` in the new account (the deploy script does this) and note its four NS records.
2. GoDaddy → My Products → estateinfo.in → DNS → Nameservers → Change → paste the four Route 53 nameservers.
3. Records `A @` and `A *` point at the instance's Elastic IP (the wildcard makes rahul.estateinfo.in work).

## 2. AWS (separate account, nothing shared with PropFocus)
Region **ap-south-1**, default VPC. Everything below is created by the deploy script from this Mac using the
`estateinfo` CLI profile; Route 53 hosts the zone, no Cloudflare.
- **Route 53** hosted zone `estateinfo.in` → `A @` and `A *` to the instance's Elastic IP; GoDaddy nameservers → the zone's four NS.
- **EC2**: t3.small, Ubuntu 24.04, 20 GB gp3, Elastic IP, IAM role (SSM, Secrets Manager read, S3 bucket RW, Route53 change on the zone
  for certbot DNS-01). Security group: 80/443 from anywhere, no SSH (managed via Systems Manager Session Manager).
- **RDS**: Postgres 17, `db.t4g.micro` (free tier for 12 months on a new account), 20 GB, not public, security group allows the instance only.
  `DATABASE_URL=postgresql://estateinfo:<pw>@<endpoint>:5432/estateinfo?schema=public&sslmode=require`
- **S3**: bucket `estateinfo-uploads` (ap-south-1), object public-read via bucket policy. `STORAGE_DRIVER=s3` + `S3_*` vars.
- **Secrets Manager** (the server reads these at start, nothing is pasted into chat or committed):
  `estateinfo/database-url`, `estateinfo/app-secret`; the OpenAI key is the shared `propfocus-openai-key`; `estateinfo/ultramsg` (`{"instanceId","token","number"}`),
  `estateinfo/meta` (`{"pixelId","capiToken"}`, optional), `estateinfo/app-secret`, `estateinfo/cron-secret`.
- **TLS**: certbot with the Route 53 plugin issues `estateinfo.in, *.estateinfo.in` on the instance and renews itself.

## 3. Server (once)
```bash
sudo apt update && sudo apt install -y docker.io docker-compose-v2 nginx git      # Ubuntu
sudo usermod -aG docker $USER && newgrp docker
git clone git@github.com:HomeRental-in/channel-partner-listings.git && cd channel-partner-listings
cp .env.production.example .env.production && nano .env.production               # fill every value
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
`247839622447.dkr.ecr.ap-south-1.amazonaws.com/estateinfo:latest` (+ the commit SHA tag). Then on the server:
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
- `OPENAI_API_KEY` set; create one listing via the web form to confirm extraction.
- RDS automated backups on; S3 versioning on.
- First login: https://estateinfo.in/login with your number — the OTP arrives on WhatsApp from the intake number.
- Optional demo partner: `docker compose -f docker-compose.prod.yml exec app node cli/node_modules/prisma/build/index.js --version` proves the CLI;
  seeding needs the dev toolchain, so run `npm run db:seed` from a laptop with `DATABASE_URL` pointed at RDS through the bastion.
