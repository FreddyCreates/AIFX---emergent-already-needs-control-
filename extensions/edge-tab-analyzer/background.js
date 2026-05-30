/* Edge Tab Analyzer — Engine Service (EXT-033) */

const PHI = 1.618033988749895;
const GOLDEN_ANGLE = 137.508;
const HEARTBEAT = 873;

class EdgeTabAnalyzerEngine {
  constructor() {
    this.models = {
      embeddings: {
        name: 'Embeddings',
        capabilities: ['semantic-extraction', 'vector-search', 'similarity'],
        strengths: ['fast-encoding', 'semantic-matching', 'clustering'],
        baseConfidence: 0.86,
        maxTokens: 8192
      },
      claude: {
        name: 'Claude',
        capabilities: ['summarization', 'analysis', 'entity-extraction', 'comprehension'],
        strengths: ['thoughtful', 'accurate', 'long-context'],
        baseConfidence: 0.85,
        maxTokens: 200000
      },
      rerankers: {
        name: 'Rerankers',
        capabilities: ['relevance-scoring', 'passage-ranking', 'quality-assessment'],
        strengths: ['precision-ranking', 'contextual-scoring', 'filtering'],
        baseConfidence: 0.82,
        maxTokens: 4096
      }
    };

    this.state = {
      initialized: true,
      heartbeatCount: 0,
      healthy: true,
      lastHeartbeat: Date.now(),
      analyzedTabs: 0
    };

    this._heartbeatInterval = null;
    this._startHeartbeat();
  }

  /**
   * Analyze page content with semantic extraction and scoring.
   * @param {string} content - Page text content.
   * @param {string} url - Page URL.
   * @param {string} title - Page title.
   * @returns {Object} Analysis result with stats, entities, and summary.
   */
  analyzeContent(content, url, title) {
    this.state.analyzedTabs++;
    var text = content || '';
    var words = text.split(/\s+/).filter(function (w) { return w.length > 0; });

    var wordCount = words.length;
    var sentenceCount = (text.match(/[.!?]+/g) || []).length || 1;
    var avgWordsPerSentence = Math.round((wordCount / sentenceCount) * 10) / 10;
    var readabilityScore = Math.min(100, Math.max(0,
      Math.round((206.835 - 1.015 * avgWordsPerSentence) * 10) / 10
    ));

    var entities = this._extractEntities(text);
    var topics = this._extractTopics(text);

    var summary = this._generateSummary(text, title);

    var qualityScore = this._computeQualityScore(wordCount, sentenceCount, entities.length);

    return {
      stats: {
        wordCount: wordCount,
        sentenceCount: sentenceCount,
        avgWordsPerSentence: avgWordsPerSentence,
        readabilityScore: readabilityScore,
        qualityScore: qualityScore
      },
      entities: entities.slice(0, 15),
      topics: topics.slice(0, 8),
      summary: summary,
      url: url || '',
      title: title || '',
      timestamp: Date.now(),
      ring: 'memory'
    };
  }

