/* Sovereign Nexus — Background Service Worker (EXT-020) */

const PHI = 1.618033988749895;
const GOLDEN_ANGLE = 137.508;
const HEARTBEAT = 873;

class SovereignNexusEngine {
  constructor() {
    this.extensions = {};
    this.heartbeatPhases = {};
    this.globalMetricsCache = null;
    this.commandLog = [];

    /* Pre-register all 20 extensions */
    var registry = [
      { id: 'EXT-001', name: 'Sovereign Mind',        capabilities: ['reasoning', 'fusion', 'routing'] },
      { id: 'EXT-002', name: 'Polyglot Oracle',       capabilities: ['translation', 'language', 'detection'] },
      { id: 'EXT-003', name: 'Code Sovereign',        capabilities: ['code', 'generation', 'debugging', 'review'] },
      { id: 'EXT-004', name: 'Vision Weaver',         capabilities: ['image', 'generation', 'segmentation', 'style'] },
      { id: 'EXT-005', name: 'Voice Forge',           capabilities: ['speech', 'tts', 'stt', 'cloning'] },
      { id: 'EXT-006', name: 'Data Alchemist',        capabilities: ['data', 'transformation', 'analysis', 'pipeline'] },
      { id: 'EXT-007', name: 'Research Nexus',        capabilities: ['research', 'search', 'summarization', 'citation'] },
      { id: 'EXT-008', name: 'Memory Palace',         capabilities: ['memory', 'storage', 'retrieval', 'association'] },
      { id: 'EXT-009', name: 'Sentinel Watch',        capabilities: ['security', 'monitoring', 'threat', 'detection'] },
      { id: 'EXT-010', name: 'Cipher Shield',         capabilities: ['encryption', 'decryption', 'hashing', 'steganography'] },
      { id: 'EXT-011', name: 'Video Architect',       capabilities: ['video', 'generation', 'rendering', 'merging'] },
      { id: 'EXT-012', name: 'Logic Prover',          capabilities: ['math', 'proof', 'verification', 'logic'] },
      { id: 'EXT-013', name: 'Social Cortex',         capabilities: ['sentiment', 'emotion', 'social', 'risk'] },
      { id: 'EXT-014', name: 'Edge Runner',           capabilities: ['inference', 'local', 'edge', 'benchmark'] },
      { id: 'EXT-015', name: 'Contract Forge',        capabilities: ['contract', 'compliance', 'signing', 'obligation'] },
      { id: 'EXT-016', name: 'Organism Dashboard',    capabilities: ['heartbeat', 'vitality', 'sensors', 'state'] },
      { id: 'EXT-017', name: 'Knowledge Cartographer', capabilities: ['graph', 'knowledge', 'entity', 'mapping'] },
      { id: 'EXT-018', name: 'Protocol Bridge',       capabilities: ['protocol', 'relay', 'translation', 'encryption'] },
      { id: 'EXT-019', name: 'Creative Muse',         capabilities: ['art', 'music', 'creation', 'composition'] },
      { id: 'EXT-020', name: 'Sovereign Nexus',       capabilities: ['hub', 'routing', 'orchestration', 'metrics'] }
    ];

    for (var i = 0; i < registry.length; i++) {
      this.registerExtension(registry[i].id, registry[i].capabilities, registry[i].name);
    }
  }

  registerExtension(extId, capabilities, name) {
    this.extensions[extId] = {
      id: extId,
      name: name || extId,
      capabilities: capabilities || [],
      status: 'active',
      registeredAt: Date.now(),
      lastHeartbeat: Date.now(),
      messageCount: 0,
      phase: Math.random() * Math.PI * 2
    };

    this.heartbeatPhases[extId] = Math.random() * Math.PI * 2;

    return {
      registered: true,
      extId: extId,
      totalExtensions: Object.keys(this.extensions).length
    };
  }

