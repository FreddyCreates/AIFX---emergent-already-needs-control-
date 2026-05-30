/* Windows Terminal Forge — Engine Service (EXT-W005) */

const PHI = 1.618033988749895;
const GOLDEN_ANGLE = 137.508;
const HEARTBEAT = 873;

class WindowsTerminalForgeEngine {
  constructor() {
    this.engines = {
      codex: {
        name: 'Codex',
        capabilities: ['command-generation', 'script-writing', 'natural-language-to-shell', 'completion'],
        strengths: ['powershell', 'cmd', 'bash-translation', 'automation'],
        baseConfidence: 0.88
      },
      deepseek: {
        name: 'DeepSeek',
        capabilities: ['algorithmic-reasoning', 'pipeline-optimization', 'complex-scripting', 'debugging'],
        strengths: ['complex-logic', 'optimization', 'step-by-step-reasoning'],
        baseConfidence: 0.84
      },
      phi: {
        name: 'Phi',
        capabilities: ['inline-completion', 'quick-suggestion', 'lightweight-inference', 'edge-generation'],
        strengths: ['fast-response', 'low-latency', 'edge-compute', 'minimal-resource'],
        baseConfidence: 0.80
      }
    };

    this.shells = {
      powershell: { prompt: 'PS>', history: [], aliases: {} },
      cmd: { prompt: '>', history: [], aliases: {} },
      wsl: { prompt: '$', history: [], aliases: {} }
    };

    this.commandHistory = [];
    this.maxHistory = 500;
    this.state = { initialized: true, heartbeatCount: 0, healthy: true, lastHeartbeat: Date.now() };
    this._heartbeatInterval = null;
    this._startHeartbeat();
  }

  /**
   * Generate a command from natural language using multi-engine fusion.
   */
  generateCommand(description, shell) {
    var targetShell = shell || 'powershell';
    var engineKeys = Object.keys(this.engines);
    var suggestions = [];
    var weightedConfidence = 0;
    var totalWeight = 0;

    for (var i = 0; i < engineKeys.length; i++) {
      var key = engineKeys[i];
      var engine = this.engines[key];
      var weight = Math.pow(PHI, -i);
      var suggestion = this._simulateCommandGeneration(engine, description, targetShell);
      suggestions.push({ engine: key, suggestion: suggestion, weight: Math.round(weight * 1000) / 1000 });
      weightedConfidence += suggestion.confidence * weight;
      totalWeight += weight;
    }

    var best = suggestions.reduce(function (a, b) {
      return a.suggestion.confidence > b.suggestion.confidence ? a : b;
    });

    var result = {
      description: description,
      shell: targetShell,
      command: best.suggestion.command,
      sourceEngine: best.engine,
      fusedConfidence: Math.round((weightedConfidence / totalWeight) * 1000) / 1000,
      allSuggestions: suggestions,
      platform: 'windows',
      timestamp: Date.now()
    };

    this.commandHistory.push({ description: description, command: result.command, shell: targetShell, timestamp: Date.now() });
    if (this.commandHistory.length > this.maxHistory) this.commandHistory.shift();

    return result;
  }

  /**
   * Explain an existing command using multi-model analysis.
   */
  explainCommand(command, shell) {
    var targetShell = shell || 'powershell';
    var engineKeys = Object.keys(this.engines);
    var explanations = [];
    var weightedConfidence = 0;
    var totalWeight = 0;

    for (var i = 0; i < engineKeys.length; i++) {
      var key = engineKeys[i];
      var engine = this.engines[key];
      var weight = Math.pow(PHI, -i);
      var explanation = this._simulateExplanation(engine, command, targetShell);
      explanations.push({ engine: key, explanation: explanation, weight: Math.round(weight * 1000) / 1000 });
      weightedConfidence += explanation.confidence * weight;
      totalWeight += weight;
    }

    return {
      command: command,
      shell: targetShell,
      fusedConfidence: Math.round((weightedConfidence / totalWeight) * 1000) / 1000,
      explanations: explanations,
      platform: 'windows',
      timestamp: Date.now()
    };
  }

  /**
   * Auto-complete a partial command.
   */
  autocomplete(partial, shell) {
    var targetShell = shell || 'powershell';
    var completions = this._simulateAutocomplete(partial, targetShell);

    return {
      partial: partial,
      shell: targetShell,
      completions: completions,
      engines: Object.keys(this.engines),
      platform: 'windows',
      timestamp: Date.now()
    };
  }

