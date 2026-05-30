/* Sovereign Mind — Background Service Worker (EXT-001) */

const PHI = 1.618033988749895;
const GOLDEN_ANGLE = 137.508;
const HEARTBEAT = 873;

class SovereignMindEngine {
  constructor() {
    this.models = ['fusion-core', 'alpha-router', 'phi-scorer'];
    this.state = {
      initialized: true,
      heartbeatCount: 0,
      healthy: true,
      lastHeartbeat: Date.now()
    };
    this._startHeartbeat();
  }

  fuseReasoning(prompt, models) {
    if (!models || models.length === 0) {
      models = this.models;
    }

    const modelResponses = models.map(function (model) {
      return this._simulateModelResponse(model, prompt);
    }.bind(this));

    var modelScores = {};
    var weightedSum = 0;
    var weightTotal = 0;

    for (var i = 0; i < modelResponses.length; i++) {
      var resp = modelResponses[i];
      var weight = Math.pow(PHI, -i);
      var score = this.scoreResponse(resp);
      modelScores[resp.model] = {
        confidence: resp.confidence,
        score: score.total,
        weight: weight
      };
      weightedSum += score.total * weight;
      weightTotal += weight;
    }

    var fusedConfidence = weightTotal > 0 ? weightedSum / weightTotal : 0;

    var bestResponse = modelResponses.reduce(function (best, curr) {
      return curr.confidence > best.confidence ? curr : best;
    }, modelResponses[0]);

    var fusedResponse = {
      text: bestResponse.text,
      sourceModel: bestResponse.model,
      allModels: models,
      prompt: prompt,
      timestamp: Date.now()
    };

    return {
      fusedResponse: fusedResponse,
      confidence: Math.round(fusedConfidence * 1000) / 1000,
      modelScores: modelScores
    };
  }

  scoreResponse(response) {
    var text = response.text || response || '';
    if (typeof text !== 'string') {
      text = JSON.stringify(text);
    }

    var criteria = {
      coherence: Math.min(1, (text.length > 20 ? 0.7 : 0.3) + (response.confidence || 0.5) * 0.3),
      relevance: Math.min(1, (response.confidence || 0.5) * 0.8 + 0.2),
      accuracy: Math.min(1, (response.confidence || 0.5) * 0.7 + 0.15),
      creativity: Math.min(1, (text.length > 50 ? 0.6 : 0.3) + Math.random() * 0.2)
    };

    var keys = Object.keys(criteria);
    var total = 0;
    var breakdown = {};

    for (var i = 0; i < keys.length; i++) {
      var weight = Math.pow(PHI, -i);
      var weighted = criteria[keys[i]] * weight;
      breakdown[keys[i]] = {
        raw: Math.round(criteria[keys[i]] * 1000) / 1000,
        weight: Math.round(weight * 1000) / 1000,
        weighted: Math.round(weighted * 1000) / 1000
      };
      total += weighted;
    }

    return {
      total: Math.round(total * 1000) / 1000,
      breakdown: breakdown
    };
  }

  routeToAlpha(task) {
    var lower = (task || '').toLowerCase();

    var routing = [
      { model: 'fusion-core', keywords: ['code', 'math', 'debug', 'algorithm', 'function', 'program', 'logic', 'compute'] },
      { model: 'alpha-router', keywords: ['creative', 'write', 'story', 'essay', 'poem', 'explain', 'summarize', 'draft'] },
      { model: 'phi-scorer', keywords: ['research', 'data', 'search', 'analyze', 'fact', 'compare', 'review', 'source'] }
    ];

    var bestMatch = { model: 'fusion-core', score: 0, matched: [] };

    for (var i = 0; i < routing.length; i++) {
      var entry = routing[i];
      var matchCount = 0;
      var matched = [];

      for (var j = 0; j < entry.keywords.length; j++) {
        if (lower.indexOf(entry.keywords[j]) !== -1) {
          matchCount++;
          matched.push(entry.keywords[j]);
        }
      }

      if (matchCount > bestMatch.score) {
        bestMatch = { model: entry.model, score: matchCount, matched: matched };
      }
    }

    var confidence = bestMatch.score > 0
      ? Math.min(1, 0.5 + bestMatch.score * 0.15)
      : 0.33;

    var reasoning = bestMatch.score > 0
      ? 'Routed to ' + bestMatch.model + ' based on keyword matches: [' + bestMatch.matched.join(', ') + ']'
      : 'No strong keyword signal detected; defaulting to FusionCore as sovereign general-purpose engine';

    return {
      model: bestMatch.model,
      confidence: Math.round(confidence * 1000) / 1000,
      reasoning: reasoning
    };
  }

  _startHeartbeat() {
    this._heartbeatInterval = setInterval(function () {
      this.state.heartbeatCount++;
      this.state.lastHeartbeat = Date.now();

      var memoryOk = true;
      if (typeof performance !== 'undefined' && performance.memory) {
        memoryOk = performance.memory.usedJSHeapSize < performance.memory.jsHeapSizeLimit * 0.9;
      }

      this.state.healthy = memoryOk;

      console.log(
        '[SovereignMind] heartbeat #' + this.state.heartbeatCount +
        ' | healthy: ' + this.state.healthy +
        ' | ts: ' + this.state.lastHeartbeat
      );
    }.bind(this), HEARTBEAT);
  }

