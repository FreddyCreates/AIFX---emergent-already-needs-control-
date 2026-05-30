/**
 * Vigil AI — Electron Preload Script
 * Exposes a safe bridge between the renderer (React sidepanel) and the main process.
 * contextIsolation is ON — only the APIs listed here are accessible.
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Desktop metadata
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),

  // Open links in OS default browser
  openExternal: (url) => ipcRenderer.invoke('open-external', url),

  // Platform detection
  platform: process.platform,
  isDesktop: true,
});
