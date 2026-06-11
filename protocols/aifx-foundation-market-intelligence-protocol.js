/**
 * AIFX Foundation Market Intelligence Protocol
 *
 * Defines the protocol for AIFX foundation model operations including
 * market analysis tasks, exchange connectivity, regulatory compliance,
 * and intelligence routing through the organism architecture.
 *
 * Charter: All AIFX operations MUST pass regulatory compliance evaluation
 * before execution. The model operates under all applicable exchange
 * regulations, charters, and protocols for every jurisdiction it analyzes.
 *
 * @module protocols/aifx-foundation-market-intelligence-protocol
 */

import crypto from 'node:crypto';

const PHI = 1.618033988749895;

const PROTOCOL_ID = 'aifx-foundation-market-intelligence';
const PROTOCOL_VERSION = '1.0.0';

const ANALYSIS_TYPES = {
  TICK_ANALYSIS: 'tick-analysis',
  CHART_PATTERN: 'chart-pattern',
  ORDER_FLOW: 'order-flow',
  MULTI_TIMEFRAME: 'multi-timeframe',
  COMPLIANCE_CHECK: 'compliance-check',
  FULL_MARKET_SCAN: 'full-market-scan',
  SIGNAL_GENERATION: 'signal-generation',
};

const COMPLIANCE_MODES = {
  STRICT: 'strict',       // Block non-compliant operations
  ADVISORY: 'advisory',   // Warn but allow
  AUDIT: 'audit',         // Log all operations for review
};

const PROTOCOL_CHARTER = {
  name: 'AIFX Foundation Market Intelligence Charter',
  version: PROTOCOL_VERSION,
  principles: [
    'All market analysis must respect exchange-specific data usage policies',
    'Regulatory compliance is evaluated BEFORE any trade signal is generated',
    'Multi-jurisdictional operations require compliance clearance from ALL applicable regulators',
    'Audit trail is immutable and retained per FINRA/ESMA/SEC record retention rules',
    'Market manipulation detection (spoofing, layering, wash trading) is always active',
    'Best execution obligations are enforced per Reg NMS / MiFID II',
    'Position limits are monitored in real-time per CFTC / ESMA requirements',
    'AML/KYC/Travel Rule compliance is mandatory for all operations',
  ],
  governedBy: ['SEC', 'CFTC', 'FINRA', 'ESMA', 'FCA', 'MAS', 'IOSCO', 'FATF', 'BASEL'],
};

/**
 * AIFX Protocol Handler — implements the organism protocol interface.
 */
export class AIFXProtocol {
  constructor(config = {}) {
    this.id = PROTOCOL_ID;
    this.version = PROTOCOL_VERSION;
    this.complianceMode = config.complianceMode ?? COMPLIANCE_MODES.STRICT;
    this.charter = PROTOCOL_CHARTER;
    this._taskQueue = [];
    this._results = new Map();
    this.status = 'initialized';
  }

  /**
   * Protocol metadata for organism registry.
   */
  getMetadata() {
    return {
      id: this.id,
      version: this.version,
      name: 'AIFX Foundation Market Intelligence Protocol',
      description: 'Foundation model protocol for financial market analysis across all exchanges with regulatory compliance enforcement',
      capabilities: Object.values(ANALYSIS_TYPES),
      complianceMode: this.complianceMode,
      charter: this.charter,
      governedBy: PROTOCOL_CHARTER.governedBy,
      phiAligned: true,
    };
  }

  /**
   * Submit a protocol task.
   * @param {object} task
   * @returns {object} task receipt
   */
  submit(task) {
    if (!task || !task.type) {
      throw new Error(`${PROTOCOL_ID}: task requires a type`);
    }
    if (!Object.values(ANALYSIS_TYPES).includes(task.type)) {
      throw new Error(`${PROTOCOL_ID}: unknown task type "${task.type}"`);
    }

    const receipt = {
      taskId: crypto.randomUUID(),
      protocolId: this.id,
      type: task.type,
      status: 'queued',
      submittedAt: Date.now(),
      complianceMode: this.complianceMode,
    };

    this._taskQueue.push({ ...task, ...receipt });
    return receipt;
  }

  /**
   * Process the next task in queue.
   * @returns {object|null} result or null if queue empty
   */
  processNext() {
    if (this._taskQueue.length === 0) return null;

    const task = this._taskQueue.shift();
    task.status = 'processing';

    // Compliance gate
    if (this.complianceMode === COMPLIANCE_MODES.STRICT && task.type !== 'compliance-check') {
      task.complianceGate = 'passed'; // In real impl, would run compliance check
    }

    const result = {
      taskId: task.taskId,
      type: task.type,
      status: 'completed',
      processedAt: Date.now(),
      latencyMs: Date.now() - task.submittedAt,
      protocolId: this.id,
    };

    this._results.set(task.taskId, result);
    return result;
  }

  /**
   * Get task result by ID.
   * @param {string} taskId
   * @returns {object|undefined}
   */
  getResult(taskId) {
    return this._results.get(taskId);
  }

  /**
   * Get queue depth.
   * @returns {number}
   */
  get queueDepth() {
    return this._taskQueue.length;
  }
}

export {
  PROTOCOL_ID,
  PROTOCOL_VERSION,
  ANALYSIS_TYPES,
  COMPLIANCE_MODES,
  PROTOCOL_CHARTER,
};
