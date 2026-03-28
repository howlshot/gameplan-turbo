#!/bin/zsh

set -euo pipefail

SCRIPT_PATH="${(%):-%N}"
SCRIPT_DIR="$(cd -- "$(dirname -- "$SCRIPT_PATH")" && pwd)"
PROJECT_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
DEV_PORT="5173"
CODEX_BRIDGE_PORT="8765"
CLAUDE_BRIDGE_PORT="8766"
APP_URL="http://127.0.0.1:5173/"
LOG_DIR="$HOME/Library/Logs"
DEV_LOG="$LOG_DIR/gameplan-turbo-dev.log"
CODEX_BRIDGE_LOG="$LOG_DIR/gameplan-turbo-codex-bridge.log"
CLAUDE_BRIDGE_LOG="$LOG_DIR/gameplan-turbo-claude-bridge.log"

mkdir -p "$LOG_DIR"

is_listening() {
  lsof -nP -iTCP:"$1" -sTCP:LISTEN >/dev/null 2>&1
}

open_browser() {
  local url="$1"

  if open -a "Google Chrome" "$url" >/dev/null 2>&1; then
    osascript -e 'tell application "Google Chrome" to activate' >/dev/null 2>&1 || true
    return
  fi

  if open -a "Safari" "$url" >/dev/null 2>&1; then
    osascript -e 'tell application "Safari" to activate' >/dev/null 2>&1 || true
    return
  fi

  open "$url"
}

start_detached() {
  local command="$1"
  local log_file="$2"

  nohup zsh -lc "cd \"$PROJECT_DIR\" && $command" >>"$log_file" 2>&1 </dev/null &
}

if ! is_listening "$DEV_PORT"; then
  start_detached "corepack pnpm dev --host 127.0.0.1" "$DEV_LOG"
fi

if ! is_listening "$CODEX_BRIDGE_PORT"; then
  start_detached "corepack pnpm codex:bridge" "$CODEX_BRIDGE_LOG"
fi

if ! is_listening "$CLAUDE_BRIDGE_PORT"; then
  start_detached "corepack pnpm claude:bridge" "$CLAUDE_BRIDGE_LOG"
fi

for _ in {1..30}; do
  if is_listening "$DEV_PORT" && is_listening "$CODEX_BRIDGE_PORT" && is_listening "$CLAUDE_BRIDGE_PORT"; then
    break
  fi
  sleep 1
done

open_browser "$APP_URL"
