/**
 * PROTO-256: Alpha Conductor Protocol (ACP)
 * Signal routing, ensemble direction, harmonic coordination, and tempo management.
 *
 * The Alpha Conductor Protocol defines formal rules for:
 * - Routing signals to ensemble members with φ-weighted strength
 * - Managing tempo and dynamics across agent ensembles
 * - Detecting and resolving dissonance (timing drift, conflicts)
 * - Pattern composition and playback
 * - Hierarchical conductor coordination
 *
 * φ-enhanced: Golden ratio governs signal propagation, harmony scoring, and timing.
 *
 * @module protocols/alpha-conductor-protocol
 * @version 1.0.0
 */

const PHI = 1.618033988749895;
const PHI_INVERSE = 0.618033988749895;
const PROTOCOL_ID = 'PROTO-256';
const PROTOCOL_NAME = 'Alpha Conductor Protocol';

// ═══════════════════════════════════════════════════════════════════════════════
// CONDUCTOR CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

export const CONDUCTOR_CONFIG = {
  // Timing
  DEFAULT_TEMPO_MS: 873,
  MIN_TEMPO_MS: Math.round(873 * PHI_INVERSE * PHI_INVERSE), // ~333ms
  MAX_TEMPO_MS: Math.round(873 * PHI * PHI), // ~2284ms
  SYNC_TOLERANCE_MS: Math.round(873 * PHI_INVERSE * 0.1), // ~62ms
  
  // Ensemble limits
  MAX_ENSEMBLE_SIZE: Math.round(13 * PHI), // 21
  MAX_CONDUCTORS_IN_ENSEMBLE: Math.round(5 * PHI), // 8
  MAX_PATTERNS: Math.round(34 * PHI), // 55
  
  // Dynamics
  MIN_DYNAMICS: 0.1,
  MAX_DYNAMICS: PHI,
  DEFAULT_DYNAMICS: PHI_INVERSE,
  
  // Dissonance
  DISSONANCE_THRESHOLD: PHI_INVERSE,
  AUTO_RESOLVE_INTERVAL: Math.round(PHI * 5), // every 8 measures
  MAX_TOLERABLE_DISSONANCE: PHI,
  
  // Signal propagation
  SIGNAL_DECAY_RATE: PHI_INVERSE,
  MAX_SIGNAL_HOPS: Math.round(PHI * 5) // 8 hops
};

// ═══════════════════════════════════════════════════════════════════════════════
// MESSAGE TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export const MESSAGE_TYPES = {
  // Lifecycle
  CONDUCTOR_TUNE: 'conductor_tune',
  CONDUCTOR_BEGIN: 'conductor_begin',
  CONDUCTOR_HOLD: 'conductor_hold',
  CONDUCTOR_RELEASE: 'conductor_release',
  CONDUCTOR_FINISH: 'conductor_finish',
  
  // Ensemble management
  MEMBER_JOIN: 'member_join',
  MEMBER_LEAVE: 'member_leave',
  MEMBER_MUTE: 'member_mute',
  MEMBER_UNMUTE: 'member_unmute',
  MEMBER_SOLO: 'member_solo',
  ENSEMBLE_TUTTI: 'ensemble_tutti',
  
  // Signal routing
  SIGNAL_CUE: 'signal_cue',
  SIGNAL_CUTOFF: 'signal_cutoff',
  SIGNAL_SYNC: 'signal_sync',
  SIGNAL_TEMPO: 'signal_tempo',
  SIGNAL_DYNAMICS: 'signal_dynamics',
  SIGNAL_MODULATE: 'signal_modulate',
  SIGNAL_ACCENT: 'signal_accent',
  
  // Pattern management
  PATTERN_DEFINE: 'pattern_define',
  PATTERN_PLAY: 'pattern_play',
  SCORE_COMPOSE: 'score_compose',
  
  // Harmony
  DISSONANCE_DETECTED: 'dissonance_detected',
  DISSONANCE_RESOLVED: 'dissonance_resolved',
  HARMONY_REPORT: 'harmony_report'
};

// ═══════════════════════════════════════════════════════════════════════════════
// CONDUCTOR STATES
// ═══════════════════════════════════════════════════════════════════════════════

export const CONDUCTOR_STATES = {
  TUNING: 'tuning',
  READY: 'ready',
  CONDUCTING: 'conducting',
  CRESCENDO: 'crescendo',
  DIMINUENDO: 'diminuendo',
  FERMATA: 'fermata',
  CODA: 'coda',
  SILENT: 'silent'
};

// ═══════════════════════════════════════════════════════════════════════════════
// CONDUCTOR TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export const CONDUCTOR_TYPES = {
  MAESTRO: 'maestro',
  SECTION_LEAD: 'section_lead',
  SOLOIST: 'soloist',
  IMPROVISER: 'improviser'
};

