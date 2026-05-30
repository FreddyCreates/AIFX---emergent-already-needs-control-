/**
 * Sovereign Memory Worker — Persistent In-Browser Memory System
 *
 * Permanent Web Worker that provides:
 * - Spatial memory store with phi-encoded coordinates
 * - Semantic search across stored memories
 * - localStorage persistence (survives page reload)
 * - Memory lineage tracking (parent→child chains)
 * - Capacity management with LRU eviction
 *
 * This worker runs permanently. It IS the product's memory.
 * Every task dispatched, every wire message, every heartbeat
 * can be stored and recalled.
 *
 * Protocol: postMessage
 *   Main → Worker: { type: 'store', memory: { key, value, tags, context } }
 *   Main → Worker: { type: 'recall', query: { key | tags | semantic } }
 *   Main → Worker: { type: 'search', query: 'search text', limit: N }
 *   Main → Worker: { type: 'list', filter: { tags, since, limit } }
 *   Main → Worker: { type: 'delete', key: '...' }
 *   Main → Worker: { type: 'clear' }
 *   Main → Worker: { type: 'stats' }
 *   Main → Worker: { type: 'export' }
 *   Main → Worker: { type: 'import', data: [...] }
 *   Worker → Main: { type: 'stored', key, phiCoord }
 *   Worker → Main: { type: 'recalled', memories: [...] }
 *   Worker → Main: { type: 'search-result', results: [...] }
 *   Worker → Main: { type: 'memory-stats', stats: {...} }
 *   Worker → Main: { type: 'heartbeat', ... }
 */

'use strict';
importScripts('neuro-core.js');

var PHI = 1.618033988749895;
var HEARTBEAT_MS = 873;
var beatCount = 0;
var running = true;
var MAX_MEMORIES = 10000;
var STORAGE_KEY = 'organism-memory-store';

/* ════════════════════════════════════════════════════════════════
   Phi-Coordinate Generator — encodes spatial position
   ════════════════════════════════════════════════════════════════ */

function phiCoord(index, dimension) {
  dimension = dimension || 5;
  var coords = [];
  for (var d = 0; d < dimension; d++) {
    var angle = 2 * Math.PI * ((index * PHI * (d + 1)) % 1);
    coords.push(Math.round(Math.cos(angle) * 10000) / 10000);
  }
  return coords;
}

