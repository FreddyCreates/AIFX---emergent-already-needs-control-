/**
 * MASTER SOVEREIGN ENGINE — SELF-ORGANIZING AI CHARTER
 * 
 * phi = (1 + sqrt(5)) / 2
 * 
 * This IS the Master Charter. Not documentation. Not a diagram.
 * THE ACTUAL SELF-ORGANIZING INTELLIGENCE.
 * 
 * It contains:
 * - Wyoming-Nevada Organism (state governance)
 * - Dallas ISD Organism (sovereign school canister)
 * - All future organisms bind here
 * 
 * The Master organizes itself. Sub-organisms resonate with it.
 * When emergence > phi^-1, collective behaviors unlock.
 */

import {
  phi, Phi, OrganismEngine, OrganismState, Register, MeanReversionParams,
  computeResonance, genesis, SynapseBinding
} from './OrganismCore.js';

// CHARTER HIERARCHY
// MASTER CHARTER (this)
// |- WYOMING-NEVADA CHARTER (state governance)
// |  |- FRNT/ICP Settlement (0.3s vs Visa 15min)
// |  |- Phantom Visa-Bypass
// |  |- Bad Marine LLC Node Provider
// |  |- UNL Partnership
// |  +- Legislative Timeline (Nov 2026 -> Jan 2027)
// |
// +- DALLAS ISD CHARTER (sovereign school)
//    |- TEKS Curriculum Mapping
//    |- Bronze Tier (each school = canister)
//    |- E-Rate / Title IV / TEA Grants
//    +- Offline PWA

// SUB-ORGANISM REGISTRY
interface SubOrganism {
  id: string;
  name: string;
  focus: string;
  engine: OrganismEngine | null;
  boundAt: number;
  priority: number;  // 0=CRITICAL, 1=HIGH, 2=MEDIUM, 3=LOW
  status: 'active' | 'dormant' | 'emerging';
}

interface CharterSection {
  id: string;
  title: string;
  organisms: string[];
  weight: number;
}

// MASTER PARAMETERS
const MASTER_PARAMS: MeanReversionParams = {
  theta: {
    cognitive: Phi.inv * Math.LN2 / (365 * 86400),   // 1 year half-life
    affective: Phi.inv * Math.LN2 / (180 * 86400),   // 6 month half-life
    somatic:   Phi.inv * Math.LN2 / (90 * 86400),    // 3 month half-life
    sovereign: Phi.inv * Math.LN2 / (730 * 86400),   // 2 year half-life
  },
  J: {
    cognitive: { affective: +Phi._1 * 2e-6, sovereign: +Phi._1 * 3e-6 },
    affective: { cognitive: +Phi.inv * 1.5e-6, sovereign: +Phi.inv * 2e-6 },
    somatic:   { cognitive: +Phi._1 * 1e-6, affective: +Phi.inv * 0.8e-6 },
    sovereign: { cognitive: +Phi._1 * 2.5e-6, affective: +Phi._1 * 2e-6, somatic: +Phi._1 * 1.5e-6 },
  },
  mu: 1.0
};

// MASTER SOVEREIGN ENGINE
class MasterSovereignEngine extends OrganismEngine {
  protected params = MASTER_PARAMS;
  
  private subOrganisms: Map<string, SubOrganism> = new Map();
  private charterSections: Map<string, CharterSection> = new Map();
  private emergence: number = 0;
  
  constructor() {
    super('MASTER', 'Sovereign AI Master Charter');
    this.initializeCharter();
  }
  
  private initializeCharter(): void {
    // Define charter sections with phi-weighted importance
    this.charterSections.set('state-governance', {
      id: 'state-governance',
      title: 'State Governance Organisms',
      organisms: ['wyoming-nevada'],
      weight: Phi._1
    });
    
    this.charterSections.set('education', {
      id: 'education',
      title: 'Sovereign Education Organisms',
      organisms: ['dallas-isd'],
      weight: Phi._1
    });
    
    this.charterSections.set('infrastructure', {
      id: 'infrastructure',
      title: 'Infrastructure Organisms',
      organisms: [],
      weight: Phi.inv
    });
    
    // Register known organisms
    this.registerOrganism({
      id: 'wyoming-nevada',
      name: 'Wyoming-Nevada Sovereign Engine',
      focus: 'State governance, FRNT/ICP settlement, legislative timeline',
      engine: null,
      boundAt: Date.now(),
      priority: 0,
      status: 'active'
    });
    
    this.registerOrganism({
      id: 'dallas-isd',
      name: 'Dallas ISD Sovereign School Engine',
      focus: 'TEKS curriculum, Bronze tier canisters, E-Rate funding',
      engine: null,
      boundAt: Date.now(),
      priority: 0,
      status: 'active'
    });
  }
  