// ═══════════════════════════════════════════════════════════════════════════════
// ENSEMBLE ROLES
// ═══════════════════════════════════════════════════════════════════════════════

export const ENSEMBLE_ROLES = {
  FIRST_CHAIR: 'first_chair',
  HARMONY: 'harmony',
  RHYTHM: 'rhythm',
  BASS: 'bass',
  COUNTERPOINT: 'counterpoint',
  PERCUSSION: 'percussion'
};

// ═══════════════════════════════════════════════════════════════════════════════
// SIGNAL TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export const SIGNAL_TYPES = {
  CUE: 'cue',
  TEMPO: 'tempo',
  DYNAMICS: 'dynamics',
  CUTOFF: 'cutoff',
  SYNC: 'sync',
  ACCENT: 'accent',
  MODULATE: 'modulate',
  FERMATA: 'fermata'
};

// ═══════════════════════════════════════════════════════════════════════════════
// PHI UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calculate signal strength after propagation over distance.
 */
export function calculateSignalStrength(distance, dynamics = CONDUCTOR_CONFIG.DEFAULT_DYNAMICS) {
  return dynamics * Math.pow(PHI_INVERSE, distance);
}

/**
 * Calculate ensemble harmony from member weight distribution.
 * Returns 0..1 where 1 = perfect harmony.
 */
export function calculateHarmony(memberWeights) {
  if (!memberWeights || memberWeights.length === 0) return 1.0;
  const total = memberWeights.reduce((s, w) => s + w, 0);
  const mean = total / memberWeights.length;
  const variance = memberWeights.reduce((s, w) => s + Math.pow(w - mean, 2), 0) / memberWeights.length;
  return 1.0 / (1.0 + variance * PHI_INVERSE);
}

/**
 * Calculate optimal tempo given system load and agent count.
 */
export function calculateOptimalTempo(load, agentCount) {
  const base = CONDUCTOR_CONFIG.DEFAULT_TEMPO_MS;
  const adjusted = Math.round(base * (1 + load * PHI_INVERSE) / Math.max(1, Math.log(agentCount + 1) * PHI_INVERSE));
  return Math.max(CONDUCTOR_CONFIG.MIN_TEMPO_MS, Math.min(CONDUCTOR_CONFIG.MAX_TEMPO_MS, adjusted));
}

/**
 * Calculate dissonance severity between two timing values.
 */
export function calculateDissonance(timingA, timingB, tempo) {
  return Math.abs(timingA - timingB) / tempo;
}

/**
 * Calculate role weight for ensemble member contribution.
 */
export function calculateRoleWeight(role) {
  switch (role) {
    case ENSEMBLE_ROLES.FIRST_CHAIR: return PHI * PHI;
    case ENSEMBLE_ROLES.HARMONY: return PHI;
    case ENSEMBLE_ROLES.RHYTHM: return PHI;
    case ENSEMBLE_ROLES.BASS: return PHI * PHI_INVERSE;
    case ENSEMBLE_ROLES.COUNTERPOINT: return PHI_INVERSE;
    case ENSEMBLE_ROLES.PERCUSSION: return 1.0;
    default: return 1.0;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROTOCOL CLASS
// ═══════════════════════════════════════════════════════════════════════════════

export class AlphaConductorProtocol {
  static get PROTOCOL_ID() { return PROTOCOL_ID; }
  static get PROTOCOL_NAME() { return PROTOCOL_NAME; }
  static get VERSION() { return '1.0.0'; }

  static validate(message) {
    if (!message || !message.type) return { valid: false, error: 'Missing message type' };
    if (!Object.values(MESSAGE_TYPES).includes(message.type)) {
      return { valid: false, error: `Unknown message type: ${message.type}` };
    }
    if (!message.conductorId) return { valid: false, error: 'Missing conductorId' };
    if (!message.timestamp) return { valid: false, error: 'Missing timestamp' };
    return { valid: true };
  }

  static createMessage(type, conductorId, payload = {}) {
    return {
      protocol: PROTOCOL_ID,
      type,
      conductorId,
      payload,
      timestamp: Date.now(),
      phi: PHI
    };
  }

  static getCapabilities() {
    return {
      protocolId: PROTOCOL_ID,
      name: PROTOCOL_NAME,
      version: '1.0.0',
      messageTypes: Object.values(MESSAGE_TYPES),
      signalTypes: Object.values(SIGNAL_TYPES),
      conductorTypes: Object.values(CONDUCTOR_TYPES),
      ensembleRoles: Object.values(ENSEMBLE_ROLES),
      maxEnsembleSize: CONDUCTOR_CONFIG.MAX_ENSEMBLE_SIZE,
      maxConductors: CONDUCTOR_CONFIG.MAX_CONDUCTORS_IN_ENSEMBLE,
      phiEnhanced: true
    };
  }
}

export default AlphaConductorProtocol;
