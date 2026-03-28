#!/bin/zsh

set -euo pipefail

SCRIPT_PATH="${(%):-%N}"
SCRIPT_DIR="$(cd -- "$(dirname -- "$SCRIPT_PATH")" && pwd)"
PROJECT_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
LAUNCH_SCRIPT="$PROJECT_DIR/scripts/launch-gameplan-turbo.sh"
OUTPUT_APP="${1:-$HOME/Applications/Gameplan Turbo.app}"
ICON_SOURCE="$PROJECT_DIR/public/gameplan-turbo-icon.png"
APP_NAME="Gameplan Turbo"
APP_EXECUTABLE="gameplan-turbo-launcher"
APP_BUNDLE_ID="com.gameplanturbo.launcher"

if [[ ! -x "$LAUNCH_SCRIPT" ]]; then
  echo "Launch script not found or not executable: $LAUNCH_SCRIPT" >&2
  exit 1
fi

APP_DIR="$(dirname -- "$OUTPUT_APP")"
CONTENTS_DIR="$OUTPUT_APP/Contents"
MACOS_DIR="$CONTENTS_DIR/MacOS"
RESOURCES_DIR="$CONTENTS_DIR/Resources"

mkdir -p "$APP_DIR"
rm -rf "$OUTPUT_APP"
mkdir -p "$MACOS_DIR" "$RESOURCES_DIR"

cat >"$CONTENTS_DIR/Info.plist" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleDevelopmentRegion</key>
  <string>en</string>
  <key>CFBundleDisplayName</key>
  <string>${APP_NAME}</string>
  <key>CFBundleExecutable</key>
  <string>${APP_EXECUTABLE}</string>
  <key>CFBundleIdentifier</key>
  <string>${APP_BUNDLE_ID}</string>
  <key>CFBundleInfoDictionaryVersion</key>
  <string>6.0</string>
  <key>CFBundleName</key>
  <string>${APP_NAME}</string>
  <key>CFBundlePackageType</key>
  <string>APPL</string>
  <key>CFBundleShortVersionString</key>
  <string>1.0</string>
  <key>CFBundleVersion</key>
  <string>1</string>
  <key>CFBundleIconFile</key>
  <string>gameplan-turbo.icns</string>
  <key>LSMinimumSystemVersion</key>
  <string>11.0</string>
  <key>NSHighResolutionCapable</key>
  <true/>
</dict>
</plist>
EOF

cat >"$MACOS_DIR/$APP_EXECUTABLE" <<EOF
#!/bin/zsh
set -euo pipefail
exec "$LAUNCH_SCRIPT"
EOF
chmod +x "$MACOS_DIR/$APP_EXECUTABLE"

if [[ -f "$ICON_SOURCE" ]] && command -v iconutil >/dev/null 2>&1; then
  TMP_DIR="$(mktemp -d)"
  ICONSET_DIR="$TMP_DIR/GameplanTurbo.iconset"
  mkdir -p "$ICONSET_DIR"

  for size in 16 32 128 256 512; do
    sips -z "$size" "$size" "$ICON_SOURCE" --out "$ICONSET_DIR/icon_${size}x${size}.png" >/dev/null
    doubled_size=$((size * 2))
    sips -z "$doubled_size" "$doubled_size" "$ICON_SOURCE" --out "$ICONSET_DIR/icon_${size}x${size}@2x.png" >/dev/null
  done

  iconutil -c icns "$ICONSET_DIR" -o "$RESOURCES_DIR/gameplan-turbo.icns"
  rm -rf "$TMP_DIR"
fi

touch "$OUTPUT_APP"

echo "Created macOS launcher at: $OUTPUT_APP"
