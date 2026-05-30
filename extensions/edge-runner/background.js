/* Edge Runner — Background Service Worker (EXT-014) */

const PHI = 1.618033988749895;
const GOLDEN_ANGLE = 137.508;
const HEARTBEAT = 873;

class EdgeRunnerEngine {
  constructor() {
    this.models = {
      phi: {
        name: 'Phi',
        sizeGB: 2.7,
        maxTokens: 2048,
        latencyBase: 45,
        strengths: ['reasoning', 'code', 'math'],
        memoryRequiredMB: 3000
      },
      gemma: {
        name: 'Gemma',
        sizeGB: 5.0,
        maxTokens: 8192,
        latencyBase: 65,
        strengths: ['general', 'instruction', 'conversation'],
        memoryRequiredMB: 5500
      },
      dbrx: {
        name: 'DBRX',
        sizeGB: 36.0,
        maxTokens: 32768,
        latencyBase: 120,
        strengths: ['enterprise', 'data', 'analysis', 'long-context'],
        memoryRequiredMB: 40000
      }
    };

    this.inferenceCache = {};
    this.benchmarkResults = null;
  }

  inferLocal(prompt, model) {
    if (model === undefined) model = 'phi';

    var config = this.models[model];
    if (!config) {
      return { error: 'Unknown model: ' + model, available: Object.keys(this.models) };
    }

    var inputTokens = Math.ceil((prompt || '').split(/\s+/).length * 1.3);
    var outputTokens = Math.min(config.maxTokens, Math.max(50, Math.round(inputTokens * PHI)));

    var latency = this.estimateLatency(config.sizeGB, inputTokens);
    var cached = this._checkCache(prompt);
    if (cached) {
      return {
        result: cached.result,
        model: model,
        cached: true,
        latencyMs: 1,
        tokens: { input: inputTokens, output: cached.outputTokens },
        timestamp: Date.now()
      };
    }

    var simulatedOutput = 'Local inference result from ' + config.name +
      ' model for: "' + (prompt || '').substring(0, 80) + '"';

    var record = {
      result: simulatedOutput,
      model: model,
      modelName: config.name,
      cached: false,
      tokens: { input: inputTokens, output: outputTokens },
      latency: latency,
      offline: true,
      timestamp: Date.now()
    };

    this.cacheInference(prompt, record);
    return record;
  }

  estimateLatency(modelSize, inputTokens) {
    var sizeGB = typeof modelSize === 'number' ? modelSize : 2.7;
    var tokens = inputTokens || 100;

    var sizeFactor = Math.pow(sizeGB / 2.7, PHI * 0.5);
    var tokenFactor = Math.log(tokens + 1) / Math.log(PHI * 10);
    var baseLatency = HEARTBEAT * 0.1;

    var totalMs = baseLatency * sizeFactor * tokenFactor;

    return {
      estimatedMs: Math.round(totalMs),
      tokensPerSecond: Math.round((tokens / totalMs) * 1000),
      factors: {
        sizeFactor: Math.round(sizeFactor * 1000) / 1000,
        tokenFactor: Math.round(tokenFactor * 1000) / 1000,
        baseLatency: Math.round(baseLatency)
      }
    };
  }

  selectOptimalModel(taskComplexity, availableMemory) {
    var complexity = taskComplexity || 0.5;
    var memoryMB = availableMemory || 8000;

    var candidates = [];
    var modelKeys = Object.keys(this.models);

    for (var i = 0; i < modelKeys.length; i++) {
      var key = modelKeys[i];
      var config = this.models[key];

      if (config.memoryRequiredMB > memoryMB) continue;

      var complexityFit = 1 - Math.abs(complexity - (config.sizeGB / 36));
      var efficiencyScore = complexityFit / config.sizeGB;
      var phiScore = efficiencyScore * Math.pow(PHI, -i * 0.5);

      candidates.push({
        model: key,
        name: config.name,
        sizeGB: config.sizeGB,
        memoryMB: config.memoryRequiredMB,
        complexityFit: Math.round(complexityFit * 1000) / 1000,
        efficiencyScore: Math.round(efficiencyScore * 10000) / 10000,
        phiScore: Math.round(phiScore * 10000) / 10000,
        fitsMemory: true
      });
    }

    if (candidates.length === 0) {
      return {
        error: 'No model fits available memory: ' + memoryMB + 'MB',
        minimumRequired: this.models.phi.memoryRequiredMB
      };
    }

    candidates.sort(function (a, b) { return b.phiScore - a.phiScore; });

    return {
      selected: candidates[0].model,
      selectedName: candidates[0].name,
      candidates: candidates,
      taskComplexity: complexity,
      availableMemory: memoryMB,
      reasoning: 'Selected ' + candidates[0].name + ' (phi-score: ' + candidates[0].phiScore + ')',
      timestamp: Date.now()
    };
  }

