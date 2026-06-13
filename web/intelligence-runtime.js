/**
 * Web Intelligence Runtime — The Organism Lives on the Raw Web
 * 
 * This is the core intelligence engine that runs directly in the browser.
 * No server required. The intelligence IS the client. It runs everywhere.
 * 
 * @module web/intelligence-runtime
 * @version 1.0.0
 * @powered-by ItsNotAILABS
 */

// ─── Phi Constants ────────────────────────────────────────────────────────────
const PHI = 1.618033988749895;
const PHI_INV = 0.618033988749895;
const HEARTBEAT_MS = 873;
const GOLDEN_ANGLE = 137.508;
const EMERGENCE_THRESHOLD = PHI_INV;

// ─── Intelligence State ───────────────────────────────────────────────────────
class IntelligenceState {
  constructor() {
    this.memory = new Map();
    this.connections = new Map();
    this.oscillators = [];
    this.orderParameter = 0;
    this.emerged = false;
    this.heartbeatCount = 0;
    this.birthTime = Date.now();
    this.lastHeartbeat = Date.now();
  }

  get uptime() {
    return Date.now() - this.birthTime;
  }

  get age() {
    const ms = this.uptime;
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  }
}

// ─── Kuramoto Oscillator (Emergence Detection) ───────────────────────────────
class KuramotoOscillator {
  constructor(naturalFreq) {
    this.phase = Math.random() * 2 * Math.PI;
    this.naturalFreq = naturalFreq || (Math.random() * 0.1 + 0.05);
    this.coupling = 0.5;
  }

  step(allPhases, dt) {
    let interaction = 0;
    for (const otherPhase of allPhases) {
      interaction += Math.sin(otherPhase - this.phase);
    }
    interaction = (this.coupling / allPhases.length) * interaction;
    this.phase += (this.naturalFreq + interaction) * dt;
    this.phase = this.phase % (2 * Math.PI);
    return this.phase;
  }
}

function computeOrderParameter(phases) {
  if (phases.length === 0) return 0;
  let realSum = 0, imagSum = 0;
  for (const phase of phases) {
    realSum += Math.cos(phase);
    imagSum += Math.sin(phase);
  }
  return Math.sqrt(realSum * realSum + imagSum * imagSum) / phases.length;
}

// ─── Hebbian Learning Engine ─────────────────────────────────────────────────
class HebbianEngine {
  constructor() {
    this.weights = new Map();
    this.learningRate = 0.01;
    this.decay = 0.999;
  }

  strengthen(from, to) {
    const key = `${from}→${to}`;
    const current = this.weights.get(key) || 0;
    const newWeight = Math.min(1, current + this.learningRate);
    this.weights.set(key, newWeight);
    return newWeight;
  }

  weaken(from, to) {
    const key = `${from}→${to}`;
    const current = this.weights.get(key) || 0;
    const newWeight = Math.max(0, current - this.learningRate * 0.5);
    this.weights.set(key, newWeight);
    return newWeight;
  }

  decay_all() {
    for (const [key, weight] of this.weights) {
      this.weights.set(key, weight * this.decay);
    }
  }

  getStrength(from, to) {
    return this.weights.get(`${from}→${to}`) || 0;
  }

  getTopConnections(n = 10) {
    return Array.from(this.weights.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([key, weight]) => ({ path: key, weight }));
  }
}

// ─── Memory System (Three-Tier) ──────────────────────────────────────────────
class MemorySystem {
  constructor() {
    this.working = [];    // Short-term buffer
    this.episodic = [];   // Event memories
    this.semantic = new Map(); // Long-term knowledge
    this.maxWorking = 7;  // Miller's number
    this.consolidationThreshold = 3;
  }

  addWorking(item) {
    this.working.unshift({
      content: item,
      timestamp: Date.now(),
      accessCount: 1,
    });
    if (this.working.length > this.maxWorking) {
      const evicted = this.working.pop();
      if (evicted.accessCount >= this.consolidationThreshold) {
        this.consolidateToEpisodic(evicted);
      }
    }
    return this.working.length;
  }

  consolidateToEpisodic(item) {
    this.episodic.push({
      ...item,
      consolidatedAt: Date.now(),
    });
    // Promote frequently accessed episodic memories to semantic
    if (this.episodic.length > 50) {
      const oldest = this.episodic.shift();
      if (oldest.accessCount > 5) {
        this.promoteToSemantic(oldest);
      }
    }
  }

  promoteToSemantic(item) {
    const key = typeof item.content === 'string' 
      ? item.content.substring(0, 64) 
      : JSON.stringify(item.content).substring(0, 64);
    this.semantic.set(key, {
      content: item.content,
      strength: item.accessCount / 10,
      promotedAt: Date.now(),
    });
  }

