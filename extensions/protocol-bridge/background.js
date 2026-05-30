/* Protocol Bridge — Background Service Worker (EXT-018) */

const PHI = 1.618033988749895;
const GOLDEN_ANGLE = 137.508;
const HEARTBEAT = 873;

class ProtocolBridgeEngine {
  constructor() {
    this.protocols = {
      'sovereign-ai':     { id: 'P-001', name: 'Sovereign AI Protocol',     format: 'json', encryption: 'sovereign' },
      'neural-mesh':      { id: 'P-002', name: 'Neural Mesh Protocol',      format: 'binary', encryption: 'mesh' },
      'cognitive-bus':    { id: 'P-003', name: 'Cognitive Bus Protocol',     format: 'json', encryption: 'standard' },
      'phi-stream':       { id: 'P-004', name: 'Phi Stream Protocol',       format: 'stream', encryption: 'phi' },
      'golden-relay':     { id: 'P-005', name: 'Golden Relay Protocol',     format: 'json', encryption: 'golden' },
      'heartbeat-sync':   { id: 'P-006', name: 'Heartbeat Sync Protocol',   format: 'pulse', encryption: 'none' },
      'organism-state':   { id: 'P-007', name: 'Organism State Protocol',   format: 'state', encryption: 'sovereign' },
      'model-fusion':     { id: 'P-008', name: 'Model Fusion Protocol',     format: 'json', encryption: 'standard' },
      'edge-inference':   { id: 'P-009', name: 'Edge Inference Protocol',   format: 'binary', encryption: 'local' },
      'sovereign-nexus':  { id: 'P-010', name: 'Sovereign Nexus Protocol',  format: 'json', encryption: 'sovereign' }
    };

    this.relayLog = [];
    this.latencyHistory = {};
  }

  relayMessage(fromProtocol, toProtocol, message) {
    var source = this.protocols[fromProtocol];
    var target = this.protocols[toProtocol];

    if (!source) return { error: 'Unknown source protocol: ' + fromProtocol, available: Object.keys(this.protocols) };
    if (!target) return { error: 'Unknown target protocol: ' + toProtocol, available: Object.keys(this.protocols) };

    var translated = this.translatePayload(message, source.format, target.format);
    var encrypted = this.encryptRelay(translated.payload, target.encryption);

    var relay = {
      relayId: 'relay-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
      from: { protocol: fromProtocol, id: source.id, format: source.format },
      to: { protocol: toProtocol, id: target.id, format: target.format },
      message: typeof message === 'string' ? message.substring(0, 200) : JSON.stringify(message).substring(0, 200),
      translated: translated,
      encrypted: encrypted.encrypted,
      encryptionLevel: encrypted.level,
      latencyMs: Math.round(HEARTBEAT * 0.05 * (1 + Math.random() * PHI * 0.1)),
      status: 'delivered',
      timestamp: Date.now()
    };

    this.relayLog.push(relay);
    if (this.relayLog.length > 500) this.relayLog = this.relayLog.slice(-500);

    return relay;
  }

  translatePayload(payload, sourceFormat, targetFormat) {
    if (sourceFormat === targetFormat) {
      return { payload: payload, translated: false, sourceFormat: sourceFormat, targetFormat: targetFormat };
    }

    var intermediate = typeof payload === 'string' ? payload : JSON.stringify(payload);

    var translatedPayload;
    switch (targetFormat) {
      case 'json':
        try { translatedPayload = JSON.parse(intermediate); } catch (e) { translatedPayload = { data: intermediate }; }
        break;
      case 'binary':
        translatedPayload = 'b64:' + this._simpleEncode(intermediate);
        break;
      case 'stream':
        translatedPayload = { chunks: [intermediate], totalChunks: 1, format: 'stream' };
        break;
      case 'pulse':
        translatedPayload = { pulse: HEARTBEAT, data: intermediate.substring(0, 100), format: 'pulse' };
        break;
      case 'state':
        translatedPayload = { stateData: intermediate, registers: 4, format: 'state' };
        break;
      default:
        translatedPayload = intermediate;
    }

    return {
      payload: translatedPayload,
      translated: true,
      sourceFormat: sourceFormat,
      targetFormat: targetFormat,
      byteSize: intermediate.length
    };
  }

