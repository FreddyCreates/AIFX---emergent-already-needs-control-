/**
 * CORE ENGINES INDEX
 * 
 * The 4 foundational "physics" engines of Civitas:
 *   - CHRONO: Time & Scheduling
 *   - NEXORIS: State Management
 *   - QUANTUM_FLUX: Randomness & Entropy
 *   - COREOGRAPH: Orchestration
 * 
 * These are the substrate on which all agents operate.
 */

export { ChronoEngine, chronoEngine, PHI, PHI_INV, HEARTBEAT_MS, GOLDEN_ANGLE } from './chrono-engine.js';
export { NexorisEngine, nexorisEngine, REGISTERS, DIMENSIONS } from './nexoris-engine.js';
export { QuantumFluxEngine, quantumFluxEngine } from './quantum-flux-engine.js';
export { CoreographEngine, coreographEngine, PRIORITY } from './coreograph-engine.js';

// Re-export singletons as default engines
export const CHRONO = chronoEngine;
export const NEXORIS = nexorisEngine;
export const QUANTUM_FLUX = quantumFluxEngine;
export const COREOGRAPH = coreographEngine;

// Constants
export const ENGINE_CONSTANTS = {
  PHI: 1.618033988749895,
  PHI_INV: 1 / 1.618033988749895,
  HEARTBEAT_MS: 873,
  GOLDEN_ANGLE: 137.508,
  EMERGENCE_THRESHOLD: 0.618033988749895,
};

// Engine factory for creating isolated instances
export function createEngines() {
  return {
    chrono: new ChronoEngine(),
    nexoris: new NexorisEngine(),
    quantumFlux: new QuantumFluxEngine(),
    coreograph: new CoreographEngine(),
  };
}
