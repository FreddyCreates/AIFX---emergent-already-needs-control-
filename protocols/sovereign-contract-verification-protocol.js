/**
 * PROTO-006: Sovereign Contract Verification Protocol (SCVP)
 * Legal Intelligence that learns new contract clause patterns.
 */

import { createHash, createHmac } from 'crypto';

const PHI = 1.618033988749895;
const GOLDEN_ANGLE = 2.399963229728653;
const HEARTBEAT = 873;

class SovereignContractVerificationProtocol {
  /**
   * @param {Object} config - Configuration
   */
  constructor(config = {}) {
    this.clauseLibrary = new Map();
    this.obligationTracker = new Map();
    this.contracts = new Map();
    this.metrics = {
      contractsParsed: 0,
      clausesVerified: 0,
      obligationsTracked: 0,
      complianceRate: 0,
      signaturesCreated: 0,
      totalComplianceChecks: 0,
      compliantCount: 0
    };

    this._initClauseLibrary();
  }

  _initClauseLibrary() {
    const clauseTypes = [
      'confidentiality', 'non-compete', 'indemnification', 'limitation-of-liability',
      'termination', 'force-majeure', 'intellectual-property', 'payment-terms',
      'warranty', 'governing-law', 'arbitration', 'assignment',
      'entire-agreement', 'amendment', 'severability', 'notice',
      'survival', 'waiver', 'counterparts', 'data-protection'
    ];

    const patterns = {
      'confidentiality': /\b(?:confidential|non-disclosure|NDA|proprietary information|trade secret)\b/gi,
      'non-compete': /\b(?:non-compete|non-solicitation|restrictive covenant|competition)\b/gi,
      'indemnification': /\b(?:indemnif|hold harmless|defend and indemnify)\b/gi,
      'limitation-of-liability': /\b(?:limitation of liability|liability cap|maximum liability|consequential damages)\b/gi,
      'termination': /\b(?:terminat|cancellation|expir|end of term)\b/gi,
      'force-majeure': /\b(?:force majeure|act of god|beyond.*control|unforeseeable)\b/gi,
      'intellectual-property': /\b(?:intellectual property|IP rights|copyright|patent|trademark)\b/gi,
      'payment-terms': /\b(?:payment|invoice|net \d+|billing|compensation|fee)\b/gi,
      'warranty': /\b(?:warrant|guarantee|representation|as-is|merchantability)\b/gi,
      'governing-law': /\b(?:governing law|jurisdiction|applicable law|governed by)\b/gi,
      'arbitration': /\b(?:arbitrat|mediat|dispute resolution|binding arbitration)\b/gi,
      'assignment': /\b(?:assign|transfer|delegate|successor)\b/gi,
      'entire-agreement': /\b(?:entire agreement|whole agreement|supersede|complete agreement)\b/gi,
      'amendment': /\b(?:amend|modif|supplement|addendum)\b/gi,
      'severability': /\b(?:severab|invalid.*provision|unenforceable)\b/gi,
      'notice': /\b(?:notice|notification|written notice|notify)\b/gi,
      'survival': /\b(?:surviv|outlast|remain in effect|post-termination)\b/gi,
      'waiver': /\b(?:waiv|relinquish|forgo|failure to enforce)\b/gi,
      'counterparts': /\b(?:counterpart|executed in|duplicate|multiple copies)\b/gi,
      'data-protection': /\b(?:data protection|GDPR|privacy|personal data|data processing)\b/gi
    };

    for (const type of clauseTypes) {
      this.clauseLibrary.set(type, {
        type,
        pattern: patterns[type] || new RegExp(`\\b${type.replace(/-/g, '[\\s-]')}\\b`, 'gi'),
        weight: 1.0,
        examples: [],
        matchCount: 0
      });
    }
  }

