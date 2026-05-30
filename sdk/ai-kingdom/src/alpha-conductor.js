/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                                       ║
 * ║   🎵 ALPHA CONDUCTOR — Signal Routing & Ensemble Direction 🎵                          ║
 * ║                                                                                       ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════╝
 * 
 * The Alpha Conductor directs the symphony of AI agents. Where the Orchestrator
 * manages workflows and sequences, the Conductor manages HARMONY — ensuring signals
 * arrive in time, ensembles play together, and the overall output is coherent.
 * 
 * CONDUCTOR PRINCIPLES:
 *   - Signals propagate at φ-harmonic frequencies
 *   - Ensemble members are weighted by golden ratio contribution
 *   - Tempo adapts to system load via φ-scaling
 *   - Dissonance (conflicts) resolved through harmonic merging
 * 
 * CONDUCTOR TYPES:
 *   - MAESTRO: Full authority, directs all ensembles
 *   - SECTION_LEAD: Directs a subsection of agents
 *   - SOLOIST: Manages a single high-priority agent chain
 *   - IMPROVISER: Adaptive conductor that learns optimal patterns
 * 
 * @module sdk/ai-kingdom/alpha-conductor
 * @version 1.0.0
 */

const PHI = 1.618033988749895;
const PHI_INVERSE = 0.618033988749895;
const HEARTBEAT = 873;
const GOLDEN_ANGLE = 137.508;

// ═══════════════════════════════════════════════════════════════════════════════
// CONDUCTOR STATES
// ═══════════════════════════════════════════════════════════════════════════════
export const CONDUCTOR_STATES = {
  TUNING: 'tuning',                 // Preparing, calibrating signals
  READY: 'ready',                   // Awaiting cue
  CONDUCTING: 'conducting',         // Actively directing
  CRESCENDO: 'crescendo',           // Building intensity
  DIMINUENDO: 'diminuendo',         // Reducing intensity
  FERMATA: 'fermata',               // Held pause
  CODA: 'coda',                     // Wrapping up
  SILENT: 'silent'                  // Inactive
};

// ═══════════════════════════════════════════════════════════════════════════════
// CONDUCTOR TYPES
// ═══════════════════════════════════════════════════════════════════════════════
export const CONDUCTOR_TYPES = {
  MAESTRO: 'maestro',               // Full authority
  SECTION_LEAD: 'section_lead',     // Subsection director
  SOLOIST: 'soloist',               // Single-chain manager
  IMPROVISER: 'improviser'          // Adaptive pattern learner
};

// ═══════════════════════════════════════════════════════════════════════════════
// SIGNAL TYPES
// ═══════════════════════════════════════════════════════════════════════════════
export const SIGNAL_TYPES = {
  CUE: 'cue',                       // Start signal
  TEMPO: 'tempo',                   // Speed adjustment
  DYNAMICS: 'dynamics',             // Intensity control
  CUTOFF: 'cutoff',                 // Stop signal
  SYNC: 'sync',                     // Synchronization pulse
  ACCENT: 'accent',                 // Emphasis marker
  MODULATE: 'modulate',             // Key/mode change
  FERMATA: 'fermata'                // Hold/pause signal
};

// ═══════════════════════════════════════════════════════════════════════════════
// ENSEMBLE ROLES
// ═══════════════════════════════════════════════════════════════════════════════
export const ENSEMBLE_ROLES = {
  FIRST_CHAIR: 'first_chair',       // Primary voice, highest priority
  HARMONY: 'harmony',               // Supporting voice
  RHYTHM: 'rhythm',                 // Timing backbone
  BASS: 'bass',                     // Foundation layer
  COUNTERPOINT: 'counterpoint',     // Contrasting voice
  PERCUSSION: 'percussion'          // Event triggers
};

// ═══════════════════════════════════════════════════════════════════════════════
// DYNAMICS LEVELS (intensity scale, φ-weighted)
// ═══════════════════════════════════════════════════════════════════════════════
export const DYNAMICS = {
  PIANISSIMO: 0.1,                   // Very soft
  PIANO: PHI_INVERSE * 0.5,         // Soft (0.309)
  MEZZO_PIANO: PHI_INVERSE * 0.75,  // Medium soft (0.464)
  MEZZO_FORTE: PHI_INVERSE,         // Medium loud (0.618)
  FORTE: PHI_INVERSE * PHI,         // Loud (1.0)
  FORTISSIMO: PHI                   // Very loud (1.618)
};

