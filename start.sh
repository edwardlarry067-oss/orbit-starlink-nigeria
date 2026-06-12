#!/usr/bin/env bash
set -e

ARTIFACTS=/home/runner/workspace/artifacts

echo "==> Installing dependencies..."
cd "$ARTIFACTS" && pnpm install --no-frozen-lockfile 2>&1 | tail -5

echo "==> Running database migrations (safe — no data loss)..."
cd "$ARTIFACTS/lib/db" && pnpm run db:push && echo "   DB migrations OK"

echo "==> Building API server..."
cd "$ARTIFACTS/api-server" && pnpm run build

# In Replit deployment, REPLIT_DEPLOYMENT=1 is set automatically
if [ "${REPLIT_DEPLOYMENT}" = "1" ]; then
  echo "==> Production mode: building frontend..."
  cd "$ARTIFACTS/spacex-starlink" && pnpm run build

  echo "==> Starting production server on port 3001 (serves frontend + API)..."
  cd "$ARTIFACTS" && NODE_ENV=production PORT=3001 node --enable-source-maps api-server/dist/index.mjs
else
  # Development mode — API on 3001, Vite dev server on 5000
  fuser -k 3001/tcp 2>/dev/null || true
  fuser -k 5000/tcp 2>/dev/null || true
  sleep 1

  echo "==> Starting API server on port 3001..."
  cd "$ARTIFACTS" && PORT=3001 node --enable-source-maps api-server/dist/index.mjs &
  API_PID=$!

  sleep 2

  echo "==> Starting frontend on port 5000..."
  cd "$ARTIFACTS/spacex-starlink" && pnpm run dev
fi
