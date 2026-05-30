#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# install-organism.sh — TRUE 1-CLICK macOS/Linux Installer
#
# Run this script. That's it.
# It finds Chrome, loads all 20 AI extensions unpacked, and launches.
# No unzipping. No manual steps. No GitHub needed.
# ═══════════════════════════════════════════════════════════════════════

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXT_DIR="${SCRIPT_DIR}/extensions"

echo ""
echo "  ╔══════════════════════════════════════════════════════════╗"
echo "  ║   🧬 Organism AI — One-Click Extension Installer        ║"
echo "  ╚══════════════════════════════════════════════════════════╝"
echo ""

# Collect all browser extension paths
EXT_PATHS=""
EXT_COUNT=0

for ext_path in "${EXT_DIR}"/*/; do
  ext_name="$(basename "${ext_path}")"
  [ "${ext_name}" = "windows" ] && continue
  [ ! -f "${ext_path}/manifest.json" ] && continue
  [ ! -f "${ext_path}/background.js" ] && continue
  [ ! -f "${ext_path}/content.js" ] && continue

  if [ -n "${EXT_PATHS}" ]; then
    EXT_PATHS="${EXT_PATHS},${ext_path%/}"
  else
    EXT_PATHS="${ext_path%/}"
  fi

  EXT_COUNT=$((EXT_COUNT + 1))
  echo "  ✓ ${ext_name}"
done

echo ""
echo "  Found ${EXT_COUNT} browser extensions."
echo ""

if [ "${EXT_COUNT}" -eq 0 ]; then
  echo "  ✗ No extensions found in ${EXT_DIR}"
  exit 1
fi

# Find Chrome
CHROME=""
UNAME="$(uname -s)"

if [ "${UNAME}" = "Darwin" ]; then
  # macOS
  if [ -f "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" ]; then
    CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
  elif [ -f "${HOME}/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" ]; then
    CHROME="${HOME}/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
  fi
else
  # Linux
  for candidate in google-chrome google-chrome-stable chromium chromium-browser; do
    if command -v "${candidate}" &>/dev/null; then
      CHROME="$(command -v "${candidate}")"
      break
    fi
  done
fi

if [ -z "${CHROME}" ]; then
  echo "  ✗ Chrome not found."
  echo ""
  echo "  Extensions are ready in: ${EXT_DIR}"
  echo "  Manually: chrome://extensions > Developer Mode > Load unpacked"
  echo ""
  echo "  Or launch Chrome with:"
  echo "  google-chrome --load-extension=${EXT_PATHS}"
  exit 1
fi

echo "  ✓ Chrome found: ${CHROME}"

# Create profile directory
PROFILE="${HOME}/.organism-chrome-profile"
mkdir -p "${PROFILE}"

echo "  ✓ Profile: ${PROFILE}"
echo ""
echo "  ⚡ Launching Chrome with ${EXT_COUNT} AI extensions..."
echo ""

# Launch Chrome with all extensions loaded unpacked
"${CHROME}" \
  --user-data-dir="${PROFILE}" \
  --load-extension="${EXT_PATHS}" \
  --no-first-run \
  --no-default-browser-check &

echo "  ✓ Done! Chrome is launching with all AI extensions."
echo "  ✓ Open any webpage to see the AI panels."
echo ""
