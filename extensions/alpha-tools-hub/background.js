/* Alpha Tools Hub — Engine Service (EXT-041) */

const PHI = 1.618033988749895;
const GOLDEN_ANGLE = 137.508;
const HEARTBEAT = 873;
const EMERGENCE_THRESHOLD = PHI - 1;

class AlphaToolsEngine {
  constructor() {
    this.tools = {
      transform: { active: true, uses: 0, lastUse: null },
      analyze: { active: true, uses: 0, lastUse: null },
      generate: { active: true, uses: 0, lastUse: null },
      connect: { active: true, uses: 0, lastUse: null },
      automate: { active: true, uses: 0, lastUse: null }
    };
    this.plugins = new Map();
    this.adapters = new Map();
    this.executionLog = [];
    this.maxLog = 500;
    this.state = {
      initialized: true,
      heartbeatCount: 0,
      healthy: true,
      lastHeartbeat: Date.now()
    };
    this._initBuiltins();
    this._startHeartbeat();
  }

  _initBuiltins() {
    // Built-in plugins
    this.plugins.set('json-flattener', { fn: this._flattenJson, uses: 0 });
    this.plugins.set('markdown-generator', { fn: this._toMarkdown, uses: 0 });
    this.plugins.set('data-validator', { fn: this._validate, uses: 0 });
    this.plugins.set('phi-encoder', { fn: this._phiEncode, uses: 0 });
    this.plugins.set('batch-processor', { fn: this._batchProcess, uses: 0 });

    // Built-in adapters
    this.adapters.set('rest-api', { protocol: 'http', uses: 0 });
    this.adapters.set('graphql', { protocol: 'graphql', uses: 0 });
    this.adapters.set('websocket', { protocol: 'ws', uses: 0 });
    this.adapters.set('event-bus', { protocol: 'pubsub', uses: 0 });
    this.adapters.set('organism-mesh', { protocol: 'organism', uses: 0 });
  }

  invokeTool(category, input) {
    const tool = this.tools[category];
    if (!tool || !tool.active) return { error: 'tool-unavailable', category };
    tool.uses++;
    tool.lastUse = Date.now();

    const result = this._executeTool(category, input);
    this.executionLog.unshift({ id: 'exec-' + Date.now().toString(36), category, timestamp: Date.now(), success: !result.error });
    if (this.executionLog.length > this.maxLog) this.executionLog.pop();
    return result;
  }

  _executeTool(category, input) {
    switch (category) {
      case 'transform': return this._transform(input);
      case 'analyze': return this._analyze(input);
      case 'generate': return this._generate(input);
      case 'connect': return this._connect(input);
      case 'automate': return this._automate(input);
      default: return { error: 'unknown-category' };
    }
  }

  _transform(input) {
    if (typeof input === 'string') {
      try { return { data: JSON.parse(input), format: 'json' }; } catch (e) { /* continue */ }
      return { data: input.split(',').map(s => s.trim()), format: 'csv' };
    }
    if (Array.isArray(input)) return { data: Object.fromEntries(input.map((v, i) => [`item_${i}`, v])), format: 'object' };
    return { data: input, format: 'passthrough' };
  }

  _analyze(input) {
    const signals = [];
    if (typeof input === 'object' && input !== null) {
      for (const [k, v] of Object.entries(input)) {
        signals.push({ field: k, type: typeof v, phi: String(v).length * EMERGENCE_THRESHOLD });
      }
    }
    return { signals, score: signals.length * EMERGENCE_THRESHOLD, anomalies: signals.filter(s => s.phi > PHI * 10) };
  }

