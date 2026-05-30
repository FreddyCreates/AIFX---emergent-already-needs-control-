/* Knowledge Sync Adapter — Engine Service (EXT-039) */

const PHI = 1.618033988749895;
const GOLDEN_ANGLE = 137.508;
const HEARTBEAT = 873;

class KnowledgeSyncAdapter {
  constructor() {
    this.entities = new Map();   // entity name → { count, urls, type, firstSeen }
    this.edges = new Map();      // 'A|B' → { count, urls, weight }
    this.syncQueue = [];
    this.maxQueue = 100;
    this.totalEntities = 0;
    this.totalEdges = 0;
    this.syncCount = 0;

    this.ENTITY_TYPES = {
      PERSON:       'person',
      ORGANIZATION: 'org',
      PLACE:        'place',
      CONCEPT:      'concept',
      TECHNOLOGY:   'technology',
      PRODUCT:      'product'
    };

    this.state = {
      initialized: true,
      heartbeatCount: 0,
      healthy: true,
      lastHeartbeat: Date.now()
    };

    this._startHeartbeat();
    this._loadGraph();
  }

  /**
   * Extract entities from page text and sync to the knowledge graph.
   * @param {string} text  page content
   * @param {string} url   source URL
   * @returns {object}
   */
  syncPage(text, url) {
    this.syncCount++;

    var entities = this._extractEntities(text);
    var edges = this._buildEdges(entities, url);

    // Merge into graph
    for (var i = 0; i < entities.length; i++) {
      var e = entities[i];
      var existing = this.entities.get(e.name) || {
        name: e.name, count: 0, type: e.type, urls: [], firstSeen: Date.now(), weight: 0
      };
      existing.count++;
      existing.weight = Math.min(10, existing.weight + this._phiWeight(existing.count));
      if (existing.urls.indexOf(url) === -1) existing.urls.push(url);
      if (existing.urls.length > 20) existing.urls.shift();
      this.entities.set(e.name, existing);
    }

    for (var j = 0; j < edges.length; j++) {
      var edge = edges[j];
      var key = edge.a < edge.b ? edge.a + '|' + edge.b : edge.b + '|' + edge.a;
      var existing = this.edges.get(key) || { a: edge.a, b: edge.b, count: 0, urls: [], weight: 0 };
      existing.count++;
      existing.weight = Math.min(10, existing.weight + this._phiWeight(existing.count));
      if (existing.urls.indexOf(url) === -1) existing.urls.push(url);
      if (existing.urls.length > 10) existing.urls.shift();
      this.edges.set(key, existing);
    }

    this.totalEntities = this.entities.size;
    this.totalEdges = this.edges.size;

    this.syncQueue.unshift({ url: url, entities: entities.length, edges: edges.length, syncedAt: Date.now() });
    if (this.syncQueue.length > this.maxQueue) this.syncQueue.pop();

    this._persist();

    return {
      success: true,
      entitiesFound: entities.length,
      edgesBuilt: edges.length,
      totalEntities: this.totalEntities,
      totalEdges: this.totalEdges,
      topEntities: this._topEntities(5),
      ring: 'memory'
    };
  }

  /**
   * Get the full entity list, sorted by weight.
   */
  getGraph() {
    var entityList = [];
    this.entities.forEach(function (e) { entityList.push(e); });
    entityList.sort(function (a, b) { return b.weight - a.weight; });

    var edgeList = [];
    this.edges.forEach(function (e) { edgeList.push(e); });
    edgeList.sort(function (a, b) { return b.weight - a.weight; });

    return {
      entities: entityList.slice(0, 200),
      edges: edgeList.slice(0, 200),
      totalEntities: this.totalEntities,
      totalEdges: this.totalEdges
    };
  }

  /**
   * Query entities related to a given term.
   */
  query(term) {
    var lower = term.toLowerCase();
    var matched = [];
    this.entities.forEach(function (e) {
      if (e.name.toLowerCase().indexOf(lower) !== -1) matched.push(e);
    });
    matched.sort(function (a, b) { return b.weight - a.weight; });

    var related = new Set();
    this.edges.forEach(function (edge) {
      matched.forEach(function (m) {
        if (edge.a === m.name) related.add(edge.b);
        if (edge.b === m.name) related.add(edge.a);
      });
    });

    return {
      matched: matched.slice(0, 20),
      related: Array.from(related).slice(0, 20),
      ring: 'memory'
    };
  }

  getState() {
    return {
      initialized: this.state.initialized,
      heartbeatCount: this.state.heartbeatCount,
      healthy: this.state.healthy,
      totalEntities: this.totalEntities,
      totalEdges: this.totalEdges,
      syncCount: this.syncCount
    };
  }

