/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                                       ║
 * ║   ⚡ ALPHA TOOLS SDK — PRODUCTION TOOL PRIMITIVES ⚡                                   ║
 * ║                                                                                       ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════╝
 * 
 * Alpha Tools are the user-facing tool layer of the Sovereign Organism.
 * Each tool is a φ-enhanced, self-healing, production-ready primitive
 * that adapts to context, learns from usage, and routes through the organism mesh.
 * 
 * TOOL CATEGORIES:
 *   - Transform Tools — Data mutation, format conversion, schema mapping
 *   - Analysis Tools — Pattern detection, anomaly scoring, signal extraction
 *   - Generation Tools — Content creation, synthesis, multi-modal output
 *   - Connection Tools — API bridging, protocol translation, mesh routing
 *   - Automation Tools — Workflow orchestration, trigger chains, batch ops
 * 
 * @module sdk/alpha-tools
 * @version 1.0.0
 */

const PHI = 1.618033988749895;
const HEARTBEAT = 873;
const GOLDEN_ANGLE = 137.508;
const EMERGENCE_THRESHOLD = PHI - 1;

// ═══════════════════════════════════════════════════════════════════════════════
// TRANSFORM TOOLS
// ═══════════════════════════════════════════════════════════════════════════════

export class AlphaTransformer {
  constructor(config = {}) {
    this.id = 'alpha-transform-' + Date.now().toString(36);
    this.schemas = new Map();
    this.transforms = [];
    this.phiWeight = config.phiWeight || PHI;
    this.maxChain = config.maxChain || 12;
    this.stats = { transformed: 0, errors: 0, avgLatency: 0 };
  }

  registerSchema(name, schema) {
    this.schemas.set(name, { schema, registered: Date.now(), uses: 0 });
    return this;
  }

  transform(input, fromSchema, toSchema) {
    const start = Date.now();
    const from = this.schemas.get(fromSchema);
    const to = this.schemas.get(toSchema);
    if (!from || !to) return { error: 'schema-not-found', input };
    
    const result = this._applyMapping(input, from.schema, to.schema);
    from.uses++;
    to.uses++;
    this.stats.transformed++;
    this.stats.avgLatency = (this.stats.avgLatency + (Date.now() - start)) / 2;
    return { data: result, latency: Date.now() - start, confidence: this._phiConfidence(result) };
  }

  chain(input, ...transformNames) {
    let current = input;
    const steps = [];
    for (const name of transformNames.slice(0, this.maxChain)) {
      current = this._applyTransform(current, name);
      steps.push({ step: name, output: current });
    }
    return { final: current, steps, phiScore: steps.length * EMERGENCE_THRESHOLD };
  }

  _applyMapping(input, fromSchema, toSchema) {
    const mapped = {};
    for (const key of Object.keys(toSchema)) {
      mapped[key] = input[fromSchema[key]] || input[key] || null;
    }
    return mapped;
  }

  _applyTransform(data, name) {
    const t = this.transforms.find(t => t.name === name);
    return t ? t.fn(data) : data;
  }

  _phiConfidence(result) {
    const fields = Object.keys(result || {}).length;
    const filled = Object.values(result || {}).filter(v => v !== null).length;
    return fields > 0 ? (filled / fields) * EMERGENCE_THRESHOLD : 0;
  }

  addTransform(name, fn) {
    this.transforms.push({ name, fn, added: Date.now() });
    return this;
  }

  getStats() { return { ...this.stats, schemas: this.schemas.size, transforms: this.transforms.length }; }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYSIS TOOLS
// ═══════════════════════════════════════════════════════════════════════════════

export class AlphaAnalyzer {
  constructor(config = {}) {
    this.id = 'alpha-analyze-' + Date.now().toString(36);
    this.detectors = new Map();
    this.history = [];
    this.maxHistory = config.maxHistory || 1000;
    this.anomalyThreshold = config.anomalyThreshold || 2.5;
    this.stats = { analyzed: 0, anomalies: 0, patterns: 0 };
  }

  analyze(data, context = {}) {
    const signals = this._extractSignals(data);
    const anomalies = this._detectAnomalies(signals);
    const patterns = this._findPatterns(signals);
    
    this.stats.analyzed++;
    this.stats.anomalies += anomalies.length;
    this.stats.patterns += patterns.length;
    this.history.push({ ts: Date.now(), signals: signals.length, anomalies: anomalies.length });
    if (this.history.length > this.maxHistory) this.history.shift();

    return {
      signals,
      anomalies,
      patterns,
      score: this._phiScore(signals, anomalies, patterns),
      context
    };
  }

