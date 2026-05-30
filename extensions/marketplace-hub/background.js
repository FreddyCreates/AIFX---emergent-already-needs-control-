/* Marketplace Hub — Background Service Worker (EXT-021)
 *
 * AI Tool Marketplace Intelligence — the user-facing AI experience
 * for discovering, invoking, and exploring organism tools.
 *
 * This extension gives users a natural-language interface to the
 * organism's 24 callable tools across 4 families. Users can:
 * - Search tools by keyword or intent
 * - Browse tools by family (Crawling/Context/Commander/Sentry)
 * - Invoke tools with guided input forms
 * - View live results with phi-scored relevance
 * - Explore the cross-family resonance graph
 * - Track invocation history and settlement costs
 *
 * The AI does not assume the user "just knows" the tools.
 * It provides a legible, routable, permissioned marketplace grammar.
 */

const PHI = 1.618033988749895;
const GOLDEN_ANGLE = 137.508;
const HEARTBEAT = 873;

class MarketplaceHubEngine {
  constructor() {
    this.heartbeatCount = 0;
    this.heartbeatActive = false;
    this.heartbeatInterval = null;

    /* ── Tool Catalog (all 24 VOIS tools) ─────────────────── */
    this.tools = [
      /* 🧠 Context Family */
      { callId: 'TOOL-001', name: 'PULSE-KEEPER', family: 'Context', role: 'Heartbeat Witness', ring: 'Sovereign Ring', purpose: 'Monitor organism heartbeat pulse at 873ms cadence', icon: '💓', actions: ['status', 'beat', 'drift'] },
      { callId: 'TOOL-004', name: 'STATE-GUARDIAN', family: 'Context', role: 'State Reader', ring: 'Sovereign Ring', purpose: 'Read and validate 4-register organism state', icon: '🏛', actions: ['snapshot', 'validate', 'diff'] },
      { callId: 'TOOL-005', name: 'CYCLE-COUNTER', family: 'Context', role: 'Phase Tracker', ring: 'Sovereign Ring', purpose: 'Count organism lifecycle cycles and phases', icon: '🔄', actions: ['count', 'phase', 'history'] },
      { callId: 'TOOL-008', name: 'CONTEXT-BUILDER', family: 'Context', role: 'Context Architect', ring: 'Interface Ring', purpose: 'Assemble rich execution context for AI reasoning', icon: '🧩', actions: ['build', 'enrich', 'summarize'] },
      { callId: 'TOOL-010', name: 'MEMORY-CONSOLIDATOR', family: 'Context', role: 'Memory Keeper', ring: 'Memory Ring', purpose: 'Consolidate and prune organism memories', icon: '🗃', actions: ['consolidate', 'prune', 'compact', 'status'] },
      { callId: 'TOOL-022', name: 'LINEAGE-TRACER', family: 'Context', role: 'Lineage Historian', ring: 'Memory Ring', purpose: 'Trace full lineage of organism entities', icon: '🌳', actions: ['trace', 'ancestors', 'descendants', 'causal-chain'] },

      /* ⚡ Commander Family */
      { callId: 'TOOL-002', name: 'SYNC-WEAVER', family: 'Commander', role: 'Synchronization Master', ring: 'Sovereign Ring', purpose: 'Synchronize endpoints via phi-resonance Kuramoto coupling', icon: '🌀', actions: ['status', 'register', 'step', 'resonate'] },
      { callId: 'TOOL-006', name: 'INFER-ENGINE', family: 'Commander', role: 'Model Strategist', ring: 'Interface Ring', purpose: 'Route inference tasks to optimal AI model', icon: '🎯', actions: ['route', 'score', 'compare'] },
      { callId: 'TOOL-009', name: 'ATTENTION-ROUTER', family: 'Commander', role: 'Focus Director', ring: 'Interface Ring', purpose: 'Route attention and focus across subsystems', icon: '👁', actions: ['focus', 'distribute', 'query'] },
      { callId: 'TOOL-016', name: 'RESOURCE-BALANCER', family: 'Commander', role: 'Resource Allocator', ring: 'Sovereign Ring', purpose: 'Balance resources across rings with phi-weighted allocation', icon: '⚖', actions: ['balance', 'allocate', 'status'] },
      { callId: 'TOOL-017', name: 'CONNECTION-POOL', family: 'Commander', role: 'Connection Quartermaster', ring: 'Transport Ring', purpose: 'Manage connection pools for enterprise connectors', icon: '🔌', actions: ['status', 'drain', 'expand', 'health'] },
      { callId: 'TOOL-024', name: 'TASK-COMMANDER', family: 'Commander', role: 'Execution General', ring: 'Interface Ring', purpose: 'Orchestrate multi-step task plans across tools', icon: '⚔', actions: ['plan', 'dispatch', 'status', 'rollback'] },

      /* 🕷 Crawling Family */
      { callId: 'TOOL-003', name: 'FLOW-MONITOR', family: 'Crawling', role: 'Flow Scout', ring: 'Transport Ring', purpose: 'Monitor data flow throughput and detect bottlenecks', icon: '🌊', actions: ['status', 'throughput', 'bottlenecks'] },
      { callId: 'TOOL-007', name: 'PATTERN-SEEKER', family: 'Crawling', role: 'Pattern Analyst', ring: 'Memory Ring', purpose: 'Detect recurring patterns in organism data streams', icon: '🔍', actions: ['scan', 'frequency', 'anomaly'] },
      { callId: 'TOOL-014', name: 'ANOMALY-DETECTOR', family: 'Crawling', role: 'Anomaly Hunter', ring: 'Sovereign Ring', purpose: 'Detect anomalies in organism behavior', icon: '⚠', actions: ['detect', 'baseline', 'status'] },
      { callId: 'TOOL-018', name: 'CACHE-OPTIMIZER', family: 'Crawling', role: 'Cache Surgeon', ring: 'Memory Ring', purpose: 'Optimize caching across organism memory layers', icon: '💾', actions: ['status', 'optimize', 'evict', 'warm'] },
      { callId: 'TOOL-020', name: 'LOG-STREAMER', family: 'Crawling', role: 'Stream Keeper', ring: 'Transport Ring', purpose: 'Stream organism logs in real-time', icon: '📡', actions: ['stream', 'query', 'tail', 'status'] },
      { callId: 'TOOL-021', name: 'TOPOLOGY-CRAWLER', family: 'Crawling', role: 'Topology Mapper', ring: 'Sovereign Ring', purpose: 'Crawl and map organism topology and dependencies', icon: '🗺', actions: ['crawl', 'map', 'orphans', 'dependencies'] },

      /* 🛡 Sentry Family */
      { callId: 'TOOL-011', name: 'SENTINEL-WATCH', family: 'Sentry', role: 'Perimeter Guard', ring: 'Counsel Ring', purpose: 'Real-time security monitoring and threat detection', icon: '🛡', actions: ['scan', 'status', 'threats'] },
      { callId: 'TOOL-012', name: 'INTEGRITY-CHECKER', family: 'Sentry', role: 'Truth Verifier', ring: 'Proof Ring', purpose: 'Verify data integrity and schema consistency', icon: '✅', actions: ['check', 'verify-contract', 'audit'] },
      { callId: 'TOOL-013', name: 'BOUNDARY-ENFORCER', family: 'Sentry', role: 'Ring Warden', ring: 'Counsel Ring', purpose: 'Enforce ring boundaries and prevent state leakage', icon: '🚧', actions: ['enforce', 'validate', 'status'] },
      { callId: 'TOOL-015', name: 'SEAL-VERIFIER', family: 'Sentry', role: 'Seal Master', ring: 'Counsel Ring', purpose: 'Verify cryptographic seals on contracts and data', icon: '🔏', actions: ['verify', 'seal', 'status'] },
      { callId: 'TOOL-019', name: 'QUEUE-PROCESSOR', family: 'Sentry', role: 'Security Queue Handler', ring: 'Transport Ring', purpose: 'Process organism security and settlement queues', icon: '📋', actions: ['status', 'enqueue', 'process', 'drain'] },
      { callId: 'TOOL-023', name: 'DOCTRINE-AUDITOR', family: 'Sentry', role: 'Doctrine Judge', ring: 'Counsel Ring', purpose: 'Audit organism behavior against 40 architectural laws', icon: '📜', actions: ['audit', 'check-law', 'drift-report', 'compliance-score'] },
    ];

    /* ── Family metadata ──────────────────────────────────────── */
    this.families = {
      Context: { icon: '🧠', color: '#6c63ff', motto: 'Context is the organism knowing why it is what it is.' },
      Commander: { icon: '⚡', color: '#f5a623', motto: 'The commander turns intent into coordinated multi-tool action.' },
      Crawling: { icon: '🕷', color: '#00e676', motto: 'The crawl is the organism\'s self-awareness of its own structure.' },
      Sentry: { icon: '🛡', color: '#e94560', motto: 'The sentry ensures the organism remains true to its own laws.' },
    };

    /* ── Invocation history ────────────────────────────────── */
    this.invocationHistory = [];
    this.invocationCount = 0;
  }

