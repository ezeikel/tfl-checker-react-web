#!/usr/bin/env bash
# Runs from the repository root, after tests, OpenNext and bundle checks.
set -euo pipefail
app=.
sha=$(git rev-parse HEAD)
test "$sha" = "$RELEASE_SHA"
archive=$(mktemp)
trap 'rm -f "$archive"' EXIT
tar -czf "$archive" dist .cloudflare-artifact.json
digest=$(sha256sum "$archive" | cut -d' ' -f1)
curl --fail --silent --show-error --retry 2 -T "$archive" "$RELEASE_UPLOAD_URL"
echo "WEB_RELEASE_ARCHIVE $sha $digest"
