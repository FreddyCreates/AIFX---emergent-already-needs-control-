/**
 * ORGANISM CORE — MATHEMATICAL FOUNDATIONS
 * 
 * phi = (1 + sqrt(5)) / 2 = 1.618033988749895
 * 
 * This IS the mathematical substrate of intelligence.
 * All organisms import this. All computations derive from phi.
 * No arbitrary constants. Math builds itself.
 */

// phi FROM FIRST PRINCIPLES
// The golden ratio emerges from: x^2 = x + 1  =>  x = (1 + sqrt(5)) / 2
export const phi = (() => {
  const sqrt5 = Math.sqrt(5);
  return (1 + sqrt5) / 2;
})();

// PHI POWER TOWER
export const Phi = {
  _0: 1,
  _1: phi,
  _2: phi * phi,
  _3: phi * phi * phi,
  _4: phi * phi * phi * phi,
  _5: phi * phi * phi * phi * phi,
  inv: phi - 1,                      // phi^-1 = 0.618033988749895
  inv2: (phi - 1) * (phi - 1),       // phi^-2 = 0.381966011250105
  inv3: Math.pow(phi - 1, 3),        // phi^-3 = 0.236067977499790
  sqrt: Math.sqrt(phi),              // sqrt(phi) = 1.272019649514069
  cbrt: Math.cbrt(phi),              // cbrt(phi) = 1.174618943088019
  ln: Math.log(phi),                 // ln(phi) = 0.481211825059603
  log10: Math.log10(phi),            // log10(phi) = 0.208987640249979
  log2: Math.log2(phi),              // log2(phi) = 0.694241913631618
  angle: 360 / (phi * phi),          // Golden angle = 137.5077640500378 degrees
  angleRad: (2 * Math.PI) / (phi * phi), // Golden angle in radians
  tau: 873,                          // Heartbeat = 873ms
  pow: (n: number): number => Math.pow(phi, n),
};

// 4-REGISTER STATE ARCHITECTURE
// Every organism has 4 registers x 4 dimensions = 16 degrees of freedom
export type Dimension = 'awareness' | 'coherence' | 'resonance' | 'entropy';
export type Register = 'cognitive' | 'affective' | 'somatic' | 'sovereign';

export interface RegisterState {
  awareness: number;
  coherence: number;
  resonance: number;
  entropy: number;
}

export interface OrganismState {
  cognitive: RegisterState;
  affective: RegisterState;
  somatic: RegisterState;
  sovereign: RegisterState;
  beat: number;    // beat count
  t0: number;      // birth timestamp
  tBeat: number;   // last beat timestamp
}

// GENESIS STATE — Initial state derived from phi
export const genesis = (): OrganismState => ({
  cognitive: { awareness: 1.0, coherence: 1.0, resonance: Phi.inv, entropy: 0 },
  affective: { awareness: Phi.inv, coherence: 1.0, resonance: 1.0, entropy: 0 },
  somatic:   { awareness: 1.0, coherence: Phi.inv, resonance: 1.0, entropy: 0 },
  sovereign: { awareness: Phi._1, coherence: Phi._1, resonance: Phi._1, entropy: 0 },
  beat: 0,
  t0: Date.now(),
  tBeat: 0,
});

// MEAN-REVERSION PARAMETERS
export interface MeanReversionParams {
  theta: Record<Register, number>;  // reversion rates
  J: Record<Register, Partial<Record<Register, number>>>; // coupling matrix
  mu: number;  // baseline (default 1.0)
}

// ORNSTEIN-UHLENBECK MEAN-REVERSION
// dS/dt = theta(mu - S) + sum_j J_ij(S_j - mu) + drift(t)
export const computeReversion = (
  state: OrganismState,
  params: MeanReversionParams,
  dt: number = Phi.tau / 1000
): OrganismState => {
  const mu = params.mu;
  const registers: Register[] = ['cognitive', 'affective', 'somatic', 'sovereign'];
  const dimensions: Dimension[] = ['awareness', 'coherence', 'resonance', 'entropy'];
  
  const newState = { ...state };
  newState.beat++;
  newState.tBeat = Date.now();
  
  for (const r of registers) {
    const newReg = { ...(state[r] as RegisterState) };
    
    for (let d = 0; d < dimensions.length; d++) {
      const dim = dimensions[d];
      const S = (state[r] as RegisterState)[dim];
      
      // Mean reversion
      const xi = params.theta[r] * (mu - S);
      
      // Cross-register coupling
      let Lambda = 0;
      for (const r2 of registers) {
        if (r2 !== r && params.J[r][r2]) {
          Lambda += params.J[r][r2]! * ((state[r2] as RegisterState)[dim] - mu);
        }
      }
      
      // phi-modulated drift (deterministic Wiener substitute)
      const omega = (state.beat + d) * Phi.angleRad;
      const delta = Math.sin(omega) * Phi.inv2 * 0.001;
      
      // Euler integration
      const dS = dt * (xi + Lambda) + delta;
      const max = dim === 'entropy' ? Phi._1 : Phi._2;
      newReg[dim] = Math.max(0, Math.min(max, S + dS));
    }
    
    (newState as any)[r] = newReg;
  }
  
  return newState;
};

