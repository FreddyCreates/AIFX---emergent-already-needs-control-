/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  PROTO-244: Alpha Tools Protocol                                         ║
 * ║  Production tool orchestration, plugin lifecycle, adapter routing         ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * The Alpha Tools Protocol governs how tools, plugins, and adapters
 * communicate within the organism. It defines:
 *   - Tool invocation semantics and priority routing
 *   - Plugin lifecycle (register, invoke, retire)
 *   - Adapter bridging and protocol translation
 *   - Phi-weighted load balancing across tool categories
 *
 * @module protocols/alpha-tools-protocol
 * @version 1.0.0
 */

const PHI = 1.618033988749895;
const HEARTBEAT = 873;
const GOLDEN_ANGLE = 137.508;
const EMERGENCE_THRESHOLD = PHI - 1;

// ─── Protocol States ─────────────────────────────────────────────────────────
export const ALPHA_TOOLS_STATES = {
  IDLE: 'idle',
  INVOKING: 'invoking',
  ROUTING: 'routing',
  ADAPTING: 'adapting',
  PLUGIN_EXEC: 'plugin-executing',
  COMPLETE: 'complete',
  ERROR: 'error'
};

// ─── Message Types ───────────────────────────────────────────────────────────
export const MESSAGE_TYPES = {
  TOOL_INVOKE: 'alpha.tool.invoke',
  TOOL_RESULT: 'alpha.tool.result',
  PLUGIN_REGISTER: 'alpha.plugin.register',
  PLUGIN_INVOKE: 'alpha.plugin.invoke',
  PLUGIN_RETIRE: 'alpha.plugin.retire',
  ADAPTER_BRIDGE: 'alpha.adapter.bridge',
  ADAPTER_TRANSLATE: 'alpha.adapter.translate',
  STATUS_REQUEST: 'alpha.status.request',
  STATUS_RESPONSE: 'alpha.status.response',
  HEARTBEAT: 'alpha.heartbeat'
};

// ─── Tool Categories ─────────────────────────────────────────────────────────
export const TOOL_CATEGORIES = {
  TRANSFORM: { id: 'transform', priority: 1, phiWeight: PHI },
  ANALYZE: { id: 'analyze', priority: 2, phiWeight: PHI * EMERGENCE_THRESHOLD },
  GENERATE: { id: 'generate', priority: 3, phiWeight: PHI * PHI },
  CONNECT: { id: 'connect', priority: 4, phiWeight: EMERGENCE_THRESHOLD },
  AUTOMATE: { id: 'automate', priority: 5, phiWeight: PHI * GOLDEN_ANGLE / 100 }
};

// ─── Protocol Configuration ──────────────────────────────────────────────────
export const ALPHA_TOOLS_CONFIG = {
  maxConcurrentTools: 8,
  maxPlugins: 50,
  maxAdapters: 25,
  heartbeatInterval: HEARTBEAT,
  timeoutMs: 30000,
  retryAttempts: 3,
  phiLoadBalance: true,
  categories: Object.keys(TOOL_CATEGORIES).length
};

/**
 * Calculate tool invocation priority using phi-weighting.
 * @param {string} category - Tool category
 * @param {number} urgency - Urgency factor (0-1)
 * @param {number} complexity - Complexity factor (0-1)
 * @returns {number} Priority score
 */
export function calculateToolPriority(category, urgency = 0.5, complexity = 0.5) {
  const cat = TOOL_CATEGORIES[category.toUpperCase()];
  if (!cat) return urgency * complexity;
  return (cat.phiWeight * urgency + complexity * EMERGENCE_THRESHOLD) / cat.priority;
}

/**
 * Calculate adapter routing score for protocol translation.
 * @param {string} sourceProtocol - Source protocol type
 * @param {string} targetProtocol - Target protocol type
 * @param {number} payloadSize - Size of payload in bytes
 * @returns {object} Routing decision
 */
export function calculateAdapterRoute(sourceProtocol, targetProtocol, payloadSize = 0) {
  const sameProtocol = sourceProtocol === targetProtocol;
  const efficiency = sameProtocol ? 1.0 : EMERGENCE_THRESHOLD;
  const latencyEstimate = payloadSize / (HEARTBEAT * PHI);
  
  return {
    source: sourceProtocol,
    target: targetProtocol,
    efficiency,
    latencyEstimate,
    directRoute: sameProtocol,
    phiScore: efficiency * PHI - latencyEstimate * EMERGENCE_THRESHOLD
  };
}