  cacheInference(prompt, result, ttl) {
    if (ttl === undefined) ttl = HEARTBEAT * 100;

    var key = this._hashPrompt(prompt);
    this.inferenceCache[key] = {
      result: result.result || result,
      outputTokens: (result.tokens && result.tokens.output) || 0,
      cachedAt: Date.now(),
      ttl: ttl,
      expiresAt: Date.now() + ttl
    };

    this._pruneCache();

    return {
      cached: true,
      key: key,
      ttl: ttl,
      expiresAt: this.inferenceCache[key].expiresAt,
      cacheSize: Object.keys(this.inferenceCache).length
    };
  }

  benchmarkModels() {
    var testPrompts = [
      'What is 2 + 2?',
      'Explain the theory of relativity in simple terms.',
      'Write a function to sort an array using quicksort.',
      'Analyze the economic impact of renewable energy adoption.',
      'Summarize the key findings from recent quantum computing research.'
    ];

    var modelKeys = Object.keys(this.models);
    var benchmarks = {};

    for (var m = 0; m < modelKeys.length; m++) {
      var modelKey = modelKeys[m];
      var config = this.models[modelKey];
      var totalLatency = 0;
      var totalThroughput = 0;

      for (var p = 0; p < testPrompts.length; p++) {
        var tokens = testPrompts[p].split(/\s+/).length;
        var latency = this.estimateLatency(config.sizeGB, tokens);
        totalLatency += latency.estimatedMs;
        totalThroughput += latency.tokensPerSecond;
      }

      var avgLatency = totalLatency / testPrompts.length;
      var avgThroughput = totalThroughput / testPrompts.length;

      var performanceIndex = (avgThroughput / avgLatency) * Math.pow(PHI, -(m * 0.3));

      benchmarks[modelKey] = {
        name: config.name,
        avgLatencyMs: Math.round(avgLatency),
        avgThroughput: Math.round(avgThroughput),
        sizeGB: config.sizeGB,
        memoryMB: config.memoryRequiredMB,
        performanceIndex: Math.round(performanceIndex * 10000) / 10000,
        grade: performanceIndex > 1 ? 'A' : performanceIndex > 0.5 ? 'B' : performanceIndex > 0.2 ? 'C' : 'D'
      };
    }

    var sorted = Object.keys(benchmarks).sort(function (a, b) {
      return benchmarks[b].performanceIndex - benchmarks[a].performanceIndex;
    });

    this.benchmarkResults = {
      models: benchmarks,
      ranking: sorted,
      testCount: testPrompts.length,
      bestModel: sorted[0],
      timestamp: Date.now()
    };

    return this.benchmarkResults;
  }

  _checkCache(prompt) {
    var key = this._hashPrompt(prompt);
    var entry = this.inferenceCache[key];
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      delete this.inferenceCache[key];
      return null;
    }
    return entry;
  }

  _pruneCache() {
    var now = Date.now();
    var keys = Object.keys(this.inferenceCache);
    for (var i = 0; i < keys.length; i++) {
      if (now > this.inferenceCache[keys[i]].expiresAt) {
        delete this.inferenceCache[keys[i]];
      }
    }
  }

  _hashPrompt(prompt) {
    var hash = 0;
    var str = (prompt || '').substring(0, 200);
    for (var i = 0; i < str.length; i++) {
      var ch = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + ch;
      hash = hash & hash;
    }
    return 'cache-' + Math.abs(hash).toString(36);
  }
}

