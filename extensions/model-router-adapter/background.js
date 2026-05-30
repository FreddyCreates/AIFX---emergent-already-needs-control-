/* Model Router Adapter — Engine Service (EXT-036) */

const PHI = 1.618033988749895;
const GOLDEN_ANGLE = 137.508;
const HEARTBEAT = 873;

class ModelRouterAdapter {
  constructor() {
    this.routes = {
      gpt: {
        name: 'GPT',
        domains: ['code', 'math', 'logic', 'debug', 'algorithm', 'function', 'program', 'compute', 'api', 'structured'],
        baseConfidence: 0.88,
        phiWeight: Math.pow(PHI, 0)
      },
      claude: {
        name: 'Claude',
        domains: ['creative', 'write', 'essay', 'explain', 'summarize', 'draft', 'review', 'ethics', 'long-form', 'analysis'],
        baseConfidence: 0.85,
        phiWeight: Math.pow(PHI, -1)
      },
      gemini: {
        name: 'Gemini',
        domains: ['search', 'research', 'data', 'fact', 'compare', 'image', 'video', 'multimodal', 'realtime', 'web'],
        baseConfidence: 0.83,
        phiWeight: Math.pow(PHI, -2)
      },
      phi: {
        name: 'Phi',
        domains: ['quick', 'simple', 'fast', 'edge', 'local', 'compact', 'brief', 'short', 'offline', 'private'],
        baseConfidence: 0.79,
        phiWeight: Math.pow(PHI, -3)
      },
      llama: {
        name: 'Llama',
        domains: ['open-source', 'custom', 'fine-tune', 'inference', 'batch', 'production', 'deploy', 'scale'],
        baseConfidence: 0.81,
        phiWeight: Math.pow(PHI, -4)
      }
    };

    // Live calibration: feedback adjusts confidence per model
    this.calibration = {};
    for (var k in this.routes) this.calibration[k] = 0;

    this.routeHistory = [];
    this.maxHistory = 200;
    this.totalRoutes = 0;

    this.state = {
      initialized: true,
      heartbeatCount: 0,
      healthy: true,
      lastHeartbeat: Date.now()
    };

    this._startHeartbeat();
    this._loadCalibration();
  }

  /**
   * Route a prompt to the optimal model using phi-weighted domain scoring.
   * @param {string} prompt
   * @returns {{ model, confidence, reasoning, scores, ring }}
   */
  route(prompt) {
    var lower = (prompt || '').toLowerCase();
    var scores = {};

    for (var modelId in this.routes) {
      var route = this.routes[modelId];
      var domainScore = 0;
      var matched = [];

      for (var i = 0; i < route.domains.length; i++) {
        if (lower.indexOf(route.domains[i]) !== -1) {
          // Earlier domains in the list are higher-priority (phi-weighted by position)
          domainScore += Math.pow(PHI, -(i * 0.5));
          matched.push(route.domains[i]);
        }
      }

      var cal = this.calibration[modelId] || 0;
      var confidence = Math.min(1, Math.max(0.1,
        route.baseConfidence + (domainScore > 0 ? domainScore * 0.08 : 0) + cal
      ));

      scores[modelId] = {
        confidence: Math.round(confidence * 1000) / 1000,
        domainScore: Math.round(domainScore * 1000) / 1000,
        matched: matched,
        phiWeight: Math.round(route.phiWeight * 1000) / 1000
      };
    }

    // Pick winner: highest phi-weighted confidence
    var winner = null;
    var winnerScore = -1;
    for (var mid in scores) {
      var phiAdjusted = scores[mid].confidence * this.routes[mid].phiWeight;
      if (phiAdjusted > winnerScore) {
        winnerScore = phiAdjusted;
        winner = mid;
      }
    }

    if (!winner) winner = 'gpt';
    this.totalRoutes++;

    var entry = {
      model: winner,
      prompt: prompt.substring(0, 100),
      confidence: scores[winner].confidence,
      timestamp: Date.now()
    };
    this.routeHistory.unshift(entry);
    if (this.routeHistory.length > this.maxHistory) this.routeHistory.pop();

    return {
      model: winner,
      modelName: this.routes[winner].name,
      confidence: scores[winner].confidence,
      reasoning: scores[winner].matched.length > 0
        ? 'Matched domains: [' + scores[winner].matched.join(', ') + ']'
        : 'No strong domain signal — phi-weighted default to ' + this.routes[winner].name,
      scores: scores,
      totalRoutes: this.totalRoutes,
      ring: 'sovereign'
    };
  }