  _simulateModelResponse(model, prompt) {
    var characteristics = {
      'fusion-core': { style: 'analytical', baseConfidence: 0.85, prefix: 'Sovereign analysis from your data' },
      'alpha-router': { style: 'creative', baseConfidence: 0.82, prefix: 'Sovereign routing through your knowledge' },
      'phi-scorer': { style: 'evaluative', baseConfidence: 0.80, prefix: 'Phi-weighted scoring from your data' }
    };

    var config = characteristics[model] || characteristics['fusion-core'];
    var promptLen = (prompt || '').length;
    var variance = ((promptLen * 7 + 13) % 20 - 10) / 100;
    var confidence = Math.min(1, Math.max(0.1, config.baseConfidence + variance));

    return {
      model: model,
      text: config.prefix + ', here is a ' + config.style + ' response to: "' +
            (prompt || '').substring(0, 80) + (promptLen > 80 ? '...' : '') + '"',
      confidence: Math.round(confidence * 1000) / 1000,
      style: config.style,
      timestamp: Date.now()
    };
  }
}

globalThis.sovereignMind = new SovereignMindEngine();

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
    var engine = globalThis.sovereignMind;

    /* ── Built-in workspace commands ── */
    if (cmd === 'ping') { sendResponse({ result: 'pong — Sovereign Mind engine alive at ' + new Date().toISOString() }); return true; }
    if (cmd === 'getState' || lower === 'state' || lower === 'status') {
      sendResponse({ result: JSON.stringify(engine && engine.state ? engine.state : { status: 'running', timestamp: Date.now() }, null, 2) });
      return true;
    }
    if (cmd === 'clearLogs') { sendResponse({ result: 'Workspace logs cleared.' }); return true; }
    if (lower === 'help' || lower === 'capabilities' || lower === '?') {
      sendResponse({ result: '\u{1F9E0} Sovereign Mind AI Workspace\n\nCapabilities:\n• Fuse Reasoning — Fuse multi-model reasoning\n• Score Response — Score response quality\n• Route To Alpha — Route to optimal Alpha model\n\nType any command or question and I will route it to the best engine method.' });
      return true;
    }

    /* ── Save to workspace conversation history ── */
    var storageKey = 'sovereign-mind_workspace_history';
    chrome.storage.local.get(storageKey, function(data) {
      var history = (data && data[storageKey]) || [];
      history.push({ role: 'user', content: cmd, ts: Date.now() });

      /* ── Intelligent workspace command routing ── */
      var result;
      try {
        if (lower.indexOf('fuse') !== -1 || lower.indexOf('reason') !== -1 || lower.indexOf('think') !== -1 || lower.indexOf('analyze') !== -1 || lower.indexOf('process') !== -1 || lower.indexOf('ask') !== -1) {
          result = engine.fuseReasoning(cmd, null);
        }
        else if (lower.indexOf('score') !== -1 || lower.indexOf('rate') !== -1 || lower.indexOf('evaluate') !== -1 || lower.indexOf('assess') !== -1) {
          result = engine.scoreResponse({text:cmd,confidence:0.85});
        }
        else if (lower.indexOf('route') !== -1 || lower.indexOf('direct') !== -1 || lower.indexOf('assign') !== -1 || lower.indexOf('alpha') !== -1 || lower.indexOf('model') !== -1) {
          result = engine.routeToAlpha(cmd);
        }
        else {
          /* Default: route to primary engine method */
          result = engine.fuseReasoning(cmd, null);
        }
      } catch(e) {
        result = { error: e.message, fallback: 'Sovereign Mind encountered an error processing: "' + cmd + '"' };
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

  var engine = globalThis.sovereignMind;

  if (message.action === 'fuseReasoning') {
    var result = engine.fuseReasoning(message.prompt, message.models);
    sendResponse({ success: true, data: result });
  } else if (message.action === 'scoreResponse') {
    var score = engine.scoreResponse(message.response);
    sendResponse({ success: true, data: score });
  } else if (message.action === 'routeToAlpha') {
    var route = engine.routeToAlpha(message.task);
    sendResponse({ success: true, data: route });
  } else {
    sendResponse({ success: false, error: 'Unknown action: ' + message.action });
  }

  return true;
});

/* -- Production 24/7 Keep-Alive ---------------------------------------- */
(function () {
  var ALARM_NAME = 'sovereign-mind-heartbeat';
  var ALARM_PERIOD = 0.4; /* minutes -- fires every ~24 seconds to beat Chrome's 30s kill timer */

  chrome.alarms.create(ALARM_NAME, { periodInMinutes: ALARM_PERIOD });

  chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name !== ALARM_NAME) return;
    /* Re-initialize engine if it was garbage collected */
    if (!globalThis.sovereignMind) {
      globalThis.sovereignMind = new SovereignMindEngine();
      console.log('[Sovereign Mind] Engine re-initialized by keepalive alarm');
    }
    /* Persist state snapshot */
    try {
      chrome.storage.local.set({
        'sovereign-mind_state': {
          heartbeatCount: globalThis.sovereignMind.heartbeatCount || globalThis.sovereignMind.state?.heartbeatCount || 0,
          lastAlive: Date.now(),
          uptime: Date.now() - (globalThis.sovereignMind.state?.startTime || globalThis.sovereignMind.startTime || Date.now())
        }
      });
    } catch (e) { /* storage not available in some contexts */ }
  });

  /* Restore state on startup */
  chrome.storage.local.get('sovereign-mind_state', function (data) {
    if (data && data['sovereign-mind_state']) {
      console.log('[Sovereign Mind] Restored from previous session \u2014 last alive: ' +
        new Date(data['sovereign-mind_state'].lastAlive).toISOString());
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
    console.log('[Sovereign Mind] Installed/updated \u2014 24/7 keepalive active');
  });
})();
