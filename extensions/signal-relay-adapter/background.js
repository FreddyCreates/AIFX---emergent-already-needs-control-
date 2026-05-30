/* Signal Relay Adapter — Engine Service (EXT-040) */

const PHI = 1.618033988749895;
const GOLDEN_ANGLE = 137.508;
const HEARTBEAT = 873;

class SignalRelayAdapter {
  constructor() {
    this.signalQueue = [];
    this.maxQueue = 1000;
    this.channels = new Map();   // channelId → { name, signals[], weight }
    this.relayLog = [];
    this.maxLog = 200;

    this.totalSignals = 0;
    this.totalRelays = 0;
    this.pulseCount = 0;
    this.phiPhase = 0;

    // Known extension channels (organism signal sources)
    this.CHANNELS = {
      SENTINEL:  'sentinel-watch',
      MEMORY:    'memory-palace',
      GRAPH:     'knowledge-sync',
      ROUTER:    'model-router',
      CONTEXT:   'context-bridge',
      MESH:      'api-mesh',
      JARVIS:    'jarvis-vigil',
      ORGANISM:  'organism-core'
    };

    // Signal types
    this.SIGNAL_TYPES = {
      THREAT:    'threat',
      MEMORY:    'memory',
      ROUTE:     'route',
      CONTEXT:   'context',
      DATA:      'data',
      HEARTBEAT: 'heartbeat',
      EMERGENCE: 'emergence'
    };

    this.state = {
      initialized: true,
      heartbeatCount: 0,
      healthy: true,
      lastHeartbeat: Date.now()
    };

    this._initChannels();
    this._startHeartbeat();
    this._startPhiPulse();
  }

  /**
   * Capture an intelligence signal from any source.
   * @param {object} signal { type, source, payload, priority }
   * @returns {object}
   */
  capture(signal) {
    this.totalSignals++;

    var entry = {
      id: 'sig-' + Date.now().toString(36) + '-' + (this.totalSignals % 9999),
      type: signal.type || this.SIGNAL_TYPES.DATA,
      source: signal.source || 'unknown',
      payload: signal.payload || {},
      priority: signal.priority || 0.5,
      phiWeight: this._phiWeight(signal.priority),
      capturedAt: Date.now(),
      relayed: false
    };

    // Phi-weight: higher priority signals go to front
    if (entry.phiWeight > 1.0) {
      this.signalQueue.unshift(entry);
    } else {
      this.signalQueue.push(entry);
    }
    if (this.signalQueue.length > this.maxQueue) this.signalQueue.pop();

    // Route to channel
    var channel = this.channels.get(entry.source) || this.channels.get('organism-core');
    if (channel) {
      channel.signals.push(entry.id);
      if (channel.signals.length > 100) channel.signals.shift();
    }

    return {
      success: true,
      signalId: entry.id,
      phiWeight: entry.phiWeight,
      queueDepth: this.signalQueue.length,
      ring: 'sovereign'
    };
  }

  /**
   * Relay all pending signals through the synapse binding engine.
   * Processes up to PHI × 10 signals per relay cycle.
   */
  relay() {
    var batchSize = Math.round(PHI * 10); // 16
    var batch = [];
    var relayedIds = [];

    for (var i = 0; i < this.signalQueue.length && batch.length < batchSize; i++) {
      if (!this.signalQueue[i].relayed) {
        batch.push(this.signalQueue[i]);
      }
    }

    for (var j = 0; j < batch.length; j++) {
      batch[j].relayed = true;
      batch[j].relayedAt = Date.now();
      relayedIds.push(batch[j].id);
      this.totalRelays++;
    }

    var logEntry = {
      relayId: 'relay-' + Date.now().toString(36),
      count: batch.length,
      ids: relayedIds,
      phiPhase: this.phiPhase,
      timestamp: Date.now()
    };
    this.relayLog.unshift(logEntry);
    if (this.relayLog.length > this.maxLog) this.relayLog.pop();

    this._persist();

    return {
      success: true,
      relayed: batch.length,
      totalRelays: this.totalRelays,
      queueDepth: this.signalQueue.filter(function (s) { return !s.relayed; }).length,
      batchSize: batchSize,
      phiPhase: Math.round(this.phiPhase * 1000) / 1000,
      ring: 'sovereign'
    };
  }

