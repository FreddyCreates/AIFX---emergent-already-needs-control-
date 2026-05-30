#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# install.sh — Sovereign Organism Extension Installer
#
# Works anywhere: USB drive, download folder, extracted tarball.
# No git. No npm. No Node.js. Just bash + unzip + a browser.
#
# Usage:
#   bash install.sh            # install all extensions
#   bash install.sh --list     # list available extensions
#   bash install.sh --help     # show help
# ─────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# ── Locate extension zips ────────────────────────────────────
ZIP_DIR=""
if [ -d "$SCRIPT_DIR/dist/extensions" ]; then
  ZIP_DIR="$SCRIPT_DIR/dist/extensions"
elif [ -d "$SCRIPT_DIR/extensions" ] && ls "$SCRIPT_DIR/extensions"/*.zip >/dev/null 2>&1; then
  ZIP_DIR="$SCRIPT_DIR/extensions"
elif ls "$SCRIPT_DIR"/*.zip >/dev/null 2>&1; then
  ZIP_DIR="$SCRIPT_DIR"
else
  echo ""
  echo "  No extension zips found."
  echo ""
  echo "  Expected locations:"
  echo "    $SCRIPT_DIR/dist/extensions/*.zip"
  echo "    $SCRIPT_DIR/*.zip"
  echo ""
  echo "  Build them first:  bash build-extensions.sh"
  echo ""
  exit 1
fi

# ── Parse args ───────────────────────────────────────────────
case "${1:-install}" in
  --help|-h|help)
    echo ""
    echo "  Sovereign Organism — Extension Installer"
    echo ""
    echo "  Usage:"
    echo "    bash install.sh            Install all extensions into your browser"
    echo "    bash install.sh --list     List available extension zips"
    echo "    bash install.sh --help     Show this help"
    echo ""
    echo "  Works from any folder. No git. No npm. No Node.js."
    echo "  Just needs: bash, unzip, and a Chromium browser."
    echo ""
    exit 0
    ;;
  --list|-l|list)
    echo ""
    echo "  Available extensions in: $ZIP_DIR"
    echo ""
    for z in "$ZIP_DIR"/*.zip; do
      name="$(basename "$z" .zip)"
      [ "$name" = "all-extensions" ] && continue
      size="$(du -h "$z" | cut -f1)"
      echo "    $name ($size)"
    done
    echo ""
    exit 0
    ;;
esac

# ── Check unzip ──────────────────────────────────────────────
if ! command -v unzip >/dev/null 2>&1; then
  echo ""
  echo "  'unzip' not found. Install it:"
  echo "    Ubuntu/Debian: sudo apt install unzip"
  echo "    macOS:         (pre-installed)"
  echo "    Fedora:        sudo dnf install unzip"
  echo ""
  exit 1
fi

# ── Install directory ────────────────────────────────────────
INSTALL_DIR="${HOME}/.organism-extensions"
mkdir -p "$INSTALL_DIR"

echo ""
echo "  ═══════════════════════════════════════════"
echo "    Sovereign Organism — Extension Installer"
echo "    No GitHub. No npm. No Node.js."
echo "  ═══════════════════════════════════════════"
echo ""

# ── Extract each extension ───────────────────────────────────
count=0
LOAD_PATHS=""

for zipfile in "$ZIP_DIR"/*.zip; do
  name="$(basename "$zipfile" .zip)"
  [ "$name" = "all-extensions" ] && continue

  ext_dir="$INSTALL_DIR/$name"
  rm -rf "$ext_dir"
  mkdir -p "$ext_dir"
  unzip -q -o "$zipfile" -d "$ext_dir"

  echo "  ✓ $name"
  count=$((count + 1))

  if [ -n "$LOAD_PATHS" ]; then
    LOAD_PATHS="$LOAD_PATHS,$ext_dir"
  else
    LOAD_PATHS="$ext_dir"
  fi
done

echo ""
echo "  $count extensions extracted to:"
echo "    $INSTALL_DIR"
echo ""

# ── Find browser ─────────────────────────────────────────────
BROWSER=""
BROWSER_NAME=""

find_browser() {
  local name="$1" path="$2"
  if [ -x "$path" ] || command -v "$path" >/dev/null 2>&1; then
    BROWSER="$path"
    BROWSER_NAME="$name"
    return 0
  fi
  return 1
}

case "$(uname -s)" in
  Darwin)
    find_browser "Chrome" "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" ||
    find_browser "Chrome" "$HOME/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" ||
    find_browser "Edge" "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge" ||
    find_browser "Brave" "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser" ||
    find_browser "Chromium" "/Applications/Chromium.app/Contents/MacOS/Chromium" ||
    true
    ;;
  *)
    find_browser "Chrome" "google-chrome" ||
    find_browser "Chrome" "google-chrome-stable" ||
    find_browser "Chromium" "chromium" ||
    find_browser "Chromium" "chromium-browser" ||
    find_browser "Brave" "brave-browser" ||
    find_browser "Edge" "microsoft-edge" ||
    find_browser "Edge" "microsoft-edge-stable" ||
    true
    ;;
esac

# ── Launch ───────────────────────────────────────────────────
if [ -n "$BROWSER" ]; then
  echo "  Launching $BROWSER_NAME with $count extensions..."
  echo ""
  "$BROWSER" --load-extension="$LOAD_PATHS" &
  disown
  echo "  ═══════════════════════════════════════════"
  echo "    ✅ Done! Extensions are live in $BROWSER_NAME."
  echo "  ═══════════════════════════════════════════"
else
  echo "  No Chromium browser found automatically."
  echo ""
  echo "  Manual install:"
  echo "    1. Open Chrome → chrome://extensions"
  echo "    2. Enable Developer mode (top-right toggle)"
  echo "    3. Click 'Load unpacked' → select any folder in:"
  echo "       $INSTALL_DIR"
  echo ""
  echo "  Or launch manually:"
  echo "    google-chrome --load-extension=$LOAD_PATHS"
fi
echo ""