  /**
   * Score content quality using phi-weighted criteria.
   */
  scoreResponse(response) {
    var text = response.text || response || '';
    if (typeof text !== 'string') text = JSON.stringify(text);

    var criteria = {
      coherence: Math.min(1, (text.length > 20 ? 0.7 : 0.3) + (response.confidence || 0.5) * 0.3),
      relevance: Math.min(1, (response.confidence || 0.5) * 0.8 + 0.2),
      depth: Math.min(1, (response.confidence || 0.5) * 0.7 + 0.15),
      coverage: Math.min(1, (text.length > 100 ? 0.65 : 0.3) + 0.1)
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

  _extractEntities(text) {
    var patterns = [
      { type: 'email', regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g },
      { type: 'url', regex: /https?:\/\/[^\s<>"]+/g },
      { type: 'date', regex: /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g },
      { type: 'number', regex: /\b\d{1,3}(?:,\d{3})*(?:\.\d+)?\b/g }
    ];

    var entities = [];
    for (var i = 0; i < patterns.length; i++) {
      var matches = text.match(patterns[i].regex);
      if (matches) {
        for (var j = 0; j < Math.min(matches.length, 5); j++) {
          entities.push({ type: patterns[i].type, value: matches[j] });
        }
      }
    }

    var wordFreq = {};
    var words = text.toLowerCase().split(/\s+/);
    var stopWords = ['the', 'a', 'an', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or', 'but', 'it', 'this', 'that', 'with'];
    for (var k = 0; k < words.length; k++) {
      var w = words[k].replace(/[^a-z]/g, '');
      if (w.length > 3 && stopWords.indexOf(w) === -1) {
        wordFreq[w] = (wordFreq[w] || 0) + 1;
      }
    }

    var sorted = Object.keys(wordFreq).sort(function (a, b) { return wordFreq[b] - wordFreq[a]; });
    for (var m = 0; m < Math.min(sorted.length, 5); m++) {
      entities.push({ type: 'keyword', value: sorted[m], frequency: wordFreq[sorted[m]] });
    }

    return entities;
  }

  _extractTopics(text) {
    var categories = [
      { topic: 'Technology', keywords: ['software', 'code', 'api', 'data', 'computer', 'digital', 'app', 'web'] },
      { topic: 'Science', keywords: ['research', 'study', 'experiment', 'theory', 'scientific', 'hypothesis'] },
      { topic: 'Business', keywords: ['company', 'market', 'revenue', 'profit', 'growth', 'strategy', 'product'] },
      { topic: 'Health', keywords: ['health', 'medical', 'treatment', 'patient', 'clinical', 'disease'] },
      { topic: 'Education', keywords: ['learn', 'course', 'student', 'teach', 'education', 'school', 'university'] },
      { topic: 'Finance', keywords: ['finance', 'invest', 'stock', 'bank', 'money', 'fund', 'trading'] }
    ];

    var lower = text.toLowerCase();
    var matched = [];

    for (var i = 0; i < categories.length; i++) {
      var count = 0;
      for (var j = 0; j < categories[i].keywords.length; j++) {
        if (lower.indexOf(categories[i].keywords[j]) !== -1) count++;
      }
      if (count > 0) {
        matched.push({ topic: categories[i].topic, relevance: Math.min(1, count * 0.2) });
      }
    }

    matched.sort(function (a, b) { return b.relevance - a.relevance; });
    return matched;
  }

  _generateSummary(text, title) {
    var sentences = text.split(/[.!?]+/).filter(function (s) { return s.trim().length > 10; });
    if (sentences.length === 0) return 'No content available for summarization.';

    var summaryParts = sentences.slice(0, 3).map(function (s) { return s.trim(); });
    var summary = summaryParts.join('. ') + '.';

    if (summary.length > 300) summary = summary.substring(0, 297) + '...';

    return (title ? title + ' — ' : '') + summary;
  }

  _computeQualityScore(wordCount, sentenceCount, entityCount) {
    var lengthScore = Math.min(1, wordCount / 500) * PHI;
    var structureScore = Math.min(1, sentenceCount / 20);
    var richnessScore = Math.min(1, entityCount / 10);

    var total = (lengthScore + structureScore + richnessScore) / (PHI + 2);
    return Math.round(total * 100);
  }

  _startHeartbeat() {
    this._heartbeatInterval = setInterval(function () {
      this.state.heartbeatCount++;
      this.state.lastHeartbeat = Date.now();
      this.state.healthy = true;
    }.bind(this), HEARTBEAT);
  }
}

globalThis.edgeTabAnalyzer = new EdgeTabAnalyzerEngine();

/* ── Message Router ───────────────────────────────────────── */
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  var engine = globalThis.edgeTabAnalyzer;

  switch (message.action) {
    case 'analyzeContent':
      sendResponse(engine.analyzeContent(message.content, message.url, message.title));
      break;
    case 'scoreResponse':
      sendResponse(engine.scoreResponse(message.response));
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
  var ALARM_NAME = 'edge-tab-analyzer-keepalive';
  var ALARM_PERIOD = 0.4;

  chrome.alarms.create(ALARM_NAME, { periodInMinutes: ALARM_PERIOD });

  chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name !== ALARM_NAME) return;
    if (!globalThis.edgeTabAnalyzer) {
      globalThis.edgeTabAnalyzer = new EdgeTabAnalyzerEngine();
      console.log('[Edge Tab Analyzer] Engine re-initialized by keepalive');
    }
    try {
      chrome.storage.local.set({
        'edge-tab-analyzer_state': {
          heartbeatCount: globalThis.edgeTabAnalyzer.state.heartbeatCount,
          healthy: globalThis.edgeTabAnalyzer.state.healthy,
          lastAlive: Date.now()
        }
      });
    } catch (e) { }
  });

  chrome.runtime.onInstalled.addListener(function () {
    chrome.alarms.create(ALARM_NAME, { periodInMinutes: ALARM_PERIOD });
    console.log('[Edge Tab Analyzer] Installed — 24/7 keepalive active');
  });
})();
