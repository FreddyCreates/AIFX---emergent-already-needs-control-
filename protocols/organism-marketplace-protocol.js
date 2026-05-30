/**
 * PROTO-011: Organism Marketplace Protocol (OMP)
 *
 * Callable Tool Marketplace Intelligence — the protocol that governs
 * how tools are discovered, invoked, settled, and orchestrated across
 * the organism. As above, so below.
 *
 * This protocol wires into the existing orchestration surfaces:
 * - Communication Orchestrator (tool invocation transport)
 * - Security Orchestrator (permission enforcement)
 * - Memory Orchestrator (tool catalog persistence)
 * - Versioning Orchestrator (schema versioning)
 *
 * The marketplace is three things at once:
 * 1. Registry — searchable map of callable tools
 * 2. Protocol surface — standard invocation contract
 * 3. Settlement layer — usage, reward, and billing
 *
 * Engines wired: ToolRegistry + ToolInvoker + MarketplaceSettlement + MarketplaceRouter
 * Ring affinity: Sovereign Ring
 * Organism placement: Organism core / marketplace layer
 *
 * @module protocols/organism-marketplace-protocol
 */

import crypto from 'node:crypto';

const PHI = 1.618033988749895;
const GOLDEN_ANGLE = 2.399963229728653;
const HEARTBEAT = 873;

/**
 * Exposure tier hierarchy — determines tool visibility.
 * @readonly
 */
const EXPOSURE_TIERS = ['INTERNAL', 'INTERNAL_SOVEREIGN', 'PARTNER', 'ENTERPRISE', 'PUBLIC'];

/**
 * OrganismMarketplaceProtocol — governs the full lifecycle of callable tool
 * discovery, invocation, settlement, and orchestration within the organism.
 */
export class OrganismMarketplaceProtocol {
  /** @type {Map<string, Object>} */
  #toolCatalog;

  /** @type {Map<string, Set<string>>} */
  #permissions;

  /** @type {Map<string, Function>} */
  #handlers;

  /** @type {Array<Object>} */
  #invocationLog;

  /** @type {Array<Object>} */
  #settlementLog;

  /** @type {Object} */
  #metrics;

  /** @type {string} */
  #currentTier;

