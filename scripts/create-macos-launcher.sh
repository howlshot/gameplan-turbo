#!/bin/zsh

set -euo pipefail

SCRIPT_PATH="${(%):-%N}"
SCRIPT_DIR="$(cd -- "$(dirname -- "$SCRIPT_PATH")" && pwd)"
PROJECT_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
LAUNCH_SCRIPT="$PROJECT_DIR/scripts/launch-gameplan-turbo.sh"
OUTPUT_APP="${1:-$HOME/Desktop/Gameplan Turbo.app}"
ICON_SOURCE="$PROJECT_DIR/public/gameplan-turbo-icon.png"

if [[ ! -x "$LAUNCH_SCRIPT" ]]; then
  echo "Launch script not found or not executable: $LAUNCH_SCRIPT" >&2
  exit 1
fi

rm -rf "$OUTPUT_APP"

osacompile -o "$OUTPUT_APP" \
  -e 'on run' \
  -e "do shell script quoted form of \"$LAUNCH_SCRIPT\"" \
  -e 'end run'

if [[ -f "$ICON_SOURCE" ]] && command -v iconutil >/dev/null 2>&1; then
  TMP_DIR="$(mktemp -d)"
  ICONSET_DIR="$TMP_DIR/GameplanTurbo.iconset"
  mkdir -p "$ICONSET_DIR"

  for size in 16 32 128 256 512; do
    sips -z "$size" "$size" "$ICON_SOURCE" --out "$ICONSET_DIR/icon_${size}x${size}.png" >/dev/null
    doubled_size=$((size * 2))
    sips -z "$doubled_size" "$doubled_size" "$ICON_SOURCE" --out "$ICONSET_DIR/icon_${size}x${size}@2x.png" >/dev/null
  done

  iconutil -c icns "$ICONSET_DIR" -o "$TMP_DIR/gameplan-turbo.icns"
  cp "$TMP_DIR/gameplan-turbo.icns" "$OUTPUT_APP/Contents/Resources/applet.icns"

  osascript <<EOF "$OUTPUT_APP" "$TMP_DIR/gameplan-turbo.icns" >/dev/null 2>&1 || true
on run argv
  set appFile to POSIX file (item 1 of argv) as alias
  set iconFile to POSIX file (item 2 of argv) as alias
  tell application "Finder"
    set icon of appFile to (read iconFile as picture)
  end tell
end run
EOF

  rm -rf "$TMP_DIR"
fi

touch "$OUTPUT_APP"

echo "Created macOS launcher at: $OUTPUT_APP"