globalThis.edgeRunner = new EdgeRunnerEngine();

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
    var engine = globalThis.edgeRunner;

    /* ── Built-in workspace commands ── */
    if (cmd === 'ping') { sendResponse({ result: 'pong — Edge Runner engine alive at ' + new Date().toISOString() }); return true; }
    if (cmd === 'getState' || lower === 'state' || lower === 'status') {
      sendResponse({ result: JSON.stringify(engine && engine.state ? engine.state : { status: 'running', timestamp: Date.now() }, null, 2) });
      return true;
    }
    if (cmd === 'clearLogs') { sendResponse({ result: 'Workspace logs cleared.' }); return true; }
    if (lower === 'help' || lower === 'capabilities' || lower === '?') {
      sendResponse({ result: '\u{1F9E0} Edge Runner AI Workspace\n\nCapabilities:\n• Infer Local — Run local AI inference\n• Estimate Latency — Estimate inference latency\n• Select Optimal Model — Select optimal model for task\n• Benchmark Models — Benchmark available models\n\nType any command or question and I will route it to the best engine method.' });
      return true;
    }

    /* ── Save to workspace conversation history ── */
    var storageKey = 'edge-runner_workspace_history';
    chrome.storage.local.get(storageKey, function(data) {
      var history = (data && data[storageKey]) || [];
      history.push({ role: 'user', content: cmd, ts: Date.now() });

      /* ── Intelligent workspace command routing ── */
      var result;
      try {
        if (lower.indexOf('infer') !== -1 || lower.indexOf('run') !== -1 || lower.indexOf('predict') !== -1 || lower.indexOf('think') !== -1 || lower.indexOf('process') !== -1 || lower.indexOf('ask') !== -1) {
          result = engine.inferLocal(cmd, "phi-2");
        }
        else if (lower.indexOf('latency') !== -1 || lower.indexOf('speed') !== -1 || lower.indexOf('estimate') !== -1 || lower.indexOf('time') !== -1) {
          result = engine.estimateLatency("7B", 512);
        }
        else if (lower.indexOf('model') !== -1 || lower.indexOf('select') !== -1 || lower.indexOf('optimal') !== -1 || lower.indexOf('best') !== -1 || lower.indexOf('choose') !== -1) {
          result = engine.selectOptimalModel(cmd, 8192);
        }
        else if (lower.indexOf('benchmark') !== -1 || lower.indexOf('test') !== -1 || lower.indexOf('compare') !== -1 || lower.indexOf('perf') !== -1) {
          result = engine.benchmarkModels();
        }
        else {
          /* Default: route to primary engine method */
          result = engine.inferLocal(cmd, "phi-2");
        }
      } catch(e) {
        result = { error: e.message, fallback: 'Edge Runner encountered an error processing: "' + cmd + '"' };
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

  var engine = globalThis.edgeRunner;

  switch (message.action) {
    case 'inferLocal':
      sendResponse({ success: true, data: engine.inferLocal(message.prompt, message.model) });
      break;
    case 'estimateLatency':
      sendResponse({ success: true, data: engine.estimateLatency(message.modelSize, message.inputTokens) });
      break;
    case 'selectOptimalModel':
      sendResponse({ success: true, data: engine.selectOptimalModel(message.taskComplexity, message.availableMemory) });
      break;
    case 'cacheInference':
      sendResponse({ success: true, data: engine.cacheInference(message.prompt, message.result, message.ttl) });
      break;
    case 'benchmarkModels':
      sendResponse({ success: true, data: engine.benchmarkModels() });
      break;
    default:
      sendResponse({ success: false, error: 'Unknown action: ' + message.action });
  }

  return true;
});

/* -- Production 24/7 Keep-Alive ---------------------------------------- */
(function () {
  var ALARM_NAME = 'edge-runner-heartbeat';
  var ALARM_PERIOD = 0.4; /* minutes -- fires every ~24 seconds to beat Chrome's 30s kill timer */

  chrome.alarms.create(ALARM_NAME, { periodInMinutes: ALARM_PERIOD });

  chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name !== ALARM_NAME) return;
    /* Re-initialize engine if it was garbage collected */
    if (!globalThis.edgeRunner) {
      globalThis.edgeRunner = new EdgeRunnerEngine();
      console.log('[Edge Runner] Engine re-initialized by keepalive alarm');
    }
    /* Persist state snapshot */
    try {
      chrome.storage.local.set({
        'edge-runner_state': {
          heartbeatCount: globalThis.edgeRunner.heartbeatCount || globalThis.edgeRunner.state?.heartbeatCount || 0,
          lastAlive: Date.now(),
          uptime: Date.now() - (globalThis.edgeRunner.state?.startTime || globalThis.edgeRunner.startTime || Date.now())
        }
      });
    } catch (e) { /* storage not available in some contexts */ }
  });

  /* Restore state on startup */
  chrome.storage.local.get('edge-runner_state', function (data) {
    if (data && data['edge-runner_state']) {
      console.log('[Edge Runner] Restored from previous session \u2014 last alive: ' +
        new Date(data['edge-runner_state'].lastAlive).toISOString());
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
    console.log('[Edge Runner] Installed/updated \u2014 24/7 keepalive active');
  });
})();
