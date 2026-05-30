import crypto from 'node:crypto';
import { ToolSchemaBuilder, VALID_EXPOSURES, PHI, HEARTBEAT } from './tool-schema.js';

/**
 * @typedef {'pending'|'running'|'completed'|'failed'|'timeout'} InvocationStatus
 */

/**
 * @typedef {Object} InvocationResult
 * @property {string} invocationId - Unique invocation ID
 * @property {string} callId - Tool call ID
 * @property {string} toolName - Tool name
 * @property {InvocationStatus} status - Result status
 * @property {*} data - Output data
 * @property {string|null} error - Error message if failed
 * @property {number} latencyMs - Actual latency
 * @property {number} timestamp - Completion timestamp
 */

/**
 * ToolInvoker — The protocol surface for invoking callable tools in the organism marketplace.
 *
 * This is the Protocol Surface layer of the marketplace triad:
 * 1. Registry — searchable map (ToolRegistry)
 * 2. Protocol surface — standard invocation ← this
 * 3. Settlement layer — billing/reward (MarketplaceSettlement)
 *
 * Provides a standardized way for AIs, developers, apps, and other organisms
 * to invoke tool calls with permission checks, schema validation, and
 * structured result handling.
 */
export class ToolInvoker {
  /** @type {import('./tool-registry.js').ToolRegistry} */
  #registry;

  /** @type {Map<string, Function>} */
  #handlers;

  /** @type {Map<string, Set<string>>} */
  #permissions;

  /** @type {Array<{ invocationId: string, callId: string, status: InvocationStatus, latencyMs: number, timestamp: number }>} */
  #invocationLog;

  /** @type {{ totalCalls: number, successCalls: number, failedCalls: number, totalLatencyMs: number }} */
  #metrics;

  /** @type {Array<Function>} */
  #settlementHooks;

  /**
   * @param {import('./tool-registry.js').ToolRegistry} registry
   */
  constructor(registry) {
    if (!registry) throw new Error('ToolInvoker requires a ToolRegistry instance');
    this.#registry = registry;
    this.#handlers = new Map();
    this.#permissions = new Map();
    this.#invocationLog = [];
    this.#metrics = { totalCalls: 0, successCalls: 0, failedCalls: 0, totalLatencyMs: 0 };
    this.#settlementHooks = [];
  }

  /**
   * Registers a handler function for a specific tool call.
   * The handler is the actual implementation that executes when the tool is invoked.
   * @param {string} callId - The tool's call ID
   * @param {Function} handler - async (input, context) => output
   */
  registerHandler(callId, handler) {
    const schema = this.#registry.getById(callId);
    if (!schema) throw new Error(`Cannot register handler: tool "${callId}" not found in registry`);
    if (typeof handler !== 'function') throw new TypeError('Handler must be a function');
    this.#handlers.set(callId, handler);
  }

  /**
   * Grants a principal (user, agent, organism) permission to invoke a tool.
   * @param {string} principalId - Who gets permission
   * @param {string} callId - Which tool they can call
   */
  grantPermission(principalId, callId) {
    if (!this.#permissions.has(principalId)) {
      this.#permissions.set(principalId, new Set());
    }
    this.#permissions.get(principalId).add(callId);
  }

  /**
   * Revokes a principal's permission to invoke a tool.
   * @param {string} principalId
   * @param {string} callId
   */
  revokePermission(principalId, callId) {
    const perms = this.#permissions.get(principalId);
    if (perms) perms.delete(callId);
  }

  /**
   * Grants a principal permission to all tools at or below a given exposure tier.
   * @param {string} principalId
   * @param {import('./tool-schema.js').ExposureTier} maxTier
   */
  grantTierPermissions(principalId, maxTier) {
    const tools = this.#registry.listByExposure(maxTier);
    for (const tool of tools) {
      this.grantPermission(principalId, tool.callId);
    }
  }

  /**
   * Checks whether a principal has permission to invoke a tool.
   * @param {string} principalId
   * @param {string} callId
   * @returns {boolean}
   */
  hasPermission(principalId, callId) {
    const perms = this.#permissions.get(principalId);
    return perms ? perms.has(callId) : false;
  }

  /**
   * Registers a settlement hook that fires after every successful invocation.
   * Used to wire billing, reward, and usage tracking.
   * @param {Function} hook - (invocationResult, schema) => void
   */
  onSettlement(hook) {
    if (typeof hook !== 'function') throw new TypeError('Settlement hook must be a function');
    this.#settlementHooks.push(hook);
  }

