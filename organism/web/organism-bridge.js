/**
 * OrganismBridge — Autonomous Multi-Worker Orchestration Bridge
 *
 * Boots, coordinates, and SELF-HEALS all 14 organism workers,
 * organized into 4 autonomous divisions:
 *
 * 🧠 BRAIN DIVISION — Thinking & reasoning
 *   - engine-worker.js:       EngineCore + ModelRouter + ModelWire (40 AI families)
 *   - inference-worker.js:    Local ML inference, classification, embeddings
 *   - orchestrator-worker.js: Micro-worker orchestration, task decomposition
 *   - twin-alpha-worker.js:   User-facing intermediary, memory search, task routing, monitoring
 *
 * 💾 DATA DIVISION — Memory, analytics & pipelines
 *   - memory-worker.js:       Sovereign Memory (spatial store, search, persistence)
 *   - analytics-worker.js:    Product analytics, funnel analysis, session tracking
 *   - pipeline-worker.js:     Data pipeline, ETL transforms, stream processing
 *
 * 🏗 INFRASTRUCTURE DIVISION — Always-on backbone
 *   - mesh-worker.js:         Infrastructure mesh, cross-tab coordination, leader election
 *   - scheduler-worker.js:    24/7 task scheduling, cron jobs, deferred execution
 *   - guardian-worker.js:     Security guardian, threat detection, rate limiting
 *   - telemetry-worker.js:    Health monitoring (per-worker status, ring health, alerts)
 *
 * 🔐 PROTOCOL DIVISION — Communication & trust
 *   - routing-worker.js:      Protocol routing (10 protocols, fusion, circuit breakers)
 *   - crypto-worker.js:       Cryptography (AES-256-GCM, hashing, tokens)
 *   - contract-worker.js:     Contract verification, SLA enforcement, audit trail
 *
 * AUTONOMY: Every worker is monitored. If a worker misses heartbeats,
 * it is automatically terminated and restarted with φ-backoff.
 * Each division reports aggregate health. The organism heals itself.
 *
 * Usage:
 *   var bridge = new OrganismBridge({
 *     onHeartbeat: function(beat) { ... },
 *     onBooted: function(data) { ... },
 *     onDispatch: function(result) { ... },
 *     onRoute: function(result) { ... },
 *     onQuery: function(query, data) { ... },
 *     onMemory: function(event) { ... },
 *     onTelemetry: function(event) { ... },
 *     onCrypto: function(event) { ... },
 *     onWorkerStatus: function(statuses) { ... },
 *     onDivisionStatus: function(divisions) { ... },
 *     onWorkerRestart: function(name, restarts) { ... },
 *     onError: function(err) { ... }
 *   });
 *   bridge.boot();
 */

'use strict';

var PHI = 1.618033988749895;
var HEARTBEAT_MS = 873;
var MAX_MISSED_HEARTBEATS = 5;
var MAX_RESTARTS_PER_WORKER = 50;

var WORKER_PATHS = {
  engine:       'organism/web/engine-worker.js',
  memory:       'organism/web/memory-worker.js',
  routing:      'organism/web/routing-worker.js',
  telemetry:    'organism/web/telemetry-worker.js',
  crypto:       'organism/web/crypto-worker.js',
  contract:     'organism/web/contract-worker.js',
  scheduler:    'organism/web/scheduler-worker.js',
  mesh:         'organism/web/mesh-worker.js',
  analytics:    'organism/web/analytics-worker.js',
  guardian:     'organism/web/guardian-worker.js',
  pipeline:     'organism/web/pipeline-worker.js',
  inference:    'organism/web/inference-worker.js',
  orchestrator: 'organism/web/orchestrator-worker.js',
  'twin-alpha':  'organism/web/twin-alpha-worker.js',
  math:         'organism/web/math-worker.js'
};

/* ════════════════════════════════════════════════════════════════
   Worker Divisions — autonomous groupings
   ════════════════════════════════════════════════════════════════ */

