/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  PROTO-247: Sovereignty Mesh Protocol                                     ║
 * ║  Cross-chain interoperability, bridge management, identity portability    ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * Governs how sovereign entities communicate across chains and realms
 * without sacrificing autonomy or security.
 *
 * @module protocols/sovereignty-mesh-protocol
 * @version 1.0.0
 */

const PHI = 1.618033988749895;
const HEARTBEAT = 873;

// ─── Protocol States ─────────────────────────────────────────────────────────
export const MESH_PROTOCOL_STATES = {
  IDLE: 'idle',
  BRIDGING: 'bridging',
  ROUTING: 'routing',
  VERIFYING: 'verifying',
  FINALIZED: 'finalized',
  ERROR: 'error'
};

// ─── Bridge Health Levels ────────────────────────────────────────────────────
export const BRIDGE_HEALTH = {
  OPTIMAL: { score: 1.0, label: 'Optimal' },
  DEGRADED: { score: 0.7, label: 'Degraded' },
  STRAINED: { score: 0.4, label: 'Strained' },
  CRITICAL: { score: 0.1, label: 'Critical' },
  OFFLINE: { score: 0.0, label: 'Offline' }
};

// ─── Configuration ───────────────────────────────────────────────────────────
export const MESH_CONFIG = {
  maxBridges: 50,
  maxHops: 5,
  relayTimeout: 30000,
  heartbeatInterval: HEARTBEAT,
  trustDecay: 1 / PHI,
  minTrustThreshold: 0.3,
  proofVerificationTimeout: 5000
};

// ─── Message Types ───────────────────────────────────────────────────────────
export const MESSAGE_TYPES = {
  BRIDGE_CREATE: 'mesh.bridge.create',
  BRIDGE_ACTIVATE: 'mesh.bridge.activate',
  BRIDGE_DEACTIVATE: 'mesh.bridge.deactivate',
  RELAY_SEND: 'mesh.relay.send',
  RELAY_RECEIVE: 'mesh.relay.receive',
  IDENTITY_PORT: 'mesh.identity.port',
  IDENTITY_VERIFY: 'mesh.identity.verify',
  PROOF_SUBMIT: 'mesh.proof.submit',
  PROOF_VERIFY: 'mesh.proof.verify',
  STATUS: 'mesh.status'
};

/**
 * Calculate route priority across the mesh (φ-weighted shortest path)
 */
export function calculateRoutePriority(hops, latency, trustScore) {
  const hopPenalty = Math.pow(PHI, hops);
  const latencyFactor = 1 / (latency / HEARTBEAT + 1);
  return (trustScore * latencyFactor) / hopPenalty;
}

/**
 * Calculate bridge trust decay over time
 */
export function calculateTrustDecay(currentTrust, timeSinceLastRelay, successRate) {
  const decay = (timeSinceLastRelay / 60000) * MESH_CONFIG.trustDecay * 0.01;
  const restored = successRate * (1 - 1 / PHI) * 0.1;
  return Math.max(0, Math.min(1.0, currentTrust - decay + restored));
}

/**
 * SovereigntyMeshProtocol — Main protocol class
 */
export class SovereigntyMeshProtocol {
  constructor(config = {}) {
    this.config = { ...MESH_CONFIG, ...config };
    this.state = MESH_PROTOCOL_STATES.IDLE;
    this.stats = { bridged: 0, relayed: 0, identitiesPorted: 0, proofsVerified: 0, errors: 0 };
  }

  getStatus() {
    return { state: this.state, stats: this.stats, config: this.config };
  }
}
