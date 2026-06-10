#!/usr/bin/env bash
set -euo pipefail

IMAGE_NAME="haloit-api:local"
echo "Building $IMAGE_NAME from artifacts/api-server..."
docker build -t "$IMAGE_NAME" -f artifacts/api-server/Dockerfile artifacts/api-server
echo "Built $IMAGE_NAME"