  /**
   * Get pending (unrelayed) signals.
   */
  getPending(n) {
    return this.signalQueue
      .filter(function (s) { return !s.relayed; })
      .slice(0, n || 50);
  }

  /**
   * Get channel statistics.
   */
  getChannelStats() {
    var result = [];
    this.channels.forEach(function (ch, id) {
      result.push({
        id: id,
        name: ch.name,
        signalCount: ch.signals.length,
        weight: Math.round(ch.weight * 1000) / 1000
      });
    });
    return result.sort(function (a, b) { return b.signalCount - a.signalCount; });
  }

  /**
   * Get relay log.
   */
  getRelayLog(n) {
    return this.relayLog.slice(0, n || 20);
  }

  getState() {
    var pending = this.signalQueue.filter(function (s) { return !s.relayed; }).length;
    return {
      initialized: this.state.initialized,
      heartbeatCount: this.state.heartbeatCount,
      healthy: this.state.healthy,
      totalSignals: this.totalSignals,
      totalRelays: this.totalRelays,
      pendingSignals: pending,
      pulseCount: this.pulseCount,
      phiPhase: Math.round(this.phiPhase * 1000) / 1000,
      channels: this.channels.size
    };
  }

  _initChannels() {
    for (var key in this.CHANNELS) {
      var id = this.CHANNELS[key];
      this.channels.set(id, {
        id: id,
        name: key,
        signals: [],
        weight: Math.pow(PHI, -Object.keys(this.CHANNELS).indexOf(key))
      });
    }
  }

  _phiWeight(priority) {
    return Math.round(Math.pow(PHI, priority * 2) * 1000) / 1000;
  }

  _startHeartbeat() {
    setInterval(function () {
      this.state.heartbeatCount++;
      this.state.lastHeartbeat = Date.now();
      this.state.healthy = true;
    }.bind(this), HEARTBEAT);
  }

  _startPhiPulse() {
    // Phi-pulse: auto-relay every PHI heartbeats (873 × φ ≈ 1413ms)
    setInterval(function () {
      this.pulseCount++;
      this.phiPhase = (this.phiPhase + GOLDEN_ANGLE) % 360;
      var pending = this.signalQueue.filter(function (s) { return !s.relayed; }).length;
      if (pending > 0) this.relay();
    }.bind(this), Math.round(HEARTBEAT * PHI));
  }

  _persist() {
    try {
      chrome.storage.local.set({
        'signal-relay-adapter_log': this.relayLog.slice(0, 50),
        'signal-relay-adapter_stats': {
          totalSignals: this.totalSignals,
          totalRelays: this.totalRelays,
          pulseCount: this.pulseCount
        }
      });
    } catch (e) { }
  }
}

globalThis.signalRelayAdapter = new SignalRelayAdapter();

/* ── Message Router ───────────────────────────────────────── */
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  var engine = globalThis.signalRelayAdapter;

  switch (message.action) {
    case 'capture':
      sendResponse(engine.capture(message.signal));
      break;
    case 'relay':
      sendResponse(engine.relay());
      break;
    case 'getPending':
      sendResponse(engine.getPending(message.n));
      break;
    case 'getChannelStats':
      sendResponse(engine.getChannelStats());
      break;
    case 'getRelayLog':
      sendResponse(engine.getRelayLog(message.n));
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
  var ALARM_NAME = 'signal-relay-adapter-keepalive';
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: 0.4 });
  chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name !== ALARM_NAME) return;
    if (!globalThis.signalRelayAdapter) {
      globalThis.signalRelayAdapter = new SignalRelayAdapter();
    }
    try {
      chrome.storage.local.set({
        'signal-relay-adapter_state': {
          heartbeatCount: globalThis.signalRelayAdapter.state.heartbeatCount,
          totalSignals: globalThis.signalRelayAdapter.totalSignals,
          lastAlive: Date.now()
        }
      });
    } catch (e) { }
  });
  chrome.runtime.onInstalled.addListener(function () {
    chrome.alarms.create(ALARM_NAME, { periodInMinutes: 0.4 });
  });
})();
