import crypto from 'node:crypto';
import { PHI, HEARTBEAT } from './tool-schema.js';

/**
 * @typedef {Object} UsageRecord
 * @property {string} recordId
 * @property {string} callId
 * @property {string} toolName
 * @property {string} principalId
 * @property {string} billingClass
 * @property {number} costWeight
 * @property {number} latencyMs
 * @property {boolean} success
 * @property {number} timestamp
 */

/**
 * @typedef {Object} SettlementSummary
 * @property {string} principalId
 * @property {number} totalCalls
 * @property {number} successfulCalls
 * @property {number} totalCostUnits
 * @property {number} avgLatencyMs
 * @property {Record<string, number>} callsByTool
 */

/**
 * MarketplaceSettlement — The usage, reward, billing, and token-routing layer
 * for all tool calls in the organism marketplace.
 *
 * This is the Settlement layer of the marketplace triad:
 * 1. Registry — searchable map (ToolRegistry)
 * 2. Protocol surface — standard invocation (ToolInvoker)
 * 3. Settlement layer — usage, billing, reward ← this
 *
 * Tracks every invocation, computes costs, and enables billing
 * at the INTERNAL, PARTNER, ENTERPRISE, and PUBLIC tiers.
 */
export class MarketplaceSettlement {
  /** @type {UsageRecord[]} */
  #usageLog;

  /** @type {Map<string, SettlementSummary>} */
  #summaries;

  /** @type {Map<string, number>} */
  #costMultipliers;

  /** @type {{ totalRevenue: number, totalCalls: number, settlementsProcessed: number }} */
  #globalMetrics;

  constructor() {
    this.#usageLog = [];
    this.#summaries = new Map();
    this.#costMultipliers = new Map([
      ['free', 0],
      ['metered', 1],
      ['per-call', PHI],
      ['per-seat', PHI * PHI],
      ['enterprise-license', 0],
    ]);
    this.#globalMetrics = { totalRevenue: 0, totalCalls: 0, settlementsProcessed: 0 };
  }

  /**
   * Records a tool invocation for settlement purposes.
   * This is designed to be wired as a settlement hook on ToolInvoker.
   * @param {import('./tool-invoker.js').InvocationResult} result
   * @param {import('./tool-schema.js').ToolSchema} schema
   */
  record(result, schema) {
    const multiplier = this.#costMultipliers.get(schema.billingClass) ?? 1;
    const costUnits = schema.costWeight * multiplier;

    /** @type {UsageRecord} */
    const record = {
      recordId: crypto.randomUUID(),
      callId: result.callId,
      toolName: result.toolName,
      principalId: 'system',
      billingClass: schema.billingClass,
      costWeight: costUnits,
      latencyMs: result.latencyMs,
      success: result.status === 'completed',
      timestamp: result.timestamp,
    };

    this.#usageLog.push(record);
    this.#globalMetrics.totalCalls++;
    this.#globalMetrics.totalRevenue += costUnits;

    // Update per-principal summary
    this.#updateSummary(record);
  }

  /**
   * Sets a custom cost multiplier for a billing class.
   * @param {string} billingClass
   * @param {number} multiplier
   */
  setCostMultiplier(billingClass, multiplier) {
    this.#costMultipliers.set(billingClass, multiplier);
  }

  /**
   * Returns the settlement summary for a specific principal.
   * @param {string} principalId
   * @returns {SettlementSummary|undefined}
   */
  getSummary(principalId) {
    return this.#summaries.get(principalId);
  }

  /**
   * Returns all settlement summaries.
   * @returns {SettlementSummary[]}
   */
  getAllSummaries() {
    return Array.from(this.#summaries.values());
  }

  /**
   * Returns usage records within a time range.
   * @param {number} sinceTimestamp
   * @param {number} [untilTimestamp]
   * @returns {UsageRecord[]}
   */
  getUsage(sinceTimestamp, untilTimestamp = Date.now()) {
    return this.#usageLog.filter((r) => r.timestamp >= sinceTimestamp && r.timestamp <= untilTimestamp);
  }

  /**
   * Returns the top N tools by total cost units consumed.
   * @param {number} [limit=10]
   * @returns {Array<{ toolName: string, totalCost: number, totalCalls: number }>}
   */
  getTopTools(limit = 10) {
    const byTool = new Map();

    for (const record of this.#usageLog) {
      if (!byTool.has(record.toolName)) {
        byTool.set(record.toolName, { toolName: record.toolName, totalCost: 0, totalCalls: 0 });
      }
      const entry = byTool.get(record.toolName);
      entry.totalCost += record.costWeight;
      entry.totalCalls++;
    }

    return Array.from(byTool.values())
      .sort((a, b) => b.totalCost - a.totalCost)
      .slice(0, limit);
  }

  /**
   * Processes a settlement cycle — computes final costs and marks records as settled.
   * @returns {{ settledRecords: number, totalRevenue: number, timestamp: number }}
   */
  settle() {
    const unsettled = this.#usageLog.filter((r) => !r._settled);
    let revenue = 0;

    for (const record of unsettled) {
      revenue += record.costWeight;
      /** @type {any} */ (record)._settled = true;
    }

    this.#globalMetrics.settlementsProcessed++;

    return {
      settledRecords: unsettled.length,
      totalRevenue: Math.round(revenue * 100) / 100,
      timestamp: Date.now(),
    };
  }

  /**
   * Returns global settlement metrics.
   * @returns {Object}
   */
  getMetrics() {
    return { ...this.#globalMetrics };
  }

  /**
   * @param {UsageRecord} record
   */
  #updateSummary(record) {
    if (!this.#summaries.has(record.principalId)) {
      this.#summaries.set(record.principalId, {
        principalId: record.principalId,
        totalCalls: 0,
        successfulCalls: 0,
        totalCostUnits: 0,
        avgLatencyMs: 0,
        callsByTool: {},
      });
    }

    const summary = this.#summaries.get(record.principalId);
    summary.totalCalls++;
    if (record.success) summary.successfulCalls++;
    summary.totalCostUnits += record.costWeight;
    summary.avgLatencyMs = Math.round(
      (summary.avgLatencyMs * (summary.totalCalls - 1) + record.latencyMs) / summary.totalCalls
    );
    summary.callsByTool[record.toolName] = (summary.callsByTool[record.toolName] || 0) + 1;
  }
}

export default MarketplaceSettlement;
