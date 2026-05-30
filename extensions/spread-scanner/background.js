/* Spread Scanner — Background Service Worker (EXT-022) */

const PHI = 1.618033988749895;
const GOLDEN_ANGLE = 137.508;
const HEARTBEAT = 873;

class SpreadScannerEngine {
  constructor() {
    this.analysisCount = 0;
    this.startTime = Date.now();
    this._heartbeat = setInterval(() => {
      this.analysisCount = this.analysisCount || 0;
    }, HEARTBEAT);
    console.log('[Spread Scanner] Engine initialized — JARVIS online');
  }

  /* ── scanForNumbers ─────────────────────────────────────── */
  scanForNumbers(text) {
    if (!text || typeof text !== 'string') return [];
    const regex = /[-+]?\d{1,3}(?:[,]\d{3})*(?:\.\d+)?|\.\d+/g;
    const results = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      const raw = match[0].replace(/,/g, '');
      const value = parseFloat(raw);
      if (!isNaN(value)) {
        const start = Math.max(0, match.index - 20);
        const end = Math.min(text.length, match.index + match[0].length + 20);
        results.push({
          value: value,
          index: match.index,
          context: text.substring(start, end).trim()
        });
      }
    }
    this.analysisCount++;
    return results;
  }

  /* ── calculateStatistics ────────────────────────────────── */
  calculateStatistics(values) {
    if (!values || values.length === 0) return null;
    const n = values.length;
    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / n;
    const median = n % 2 === 0
      ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
      : sorted[Math.floor(n / 2)];
    const variance = values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / n;
    const stddev = Math.sqrt(variance);
    const phiWeightedStddev = stddev / PHI;

    let skewness = 0;
    let kurtosis = 0;
    if (stddev > 0) {
      skewness = values.reduce((s, v) => s + Math.pow((v - mean) / stddev, 3), 0) / n;
      kurtosis = values.reduce((s, v) => s + Math.pow((v - mean) / stddev, 4), 0) / n - 3;
    }

    const min = sorted[0];
    const max = sorted[n - 1];
    const range = max - min;
    const cv = mean !== 0 ? (stddev / Math.abs(mean)) * 100 : 0;

    return {
      mean: mean,
      median: median,
      stddev: stddev,
      phiWeightedStddev: phiWeightedStddev,
      skewness: skewness,
      kurtosis: kurtosis,
      min: min,
      max: max,
      range: range,
      coefficientOfVariation: cv,
      count: n
    };
  }

  /* ── detectSpreads ──────────────────────────────────────── */
  detectSpreads(values) {
    if (!values || values.length < 2) return [];
    const spreads = [];
    for (let i = 0; i < values.length; i++) {
      for (let j = i + 1; j < values.length; j++) {
        spreads.push({
          pair: [i, j],
          spread: Math.abs(values[i] - values[j]),
          valA: values[i],
          valB: values[j]
        });
      }
    }
    const spreadValues = spreads.map(s => s.spread);
    const stats = this.calculateStatistics(spreadValues);
    if (!stats || stats.stddev === 0) {
      return spreads.map(s => Object.assign(s, {
        zScore: 0,
        isAnomaly: false,
        phiScore: 0
      }));
    }

    return spreads.map(s => {
      const zScore = (s.spread - stats.mean) / stats.stddev;
      const phiScore = Math.abs(zScore) * PHI;
      return Object.assign(s, {
        zScore: zScore,
        isAnomaly: Math.abs(zScore) > PHI,
        phiScore: phiScore
      });
    }).sort((a, b) => b.phiScore - a.phiScore);
  }

  /* ── findPatterns ───────────────────────────────────────── */
  findPatterns(values) {
    if (!values || values.length < 3) return [];
    const patterns = [];
    const stats = this.calculateStatistics(values);
    if (!stats) return [];

    // Mean reversion detection
    for (let i = 0; i < values.length; i++) {
      if (stats.stddev > 0) {
        const z = Math.abs(values[i] - stats.mean) / stats.stddev;
        if (z > 2) {
          patterns.push({
            type: 'mean_reversion',
            confidence: Math.min(z / (2 * PHI), 1),
            description: 'Value ' + values[i].toFixed(2) + ' deviates ' + z.toFixed(2) + 'σ from mean — reversion likely',
            indices: [i]
          });
        }
      }
    }

    // Momentum detection
    let streak = 1;
    let direction = 0;
    for (let i = 1; i < values.length; i++) {
      const d = values[i] - values[i - 1];
      const curDir = d > 0 ? 1 : d < 0 ? -1 : 0;
      if (curDir === direction && curDir !== 0) {
        streak++;
      } else {
        if (streak >= 3) {
          const startIdx = i - streak;
          const indices = [];
          for (let k = startIdx; k < i; k++) indices.push(k);
          patterns.push({
            type: 'momentum',
            confidence: Math.min(streak / (5 * PHI), 1),
            description: (direction > 0 ? 'Bullish' : 'Bearish') + ' momentum: ' + streak + ' consecutive moves',
            indices: indices
          });
        }
        direction = curDir;
        streak = 1;
      }
    }
    if (streak >= 3) {
      const startIdx = values.length - streak;
      const indices = [];
      for (let k = startIdx; k < values.length; k++) indices.push(k);
      patterns.push({
        type: 'momentum',
        confidence: Math.min(streak / (5 * PHI), 1),
        description: (direction > 0 ? 'Bullish' : 'Bearish') + ' momentum: ' + streak + ' consecutive moves',
        indices: indices
      });
    }

    // Clustering via phi-ratio thresholds
    if (stats.range > 0) {
      const threshold = stats.range / (PHI * PHI);
      const sorted = values.map((v, i) => ({ v: v, i: i })).sort((a, b) => a.v - b.v);
      const clusters = [];
      let cluster = [sorted[0]];
      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i].v - sorted[i - 1].v <= threshold) {
          cluster.push(sorted[i]);
        } else {
          if (cluster.length >= 2) clusters.push([...cluster]);
          cluster = [sorted[i]];
        }
      }
      if (cluster.length >= 2) clusters.push(cluster);
      clusters.forEach((c, ci) => {
        const cValues = c.map(x => x.v);
        const cMean = cValues.reduce((a, b) => a + b, 0) / cValues.length;
        patterns.push({
          type: 'cluster',
          confidence: Math.min(c.length / values.length * PHI, 1),
          description: 'Cluster of ' + c.length + ' values near ' + cMean.toFixed(2),
          indices: c.map(x => x.i)
        });
      });
    }

    // Periodicity detection via autocorrelation at phi-ratio lags
    const phiLags = [1, 2, 3, 5, 8, 13];
    phiLags.forEach(lag => {
      if (lag >= values.length) return;
      let sumProd = 0;
      let sumSqA = 0;
      let sumSqB = 0;
      const pairs = values.length - lag;
      for (let i = 0; i < pairs; i++) {
        const a = values[i] - stats.mean;
        const b = values[i + lag] - stats.mean;
        sumProd += a * b;
        sumSqA += a * a;
        sumSqB += b * b;
      }
      const denom = Math.sqrt(sumSqA * sumSqB);
      if (denom > 0) {
        const r = sumProd / denom;
        if (Math.abs(r) > 0.6) {
          patterns.push({
            type: 'periodicity',
            confidence: Math.abs(r),
            description: 'Autocorrelation at lag ' + lag + ': r=' + r.toFixed(3) + (lag <= 3 ? ' (Fibonacci lag)' : ''),
            indices: []
          });
        }
      }
    });

    this.analysisCount++;
    return patterns.sort((a, b) => b.confidence - a.confidence);
  }

  /* ── buildCorrelationMatrix ─────────────────────────────── */
  buildCorrelationMatrix(series) {
    if (!series || series.length < 2) return { matrix: [], highlights: [] };
    const n = series.length;
    const matrix = [];
    const highlights = [];

    for (let i = 0; i < n; i++) {
      matrix[i] = [];
      for (let j = 0; j < n; j++) {
        if (i === j) {
          matrix[i][j] = 1;
          continue;
        }
        const a = series[i];
        const b = series[j];
        const len = Math.min(a.length, b.length);
        if (len < 2) { matrix[i][j] = 0; continue; }

        const meanA = a.slice(0, len).reduce((s, v) => s + v, 0) / len;
        const meanB = b.slice(0, len).reduce((s, v) => s + v, 0) / len;
        let sumProd = 0, sumSqA = 0, sumSqB = 0;
        for (let k = 0; k < len; k++) {
          const da = a[k] - meanA;
          const db = b[k] - meanB;
          sumProd += da * db;
          sumSqA += da * da;
          sumSqB += db * db;
        }
        const denom = Math.sqrt(sumSqA * sumSqB);
        const r = denom > 0 ? sumProd / denom : 0;
        matrix[i][j] = parseFloat(r.toFixed(6));

        if (i < j) {
          if (Math.abs(r) > 0.8) {
            highlights.push({
              pair: [i, j],
              correlation: r,
              type: 'high_correlation',
              description: 'Series ' + i + ' & ' + j + ': r=' + r.toFixed(3) + ' — spread opportunity'
            });
          }
          // Divergence detection: check if recent correlation differs
          if (len >= 10) {
            const recentLen = Math.floor(len / PHI);
            const recentA = a.slice(len - recentLen);
            const recentB = b.slice(len - recentLen);
            const rMeanA = recentA.reduce((s, v) => s + v, 0) / recentLen;
            const rMeanB = recentB.reduce((s, v) => s + v, 0) / recentLen;
            let rSumP = 0, rSumSA = 0, rSumSB = 0;
            for (let k = 0; k < recentLen; k++) {
              const da = recentA[k] - rMeanA;
              const db = recentB[k] - rMeanB;
              rSumP += da * db;
              rSumSA += da * da;
              rSumSB += db * db;
            }
            const rDenom = Math.sqrt(rSumSA * rSumSB);
            const rRecent = rDenom > 0 ? rSumP / rDenom : 0;
            if (Math.abs(r) > 0.7 && Math.abs(r - rRecent) > 0.3) {
              highlights.push({
                pair: [i, j],
                correlation: r,
                recentCorrelation: rRecent,
                type: 'divergence',
                description: 'Correlation breakdown: ' + r.toFixed(3) + ' → ' + rRecent.toFixed(3) + ' — free lunch signal'
              });
            }
          }
        }
      }
    }

    this.analysisCount++;
    return { matrix: matrix, highlights: highlights };
  }

  /* ── scoreArbitrageOpportunity ──────────────────────────── */
  scoreArbitrageOpportunity(values, labels) {
    if (!values || values.length < 2) {
      return { score: 0, grade: 'F', reasoning: 'Insufficient data', recommended_action: 'Gather more data points' };
    }

    const stats = this.calculateStatistics(values);
    const spreads = this.detectSpreads(values);
    const patterns = this.findPatterns(values);

    // Spread deviation score (phi-weighted)
    const anomalySpreads = spreads.filter(s => s.isAnomaly);
    const spreadScore = Math.min(anomalySpreads.length / Math.max(spreads.length, 1) * PHI * 100, 100);

    // Mean reversion probability
    const meanRevPatterns = patterns.filter(p => p.type === 'mean_reversion');
    const meanRevScore = Math.min(meanRevPatterns.length * 25 * PHI, 100);

    // Statistical significance (t-test approximation)
    let tScore = 0;
    if (stats && stats.stddev > 0 && values.length > 1) {
      const se = stats.stddev / Math.sqrt(values.length);
      const t = Math.abs(stats.mean) / se;
      tScore = Math.min(t / PHI * 20, 100);
    }

    // Composite score
    const composite = (spreadScore * PHI + meanRevScore + tScore) / (PHI + 2);
    const normalizedScore = Math.min(Math.round(composite), 100);

    let grade, reasoning, action;
    if (normalizedScore >= 80) {
      grade = 'A';
      reasoning = 'Strong arbitrage signal: ' + anomalySpreads.length + ' anomalous spreads, ' + meanRevPatterns.length + ' mean reversion setups';
      action = 'Execute immediately — high-conviction free lunch detected';
    } else if (normalizedScore >= 60) {
      grade = 'B';
      reasoning = 'Moderate opportunity: spread anomalies present with statistical backing';
      action = 'Monitor closely — prepare for entry on confirmation';
    } else if (normalizedScore >= 40) {
      grade = 'C';
      reasoning = 'Marginal edge detected — some spread irregularity but weak significance';
      action = 'Add to watchlist — wait for stronger signal';
    } else if (normalizedScore >= 20) {
      grade = 'D';
      reasoning = 'Minimal opportunity — spreads within normal phi-weighted bounds';
      action = 'Pass — insufficient edge for risk-adjusted returns';
    } else {
      grade = 'F';
      reasoning = 'No actionable opportunity — market is efficiently priced';
      action = 'No action — continue scanning other instruments';
    }

    this.analysisCount++;
    return {
      score: normalizedScore,
      grade: grade,
      reasoning: reasoning,
      recommended_action: action,
      details: {
        spreadScore: Math.round(spreadScore),
        meanRevScore: Math.round(meanRevScore),
        tScore: Math.round(tScore),
        anomalousSpreads: anomalySpreads.length,
        totalSpreads: spreads.length,
        patternsFound: patterns.length
      }
    };
  }

  /* ── analyzeMeta ────────────────────────────────────────── */
  analyzeMeta(metadata) {
    if (!metadata || typeof metadata !== 'object') return { enriched: {}, patterns: [] };

    const enriched = {};
    const numericKeys = [];
    const numericValues = [];

    Object.keys(metadata).forEach(key => {
      const val = metadata[key];
      const numVal = parseFloat(val);
      enriched[key] = { original: val };

      if (!isNaN(numVal)) {
        enriched[key].numeric = numVal;
        enriched[key].phiRatio = numVal / PHI;
        enriched[key].goldenAngleModulo = numVal % GOLDEN_ANGLE;
        numericKeys.push(key);
        numericValues.push(numVal);
      } else if (typeof val === 'string') {
        const extracted = this.scanForNumbers(val);
        if (extracted.length > 0) {
          enriched[key].extractedNumbers = extracted.map(e => e.value);
        }
      }
    });

    const patterns = [];
    if (numericValues.length >= 2) {
      const stats = this.calculateStatistics(numericValues);
      patterns.push({
        type: 'meta_statistics',
        description: 'Metadata numerics: μ=' + stats.mean.toFixed(2) + ', σ=' + stats.stddev.toFixed(2),
        stats: stats
      });

      const detected = this.findPatterns(numericValues);
      detected.forEach(p => {
        patterns.push({
          type: 'meta_' + p.type,
          description: p.description,
          confidence: p.confidence,
          keys: p.indices.map(i => numericKeys[i])
        });
      });
    }

    this.analysisCount++;
    return { enriched: enriched, patterns: patterns };
  }
}

