/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                                       ║
 * ║   ⏳ CHRONO VAULT — TEMPORAL VERSIONING & TIME-TRAVEL STATE MANAGEMENT ⏳               ║
 * ║                                                                                       ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════╝
 *
 * The Chrono Vault is the Kingdom's temporal memory.
 * It preserves every state transition, enabling perfect time-travel
 * to any point in the Organism's history.
 *
 * FEATURES:
 *   - Immutable state snapshots at φ-intervals
 *   - Branching timelines (parallel reality exploration)
 *   - Temporal queries (what-if analysis)
 *   - State diffing across time points
 *   - Causal chain tracking
 *
 * @module sdk/ai-kingdom/chrono-vault
 * @version 1.0.0
 */

const PHI = 1.618033988749895;

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPORAL STATES
// ═══════════════════════════════════════════════════════════════════════════════

export const TEMPORAL_STATES = {
  PRESENT: 'present',
  RECORDING: 'recording',
  REWINDING: 'rewinding',
  BRANCHING: 'branching',
  MERGING: 'merging',
  FROZEN: 'frozen'
};

// ═══════════════════════════════════════════════════════════════════════════════
// TIMELINE TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export const TIMELINE_TYPES = {
  MAIN: { id: 'main', name: 'Main Timeline', mutable: false, color: '#gold' },
  BRANCH: { id: 'branch', name: 'Branch Timeline', mutable: true, color: '#blue' },
  DREAM: { id: 'dream', name: 'Dream Timeline', mutable: true, color: '#purple' },
  RECOVERY: { id: 'recovery', name: 'Recovery Timeline', mutable: false, color: '#red' }
};

// ═══════════════════════════════════════════════════════════════════════════════
// SNAPSHOT CLASS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * ChronoSnapshot — An immutable point-in-time state capture
 */
export class ChronoSnapshot {

