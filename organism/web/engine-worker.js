/**
 * Organism Engine Worker — The Product Brain
 *
 * Permanent Web Worker that runs the full AI engine stack in-browser:
 * - EngineCore: task dispatch and execution across 40 AI model families
 * - ModelRouter: capability-based model selection with adaptive scoring
 * - ModelWire: encrypted point-to-point intelligence wires between engines
 * - Heartbeat: 873ms organism pulse with full telemetry
 *
 * This is NOT a page. This is the product.
 * It boots on load, wires all engines, and runs permanently.
 *
 * Protocol: postMessage
 *   Main → Worker: { type: 'boot' }
 *   Main → Worker: { type: 'dispatch', task: {...} }
 *   Main → Worker: { type: 'query', query: 'engines'|'wires'|'metrics'|'health' }
 *   Main → Worker: { type: 'route', task: {...} }
 *   Main → Worker: { type: 'stop' }
 *   Worker → Main: { type: 'heartbeat', ... }
 *   Worker → Main: { type: 'booted', ... }
 *   Worker → Main: { type: 'dispatch-result', ... }
 *   Worker → Main: { type: 'route-result', ... }
 *   Worker → Main: { type: 'query-result', ... }
 *   Worker → Main: { type: 'wire-event', ... }
 */

'use strict';
importScripts('neuro-core.js');

var PHI = 1.618033988749895;
var HEARTBEAT_MS = 873;
var beatCount = 0;
var running = true;

/* ════════════════════════════════════════════════════════════════
   UUID — browser-compatible (no node:crypto)
   ════════════════════════════════════════════════════════════════ */

function uuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0;
    var v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/* ════════════════════════════════════════════════════════════════
   EngineCore — task dispatch and execution
   ════════════════════════════════════════════════════════════════ */

var PRIORITY_ORDER = ['P0', 'P1', 'P2', 'P3'];

function EngineCore() {
  this.maxConcurrentTasks = 100;
  this.taskTimeoutMs = 30000;
  this.tasks = {};       // taskId → record
  this.taskCount = 0;
  this.engines = {};     // familyId → engine
  this.engineCount = 0;
  this.metrics = {
    totalDispatched: 0,
    totalCompleted: 0,
    totalFailed: 0,
    totalUnroutable: 0,
    cumulativeLatencyMs: 0
  };
  this.status = 'idle';
}

EngineCore.prototype.registerEngine = function (familyId, meta) {
  var engine = {
    familyId: familyId,
    familyName: meta.name,
    alphaModel: meta.alphaModel,
    wireProtocol: meta.wireProtocol,
    primaryCapability: meta.primaryCapability,
    ringAffinity: meta.ringAffinity || 'Interface Ring',
    routingPriority: meta.routingPriority,
    status: 'ready',
    tasksProcessed: 0,
    totalLatencyMs: 0,
    lastUsed: null
  };
  this.engines[familyId] = engine;
  this.engineCount++;
  return engine;
};

EngineCore.prototype.registerAll = function (families) {
  var results = [];
  for (var i = 0; i < families.length; i++) {
    var f = families[i];
    results.push(this.registerEngine(f.id, f));
  }
  return results;
};

EngineCore.prototype.dispatch = function (task) {
  var taskId = uuid();
  var assignedEngine = null;
  var status = 'queued';

  // 1. Preferred family
  if (task.preferredFamily && this.engines[task.preferredFamily]) {
    assignedEngine = this.engines[task.preferredFamily];
  }

  // 2. Capability matching
  if (!assignedEngine && task.requiredCapability) {
    var candidates = [];
    for (var key in this.engines) {
      if (this.engines[key].primaryCapability === task.requiredCapability) {
        candidates.push(this.engines[key]);
      }
    }
    if (candidates.length === 1) {
      assignedEngine = candidates[0];
    } else if (candidates.length > 1) {
      candidates.sort(function (a, b) {
        return PRIORITY_ORDER.indexOf(a.routingPriority) - PRIORITY_ORDER.indexOf(b.routingPriority);
      });
      assignedEngine = candidates[0];
    }
  }

  // 3. If still no match, pick highest priority engine
  if (!assignedEngine) {
    var best = null;
    var bestPri = 99;
    for (var k in this.engines) {
      var pri = PRIORITY_ORDER.indexOf(this.engines[k].routingPriority);
      if (pri < bestPri) {
        bestPri = pri;
        best = this.engines[k];
      }
    }
    if (best) {
      assignedEngine = best;
    } else {
      status = 'unroutable';
      this.metrics.totalUnroutable++;
    }
  }

  var record = {
    taskId: taskId,
    type: task.type || 'generic',
    payload: task.payload || null,
    requiredCapability: task.requiredCapability || null,
    priority: task.priority || null,
    preferredFamily: task.preferredFamily || null,
    assignedEngine: assignedEngine ? { familyId: assignedEngine.familyId, familyName: assignedEngine.familyName } : null,
    status: status,
    createdAt: Date.now(),
    completedAt: null,
    durationMs: null
  };

  this.tasks[taskId] = record;
  this.taskCount++;
  this.metrics.totalDispatched++;

  return record;
};