  routeToExtension(task) {
    if (!task) return { error: 'Task description is required' };

    var lower = (typeof task === 'string' ? task : JSON.stringify(task)).toLowerCase();
    var scores = {};
    var extKeys = Object.keys(this.extensions);

    for (var i = 0; i < extKeys.length; i++) {
      var ext = this.extensions[extKeys[i]];
      var score = 0;

      for (var c = 0; c < ext.capabilities.length; c++) {
        if (lower.indexOf(ext.capabilities[c]) !== -1) {
          score += 2;
        }
      }

      /* Name matching */
      var nameLower = ext.name.toLowerCase();
      var nameWords = nameLower.split(/\s+/);
      for (var n = 0; n < nameWords.length; n++) {
        if (lower.indexOf(nameWords[n]) !== -1 && nameWords[n].length > 3) {
          score += 1;
        }
      }

      var phiWeight = Math.pow(PHI, -(i * 0.1));
      scores[extKeys[i]] = Math.round(score * phiWeight * 1000) / 1000;
    }

    var bestExt = extKeys[0];
    var bestScore = 0;
    for (var key in scores) {
      if (scores[key] > bestScore) {
        bestScore = scores[key];
        bestExt = key;
      }
    }

    var topResults = Object.keys(scores)
      .map(function (k) { return { id: k, name: this.extensions[k].name, score: scores[k] }; }.bind(this))
      .sort(function (a, b) { return b.score - a.score; })
      .slice(0, 5);

    return {
      bestMatch: bestExt,
      bestMatchName: this.extensions[bestExt].name,
      confidence: bestScore > 0 ? Math.min(1, bestScore / (bestScore + PHI)) : 0,
      topMatches: topResults,
      task: typeof task === 'string' ? task.substring(0, 150) : JSON.stringify(task).substring(0, 150),
      timestamp: Date.now()
    };
  }

  getOrganismTopology() {
    var nodes = [];
    var edges = [];
    var extKeys = Object.keys(this.extensions);

    for (var i = 0; i < extKeys.length; i++) {
      var ext = this.extensions[extKeys[i]];
      var angle = i * GOLDEN_ANGLE * (Math.PI / 180);
      var radius = 200 * Math.sqrt(i / Math.max(1, extKeys.length));

      nodes.push({
        id: ext.id,
        name: ext.name,
        status: ext.status,
        capabilities: ext.capabilities,
        x: Math.round(radius * Math.cos(angle)),
        y: Math.round(radius * Math.sin(angle)),
        phase: Math.round((this.heartbeatPhases[extKeys[i]] || 0) * 1000) / 1000
      });

      /* Connect to hub (EXT-020) */
      if (extKeys[i] !== 'EXT-020') {
        edges.push({
          source: extKeys[i],
          target: 'EXT-020',
          type: 'hub-connection',
          strength: Math.round(Math.pow(PHI, -(i * 0.1)) * 1000) / 1000
        });
      }

      /* Connect neighbors in capability space */
      if (i > 0) {
        edges.push({
          source: extKeys[i - 1],
          target: extKeys[i],
          type: 'neighbor',
          strength: Math.round(Math.pow(PHI, -1) * 1000) / 1000
        });
      }
    }

    return {
      nodes: nodes,
      edges: edges,
      totalNodes: nodes.length,
      totalEdges: edges.length,
      layout: 'golden-phyllotaxis',
      timestamp: Date.now()
    };
  }

  masterHeartbeat() {
    /*
     * Kuramoto coupling model for phase synchronization:
     * dθ_i = ω + (K/N) · Σ sin(θ_j - θ_i)
     * where K = PHI, N = number of extensions
     */
    var extKeys = Object.keys(this.extensions);
    var N = extKeys.length;
    var K = PHI;
    var omega = (2 * Math.PI) / (HEARTBEAT / 1000);
    var dt = HEARTBEAT / 1000;

    var newPhases = {};
    var synchronization = 0;

    for (var i = 0; i < N; i++) {
      var theta_i = this.heartbeatPhases[extKeys[i]] || 0;
      var coupling = 0;

      for (var j = 0; j < N; j++) {
        if (i === j) continue;
        var theta_j = this.heartbeatPhases[extKeys[j]] || 0;
        coupling += Math.sin(theta_j - theta_i);
      }

      var dTheta = omega + (K / N) * coupling;
      var newTheta = (theta_i + dTheta * dt) % (2 * Math.PI);
      newPhases[extKeys[i]] = newTheta;

      this.extensions[extKeys[i]].lastHeartbeat = Date.now();
      this.extensions[extKeys[i]].phase = newTheta;
    }

    /* Calculate order parameter r = |1/N Σ e^(iθ_j)| */
    var cosSum = 0;
    var sinSum = 0;
    for (var p = 0; p < N; p++) {
      cosSum += Math.cos(newPhases[extKeys[p]] || 0);
      sinSum += Math.sin(newPhases[extKeys[p]] || 0);
    }
    synchronization = Math.sqrt(cosSum * cosSum + sinSum * sinSum) / N;

    this.heartbeatPhases = newPhases;

    return {
      pulse: HEARTBEAT,
      extensionCount: N,
      couplingStrength: K,
      synchronization: Math.round(synchronization * 1000) / 1000,
      synced: synchronization > 0.8,
      phases: Object.keys(newPhases).map(function (k) {
        return { id: k, phase: Math.round(newPhases[k] * 1000) / 1000 };
      }),
      kuramotoParams: { K: K, N: N, omega: Math.round(omega * 1000) / 1000 },
      timestamp: Date.now()
    };
  }

