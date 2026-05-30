#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
#  VIGIL AI — Autonomous AI Workflow
#  Zero GitHub Actions. Everything runs locally or on any server.
#
#  This script IS the CI/CD pipeline. It validates, builds, packages, and
#  deploys the Vigil AI extension suite and landing page PWA.
#
#  Usage:
#    bash scripts/ai-workflow.sh                    # full pipeline
#    bash scripts/ai-workflow.sh --build-only       # validate + build only
#    bash scripts/ai-workflow.sh --build-extensions # extension zips only
#    bash scripts/ai-workflow.sh --deploy-icp       # deploy PWA to ICP
#    bash scripts/ai-workflow.sh --release v19.0.0  # tag + full release
#
#  Prerequisites:
#    - Node.js ≥ 18
#    - zip
#    - dfx (for --deploy-icp)  → sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
# ═══════════════════════════════════════════════════════════════════════════
set -euo pipefail

# ── Colours ────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'
PURPLE='\033[0;35m'

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
EXT_DIR="$REPO/extensions/jarvis"
DIST="$REPO/dist"
EXT_DIST="$DIST/extensions"
BUILD_LOG="$REPO/dist/build.log"

# ── Flags ──────────────────────────────────────────────────────────────────
BUILD_ONLY=false
BUILD_EXT_ONLY=false
DEPLOY_ICP=false
RELEASE_TAG=""

for arg in "$@"; do
  case "$arg" in
    --build-only)       BUILD_ONLY=true ;;
    --build-extensions) BUILD_EXT_ONLY=true ;;
    --deploy-icp)       DEPLOY_ICP=true ;;
    --release)          shift; RELEASE_TAG="${1:-}" ;;
    -h|--help)
      echo -e "${BOLD}Vigil AI Autonomous Workflow${RESET}"
      echo "  bash scripts/ai-workflow.sh [options]"
      echo ""
      echo "Options:"
      echo "  (none)              Full pipeline: lint → build → package → summary"
      echo "  --build-only        Lint + build, no packaging"
      echo "  --build-extensions  Extension zips only"
      echo "  --deploy-icp        Deploy PWA to Internet Computer"
      echo "  --release TAG       Full release (build + tag + ICP deploy)"
      exit 0 ;;
  esac
done

mkdir -p "$DIST" "$EXT_DIST"
exec 2> >(tee -a "$BUILD_LOG" >&2)

banner() { echo -e "\n${BOLD}${CYAN}═══ $1 ═══${RESET}"; }
ok()     { echo -e "  ${GREEN}✓${RESET} $1"; }
warn()   { echo -e "  ${YELLOW}⚠${RESET}  $1"; }
err()    { echo -e "  ${RED}✗${RESET} $1"; }
info()   { echo -e "  ${PURPLE}→${RESET} $1"; }
sep()    { echo -e "${CYAN}─────────────────────────────────────────────────────────────${RESET}"; }

echo ""
echo -e "${BOLD}${CYAN}"
echo "  ╔══════════════════════════════════════════════════╗"
echo "  ║     VIGIL AI  •  AUTONOMOUS BUILD SYSTEM        ║"
echo "  ║     No GitHub Actions. Your workflow. Your law. ║"
echo "  ╚══════════════════════════════════════════════════╝"
echo -e "${RESET}"
echo -e "  ${BOLD}Time:${RESET}    $(date '+%Y-%m-%d %H:%M:%S %Z')"
echo -e "  ${BOLD}Repo:${RESET}    $REPO"
echo -e "  ${BOLD}Node:${RESET}    $(node --version 2>/dev/null || echo 'not found')"
echo -e "  ${BOLD}Log:${RESET}     $BUILD_LOG"
sep

# ═══════════════════════════════════════════════════════════════
# PHASE 1: VALIDATION
# ═══════════════════════════════════════════════════════════════
banner "Phase 1/4 — Validate"

