import crypto from 'node:crypto';
import { VALID_EXPOSURES, PHI, HEARTBEAT } from './tool-schema.js';

/**
 * ToolRegistry — The searchable map of all callable tools, SDKs, organisms,
 * and package ecosystems in the organism marketplace.
 *
 * This is the Registry layer of the marketplace triad:
 * 1. Registry — searchable map of callable tools (this)
 * 2. Protocol surface — standard invocation (ToolInvoker)
 * 3. Settlement layer — usage, billing, reward (MarketplaceSettlement)
 *
 * The registry makes tools discoverable. AIs use tools reliably when:
 * - the tool has a clear callable interface
 * - the tool is discoverable in a registry ← this
 * - the AI is routed to it by policy/orchestration
 * - the result comes back in a usable schema
 */
export class ToolRegistry {
  /** @type {Map<string, import('./tool-schema.js').ToolSchema>} */
  #tools;

  /** @type {Map<string, Set<string>>} */
  #indexByHouse;

  /** @type {Map<string, Set<string>>} */
  #indexByExposure;

  /** @type {Map<string, Set<string>>} */
  #indexByBilling;

  /** @type {number} */
  #version;

  constructor() {
    this.#tools = new Map();
    this.#indexByHouse = new Map();
    this.#indexByExposure = new Map();
    this.#indexByBilling = new Map();
    this.#version = 0;
  }