var DIVISIONS = {
  brain:          { name: 'Brain',          icon: '🧠', workers: ['engine', 'inference', 'orchestrator', 'twin-alpha', 'math'], purpose: 'Thinking, reasoning & mathematics' },
  data:           { name: 'Data',           icon: '💾', workers: ['memory', 'analytics', 'pipeline'],           purpose: 'Memory, analytics & pipelines' },
  infrastructure: { name: 'Infrastructure', icon: '🏗', workers: ['mesh', 'scheduler', 'guardian', 'telemetry'], purpose: 'Always-on backbone' },
  protocol:       { name: 'Protocol',       icon: '🔐', workers: ['routing', 'crypto', 'contract'],             purpose: 'Communication & trust' }
};

function OrganismBridge(config) {
  this.config = config || {};
  this.workers = {};         // name → Worker
  this.workerStatus = {};    // name → { status, heartbeats, lastBeat, restarts, missedBeats, lastRestart }
  this.status = 'idle';
  this.heartbeatCount = 0;
  this.lastHeartbeat = 0;
  this.bootData = null;
  this.lastMetrics = null;
  this.memoryStorageKey = 'organism-memory-store';
  this._healthInterval = null;
  this._autonomyBoot = Date.now();
  this._totalRestarts = 0;
}

/* ────────────────────────────────────────────────────────
   Boot — starts ALL workers in parallel + autonomy monitor
   ──────────────────────────────────────────────────────── */

OrganismBridge.prototype.boot = function () {
  var self = this;
  this.status = 'booting';
  this._autonomyBoot = Date.now();

  // Launch every worker
  for (var name in WORKER_PATHS) {
    this._startWorker(name, WORKER_PATHS[name]);
  }

  // Boot the engine
  if (this.workers.engine) {
    this.workers.engine.postMessage({ type: 'boot' });
  }

  // Auto-join mesh network
  if (this.workers.mesh) {
    this.workers.mesh.postMessage({ type: 'join', nodeId: 'tab-' + Date.now().toString(36), capabilities: Object.keys(WORKER_PATHS) });
  }

  // Start analytics session
  if (this.workers.analytics) {
    this.workers.analytics.postMessage({ type: 'session-start' });
    this.workers.analytics.postMessage({ type: 'page-view', page: location.pathname || '/' });
  }

  // Start the autonomy health monitor — runs forever
  this._startHealthMonitor();

  // Restore persisted memory
  this._restoreMemory();
};

OrganismBridge.prototype._startWorker = function (name, path) {
  var self = this;

  // Preserve restart count across restarts
  if (!this.workerStatus[name]) {
    this.workerStatus[name] = { status: 'booting', heartbeats: 0, lastBeat: 0, restarts: 0, missedBeats: 0, lastRestart: 0 };
  } else {
    this.workerStatus[name].status = 'booting';
    this.workerStatus[name].missedBeats = 0;
  }

  // Terminate existing worker if any
  if (this.workers[name]) {
    try { this.workers[name].terminate(); } catch (e) { /* ignore */ }
    this.workers[name] = null;
  }

  try {
    this.workers[name] = new Worker(path);
  } catch (e) {
    this.workerStatus[name].status = 'error';
    if (this.config.onError) this.config.onError(name + ' worker load failed: ' + e.message);
    return;
  }

  this.workers[name].onmessage = function (e) {
    self._handleMessage(name, e.data);
  };

  this.workers[name].onerror = function (err) {
    self.workerStatus[name].status = 'crashed';
    // Report to telemetry worker
    if (self.workers.telemetry && name !== 'telemetry') {
      self.workers.telemetry.postMessage({ type: 'report', worker: name, data: { error: err.message } });
    }
    if (self.config.onError) self.config.onError(name + ': ' + (err.message || 'Worker error'));
    // Autonomy will detect the crash and restart
  };
};

/* ────────────────────────────────────────────────────────
   Message Router — handles messages from ALL workers
   ──────────────────────────────────────────────────────── */

