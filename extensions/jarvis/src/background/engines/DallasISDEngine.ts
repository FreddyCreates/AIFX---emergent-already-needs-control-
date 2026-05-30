/**
 * DALLAS ISD SOVEREIGN SCHOOL ENGINE
 * 
 * phi = (1 + sqrt(5)) / 2
 * 
 * Free public knowledge organism. No login. Each school = sovereign canister.
 * 
 * LEARNING MATHEMATICS:
 * Growth spiral: G(t) = G0 * phi^(t/T)
 * Mastery sigmoid: M(x) = 1 / (1 + e^(-phi * (x - phi^-1)))
 * Engagement decay: E(t) = E0 * phi^(-t/halfLife)
 */

import { phi, Phi, OrganismEngine, OrganismState, Register, MeanReversionParams } from './OrganismCore.js';

// LEARNING MATHEMATICS
const Learning = {
  // Growth spiral: G(t) = G0 * phi^(t/T)
  growth: (G0: number, t: number, T: number = 90 * 86400): number => {
    return G0 * Math.pow(phi, t / T);
  },

  // Mastery sigmoid: M(x) = 1 / (1 + e^(-phi * (x - phi^-1)))
  mastery: (x: number): number => {
    return 1 / (1 + Math.exp(-phi * (x - Phi.inv)));
  },

  // Engagement decay: E(t) = E0 * phi^(-t/halfLife)
  engagement: (E0: number, t: number, halfLife: number = 7 * 86400): number => {
    return E0 * Math.pow(phi, -t / halfLife);
  },

  // phi-weighted average of scores
  weightedAverage: (scores: number[], weights?: number[]): number => {
    if (!weights) {
      weights = scores.map((_, i) => Math.pow(phi, i));
    }
    let num = 0, den = 0;
    for (let i = 0; i < scores.length; i++) {
      num += scores[i] * weights[i];
      den += weights[i];
    }
    return den > 0 ? num / den : 0;
  }
};

// SCHOOL STATE
interface SchoolState {
  id: string;
  students: number;
  educators: number;
  resonance: number;
  cognitive: number;
  affective: number;
  somatic: number;
  sovereign: number;
}

// TEKS MAPPING
interface TEKSStandard {
  code: string;
  domain: string;
  strand: string;
  grade: number;
  difficulty: number;
  weight: number;
  prerequisites: string[];
}

const computeTEKSWeight = (grade: number, difficulty: number): number => {
  return Math.pow(phi, grade - 1) * difficulty;
};

// DALLAS ISD PARAMETERS
const DISD_PARAMS: MeanReversionParams = {
  theta: {
    cognitive: Phi.inv * Math.LN2 / (90 * 86400),    // 90 day half-life
    affective: Phi.inv * Math.LN2 / (30 * 86400),    // 30 day half-life
    somatic:   Phi.inv * Math.LN2 / (7 * 86400),     // 7 day half-life
    sovereign: Phi.inv * Math.LN2 / (365 * 86400),   // 1 year half-life
  },
  J: {
    cognitive: { affective: +Phi.inv * 2e-6, somatic: +Phi.inv * 1e-6, sovereign: +Phi._1 * 1.5e-6 },
    affective: { cognitive: +Phi.inv * 1.5e-6, somatic: +Phi.inv * 0.8e-6, sovereign: +Phi.inv * 1e-6 },
    somatic:   { cognitive: +Phi._1 * 0.5e-6, affective: +Phi._1 * 1e-6, sovereign: +Phi.inv * 0.5e-6 },
    sovereign: { cognitive: +Phi._1 * 2e-6, affective: +Phi._1 * 1.5e-6, somatic: +Phi._1 * 0.8e-6 },
  },
  mu: 1.0
};

// THE ENGINE
class DallasISDEngine extends OrganismEngine {
  protected params = DISD_PARAMS;
  
  private schools: Map<string, SchoolState> = new Map();
  private TEKS: Map<string, TEKSStandard> = new Map();
  private totalStudents: number = 0;
  private totalEducators: number = 0;
  
  constructor() {
    super('DISD', 'Dallas ISD Sovereign School Engine');
    this.initTEKS();
    this.seedRegions();
  }
  
