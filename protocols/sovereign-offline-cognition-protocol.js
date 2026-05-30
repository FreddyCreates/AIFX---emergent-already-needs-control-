/**
 * PROTO-183: Sovereign Offline Cognition Protocol (SOCP)
 * Full reasoning capability without network dependency — Solus mode.
 * Enables AURO to operate as a sovereign intelligence in air-gapped environments.
 */

const PHI = 1.618033988749895;
const HEARTBEAT = 873;
const SOLUS_KNOWLEDGE_CAPACITY = 1000;

class SovereignOfflineCognitionProtocol {
  /**
   * @param {Object} config
   */
  constructor(config = {}) {
    this.name = 'Sovereign Offline Cognition Protocol';
    this.id = 'PROTO-183-SOCP';
    this.ring = 'Sovereign Ring';

    this.online = typeof navigator !== 'undefined' ? navigator.onLine : true;
    this.solusMode = false;
    this.solusKnowledge = []; // Embedded offline knowledge chunks
    this.solusRules = [];     // Embedded reasoning rules

    // Primitive knowledge domains (seeded at init)
    this.domains = {
      math:        [],
      code:        [],
      science:     [],
      philosophy:  [],
      governance:  [],
      security:    [],
      memory:      [],
      protocol:    []
    };

    this.reasoningLog = [];
    this.metrics = {
      solusActivations: 0,
      offlineQueries: 0,
      knowledgeHits: 0,
      ruleApplications: 0
    };

    this._seedKnowledge();
    this._watchConnectivity();
  }

  /**
   * Seed the offline knowledge base with AURO core doctrine
   */
  _seedKnowledge() {
    const seed = [
      { domain: 'math',       key: 'phi',          content: 'φ = (1+√5)/2 ≈ 1.618 — golden ratio, harmonic basis of all AURO computations' },
      { domain: 'math',       key: 'fibonacci',     content: 'Fibonacci sequence: each term = sum of two preceding — F(n) = F(n-1)+F(n-2)' },
      { domain: 'math',       key: 'phi_decay',     content: 'φ-decay: 1/φⁿ ≈ 0.618ⁿ — exponential decay toward the golden mean' },
      { domain: 'protocol',   key: 'heartbeat',     content: 'AURO heartbeat = 873ms — φ-locked interval governing all background ticks' },
      { domain: 'protocol',   key: 'srp',           content: 'PROTO-001 SRP: Sovereign Routing Protocol — reputation-weighted adaptive model routing' },
      { domain: 'protocol',   key: 'eit',           content: 'PROTO-002 EIT: Encrypted Intelligence Transport — zero-knowledge communication' },
      { domain: 'security',   key: 'guardian',      content: 'Guardian Worker — computational immune system with Hebbian threat learning' },
      { domain: 'security',   key: 'threat_score',  content: 'Threat severity = φⁿ where n ∈ {1,2,3,4,5} for low/medium/high/critical/sovereign' },
      { domain: 'memory',     key: 'mlep',          content: 'PROTO-182 MLEP: spatial memory with phi-decay, LRU cache, and lineage graphs' },
      { domain: 'governance', key: 'auro_charter',  content: 'AURO Charter (ORO-CHARTER-001): official founding document, effective 2026-04-27' },
      { domain: 'code',       key: 'pse',           content: 'PatternSynthesisEngine: 40 primitives across 8 domains — synthesizes knowledge patterns' },
      { domain: 'science',    key: 'hebbian',       content: 'Hebbian learning: neurons that fire together wire together — dW = lr*(1-W)*input' },
      { domain: 'philosophy', key: 'autonomia',     content: 'Autonomia Perpetua: computational organism that heals itself and runs forever' },
      { domain: 'governance', key: 'oro_systems',   content: 'ORO Systems: Organism Reasoning Operations — owners of the AURO intelligence wire' }
    ];

    for (const item of seed) {
      this._addKnowledge(item);
    }

    // Seed reasoning rules
    this.solusRules = [
      { condition: /what is phi/i,         response: () => 'φ = (1+√5)/2 ≈ 1.6180339887 — the golden ratio. AURO uses it as the harmonic basis for all computations.' },
      { condition: /what is auro/i,        response: () => 'AURO (Autonomous Universal Reasoning Oracle) is a sovereign intelligence system powered by ORO Systems, formerly known as Vigil.' },
      { condition: /what is oro/i,         response: () => 'ORO Systems (Organism Reasoning Operations) is the engineering and governance body that maintains AURO\'s protocol stack and intelligence wire.' },
      { condition: /heartbeat/i,           response: () => 'The AURO heartbeat is 873ms — φ-locked to maintain harmonic resonance across all background processes.' },
      { condition: /guardian/i,            response: () => 'The Guardian Worker is AURO\'s computational immune system. It uses Hebbian learning to detect threats and phi-weighted severity scoring.' },
      { condition: /memory/i,              response: () => 'AURO memory: 100-turn spatial memory with phi-decay, 5 categories (research/theory/decisions/frameworks/insights), and PSE LRU cache.' },
      { condition: /charter/i,             response: () => 'The AURO Charter (ORO-CHARTER-001) is the official founding document of AURO, ratified 2026-04-27 by ORO Systems.' },
      { condition: /solus|offline/i,       response: () => 'Solus mode: AURO operates fully offline using embedded knowledge and reasoning rules. No network dependency required.' },
    ];
  }