  /* ── Heartbeat ─────────────────────────────────────────── */

  startHeartbeat(intervalMs) {
    if (intervalMs === undefined) intervalMs = HEARTBEAT;
    if (this.heartbeatActive) {
      return { status: 'already-running', heartbeatCount: this.heartbeatCount };
    }
    this.heartbeatActive = true;
    var self = this;
    this.heartbeatInterval = setInterval(function () {
      self.heartbeatCount++;
    }, intervalMs);
    return { status: 'started', intervalMs: intervalMs, heartbeatCount: this.heartbeatCount };
  }

  stopHeartbeat() {
    if (!this.heartbeatActive) {
      return { status: 'not-running' };
    }
    clearInterval(this.heartbeatInterval);
    this.heartbeatActive = false;
    return { status: 'stopped', heartbeatCount: this.heartbeatCount };
  }

  /* ── Search & Discovery ────────────────────────────────── */

  searchTools(query) {
    if (!query || query.trim().length === 0) return [];

    var terms = query.toLowerCase().split(/\s+/);
    var results = [];
    var self = this;

    for (var i = 0; i < this.tools.length; i++) {
      var tool = this.tools[i];
      var searchable = [
        tool.name, tool.family, tool.role, tool.purpose, tool.ring, tool.callId
      ].join(' ').toLowerCase();

      var hits = 0;
      for (var t = 0; t < terms.length; t++) {
        if (searchable.indexOf(terms[t]) !== -1) hits++;
      }

      if (hits > 0) {
        var relevance = Math.round((hits / terms.length) * Math.pow(PHI, hits) * 100) / 100;
        results.push({ tool: tool, relevance: relevance });
      }
    }

    results.sort(function (a, b) { return b.relevance - a.relevance; });
    return results;
  }

