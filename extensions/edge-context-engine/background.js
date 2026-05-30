/* Edge Context Engine — Engine Service (EXT-035) */

const PHI = 1.618033988749895;
const GOLDEN_ANGLE = 137.508;
const HEARTBEAT = 873;

class EdgeContextEngine {
  constructor() {
    this.models = {
      embeddings: {
        name: 'Embeddings',
        capabilities: ['semantic-extraction', 'vector-search', 'similarity'],
        strengths: ['fast-encoding', 'semantic-matching', 'clustering'],
        baseConfidence: 0.86,
        maxTokens: 8192
      },
      gpt: {
        name: 'GPT',
        capabilities: ['reasoning', 'code-generation', 'structured-output', 'summarization'],
        strengths: ['analytical', 'instruction-following', 'fast-response'],
        baseConfidence: 0.88,
        maxTokens: 128000
      },
      commandr: {
        name: 'Command R',
        capabilities: ['retrieval-augmented', 'grounded-generation', 'citation'],
        strengths: ['retrieval-focused', 'grounded', 'enterprise-ready'],
        baseConfidence: 0.82,
        maxTokens: 128000
      },
      florence: {
        name: 'Florence',
        capabilities: ['vision-understanding', 'image-captioning', 'visual-grounding'],
        strengths: ['visual-analysis', 'multi-modal', 'fine-grained'],
        baseConfidence: 0.78,
        maxTokens: 4096
      }
    };

    this.contextStore = [];
    this.topicGraph = {};

    this.state = {
      initialized: true,
      heartbeatCount: 0,
      healthy: true,
      lastHeartbeat: Date.now(),
      contextEntries: 0,
      topicCount: 0
    };

    this._heartbeatInterval = null;
    this._startHeartbeat();
  }

  /**
   * Add a browsing context entry from a visited page.
   * @param {string} url - Page URL.
   * @param {string} title - Page title.
   * @param {string} content - Page text content excerpt.
   * @returns {Object} Updated context state.
   */
  addContext(url, title, content) {
    var entry = {
      url: url || '',
      title: title || '',
      excerpt: (content || '').substring(0, 500),
      topics: this._extractTopics(content || ''),
      entities: this._extractKeyEntities(content || ''),
      timestamp: Date.now()
    };

    this.contextStore.push(entry);
    if (this.contextStore.length > 50) {
      this.contextStore = this.contextStore.slice(-50);
    }

    this._updateTopicGraph(entry.topics);
    this.state.contextEntries = this.contextStore.length;
    this.state.topicCount = Object.keys(this.topicGraph).length;

    return {
      added: entry,
      totalEntries: this.contextStore.length,
      topicCount: Object.keys(this.topicGraph).length,
      ring: 'memory'
    };
  }

