#!/usr/bin/env bash
set -euo pipefail

if git remote | grep -q origin; then
  echo "Pushing to 'origin' (force)"
  git push --force origin main
else
  echo "No 'origin' remote configured. Add one with: git remote add origin <url>"
  exit 1
fi
