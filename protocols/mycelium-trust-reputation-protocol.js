/**
 * PROTO-261: Mycelium Trust Reputation Protocol (MTRP)
 * Trust decay/recovery and proof-driven reputation accounting.
 */

const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;

export const TRUST_STATES = {
  GREEN: 'green',
  AMBER: 'amber',
  RED: 'red',
};

export const MESSAGE_TYPES = {
  PROOF_TRUST: 'mycelium.trust.proof',
  TRUST_DECAY: 'mycelium.trust.decay',
  TRUST_RECOVERY: 'mycelium.trust.recovery',
  TRUST_BAND_CHANGE: 'mycelium.trust.band.change',
};

export function decayTrust(currentTrust, loadFactor = 0, violations = 0) {
  const pressure = 1 + loadFactor * PHI + violations;
  return Math.max(0, currentTrust * Math.pow(PHI_INV, pressure * 0.2));
}

export function recoverTrust(currentTrust, proofStrength = 1, heartbeatStability = 1) {
  const lift = (Math.max(0, Math.min(1, proofStrength)) * 0.2) + (Math.max(0, Math.min(1, heartbeatStability)) * 0.1);
  return Math.max(0, Math.min(1, currentTrust + lift));
}

export class MyceliumTrustReputationProtocol {
  constructor() {
    this.trust = new Map();
    this.history = [];
  }

  initNode(nodeId, initialTrust = PHI_INV) {
    this.trust.set(nodeId, Math.max(0, Math.min(1, initialTrust)));
    return this.getTrust(nodeId);
  }

  recordProof(nodeId, proof = {}) {
    if (!this.trust.has(nodeId)) this.initNode(nodeId);
    const current = this.trust.get(nodeId);
    const next = proof.valid === false
      ? decayTrust(current, proof.loadFactor ?? 0, proof.violations ?? 1)
      : recoverTrust(current, proof.weight ?? 1, proof.stability ?? 1);
    this.trust.set(nodeId, next);

    this._record(proof.valid === false ? MESSAGE_TYPES.TRUST_DECAY : MESSAGE_TYPES.PROOF_TRUST, {
      nodeId,
      previous: current,
      next,
      proof,
    });

    return { nodeId, trust: next, band: this.getBand(next) };
  }

  tickHeartbeat(nodeHealth = {}) {
    for (const [nodeId, trust] of this.trust.entries()) {
      const health = nodeHealth[nodeId] ?? 1;
      const next = health >= PHI_INV ? recoverTrust(trust, 0.4, health) : decayTrust(trust, 1 - health, 0);
      this.trust.set(nodeId, next);
      this._record(next >= trust ? MESSAGE_TYPES.TRUST_RECOVERY : MESSAGE_TYPES.TRUST_DECAY, {
        nodeId,
        previous: trust,
        next,
        health,
      });
    }
  }

  getBand(value) {
    if (value >= PHI_INV) return TRUST_STATES.GREEN;
    if (value >= 0.34) return TRUST_STATES.AMBER;
    return TRUST_STATES.RED;
  }

  getTrust(nodeId) {
    const trust = this.trust.get(nodeId) ?? 0;
    return { nodeId, trust, band: this.getBand(trust) };
  }

  getMetrics() {
    const values = [...this.trust.values()];
    return {
      nodeCount: values.length,
      averageTrust: values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0,
      redBandCount: values.filter(v => this.getBand(v) === TRUST_STATES.RED).length,
      historyCount: this.history.length,
    };
  }

  _record(type, payload) {
    this.history.push({ at: Date.now(), type, payload });
    if (this.history.length > 1500) this.history.shift();
  }
}

export default MyceliumTrustReputationProtocol;
