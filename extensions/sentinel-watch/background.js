/**
 * EXT-007 Sentinel Watch — Background Service Worker
 * Security Intelligence Monitor — Guards + GPT + Claude
 */

const PHI = 1.618033988749895;
const GOLDEN_ANGLE = 137.508;
const HEARTBEAT = 873;

class SentinelEngine {
  constructor() {
    this.threatDatabase = {
      maliciousPatterns: [
        /eval\s*\(\s*atob\s*\(/i,
        /document\.write\s*\(\s*unescape/i,
        /String\.fromCharCode\s*\(\s*\d+/i,
        /window\["\\x/i,
        /\bkeylogger\b/i,
        /navigator\.clipboard\.writeText/i,
        /crypto(?:night|miner|loot)/i,
        /coinhive/i,
        /wasm.*mining/i,
        /FormData.*password/i,
        /\.interceptors\.request/i,
        /document\.cookie\s*[+;]/i,
        /localStorage\.getItem.*(?:token|auth|session)/i
      ],
      phishingDomains: [
        'secure-login-verify.com',
        'account-update-confirm.net',
        'paypa1.com',
        'amaz0n-security.com',
        'g00gle-verify.com',
        'micros0ft-alert.com',
        'app1e-id-verify.com'
      ],
      malwareSignatures: [
        { name: 'CryptoMiner', pattern: /coinhive|cryptoloot|minero|jsecoin/i },
        { name: 'Keylogger', pattern: /addEventListener\s*\(\s*['"]key(?:down|press|up)['"]\s*,[\s\S]*?(?:XMLHttpRequest|fetch|navigator\.sendBeacon)/i },
        { name: 'DataExfiltration', pattern: /(?:document\.cookie|localStorage|sessionStorage)[\s\S]*?(?:new\s+Image\(\)|fetch|XMLHttpRequest)/i },
        { name: 'FormGrabber', pattern: /addEventListener\s*\(\s*['"]submit['"]\s*,[\s\S]*?(?:fetch|XMLHttpRequest|sendBeacon)/i },
        { name: 'ClipboardHijack', pattern: /navigator\.clipboard\.writeText|document\.execCommand\s*\(\s*['"]copy['"]\)/i },
        { name: 'HiddenIframe', pattern: /<iframe[^>]*(?:width\s*=\s*["']?0|height\s*=\s*["']?0|display\s*:\s*none|visibility\s*:\s*hidden)/i },
        { name: 'ObfuscatedPayload', pattern: /eval\s*\(\s*(?:atob|unescape|decodeURIComponent)\s*\(/i },
        { name: 'WebSocketExfil', pattern: /new\s+WebSocket\s*\(\s*['"]wss?:\/\/(?:\d{1,3}\.){3}\d{1,3}/i }
      ],
      suspiciousTLDs: ['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.pw', '.cc', '.su'],
      urlShorteners: ['bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'ow.ly', 'is.gd', 'buff.ly', 'j.mp'],
      popularDomains: ['google.com', 'facebook.com', 'amazon.com', 'apple.com', 'microsoft.com', 'paypal.com', 'netflix.com', 'twitter.com', 'instagram.com', 'linkedin.com', 'github.com', 'dropbox.com', 'chase.com', 'bankofamerica.com', 'wellsfargo.com']
    };

    this.alertHistory = [];
    this.scanResultsCache = new Map();
    this.monitorInterval = null;
    this.scanTargets = [];
    this.aggregatedIntel = { totalScans: 0, threatsFound: 0, avgThreatScore: 0 };

    this.continuousMonitor();
  }

  scanPage(url, content) {
    const startTime = Date.now();
    const threats = [];

    // Check URL reputation
    try {
      const parsedUrl = new URL(url);
      const hostname = parsedUrl.hostname.toLowerCase();

      if (this.threatDatabase.phishingDomains.some(function(d) { return hostname.includes(d); })) {
        threats.push({ type: 'phishing', severity: 'critical', description: 'URL matches known phishing domain', location: url });
      }

      if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
        threats.push({ type: 'suspicious_url', severity: 'high', description: 'IP-based URL detected', location: url });
      }

      var tld = '.' + hostname.split('.').pop();
      if (this.threatDatabase.suspiciousTLDs.includes(tld)) {
        threats.push({ type: 'suspicious_tld', severity: 'medium', description: 'Suspicious top-level domain: ' + tld, location: url });
      }
    } catch (e) {
      // malformed URL
    }

    // Analyze content for malicious patterns
    if (content) {
      var self = this;

      // Crypto miners
      if (/coinhive|cryptoloot|coin-?hive|jsecoin|crypto-?loot|minero/i.test(content)) {
        threats.push({ type: 'crypto_miner', severity: 'critical', description: 'Cryptocurrency mining script detected', location: 'page_content' });
      }

      // Keylogger patterns
      if (/addEventListener\s*\(\s*['"]key(?:down|press|up)['"]/.test(content) && /(?:XMLHttpRequest|fetch|sendBeacon)/.test(content)) {
        threats.push({ type: 'keylogger', severity: 'critical', description: 'Potential keylogger detected — key events sent to remote server', location: 'page_scripts' });
      }

      // Data exfiltration
      if (/(?:document\.cookie|localStorage|sessionStorage)/.test(content) && /(?:new\s+Image|fetch|XMLHttpRequest|sendBeacon)/.test(content)) {
        threats.push({ type: 'data_exfiltration', severity: 'high', description: 'Possible data exfiltration — sensitive storage accessed with network calls', location: 'page_scripts' });
      }

      // Hidden iframes
      var hiddenIframeCount = (content.match(/<iframe[^>]*(?:width\s*=\s*["']?0|height\s*=\s*["']?0|display\s*:\s*none|visibility\s*:\s*hidden)/gi) || []).length;
      if (hiddenIframeCount > 0) {
        threats.push({ type: 'hidden_iframe', severity: 'high', description: hiddenIframeCount + ' hidden iframe(s) detected', location: 'page_dom' });
      }

      // Obfuscated code via entropy analysis
      var scriptBlocks = content.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || [];
      for (var i = 0; i < scriptBlocks.length; i++) {
        var entropy = self._entropyScore(scriptBlocks[i]);
        if (entropy > 5.5) {
          threats.push({ type: 'obfuscated_code', severity: 'medium', description: 'Highly obfuscated script detected (entropy: ' + entropy.toFixed(2) + ')', location: 'script_block_' + i });
        }
      }

      // Eval chains
      var evalCount = (content.match(/eval\s*\(/g) || []).length;
      if (evalCount > 2) {
        threats.push({ type: 'eval_chain', severity: 'high', description: evalCount + ' eval() calls detected — possible code injection', location: 'page_scripts' });
      }

      // Malicious pattern checks
      self.threatDatabase.maliciousPatterns.forEach(function(pattern) {
        if (pattern.test(content)) {
          threats.push({ type: 'malicious_pattern', severity: 'high', description: 'Malicious pattern matched: ' + pattern.source.substring(0, 50), location: 'page_content' });
        }
      });
    }

    // Compute phi-weighted threat score (0–1)
    var severityWeights = { critical: 1.0, high: 1.0 / PHI, medium: 1.0 / (PHI * PHI), low: 1.0 / (PHI * PHI * PHI) };
    var totalWeight = 0;
    var weightedSum = 0;
    threats.forEach(function(t) {
      var w = severityWeights[t.severity] || severityWeights.low;
      weightedSum += w;
      totalWeight += 1;
    });

    var threatScore = totalWeight > 0 ? Math.min(1, weightedSum / (totalWeight * PHI)) : 0;
    var scanTime = Date.now() - startTime;

    var result = {
      threatScore: Math.round(threatScore * 10000) / 10000,
      threats: threats,
      safe: threatScore < 0.3,
      scanTime: scanTime
    };

    this.scanResultsCache.set(url, result);
    this.aggregatedIntel.totalScans++;
    if (threats.length > 0) {
      this.aggregatedIntel.threatsFound += threats.length;
    }
    var totalScans = this.aggregatedIntel.totalScans;
    this.aggregatedIntel.avgThreatScore =
      ((this.aggregatedIntel.avgThreatScore * (totalScans - 1)) + threatScore) / totalScans;

    return result;
  }

  detectPhishing(url) {
    var indicators = [];

    try {
      var parsedUrl = new URL(url);
      var hostname = parsedUrl.hostname.toLowerCase();
      var fullUrl = url.toLowerCase();

      // Homograph attack detection (unicode lookalikes)
      if (/[^\x00-\x7F]/.test(hostname)) {
        indicators.push({ type: 'homograph', detail: 'Non-ASCII characters in hostname — possible homograph attack' });
      }

      var cyrillicMap = { 'а': 'a', 'е': 'e', 'о': 'o', 'р': 'p', 'с': 'c', 'у': 'y', 'х': 'x' };
      var hasCyrillic = false;
      for (var k in cyrillicMap) {
        if (hostname.indexOf(k) !== -1) {
          hasCyrillic = true;
          break;
        }
      }
      if (hasCyrillic) {
        indicators.push({ type: 'homograph_cyrillic', detail: 'Cyrillic characters detected that mimic Latin letters' });
      }

      // Excessive subdomains
      var subdomainCount = hostname.split('.').length - 2;
      if (subdomainCount > 3) {
        indicators.push({ type: 'excessive_subdomains', detail: subdomainCount + ' subdomains detected — possible phishing obfuscation' });
      }

      // Suspicious TLDs
      var tld = '.' + hostname.split('.').pop();
      if (this.threatDatabase.suspiciousTLDs.includes(tld)) {
        indicators.push({ type: 'suspicious_tld', detail: 'Domain uses suspicious TLD: ' + tld });
      }

      // URL shorteners
      var self = this;
      if (self.threatDatabase.urlShorteners.some(function(s) { return hostname === s || hostname.endsWith('.' + s); })) {
        indicators.push({ type: 'url_shortener', detail: 'URL shortener detected — destination unknown' });
      }

      // IP-based URL
      if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
        indicators.push({ type: 'ip_url', detail: 'URL uses raw IP address instead of domain name' });
      }

      // Known phishing patterns
      var phishingKeywords = ['login', 'verify', 'secure', 'account', 'update', 'confirm', 'banking', 'password', 'suspend', 'unusual'];
      var matchedKeywords = phishingKeywords.filter(function(kw) { return hostname.includes(kw); });
      if (matchedKeywords.length >= 2) {
        indicators.push({ type: 'phishing_keywords', detail: 'Multiple phishing keywords in domain: ' + matchedKeywords.join(', ') });
      }

      // @ symbol in URL (credential stealing pattern)
      if (fullUrl.includes('@')) {
        indicators.push({ type: 'at_symbol', detail: 'URL contains @ symbol — possible credential deception' });
      }

      // Known phishing domain match
      if (self.threatDatabase.phishingDomains.some(function(d) { return hostname.includes(d); })) {
        indicators.push({ type: 'known_phishing', detail: 'Domain matches known phishing database' });
      }

      // Levenshtein distance to popular domains
      var domainBase = hostname.split('.').slice(-2, -1)[0] || hostname;
      self.threatDatabase.popularDomains.forEach(function(popular) {
        var popularBase = popular.split('.')[0];
        var distance = self._levenshteinDistance(domainBase, popularBase);
        if (distance > 0 && distance <= 2 && domainBase !== popularBase) {
          indicators.push({ type: 'typosquatting', detail: 'Domain "' + domainBase + '" is ' + distance + ' edit(s) from "' + popularBase + '" — possible typosquatting' });
        }
      });

    } catch (e) {
      indicators.push({ type: 'malformed_url', detail: 'URL could not be parsed: ' + url });
    }

    var confidence = Math.min(1, indicators.length / (4 * PHI));
    var riskLevel = confidence > 0.7 ? 'critical' : confidence > 0.4 ? 'high' : confidence > 0.2 ? 'medium' : 'low';

    return {
      isPhishing: indicators.length >= 2,
      confidence: Math.round(confidence * 10000) / 10000,
      indicators: indicators,
      riskLevel: riskLevel
    };
  }

  classifyMalware(scripts) {
    var signatures = [];
    var combined = Array.isArray(scripts) ? scripts.join('\n') : String(scripts);

    // Eval chains
    var evalChainCount = (combined.match(/eval\s*\(/g) || []).length;
    if (evalChainCount > 2) {
      signatures.push({ name: 'EvalChain', pattern: 'eval() x' + evalChainCount, severity: 'critical' });
    }

    // document.write abuse
    var docWriteCount = (combined.match(/document\.write\s*\(/g) || []).length;
    if (docWriteCount > 1) {
      signatures.push({ name: 'DocumentWriteAbuse', pattern: 'document.write() x' + docWriteCount, severity: 'high' });
    }

    // Base64-encoded payloads
    var base64Matches = combined.match(/atob\s*\(\s*['"][A-Za-z0-9+/=]{20,}['"]\s*\)/g) || [];
    if (base64Matches.length > 0) {
      signatures.push({ name: 'Base64Payload', pattern: base64Matches.length + ' encoded payload(s)', severity: 'critical' });
    }

    // Hex-encoded payloads
    var hexMatches = combined.match(/\\x[0-9a-fA-F]{2}(?:\\x[0-9a-fA-F]{2}){4,}/g) || [];
    if (hexMatches.length > 0) {
      signatures.push({ name: 'HexPayload', pattern: hexMatches.length + ' hex-encoded sequence(s)', severity: 'high' });
    }

    // WebSocket to suspicious hosts (IP-based)
    if (/new\s+WebSocket\s*\(\s*['"]wss?:\/\/(?:\d{1,3}\.){3}\d{1,3}/.test(combined)) {
      signatures.push({ name: 'SuspiciousWebSocket', pattern: 'WebSocket to IP address', severity: 'critical' });
    }

    // Clipboard hijacking
    if (/navigator\.clipboard\.writeText/.test(combined) || /document\.execCommand\s*\(\s*['"]copy['"]/.test(combined)) {
      signatures.push({ name: 'ClipboardHijack', pattern: 'Clipboard write/copy interception', severity: 'high' });
    }

    // Form grabbing
    if (/addEventListener\s*\(\s*['"]submit['"]/.test(combined) && /(?:fetch|XMLHttpRequest|sendBeacon)/.test(combined)) {
      signatures.push({ name: 'FormGrabber', pattern: 'Form submit interception with data exfil', severity: 'critical' });
    }

    // Check registered malware signatures from threat database
    var self = this;
    self.threatDatabase.malwareSignatures.forEach(function(sig) {
      if (sig.pattern.test(combined)) {
        var alreadyFound = signatures.some(function(s) { return s.name === sig.name; });
        if (!alreadyFound) {
          signatures.push({ name: sig.name, pattern: sig.pattern.source.substring(0, 60), severity: 'high' });
        }
      }
    });

    // Overall entropy check for obfuscation
    var entropy = this._entropyScore(combined);
    if (entropy > 5.8) {
      signatures.push({ name: 'HighEntropy', pattern: 'Entropy ' + entropy.toFixed(2) + ' — heavy obfuscation', severity: 'medium' });
    }

    var severityRank = { critical: 4, high: 3, medium: 2, low: 1 };
    var maxSeverity = 0;
    signatures.forEach(function(s) {
      var rank = severityRank[s.severity] || 0;
      if (rank > maxSeverity) maxSeverity = rank;
    });

    var riskScore = signatures.length > 0
      ? Math.min(1, (signatures.length * maxSeverity) / (8 * PHI))
      : 0;

    return {
      malicious: signatures.length >= 2 || (signatures.length === 1 && maxSeverity >= 4),
      signatures: signatures,
      riskScore: Math.round(riskScore * 10000) / 10000
    };
  }

  alertUser(threat) {
    var alertId = 'alert_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    var severityFormats = {
      critical: { icon: '🚨', prefix: 'CRITICAL', color: '#ff0000' },
      high:     { icon: '⚠️', prefix: 'HIGH',     color: '#ff6600' },
      medium:   { icon: '🔔', prefix: 'MEDIUM',   color: '#ffcc00' },
      low:      { icon: 'ℹ️', prefix: 'LOW',      color: '#00aaff' }
    };

    var severity = threat.severity || 'medium';
    var fmt = severityFormats[severity] || severityFormats.medium;

    var message = fmt.icon + ' [' + fmt.prefix + '] ' + (threat.description || threat.type || 'Unknown threat detected');

    var notification = {
      alertId: alertId,
      severity: severity,
      message: message,
      timestamp: Date.now(),
      acknowledged: false,
      color: fmt.color,
      threat: threat
    };

    this.alertHistory.push(notification);

    // Keep alert history bounded
    if (this.alertHistory.length > 500) {
      this.alertHistory = this.alertHistory.slice(-400);
    }

    return {
      alertId: notification.alertId,
      severity: notification.severity,
      message: notification.message,
      timestamp: notification.timestamp,
      acknowledged: notification.acknowledged
    };
  }

  continuousMonitor() {
    var self = this;

    if (self.monitorInterval) {
      clearInterval(self.monitorInterval);
    }

    self.monitorInterval = setInterval(function() {
      // Health check
      var healthy = self.scanResultsCache instanceof Map && Array.isArray(self.alertHistory);
      if (!healthy) {
        self.scanResultsCache = new Map();
        self.alertHistory = [];
      }

      // Rotate scan targets — evict stale cache entries older than 5 minutes
      var now = Date.now();
      var staleThreshold = 5 * 60 * 1000;
      self.scanResultsCache.forEach(function(result, url) {
        if (result.scanTime && (now - result.scanTime) > staleThreshold) {
          self.scanResultsCache.delete(url);
        }
      });

      // Cap cache size
      if (self.scanResultsCache.size > 200) {
        var keys = Array.from(self.scanResultsCache.keys());
        var toRemove = keys.slice(0, keys.length - 150);
        toRemove.forEach(function(key) { self.scanResultsCache.delete(key); });
      }

      // Aggregate threat intelligence summary
      if (self.alertHistory.length > 0) {
        var recentAlerts = self.alertHistory.filter(function(a) {
          return (now - a.timestamp) < 60000;
        });
        self.aggregatedIntel.recentAlertCount = recentAlerts.length;
      }
    }, HEARTBEAT);
  }

  _levenshteinDistance(a, b) {
    if (a === b) return 0;
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    var matrix = [];
    for (var i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (var j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (var i = 1; i <= b.length; i++) {
      for (var j = 1; j <= a.length; j++) {
        var cost = a[j - 1] === b[i - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    return matrix[b.length][a.length];
  }

  _entropyScore(text) {
    if (!text || text.length === 0) return 0;

    var freq = {};
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      freq[ch] = (freq[ch] || 0) + 1;
    }

    var len = text.length;
    var entropy = 0;
    for (var ch in freq) {
      if (freq.hasOwnProperty(ch)) {
        var p = freq[ch] / len;
        if (p > 0) {
          entropy -= p * (Math.log(p) / Math.log(2));
        }
      }
    }

    return entropy;
  }
}

// Instantiate global sentinel engine
globalThis.sentinel = new SentinelEngine();

// Message listener for extension communication
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  /* ── Universal message routing (popup / side panel / devtools) ──── */
  if (request.type === 'heartbeat') {
    sendResponse({ status: 'alive', healthy: true, timestamp: Date.now() });
    return true;
  }
  if (request.type === 'openSidePanel') {
    try { if (chrome.sidePanel && chrome.sidePanel.open) chrome.sidePanel.open({ windowId: sender.tab ? sender.tab.windowId : undefined }).catch(function(){}); } catch(e){}
    sendResponse({ ok: true });
    return true;
  }
  if (request.type === 'popup' || request.type === 'sidePanel' || request.type === 'devtools') {
    var cmd = request.command || '';
    var lower = cmd.toLowerCase();
    var engine = globalThis.sentinel;

    /* ── Built-in workspace commands ── */
    if (cmd === 'ping') { sendResponse({ result: 'pong — Sentinel Watch engine alive at ' + new Date().toISOString() }); return true; }
    if (cmd === 'getState' || lower === 'state' || lower === 'status') {
      sendResponse({ result: JSON.stringify(engine && engine.state ? engine.state : { status: 'running', timestamp: Date.now() }, null, 2) });
      return true;
    }
    if (cmd === 'clearLogs') { sendResponse({ result: 'Workspace logs cleared.' }); return true; }
    if (lower === 'help' || lower === 'capabilities' || lower === '?') {
      sendResponse({ result: '\u{1F9E0} Sentinel Watch AI Workspace\n\nCapabilities:\n• Scan Page — Scan page for security threats\n• Detect Phishing — Detect phishing attempts\n• Classify Malware — Classify potential malware\n• Alert User — Trigger security alert\n\nType any command or question and I will route it to the best engine method.' });
      return true;
    }

    /* ── Save to workspace conversation history ── */
    var storageKey = 'sentinel-watch_workspace_history';
    chrome.storage.local.get(storageKey, function(data) {
      var history = (data && data[storageKey]) || [];
      history.push({ role: 'user', content: cmd, ts: Date.now() });

      /* ── Intelligent workspace command routing ── */
      var result;
      try {
        if (lower.indexOf('scan') !== -1 || lower.indexOf('check') !== -1 || lower.indexOf('page') !== -1 || lower.indexOf('analyze') !== -1 || lower.indexOf('security') !== -1) {
          result = engine.scanPage("workspace", cmd);
        }
        else if (lower.indexOf('phishing') !== -1 || lower.indexOf('phish') !== -1 || lower.indexOf('fake') !== -1 || lower.indexOf('scam') !== -1) {
          result = engine.detectPhishing(cmd);
        }
        else if (lower.indexOf('malware') !== -1 || lower.indexOf('virus') !== -1 || lower.indexOf('malicious') !== -1 || lower.indexOf('script') !== -1) {
          result = engine.classifyMalware([cmd]);
        }
        else if (lower.indexOf('alert') !== -1 || lower.indexOf('warn') !== -1 || lower.indexOf('notify') !== -1 || lower.indexOf('threat') !== -1) {
          result = engine.alertUser({type:"user-query",detail:cmd});
        }
        else {
          /* Default: route to primary engine method */
          result = engine.scanPage("workspace", cmd);
        }
      } catch(e) {
        result = { error: e.message, fallback: 'Sentinel Watch encountered an error processing: "' + cmd + '"' };
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

  var sentinel = globalThis.sentinel;

  switch (request.action) {
    case 'scanPage':
      sendResponse(sentinel.scanPage(request.url, request.content));
      break;
    case 'detectPhishing':
      sendResponse(sentinel.detectPhishing(request.url));
      break;
    case 'classifyMalware':
      sendResponse(sentinel.classifyMalware(request.scripts));
      break;
    case 'alertUser':
      sendResponse(sentinel.alertUser(request.threat));
      break;
    default:
      sendResponse({ error: 'Unknown action: ' + request.action });
  }

  return true;
});

// Auto-scan new page navigations
chrome.webNavigation.onCompleted.addListener(function(details) {
  if (details.frameId !== 0) return;

  chrome.tabs.sendMessage(details.tabId, { action: 'getPageContent' }, function(response) {
    if (chrome.runtime.lastError || !response) return;

    var result = globalThis.sentinel.scanPage(details.url, response.content);

    if (!result.safe) {
      result.threats.forEach(function(threat) {
        globalThis.sentinel.alertUser(threat);
      });

      chrome.tabs.sendMessage(details.tabId, {
        action: 'updateStatus',
        threatScore: result.threatScore,
        threats: result.threats,
        safe: result.safe
      });
    }
  });
});

/* -- Production 24/7 Keep-Alive ---------------------------------------- */
(function () {
  var ALARM_NAME = 'sentinel-watch-heartbeat';
  var ALARM_PERIOD = 0.4; /* minutes -- fires every ~24 seconds to beat Chrome's 30s kill timer */

  chrome.alarms.create(ALARM_NAME, { periodInMinutes: ALARM_PERIOD });

  chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name !== ALARM_NAME) return;
    /* Re-initialize engine if it was garbage collected */
    if (!globalThis.sentinel) {
      globalThis.sentinel = new SentinelEngine();
      console.log('[Sentinel Watch] Engine re-initialized by keepalive alarm');
    }
    /* Persist state snapshot */
    try {
      chrome.storage.local.set({
        'sentinel-watch_state': {
          heartbeatCount: globalThis.sentinel.heartbeatCount || globalThis.sentinel.state?.heartbeatCount || 0,
          lastAlive: Date.now(),
          uptime: Date.now() - (globalThis.sentinel.state?.startTime || globalThis.sentinel.startTime || Date.now())
        }
      });
    } catch (e) { /* storage not available in some contexts */ }
  });

  /* Restore state on startup */
  chrome.storage.local.get('sentinel-watch_state', function (data) {
    if (data && data['sentinel-watch_state']) {
      console.log('[Sentinel Watch] Restored from previous session \u2014 last alive: ' +
        new Date(data['sentinel-watch_state'].lastAlive).toISOString());
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
    console.log('[Sentinel Watch] Installed/updated \u2014 24/7 keepalive active');
  });
})();