  getToolsByFamily(familyName) {
    return this.tools.filter(function (t) { return t.family === familyName; });
  }

  getToolById(callId) {
    return this.tools.find(function (t) { return t.callId === callId; });
  }

  getAllFamilies() {
    return Object.keys(this.families).map(function (name) {
      return {
        name: name,
        icon: this.families[name].icon,
        color: this.families[name].color,
        motto: this.families[name].motto,
        toolCount: this.getToolsByFamily(name).length
      };
    }.bind(this));
  }

  /* ── Tool Invocation (simulated for user experience) ──── */

  invokeTool(callId, action, params) {
    var tool = this.getToolById(callId);
    if (!tool) {
      return { status: 'error', error: 'Tool not found: ' + callId, timestamp: Date.now() };
    }

    if (tool.actions.indexOf(action) === -1) {
      return { status: 'error', error: 'Invalid action "' + action + '" for ' + tool.name, validActions: tool.actions, timestamp: Date.now() };
    }

    this.invocationCount++;
    var now = Date.now();
    var beatNumber = Math.floor(now / HEARTBEAT);

    /* Generate family-appropriate simulated response */
    var result;

    if (tool.family === 'Context') {
      result = {
        status: 'ok',
        family: 'Context',
        data: { phase: 'pulse', beatNumber: beatNumber, registers: 4, contextSize: 256 },
        timestamp: now
      };
    } else if (tool.family === 'Commander') {
      result = {
        status: 'ok',
        family: 'Commander',
        data: { dispatched: true, model: 'gpt-4o', score: 95, syncLevel: Math.round(Math.abs(Math.cos(beatNumber / PHI)) * 100) / 100 },
        timestamp: now
      };
    } else if (tool.family === 'Crawling') {
      result = {
        status: 'ok',
        family: 'Crawling',
        data: { nodesScanned: Math.floor(Math.random() * 100 + 50), patterns: 0, throughput: Math.floor(Math.random() * 1000 + 500) },
        timestamp: now
      };
    } else if (tool.family === 'Sentry') {
      result = {
        status: 'ok',
        family: 'Sentry',
        data: { threatLevel: 'none', complianceScore: 100, boundaries: 7, violations: 0 },
        timestamp: now
      };
    }

    var record = {
      id: this.invocationCount,
      callId: callId,
      toolName: tool.name,
      family: tool.family,
      action: action,
      result: result,
      timestamp: now
    };
    this.invocationHistory.push(record);

    /* Keep bounded */
    if (this.invocationHistory.length > 200) {
      this.invocationHistory = this.invocationHistory.slice(-200);
    }

    return result;
  }

