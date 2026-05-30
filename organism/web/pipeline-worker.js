/**
 * Data Pipeline Worker — ETL, Streams & Batch Processing
 *
 * Permanent Web Worker that provides:
 * - Pipeline definitions (source → transform → sink)
 * - Stream processing (real-time event transformation)
 * - Batch aggregation (collect, process, emit)
 * - Data validation and sanitization
 * - Pipeline chaining (output of one feeds into next)
 *
 * This worker IS the organism's data plumbing.
 * Every piece of data that flows through the organism
 * can be transformed, validated, and routed here.
 *
 * Protocol: postMessage
 *   Main → Worker: { type: 'create-pipeline', pipeline: { name, stages: [...] } }
 *   Main → Worker: { type: 'push', pipelineId: '...', data: {...} }
 *   Main → Worker: { type: 'batch', pipelineId: '...', items: [...] }
 *   Main → Worker: { type: 'flush', pipelineId: '...' }
 *   Main → Worker: { type: 'list' }
 *   Main → Worker: { type: 'stats' }
 *   Worker → Main: { type: 'pipeline-created', ... }
 *   Worker → Main: { type: 'pipeline-output', ... }
 *   Worker → Main: { type: 'batch-complete', ... }
 *   Worker → Main: { type: 'heartbeat', ... }
 */

'use strict';
importScripts('neuro-core.js');

var PHI = 1.618033988749895;
var HEARTBEAT_MS = 873;
var beatCount = 0;
var running = true;

/* ════════════════════════════════════════════════════════════════
   Pipeline Registry
   ════════════════════════════════════════════════════════════════ */

var pipelines = Object.create(null);
var pipelineCount = 0;

function isSafeKey(key) {
  return typeof key === 'string' && key !== '__proto__' && key !== 'constructor' && key !== 'prototype';
}

var pipelineMetrics = {
  totalCreated: 0,
  totalItemsProcessed: 0,
  totalBatches: 0,
  totalErrors: 0,
  totalOutputs: 0,
  totalBytesProcessed: 0
};

/* ════════════════════════════════════════════════════════════════
   Transform Functions — built-in pipeline stages
   ════════════════════════════════════════════════════════════════ */

var TRANSFORMS = {
  'passthrough': function (item) { return item; },
  'uppercase': function (item) {
    if (typeof item === 'string') return item.toUpperCase();
    if (item && typeof item.value === 'string') { item.value = item.value.toUpperCase(); return item; }
    return item;
  },
  'lowercase': function (item) {
    if (typeof item === 'string') return item.toLowerCase();
    if (item && typeof item.value === 'string') { item.value = item.value.toLowerCase(); return item; }
    return item;
  },
  'timestamp': function (item) {
    if (typeof item === 'object' && item !== null) { item._timestamp = Date.now(); return item; }
    return { value: item, _timestamp: Date.now() };
  },
  'validate-string': function (item) {
    if (typeof item === 'string' && item.length > 0) return item;
    return null; // Filtered out
  },
  'validate-object': function (item) {
    if (typeof item === 'object' && item !== null) return item;
    return null;
  },
  'flatten': function (item) {
    if (Array.isArray(item)) return item;
    return [item];
  },
  'count': function (item, state) {
    state.count = (state.count || 0) + 1;
    if (typeof item === 'object' && item !== null) { item._count = state.count; return item; }
    return { value: item, _count: state.count };
  },
  'deduplicate': function (item, state) {
    if (!state.seen) state.seen = Object.create(null);
    var key = JSON.stringify(item);
    if (state.seen[key]) return null;
    state.seen[key] = true;
    return item;
  },
  'sample': function (item, state) {
    state.sampleCount = (state.sampleCount || 0) + 1;
    // Keep every Nth item (phi-based sampling)
    if (state.sampleCount % Math.ceil(PHI * 2) === 0) return item;
    return null;
  }
};

/* ════════════════════════════════════════════════════════════════
   Pipeline Operations
   ════════════════════════════════════════════════════════════════ */

