#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

echo "→ docker compose build"
docker compose build

echo "→ docker compose up -d"
docker compose up -d

echo "→ статус:"
docker compose ps

echo "✅ деплой завершён: $(date)"
