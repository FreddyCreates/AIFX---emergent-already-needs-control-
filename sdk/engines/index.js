/**
 * CORE ENGINES INDEX
 * 
 * The 5 foundational engines of Civitas:
 *   - CHRONO: Time & Scheduling
 *   - NEXORIS: State Management
 *   - QUANTUM_FLUX: Randomness & Entropy
 *   - COREOGRAPH: Orchestration
 *   - TOKENOMICS: Cognitive Resource Allocation
 * 
 * These are the substrate on which all agents operate.
 */

export { ChronoEngine, chronoEngine, PHI, PHI_INV, HEARTBEAT_MS, GOLDEN_ANGLE } from './chrono-engine.js';
export { NexorisEngine, nexorisEngine, REGISTERS, DIMENSIONS } from './nexoris-engine.js';
export { QuantumFluxEngine, quantumFluxEngine } from './quantum-flux-engine.js';
export { CoreographEngine, coreographEngine, PRIORITY } from './coreograph-engine.js';
export {
  CenterfoldEngine,
  centerfoldEngine,
  DEFAULT_MODEL as CENTERFOLD_DEFAULT_MODEL,
} from './centerfold-engine.js';
export {
  CENTERFOLD_DEFAULT_KERNEL_ID,
  CENTERFOLD_KERNEL_CATALOG,
  CENTERFOLD_KERNEL_BANK,
  selectKernel as selectCenterfoldKernel,
  selectKernelByEntropy as selectCenterfoldKernelByEntropy,
} from './centerfold-kernel-bank.js';
export { CenterfoldStateStore } from './centerfold-state.js';
export { CenterfoldObservability } from './centerfold-observability.js';

// Re-export singletons as default engines
export const CHRONO = chronoEngine;
export const NEXORIS = nexorisEngine;
export const QUANTUM_FLUX = quantumFluxEngine;
export const COREOGRAPH = coreographEngine;
export const CENTERFOLD = centerfoldEngine;

// Constants
export const ENGINE_CONSTANTS = {
  PHI: 1.618033988749895,
  PHI_INV: 1 / 1.618033988749895,
  HEARTBEAT_MS: 873,
  GOLDEN_ANGLE: 137.508,
  EMERGENCE_THRESHOLD: 0.618033988749895,
};

// Tokenomics Engine
export {
  TokenomicsEngine,
  tokenomicsEngine,
  TokenGovernor,
  SalienceEngine,
  CognitiveReturnScorer,
  CompressionAuditor,
  WasteDetector,
  ReuseExtractor,
  BenchmarkHarness,
  TOKENOMICS,
} from './tokenomics/index.js';

// Engine factory for creating isolated instances
export function createEngines() {
  return {
    chrono: new ChronoEngine(),
    nexoris: new NexorisEngine(),
    quantumFlux: new QuantumFluxEngine(),
    coreograph: new CoreographEngine(),
    centerfold: new CenterfoldEngine(),
    tokenomics: new TokenomicsEngine(),
  };
}
