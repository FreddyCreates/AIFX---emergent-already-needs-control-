/* Sovereign Alpha — Background Service Worker
 * φ-compresses four extensions into one:
 *   Workbook AI · Page Intelligence · Secure Vault · Command Bar
 */
"use strict";

// ── Constants ───────────────────────────────────────────────────────────────
const MAX_CLIPBOARD_HISTORY = 500;
const ALARM_AUTO_CLEAR  = 'sa-clipboard-auto-clear';
const ALARM_AUTO_SAVE   = 'sa-workbook-auto-save';
const ALARM_KEEPALIVE   = 'sa-keepalive';

const COMMANDS = [
  { name: "scroll up",        syntax: "scroll up",              desc: "Scroll the page up" },
  { name: "scroll down",      syntax: "scroll down",            desc: "Scroll the page down" },
  { name: "scroll top",       syntax: "scroll top",             desc: "Scroll to top" },
  { name: "scroll bottom",    syntax: "scroll bottom",          desc: "Scroll to bottom" },
  { name: "find",             syntax: 'find "text"',            desc: "Find and highlight text" },
  { name: "click",            syntax: "click <selector>",       desc: "Click a CSS selector" },
  { name: "read",             syntax: "read <selector>",        desc: "Read element text" },
  { name: "goto",             syntax: "goto <url>",             desc: "Navigate to URL" },
  { name: "summarize",        syntax: "summarize",              desc: "Summarize the page" },
  { name: "extract links",    syntax: "extract links",          desc: "Extract all links" },
  { name: "extract images",   syntax: "extract images",         desc: "Extract all image URLs" },
  { name: "extract headings", syntax: "extract headings",       desc: "Extract all headings" },
  { name: "extract emails",   syntax: "extract emails",         desc: "Extract email addresses" },
  { name: "extract numbers",  syntax: "extract numbers",        desc: "Extract numbers" },
  { name: "word count",       syntax: "word count",             desc: "Count words on the page" },
  { name: "highlight",        syntax: 'highlight "text"',       desc: "Highlight text occurrences" },
  { name: "dark mode",        syntax: "dark mode",              desc: "Toggle dark mode" },
  { name: "zoom in",          syntax: "zoom in",                desc: "Zoom in" },
  { name: "zoom out",         syntax: "zoom out",               desc: "Zoom out" },
  { name: "bookmark",         syntax: "bookmark",               desc: "Bookmark current page" },
  { name: "copy title",       syntax: "copy title",             desc: "Copy page title" },
  { name: "copy url",         syntax: "copy url",               desc: "Copy page URL" },
  { name: "tabs",             syntax: "tabs",                   desc: "List all open tabs" },
  { name: "close tab",        syntax: "close tab",              desc: "Close current tab" },
  { name: "history",          syntax: "history",                desc: "Show command history" }
];

// ── Install / first-run defaults ────────────────────────────────────────────
chrome.runtime.onInstalled.addListener(() => {
  // Context menus for both modules
  chrome.contextMenus.create({ id: 'save-to-workbook',  title: 'Save to Workbook',         contexts: ['selection'] });
  chrome.contextMenus.create({ id: 'copy-to-secure',    title: 'Copy to Secure Vault',     contexts: ['selection'] });

  // Workbook defaults
  chrome.storage.local.get(['categories'], (r) => {
    if (!r.categories) {
      chrome.storage.local.set({
        categories: ['General', 'Work', 'Personal', 'Ideas', 'Code Snippets'],
        notes: [],
        wbSettings: { autoSaveInterval: 5, defaultCategory: 'General' }
      });
    }
  });

  // Clipboard defaults
  chrome.storage.local.get(['clipSettings'], (res) => {
    if (!res.clipSettings) {
      chrome.storage.local.set({
        clipSettings: { maxHistory: 500, autoClearTimer: 'never', autoCapture: true, notifications: true }
      });
    }
  });

  // Command Bar defaults
  chrome.storage.local.get('savedActions').then((d) => {
    if (!d.savedActions) chrome.storage.local.set({ savedActions: getDefaultActions() });
  });

  // Alarms
  chrome.alarms.create(ALARM_AUTO_SAVE,  { periodInMinutes: 5 });
  chrome.alarms.create(ALARM_KEEPALIVE,  { periodInMinutes: 0.5 });
});

// ── Action click → open side panel ─────────────────────────────────────────
chrome.action.onClicked.addListener(async (tab) => {
  try {
    await chrome.sidePanel.open({ tabId: tab.id });
  } catch {
    await chrome.sidePanel.open({ windowId: tab.windowId });
  }
});

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});

