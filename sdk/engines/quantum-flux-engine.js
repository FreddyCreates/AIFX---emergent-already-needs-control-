/**
 * QUANTUM FLUX ENGINE — Randomness & Entropy Physics
 * 
 * The foundational "physics" of randomness in the Civitas system.
 * All agents use QUANTUM_FLUX for stochastic processes, entropy, and unpredictability.
 * 
 * Features:
 *   - Phi-weighted random distributions
 *   - Controlled entropy generation
 *   - Gaussian and phi-normal distributions
 *   - Seed management for reproducibility
 *   - Quantum-inspired superposition states
 */

const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;
const GOLDEN_ANGLE_RAD = 137.508 * (Math.PI / 180);

class QuantumFluxEngine {
  constructor(seed = null) {
    this.seed = seed || Date.now();
    this.state = this.seed;
    this.callCount = 0;
    this.entropyPool = [];
    this.entropyPoolSize = 256;
    
    // Initialize entropy pool
    this.fillEntropyPool();
  }

  // ── Core Random Functions ──────────────────────────────────────────────

  /**
   * Phi-LCG (Linear Congruential Generator)
   * Uses phi-derived constants for better distribution
   */
  nextRaw() {
    // Phi-derived multiplier and increment
    const a = Math.floor(PHI * 1e9) % (2 ** 32);  // ~1618033988
    const c = Math.floor(PHI_INV * 1e9) % (2 ** 32);  // ~618033988
    const m = 2 ** 32;
    
    this.state = (a * this.state + c) % m;
    this.callCount++;
    
    return this.state / m;
  }

  /**
   * Get random float [0, 1)
   */
  random() {
    return this.nextRaw();
  }

  /**
   * Get random float [min, max)
   */
  range(min, max) {
    return min + this.nextRaw() * (max - min);
  }

  /**
   * Get random integer [min, max]
   */
  int(min, max) {
    return Math.floor(this.range(min, max + 1));
  }

  /**
   * Get random boolean with given probability
   */
  bool(probability = 0.5) {
    return this.nextRaw() < probability;
  }

  /**
   * Pick random element from array
   */
  pick(array) {
    if (array.length === 0) return undefined;
    return array[Math.floor(this.nextRaw() * array.length)];
  }

  /**
   * Shuffle array in place (Fisher-Yates)
   */
  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(this.nextRaw() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // ── Phi-Weighted Distributions ─────────────────────────────────────────

  /**
   * Phi-weighted random — biased toward golden ratio
   * Returns values clustered around PHI_INV (~0.618)
   */
  phiRandom() {
    const u1 = this.nextRaw();
    const u2 = this.nextRaw();
    
    // Blend two uniforms with phi weighting
    return u1 * PHI_INV + u2 * (1 - PHI_INV);
  }

  /**
   * Phi-normal distribution
   * Gaussian centered at PHI_INV with phi-scaled variance
   */
  phiNormal(mean = PHI_INV, stdDev = 0.1) {
    // Box-Muller transform
    const u1 = this.nextRaw();
    const u2 = this.nextRaw();
    
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + z0 * stdDev * PHI_INV;
  }

  /**
   * Standard Gaussian distribution
   */
  gaussian(mean = 0, stdDev = 1) {
    const u1 = this.nextRaw();
    const u2 = this.nextRaw();
    
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + z0 * stdDev;
  }

  /**
   * Phi-exponential distribution
   * Decay rate determined by phi
   */
  phiExponential() {
    return -Math.log(this.nextRaw()) / PHI;
  }

  /**
   * Golden angle distribution
   * Points distributed by golden angle on unit circle
   */
  goldenAngle(index) {
    const angle = index * GOLDEN_ANGLE_RAD;
    return {
      angle: angle % (2 * Math.PI),
      x: Math.cos(angle),
      y: Math.sin(angle),
    };
  }

  /**
   * Phi-spiral point
   * Generates points on a phi-spiral
   */
  phiSpiral(index, scale = 1) {
    const angle = index * GOLDEN_ANGLE_RAD;
    const radius = Math.sqrt(index) * scale * PHI_INV;
    return {
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle),
      radius,
      angle,
    };
  }

  // ── Entropy Management ─────────────────────────────────────────────────

