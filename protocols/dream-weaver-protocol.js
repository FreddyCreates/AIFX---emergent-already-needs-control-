/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  PROTO-248: Dream Weaver Protocol                                         ║
 * ║  Generative AI orchestration, hallucination control, grounding            ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * Governs how generative AI outputs are composed, grounded, and verified
 * to prevent hallucination while maximizing creative potential.
 *
 * @module protocols/dream-weaver-protocol
 * @version 1.0.0
 */

const PHI = 1.618033988749895;
const HEARTBEAT = 873;

// ─── Protocol States ─────────────────────────────────────────────────────────
export const DREAM_PROTOCOL_STATES = {
  AWAKE: 'awake',
  DREAMING: 'dreaming',
  GROUNDING: 'grounding',
  COMPOSING: 'composing',
  VERIFYING: 'verifying',
  OUTPUTTING: 'outputting',
  ERROR: 'error'
};

// ─── Hallucination Severity ──────────────────────────────────────────────────
export const HALLUCINATION_LEVELS = {
  NONE: { id: 'none', severity: 0, action: 'pass' },
  MILD: { id: 'mild', severity: 0.2, action: 'flag' },
  MODERATE: { id: 'moderate', severity: 0.5, action: 'reground' },
  SEVERE: { id: 'severe', severity: 0.8, action: 'reject' },
  CRITICAL: { id: 'critical', severity: 1.0, action: 'halt' }
};

// ─── Configuration ───────────────────────────────────────────────────────────
export const DREAM_CONFIG = {
  maxTemperature: 1 / PHI + 0.5,
  minGroundingScore: 0.4,
  maxDreamDepth: 10,
  realityAnchorRefresh: 60000,
  heartbeatInterval: HEARTBEAT,
  hallucinationBudget: 0.1, // Allow 10% speculative content
  compositionMaxModalities: 5
};

// ─── Message Types ───────────────────────────────────────────────────────────
export const MESSAGE_TYPES = {
  DREAM_START: 'dream.start',
  DREAM_OUTPUT: 'dream.output',
  GROUND_CHECK: 'dream.ground.check',
  GROUND_RESULT: 'dream.ground.result',
  HALLUCINATION_DETECTED: 'dream.hallucination',
  COMPOSE_REQUEST: 'dream.compose.request',
  COMPOSE_RESULT: 'dream.compose.result',
  ANCHOR_UPDATE: 'dream.anchor.update',
  STATUS: 'dream.status'
};

/**
 * Calculate grounding score for generated content
 */
export function calculateGroundingScore(anchorMatches, totalAnchors, contentLength) {
  if (totalAnchors === 0) return PHI - 1; // Default to 0.618
  const coverage = anchorMatches / totalAnchors;
  const lengthPenalty = Math.min(1.0, 1000 / (contentLength + 1));
  return coverage * (PHI - 1) + lengthPenalty * (1 - (PHI - 1));
}

/**
 * Calculate hallucination risk from temperature and grounding
 */
export function calculateHallucinationRisk(temperature, groundingScore, dreamDepth) {
  const tempRisk = temperature / DREAM_CONFIG.maxTemperature;
  const groundRisk = 1 - groundingScore;
  const depthRisk = dreamDepth / DREAM_CONFIG.maxDreamDepth;
  return (tempRisk * PHI + groundRisk * PHI + depthRisk) / (2 * PHI + 1);
}

/**
 * Calculate optimal creative temperature
 */
export function calculateOptimalTemperature(taskType, groundingScore) {
  const baseTemp = taskType === 'creative' ? 0.9 : 0.3;
  return Math.min(DREAM_CONFIG.maxTemperature, baseTemp * groundingScore * PHI);
}

/**
 * DreamWeaverProtocol — Main protocol class
 */
export class DreamWeaverProtocol {
  constructor(config = {}) {
    this.config = { ...DREAM_CONFIG, ...config };
    this.state = DREAM_PROTOCOL_STATES.AWAKE;
    this.stats = { dreams: 0, grounded: 0, hallucinations: 0, compositions: 0, errors: 0 };
  }

  getStatus() {
    return { state: this.state, stats: this.stats, config: this.config };
  }
}
