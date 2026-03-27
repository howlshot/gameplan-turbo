#!/bin/zsh

set -euo pipefail

SCRIPT_PATH="${(%):-%N}"
SCRIPT_DIR="$(cd -- "$(dirname -- "$SCRIPT_PATH")" && pwd)"
PROJECT_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
LAUNCH_SCRIPT="$PROJECT_DIR/scripts/launch-preflight-game-os.sh"
OUTPUT_APP="${1:-$HOME/Desktop/Preflight Game OS.app}"

if [[ ! -x "$LAUNCH_SCRIPT" ]]; then
  echo "Launch script not found or not executable: $LAUNCH_SCRIPT" >&2
  exit 1
fi

rm -rf "$OUTPUT_APP"

osacompile -o "$OUTPUT_APP" \
  -e 'on run' \
  -e "do shell script quoted form of \"$LAUNCH_SCRIPT\"" \
  -e 'end run'

echo "Created macOS launcher at: $OUTPUT_APP"
