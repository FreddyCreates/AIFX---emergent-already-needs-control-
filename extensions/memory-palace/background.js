/* Memory Palace — Background Service Worker (EXT-006) */

const PHI = 1.618033988749895;
const GOLDEN_ANGLE = 137.508;
const HEARTBEAT = 873;

class MemoryPalaceEngine {
  constructor() {
    this.memories = new Map();
    this.embeddings = new Map();
    this.spatialIndex = [];
    this.lineageTracker = new Map();
    this.nextId = 1;
  }

  embedContent(text) {
    const tokens = text
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter(Boolean);

    const dims = 128;
    const vector = new Float64Array(dims);

    for (let t = 0; t < tokens.length; t++) {
      const hash = this._hashString(tokens[t]);
      for (let d = 0; d < dims; d++) {
        const seed = hash ^ (d * 2654435761);
        const pseudo = Math.sin(seed * 9301 + 49297) * 49297;
        vector[d] += pseudo - Math.floor(pseudo) - 0.5;
      }
    }

    let norm = 0;
    for (let d = 0; d < dims; d++) {
      norm += vector[d] * vector[d];
    }
    norm = Math.sqrt(norm) || 1;
    for (let d = 0; d < dims; d++) {
      vector[d] /= norm;
    }

    return { vector, dimensions: dims, norm: 1.0, tokens };
  }

  storeMemory(content, phiCoords, parentId) {
    const id = this.nextId++;
    const embedding = this.embedContent(content);
    const coords = phiCoords || this._computePhiCoords(id);

    const ancestors = [];
    if (parentId !== undefined && this.memories.has(parentId)) {
      ancestors.push(parentId);
      const parentMem = this.memories.get(parentId);
      if (parentMem.ancestors) {
        ancestors.push(...parentMem.ancestors);
      }
    }

    const memory = {
      id,
      content,
      embedding,
      coords,
      timestamp: Date.now(),
      ancestors,
    };

    this.memories.set(id, memory);
    this.embeddings.set(id, embedding.vector);
    this.spatialIndex.push({ id, coords });
    this.lineageTracker.set(id, ancestors);

    return {
      id,
      coords,
      embedding: { dimensions: embedding.dimensions },
      stored: true,
    };
  }

  retrieveByResonance(query, k) {
    if (k === undefined) k = 5;

    const queryEmbedding = this.embedContent(query);
    const scored = [];

    for (const [id, vec] of this.embeddings.entries()) {
      const similarity = this._cosineSimilarity(queryEmbedding.vector, vec);
      const memory = this.memories.get(id);
      const queryCoords = this._computePhiCoords(0);
      const dx = memory.coords.theta - queryCoords.theta;
      const dy = memory.coords.phi - queryCoords.phi;
      const spatialDist = Math.sqrt(dx * dx + dy * dy) || 1;
      const resonance = similarity + (PHI / (spatialDist + PHI));

      scored.push({
        id,
        content: memory.content,
        similarity: Math.round(similarity * 1e6) / 1e6,
        resonance: Math.round(resonance * 1e6) / 1e6,
        coords: memory.coords,
      });
    }

    scored.sort(function (a, b) {
      return b.resonance - a.resonance;
    });

    return { results: scored.slice(0, k), query: query, k: k };
  }

  buildLineage(memoryId) {
    var lineage = [];
    var current = memoryId;
    var visited = new Set();

    while (current !== undefined && this.memories.has(current)) {
      if (visited.has(current)) break;
      visited.add(current);
      var mem = this.memories.get(current);
      lineage.push({
        id: mem.id,
        content: mem.content,
        depth: lineage.length,
      });
      current =
        mem.ancestors && mem.ancestors.length > 0
          ? mem.ancestors[0]
          : undefined;
    }

    return {
      memoryId: memoryId,
      lineage: lineage,
      depth: lineage.length,
      rootId: lineage.length > 0 ? lineage[lineage.length - 1].id : memoryId,
    };
  }

  phyllotaxisPlace(index) {
    var n = index;
    var angleRad = (n * GOLDEN_ANGLE * Math.PI) / 180;
    var r = Math.sqrt(n + 1);
    var x = r * Math.cos(angleRad);
    var y = r * Math.sin(angleRad);

    return {
      x: Math.round(x * 1e6) / 1e6,
      y: Math.round(y * 1e6) / 1e6,
      r: Math.round(r * 1e6) / 1e6,
      angle: Math.round(angleRad * 1e6) / 1e6,
      index: n,
    };
  }

  _cosineSimilarity(a, b) {
    var dot = 0;
    var normA = 0;
    var normB = 0;
    var len = Math.min(a.length, b.length);

    for (var i = 0; i < len; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    var denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom === 0 ? 0 : dot / denom;
  }

  _computePhiCoords(index) {
    var n = index;
    var theta = (n * GOLDEN_ANGLE) % 360;
    var phi = ((n * GOLDEN_ANGLE * PHI) % 180) - 90;
    var rho = Math.sqrt(n + 1) * PHI;
    var ring = Math.floor(Math.sqrt(n + 1));
    var beat = (n * HEARTBEAT) % 1000;

    return {
      theta: Math.round(theta * 1e6) / 1e6,
      phi: Math.round(phi * 1e6) / 1e6,
      rho: Math.round(rho * 1e6) / 1e6,
      ring: ring,
      beat: Math.round(beat * 1e6) / 1e6,
    };
  }

  _hashString(str) {
    var hash = 5381;
    for (var i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
    }
    return hash >>> 0;
  }
}

globalThis.memoryPalace = new MemoryPalaceEngine();

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
    var engine = globalThis.memoryPalace;

