/* Windows Copilot Hub — Engine Service (EXT-W001) */

const PHI = 1.618033988749895;
const GOLDEN_ANGLE = 137.508;
const HEARTBEAT = 873;

class WindowsCopilotHubEngine {
  constructor() {
    this.models = {
      gpt: {
        name: 'GPT',
        capabilities: ['reasoning', 'code-generation', 'structured-output', 'math'],
        strengths: ['analytical', 'instruction-following', 'fast-response'],
        baseConfidence: 0.88,
        maxTokens: 128000
      },
      claude: {
        name: 'Claude',
        capabilities: ['creative-writing', 'analysis', 'safety', 'summarization'],
        strengths: ['thoughtful', 'safe-defaults', 'long-context'],
        baseConfidence: 0.85,
        maxTokens: 200000
      },
      gemini: {
        name: 'Gemini',
        capabilities: ['multi-modal', 'search', 'data-analysis', 'research'],
        strengths: ['comprehensive', 'multi-modal', 'real-time-data'],
        baseConfidence: 0.83,
        maxTokens: 1000000
      },
      llama: {
        name: 'Llama',
        capabilities: ['open-reasoning', 'local-inference', 'general-purpose'],
        strengths: ['open-source', 'privacy-first', 'customizable'],
        baseConfidence: 0.80,
        maxTokens: 128000
      }
    };

    this.state = {
      initialized: true,
      heartbeatCount: 0,
      healthy: true,
      lastHeartbeat: Date.now()
    };

    this._heartbeatInterval = null;
    this._startHeartbeat();
  }

  /**
   * Fuse reasoning across all models using phi-weighted scoring.
   * @param {string} prompt - User prompt.
   * @param {string[]} selectedModels - Models to use (defaults to all).
   * @returns {Object} Fused reasoning result.
   */
  fuseReasoning(prompt, selectedModels) {
    var models = selectedModels && selectedModels.length > 0
      ? selectedModels
      : Object.keys(this.models);

    var modelResponses = models.map(function (model) {
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
        weight: Math.round(weight * 1000) / 1000
      };
      weightedSum += score.total * weight;
      weightTotal += weight;
    }

    var fusedConfidence = weightTotal > 0 ? weightedSum / weightTotal : 0;

    var bestResponse = modelResponses.reduce(function (best, curr) {
      return curr.confidence > best.confidence ? curr : best;
    }, modelResponses[0]);

    return {
      fusedResponse: {
        text: bestResponse.text,
        sourceModel: bestResponse.model,
        allModels: models,
        prompt: prompt,
        timestamp: Date.now()
      },
      confidence: Math.round(fusedConfidence * 1000) / 1000,
      modelScores: modelScores,
      platform: 'windows'
    };
  }

  /**
   * Score a response using phi-weighted criteria.
   */
  scoreResponse(response) {
    var text = response.text || response || '';
    if (typeof text !== 'string') text = JSON.stringify(text);

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

    return { total: Math.round(total * 1000) / 1000, breakdown: breakdown };
  }

  /**
   * Route to optimal model based on task keywords.
   */
  routeToAlpha(task) {
    var lower = (task || '').toLowerCase();

    var routing = [
      { model: 'gpt', keywords: ['code', 'math', 'debug', 'algorithm', 'function', 'program', 'logic', 'compute', 'format'] },
      { model: 'claude', keywords: ['creative', 'write', 'story', 'essay', 'explain', 'summarize', 'draft', 'safety', 'review'] },
      { model: 'gemini', keywords: ['search', 'research', 'data', 'analyze', 'fact', 'compare', 'image', 'video', 'multi'] },
      { model: 'llama', keywords: ['local', 'private', 'offline', 'custom', 'fine-tune', 'open', 'edge', 'self-host'] }
    ];

    var bestMatch = { model: 'gpt', score: 0, matched: [] };

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
      : 0.25;

    return {
      model: bestMatch.model,
      confidence: Math.round(confidence * 1000) / 1000,
      reasoning: bestMatch.score > 0
        ? 'Routed to ' + bestMatch.model + ' based on keyword matches: [' + bestMatch.matched.join(', ') + ']'
        : 'No strong keyword signal; defaulting to GPT as general-purpose model',
      platform: 'windows'
    };
  }

  /**
   * Windows-specific: Open Copilot side panel.
   */
  openSidePanel(context) {
    return {
      panel: 'copilot-hub',
      context: context || {},
      models: Object.keys(this.models),
      state: this.state,
      timestamp: Date.now()
    };
  }

  _startHeartbeat() {
    this._heartbeatInterval = setInterval(function () {
      this.state.heartbeatCount++;
      this.state.lastHeartbeat = Date.now();
      this.state.healthy = true;
    }.bind(this), HEARTBEAT);
  }

  _simulateModelResponse(model, prompt) {
    var config = this.models[model] || this.models.gpt;
    var promptLen = (prompt || '').length;
    var variance = ((promptLen * 7 + 13) % 20 - 10) / 100;
    var confidence = Math.min(1, Math.max(0.1, config.baseConfidence + variance));

    return {
      model: model,
      text: config.strengths[0] + ' analysis of: "' +
            (prompt || '').substring(0, 80) + (promptLen > 80 ? '...' : '') + '"',
      confidence: Math.round(confidence * 1000) / 1000,
      timestamp: Date.now()
    };
  }
}

globalThis.windowsCopilotHub = new WindowsCopilotHubEngine();

/* ── Message Router ───────────────────────────────────────── */
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  var hub = globalThis.windowsCopilotHub;

  switch (message.action) {
    case 'fuseReasoning':
      sendResponse(hub.fuseReasoning(message.prompt, message.models));
      break;
    case 'routeToAlpha':
      sendResponse(hub.routeToAlpha(message.task));
      break;
    case 'openSidePanel':
      sendResponse(hub.openSidePanel(message.context));
      break;
    case 'getState':
      sendResponse(hub.state);
      break;
    default:
      sendResponse({ error: 'Unknown action: ' + message.action });
  }
  return true;
});

/* -- Production 24/7 Keep-Alive ---------------------------------------- */
(function () {
  var ALARM_NAME = 'windows-copilot-hub-keepalive';
  var ALARM_PERIOD = 0.4;

  chrome.alarms.create(ALARM_NAME, { periodInMinutes: ALARM_PERIOD });

  chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name !== ALARM_NAME) return;
    if (!globalThis.windowsCopilotHub) {
      globalThis.windowsCopilotHub = new WindowsCopilotHubEngine();
      console.log('[Windows Copilot Hub] Engine re-initialized by keepalive');
    }
    try {
      chrome.storage.local.set({
        'windows-copilot-hub_state': {
          heartbeatCount: globalThis.windowsCopilotHub.state.heartbeatCount,
          healthy: globalThis.windowsCopilotHub.state.healthy,
          lastAlive: Date.now()
        }
      });
    } catch (e) { }
  });

  chrome.runtime.onInstalled.addListener(function () {
    chrome.alarms.create(ALARM_NAME, { periodInMinutes: ALARM_PERIOD });
    console.log('[Windows Copilot Hub] Installed — 24/7 keepalive active');
  });
})();