  /**
   * Build a context summary from all stored browsing entries.
   * @returns {Object} Context summary with timeline, topics, and entity graph.
   */
  buildContext() {
    if (this.contextStore.length === 0) {
      return {
        summary: 'No browsing context collected yet. Visit pages to build context.',
        timeline: [],
        topics: [],
        entityGraph: {},
        ring: 'memory'
      };
    }

    var timeline = this.contextStore.map(function (entry) {
      return {
        title: entry.title,
        url: entry.url,
        topics: entry.topics.slice(0, 3),
        time: new Date(entry.timestamp).toLocaleTimeString()
      };
    });

    var topicScores = {};
    for (var topic in this.topicGraph) {
      if (Object.prototype.hasOwnProperty.call(this.topicGraph, topic)) {
        topicScores[topic] = this.topicGraph[topic];
      }
    }

    var sortedTopics = Object.keys(topicScores).sort(function (a, b) {
      return topicScores[b] - topicScores[a];
    });

    var rankedTopics = sortedTopics.slice(0, 10).map(function (t, i) {
      return {
        topic: t,
        weight: Math.round(Math.pow(PHI, -i) * 1000) / 1000,
        frequency: topicScores[t]
      };
    });

    var entityGraph = this._buildEntityGraph();

    var summaryParts = [];
    summaryParts.push('Browsing session: ' + this.contextStore.length + ' pages visited.');
    if (sortedTopics.length > 0) {
      summaryParts.push('Top topics: ' + sortedTopics.slice(0, 5).join(', ') + '.');
    }
    if (timeline.length > 0) {
      summaryParts.push('Latest: "' + timeline[timeline.length - 1].title + '".');
    }

    return {
      summary: summaryParts.join(' '),
      timeline: timeline.slice(-10),
      topics: rankedTopics,
      entityGraph: entityGraph,
      totalEntries: this.contextStore.length,
      timestamp: Date.now(),
      ring: 'memory'
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
      contextual: Math.min(1, (response.confidence || 0.5) * 0.75 + 0.1),
      temporal: Math.min(1, (text.length > 30 ? 0.55 : 0.25) + 0.15)
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

  _extractTopics(text) {
    var categories = [
      { topic: 'Technology', keywords: ['software', 'code', 'api', 'data', 'computer', 'digital', 'app', 'web', 'cloud'] },
      { topic: 'Science', keywords: ['research', 'study', 'experiment', 'theory', 'scientific', 'hypothesis', 'physics'] },
      { topic: 'Business', keywords: ['company', 'market', 'revenue', 'profit', 'growth', 'strategy', 'product', 'startup'] },
      { topic: 'Health', keywords: ['health', 'medical', 'treatment', 'patient', 'clinical', 'disease', 'wellness'] },
      { topic: 'AI', keywords: ['machine learning', 'neural', 'model', 'training', 'inference', 'llm', 'transformer'] },
      { topic: 'Design', keywords: ['design', 'interface', 'layout', 'color', 'typography', 'visual', 'creative'] },
      { topic: 'Security', keywords: ['security', 'encryption', 'privacy', 'auth', 'vulnerability', 'threat', 'firewall'] },
      { topic: 'Finance', keywords: ['finance', 'invest', 'stock', 'bank', 'money', 'fund', 'trading', 'crypto'] }
    ];

    var lower = text.toLowerCase();
    var matched = [];

    for (var i = 0; i < categories.length; i++) {
      var count = 0;
      for (var j = 0; j < categories[i].keywords.length; j++) {
        if (lower.indexOf(categories[i].keywords[j]) !== -1) count++;
      }
      if (count > 0) matched.push(categories[i].topic);
    }

    return matched;
  }

  _extractKeyEntities(text) {
    var words = text.toLowerCase().split(/\s+/);
    var stopWords = ['the', 'a', 'an', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or', 'but', 'it', 'this', 'that', 'with', 'from', 'by'];
    var freq = {};

    for (var i = 0; i < words.length; i++) {
      var w = words[i].replace(/[^a-z0-9]/g, '');
      if (w.length > 3 && stopWords.indexOf(w) === -1) {
        freq[w] = (freq[w] || 0) + 1;
      }
    }

    return Object.keys(freq)
      .sort(function (a, b) { return freq[b] - freq[a]; })
      .slice(0, 10);
  }

  _updateTopicGraph(topics) {
    for (var i = 0; i < topics.length; i++) {
      this.topicGraph[topics[i]] = (this.topicGraph[topics[i]] || 0) + 1;
    }
  }

  _buildEntityGraph() {
    var graph = {};
    for (var i = 0; i < this.contextStore.length; i++) {
      var entry = this.contextStore[i];
      var entities = entry.entities || [];
      for (var j = 0; j < entities.length; j++) {
        if (!graph[entities[j]]) graph[entities[j]] = { count: 0, connections: [] };
        graph[entities[j]].count++;
        for (var k = j + 1; k < Math.min(entities.length, j + 4); k++) {
          if (graph[entities[j]].connections.indexOf(entities[k]) === -1) {
            graph[entities[j]].connections.push(entities[k]);
          }
        }
      }
    }

    var sorted = Object.keys(graph).sort(function (a, b) { return graph[b].count - graph[a].count; });
    var trimmed = {};
    for (var m = 0; m < Math.min(sorted.length, 20); m++) {
      trimmed[sorted[m]] = graph[sorted[m]];
    }
    return trimmed;
  }

  _startHeartbeat() {
    this._heartbeatInterval = setInterval(function () {
      this.state.heartbeatCount++;
      this.state.lastHeartbeat = Date.now();
      this.state.healthy = true;
    }.bind(this), HEARTBEAT);
  }
}

globalThis.edgeContextEngine = new EdgeContextEngine();

/* ── Message Router ───────────────────────────────────────── */
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  var engine = globalThis.edgeContextEngine;

  switch (message.action) {
    case 'addContext':
      sendResponse(engine.addContext(message.url, message.title, message.content));
      break;
    case 'buildContext':
      sendResponse(engine.buildContext());
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
  var ALARM_NAME = 'edge-context-engine-keepalive';
  var ALARM_PERIOD = 0.4;

  chrome.alarms.create(ALARM_NAME, { periodInMinutes: ALARM_PERIOD });

  chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name !== ALARM_NAME) return;
    if (!globalThis.edgeContextEngine) {
      globalThis.edgeContextEngine = new EdgeContextEngine();
      console.log('[Edge Context Engine] Engine re-initialized by keepalive');
    }
    try {
      chrome.storage.local.set({
        'edge-context-engine_state': {
          heartbeatCount: globalThis.edgeContextEngine.state.heartbeatCount,
          healthy: globalThis.edgeContextEngine.state.healthy,
          lastAlive: Date.now()
        }
      });
    } catch (e) { }
  });

  chrome.runtime.onInstalled.addListener(function () {
    chrome.alarms.create(ALARM_NAME, { periodInMinutes: ALARM_PERIOD });
    console.log('[Edge Context Engine] Installed — 24/7 keepalive active');
  });
})();
