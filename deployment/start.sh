#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/halo-system/backend"
cd "$BACKEND_DIR"
NODE_ENV=${NODE_ENV:-production} PORT=${PORT:-3000} HOST=${HOST:-0.0.0.0} npm start