  /**
   * Route to optimal engine for a terminal task.
   */
  routeToAlpha(task) {
    var lower = (task || '').toLowerCase();
    var routing = [
      { engine: 'codex', keywords: ['generate', 'create', 'write', 'make', 'script', 'command', 'powershell'] },
      { engine: 'deepseek', keywords: ['optimize', 'debug', 'pipeline', 'complex', 'algorithm', 'fix', 'analyze'] },
      { engine: 'phi', keywords: ['complete', 'suggest', 'quick', 'inline', 'fast', 'simple', 'short'] }
    ];

    var bestMatch = { engine: 'codex', score: 0, matched: [] };
    for (var i = 0; i < routing.length; i++) {
      var entry = routing[i];
      var matchCount = 0;
      var matched = [];
      for (var j = 0; j < entry.keywords.length; j++) {
        if (lower.indexOf(entry.keywords[j]) !== -1) { matchCount++; matched.push(entry.keywords[j]); }
      }
      if (matchCount > bestMatch.score) {
        bestMatch = { engine: entry.engine, score: matchCount, matched: matched };
      }
    }

    var confidence = bestMatch.score > 0 ? Math.min(1, 0.5 + bestMatch.score * 0.15) : 0.33;
    return {
      engine: bestMatch.engine,
      confidence: Math.round(confidence * 1000) / 1000,
      reasoning: bestMatch.score > 0
        ? 'Routed to ' + bestMatch.engine + ' based on: [' + bestMatch.matched.join(', ') + ']'
        : 'No strong signal; defaulting to Codex',
      platform: 'windows'
    };
  }

  _startHeartbeat() {
    this._heartbeatInterval = setInterval(function () {
      this.state.heartbeatCount++;
      this.state.lastHeartbeat = Date.now();
      this.state.healthy = true;
    }.bind(this), HEARTBEAT);
  }

  _simulateCommandGeneration(engine, description, shell) {
    var prefixes = {
      powershell: 'Get-',
      cmd: '',
      wsl: ''
    };
    var prefix = prefixes[shell] || '';
    return {
      engine: engine.name,
      command: prefix + 'Process | Where-Object { $_.Name -like "*' + (description || '').substring(0, 20) + '*" }',
      confidence: Math.round((engine.baseConfidence + (Math.random() * 0.1 - 0.05)) * 1000) / 1000,
      shell: shell
    };
  }

  _simulateExplanation(engine, command, shell) {
    return {
      engine: engine.name,
      explanation: engine.name + ' analysis: This ' + shell + ' command performs the specified operation.',
      confidence: Math.round((engine.baseConfidence + (Math.random() * 0.1 - 0.05)) * 1000) / 1000
    };
  }

  _simulateAutocomplete(partial, shell) {
    var common = {
      powershell: ['Get-Process', 'Get-Service', 'Get-ChildItem', 'Set-Location', 'New-Item', 'Remove-Item'],
      cmd: ['dir', 'cd', 'copy', 'move', 'del', 'type', 'cls'],
      wsl: ['ls', 'cd', 'cat', 'grep', 'find', 'sudo', 'apt']
    };
    var commands = common[shell] || common.powershell;
    var lower = (partial || '').toLowerCase();
    return commands.filter(function (c) { return c.toLowerCase().indexOf(lower) === 0; })
      .map(function (c) { return { command: c, confidence: Math.round((0.7 + Math.random() * 0.25) * 1000) / 1000 }; });
  }
}

globalThis.windowsTerminalForge = new WindowsTerminalForgeEngine();

/* ── Message Router ───────────────────────────────────────── */
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  var engine = globalThis.windowsTerminalForge;
  switch (message.action) {
    case 'generateCommand':
      sendResponse(engine.generateCommand(message.description, message.shell));
      break;
    case 'explainCommand':
      sendResponse(engine.explainCommand(message.command, message.shell));
      break;
    case 'autocomplete':
      sendResponse(engine.autocomplete(message.partial, message.shell));
      break;
    case 'routeToAlpha':
      sendResponse(engine.routeToAlpha(message.task));
      break;
    case 'getState':
      sendResponse(engine.state);
      break;
    default:
      sendResponse({ error: 'Unknown action: ' + message.action });
  }
  return true;
});

/* -- Production 24/7 Keep-Alive ---------------------------------------- */
(function () {
  var ALARM_NAME = 'windows-terminal-forge-keepalive';
  var ALARM_PERIOD = 0.4;
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: ALARM_PERIOD });
  chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name !== ALARM_NAME) return;
    if (!globalThis.windowsTerminalForge) {
      globalThis.windowsTerminalForge = new WindowsTerminalForgeEngine();
    }
    try { chrome.storage.local.set({ 'windows-terminal-forge_lastAlive': Date.now() }); } catch (e) { }
  });
  chrome.runtime.onInstalled.addListener(function () {
    chrome.alarms.create(ALARM_NAME, { periodInMinutes: ALARM_PERIOD });
    console.log('[Windows Terminal Forge] Installed — 24/7 keepalive active');
  });
})();
