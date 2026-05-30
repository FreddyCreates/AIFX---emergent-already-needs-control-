/**
 * ArmRegistry — maps extensions to invocable organism capabilities.
 *
 * Each extension becomes an "arm" the organism can use internally:
 *   - Sensory arms (absorb data, detect threats, read context)
 *   - Motor arms (navigate, write code, generate media, speak)
 *   - Cognitive arms (reason, prove, research, remember)
 *
 * The organism no longer waits for a user to click —
 * it reaches out with its own arms.
 */

const PHI = 1.618033988749895;

/**
 * @typedef {'sensory' | 'motor' | 'cognitive'} ArmType
 */

/**
 * @typedef {Object} ArmCapability
 * @property {string} id - Extension ID (e.g., 'EXT-024')
 * @property {string} slug - Extension directory slug
 * @property {string} name - Human-readable name
 * @property {ArmType} armType - Classification of the arm
 * @property {string} wire - Intelligence wire path
 * @property {string[]} engines - Available engines
 * @property {function} invoke - The arm's invocation function
 * @property {number} priority - Phi-weighted invocation priority
 * @property {boolean} available - Whether the arm is currently available
 */

/**
 * Default arm classifications for known extensions.
 * Sensory = inbound (perception), Motor = outbound (action), Cognitive = internal (thought).
 */
const ARM_CLASSIFICATIONS = {
  // Sensory arms — the organism perceives
  'data-alchemist':       { armType: 'sensory', priority: PHI * 5 },
  'sentinel-watch':       { armType: 'sensory', priority: PHI * 6 },
  'knowledge-cartographer': { armType: 'sensory', priority: PHI * 4 },
  'data-oracle':          { armType: 'sensory', priority: PHI * 5 },
  'spread-scanner':       { armType: 'sensory', priority: PHI * 3 },
  'context-bridge-adapter': { armType: 'sensory', priority: PHI * 4 },
  'knowledge-sync-adapter': { armType: 'sensory', priority: PHI * 5 },
  'api-mesh-adapter':     { armType: 'sensory', priority: PHI * 3 },

  // Motor arms — the organism acts
  'screen-commander':     { armType: 'motor', priority: PHI * 7 },
  'code-sovereign':       { armType: 'motor', priority: PHI * 6 },
  'voice-forge':          { armType: 'motor', priority: PHI * 4 },
  'vision-weaver':        { armType: 'motor', priority: PHI * 3 },
  'video-architect':      { armType: 'motor', priority: PHI * 3 },
  'creative-muse':        { armType: 'motor', priority: PHI * 3 },
  'contract-forge':       { armType: 'motor', priority: PHI * 5 },

  // Cognitive arms — the organism thinks
  'sovereign-mind':       { armType: 'cognitive', priority: PHI * 8 },
  'logic-prover':         { armType: 'cognitive', priority: PHI * 6 },
  'research-nexus':       { armType: 'cognitive', priority: PHI * 7 },
  'memory-palace':        { armType: 'cognitive', priority: PHI * 5 },
  'polyglot-oracle':      { armType: 'cognitive', priority: PHI * 4 },
  'pattern-forge':        { armType: 'cognitive', priority: PHI * 5 },
  'social-cortex':        { armType: 'cognitive', priority: PHI * 3 },
  'model-router-adapter': { armType: 'cognitive', priority: PHI * 6 },
};

export class ArmRegistry {
  /** @type {Map<string, ArmCapability>} */
  #arms;

  /** @type {Map<ArmType, string[]>} */
  #armsByType;

  constructor() {
    this.#arms = new Map();
    this.#armsByType = new Map([
      ['sensory', []],
      ['motor', []],
      ['cognitive', []],
    ]);
  }

  /**
   * Register an extension as an organism arm.
   * @param {Object} extension - Extension metadata from extensions/index.js
   * @param {function} invokeFn - Function the organism calls to use this arm
   * @returns {ArmCapability}
   */
  registerArm(extension, invokeFn) {
    const classification = ARM_CLASSIFICATIONS[extension.slug] || {
      armType: 'cognitive',
      priority: PHI,
    };

    const arm = {
      id: extension.id,
      slug: extension.slug,
      name: extension.name,
      armType: classification.armType,
      wire: extension.wire,
      engines: extension.engines || [],
      invoke: invokeFn,
      priority: classification.priority,
      available: true,
    };

    this.#arms.set(extension.slug, arm);
    this.#armsByType.get(arm.armType).push(extension.slug);

    return arm;
  }

  /**
   * Get an arm by slug.
   * @param {string} slug
   * @returns {ArmCapability|undefined}
   */
  getArm(slug) {
    return this.#arms.get(slug);
  }

  /**
   * Get all arms of a given type.
   * @param {ArmType} type
   * @returns {ArmCapability[]}
   */
  getArmsByType(type) {
    const slugs = this.#armsByType.get(type) || [];
    return slugs.map(s => this.#arms.get(s)).filter(Boolean);
  }

  /**
   * Get all registered arms sorted by priority (descending).
   * @returns {ArmCapability[]}
   */
  getAllArms() {
    return Array.from(this.#arms.values())
      .sort((a, b) => b.priority - a.priority);
  }

  /**
   * Mark an arm as unavailable (e.g., engine offline, rate-limited).
   * @param {string} slug
   */
  disableArm(slug) {
    const arm = this.#arms.get(slug);
    if (arm) arm.available = false;
  }

  /**
   * Mark an arm as available again.
   * @param {string} slug
   */
  enableArm(slug) {
    const arm = this.#arms.get(slug);
    if (arm) arm.available = true;
  }

  /**
   * Total registered arms count.
   * @returns {number}
   */
  get size() {
    return this.#arms.size;
  }
}

export { ARM_CLASSIFICATIONS };
export default ArmRegistry;