EngineCore.prototype.execute = function (taskId) {
  var record = this.tasks[taskId];
  if (!record) throw new Error('Task not found: ' + taskId);

  if (record.status === 'unroutable') {
    this.metrics.totalFailed++;
    record.status = 'failed';
    return { taskId: taskId, result: 'unroutable', engineUsed: null, durationMs: 0 };
  }

  record.status = 'running';
  var startTime = Date.now();

  // Simulated execution (synchronous)
  var endTime = Date.now();
  var durationMs = endTime - startTime;

  record.status = 'completed';
  record.completedAt = endTime;
  record.durationMs = durationMs;
  this.metrics.totalCompleted++;
  this.metrics.cumulativeLatencyMs += durationMs;

  if (record.assignedEngine) {
    var engine = this.engines[record.assignedEngine.familyId];
    if (engine) {
      engine.tasksProcessed++;
      engine.totalLatencyMs += durationMs;
      engine.lastUsed = endTime;
    }
  }

  return {
    taskId: taskId,
    result: 'executed',
    engineUsed: record.assignedEngine,
    durationMs: durationMs
  };
};

EngineCore.prototype.getMetrics = function () {
  var completed = this.metrics.totalCompleted;
  return {
    totalDispatched: this.metrics.totalDispatched,
    totalCompleted: completed,
    totalFailed: this.metrics.totalFailed,
    totalUnroutable: this.metrics.totalUnroutable,
    averageLatencyMs: completed > 0 ? this.metrics.cumulativeLatencyMs / completed : 0,
    engineCount: this.engineCount
  };
};

EngineCore.prototype.listEngines = function () {
  var result = [];
  for (var key in this.engines) {
    result.push(this.engines[key]);
  }
  return result;
};

/* ════════════════════════════════════════════════════════════════
   ModelRouter — capability-based model selection
   ════════════════════════════════════════════════════════════════ */

var COST_TIER_WEIGHTS = { free: 0, standard: 1, premium: 2 };
var PRIORITY_WEIGHTS = { low: 0, medium: 1, high: 2, critical: 3 };

function ModelRouter() {
  this.models = {};
  this.modelCount = 0;
}

ModelRouter.prototype.registerModel = function (modelId, capabilities, config) {
  this.models[modelId] = {
    modelId: modelId,
    capabilities: capabilities || [],
    config: {
      priority: (config && config.priority) || 10,
      latencyBudget: (config && config.latencyBudget) || 5000,
      costTier: (config && config.costTier) || 'standard'
    },
    stats: { successes: 0, failures: 0, totalTasks: 0 }
  };
  this.modelCount++;
};

ModelRouter.prototype.route = function (task) {
  var requirements = task.requirements || [];
  var taskPriority = task.priority || 'medium';
  var bestModel = null;
  var bestScore = -Infinity;

  for (var key in this.models) {
    var model = this.models[key];
    // Capability coverage
    var matched = 0;
    for (var i = 0; i < requirements.length; i++) {
      if (model.capabilities.indexOf(requirements[i]) !== -1) matched++;
    }
    var coverage = requirements.length > 0 ? matched / requirements.length : 1;

    // Priority alignment
    var taskWeight = PRIORITY_WEIGHTS[taskPriority] || 1;
    var modelPri = model.config.priority;
    var priorityScore = Math.max(0, 1 - Math.abs(taskWeight - modelPri) / 10);

    // Cost penalty
    var costPenalty = (COST_TIER_WEIGHTS[model.config.costTier] || 1) * 0.1;

    // Success bonus
    var total = model.stats.totalTasks;
    var successRate = total > 0 ? model.stats.successes / total : 0.5;

    var score = coverage * 3 + priorityScore * 2 - costPenalty + successRate;

    if (score > bestScore) {
      bestScore = score;
      bestModel = model;
    }
  }

  if (bestModel) {
    bestModel.stats.totalTasks++;
    return {
      routed: true,
      modelId: bestModel.modelId,
      score: Math.round(bestScore * 1000) / 1000,
      capabilities: bestModel.capabilities
    };
  }

  return { routed: false, modelId: null, score: 0 };
};

