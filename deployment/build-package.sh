#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUTPUT_DIR="/tmp/haloitservices365-deployment"
mkdir -p "$OUTPUT_DIR"
ARCHIVE="$OUTPUT_DIR/haloitservices365-deployment.tar.gz"
cd "$ROOT_DIR"
tar --exclude='./.git' --exclude='./halo-system/backend/node_modules' -czf "$ARCHIVE" \
  halo-system/backend \
  halo-system/frontend \
  deployment \
  .cpanel.yml \
  README.md
printf 'Created %s\n' "$ARCHIVE"