  /**
   * Compare all models against a prompt — returns full score matrix.
   */
  compare(prompt) {
    var result = this.route(prompt);
    return { winner: result.model, winnerName: result.modelName, matrix: result.scores, ring: 'sovereign' };
  }

  /**
   * Calibrate a model up or down based on user feedback.
   * @param {string} modelId
   * @param {'good'|'bad'} feedback
   */
  calibrate(modelId, feedback) {
    if (!this.routes[modelId]) return { error: 'Unknown model: ' + modelId };
    var delta = feedback === 'good' ? 0.02 : -0.02;
    this.calibration[modelId] = Math.max(-0.3, Math.min(0.3,
      (this.calibration[modelId] || 0) + delta
    ));
    this._saveCalibration();
    return { model: modelId, calibration: this.calibration[modelId], feedback: feedback };
  }

  getRouteHistory(n) {
    return this.routeHistory.slice(0, n || 20);
  }

  getState() {
    return {
      initialized: this.state.initialized,
      heartbeatCount: this.state.heartbeatCount,
      healthy: this.state.healthy,
      totalRoutes: this.totalRoutes,
      calibration: this.calibration,
      models: Object.keys(this.routes)
    };
  }

  _startHeartbeat() {
    setInterval(function () {
      this.state.heartbeatCount++;
      this.state.lastHeartbeat = Date.now();
      this.state.healthy = true;
    }.bind(this), HEARTBEAT);
  }

  _loadCalibration() {
    try {
      chrome.storage.local.get({ 'model-router-adapter_cal': null }, function (data) {
        if (data['model-router-adapter_cal']) {
          this.calibration = data['model-router-adapter_cal'];
        }
      }.bind(this));
    } catch (e) { /* storage unavailable on first load */ }
  }

  _saveCalibration() {
    try {
      chrome.storage.local.set({ 'model-router-adapter_cal': this.calibration });
    } catch (e) { }
  }
}

globalThis.modelRouterAdapter = new ModelRouterAdapter();

/* ── Message Router ───────────────────────────────────────── */
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  var engine = globalThis.modelRouterAdapter;

  switch (message.action) {
    case 'route':
      sendResponse(engine.route(message.prompt));
      break;
    case 'compare':
      sendResponse(engine.compare(message.prompt));
      break;
    case 'calibrate':
      sendResponse(engine.calibrate(message.modelId, message.feedback));
      break;
    case 'getHistory':
      sendResponse(engine.getRouteHistory(message.n));
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
  var ALARM_NAME = 'model-router-adapter-keepalive';
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: 0.4 });
  chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name !== ALARM_NAME) return;
    if (!globalThis.modelRouterAdapter) {
      globalThis.modelRouterAdapter = new ModelRouterAdapter();
    }
    try {
      chrome.storage.local.set({
        'model-router-adapter_state': {
          heartbeatCount: globalThis.modelRouterAdapter.state.heartbeatCount,
          healthy: globalThis.modelRouterAdapter.state.healthy,
          lastAlive: Date.now()
        }
      });
    } catch (e) { }
  });
  chrome.runtime.onInstalled.addListener(function () {
    chrome.alarms.create(ALARM_NAME, { periodInMinutes: 0.4 });
  });
})();