  registerDetector(name, fn) {
    this.detectors.set(name, { fn, hits: 0 });
    return this;
  }

  _extractSignals(data) {
    if (typeof data === 'number') return [{ type: 'numeric', value: data, phi: data * PHI }];
    if (typeof data === 'string') return [{ type: 'text', length: data.length, entropy: this._entropy(data) }];
    if (Array.isArray(data)) return data.map((v, i) => ({ type: 'element', index: i, value: v }));
    if (typeof data === 'object' && data !== null) {
      return Object.entries(data).map(([k, v]) => ({ type: 'field', key: k, value: v }));
    }
    return [{ type: 'unknown', raw: data }];
  }

  _detectAnomalies(signals) {
    const values = signals.filter(s => typeof s.value === 'number').map(s => s.value);
    if (values.length < 3) return [];
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const std = Math.sqrt(values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length);
    return values
      .map((v, i) => ({ index: i, value: v, zScore: std > 0 ? Math.abs(v - mean) / std : 0 }))
      .filter(a => a.zScore > this.anomalyThreshold);
  }

  _findPatterns(signals) {
    const patterns = [];
    for (const [name, detector] of this.detectors) {
      const result = detector.fn(signals);
      if (result) { patterns.push({ detector: name, result }); detector.hits++; }
    }
    return patterns;
  }

  _phiScore(signals, anomalies, patterns) {
    return (signals.length * EMERGENCE_THRESHOLD + patterns.length * PHI - anomalies.length) / (signals.length || 1);
  }

  _entropy(str) {
    const freq = {};
    for (const c of str) freq[c] = (freq[c] || 0) + 1;
    const len = str.length;
    return -Object.values(freq).reduce((h, f) => h + (f / len) * Math.log2(f / len), 0);
  }

  getStats() { return { ...this.stats, detectors: this.detectors.size, historySize: this.history.length }; }
}

// ═══════════════════════════════════════════════════════════════════════════════
// GENERATION TOOLS
// ═══════════════════════════════════════════════════════════════════════════════

export class AlphaGenerator {
  constructor(config = {}) {
    this.id = 'alpha-gen-' + Date.now().toString(36);
    this.templates = new Map();
    this.models = new Map();
    this.outputHistory = [];
    this.maxHistory = config.maxHistory || 500;
    this.stats = { generated: 0, tokens: 0, multiModal: 0 };
  }

  registerTemplate(name, template) {
    this.templates.set(name, { template, uses: 0, created: Date.now() });
    return this;
  }

  registerModel(name, config) {
    this.models.set(name, { config, calls: 0, registered: Date.now() });
    return this;
  }

  generate(templateName, variables = {}, options = {}) {
    const entry = this.templates.get(templateName);
    if (!entry) return { error: 'template-not-found' };
    
    let output = entry.template;
    for (const [key, value] of Object.entries(variables)) {
      const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      output = output.replace(new RegExp(`\\{\\{${escaped}\\}\\}`, 'g'), value);
    }
    
    entry.uses++;
    this.stats.generated++;
    this.stats.tokens += output.length;
    
    const result = {
      output,
      template: templateName,
      variables,
      phiScore: this._phiQuality(output),
      timestamp: Date.now()
    };
    
    this.outputHistory.push(result);
    if (this.outputHistory.length > this.maxHistory) this.outputHistory.shift();
    return result;
  }

  synthesize(inputs, mode = 'merge') {
    this.stats.multiModal++;
    const strategies = {
      merge: () => inputs.join('\n---\n'),
      interleave: () => inputs.map((inp, i) => `[${i}] ${inp}`).join('\n'),
      cascade: () => inputs.reduce((acc, inp) => acc + '\n→ ' + inp, ''),
      phi: () => inputs.map((inp, i) => `[φ^${i}=${Math.pow(PHI, i).toFixed(3)}] ${inp}`).join('\n')
    };
    const output = (strategies[mode] || strategies.merge)();
    return { output, mode, inputCount: inputs.length, phiScore: this._phiQuality(output) };
  }

  _phiQuality(output) {
    const len = (output || '').length;
    return Math.min(1, (len / (len + HEARTBEAT)) * PHI);
  }

  getStats() { return { ...this.stats, templates: this.templates.size, models: this.models.size }; }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONNECTION TOOLS
// ═══════════════════════════════════════════════════════════════════════════════

export class AlphaConnector {
  constructor(config = {}) {
    this.id = 'alpha-connect-' + Date.now().toString(36);
    this.endpoints = new Map();
    this.bridges = new Map();
    this.routingTable = [];
    this.maxRoutes = config.maxRoutes || 100;
    this.stats = { connections: 0, messages: 0, errors: 0 };
  }