// ═══════════════════════════════════════════════════════════════════════════════
// ALPHA CONDUCTOR CLASS
// ═══════════════════════════════════════════════════════════════════════════════
export class AlphaConductor {
  constructor(config = {}) {
    this.id = `cond-${config.type || CONDUCTOR_TYPES.SECTION_LEAD}-${Date.now().toString(36)}`;
    this.type = config.type || CONDUCTOR_TYPES.SECTION_LEAD;
    this.state = CONDUCTOR_STATES.TUNING;
    this.ensemble = new Map();
    this.signals = [];
    this.tempo = config.tempo || HEARTBEAT;
    this.dynamics = config.dynamics || DYNAMICS.MEZZO_FORTE;
    this.patterns = new Map();
    this.score = [];
    this.measure = 0;
    this.phiWeight = config.phiWeight || PHI;
    this.maxEnsemble = config.maxEnsemble || Math.round(13 * PHI);
    this.dissonanceThreshold = config.dissonanceThreshold || PHI_INVERSE;
    this.stats = {
      signalsSent: 0,
      cuesGiven: 0,
      dissonancesResolved: 0,
      measuresCompleted: 0,
      ensemblesDirected: 0
    };
    this.eventHandlers = new Map();
    this._pulseInterval = null;
  }

  // ─── LIFECYCLE ───────────────────────────────────────────────────────────────

  tune() {
    this.state = CONDUCTOR_STATES.TUNING;
    // Calibrate all ensemble members
    for (const [id, member] of this.ensemble) {
      member.inTune = true;
      member.lastSync = Date.now();
    }
    this._emit('conductor:tuned', { id: this.id, ensembleSize: this.ensemble.size });
    this.state = CONDUCTOR_STATES.READY;
    return this;
  }

  begin() {
    this.state = CONDUCTOR_STATES.CONDUCTING;
    this._pulseInterval = setInterval(() => this._pulse(), this.tempo);
    this._emit('conductor:began', { id: this.id, tempo: this.tempo });
    return this;
  }

  hold() {
    this.state = CONDUCTOR_STATES.FERMATA;
    this._emit('conductor:fermata', { id: this.id, measure: this.measure });
    return this;
  }

  release() {
    this.state = CONDUCTOR_STATES.CONDUCTING;
    this._emit('conductor:released', { id: this.id, measure: this.measure });
    return this;
  }

  finish() {
    this.state = CONDUCTOR_STATES.CODA;
    if (this._pulseInterval) {
      clearInterval(this._pulseInterval);
      this._pulseInterval = null;
    }
    this._emit('conductor:finished', { id: this.id, stats: { ...this.stats } });
    this.state = CONDUCTOR_STATES.SILENT;
    return this;
  }

  // ─── ENSEMBLE MANAGEMENT ────────────────────────────────────────────────────

  addMember(agentId, role = ENSEMBLE_ROLES.HARMONY, config = {}) {
    if (this.ensemble.size >= this.maxEnsemble) {
      throw new Error(`Ensemble full (max ${this.maxEnsemble})`);
    }

    const member = {
      id: agentId,
      role,
      weight: this._calculateRoleWeight(role),
      dynamics: config.dynamics || this.dynamics,
      inTune: false,
      muted: false,
      soloActive: false,
      lastSignal: null,
      signalsReceived: 0,
      joined: Date.now()
    };

    this.ensemble.set(agentId, member);
    this._emit('ensemble:joined', { agentId, role });
    return this;
  }

  removeMember(agentId) {
    this.ensemble.delete(agentId);
    this._emit('ensemble:left', { agentId });
    return this;
  }

  muteMember(agentId) {
    const member = this.ensemble.get(agentId);
    if (member) member.muted = true;
    return this;
  }

  unmuteMember(agentId) {
    const member = this.ensemble.get(agentId);
    if (member) member.muted = false;
    return this;
  }

  solo(agentId) {
    // Mute all except the soloist
    for (const [id, member] of this.ensemble) {
      member.soloActive = id === agentId;
      member.muted = id !== agentId;
    }
    this._emit('ensemble:solo', { agentId });
    return this;
  }

  tutti() {
    // Unmute all
    for (const [_, member] of this.ensemble) {
      member.muted = false;
      member.soloActive = false;
    }
    this._emit('ensemble:tutti', {});
    return this;
  }

  // ─── SIGNAL ROUTING ─────────────────────────────────────────────────────────

