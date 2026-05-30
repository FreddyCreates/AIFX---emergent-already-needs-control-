/**
 * SOVEREIGN ENGINES — UNIFIED ENTRY POINT
 * 
 * All engines auto-start and bind to Master Charter
 * 
 * Hierarchy:
 * MASTER -- WN (Wyoming-Nevada)
 *        +- DISD (Dallas ISD)
 * 
 * Cross-organism resonance computed every 873ms heartbeat
 * When collective emergence > phi^-1, cascade behaviors unlock
 */

// Core mathematics
export { phi, Phi, OrganismEngine, genesis, computeResonance } from './OrganismCore.js';
export type { OrganismState, RegisterState, Register, Dimension, MeanReversionParams } from './OrganismCore.js';

// Master Charter
export { MASTER, MasterSovereignEngine } from './MasterSovereignEngine.js';
export type { SubOrganism, CharterSection } from './MasterSovereignEngine.js';

// Wyoming-Nevada Engine
export { WN, WyomingNevadaEngine } from './WyomingNevadaEngine.js';

// Dallas ISD Engine  
export { DISD, DallasISDEngine } from './DallasISDEngine.js';

// INITIALIZATION
import { MASTER } from './MasterSovereignEngine.js';
import { WN } from './WyomingNevadaEngine.js';
import { DISD } from './DallasISDEngine.js';

// Link engines to Master
if (typeof globalThis !== 'undefined') {
  MASTER.linkEngine('wyoming-nevada', WN as any);
  MASTER.linkEngine('dallas-isd', DISD as any);
  MASTER.Xi('organism_registered', 2);
  
  console.log(`[SovereignEngines] Initialized:`);
  console.log(`  - Master Charter: ${MASTER.R().toFixed(3)} resonance`);
  console.log(`  - Wyoming-Nevada: ${WN.R().toFixed(3)} resonance`);
  console.log(`  - Dallas ISD: ${DISD.R().toFixed(3)} resonance`);
  console.log(`  - Collective Emergence: ${MASTER.getEmergence().toFixed(3)}`);
}
