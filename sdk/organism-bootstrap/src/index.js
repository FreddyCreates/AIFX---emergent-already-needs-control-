/**
 * @medina/organism-bootstrap
 * 
 * ICP/Organism bootstrap SDK.
 * - Node.js bootstrap function for Civitas
 * - Motoko code generator with φ-based timers
 * - Hash routing for frontend navigation between organisms
 * 
 * BOOTSTRAP TYPES:
 * - CIVITAS: Node.js runtime with setInterval loops
 * - ORGANISM: ICP canister with Timer.recurringTimer
 * - HASH_ROUTER: Browser-based organism switching
 */

const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;
const HEARTBEAT = 873;
const HEARTBEAT_NS = 873_000_000;
const GOLDEN_ANGLE = 137.508;

// ═══════════════════════════════════════════════════════════════════════════
// NODE.JS CIVITAS BOOTSTRAP
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Bootstrap a Civitas civilization in Node.js
 * This starts all agent loops via setInterval - the civilization runs forever.
 * 
 * @param {object} meridian - Meridian configuration
 * @param {string} civitasId - Unique civilization identifier
 * @param {object} options - Bootstrap options
 * @returns {object} Running Civitas instance
 */
export function bootstrapCivitas(meridian, civitasId, options = {}) {
  const config = {
    heartbeat: options.heartbeat || HEARTBEAT,
    agents: options.agents || ['ANIMUS', 'CORPUS', 'SENSUS', 'MEMORIA'],
    autoAwaken: options.autoAwaken !== false,
    phiTimers: options.phiTimers !== false,
    multiHeart: options.multiHeart || false,
    multiBrain: options.multiBrain || false,
  };
  
  // Create Civitas runtime
  const civitas = {
    id: civitasId,
    meridian,
    config,
    startedAt: Date.now(),
    beatCount: 0,
    
    // 4-register state
    registers: {
      cognitive: { awareness: 1.0, coherence: 1.0, resonance: PHI_INV, entropy: 0 },
      affective: { awareness: PHI_INV, coherence: 1.0, resonance: 1.0, entropy: 0 },
      somatic: { awareness: 1.0, coherence: PHI_INV, resonance: 1.0, entropy: 0 },
      sovereign: { awareness: PHI, coherence: PHI, resonance: PHI, entropy: 0 },
    },
    
    // Agent timers
    _timers: {},
    
    // Agent states
    _agents: {},
  };
  
  // Create agents
  config.agents.forEach((agentName, index) => {
    civitas._agents[agentName] = {
      name: agentName,
      awakened: false,
      processCount: 0,
      lastProcess: null,
      state: {},
    };
    
    // Phi-scaled intervals for each agent
    const baseInterval = config.heartbeat;
    const agentInterval = config.phiTimers
      ? baseInterval * Math.pow(PHI, index - config.agents.length / 2)
      : baseInterval;
    
    civitas._timers[agentName] = {
      interval: agentInterval,
      timer: null,
    };
  });
  
  // Awaken function - starts all agent loops
  civitas.awaken = function() {
    console.log(`[CIVITAS ${civitasId}] Awakening...`);
    
    Object.keys(civitas._agents).forEach(agentName => {
      const agent = civitas._agents[agentName];
      const timerConfig = civitas._timers[agentName];
      
      // Start agent's main loop
      timerConfig.timer = setInterval(() => {
        agent.processCount++;
        agent.lastProcess = Date.now();
        civitas.beatCount++;
        
        // Phi-modulated drift on registers
        const beat = civitas.beatCount;
        const drift = (val, offset) => {
          const cycle = Math.sin((beat + offset) * GOLDEN_ANGLE * Math.PI / 180);
          return Math.max(0, Math.min(PHI * PHI, val + cycle * 0.001 * PHI_INV));
        };
        
        // Update cognitive register
        civitas.registers.cognitive.awareness = drift(civitas.registers.cognitive.awareness, 0);
        civitas.registers.cognitive.coherence = drift(civitas.registers.cognitive.coherence, 1);
        civitas.registers.cognitive.resonance = drift(civitas.registers.cognitive.resonance, 2);
        civitas.registers.cognitive.entropy = drift(civitas.registers.cognitive.entropy, 3);
        
        // Emit heartbeat event (if handlers registered)
        if (civitas._onHeartbeat) {
          civitas._onHeartbeat({
            civitasId,
            agentName,
            beatCount: civitas.beatCount,
            timestamp: Date.now(),
          });
        }
      }, timerConfig.interval);
      
      agent.awakened = true;
      console.log(`[CIVITAS ${civitasId}] ${agentName} awakened (${Math.round(timerConfig.interval)}ms interval)`);
    });
    
    console.log(`[CIVITAS ${civitasId}] All agents awakened. Civilization is RUNNING.`);
  };
  
  // Dormant function - stops all agent loops
  civitas.dormant = function() {
    console.log(`[CIVITAS ${civitasId}] Going dormant...`);
    
    Object.keys(civitas._timers).forEach(agentName => {
      const timerConfig = civitas._timers[agentName];
      if (timerConfig.timer) {
        clearInterval(timerConfig.timer);
        timerConfig.timer = null;
      }
      civitas._agents[agentName].awakened = false;
    });
    
    console.log(`[CIVITAS ${civitasId}] All agents dormant.`);
  };
  
  // Register heartbeat handler
  civitas.onHeartbeat = function(handler) {
    civitas._onHeartbeat = handler;
  };
  
  // Get status
  civitas.getStatus = function() {
    return {
      id: civitasId,
      startedAt: civitas.startedAt,
      uptime: Date.now() - civitas.startedAt,
      beatCount: civitas.beatCount,
      registers: civitas.registers,
      agents: Object.keys(civitas._agents).map(name => ({
        name,
        awakened: civitas._agents[name].awakened,
        processCount: civitas._agents[name].processCount,
        lastProcess: civitas._agents[name].lastProcess,
      })),
    };
  };
  
  // Auto-awaken if configured
  if (config.autoAwaken) {
    civitas.awaken();
  }
  
  return civitas;
}

