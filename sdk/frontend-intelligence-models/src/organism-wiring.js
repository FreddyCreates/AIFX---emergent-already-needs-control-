/**
 * @medina/frontend-intelligence-models — OrganismWiring
 *
 * Wires all 30 front-end AI models and 10 multimodal families into the
 * organism's ring architecture. Maps each model to its organism ring,
 * connects families across rings, and provides the master wiring table
 * for the EngineCore to route tasks.
 *
 * @module @medina/frontend-intelligence-models/organism-wiring
 */

const PHI = 1.618033988749895;

/**
 * Complete ring-to-models mapping for the organism.
 * Each ring aggregates models from a specific intelligence domain.
 */
const RING_WIRING = {
  'Projection Ring': {
    description: 'Structural projection intelligence — HTML, Web Components, SVG/MathML',
    models: ['FIM-001', 'FIM-002', 'FIM-003'],
    families: ['MMF-001'],
    sovereignReplacement: 'Sovereign Markup Kernel'
  },
  'Visual Ring': {
    description: 'Visual composition intelligence — Layout, Design Tokens, Animation',
    models: ['FIM-004', 'FIM-005', 'FIM-006'],
    families: ['MMF-002'],
    sovereignReplacement: 'Sovereign Style Engine'
  },
  'Interface Ring': {
    description: 'Projection framework intelligence — React, Vue, Meta-Frameworks',
    models: ['FIM-007', 'FIM-008', 'FIM-009'],
    families: ['MMF-003'],
    sovereignReplacement: 'Sovereign Interface Organism'
  },
  'Memory Ring': {
    description: 'Memory-state intelligence — Reactive State, Forms, State Machines',
    models: ['FIM-010', 'FIM-011', 'FIM-012'],
    families: ['MMF-004'],
    sovereignReplacement: 'Sovereign State Kernel'
  },
  'Build Ring': {
    description: 'Transformation pipeline intelligence — Bundling, TypeScript, CI/CD',
    models: ['FIM-013', 'FIM-014', 'FIM-015'],
    families: ['MMF-005'],
    sovereignReplacement: 'Sovereign Build Pipeline'
  },
  'Proof Ring': {
    description: 'Verification intelligence — Unit Tests, E2E Tests, Performance',
    models: ['FIM-016', 'FIM-017', 'FIM-018'],
    families: ['MMF-006'],
    sovereignReplacement: 'Sovereign Visual Proof Engine'
  },
  'Geometry Ring': {
    description: 'Scene and motion intelligence — WebGL, Data Viz, Canvas',
    models: ['FIM-019', 'FIM-020', 'FIM-021'],
    families: ['MMF-007'],
    sovereignReplacement: 'Sovereign Scene System'
  },
  'Transport Ring': {
    description: 'Stream and query intelligence — API Clients, Real-Time, GraphQL',
    models: ['FIM-022', 'FIM-023', 'FIM-024'],
    families: ['MMF-008'],
    sovereignReplacement: 'Sovereign Transport Mesh'
  },
  'Persistence Ring': {
    description: 'Local persistence intelligence — IndexedDB, Cache, Auth Tokens',
    models: ['FIM-025', 'FIM-026', 'FIM-027'],
    families: ['MMF-009'],
    sovereignReplacement: 'Sovereign Local Memory Vault'
  },
  'Native Capability Ring': {
    description: 'Browser-native capability intelligence — Service Workers, Web Workers, Sensors',
    models: ['FIM-028', 'FIM-029', 'FIM-030'],
    families: ['MMF-010'],
    sovereignReplacement: 'Sovereign Browser Runtime Bridge'
  }
};

class OrganismWiring {
  constructor() {
    /** @type {Object} */
    this.ringWiring = RING_WIRING;

    /** @type {Map<string, string>} modelId → ringName */
    this.modelToRing = new Map();

    // Build reverse index
    for (const [ring, config] of Object.entries(RING_WIRING)) {
      for (const modelId of config.models) {
        this.modelToRing.set(modelId, ring);
      }
    }
  }

  /**
   * Get the ring for a model.
   * @param {string} modelId
   * @returns {string|undefined}
   */
  getRingForModel(modelId) {
    return this.modelToRing.get(modelId);
  }

  /**
   * Get all models in a ring.
   * @param {string} ring
   * @returns {string[]}
   */
  getModelsInRing(ring) {
    return RING_WIRING[ring]?.models ?? [];
  }

  /**
   * Get all families in a ring.
   * @param {string} ring
   * @returns {string[]}
   */
  getFamiliesInRing(ring) {
    return RING_WIRING[ring]?.families ?? [];
  }

  /**
   * Get complete wiring table.
   * @returns {Object}
   */
  getWiringTable() {
    return { ...RING_WIRING };
  }

  /**
   * List all ring names.
   * @returns {string[]}
   */
  listRings() {
    return Object.keys(RING_WIRING);
  }

  /**
   * Total models wired.
   * @returns {number}
   */
  get totalModels() {
    return this.modelToRing.size;
  }

  /**
   * Total rings.
   * @returns {number}
   */
  get totalRings() {
    return Object.keys(RING_WIRING).length;
  }
}

export { OrganismWiring, RING_WIRING };
export default OrganismWiring;
