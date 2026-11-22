#!/usr/bin/env bash
set -euo pipefail
unset RELEASE_UPLOAD_URL CLOUDFLARE_API_TOKEN
bun --no-env-file install --frozen-lockfile
bun --no-env-file run check-types
bun --no-env-file run test
bun --no-env-file run build
bun --no-env-file run artifact:record production
bun --no-env-file run artifact:verify "$RELEASE_SHA"