OrganismBridge.prototype._handleMessage = function (workerName, msg) {
  // Track heartbeats from any worker
  if (msg.type === 'heartbeat') {
    this.workerStatus[workerName].status = 'alive';
    this.workerStatus[workerName].heartbeats = msg.beat;
    this.workerStatus[workerName].lastBeat = msg.timestamp;
    this.workerStatus[workerName].missedBeats = 0;

    // Track neuro vitals from heartbeat
    if (msg.neuro) {
      this.workerStatus[workerName].neuro = msg.neuro;

      // Phase coupling: broadcast this worker's phase to all other workers
      var phase = msg.neuro.emergence ? msg.neuro.emergence.phase : 0;
      for (var peer in this.workers) {
        if (peer !== workerName && this.workers[peer]) {
          this.workers[peer].postMessage({
            type: 'neuro-signal',
            neuroSource: workerName,
            neuroPhase: phase
          });
        }
      }

      // Emit neuro status to UI
      if (this.config.onNeuroStatus) {
        this.config.onNeuroStatus(workerName, msg.neuro);
      }

      // Detect cascade activation
      if (msg.neuro.emergence && msg.neuro.emergence.cascadeActive) {
        if (this.config.onCascade) {
          this.config.onCascade(workerName, msg.neuro.emergence);
        }
      }
    }

    // Forward heartbeats to telemetry
    if (workerName !== 'telemetry' && this.workers.telemetry) {
      this.workers.telemetry.postMessage({ type: 'worker-heartbeat', worker: workerName });
    }
  }

  // Route by worker
  switch (workerName) {
    case 'engine':
      this._handleEngineMessage(msg);
      break;
    case 'memory':
      this._handleMemoryMessage(msg);
      break;
    case 'routing':
      this._handleRoutingMessage(msg);
      break;
    case 'telemetry':
      this._handleTelemetryMessage(msg);
      break;
    case 'crypto':
      this._handleCryptoMessage(msg);
      break;
    case 'contract':
    case 'scheduler':
    case 'mesh':
    case 'analytics':
    case 'guardian':
    case 'pipeline':
    case 'inference':
    case 'orchestrator':
    case 'math':
      this._handleExtendedMessage(workerName, msg);
      break;
  }

  // Emit worker statuses on every heartbeat from engine
  if (workerName === 'engine' && msg.type === 'heartbeat') {
    this.heartbeatCount = msg.beat;
    this.lastHeartbeat = msg.timestamp;
    if (msg.metrics) this.lastMetrics = msg.metrics;
    if (this.config.onHeartbeat) this.config.onHeartbeat(msg);

    // Report engine metrics to telemetry
    if (msg.metrics && this.workers.telemetry) {
      this.workers.telemetry.postMessage({ type: 'report', worker: 'engine', data: msg.metrics.engine || {} });
    }

    // Emit worker status summary
    if (this.config.onWorkerStatus) {
      this.config.onWorkerStatus(this.getWorkerStatuses());
    }
  }
};

OrganismBridge.prototype._handleEngineMessage = function (msg) {
  switch (msg.type) {
    case 'booted':
      this.status = 'alive';
      this.bootData = msg.data;
      if (this.config.onBooted) this.config.onBooted(msg.data);
      break;
    case 'dispatch-result':
      // Store dispatch in memory
      if (this.workers.memory) {
        this.workers.memory.postMessage({
          type: 'store',
          memory: {
            key: 'dispatch-' + msg.record.taskId,
            value: { record: msg.record, execution: msg.execution },
            tags: ['dispatch', msg.record.type, msg.record.assignedEngine ? msg.record.assignedEngine.familyName : 'none'],
            source: 'engine'
          }
        });
      }
      if (this.config.onDispatch) this.config.onDispatch(msg);
      break;
    case 'route-result':
      if (this.config.onRoute) this.config.onRoute(msg.data);
      break;
    case 'query-result':
      if (this.config.onQuery) this.config.onQuery(msg.query, msg.data);
      break;
    case 'error':
      if (this.config.onError) this.config.onError(msg.error);
      break;
  }
};

