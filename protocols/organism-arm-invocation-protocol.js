/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  PROTO-253: Organism Arm Invocation Protocol                              ║
 * ║  Manus Organismi — Extensions as Autonomous Arms                          ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * Governs how the organism internally invokes its own extensions as arms.
 * Inverts the control model: the organism is the caller, extensions are limbs.
 *
 * MODALITIES:
 *   SENSE  — sensory arms absorb environmental data (inbound perception)
 *   THINK  — cognitive arms reason about perceived state (internal processing)
 *   ACT    — motor arms execute decisions on the world (outbound action)
 *
 * CYCLE:
 *   Every 873ms × φ (≈1412ms), the organism pulses through SENSE→THINK→ACT.
 *   Arms are phi-weighted by priority. Failed arms are disabled and retried
 *   on subsequent cycles with exponential φ-backoff.
 *
 * @module protocols/organism-arm-invocation-protocol
 * @version 1.0.0
 */

const PHI = 1.618033988749895;
const HEARTBEAT = 873;
const ARM_CYCLE_MS = Math.round(HEARTBEAT * PHI);

// ─── Protocol States ─────────────────────────────────────────────────────────
export const ARM_PROTOCOL_STATES = {
  IDLE: 'idle',
  SENSING: 'sensing',
  THINKING: 'thinking',
  ACTING: 'acting',
  RESTING: 'resting',
  DISABLED: 'disabled',
  ERROR: 'error',
};

// ─── Arm Types ───────────────────────────────────────────────────────────────
export const ARM_TYPES = {
  SENSORY: 'sensory',
  MOTOR: 'motor',
  COGNITIVE: 'cognitive',
};

// ─── Message Types ───────────────────────────────────────────────────────────
export const MESSAGE_TYPES = {
  ARM_REGISTER: 'arm:register',
  ARM_INVOKE: 'arm:invoke',
  ARM_RESULT: 'arm:result',
  ARM_DISABLE: 'arm:disable',
  ARM_ENABLE: 'arm:enable',
  CYCLE_START: 'cycle:start',
  CYCLE_SENSE: 'cycle:sense',
  CYCLE_THINK: 'cycle:think',
  CYCLE_ACT: 'cycle:act',
  CYCLE_COMPLETE: 'cycle:complete',
  CYCLE_ERROR: 'cycle:error',
};

// ─── Protocol Configuration ──────────────────────────────────────────────────
export const ARM_PROTOCOL_CONFIG = {
  cycleIntervalMs: ARM_CYCLE_MS,
  maxConcurrentArms: 8,
  armTimeoutMs: HEARTBEAT * 3,
  retryBackoffBase: PHI,
  maxRetries: 5,
  phiPriorityWeight: PHI,
  emergenceThreshold: PHI - 1,
};

// ─── Phi Functions ───────────────────────────────────────────────────────────

/**
 * Calculate arm invocation priority (higher = invoked sooner).
 * @param {number} basePriority - Arm's registered priority
 * @param {number} urgency - Current urgency multiplier
 * @param {number} successRate - Historical success rate (0-1)
 * @returns {number}
 */
export function calculateArmPriority(basePriority, urgency, successRate) {
  return (basePriority * urgency * (successRate + PHI - 1)) / PHI;
}

/**
 * Calculate φ-backoff delay for retrying a failed arm.
 * @param {number} retryCount - Number of previous retries
 * @returns {number} Delay in ms
 */
export function calculateArmBackoff(retryCount) {
  return Math.round(HEARTBEAT * Math.pow(PHI, retryCount));
}

/**
 * Calculate cycle health score from arm results.
 * @param {number} succeeded - Number of arms that succeeded
 * @param {number} total - Total arms invoked
 * @param {number} avgDuration - Average execution duration
 * @returns {number} Health score (0-1, where PHI-1 is emergence threshold)
 */
export function calculateCycleHealth(succeeded, total, avgDuration) {
  if (total === 0) return 0;
  const successRatio = succeeded / total;
  const speedRatio = Math.max(0, 1 - (avgDuration / (ARM_CYCLE_MS * PHI)));
  return (successRatio * PHI + speedRatio) / (PHI + 1);
}

/**
 * Determine if the organism should escalate (all-arms-reach).
 * @param {number} healthScore - Current cycle health
 * @param {number} urgency - Current urgency level
 * @returns {boolean}
 */
export function shouldEscalate(healthScore, urgency) {
  return healthScore < (PHI - 1) && urgency > PHI;
}

// ─── Protocol Class ──────────────────────────────────────────────────────────

export class OrganismArmInvocationProtocol {
  #state;
  #cycleCount;
  #armHealth;

  constructor() {
    this.#state = ARM_PROTOCOL_STATES.IDLE;
    this.#cycleCount = 0;
    this.#armHealth = new Map();
  }

  get state() { return this.#state; }
  get cycleCount() { return this.#cycleCount; }

  /**
   * Transition the protocol state machine.
   * @param {string} newState
   */
  transition(newState) {
    if (!Object.values(ARM_PROTOCOL_STATES).includes(newState)) {
      throw new Error(`Invalid state: ${newState}`);
    }
    this.#state = newState;
  }

  /**
   * Record an arm's execution health for priority adjustments.
   * @param {string} armSlug
   * @param {boolean} succeeded
   * @param {number} duration
   */
  recordArmHealth(armSlug, succeeded, duration) {
    if (!this.#armHealth.has(armSlug)) {
      this.#armHealth.set(armSlug, { successes: 0, failures: 0, totalDuration: 0, invocations: 0 });
    }
    const health = this.#armHealth.get(armSlug);
    health.invocations++;
    health.totalDuration += duration;
    if (succeeded) health.successes++;
    else health.failures++;
  }

  /**
   * Get success rate for a specific arm.
   * @param {string} armSlug
   * @returns {number}
   */
  getArmSuccessRate(armSlug) {
    const health = this.#armHealth.get(armSlug);
    if (!health || health.invocations === 0) return 1;
    return health.successes / health.invocations;
  }

  /**
   * Advance cycle counter (called each heartbeat pulse).
   */
  advanceCycle() {
    this.#cycleCount++;
  }

  /**
   * Get protocol metadata.
   * @returns {Object}
   */
  getMetadata() {
    return {
      protocolId: 'PROTO-253',
      name: 'OrganismArmInvocationProtocol',
      version: '1.0.0',
      state: this.#state,
      cycleCount: this.#cycleCount,
      trackedArms: this.#armHealth.size,
      config: { ...ARM_PROTOCOL_CONFIG },
    };
  }
}

export default OrganismArmInvocationProtocol;