  private initTEKS(): void {
    const domains = ['ELA', 'MATH', 'SCI', 'SOC'];
    const strands: Record<string, string[]> = {
      'ELA': ['Reading', 'Writing', 'Speaking', 'Listening'],
      'MATH': ['NumberOps', 'Algebra', 'Geometry', 'DataAnalysis'],
      'SCI': ['Physics', 'Chemistry', 'Biology', 'EarthSpace'],
      'SOC': ['History', 'Geography', 'Government', 'Economics'],
    };

    for (const domain of domains) {
      for (const strand of strands[domain]) {
        for (let grade = 1; grade <= 12; grade++) {
          const difficulty = (strand.length % 3 + 1) / 3;
          const code = `${domain}.${grade}.${strand.slice(0, 3).toUpperCase()}`;
          this.TEKS.set(code, {
            code,
            domain,
            strand,
            grade,
            difficulty,
            weight: computeTEKSWeight(grade, difficulty),
            prerequisites: grade > 1 ? [`${domain}.${grade - 1}.${strand.slice(0, 3).toUpperCase()}`] : [],
          });
        }
      }
    }
  }
  
  private seedRegions(): void {
    const regions = [
      { id: 'north', name: 'North Region', students: 28500, educators: 1900 },
      { id: 'south', name: 'South Region', students: 31200, educators: 2100 },
      { id: 'east', name: 'East Region', students: 24800, educators: 1650 },
      { id: 'west', name: 'West Region', students: 27600, educators: 1840 },
      { id: 'central', name: 'Central Region', students: 18900, educators: 1260 },
    ];
    
    for (const r of regions) {
      this.registerSchool(r.id, r.name, r.students, r.educators);
    }
  }
  
  protected pulse(): void {
    super.pulse();
    
    // Update school resonances
    for (const [id, school] of this.schools) {
      school.resonance = Learning.weightedAverage([
        school.cognitive, school.affective, school.somatic, school.sovereign
      ], [Phi._1, 1, Phi.inv, Phi._1]);
    }

    // Update totals
    this.totalStudents = Array.from(this.schools.values()).reduce((a, s) => a + s.students, 0);
    this.totalEducators = Array.from(this.schools.values()).reduce((a, s) => a + s.educators, 0);
  }
  
  // Register school (each school = sovereign canister)
  registerSchool(id: string, name: string, students: number, educators: number): void {
    this.schools.set(id, {
      id,
      students,
      educators,
      resonance: Phi.inv,
      cognitive: Phi.inv,
      affective: Phi.inv,
      somatic: 1.0,
      sovereign: Phi.inv2,
    });

    this._state.affective.awareness = Math.min(Phi._2, this._state.affective.awareness + 0.01 * Phi.inv);
  }
  
  // Learning event (student interacts with content)
  learning(schoolId: string, teksCode: string, score: number): void {
    const school = this.schools.get(schoolId);
    const teks = this.TEKS.get(teksCode);
    if (!school || !teks) return;

    const delta = (score - 0.5) * teks.weight * Phi.inv * 0.001;
    school.cognitive = Math.max(0, Math.min(Phi._2, school.cognitive + delta));
    this._state.cognitive.resonance = Math.min(Phi._2, this._state.cognitive.resonance + 0.0001 * Phi.inv);
  }
  
  // Get TEKS by domain and grade
  getTEKS(domain?: string, grade?: number): TEKSStandard[] {
    return Array.from(this.TEKS.values()).filter(t =>
      (!domain || t.domain === domain) && (!grade || t.grade === grade)
    );
  }
  
  // State snapshot
  getState(): OrganismState & { 
    rho: number; 
    teksCount: number;
    schools: SchoolState[];
    totalStudents: number;
    totalEducators: number;
  } {
    return {
      ...this._state,
      rho: this.R(),
      teksCount: this.TEKS.size,
      schools: Array.from(this.schools.values()),
      totalStudents: this.totalStudents,
      totalEducators: this.totalEducators,
    };
  }
}

// SINGLETON & AUTO-START
export const DISD = new DallasISDEngine();

if (typeof globalThis !== 'undefined') {
  DISD.activate();
}

export { phi, Phi, Learning, computeTEKSWeight, DallasISDEngine };