OrganismBridge.prototype._handleMemoryMessage = function (msg) {
  switch (msg.type) {
    case 'persist-request':
      // Worker asks main thread to save to localStorage
      try { localStorage.setItem(msg.key, JSON.stringify(msg.data)); } catch (e) { /* ignore */ }
      break;
    default:
      if (this.config.onMemory) this.config.onMemory(msg);
  }
};

OrganismBridge.prototype._handleRoutingMessage = function (msg) {
  switch (msg.type) {
    case 'route-result':
      if (this.config.onRoute) this.config.onRoute(msg.data);
      break;
    default:
      if (this.config.onRouting) this.config.onRouting(msg);
  }
};

OrganismBridge.prototype._handleTelemetryMessage = function (msg) {
  switch (msg.type) {
    case 'alert':
      if (this.config.onAlert) this.config.onAlert(msg.alert);
      break;
    default:
      if (this.config.onTelemetry) this.config.onTelemetry(msg);
  }
};

OrganismBridge.prototype._handleCryptoMessage = function (msg) {
  if (this.config.onCrypto) this.config.onCrypto(msg);
};

OrganismBridge.prototype._handleExtendedMessage = function (workerName, msg) {
  // Forward threat alerts from guardian
  if (workerName === 'guardian' && msg.type === 'threat-alert') {
    if (this.config.onAlert) this.config.onAlert({ message: 'Security: ' + msg.threat.type + ' — ' + msg.threat.detail, source: 'guardian' });
  }
  // Forward micro-tasks from orchestrator to appropriate workers
  if (workerName === 'orchestrator' && msg.type === 'micro-task') {
    var targetWorker = this.workers[msg.worker];
    if (targetWorker) {
      targetWorker.postMessage({ type: msg.action, task: msg.payload, _orchestratorTaskId: msg.taskId });
    }
  }
  // Forward scheduled job firings
  if (workerName === 'scheduler' && msg.type === 'job-fired') {
    // Route job to the appropriate worker based on action
    if (msg.action && this.workers[msg.action]) {
      this.workers[msg.action].postMessage({ type: 'dispatch', task: msg.payload });
    }
  }
  // Auto-track events in analytics
  if (workerName !== 'analytics' && msg.type !== 'heartbeat' && this.workers.analytics) {
    this.workers.analytics.postMessage({ type: 'track', event: { name: msg.type, category: workerName, data: null } });
  }
  // Generic callback
  if (this.config.onWorkerMessage) this.config.onWorkerMessage(workerName, msg);
};

/* ────────────────────────────────────────────────────────
   Memory persistence
   ──────────────────────────────────────────────────────── */

OrganismBridge.prototype._restoreMemory = function () {
  try {
    var raw = localStorage.getItem(this.memoryStorageKey);
    if (raw && this.workers.memory) {
      var data = JSON.parse(raw);
      if (Array.isArray(data)) {
        this.workers.memory.postMessage({ type: 'restore', data: data });
      }
    }
  } catch (e) { /* ignore */ }
};

/* ────────────────────────────────────────────────────────
   Public API — dispatch commands to workers
   ──────────────────────────────────────────────────────── */

OrganismBridge.prototype.dispatch = function (task) {
  if (this.workers.engine) this.workers.engine.postMessage({ type: 'dispatch', task: task });
};

OrganismBridge.prototype.route = function (task) {
  // Route through the routing worker (protocol-level), not just engine
  if (this.workers.routing) this.workers.routing.postMessage({ type: 'route', task: task });
};

OrganismBridge.prototype.query = function (queryType) {
  if (this.workers.engine) this.workers.engine.postMessage({ type: 'query', query: queryType });
};

OrganismBridge.prototype.storeMemory = function (memory) {
  if (this.workers.memory) this.workers.memory.postMessage({ type: 'store', memory: memory });
};

OrganismBridge.prototype.searchMemory = function (query, limit) {
  if (this.workers.memory) this.workers.memory.postMessage({ type: 'search', query: query, limit: limit || 10 });
};

