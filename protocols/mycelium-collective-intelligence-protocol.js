/**
 * PROTO-265: Mycelium Collective Intelligence Protocol (MCIP)
 * Quorum sensing, distributed cognition, emergent consensus, and hive-mind coordination.
 *
 * Biological inspiration: fungal networks achieve collective problem-solving without
 * central control through chemical gradient signaling (quorum sensing), nutrient
 * redistribution, and adaptive resource allocation. This protocol encodes those
 * principles into sovereign multi-node intelligence.
 *
 * Core Mechanisms:
 *  - Quorum sensing: nodes emit cognitive signals; when local density crosses phi-threshold,
 *    emergent behaviors activate (decisions, resource shifts, topology changes).
 *  - Distributed cognition: partial knowledge fragments propagate and fuse across nodes,
 *    producing network-wide insights no single node could derive alone.
 *  - Emergent consensus: phi-weighted voting without a coordinator; consensus crystallizes
 *    when collective signal reaches harmonic convergence.
 *  - Stigmergy: nodes leave cognitive traces in shared substrate; future routing and
 *    decisions are shaped by accumulated trace intensity.
 */

const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;
const HEARTBEAT = 873;

export const COLLECTIVE_STATES = {
  DORMANT: 'dormant',
  SENSING: 'sensing',
  QUORUM_REACHED: 'quorum_reached',
  DELIBERATING: 'deliberating',
  CONSENSUS: 'consensus',
  DIVERGENT: 'divergent',
};

export const MESSAGE_TYPES = {
  SIGNAL_EMIT: 'mycelium.collective.signal.emit',
  QUORUM_TRIGGER: 'mycelium.collective.quorum.trigger',
  COGNITION_FUSE: 'mycelium.collective.cognition.fuse',
  CONSENSUS_CRYSTAL: 'mycelium.collective.consensus.crystal',
  STIGMERGY_TRACE: 'mycelium.collective.stigmergy.trace',
  DIVERGENCE_DETECT: 'mycelium.collective.divergence.detect',
};

export const SIGNAL_TYPES = {
  ATTENTION: 'attention',
  ALARM: 'alarm',
  RESOURCE: 'resource',
  KNOWLEDGE: 'knowledge',
  VOTE: 'vote',
};

/**
 * Calculate quorum density from local signal concentration.
 * When density >= PHI_INV, quorum is reached.
 */
export function calculateQuorumDensity(signalCount, nodeCount, signalStrength = 1) {
  if (nodeCount <= 0) return 0;
  const rawDensity = (signalCount / nodeCount) * Math.max(0, Math.min(1, signalStrength));
  return Math.min(1, rawDensity * PHI);
}

/**
 * Calculate cognitive fusion score — how well partial knowledge fragments combine.
 * High coherence + high coverage = strong fusion.
 */
export function calculateFusionScore(fragments) {
  if (!fragments || fragments.length === 0) return 0;
  const coherence = fragments.reduce((sum, f) => sum + (f.coherence ?? 0.5), 0) / fragments.length;
  const coverage = Math.min(1, fragments.length / (PHI * 5));
  const diversity = new Set(fragments.map(f => f.source)).size / Math.max(1, fragments.length);
  return coherence * coverage * diversity * PHI;
}

/**
 * Calculate stigmergy trace intensity decay over time.
 * Traces decay at phi-inverse rate per heartbeat cycle.
 */
export function calculateTraceDecay(intensity, ageMs) {
  const cycles = ageMs / HEARTBEAT;
  return intensity * Math.pow(PHI_INV, cycles * 0.1);
}

/**
 * Calculate consensus convergence — how close votes are to crystallizing agreement.
 */
export function calculateConsensusConvergence(votes) {
  if (!votes || votes.length === 0) return 0;
  const total = votes.reduce((sum, v) => sum + v.weight, 0);
  if (total === 0) return 0;
  const tally = new Map();
  for (const v of votes) {
    tally.set(v.position, (tally.get(v.position) || 0) + v.weight);
  }
  const maxWeight = Math.max(...tally.values());
  return maxWeight / total;
}

export class MyceliumCollectiveIntelligenceProtocol {
  constructor(config = {}) {
    this.config = {
      quorumThreshold: config.quorumThreshold ?? PHI_INV,
      consensusThreshold: config.consensusThreshold ?? PHI_INV,
      maxSignalAge: config.maxSignalAge ?? HEARTBEAT * 20,
      traceRetention: config.traceRetention ?? 500,
      ...config,
    };
    this.state = COLLECTIVE_STATES.DORMANT;
    this.signals = [];
    this.traces = [];
    this.fragments = [];
    this.votes = [];
    this.decisions = [];
    this.events = [];
  }

  /**
   * Emit a cognitive signal into the collective substrate.
   */
  emitSignal(nodeId, signalType, payload = {}) {
    const signal = {
      id: `sig-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      nodeId,
      type: signalType,
      strength: Math.max(0, Math.min(1, payload.strength ?? 0.7)),
      payload,
      emittedAt: Date.now(),
    };
    this.signals.push(signal);
    this._pruneSignals();

    const density = this._calculateCurrentDensity(signalType);
    if (density >= this.config.quorumThreshold && this.state !== COLLECTIVE_STATES.QUORUM_REACHED) {
      this.state = COLLECTIVE_STATES.QUORUM_REACHED;
      this._event(MESSAGE_TYPES.QUORUM_TRIGGER, { signalType, density, signalCount: this.signals.length });
    } else if (this.state === COLLECTIVE_STATES.DORMANT) {
      this.state = COLLECTIVE_STATES.SENSING;
    }

    this._event(MESSAGE_TYPES.SIGNAL_EMIT, { signalId: signal.id, nodeId, signalType, density });
    return { signal, density, quorumReached: density >= this.config.quorumThreshold };
  }

  /**
   * Contribute a knowledge fragment for distributed cognition fusion.
   */
  contributeFragment(nodeId, fragment = {}) {
    const record = {
      id: `frag-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      source: nodeId,
      domain: fragment.domain || 'general',
      coherence: Math.max(0, Math.min(1, fragment.coherence ?? 0.6)),
      content: fragment.content || null,
      contributedAt: Date.now(),
    };
    this.fragments.push(record);
    return record;
  }

