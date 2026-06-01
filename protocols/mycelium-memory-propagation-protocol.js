/**
 * PROTO-266: Mycelium Memory Propagation Protocol (MMPP)
 * Knowledge encoding, gradient-based signal diffusion, network-level memory, and
 * distributed engram formation.
 *
 * Biological inspiration: mycelial networks transport nutrients and signaling
 * molecules across vast distances via cytoplasmic streaming. Memory in biological
 * systems is not localized — it's distributed across synaptic weights and chemical
 * gradients. This protocol encodes network-level memory that persists, propagates,
 * and strengthens through use.
 *
 * Core Mechanisms:
 *  - Engram formation: memories are encoded as distributed patterns across multiple
 *    nodes, not stored in any single location.
 *  - Gradient diffusion: knowledge signals propagate outward from source nodes along
 *    phi-weighted gradients, weakening with distance but reinforced by repeated access.
 *  - Consolidation: short-term network signals are consolidated into long-term engrams
 *    when access frequency and coherence exceed phi-threshold.
 *  - Recall: engrams are recalled by pattern-matching input signals against distributed
 *    encodings, with recall strength proportional to engram coherence.
 *  - Forgetting curve: unused engrams decay following phi-inverse exponential; only
 *    reinforced memories persist.
 */

const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;
const HEARTBEAT = 873;

export const MEMORY_STATES = {
  IDLE: 'idle',
  ENCODING: 'encoding',
  PROPAGATING: 'propagating',
  CONSOLIDATING: 'consolidating',
  RECALLING: 'recalling',
};

export const MESSAGE_TYPES = {
  ENGRAM_ENCODE: 'mycelium.memory.engram.encode',
  ENGRAM_PROPAGATE: 'mycelium.memory.engram.propagate',
  ENGRAM_CONSOLIDATE: 'mycelium.memory.engram.consolidate',
  ENGRAM_RECALL: 'mycelium.memory.engram.recall',
  ENGRAM_DECAY: 'mycelium.memory.engram.decay',
  GRADIENT_EMIT: 'mycelium.memory.gradient.emit',
};

export const ENGRAM_TYPES = {
  EPISODIC: 'episodic',
  SEMANTIC: 'semantic',
  PROCEDURAL: 'procedural',
  STRUCTURAL: 'structural',
};

/**
 * Calculate gradient diffusion strength at a given hop distance.
 * Signals weaken by phi-inverse per hop but are boosted by local reinforcement.
 */
export function calculateGradientStrength(sourceStrength, hops, reinforcements = 0) {
  const decay = Math.pow(PHI_INV, hops);
  const reinforcementBoost = 1 + Math.log(reinforcements + 1) / Math.log(PHI + 1);
  return Math.min(1, sourceStrength * decay * reinforcementBoost);
}

/**
 * Calculate engram coherence — how well-distributed and consistent an engram encoding is.
 */
export function calculateEngramCoherence(nodeEncodings) {
  if (!nodeEncodings || nodeEncodings.length === 0) return 0;
  const avgStrength = nodeEncodings.reduce((sum, e) => sum + e.strength, 0) / nodeEncodings.length;
  const spreadFactor = Math.min(1, nodeEncodings.length / (PHI * 3));
  const variance = nodeEncodings.reduce((sum, e) => sum + Math.pow(e.strength - avgStrength, 2), 0) / nodeEncodings.length;
  const consistency = 1 / (1 + variance * PHI);
  return avgStrength * spreadFactor * consistency;
}

/**
 * Calculate forgetting curve — engram retention probability over time without reinforcement.
 */
export function calculateRetention(originalStrength, ageMs, lastAccessMs) {
  const timeSinceAccess = ageMs - lastAccessMs;
  const decayCycles = timeSinceAccess / (HEARTBEAT * 10);
  return originalStrength * Math.pow(PHI_INV, decayCycles * 0.15);
}

/**
 * Calculate recall match strength — how well an input pattern matches stored engram.
 */
export function calculateRecallMatch(inputPattern, engramPattern) {
  if (!inputPattern || !engramPattern || inputPattern.length === 0 || engramPattern.length === 0) return 0;
  const inputSet = new Set(inputPattern);
  const engramSet = new Set(engramPattern);
  let overlap = 0;
  for (const item of inputSet) {
    if (engramSet.has(item)) overlap++;
  }
  const union = new Set([...inputSet, ...engramSet]).size;
  return union > 0 ? (overlap / union) * PHI_INV + (overlap / inputSet.size) * (1 - PHI_INV) : 0;
}

export class MyceliumMemoryPropagationProtocol {
  constructor(config = {}) {
    this.config = {
      consolidationThreshold: config.consolidationThreshold ?? PHI_INV,
      maxEngrams: config.maxEngrams ?? 200,
      maxGradients: config.maxGradients ?? 500,
      recallThreshold: config.recallThreshold ?? 0.34,
      ...config,
    };
    this.state = MEMORY_STATES.IDLE;
    this.engrams = [];
    this.gradients = [];
    this.shortTermBuffer = [];
    this.events = [];
  }

