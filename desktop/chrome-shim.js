/**
 * chrome-shim.js — Node.js chrome API mock for background.js
 *
 * Provides a minimal, functional chrome global that lets background.js
 * run in a Node.js/Electron main-process context without modification.
 * Storage is in-memory (persisted to disk by main.js via IPC).
 */

'use strict';

const path = require('path');
const fs   = require('fs');

/* Lazy-load electron so this module can be required from tests without Electron */
function _getApp() {
  try { return require('electron').app; } catch (e) { return null; }
}

/* ── Persistent storage ─────────────────────────────────────────── */

let _storageFile  = null;
let _storageCache = {};

function _getStorageFile() {
  if (!_storageFile) {
    const electronApp = _getApp();
    const dir = electronApp ? electronApp.getPath('userData') : (process.env.TMPDIR || '/tmp');
    _storageFile = path.join(dir, 'jarvis-storage.json');
  }
  return _storageFile;
}

function _loadStorage() {
  try {
    const file = _getStorageFile();
    if (fs.existsSync(file)) {
      _storageCache = JSON.parse(fs.readFileSync(file, 'utf8'));
    }
  } catch (e) {
    _storageCache = {};
  }
}

function _saveStorage() {
  try {
    fs.writeFileSync(_getStorageFile(), JSON.stringify(_storageCache), 'utf8');
  } catch (e) { /* ignore write errors */ }
}

/* Load on first use */
let _storageLoaded = false;
function _ensureLoaded() {
  if (!_storageLoaded) { _loadStorage(); _storageLoaded = true; }
}

/* ── Message listener registry ──────────────────────────────────── */

const _onMessageListeners = [];

/* ── Alarm registry (uses Node.js setInterval) ──────────────────── */

const _alarms = {};
const _alarmListeners = [];

/* ── chrome global ──────────────────────────────────────────────── */

const chrome = {

  runtime: {
    /* Resolved by main.js via global.__jarvisDir; fallback during tests */
    getURL: function (relativePath) {
      const base = global.__jarvisDir
        || path.join(__dirname, '..', 'extensions', 'jarvis');
      return path.join(base, relativePath);
    },
    onMessage: {
      addListener: function (fn) {
        _onMessageListeners.push(fn);
      }
    },
    onMessageExternal: {
      addListener: function () { /* no external extensions in desktop context */ }
    },
    onInstalled: {
      addListener: function (fn) {
        /* Fire 'installed' once on startup */
        setImmediate(function () {
          try { fn({ reason: 'install' }); } catch (e) {}
        });
      }
    },
    lastError: null,
    sendMessage: function () { /* background does not call this itself */ }
  },

  storage: {
    local: {
      get: function (keys, callback) {
        _ensureLoaded();
        let result = {};
        if (keys === null || keys === undefined) {
          result = Object.assign({}, _storageCache);
        } else if (typeof keys === 'string') {
          result[keys] = _storageCache[keys];
        } else if (Array.isArray(keys)) {
          keys.forEach(function (k) { result[k] = _storageCache[k]; });
        } else if (typeof keys === 'object') {
          Object.keys(keys).forEach(function (k) {
            result[k] = _storageCache.hasOwnProperty(k) ? _storageCache[k] : keys[k];
          });
        }
        if (callback) callback(result);
      },
      set: function (items, callback) {
        _ensureLoaded();
        Object.assign(_storageCache, items);
        _saveStorage();
        if (callback) callback();
      },
      remove: function (keys, callback) {
        _ensureLoaded();
        if (typeof keys === 'string') { delete _storageCache[keys]; }
        else if (Array.isArray(keys)) { keys.forEach(function (k) { delete _storageCache[k]; }); }
        _saveStorage();
        if (callback) callback();
      },
      clear: function (callback) {
        _storageCache = {};
        _saveStorage();
        if (callback) callback();
      }
    }
  },

  tabs: {
    query: function (opts, callback) {
      /* Desktop has no browser tabs — return a single synthetic desktop tab */
      if (callback) callback([{ id: 1, title: 'Vigil AI Desktop', url: 'app://desktop', windowId: 1 }]);
    },
    create:    function (props, callback) { if (callback) callback({ id: 2 }); },
    update:    function (id, props, callback) { if (callback) callback(); },
    remove:    function (id, callback) { if (callback) callback(); },
    duplicate: function (id, callback) { if (callback) callback({ id: 3 }); }
  },

  alarms: {
    create: function (name, opts) {
      /* Convert Chrome alarms (minutes) to Node.js setInterval (ms) */
      if (_alarms[name]) clearInterval(_alarms[name]);
      var periodMs = (opts && opts.periodInMinutes ? opts.periodInMinutes : 1) * 60 * 1000;
      _alarms[name] = setInterval(function () {
        _alarmListeners.forEach(function (fn) {
          try { fn({ name: name }); } catch (e) {}
        });
      }, periodMs);
    },
    clear: function (name, callback) {
      if (_alarms[name]) { clearInterval(_alarms[name]); delete _alarms[name]; }
      if (callback) callback(true);
    },
    onAlarm: {
      addListener: function (fn) { _alarmListeners.push(fn); }
    }
  },

  scripting: {
    executeScript: function (opts, callback) { if (callback) callback([]); }
  },

  notifications: {
    create: function (id, opts, callback) {
      /* Log desktop notifications to console; OS notifications optional */
      console.log('[JARVIS Notification]', opts && opts.title, opts && opts.message);
      if (callback) callback(id || 'notif-1');
    }
  },

  sidePanel: {
    open: function (opts, callback) { if (callback) callback(); }
  }
};

/* ── Exports ────────────────────────────────────────────────────── */

module.exports = {
  chrome,
  dispatchMessage: function (message, sender, sendResponse) {
    var handled = false;
    for (var i = 0; i < _onMessageListeners.length; i++) {
      var result = _onMessageListeners[i](message, sender || {}, sendResponse);
      if (result === true) handled = true;
    }
    return handled;
  }
};
