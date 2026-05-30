/* Pattern Forge — Background Service Worker (EXT-025)
 *
 * X-ray mathematics engine. The underlying math that sees through noise
 * to fundamentals. Square-root normalization, spectral decomposition,
 * cross-system correlation, z-depth analysis, phi-harmonic pattern
 * recognition across spreads and data. This is the math brain.
 */

var PHI = 1.618033988749895;
var GOLDEN_ANGLE = 137.508;
var HEARTBEAT = 873;

class PatternForgeEngine {
  constructor() {
    this.startTime = Date.now();
    this.analysisCount = 0;
    this.state = { initialized: true, heartbeatCount: 0 };
    this._startHeartbeat();
  }

  /* ── X-ray Depth Analysis ──────────────────────────────── */
  /* Square-root normalize, compute z-depth at every point,
     separate signal from noise using phi as the threshold */
  xrayDepth(values) {
    this.analysisCount++;
    if (!values || values.length < 2) return { error: 'Need at least 2 values' };

    var n = values.length;
    var sqrtN = Math.sqrt(n);

    /* Square-root normalization: x_norm = x / sqrt(sum(x^2)) */
    var sumSq = 0;
    for (var i = 0; i < n; i++) sumSq += values[i] * values[i];
    var norm = Math.sqrt(sumSq);
    var normalized = [];
    for (var j = 0; j < n; j++) normalized.push(norm > 0 ? values[j] / norm : 0);

    /* Statistics on normalized */
    var mean = this._mean(normalized);
    var sd = this._stddev(normalized);
    var se = sd / sqrtN;

    /* Z-depth: how many standard errors each point deviates */
    var depths = [];
    var signals = 0;
    for (var k = 0; k < n; k++) {
      var z = se > 0 ? (normalized[k] - mean) / se : 0;
      var phiDepth = Math.abs(z) / PHI;
      var isSignal = Math.abs(z) > PHI;
      if (isSignal) signals++;
      depths.push({
        index: k,
        raw: Math.round(values[k] * 10000) / 10000,
        normalized: Math.round(normalized[k] * 10000) / 10000,
        zScore: Math.round(z * 1000) / 1000,
        phiDepth: Math.round(phiDepth * 1000) / 1000,
        isSignal: isSignal,
        classification: Math.abs(z) > 3 ? 'extreme' : Math.abs(z) > PHI * PHI ? 'strong' : isSignal ? 'signal' : 'noise'
      });
    }

    return {
      n: n, sqrtN: Math.round(sqrtN * 1000) / 1000,
      mean: Math.round(mean * 10000) / 10000,
      stddev: Math.round(sd * 10000) / 10000,
      stderror: Math.round(se * 10000) / 10000,
      signalCount: signals, noiseCount: n - signals,
      signalRatio: Math.round((signals / n) * 1000) / 1000,
      depths: depths
    };
  }

  /* ── Spectral Decomposition (DFT magnitudes) ───────────── */
  /* Discrete Fourier Transform to find hidden periodicities */
  spectralDecompose(values) {
    this.analysisCount++;
    if (!values || values.length < 4) return { error: 'Need at least 4 values' };

    var n = values.length;
    var mean = this._mean(values);
    var centered = values.map(function (v) { return v - mean; });

    var magnitudes = [];
    var halfN = Math.floor(n / 2);

    for (var k = 0; k <= halfN; k++) {
      var re = 0, im = 0;
      for (var t = 0; t < n; t++) {
        var angle = 2 * Math.PI * k * t / n;
        re += centered[t] * Math.cos(angle);
        im -= centered[t] * Math.sin(angle);
      }
      var mag = Math.sqrt(re * re + im * im) / n;
      var phase = Math.atan2(im, re);
      var period = k > 0 ? n / k : Infinity;
      magnitudes.push({
        frequency: k,
        magnitude: Math.round(mag * 10000) / 10000,
        phase: Math.round(phase * 1000) / 1000,
        period: k > 0 ? Math.round(period * 100) / 100 : null,
        phiHarmonic: k > 0 ? Math.round((period / PHI) * 100) / 100 : null,
        isPhiResonant: k > 0 && Math.abs(period - PHI * Math.round(period / PHI)) < 0.5
      });
    }

    /* Sort by magnitude descending */
    var sorted = magnitudes.slice().sort(function (a, b) { return b.magnitude - a.magnitude; });
    var dominant = sorted.slice(0, 5);

    return {
      n: n, fundamentalFrequencies: dominant,
      allFrequencies: magnitudes,
      dominantPeriod: dominant[0] && dominant[0].period ? dominant[0].period : null,
      spectralEnergy: magnitudes.reduce(function (s, m) { return s + m.magnitude * m.magnitude; }, 0)
    };
  }

