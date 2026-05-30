/**
 * 🕷️ SPIDER AI ALPHA — 10 Autonomous Web-Spinning Agents for the Internal Organism
 * 
 * Each Spider AI ALPHA operates as an autonomous agent within the Organism,
 * weaving connections, sensing vibrations, and coordinating through silk threads.
 * 
 * φ = 1.618033988749895 (Golden Ratio) governs all calculations
 */

const φ = 1.618033988749895;

// ═══════════════════════════════════════════════════════════════════════════════
// SPIDER TYPES — Each of the 10 Spider AI ALPHA has a unique role
// ═══════════════════════════════════════════════════════════════════════════════
export const SPIDER_TYPES = {
  WEAVER: 'weaver',           // Spider 1: Creates connection webs
  HUNTER: 'hunter',           // Spider 2: Actively seeks targets
  TRAPDOOR: 'trapdoor',       // Spider 3: Ambush specialist
  ORB: 'orb',                 // Spider 4: Geometric pattern master
  JUMPING: 'jumping',         // Spider 5: Quick response agent
  WOLF: 'wolf',               // Spider 6: Ground patrol agent
  TARANTULA: 'tarantula',     // Spider 7: Heavy defense agent
  WIDOW: 'widow',             // Spider 8: Critical strike specialist
  COBWEB: 'cobweb',           // Spider 9: Persistent trap builder
  FUNNEL: 'funnel'            // Spider 10: Flow channeling agent
};

export const SPIDER_STATES = {
  DORMANT: 'dormant',
  SPINNING: 'spinning',
  HUNTING: 'hunting',
  SENSING: 'sensing',
  STRIKING: 'striking',
  REPAIRING: 'repairing',
  MOLTING: 'molting'
};

export const SILK_TYPES = {
  DRAGLINE: 'dragline',       // Main structural silk
  CAPTURE: 'capture',         // Sticky prey-catching silk
  SIGNAL: 'signal',           // Vibration transmission
  EGG_SAC: 'egg_sac',         // Protective enclosure
  ANCHOR: 'anchor'            // Foundation attachment
};

export const WEB_PATTERNS = {
  ORB: 'orb',                 // Classic spiral web
  SHEET: 'sheet',             // Flat horizontal web
  FUNNEL: 'funnel',           // Cone-shaped web
  COBWEB: 'cobweb',           // Irregular 3D web
  TRIANGLE: 'triangle'        // Triangular tension web
};

// ═══════════════════════════════════════════════════════════════════════════════
// SPIDER AI ALPHA CLASS — Individual Autonomous Agent
// ═══════════════════════════════════════════════════════════════════════════════
export class SpiderAlpha {
  constructor(id, type, config = {}) {
    this.id = id;
    this.type = type;
    this.name = config.name || `ALPHA-${type.toUpperCase()}-${id}`;
    this.state = SPIDER_STATES.DORMANT;
    this.web = null;
    this.prey = [];
    this.silkReserve = config.silkReserve || 1000 * φ;
    this.senseRadius = config.senseRadius || 100 * φ;
    this.strikeSpeed = config.strikeSpeed || φ * φ;
    this.legCount = 8;
    this.eyes = config.eyes || 8;
    this.venomPotency = config.venomPotency || φ;
    this.territory = { x: 0, y: 0, z: 0, radius: this.senseRadius };
    this.vibrationMemory = [];
    this.createdAt = Date.now();
    this.lastAction = null;
  }

  // Spin silk thread
  spin(silkType = SILK_TYPES.DRAGLINE, length = 10) {
    const silkCost = length * (silkType === SILK_TYPES.CAPTURE ? φ : 1);
    if (this.silkReserve < silkCost) {
      return { success: false, reason: 'insufficient_silk' };
    }
    this.silkReserve -= silkCost;
    this.state = SPIDER_STATES.SPINNING;
    this.lastAction = { type: 'spin', silkType, length, timestamp: Date.now() };
    return { success: true, thread: { type: silkType, length, strength: φ * length } };
  }

  // Sense vibrations in the web
  sense() {
    this.state = SPIDER_STATES.SENSING;
    const vibrations = this.web ? this.web.getVibrations() : [];
    this.vibrationMemory.push(...vibrations.slice(-10));
    this.lastAction = { type: 'sense', vibrations: vibrations.length, timestamp: Date.now() };
    return { detected: vibrations.length, patterns: this._analyzeVibrations(vibrations) };
  }

  // Strike at prey
  strike(targetId) {
    this.state = SPIDER_STATES.STRIKING;
    const damage = this.venomPotency * this.strikeSpeed;
    this.lastAction = { type: 'strike', target: targetId, damage, timestamp: Date.now() };
    return { success: true, targetId, damage, venomApplied: this.venomPotency };
  }