  _extractEntities(text) {
    var entities = [];
    var seen = new Set();

    // Proper nouns: capitalized words (not at sentence start)
    var properNounRe = /(?<!\. )\b([A-Z][a-z]{2,}(?:\s[A-Z][a-z]+)*)\b/g;
    var match;
    while ((match = properNounRe.exec(text)) !== null) {
      var name = match[1].trim();
      if (seen.has(name) || name.length < 3 || name.length > 60) continue;
      seen.add(name);
      entities.push({ name: name, type: this._classifyEntity(name, text) });
      if (entities.length >= 60) break;
    }

    // Quoted strings (often product/concept names)
    var quotedRe = /"([^"]{3,40})"/g;
    while ((match = quotedRe.exec(text)) !== null) {
      var name = match[1].trim();
      if (seen.has(name)) continue;
      seen.add(name);
      entities.push({ name: name, type: this.ENTITY_TYPES.CONCEPT });
      if (entities.length >= 80) break;
    }

    return entities;
  }

  _buildEdges(entities, url) {
    var edges = [];
    // Connect entities that appear on the same page (co-occurrence edges)
    for (var i = 0; i < entities.length; i++) {
      for (var j = i + 1; j < Math.min(i + 5, entities.length); j++) {
        edges.push({ a: entities[i].name, b: entities[j].name, url: url });
        if (edges.length >= 50) return edges;
      }
    }
    return edges;
  }

  _classifyEntity(name, context) {
    var lower = name.toLowerCase();
    var ctx = context.toLowerCase();
    var nameIdx = ctx.indexOf(lower);
    var surrounds = nameIdx >= 0 ? ctx.substring(Math.max(0, nameIdx - 50), nameIdx + 50) : '';

    if (/\b(inc|corp|ltd|llc|company|organization|foundation|group)\b/.test(surrounds)) return this.ENTITY_TYPES.ORGANIZATION;
    if (/\b(city|country|state|region|town|avenue|street|road)\b/.test(surrounds)) return this.ENTITY_TYPES.PLACE;
    if (/\b(ai|model|framework|protocol|sdk|api|platform|software|tool)\b/.test(surrounds)) return this.ENTITY_TYPES.TECHNOLOGY;
    if (/\b(product|version|release|app|feature)\b/.test(surrounds)) return this.ENTITY_TYPES.PRODUCT;
    if (/\b(dr|mr|ms|ceo|director|founder|researcher)\b/.test(surrounds)) return this.ENTITY_TYPES.PERSON;
    return this.ENTITY_TYPES.CONCEPT;
  }

  _phiWeight(count) {
    return 1 / Math.pow(PHI, count - 1);
  }

  _topEntities(n) {
    var list = [];
    this.entities.forEach(function (e) { list.push({ name: e.name, count: e.count, type: e.type, weight: e.weight }); });
    list.sort(function (a, b) { return b.weight - a.weight; });
    return list.slice(0, n);
  }

  _persist() {
    try {
      var entityArr = [];
      this.entities.forEach(function (e) { entityArr.push(e); });
      var edgeArr = [];
      this.edges.forEach(function (e) { edgeArr.push(e); });
      chrome.storage.local.set({
        'knowledge-sync-adapter_entities': entityArr.slice(0, 500),
        'knowledge-sync-adapter_edges': edgeArr.slice(0, 500)
      });
    } catch (e) { }
  }

  _loadGraph() {
    try {
      chrome.storage.local.get({
        'knowledge-sync-adapter_entities': [],
        'knowledge-sync-adapter_edges': []
      }, function (data) {
        data['knowledge-sync-adapter_entities'].forEach(function (e) {
          this.entities.set(e.name, e);
        }.bind(this));
        data['knowledge-sync-adapter_edges'].forEach(function (e) {
          var key = e.a < e.b ? e.a + '|' + e.b : e.b + '|' + e.a;
          this.edges.set(key, e);
        }.bind(this));
        this.totalEntities = this.entities.size;
        this.totalEdges = this.edges.size;
      }.bind(this));
    } catch (e) { }
  }

  _startHeartbeat() {
    setInterval(function () {
      this.state.heartbeatCount++;
      this.state.lastHeartbeat = Date.now();
      this.state.healthy = true;
    }.bind(this), HEARTBEAT);
  }
}

globalThis.knowledgeSyncAdapter = new KnowledgeSyncAdapter();

/* ── Message Router ───────────────────────────────────────── */
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  var engine = globalThis.knowledgeSyncAdapter;

  switch (message.action) {
    case 'syncPage':
      sendResponse(engine.syncPage(message.text, message.url));
      break;
    case 'getGraph':
      sendResponse(engine.getGraph());
      break;
    case 'query':
      sendResponse(engine.query(message.term));
      break;
    case 'getState':
      sendResponse(engine.getState());
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
  var ALARM_NAME = 'knowledge-sync-adapter-keepalive';
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: 0.4 });
  chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name !== ALARM_NAME) return;
    if (!globalThis.knowledgeSyncAdapter) {
      globalThis.knowledgeSyncAdapter = new KnowledgeSyncAdapter();
    }
    try {
      chrome.storage.local.set({
        'knowledge-sync-adapter_state': {
          heartbeatCount: globalThis.knowledgeSyncAdapter.state.heartbeatCount,
          totalEntities: globalThis.knowledgeSyncAdapter.totalEntities,
          lastAlive: Date.now()
        }
      });
    } catch (e) { }
  });
  chrome.runtime.onInstalled.addListener(function () {
    chrome.alarms.create(ALARM_NAME, { periodInMinutes: 0.4 });
  });
})();