  /**
   * Encode a new memory signal into short-term buffer for later consolidation.
   */
  encode(nodeId, content = {}) {
    this.state = MEMORY_STATES.ENCODING;
    const encoding = {
      id: `enc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      sourceNode: nodeId,
      type: content.type || ENGRAM_TYPES.EPISODIC,
      pattern: content.pattern || [],
      strength: Math.max(0, Math.min(1, content.strength ?? 0.7)),
      domain: content.domain || 'general',
      encodedAt: Date.now(),
      accessCount: 0,
      lastAccessAt: Date.now(),
    };
    this.shortTermBuffer.push(encoding);
    this._event(MESSAGE_TYPES.ENGRAM_ENCODE, { encodingId: encoding.id, nodeId, type: encoding.type });
    this.state = MEMORY_STATES.IDLE;
    return encoding;
  }

  /**
   * Propagate a memory signal outward from source node along network gradient.
   */
  propagate(encodingId, targetNodes = [], hops = 1) {
    const encoding = this.shortTermBuffer.find(e => e.id === encodingId)
      || this.engrams.find(e => e.id === encodingId);
    if (!encoding) return null;

    this.state = MEMORY_STATES.PROPAGATING;
    const propagations = [];

    for (const nodeId of targetNodes) {
      const strength = calculateGradientStrength(encoding.strength, hops, encoding.accessCount);
      const gradient = {
        id: `grad-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        sourceEngramId: encoding.id,
        targetNode: nodeId,
        strength,
        hops,
        propagatedAt: Date.now(),
      };
      this.gradients.push(gradient);
      propagations.push(gradient);
    }

    if (this.gradients.length > this.config.maxGradients) {
      this.gradients = this.gradients.slice(-this.config.maxGradients);
    }

    this._event(MESSAGE_TYPES.ENGRAM_PROPAGATE, { encodingId, targetCount: targetNodes.length, hops });
    this.state = MEMORY_STATES.IDLE;
    return { encoding, propagations };
  }

  /**
   * Consolidate short-term encodings into long-term engrams when coherence is sufficient.
   */
  consolidate() {
    this.state = MEMORY_STATES.CONSOLIDATING;
    const consolidated = [];

    for (const encoding of this.shortTermBuffer) {
      const nodeEncodings = this.gradients
        .filter(g => g.sourceEngramId === encoding.id)
        .map(g => ({ strength: g.strength }));
      nodeEncodings.push({ strength: encoding.strength });

      const coherence = calculateEngramCoherence(nodeEncodings);

      if (coherence >= this.config.consolidationThreshold) {
        const engram = {
          ...encoding,
          coherence,
          consolidatedAt: Date.now(),
          distributionCount: nodeEncodings.length,
        };
        this.engrams.push(engram);
        consolidated.push(engram);
        this._event(MESSAGE_TYPES.ENGRAM_CONSOLIDATE, { engramId: engram.id, coherence, distributionCount: engram.distributionCount });
      }
    }

    // Remove consolidated encodings from buffer
    const consolidatedIds = new Set(consolidated.map(e => e.id));
    this.shortTermBuffer = this.shortTermBuffer.filter(e => !consolidatedIds.has(e.id));

    // Enforce max engrams
    if (this.engrams.length > this.config.maxEngrams) {
      this.engrams.sort((a, b) => {
        const retA = calculateRetention(a.strength, Date.now() - a.encodedAt, a.lastAccessAt - a.encodedAt);
        const retB = calculateRetention(b.strength, Date.now() - b.encodedAt, b.lastAccessAt - b.encodedAt);
        return retB - retA;
      });
      this.engrams = this.engrams.slice(0, this.config.maxEngrams);
    }

    this.state = MEMORY_STATES.IDLE;
    return { consolidated, count: consolidated.length };
  }

  /**
   * Recall engrams matching an input pattern.
   */
  recall(inputPattern = [], domain = null) {
    this.state = MEMORY_STATES.RECALLING;
    const results = [];

    for (const engram of this.engrams) {
      if (domain && engram.domain !== domain) continue;
      const matchStrength = calculateRecallMatch(inputPattern, engram.pattern);
      const retention = calculateRetention(engram.strength, Date.now() - engram.encodedAt, engram.lastAccessAt - engram.encodedAt);
      const recallScore = matchStrength * retention * (engram.coherence ?? 1);

      if (recallScore >= this.config.recallThreshold) {
        engram.accessCount++;
        engram.lastAccessAt = Date.now();
        results.push({ engram, matchStrength, retention, recallScore });
      }
    }

    results.sort((a, b) => b.recallScore - a.recallScore);
    this._event(MESSAGE_TYPES.ENGRAM_RECALL, { inputPattern, resultCount: results.length, topScore: results[0]?.recallScore ?? 0 });
    this.state = MEMORY_STATES.IDLE;
    return results;
  }

  /**
   * Heartbeat tick: apply forgetting curve and prune weak engrams.
   */
  tick() {
    const decayed = [];
    for (const engram of this.engrams) {
      const retention = calculateRetention(engram.strength, Date.now() - engram.encodedAt, engram.lastAccessAt - engram.encodedAt);
      if (retention < 0.05) {
        decayed.push(engram.id);
      }
    }
    if (decayed.length > 0) {
      this.engrams = this.engrams.filter(e => !decayed.includes(e.id));
      this._event(MESSAGE_TYPES.ENGRAM_DECAY, { decayedCount: decayed.length, decayedIds: decayed });
    }
  }

  getMetrics() {
    return {
      state: this.state,
      engramCount: this.engrams.length,
      shortTermCount: this.shortTermBuffer.length,
      gradientCount: this.gradients.length,
      averageCoherence: this.engrams.length
        ? this.engrams.reduce((sum, e) => sum + (e.coherence ?? 0), 0) / this.engrams.length
        : 0,
      eventCount: this.events.length,
    };
  }

  _event(type, payload) {
    this.events.push({ at: Date.now(), type, payload });
    if (this.events.length > 1000) this.events.shift();
  }
}

export default MyceliumMemoryPropagationProtocol;