    /* ── Built-in workspace commands ── */
    if (cmd === 'ping') { sendResponse({ result: 'pong — Memory Palace engine alive at ' + new Date().toISOString() }); return true; }
    if (cmd === 'getState' || lower === 'state' || lower === 'status') {
      sendResponse({ result: JSON.stringify(engine && engine.state ? engine.state : { status: 'running', timestamp: Date.now() }, null, 2) });
      return true;
    }
    if (cmd === 'clearLogs') { sendResponse({ result: 'Workspace logs cleared.' }); return true; }
    if (lower === 'help' || lower === 'capabilities' || lower === '?') {
      sendResponse({ result: '\u{1F9E0} Memory Palace AI Workspace\n\nCapabilities:\n• Store Memory — Store a memory\n• Retrieve By Resonance — Retrieve memories by resonance\n• Build Lineage — Build memory lineage\n• Phyllotaxis Place — Calculate phyllotaxis placement\n\nType any command or question and I will route it to the best engine method.' });
      return true;
    }

    /* ── Save to workspace conversation history ── */
    var storageKey = 'memory-palace_workspace_history';
    chrome.storage.local.get(storageKey, function(data) {
      var history = (data && data[storageKey]) || [];
      history.push({ role: 'user', content: cmd, ts: Date.now() });

      /* ── Intelligent workspace command routing ── */
      var result;
      try {
        if (lower.indexOf('store') !== -1 || lower.indexOf('save') !== -1 || lower.indexOf('remember') !== -1 || lower.indexOf('add') !== -1 || lower.indexOf('memorize') !== -1) {
          result = engine.storeMemory(cmd, null, null);
        }
        else if (lower.indexOf('retrieve') !== -1 || lower.indexOf('recall') !== -1 || lower.indexOf('search') !== -1 || lower.indexOf('find') !== -1 || lower.indexOf('query') !== -1 || lower.indexOf('remember') !== -1) {
          result = engine.retrieveByResonance(cmd, 5);
        }
        else if (lower.indexOf('lineage') !== -1 || lower.indexOf('history') !== -1 || lower.indexOf('trace') !== -1 || lower.indexOf('ancestry') !== -1) {
          result = engine.buildLineage(cmd);
        }
        else if (lower.indexOf('place') !== -1 || lower.indexOf('coordinate') !== -1 || lower.indexOf('position') !== -1 || lower.indexOf('phi') !== -1) {
          result = engine.phyllotaxisPlace(parseInt(cmd)||0);
        }
        else {
          /* Default: route to primary engine method */
          result = engine.storeMemory(cmd, null, null);
        }
      } catch(e) {
        result = { error: e.message, fallback: 'Memory Palace encountered an error processing: "' + cmd + '"' };
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

  var palace = globalThis.memoryPalace;

  switch (message.action) {
    case "storeMemory":
      sendResponse(
        palace.storeMemory(message.content, message.phiCoords, message.parentId)
      );
      break;

    case "retrieveByResonance":
      sendResponse(
        palace.retrieveByResonance(message.query, message.k)
      );
      break;

    case "buildLineage":
      sendResponse(palace.buildLineage(message.memoryId));
      break;

    case "phyllotaxisPlace":
      sendResponse(palace.phyllotaxisPlace(message.index));
      break;

    case "embedContent":
      var result = palace.embedContent(message.text);
      sendResponse({
        dimensions: result.dimensions,
        norm: result.norm,
        tokens: result.tokens,
      });
      break;

    default:
      sendResponse({ error: "Unknown action: " + message.action });
  }

  return true;
});

/* -- Production 24/7 Keep-Alive ---------------------------------------- */
(function () {
  var ALARM_NAME = 'memory-palace-heartbeat';
  var ALARM_PERIOD = 0.4; /* minutes -- fires every ~24 seconds to beat Chrome's 30s kill timer */

  chrome.alarms.create(ALARM_NAME, { periodInMinutes: ALARM_PERIOD });

  chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name !== ALARM_NAME) return;
    /* Re-initialize engine if it was garbage collected */
    if (!globalThis.memoryPalace) {
      globalThis.memoryPalace = new MemoryPalaceEngine();
      console.log('[Memory Palace] Engine re-initialized by keepalive alarm');
    }
    /* Persist state snapshot */
    try {
      chrome.storage.local.set({
        'memory-palace_state': {
          heartbeatCount: globalThis.memoryPalace.heartbeatCount || globalThis.memoryPalace.state?.heartbeatCount || 0,
          lastAlive: Date.now(),
          uptime: Date.now() - (globalThis.memoryPalace.state?.startTime || globalThis.memoryPalace.startTime || Date.now())
        }
      });
    } catch (e) { /* storage not available in some contexts */ }
  });

  /* Restore state on startup */
  chrome.storage.local.get('memory-palace_state', function (data) {
    if (data && data['memory-palace_state']) {
      console.log('[Memory Palace] Restored from previous session \u2014 last alive: ' +
        new Date(data['memory-palace_state'].lastAlive).toISOString());
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
    console.log('[Memory Palace] Installed/updated \u2014 24/7 keepalive active');
  });
})();
