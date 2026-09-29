#!/usr/bin/env bash
# One-command update on the server: log in to ECR with the instance role, pull the latest image, restart, prune.
set -euo pipefail
cd "$(dirname "$0")/.."
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin 247839622447.dkr.ecr.ap-south-1.amazonaws.com
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
docker image prune -f >/dev/null
docker compose -f docker-compose.prod.yml ps