  signal(type, target = null, payload = {}) {
    const sig = {
      id: `sig-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      type,
      target,
      payload,
      dynamics: this.dynamics,
      timestamp: Date.now(),
      measure: this.measure
    };

    if (target) {
      // Targeted signal
      this._deliverSignal(sig, target);
    } else {
      // Broadcast to all active (non-muted) members
      for (const [id, member] of this.ensemble) {
        if (!member.muted) this._deliverSignal(sig, id);
      }
    }

    this.signals.push(sig);
    this.stats.signalsSent++;
    if (type === SIGNAL_TYPES.CUE) this.stats.cuesGiven++;
    this._emit('signal:sent', sig);
    return sig;
  }

  cue(target = null, payload = {}) {
    return this.signal(SIGNAL_TYPES.CUE, target, payload);
  }

  cutoff(target = null) {
    return this.signal(SIGNAL_TYPES.CUTOFF, target, {});
  }

  syncPulse() {
    return this.signal(SIGNAL_TYPES.SYNC, null, { timestamp: Date.now() });
  }

  _deliverSignal(sig, targetId) {
    const member = this.ensemble.get(targetId);
    if (member) {
      member.lastSignal = sig;
      member.signalsReceived++;
    }
  }

  // ─── TEMPO & DYNAMICS ───────────────────────────────────────────────────────

  setTempo(newTempo) {
    this.tempo = newTempo;
    if (this._pulseInterval) {
      clearInterval(this._pulseInterval);
      this._pulseInterval = setInterval(() => this._pulse(), this.tempo);
    }
    this.signal(SIGNAL_TYPES.TEMPO, null, { tempo: newTempo });
    return this;
  }

  accelerando(factor = PHI_INVERSE) {
    this.setTempo(Math.round(this.tempo * factor));
    return this;
  }

  ritardando(factor = PHI) {
    this.setTempo(Math.round(this.tempo * factor));
    return this;
  }

  setDynamics(level) {
    this.dynamics = level;
    this.signal(SIGNAL_TYPES.DYNAMICS, null, { dynamics: level });
    return this;
  }

  crescendo() {
    this.state = CONDUCTOR_STATES.CRESCENDO;
    this.dynamics = Math.min(DYNAMICS.FORTISSIMO, this.dynamics * PHI);
    this.signal(SIGNAL_TYPES.DYNAMICS, null, { dynamics: this.dynamics, direction: 'crescendo' });
    return this;
  }

  diminuendo() {
    this.state = CONDUCTOR_STATES.DIMINUENDO;
    this.dynamics = Math.max(DYNAMICS.PIANISSIMO, this.dynamics * PHI_INVERSE);
    this.signal(SIGNAL_TYPES.DYNAMICS, null, { dynamics: this.dynamics, direction: 'diminuendo' });
    return this;
  }

  // ─── PATTERN SCORING ────────────────────────────────────────────────────────

  definePattern(name, signalSequence) {
    this.patterns.set(name, {
      name,
      signals: signalSequence,
      created: Date.now(),
      timesPlayed: 0
    });
    return this;
  }

  async playPattern(name) {
    const pattern = this.patterns.get(name);
    if (!pattern) throw new Error(`Pattern "${name}" not defined`);

    for (const entry of pattern.signals) {
      this.signal(entry.type, entry.target, entry.payload || {});
      if (entry.wait) {
        await new Promise(resolve => setTimeout(resolve, entry.wait));
      }
    }

    pattern.timesPlayed++;
    this._emit('pattern:played', { name, timesPlayed: pattern.timesPlayed });
    return this;
  }

  composeScore(entries) {
    this.score = entries.map((entry, i) => ({
      ...entry,
      index: i,
      phiTiming: Math.round(HEARTBEAT * Math.pow(PHI_INVERSE, i % 5))
    }));
    return this;
  }

  // ─── DISSONANCE RESOLUTION ──────────────────────────────────────────────────

  detectDissonance() {
    const dissonances = [];
    const members = [...this.ensemble.values()];

    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        if (members[i].lastSignal && members[j].lastSignal) {
          const timeDiff = Math.abs(members[i].lastSignal.timestamp - members[j].lastSignal.timestamp);
          const normalizedDiff = timeDiff / this.tempo;
          if (normalizedDiff > this.dissonanceThreshold) {
            dissonances.push({
              memberA: members[i].id,
              memberB: members[j].id,
              severity: normalizedDiff,
              type: 'timing_drift'
            });
          }
        }
      }
    }

    return dissonances;
  }

  resolveDissonance(dissonance) {
    // Re-sync the drifted members
    this.signal(SIGNAL_TYPES.SYNC, dissonance.memberA, { resync: true });
    this.signal(SIGNAL_TYPES.SYNC, dissonance.memberB, { resync: true });
    this.stats.dissonancesResolved++;
    this._emit('dissonance:resolved', dissonance);
    return this;
  }

  autoResolve() {
    const dissonances = this.detectDissonance();
    for (const d of dissonances) {
      this.resolveDissonance(d);
    }
    return dissonances.length;
  }

  // ─── HEALTH & METRICS ───────────────────────────────────────────────────────

  getHealth() {
    const members = [...this.ensemble.values()];
    const inTuneCount = members.filter(m => m.inTune && !m.muted).length;
    const harmony = members.length > 0 ? inTuneCount / members.length : 1.0;

    return {
      state: this.state,
      harmony,
      tempo: this.tempo,
      dynamics: this.dynamics,
      ensembleSize: this.ensemble.size,
      measure: this.measure,
      stats: { ...this.stats },
      phiResonance: harmony * PHI_INVERSE + (this.dynamics / DYNAMICS.FORTISSIMO) * PHI_INVERSE
    };
  }

  // ─── EVENT SYSTEM ───────────────────────────────────────────────────────────

  on(event, handler) {
    if (!this.eventHandlers.has(event)) this.eventHandlers.set(event, []);
    this.eventHandlers.get(event).push(handler);
    return this;
  }

  _emit(event, data) {
    const handlers = this.eventHandlers.get(event) || [];
    for (const handler of handlers) {
      try { handler(data); } catch (_) { /* swallow */ }
    }
  }

  // ─── PULSE (HEARTBEAT) ──────────────────────────────────────────────────────

  _pulse() {
    this.measure++;
    this.stats.measuresCompleted++;

    // Auto-resolve dissonance every φ measures
    if (this.measure % Math.round(PHI * 5) === 0) {
      this.autoResolve();
    }

    // Sync pulse every golden-angle measures
    if (this.measure % Math.round(GOLDEN_ANGLE / 10) === 0) {
      this.syncPulse();
    }

    this._emit('conductor:pulse', { measure: this.measure, tempo: this.tempo, dynamics: this.dynamics });
  }

  // ─── UTILITY ────────────────────────────────────────────────────────────────

  _calculateRoleWeight(role) {
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
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONDUCTOR ENSEMBLE — Multiple conductors in concert
// ═══════════════════════════════════════════════════════════════════════════════
export class ConductorEnsemble {
  constructor(config = {}) {
    this.id = `cond-ens-${Date.now().toString(36)}`;
    this.conductors = new Map();
    this.maestro = null;
    this.phiWeight = config.phiWeight || PHI;
  }

  addConductor(conductor) {
    this.conductors.set(conductor.id, conductor);
    if (conductor.type === CONDUCTOR_TYPES.MAESTRO) {
      this.maestro = conductor.id;
    }
    return this;
  }

  removeConductor(conductorId) {
    this.conductors.delete(conductorId);
    if (this.maestro === conductorId) this.maestro = null;
    return this;
  }

  broadcastSignal(type, payload = {}) {
    for (const [_, conductor] of this.conductors) {
      conductor.signal(type, null, payload);
    }
    return this;
  }

  synchronize() {
    for (const [_, conductor] of this.conductors) {
      conductor.syncPulse();
    }
    return this;
  }

  getEnsembleHealth() {
    const healths = [...this.conductors.values()].map(c => c.getHealth());
    return {
      ensembleId: this.id,
      conductorCount: this.conductors.size,
      maestro: this.maestro,
      conductors: healths,
      overallHarmony: healths.reduce((s, h) => s + h.harmony, 0) / Math.max(1, healths.length),
      networkResonance: healths.reduce((s, h) => s + h.phiResonance, 0) / Math.max(1, healths.length)
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// FACTORY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

export function createMaestroConductor(config = {}) {
  return new AlphaConductor({ ...config, type: CONDUCTOR_TYPES.MAESTRO });
}

export function createSectionConductor(config = {}) {
  return new AlphaConductor({ ...config, type: CONDUCTOR_TYPES.SECTION_LEAD });
}

export function createSoloistConductor(config = {}) {
  return new AlphaConductor({ ...config, type: CONDUCTOR_TYPES.SOLOIST });
}

export function createImproviserConductor(config = {}) {
  return new AlphaConductor({ ...config, type: CONDUCTOR_TYPES.IMPROVISER });
}

export function createConductorEnsemble(config = {}) {
  return new ConductorEnsemble(config);
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHI UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

export function calculateSignalStrength(distance, dynamics) {
  return dynamics * Math.pow(PHI_INVERSE, distance);
}

export function calculateHarmony(memberWeights) {
  const total = memberWeights.reduce((s, w) => s + w, 0);
  const mean = total / memberWeights.length;
  const variance = memberWeights.reduce((s, w) => s + Math.pow(w - mean, 2), 0) / memberWeights.length;
  return 1.0 / (1.0 + variance * PHI_INVERSE);
}

export function calculateOptimalTempo(load, agentCount) {
  return Math.round(HEARTBEAT * (1 + load * PHI_INVERSE) / Math.max(1, Math.log(agentCount + 1) * PHI_INVERSE));
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════════════════════════
export default AlphaConductor;