/**
 * Calculate plugin lifecycle score for registration/retirement decisions.
 * @param {number} uses - Number of times plugin has been invoked
 * @param {number} errors - Number of errors encountered
 * @param {number} ageMs - Age of plugin registration in milliseconds
 * @returns {object} Lifecycle decision
 */
export function calculatePluginHealth(uses, errors, ageMs) {
  const errorRate = uses > 0 ? errors / uses : 0;
  const maturity = Math.min(1, ageMs / (HEARTBEAT * 1000));
  const health = (1 - errorRate) * maturity * PHI;
  
  return {
    health,
    errorRate,
    maturity,
    shouldRetire: health < EMERGENCE_THRESHOLD * 0.5,
    recommendation: health > PHI ? 'promote' : health > EMERGENCE_THRESHOLD ? 'maintain' : 'review'
  };
}

/**
 * Calculate load distribution across tool categories.
 * @param {object} toolUsage - Map of category → use count
 * @returns {object} Load balancing recommendation
 */
export function calculateLoadBalance(toolUsage) {
  const entries = Object.entries(toolUsage);
  const total = entries.reduce((sum, [, count]) => sum + count, 0) || 1;
  const distribution = {};
  let maxLoad = 0;
  let minLoad = Infinity;

  for (const [category, count] of entries) {
    const load = count / total;
    distribution[category] = { load, phiAdjusted: load * PHI, count };
    if (load > maxLoad) maxLoad = load;
    if (load < minLoad) minLoad = load;
  }

  return {
    distribution,
    imbalance: maxLoad - minLoad,
    balanced: (maxLoad - minLoad) < EMERGENCE_THRESHOLD,
    recommendation: (maxLoad - minLoad) > EMERGENCE_THRESHOLD ? 'redistribute' : 'optimal'
  };
}

// ─── Main Protocol Class ─────────────────────────────────────────────────────
export class AlphaToolsProtocol {
  constructor(config = {}) {
    this.config = { ...ALPHA_TOOLS_CONFIG, ...config };
    this.state = ALPHA_TOOLS_STATES.IDLE;
    this.tools = new Map();
    this.plugins = new Map();
    this.adapters = new Map();
    this.messageQueue = [];
    this.stats = { invocations: 0, pluginCalls: 0, adapterBridges: 0, errors: 0 };
  }

  registerTool(category, handler) {
    this.tools.set(category, { handler, registered: Date.now(), uses: 0 });
    return this;
  }

  registerPlugin(name, plugin) {
    if (this.plugins.size >= this.config.maxPlugins) return { error: 'max-plugins-reached' };
    this.plugins.set(name, { plugin, registered: Date.now(), uses: 0, errors: 0 });
    return this;
  }

  registerAdapter(name, adapter) {
    if (this.adapters.size >= this.config.maxAdapters) return { error: 'max-adapters-reached' };
    this.adapters.set(name, { adapter, registered: Date.now(), bridges: 0 });
    return this;
  }

  invoke(category, input, options = {}) {
    this.state = ALPHA_TOOLS_STATES.INVOKING;
    const tool = this.tools.get(category);
    if (!tool) { this.state = ALPHA_TOOLS_STATES.ERROR; return { error: 'tool-not-found' }; }

    const priority = calculateToolPriority(category, options.urgency, options.complexity);
    tool.uses++;
    this.stats.invocations++;

    try {
      const result = tool.handler(input);
      this.state = ALPHA_TOOLS_STATES.COMPLETE;
      return { result, priority, category, timestamp: Date.now() };
    } catch (e) {
      this.stats.errors++;
      this.state = ALPHA_TOOLS_STATES.ERROR;
      return { error: e.message, category };
    }
  }

  getStatus() {
    return {
      state: this.state,
      tools: this.tools.size,
      plugins: this.plugins.size,
      adapters: this.adapters.size,
      stats: this.stats,
      config: this.config
    };
  }
}