/* ── Initialize Engine ─────────────────────────────────────── */
globalThis.spreadScanner = new SpreadScannerEngine();

/* ── Message Handler ───────────────────────────────────────── */
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
    var engine = globalThis.spreadScanner;

    /* ── Built-in workspace commands ── */
    if (cmd === 'ping') { sendResponse({ result: 'pong — Spread Scanner engine alive at ' + new Date().toISOString() }); return true; }
    if (cmd === 'getState' || lower === 'state' || lower === 'status') {
      sendResponse({ result: JSON.stringify(engine && engine.state ? engine.state : { status: 'running', timestamp: Date.now() }, null, 2) });
      return true;
    }
    if (cmd === 'clearLogs') { sendResponse({ result: 'Workspace logs cleared.' }); return true; }
    if (lower === 'help' || lower === 'capabilities' || lower === '?') {
      sendResponse({ result: '\u{1F9E0} Spread Scanner AI Workspace\n\nCapabilities:\n• Scan For Numbers — Scan text for numbers/spreads\n• Detect Spreads — Detect spreads in values\n• Calculate Statistics — Calculate statistics\n• Find Patterns — Find patterns in data\n• Build Correlation Matrix — Build correlation matrix\n• Score Arbitrage Opportunity — Score arbitrage opportunities\n\nType any command or question and I will route it to the best engine method.' });
      return true;
    }

    /* ── Save to workspace conversation history ── */
    var storageKey = 'spread-scanner_workspace_history';
    chrome.storage.local.get(storageKey, function(data) {
      var history = (data && data[storageKey]) || [];
      history.push({ role: 'user', content: cmd, ts: Date.now() });

      /* ── Intelligent workspace command routing ── */
      var result;
      try {
        if (lower.indexOf('scan') !== -1 || lower.indexOf('number') !== -1 || lower.indexOf('extract') !== -1 || lower.indexOf('find') !== -1) {
          result = engine.scanForNumbers(cmd);
        }
        else if (lower.indexOf('spread') !== -1 || lower.indexOf('detect') !== -1 || lower.indexOf('gap') !== -1 || lower.indexOf('diff') !== -1) {
          result = engine.detectSpreads(cmd.split(",").map(Number).filter(function(n){return!isNaN(n)}));
        }
        else if (lower.indexOf('stat') !== -1 || lower.indexOf('statistics') !== -1 || lower.indexOf('mean') !== -1 || lower.indexOf('average') !== -1 || lower.indexOf('std') !== -1) {
          result = engine.calculateStatistics(cmd.split(",").map(Number).filter(function(n){return!isNaN(n)}));
        }
        else if (lower.indexOf('pattern') !== -1 || lower.indexOf('trend') !== -1 || lower.indexOf('find') !== -1 || lower.indexOf('cycle') !== -1) {
          result = engine.findPatterns(cmd.split(",").map(Number).filter(function(n){return!isNaN(n)}));
        }
        else if (lower.indexOf('correlat') !== -1 || lower.indexOf('matrix') !== -1 || lower.indexOf('compare') !== -1) {
          result = engine.buildCorrelationMatrix({a:cmd.split(",").map(Number).filter(function(n){return!isNaN(n)})});
        }
        else if (lower.indexOf('arbitrage') !== -1 || lower.indexOf('opportunity') !== -1 || lower.indexOf('trade') !== -1) {
          result = engine.scoreArbitrageOpportunity(cmd.split(",").map(Number).filter(function(n){return!isNaN(n)}),["A","B"]);
        }
        else {
          /* Default: route to primary engine method */
          result = engine.scanForNumbers(cmd);
        }
      } catch(e) {
        result = { error: e.message, fallback: 'Spread Scanner encountered an error processing: "' + cmd + '"' };
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

  var engine = globalThis.spreadScanner;
  if (!engine) {
    engine = new SpreadScannerEngine();
    globalThis.spreadScanner = engine;
  }

  var action = message.action;
  var result;

  try {
    switch (action) {
      case 'scanForNumbers':
        result = engine.scanForNumbers(message.text);
        break;
      case 'detectSpreads':
        result = engine.detectSpreads(message.values);
        break;
      case 'calculateStatistics':
        result = engine.calculateStatistics(message.values);
        break;
      case 'findPatterns':
        result = engine.findPatterns(message.values);
        break;
      case 'buildCorrelationMatrix':
        result = engine.buildCorrelationMatrix(message.series);
        break;
      case 'scoreArbitrageOpportunity':
        result = engine.scoreArbitrageOpportunity(message.values, message.labels);
        break;
      case 'analyzeMeta':
        result = engine.analyzeMeta(message.metadata);
        break;
      default:
        result = { error: 'Unknown action: ' + action };
    }
  } catch (e) {
    result = { error: e.message };
  }

  sendResponse({ success: true, data: result });
  return true;
});

/* ── Production 24/7 Keep-Alive ────────────────────────────── */
(function () {
  var ALARM_NAME = 'spread-scanner-heartbeat';
  var ALARM_PERIOD = 0.4;
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: ALARM_PERIOD });
  chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name !== ALARM_NAME) return;
    if (!globalThis.spreadScanner) {
      globalThis.spreadScanner = new SpreadScannerEngine();
      console.log('[Spread Scanner] Engine re-initialized by keepalive alarm');
    }
    try {
      chrome.storage.local.set({
        'spread-scanner_state': {
          analysisCount: globalThis.spreadScanner.analysisCount || 0,
          lastAlive: Date.now(),
          uptime: Date.now() - (globalThis.spreadScanner.startTime || Date.now())
        }
      });
    } catch (e) {}
  });
  chrome.storage.local.get('spread-scanner_state', function (data) {
    if (data && data['spread-scanner_state']) {
      console.log('[Spread Scanner] Restored — last alive: ' + new Date(data['spread-scanner_state'].lastAlive).toISOString());
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
    console.log('[Spread Scanner] 24/7 keepalive active');
  });
})();