// ── Context menu handler ────────────────────────────────────────────────────
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'save-to-workbook' && info.selectionText) {
    const note = {
      id: genId(),
      title: truncateTitle(info.selectionText),
      content: escapeForStorage(info.selectionText),
      category: 'General',
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      wordCount: countWords(info.selectionText),
      sourceUrl: tab?.url || ''
    };
    chrome.storage.local.get(['notes'], (r) => {
      const notes = r.notes || [];
      notes.unshift(note);
      chrome.storage.local.set({ notes }, () => {
        chrome.runtime.sendMessage({ type: 'note-added', note }).catch(() => {});
      });
    });
  }

  if (info.menuItemId === 'copy-to-secure' && info.selectionText) {
    saveClipboardItem(info.selectionText, tab?.url || '');
  }
});

// ── Alarms ──────────────────────────────────────────────────────────────────
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_AUTO_SAVE) {
    chrome.runtime.sendMessage({ type: 'auto-save-tick' }).catch(() => {});
  }
  if (alarm.name === ALARM_AUTO_CLEAR) {
    chrome.storage.local.get(['clipboardHistory'], (res) => {
      const history = (res.clipboardHistory || []).filter(i => i.pinned);
      chrome.storage.local.set({ clipboardHistory: history });
    });
  }
  // ALARM_KEEPALIVE: no-op heartbeat
});

// Restore clipboard auto-clear alarm on startup
chrome.storage.local.get(['clipSettings'], (res) => {
  if (res.clipSettings?.autoClearTimer) setupAutoClearAlarm(res.clipSettings.autoClearTimer);
});

// ── Message Router ──────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

  // ── Workbook ──────────────────────────────────────────────────────────────
  if (msg.type === 'get-notes') {
    chrome.storage.local.get(['notes'], (r) => sendResponse(r.notes || []));
    return true;
  }
  if (msg.type === 'save-note') {
    wbSaveNote(msg.note).then((notes) => sendResponse(notes));
    return true;
  }
  if (msg.type === 'delete-note') {
    wbDeleteNote(msg.id).then((notes) => sendResponse(notes));
    return true;
  }
  if (msg.type === 'get-categories') {
    chrome.storage.local.get(['categories'], (r) => sendResponse(r.categories || []));
    return true;
  }
  if (msg.type === 'add-category') {
    wbAddCategory(msg.name).then((cats) => sendResponse(cats));
    return true;
  }
  if (msg.type === 'import-notes') {
    wbImportNotes(msg.notes).then((notes) => sendResponse(notes));
    return true;
  }
  if (msg.type === 'open-side-panel') {
    const tabId = sender.tab?.id;
    if (tabId) {
      chrome.sidePanel.open({ tabId }).catch(() => {});
    } else {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) chrome.sidePanel.open({ tabId: tabs[0].id }).catch(() => {});
      });
    }
    sendResponse({ ok: true });
    return false;
  }

  // ── Page Intelligence ─────────────────────────────────────────────────────
  if (msg.action === 'analyzePage') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) { sendResponse({ error: 'No active tab.' }); return; }
      chrome.tabs.sendMessage(tabs[0].id, { action: 'runAnalysis' }, (response) => {
        if (chrome.runtime.lastError) sendResponse({ error: chrome.runtime.lastError.message });
        else sendResponse(response);
      });
    });
    return true;
  }
  if (msg.action === 'getActiveTabInfo') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) sendResponse({ url: tabs[0].url, title: tabs[0].title, tabId: tabs[0].id });
      else sendResponse({ error: 'No active tab' });
    });
    return true;
  }
  if (msg.action === 'openSidePanel') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.sidePanel.open({ tabId: tabs[0].id })
          .then(() => sendResponse({ ok: true }))
          .catch((err) => sendResponse({ error: err.message }));
      }
    });
    return true;
  }

  // ── Secure Clipboard / Vault ──────────────────────────────────────────────
  if (msg.type === 'COPY_EVENT') {
    saveClipboardItem(msg.text, msg.url || sender.tab?.url || '');
    sendResponse({ ok: true });
    return false;
  }
  if (msg.type === 'GET_HISTORY') {
    chrome.storage.local.get(['clipboardHistory'], (res) => {
      sendResponse({ history: res.clipboardHistory || [] });
    });
    return true;
  }
  if (msg.type === 'SAVE_HISTORY') {
    chrome.storage.local.set({ clipboardHistory: msg.history }, () => sendResponse({ ok: true }));
    return true;
  }
  if (msg.type === 'GET_CLIP_SETTINGS') {
    chrome.storage.local.get(['clipSettings'], (res) => sendResponse({ settings: res.clipSettings || {} }));
    return true;
  }
  if (msg.type === 'SAVE_CLIP_SETTINGS') {
    chrome.storage.local.set({ clipSettings: msg.settings }, () => {
      setupAutoClearAlarm(msg.settings.autoClearTimer);
      sendResponse({ ok: true });
    });
    return true;
  }
  if (msg.type === 'PASTE_REQUEST') {
    if (sender.tab?.id) {
      chrome.tabs.sendMessage(sender.tab.id, { type: 'PASTE_AT_CURSOR', text: msg.text });
    }
    sendResponse({ ok: true });
    return false;
  }
  if (msg.type === 'GET_VAULT') {
    chrome.storage.local.get(['vault'], (res) => sendResponse({ vault: res.vault || null }));
    return true;
  }
  if (msg.type === 'SAVE_VAULT') {
    chrome.storage.local.set({ vault: msg.vault }, () => sendResponse({ ok: true }));
    return true;
  }
  if (msg.type === 'CLEAR_VAULT') {
    chrome.storage.local.remove(['vault'], () => sendResponse({ ok: true }));
    return true;
  }

  // ── Command Bar ───────────────────────────────────────────────────────────
  if (msg.type === 'execute-command') {
    handleCommand(msg.command, sender).then(sendResponse).catch((e) =>
      sendResponse({ ok: false, result: e.message })
    );
    return true;
  }
  if (msg.type === 'get-commands') {
    sendResponse(COMMANDS);
    return false;
  }
  if (msg.type === 'get-cmd-history') {
    chrome.storage.local.get('commandHistory').then((d) => sendResponse(d.commandHistory || []));
    return true;
  }
  if (msg.type === 'clear-cmd-history') {
    chrome.storage.local.set({ commandHistory: [] }).then(() => sendResponse({ ok: true }));
    return true;
  }
  if (msg.type === 'get-saved-actions') {
    chrome.storage.local.get('savedActions').then((d) => sendResponse(d.savedActions || getDefaultActions()));
    return true;
  }
  if (msg.type === 'save-actions') {
    chrome.storage.local.set({ savedActions: msg.actions }).then(() => sendResponse({ ok: true }));
    return true;
  }
});

