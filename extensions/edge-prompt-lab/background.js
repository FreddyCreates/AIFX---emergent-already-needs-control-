/* Edge Prompt Lab — Engine Service (EXT-034) */

const PHI = 1.618033988749895;
const GOLDEN_ANGLE = 137.508;
const HEARTBEAT = 873;

class EdgePromptLabEngine {
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
      llama: {
        name: 'Llama',
        capabilities: ['open-reasoning', 'local-inference', 'general-purpose'],
        strengths: ['open-source', 'privacy-first', 'customizable'],
        baseConfidence: 0.80,
        maxTokens: 128000
      },
      deepseek: {
        name: 'DeepSeek',
        capabilities: ['deep-reasoning', 'chain-of-thought', 'code-analysis'],
        strengths: ['reasoning-depth', 'cost-effective', 'math-strong'],
        baseConfidence: 0.81,
        maxTokens: 64000
      }
    };

    this.templates = [
      { id: 'zero-shot', name: 'Zero-Shot', template: '{prompt}', description: 'Direct prompt with no examples' },
      { id: 'few-shot', name: 'Few-Shot', template: 'Examples:\n{examples}\n\nNow: {prompt}', description: 'Prompt with example demonstrations' },
      { id: 'chain-of-thought', name: 'Chain-of-Thought', template: 'Think step by step.\n\n{prompt}\n\nLet me reason through this:', description: 'Step-by-step reasoning prompt' },
      { id: 'role-play', name: 'Role-Play', template: 'You are {role}.\n\n{prompt}', description: 'Assign a specific role or persona' },
      { id: 'structured', name: 'Structured Output', template: '{prompt}\n\nRespond in JSON format with keys: {keys}', description: 'Request structured JSON output' },
      { id: 'critique', name: 'Self-Critique', template: '{prompt}\n\nNow critique your response and provide an improved version.', description: 'Self-evaluation and improvement' }
    ];

    this.state = {
      initialized: true,
      heartbeatCount: 0,
      healthy: true,
      lastHeartbeat: Date.now(),
      testsRun: 0
    };

    this._heartbeatInterval = null;
    this._startHeartbeat();
  }

  /**
   * Test a prompt against multiple models and compare outputs.
   * @param {string} prompt - The prompt to test.
   * @param {string} templateId - Template to apply.
   * @param {string[]} selectedModels - Models to test against.
   * @returns {Object} Comparison result.
   */
  testPrompt(prompt, templateId, selectedModels) {
    var models = selectedModels && selectedModels.length > 0
      ? selectedModels
      : Object.keys(this.models);

    this.state.testsRun++;

    var appliedPrompt = this._applyTemplate(prompt, templateId);

    var results = models.map(function (model) {
      var response = this._simulateModelResponse(model, appliedPrompt);
      var score = this.scoreResponse(response);
      return {
        model: model,
        response: response.text,
        confidence: response.confidence,
        score: score.total,
        breakdown: score.breakdown
      };
    }.bind(this));

    results.sort(function (a, b) { return b.score - a.score; });

    var avgScore = results.reduce(function (sum, r) { return sum + r.score; }, 0) / results.length;

    return {
      prompt: appliedPrompt,
      templateUsed: templateId || 'none',
      results: results,
      averageScore: Math.round(avgScore * 1000) / 1000,
      bestModel: results[0].model,
      timestamp: Date.now(),
      ring: 'build'
    };
  }

  /**
   * Get available prompt templates.
   */
  getTemplates() {
    return {
      templates: this.templates,
      count: this.templates.length
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
      creativity: Math.min(1, (text.length > 50 ? 0.6 : 0.3) + 0.1)
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

  _applyTemplate(prompt, templateId) {
    if (!templateId) return prompt;
    var tmpl = null;
    for (var i = 0; i < this.templates.length; i++) {
      if (this.templates[i].id === templateId) {
        tmpl = this.templates[i];
        break;
      }
    }
    if (!tmpl) return prompt;

    var result = tmpl.template.replace('{prompt}', prompt);
    result = result.replace('{examples}', '[Example 1] [Example 2]');
    result = result.replace('{role}', 'an expert assistant');
    result = result.replace('{keys}', 'answer, reasoning, confidence');
    return result;
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
      text: config.strengths[0] + ' response to: "' +
            (prompt || '').substring(0, 80) + (promptLen > 80 ? '...' : '') + '"',
      confidence: Math.round(confidence * 1000) / 1000,
      timestamp: Date.now()
    };
  }
}

globalThis.edgePromptLab = new EdgePromptLabEngine();

/* ── Message Router ───────────────────────────────────────── */
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  var engine = globalThis.edgePromptLab;

  switch (message.action) {
    case 'testPrompt':
      sendResponse(engine.testPrompt(message.prompt, message.templateId, message.models));
      break;
    case 'getTemplates':
      sendResponse(engine.getTemplates());
      break;
    case 'getState':
      sendResponse(engine.state);
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
  var ALARM_NAME = 'edge-prompt-lab-keepalive';
  var ALARM_PERIOD = 0.4;

  chrome.alarms.create(ALARM_NAME, { periodInMinutes: ALARM_PERIOD });

  chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name !== ALARM_NAME) return;
    if (!globalThis.edgePromptLab) {
      globalThis.edgePromptLab = new EdgePromptLabEngine();
      console.log('[Edge Prompt Lab] Engine re-initialized by keepalive');
    }
    try {
      chrome.storage.local.set({
        'edge-prompt-lab_state': {
          heartbeatCount: globalThis.edgePromptLab.state.heartbeatCount,
          healthy: globalThis.edgePromptLab.state.healthy,
          lastAlive: Date.now()
        }
      });
    } catch (e) { }
  });

  chrome.runtime.onInstalled.addListener(function () {
    chrome.alarms.create(ALARM_NAME, { periodInMinutes: ALARM_PERIOD });
    console.log('[Edge Prompt Lab] Installed — 24/7 keepalive active');
  });
})();
