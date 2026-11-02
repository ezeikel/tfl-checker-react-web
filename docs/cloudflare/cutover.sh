#!/bin/bash
# OWNER RUNS in a real Terminal. This file does not execute during tests/imports.
set -euo pipefail
HERE=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
exec python3 -I "$HERE/cutover.py" "$@"