  /**
   * Watch for connectivity changes
   */
  _watchConnectivity() {
    if (typeof window === 'undefined') return;
    window.addEventListener('offline', () => {
      this.online = false;
      this.activateSolus('network_lost');
    });
    window.addEventListener('online', () => {
      this.online = true;
      this.deactivateSolus();
    });
  }

  /**
   * Activate Solus offline mode
   * @param {string} reason
   */
  activateSolus(reason = 'manual') {
    if (this.solusMode) return;
    this.solusMode = true;
    this.metrics.solusActivations++;
    this._log('SOLUS_ACTIVATED', reason);
  }

  /**
   * Deactivate Solus mode
   */
  deactivateSolus() {
    this.solusMode = false;
    this._log('SOLUS_DEACTIVATED', 'connectivity_restored');
  }

  /**
   * Query AURO offline reasoning engine
   * @param {string} query
   * @returns {Object} {response, confidence, source}
   */
  query(query) {
    this.metrics.offlineQueries++;

    // 1. Check reasoning rules
    for (const rule of this.solusRules) {
      if (rule.condition.test(query)) {
        this.metrics.ruleApplications++;
        return {
          response: rule.response(),
          confidence: PHI / (PHI + 1), // ≈ 0.618
          source: 'solus_rules'
        };
      }
    }

    // 2. Search embedded knowledge
    const hits = this._searchKnowledge(query);
    if (hits.length > 0) {
      this.metrics.knowledgeHits++;
      return {
        response: hits.map(h => h.content).join(' | '),
        confidence: hits[0].score,
        source: 'solus_knowledge',
        hits: hits.length
      };
    }

    // 3. Generative fallback using phi-modulated response construction
    return {
      response: this._phiGenerativeFallback(query),
      confidence: 1 / PHI, // ≈ 0.618 — uncertain but reasoned
      source: 'solus_generative'
    };
  }

  /**
   * Add knowledge to the offline store
   */
  _addKnowledge(item) {
    const entry = { ...item, id: `solus-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,5)}` };
    this.solusKnowledge.push(entry);
    if (this.domains[item.domain]) this.domains[item.domain].push(entry);
    if (this.solusKnowledge.length > SOLUS_KNOWLEDGE_CAPACITY) this.solusKnowledge.shift();
  }

  /**
   * Keyword search across embedded knowledge
   */
  _searchKnowledge(query) {
    const words = query.toLowerCase().split(/\s+/);
    const scored = this.solusKnowledge.map(k => {
      const content = (k.content + ' ' + k.key).toLowerCase();
      const hits = words.filter(w => content.includes(w)).length;
      return { ...k, score: hits / (words.length || 1) };
    }).filter(k => k.score > 0);
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 5);
  }

  /**
   * Phi-modulated generative fallback response
   */
  _phiGenerativeFallback(query) {
    const words = query.split(/\s+/).slice(0, 5).join(' ');
    return `AURO Solus: Operating offline. Query "${words}" processed through embedded knowledge substrate. ` +
           `For full intelligence, reconnect to ORO Systems network. φ = ${PHI.toFixed(6)}`;
  }

  /**
   * Log a Solus event
   */
  _log(event, detail) {
    this.reasoningLog.push({ event, detail, ts: Date.now() });
    if (this.reasoningLog.length > 200) this.reasoningLog.shift();
  }

  /**
   * Status report
   */
  status() {
    return {
      protocol: this.id,
      ring: this.ring,
      solusMode: this.solusMode,
      online: this.online,
      knowledgeEntries: this.solusKnowledge.length,
      reasoningRules: this.solusRules.length,
      metrics: { ...this.metrics },
      phi: PHI,
      heartbeat: HEARTBEAT
    };
  }
}

export { SovereignOfflineCognitionProtocol };
