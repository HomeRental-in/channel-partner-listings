#!/usr/bin/env bash
# One-command update on the server: pull the latest image, restart, clean old images.
set -euo pipefail
cd "$(dirname "$0")/.."
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
docker image prune -f >/dev/null
docker compose -f docker-compose.prod.yml ps