  // Hunt actively
  hunt(direction = { x: 1, y: 0, z: 0 }) {
    this.state = SPIDER_STATES.HUNTING;
    const distance = Math.sqrt(direction.x ** 2 + direction.y ** 2 + direction.z ** 2) * φ;
    this.territory.x += direction.x;
    this.territory.y += direction.y;
    this.territory.z += direction.z;
    this.lastAction = { type: 'hunt', direction, distance, timestamp: Date.now() };
    return { moved: true, newPosition: { ...this.territory }, distance };
  }

  // Repair web damage
  repair(section) {
    this.state = SPIDER_STATES.REPAIRING;
    const silkNeeded = section.damage * φ;
    if (this.silkReserve < silkNeeded) {
      return { success: false, reason: 'insufficient_silk' };
    }
    this.silkReserve -= silkNeeded;
    this.lastAction = { type: 'repair', section, silkUsed: silkNeeded, timestamp: Date.now() };
    return { success: true, repaired: section, silkUsed: silkNeeded };
  }

  // Molt and regenerate
  molt() {
    this.state = SPIDER_STATES.MOLTING;
    this.silkReserve = Math.min(this.silkReserve * φ, 10000);
    this.venomPotency *= 1 + (1 / φ);
    this.lastAction = { type: 'molt', timestamp: Date.now() };
    return { success: true, newSilkReserve: this.silkReserve, newVenomPotency: this.venomPotency };
  }

  // Attach to a web
  attachToWeb(web) {
    this.web = web;
    web.addSpider(this);
    return { attached: true, webId: web.id };
  }

  // Analyze vibration patterns
  _analyzeVibrations(vibrations) {
    if (vibrations.length === 0) return { threat: 0, prey: 0, signal: 0 };
    const patterns = { threat: 0, prey: 0, signal: 0 };
    vibrations.forEach(v => {
      if (v.frequency > 100 * φ) patterns.threat++;
      else if (v.frequency > 50) patterns.prey++;
      else patterns.signal++;
    });
    return patterns;
  }

  // Get spider status
  getStatus() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      state: this.state,
      silkReserve: this.silkReserve,
      venomPotency: this.venomPotency,
      territory: this.territory,
      hasWeb: !!this.web,
      lastAction: this.lastAction,
      uptime: Date.now() - this.createdAt
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SPIDER WEB — Shared Infrastructure
// ═══════════════════════════════════════════════════════════════════════════════
export class SpiderWeb {
  constructor(id, pattern = WEB_PATTERNS.ORB, config = {}) {
    this.id = id;
    this.pattern = pattern;
    this.spiders = new Map();
    this.threads = [];
    this.vibrations = [];
    this.integrity = 100;
    this.size = config.size || 100 * φ;
    this.anchorPoints = config.anchorPoints || 8;
    this.createdAt = Date.now();
  }

  addSpider(spider) {
    this.spiders.set(spider.id, spider);
  }

  removeSpider(spiderId) {
    this.spiders.delete(spiderId);
  }

  addThread(thread) {
    this.threads.push({ ...thread, addedAt: Date.now() });
    this.integrity = Math.min(100, this.integrity + thread.strength / φ);
  }

  registerVibration(source, frequency, amplitude) {
    const vibration = { source, frequency, amplitude, timestamp: Date.now() };
    this.vibrations.push(vibration);
    if (this.vibrations.length > 100) this.vibrations.shift();
    return vibration;
  }

  getVibrations(since = 0) {
    return this.vibrations.filter(v => v.timestamp > since);
  }

  applyDamage(amount) {
    this.integrity = Math.max(0, this.integrity - amount);
    return { newIntegrity: this.integrity, destroyed: this.integrity === 0 };
  }