// ── Keyboard shortcut ───────────────────────────────────────────────────────
chrome.commands.onCommand.addListener(async (command) => {
  if (command === '_execute_action') {
    const tab = await getActiveTab();
    if (tab) {
      try { await chrome.sidePanel.open({ tabId: tab.id }); }
      catch { await sendToContent(tab.id, { type: 'toggle-palette' }); }
    }
  }
});

// ── Workbook helpers ────────────────────────────────────────────────────────
async function wbSaveNote(note) {
  return new Promise((resolve) => {
    chrome.storage.local.get(['notes'], (result) => {
      let notes = result.notes || [];
      const idx = notes.findIndex((n) => n.id === note.id);
      note.modifiedAt = new Date().toISOString();
      if (idx >= 0) { notes[idx] = note; }
      else { note.createdAt = note.createdAt || new Date().toISOString(); notes.unshift(note); }
      chrome.storage.local.set({ notes }, () => resolve(notes));
    });
  });
}

async function wbDeleteNote(id) {
  return new Promise((resolve) => {
    chrome.storage.local.get(['notes'], (result) => {
      const notes = (result.notes || []).filter((n) => n.id !== id);
      chrome.storage.local.set({ notes }, () => resolve(notes));
    });
  });
}

async function wbAddCategory(name) {
  return new Promise((resolve) => {
    chrome.storage.local.get(['categories'], (result) => {
      const cats = result.categories || [];
      if (name && !cats.includes(name)) cats.push(name);
      chrome.storage.local.set({ categories: cats }, () => resolve(cats));
    });
  });
}

async function wbImportNotes(incoming) {
  return new Promise((resolve) => {
    chrome.storage.local.get(['notes'], (result) => {
      const existing = result.notes || [];
      const ids = new Set(existing.map((n) => n.id));
      const merged = [...existing];
      for (const n of incoming) { if (!ids.has(n.id)) merged.push(n); }
      chrome.storage.local.set({ notes: merged }, () => resolve(merged));
    });
  });
}

// ── Clipboard helpers ────────────────────────────────────────────────────────
function categorizeClip(text) {
  if (/^https?:\/\/\S+$/i.test(text.trim()) || /\.\w{2,}\//.test(text.trim())) return 'URLs';
  if (/[{}\[\]]/.test(text) && /(function|const|let|var|class|def|import|return|=>)/.test(text)) return 'Code';
  if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(text.trim())) return 'Email';
  if (/^\s*[-+]?\d[\d.,]*\s*$/.test(text.trim())) return 'Numbers';
  return 'General';
}