OrganismBridge.prototype.memoryStats = function () {
  if (this.workers.memory) this.workers.memory.postMessage({ type: 'stats' });
};

OrganismBridge.prototype.encrypt = function (plaintext, password) {
  if (this.workers.crypto) this.workers.crypto.postMessage({ type: 'encrypt', plaintext: plaintext, password: password || 'sovereign' });
};

OrganismBridge.prototype.hash = function (data, algorithm) {
  if (this.workers.crypto) this.workers.crypto.postMessage({ type: 'hash', data: data, algorithm: algorithm || 'SHA-256' });
};

OrganismBridge.prototype.generateToken = function (length) {
  if (this.workers.crypto) this.workers.crypto.postMessage({ type: 'generate-token', length: length || 32 });
};

OrganismBridge.prototype.routingHealth = function () {
  if (this.workers.routing) this.workers.routing.postMessage({ type: 'health' });
};

OrganismBridge.prototype.dashboard = function () {
  if (this.workers.telemetry) this.workers.telemetry.postMessage({ type: 'dashboard' });
};

OrganismBridge.prototype.systemHealth = function () {
  if (this.workers.telemetry) this.workers.telemetry.postMessage({ type: 'health' });
};

/* ────────────────────────────────────────────────────────
   Extended Worker APIs — contracts, scheduler, mesh,
   analytics, guardian, pipeline, inference, orchestrator
   ──────────────────────────────────────────────────────── */

// Contract Worker
OrganismBridge.prototype.createContract = function (contract) {
  if (this.workers.contract) this.workers.contract.postMessage({ type: 'create-contract', contract: contract });
};
OrganismBridge.prototype.verifyContract = function (contractId, operation) {
  if (this.workers.contract) this.workers.contract.postMessage({ type: 'verify', contractId: contractId, operation: operation });
};
OrganismBridge.prototype.enforceSla = function (contractId, metrics) {
  if (this.workers.contract) this.workers.contract.postMessage({ type: 'enforce-sla', contractId: contractId, metrics: metrics });
};

// Scheduler Worker
OrganismBridge.prototype.scheduleJob = function (job) {
  if (this.workers.scheduler) this.workers.scheduler.postMessage({ type: 'schedule', job: job });
};
OrganismBridge.prototype.deferTask = function (task) {
  if (this.workers.scheduler) this.workers.scheduler.postMessage({ type: 'defer', task: task });
};

// Mesh Worker
OrganismBridge.prototype.joinMesh = function (nodeId, capabilities) {
  if (this.workers.mesh) this.workers.mesh.postMessage({ type: 'join', nodeId: nodeId, capabilities: capabilities });
};
OrganismBridge.prototype.meshBroadcast = function (message) {
  if (this.workers.mesh) this.workers.mesh.postMessage({ type: 'broadcast', message: message });
};

// Analytics Worker
OrganismBridge.prototype.trackEvent = function (event) {
  if (this.workers.analytics) this.workers.analytics.postMessage({ type: 'track', event: event });
};
OrganismBridge.prototype.analyticsReport = function (period) {
  if (this.workers.analytics) this.workers.analytics.postMessage({ type: 'report', period: period || 'all' });
};

// Guardian Worker
OrganismBridge.prototype.securityCheck = function (operation) {
  if (this.workers.guardian) this.workers.guardian.postMessage({ type: 'check', operation: operation });
};
OrganismBridge.prototype.rateCheck = function (key, limit, windowMs) {
  if (this.workers.guardian) this.workers.guardian.postMessage({ type: 'rate-check', key: key, limit: limit, windowMs: windowMs });
};

// Pipeline Worker
OrganismBridge.prototype.createPipeline = function (pipeline) {
  if (this.workers.pipeline) this.workers.pipeline.postMessage({ type: 'create-pipeline', pipeline: pipeline });
};
OrganismBridge.prototype.pushToPipeline = function (pipelineId, data) {
  if (this.workers.pipeline) this.workers.pipeline.postMessage({ type: 'push', pipelineId: pipelineId, data: data });
};