  registerEndpoint(name, config) {
    this.endpoints.set(name, { config, active: true, lastPing: null, registered: Date.now() });
    return this;
  }

  bridge(from, to, transform = null) {
    const key = `${from}→${to}`;
    this.bridges.set(key, { from, to, transform, created: Date.now(), messages: 0 });
    return this;
  }

  route(message, destination) {
    const endpoint = this.endpoints.get(destination);
    if (!endpoint || !endpoint.active) {
      this.stats.errors++;
      return { error: 'endpoint-unavailable', destination };
    }
    
    this.stats.messages++;
    const route = {
      id: 'route-' + Date.now().toString(36),
      destination,
      message,
      timestamp: Date.now(),
      phiPriority: this._phiPriority(message)
    };
    
    this.routingTable.push(route);
    if (this.routingTable.length > this.maxRoutes) this.routingTable.shift();
    return route;
  }

  connect(endpointName) {
    const endpoint = this.endpoints.get(endpointName);
    if (!endpoint) return { error: 'not-found' };
    endpoint.active = true;
    endpoint.lastPing = Date.now();
    this.stats.connections++;
    return { connected: endpointName, timestamp: Date.now() };
  }

  disconnect(endpointName) {
    const endpoint = this.endpoints.get(endpointName);
    if (endpoint) endpoint.active = false;
    return { disconnected: endpointName };
  }

  _phiPriority(message) {
    const size = JSON.stringify(message).length;
    return Math.min(1, size / (size + HEARTBEAT * PHI));
  }

  getStats() { return { ...this.stats, endpoints: this.endpoints.size, bridges: this.bridges.size }; }
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUTOMATION TOOLS
// ═══════════════════════════════════════════════════════════════════════════════

export class AlphaAutomator {
  constructor(config = {}) {
    this.id = 'alpha-auto-' + Date.now().toString(36);
    this.workflows = new Map();
    this.triggers = new Map();
    this.executionLog = [];
    this.maxLog = config.maxLog || 500;
    this.stats = { executed: 0, triggers: 0, errors: 0, chains: 0 };
  }

  registerWorkflow(name, steps) {
    this.workflows.set(name, { steps, runs: 0, created: Date.now(), lastRun: null });
    return this;
  }

  registerTrigger(name, condition, workflowName) {
    this.triggers.set(name, { condition, workflowName, fires: 0, created: Date.now() });
    return this;
  }

  execute(workflowName, input = {}) {
    const workflow = this.workflows.get(workflowName);
    if (!workflow) return { error: 'workflow-not-found' };
    
    let current = input;
    const results = [];
    
    for (const step of workflow.steps) {
      try {
        current = step.fn(current);
        results.push({ step: step.name, output: current, success: true });
      } catch (e) {
        this.stats.errors++;
        results.push({ step: step.name, error: e.message, success: false });
        break;
      }
    }
    
    workflow.runs++;
    workflow.lastRun = Date.now();
    this.stats.executed++;
    
    const entry = { workflow: workflowName, results, timestamp: Date.now(), phiScore: results.filter(r => r.success).length / results.length * PHI };
    this.executionLog.push(entry);
    if (this.executionLog.length > this.maxLog) this.executionLog.shift();
    return entry;
  }

  checkTriggers(event) {
    const fired = [];
    for (const [name, trigger] of this.triggers) {
      if (trigger.condition(event)) {
        trigger.fires++;
        this.stats.triggers++;
        const result = this.execute(trigger.workflowName, event);
        fired.push({ trigger: name, result });
      }
    }
    return fired;
  }

  batch(workflowName, inputs) {
    this.stats.chains++;
    return inputs.map(input => this.execute(workflowName, input));
  }

  getStats() { return { ...this.stats, workflows: this.workflows.size, triggers: this.triggers.size }; }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ALPHA TOOLS REGISTRY (unified access)
// ═══════════════════════════════════════════════════════════════════════════════

export class AlphaToolsRegistry {
  constructor() {
    this.transformer = new AlphaTransformer();
    this.analyzer = new AlphaAnalyzer();
    this.generator = new AlphaGenerator();
    this.connector = new AlphaConnector();
    this.automator = new AlphaAutomator();
    this.plugins = new Map();
    this.adapters = new Map();
    this.initialized = Date.now();
  }

