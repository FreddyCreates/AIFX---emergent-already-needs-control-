/**
 * PROTO-258: Mycelium Node Identity Protocol (MNIP)
 * Admission, attestation, rights, and lifecycle identity controls.
 */

const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;
const HEARTBEAT = 873;

export const IDENTITY_STATES = {
  PENDING: 'pending',
  ACTIVE: 'active',
  QUARANTINED: 'quarantined',
  REVOKED: 'revoked',
};

export const MESSAGE_TYPES = {
  ADMISSION_REQUEST: 'mycelium.identity.admission.request',
  ADMISSION_DECISION: 'mycelium.identity.admission.decision',
  HEARTBEAT_ATTEST: 'mycelium.identity.heartbeat.attest',
  RIGHTS_ASSERT: 'mycelium.identity.rights.assert',
  QUARANTINE: 'mycelium.identity.quarantine',
  REVOKE: 'mycelium.identity.revoke',
};

export function calculateIdentityTrust(baseTrust, attestationScore, heartbeatDriftMs) {
  const attest = Math.max(0, Math.min(1, attestationScore));
  const driftPenalty = Math.pow(PHI_INV, Math.max(0, heartbeatDriftMs) / HEARTBEAT);
  return Math.max(0, Math.min(1, baseTrust * 0.5 + attest * 0.5)) * driftPenalty;
}

export class MyceliumNodeIdentityProtocol {
  constructor(config = {}) {
    this.config = {
      minTrustForVoting: PHI_INV,
      maxHeartbeatDriftMs: HEARTBEAT,
      ...config,
    };
    this.identities = new Map();
    this.events = [];
  }

  admitNode(nodeId, metadata = {}) {
    const record = {
      nodeId,
      state: IDENTITY_STATES.PENDING,
      trust: 0,
      rights: metadata.rights || ['observe'],
      region: metadata.region || 'global',
      substrate: metadata.substrate || 'web',
      admittedAt: Date.now(),
      lastHeartbeatAt: null,
      heartbeatDriftMs: 0,
      attestationScore: 0,
    };
    this.identities.set(nodeId, record);
    this._event(MESSAGE_TYPES.ADMISSION_REQUEST, { nodeId, metadata });
    return record;
  }

  activateNode(nodeId, attestation = 1, stake = 0) {
    const record = this.identities.get(nodeId);
    if (!record) return null;
    record.state = IDENTITY_STATES.ACTIVE;
    record.attestationScore = Math.max(0, Math.min(1, attestation));
    const baseTrust = Math.max(0.2, Math.min(1, 0.4 + Math.log(stake + 1) / 10));
    record.trust = calculateIdentityTrust(baseTrust, record.attestationScore, record.heartbeatDriftMs);
    this._event(MESSAGE_TYPES.ADMISSION_DECISION, { nodeId, accepted: true, trust: record.trust });
    return record;
  }

  attestHeartbeat(nodeId, observedIntervalMs) {
    const record = this.identities.get(nodeId);
    if (!record || record.state !== IDENTITY_STATES.ACTIVE) return null;
    const drift = Math.abs(observedIntervalMs - HEARTBEAT);
    record.heartbeatDriftMs = drift;
    record.lastHeartbeatAt = Date.now();
    record.trust = calculateIdentityTrust(record.trust, record.attestationScore, drift);
    if (drift > this.config.maxHeartbeatDriftMs) {
      record.state = IDENTITY_STATES.QUARANTINED;
      this._event(MESSAGE_TYPES.QUARANTINE, { nodeId, reason: 'heartbeat_drift', drift });
    }
    this._event(MESSAGE_TYPES.HEARTBEAT_ATTEST, { nodeId, drift, trust: record.trust });
    return record;
  }

  quarantineNode(nodeId, reason = 'policy') {
    const record = this.identities.get(nodeId);
    if (!record) return null;
    record.state = IDENTITY_STATES.QUARANTINED;
    this._event(MESSAGE_TYPES.QUARANTINE, { nodeId, reason });
    return record;
  }

  revokeNode(nodeId, reason = 'charter_violation') {
    const record = this.identities.get(nodeId);
    if (!record) return null;
    record.state = IDENTITY_STATES.REVOKED;
    record.trust = 0;
    this._event(MESSAGE_TYPES.REVOKE, { nodeId, reason });
    return record;
  }

  canVote(nodeId) {
    const record = this.identities.get(nodeId);
    if (!record) return false;
    return record.state === IDENTITY_STATES.ACTIVE && record.trust >= this.config.minTrustForVoting;
  }

  getIdentity(nodeId) {
    return this.identities.get(nodeId) || null;
  }

  listActive() {
    return [...this.identities.values()].filter(v => v.state === IDENTITY_STATES.ACTIVE);
  }

  getMetrics() {
    const values = [...this.identities.values()];
    const active = values.filter(v => v.state === IDENTITY_STATES.ACTIVE);
    const avgTrust = active.length ? active.reduce((a, b) => a + b.trust, 0) / active.length : 0;
    return {
      totalNodes: values.length,
      activeNodes: active.length,
      quarantinedNodes: values.filter(v => v.state === IDENTITY_STATES.QUARANTINED).length,
      revokedNodes: values.filter(v => v.state === IDENTITY_STATES.REVOKED).length,
      averageTrust: avgTrust,
      eventCount: this.events.length,
    };
  }

  _event(type, payload) {
    this.events.push({ at: Date.now(), type, payload });
    if (this.events.length > 1000) this.events.shift();
  }
}

export default MyceliumNodeIdentityProtocol;