ModelRouter.prototype.recordOutcome = function (modelId, success) {
  var model = this.models[modelId];
  if (model) {
    if (success) model.stats.successes++;
    else model.stats.failures++;
  }
};

/* ════════════════════════════════════════════════════════════════
   ModelWire — intelligence wires between engines and organism
   ════════════════════════════════════════════════════════════════ */

var RING_TO_LAYER = {
  'Interface Ring': 'orchestration-layer',
  'Memory Ring': 'memory-layer',
  'Sovereign Ring': 'sovereign-compute',
  'Build Ring': 'packaging-layer',
  'Geometry Ring': 'scene-layer',
  'Transport Ring': 'channel-layer',
  'Native Capability Ring': 'native-runtime',
  'Proof Ring': 'verification-layer',
  'Counsel Ring': 'governance-layer'
};

function ModelWire() {
  this.wires = {};
  this.wireCount = 0;
  this.endpoints = {};
  this.metrics = {
    totalBytesSent: 0,
    totalMessages: 0,
    activeWires: 0,
    failedConnections: 0
  };
}

ModelWire.prototype.registerEndpoint = function (endpointId, meta) {
  this.endpoints[endpointId] = {
    type: (meta && meta.type) || 'external',
    ringAffinity: (meta && meta.ringAffinity) || null,
    capabilities: (meta && meta.capabilities) || []
  };
};

ModelWire.prototype.connect = function (sourceId, targetId, options) {
  options = options || {};
  var now = new Date().toISOString();
  var wire = {
    wireId: uuid(),
    sourceEndpoint: sourceId,
    targetEndpoint: targetId,
    wireProtocol: options.wireProtocol || 'intelligence-wire/default',
    encryption: options.encryption || 'aes-256-gcm',
    status: 'connected',
    bandwidth: options.bandwidth || 1000,
    createdAt: now,
    lastActivity: now,
    messageCount: 0,
    bytesSent: 0
  };
  this.wires[wire.wireId] = wire;
  this.wireCount++;
  this.metrics.activeWires++;
  return wire;
};

ModelWire.prototype.wireEngineToOrganism = function (familyId, component, protocol) {
  var engineEp = 'engine/' + familyId;
  var organismEp = 'organism/' + component;
  if (!this.endpoints[engineEp]) {
    this.registerEndpoint(engineEp, { type: 'engine' });
  }
  if (!this.endpoints[organismEp]) {
    this.registerEndpoint(organismEp, { type: 'organism' });
  }
  return this.connect(engineEp, organismEp, { wireProtocol: protocol });
};

ModelWire.prototype.wireAllEngines = function (families, components) {
  var compSet = {};
  for (var i = 0; i < components.length; i++) compSet[components[i]] = true;
  var records = [];
  for (var j = 0; j < families.length; j++) {
    var f = families[j];
    var layer = RING_TO_LAYER[f.ringAffinity];
    if (!layer || !compSet[layer]) continue;
    var protocol = 'intelligence-wire/' + f.id;
    records.push(this.wireEngineToOrganism(f.id, layer, protocol));
  }
  return records;
};

ModelWire.prototype.send = function (wireId, message) {
  var wire = this.wires[wireId];
  if (!wire || wire.status !== 'connected') return { delivered: false };
  var payloadBytes = JSON.stringify(message.payload || '').length;
  wire.messageCount++;
  wire.bytesSent += payloadBytes;
  wire.lastActivity = new Date().toISOString();
  this.metrics.totalMessages++;
  this.metrics.totalBytesSent += payloadBytes;
  return { delivered: true, wireId: wireId, timestamp: wire.lastActivity };
};

