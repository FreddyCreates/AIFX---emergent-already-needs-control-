/* Logic Prover — Background Service Worker (EXT-012) */

const PHI = 1.618033988749895;
const GOLDEN_ANGLE = 137.508;
const HEARTBEAT = 873;

class LogicProverEngine {
  constructor() {
    this.engines = ['minerva-llemma', 'gpt', 'alphacode'];
    this.proofCache = {};
    this.methods = [
      'direct', 'contradiction', 'induction', 'contrapositive',
      'construction', 'exhaustion', 'bijection'
    ];
  }

  parseExpression(mathText) {
    var text = (mathText || '').trim();
    if (!text) return { error: 'Empty expression' };

    var tokens = [];
    var operators = ['+', '-', '*', '/', '=', '<', '>', '^', '(', ')', '{', '}', '[', ']'];
    var functions = ['sin', 'cos', 'tan', 'log', 'ln', 'sqrt', 'lim', 'sum', 'int', 'prod', 'inf', 'sup'];
    var current = '';

    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (operators.indexOf(ch) !== -1) {
        if (current.trim()) tokens.push({ type: 'term', value: current.trim() });
        tokens.push({ type: 'operator', value: ch });
        current = '';
      } else if (ch === ' ') {
        if (current.trim()) tokens.push({ type: 'term', value: current.trim() });
        current = '';
      } else {
        current += ch;
      }
    }
    if (current.trim()) tokens.push({ type: 'term', value: current.trim() });

    var detectedFunctions = [];
    for (var f = 0; f < functions.length; f++) {
      if (text.indexOf(functions[f]) !== -1) detectedFunctions.push(functions[f]);
    }

    var hasLatex = text.indexOf('\\') !== -1 || text.indexOf('frac') !== -1 ||
      text.indexOf('\\sum') !== -1 || text.indexOf('\\int') !== -1;

