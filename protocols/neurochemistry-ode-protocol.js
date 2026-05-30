/**
 * PROTO-201: Neurochemistry ODE Protocol (NODEP)
 * Ornstein-Uhlenbeck mean-reverting process for organism neurochemistry.
 * 
 * Core ODE: dCᵢ/dt = θᵢ(μᵢ − Cᵢ) + Σⱼ Jᵢⱼ·(Cⱼ − μⱼ) + sᵢ(t)
 * Hill equation receptor saturation: ρ = Cⁿ/(Kdⁿ + Cⁿ)
 * 
 * 6 neurochemical species with behavioral timescales:
 *   DA (Dopamine), SE (Serotonin), NE (Norepinephrine),
 *   CO (Cortisol), ACh (Acetylcholine), OX (Oxytocin)
 */

const PHI = 1.618033988749895;
const HEARTBEAT = 873;
const DELTA_T = HEARTBEAT / 1000;

const SPECIES = ['DA', 'SE', 'NE', 'CO', 'ACh', 'OX'];

const BASELINE = { DA: 1.0, SE: 1.0, NE: 1.0, CO: 1.0, ACh: 1.0, OX: 1.0 };

const THETA = {
  DA:  Math.LN2 / (45 * 60),
  SE:  Math.LN2 / (90 * 60),
  NE:  Math.LN2 / (30 * 60),
  CO:  Math.LN2 / (75 * 60),
  ACh: Math.LN2 / (15 * 60),
  OX:  Math.LN2 / (10 * 60),
};

const JACOBIAN = {
  DA:  { CO: -2.0e-4, SE: -0.8e-4, NE: +0.5e-4 },
  SE:  { OX: +0.8e-4, CO: -1.5e-4, DA: -0.4e-4 },
  NE:  { DA: +1.0e-4, CO: +1.2e-4 },
  CO:  { NE: +0.8e-4 },
  ACh: { DA: -0.6e-4 },
  OX:  {},
};

const STIMULUS_TABLE = {
  chat:           { DA: +0.04, SE: +0.02, OX:  +0.06, ACh: +0.02 },
  research:       { DA: +0.05, ACh: +0.08, NE: +0.03, SE:  +0.01 },
  mission:        { NE: +0.09, DA: +0.06, CO:  +0.04 },
  agent_complete: { DA: +0.12, SE: +0.04, OX:  +0.03 },
  error:          { CO: +0.10, NE: +0.07, DA:  -0.05, SE:  -0.03 },
  success:        { DA: +0.10, SE: +0.05, CO:  -0.04 },
  alert:          { NE: +0.09, CO: +0.06, SE:  -0.02, ACh: +0.04 },
  cognitive:      { ACh: +0.07, DA: +0.04, SE:  +0.02 },
  emotional:      { OX: +0.10, SE: +0.05, ACh: +0.04 },
  creative:       { DA: +0.07, ACh: +0.06, SE:  +0.03 },
};

class NeurochemistryODEProtocol {
  constructor() {
    this.C = { DA: 1.0, SE: 1.0, NE: 1.0, CO: 1.0, ACh: 1.0, OX: 1.0 };
    this.totalTicks = 0;
  }

  tick() {
    this.totalTicks++;
    const dC = {};
    
    for (const sp of SPECIES) {
      let dci = THETA[sp] * (BASELINE[sp] - this.C[sp]);
      const row = JACOBIAN[sp];
      if (row) {
        for (const [jSp, gain] of Object.entries(row)) {
          dci += gain * (this.C[jSp] - BASELINE[jSp]);
        }
      }
      dC[sp] = dci;
    }
    
    for (const sp of SPECIES) {
      this.C[sp] = Math.max(0.10, Math.min(4.0, this.C[sp] + DELTA_T * dC[sp]));
    }
    
    return this.getState();
  }

  stimulus(type) {
    const row = STIMULUS_TABLE[type];
    if (!row) return;
    for (const [sp, delta] of Object.entries(row)) {
      this.C[sp] = Math.max(0.10, Math.min(4.0, this.C[sp] + delta));
    }
  }

  hill(C, Kd, n) {
    const Cn = Math.pow(Math.max(0, C), n);
    const Kdn = Math.pow(Kd, n);
    return Cn / (Kdn + Cn);
  }

  getReceptorOccupancies() {
    return {
      oDA:  this.hill(this.C.DA, 1.0, 2),
      oSE:  this.hill(this.C.SE, 1.0, 1),
      oNE:  this.hill(this.C.NE, 1.0, 2),
      oCO:  this.hill(this.C.CO, 1.0, 1),
      oACh: this.hill(this.C.ACh, 1.0, 1),
      oOX:  this.hill(this.C.OX, 0.8, 2),
    };
  }

  getState() {
    const occ = this.getReceptorOccupancies();
    const energy = Math.round(Math.min(100, Math.max(0,
      occ.oDA * 35 + occ.oNE * 25 + occ.oSE * 20 + occ.oACh * 10 + occ.oOX * 10 - occ.oCO * 30 + 30
    )));
    
    return {
      concentrations: { ...this.C },
      occupancies: occ,
      energy,
      tick: this.totalTicks,
      heartbeat: HEARTBEAT,
      phi: PHI
    };
  }
}

export { NeurochemistryODEProtocol, SPECIES, STIMULUS_TABLE };
export default NeurochemistryODEProtocol;
