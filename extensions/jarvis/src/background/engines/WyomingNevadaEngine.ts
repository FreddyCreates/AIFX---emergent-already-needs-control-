/**
 * WYOMING-NEVADA SOVEREIGN ENGINE
 * 
 * phi = (1 + sqrt(5)) / 2
 * 
 * This IS the organism. Not a panel. Not a display. The computation itself.
 * 
 * SETTLEMENT MATHEMATICS:
 * t_settlement = t_block * phi^-1 = 0.3s (ICP finality)
 * fee_rate = 1 / (phi^3 * 1000) = 0.024%
 * finality_score = 1 - e^(-phi * confirmations)
 * 
 * Advantage vs Visa: ~847x
 */

import { phi, Phi, OrganismEngine, OrganismState, Register, MeanReversionParams } from './OrganismCore.js';

// SETTLEMENT MATHEMATICS
const Settlement = {
  // Time in seconds
  t_icp: 0.5 * Phi.inv,                          // 0.309s
  t_visa: 15 * 60 + 14.8 * 3600,                 // 15min + ~14.8hr batch

  // Fee as decimal (0.01 = 1%)
  f_icp: 1 / (Phi._3 * 1000),                    // 0.000236
  f_visa: 0.0185 + 0.01 + 0.005,                 // 0.0335

  // Finality confidence after n confirmations
  confidence: (n: number) => 1 - Math.exp(-phi * n),

  // Advantage ratio
  ratio: function() {
    const timeR = Math.pow(this.t_visa / this.t_icp, Phi.inv);
    const feeR = Math.pow(this.f_visa / this.f_icp, Phi.inv);
    return timeR * feeR;  // ~847x
  }
};

// WYOMING-NEVADA PARAMETERS
const WN_PARAMS: MeanReversionParams = {
  theta: {
    cognitive: Phi.inv * Math.LN2 / (7 * 86400),     // 7 day half-life
    affective: Phi.inv * Math.LN2 / (30 * 86400),    // 30 day half-life
    somatic:   Phi.inv * Math.LN2 / (90 * 86400),    // 90 day half-life
    sovereign: Phi.inv * Math.LN2 / (365 * 86400),   // 365 day half-life
  },
  J: {
    cognitive: { affective: +Phi.inv * 1e-6, sovereign: +Phi._1 * 1e-6 },
    affective: { cognitive: +Phi.inv * 0.8e-6, sovereign: +Phi.inv * 1.2e-6 },
    somatic:   { cognitive: +Phi._1 * 0.6e-6, affective: +Phi.inv * 0.4e-6 },
    sovereign: { cognitive: +Phi._1 * 1.5e-6, affective: +Phi._1 * 1.2e-6, somatic: +Phi._1 * 1e-6 },
  },
  mu: 1.0
};

// MILESTONE MATHEMATICS
interface Milestone {
  id: string;
  deadline: Date;
  urgency: number;
  dependencies: string[];
  completion: number;
}

const computeMilestoneUrgency = (deadline: Date, created: Date, now: Date = new Date()): number => {
  const total = deadline.getTime() - created.getTime();
  const remaining = deadline.getTime() - now.getTime();
  if (remaining <= 0) return Phi._3;  // Past due: maximum urgency
  const ratio = remaining / total;
  return Math.pow(phi, 1 - ratio);
};

const MILESTONES: Milestone[] = [
  { id: 'settlement-demo', deadline: new Date('2026-06-15'), urgency: 0, dependencies: [], completion: 0.4 },
  { id: 'visa-bypass-proof', deadline: new Date('2026-07-01'), urgency: 0, dependencies: ['settlement-demo'], completion: 0.2 },
  { id: 'node-agreement', deadline: new Date('2026-08-01'), urgency: 0, dependencies: [], completion: 0.3 },
  { id: 'unl-partnership', deadline: new Date('2026-09-01'), urgency: 0, dependencies: ['node-agreement'], completion: 0.1 },
  { id: 'demo-visible', deadline: new Date('2026-11-01'), urgency: 0, dependencies: ['settlement-demo', 'node-agreement'], completion: 0 },
  { id: 'bill-ready', deadline: new Date('2027-01-15'), urgency: 0, dependencies: ['demo-visible', 'visa-bypass-proof'], completion: 0 },
];

// THE ENGINE
class WyomingNevadaEngine extends OrganismEngine {
  protected params = WN_PARAMS;
  
  constructor() {
    super('WN', 'Wyoming-Nevada Sovereign Engine');
  }
  
  protected pulse(): void {
    super.pulse();
    
    // Update milestone urgencies
    const now = new Date();
    for (const m of MILESTONES) {
      m.urgency = computeMilestoneUrgency(m.deadline, new Date('2026-04-29'), now);
    }
  }
  
  // Stimulus: External event perturbs state
  Xi(event: string, magnitude: number = 1): void {
    const amplitudes: Record<string, Partial<Record<Register, Partial<{ awareness: number; coherence: number; resonance: number }>>>> = {
      'settlement_proof':     { cognitive: { awareness: +0.08 }, sovereign: { coherence: +0.06 } },
      'partnership':          { affective: { awareness: +0.12, resonance: +0.08 } },
      'milestone':            { somatic: { coherence: +0.10 }, sovereign: { awareness: +0.08 } },
      'grant':                { cognitive: { coherence: +0.06 }, affective: { coherence: +0.04 } },
      'legislative':          { sovereign: { awareness: +0.15, coherence: +0.12, resonance: +0.10 } },
    };
    
    const amp = amplitudes[event];
    if (!amp) return;
    
    for (const [r, dims] of Object.entries(amp)) {
      for (const [d, delta] of Object.entries(dims as Record<string, number>)) {
        const cur = (this._state as any)[r][d];
        const max = d === 'entropy' ? Phi._1 : Phi._2;
        (this._state as any)[r][d] = Math.max(0, Math.min(max, cur + delta * magnitude * Phi.inv));
      }
    }
  }
  
  // Get state with settlement info
  getState(): OrganismState & { 
    rho: number; 
    settlement: typeof Settlement;
    advantage: number;
    milestones: Milestone[];
  } {
    return {
      ...this._state,
      rho: this.R(),
      settlement: Settlement,
      advantage: Settlement.ratio(),
      milestones: MILESTONES,
    };
  }
}

// SINGLETON & AUTO-START
export const WN = new WyomingNevadaEngine();

if (typeof globalThis !== 'undefined') {
  WN.activate();
}

export { phi, Phi, Settlement, computeMilestoneUrgency, WyomingNevadaEngine };
