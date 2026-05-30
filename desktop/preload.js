/**
 * preload.js — Electron preload script for Vigil AI Desktop
 *
 * Exposes a functional `chrome` object to the renderer (sidepanel.html)
 * via Electron's contextBridge, bridging Chrome Extension APIs to IPC.
 *
 * Covered APIs:
 *   chrome.runtime.sendMessage / onMessage / lastError / getURL
 *   chrome.storage.local.get / set
 *   chrome.tabs.query / update / create
 *   chrome.scripting.executeScript
 */

'use strict';

const { contextBridge, ipcRenderer } = require('electron');

/* ── Pending callbacks registry ─────────────────────────────────── */

const _onMessageListeners = [];

/* Listen for unsolicited push messages from main process */
ipcRenderer.on('jarvis-push', function (_event, message) {
  _onMessageListeners.forEach(function (fn) {
    try { fn(message); } catch (e) {}
  });
});

/* ── Chrome API surface ─────────────────────────────────────────── */

contextBridge.exposeInMainWorld('chrome', {

  runtime: {
    /**
     * Send a message to background.js (main process) and get a response.
     * Mirrors chrome.runtime.sendMessage(message, callback).
     */
    sendMessage: function (message, callback) {
      ipcRenderer.invoke('jarvis-message', message)
        .then(function (response) {
          /* Clear lastError before calling callback */
          if (typeof callback === 'function') callback(response);
        })
        .catch(function () {
          if (typeof callback === 'function') callback(null);
        });
    },

    onMessage: {
      addListener: function (fn) {
        _onMessageListeners.push(fn);
      }
    },

    /**
     * lastError: always null in desktop context (no extension runtime errors).
     * background.js checks this after sendMessage callbacks.
     */
    lastError: null,

    /**
     * getURL: not meaningful in desktop context; return empty string so any
     * code path that checks the result falls through gracefully.
     */
    getURL: function (relativePath) {
      return relativePath || '';
    }
  },

  storage: {
    local: {
      get: function (keys, callback) {
        ipcRenderer.invoke('storage-get', keys)
          .then(function (result) { if (typeof callback === 'function') callback(result || {}); })
          .catch(function ()      { if (typeof callback === 'function') callback({}); });
      },
      set: function (items, callback) {
        ipcRenderer.invoke('storage-set', items)
          .then(function () { if (typeof callback === 'function') callback(); })
          .catch(function () { if (typeof callback === 'function') callback(); });
      }
    }
  },

  tabs: {
    /**
     * Desktop has no real browser tabs.
     * Return a synthetic "desktop" tab so Tab Intelligence shows something.
     */
    query: function (opts, callback) {
      if (typeof callback === 'function') {
        callback([{
          id:       1,
          title:    'Vigil AI Desktop',
          url:      'app://desktop',
          windowId: 1
        }]);
      }
    },
    update:    function (id, props, callback) { if (typeof callback === 'function') callback(); },
    create:    function (props, callback)     { if (typeof callback === 'function') callback({}); }
  },

  scripting: {
    /** Page injection is not applicable on desktop — no-op gracefully. */
    executeScript: function (opts, callback) {
      if (typeof callback === 'function') callback([]);
    }
  }
});