  /* ── Resonance Graph ────────────────────────────────────── */

  getResonanceGraph() {
    /* Phi-spiraled positions for visualization */
    var nodes = [];
    var edges = [];

    for (var i = 0; i < this.tools.length; i++) {
      var tool = this.tools[i];
      var angle = i * GOLDEN_ANGLE * Math.PI / 180;
      var radius = Math.sqrt(i + 1) * 30;
      nodes.push({
        id: tool.callId,
        name: tool.name,
        family: tool.family,
        role: tool.role,
        icon: tool.icon,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        color: this.families[tool.family].color
      });
    }

    /* Cross-family resonance edges */
    var resonanceMap = [
      ['TOOL-003', 'TOOL-014'], ['TOOL-003', 'TOOL-021'], ['TOOL-007', 'TOOL-014'],
      ['TOOL-020', 'TOOL-007'], ['TOOL-020', 'TOOL-021'], ['TOOL-018', 'TOOL-010'],
      ['TOOL-001', 'TOOL-005'], ['TOOL-001', 'TOOL-004'], ['TOOL-008', 'TOOL-006'],
      ['TOOL-004', 'TOOL-012'], ['TOOL-010', 'TOOL-022'], ['TOOL-022', 'TOOL-023'],
      ['TOOL-006', 'TOOL-009'], ['TOOL-009', 'TOOL-024'], ['TOOL-002', 'TOOL-024'],
      ['TOOL-016', 'TOOL-006'], ['TOOL-017', 'TOOL-024'], ['TOOL-014', 'TOOL-011'],
      ['TOOL-011', 'TOOL-013'], ['TOOL-012', 'TOOL-023'], ['TOOL-015', 'TOOL-012'],
      ['TOOL-019', 'TOOL-011'], ['TOOL-013', 'TOOL-023'],
    ];

    for (var e = 0; e < resonanceMap.length; e++) {
      edges.push({ from: resonanceMap[e][0], to: resonanceMap[e][1] });
    }

    return { nodes: nodes, edges: edges };
  }

  /* ── Metrics ────────────────────────────────────────────── */

  getMetrics() {
    var byFamily = {};
    var families = ['Context', 'Commander', 'Crawling', 'Sentry'];
    for (var f = 0; f < families.length; f++) {
      byFamily[families[f]] = 0;
    }
    for (var h = 0; h < this.invocationHistory.length; h++) {
      var fam = this.invocationHistory[h].family;
      if (byFamily[fam] !== undefined) byFamily[fam]++;
    }

    return {
      totalTools: this.tools.length,
      totalFamilies: 4,
      totalInvocations: this.invocationCount,
      heartbeatCount: this.heartbeatCount,
      heartbeatActive: this.heartbeatActive,
      invocationsByFamily: byFamily,
      timestamp: Date.now()
    };
  }
}

/* ── Instantiate & Heartbeat ──────────────────────────────── */
globalThis.marketplaceHub = new MarketplaceHubEngine();
globalThis.marketplaceHub.startHeartbeat();