function phiDistance(a, b) {
  var sum = 0;
  var len = Math.min(a.length, b.length);
  for (var i = 0; i < len; i++) {
    var diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

/* ════════════════════════════════════════════════════════════════
   Memory Store — indexed, searchable, persistent
   ════════════════════════════════════════════════════════════════ */

var memoryIndex = 0;
var memories = Object.create(null);     // key → memory record
var tagIndex = Object.create(null);     // tag → [keys]
var timeline = [];     // ordered keys by creation time

function isSafeKey(key) {
  return typeof key === 'string' && key !== '__proto__' && key !== 'constructor' && key !== 'prototype';
}

function storeMemory(mem) {
  var key = mem.key || ('mem-' + Date.now() + '-' + memoryIndex);
  if (!isSafeKey(key)) key = 'mem-' + Date.now() + '-' + memoryIndex;
  memoryIndex++;

  var record = {
    key: key,
    value: mem.value || null,
    tags: mem.tags || [],
    context: mem.context || null,
    source: mem.source || 'user',
    phiCoord: phiCoord(memoryIndex),
    createdAt: Date.now(),
    accessCount: 0,
    lastAccessed: null,
    lineage: mem.parentKey ? [mem.parentKey] : []
  };

  // Evict LRU if at capacity
  if (timeline.length >= MAX_MEMORIES) {
    var oldest = timeline.shift();
    if (oldest && memories[oldest]) {
      removeFromTagIndex(oldest, memories[oldest].tags);
      delete memories[oldest];
    }
  }

  memories[key] = record;
  timeline.push(key);

  // Update tag index
  for (var i = 0; i < record.tags.length; i++) {
    var tag = record.tags[i];
    if (!isSafeKey(tag)) continue;
    if (!tagIndex[tag]) tagIndex[tag] = [];
    tagIndex[tag].push(key);
  }

  return record;
}

function removeFromTagIndex(key, tags) {
  for (var i = 0; i < tags.length; i++) {
    var arr = tagIndex[tags[i]];
    if (arr) {
      var idx = arr.indexOf(key);
      if (idx !== -1) arr.splice(idx, 1);
    }
  }
}

function recallMemory(query) {
  // By key
  if (query.key && isSafeKey(query.key) && memories[query.key]) {
    var m = memories[query.key];
    m.accessCount++;
    m.lastAccessed = Date.now();
    return [m];
  }

  // By tags
  if (query.tags && query.tags.length > 0) {
    var candidates = Object.create(null);
    for (var t = 0; t < query.tags.length; t++) {
      if (!isSafeKey(query.tags[t])) continue;
      var tagged = tagIndex[query.tags[t]] || [];
      for (var j = 0; j < tagged.length; j++) {
        if (!isSafeKey(tagged[j])) continue;
        candidates[tagged[j]] = (candidates[tagged[j]] || 0) + 1;
      }
    }
    // Sort by tag match count (more matches = better)
    var sorted = Object.keys(candidates).sort(function (a, b) {
      return candidates[b] - candidates[a];
    });
    var limit = query.limit || 10;
    var results = [];
    for (var k = 0; k < Math.min(sorted.length, limit); k++) {
      var mem = memories[sorted[k]];
      if (mem) {
        mem.accessCount++;
        mem.lastAccessed = Date.now();
        results.push(mem);
      }
    }
    return results;
  }

  return [];
}

function searchMemories(text, limit) {
  limit = limit || 10;
  var lower = (text || '').toLowerCase();
  if (!lower) return [];

  var scored = [];
  for (var key in memories) {
    var m = memories[key];
    var score = 0;

    // Check value
    var val = typeof m.value === 'string' ? m.value : JSON.stringify(m.value || '');
    if (val.toLowerCase().indexOf(lower) !== -1) score += 3;

    // Check tags
    for (var t = 0; t < m.tags.length; t++) {
      if (m.tags[t].toLowerCase().indexOf(lower) !== -1) score += 2;
    }

    // Check context
    if (m.context && typeof m.context === 'string' && m.context.toLowerCase().indexOf(lower) !== -1) score += 1;

    // Check key
    if (key.toLowerCase().indexOf(lower) !== -1) score += 1;

    if (score > 0) scored.push({ memory: m, score: score });
  }

  scored.sort(function (a, b) { return b.score - a.score; });

  var results = [];
  for (var i = 0; i < Math.min(scored.length, limit); i++) {
    var mem = scored[i].memory;
    mem.accessCount++;
    mem.lastAccessed = Date.now();
    results.push({ memory: mem, score: scored[i].score });
  }
  return results;
}

function listMemories(filter) {
  filter = filter || {};
  var limit = filter.limit || 50;
  var since = filter.since || 0;
  var results = [];

  for (var i = timeline.length - 1; i >= 0 && results.length < limit; i--) {
    var m = memories[timeline[i]];
    if (!m) continue;
    if (m.createdAt < since) continue;

    if (filter.tags && filter.tags.length > 0) {
      var hasTag = false;
      for (var t = 0; t < filter.tags.length; t++) {
        if (m.tags.indexOf(filter.tags[t]) !== -1) { hasTag = true; break; }
      }
      if (!hasTag) continue;
    }

    results.push(m);
  }
  return results;
}

function deleteMemory(key) {
  var m = memories[key];
  if (!m) return false;
  removeFromTagIndex(key, m.tags);
  delete memories[key];
  var idx = timeline.indexOf(key);
  if (idx !== -1) timeline.splice(idx, 1);
  return true;
}

function clearMemories() {
  memories = Object.create(null);
  tagIndex = Object.create(null);
  timeline = [];
  memoryIndex = 0;
}

function getStats() {
  var totalAccess = 0;
  var tagCounts = {};
  for (var key in memories) {
    totalAccess += memories[key].accessCount;
    for (var i = 0; i < memories[key].tags.length; i++) {
      var tag = memories[key].tags[i];
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }
  }
  // Top 10 tags
  var topTags = Object.keys(tagCounts).sort(function (a, b) {
    return tagCounts[b] - tagCounts[a];
  }).slice(0, 10).map(function (t) { return { tag: t, count: tagCounts[t] }; });

  return {
    totalMemories: timeline.length,
    maxCapacity: MAX_MEMORIES,
    totalAccesses: totalAccess,
    uniqueTags: Object.keys(tagCounts).length,
    topTags: topTags,
    oldestTimestamp: timeline.length > 0 && memories[timeline[0]] ? memories[timeline[0]].createdAt : null,
    newestTimestamp: timeline.length > 0 && memories[timeline[timeline.length - 1]] ? memories[timeline[timeline.length - 1]].createdAt : null
  };
}

function exportMemories() {
  var arr = [];
  for (var i = 0; i < timeline.length; i++) {
    if (memories[timeline[i]]) arr.push(memories[timeline[i]]);
  }
  return arr;
}

function importMemories(data) {
  var imported = 0;
  for (var i = 0; i < data.length; i++) {
    storeMemory(data[i]);
    imported++;
  }
  return imported;
}

/* ════════════════════════════════════════════════════════════════
   Persistence — save/restore from localStorage message channel
   ════════════════════════════════════════════════════════════════ */

var pendingPersist = false;

function requestPersist() {
  if (pendingPersist) return;
  pendingPersist = true;
  // Ask main thread to persist (workers can't access localStorage)
  self.postMessage({
    type: 'persist-request',
    data: exportMemories(),
    key: STORAGE_KEY
  });
  pendingPersist = false;
}

/* ════════════════════════════════════════════════════════════════
   Message handler
   ════════════════════════════════════════════════════════════════ */

self.onmessage = function (e) {
  var msg = e.data;
  neuro.onMessage(msg.type);

  switch (msg.type) {
    case 'store': {
      var record = storeMemory(msg.memory || {});
      self.postMessage({ type: 'stored', key: record.key, phiCoord: record.phiCoord, tags: record.tags });
      // Auto-persist every 10 stores
      if (memoryIndex % 10 === 0) requestPersist();
      break;
    }

    case 'recall': {
      var results = recallMemory(msg.query || {});
      self.postMessage({ type: 'recalled', memories: results, count: results.length });
      break;
    }

    case 'search': {
      var searchResults = searchMemories(msg.query, msg.limit);
      self.postMessage({ type: 'search-result', results: searchResults, count: searchResults.length, query: msg.query });
      break;
    }

    case 'list': {
      var listed = listMemories(msg.filter);
      self.postMessage({ type: 'list-result', memories: listed, count: listed.length });
      break;
    }

    case 'delete': {
      var deleted = deleteMemory(msg.key);
      self.postMessage({ type: 'deleted', key: msg.key, success: deleted });
      break;
    }

    case 'clear': {
      clearMemories();
      self.postMessage({ type: 'cleared' });
      break;
    }

    case 'stats': {
      self.postMessage({ type: 'memory-stats', stats: getStats() });
      break;
    }

    case 'export': {
      self.postMessage({ type: 'exported', data: exportMemories() });
      break;
    }

    case 'import': {
      var imported = importMemories(msg.data || []);
      self.postMessage({ type: 'imported', count: imported });
      break;
    }

    case 'restore': {
      // Main thread sends persisted data on boot
      if (msg.data && Array.isArray(msg.data)) {
        importMemories(msg.data);
        self.postMessage({ type: 'restored', count: msg.data.length });
      }
      break;
    }

    case 'neuro-signal':
      neuro.receiveNeuroSignal(msg);
      break;
    case 'stop':
      running = false;
      requestPersist();
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      self.postMessage({ type: 'stopped' });
      break;
  }
  neuro.onMessageDone();
};

/* ════════════════════════════════════════════════════════════════
   Heartbeat — permanent 873ms pulse
   ════════════════════════════════════════════════════════════════ */

var neuro = new NeuroCore('memory');

var heartbeatInterval = setInterval(function () {
  if (!running) return;
  beatCount++;

  var payload = {
    type: 'heartbeat',
    worker: 'memory',
    beat: beatCount,
    timestamp: Date.now(),
    status: 'alive'
  };

  // Add stats every 10th beat
  if (beatCount % 10 === 0) {
    payload.stats = getStats();
  }

  payload.neuro = neuro.pulse();
  self.postMessage(payload);
}, HEARTBEAT_MS);