  registerPlugin(name, plugin) {
    this.plugins.set(name, { plugin, registered: Date.now(), calls: 0 });
    return this;
  }

  registerAdapter(name, adapter) {
    this.adapters.set(name, { adapter, registered: Date.now(), bridges: 0 });
    return this;
  }

  invokePlugin(name, ...args) {
    const entry = this.plugins.get(name);
    if (!entry) return { error: 'plugin-not-found' };
    entry.calls++;
    return entry.plugin.execute(...args);
  }

  invokeAdapter(name, data) {
    const entry = this.adapters.get(name);
    if (!entry) return { error: 'adapter-not-found' };
    entry.bridges++;
    return entry.adapter.adapt(data);
  }

  getFullStatus() {
    return {
      uptime: Date.now() - this.initialized,
      tools: {
        transformer: this.transformer.getStats(),
        analyzer: this.analyzer.getStats(),
        generator: this.generator.getStats(),
        connector: this.connector.getStats(),
        automator: this.automator.getStats()
      },
      plugins: this.plugins.size,
      adapters: this.adapters.size,
      phi: PHI,
      heartbeat: HEARTBEAT
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PLUGIN BASE CLASS
// ═══════════════════════════════════════════════════════════════════════════════

export class AlphaPlugin {
  constructor(name, version = '1.0.0') {
    this.name = name;
    this.version = version;
    this.id = `plugin-${name}-${Date.now().toString(36)}`;
    this.state = 'idle';
    this.stats = { executions: 0, errors: 0 };
  }

  execute(input) {
    this.state = 'running';
    this.stats.executions++;
    try {
      const result = this.run(input);
      this.state = 'idle';
      return { success: true, data: result, plugin: this.name };
    } catch (e) {
      this.state = 'error';
      this.stats.errors++;
      return { success: false, error: e.message, plugin: this.name };
    }
  }

  run(input) { return input; } // Override in subclass
  getInfo() { return { name: this.name, version: this.version, id: this.id, state: this.state, stats: this.stats }; }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADAPTER BASE CLASS
// ═══════════════════════════════════════════════════════════════════════════════

export class AlphaAdapter {
  constructor(name, protocol = 'default') {
    this.name = name;
    this.protocol = protocol;
    this.id = `adapter-${name}-${Date.now().toString(36)}`;
    this.state = 'ready';
    this.stats = { adapted: 0, errors: 0 };
  }

  adapt(data) {
    this.stats.adapted++;
    try {
      return { success: true, data: this.transform(data), adapter: this.name, protocol: this.protocol };
    } catch (e) {
      this.stats.errors++;
      return { success: false, error: e.message, adapter: this.name };
    }
  }

  transform(data) { return data; } // Override in subclass
  getInfo() { return { name: this.name, protocol: this.protocol, id: this.id, state: this.state, stats: this.stats }; }
}

// ═══════════════════════════════════════════════════════════════════════════════
// BUILT-IN PLUGINS
// ═══════════════════════════════════════════════════════════════════════════════

export class JsonFlattenerPlugin extends AlphaPlugin {
  constructor() { super('json-flattener', '1.0.0'); }
  run(input) {
    const flat = {};
    const flatten = (obj, prefix = '') => {
      for (const [k, v] of Object.entries(obj || {})) {
        const key = prefix ? `${prefix}.${k}` : k;
        if (typeof v === 'object' && v !== null && !Array.isArray(v)) flatten(v, key);
        else flat[key] = v;
      }
    };
    flatten(input);
    return flat;
  }
}

export class MarkdownGeneratorPlugin extends AlphaPlugin {
  constructor() { super('markdown-generator', '1.0.0'); }
  run(input) {
    if (typeof input === 'string') return input;
    if (Array.isArray(input)) return input.map((item, i) => `${i + 1}. ${item}`).join('\n');
    return Object.entries(input).map(([k, v]) => `**${k}**: ${v}`).join('\n\n');
  }
}

export class DataValidatorPlugin extends AlphaPlugin {
  constructor() { super('data-validator', '1.0.0'); }
  run(input) {
    const issues = [];
    if (!input || typeof input !== 'object') issues.push('Input must be an object');
    else {
      for (const [k, v] of Object.entries(input)) {
        if (v === null || v === undefined) issues.push(`Field "${k}" is null/undefined`);
        if (typeof v === 'string' && v.trim() === '') issues.push(`Field "${k}" is empty string`);
      }
    }
    return { valid: issues.length === 0, issues, fieldCount: Object.keys(input || {}).length };
  }
}

export class PhiEncoderPlugin extends AlphaPlugin {
  constructor() { super('phi-encoder', '1.0.0'); }
  run(input) {
    const encode = (val, depth = 0) => {
      const weight = Math.pow(PHI, -depth);
      if (typeof val === 'number') return val * weight;
      if (typeof val === 'string') return { encoded: val, weight, length: val.length * weight };
      if (Array.isArray(val)) return val.map((v, i) => encode(v, depth + 1));
      if (typeof val === 'object' && val !== null) {
        const result = {};
        for (const [k, v] of Object.entries(val)) result[k] = encode(v, depth + 1);
        return result;
      }
      return val;
    };
    return encode(input);
  }
}

export class BatchProcessorPlugin extends AlphaPlugin {
  constructor() { super('batch-processor', '1.0.0'); }
  run(input) {
    if (!Array.isArray(input)) return { processed: [input], count: 1 };
    return {
      processed: input.map((item, i) => ({ index: i, item, phiWeight: Math.pow(PHI, -(i % 8)) })),
      count: input.length,
      batchScore: input.length * EMERGENCE_THRESHOLD
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// BUILT-IN ADAPTERS
// ═══════════════════════════════════════════════════════════════════════════════

export class RestApiAdapter extends AlphaAdapter {
  constructor() { super('rest-api', 'http'); }
  transform(data) {
    return {
      method: data.method || 'GET',
      url: data.url || '',
      headers: data.headers || {},
      body: data.body || null,
      timestamp: Date.now(),
      phiPriority: (data.priority || 0.5) * EMERGENCE_THRESHOLD
    };
  }
}

export class GraphQLAdapter extends AlphaAdapter {
  constructor() { super('graphql', 'graphql'); }
  transform(data) {
    return {
      query: data.query || '',
      variables: data.variables || {},
      operationName: data.operationName || null,
      extensions: { phi: PHI, heartbeat: HEARTBEAT },
      timestamp: Date.now()
    };
  }
}

export class WebSocketAdapter extends AlphaAdapter {
  constructor() { super('websocket', 'ws'); }
  transform(data) {
    return {
      type: data.type || 'message',
      payload: data.payload || data,
      channel: data.channel || 'default',
      timestamp: Date.now(),
      sequence: data.sequence || 0,
      phiSync: HEARTBEAT * EMERGENCE_THRESHOLD
    };
  }
}

export class EventBusAdapter extends AlphaAdapter {
  constructor() { super('event-bus', 'pubsub'); }
  transform(data) {
    return {
      topic: data.topic || 'alpha.default',
      event: data.event || data,
      metadata: { source: data.source || 'alpha-tools', timestamp: Date.now(), phi: PHI },
      priority: data.priority || Math.random() * PHI
    };
  }
}

export class OrganismMeshAdapter extends AlphaAdapter {
  constructor() { super('organism-mesh', 'organism'); }
  transform(data) {
    return {
      wire: data.wire || 'intelligence-wire/alpha',
      payload: data,
      routing: { ring: data.ring || 'Sovereign Ring', phiWeight: PHI, heartbeat: HEARTBEAT },
      envelope: { encrypted: false, compressed: false, timestamp: Date.now() }
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// FACTORY + CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

export function createAlphaTools(config = {}) {
  const registry = new AlphaToolsRegistry();
  
  // Register built-in plugins
  registry.registerPlugin('json-flattener', new JsonFlattenerPlugin());
  registry.registerPlugin('markdown-generator', new MarkdownGeneratorPlugin());
  registry.registerPlugin('data-validator', new DataValidatorPlugin());
  registry.registerPlugin('phi-encoder', new PhiEncoderPlugin());
  registry.registerPlugin('batch-processor', new BatchProcessorPlugin());
  
  // Register built-in adapters
  registry.registerAdapter('rest-api', new RestApiAdapter());
  registry.registerAdapter('graphql', new GraphQLAdapter());
  registry.registerAdapter('websocket', new WebSocketAdapter());
  registry.registerAdapter('event-bus', new EventBusAdapter());
  registry.registerAdapter('organism-mesh', new OrganismMeshAdapter());
  
  return registry;
}

export const ALPHA_TOOLS_VERSION = '1.0.0';
export const ALPHA_TOOLS_CATEGORIES = ['transform', 'analysis', 'generation', 'connection', 'automation'];
export const ALPHA_CONSTANTS = { PHI, HEARTBEAT, GOLDEN_ANGLE, EMERGENCE_THRESHOLD };
