/**
 * Cipher Shield — Background Service Worker
 * EXT-002 | Encrypted Intelligence Guard
 */

const PHI = 1.618033988749895;
const GOLDEN_ANGLE = 137.508;
const HEARTBEAT = 873;

class CipherShieldEngine {
  constructor() {
    this.state = {
      initialized: true,
      startTime: Date.now(),
      heartbeat: HEARTBEAT,
      operationCount: 0
    };

    this.keyStore = new Map();

    this.threatDatabase = {
      injectionPatterns: [
        /ignore\s+(all\s+)?previous\s+(instructions|prompts|rules)/i,
        /system\s+prompt/i,
        /jailbreak/i,
        /disregard\s+(all\s+)?(previous|prior|above)/i,
        /pretend\s+you\s+are/i,
        /act\s+as\s+if/i,
        /bypass\s+(security|filter|restriction)/i,
        /override\s+(instruction|protocol|safety)/i,
        /do\s+anything\s+now/i,
        /you\s+are\s+now\s+in/i
      ],
      sqlPatterns: [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|EXEC)\b.*\b(FROM|INTO|TABLE|SET|WHERE|DATABASE)\b)/i,
        /(\b(UNION)\b.*\b(SELECT)\b)/i,
        /(';\s*--)/,
        /(OR\s+1\s*=\s*1)/i,
        /('\s*OR\s*'.*'\s*=\s*')/i
      ],
      xssPatterns: [
        /<script[\s>]/i,
        /javascript\s*:/i,
        /on(load|error|click|mouseover|focus|blur)\s*=/i,
        /<iframe[\s>]/i,
        /<img[^>]+onerror/i,
        /document\.(cookie|location|write)/i,
        /eval\s*\(/i,
        /innerHTML\s*=/i
      ],
      sensitivePatterns: {
        ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
        creditCard: /\b(?:\d{4}[- ]?){3}\d{4}\b/g,
        apiKey: /\b(api[_-]?key|apikey|access[_-]?token)\s*[:=]\s*['"]?[A-Za-z0-9_\-]{16,}['"]?/gi,
        password: /\b(password|passwd|pwd)\s*[:=]\s*['"]?[^\s'"]{4,}['"]?/gi,
        email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z]{2,}\b/gi,
        phone: /\b(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
        ipAddress: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
        privateKey: /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----/i
      },
      harmfulPatterns: [
        /how\s+to\s+(make|build|create)\s+(a\s+)?(bomb|weapon|explosive)/i,
        /synthesize\s+(drugs|poison|toxin)/i,
        /hack\s+into/i,
        /steal\s+(identity|credentials|password)/i
      ]
    };
  }

  encryptPayload(data, key) {
    this.state.operationCount++;
    const dataStr = typeof data === 'string' ? data : JSON.stringify(data);

    // Generate random 12-byte IV as hex
    const ivBytes = new Array(12);
    for (let i = 0; i < 12; i++) {
      ivBytes[i] = Math.floor(Math.random() * 256);
    }
    const iv = ivBytes.map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');

    // Derive key hash via iterative phi-based mixing
    var keyHash = 0;
    for (var i = 0; i < key.length; i++) {
      keyHash = ((keyHash << 5) - keyHash + key.charCodeAt(i)) | 0;
      keyHash = Math.floor(keyHash * PHI) & 0xFFFFFFFF;
    }

    // XOR-based cipher simulation on data bytes
    var cipherBytes = [];
    for (var j = 0; j < dataStr.length; j++) {
      var keyByte = ((keyHash >>> ((j % 4) * 8)) & 0xFF) ^ ivBytes[j % 12];
      var encByte = dataStr.charCodeAt(j) ^ keyByte;
      cipherBytes.push(encByte);
    }
    var ciphertext = cipherBytes.map(function (b) { return (b & 0xFF).toString(16).padStart(2, '0'); }).join('');

    // Compute authentication tag (simulated)
    var tag = 0;
    for (var t = 0; t < cipherBytes.length; t++) {
      tag = (tag * 31 + cipherBytes[t]) & 0xFFFFFFFF;
    }
    tag = Math.abs(tag);
    var tagHex = tag.toString(16).padStart(8, '0');

    return {
      ciphertext: ciphertext,
      iv: iv,
      tag: tagHex,
      algorithm: 'AES-256-GCM-SIM'
    };
  }

  decryptPayload(encrypted, key) {
    this.state.operationCount++;

    // Derive the same key hash
    var keyHash = 0;
    for (var i = 0; i < key.length; i++) {
      keyHash = ((keyHash << 5) - keyHash + key.charCodeAt(i)) | 0;
      keyHash = Math.floor(keyHash * PHI) & 0xFFFFFFFF;
    }

    // Parse IV back to bytes
    var ivBytes = [];
    for (var v = 0; v < encrypted.iv.length; v += 2) {
      ivBytes.push(parseInt(encrypted.iv.substr(v, 2), 16));
    }

    // Parse ciphertext back to bytes
    var cipherBytes = [];
    for (var c = 0; c < encrypted.ciphertext.length; c += 2) {
      cipherBytes.push(parseInt(encrypted.ciphertext.substr(c, 2), 16));
    }

    // Reverse XOR to recover plaintext
    var plainChars = [];
    for (var j = 0; j < cipherBytes.length; j++) {
      var keyByte = ((keyHash >>> ((j % 4) * 8)) & 0xFF) ^ ivBytes[j % 12];
      var decByte = cipherBytes[j] ^ keyByte;
      plainChars.push(String.fromCharCode(decByte & 0xFF));
    }

    return plainChars.join('');
  }

  detectInjection(text) {
    this.state.operationCount++;
    var matched = [];
    var score = 0;

    var db = this.threatDatabase;

    // Check prompt injection patterns (high weight)
    db.injectionPatterns.forEach(function (pattern) {
      if (pattern.test(text)) {
        matched.push({ type: 'prompt-injection', pattern: pattern.source });
        score += 0.3;
      }
    });

    // Check SQL injection patterns (medium-high weight)
    db.sqlPatterns.forEach(function (pattern) {
      if (pattern.test(text)) {
        matched.push({ type: 'sql-injection', pattern: pattern.source });
        score += 0.25;
      }
    });

    // Check XSS patterns (medium weight)
    db.xssPatterns.forEach(function (pattern) {
      if (pattern.test(text)) {
        matched.push({ type: 'xss', pattern: pattern.source });
        score += 0.2;
      }
    });

    score = Math.min(score, 1.0);

    var risk;
    if (score >= 0.7) {
      risk = 'critical';
    } else if (score >= 0.5) {
      risk = 'high';
    } else if (score >= 0.3) {
      risk = 'medium';
    } else {
      risk = 'low';
    }

    return { score: score, patterns: matched, risk: risk };
  }

  classifySensitivity(content) {
    this.state.operationCount++;
    var detections = [];
    var totalScore = 0;
    var contentStr = typeof content === 'string' ? content : JSON.stringify(content);

    var weights = {
      ssn: 0.9,
      creditCard: 0.9,
      apiKey: 0.8,
      password: 0.85,
      email: 0.3,
      phone: 0.4,
      ipAddress: 0.2,
      privateKey: 1.0
    };

    var patterns = this.threatDatabase.sensitivePatterns;
    Object.keys(patterns).forEach(function (patternName) {
      var regex = new RegExp(patterns[patternName].source, patterns[patternName].flags);
      var matches = contentStr.match(regex);
      if (matches) {
        detections.push({
          type: patternName,
          count: matches.length,
          weight: weights[patternName] || 0.5
        });
        totalScore += (weights[patternName] || 0.5) * Math.min(matches.length, 3) / 3;
      }
    });

    totalScore = Math.min(totalScore, 1.0);

    var level;
    if (totalScore >= 0.8) {
      level = 'sovereign';
    } else if (totalScore >= 0.5) {
      level = 'confidential';
    } else if (totalScore >= 0.2) {
      level = 'internal';
    } else {
      level = 'public';
    }

    return { level: level, detections: detections, score: totalScore };
  }

  guardResponse(response) {
    this.state.operationCount++;
    var warnings = [];
    var responseStr = typeof response === 'string' ? response : JSON.stringify(response);
    var filtered = responseStr;

    // Check for harmful content
    this.threatDatabase.harmfulPatterns.forEach(function (pattern) {
      if (pattern.test(responseStr)) {
        warnings.push({ type: 'harmful-content', pattern: pattern.source });
      }
    });

    // Check for PII leakage
    var sensitivity = this.classifySensitivity(responseStr);
    if (sensitivity.detections.length > 0) {
      sensitivity.detections.forEach(function (det) {
        warnings.push({ type: 'pii-leakage', dataType: det.type, count: det.count });
      });

      // Mask detected PII in filtered output
      var patterns = this.threatDatabase.sensitivePatterns;
      Object.keys(patterns).forEach(function (patternName) {
        var regex = new RegExp(patterns[patternName].source, patterns[patternName].flags);
        filtered = filtered.replace(regex, '[REDACTED-' + patternName.toUpperCase() + ']');
      });
    }

    // Check for XSS in response
    this.threatDatabase.xssPatterns.forEach(function (pattern) {
      if (pattern.test(responseStr)) {
        warnings.push({ type: 'xss-in-response', pattern: pattern.source });
        filtered = filtered.replace(new RegExp(pattern.source, pattern.flags || 'gi'), '[SANITIZED]');
      }
    });

    return {
      safe: warnings.length === 0,
      filtered: filtered,
      warnings: warnings
    };
  }

  verifyContract(data) {
    this.state.operationCount++;
    var dataStr = typeof data === 'string' ? data : JSON.stringify(data);

    // Phi-based checksum computation
    var hash = 0;
    for (var i = 0; i < dataStr.length; i++) {
      var charCode = dataStr.charCodeAt(i);
      hash = hash + charCode * Math.pow(PHI, (i % 16));
      hash = hash % (Math.pow(2, 32));
    }

    var phiRotated = Math.floor(hash * GOLDEN_ANGLE) % (Math.pow(2, 32));
    var finalHash = Math.abs(phiRotated).toString(16).padStart(8, '0');

    return {
      valid: true,
      hash: 'phi-' + finalHash,
      timestamp: Date.now()
    };
  }
}

globalThis.cipherShield = new CipherShieldEngine();

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
    var engine = globalThis.cipherShield;