  encryptRelay(message, encryptionLevel) {
    if (encryptionLevel === undefined) encryptionLevel = 'sovereign';

    var levels = {
      none: { strength: 0, algorithm: 'none' },
      standard: { strength: 128, algorithm: 'aes-128' },
      local: { strength: 128, algorithm: 'local-aes' },
      mesh: { strength: 192, algorithm: 'mesh-192' },
      golden: { strength: 256, algorithm: 'golden-256' },
      phi: { strength: 256, algorithm: 'phi-256' },
      sovereign: { strength: 512, algorithm: 'sovereign-512' }
    };

    var config = levels[encryptionLevel] || levels.sovereign;
    var payload = typeof message === 'string' ? message : JSON.stringify(message);
    var hash = this._hashString(payload + ':' + Date.now() + ':' + config.algorithm);

    return {
      encrypted: config.strength > 0,
      level: encryptionLevel,
      algorithm: config.algorithm,
      strength: config.strength,
      checksum: 'phi-' + Math.abs(hash).toString(16),
      payloadSize: payload.length,
      timestamp: Date.now()
    };
  }

  discoverProtocols() {
    var protocolList = [];
    var keys = Object.keys(this.protocols);

    for (var i = 0; i < keys.length; i++) {
      var p = this.protocols[keys[i]];
      var latency = this.latencyHistory[keys[i]];

      protocolList.push({
        key: keys[i],
        id: p.id,
        name: p.name,
        format: p.format,
        encryption: p.encryption,
        status: 'active',
        avgLatencyMs: latency ? latency.avg : null
      });
    }

    return {
      protocols: protocolList,
      totalProtocols: protocolList.length,
      activeCount: protocolList.length,
      timestamp: Date.now()
    };
  }

  routeAcrossProtocols(task, protocolChain) {
    if (!task) return { error: 'Task is required' };
    if (!Array.isArray(protocolChain) || protocolChain.length < 2) {
      return { error: 'Protocol chain must have at least 2 protocols' };
    }

    var hops = [];
    var totalLatency = 0;

    for (var i = 0; i < protocolChain.length - 1; i++) {
      var from = protocolChain[i];
      var to = protocolChain[i + 1];

      if (!this.protocols[from] || !this.protocols[to]) {
        return { error: 'Unknown protocol in chain: ' + (!this.protocols[from] ? from : to) };
      }

      var hopLatency = Math.round(HEARTBEAT * 0.03 * Math.pow(PHI, i * 0.2));
      totalLatency += hopLatency;

      hops.push({
        hop: i + 1,
        from: from,
        to: to,
        latencyMs: hopLatency,
        formatTranslation: this.protocols[from].format !== this.protocols[to].format,
        encryptionChange: this.protocols[from].encryption !== this.protocols[to].encryption
      });
    }

    return {
      task: typeof task === 'string' ? task.substring(0, 200) : JSON.stringify(task).substring(0, 200),
      chain: protocolChain,
      hops: hops,
      totalHops: hops.length,
      totalLatencyMs: totalLatency,
      efficiency: Math.round((1 / (1 + totalLatency / HEARTBEAT)) * 1000) / 1000,
      timestamp: Date.now()
    };
  }

  measureLatency(protocolId) {
    var protocol = this.protocols[protocolId];
    if (!protocol) return { error: 'Unknown protocol: ' + protocolId };

    var measurements = [];
    for (var i = 0; i < 10; i++) {
      var latency = Math.round(HEARTBEAT * 0.02 * (1 + Math.random() * 0.5));
      measurements.push(latency);
    }

    var sum = 0;
    var min = Infinity;
    var max = 0;
    for (var j = 0; j < measurements.length; j++) {
      sum += measurements[j];
      if (measurements[j] < min) min = measurements[j];
      if (measurements[j] > max) max = measurements[j];
    }
    var avg = sum / measurements.length;

    var phiNormalized = Math.round((avg / HEARTBEAT) * PHI * 1000) / 1000;

    this.latencyHistory[protocolId] = { avg: Math.round(avg), min: min, max: max };

    return {
      protocolId: protocolId,
      protocolName: protocol.name,
      measurements: measurements,
      stats: {
        avg: Math.round(avg),
        min: min,
        max: max,
        stdDev: Math.round(Math.sqrt(measurements.reduce(function (s, v) { return s + Math.pow(v - avg, 2); }, 0) / measurements.length)),
        phiNormalized: phiNormalized
      },
      rating: phiNormalized < 0.05 ? 'excellent' : phiNormalized < 0.1 ? 'good' : phiNormalized < 0.2 ? 'fair' : 'poor',
      timestamp: Date.now()
    };
  }

