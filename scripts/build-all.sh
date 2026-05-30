#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
#  Vigil AI — Master Build Script
#  Builds all three delivery targets:
#    1. Chrome/Edge extension zip  → dist/extensions/vigil-ai-v18.zip
#    2. Standalone web app         → dist/webapp/
#    3. Desktop app config         → electron/ (run on Windows for .exe)
#
#  Usage:
#    bash scripts/build-all.sh              # build all
#    bash scripts/build-all.sh --ext-only   # extension zip only
#    bash scripts/build-all.sh --web-only   # web app only
#
#  No GitHub Actions required — this is the custom AI workflow.
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
EXT_DIR="$REPO/extensions/jarvis"
DIST="$REPO/dist"
EXT_DIST="$DIST/extensions"
WEBAPP_DIST="$DIST/webapp"

EXT_ONLY=false
WEB_ONLY=false
for arg in "$@"; do
  case "$arg" in
    --ext-only) EXT_ONLY=true ;;
    --web-only) WEB_ONLY=true ;;
  esac
done

# ─── Colours ──────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

banner() { echo -e "\n${BOLD}${CYAN}══ $1 ══${RESET}"; }
ok()     { echo -e "  ${GREEN}✓${RESET} $1"; }
info()   { echo -e "  ○ $1"; }

banner "Vigil AI — Full Production Build"
echo -e "  ${BOLD}Repo:${RESET} $REPO"
echo -e "  ${BOLD}Node:${RESET} $(node --version 2>/dev/null || echo 'not found')"
echo ""

# ═══════════════════════════════════════
# STEP 1: Install extension deps & build
# ═══════════════════════════════════════
if ! $WEB_ONLY; then
  banner "1/3  Building Vigil AI Chrome Extension"

  cd "$EXT_DIR"
  info "Installing npm packages..."
  npm install --silent
  info "Running Vite build..."
  npm run build

  ok "Extension built → extensions/jarvis/dist/"

  # ── Zip it ────────────────────────────────────────────────
  mkdir -p "$EXT_DIST"
  ZIP="$EXT_DIST/vigil-ai-v18.zip"
  rm -f "$ZIP"
  (cd "$EXT_DIR/dist" && zip -r -q "$ZIP" .)
  SIZE=$(du -sh "$ZIP" | cut -f1)
  ok "Chrome zip created → dist/extensions/vigil-ai-v18.zip ($SIZE)"

  cd "$REPO"
fi

# ═══════════════════════════════════════
# STEP 2: Build standalone web app
# ═══════════════════════════════════════
if ! $EXT_ONLY; then
  banner "2/3  Building Standalone Web App"

  # Copy the built sidepanel as a self-contained web app
  mkdir -p "$WEBAPP_DIST"
  rm -rf "$WEBAPP_DIST"/*

  if [ ! -d "$EXT_DIR/dist" ]; then
    echo -e "  ${RED}✗ Extension not built yet — run without --web-only first${RESET}"
    exit 1
  fi

  cp -r "$EXT_DIR/dist/"* "$WEBAPP_DIST/"

  # Patch sidepanel.html to work outside Chrome (remove chrome.* API dependency message)
  SIDEPANEL="$WEBAPP_DIST/src/sidepanel/sidepanel.html"
  if [ -f "$SIDEPANEL" ]; then
    ok "Standalone web app → dist/webapp/"
    info "Serve with: npx serve dist/webapp/src/sidepanel/"
  fi
fi

# ═══════════════════════════════════════
# STEP 3: Summary & download links
# ═══════════════════════════════════════
banner "3/3  Build Summary"

REPO_URL="https://github.com/FreddyCreates/potential-succotash"
BRANCH="copilot/create-jarvis-integration"

echo ""
echo -e "${BOLD}  📦 Chrome / Edge Extension (sideload zip)${RESET}"
echo -e "  Download: ${CYAN}${REPO_URL}/raw/${BRANCH}/dist/extensions/vigil-ai-v18.zip${RESET}"
echo ""
echo -e "${BOLD}  🌐 Standalone Web App${RESET}"
echo -e "  Browse: ${CYAN}${REPO_URL}/tree/${BRANCH}/dist/webapp${RESET}"
echo ""
echo -e "${BOLD}  🖥️  Windows Desktop App (build on Windows)${RESET}"
echo -e "  1. Clone this repo on Windows"
echo -e "  2. Run: npm install && npm run build:desktop:win"
echo -e "  3. Installer: dist/desktop/Vigil AI Setup*.exe"
echo ""
echo -e "${BOLD}  ⚡ Electron (dev mode, any OS)${RESET}"
echo -e "  npm install && npm run start:desktop"
echo ""
ok "All deliverables ready."