// Inference Worker
OrganismBridge.prototype.classify = function (text, categories) {
  if (this.workers.inference) this.workers.inference.postMessage({ type: 'classify', text: text, categories: categories });
};
OrganismBridge.prototype.sentiment = function (text) {
  if (this.workers.inference) this.workers.inference.postMessage({ type: 'sentiment', text: text });
};
OrganismBridge.prototype.embed = function (text) {
  if (this.workers.inference) this.workers.inference.postMessage({ type: 'embed', text: text });
};
OrganismBridge.prototype.extractKeywords = function (text, topK) {
  if (this.workers.inference) this.workers.inference.postMessage({ type: 'keywords', text: text, topK: topK || 10 });
};

// Orchestrator Worker
OrganismBridge.prototype.createWorkflow = function (workflow) {
  if (this.workers.orchestrator) this.workers.orchestrator.postMessage({ type: 'create-workflow', workflow: workflow });
};
OrganismBridge.prototype.executeWorkflow = function (workflowId) {
  if (this.workers.orchestrator) this.workers.orchestrator.postMessage({ type: 'execute', workflowId: workflowId });
};
OrganismBridge.prototype.decomposeTask = function (task) {
  if (this.workers.orchestrator) this.workers.orchestrator.postMessage({ type: 'decompose', task: task });
};

// Math Worker
OrganismBridge.prototype.matrixMultiply = function (a, b) {
  if (this.workers.math) this.workers.math.postMessage({ type: 'matrix-multiply', a: a, b: b });
};
OrganismBridge.prototype.computeStats = function (data) {
  if (this.workers.math) this.workers.math.postMessage({ type: 'compute-stats', data: data });
};
OrganismBridge.prototype.phiSequence = function (n) {
  if (this.workers.math) this.workers.math.postMessage({ type: 'phi-sequence', n: n || 20 });
};
OrganismBridge.prototype.phiSpiral = function (n) {
  if (this.workers.math) this.workers.math.postMessage({ type: 'phi-spiral', n: n || 50 });
};
OrganismBridge.prototype.fourier = function (signal) {
  if (this.workers.math) this.workers.math.postMessage({ type: 'fourier', signal: signal });
};
OrganismBridge.prototype.regression = function (x, y) {
  if (this.workers.math) this.workers.math.postMessage({ type: 'regression', x: x, y: y });
};
OrganismBridge.prototype.optimize = function (fn, bounds) {
  // Validate function expression before sending to math worker
  if (typeof fn !== 'string' || fn.length > 200) return;
  if (!/^[0-9x+\-*/().^ \s]+$/.test(fn.replace(/\b(sin|cos|tan|abs|sqrt|exp|log|pi)\b/gi, ''))) return;
  if (this.workers.math) this.workers.math.postMessage({ type: 'optimize', fn: fn, bounds: bounds });
};
OrganismBridge.prototype.primeCheck = function (n) {
  if (this.workers.math) this.workers.math.postMessage({ type: 'prime-check', n: n });
};
OrganismBridge.prototype.probability = function (dist, params) {
  if (this.workers.math) this.workers.math.postMessage({ type: 'probability', dist: dist, params: params });
};

// Enhanced Inference Worker — new capabilities
OrganismBridge.prototype.summarize = function (text, sentences) {
  if (this.workers.inference) this.workers.inference.postMessage({ type: 'summarize', text: text, sentences: sentences || 3 });
};
OrganismBridge.prototype.answerQuestion = function (question, context) {
  if (this.workers.inference) this.workers.inference.postMessage({ type: 'answer', question: question, context: context });
};
OrganismBridge.prototype.classifyIntent = function (text) {
  if (this.workers.inference) this.workers.inference.postMessage({ type: 'intent', text: text });
};
OrganismBridge.prototype.chainOfThought = function (question) {
  if (this.workers.inference) this.workers.inference.postMessage({ type: 'chain-of-thought', question: question });
};
OrganismBridge.prototype.modelTopics = function (text, k) {
  if (this.workers.inference) this.workers.inference.postMessage({ type: 'topics', text: text, k: k || 3 });
};