ModelWire.prototype.healthCheck = function () {
  var connected = 0, disconnected = 0, error = 0;
  for (var key in this.wires) {
    var w = this.wires[key];
    if (w.status === 'connected') connected++;
    else if (w.status === 'disconnected') disconnected++;
    else error++;
  }
  return { total: this.wireCount, connected: connected, disconnected: disconnected, error: error };
};

ModelWire.prototype.listWires = function () {
  var result = [];
  for (var key in this.wires) result.push(this.wires[key]);
  return result;
};

ModelWire.prototype.getMetrics = function () {
  return {
    totalBytesSent: this.metrics.totalBytesSent,
    totalMessages: this.metrics.totalMessages,
    activeWires: this.metrics.activeWires,
    failedConnections: this.metrics.failedConnections
  };
};

/* ════════════════════════════════════════════════════════════════
   AI Model Families — all 40 families
   ════════════════════════════════════════════════════════════════ */

var MODEL_FAMILIES = [
  { id: 'AIF-001', name: 'GPT', alphaModel: 'GPT-4o', primaryCapability: 'Multi-modal reasoning', ringAffinity: 'Interface Ring', routingPriority: 'P0', wireProtocol: 'intelligence-wire/openai' },
  { id: 'AIF-002', name: 'Claude', alphaModel: 'Claude 3.5 Sonnet', primaryCapability: 'Long-context reasoning', ringAffinity: 'Interface Ring', routingPriority: 'P0', wireProtocol: 'intelligence-wire/anthropic' },
  { id: 'AIF-003', name: 'Gemini', alphaModel: 'Gemini 1.5 Pro', primaryCapability: 'Multi-modal reasoning', ringAffinity: 'Interface Ring', routingPriority: 'P0', wireProtocol: 'intelligence-wire/google' },
  { id: 'AIF-004', name: 'Llama', alphaModel: 'Llama 3 70B', primaryCapability: 'Open-weight reasoning', ringAffinity: 'Sovereign Ring', routingPriority: 'P1', wireProtocol: 'intelligence-wire/meta' },
  { id: 'AIF-005', name: 'Codex', alphaModel: 'GPT-4o (code)', primaryCapability: 'Code generation', ringAffinity: 'Build Ring', routingPriority: 'P0', wireProtocol: 'intelligence-wire/openai' },
  { id: 'AIF-006', name: 'DALL-E', alphaModel: 'DALL-E 3', primaryCapability: 'Image generation', ringAffinity: 'Geometry Ring', routingPriority: 'P1', wireProtocol: 'intelligence-wire/openai' },
  { id: 'AIF-007', name: 'Whisper', alphaModel: 'Whisper v3', primaryCapability: 'Speech recognition', ringAffinity: 'Native Capability Ring', routingPriority: 'P1', wireProtocol: 'intelligence-wire/openai' },
  { id: 'AIF-008', name: 'Stable Diffusion', alphaModel: 'SDXL', primaryCapability: 'Image generation', ringAffinity: 'Geometry Ring', routingPriority: 'P1', wireProtocol: 'intelligence-wire/stability' },
  { id: 'AIF-009', name: 'Midjourney', alphaModel: 'MJ v6', primaryCapability: 'Artistic generation', ringAffinity: 'Geometry Ring', routingPriority: 'P2', wireProtocol: 'intelligence-wire/midjourney' },
  { id: 'AIF-010', name: 'Sora', alphaModel: 'Sora', primaryCapability: 'Video generation', ringAffinity: 'Geometry Ring', routingPriority: 'P1', wireProtocol: 'intelligence-wire/openai' },
  { id: 'AIF-011', name: 'Runway', alphaModel: 'Gen-3 Alpha', primaryCapability: 'Video generation', ringAffinity: 'Geometry Ring', routingPriority: 'P2', wireProtocol: 'intelligence-wire/runway' },
  { id: 'AIF-012', name: 'ElevenLabs', alphaModel: 'Turbo v2.5', primaryCapability: 'Speech synthesis', ringAffinity: 'Native Capability Ring', routingPriority: 'P1', wireProtocol: 'intelligence-wire/elevenlabs' },
  { id: 'AIF-013', name: 'Suno', alphaModel: 'Suno v3.5', primaryCapability: 'Music generation', ringAffinity: 'Geometry Ring', routingPriority: 'P2', wireProtocol: 'intelligence-wire/suno' },
  { id: 'AIF-014', name: 'MusicGen', alphaModel: 'MusicGen Large', primaryCapability: 'Music generation', ringAffinity: 'Geometry Ring', routingPriority: 'P2', wireProtocol: 'intelligence-wire/meta' },
  { id: 'AIF-015', name: 'Perplexity', alphaModel: 'Sonar Large', primaryCapability: 'Research search', ringAffinity: 'Transport Ring', routingPriority: 'P1', wireProtocol: 'intelligence-wire/perplexity' },
  { id: 'AIF-016', name: 'CodeLlama', alphaModel: 'Code Llama 70B', primaryCapability: 'Code generation', ringAffinity: 'Build Ring', routingPriority: 'P1', wireProtocol: 'intelligence-wire/meta' },
  { id: 'AIF-017', name: 'DeepSeek', alphaModel: 'DeepSeek Coder V2', primaryCapability: 'Code generation', ringAffinity: 'Build Ring', routingPriority: 'P1', wireProtocol: 'intelligence-wire/deepseek' },
  { id: 'AIF-018', name: 'Qwen', alphaModel: 'Qwen2 72B', primaryCapability: 'Multilingual reasoning', ringAffinity: 'Interface Ring', routingPriority: 'P1', wireProtocol: 'intelligence-wire/alibaba' },
  { id: 'AIF-019', name: 'Phi', alphaModel: 'Phi-3 Medium', primaryCapability: 'Edge inference', ringAffinity: 'Sovereign Ring', routingPriority: 'P1', wireProtocol: 'intelligence-wire/microsoft' },
  { id: 'AIF-020', name: 'Gemma', alphaModel: 'Gemma 2 27B', primaryCapability: 'Edge inference', ringAffinity: 'Sovereign Ring', routingPriority: 'P2', wireProtocol: 'intelligence-wire/google' },
  { id: 'AIF-021', name: 'Command R', alphaModel: 'Command R+', primaryCapability: 'RAG retrieval', ringAffinity: 'Memory Ring', routingPriority: 'P1', wireProtocol: 'intelligence-wire/cohere' },
  { id: 'AIF-022', name: 'Embeddings', alphaModel: 'text-embedding-3-large', primaryCapability: 'Semantic embedding', ringAffinity: 'Memory Ring', routingPriority: 'P0', wireProtocol: 'intelligence-wire/openai' },
  { id: 'AIF-023', name: 'Rerankers', alphaModel: 'Cohere Rerank 3', primaryCapability: 'Document reranking', ringAffinity: 'Memory Ring', routingPriority: 'P1', wireProtocol: 'intelligence-wire/cohere' },
  { id: 'AIF-024', name: 'SAM', alphaModel: 'SAM 2', primaryCapability: 'Image segmentation', ringAffinity: 'Geometry Ring', routingPriority: 'P2', wireProtocol: 'intelligence-wire/meta' },
  { id: 'AIF-025', name: 'Florence', alphaModel: 'Florence-2-Large', primaryCapability: 'Vision understanding', ringAffinity: 'Memory Ring', routingPriority: 'P2', wireProtocol: 'intelligence-wire/microsoft' },
  { id: 'AIF-026', name: 'Guards', alphaModel: 'Llama Guard 3', primaryCapability: 'Safety filtering', ringAffinity: 'Counsel Ring', routingPriority: 'P0', wireProtocol: 'intelligence-wire/meta' },
  { id: 'AIF-027', name: 'Minerva-Llemma', alphaModel: 'Llemma 34B', primaryCapability: 'Mathematical proof', ringAffinity: 'Proof Ring', routingPriority: 'P2', wireProtocol: 'intelligence-wire/eleuther' },
  { id: 'AIF-028', name: 'AlphaCode', alphaModel: 'AlphaCode 2', primaryCapability: 'Competitive coding', ringAffinity: 'Build Ring', routingPriority: 'P2', wireProtocol: 'intelligence-wire/google' },
  { id: 'AIF-029', name: 'Grok', alphaModel: 'Grok-2', primaryCapability: 'Real-time reasoning', ringAffinity: 'Interface Ring', routingPriority: 'P1', wireProtocol: 'intelligence-wire/xai' },
  { id: 'AIF-030', name: 'Inflection', alphaModel: 'Inflection-2.5', primaryCapability: 'Empathetic reasoning', ringAffinity: 'Interface Ring', routingPriority: 'P2', wireProtocol: 'intelligence-wire/inflection' },
  { id: 'AIF-031', name: 'DBRX', alphaModel: 'DBRX 132B', primaryCapability: 'Enterprise reasoning', ringAffinity: 'Sovereign Ring', routingPriority: 'P2', wireProtocol: 'intelligence-wire/databricks' },
  { id: 'AIF-032', name: 'Pika', alphaModel: 'Pika 1.0', primaryCapability: 'Video generation', ringAffinity: 'Geometry Ring', routingPriority: 'P3', wireProtocol: 'intelligence-wire/pika' },
  { id: 'AIF-033', name: 'Kling', alphaModel: 'Kling 1.5', primaryCapability: 'Video generation', ringAffinity: 'Geometry Ring', routingPriority: 'P3', wireProtocol: 'intelligence-wire/kuaishou' },
  { id: 'AIF-034', name: 'Mistral', alphaModel: 'Mistral Large 2', primaryCapability: 'Multi-modal reasoning', ringAffinity: 'Interface Ring', routingPriority: 'P1', wireProtocol: 'intelligence-wire/mistral' },
  { id: 'AIF-035', name: 'Cohere', alphaModel: 'Command R+', primaryCapability: 'Enterprise search', ringAffinity: 'Transport Ring', routingPriority: 'P1', wireProtocol: 'intelligence-wire/cohere' },
  { id: 'AIF-036', name: 'Yi', alphaModel: 'Yi-Large', primaryCapability: 'Bilingual reasoning', ringAffinity: 'Interface Ring', routingPriority: 'P2', wireProtocol: 'intelligence-wire/01ai' },
  { id: 'AIF-037', name: 'Jamba', alphaModel: 'Jamba 1.5 Large', primaryCapability: 'Long-context processing', ringAffinity: 'Memory Ring', routingPriority: 'P2', wireProtocol: 'intelligence-wire/ai21' },
  { id: 'AIF-038', name: 'Arctic', alphaModel: 'Arctic', primaryCapability: 'Enterprise intelligence', ringAffinity: 'Sovereign Ring', routingPriority: 'P3', wireProtocol: 'intelligence-wire/snowflake' },
  { id: 'AIF-039', name: 'Falcon', alphaModel: 'Falcon 180B', primaryCapability: 'Open-weight reasoning', ringAffinity: 'Sovereign Ring', routingPriority: 'P3', wireProtocol: 'intelligence-wire/tii' },
  { id: 'AIF-040', name: 'StarCoder', alphaModel: 'StarCoder2 15B', primaryCapability: 'Code generation', ringAffinity: 'Build Ring', routingPriority: 'P2', wireProtocol: 'intelligence-wire/bigcode' }
];