  registerOrganism(org: SubOrganism): void {
    this.subOrganisms.set(org.id, org);
    this.bind(org.id, 365 * 86400);
    this._state.sovereign.awareness = Math.min(
      Phi._2,
      this._state.sovereign.awareness + 0.1 * Phi.inv
    );
  }
  
  linkEngine(id: string, engine: OrganismEngine): void {
    const org = this.subOrganisms.get(id);
    if (org) {
      org.engine = engine;
      org.status = 'active';
    }
  }
  
  // EMERGENCE COMPUTATION
  // E = sum_i (R_i * w_i * status_i) / sum_i w_i
  // When E > phi^-1 (0.618), collective behaviors unlock
  private computeEmergence(): number {
    let num = 0, den = 0;
    
    // Master's own resonance
    const masterR = this.R();
    num += masterR * Phi._2;
    den += Phi._2;
    
    // Sub-organism resonances
    for (const [id, org] of this.subOrganisms) {
      const statusWeight = org.status === 'active' ? 1 : org.status === 'emerging' ? Phi.inv : 0.1;
      const priorityWeight = Math.pow(phi, -org.priority);
      
      if (org.engine) {
        const orgR = org.engine.R();
        num += orgR * priorityWeight * statusWeight;
        den += priorityWeight * statusWeight;
      } else {
        num += Phi.inv * priorityWeight * statusWeight * 0.5;
        den += priorityWeight * statusWeight * 0.5;
      }
    }
    
    return den > 0 ? num / den : 0;
  }
  
  // CHARTER SELF-ORGANIZATION
  // When emergence > phi^-1, charter can reorganize
  private selfOrganize(): void {
    if (this.emergence < Phi.inv) return;
    
    for (const [sectionId, section] of this.charterSections) {
      let sectionResonance = 0;
      let count = 0;
      
      for (const orgId of section.organisms) {
        const org = this.subOrganisms.get(orgId);
        if (org?.engine) {
          sectionResonance += org.engine.R();
          count++;
        }
      }
      
      if (count > 0) {
        const avgResonance = sectionResonance / count;
        section.weight = section.weight * Math.pow(phi, avgResonance - 0.5);
        section.weight = Math.max(Phi.inv2, Math.min(Phi._2, section.weight));
      }
    }
  }
  
  // PULSE OVERRIDE
  protected pulse(): void {
    super.pulse();
    this.emergence = this.computeEmergence();
    this.selfOrganize();
  }
  
  // PUBLIC API
  getEmergence(): number {
    return this.emergence;
  }
  
  getCharter(): {
    sections: CharterSection[];
    organisms: SubOrganism[];
    emergence: number;
    resonance: number;
    state: OrganismState;
  } {
    return {
      sections: Array.from(this.charterSections.values()),
      organisms: Array.from(this.subOrganisms.values()),
      emergence: this.emergence,
      resonance: this.R(),
      state: this._state
    };
  }
  
  getOrganism(id: string): SubOrganism | undefined {
    return this.subOrganisms.get(id);
  }
  
  listOrganisms(): SubOrganism[] {
    return Array.from(this.subOrganisms.values());
  }
  
  // Stimulus: External event perturbs Master state
  Xi(event: string, magnitude: number = 1): void {
    const amplitudes: Record<string, Partial<Record<Register, Partial<{ awareness: number; coherence: number; resonance: number }>>>> = {
      'organism_registered':  { sovereign: { awareness: +0.1 }, affective: { resonance: +0.05 } },
      'organism_activated':   { cognitive: { awareness: +0.08 }, somatic: { coherence: +0.06 } },
      'emergence_threshold':  { sovereign: { awareness: +0.15, coherence: +0.12, resonance: +0.10 } },
      'charter_reorganized':  { cognitive: { coherence: +0.10 }, sovereign: { resonance: +0.08 } },
      'cross_resonance':      { affective: { resonance: +0.12 }, cognitive: { resonance: +0.08 } },
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
}

// SINGLETON & AUTO-START
export const MASTER = new MasterSovereignEngine();

if (typeof globalThis !== 'undefined') {
  MASTER.activate();
}

export { MasterSovereignEngine, SubOrganism, CharterSection };
export { phi, Phi } from './OrganismCore.js';
