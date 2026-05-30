@echo off
title Vigil AI v14.0 - Windows Edge Installer
color 0B
cls

echo.
echo  ╔══════════════════════════════════════════════════════════════╗
echo  ║                                                              ║
echo  ║      ░░░░░░░  V.I.G.I.L  ░░░░░░░                         ║
echo  ║      Vigil AI — Sovereign Offline Intelligence          ║
echo  ║                                                              ║
echo  ║      VERSION  14.0  ──  SOVEREIGN INTELLIGENCE             ║
echo  ║      Highlights · Readability · Agents · PSE · NeuroCore    ║
echo  ║      Chat · Nexus · Vault · Prompts · Full side panel       ║
echo  ║                                                              ║
echo  ╚══════════════════════════════════════════════════════════════╝
echo.
echo  [ INSTALLING INTO MICROSOFT EDGE ]
echo.
echo  This will download and install Vigil AI into Edge.
echo  Takes about 10 seconds. No admin rights required.
echo.
pause

:: ── Locate Edge ──────────────────────────────────────────────
set "EDGE64=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
set "EDGE86=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
set "EDGE_PATH="

if exist "%EDGE64%" set "EDGE_PATH=%EDGE64%"
if exist "%EDGE86%" set "EDGE_PATH=%EDGE86%"

if "%EDGE_PATH%"=="" (
  echo.
  echo  [!] Microsoft Edge not found.
  echo      Get it at: https://microsoft.com/edge
  echo.
  pause
  exit /b 1
)

echo  [✓] Edge found: %EDGE_PATH%

:: ── Download ──────────────────────────────────────────────────
set "INSTALL_DIR=%LOCALAPPDATA%\VigilAI"
set "ZIP_FILE=%TEMP%\vigil-v14.zip"
set "DL_URL=https://github.com/FreddyCreates/potential-succotash/raw/copilot/create-jarvis-integration/dist/extensions/jarvis.zip"

echo.
echo  [*] Downloading Vigil AI v14.0...

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "try { Invoke-WebRequest -Uri '%DL_URL%' -OutFile '%ZIP_FILE%' -UseBasicParsing; Write-Host '  [OK] Download complete.' } catch { Write-Host '  [ERR] ' + $_.Exception.Message; exit 1 }"

if errorlevel 1 (
  echo.
  echo  [!] Download failed. Check your connection and try again.
  pause
  exit /b 1
)

:: ── Extract ───────────────────────────────────────────────────
echo.
echo  [*] Installing to %INSTALL_DIR%...

if exist "%INSTALL_DIR%" rd /s /q "%INSTALL_DIR%" 2>nul
mkdir "%INSTALL_DIR%" 2>nul

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "Expand-Archive -Path '%ZIP_FILE%' -DestinationPath '%INSTALL_DIR%' -Force; Write-Host '  [OK] Extracted.'"

if errorlevel 1 (
  echo  [!] Extraction failed.
  pause
  exit /b 1
)

:: ── Launch ────────────────────────────────────────────────────
echo.
echo  [*] Launching Edge with Vigil AI loaded...

start "" "%EDGE_PATH%" --load-extension="%INSTALL_DIR%" --no-first-run

timeout /t 3 /nobreak >nul

:: ── Done ──────────────────────────────────────────────────────
cls
echo.
echo  ╔══════════════════════════════════════════════════════════════╗
echo  ║                                                              ║
echo  ║   VIGIL AI v14.0  ──  ONLINE                               ║
echo  ║                                                              ║
echo  ║   Highlights · Readability · Agents · PSE · NeuroCore       ║
echo  ║   Talk naturally · She does the rest                        ║
echo  ║                                                              ║
echo  ╚══════════════════════════════════════════════════════════════╝
echo.
echo  HOW TO PIN THE SIDE PANEL:
echo.
echo    1. Look for the puzzle-piece icon in the Edge toolbar
echo    2. Find "Vigil AI" — click the pin icon
echo    3. Or: press  Ctrl+Shift+Y  to open the side panel
echo.
echo  THE NEXUS COMMAND SURFACE (tap the "Nexus" tab):
echo.
echo    - 12 one-tap action tiles: research, read page, note, PDF, search...
echo    - Live agent feed showing what's running right now
echo    - Active page awareness — see the current tab, hit "Read it"
echo    - Type a topic and fire any action in one tap
echo.
echo  TALKING TO VIGIL (examples):
echo.
echo    "Deploy a researcher on AI, open a writing tab, and scan this page"
echo    "Set a 10-minute timer, take a note on this theory, check builds"
echo    "Dispatch mission: crawl this site and synthesize the findings"
echo    "Hey — domain AI report, pse stats, and screenshot"
echo.
echo  Vigil hears everything. No commands needed. Just talk.
echo.
echo  Extension installed at:  %INSTALL_DIR%
echo.
pause

