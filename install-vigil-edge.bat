@echo off
title Vigil AI v18.0 - Windows Edge/Chrome Installer
color 0B
cls

echo.
echo  ╔══════════════════════════════════════════════════════════════╗
echo  ║                                                              ║
echo  ║      ░░░░░░░  V.I.G.I.L  ░░░░░░░                         ║
echo  ║      Vigil AI — Sovereign Offline Intelligence          ║
echo  ║                                                              ║
echo  ║      VERSION  18.0  ──  CHAT-FIRST · NO VOICE DEFAULT      ║
echo  ║      Fast reasoning · AGI agents · Codex workspace          ║
echo  ║      Notes · Grid view · Memory · Solus offline AI          ║
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
set "ZIP_FILE=%TEMP%\vigil-v18.zip"
set "DL_URL=https://github.com/FreddyCreates/potential-succotash/raw/copilot/create-jarvis-integration/dist/extensions/vigil-ai-v18.zip"

echo.
echo  [*] Downloading Vigil AI v18.0...

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
echo  ║   VIGIL AI v18.0  ──  ONLINE                               ║
echo  ║                                                              ║
echo  ║   Chat-first · No voice by default · Fast reasoning         ║
echo  ║   AGI Agents · Codex workspace · Grid notes · Memory        ║
echo  ║   Just type. Oro handles the rest.                          ║
echo  ║                                                              ║
echo  ╚══════════════════════════════════════════════════════════════╝
echo.
echo  HOW TO PIN THE SIDE PANEL:
echo.
echo    1. Look for the puzzle-piece icon in the Edge toolbar
echo    2. Find "Vigil AI" — click the pin icon
echo    3. Or: press  Ctrl+Shift+Y  to open the side panel
echo.
echo  QUICK COMMANDS (Chat tab):
echo.
echo    "research [topic]"     — Deploy AGI researcher agent
echo    "read page"            — Analyze and summarize current tab
echo    "take note: [text]"    — Save to journal
echo    "set timer 10 min"     — Smart timer
echo    "summarize page"       — Page summary
echo    "what can you do"      — Full command help
echo.
echo  Extension installed at:  %INSTALL_DIR%
echo.
pause