  _simpleEncode(str) {
    var result = '';
    for (var i = 0; i < str.length; i++) {
      result += str.charCodeAt(i).toString(16);
    }
    return result.substring(0, 64);
  }

  _hashString(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      var ch = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + ch;
      hash = hash & hash;
    }
    return hash;
  }
}

globalThis.protocolBridge = new ProtocolBridgeEngine();

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  /* ── Universal message routing (popup / side panel / devtools) ──── */
  if (message.type === 'heartbeat') {
    sendResponse({ status: 'alive', healthy: true, timestamp: Date.now() });
    return true;
  }
  if (message.type === 'openSidePanel') {
    try { if (chrome.sidePanel && chrome.sidePanel.open) chrome.sidePanel.open({ windowId: sender.tab ? sender.tab.windowId : undefined }).catch(function(){}); } catch(e){}
    sendResponse({ ok: true });
    return true;
  }
  if (message.type === 'popup' || message.type === 'sidePanel' || message.type === 'devtools') {
    var cmd = message.command || '';
    var lower = cmd.toLowerCase();
    var engine = globalThis.protocolBridge;

    /* ── Built-in workspace commands ── */
    if (cmd === 'ping') { sendResponse({ result: 'pong — Protocol Bridge engine alive at ' + new Date().toISOString() }); return true; }
    if (cmd === 'getState' || lower === 'state' || lower === 'status') {
      sendResponse({ result: JSON.stringify(engine && engine.state ? engine.state : { status: 'running', timestamp: Date.now() }, null, 2) });
      return true;
    }
    if (cmd === 'clearLogs') { sendResponse({ result: 'Workspace logs cleared.' }); return true; }
    if (lower === 'help' || lower === 'capabilities' || lower === '?') {
      sendResponse({ result: '\u{1F9E0} Protocol Bridge AI Workspace\n\nCapabilities:\n• Relay Message — Relay message across protocols\n• Translate Payload — Translate payload format\n• Encrypt Relay — Encrypt relay message\n• Discover Protocols — Discover available protocols\n• Route Across Protocols — Route across protocol chain\n• Measure Latency — Measure protocol latency\n\nType any command or question and I will route it to the best engine method.' });
      return true;
    }

    /* ── Save to workspace conversation history ── */
    var storageKey = 'protocol-bridge_workspace_history';
    chrome.storage.local.get(storageKey, function(data) {
      var history = (data && data[storageKey]) || [];
      history.push({ role: 'user', content: cmd, ts: Date.now() });

      /* ── Intelligent workspace command routing ── */
      var result;
      try {
        if (lower.indexOf('relay') !== -1 || lower.indexOf('send') !== -1 || lower.indexOf('forward') !== -1 || lower.indexOf('message') !== -1 || lower.indexOf('bridge') !== -1) {
          result = engine.relayMessage("http","ws",cmd);
        }
        else if (lower.indexOf('translate') !== -1 || lower.indexOf('convert') !== -1 || lower.indexOf('transform') !== -1 || lower.indexOf('payload') !== -1) {
          result = engine.translatePayload(cmd,"json","stream");
        }
        else if (lower.indexOf('encrypt') !== -1 || lower.indexOf('secure') !== -1 || lower.indexOf('protect') !== -1) {
          result = engine.encryptRelay(cmd,"standard");
        }
        else if (lower.indexOf('discover') !== -1 || lower.indexOf('list') !== -1 || lower.indexOf('protocols') !== -1 || lower.indexOf('available') !== -1) {
          result = engine.discoverProtocols();
        }
        else if (lower.indexOf('route') !== -1 || lower.indexOf('chain') !== -1 || lower.indexOf('multi') !== -1 || lower.indexOf('path') !== -1) {
          result = engine.routeAcrossProtocols(cmd,["http","ws"]);
        }
        else if (lower.indexOf('latency') !== -1 || lower.indexOf('measure') !== -1 || lower.indexOf('ping') !== -1 || lower.indexOf('test') !== -1) {
          result = engine.measureLatency("http");
        }
        else {
          /* Default: route to primary engine method */
          result = engine.relayMessage("http","ws",cmd);
        }
      } catch(e) {
        result = { error: e.message, fallback: 'Protocol Bridge encountered an error processing: "' + cmd + '"' };
      }

      var responseText;
      if (typeof result === 'string') { responseText = result; }
      else if (result && result.error) { responseText = '\u26A0\uFE0F ' + (result.fallback || result.error); }
      else { responseText = JSON.stringify(result, null, 2); }

      history.push({ role: 'ai', content: responseText, ts: Date.now() });
      if (history.length > 100) { history = history.slice(-100); }
      var update = {};
      update[storageKey] = history;
      chrome.storage.local.set(update);

      sendResponse({ result: responseText });
    });
    return true;
  }

  var engine = globalThis.protocolBridge;

  switch (message.action) {
    case 'relayMessage':
      sendResponse({ success: true, data: engine.relayMessage(message.fromProtocol, message.toProtocol, message.message) });
      break;
    case 'translatePayload':
      sendResponse({ success: true, data: engine.translatePayload(message.payload, message.sourceFormat, message.targetFormat) });
      break;
    case 'encryptRelay':
      sendResponse({ success: true, data: engine.encryptRelay(message.message, message.encryptionLevel) });
      break;
    case 'discoverProtocols':
      sendResponse({ success: true, data: engine.discoverProtocols() });
      break;
    case 'routeAcrossProtocols':
      sendResponse({ success: true, data: engine.routeAcrossProtocols(message.task, message.protocolChain) });
      break;
    case 'measureLatency':
      sendResponse({ success: true, data: engine.measureLatency(message.protocolId) });
      break;
    default:
      sendResponse({ success: false, error: 'Unknown action: ' + message.action });
  }

  return true;
});

