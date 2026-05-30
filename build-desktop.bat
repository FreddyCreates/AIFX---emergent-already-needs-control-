@echo off
REM ══════════════════════════════════════════════════════════════
REM  Vigil AI — Windows Desktop App Builder
REM  Run this on Windows to produce the .exe installer.
REM
REM  Requirements:
REM    - Node.js 18+ (https://nodejs.org)
REM    - Git
REM
REM  Usage:
REM    Double-click build-desktop.bat  OR  run from cmd/PowerShell
REM ══════════════════════════════════════════════════════════════

setlocal EnableDelayedExpansion
title Vigil AI — Desktop Build

echo.
echo  ╔═══════════════════════════════════════════════╗
echo  ║        Vigil AI Desktop App Builder           ║
echo  ║        Windows x64 — Electron 33              ║
echo  ╚═══════════════════════════════════════════════╝
echo.

REM ── Check Node ────────────────────────────────────────────────
where node >nul 2>&1
if %errorlevel% neq 0 (
  echo  [ERROR] Node.js not found.
  echo  Install from: https://nodejs.org/en/download/
  pause
  exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
echo  [OK] Node.js %NODE_VER%

REM ── Step 1: Build Chrome extension ────────────────────────────
echo.
echo  [1/3] Building Vigil AI Chrome extension...
cd extensions\jarvis
call npm install
if %errorlevel% neq 0 ( echo  [ERROR] npm install failed & pause & exit /b 1 )
call npm run build
if %errorlevel% neq 0 ( echo  [ERROR] Vite build failed & pause & exit /b 1 )
cd ..\..
echo  [OK] Extension built.

REM ── Step 2: Install root Electron deps ────────────────────────
echo.
echo  [2/3] Installing Electron...
call npm install
if %errorlevel% neq 0 ( echo  [ERROR] npm install failed & pause & exit /b 1 )
echo  [OK] Electron installed.

REM ── Step 3: Package for Windows ───────────────────────────────
echo.
echo  [3/3] Packaging Windows installer...
call npx electron-builder --win
if %errorlevel% neq 0 ( echo  [ERROR] electron-builder failed & pause & exit /b 1 )

echo.
echo  ╔═══════════════════════════════════════════════╗
echo  ║  BUILD COMPLETE                               ║
echo  ║  Installer: dist\desktop\Vigil AI Setup*.exe  ║
echo  ║  Portable:  dist\desktop\Vigil AI*.exe        ║
echo  ╚═══════════════════════════════════════════════╝
echo.
pause