function saveClipboardItem(text, url) {
  if (!text || !text.trim()) return;
  chrome.storage.local.get(['clipboardHistory', 'clipSettings'], (res) => {
    const settings = res.clipSettings || {};
    if (settings.autoCapture === false) return;
    let history = res.clipboardHistory || [];
    if (history.length > 0 && history[0].text === text) return;
    const item = {
      id: genId(),
      text,
      timestamp: Date.now(),
      category: categorizeClip(text),
      sourceUrl: url,
      pinned: false,
      size: new Blob([text]).size
    };
    history.unshift(item);
    const maxItems = settings.maxHistory || MAX_CLIPBOARD_HISTORY;
    const pinned   = history.filter(i => i.pinned);
    const unpinned = history.filter(i => !i.pinned).slice(0, maxItems);
    history = [...pinned, ...unpinned];
    const seen = new Set();
    history = history.filter(i => { if (seen.has(i.id)) return false; seen.add(i.id); return true; });
    chrome.storage.local.set({ clipboardHistory: history });
    if (settings.notifications !== false) {
      chrome.runtime.sendMessage({ type: 'HISTORY_UPDATED', item }).catch(() => {});
    }
  });
}

function setupAutoClearAlarm(timer) {
  chrome.alarms.clear(ALARM_AUTO_CLEAR);
  const minutes = { '1hr': 60, '4hr': 240, '24hr': 1440 }[timer];
  if (minutes) chrome.alarms.create(ALARM_AUTO_CLEAR, { periodInMinutes: minutes });
}

// ── Command Bar helpers ─────────────────────────────────────────────────────
async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function sendToContent(tabId, message) {
  try {
    return await chrome.tabs.sendMessage(tabId, message);
  } catch {
    await chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] });
    return chrome.tabs.sendMessage(tabId, message);
  }
}

async function saveCmdToHistory(command) {
  const { commandHistory = [] } = await chrome.storage.local.get('commandHistory');
  commandHistory.unshift({ command, timestamp: Date.now() });
  if (commandHistory.length > 200) commandHistory.length = 200;
  await chrome.storage.local.set({ commandHistory });
}

async function handleCommand(raw, sender) {
  const cmd = (raw || '').trim();
  if (!cmd) return { ok: false, result: 'Empty command.' };
  await saveCmdToHistory(cmd);
  const lower = cmd.toLowerCase();

  if (lower === 'tabs') {
    const tabs = await chrome.tabs.query({});
    return { ok: true, result: tabs.map((t, i) => `${i + 1}. ${t.title} — ${t.url}`).join('\n') };
  }
  if (lower === 'close tab') {
    const tab = await getActiveTab();
    if (tab) await chrome.tabs.remove(tab.id);
    return { ok: true, result: 'Tab closed.' };
  }
  if (lower === 'bookmark') {
    const tab = await getActiveTab();
    await chrome.bookmarks.create({ title: tab.title, url: tab.url });
    return { ok: true, result: `Bookmarked: ${tab.title}` };
  }
  if (lower === 'history') {
    const { commandHistory = [] } = await chrome.storage.local.get('commandHistory');
    const recent = commandHistory.slice(0, 20);
    if (!recent.length) return { ok: true, result: 'No command history yet.' };
    return { ok: true, result: recent.map((h, i) => `${i + 1}. ${h.command}  (${new Date(h.timestamp).toLocaleString()})`).join('\n') };
  }
  if (lower.startsWith('goto ')) {
    let url = cmd.slice(5).trim();
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    const tab = await getActiveTab();
    await chrome.tabs.update(tab.id, { url });
    return { ok: true, result: `Navigating to ${url}` };
  }

  const tab = sender?.tab || await getActiveTab();
  if (!tab?.id) return { ok: false, result: 'No active tab found.' };
  try {
    const res = await sendToContent(tab.id, { type: 'run-command', command: cmd });
    return res || { ok: false, result: 'No response from content script.' };
  } catch (e) {
    return { ok: false, result: `Content script error: ${e.message}` };
  }
}

function getDefaultActions() {
  return [
    { name: 'Quick Summary',    command: 'summarize' },
    { name: 'Link Report',      command: 'extract links' },
    { name: 'Dark Mode Toggle', command: 'dark mode' },
    { name: 'Page Stats',       command: 'word count' }
  ];
}

// ── Shared utility functions ─────────────────────────────────────────────────
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function truncateTitle(text) {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > 60 ? clean.slice(0, 57) + '...' : clean;
}

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function escapeForStorage(text) {
  return text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