  /**
   * Fill entropy pool with random bytes
   */
  fillEntropyPool() {
    this.entropyPool = [];
    for (let i = 0; i < this.entropyPoolSize; i++) {
      this.entropyPool.push(Math.floor(this.nextRaw() * 256));
    }
  }

  /**
   * Get entropy byte from pool
   */
  getEntropyByte() {
    if (this.entropyPool.length === 0) {
      this.fillEntropyPool();
    }
    return this.entropyPool.pop();
  }

  /**
   * Get N entropy bytes
   */
  getEntropyBytes(n) {
    const bytes = [];
    for (let i = 0; i < n; i++) {
      bytes.push(this.getEntropyByte());
    }
    return bytes;
  }

  /**
   * Mix external entropy source
   */
  mixEntropy(externalEntropy) {
    // XOR with current state
    if (typeof externalEntropy === 'number') {
      this.state ^= Math.floor(externalEntropy) % (2 ** 32);
    } else if (typeof externalEntropy === 'string') {
      let hash = 0;
      for (let i = 0; i < externalEntropy.length; i++) {
        hash = ((hash << 5) - hash + externalEntropy.charCodeAt(i)) | 0;
      }
      this.state ^= hash;
    }
    
    // Re-fill entropy pool
    this.fillEntropyPool();
  }

  /**
   * Calculate current entropy level (0-1)
   */
  getEntropyLevel() {
    // Estimate based on pool diversity
    const unique = new Set(this.entropyPool).size;
    return unique / 256;
  }

  // ── Quantum-Inspired Operations ────────────────────────────────────────

  /**
   * Superposition state
   * Returns array of probability-weighted options
   */
  superposition(options, probabilities = null) {
    const probs = probabilities || options.map(() => 1 / options.length);
    
    return options.map((option, i) => ({
      value: option,
      probability: probs[i],
      amplitude: Math.sqrt(probs[i]),
    }));
  }

  /**
   * Collapse superposition to single value
   */
  collapse(superposition) {
    let sum = 0;
    const r = this.nextRaw();
    
    for (const state of superposition) {
      sum += state.probability;
      if (r < sum) {
        return state.value;
      }
    }
    
    return superposition[superposition.length - 1].value;
  }

  /**
   * Quantum walk step
   * Simulates quantum random walk behavior
   */
  quantumWalk(position, coinState = null) {
    // Hadamard-like coin flip
    const coin = coinState ?? this.phiRandom();
    const direction = coin > PHI_INV ? 1 : -1;
    
    // Phi-weighted step size
    const stepSize = this.phiExponential() * 0.1;
    
    return {
      position: position + direction * stepSize,
      coinState: coin,
      direction,
    };
  }

  // ── Seed Management ────────────────────────────────────────────────────

  /**
   * Set seed for reproducibility
   */
  setSeed(seed) {
    this.seed = seed;
    this.state = seed;
    this.callCount = 0;
    this.fillEntropyPool();
  }

  /**
   * Get current seed
   */
  getSeed() {
    return this.seed;
  }

  /**
   * Fork the RNG with a derived seed
   */
  fork() {
    const newSeed = Math.floor(this.state * PHI) ^ Date.now();
    return new QuantumFluxEngine(newSeed);
  }

  // ── Status & Utilities ─────────────────────────────────────────────────

  /**
   * Get engine status
   */
  getStatus() {
    return {
      seed: this.seed,
      state: this.state,
      callCount: this.callCount,
      entropyPoolSize: this.entropyPool.length,
      entropyLevel: this.getEntropyLevel(),
      constants: { PHI, PHI_INV, GOLDEN_ANGLE_RAD },
    };
  }

  /**
   * Generate UUID using phi-random
   */
  uuid() {
    const bytes = this.getEntropyBytes(16);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;  // Version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80;  // Variant
    
    const hex = bytes.map(b => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  /**
   * Generate phi-hash from string
   */
  phiHash(input) {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      hash = ((hash << 5) - hash + input.charCodeAt(i)) | 0;
      hash = Math.floor(hash * PHI) % (2 ** 32);
    }
    return Math.abs(hash);
  }
}

// Export singleton and class
const quantumFluxEngine = new QuantumFluxEngine();

export { QuantumFluxEngine, quantumFluxEngine };
export default quantumFluxEngine;