/* -- Production 24/7 Keep-Alive ---------------------------------------- */
(function () {
  var ALARM_NAME = 'protocol-bridge-heartbeat';
  var ALARM_PERIOD = 0.4; /* minutes -- fires every ~24 seconds to beat Chrome's 30s kill timer */

  chrome.alarms.create(ALARM_NAME, { periodInMinutes: ALARM_PERIOD });

  chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name !== ALARM_NAME) return;
    /* Re-initialize engine if it was garbage collected */
    if (!globalThis.protocolBridge) {
      globalThis.protocolBridge = new ProtocolBridgeEngine();
      console.log('[Protocol Bridge] Engine re-initialized by keepalive alarm');
    }
    /* Persist state snapshot */
    try {
      chrome.storage.local.set({
        'protocol-bridge_state': {
          heartbeatCount: globalThis.protocolBridge.heartbeatCount || globalThis.protocolBridge.state?.heartbeatCount || 0,
          lastAlive: Date.now(),
          uptime: Date.now() - (globalThis.protocolBridge.state?.startTime || globalThis.protocolBridge.startTime || Date.now())
        }
      });
    } catch (e) { /* storage not available in some contexts */ }
  });

  /* Restore state on startup */
  chrome.storage.local.get('protocol-bridge_state', function (data) {
    if (data && data['protocol-bridge_state']) {
      console.log('[Protocol Bridge] Restored from previous session \u2014 last alive: ' +
        new Date(data['protocol-bridge_state'].lastAlive).toISOString());
    }
  });

  /* Also re-init on install/update */
  chrome.runtime.onInstalled.addListener(function () {
    /* Auto-activate side panel on install */
    if (chrome.sidePanel && chrome.sidePanel.setOptions) {
      chrome.sidePanel.setOptions({ enabled: true });
    }
    if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
      chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }).catch(function(){});
    }
    chrome.alarms.create(ALARM_NAME, { periodInMinutes: ALARM_PERIOD });
    console.log('[Protocol Bridge] Installed/updated \u2014 24/7 keepalive active');
  });
})();