  /* ── Cross-System Correlation Matrix ───────────────────── */
  /* Pearson correlation between multiple series — finds where
     systems move together and where they diverge (free lunch) */
  crossCorrelation(systems) {
    this.analysisCount++;
    var names = Object.keys(systems);
    if (names.length < 2) return { error: 'Need at least 2 systems' };

    var matrix = {};
    var opportunities = [];

    for (var i = 0; i < names.length; i++) {
      matrix[names[i]] = {};
      for (var j = 0; j < names.length; j++) {
        if (i === j) { matrix[names[i]][names[j]] = 1; continue; }
        var r = this._pearson(systems[names[i]], systems[names[j]]);
        matrix[names[i]][names[j]] = Math.round(r * 1000) / 1000;

        if (i < j) {
          var absR = Math.abs(r);
          var type = absR > 0.8 ? 'high-correlation' : absR < 0.2 ? 'independent' : 'moderate';
          var opp = {
            pair: [names[i], names[j]],
            correlation: Math.round(r * 1000) / 1000,
            type: type,
            phiScore: Math.round(Math.abs(1 - absR / PHI) * 1000) / 1000
          };

          /* Free lunch detection: previously correlated, now diverging */
          if (systems[names[i]].length > 10) {
            var firstHalf = this._pearson(
              systems[names[i]].slice(0, Math.floor(systems[names[i]].length / 2)),
              systems[names[j]].slice(0, Math.floor(systems[names[j]].length / 2))
            );
            var secondHalf = this._pearson(
              systems[names[i]].slice(Math.floor(systems[names[i]].length / 2)),
              systems[names[j]].slice(Math.floor(systems[names[j]].length / 2))
            );
            var drift = Math.abs(firstHalf - secondHalf);
            opp.correlationDrift = Math.round(drift * 1000) / 1000;
            opp.isFreeLunch = drift > 0.5 && Math.abs(firstHalf) > 0.6;
            if (opp.isFreeLunch) {
              opp.freeLunchReason = names[i] + ' and ' + names[j] + ' were correlated at ' +
                Math.round(firstHalf * 100) + '% but diverged to ' + Math.round(secondHalf * 100) + '% — mean reversion expected';
            }
          }
          opportunities.push(opp);
        }
      }
    }

    opportunities.sort(function (a, b) { return (b.isFreeLunch ? 1 : 0) - (a.isFreeLunch ? 1 : 0) || b.phiScore - a.phiScore; });

    return { matrix: matrix, opportunities: opportunities, systemCount: names.length };
  }

  /* ── Mean Reversion Scanner ────────────────────────────── */
  meanReversion(values, lookback) {
    this.analysisCount++;
    if (!lookback) lookback = Math.max(5, Math.floor(values.length / PHI));
    if (values.length < lookback + 1) return { error: 'Need more data than lookback period' };

    var results = [];
    for (var i = lookback; i < values.length; i++) {
      var window = values.slice(i - lookback, i);
      var wMean = this._mean(window);
      var wSd = this._stddev(window);
      var current = values[i];
      var z = wSd > 0 ? (current - wMean) / wSd : 0;
      var isExtreme = Math.abs(z) > PHI;

      results.push({
        index: i, value: current,
        rollingMean: Math.round(wMean * 1000) / 1000,
        rollingStd: Math.round(wSd * 1000) / 1000,
        zScore: Math.round(z * 1000) / 1000,
        deviation: Math.round((current - wMean) * 1000) / 1000,
        isExtreme: isExtreme,
        signal: z > PHI ? 'overbought' : z < -PHI ? 'oversold' : 'neutral',
        revertTarget: Math.round(wMean * 1000) / 1000
      });
    }

    var extremes = results.filter(function (r) { return r.isExtreme; });
    return {
      lookback: lookback,
      totalPoints: results.length,
      extremeCount: extremes.length,
      currentSignal: results.length > 0 ? results[results.length - 1].signal : 'unknown',
      results: results,
      extremes: extremes
    };
  }