  /**
   * Parse contract text extracting clauses, parties, dates, obligations.
   * @param {string} text - Contract text
   * @returns {Object} - {contractId, parties, dates, clauses, obligations}
   */
  parseContract(text) {
    const contractId = `contract-${this.metrics.contractsParsed + 1}`;

    // Extract parties
    const partyPatterns = [
      /(?:between|party[:\s]+|hereinafter[:\s]+)["']?([A-Z][A-Za-z\s&.,]+?)["']?(?:\s*(?:and|,|\(|hereinafter))/g,
      /\b([A-Z][A-Za-z]+ (?:Inc|Corp|LLC|Ltd|Company|Association)\.?)\b/g
    ];
    const parties = new Set();
    for (const pattern of partyPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        parties.add(match[1].trim());
      }
    }

    // Extract dates
    const datePattern = /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\w+ \d{1,2},?\s*\d{4}|\d{4}[-/]\d{1,2}[-/]\d{1,2})\b/g;
    const dates = [];
    let dateMatch;
    while ((dateMatch = datePattern.exec(text)) !== null) {
      dates.push(dateMatch[1]);
    }

    // Extract clauses
    const clauses = [];
    for (const [type, clauseInfo] of this.clauseLibrary) {
      const regex = new RegExp(clauseInfo.pattern.source, clauseInfo.pattern.flags);
      const matches = text.match(regex);
      if (matches && matches.length > 0) {
        clauseInfo.matchCount++;
        clauses.push({
          type,
          matches: matches.length,
          confidence: Math.min(1.0, matches.length * clauseInfo.weight * 0.3),
          snippets: matches.slice(0, 3)
        });
      }
    }

    // Extract obligations
    const obligationPattern = /\b(?:shall|must|agrees? to|obligat|required to|responsible for|will\s+(?:provide|deliver|ensure|maintain))\b[^.!?]*/gi;
    const obligations = [];
    let oblMatch;
    while ((oblMatch = obligationPattern.exec(text)) !== null) {
      obligations.push({
        text: oblMatch[0].trim().slice(0, 200),
        position: oblMatch.index
      });
    }

    const contract = {
      id: contractId,
      parties: [...parties],
      dates,
      clauses,
      obligations,
      parsedAt: Date.now(),
      text
    };

    this.contracts.set(contractId, contract);
    this.metrics.contractsParsed++;