// Twin Alpha — ask
OrganismBridge.prototype.askTwinAlpha = function (query, context) {
  if (this.workers['twin-alpha']) this.workers['twin-alpha'].postMessage({ type: 'ask', query: query, context: context || {} });
};

/* ────────────────────────────────────────────────────────
   Autonomy — Self-Healing Health Monitor
   Runs forever. Detects dead workers. Restarts them.
   ──────────────────────────────────────────────────────── */

OrganismBridge.prototype._startHealthMonitor = function () {
  var self = this;
  if (this._healthInterval) clearInterval(this._healthInterval);

  this._healthInterval = setInterval(function () {
    if (self.status === 'stopped') return;
    var now = Date.now();

    for (var name in self.workerStatus) {
      var ws = self.workerStatus[name];

      // Skip workers that haven't sent their first heartbeat yet (still booting)
      if (ws.lastBeat === 0 && ws.status === 'booting') {
        // Give workers 10s to send first heartbeat before considering them dead
        if (ws.lastRestart > 0 && (now - ws.lastRestart) > 10000) {
          ws.status = 'crashed';
        }
        continue;
      }

      // Check for missed heartbeats
      if (ws.lastBeat > 0) {
        var elapsed = now - ws.lastBeat;
        if (elapsed > HEARTBEAT_MS * 2) {
          ws.missedBeats++;
          if (ws.missedBeats >= MAX_MISSED_HEARTBEATS && ws.status !== 'restarting') {
            ws.status = 'crashed';
          }
        }
      }

      // Auto-restart crashed workers
      if (ws.status === 'crashed' && ws.restarts < MAX_RESTARTS_PER_WORKER) {
        self._restartWorker(name);
      }
    }

    // Emit division statuses
    if (self.config.onDivisionStatus) {
      self.config.onDivisionStatus(self.getDivisionStatuses());
    }
  }, HEARTBEAT_MS);
};

OrganismBridge.prototype._restartWorker = function (name) {
  var ws = this.workerStatus[name];
  ws.status = 'restarting';
  ws.restarts++;
  ws.lastRestart = Date.now();
  ws.missedBeats = 0;
  this._totalRestarts++;

  // φ-backoff: delay = 500ms * φ^(restarts-1), capped at 30s
  var delay = Math.min(500 * Math.pow(PHI, ws.restarts - 1), 30000);

  var self = this;
  setTimeout(function () {
    self._startWorker(name, WORKER_PATHS[name]);

    // Re-boot engine if it was the engine worker
    if (name === 'engine' && self.workers.engine) {
      self.workers.engine.postMessage({ type: 'boot' });
    }
    // Re-join mesh if mesh was restarted
    if (name === 'mesh' && self.workers.mesh) {
      self.workers.mesh.postMessage({ type: 'join', nodeId: 'tab-' + Date.now().toString(36), capabilities: Object.keys(WORKER_PATHS) });
    }

    if (self.config.onWorkerRestart) {
      self.config.onWorkerRestart(name, ws.restarts);
    }
  }, delay);
};

/* ────────────────────────────────────────────────────────
   Division Status — aggregate health per division
   ──────────────────────────────────────────────────────── */