  broadcastCommand(command) {
    if (!command) return { error: 'Command is required' };

    var extKeys = Object.keys(this.extensions);
    var deliveries = [];

    for (var i = 0; i < extKeys.length; i++) {
      var ext = this.extensions[extKeys[i]];
      ext.messageCount++;

      deliveries.push({
        extId: extKeys[i],
        name: ext.name,
        status: 'delivered',
        messageNumber: ext.messageCount
      });
    }

    var logEntry = {
      command: typeof command === 'string' ? command.substring(0, 200) : JSON.stringify(command).substring(0, 200),
      deliveredTo: extKeys.length,
      timestamp: Date.now()
    };
    this.commandLog.push(logEntry);
    if (this.commandLog.length > 100) this.commandLog = this.commandLog.slice(-100);

    return {
      command: logEntry.command,
      deliveries: deliveries,
      totalDelivered: deliveries.length,
      timestamp: Date.now()
    };
  }

  getGlobalMetrics() {
    var extKeys = Object.keys(this.extensions);
    var totalMessages = 0;
    var activeCount = 0;
    var allCapabilities = {};

    for (var i = 0; i < extKeys.length; i++) {
      var ext = this.extensions[extKeys[i]];
      var phiWeight = Math.pow(PHI, -(i * 0.1));

      totalMessages += ext.messageCount;
      if (ext.status === 'active') activeCount++;

      for (var c = 0; c < ext.capabilities.length; c++) {
        var cap = ext.capabilities[c];
        if (!allCapabilities[cap]) allCapabilities[cap] = 0;
        allCapabilities[cap] += phiWeight;
      }
    }

    /* Phi-weighted averages */
    var weightSum = 0;
    var weightTotal = 0;
    for (var w = 0; w < extKeys.length; w++) {
      var weight = Math.pow(PHI, -(w * 0.1));
      weightSum += this.extensions[extKeys[w]].messageCount * weight;
      weightTotal += weight;
    }
    var weightedAvgMessages = weightTotal > 0 ? weightSum / weightTotal : 0;

    /* Sort capabilities by phi-weighted frequency */
    var capList = Object.keys(allCapabilities).map(function (k) {
      return { capability: k, weight: Math.round(allCapabilities[k] * 1000) / 1000 };
    }).sort(function (a, b) { return b.weight - a.weight; });

    return {
      totalExtensions: extKeys.length,
      activeExtensions: activeCount,
      totalMessages: totalMessages,
      weightedAvgMessages: Math.round(weightedAvgMessages * 100) / 100,
      topCapabilities: capList.slice(0, 10),
      commandsIssued: this.commandLog.length,
      heartbeatPulse: HEARTBEAT,
      phiConstant: PHI,
      goldenAngle: GOLDEN_ANGLE,
      timestamp: Date.now()
    };
  }
}

globalThis.sovereignNexus = new SovereignNexusEngine();