    return contract;
  }

  /**
   * Verify clauses against requirements.
   * @param {Object[]} clauses - Parsed clauses
   * @param {string[]} requirements - Required clause types
   * @returns {Object} - {met, unmet, partial, complianceScore}
   */
  verifyClauses(clauses, requirements) {
    const clauseTypes = new Set(clauses.map(c => c.type));
    const met = [];
    const unmet = [];
    const partial = [];

    for (const req of requirements) {
      if (clauseTypes.has(req)) {
        const clause = clauses.find(c => c.type === req);
        if (clause.confidence > 0.7) {
          met.push({ requirement: req, confidence: clause.confidence });
        } else {
          partial.push({ requirement: req, confidence: clause.confidence });
        }
      } else {
        unmet.push({ requirement: req });
      }
    }

    const total = requirements.length || 1;
    const complianceScore = (met.length + partial.length * 0.5) / total;

    this.metrics.clausesVerified += requirements.length;

    return { met, unmet, partial, complianceScore };
  }

  /**
   * Register an obligation with deadline and responsible party.
   * @param {string} contractId
   * @param {Object} obligation - {description, deadline, responsibleParty}
   * @returns {Object} - Tracked obligation
   */
  trackObligation(contractId, obligation) {
    const oblId = `obl-${this.metrics.obligationsTracked + 1}`;
    const tracked = {
      id: oblId,
      contractId,
      description: obligation.description,
      deadline: obligation.deadline || null,
      responsibleParty: obligation.responsibleParty || 'unassigned',
      status: 'pending',
      createdAt: Date.now()
    };

    if (!this.obligationTracker.has(contractId)) {
      this.obligationTracker.set(contractId, []);
    }
    this.obligationTracker.get(contractId).push(tracked);
    this.metrics.obligationsTracked++;

    return tracked;
  }

  /**
   * Evaluate compliance for a contract's obligations.
   * urgency = φ^(5 - daysRemaining/7)
   * @param {string} contractId
   * @returns {Object} - {compliant, atRisk, breached, overallCompliance}
   */
  checkCompliance(contractId) {
    const obligations = this.obligationTracker.get(contractId) || [];
    const compliant = [];
    const atRisk = [];
    const breached = [];
    const now = Date.now();

    for (const obl of obligations) {
      if (obl.status === 'fulfilled') {
        compliant.push(obl);
        continue;
      }

      if (!obl.deadline) {
        atRisk.push({ ...obl, urgency: 1.0 });
        continue;
      }

      const deadlineMs = new Date(obl.deadline).getTime();
      const daysRemaining = (deadlineMs - now) / (1000 * 60 * 60 * 24);

      if (daysRemaining < 0) {
        breached.push({ ...obl, urgency: Math.pow(PHI, 5), daysOverdue: Math.abs(daysRemaining) });
      } else {
        const urgency = Math.pow(PHI, 5 - daysRemaining / 7);
        if (urgency > PHI * PHI) {
          atRisk.push({ ...obl, urgency, daysRemaining });
        } else {
          compliant.push({ ...obl, urgency, daysRemaining });
        }
      }
    }

    const total = obligations.length || 1;
    const overallCompliance = compliant.length / total;

    this.metrics.totalComplianceChecks++;
    this.metrics.compliantCount += compliant.length;
    this.metrics.complianceRate = this.metrics.compliantCount / (this.metrics.totalComplianceChecks * total) || 0;

    return { compliant, atRisk, breached, overallCompliance };
  }

  /**
   * Create SHA-256 hash signature of contract content.
   * @param {Object|string} contractData
   * @param {string} signerKey
   * @returns {Object} - {signature, hash, signedAt}
   */
  signContract(contractData, signerKey) {
    const data = typeof contractData === 'string' ? contractData : JSON.stringify(contractData);
    const hash = createHash('sha256').update(data).digest('hex');
    const signature = createHmac('sha256', signerKey).update(hash).digest('hex');

    this.metrics.signaturesCreated++;

    return { signature, hash, signedAt: Date.now() };
  }

  /**
   * Verify contract hasn't been tampered.
   * @param {Object|string} contractData
   * @param {string} signature
   * @param {string} signerKey
   * @returns {Object} - {valid, hash}
   */
  verifySignature(contractData, signature, signerKey) {
    const data = typeof contractData === 'string' ? contractData : JSON.stringify(contractData);
    const hash = createHash('sha256').update(data).digest('hex');
    const expected = createHmac('sha256', signerKey).update(hash).digest('hex');
    return { valid: expected === signature, hash };
  }

  /**
   * Add new pattern to clause library with phi-decay novelty weight.
   * @param {string} clauseText - Example clause text
   * @param {string} clauseType - Clause type category
   */
  learnClausePattern(clauseText, clauseType) {
    const entry = this.clauseLibrary.get(clauseType);
    if (entry) {
      entry.examples.push(clauseText);
      const novelty = Math.pow(PHI, -entry.examples.length);
      entry.weight = entry.weight * (1 - novelty) + novelty;
    } else {
      // Create new clause type
      const words = clauseText.toLowerCase().split(/\W+/).filter(w => w.length > 4);
      const patternStr = words.slice(0, 3).join('|');
      this.clauseLibrary.set(clauseType, {
        type: clauseType,
        pattern: new RegExp(`\\b(?:${patternStr})\\b`, 'gi'),
        weight: Math.pow(PHI, -1),
        examples: [clauseText],
        matchCount: 0
      });
    }
  }

  /**
   * Returns contract verification metrics.
   * @returns {Object}
   */
  getContractMetrics() {
    return {
      contractsParsed: this.metrics.contractsParsed,
      clausesVerified: this.metrics.clausesVerified,
      obligationsTracked: this.metrics.obligationsTracked,
      complianceRate: this.metrics.complianceRate,
      signaturesCreated: this.metrics.signaturesCreated
    };
  }
}

export { SovereignContractVerificationProtocol };
export default SovereignContractVerificationProtocol;