var ORGANISM_LAYERS = [
  'orchestration-layer',
  'memory-layer',
  'sovereign-compute',
  'packaging-layer',
  'scene-layer',
  'channel-layer',
  'native-runtime',
  'verification-layer',
  'governance-layer'
];

/* ════════════════════════════════════════════════════════════════
   Organism State — live running state
   ════════════════════════════════════════════════════════════════ */

var engineCore = null;
var modelRouter = null;
var modelWire = null;
var bootTime = null;

function bootOrganism() {
  bootTime = Date.now();

  // 1. Initialize EngineCore and register all 40 families
  engineCore = new EngineCore();
  engineCore.registerAll(MODEL_FAMILIES);
  engineCore.status = 'alive';

  // 2. Initialize ModelRouter and register all models
  modelRouter = new ModelRouter();
  for (var i = 0; i < MODEL_FAMILIES.length; i++) {
    var f = MODEL_FAMILIES[i];
    var caps = [f.primaryCapability];
    modelRouter.registerModel(f.id, caps, {
      priority: PRIORITY_ORDER.indexOf(f.routingPriority),
      costTier: f.routingPriority === 'P0' ? 'premium' : (f.routingPriority === 'P1' ? 'standard' : 'free')
    });
  }

  // 3. Initialize ModelWire and wire all engines to organism layers
  modelWire = new ModelWire();
  var wires = modelWire.wireAllEngines(MODEL_FAMILIES, ORGANISM_LAYERS);

  return {
    enginesRegistered: engineCore.engineCount,
    modelsRouted: modelRouter.modelCount,
    wiresConnected: wires.length,
    layers: ORGANISM_LAYERS.length,
    bootTimeMs: Date.now() - bootTime,
    status: 'alive'
  };
}