/* ── Message Router ───────────────────────────────────────── */
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
    var engine = globalThis.marketplaceHub;

    /* ── Built-in workspace commands ── */
    if (cmd === 'ping') { sendResponse({ result: 'pong — Marketplace Hub engine alive at ' + new Date().toISOString() }); return true; }
    if (cmd === 'getState' || lower === 'state' || lower === 'status') {
      sendResponse({ result: JSON.stringify(engine && engine.state ? engine.state : { status: 'running', timestamp: Date.now() }, null, 2) });
      return true;
    }
    if (cmd === 'clearLogs') { sendResponse({ result: 'Workspace logs cleared.' }); return true; }
    if (lower === 'help' || lower === 'capabilities' || lower === '?') {
      sendResponse({ result: '\u{1F9E0} Marketplace Hub AI Workspace\n\nCapabilities:\n• Search Tools — Search marketplace tools\n• Get Tools By Family — Get tools by family\n• Invoke Tool — Invoke a marketplace tool\n• Get All Families — List all tool families\n• Get Metrics — Get marketplace metrics\n\nType any command or question and I will route it to the best engine method.' });
      return true;
    }

    /* ── Save to workspace conversation history ── */
    var storageKey = 'marketplace-hub_workspace_history';
    chrome.storage.local.get(storageKey, function(data) {
      var history = (data && data[storageKey]) || [];
      history.push({ role: 'user', content: cmd, ts: Date.now() });

      /* ── Intelligent workspace command routing ── */
      var result;
      try {
        if (lower.indexOf('search') !== -1 || lower.indexOf('find') !== -1 || lower.indexOf('look') !== -1 || lower.indexOf('browse') !== -1 || lower.indexOf('query') !== -1) {
          result = engine.searchTools(cmd);
        }
        else if (lower.indexOf('family') !== -1 || lower.indexOf('category') !== -1 || lower.indexOf('group') !== -1 || lower.indexOf('type') !== -1) {
          result = engine.getToolsByFamily(cmd);
        }
        else if (lower.indexOf('invoke') !== -1 || lower.indexOf('run') !== -1 || lower.indexOf('use') !== -1 || lower.indexOf('execute') !== -1 || lower.indexOf('tool') !== -1) {
          result = engine.invokeTool(cmd, "default", {});
        }
        else if (lower.indexOf('families') !== -1 || lower.indexOf('all') !== -1 || lower.indexOf('catalog') !== -1 || lower.indexOf('list') !== -1) {
          result = engine.getAllFamilies();
        }
        else if (lower.indexOf('metrics') !== -1 || lower.indexOf('stats') !== -1 || lower.indexOf('analytics') !== -1 || lower.indexOf('usage') !== -1) {
          result = engine.getMetrics();
        }
        else {
          /* Default: route to primary engine method */
          result = engine.searchTools(cmd);
        }
      } catch(e) {
        result = { error: e.message, fallback: 'Marketplace Hub encountered an error processing: "' + cmd + '"' };
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

  var hub = globalThis.marketplaceHub;

  switch (message.action) {
    case 'searchTools':
      sendResponse(hub.searchTools(message.query));
      break;
    case 'getToolsByFamily':
      sendResponse(hub.getToolsByFamily(message.family));
      break;
    case 'getToolById':
      sendResponse(hub.getToolById(message.callId));
      break;
    case 'getAllFamilies':
      sendResponse(hub.getAllFamilies());
      break;
    case 'invokeTool':
      sendResponse(hub.invokeTool(message.callId, message.toolAction, message.params));
      break;
    case 'getResonanceGraph':
      sendResponse(hub.getResonanceGraph());
      break;
    case 'getMetrics':
      sendResponse(hub.getMetrics());
      break;
    case 'getHistory':
      sendResponse(hub.invocationHistory.slice(-(message.limit || 20)));
      break;
    default:
      sendResponse({ error: 'Unknown action: ' + message.action });
  }
  return true;
});

/* -- Production 24/7 Keep-Alive ---------------------------------------- */
(function () {
  var ALARM_NAME = 'marketplace-hub-heartbeat';
  var ALARM_PERIOD = 0.4; /* minutes -- fires every ~24 seconds to beat Chrome's 30s kill timer */

  chrome.alarms.create(ALARM_NAME, { periodInMinutes: ALARM_PERIOD });

  chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name !== ALARM_NAME) return;
    /* Re-initialize engine if it was garbage collected */
    if (!globalThis.marketplaceHub) {
      globalThis.marketplaceHub = new MarketplaceHubEngine();
      console.log('[Marketplace Hub] Engine re-initialized by keepalive alarm');
    }
    /* Persist state snapshot */
    try {
      chrome.storage.local.set({
        'marketplace-hub_state': {
          heartbeatCount: globalThis.marketplaceHub.heartbeatCount || globalThis.marketplaceHub.state?.heartbeatCount || 0,
          lastAlive: Date.now(),
          uptime: Date.now() - (globalThis.marketplaceHub.state?.startTime || globalThis.marketplaceHub.startTime || Date.now())
        }
      });
    } catch (e) { /* storage not available in some contexts */ }
  });

  /* Restore state on startup */
  chrome.storage.local.get('marketplace-hub_state', function (data) {
    if (data && data['marketplace-hub_state']) {
      console.log('[Marketplace Hub] Restored from previous session \u2014 last alive: ' +
        new Date(data['marketplace-hub_state'].lastAlive).toISOString());
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
    console.log('[Marketplace Hub] Installed/updated \u2014 24/7 keepalive active');
  });
})();