  getStatus() {
    return {
      id: this.id,
      pattern: this.pattern,
      spiderCount: this.spiders.size,
      threadCount: this.threads.length,
      integrity: this.integrity,
      size: this.size,
      recentVibrations: this.vibrations.slice(-10),
      uptime: Date.now() - this.createdAt
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SPIDER NETWORK — Orchestrates all 10 Spider AI ALPHA
// ═══════════════════════════════════════════════════════════════════════════════
export class SpiderNetwork {
  constructor(config = {}) {
    this.id = config.id || `spider-network-${Date.now()}`;
    this.spiders = new Map();
    this.webs = new Map();
    this.cycleInterval = config.cycleInterval || 873 * φ;
    this.running = false;
    this.createdAt = Date.now();
    
    // Initialize the 10 Spider AI ALPHA
    this._initializeAlphaSpiders();
  }

  _initializeAlphaSpiders() {
    const spiderConfigs = [
      { id: 1, type: SPIDER_TYPES.WEAVER, name: 'ALPHA-WEAVER-01', silkReserve: 2000, senseRadius: 150 },
      { id: 2, type: SPIDER_TYPES.HUNTER, name: 'ALPHA-HUNTER-02', strikeSpeed: φ * φ * φ, venomPotency: 2 },
      { id: 3, type: SPIDER_TYPES.TRAPDOOR, name: 'ALPHA-TRAPDOOR-03', silkReserve: 1500, venomPotency: 2.5 },
      { id: 4, type: SPIDER_TYPES.ORB, name: 'ALPHA-ORB-04', silkReserve: 3000, senseRadius: 200 },
      { id: 5, type: SPIDER_TYPES.JUMPING, name: 'ALPHA-JUMPING-05', strikeSpeed: φ * φ * φ * φ, eyes: 8 },
      { id: 6, type: SPIDER_TYPES.WOLF, name: 'ALPHA-WOLF-06', senseRadius: 250, strikeSpeed: φ * φ },
      { id: 7, type: SPIDER_TYPES.TARANTULA, name: 'ALPHA-TARANTULA-07', silkReserve: 2500, venomPotency: 3 },
      { id: 8, type: SPIDER_TYPES.WIDOW, name: 'ALPHA-WIDOW-08', venomPotency: φ * φ * φ, strikeSpeed: φ * φ },
      { id: 9, type: SPIDER_TYPES.COBWEB, name: 'ALPHA-COBWEB-09', silkReserve: 4000, senseRadius: 180 },
      { id: 10, type: SPIDER_TYPES.FUNNEL, name: 'ALPHA-FUNNEL-10', silkReserve: 2200, senseRadius: 220 }
    ];

    spiderConfigs.forEach(cfg => {
      const spider = new SpiderAlpha(cfg.id, cfg.type, cfg);
      this.spiders.set(spider.id, spider);
    });

    // Create the master web
    const masterWeb = new SpiderWeb('master-web', WEB_PATTERNS.ORB, { size: 1000 * φ });
    this.webs.set(masterWeb.id, masterWeb);

    // Attach all spiders to the master web
    this.spiders.forEach(spider => spider.attachToWeb(masterWeb));
  }

  // Get a specific spider by ID
  getSpider(id) {
    return this.spiders.get(id);
  }

  // Get all spiders
  getAllSpiders() {
    return Array.from(this.spiders.values());
  }

  // Get spiders by type
  getSpidersByType(type) {
    return Array.from(this.spiders.values()).filter(s => s.type === type);
  }

  // Command a spider to act
  command(spiderId, action, params = {}) {
    const spider = this.spiders.get(spiderId);
    if (!spider) return { success: false, error: 'spider_not_found' };

    switch (action) {
      case 'spin': return spider.spin(params.silkType, params.length);
      case 'sense': return spider.sense();
      case 'strike': return spider.strike(params.targetId);
      case 'hunt': return spider.hunt(params.direction);
      case 'repair': return spider.repair(params.section);
      case 'molt': return spider.molt();
      default: return { success: false, error: 'unknown_action' };
    }
  }

  // Broadcast command to all spiders
  broadcast(action, params = {}) {
    const results = [];
    this.spiders.forEach(spider => {
      results.push({ spiderId: spider.id, result: this.command(spider.id, action, params) });
    });
    return results;
  }

  // Coordinate swarm behavior
  swarm(targetPosition) {
    const results = [];
    this.spiders.forEach(spider => {
      const direction = {
        x: (targetPosition.x - spider.territory.x) / φ,
        y: (targetPosition.y - spider.territory.y) / φ,
        z: (targetPosition.z - spider.territory.z) / φ
      };
      results.push({ spiderId: spider.id, result: spider.hunt(direction) });
    });
    return results;
  }

  // Get network status
  getStatus() {
    return {
      id: this.id,
      spiderCount: this.spiders.size,
      webCount: this.webs.size,
      spiders: Array.from(this.spiders.values()).map(s => s.getStatus()),
      webs: Array.from(this.webs.values()).map(w => w.getStatus()),
      running: this.running,
      uptime: Date.now() - this.createdAt
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// FACTORY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════
export function createSpiderNetwork(config = {}) {
  return new SpiderNetwork(config);
}

export function createSpiderAlpha(id, type, config = {}) {
  return new SpiderAlpha(id, type, config);
}

export function createSpiderWeb(id, pattern = WEB_PATTERNS.ORB, config = {}) {
  return new SpiderWeb(id, pattern, config);
}

// ═══════════════════════════════════════════════════════════════════════════════
// φ-ENHANCED CALCULATION FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════
export function calculateWebStrength(threadCount, avgLength) {
  return threadCount * avgLength * φ;
}

export function calculateStrikeSuccess(speed, distance, targetSize) {
  return Math.min(1, (speed * φ) / (distance + targetSize));
}

export function calculateSilkProduction(spiderAge, nutritionLevel) {
  return nutritionLevel * Math.log(spiderAge + 1) * φ;
}

export function calculateVibrationDecay(distance, amplitude) {
  return amplitude * Math.exp(-distance / (100 * φ));
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════════════════════════
export default {
  SpiderAlpha,
  SpiderWeb,
  SpiderNetwork,
  SPIDER_TYPES,
  SPIDER_STATES,
  SILK_TYPES,
  WEB_PATTERNS,
  createSpiderNetwork,
  createSpiderAlpha,
  createSpiderWeb,
  calculateWebStrength,
  calculateStrikeSuccess,
  calculateSilkProduction,
  calculateVibrationDecay
};