  /**
   * Registers a tool schema in the marketplace registry.
   * @param {import('./tool-schema.js').ToolSchema} schema - Frozen tool schema from ToolSchemaBuilder.create()
   * @returns {{ callId: string, registered: boolean, registryVersion: number }}
   */
  register(schema) {
    if (!schema || !schema.callId) {
      throw new Error('Cannot register tool: missing callId');
    }

    this.#tools.set(schema.callId, schema);
    this.#version++;

    // Index by house placement
    if (!this.#indexByHouse.has(schema.housePlacement)) {
      this.#indexByHouse.set(schema.housePlacement, new Set());
    }
    this.#indexByHouse.get(schema.housePlacement).add(schema.callId);

    // Index by exposure tier
    if (!this.#indexByExposure.has(schema.exposure)) {
      this.#indexByExposure.set(schema.exposure, new Set());
    }
    this.#indexByExposure.get(schema.exposure).add(schema.callId);

    // Index by billing class
    if (!this.#indexByBilling.has(schema.billingClass)) {
      this.#indexByBilling.set(schema.billingClass, new Set());
    }
    this.#indexByBilling.get(schema.billingClass).add(schema.callId);

    return { callId: schema.callId, registered: true, registryVersion: this.#version };
  }

  /**
   * Retrieves a tool schema by its call ID.
   * @param {string} callId
   * @returns {import('./tool-schema.js').ToolSchema|undefined}
   */
  getById(callId) {
    return this.#tools.get(callId);
  }

  /**
   * Retrieves a tool schema by its machine name.
   * @param {string} name
   * @returns {import('./tool-schema.js').ToolSchema|undefined}
   */
  getByName(name) {
    for (const tool of this.#tools.values()) {
      if (tool.name === name) return tool;
    }
    return undefined;
  }

  /**
   * Lists all tools visible at or below the given exposure tier.
   * Tier hierarchy: INTERNAL < INTERNAL_SOVEREIGN < PARTNER < ENTERPRISE < PUBLIC
   * @param {import('./tool-schema.js').ExposureTier} maxTier
   * @returns {import('./tool-schema.js').ToolSchema[]}
   */
  listByExposure(maxTier) {
    const tierIndex = VALID_EXPOSURES.indexOf(maxTier);
    if (tierIndex === -1) {
      throw new Error(`Invalid exposure tier: "${maxTier}"`);
    }

    const results = [];
    for (const tool of this.#tools.values()) {
      const toolTierIndex = VALID_EXPOSURES.indexOf(tool.exposure);
      if (toolTierIndex <= tierIndex) {
        results.push(tool);
      }
    }
    return results;
  }

  /**
   * Lists all tools assigned to a specific organism house/ring.
   * @param {string} house
   * @returns {import('./tool-schema.js').ToolSchema[]}
   */
  listByHouse(house) {
    const ids = this.#indexByHouse.get(house);
    if (!ids) return [];
    return Array.from(ids).map((id) => this.#tools.get(id));
  }

  /**
   * Lists all tools matching a billing class.
   * @param {string} billingClass
   * @returns {import('./tool-schema.js').ToolSchema[]}
   */
  listByBilling(billingClass) {
    const ids = this.#indexByBilling.get(billingClass);
    if (!ids) return [];
    return Array.from(ids).map((id) => this.#tools.get(id));
  }

  /**
   * Searches tools by keyword across name, purpose, and display name.
   * Phi-weighted relevance scoring.
   * @param {string} query
   * @returns {Array<{ tool: import('./tool-schema.js').ToolSchema, relevance: number }>}
   */
  search(query) {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (terms.length === 0) return [];

    const results = [];

    for (const tool of this.#tools.values()) {
      const searchable = [
        tool.name,
        tool.displayName,
        tool.purpose,
        tool.housePlacement,
        ...tool.sdkDependencies,
      ].join(' ').toLowerCase();

      let hits = 0;
      for (const term of terms) {
        if (searchable.includes(term)) hits++;
      }

      if (hits > 0) {
        const relevance = Math.round((hits / terms.length) * Math.pow(PHI, hits) * 100) / 100;
        results.push({ tool, relevance });
      }
    }

    results.sort((a, b) => b.relevance - a.relevance);
    return results;
  }

  /**
   * Returns the full tool catalog as an array.
   * @returns {import('./tool-schema.js').ToolSchema[]}
   */
  listAll() {
    return Array.from(this.#tools.values());
  }

  /**
   * Returns the number of registered tools.
   * @returns {number}
   */
  size() {
    return this.#tools.size;
  }

  /**
   * Returns the current registry version (increments on each registration).
   * @returns {number}
   */
  getVersion() {
    return this.#version;
  }

  /**
   * Generates the full tool catalog formatted for AI agent consumption.
   * This is the "marketplace grammar" that makes the entire registry legible.
   * @param {import('./tool-schema.js').ExposureTier} [maxTier='INTERNAL']
   * @returns {Object}
   */
  toAgentCatalog(maxTier = 'INTERNAL') {
    const tools = this.listByExposure(maxTier);
    return {
      catalogVersion: this.#version,
      generatedAt: new Date().toISOString(),
      totalTools: tools.length,
      exposureTier: maxTier,
      tools: tools.map((t) => ({
        callId: t.callId,
        name: t.name,
        purpose: t.purpose,
        permission: t.permissionClass,
        latencyMs: t.latencyExpectation,
        input: t.inputSchema.map((f) => ({
          name: f.name,
          type: f.type,
          required: f.required,
          description: f.description,
        })),
        output: t.outputSchema.map((f) => ({
          name: f.name,
          type: f.type,
          description: f.description,
        })),
      })),
    };
  }

  /**
   * Generates OpenAI-compatible function definitions for all visible tools.
   * @param {import('./tool-schema.js').ExposureTier} [maxTier='INTERNAL']
   * @returns {Object[]}
   */
  toOpenAIFunctions(maxTier = 'INTERNAL') {
    const { ToolSchemaBuilder } = /** @type {any} */ (
      /** @type {*} */ (null)
    );
    // Inline generation to avoid circular dependency
    const tools = this.listByExposure(maxTier);
    return tools.map((schema) => {
      const properties = {};
      const required = [];

      for (const field of schema.inputSchema) {
        properties[field.name] = {
          type: field.type === 'array' ? 'array' : field.type,
          description: field.description,
        };
        if (field.required) required.push(field.name);
      }

      return {
        type: 'function',
        function: {
          name: schema.name,
          description: schema.purpose,
          parameters: {
            type: 'object',
            properties,
            required,
          },
        },
      };
    });
  }

  /**
   * Returns registry metrics.
   * @returns {Object}
   */
  getMetrics() {
    const byHouse = {};
    for (const [house, ids] of this.#indexByHouse) {
      byHouse[house] = ids.size;
    }

    const byExposure = {};
    for (const [tier, ids] of this.#indexByExposure) {
      byExposure[tier] = ids.size;
    }

    const byBilling = {};
    for (const [cls, ids] of this.#indexByBilling) {
      byBilling[cls] = ids.size;
    }

    return {
      totalTools: this.#tools.size,
      registryVersion: this.#version,
      byHouse,
      byExposure,
      byBilling,
    };
  }
}

export default ToolRegistry;
