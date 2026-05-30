#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# build-extensions.sh
# Packages every extension under extensions/ into a downloadable
# .zip file that can be sideloaded into Chrome / Edge / Brave.
# Includes 5 Windows + Edge native extensions.
#
# Output: dist/extensions/<name>.zip  (one per extension)
#         dist/extensions/all-extensions.zip (bundle of everything)
#
# Usage:
#   bash build-extensions.sh          # build all
#   bash build-extensions.sh --clean  # clean dist/ first (default)
#   bash build-extensions.sh --check  # dry run — validate only
# ─────────────────────────────────────────────────────────────
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
EXT_SRC="$REPO_ROOT/extensions"
DIST="$REPO_ROOT/dist/extensions"
CHECK_ONLY=false

for arg in "$@"; do
  case "$arg" in
    --check) CHECK_ONLY=true ;;
  esac
done

# Ensure icons exist before building
if [ -f "$REPO_ROOT/scripts/generate-icons.js" ]; then
  echo "  Checking extension icons..."
  node "$REPO_ROOT/scripts/generate-icons.js"
fi

if [ "$CHECK_ONLY" = true ]; then
  echo ""
  echo "  Dry run complete — no zips created."
  exit 0
fi

rm -rf "$DIST"
mkdir -p "$DIST"

echo ""
echo "═══════════════════════════════════════════"
echo "  Organism Extension Builder"
echo "  Building downloadable Edge/Chrome extensions"
echo "  Includes Windows + Edge native extensions"
echo "═══════════════════════════════════════════"
echo ""

count=0
errors=0
for ext_dir in "$EXT_SRC"/*/; do
  name="$(basename "$ext_dir")"
  manifest="$ext_dir/manifest.json"

  # Skip non-extension dirs (e.g. windows/) and dirs without manifest
  [ -f "$manifest" ] || continue

  # Validate manifest JSON is parseable
  if ! python3 -c "import json; json.load(open('$manifest'))" 2>/dev/null && \
     ! node -e "JSON.parse(require('fs').readFileSync('$manifest','utf8'))" 2>/dev/null; then
    echo "  ✗ $name — invalid manifest.json (skipped)"
    errors=$((errors + 1))
    continue
  fi

  echo "  📦 Packaging: $name"

  # For extensions with a Vite build (dist/manifest.json), zip from dist/
  if [ -f "$ext_dir/dist/manifest.json" ]; then
    echo "  ↳ Using Vite build from $name/dist/"
    (cd "$ext_dir/dist" && zip -r -q "$DIST/${name}.zip" .)
  else
    # Build a file list of what actually exists
    FILES_TO_ZIP=""
    for f in manifest.json background.js content.js; do
      [ -f "$ext_dir/$f" ] && FILES_TO_ZIP="$FILES_TO_ZIP $f"
    done

    # Include icons directory if it exists
    if [ -d "$ext_dir/icons" ]; then
      FILES_TO_ZIP="$FILES_TO_ZIP icons/"
    fi

    # Include any popup or options pages if present
    for f in popup.html popup.js options.html options.js styles.css sidepanel.html sidepanel.js; do
      [ -f "$ext_dir/$f" ] && FILES_TO_ZIP="$FILES_TO_ZIP $f"
    done

    if [ -z "$FILES_TO_ZIP" ]; then
      echo "  ⚠ $name — no files to package (skipped)"
      errors=$((errors + 1))
      continue
    fi

    (cd "$ext_dir" && zip -r -q "$DIST/${name}.zip" $FILES_TO_ZIP)
  fi

  # Include any popup, options, side panel, or devtools pages if present
  for f in popup.html popup.js options.html options.js styles.css sidepanel.html devtools.html devtools.js devtools-panel.html; do
    [ -f "$ext_dir/$f" ] && FILES_TO_ZIP="$FILES_TO_ZIP $f"
  done

  # Include Universal CPL WASM binary if present (Jarvis AI)
  [ -f "$ext_dir/jarvisius-engine.wasm" ] && FILES_TO_ZIP="$FILES_TO_ZIP jarvisius-engine.wasm"

  # Include workspace files if present
  for f in "$ext_dir"/*.code-workspace; do
    [ -f "$f" ] && FILES_TO_ZIP="$FILES_TO_ZIP $(basename "$f")"
  done

  if [ -z "$FILES_TO_ZIP" ]; then
    echo "  ⚠ $name — no files to package (skipped)"
    errors=$((errors + 1))
    continue
  fi

  (cd "$ext_dir" && zip -r -q "$DIST/${name}.zip" $FILES_TO_ZIP)

  # Verify the zip was created and has content
  if [ ! -s "$DIST/${name}.zip" ]; then
    echo "  ✗ $name — zip creation failed"
    errors=$((errors + 1))
    continue
  fi

  count=$((count + 1))
done

echo ""

# ── Also package nested Windows extensions ───────────────────────────
if [ -d "$EXT_SRC/windows" ]; then
  for ext_dir in "$EXT_SRC"/windows/*/; do
    name="$(basename "$ext_dir")"
    manifest="$ext_dir/manifest.json"
    [ -f "$manifest" ] || continue

    if ! python3 -c "import json; json.load(open('$manifest'))" 2>/dev/null && \
       ! node -e "JSON.parse(require('fs').readFileSync('$manifest','utf8'))" 2>/dev/null; then
      echo "  ✗ $name — invalid manifest.json (skipped)"
      errors=$((errors + 1))
      continue
    fi

    echo "  📦 Packaging: $name (Windows)"

    FILES_TO_ZIP=""
    for f in manifest.json background.js content.js; do
      [ -f "$ext_dir/$f" ] && FILES_TO_ZIP="$FILES_TO_ZIP $f"
    done
    if [ -d "$ext_dir/icons" ]; then
      FILES_TO_ZIP="$FILES_TO_ZIP icons/"
    fi
    for f in popup.html popup.js options.html options.js styles.css sidepanel.html sidepanel.js; do
      [ -f "$ext_dir/$f" ] && FILES_TO_ZIP="$FILES_TO_ZIP $f"
    done

    if [ -z "$FILES_TO_ZIP" ]; then
      echo "  ⚠ $name — no files to package (skipped)"
      errors=$((errors + 1))
      continue
    fi

    (cd "$ext_dir" && zip -r -q "$DIST/${name}.zip" $FILES_TO_ZIP)

    if [ ! -s "$DIST/${name}.zip" ]; then
      echo "  ✗ $name — zip creation failed"
      errors=$((errors + 1))
      continue
    fi

    count=$((count + 1))
  done
fi

# Create an all-in-one bundle
if [ "$count" -gt 0 ]; then
  echo "  📦 Creating all-extensions bundle..."
  (cd "$DIST" && zip -r -q all-extensions.zip *.zip)
else
  echo "  ⚠ No extensions were packaged — skipping bundle"
fi

echo ""
echo "═══════════════════════════════════════════"
if [ "$errors" -gt 0 ]; then
  echo "  ✅ $count extensions packaged ($errors warnings)"
else
  echo "  ✅ $count extensions packaged"
fi
echo "  📂 Output: dist/extensions/"
echo "═══════════════════════════════════════════"
echo ""

if [ "$count" -gt 0 ]; then
  echo "Individual zips:"
  ls -lh "$DIST"/*.zip | grep -v all-extensions | awk '{print "  " $NF " (" $5 ")"}'
  echo ""
  echo "Bundle:"
  ls -lh "$DIST"/all-extensions.zip | awk '{print "  " $NF " (" $5 ")"}'
fi

if [ "$errors" -gt 0 ]; then
  exit 1
fi
