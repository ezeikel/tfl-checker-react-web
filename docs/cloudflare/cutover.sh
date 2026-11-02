#!/bin/bash
# Interactive operator only: owner or explicitly delegated agent. No pipe execution.
set -euo pipefail
HERE=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
exec python3 -I "$HERE/cutover.py" "$@"