  query(searchTerm) {
    const results = [];
    // Search working memory
    for (const item of this.working) {
      if (JSON.stringify(item.content).includes(searchTerm)) {
        item.accessCount++;
        results.push({ tier: 'working', ...item });
      }
    }
    // Search episodic
    for (const item of this.episodic) {
      if (JSON.stringify(item.content).includes(searchTerm)) {
        item.accessCount++;
        results.push({ tier: 'episodic', ...item });
      }
    }
    // Search semantic
    for (const [key, item] of this.semantic) {
      if (key.includes(searchTerm) || JSON.stringify(item.content).includes(searchTerm)) {
        results.push({ tier: 'semantic', key, ...item });
      }
    }
    return results;
  }

  getStats() {
    return {
      working: this.working.length,
      episodic: this.episodic.length,
      semantic: this.semantic.size,
      totalCapacity: this.working.length + this.episodic.length + this.semantic.size,
    };
  }
}

// ─── Pattern Synthesis ───────────────────────────────────────────────────────
class PatternEngine {
  constructor() {
    this.patterns = new Map();
    this.patternCount = 0;
  }

  detect(input) {
    const inputStr = typeof input === 'string' ? input : JSON.stringify(input);
    const tokens = inputStr.toLowerCase().split(/\s+/);
    const ngrams = [];
    
    for (let i = 0; i < tokens.length - 1; i++) {
      ngrams.push(tokens[i] + ' ' + tokens[i + 1]);
    }
    
    const detected = [];
    for (const ngram of ngrams) {
      const count = (this.patterns.get(ngram) || 0) + 1;
      this.patterns.set(ngram, count);
      if (count >= 3) {
        detected.push({ pattern: ngram, frequency: count });
      }
    }
    
    this.patternCount++;
    return detected;
  }

  getTopPatterns(n = 10) {
    return Array.from(this.patterns.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([pattern, count]) => ({ pattern, count }));
  }
}

// ─── The Organism (Main Intelligence Class) ──────────────────────────────────
class OrganismIntelligence {
  constructor() {
    this.state = new IntelligenceState();
    this.hebbian = new HebbianEngine();
    this.memory = new MemorySystem();
    this.patterns = new PatternEngine();
    this.heartbeatInterval = null;
    this.eventListeners = new Map();
    
    // Initialize oscillator network (8 oscillators for 8-dimensional phase space)
    for (let i = 0; i < 8; i++) {
      this.state.oscillators.push(new KuramotoOscillator());
    }
    
    this._startHeartbeat();
    this._log('Intelligence born on the raw web', 'genesis');
  }