  /* ── Anomaly Detection (IQR + phi) ─────────────────────── */
  detectAnomalies(values) {
    this.analysisCount++;
    var sorted = values.slice().sort(function (a, b) { return a - b; });
    var n = sorted.length;
    var q1 = sorted[Math.floor(n * 0.25)];
    var q3 = sorted[Math.floor(n * 0.75)];
    var iqr = q3 - q1;
    var lowerFence = q1 - PHI * iqr;
    var upperFence = q3 + PHI * iqr;

    var anomalies = [];
    for (var i = 0; i < values.length; i++) {
      if (values[i] < lowerFence || values[i] > upperFence) {
        anomalies.push({
          index: i, value: values[i],
          type: values[i] < lowerFence ? 'low-outlier' : 'high-outlier',
          distance: Math.round(Math.min(Math.abs(values[i] - lowerFence), Math.abs(values[i] - upperFence)) * 1000) / 1000
        });
      }
    }

    return {
      q1: Math.round(q1 * 1000) / 1000, q3: Math.round(q3 * 1000) / 1000,
      iqr: Math.round(iqr * 1000) / 1000,
      lowerFence: Math.round(lowerFence * 1000) / 1000,
      upperFence: Math.round(upperFence * 1000) / 1000,
      phiMultiplier: PHI,
      anomalyCount: anomalies.length,
      anomalies: anomalies
    };
  }

  /* ── Helpers ────────────────────────────────────────────── */
  _mean(arr) { var s = 0; for (var i = 0; i < arr.length; i++) s += arr[i]; return arr.length > 0 ? s / arr.length : 0; }
  _stddev(arr) { if (arr.length < 2) return 0; var m = this._mean(arr); var s = 0; for (var i = 0; i < arr.length; i++) s += (arr[i] - m) * (arr[i] - m); return Math.sqrt(s / (arr.length - 1)); }
  _pearson(x, y) {
    var n = Math.min(x.length, y.length);
    if (n < 3) return 0;
    var mx = this._mean(x.slice(0, n)), my = this._mean(y.slice(0, n));
    var num = 0, dx = 0, dy = 0;
    for (var i = 0; i < n; i++) {
      var a = x[i] - mx, b = y[i] - my;
      num += a * b; dx += a * a; dy += b * b;
    }
    var den = Math.sqrt(dx * dy);
    return den > 0 ? num / den : 0;
  }

  _startHeartbeat() {
    var self = this;
    setInterval(function () { self.state.heartbeatCount++; }, HEARTBEAT);
  }
}