  constructor(state, metadata = {}) {
    this.id = `snap-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    this.state = Object.freeze(JSON.parse(JSON.stringify(state)));
    this.timestamp = Date.now();
    this.epoch = metadata.epoch || 0;
    this.timeline = metadata.timeline || 'main';
    this.causedBy = metadata.causedBy || null;
    this.hash = this._computeHash(state);
    this.phiWeight = Math.pow(PHI, -(this.epoch % 10)); // Decay over epochs
  }

  _computeHash(state) {
    const str = JSON.stringify(state);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(36);
  }

  getAge() {
    return Date.now() - this.timestamp;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CHRONO VAULT CLASS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * ChronoVault — The temporal state machine
 */
export class ChronoVault {

  constructor(config = {}) {
    this.id = config.id || `vault-${Date.now()}`;
    this.name = config.name || 'Chrono Vault';
    this.state = TEMPORAL_STATES.PRESENT;
    this.timelines = new Map();
    this.currentTimeline = 'main';
    this.epoch = 0;
    this.maxSnapshots = config.maxSnapshots || 10000;
    this.snapshotInterval = config.snapshotInterval || 873; // φ-heartbeat
    this.causalChain = [];
    this.createdAt = Date.now();

    // Initialize main timeline
    this.timelines.set('main', { type: TIMELINE_TYPES.MAIN, snapshots: [], branches: [] });
  }

  /**
   * Capture current state as an immutable snapshot
   */
  capture(state, cause = null) {
    this.state = TEMPORAL_STATES.RECORDING;
    this.epoch++;

    const snapshot = new ChronoSnapshot(state, {
      epoch: this.epoch,
      timeline: this.currentTimeline,
      causedBy: cause
    });

    const timeline = this.timelines.get(this.currentTimeline);
    if (timeline) {
      timeline.snapshots.push(snapshot);

      // Enforce max snapshots (FIFO with φ-weighted retention)
      if (timeline.snapshots.length > this.maxSnapshots) {
        this._pruneTimeline(timeline);
      }
    }

    // Track causal chain
    if (cause) {
      this.causalChain.push({ epoch: this.epoch, cause, snapshotId: snapshot.id });
    }

    this.state = TEMPORAL_STATES.PRESENT;
    return { snapshotId: snapshot.id, epoch: this.epoch, hash: snapshot.hash };
  }

  /**
   * Time-travel to a specific epoch
   */
  rewind(targetEpoch) {
    this.state = TEMPORAL_STATES.REWINDING;
    const timeline = this.timelines.get(this.currentTimeline);
    if (!timeline) return { error: 'Timeline not found' };

    const snapshot = timeline.snapshots.find(s => s.epoch === targetEpoch);
    if (!snapshot) return { error: `No snapshot at epoch ${targetEpoch}` };

    this.state = TEMPORAL_STATES.PRESENT;
    return { success: true, epoch: targetEpoch, state: snapshot.state, hash: snapshot.hash, age: snapshot.getAge() };
  }

  /**
   * Create a branch timeline from a given epoch
   */
  branch(name, fromEpoch = null) {
    this.state = TEMPORAL_STATES.BRANCHING;
    const sourceTimeline = this.timelines.get(this.currentTimeline);
    if (!sourceTimeline) return { error: 'Source timeline not found' };

    const branchPoint = fromEpoch || this.epoch;
    const branchSnapshots = sourceTimeline.snapshots.filter(s => s.epoch <= branchPoint);

    const branchId = `branch-${name}-${Date.now().toString(36)}`;
    this.timelines.set(branchId, {
      type: TIMELINE_TYPES.BRANCH,
      snapshots: [...branchSnapshots],
      branches: [],
      branchedFrom: this.currentTimeline,
      branchEpoch: branchPoint
    });

    sourceTimeline.branches.push(branchId);
    this.state = TEMPORAL_STATES.PRESENT;
    return { branchId, fromEpoch: branchPoint, snapshots: branchSnapshots.length };
  }

  /**
   * Switch to a different timeline
   */
  switchTimeline(timelineId) {
    if (!this.timelines.has(timelineId)) return { error: 'Timeline not found' };
    this.currentTimeline = timelineId;
    return { switched: timelineId };
  }

  /**
   * Diff two snapshots
   */
  diff(epoch1, epoch2, timeline = null) {
    const tl = this.timelines.get(timeline || this.currentTimeline);
    if (!tl) return { error: 'Timeline not found' };

    const snap1 = tl.snapshots.find(s => s.epoch === epoch1);
    const snap2 = tl.snapshots.find(s => s.epoch === epoch2);

    if (!snap1 || !snap2) return { error: 'Snapshot(s) not found' };

    const changes = this._computeDiff(snap1.state, snap2.state);
    return {
      from: epoch1,
      to: epoch2,
      changes,
      distance: Math.abs(epoch2 - epoch1),
      phiDrift: Math.abs(snap2.phiWeight - snap1.phiWeight)
    };
  }

  /**
   * Query: what was the state at a given time?
   */
  query(timestamp) {
    const tl = this.timelines.get(this.currentTimeline);
    if (!tl) return { error: 'Timeline not found' };

    // Find nearest snapshot to timestamp
    let nearest = null;
    let minDist = Infinity;
    for (const snap of tl.snapshots) {
      const dist = Math.abs(snap.timestamp - timestamp);
      if (dist < minDist) {
        minDist = dist;
        nearest = snap;
      }
    }

    if (!nearest) return { error: 'No snapshots available' };
    return { snapshot: nearest, distance: minDist, epoch: nearest.epoch };
  }

  /**
   * Get vault status
   */
  getStatus() {
    const totalSnapshots = Array.from(this.timelines.values())
      .reduce((sum, tl) => sum + tl.snapshots.length, 0);

    return {
      id: this.id,
      state: this.state,
      epoch: this.epoch,
      currentTimeline: this.currentTimeline,
      timelines: this.timelines.size,
      totalSnapshots,
      causalEvents: this.causalChain.length,
      uptime: Date.now() - this.createdAt
    };
  }

  // ─── Internal Methods ──────────────────────────────────────────────────────

  _pruneTimeline(timeline) {
    // Keep snapshots with higher φ-weight (more recent + significant)
    timeline.snapshots.sort((a, b) => b.phiWeight - a.phiWeight);
    timeline.snapshots = timeline.snapshots.slice(0, this.maxSnapshots);
    timeline.snapshots.sort((a, b) => a.epoch - b.epoch);
  }

  _computeDiff(state1, state2) {
    const changes = [];
    const keys1 = Object.keys(state1 || {});
    const keys2 = Object.keys(state2 || {});
    const allKeys = new Set([...keys1, ...keys2]);

    for (const key of allKeys) {
      if (JSON.stringify(state1[key]) !== JSON.stringify(state2[key])) {
        changes.push({ key, from: state1[key], to: state2[key] });
      }
    }
    return changes;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPORAL QUERY ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * TemporalQueryEngine — Run what-if queries across timelines
 */
export class TemporalQueryEngine {

  constructor(vault) {
    this.vault = vault;
    this.queries = [];
  }

  whatIf(condition, atEpoch) {
    const snapshot = this.vault.rewind(atEpoch);
    if (snapshot.error) return snapshot;

    const query = {
      id: `query-${Date.now()}`,
      condition,
      epoch: atEpoch,
      baseState: snapshot.state,
      result: this._evaluate(condition, snapshot.state),
      timestamp: Date.now()
    };
    this.queries.push(query);
    return query;
  }

  _evaluate(condition, state) {
    // Stub: would evaluate condition against state
    return { evaluated: true, condition, stateKeys: Object.keys(state || {}).length };
  }
}

export default ChronoVault;
