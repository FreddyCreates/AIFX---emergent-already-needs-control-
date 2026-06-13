/**
 * TOKENOMICS ENGINE — Module Index
 *
 * The 7 core modules of the Tokenomic Runtime:
 *   - TOKEN_GOVERNOR: Controls max token budget by task type
 *   - SALIENCE: Ranks what deserves attention
 *   - COGNITIVE_RETURN: Scores output usefulness
 *   - COMPRESSION: Audits meaning preservation
 *   - WASTE: Detects redundancy and filler
 *   - REUSE: Extracts rules/templates/memory
 *   - BENCHMARK: Runs tokenomic vs. non-tokenomic comparisons
 *
 * Plus the orchestrating TOKENOMICS engine that runs the full loop.
 */

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
} from './tokenomics-engine.js';

export { DEFAULT_BUDGETS, RISK_MULTIPLIERS } from './token-governor.js';
export { DEFAULT_WEIGHTS } from './salience-engine.js';
export { WASTE_PATTERNS } from './waste-detector.js';
export { ARTIFACT_TYPES } from './reuse-extractor.js';
export { TASK_CLASSES } from './benchmark-harness.js';

// Singleton
import { tokenomicsEngine } from './tokenomics-engine.js';
export const TOKENOMICS = tokenomicsEngine;

export default tokenomicsEngine;
