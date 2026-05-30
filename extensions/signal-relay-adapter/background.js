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

    // Outbound (motor command) queues — organism → extensions
    this.outboundQueue = [];
    this.maxOutbound = 500;
    this.totalDispatches = 0;
    this.dispatchLog = [];
    this.maxDispatchLog = 200;

    // Command types the organism can send to extension arms
    this.COMMAND_TYPES = {
      MOTOR:     'motor',      // Execute an action (Screen Commander, Code Sovereign, Voice Forge)
      QUERY:     'query',      // Request data (Data Alchemist, Knowledge Sync)
      REASON:    'reason',     // Ask for reasoning (Sovereign Mind, Logic Prover)
      CONFIGURE: 'configure',  // Adjust arm parameters
      HEARTBEAT: 'heartbeat',  // Organism pulse acknowledgement
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
   * Dispatch a motor command from the organism to an extension arm.
   * Outbound signal: organism → extension.
   * @param {object} command { target, type, intent, payload, urgency }
   * @returns {object}
   */
  dispatch(command) {
    this.totalDispatches++;

    var entry = {
      id: 'cmd-' + Date.now().toString(36) + '-' + (this.totalDispatches % 9999),
      target: command.target || 'organism-core',
      type: command.type || this.COMMAND_TYPES.MOTOR,
      intent: command.intent || 'act',
      payload: command.payload || {},
      urgency: command.urgency || 1,
      phiWeight: this._phiWeight(command.urgency || 1),
      dispatchedAt: Date.now(),
      acknowledged: false,
      result: null
    };

    // Phi-weight: urgent commands go to front
    if (entry.phiWeight > 1.0) {
      this.outboundQueue.unshift(entry);
    } else {
      this.outboundQueue.push(entry);
    }
    if (this.outboundQueue.length > this.maxOutbound) this.outboundQueue.pop();

    // Route to target channel
    var channel = this.channels.get(entry.target);
    if (channel) {
      if (!channel.outbound) channel.outbound = [];
      channel.outbound.push(entry.id);
      if (channel.outbound.length > 100) channel.outbound.shift();
    }

    var logEntry = {
      dispatchId: entry.id,
      target: entry.target,
      type: entry.type,
      intent: entry.intent,
      phiWeight: entry.phiWeight,
      timestamp: Date.now()
    };
    this.dispatchLog.unshift(logEntry);
    if (this.dispatchLog.length > this.maxDispatchLog) this.dispatchLog.pop();

    this._persist();

    return {
      success: true,
      commandId: entry.id,
      target: entry.target,
      phiWeight: entry.phiWeight,
      outboundDepth: this.outboundQueue.filter(function(c) { return !c.acknowledged; }).length,
      ring: 'sovereign'
    };
  }

  /**
   * Dispatch multiple motor commands in batch (organism multi-arm reach).
   * @param {object[]} commands - Array of command objects
   * @returns {object[]}
   */
  dispatchAll(commands) {
    var results = [];
    for (var i = 0; i < commands.length; i++) {
      results.push(this.dispatch(commands[i]));
    }
    return results;
  }

  /**
   * Acknowledge a dispatched command with a result (extension → organism feedback).
   * @param {string} commandId
   * @param {object} result
   * @returns {object}
   */
  acknowledge(commandId, result) {
    var cmd = null;
    for (var i = 0; i < this.outboundQueue.length; i++) {
      if (this.outboundQueue[i].id === commandId) {
        cmd = this.outboundQueue[i];
        break;
      }
    }
    if (!cmd) return { success: false, error: 'Command not found: ' + commandId };

    cmd.acknowledged = true;
    cmd.acknowledgedAt = Date.now();
    cmd.result = result || {};
    cmd.roundTripMs = cmd.acknowledgedAt - cmd.dispatchedAt;

    return {
      success: true,
      commandId: commandId,
      roundTripMs: cmd.roundTripMs,
      phiEfficiency: Math.round((1 - (cmd.roundTripMs / (HEARTBEAT * PHI))) * 1000) / 1000,
      ring: 'sovereign'
    };
  }

  /**
   * Get pending (unacknowledged) outbound commands.
   * @param {number} [n=50]
   * @returns {object[]}
   */
  getPendingOutbound(n) {
    return this.outboundQueue
      .filter(function(c) { return !c.acknowledged; })
      .slice(0, n || 50);
  }

  /**
   * Get outbound dispatch log.
   * @param {number} [n=20]
   * @returns {object[]}
   */
  getDispatchLog(n) {
    return this.dispatchLog.slice(0, n || 20);
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
    var pendingOutbound = this.outboundQueue.filter(function (c) { return !c.acknowledged; }).length;
    return {
      initialized: this.state.initialized,
      heartbeatCount: this.state.heartbeatCount,
      healthy: this.state.healthy,
      totalSignals: this.totalSignals,
      totalRelays: this.totalRelays,
      totalDispatches: this.totalDispatches,
      pendingSignals: pending,
      pendingOutbound: pendingOutbound,
      pulseCount: this.pulseCount,
      phiPhase: Math.round(this.phiPhase * 1000) / 1000,
      channels: this.channels.size,
      bidirectional: true
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
    // Inbound (sensory): extension → organism
    case 'capture':
      sendResponse(engine.capture(message.signal));
      break;
    case 'relay':
      sendResponse(engine.relay());
      break;
    case 'getPending':
      sendResponse(engine.getPending(message.n));
      break;
    // Outbound (motor): organism → extension
    case 'dispatch':
      sendResponse(engine.dispatch(message.command));
      break;
    case 'dispatchAll':
      sendResponse(engine.dispatchAll(message.commands));
      break;
    case 'acknowledge':
      sendResponse(engine.acknowledge(message.commandId, message.result));
      break;
    case 'getPendingOutbound':
      sendResponse(engine.getPendingOutbound(message.n));
      break;
    case 'getDispatchLog':
      sendResponse(engine.getDispatchLog(message.n));
      break;
    // Status
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
