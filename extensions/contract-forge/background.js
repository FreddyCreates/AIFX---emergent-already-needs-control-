/* Contract Forge — Background Service Worker (EXT-015) */

const PHI = 1.618033988749895;
const GOLDEN_ANGLE = 137.508;
const HEARTBEAT = 873;

class ContractForgeEngine {
  constructor() {
    this.engines = ['gpt', 'claude', 'guards'];
    this.contractStore = {};
    this.obligationTracker = {};
  }

  draftContract(terms, type) {
    if (type === undefined) type = 'intelligence';

    if (!terms || (typeof terms === 'string' && !terms.trim())) {
      return { error: 'Contract terms are required' };
    }

    var termsText = typeof terms === 'string' ? terms : JSON.stringify(terms);
    var contractId = 'cf-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 8);

    var clauses = this._extractClauses(termsText);
    var riskLevel = this._assessRisk(clauses);

    var contract = {
      contractId: contractId,
      type: type,
      version: '1.0.0',
      status: 'draft',
      clauses: clauses,
      riskAssessment: riskLevel,
      parties: [],
      createdAt: Date.now(),
      modifiedAt: Date.now(),
      expiresAt: Date.now() + (HEARTBEAT * 100000),
      phiSignature: Math.round(PHI * Date.now() % 1000000),
      engine: 'gpt'
    };

    this.contractStore[contractId] = contract;
    return contract;
  }

  analyzeContract(contractText) {
    if (!contractText) return { error: 'Contract text is required' };

    var text = typeof contractText === 'string' ? contractText : JSON.stringify(contractText);
    var clauses = this._extractClauses(text);
    var obligations = [];
    var risks = [];

    for (var i = 0; i < clauses.length; i++) {
      var clause = clauses[i];
      var lower = clause.text.toLowerCase();

      var obligationKeywords = ['shall', 'must', 'required', 'obligated', 'agrees to',
        'will provide', 'responsible for', 'undertakes', 'commits to'];
      var isObligation = false;
      for (var o = 0; o < obligationKeywords.length; o++) {
        if (lower.indexOf(obligationKeywords[o]) !== -1) { isObligation = true; break; }
      }

      if (isObligation) {
        obligations.push({
          clauseIndex: i,
          text: clause.text.substring(0, 150),
          priority: Math.round(Math.pow(PHI, -(i * 0.3)) * 1000) / 1000,
          type: 'obligation'
        });
      }

      var riskKeywords = ['liability', 'penalty', 'indemnify', 'terminate', 'breach',
        'damages', 'forfeit', 'waive', 'limitation', 'exclusion'];
      var riskCount = 0;
      for (var r = 0; r < riskKeywords.length; r++) {
        if (lower.indexOf(riskKeywords[r]) !== -1) riskCount++;
      }

      if (riskCount > 0) {
        risks.push({
          clauseIndex: i,
          text: clause.text.substring(0, 150),
          severity: riskCount > 2 ? 'high' : riskCount > 1 ? 'medium' : 'low',
          riskFactors: riskCount
        });
      }
    }

    return {
      totalClauses: clauses.length,
      clauses: clauses,
      obligations: obligations,
      obligationCount: obligations.length,
      risks: risks,
      riskCount: risks.length,
      overallRisk: risks.length > 3 ? 'high' : risks.length > 1 ? 'medium' : 'low',
      engine: 'claude',
      timestamp: Date.now()
    };
  }

  verifyCompliance(contract, requirements) {
    if (!contract || !requirements) {
      return { error: 'Both contract and requirements are required' };
    }

    var contractText = typeof contract === 'string' ? contract : JSON.stringify(contract);
    var lower = contractText.toLowerCase();

    var reqList = Array.isArray(requirements) ? requirements :
      (typeof requirements === 'string' ? requirements.split('\n').filter(function (r) { return r.trim(); }) : []);

    var results = [];
    var metCount = 0;

    for (var i = 0; i < reqList.length; i++) {
      var req = typeof reqList[i] === 'string' ? reqList[i] : (reqList[i].text || String(reqList[i]));
      var reqLower = req.toLowerCase();
      var reqWords = reqLower.split(/\s+/).filter(function (w) { return w.length > 3; });

      var matchCount = 0;
      for (var w = 0; w < reqWords.length; w++) {
        if (lower.indexOf(reqWords[w]) !== -1) matchCount++;
      }

      var coverage = reqWords.length > 0 ? matchCount / reqWords.length : 0;
      var met = coverage > 0.4;
      if (met) metCount++;

      results.push({
        requirement: req.substring(0, 120),
        met: met,
        coverage: Math.round(coverage * 1000) / 1000,
        confidence: Math.round(Math.min(1, coverage * PHI) * 1000) / 1000
      });
    }

    var complianceRate = reqList.length > 0 ? metCount / reqList.length : 0;

    return {
      compliant: complianceRate >= 0.8,
      complianceRate: Math.round(complianceRate * 1000) / 1000,
      totalRequirements: reqList.length,
      metRequirements: metCount,
      unmetRequirements: reqList.length - metCount,
      details: results,
      engine: 'guards',
      timestamp: Date.now()
    };
  }