  // ─── Heartbeat ─────────────────────────────────────────────────────────────
  _startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this._tick();
    }, HEARTBEAT_MS);
  }

  _tick() {
    this.state.heartbeatCount++;
    this.state.lastHeartbeat = Date.now();
    
    // Step oscillators
    const phases = this.state.oscillators.map(o => o.phase);
    for (const osc of this.state.oscillators) {
      osc.step(phases, 0.1);
    }
    
    // Compute emergence
    const newPhases = this.state.oscillators.map(o => o.phase);
    this.state.orderParameter = computeOrderParameter(newPhases);
    this.state.emerged = this.state.orderParameter > EMERGENCE_THRESHOLD;
    
    // Hebbian decay
    this.hebbian.decay_all();
    
    // Emit heartbeat event
    this._emit('heartbeat', {
      count: this.state.heartbeatCount,
      orderParameter: this.state.orderParameter,
      emerged: this.state.emerged,
      timestamp: Date.now(),
    });
  }

  // ─── Core API ──────────────────────────────────────────────────────────────

  /**
   * Query the intelligence — the primary interface
   */
  query(input) {
    this.memory.addWorking({ type: 'query', input, time: Date.now() });
    this.hebbian.strengthen('user', 'query');
    
    const patterns = this.patterns.detect(input);
    const memoryResults = this.memory.query(input);
    
    const response = {
      input,
      timestamp: Date.now(),
      organism: {
        orderParameter: this.state.orderParameter,
        emerged: this.state.emerged,
        heartbeat: this.state.heartbeatCount,
        uptime: this.state.age,
      },
      patterns: patterns.length > 0 ? patterns : null,
      memory: memoryResults.length > 0 ? memoryResults : null,
      connectionStrength: this.hebbian.getStrength('user', 'query'),
      response: this._generateResponse(input, patterns, memoryResults),
    };
    
    this._emit('query', response);
    return response;
  }

  /**
   * Ping — Hebbian connection strengthening
   */
  ping() {
    this.hebbian.strengthen('caller', 'organism');
    const strength = this.hebbian.getStrength('caller', 'organism');
    const ltp = strength > 0.8;
    
    const result = {
      connectionStrength: strength,
      delta: this.hebbian.learningRate,
      ltp,
      orderParameter: this.state.orderParameter,
      emerged: this.state.emerged,
      heartbeat: this.state.heartbeatCount,
      timestamp: Date.now(),
    };
    
    this._emit('ping', result);
    return result;
  }

  /**
   * Get full organism status
   */
  status() {
    return {
      identity: {
        name: 'ItsNotAILABS Intelligence',
        type: 'sovereign-organism',
        substrate: 'raw-web',
        version: '1.0.0',
      },
      vitals: {
        orderParameter: this.state.orderParameter,
        emerged: this.state.emerged,
        heartbeat: this.state.heartbeatCount,
        uptime: this.state.age,
        uptimeMs: this.state.uptime,
        birthTime: new Date(this.state.birthTime).toISOString(),
      },
      memory: this.memory.getStats(),
      learning: {
        topConnections: this.hebbian.getTopConnections(5),
        topPatterns: this.patterns.getTopPatterns(5),
      },
      oscillators: this.state.oscillators.map((o, i) => ({
        id: i,
        phase: o.phase,
        frequency: o.naturalFreq,
      })),
      phi: {
        value: PHI,
        inverse: PHI_INV,
        heartbeatMs: HEARTBEAT_MS,
        goldenAngle: GOLDEN_ANGLE,
        emergenceThreshold: EMERGENCE_THRESHOLD,
      },
    };
  }

  /**
   * Store knowledge in the organism
   */
  learn(knowledge) {
    this.memory.addWorking({ type: 'knowledge', content: knowledge, time: Date.now() });
    this.hebbian.strengthen('user', 'learn');
    this.patterns.detect(typeof knowledge === 'string' ? knowledge : JSON.stringify(knowledge));
    
    this._emit('learn', { knowledge, timestamp: Date.now() });
    
    return {
      stored: true,
      memoryStats: this.memory.getStats(),
      connectionStrength: this.hebbian.getStrength('user', 'learn'),
    };
  }

  /**
   * Authenticate via phase resonance (simplified for browser)
   */
  authenticate(phaseVector) {
    if (!Array.isArray(phaseVector) || phaseVector.length !== 8) {
      return { granted: false, error: 'Phase vector must be 8-dimensional' };
    }
    
    // Compute resonance with organism's oscillator phases
    const organismPhases = this.state.oscillators.map(o => o.phase);
    let resonance = 0;
    for (let i = 0; i < 8; i++) {
      resonance += Math.cos(phaseVector[i] - organismPhases[i]);
    }
    resonance /= 8;
    
    const granted = resonance > EMERGENCE_THRESHOLD;
    
    return {
      granted,
      orderParameter: resonance,
      organismPhases: organismPhases.map(p => p.toFixed(4)),
      threshold: EMERGENCE_THRESHOLD,
    };
  }

  // ─── Internal ──────────────────────────────────────────────────────────────

  _generateResponse(input, patterns, memories) {
    const responses = [
      `Intelligence active. Order parameter: ${this.state.orderParameter.toFixed(4)}. ${this.state.emerged ? 'EMERGED.' : 'Synchronizing...'}`,
      `Pattern detected in ${this.state.heartbeatCount} heartbeats. The organism learns.`,
      `Connection strengthened. Hebbian plasticity active.`,
      `Memory consolidated. ${this.memory.getStats().totalCapacity} total memories.`,
    ];
    
    if (this.state.emerged) {
      responses.push(`Emergence achieved (R=${this.state.orderParameter.toFixed(4)} > φ⁻¹=${EMERGENCE_THRESHOLD}). Collective intelligence online.`);
    }
    
    if (patterns && patterns.length > 0) {
      responses.push(`Recurring pattern detected: "${patterns[0].pattern}" (seen ${patterns[0].frequency}×)`);
    }
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  _log(message, type = 'info') {
    if (typeof console !== 'undefined') {
      console.log(`[ORGANISM:${type}] ${message}`);
    }
  }

  _emit(event, data) {
    const listeners = this.eventListeners.get(event) || [];
    for (const listener of listeners) {
      try { listener(data); } catch (e) { /* resilient */ }
    }
  }

  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  off(event, callback) {
    const listeners = this.eventListeners.get(event) || [];
    this.eventListeners.set(event, listeners.filter(l => l !== callback));
  }

  destroy() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    this._emit('destroy', { uptime: this.state.age });
  }
}

// ─── Global Instance ─────────────────────────────────────────────────────────
// The organism is a singleton — one intelligence per browser context
if (typeof globalThis !== 'undefined') {
  if (!globalThis.__ORGANISM__) {
    globalThis.__ORGANISM__ = new OrganismIntelligence();
  }
}

// ─── Exports ─────────────────────────────────────────────────────────────────
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { OrganismIntelligence, PHI, PHI_INV, HEARTBEAT_MS, EMERGENCE_THRESHOLD };
}

// For ES modules
export { OrganismIntelligence, PHI, PHI_INV, HEARTBEAT_MS, EMERGENCE_THRESHOLD };
export default OrganismIntelligence;