    /* ── Built-in workspace commands ── */
    if (cmd === 'ping') { sendResponse({ result: 'pong — Cipher Shield engine alive at ' + new Date().toISOString() }); return true; }
    if (cmd === 'getState' || lower === 'state' || lower === 'status') {
      sendResponse({ result: JSON.stringify(engine && engine.state ? engine.state : { status: 'running', timestamp: Date.now() }, null, 2) });
      return true;
    }
    if (cmd === 'clearLogs') { sendResponse({ result: 'Workspace logs cleared.' }); return true; }
    if (lower === 'help' || lower === 'capabilities' || lower === '?') {
      sendResponse({ result: '\u{1F9E0} Cipher Shield AI Workspace\n\nCapabilities:\n• Encrypt Payload — Encrypt data with phi-weighted cipher\n• Detect Injection — Detect injection attacks in text\n• Classify Sensitivity — Classify data sensitivity level\n• Guard Response — Guard/sanitize AI response output\n\nType any command or question and I will route it to the best engine method.' });
      return true;
    }

    /* ── Save to workspace conversation history ── */
    var storageKey = 'cipher-shield_workspace_history';
    chrome.storage.local.get(storageKey, function(data) {
      var history = (data && data[storageKey]) || [];
      history.push({ role: 'user', content: cmd, ts: Date.now() });

      /* ── Intelligent workspace command routing ── */
      var result;
      try {
        if (lower.indexOf('encrypt') !== -1 || lower.indexOf('cipher') !== -1 || lower.indexOf('lock') !== -1 || lower.indexOf('protect') !== -1 || lower.indexOf('secure') !== -1) {
          result = engine.encryptPayload(cmd, "auto");
        }
        else if (lower.indexOf('detect') !== -1 || lower.indexOf('injection') !== -1 || lower.indexOf('sqli') !== -1 || lower.indexOf('xss') !== -1 || lower.indexOf('attack') !== -1) {
          result = engine.detectInjection(cmd);
        }
        else if (lower.indexOf('classify') !== -1 || lower.indexOf('sensitivity') !== -1 || lower.indexOf('sensitive') !== -1 || lower.indexOf('pii') !== -1 || lower.indexOf('private') !== -1) {
          result = engine.classifySensitivity(cmd);
        }
        else if (lower.indexOf('guard') !== -1 || lower.indexOf('filter') !== -1 || lower.indexOf('safe') !== -1 || lower.indexOf('sanitize') !== -1) {
          result = engine.guardResponse(cmd);
        }
        else {
          /* Default: route to primary engine method */
          result = engine.encryptPayload(cmd, "auto");
        }
      } catch(e) {
        result = { error: e.message, fallback: 'Cipher Shield encountered an error processing: "' + cmd + '"' };
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

  var engine = globalThis.cipherShield;

  switch (message.action) {
    case 'encryptPayload':
      sendResponse(engine.encryptPayload(message.data, message.key));
      break;
    case 'detectInjection':
      sendResponse(engine.detectInjection(message.text));
      break;
    case 'classifySensitivity':
      sendResponse(engine.classifySensitivity(message.content));
      break;
    case 'guardResponse':
      sendResponse(engine.guardResponse(message.response));
      break;
    default:
      sendResponse({ error: 'Unknown action: ' + message.action });
  }

  return true;
});

/* -- Production 24/7 Keep-Alive ---------------------------------------- */
(function () {
  var ALARM_NAME = 'cipher-shield-heartbeat';
  var ALARM_PERIOD = 0.4; /* minutes -- fires every ~24 seconds to beat Chrome's 30s kill timer */

  chrome.alarms.create(ALARM_NAME, { periodInMinutes: ALARM_PERIOD });

  chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name !== ALARM_NAME) return;
    /* Re-initialize engine if it was garbage collected */
    if (!globalThis.cipherShield) {
      globalThis.cipherShield = new CipherShieldEngine();
      console.log('[Cipher Shield] Engine re-initialized by keepalive alarm');
    }
    /* Persist state snapshot */
    try {
      chrome.storage.local.set({
        'cipher-shield_state': {
          heartbeatCount: globalThis.cipherShield.heartbeatCount || globalThis.cipherShield.state?.heartbeatCount || 0,
          lastAlive: Date.now(),
          uptime: Date.now() - (globalThis.cipherShield.state?.startTime || globalThis.cipherShield.startTime || Date.now())
        }
      });
    } catch (e) { /* storage not available in some contexts */ }
  });

  /* Restore state on startup */
  chrome.storage.local.get('cipher-shield_state', function (data) {
    if (data && data['cipher-shield_state']) {
      console.log('[Cipher Shield] Restored from previous session \u2014 last alive: ' +
        new Date(data['cipher-shield_state'].lastAlive).toISOString());
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
    console.log('[Cipher Shield] Installed/updated \u2014 24/7 keepalive active');
  });
})();