  _generate(input) {
    const template = input.template || '{{content}}';
    let output = template;
    for (const [k, v] of Object.entries(input.variables || {})) {
      output = output.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), v);
    }
    return { output, phiScore: output.length / (output.length + HEARTBEAT) * PHI };
  }

  _connect(input) {
    return {
      endpoint: input.url || input.endpoint || 'localhost',
      protocol: input.protocol || 'http',
      connected: true,
      phiPriority: (input.priority || 0.5) * EMERGENCE_THRESHOLD,
      timestamp: Date.now()
    };
  }

  _automate(input) {
    const steps = input.steps || [];
    const results = steps.map((step, i) => ({
      step: i + 1,
      name: step.name || `step-${i + 1}`,
      status: 'completed',
      phiWeight: Math.pow(PHI, -(i % 8))
    }));
    return { workflow: input.name || 'default', results, totalSteps: results.length, score: results.length * EMERGENCE_THRESHOLD };
  }

  invokePlugin(name, data) {
    const plugin = this.plugins.get(name);
    if (!plugin) return { error: 'plugin-not-found', name };
    plugin.uses++;
    return { data: plugin.fn(data), plugin: name, timestamp: Date.now() };
  }

  invokeAdapter(name, data) {
    const adapter = this.adapters.get(name);
    if (!adapter) return { error: 'adapter-not-found', name };
    adapter.uses++;
    return { adapted: data, protocol: adapter.protocol, adapter: name, timestamp: Date.now() };
  }

  _flattenJson(obj) {
    const flat = {};
    const recurse = (o, prefix = '') => {
      for (const [k, v] of Object.entries(o || {})) {
        const key = prefix ? `${prefix}.${k}` : k;
        if (typeof v === 'object' && v !== null && !Array.isArray(v)) recurse(v, key);
        else flat[key] = v;
      }
    };
    recurse(obj);
    return flat;
  }

  _toMarkdown(data) {
    if (typeof data === 'string') return data;
    if (Array.isArray(data)) return data.map((d, i) => `${i + 1}. ${d}`).join('\n');
    return Object.entries(data || {}).map(([k, v]) => `**${k}**: ${v}`).join('\n\n');
  }

  _validate(data) {
    const issues = [];
    if (!data || typeof data !== 'object') return { valid: false, issues: ['Input must be object'] };
    for (const [k, v] of Object.entries(data)) {
      if (v === null || v === undefined) issues.push(`${k}: null/undefined`);
      if (typeof v === 'string' && v.trim() === '') issues.push(`${k}: empty`);
    }
    return { valid: issues.length === 0, issues, fields: Object.keys(data).length };
  }

  _phiEncode(data) {
    if (typeof data === 'number') return data * PHI;
    if (typeof data === 'string') return { encoded: data, weight: data.length * EMERGENCE_THRESHOLD };
    return data;
  }

  _batchProcess(data) {
    if (!Array.isArray(data)) return { processed: [data], count: 1 };
    return { processed: data.map((d, i) => ({ index: i, item: d, phi: Math.pow(PHI, -(i % 8)) })), count: data.length };
  }

  getStatus() {
    return {
      tools: this.tools,
      plugins: Array.from(this.plugins.entries()).map(([name, p]) => ({ name, uses: p.uses })),
      adapters: Array.from(this.adapters.entries()).map(([name, a]) => ({ name, protocol: a.protocol, uses: a.uses })),
      executions: this.executionLog.length,
      state: this.state
    };
  }

  _startHeartbeat() {
    setInterval(() => {
      this.state.heartbeatCount++;
      this.state.lastHeartbeat = Date.now();
      this.state.healthy = true;
    }, HEARTBEAT);
  }
}

const engine = new AlphaToolsEngine();

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'ALPHA_INVOKE_TOOL') {
    sendResponse(engine.invokeTool(msg.category, msg.input));
  } else if (msg.type === 'ALPHA_INVOKE_PLUGIN') {
    sendResponse(engine.invokePlugin(msg.name, msg.data));
  } else if (msg.type === 'ALPHA_INVOKE_ADAPTER') {
    sendResponse(engine.invokeAdapter(msg.name, msg.data));
  } else if (msg.type === 'ALPHA_STATUS') {
    sendResponse(engine.getStatus());
  } else if (msg.type === 'ALPHA_HEARTBEAT') {
    sendResponse({ alive: true, heartbeat: engine.state.heartbeatCount, phi: PHI });
  }
  return true;
});

chrome.alarms.create('alpha-tools-heartbeat', { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'alpha-tools-heartbeat') {
    engine.state.heartbeatCount++;
    engine.state.lastHeartbeat = Date.now();
  }
});
