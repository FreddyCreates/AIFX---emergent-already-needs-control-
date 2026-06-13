/**
 * COMPRESSION AUDITOR
 *
 * Checks whether shorter output preserved meaning, action clarity,
 * and risk awareness. Validates compression quality.
 *
 * Implements:
 *   CE = MeaningPreserved / TokensUsed
 *   CEF = (InformationRetained + ActionClarity + RiskPreserved) / OutputTokens
 *
 * Pass condition: Can the user still act correctly?
 */

class CompressionAuditor {
  constructor(options = {}) {
    this.thresholds = {
      minCEF: options.minCEF || 0.02,
      minMeaning: options.minMeaning || 3,
      minAction: options.minAction || 3,
      minRisk: options.minRisk || 2,
    };
    this.audits = [];
  }

  /**
   * Audit a compressed output.
   * @param {object} params
   * @param {number} params.informationRetained - 0–5: how much meaning preserved
   * @param {number} params.actionClarity - 0–5: can user act immediately?
   * @param {number} params.riskPreserved - 0–5: are risks/uncertainty still visible?
   * @param {number} params.outputTokens - number of tokens in compressed output
   * @param {number} [params.originalTokens] - tokens in uncompressed version (optional)
   * @returns {{ cef, pass, compressionRatio, issues, verdict }}
   */
  audit(params) {
    const info = params.informationRetained || 0;
    const action = params.actionClarity || 0;
    const risk = params.riskPreserved || 0;
    const outputTokens = params.outputTokens || 1;
    const originalTokens = params.originalTokens || null;

    const cef = (info + action + risk) / outputTokens;
    const compressionRatio = originalTokens ? outputTokens / originalTokens : null;

    const issues = [];

    if (info < this.thresholds.minMeaning) {
      issues.push('meaning_lost');
    }
    if (action < this.thresholds.minAction) {
      issues.push('action_unclear');
    }
    if (risk < this.thresholds.minRisk) {
      issues.push('risk_hidden');
    }
    if (cef < this.thresholds.minCEF) {
      issues.push('cef_below_threshold');
    }

    const pass = issues.length === 0;

    const verdict = pass
      ? 'compression_valid'
      : issues.includes('risk_hidden')
        ? 'dangerous_compression'
        : 'lossy_compression';

    const result = {
      cef,
      pass,
      compressionRatio,
      issues,
      verdict,
      breakdown: { informationRetained: info, actionClarity: action, riskPreserved: risk },
      outputTokens,
      originalTokens,
      timestamp: Date.now(),
    };

    this.audits.push(result);
    return result;
  }

  /**
   * Compare original vs compressed outputs.
   * @param {object} original - { meaning, action, risk, tokens }
   * @param {object} compressed - { meaning, action, risk, tokens }
   * @returns {{ improvement, qualityDelta, tokenSavings, recommendation }}
   */
  compareVersions(original, compressed) {
    const origAudit = this.audit({
      informationRetained: original.meaning || 5,
      actionClarity: original.action || 5,
      riskPreserved: original.risk || 5,
      outputTokens: original.tokens,
    });

    const compAudit = this.audit({
      informationRetained: compressed.meaning,
      actionClarity: compressed.action,
      riskPreserved: compressed.risk,
      outputTokens: compressed.tokens,
      originalTokens: original.tokens,
    });

    // Remove from audit trail (this is a comparison utility)
    this.audits.pop();
    this.audits.pop();

    const qualityDelta = compAudit.cef - origAudit.cef;
    const tokenSavings = original.tokens - compressed.tokens;
    const meaningLoss = (original.meaning || 5) - compressed.meaning;

    let recommendation;
    if (compAudit.pass && tokenSavings > 0) {
      recommendation = 'use_compressed';
    } else if (!compAudit.pass && compAudit.issues.includes('risk_hidden')) {
      recommendation = 'reject_compression';
    } else if (!compAudit.pass) {
      recommendation = 'revise_compression';
    } else {
      recommendation = 'no_benefit';
    }

    return {
      improvement: qualityDelta > 0,
      qualityDelta,
      tokenSavings,
      meaningLoss,
      recommendation,
      originalAudit: origAudit,
      compressedAudit: compAudit,
    };
  }

  getStats() {
    if (this.audits.length === 0) return { count: 0, passRate: 0, avgCEF: 0 };
    const count = this.audits.length;
    const passes = this.audits.filter(a => a.pass).length;
    const avgCEF = this.audits.reduce((s, a) => s + a.cef, 0) / count;
    return { count, passRate: passes / count, avgCEF };
  }

  reset() {
    this.audits = [];
  }
}

export { CompressionAuditor };
export default CompressionAuditor;