function createPipeline(spec) {
  pipelineCount++;
  var id = 'PIPE-' + String(pipelineCount).padStart(4, '0');
  var pipeline = {
    id: id,
    name: spec.name || 'Unnamed Pipeline',
    stages: (spec.stages || ['passthrough']).map(function (s) {
      return { transform: s, state: {} };
    }),
    status: 'active',
    createdAt: Date.now(),
    itemsIn: 0,
    itemsOut: 0,
    buffer: [],
    batchSize: spec.batchSize || 100
  };

  pipelines[id] = pipeline;
  pipelineMetrics.totalCreated++;
  return pipeline;
}

function pushItem(pipelineId, data) {
  if (!isSafeKey(pipelineId)) return null;
  var pipeline = pipelines[pipelineId];
  if (!pipeline || pipeline.status !== 'active') return null;

  pipeline.itemsIn++;
  pipelineMetrics.totalItemsProcessed++;

  // Run through stages
  var current = data;
  for (var i = 0; i < pipeline.stages.length; i++) {
    var stage = pipeline.stages[i];
    var fn = TRANSFORMS[stage.transform];
    if (fn) {
      current = fn(current, stage.state);
      if (current === null) return null; // Filtered out
    }
  }

  pipeline.itemsOut++;
  pipelineMetrics.totalOutputs++;

  return { pipelineId: pipelineId, output: current };
}

function processBatch(pipelineId, items) {
  if (!isSafeKey(pipelineId)) return [];
  var results = [];
  for (var i = 0; i < items.length; i++) {
    var result = pushItem(pipelineId, items[i]);
    if (result) results.push(result.output);
  }
  pipelineMetrics.totalBatches++;
  return results;
}

/* ════════════════════════════════════════════════════════════════
   Message Handler
   ════════════════════════════════════════════════════════════════ */

self.onmessage = function (e) {
  var msg = e.data;
  neuro.onMessage(msg.type);

  switch (msg.type) {
    case 'create-pipeline': {
      var pipeline = createPipeline(msg.pipeline || {});
      self.postMessage({ type: 'pipeline-created', pipeline: { id: pipeline.id, name: pipeline.name, stages: pipeline.stages.map(function(s){return s.transform;}) } });
      break;
    }
    case 'push': {
      var result = pushItem(msg.pipelineId, msg.data);
      if (result) {
        self.postMessage({ type: 'pipeline-output', pipelineId: msg.pipelineId, data: result.output });
      }
      break;
    }
    case 'batch': {
      var results = processBatch(msg.pipelineId, msg.items || []);
      self.postMessage({ type: 'batch-complete', pipelineId: msg.pipelineId, results: results, count: results.length });
      break;
    }
    case 'flush': {
      if (isSafeKey(msg.pipelineId) && pipelines[msg.pipelineId]) {
        var buf = pipelines[msg.pipelineId].buffer;
        pipelines[msg.pipelineId].buffer = [];
        self.postMessage({ type: 'flush-complete', pipelineId: msg.pipelineId, flushed: buf.length });
      }
      break;
    }
    case 'list': {
      var list = [];
      for (var id in pipelines) {
        var p = pipelines[id];
        list.push({ id: p.id, name: p.name, status: p.status, itemsIn: p.itemsIn, itemsOut: p.itemsOut });
      }
      self.postMessage({ type: 'pipeline-list', pipelines: list });
      break;
    }
    case 'stats': {
      self.postMessage({ type: 'pipeline-stats', stats: pipelineMetrics, pipelineCount: pipelineCount });
      break;
    }
    case 'neuro-signal':
      neuro.receiveNeuroSignal(msg);
      break;
    case 'stop':
      running = false;
      break;
  }
  neuro.onMessageDone();
};

/* ════════════════════════════════════════════════════════════════
   Heartbeat
   ════════════════════════════════════════════════════════════════ */

var neuro = new NeuroCore('pipeline');

setInterval(function () {
  if (!running) return;
  beatCount++;
  self.postMessage({
    type: 'heartbeat',
    worker: 'pipeline',
    beat: beatCount,
    timestamp: Date.now(),
    status: 'alive',
    metrics: pipelineMetrics,
    neuro: neuro.pulse()
  });
}, HEARTBEAT_MS);