OrganismBridge.prototype.getDivisionStatuses = function () {
  var result = [];
  for (var divId in DIVISIONS) {
    var div = DIVISIONS[divId];
    var alive = 0;
    var total = div.workers.length;
    var totalBeats = 0;
    var totalRestarts = 0;
    var avgHealth = 0;
    var avgAwareness = 0;
    var avgEmergence = 0;
    var neuroWorkers = 0;

    for (var i = 0; i < div.workers.length; i++) {
      var ws = this.workerStatus[div.workers[i]];
      if (ws) {
        if (ws.status === 'alive') alive++;
        totalBeats += ws.heartbeats;
        totalRestarts += ws.restarts;

        if (ws.neuro) {
          neuroWorkers++;
          if (ws.neuro.heart) avgHealth += ws.neuro.heart.health;
          if (ws.neuro.brain) avgAwareness += ws.neuro.brain.awareness;
          if (ws.neuro.emergence) avgEmergence += ws.neuro.emergence.emergence;
        }
      }
    }

    if (neuroWorkers > 0) {
      avgHealth = Math.round(avgHealth / neuroWorkers);
      avgAwareness = Math.round(avgAwareness / neuroWorkers);
      avgEmergence = Math.round(avgEmergence / neuroWorkers * 1000) / 1000;
    }

    var health = total > 0 ? Math.round((alive / total) * 100) : 0;
    result.push({
      id: divId,
      name: div.name,
      icon: div.icon,
      purpose: div.purpose,
      workers: div.workers,
      alive: alive,
      total: total,
      health: health,
      totalBeats: totalBeats,
      totalRestarts: totalRestarts,
      autonomous: true,
      neuro: {
        avgHealth: avgHealth,
        avgAwareness: avgAwareness,
        avgEmergence: avgEmergence
      }
    });
  }
  return result;
};

/* ────────────────────────────────────────────────────────
   Status & Shutdown
   ──────────────────────────────────────────────────────── */

OrganismBridge.prototype.getWorkerStatuses = function () {
  var statuses = [];
  for (var name in this.workerStatus) {
    var ws = this.workerStatus[name];
    statuses.push({
      name: name,
      status: ws.status,
      heartbeats: ws.heartbeats,
      lastBeat: ws.lastBeat,
      restarts: ws.restarts,
      neuro: ws.neuro || null
    });
  }
  return statuses;
};

OrganismBridge.prototype.shutdown = function () {
  if (this._healthInterval) {
    clearInterval(this._healthInterval);
    this._healthInterval = null;
  }
  for (var name in this.workers) {
    if (this.workers[name]) {
      this.workers[name].postMessage({ type: 'stop' });
      try { this.workers[name].terminate(); } catch (e) { /* ignore */ }
    }
  }
  this.workers = {};
  this.status = 'stopped';
};

/* ────────────────────────────────────────────────────────
   Neuroemergence Summary — aggregate neuro state
   ──────────────────────────────────────────────────────── */

OrganismBridge.prototype.getNeuroSummary = function () {
  var workerCount = 0;
  var totalHealth = 0;
  var totalAwareness = 0;
  var totalEmergence = 0;
  var totalResonance = 0;
  var cascadeWorkers = [];

  for (var name in this.workerStatus) {
    var ws = this.workerStatus[name];
    if (ws.neuro) {
      workerCount++;
      if (ws.neuro.heart) totalHealth += ws.neuro.heart.health;
      if (ws.neuro.brain) totalAwareness += ws.neuro.brain.awareness;
      if (ws.neuro.emergence) {
        totalEmergence += ws.neuro.emergence.emergence;
        totalResonance += ws.neuro.emergence.resonance;
        if (ws.neuro.emergence.cascadeActive) cascadeWorkers.push(name);
      }
    }
  }

  return {
    workers: workerCount,
    avgHealth: workerCount > 0 ? Math.round(totalHealth / workerCount) : 0,
    avgAwareness: workerCount > 0 ? Math.round(totalAwareness / workerCount) : 0,
    avgEmergence: workerCount > 0 ? Math.round(totalEmergence / workerCount * 1000) / 1000 : 0,
    avgResonance: workerCount > 0 ? Math.round(totalResonance / workerCount * 1000) / 1000 : 0,
    cascadeActive: cascadeWorkers.length > 0,
    cascadeWorkers: cascadeWorkers,
    totalRestarts: this._totalRestarts,
    uptime: Date.now() - this._autonomyBoot,
    divisions: this.getDivisionStatuses()
  };
};

if (typeof window !== 'undefined') {
  window.OrganismBridge = OrganismBridge;
  window.ORGANISM_DIVISIONS = DIVISIONS;
}
