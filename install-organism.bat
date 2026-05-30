@echo off
REM ═══════════════════════════════════════════════════════════
REM  Sovereign Organism — One-Click Extension Installer
REM
REM  Double-click this file. That's it.
REM  Loads all extensions DIRECTLY from source into Edge/Chrome.
REM  No zips. No extracts. No manual steps. Compiled and working.
REM  If the repo isn't here, it clones it automatically.
REM  Edge-first on Windows. One click native.
REM ═══════════════════════════════════════════════════════════

setlocal enabledelayedexpansion

echo.
echo  ======================================
echo   Sovereign Organism Installer
echo   One-click. Zero manual steps.
echo   Edge-first on Windows.
echo  ======================================
echo.

REM ── Locate the repo root (where this .bat lives) ─────────
set "SCRIPT_DIR=%~dp0"

REM ── Check if extensions/ directory exists here ───────────
REM    If it does, we're inside the cloned repo. Load from source.
REM    If not, clone the repo first and then load.

set "REPO_DIR=%SCRIPT_DIR%"
set "EXT_DIR=%REPO_DIR%extensions"

if not exist "%EXT_DIR%" (
    echo  Extensions not found in current directory.
    echo  Cloning the Sovereign Organism repository...
    echo.

    REM Check if git is available
    where git >nul 2>&1
    if errorlevel 1 (
        echo  ERROR: Git is not installed.
        echo  Please install Git from https://git-scm.com/download/win
        echo  Then double-click this file again.
        echo.
        pause
        exit /b 1
    )

    set "REPO_DIR=%USERPROFILE%\SovereignOrganism"
    set "EXT_DIR=!REPO_DIR!\extensions"

    if exist "!EXT_DIR!" (
        echo  Found existing clone at !REPO_DIR!
        echo  Pulling latest...
        pushd "!REPO_DIR!"
        git pull >nul 2>&1
        popd
    ) else (
        git clone https://github.com/FreddyCreates/potential-succotash.git "!REPO_DIR!" 2>&1
        if errorlevel 1 (
            echo  ERROR: Failed to clone repository.
            echo  Check your internet connection and try again.
            echo.
            pause
            exit /b 1
        )
    )
    echo.
)

REM ── Scan extensions directly from source ─────────────────
REM    Each subdirectory with a manifest.json is a valid extension.
REM    Load them DIRECTLY into the browser — no zip needed.

set "EXT_COUNT=0"
set "LOAD_PATHS="

echo  Scanning extensions from source...
echo.

for /D %%d in ("%EXT_DIR%\*") do (
    if exist "%%d\manifest.json" (
        set /a EXT_COUNT+=1
        echo   [OK] %%~nxd

        if defined LOAD_PATHS (
            set "LOAD_PATHS=!LOAD_PATHS!,%%d"
        ) else (
            set "LOAD_PATHS=%%d"
        )
    )
)

if %EXT_COUNT% == 0 (
    echo  ERROR: No extensions found with manifest.json
    echo  Make sure the extensions directory exists at:
    echo    %EXT_DIR%
    echo.
    pause
    exit /b 1
)

echo.
echo  ======================================
echo   %EXT_COUNT% extensions ready
echo   Loaded directly from source
echo   No zip. No extract. Compiled.
echo  ======================================
echo.

REM ── Find Edge FIRST (native on Windows), then Chrome, then Brave ──
set "BROWSER="

REM Try Edge first — native Windows browser, best integration
if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
    set "BROWSER=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
    set "BROWSER_NAME=Edge"
)
if not defined BROWSER (
    if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
        set "BROWSER=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
        set "BROWSER_NAME=Edge"
    )
)

REM Try Chrome if no Edge
if not defined BROWSER (
    if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
        set "BROWSER=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
        set "BROWSER_NAME=Chrome"
    )
)
if not defined BROWSER (
    if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
        set "BROWSER=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
        set "BROWSER_NAME=Chrome"
    )
)

REM Try Brave
if not defined BROWSER (
    if exist "%ProgramFiles%\BraveSoftware\Brave-Browser\Application\brave.exe" (
        set "BROWSER=%ProgramFiles%\BraveSoftware\Brave-Browser\Application\brave.exe"
        set "BROWSER_NAME=Brave"
    )
)

REM ── Launch browser with extensions pre-loaded ────────────
if defined BROWSER (
    echo  Launching %BROWSER_NAME% with %EXT_COUNT% extensions attached...
    echo.
    start "" "%BROWSER%" --load-extension="%LOAD_PATHS%"
    echo  Done! Extensions are live in %BROWSER_NAME%.
    echo  They run 24/7 with 873ms heartbeat keepalive.
    echo.
    echo  No zip. No extract. Direct from source. As above, so below.
) else (
    echo  No Chromium browser found.
    echo  Extensions are ready at: %EXT_DIR%
    echo  Open edge://extensions, enable Developer Mode,
    echo  then click "Load unpacked" and select each extension folder.
)

echo.
echo  Extensions loaded from:
echo    %EXT_DIR%
echo.
pause
