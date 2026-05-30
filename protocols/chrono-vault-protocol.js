/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  PROTO-249: Chrono Vault Protocol                                         ║
 * ║  Temporal versioning, time-travel state, branching timelines              ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * Governs how state snapshots are captured, stored, and traversed
 * across the Kingdom's temporal infrastructure.
 *
 * @module protocols/chrono-vault-protocol
 * @version 1.0.0
 */

const PHI = 1.618033988749895;
const HEARTBEAT = 873;

// ─── Protocol States ─────────────────────────────────────────────────────────
export const VAULT_PROTOCOL_STATES = {
  RECORDING: 'recording',
  REPLAYING: 'replaying',
  BRANCHING: 'branching',
  MERGING: 'merging',
  QUERYING: 'querying',
  IDLE: 'idle',
  ERROR: 'error'
};

// ─── Snapshot Retention Policies ─────────────────────────────────────────────
export const RETENTION_POLICIES = {
  FOREVER: { id: 'forever', ttl: Infinity, description: 'Never prune' },
  LONG: { id: 'long', ttl: 30 * 86400000, description: '30 days' },
  MEDIUM: { id: 'medium', ttl: 7 * 86400000, description: '7 days' },
  SHORT: { id: 'short', ttl: 86400000, description: '24 hours' },
  EPHEMERAL: { id: 'ephemeral', ttl: 3600000, description: '1 hour' }
};

// ─── Configuration ───────────────────────────────────────────────────────────
export const VAULT_CONFIG = {
  maxSnapshots: 10000,
  maxTimelines: 100,
  maxBranchDepth: 20,
  snapshotInterval: HEARTBEAT,
  compressionEnabled: true,
  deduplication: true,
  phiRetentionDecay: 1 / PHI,
  causalChainMaxLength: 50000
};

// ─── Message Types ───────────────────────────────────────────────────────────
export const MESSAGE_TYPES = {
  CAPTURE: 'vault.capture',
  CAPTURED: 'vault.captured',
  REWIND: 'vault.rewind',
  REWOUND: 'vault.rewound',
  BRANCH: 'vault.branch',
  BRANCHED: 'vault.branched',
  MERGE: 'vault.merge',
  MERGED: 'vault.merged',
  QUERY: 'vault.query',
  QUERY_RESULT: 'vault.query.result',
  DIFF: 'vault.diff',
  DIFF_RESULT: 'vault.diff.result',
  STATUS: 'vault.status'
};

/**
 * Calculate snapshot retention priority (higher = keep longer)
 */
export function calculateRetentionPriority(epoch, firings, causalLinks, age) {
  const recency = 1 / (age / HEARTBEAT + 1);
  const importance = Math.log2(firings + 1) + causalLinks * PHI;
  return recency * importance;
}

/**
 * Calculate branch merge compatibility
 */
export function calculateMergeCompatibility(branchSnapshots, mainSnapshots, divergenceEpoch) {
  const divergenceLength = branchSnapshots - divergenceEpoch;
  const mainAdvance = mainSnapshots - divergenceEpoch;
  const conflict = Math.abs(divergenceLength - mainAdvance);
  return 1.0 / (1 + conflict / PHI);
}

/**
 * Calculate time-travel cost (higher epoch distance = more expensive)
 */
export function calculateTravelCost(currentEpoch, targetEpoch, snapshotDensity) {
  const distance = Math.abs(currentEpoch - targetEpoch);
  const density = snapshotDensity || 1;
  return (distance / density) * (1 / PHI);
}

/**
 * ChronoVaultProtocol — Main protocol class
 */
export class ChronoVaultProtocol {
  constructor(config = {}) {
    this.config = { ...VAULT_CONFIG, ...config };
    this.state = VAULT_PROTOCOL_STATES.IDLE;
    this.stats = { captured: 0, rewound: 0, branched: 0, merged: 0, queries: 0, errors: 0 };
  }

  getStatus() {
    return { state: this.state, stats: this.stats, config: this.config };
  }
}
