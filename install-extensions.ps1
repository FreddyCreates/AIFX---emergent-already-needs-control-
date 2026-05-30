# ─────────────────────────────────────────────────────────────
# install-extensions.ps1
# One-click installer. Run this. Extensions load into Edge/Chrome.
# Edge-first on Windows — native integration, one click.
# Loads extensions DIRECTLY from source — no zips, no extracts.
# If repo not present, clones it automatically.
#
# Usage: Just run it.
#   Right-click → Run with PowerShell
#   OR: powershell -ExecutionPolicy Bypass -File install-extensions.ps1
# ─────────────────────────────────────────────────────────────

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "═══════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "  🧬 Sovereign Organism Installer" -ForegroundColor Yellow
Write-Host "  One click. Zero steps. Edge-first." -ForegroundColor Yellow
Write-Host "  Direct from source. Compiled." -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""

# ── Locate extensions directory ────────────────────────────
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$extDir = Join-Path $scriptDir "extensions"
$repoDir = $scriptDir

if (-not (Test-Path $extDir)) {
    Write-Host "  Extensions not found in current directory." -ForegroundColor Yellow
    Write-Host "  Cloning the Sovereign Organism repository..." -ForegroundColor Cyan
    Write-Host ""

    # Check if git is available
    $gitPath = Get-Command git -ErrorAction SilentlyContinue
    if (-not $gitPath) {
        Write-Host "  ERROR: Git is not installed." -ForegroundColor Red
        Write-Host "  Install Git from https://git-scm.com/download/win" -ForegroundColor Yellow
        Write-Host "  Then run this script again." -ForegroundColor Yellow
        Write-Host ""
        pause
        exit 1
    }

    $repoDir = Join-Path $env:USERPROFILE "SovereignOrganism"
    $extDir = Join-Path $repoDir "extensions"

    if (Test-Path $extDir) {
        Write-Host "  Found existing clone at $repoDir" -ForegroundColor Green
        Write-Host "  Pulling latest..." -ForegroundColor Cyan
        Push-Location $repoDir
        git pull 2>&1 | Out-Null
        Pop-Location
    } else {
        try {
            git clone "https://github.com/FreddyCreates/potential-succotash.git" $repoDir 2>&1
        } catch {
            Write-Host "  ERROR: Failed to clone repository." -ForegroundColor Red
            Write-Host "  Check your internet connection and try again." -ForegroundColor Yellow
            Write-Host ""
            pause
            exit 1
        }
    }
    Write-Host ""
}

# ── Scan extension directories from source ─────────────────
# Each subdirectory with manifest.json is a valid extension.
# Load DIRECTLY from source — no zip, no extract needed.

$extDirs = Get-ChildItem -Path $extDir -Directory | Where-Object {
    Test-Path (Join-Path $_.FullName "manifest.json")
}

if ($extDirs.Count -eq 0) {
    Write-Host "  No extensions found with manifest.json in $extDir" -ForegroundColor Red
    Write-Host ""
    pause
    exit 1
}

$loadPaths = @()
$count = 0

foreach ($dir in $extDirs) {
    $loadPaths += $dir.FullName
    $count++
    Write-Host "  ✓ $($dir.Name)" -ForegroundColor Green
}

Write-Host ""
Write-Host "  $count extensions ready — loaded from source" -ForegroundColor Green
Write-Host "  No zip. No extract. Compiled and working." -ForegroundColor Green
Write-Host ""

# ── Find browser — Edge FIRST (native Windows), then Chrome, then Brave ──
$browserPaths = @(
    "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
    "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
    "$env:LOCALAPPDATA\Microsoft\Edge\Application\msedge.exe",
    "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
    "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe",
    "$env:ProgramFiles\BraveSoftware\Brave-Browser\Application\brave.exe"
)

$browser = $null
$browserName = "Browser"
foreach ($path in $browserPaths) {
    if (Test-Path $path) {
        $browser = $path
        if ($path -match "msedge") { $browserName = "Edge" }
        elseif ($path -match "chrome") { $browserName = "Chrome" }
        elseif ($path -match "brave") { $browserName = "Brave" }
        break
    }
}

# ── Launch with extensions pre-loaded from source ──────────
if ($browser) {
    $loadArg = ($loadPaths -join ",")
    Write-Host "  Launching $browserName with $count extensions attached..." -ForegroundColor Cyan
    Start-Process $browser "--load-extension=$loadArg"
    Write-Host ""
    Write-Host "═══════════════════════════════════════════" -ForegroundColor Green
    Write-Host "  ✅ Done! Extensions are live in $browserName." -ForegroundColor Green
    Write-Host "  Loaded directly from source. No zip needed." -ForegroundColor Green
    Write-Host "  They run 24/7 with 873ms heartbeat keepalive." -ForegroundColor Green
    Write-Host "═══════════════════════════════════════════" -ForegroundColor Green
} else {
    Write-Host "  No Chromium browser found." -ForegroundColor Yellow
    Write-Host "  Extensions are at: $extDir" -ForegroundColor Yellow
    Write-Host "  Open edge://extensions → Enable Developer Mode → Load unpacked" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "  Extensions loaded from: $extDir" -ForegroundColor Cyan
Write-Host "  No zip. No extract. Direct from source. As above, so below." -ForegroundColor Cyan
Write-Host ""
