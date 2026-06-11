/**
 * RegulatoryComplianceEngine — Enforces regulatory charters and protocols
 * across all market operations.
 *
 * Evaluates trading operations against applicable regulatory frameworks
 * (SEC, CFTC, FINRA, ESMA, FCA, MAS, IOSCO, FATF, Basel, etc.) and
 * generates compliance reports, alerts, and audit trails.
 *
 * @module @medina/aifx-foundation-model/regulatory-compliance-engine
 */

import { REGULATORY_FRAMEWORKS, SUPPORTED_EXCHANGES } from './constants.js';

export class RegulatoryComplianceEngine {
  constructor(config = {}) {
    this.activeFrameworks = config.frameworks ?? Object.keys(REGULATORY_FRAMEWORKS);
    this.strictMode = config.strictMode ?? true;
    this.auditTrail = [];
    this.alerts = [];
  }

  /**
   * Evaluate an operation against all applicable regulatory frameworks.
   * @param {object} operation
   * @param {string} operation.type — 'trade' | 'order' | 'transfer' | 'report' | 'disclosure'
   * @param {string} operation.exchange — exchange ID
   * @param {string} operation.asset — asset symbol
   * @param {number} [operation.quantity]
   * @param {number} [operation.notional]
   * @param {string} [operation.jurisdiction]
   * @returns {object} compliance evaluation result
   */
  evaluate(operation) {
    const { type, exchange, asset } = operation;
    if (!type || !exchange) {
      throw new Error('RegulatoryComplianceEngine: operation requires type and exchange');
    }

    const exchangeInfo = SUPPORTED_EXCHANGES[exchange];
    if (!exchangeInfo) {
      throw new Error(`RegulatoryComplianceEngine: Unknown exchange "${exchange}"`);
    }

    // Determine applicable regulators
    const applicableRegs = this._getApplicableRegulations(exchangeInfo, operation.jurisdiction);

    const results = [];
    let overallCompliant = true;

    for (const reg of applicableRegs) {
      const check = this._checkRegulation(reg, operation, exchangeInfo);
      results.push(check);
      if (!check.compliant) overallCompliant = false;
    }

    const evaluation = {
      id: `COMP-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      operation,
      exchange: exchangeInfo,
      regulatorsEvaluated: results.length,
      results,
      overallCompliant,
      timestamp: Date.now(),
    };

    // Record audit trail
    this.auditTrail.push(evaluation);

    // Raise alert if non-compliant
    if (!overallCompliant) {
      const alert = {
        level: this.strictMode ? 'BLOCK' : 'WARN',
        evaluation,
        message: `Non-compliant operation detected: ${type} on ${exchange}`,
      };
      this.alerts.push(alert);
    }

    return evaluation;
  }

  /**
   * Check if a specific operation type requires pre-trade compliance.
   * @param {string} operationType
   * @param {string} exchangeId
   * @returns {object} pre-trade requirements
   */
  getPreTradeRequirements(operationType, exchangeId) {
    const exchangeInfo = SUPPORTED_EXCHANGES[exchangeId];
    if (!exchangeInfo) return { requirements: [], applicable: false };

    const regs = this._getApplicableRegulations(exchangeInfo);
    const requirements = [];

    for (const reg of regs) {
      // Map regulation mandates to pre-trade checks
      if (reg.id === 'SEC') {
        requirements.push({ regulator: 'SEC', checks: ['Reg NMS best execution', 'Short sale locate', 'Position limit'] });
      }
      if (reg.id === 'CFTC') {
        requirements.push({ regulator: 'CFTC', checks: ['Position limits', 'Large trader threshold', 'Swap reporting'] });
      }
      if (reg.id === 'ESMA') {
        requirements.push({ regulator: 'ESMA', checks: ['MiFID II pre-trade transparency', 'Position limits', 'Algo trading notification'] });
      }
      if (reg.id === 'FINRA') {
        requirements.push({ regulator: 'FINRA', checks: ['Best execution obligation', 'Suitability', 'Margin requirements'] });
      }
      if (reg.id === 'FATF') {
        requirements.push({ regulator: 'FATF', checks: ['AML screening', 'Travel rule compliance', 'Sanctions check'] });
      }
    }

    return { requirements, applicable: requirements.length > 0, exchangeId };
  }

  /**
   * Generate a compliance report for recent operations.
   * @param {object} [options={}]
   * @param {number} [options.limit=100]
   * @returns {object}
   */
  generateReport(options = {}) {
    const limit = options.limit ?? 100;
    const recent = this.auditTrail.slice(-limit);
    const compliant = recent.filter(e => e.overallCompliant).length;
    const nonCompliant = recent.length - compliant;

    return {
      totalEvaluations: recent.length,
      compliant,
      nonCompliant,
      complianceRate: recent.length > 0 ? +(compliant / recent.length).toFixed(4) : 1,
      activeAlerts: this.alerts.length,
      frameworks: this.activeFrameworks,
      generatedAt: Date.now(),
    };
  }

  /**
   * Get active alerts.
   * @returns {object[]}
   */
  getAlerts() {
    return [...this.alerts];
  }

  /**
   * Acknowledge and clear an alert.
   * @param {number} index
   */
  acknowledgeAlert(index) {
    if (index >= 0 && index < this.alerts.length) {
      this.alerts.splice(index, 1);
    }
  }

  /**
   * Get audit trail.
   * @param {number} [limit=50]
   * @returns {object[]}
   */
  getAuditTrail(limit = 50) {
    return this.auditTrail.slice(-limit);
  }

  /* ---- Internal ---- */

  _getApplicableRegulations(exchangeInfo, jurisdiction) {
    return Object.values(REGULATORY_FRAMEWORKS)
      .filter(reg => {
        if (!this.activeFrameworks.includes(reg.id)) return false;
        if (reg.jurisdiction === 'GLOBAL') return true;
        if (jurisdiction && reg.jurisdiction === jurisdiction) return true;
        if (reg.jurisdiction === exchangeInfo.region) return true;
        // US exchanges fall under US regulators
        if (exchangeInfo.region === 'US' && reg.jurisdiction === 'US') return true;
        if (exchangeInfo.region === 'EU' && reg.jurisdiction === 'EU') return true;
        if (exchangeInfo.region === 'EU' && reg.jurisdiction === 'UK') return true;
        return false;
      });
  }

  _checkRegulation(reg, operation, exchangeInfo) {
    // Foundation-level compliance checks
    const checks = [];

    // AML/KYC always required
    if (reg.mandates.some(m => m.includes('AML') || m.includes('KYC'))) {
      checks.push({ mandate: 'AML/KYC', status: 'required', enforced: true });
    }

    // Position limits for futures/derivatives
    if (reg.mandates.some(m => m.includes('Position Limit')) &&
        ['futures', 'derivatives', 'options', 'swaps'].includes(exchangeInfo.assetClass)) {
      const exceedsLimit = operation.notional && operation.notional > 10_000_000;
      checks.push({ mandate: 'Position Limits', status: exceedsLimit ? 'threshold-exceeded' : 'within-limits', enforced: true });
    }

    // Reporting obligations
    if (reg.mandates.some(m => m.includes('Reporting'))) {
      checks.push({ mandate: 'Transaction Reporting', status: 'required', enforced: true });
    }

    // Best execution
    if (reg.mandates.some(m => m.includes('Best Execution') || m.includes('Reg NMS'))) {
      checks.push({ mandate: 'Best Execution', status: 'required', enforced: true });
    }

    const compliant = checks.every(c => c.status !== 'threshold-exceeded');

    return {
      regulator: reg.id,
      regulatorName: reg.name,
      jurisdiction: reg.jurisdiction,
      checks,
      compliant,
    };
  }
}