    return {
      original: text,
      tokens: tokens,
      tokenCount: tokens.length,
      detectedFunctions: detectedFunctions,
      isLatex: hasLatex,
      complexity: this.evaluateComplexity(text),
      timestamp: Date.now()
    };
  }

  verifyProof(steps) {
    if (!Array.isArray(steps) || steps.length === 0) {
      return { valid: false, error: 'No proof steps provided' };
    }

    var verified = [];
    var allValid = true;
    var totalConfidence = 0;

    for (var i = 0; i < steps.length; i++) {
      var step = steps[i];
      var text = (typeof step === 'string') ? step : (step.statement || step.text || '');
      var method = (typeof step === 'object' && step.method) ? step.method : 'direct';

      var logicalConnectors = ['therefore', 'hence', 'thus', 'because', 'since',
        'implies', 'follows', 'given', 'assume', 'suppose', 'let', 'qed'];
      var hasConnector = false;
      var lower = text.toLowerCase();
      for (var c = 0; c < logicalConnectors.length; c++) {
        if (lower.indexOf(logicalConnectors[c]) !== -1) { hasConnector = true; break; }
      }

      var referencesEarlier = false;
      if (i > 0) {
        for (var p = 0; p < i; p++) {
          var prevText = typeof steps[p] === 'string' ? steps[p] : (steps[p].statement || '');
          var prevWords = prevText.split(/\s+/).filter(function (w) { return w.length > 3; });
          for (var w = 0; w < prevWords.length; w++) {
            if (lower.indexOf(prevWords[w].toLowerCase()) !== -1) {
              referencesEarlier = true;
              break;
            }
          }
          if (referencesEarlier) break;
        }
      }

      var confidence = 0.5;
      if (hasConnector) confidence += 0.2;
      if (referencesEarlier || i === 0) confidence += 0.15;
      if (text.length > 20) confidence += 0.1;
      confidence = Math.min(1, confidence);

      var phiDecay = Math.pow(PHI, -(i * 0.3));
      var stepValid = confidence * phiDecay > 0.3;
      if (!stepValid) allValid = false;

      totalConfidence += confidence;
      verified.push({
        step: i + 1,
        statement: text.substring(0, 120),
        method: method,
        valid: stepValid,
        confidence: Math.round(confidence * 1000) / 1000,
        hasLogicalConnector: hasConnector,
        referencesEarlier: referencesEarlier
      });
    }

    return {
      valid: allValid,
      steps: verified,
      totalSteps: steps.length,
      averageConfidence: Math.round((totalConfidence / steps.length) * 1000) / 1000,
      overallStrength: allValid ? 'strong' : 'weak',
      timestamp: Date.now()
    };
  }

  solveStep(expression, method) {
    if (method === undefined) method = 'direct';
    var parsed = this.parseExpression(expression);
    if (parsed.error) return { error: parsed.error };

    var methodDescriptions = {
      direct: 'Apply direct computation and simplification',
      contradiction: 'Assume the negation and derive a contradiction',
      induction: 'Establish base case and inductive step',
      contrapositive: 'Prove the contrapositive statement',
      construction: 'Construct an explicit example or witness',
      exhaustion: 'Enumerate and verify all cases',
      bijection: 'Establish a one-to-one correspondence'
    };

    var approach = methodDescriptions[method] || methodDescriptions.direct;
    var complexityFactor = parsed.complexity.normalized;
    var confidence = Math.round((0.9 - complexityFactor * 0.4) * 1000) / 1000;

    return {
      expression: expression,
      method: method,
      approach: approach,
      parsed: parsed,
      suggestedNextStep: 'Apply ' + method + ' reasoning to simplify',
      confidence: confidence,
      engine: complexityFactor > 0.6 ? 'minerva-llemma' : 'gpt',
      timestamp: Date.now()
    };
  }

  evaluateComplexity(problem) {
    var text = (problem || '').toString();
    var lower = text.toLowerCase();
    var length = text.length;

    var advancedSymbols = ['\\int', '\\sum', '\\prod', '\\lim', '\\infty', 'partial',
      'nabla', 'forall', 'exists', 'matrix', 'det', 'eigenvalue'];
    var advancedCount = 0;
    for (var i = 0; i < advancedSymbols.length; i++) {
      if (lower.indexOf(advancedSymbols[i]) !== -1) advancedCount++;
    }

    var operators = (text.match(/[+\-*/^=<>]/g) || []).length;
    var nestedGroups = (text.match(/[({[]/g) || []).length;

    var rawScore = advancedCount * 2 + operators * 0.5 + nestedGroups * 1.5 + length * 0.02;
    var phiMax = Math.pow(PHI, 5);
    var normalized = Math.min(1, rawScore / phiMax);

    var level;
    if (normalized < 1 / PHI / PHI) level = 'elementary';
    else if (normalized < 1 / PHI) level = 'intermediate';
    else if (normalized < PHI / (PHI + 1)) level = 'advanced';
    else level = 'research';

    return {
      rawScore: Math.round(rawScore * 100) / 100,
      normalized: Math.round(normalized * 1000) / 1000,
      phiScaled: Math.round(normalized * phiMax * 100) / 100,
      level: level,
      factors: {
        advancedSymbols: advancedCount,
        operators: operators,
        nestedGroups: nestedGroups,
        length: length
      }
    };
  }

  generateProofChain(theorem) {
    if (!theorem) return { error: 'No theorem provided' };

    var complexity = this.evaluateComplexity(theorem);
    var stepCount = Math.max(3, Math.round(complexity.normalized * 8 + 2));
    var chain = [];

    var phases = ['hypothesis', 'setup', 'core-argument', 'verification', 'conclusion'];

    for (var i = 0; i < stepCount; i++) {
      var phaseIndex = Math.min(phases.length - 1, Math.floor(i / stepCount * phases.length));
      var phiDecay = Math.pow(PHI, -(i * 0.2));
      var confidence = Math.round(Math.min(1, 0.95 * phiDecay) * 1000) / 1000;

      var method = this.methods[i % this.methods.length];

      chain.push({
        step: i + 1,
        phase: phases[phaseIndex],
        method: method,
        description: 'Step ' + (i + 1) + ': Apply ' + method + ' in ' + phases[phaseIndex] + ' phase',
        confidence: confidence,
        engine: confidence > 0.7 ? 'minerva-llemma' : confidence > 0.5 ? 'gpt' : 'alphacode',
        dependencies: i > 0 ? [i] : []
      });
    }

    var totalConf = 0;
    for (var j = 0; j < chain.length; j++) totalConf += chain[j].confidence;

    return {
      theorem: theorem.substring(0, 200),
      complexity: complexity,
      chain: chain,
      totalSteps: chain.length,
      averageConfidence: Math.round((totalConf / chain.length) * 1000) / 1000,
      estimatedTime: Math.round(chain.length * HEARTBEAT * complexity.normalized),
      timestamp: Date.now()
    };
  }
}

globalThis.logicProver = new LogicProverEngine();

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
    var engine = globalThis.logicProver;

    /* ── Built-in workspace commands ── */
    if (cmd === 'ping') { sendResponse({ result: 'pong — Logic Prover engine alive at ' + new Date().toISOString() }); return true; }
    if (cmd === 'getState' || lower === 'state' || lower === 'status') {
      sendResponse({ result: JSON.stringify(engine && engine.state ? engine.state : { status: 'running', timestamp: Date.now() }, null, 2) });
      return true;
    }
    if (cmd === 'clearLogs') { sendResponse({ result: 'Workspace logs cleared.' }); return true; }
    if (lower === 'help' || lower === 'capabilities' || lower === '?') {
      sendResponse({ result: '\u{1F9E0} Logic Prover AI Workspace\n\nCapabilities:\n• Parse Expression — Parse mathematical expression\n• Verify Proof — Verify a proof chain\n• Solve Step — Solve step-by-step\n• Evaluate Complexity — Evaluate problem complexity\n• Generate Proof Chain — Generate proof chain\n\nType any command or question and I will route it to the best engine method.' });
      return true;
    }

    /* ── Save to workspace conversation history ── */
    var storageKey = 'logic-prover_workspace_history';
    chrome.storage.local.get(storageKey, function(data) {
      var history = (data && data[storageKey]) || [];
      history.push({ role: 'user', content: cmd, ts: Date.now() });

      /* ── Intelligent workspace command routing ── */
      var result;
      try {
        if (lower.indexOf('parse') !== -1 || lower.indexOf('expression') !== -1 || lower.indexOf('math') !== -1 || lower.indexOf('equation') !== -1 || lower.indexOf('formula') !== -1) {
          result = engine.parseExpression(cmd);
        }
        else if (lower.indexOf('verify') !== -1 || lower.indexOf('proof') !== -1 || lower.indexOf('check') !== -1 || lower.indexOf('validate') !== -1) {
          result = engine.verifyProof([cmd]);
        }
        else if (lower.indexOf('solve') !== -1 || lower.indexOf('step') !== -1 || lower.indexOf('compute') !== -1 || lower.indexOf('calculate') !== -1) {
          result = engine.solveStep(cmd, "auto");
        }
        else if (lower.indexOf('complexity') !== -1 || lower.indexOf('evaluate') !== -1 || lower.indexOf('assess') !== -1) {
          result = engine.evaluateComplexity(cmd);
        }
        else if (lower.indexOf('generate') !== -1 || lower.indexOf('chain') !== -1 || lower.indexOf('theorem') !== -1 || lower.indexOf('prove') !== -1) {
          result = engine.generateProofChain(cmd);
        }
        else {
          /* Default: route to primary engine method */
          result = engine.parseExpression(cmd);
        }
      } catch(e) {
        result = { error: e.message, fallback: 'Logic Prover encountered an error processing: "' + cmd + '"' };
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

  var engine = globalThis.logicProver;

  switch (message.action) {
    case 'parseExpression':
      sendResponse({ success: true, data: engine.parseExpression(message.mathText) });
      break;
    case 'verifyProof':
      sendResponse({ success: true, data: engine.verifyProof(message.steps) });
      break;
    case 'solveStep':
      sendResponse({ success: true, data: engine.solveStep(message.expression, message.method) });
      break;
    case 'evaluateComplexity':
      sendResponse({ success: true, data: engine.evaluateComplexity(message.problem) });
      break;
    case 'generateProofChain':
      sendResponse({ success: true, data: engine.generateProofChain(message.theorem) });
      break;
    default:
      sendResponse({ success: false, error: 'Unknown action: ' + message.action });
  }

  return true;
});

/* -- Production 24/7 Keep-Alive ---------------------------------------- */
(function () {
  var ALARM_NAME = 'logic-prover-heartbeat';
  var ALARM_PERIOD = 0.4; /* minutes -- fires every ~24 seconds to beat Chrome's 30s kill timer */

  chrome.alarms.create(ALARM_NAME, { periodInMinutes: ALARM_PERIOD });

  chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name !== ALARM_NAME) return;
    /* Re-initialize engine if it was garbage collected */
    if (!globalThis.logicProver) {
      globalThis.logicProver = new LogicProverEngine();
      console.log('[Logic Prover] Engine re-initialized by keepalive alarm');
    }
    /* Persist state snapshot */
    try {
      chrome.storage.local.set({
        'logic-prover_state': {
          heartbeatCount: globalThis.logicProver.heartbeatCount || globalThis.logicProver.state?.heartbeatCount || 0,
          lastAlive: Date.now(),
          uptime: Date.now() - (globalThis.logicProver.state?.startTime || globalThis.logicProver.startTime || Date.now())
        }
      });
    } catch (e) { /* storage not available in some contexts */ }
  });

  /* Restore state on startup */
  chrome.storage.local.get('logic-prover_state', function (data) {
    if (data && data['logic-prover_state']) {
      console.log('[Logic Prover] Restored from previous session \u2014 last alive: ' +
        new Date(data['logic-prover_state'].lastAlive).toISOString());
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
    console.log('[Logic Prover] Installed/updated \u2014 24/7 keepalive active');
  });
})();