# Lint manifests
if [ -f "$REPO/scripts/lint-manifests.js" ]; then
  info "Linting extension manifests..."
  if node "$REPO/scripts/lint-manifests.js" 2>&1; then
    ok "All manifests valid"
  else
    warn "Manifest lint warnings (non-fatal)"
  fi
fi

# Run tests
if [ -d "$REPO/test" ] && ls "$REPO/test/"*.test.js &>/dev/null; then
  info "Running test suite..."
  if node --test "$REPO/test/"*.test.js 2>&1; then
    ok "All tests passed"
  else
    warn "Some tests failed — check $BUILD_LOG"
  fi
else
  info "No test files found — skipping tests"
fi

ok "Validation phase complete"

if $BUILD_ONLY; then
  banner "Build-only mode — stopping after validation"
  exit 0
fi

# ═══════════════════════════════════════════════════════════════
# PHASE 2: BUILD VIGIL AI EXTENSION
# ═══════════════════════════════════════════════════════════════
banner "Phase 2/4 — Build Vigil AI Extension"

cd "$EXT_DIR"
info "Installing npm packages (silent)..."
npm install --silent 2>&1

info "Running Vite production build..."
npm run build 2>&1

# Read actual built version
BUILT_VERSION="19.0.0"
if [ -f "$EXT_DIR/dist/manifest.json" ]; then
  BUILT_VERSION=$(node -e "const m=require('./dist/manifest.json'); console.log(m.version);" 2>/dev/null || echo "19.0.0")
fi

ok "Extension built → extensions/jarvis/dist/ (v${BUILT_VERSION})"

# ── Package the zip ────────────────────────────────────────────
ZIP_NAME="vigil-ai-v${BUILT_VERSION}.zip"
ZIP_PATH="$EXT_DIST/$ZIP_NAME"
rm -f "$ZIP_PATH"
(cd "$EXT_DIR/dist" && zip -r -q "$ZIP_PATH" . -x "*.DS_Store")
SIZE=$(du -sh "$ZIP_PATH" | cut -f1)
ok "Chrome/Edge zip → dist/extensions/$ZIP_NAME ($SIZE)"

cd "$REPO"

if $BUILD_EXT_ONLY; then
  banner "Extension build complete"
  echo -e "  📦 ${CYAN}dist/extensions/$ZIP_NAME${RESET}"
  exit 0
fi

# ═══════════════════════════════════════════════════════════════
# PHASE 3: PACKAGE ALL EXTENSIONS
# ═══════════════════════════════════════════════════════════════
banner "Phase 3/4 — Package All Extensions"

BROWSER_COUNT=0
WINDOWS_COUNT=0