globalThis.patternForge = new PatternForgeEngine();

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
    var engine = globalThis.patternForge;

    /* ── Built-in workspace commands ── */
    if (cmd === 'ping') { sendResponse({ result: 'pong — Pattern Forge engine alive at ' + new Date().toISOString() }); return true; }
    if (cmd === 'getState' || lower === 'state' || lower === 'status') {
      sendResponse({ result: JSON.stringify(engine && engine.state ? engine.state : { status: 'running', timestamp: Date.now() }, null, 2) });
      return true;
    }
    if (cmd === 'clearLogs') { sendResponse({ result: 'Workspace logs cleared.' }); return true; }
    if (lower === 'help' || lower === 'capabilities' || lower === '?') {
      sendResponse({ result: '\u{1F9E0} Pattern Forge AI Workspace\n\nCapabilities:\n• Xray Depth — X-ray depth analysis on values\n• Spectral Decompose — Spectral decomposition\n• Cross Correlation — Cross-correlation analysis\n• Mean Reversion — Mean reversion detection\n• Detect Anomalies — Detect anomalies in data\n\nType any command or question and I will route it to the best engine method.' });
      return true;
    }

    /* ── Save to workspace conversation history ── */
    var storageKey = 'pattern-forge_workspace_history';
    chrome.storage.local.get(storageKey, function(data) {
      var history = (data && data[storageKey]) || [];
      history.push({ role: 'user', content: cmd, ts: Date.now() });

      /* ── Intelligent workspace command routing ── */
      var result;
      try {
        if (lower.indexOf('xray') !== -1 || lower.indexOf('depth') !== -1 || lower.indexOf('deep') !== -1 || lower.indexOf('analyze') !== -1) {
          result = engine.xrayDepth(cmd.split(",").map(Number).filter(function(n){return!isNaN(n)}));
        }
        else if (lower.indexOf('spectral') !== -1 || lower.indexOf('decompose') !== -1 || lower.indexOf('frequency') !== -1 || lower.indexOf('fft') !== -1) {
          result = engine.spectralDecompose(cmd.split(",").map(Number).filter(function(n){return!isNaN(n)}));
        }
        else if (lower.indexOf('correlat') !== -1 || lower.indexOf('cross') !== -1 || lower.indexOf('compare') !== -1) {
          result = engine.crossCorrelation({a:cmd.split(",").map(Number).filter(function(n){return!isNaN(n)})});
        }
        else if (lower.indexOf('mean') !== -1 || lower.indexOf('reversion') !== -1 || lower.indexOf('revert') !== -1 || lower.indexOf('average') !== -1) {
          result = engine.meanReversion(cmd.split(",").map(Number).filter(function(n){return!isNaN(n)}), 5);
        }
        else if (lower.indexOf('anomal') !== -1 || lower.indexOf('outlier') !== -1 || lower.indexOf('unusual') !== -1 || lower.indexOf('detect') !== -1) {
          result = engine.detectAnomalies(cmd.split(",").map(Number).filter(function(n){return!isNaN(n)}));
        }
        else {
          /* Default: route to primary engine method */
          result = engine.xrayDepth(cmd.split(",").map(Number).filter(function(n){return!isNaN(n)}));
        }
      } catch(e) {
        result = { error: e.message, fallback: 'Pattern Forge encountered an error processing: "' + cmd + '"' };
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

  var engine = globalThis.patternForge;
  switch (message.action) {
    case 'xrayDepth':
      sendResponse({ success: true, data: engine.xrayDepth(message.values) });
      break;
    case 'spectralDecompose':
      sendResponse({ success: true, data: engine.spectralDecompose(message.values) });
      break;
    case 'crossCorrelation':
      sendResponse({ success: true, data: engine.crossCorrelation(message.systems) });
      break;
    case 'meanReversion':
      sendResponse({ success: true, data: engine.meanReversion(message.values, message.lookback) });
      break;
    case 'detectAnomalies':
      sendResponse({ success: true, data: engine.detectAnomalies(message.values) });
      break;
    default:
      sendResponse({ success: false, error: 'Unknown action: ' + message.action });
  }
  return true;
});

/* ── Production 24/7 Keep-Alive ────────────────────────────── */
(function () {
  var ALARM_NAME = 'pattern-forge-heartbeat';
  var ALARM_PERIOD = 0.4;
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: ALARM_PERIOD });
  chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name !== ALARM_NAME) return;
    if (!globalThis.patternForge) {
      globalThis.patternForge = new PatternForgeEngine();
      console.log('[Pattern Forge] Engine re-initialized by keepalive alarm');
    }
    try {
      chrome.storage.local.set({ 'pattern-forge_state': { analysisCount: globalThis.patternForge.analysisCount || 0, lastAlive: Date.now() } });
    } catch (e) {}
  });
  chrome.storage.local.get('pattern-forge_state', function (data) {
    if (data && data['pattern-forge_state']) {
      console.log('[Pattern Forge] Restored — last alive: ' + new Date(data['pattern-forge_state'].lastAlive).toISOString());
    }
  });
  chrome.runtime.onInstalled.addListener(function () {
    /* Auto-activate side panel on install */
    if (chrome.sidePanel && chrome.sidePanel.setOptions) {
      chrome.sidePanel.setOptions({ enabled: true });
    }
    if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
      chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }).catch(function(){});
    }
    chrome.alarms.create(ALARM_NAME, { periodInMinutes: ALARM_PERIOD });
    console.log('[Pattern Forge] 24/7 keepalive active');
  });
})();