  constructor(config = {}) {
    this.#toolCatalog = new Map();
    this.#permissions = new Map();
    this.#handlers = new Map();
    this.#invocationLog = [];
    this.#settlementLog = [];
    this.#currentTier = config.tier || 'INTERNAL';
    this.#metrics = {
      totalRegistered: 0,
      totalInvocations: 0,
      totalSettled: 0,
      totalRevenue: 0,
      avgLatencyMs: 0,
      successRate: 1.0,
      protocolVersion: '1.0.0',
      heartbeatAligned: true,
    };
  }

  // ──────────────────────────────────────────────
  //  REGISTRY LAYER
  // ──────────────────────────────────────────────

  /**
   * Registers a callable tool in the marketplace catalog.
   * @param {Object} toolDef - Tool definition with callId, name, purpose, inputSchema, outputSchema, etc.
   * @returns {{ callId: string, registered: boolean }}
   */
  registerTool(toolDef) {
    if (!toolDef || !toolDef.callId || !toolDef.name) {
      throw new Error('Tool definition requires callId and name');
    }

    this.#toolCatalog.set(toolDef.callId, {
      ...toolDef,
      registeredAt: Date.now(),
      invocationCount: 0,
      lastInvoked: null,
      reputation: 1.0,
    });

    this.#metrics.totalRegistered++;
    return { callId: toolDef.callId, registered: true };
  }

  /**
   * Registers a handler for a tool.
   * @param {string} callId
   * @param {Function} handler - async (input, context) => output
   */
  registerHandler(callId, handler) {
    if (!this.#toolCatalog.has(callId)) {
      throw new Error(`Tool "${callId}" not in catalog`);
    }
    if (typeof handler !== 'function') {
      throw new TypeError('Handler must be a function');
    }
    this.#handlers.set(callId, handler);
  }

  /**
   * Discovers tools matching a query.
   * Phi-weighted relevance scoring across name, purpose, and dependencies.
   * @param {string} query - Search query
   * @param {string} [maxTier] - Maximum exposure tier to include
   * @returns {Array<{ tool: Object, relevance: number }>}
   */
  discoverTools(query, maxTier = this.#currentTier) {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (terms.length === 0) return [];

    const tierIndex = EXPOSURE_TIERS.indexOf(maxTier);
    const results = [];

    for (const tool of this.#toolCatalog.values()) {
      const toolTierIndex = EXPOSURE_TIERS.indexOf(tool.exposure || 'INTERNAL');
      if (toolTierIndex > tierIndex) continue;

      const searchable = [
        tool.name, tool.displayName, tool.purpose,
        tool.housePlacement, ...(tool.sdkDependencies || []),
      ].join(' ').toLowerCase();

      let hits = 0;
      for (const term of terms) {
        if (searchable.includes(term)) hits++;
      }

      if (hits > 0) {
        const relevance = Math.round(
          (hits / terms.length) * Math.pow(PHI, hits) * 100
        ) / 100;
        results.push({ tool, relevance });
      }
    }

    results.sort((a, b) => b.relevance - a.relevance);
    return results;
  }

  /**
   * Returns the full tool catalog formatted for AI agent consumption.
   * This is the "marketplace grammar" — the legible format that makes
   * tools callable by any AI agent runtime.
   * @param {string} [maxTier]
   * @returns {Object}
   */
  getAgentCatalog(maxTier = this.#currentTier) {
    const tierIndex = EXPOSURE_TIERS.indexOf(maxTier);
    const tools = [];

    for (const tool of this.#toolCatalog.values()) {
      const toolTierIndex = EXPOSURE_TIERS.indexOf(tool.exposure || 'INTERNAL');
      if (toolTierIndex <= tierIndex) {
        tools.push({
          callId: tool.callId,
          name: tool.name,
          purpose: tool.purpose,
          permission: tool.permissionClass,
          latencyMs: tool.latencyExpectation,
          input: (tool.inputSchema || []).map((f) => ({
            name: f.name, type: f.type, required: f.required, description: f.description,
          })),
          output: (tool.outputSchema || []).map((f) => ({
            name: f.name, type: f.type, description: f.description,
          })),
        });
      }
    }

    return {
      protocolVersion: this.#metrics.protocolVersion,
      generatedAt: new Date().toISOString(),
      exposureTier: maxTier,
      totalTools: tools.length,
      tools,
    };
  }

  // ──────────────────────────────────────────────
  //  PERMISSION LAYER
  // ──────────────────────────────────────────────

  /**
   * Grants a principal permission to invoke a tool.
   * @param {string} principalId
   * @param {string} callId
   */
  grantPermission(principalId, callId) {
    if (!this.#permissions.has(principalId)) {
      this.#permissions.set(principalId, new Set());
    }
    this.#permissions.get(principalId).add(callId);
  }

  /**
   * Grants a principal permission to all tools at or below a tier.
   * @param {string} principalId
   * @param {string} maxTier
   */
  grantTierPermissions(principalId, maxTier) {
    const tierIndex = EXPOSURE_TIERS.indexOf(maxTier);
    for (const tool of this.#toolCatalog.values()) {
      const toolTierIndex = EXPOSURE_TIERS.indexOf(tool.exposure || 'INTERNAL');
      if (toolTierIndex <= tierIndex) {
        this.grantPermission(principalId, tool.callId);
      }
    }
  }

  /**
   * Checks if a principal can invoke a tool.
   * @param {string} principalId
   * @param {string} callId
   * @returns {boolean}
   */
  hasPermission(principalId, callId) {
    const perms = this.#permissions.get(principalId);
    return perms ? perms.has(callId) : false;
  }

  // ──────────────────────────────────────────────
  //  INVOCATION LAYER (Protocol Surface)
  // ──────────────────────────────────────────────

  /**
   * Invokes a callable tool through the standard marketplace protocol.
   *
   * Flow:
   * 1. Resolve tool from catalog
   * 2. Check permissions
   * 3. Validate input against schema
   * 4. Execute handler
   * 5. Validate output
   * 6. Record settlement
   * 7. Return structured result
   *
   * @param {string} callId
   * @param {Record<string, *>} input
   * @param {{ principalId: string, traceId?: string }} context
   * @returns {Promise<Object>}
   */
  async invoke(callId, input, context) {
    const invocationId = crypto.randomUUID();
    const startTime = Date.now();
    this.#metrics.totalInvocations++;

    // 1. Resolve
    const tool = this.#toolCatalog.get(callId);
    if (!tool) {
      return this.#failResult(invocationId, callId, 'unknown', `Tool "${callId}" not found`, startTime);
    }

    // 2. Permissions
    if (!this.hasPermission(context.principalId, callId)) {
      return this.#failResult(invocationId, callId, tool.name, `Permission denied for "${context.principalId}"`, startTime);
    }

    // 3. Validate input
    const inputErrors = this.#validateFields(tool.inputSchema || [], input || {}, 'input');
    if (inputErrors.length > 0) {
      return this.#failResult(invocationId, callId, tool.name, `Input: ${inputErrors.join('; ')}`, startTime);
    }

    // 4. Execute
    const handler = this.#handlers.get(callId);
    if (!handler) {
      return this.#failResult(invocationId, callId, tool.name, `No handler for "${callId}"`, startTime);
    }

    let output;
    try {
      const timeoutMs = (tool.latencyExpectation || HEARTBEAT) * 3;
      output = await Promise.race([
        handler(input || {}, { invocationId, principalId: context.principalId, traceId: context.traceId }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs)
        ),
      ]);
    } catch (err) {
      return this.#failResult(invocationId, callId, tool.name, err.message, startTime);
    }

    // 5. Validate output
    const outputErrors = this.#validateFields(tool.outputSchema || [], output || {}, 'output');
    if (outputErrors.length > 0) {
      return this.#failResult(invocationId, callId, tool.name, `Output: ${outputErrors.join('; ')}`, startTime);
    }

    // 6. Record
    const latencyMs = Date.now() - startTime;
    tool.invocationCount++;
    tool.lastInvoked = Date.now();

    const result = {
      invocationId,
      callId,
      toolName: tool.name,
      status: 'completed',
      data: output,
      error: null,
      latencyMs,
      timestamp: Date.now(),
    };

    this.#invocationLog.push(result);

    // 7. Settlement
    this.#recordSettlement(result, tool);

    // Update running metrics
    const totalSuccess = this.#invocationLog.filter((r) => r.status === 'completed').length;
    this.#metrics.successRate = Math.round((totalSuccess / this.#metrics.totalInvocations) * 10000) / 10000;
    this.#metrics.avgLatencyMs = Math.round(
      this.#invocationLog.reduce((sum, r) => sum + r.latencyMs, 0) / this.#invocationLog.length
    );

    return result;
  }

  // ──────────────────────────────────────────────
  //  SETTLEMENT LAYER
  // ──────────────────────────────────────────────

  /**
   * Processes a settlement cycle.
   * @returns {{ settledRecords: number, totalRevenue: number, timestamp: number }}
   */
  settle() {
    const unsettled = this.#settlementLog.filter((r) => !r._settled);
    let revenue = 0;

    for (const record of unsettled) {
      revenue += record.costUnits;
      record._settled = true;
    }

    this.#metrics.totalSettled += unsettled.length;
    this.#metrics.totalRevenue += revenue;

    return {
      settledRecords: unsettled.length,
      totalRevenue: Math.round(revenue * 100) / 100,
      timestamp: Date.now(),
    };
  }

  /**
   * Returns protocol metrics.
   * @returns {Object}
   */
  getMetrics() {
    const byHouse = {};
    for (const tool of this.#toolCatalog.values()) {
      const house = tool.housePlacement || 'Unknown';
      byHouse[house] = (byHouse[house] || 0) + 1;
    }

    return {
      ...this.#metrics,
      catalogSize: this.#toolCatalog.size,
      handlersRegistered: this.#handlers.size,
      principalsAuthorized: this.#permissions.size,
      invocationLogSize: this.#invocationLog.length,
      byHouse,
    };
  }

  /**
   * Returns the OpenAI-compatible function definitions for all visible tools.
   * @param {string} [maxTier]
   * @returns {Object[]}
   */
  toOpenAIFunctions(maxTier = this.#currentTier) {
    const tierIndex = EXPOSURE_TIERS.indexOf(maxTier);
    const functions = [];

    for (const tool of this.#toolCatalog.values()) {
      const toolTierIndex = EXPOSURE_TIERS.indexOf(tool.exposure || 'INTERNAL');
      if (toolTierIndex > tierIndex) continue;

      const properties = {};
      const required = [];

      for (const field of tool.inputSchema || []) {
        properties[field.name] = {
          type: field.type === 'array' ? 'array' : field.type,
          description: field.description,
        };
        if (field.required) required.push(field.name);
      }

      functions.push({
        type: 'function',
        function: {
          name: tool.name,
          description: tool.purpose,
          parameters: { type: 'object', properties, required },
        },
      });
    }

    return functions;
  }

  // ──────────────────────────────────────────────
  //  PRIVATE
  // ──────────────────────────────────────────────

  #validateFields(schema, data, label) {
    const errors = [];
    for (const field of schema) {
      const value = data[field.name];
      if (field.required && (value === undefined || value === null)) {
        errors.push(`Missing required ${label} field: "${field.name}"`);
      }
      if (value !== undefined && value !== null) {
        const actualType = Array.isArray(value) ? 'array' : typeof value;
        if (actualType !== field.type) {
          errors.push(`${label} "${field.name}" expected "${field.type}", got "${actualType}"`);
        }
      }
    }
    return errors;
  }

  #failResult(invocationId, callId, toolName, error, startTime) {
    const result = {
      invocationId, callId, toolName,
      status: 'failed', data: null, error,
      latencyMs: Date.now() - startTime,
      timestamp: Date.now(),
    };
    this.#invocationLog.push(result);
    return result;
  }

  #recordSettlement(result, tool) {
    const costMultipliers = { free: 0, metered: 1, 'per-call': PHI, 'per-seat': PHI * PHI, 'enterprise-license': 0 };
    const multiplier = costMultipliers[tool.billingClass] || 0;
    const costUnits = (tool.costWeight || 0) * multiplier;

    this.#settlementLog.push({
      recordId: crypto.randomUUID(),
      callId: result.callId,
      toolName: result.toolName,
      principalId: 'system',
      costUnits,
      latencyMs: result.latencyMs,
      success: true,
      timestamp: result.timestamp,
    });
  }
}

export { OrganismMarketplaceProtocol as default };