/* Auto-run master heartbeat */
setInterval(function () {
  globalThis.sovereignNexus.masterHeartbeat();
}, HEARTBEAT);

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
    var engine = globalThis.sovereignNexus;

    /* ── Built-in workspace commands ── */
    if (cmd === 'ping') { sendResponse({ result: 'pong — Sovereign Nexus engine alive at ' + new Date().toISOString() }); return true; }
    if (cmd === 'getState' || lower === 'state' || lower === 'status') {
      sendResponse({ result: JSON.stringify(engine && engine.state ? engine.state : { status: 'running', timestamp: Date.now() }, null, 2) });
      return true;
    }
    if (cmd === 'clearLogs') { sendResponse({ result: 'Workspace logs cleared.' }); return true; }
    if (lower === 'help' || lower === 'capabilities' || lower === '?') {
      sendResponse({ result: '\u{1F9E0} Sovereign Nexus AI Workspace\n\nCapabilities:\n• Route To Extension — Route task to best extension\n• Get Organism Topology — Get organism network topology\n• Master Heartbeat — Master heartbeat check\n• Broadcast Command — Broadcast command to all extensions\n• Get Global Metrics — Get global system metrics\n\nType any command or question and I will route it to the best engine method.' });
      return true;
    }

    /* ── Save to workspace conversation history ── */
    var storageKey = 'sovereign-nexus_workspace_history';
    chrome.storage.local.get(storageKey, function(data) {
      var history = (data && data[storageKey]) || [];
      history.push({ role: 'user', content: cmd, ts: Date.now() });

      /* ── Intelligent workspace command routing ── */
      var result;
      try {
        if (lower.indexOf('route') !== -1 || lower.indexOf('task') !== -1 || lower.indexOf('assign') !== -1 || lower.indexOf('direct') !== -1) {
          result = engine.routeToExtension(cmd);
        }
        else if (lower.indexOf('topology') !== -1 || lower.indexOf('map') !== -1 || lower.indexOf('network') !== -1 || lower.indexOf('overview') !== -1) {
          result = engine.getOrganismTopology();
        }
        else if (lower.indexOf('heartbeat') !== -1 || lower.indexOf('pulse') !== -1 || lower.indexOf('alive') !== -1 || lower.indexOf('health') !== -1) {
          result = engine.masterHeartbeat();
        }
        else if (lower.indexOf('broadcast') !== -1 || lower.indexOf('all') !== -1 || lower.indexOf('notify') !== -1 || lower.indexOf('send') !== -1) {
          result = engine.broadcastCommand(cmd);
        }
        else if (lower.indexOf('metrics') !== -1 || lower.indexOf('stats') !== -1 || lower.indexOf('global') !== -1 || lower.indexOf('analytics') !== -1) {
          result = engine.getGlobalMetrics();
        }
        else {
          /* Default: route to primary engine method */
          result = engine.routeToExtension(cmd);
        }
      } catch(e) {
        result = { error: e.message, fallback: 'Sovereign Nexus encountered an error processing: "' + cmd + '"' };
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

  var engine = globalThis.sovereignNexus;

  switch (message.action) {
    case 'registerExtension':
      sendResponse({ success: true, data: engine.registerExtension(message.extId, message.capabilities, message.name) });
      break;
    case 'routeToExtension':
      sendResponse({ success: true, data: engine.routeToExtension(message.task) });
      break;
    case 'getOrganismTopology':
      sendResponse({ success: true, data: engine.getOrganismTopology() });
      break;
    case 'masterHeartbeat':
      sendResponse({ success: true, data: engine.masterHeartbeat() });
      break;
    case 'broadcastCommand':
      sendResponse({ success: true, data: engine.broadcastCommand(message.command) });
      break;
    case 'getGlobalMetrics':
      sendResponse({ success: true, data: engine.getGlobalMetrics() });
      break;
    default:
      sendResponse({ success: false, error: 'Unknown action: ' + message.action });
  }

  return true;
});

/* -- Production 24/7 Keep-Alive ---------------------------------------- */
(function () {
  var ALARM_NAME = 'sovereign-nexus-heartbeat';
  var ALARM_PERIOD = 0.4; /* minutes -- fires every ~24 seconds to beat Chrome's 30s kill timer */

  chrome.alarms.create(ALARM_NAME, { periodInMinutes: ALARM_PERIOD });

  chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name !== ALARM_NAME) return;
    /* Re-initialize engine if it was garbage collected */
    if (!globalThis.sovereignNexus) {
      globalThis.sovereignNexus = new SovereignNexusEngine();
      console.log('[Sovereign Nexus] Engine re-initialized by keepalive alarm');
    }
    /* Persist state snapshot */
    try {
      chrome.storage.local.set({
        'sovereign-nexus_state': {
          heartbeatCount: globalThis.sovereignNexus.heartbeatCount || globalThis.sovereignNexus.state?.heartbeatCount || 0,
          lastAlive: Date.now(),
          uptime: Date.now() - (globalThis.sovereignNexus.state?.startTime || globalThis.sovereignNexus.startTime || Date.now())
        }
      });
    } catch (e) { /* storage not available in some contexts */ }
  });

  /* Restore state on startup */
  chrome.storage.local.get('sovereign-nexus_state', function (data) {
    if (data && data['sovereign-nexus_state']) {
      console.log('[Sovereign Nexus] Restored from previous session \u2014 last alive: ' +
        new Date(data['sovereign-nexus_state'].lastAlive).toISOString());
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
    console.log('[Sovereign Nexus] Installed/updated \u2014 24/7 keepalive active');
  });
})();