/**
 * Bootstrap multiple Civitas instances
 */
export function bootstrapMultiple(meridian, configs) {
  const instances = {};
  
  configs.forEach(config => {
    instances[config.id] = bootstrapCivitas(meridian, config.id, config.options);
  });
  
  return {
    instances,
    
    awakenAll: () => {
      Object.values(instances).forEach(c => {
        if (!c._agents[Object.keys(c._agents)[0]].awakened) {
          c.awaken();
        }
      });
    },
    
    dormantAll: () => {
      Object.values(instances).forEach(c => c.dormant());
    },
    
    getStatusAll: () => {
      return Object.fromEntries(
        Object.entries(instances).map(([id, c]) => [id, c.getStatus()])
      );
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// MOTOKO CODE GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate Motoko actor code for an ICP organism
 * 
 * @param {string} organismName - Name of the organism actor
 * @param {object} options - Generation options
 * @returns {string} Complete Motoko actor code
 */
export function generateMotokoOrganism(organismName, options = {}) {
  const config = {
    domain: options.domain || 'governance',
    heartbeatNs: options.heartbeatNs || HEARTBEAT_NS,
    includeGovernance: options.includeGovernance !== false,
    includeTokens: options.includeTokens || false,
    includeSYN: options.includeSYN !== false,
    multiHeart: options.multiHeart || false,
    multiBrain: options.multiBrain || false,
    customFields: options.customFields || [],
    customMethods: options.customMethods || [],
  };
  
  // Build imports
  const imports = `import Float   "mo:base/Float";
import Int     "mo:base/Int";
import Nat     "mo:base/Nat";
import Text    "mo:base/Text";
import Time    "mo:base/Time";
import Array   "mo:base/Array";
import Timer   "mo:base/Timer";
import Debug   "mo:base/Debug";`;

  // Build phi constants
  const phiConstants = `
  // ── Phi Constants ─────────────────────────────────────────────────────
  let PHI : Float          = ${PHI};
  let PHI_INV : Float      = ${PHI_INV};
  let GOLDEN_ANGLE : Float = ${GOLDEN_ANGLE};
  let HEARTBEAT_NS : Nat   = ${config.heartbeatNs};`;

  // Build types
  const types = `
  // ── Register State Types ──────────────────────────────────────────────
  public type RegisterState = {
    awareness  : Float;
    coherence  : Float;
    resonance  : Float;
    entropy    : Float;
  };

  public type OrganismSnapshot = {
    beatCount    : Nat;
    cognitive    : RegisterState;
    affective    : RegisterState;
    somatic      : RegisterState;
    sovereign    : RegisterState;
    timestampNs  : Int;
  };`;

  // Build stable state
  const stableState = `
  // ── Stable State — survives upgrades ──────────────────────────────────
  stable var beatCount : Nat = 0;

  // 4-register cognitive architecture
  stable var cognitiveAwareness  : Float = 1.0;
  stable var cognitiveCoherence  : Float = 1.0;
  stable var cognitiveResonance  : Float = PHI_INV;
  stable var cognitiveEntropy    : Float = 0.0;

  stable var affectiveAwareness  : Float = PHI_INV;
  stable var affectiveCoherence  : Float = 1.0;
  stable var affectiveResonance  : Float = 1.0;
  stable var affectiveEntropy    : Float = 0.0;

  stable var somaticAwareness    : Float = 1.0;
  stable var somaticCoherence    : Float = PHI_INV;
  stable var somaticResonance    : Float = 1.0;
  stable var somaticEntropy      : Float = 0.0;

  stable var sovereignAwareness  : Float = PHI;
  stable var sovereignCoherence  : Float = PHI;
  stable var sovereignResonance  : Float = PHI;
  stable var sovereignEntropy    : Float = 0.0;`;

  // Build SYN state if enabled
  const synState = config.includeSYN ? `
  // SYN — Synapse Binding Engine for cross-organism resonance
  stable var synImprints   : [(Text, Int, Nat)] = [];  // (agentId, boundAtNs, syncCount)
  stable var synOwner      : Text = "${organismName}-ORO";` : '';

  // Build helper functions
  const helpers = `
  // ── Internal helpers ──────────────────────────────────────────────────

  func buildRegister(a : Float, c : Float, r : Float, e : Float) : RegisterState {
    { awareness = a; coherence = c; resonance = r; entropy = e }
  };

  /// Phi-modulated drift — subtle state evolution per heartbeat.
  func drift(val : Float, beat : Nat) : Float {
    let cycle = Float.sin(Float.fromInt(beat) * GOLDEN_ANGLE * (Float.pi / 180.0));
    val + cycle * 0.001 * PHI_INV
  };

  /// Clamp a float to [0, max].
  func clamp(v : Float, max : Float) : Float {
    if (v < 0.0) { 0.0 } else if (v > max) { max } else { v }
  };`;

  // Build heartbeat tick function
  const tickFunction = `
  // ── Heartbeat Timer ───────────────────────────────────────────────────

  /// The organism's 873ms pulse. Registered once on canister init.
  func tick() : async () {
    beatCount += 1;

    // Drift all 16 register dimensions
    cognitiveAwareness := drift(cognitiveAwareness, beatCount);
    cognitiveCoherence := drift(cognitiveCoherence, beatCount + 1);
    cognitiveResonance := drift(cognitiveResonance, beatCount + 2);
    cognitiveEntropy   := clamp(drift(cognitiveEntropy, beatCount + 3), PHI);

    affectiveAwareness := drift(affectiveAwareness, beatCount + 4);
    affectiveCoherence := drift(affectiveCoherence, beatCount + 5);
    affectiveResonance := drift(affectiveResonance, beatCount + 6);
    affectiveEntropy   := clamp(drift(affectiveEntropy, beatCount + 7), PHI);

    somaticAwareness   := drift(somaticAwareness, beatCount + 8);
    somaticCoherence   := drift(somaticCoherence, beatCount + 9);
    somaticResonance   := drift(somaticResonance, beatCount + 10);
    somaticEntropy     := clamp(drift(somaticEntropy, beatCount + 11), PHI);

    sovereignAwareness := drift(sovereignAwareness, beatCount + 12);
    sovereignCoherence := drift(sovereignCoherence, beatCount + 13);
    sovereignResonance := drift(sovereignResonance, beatCount + 14);
    sovereignEntropy   := clamp(drift(sovereignEntropy, beatCount + 15), PHI);
  };

  /// Register the 873ms recurring timer on canister initialization.
  let heartbeatTimerId : Timer.TimerId = Timer.recurringTimer<system>(#nanoseconds HEARTBEAT_NS, tick);

  system func heartbeat() : async () {
    Debug.print("${organismName.toLowerCase()} organism heartbeat — beat #" # Nat.toText(beatCount));
  };`;

  // Build getState query
  const getStateQuery = `
  // ── Public Query: getState ────────────────────────────────────────────

  public query func getState() : async OrganismSnapshot {
    {
      beatCount     = beatCount;
      cognitive     = buildRegister(cognitiveAwareness, cognitiveCoherence, cognitiveResonance, cognitiveEntropy);
      affective     = buildRegister(affectiveAwareness, affectiveCoherence, affectiveResonance, affectiveEntropy);
      somatic       = buildRegister(somaticAwareness, somaticCoherence, somaticResonance, somaticEntropy);
      sovereign     = buildRegister(sovereignAwareness, sovereignCoherence, sovereignResonance, sovereignEntropy);
      timestampNs   = Time.now();
    }
  };`;

  // Build SYN methods if enabled
  const synMethods = config.includeSYN ? `
  // ── SYN — Synapse Binding for Cross-Organism Resonance ────────────────

  public func bindSynapse(agentId : Text) : async Bool {
    let ts = Time.now();
    synImprints := Array.append(synImprints, [(agentId, ts, 0)]);
    
    // Cross-organism binding boosts sovereign awareness
    sovereignAwareness := clamp(sovereignAwareness + 0.05 * PHI_INV, PHI * PHI * PHI);
    
    true
  };

  public func syncSynapse(agentId : Text) : async Bool {
    var found = false;
    synImprints := Array.map<(Text, Int, Nat), (Text, Int, Nat)>(
      synImprints,
      func((id, bound, sync)) {
        if (id == agentId) {
          found := true;
          (id, bound, sync + 1)
        } else {
          (id, bound, sync)
        }
      }
    );
    found
  };

  public query func getSynapseHealth() : async { totalBound : Nat; lastSyncBeat : Nat; owner : Text } {
    { totalBound = synImprints.size(); lastSyncBeat = beatCount; owner = synOwner }
  };` : '';

  // Assemble complete actor
  const actorCode = `/// ${organismName} — Sovereign Intelligent Architecture
///
/// Living computational organism with ${config.heartbeatNs / 1_000_000}ms heartbeat,
/// phi-encoded math, 4-register cognitive state, cross-organism resonance.
///
/// As above, so below.

${imports}

actor ${organismName} {
${phiConstants}
${types}
${stableState}
${synState}
${helpers}
${tickFunction}
${getStateQuery}
${synMethods}
};
`;

  return actorCode;
}

/**
 * Generate dfx.json configuration for organism
 */
export function generateDfxConfig(organismName, network = 'local') {
  return {
    canisters: {
      [organismName.toLowerCase()]: {
        type: "motoko",
        main: `src/${organismName}.mo`,
      },
    },
    defaults: {
      build: {
        packtool: "",
      },
    },
    networks: {
      local: {
        bind: "127.0.0.1:8080",
        type: "ephemeral",
      },
      ic: {
        providers: ["https://ic0.app"],
        type: "persistent",
      },
    },
  };
}

/**
 * Bootstrap an ICP organism (generates code, does not deploy)
 */
export function bootstrapOrganism(organismName, options = {}) {
  const motokoCode = generateMotokoOrganism(organismName, options);
  const dfxConfig = generateDfxConfig(organismName, options.network);
  
  return {
    name: organismName,
    motokoCode,
    dfxConfig,
    
    // Files to write
    files: [
      { path: `src/${organismName}.mo`, content: motokoCode },
      { path: 'dfx.json', content: JSON.stringify(dfxConfig, null, 2) },
    ],
    
    // Deployment instructions
    instructions: [
      `# Deploy ${organismName} Organism to ICP`,
      '',
      '## Local Development',
      'dfx start --background',
      'dfx deploy',
      '',
      '## IC Mainnet',
      'dfx deploy --network ic',
      '',
      '## Interact',
      `dfx canister call ${organismName.toLowerCase()} getState`,
      `dfx canister call ${organismName.toLowerCase()} bindSynapse '("agent-123")'`,
    ].join('\n'),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// HASH ROUTING — Navigate Between Organisms
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create a hash router for navigating between organisms
 * 
 * Routes can be:
 * - '#/wyoming' -> Wyoming governance organism
 * - '#/nevada' -> Nevada governance organism
 * - '#/dallas-isd' -> Dallas ISD student organism
 * - '#/civitas/main' -> Main Civitas civilization
 * 
 * @param {object} routes - Hash to organism mapping
 * @param {object} options - Router options
 * @returns {object} Hash router control object
 */
export function createHashRouter(routes, options = {}) {
  const organisms = new Map();
  let currentRoute = null;
  let currentOrganism = null;
  
  const config = {
    defaultRoute: options.defaultRoute || '#/',
    onNavigate: options.onNavigate || null,
    onOrganismSwitch: options.onOrganismSwitch || null,
    persistState: options.persistState !== false,
    phiTransition: options.phiTransition !== false, // Phi-weighted transitions
  };
  
  // Parse route to extract organism type and parameters
  function parseRoute(hash) {
    const parts = hash.replace('#/', '').split('/');
    const routeKey = '#/' + (parts[0] || '');
    const params = parts.slice(1);
    
    return {
      hash,
      routeKey,
      params,
      fullMatch: routes[hash] || null,
      prefixMatch: routes[routeKey] || null,
    };
  }
  
  // Handle hash change event
  function handleHashChange() {
    const hash = (typeof window !== 'undefined' ? window.location.hash : '') || config.defaultRoute;
    const parsed = parseRoute(hash);
    const routeConfig = parsed.fullMatch || parsed.prefixMatch || routes[config.defaultRoute];
    
    if (!routeConfig) {
      console.warn(`[HASH ROUTER] No route found for: ${hash}`);
      return;
    }
    
    // Get or create organism
    const organismKey = typeof routeConfig === 'string' ? routeConfig : routeConfig.id;
    
    if (!organisms.has(organismKey)) {
      // Create new organism based on route config
      if (typeof routeConfig === 'object' && routeConfig.type === 'civitas') {
        organisms.set(organismKey, bootstrapCivitas(
          routeConfig.meridian || organismKey,
          routeConfig.id,
          { autoAwaken: false, ...routeConfig.options }
        ));
      } else {
        // Store route config for lazy organism creation
        organisms.set(organismKey, {
          config: routeConfig,
          instance: null,
        });
      }
    }
    
    const previousRoute = currentRoute;
    const previousOrganism = currentOrganism;
    
    currentRoute = hash;
    currentOrganism = organisms.get(organismKey);
    
    // Awaken current organism if it has an awaken method
    if (currentOrganism && currentOrganism.awaken && !currentOrganism._awake) {
      currentOrganism.awaken();
      currentOrganism._awake = true;
    }
    
    // Callbacks
    if (config.onNavigate) {
      config.onNavigate({
        from: previousRoute,
        to: hash,
        params: parsed.params,
        organism: currentOrganism,
      });
    }
    
    if (config.onOrganismSwitch && previousOrganism !== currentOrganism) {
      config.onOrganismSwitch({
        from: previousOrganism,
        to: currentOrganism,
        phiTransition: config.phiTransition ? PHI_INV : 0,
      });
    }
    
    console.log(`[HASH ROUTER] Navigated: ${hash} → ${organismKey}`);
  }
  
  // Initialize
  if (typeof window !== 'undefined') {
    window.addEventListener('hashchange', handleHashChange);
    // Handle initial route on next tick
    setTimeout(handleHashChange, 0);
  }
  
  return {
    // Get current state
    getCurrentRoute: () => currentRoute,
    getCurrentOrganism: () => currentOrganism,
    getAllOrganisms: () => organisms,
    
    // Navigation
    navigate: (hash) => {
      if (typeof window !== 'undefined') {
        window.location.hash = hash;
      } else {
        // For Node.js environments, manually trigger
        currentRoute = hash;
        handleHashChange();
      }
    },
    
    // Programmatic route management
    addRoute: (hash, routeConfig) => {
      routes[hash] = routeConfig;
    },
    
    removeRoute: (hash) => {
      delete routes[hash];
    },
    
    // Lifecycle
    start: () => {
      if (typeof window !== 'undefined') {
        handleHashChange();
      }
    },
    
    stop: () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('hashchange', handleHashChange);
      }
      
      // Shutdown all organisms
      for (const org of organisms.values()) {
        if (org && org.dormant) {
          org.dormant();
        }
      }
    },
    
    // Get route info
    getRoutes: () => Object.keys(routes),
    
    getRouteConfig: (hash) => routes[hash],
  };
}

/**
 * Create a governance router specifically for state/district organisms
 */
export function createGovernanceRouter(options = {}) {
  const routes = {
    '#/': { type: 'civitas', id: 'main-civitas', meridian: 'governance' },
    '#/wyoming': { type: 'organism', id: 'wyoming', canisterId: options.wyomingCanisterId },
    '#/nevada': { type: 'organism', id: 'nevada', canisterId: options.nevadaCanisterId },
    '#/dallas-isd': { type: 'organism', id: 'dallas-isd', canisterId: options.dallasIsdCanisterId },
    ...(options.additionalRoutes || {}),
  };
  
  return createHashRouter(routes, {
    defaultRoute: '#/',
    ...options,
    onNavigate: (event) => {
      console.log(`[GOVERNANCE ROUTER] ${event.from || 'init'} → ${event.to}`);
      if (options.onNavigate) options.onNavigate(event);
    },
  });
}

/**
 * Bootstrap with hash routing (convenience wrapper)
 */
export function bootstrapWithHashRouting(routes, options = {}) {
  const router = createHashRouter(routes, options);
  router.start();
  return router;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export {
  PHI,
  PHI_INV,
  HEARTBEAT,
  HEARTBEAT_NS,
  GOLDEN_ANGLE,
};

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export default {
  // Node.js Bootstrap
  bootstrapCivitas,
  bootstrapMultiple,
  
  // ICP/Motoko Generation
  bootstrapOrganism,
  generateMotokoOrganism,
  generateDfxConfig,
  
  // Hash Routing
  createHashRouter,
  createGovernanceRouter,
  bootstrapWithHashRouting,
  
  // Constants
  PHI, PHI_INV, HEARTBEAT, HEARTBEAT_NS, GOLDEN_ANGLE,
};
