import crypto from 'node:crypto';
import { PHI, HEARTBEAT, VALID_EXPOSURES } from './tool-schema.js';

/**
 * MarketplaceRouter — Orchestration-aware routing layer that sits on top of
 * the organism's existing orchestration surfaces.
 *
 * The marketplace sits ON TOP of orchestration, not bypassing it.
 * It wires into the existing orchestration surfaces:
 * - Communication Orchestrator
 * - Frontend Command Orchestrator
 * - Security Orchestrator
 * - Memory Orchestrator
 * - Versioning Orchestrator
 * - Complete Orchestration Platform
 *
 * This router maps incoming intents to the right callable tools,
 * respecting exposure tiers, trust levels, and orchestration policies.
 */
export class MarketplaceRouter {
  /** @type {import('./tool-registry.js').ToolRegistry} */
  #registry;

  /** @type {import('./tool-invoker.js').ToolInvoker} */
  #invoker;

  /** @type {Map<string, string[]>} */
  #intentMappings;

  /** @type {Map<string, string>} */
  #orchestratorBindings;

  /** @type {{ totalRouted: number, totalFallbacks: number, avgMatchScore: number }} */
  #metrics;

  /**
   * @param {import('./tool-registry.js').ToolRegistry} registry
   * @param {import('./tool-invoker.js').ToolInvoker} invoker
   */
  constructor(registry, invoker) {
    if (!registry) throw new Error('MarketplaceRouter requires a ToolRegistry');
    if (!invoker) throw new Error('MarketplaceRouter requires a ToolInvoker');

    this.#registry = registry;
    this.#invoker = invoker;
    this.#intentMappings = new Map();
    this.#orchestratorBindings = new Map();
    this.#metrics = { totalRouted: 0, totalFallbacks: 0, avgMatchScore: 0 };
  }

  /**
   * Maps a natural language intent to one or more tool call IDs.
   * @param {string} intent - Intent keyword or phrase (e.g. "check pulse", "route model")
   * @param {string[]} callIds - Tool call IDs to route to
   */
  mapIntent(intent, callIds) {
    this.#intentMappings.set(intent.toLowerCase(), callIds);
  }

  /**
   * Binds a tool to an orchestrator surface for policy routing.
   * @param {string} callId - Tool call ID
   * @param {string} orchestrator - Orchestrator name
   */
  bindOrchestrator(callId, orchestrator) {
    this.#orchestratorBindings.set(callId, orchestrator);
  }

  /**
   * Routes an intent to the best matching tool and invokes it.
   * Tries intent mapping first, then falls back to registry search.
   *
   * @param {string} intent - What the caller wants to do
   * @param {Record<string, *>} input - Input parameters
   * @param {{ principalId: string, traceId?: string }} context
   * @returns {Promise<import('./tool-invoker.js').InvocationResult>}
   */
  async routeAndInvoke(intent, input, context) {
    this.#metrics.totalRouted++;

    // 1. Try direct intent mapping
    const mappedIds = this.#intentMappings.get(intent.toLowerCase());
    if (mappedIds && mappedIds.length > 0) {
      return this.#invoker.invoke(mappedIds[0], input, context);
    }

    // 2. Fall back to keyword search
    const searchResults = this.#registry.search(intent);
    if (searchResults.length > 0) {
      this.#metrics.totalFallbacks++;
      const best = searchResults[0];
      this.#metrics.avgMatchScore = Math.round(
        (this.#metrics.avgMatchScore * (this.#metrics.totalRouted - 1) + best.relevance) / this.#metrics.totalRouted * 100
      ) / 100;
      return this.#invoker.invoke(best.tool.callId, input, context);
    }

    // 3. No match found
    return {
      invocationId: crypto.randomUUID(),
      callId: 'none',
      toolName: 'none',
      status: /** @type {import('./tool-invoker.js').InvocationStatus} */ ('failed'),
      data: null,
      error: `No tool found for intent: "${intent}"`,
      latencyMs: 0,
      timestamp: Date.now(),
    };
  }

  /**
   * Routes an intent to multiple tools and invokes them in parallel (fan-out).
   * @param {string} intent
   * @param {Record<string, *>} input
   * @param {{ principalId: string, traceId?: string }} context
   * @param {number} [maxTools=3]
   * @returns {Promise<Array<import('./tool-invoker.js').InvocationResult>>}
   */
  async routeMulti(intent, input, context, maxTools = 3) {
    const searchResults = this.#registry.search(intent);
    const targets = searchResults.slice(0, maxTools);

    if (targets.length === 0) {
      return [{
        invocationId: crypto.randomUUID(),
        callId: 'none',
        toolName: 'none',
        status: /** @type {import('./tool-invoker.js').InvocationStatus} */ ('failed'),
        data: null,
        error: `No tools found for intent: "${intent}"`,
        latencyMs: 0,
        timestamp: Date.now(),
      }];
    }

    return Promise.all(
      targets.map((t) => this.#invoker.invoke(t.tool.callId, input, context))
    );
  }

  /**
   * Returns the orchestrator bound to a specific tool.
   * @param {string} callId
   * @returns {string|undefined}
   */
  getOrchestrator(callId) {
    return this.#orchestratorBindings.get(callId);
  }

  /**
   * Returns routing metrics.
   * @returns {Object}
   */
  getMetrics() {
    return { ...this.#metrics };
  }
}

export default MarketplaceRouter;
