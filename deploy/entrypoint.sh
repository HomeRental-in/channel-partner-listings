#!/bin/sh
# Apply the Prisma schema to DATABASE_URL (idempotent, refuses destructive changes), then start the server.
set -e
if [ "${SKIP_DB_PUSH:-0}" != "1" ]; then
  node /app/cli/node_modules/prisma/build/index.js db push --schema /app/prisma/schema.prisma --skip-generate
fi
exec "$@"
