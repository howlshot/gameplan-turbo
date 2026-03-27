#!/bin/zsh

set -euo pipefail

SCRIPT_PATH="${(%):-%N}"
SCRIPT_DIR="$(cd -- "$(dirname -- "$SCRIPT_PATH")" && pwd)"
exec "$SCRIPT_DIR/launch-gameplan-turbo.sh" "$@"