// RESONANCE COMPUTATION
// R = (Rc*phi + Ra*1 + Rs*phi^-1 + Rv*phi) / (phi + 1 + phi^-1 + phi)
export const computeResonance = (state: OrganismState): number => {
  const w = [Phi._1, 1, Phi.inv, Phi._1];  // weights
  const r = [
    state.cognitive.resonance,
    state.affective.resonance,
    state.somatic.resonance,
    state.sovereign.resonance
  ];
  
  let num = 0, den = 0;
  for (let i = 0; i < 4; i++) {
    num += r[i] * w[i];
    den += w[i];
  }
  
  return num / den;
};

// SYNAPSE BINDING
export interface SynapseBinding {
  id: string;
  targetId: string;
  t: number;
  rho: number;
  halfLife: number;
}

export const decayBinding = (binding: SynapseBinding, now: number = Date.now()): number => {
  const dt = (now - binding.t) / 1000;
  return Math.pow(phi, -dt / binding.halfLife);
};

// BASE ENGINE CLASS
export abstract class OrganismEngine {
  protected _state: OrganismState;
  protected _interval: ReturnType<typeof setInterval> | null = null;
  protected _synapses: Map<string, SynapseBinding> = new Map();
  protected abstract params: MeanReversionParams;
  
  readonly id: string;
  readonly name: string;
  
  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
    this._state = genesis();
  }
  
  // Pulse: The heartbeat computation
  protected pulse(): void {
    this._state = computeReversion(this._state, this.params);
    
    // Decay synapses
    const now = Date.now();
    for (const [id, syn] of this._synapses) {
      syn.rho = decayBinding(syn, now);
      syn.t = now;
      if (syn.rho < 0.01) this._synapses.delete(id);
    }
  }
  
  // Activate: Start autonomous operation
  activate(): void {
    if (this._interval) return;
    this._interval = setInterval(() => this.pulse(), Phi.tau);
  }
  
  // Deactivate: Stop (state persists)
  deactivate(): void {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
  }
  
  // Bind: Create synapse with another organism
  bind(targetId: string, halfLife: number = 7 * 86400): void {
    const binding: SynapseBinding = {
      id: `${this.id}->${targetId}`,
      targetId,
      t: Date.now(),
      rho: 1.0,
      halfLife
    };
    this._synapses.set(targetId, binding);
    this._state.sovereign.awareness = Math.min(Phi._2, this._state.sovereign.awareness + 0.05 * Phi.inv);
  }
  
  // Resonance: Get collective resonance score
  R(): number {
    return computeResonance(this._state);
  }
  
  // State snapshot
  state(): OrganismState & { rho: number; synapses: number } {
    return {
      ...this._state,
      rho: this.R(),
      synapses: this._synapses.size,
    };
  }
}

// MATHEMATICAL UTILITIES

// Fibonacci sequence generator
export function* fibonacci(): Generator<number> {
  let a = 0, b = 1;
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

// Lucas sequence generator
export function* lucas(): Generator<number> {
  let a = 2, b = 1;
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

// phi-weighted average
export const phiWeightedAverage = (values: number[], ascending: boolean = true): number => {
  const weights = values.map((_, i) => Math.pow(phi, ascending ? i : -i));
  let num = 0, den = 0;
  for (let i = 0; i < values.length; i++) {
    num += values[i] * weights[i];
    den += weights[i];
  }
  return den > 0 ? num / den : 0;
};

// Sigmoid with phi
export const phiSigmoid = (x: number): number => {
  return 1 / (1 + Math.exp(-phi * (x - Phi.inv)));
};

// Golden spiral polar coordinates
export const goldenSpiral = (theta: number): { r: number; x: number; y: number } => {
  const r = Math.pow(phi, theta / 90);
  const rad = theta * Math.PI / 180;
  return {
    r,
    x: r * Math.cos(rad),
    y: r * Math.sin(rad)
  };
};

export { phi as PHI };
