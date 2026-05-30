/**
 * main.js — Electron main process for Vigil AI Desktop
 *
 * Architecture:
 *  • Renderer  → sends chrome.runtime.sendMessage()  via preload → ipcMain
 *  • Main      → dispatches to background.js JarvisEngine via chrome-shim
 *  • Main      → replies back to renderer via ipcMain.handle resolve
 *  • Main      → pushes unsolicited events to renderer via webContents.send
 */

'use strict';

const { app, BrowserWindow, ipcMain, nativeImage } = require('electron');
const path = require('path');
const fs   = require('fs');

/* ── Resolve jarvis extension directory ─────────────────────────── */

function resolveJarvisDir() {
  /* Packaged app: resources/jarvis/  (copied by electron-builder extraResources) */
  const packed = path.join(process.resourcesPath || '', 'jarvis');
  if (fs.existsSync(path.join(packed, 'sidepanel.html'))) return packed;

  /* Development: ../extensions/jarvis relative to desktop/ */
  return path.join(__dirname, '..', 'extensions', 'jarvis');
}

global.__jarvisDir = resolveJarvisDir();

/* ── Boot background.js with chrome shim ────────────────────────── */

const shim = require('./chrome-shim');

/* Inject chrome into global so background.js can use it directly */
global.chrome = shim.chrome;

/* Also expose globalThis.chrome for ES2020 compat */
global.globalThis = global;

/* Load background.js — it registers message listeners and initialises engine */
try {
  require(path.join(global.__jarvisDir, 'background.js'));
  console.log('[Vigil AI] background.js loaded — engine online');
} catch (e) {
  console.error('[Vigil AI] Failed to load background.js:', e.message);
}

/* ── IPC: renderer → background ─────────────────────────────────── */

ipcMain.handle('jarvis-message', function (_event, message) {
  return new Promise(function (resolve) {
    var responded = false;
    function sendResponse(resp) {
      if (!responded) { responded = true; resolve(resp); }
    }

    var async = shim.dispatchMessage(message, { tab: null }, sendResponse);
    /* If no listener returned true (async), resolve with null after tick */
    if (!async) {
      setImmediate(function () {
        if (!responded) { responded = true; resolve(null); }
      });
    }
    /* Safety timeout: always resolve within 8s */
    setTimeout(function () {
      if (!responded) { responded = true; resolve({ success: false, error: 'timeout' }); }
    }, 8000);
  });
});

/* ── IPC: storage get/set (used by preload for chrome.storage.local) */

ipcMain.handle('storage-get', function (_event, keys) {
  return new Promise(function (resolve) {
    shim.chrome.storage.local.get(keys, resolve);
  });
});

ipcMain.handle('storage-set', function (_event, items) {
  return new Promise(function (resolve) {
    shim.chrome.storage.local.set(items, resolve);
  });
});

/* ── Window ─────────────────────────────────────────────────────── */

let mainWindow = null;

function createWindow() {
  const iconPath = path.join(global.__jarvisDir, 'icons', 'icon128.png');
  const icon = fs.existsSync(iconPath) ? nativeImage.createFromPath(iconPath) : undefined;

  mainWindow = new BrowserWindow({
    width:          420,
    height:         760,
    minWidth:       360,
    minHeight:      500,
    title:          'Vigil AI',
    icon:           icon,
    backgroundColor: '#0d1117',
    webPreferences: {
      preload:             path.join(__dirname, 'preload.js'),
      contextIsolation:    true,
      nodeIntegration:     false,
      sandbox:             false
    }
  });

  /* Remove default menu bar */
  mainWindow.setMenuBarVisibility(false);

  /* Load the side panel UI */
  const panelPath = path.join(global.__jarvisDir, 'sidepanel.html');
  mainWindow.loadFile(panelPath);

  mainWindow.on('closed', function () { mainWindow = null; });
}

/* ── App lifecycle ──────────────────────────────────────────────── */

app.whenReady().then(function () {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