  /**
   * Fuse all contributed fragments into a collective insight.
   */
  fuseKnowledge() {
    const score = calculateFusionScore(this.fragments);
    const fused = score >= PHI_INV;
    const insight = fused ? {
      id: `insight-${Date.now().toString(36)}`,
      fusionScore: score,
      fragmentCount: this.fragments.length,
      domains: [...new Set(this.fragments.map(f => f.domain))],
      sources: [...new Set(this.fragments.map(f => f.source))],
      fusedAt: Date.now(),
    } : null;

    if (fused) {
      this.state = COLLECTIVE_STATES.DELIBERATING;
      this._event(MESSAGE_TYPES.COGNITION_FUSE, insight);
      this.fragments = [];
    }

    return { fused, score, insight };
  }

  /**
   * Cast a weighted vote toward consensus.
   */
  castVote(nodeId, position, weight = 1, trust = 1) {
    const adjustedWeight = weight * Math.max(0, Math.min(1, trust));
    const vote = {
      nodeId,
      position,
      weight: adjustedWeight,
      castedAt: Date.now(),
    };
    this.votes.push(vote);

    const convergence = calculateConsensusConvergence(this.votes);
    if (convergence >= this.config.consensusThreshold) {
      return this._crystallizeConsensus(convergence);
    }

    return { convergence, consensus: false, vote };
  }

  /**
   * Deposit a stigmergic trace into shared substrate memory.
   */
  depositTrace(nodeId, location, intensity = 1, metadata = {}) {
    const trace = {
      id: `trace-${Date.now().toString(36)}`,
      nodeId,
      location,
      intensity: Math.max(0, Math.min(1, intensity)),
      metadata,
      depositedAt: Date.now(),
    };
    this.traces.push(trace);
    if (this.traces.length > this.config.traceRetention) this.traces.shift();
    this._event(MESSAGE_TYPES.STIGMERGY_TRACE, { traceId: trace.id, nodeId, location, intensity: trace.intensity });
    return trace;
  }

  /**
   * Read accumulated trace intensity at a location (with decay).
   */
  readTraceAt(location) {
    const now = Date.now();
    let totalIntensity = 0;
    let count = 0;
    for (const trace of this.traces) {
      if (trace.location === location) {
        totalIntensity += calculateTraceDecay(trace.intensity, now - trace.depositedAt);
        count++;
      }
    }
    return { location, intensity: totalIntensity, traceCount: count };
  }

  /**
   * Heartbeat tick: decay signals, update state.
   */
  tick() {
    this._pruneSignals();
    if (this.signals.length === 0 && this.state === COLLECTIVE_STATES.SENSING) {
      this.state = COLLECTIVE_STATES.DORMANT;
    }
  }

  getMetrics() {
    return {
      state: this.state,
      activeSignals: this.signals.length,
      pendingFragments: this.fragments.length,
      pendingVotes: this.votes.length,
      traceCount: this.traces.length,
      decisionsCount: this.decisions.length,
      eventCount: this.events.length,
    };
  }

  _crystallizeConsensus(convergence) {
    const tally = new Map();
    for (const v of this.votes) {
      tally.set(v.position, (tally.get(v.position) || 0) + v.weight);
    }
    let winningPosition = null;
    let maxWeight = 0;
    for (const [pos, w] of tally.entries()) {
      if (w > maxWeight) { winningPosition = pos; maxWeight = w; }
    }

    const decision = {
      id: `decision-${Date.now().toString(36)}`,
      position: winningPosition,
      convergence,
      voterCount: this.votes.length,
      totalWeight: [...tally.values()].reduce((a, b) => a + b, 0),
      decidedAt: Date.now(),
    };
    this.decisions.push(decision);
    this.votes = [];
    this.state = COLLECTIVE_STATES.CONSENSUS;
    this._event(MESSAGE_TYPES.CONSENSUS_CRYSTAL, decision);
    return { convergence, consensus: true, decision };
  }

  _calculateCurrentDensity(signalType) {
    const relevantSignals = this.signals.filter(s => s.type === signalType);
    const uniqueNodes = new Set(this.signals.map(s => s.nodeId)).size;
    const avgStrength = relevantSignals.length > 0
      ? relevantSignals.reduce((sum, s) => sum + s.strength, 0) / relevantSignals.length
      : 0;
    return calculateQuorumDensity(relevantSignals.length, Math.max(1, uniqueNodes), avgStrength);
  }

  _pruneSignals() {
    const cutoff = Date.now() - this.config.maxSignalAge;
    this.signals = this.signals.filter(s => s.emittedAt > cutoff);
  }

  _event(type, payload) {
    this.events.push({ at: Date.now(), type, payload });
    if (this.events.length > 1000) this.events.shift();
  }
}

export default MyceliumCollectiveIntelligenceProtocol;