for ext_path in "$REPO/extensions"/*/; do
  ext_name="$(basename "$ext_path")"
  [ "$ext_name" = "windows" ] && continue
  [ "$ext_name" = "jarvis" ] && continue  # already handled above
  [ ! -f "$ext_path/manifest.json" ] && continue
  [ -f "$ext_path/package.json" ] && continue  # Vite — skip

  zip_file="$EXT_DIST/$ext_name.zip"
  (cd "$ext_path" && zip -r -q "$zip_file" \
    manifest.json background.js content.js icons/ 2>/dev/null || true)

  if [ -f "$zip_file" ]; then
    sz=$(du -h "$zip_file" | cut -f1)
    ok "$ext_name.zip ($sz)"
    BROWSER_COUNT=$((BROWSER_COUNT + 1))
  fi
done

ok "Browser extensions packaged: $BROWSER_COUNT"

# ── All-in-one bundle ─────────────────────────────────────────
ALL_ZIP="$EXT_DIST/all-extensions.zip"
rm -f "$ALL_ZIP"
(cd "$EXT_DIST" && zip -r -q "$ALL_ZIP" . -x "all-extensions.zip")
ALL_SIZE=$(du -sh "$ALL_ZIP" | cut -f1)
ok "all-extensions.zip → $ALL_SIZE (all $BROWSER_COUNT extensions + Vigil AI)"

# ═══════════════════════════════════════════════════════════════
# PHASE 4: SUMMARY & DOWNLOAD LINKS
# ═══════════════════════════════════════════════════════════════
banner "Phase 4/4 — Delivery Summary"

REPO_URL="https://github.com/FreddyCreates/potential-succotash"
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")
RAW_BASE="$REPO_URL/raw/$BRANCH"

echo ""
echo -e "${BOLD}  ┌─────────────────────────────────────────────────────────┐"
echo -e "  │  VIGIL AI v${BUILT_VERSION} — DOWNLOAD LINKS                   │"
echo -e "  └─────────────────────────────────────────────────────────┘${RESET}"
echo ""
echo -e "  ${BOLD}🔵 Chrome / Edge Extension (sideload)${RESET}"
echo -e "     ${CYAN}${RAW_BASE}/dist/extensions/${ZIP_NAME}${RESET}"
echo ""
echo -e "  ${BOLD}🟣 All Extensions Bundle${RESET}"
echo -e "     ${CYAN}${RAW_BASE}/dist/extensions/all-extensions.zip${RESET}"
echo ""
echo -e "  ${BOLD}🌐 Landing Page / PWA${RESET}"
echo -e "     GitHub Pages: ${CYAN}https://freddycreates.github.io/potential-succotash/${RESET}"
echo -e "     ICP (deploy yourself): ${CYAN}bash scripts/deploy-icp.sh${RESET}"
echo ""
echo -e "  ${BOLD}📥 One-click installer${RESET}"
echo -e "     Windows: ${CYAN}install-vigil-edge.bat${RESET}"
echo -e "     macOS/Linux: ${CYAN}bash install.sh${RESET}"
echo ""

# Update VIGIL_DOWNLOADS.md
cat > "$REPO/VIGIL_DOWNLOADS.md" << MDEOF
# Vigil AI — Download Links

> Auto-generated by \`bash scripts/ai-workflow.sh\` on $(date '+%Y-%m-%d %H:%M UTC')

## 🔵 Chrome / Edge Extension

**Direct download (sideload zip):**
\`\`\`
${RAW_BASE}/dist/extensions/${ZIP_NAME}
\`\`\`

**Install steps:**
1. Download the zip above
2. Go to \`chrome://extensions\` (or \`edge://extensions\`)
3. Enable **Developer Mode**
4. Click **Load Unpacked** and select the unzipped folder
   — or drag-drop the zip directly

## 🟣 All Extensions Bundle

\`\`\`
${RAW_BASE}/dist/extensions/all-extensions.zip
\`\`\`
Contains all $BROWSER_COUNT browser extensions + Vigil AI.

## 🌐 PWA / Landing Page

- **GitHub Pages (legacy):** https://freddycreates.github.io/potential-succotash/
- **Internet Computer (ICP):** Deploy with \`bash scripts/deploy-icp.sh\`

## 📥 One-click Installers

| Platform | Command |
|----------|---------|
| Windows  | Double-click \`install-vigil-edge.bat\` |
| macOS/Linux | \`bash install.sh\` |

## 🔧 Build It Yourself

\`\`\`bash
git clone https://github.com/FreddyCreates/potential-succotash
cd potential-succotash
bash scripts/ai-workflow.sh
\`\`\`

---
*No GitHub Actions. Pure autonomous build system.*
MDEOF

ok "VIGIL_DOWNLOADS.md updated"

# ── ICP deploy if requested ────────────────────────────────────
if $DEPLOY_ICP; then
  bash "$REPO/scripts/deploy-icp.sh"
fi

# ── Release tagging if requested ──────────────────────────────
if [ -n "$RELEASE_TAG" ]; then
  banner "Tagging release: $RELEASE_TAG"
  git tag -a "$RELEASE_TAG" -m "Vigil AI $RELEASE_TAG — autonomous release"
  git push origin "$RELEASE_TAG"
  ok "Tagged $RELEASE_TAG and pushed"
fi

echo ""
sep
echo -e "${BOLD}${GREEN}  ✓ Build complete.${RESET} All artifacts in dist/"
echo ""