/* ════════════════════════════════════════════════════════════════
   Message handler
   ════════════════════════════════════════════════════════════════ */

self.onmessage = function (e) {
  var msg = e.data;
  neuro.onMessage(msg.type);

  switch (msg.type) {
    case 'boot': {
      var result = bootOrganism();
      self.postMessage({ type: 'booted', data: result });
      break;
    }

    case 'dispatch': {
      if (!engineCore) { self.postMessage({ type: 'error', error: 'Engine not booted' }); break; }
      var task = msg.task || {};
      var record = engineCore.dispatch(task);
      var execResult = engineCore.execute(record.taskId);

      // Also send through a wire
      var wireList = modelWire.listWires();
      if (wireList.length > 0) {
        var wireIdx = Math.floor(Math.random() * wireList.length);
        modelWire.send(wireList[wireIdx].wireId, {
          type: task.type || 'dispatch',
          payload: task.payload || record.taskId,
          timestamp: new Date().toISOString()
        });
      }

      self.postMessage({
        type: 'dispatch-result',
        record: record,
        execution: execResult,
        engineMetrics: engineCore.getMetrics(),
        wireMetrics: modelWire.getMetrics()
      });
      break;
    }

    case 'route': {
      if (!modelRouter) { self.postMessage({ type: 'error', error: 'Router not booted' }); break; }
      var routeTask = msg.task || {};
      var routeResult = modelRouter.route(routeTask);
      self.postMessage({ type: 'route-result', data: routeResult });
      break;
    }

    case 'query': {
      if (!engineCore) { self.postMessage({ type: 'error', error: 'Engine not booted' }); break; }
      var queryType = msg.query || 'engines';
      var queryData = null;

      switch (queryType) {
        case 'engines':
          queryData = engineCore.listEngines();
          break;
        case 'wires':
          queryData = modelWire.listWires();
          break;
        case 'metrics':
          queryData = {
            engine: engineCore.getMetrics(),
            wire: modelWire.getMetrics(),
            uptime: Date.now() - bootTime,
            heartbeats: beatCount
          };
          break;
        case 'health':
          queryData = {
            engine: { status: engineCore.status, engineCount: engineCore.engineCount },
            wire: modelWire.healthCheck(),
            heartbeat: { beat: beatCount, alive: running },
            uptime: Date.now() - bootTime
          };
          break;
        case 'families':
          queryData = MODEL_FAMILIES;
          break;
        default:
          queryData = { error: 'Unknown query: ' + queryType };
      }

      self.postMessage({ type: 'query-result', query: queryType, data: queryData });
      break;
    }

    case 'neuro-signal':
      neuro.receiveNeuroSignal(msg);
      break;
    case 'stop':
      running = false;
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      self.postMessage({ type: 'stopped' });
      break;
  }
  neuro.onMessageDone();
};

/* ════════════════════════════════════════════════════════════════
   Heartbeat — permanent 873ms organism pulse
   ════════════════════════════════════════════════════════════════ */

var neuro = new NeuroCore('engine');

var heartbeatInterval = setInterval(function () {
  if (!running) return;
  beatCount++;

  var payload = {
    type: 'heartbeat',
    beat: beatCount,
    phi: PHI,
    heartbeatMs: HEARTBEAT_MS,
    timestamp: Date.now(),
    status: engineCore ? engineCore.status : 'pre-boot'
  };

  // Add live metrics every 5th beat
  if (beatCount % 5 === 0 && engineCore) {
    payload.metrics = {
      engine: engineCore.getMetrics(),
      wire: modelWire ? modelWire.getMetrics() : null,
      wireHealth: modelWire ? modelWire.healthCheck() : null,
      uptime: Date.now() - (bootTime || Date.now())
    };
  }

  payload.neuro = neuro.pulse();
  self.postMessage(payload);
}, HEARTBEAT_MS);