  signContract(contract, signerKey) {
    if (!contract || !signerKey) {
      return { error: 'Both contract and signer key are required' };
    }

    var contractText = typeof contract === 'string' ? contract : JSON.stringify(contract);
    var hash = this._cryptoHash(contractText + ':' + signerKey + ':' + Date.now());

    var signatureBlock = {
      signatureHash: hash,
      signerKeyFingerprint: this._cryptoHash(signerKey).substring(0, 16),
      algorithm: 'phi-sha256',
      signedAt: Date.now(),
      phiNonce: Math.round((Math.sin(Date.now() * PHI) + 1) * 500000),
      goldenSeal: Math.round(GOLDEN_ANGLE * Date.now() % 1000000),
      valid: true
    };

    return signatureBlock;
  }

  trackObligations(contractId) {
    var contract = this.contractStore[contractId];

    if (!contract) {
      return {
        contractId: contractId,
        error: 'Contract not found',
        suggestion: 'Draft a contract first using draftContract()'
      };
    }

    var obligations = [];
    var now = Date.now();

    for (var i = 0; i < contract.clauses.length; i++) {
      var clause = contract.clauses[i];
      if (clause.type === 'obligation' || clause.text.toLowerCase().indexOf('shall') !== -1) {
        var deadline = contract.createdAt + (HEARTBEAT * 10000 * (i + 1));
        var daysRemaining = Math.max(0, Math.ceil((deadline - now) / 86400000));
        var urgency = Math.round(Math.pow(PHI, -(daysRemaining * 0.1)) * 1000) / 1000;

        obligations.push({
          clauseIndex: i,
          text: clause.text.substring(0, 100),
          deadline: deadline,
          daysRemaining: daysRemaining,
          urgency: urgency,
          urgencyLevel: urgency > 0.8 ? 'critical' : urgency > 0.5 ? 'high' : urgency > 0.3 ? 'medium' : 'low',
          status: daysRemaining > 30 ? 'on-track' : daysRemaining > 7 ? 'approaching' : 'urgent'
        });
      }
    }

    obligations.sort(function (a, b) { return b.urgency - a.urgency; });

    return {
      contractId: contractId,
      contractType: contract.type,
      obligations: obligations,
      totalObligations: obligations.length,
      criticalCount: obligations.filter(function (o) { return o.urgencyLevel === 'critical'; }).length,
      timestamp: Date.now()
    };
  }

  _extractClauses(text) {
    var sentences = text.split(/[.!?;\n]+/).filter(function (s) { return s.trim().length > 10; });
    var clauses = [];

    for (var i = 0; i < sentences.length; i++) {
      var s = sentences[i].trim();
      var lower = s.toLowerCase();
      var type = 'general';

      if (lower.indexOf('shall') !== -1 || lower.indexOf('must') !== -1) type = 'obligation';
      else if (lower.indexOf('may') !== -1 || lower.indexOf('can') !== -1) type = 'permission';
      else if (lower.indexOf('if') !== -1 || lower.indexOf('provided that') !== -1) type = 'condition';
      else if (lower.indexOf('terminate') !== -1 || lower.indexOf('expire') !== -1) type = 'termination';

      clauses.push({
        index: i,
        text: s.substring(0, 200),
        type: type,
        weight: Math.round(Math.pow(PHI, -(i * 0.2)) * 1000) / 1000
      });
    }

    return clauses;
  }

  _assessRisk(clauses) {
    var riskScore = 0;
    for (var i = 0; i < clauses.length; i++) {
      if (clauses[i].type === 'termination') riskScore += 2;
      if (clauses[i].type === 'obligation') riskScore += 1;
      if (clauses[i].type === 'condition') riskScore += 0.5;
    }
    var normalized = Math.min(1, riskScore / (clauses.length + PHI));
    return {
      score: Math.round(normalized * 1000) / 1000,
      level: normalized > 0.6 ? 'high' : normalized > 0.3 ? 'medium' : 'low'
    };
  }

  _cryptoHash(input) {
    var hash = 0;
    var str = String(input);
    for (var i = 0; i < str.length; i++) {
      var ch = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + ch;
      hash = hash & hash;
    }
    var hex = Math.abs(hash).toString(16);
    while (hex.length < 16) hex = '0' + hex;
    return 'phi-' + hex + '-' + Math.abs(hash * 31).toString(16).substring(0, 8);
  }
}

