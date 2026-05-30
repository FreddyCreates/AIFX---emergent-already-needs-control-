/**
 * Vigil AI — Electron Desktop App (main process)
 * Wraps the Vigil AI React sidepanel into a native Windows/Mac/Linux desktop app.
 *
 * Build the extension first:
 *   cd ../extensions/jarvis && npm run build
 *
 * Then run the desktop app:
 *   npm start         (development)
 *   npm run dist      (package to installer)
 */

const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');

// ─── Paths ───────────────────────────────────────────────────────────────────
const ROOT = path.resolve(__dirname, '..');
const EXTENSION_DIST = path.join(ROOT, 'extensions', 'jarvis', 'dist');
const SIDEPANEL_HTML = path.join(EXTENSION_DIST, 'src', 'sidepanel', 'sidepanel.html');
const ICON_PATH = path.join(EXTENSION_DIST, 'icons', 'icon128.png');

// ─── App singleton ────────────────────────────────────────────────────────────
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
}

// ─── Window state ────────────────────────────────────────────────────────────
let mainWindow = null;
let tray = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 480,
    height: 880,
    minWidth: 380,
    minHeight: 600,
    title: 'Vigil AI',
    backgroundColor: '#0a0a0f',
    icon: fs.existsSync(ICON_PATH) ? ICON_PATH : undefined,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    frame: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      // Allow web workers (needed by @xenova/transformers Solus AI)
      additionalArguments: ['--enable-web-workers'],
    },
  });

  // Load the built sidepanel
  if (!fs.existsSync(SIDEPANEL_HTML)) {
    mainWindow.loadURL(
      `data:text/html,<h1 style="font-family:sans-serif;color:#fff;background:#0a0a0f;padding:2rem">` +
      `Build the extension first:<br><code>cd extensions/jarvis &amp;&amp; npm run build</code></h1>`
    );
  } else {
    mainWindow.loadFile(SIDEPANEL_HTML);
  }

  // Open external links in the OS browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('close', (e) => {
    if (!app.isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });

  return mainWindow;
}

function createTray() {
  const icon = fs.existsSync(ICON_PATH)
    ? nativeImage.createFromPath(ICON_PATH).resize({ width: 16, height: 16 })
    : nativeImage.createEmpty();

  tray = new Tray(icon);
  tray.setToolTip('Vigil AI');

  const menu = Menu.buildFromTemplate([
    { label: 'Open Vigil AI', click: () => { mainWindow.show(); mainWindow.focus(); } },
    { type: 'separator' },
    { label: 'Quit', click: () => { app.isQuitting = true; app.quit(); } },
  ]);
  tray.setContextMenu(menu);
  tray.on('double-click', () => { mainWindow.show(); mainWindow.focus(); });
}

// ─── App lifecycle ────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  createWindow();
  createTray();

  app.on('second-instance', () => {
    if (mainWindow) { mainWindow.show(); mainWindow.focus(); }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
    else mainWindow.show();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => { app.isQuitting = true; });

// ─── IPC handlers ─────────────────────────────────────────────────────────────
ipcMain.handle('get-app-version', () => app.getVersion());
ipcMain.handle('open-external', (_, url) => shell.openExternal(url));
