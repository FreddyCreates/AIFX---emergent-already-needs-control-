/* Context Bridge Adapter — Engine Service (EXT-037) */

const PHI = 1.618033988749895;
const GOLDEN_ANGLE = 137.508;
const HEARTBEAT = 873;

class ContextBridgeAdapter {
  constructor() {
    this.bridges = new Map(); // tabId → bridged context
    this.sessionCount = 0;
    this.captureCount = 0;

    this.state = {
      initialized: true,
      heartbeatCount: 0,
      healthy: true,
      lastHeartbeat: Date.now()
    };

    this._startHeartbeat();
  }

  /**
   * Capture context from the active tab.
   * @param {number} tabId
   * @param {object} rawCtx  from content script
   * @returns {object} phi-encoded context payload
   */
  captureContext(tabId, rawCtx) {
    this.captureCount++;

    var ctx = {
      url: rawCtx.url || '',
      title: rawCtx.title || '',
      domain: rawCtx.domain || '',
      selection: rawCtx.selection || '',
      headings: rawCtx.headings || [],
      wordCount: rawCtx.wordCount || 0,
      language: rawCtx.language || 'en',
      readingTime: rawCtx.readingTime || 0,
      capturedAt: Date.now(),
      tabId: tabId
    };

    // Phi-encode: assign resonance coordinates
    ctx.phiCoords = this._encodePhiCoords(ctx);

    // Build structured payload for AI session bridging
    ctx.payload = this._buildPayload(ctx);

    this.bridges.set(tabId, ctx);
    this.sessionCount++;

    this._persist();

    return {
      success: true,
      context: ctx,
      sessionCount: this.sessionCount,
      ring: 'memory'
    };
  }

  /**
   * Bridge the current context into an AI prompt as a structured prefix.
   * @param {number} tabId
   * @returns {object}
   */
  bridgeToPrompt(tabId) {
    var ctx = this.bridges.get(tabId);
    if (!ctx) return { success: false, error: 'No context captured for tab ' + tabId };

    var prompt = '[CONTEXT BRIDGE]\n' +
      'URL: ' + ctx.url + '\n' +
      'Title: ' + ctx.title + '\n' +
      'Domain: ' + ctx.domain + '\n' +
      (ctx.selection ? 'Selected Text: ' + ctx.selection.substring(0, 500) + '\n' : '') +
      'Word Count: ' + ctx.wordCount + '\n' +
      'Reading Time: ' + ctx.readingTime + ' min\n' +
      'Resonance: θ=' + ctx.phiCoords.theta.toFixed(3) +
        ' ρ=' + ctx.phiCoords.rho.toFixed(3) + '\n' +
      '[/CONTEXT BRIDGE]\n\n';

    return {
      success: true,
      bridgedPrompt: prompt,
      context: ctx,
      ring: 'memory'
    };
  }

  /**
   * Get all active bridges.
   */
  getAllBridges() {
    var result = [];
    this.bridges.forEach(function (ctx, tabId) {
      result.push({ tabId: tabId, url: ctx.url, title: ctx.title, capturedAt: ctx.capturedAt });
    });
    return result;
  }

  /**
   * Clear bridge for a specific tab.
   */
  clearBridge(tabId) {
    var had = this.bridges.has(tabId);
    this.bridges.delete(tabId);
    this._persist();
    return { cleared: had, tabId: tabId };
  }

  getState() {
    return {
      initialized: this.state.initialized,
      heartbeatCount: this.state.heartbeatCount,
      healthy: this.state.healthy,
      captureCount: this.captureCount,
      sessionCount: this.sessionCount,
      activeBridges: this.bridges.size
    };
  }

  _encodePhiCoords(ctx) {
    // Phi-encode URL and title into resonance coordinates
    var hash = 0;
    var str = ctx.url + ctx.title;
    for (var i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
    }
    var n = Math.abs(hash) % 10000;
    return {
      theta: (n * GOLDEN_ANGLE) % 360,
      rho: (n * PHI) % 100,
      ring: Math.floor(n / 365),
      beat: n % Math.round(HEARTBEAT)
    };
  }

  _buildPayload(ctx) {
    return {
      id: 'bridge-' + Date.now().toString(36),
      source: ctx.url,
      title: ctx.title,
      domain: ctx.domain,
      excerpt: ctx.selection || ctx.headings.slice(0, 3).join(' | '),
      wordCount: ctx.wordCount,
      phiResonance: ctx.phiCoords,
      bridgedAt: new Date(ctx.capturedAt).toISOString()
    };
  }

  _persist() {
    try {
      var toStore = [];
      this.bridges.forEach(function (ctx) { toStore.push(ctx); });
      chrome.storage.local.set({ 'context-bridge-adapter_bridges': toStore.slice(-20) });
    } catch (e) { }
  }

  _startHeartbeat() {
    setInterval(function () {
      this.state.heartbeatCount++;
      this.state.lastHeartbeat = Date.now();
      this.state.healthy = true;
    }.bind(this), HEARTBEAT);
  }
}

globalThis.contextBridgeAdapter = new ContextBridgeAdapter();

/* ── Message Router ───────────────────────────────────────── */
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  var engine = globalThis.contextBridgeAdapter;

  switch (message.action) {
    case 'captureContext':
      sendResponse(engine.captureContext(sender.tab ? sender.tab.id : message.tabId, message.context));
      break;
    case 'bridgeToPrompt':
      sendResponse(engine.bridgeToPrompt(message.tabId));
      break;
    case 'getAllBridges':
      sendResponse(engine.getAllBridges());
      break;
    case 'clearBridge':
      sendResponse(engine.clearBridge(message.tabId));
      break;
    case 'getState':
      sendResponse(engine.getState());
      break;
    default:
      sendResponse({ error: 'Unknown action: ' + message.action });
  }
  return true;
});

/* ── Action click opens side panel ─────────────────────────── */
chrome.action.onClicked.addListener(function (tab) {
  chrome.sidePanel.open({ windowId: tab.windowId });
});

/* ── Production 24/7 Keep-Alive ───────────────────────────── */
(function () {
  var ALARM_NAME = 'context-bridge-adapter-keepalive';
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: 0.4 });
  chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name !== ALARM_NAME) return;
    if (!globalThis.contextBridgeAdapter) {
      globalThis.contextBridgeAdapter = new ContextBridgeAdapter();
    }
    try {
      chrome.storage.local.set({
        'context-bridge-adapter_state': {
          heartbeatCount: globalThis.contextBridgeAdapter.state.heartbeatCount,
          activeBridges: globalThis.contextBridgeAdapter.bridges.size,
          lastAlive: Date.now()
        }
      });
    } catch (e) { }
  });
  chrome.runtime.onInstalled.addListener(function () {
    chrome.alarms.create(ALARM_NAME, { periodInMinutes: 0.4 });
  });
})();