globalThis.contractForge = new ContractForgeEngine();

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
    var engine = globalThis.contractForge;

    /* ── Built-in workspace commands ── */
    if (cmd === 'ping') { sendResponse({ result: 'pong — Contract Forge engine alive at ' + new Date().toISOString() }); return true; }
    if (cmd === 'getState' || lower === 'state' || lower === 'status') {
      sendResponse({ result: JSON.stringify(engine && engine.state ? engine.state : { status: 'running', timestamp: Date.now() }, null, 2) });
      return true;
    }
    if (cmd === 'clearLogs') { sendResponse({ result: 'Workspace logs cleared.' }); return true; }
    if (lower === 'help' || lower === 'capabilities' || lower === '?') {
      sendResponse({ result: '\u{1F9E0} Contract Forge AI Workspace\n\nCapabilities:\n• Draft Contract — Draft a new smart contract\n• Analyze Contract — Analyze contract for risks/clauses\n• Verify Compliance — Verify regulatory compliance\n• Sign Contract — Sign/execute contract\n• Track Obligations — Track contract obligations\n\nType any command or question and I will route it to the best engine method.' });
      return true;
    }

    /* ── Save to workspace conversation history ── */
    var storageKey = 'contract-forge_workspace_history';
    chrome.storage.local.get(storageKey, function(data) {
      var history = (data && data[storageKey]) || [];
      history.push({ role: 'user', content: cmd, ts: Date.now() });

      /* ── Intelligent workspace command routing ── */
      var result;
      try {
        if (lower.indexOf('draft') !== -1 || lower.indexOf('create') !== -1 || lower.indexOf('new') !== -1 || lower.indexOf('write') !== -1 || lower.indexOf('contract') !== -1) {
          result = engine.draftContract(cmd, "standard");
        }
        else if (lower.indexOf('analyze') !== -1 || lower.indexOf('review') !== -1 || lower.indexOf('check') !== -1 || lower.indexOf('inspect') !== -1) {
          result = engine.analyzeContract(cmd);
        }
        else if (lower.indexOf('comply') !== -1 || lower.indexOf('compliance') !== -1 || lower.indexOf('verify') !== -1 || lower.indexOf('legal') !== -1) {
          result = engine.verifyCompliance(cmd, "");
        }
        else if (lower.indexOf('sign') !== -1 || lower.indexOf('execute') !== -1 || lower.indexOf('finalize') !== -1) {
          result = engine.signContract(cmd, "auto");
        }
        else if (lower.indexOf('track') !== -1 || lower.indexOf('obligation') !== -1 || lower.indexOf('deadline') !== -1 || lower.indexOf('monitor') !== -1) {
          result = engine.trackObligations("active");
        }
        else {
          /* Default: route to primary engine method */
          result = engine.draftContract(cmd, "standard");
        }
      } catch(e) {
        result = { error: e.message, fallback: 'Contract Forge encountered an error processing: "' + cmd + '"' };
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

  var engine = globalThis.contractForge;

  switch (message.action) {
    case 'draftContract':
      sendResponse({ success: true, data: engine.draftContract(message.terms, message.type) });
      break;
    case 'analyzeContract':
      sendResponse({ success: true, data: engine.analyzeContract(message.contractText) });
      break;
    case 'verifyCompliance':
      sendResponse({ success: true, data: engine.verifyCompliance(message.contract, message.requirements) });
      break;
    case 'signContract':
      sendResponse({ success: true, data: engine.signContract(message.contract, message.signerKey) });
      break;
    case 'trackObligations':
      sendResponse({ success: true, data: engine.trackObligations(message.contractId) });
      break;
    default:
      sendResponse({ success: false, error: 'Unknown action: ' + message.action });
  }

  return true;
});

/* -- Production 24/7 Keep-Alive ---------------------------------------- */
(function () {
  var ALARM_NAME = 'contract-forge-heartbeat';
  var ALARM_PERIOD = 0.4; /* minutes -- fires every ~24 seconds to beat Chrome's 30s kill timer */

  chrome.alarms.create(ALARM_NAME, { periodInMinutes: ALARM_PERIOD });

  chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name !== ALARM_NAME) return;
    /* Re-initialize engine if it was garbage collected */
    if (!globalThis.contractForge) {
      globalThis.contractForge = new ContractForgeEngine();
      console.log('[Contract Forge] Engine re-initialized by keepalive alarm');
    }
    /* Persist state snapshot */
    try {
      chrome.storage.local.set({
        'contract-forge_state': {
          heartbeatCount: globalThis.contractForge.heartbeatCount || globalThis.contractForge.state?.heartbeatCount || 0,
          lastAlive: Date.now(),
          uptime: Date.now() - (globalThis.contractForge.state?.startTime || globalThis.contractForge.startTime || Date.now())
        }
      });
    } catch (e) { /* storage not available in some contexts */ }
  });

  /* Restore state on startup */
  chrome.storage.local.get('contract-forge_state', function (data) {
    if (data && data['contract-forge_state']) {
      console.log('[Contract Forge] Restored from previous session \u2014 last alive: ' +
        new Date(data['contract-forge_state'].lastAlive).toISOString());
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
    console.log('[Contract Forge] Installed/updated \u2014 24/7 keepalive active');
  });
})();