  /**
   * Invokes a callable tool through the standard call contract.
   *
   * Flow:
   * 1. Resolve tool from registry
   * 2. Check permissions
   * 3. Validate input against schema
   * 4. Execute handler with timeout
   * 5. Validate output against schema
   * 6. Fire settlement hooks
   * 7. Return structured result
   *
   * @param {string} callId - Tool to invoke
   * @param {Record<string, *>} input - Input parameters
   * @param {{ principalId: string, traceId?: string }} context - Invocation context
   * @returns {Promise<InvocationResult>}
   */
  async invoke(callId, input, context) {
    const invocationId = crypto.randomUUID();
    const startTime = Date.now();

    this.#metrics.totalCalls++;

    // 1. Resolve tool
    const schema = this.#registry.getById(callId);
    if (!schema) {
      return this.#fail(invocationId, callId, 'unknown', `Tool "${callId}" not found in registry`, startTime);
    }

    // 2. Check permissions
    if (!this.hasPermission(context.principalId, callId)) {
      return this.#fail(invocationId, callId, schema.name, `Principal "${context.principalId}" lacks permission for "${callId}"`, startTime);
    }

    // 3. Validate input
    const inputValidation = ToolSchemaBuilder.validateInput(schema, input || {});
    if (!inputValidation.valid) {
      return this.#fail(invocationId, callId, schema.name, `Input validation failed: ${inputValidation.errors.join('; ')}`, startTime);
    }

    // 4. Execute handler
    const handler = this.#handlers.get(callId);
    if (!handler) {
      return this.#fail(invocationId, callId, schema.name, `No handler registered for "${callId}"`, startTime);
    }

    let output;
    try {
      const timeoutMs = schema.latencyExpectation * 3;
      output = await Promise.race([
        handler(input || {}, { invocationId, principalId: context.principalId, traceId: context.traceId }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Tool "${schema.name}" exceeded timeout of ${timeoutMs}ms`)), timeoutMs)
        ),
      ]);
    } catch (err) {
      return this.#fail(invocationId, callId, schema.name, err.message, startTime);
    }

    // 5. Validate output
    const outputValidation = ToolSchemaBuilder.validateOutput(schema, output || {});
    if (!outputValidation.valid) {
      return this.#fail(invocationId, callId, schema.name, `Output validation failed: ${outputValidation.errors.join('; ')}`, startTime);
    }

    // 6. Build success result
    const latencyMs = Date.now() - startTime;
    /** @type {InvocationResult} */
    const result = {
      invocationId,
      callId,
      toolName: schema.name,
      status: 'completed',
      data: output,
      error: null,
      latencyMs,
      timestamp: Date.now(),
    };

    this.#metrics.successCalls++;
    this.#metrics.totalLatencyMs += latencyMs;
    this.#invocationLog.push({
      invocationId,
      callId,
      status: 'completed',
      latencyMs,
      timestamp: result.timestamp,
    });

    // 7. Fire settlement hooks
    for (const hook of this.#settlementHooks) {
      try {
        hook(result, schema);
      } catch (err) {
        console.error(`[ToolInvoker] Settlement hook error:`, err);
      }
    }

    return result;
  }

  /**
   * Returns invocation metrics.
   * @returns {Object}
   */
  getMetrics() {
    return {
      ...this.#metrics,
      avgLatencyMs: this.#metrics.successCalls > 0
        ? Math.round(this.#metrics.totalLatencyMs / this.#metrics.successCalls)
        : 0,
      successRate: this.#metrics.totalCalls > 0
        ? Math.round((this.#metrics.successCalls / this.#metrics.totalCalls) * 10000) / 100
        : 0,
    };
  }

  /**
   * Returns the most recent N invocations.
   * @param {number} [limit=50]
   * @returns {Array<Object>}
   */
  getRecentInvocations(limit = 50) {
    return this.#invocationLog.slice(-limit);
  }

  /**
   * @param {string} invocationId
   * @param {string} callId
   * @param {string} toolName
   * @param {string} errorMessage
   * @param {number} startTime
   * @returns {InvocationResult}
   */
  #fail(invocationId, callId, toolName, errorMessage, startTime) {
    const latencyMs = Date.now() - startTime;
    this.#metrics.failedCalls++;

    const result = {
      invocationId,
      callId,
      toolName,
      status: /** @type {InvocationStatus} */ ('failed'),
      data: null,
      error: errorMessage,
      latencyMs,
      timestamp: Date.now(),
    };

    this.#invocationLog.push({
      invocationId,
      callId,
      status: 'failed',
      latencyMs,
      timestamp: result.timestamp,
    });

    return result;
  }
}

export default ToolInvoker;
