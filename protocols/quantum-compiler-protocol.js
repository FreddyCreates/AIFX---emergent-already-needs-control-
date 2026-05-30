/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  PROTO-246: Quantum Compiler Protocol                                     ║
 * ║  Multi-language compilation, transpilation, and binding generation         ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * Governs how compilation jobs are dispatched, cached, and optimized
 * across the Kingdom's polyglot infrastructure.
 *
 * @module protocols/quantum-compiler-protocol
 * @version 1.0.0
 */

const PHI = 1.618033988749895;
const HEARTBEAT = 873;

// ─── Protocol States ─────────────────────────────────────────────────────────
export const COMPILER_PROTOCOL_STATES = {
  READY: 'ready',
  COMPILING: 'compiling',
  CACHING: 'caching',
  DISTRIBUTING: 'distributing',
  ERROR: 'error'
};

// ─── Supported Languages ─────────────────────────────────────────────────────
export const SUPPORTED_LANGUAGES = {
  MOTOKO: { id: 'motoko', canister: true, wasm: true },
  JULIA: { id: 'julia', canister: false, wasm: false },
  RUST: { id: 'rust', canister: true, wasm: true },
  JAVASCRIPT: { id: 'javascript', canister: false, wasm: false },
  TYPESCRIPT: { id: 'typescript', canister: false, wasm: false },
  PYTHON: { id: 'python', canister: false, wasm: true },
  CANDID: { id: 'candid', canister: true, wasm: false }
};

// ─── Configuration ───────────────────────────────────────────────────────────
export const COMPILER_CONFIG = {
  maxConcurrentJobs: 8,
  cacheMaxEntries: 10000,
  cacheTTL: 86400000, // 24 hours
  optimizationLevels: 5,
  heartbeatInterval: HEARTBEAT,
  phiCacheDecay: 1 / PHI
};

// ─── Message Types ───────────────────────────────────────────────────────────
export const MESSAGE_TYPES = {
  COMPILE_REQUEST: 'compiler.compile.request',
  COMPILE_RESULT: 'compiler.compile.result',
  TRANSPILE_REQUEST: 'compiler.transpile.request',
  TRANSPILE_RESULT: 'compiler.transpile.result',
  BINDING_REQUEST: 'compiler.binding.request',
  BINDING_RESULT: 'compiler.binding.result',
  CACHE_HIT: 'compiler.cache.hit',
  CACHE_MISS: 'compiler.cache.miss',
  STATUS: 'compiler.status'
};

/**
 * Calculate compilation priority based on language and target
 */
export function calculateCompilePriority(language, target, queueDepth) {
  const langWeight = SUPPORTED_LANGUAGES[language.toUpperCase()]?.canister ? PHI : 1.0;
  const urgency = 1 / (queueDepth + 1);
  return langWeight * urgency * PHI;
}

/**
 * Calculate cache eviction score (lower = evict first)
 */
export function calculateCacheScore(hitCount, age, size) {
  const recency = 1 / (age / 1000 + 1);
  const frequency = Math.log2(hitCount + 1);
  return (recency * PHI + frequency) / (Math.log2(size + 1));
}

/**
 * QuantumCompilerProtocol — Main protocol class
 */
export class QuantumCompilerProtocol {
  constructor(config = {}) {
    this.config = { ...COMPILER_CONFIG, ...config };
    this.state = COMPILER_PROTOCOL_STATES.READY;
    this.stats = { compiled: 0, transpiled: 0, bindings: 0, cacheHits: 0, errors: 0 };
  }

  getStatus() {
    return { state: this.state, stats: this.stats, config: this.config };
  }
}
