/**
 * @medina/frontend-intelligence-models — MultimodalFamilyEngine
 *
 * 6 multimodal families that group the 30 front-end AI models into
 * cross-cutting intelligence clusters. Each family fuses models from
 * different categories into a multimodal organism cell.
 *
 * Families:
 *   1. Structure-Vision Family   — Markup + Graphics
 *   2. Visual-Design Family      — Styling + Animation + Design Systems
 *   3. Framework-Orchestration    — Frameworks + Meta-frameworks + SSR
 *   4. Memory-State Family       — State + Forms + State Machines
 *   5. Build-Transform Family    — Build + TypeScript + CI/CD
 *   6. Verification-Proof Family — Unit + E2E + Performance Testing
 *   7. Scene-Graphics Family     — WebGL + Canvas + Data Viz
 *   8. Transport-Stream Family   — API + Real-Time + GraphQL
 *   9. Persistence-Vault Family  — IndexedDB + Cache + Auth
 *  10. Native-Browser Family     — SW + Workers + Sensors
 *
 * @module @medina/frontend-intelligence-models/multimodal-family-engine
 */

const PHI = 1.618033988749895;
const HEARTBEAT = 873;

/**
 * @typedef {Object} MultimodalFamily
 * @property {string} familyId       — deterministic family ID
 * @property {string} name           — family name
 * @property {string[]} memberModels — model IDs belonging to this family
 * @property {string[]} modalities   — modalities this family covers
 * @property {string} ringAffinity   — primary ring
 * @property {string} fusionStrategy — how member outputs are fused
 * @property {boolean} autonomous    — always true
 */

class MultimodalFamilyEngine {
  constructor() {
    /** @type {Map<string, MultimodalFamily>} */
    this.families = new Map();
    this._seed();
  }

  /**
   * @param {MultimodalFamily} family
   * @private
   */
  _register(family) {
    this.families.set(family.familyId, family);
  }

  _seed() {
    this._register({
      familyId: 'MMF-001',
      name: 'Structure-Vision Family',
      memberModels: ['FIM-001', 'FIM-002', 'FIM-003'],
      modalities: ['text', 'html', 'svg', 'mathml', 'vision', 'component-tree'],
      ringAffinity: 'Projection Ring',
      fusionStrategy: 'Hierarchical composition — HTML structure encapsulates Web Components which embed SVG/MathML visuals',
      autonomous: true
    });

    this._register({
      familyId: 'MMF-002',
      name: 'Visual-Design Family',
      memberModels: ['FIM-004', 'FIM-005', 'FIM-006'],
      modalities: ['css', 'token-json', 'animation', 'vision', 'palette', 'easing'],
      ringAffinity: 'Visual Ring',
      fusionStrategy: 'Token-driven cascade — design tokens feed layout which drives animation timing',
      autonomous: true
    });

    this._register({
      familyId: 'MMF-003',
      name: 'Framework-Orchestration Family',
      memberModels: ['FIM-007', 'FIM-008', 'FIM-009'],
      modalities: ['react-code', 'vue-code', 'edge-code', 'route-map', 'component-tree'],
      ringAffinity: 'Interface Ring',
      fusionStrategy: 'Meta-framework arbitration — selector recommends framework, then delegates to React/Vue specialist',
      autonomous: true
    });

    this._register({
      familyId: 'MMF-004',
      name: 'Memory-State Family',
      memberModels: ['FIM-010', 'FIM-011', 'FIM-012'],
      modalities: ['state-schema', 'form-schema', 'statechart', 'validation', 'debug-visualization'],
      ringAffinity: 'Memory Ring',
      fusionStrategy: 'Layered state architecture — state machines guard form state which feeds reactive store',
      autonomous: true
    });

    this._register({
      familyId: 'MMF-005',
      name: 'Build-Transform Family',
      memberModels: ['FIM-013', 'FIM-014', 'FIM-015'],
      modalities: ['build-config', 'typescript', 'pipeline-yaml', 'bundle-stats', 'release-notes'],
      ringAffinity: 'Build Ring',
      fusionStrategy: 'Pipeline composition — TypeScript types inform bundler config which feeds CI/CD pipeline',
      autonomous: true
    });

    this._register({
      familyId: 'MMF-006',
      name: 'Verification-Proof Family',
      memberModels: ['FIM-016', 'FIM-017', 'FIM-018'],
      modalities: ['test-code', 'e2e-code', 'performance-report', 'visual-diff', 'coverage'],
      ringAffinity: 'Proof Ring',
      fusionStrategy: 'Verification pyramid — unit tests validate components, E2E validates flows, perf validates user experience',
      autonomous: true
    });

    this._register({
      familyId: 'MMF-007',
      name: 'Scene-Graphics Family',
      memberModels: ['FIM-019', 'FIM-020', 'FIM-021'],
      modalities: ['shader-code', 'scene-code', 'canvas-code', 'chart-data', 'visualization'],
      ringAffinity: 'Geometry Ring',
      fusionStrategy: 'Render pipeline fusion — WebGPU compute feeds data viz which renders to Canvas/WebGL',
      autonomous: true
    });

    this._register({
      familyId: 'MMF-008',
      name: 'Transport-Stream Family',
      memberModels: ['FIM-022', 'FIM-023', 'FIM-024'],
      modalities: ['api-schema', 'ws-stream', 'graphql-query', 'cache-strategy', 'client-code'],
      ringAffinity: 'Transport Ring',
      fusionStrategy: 'Channel multiplexing — REST/GraphQL/WebSocket channels unified under intelligent routing',
      autonomous: true
    });

    this._register({
      familyId: 'MMF-009',
      name: 'Persistence-Vault Family',
      memberModels: ['FIM-025', 'FIM-026', 'FIM-027'],
      modalities: ['idb-schema', 'cache-config', 'token-lifecycle', 'encrypted-storage'],
      ringAffinity: 'Persistence Ring',
      fusionStrategy: 'Layered vault — auth tokens secured in memory, cache managed by SW, structured data in IndexedDB',
      autonomous: true
    });

    this._register({
      familyId: 'MMF-010',
      name: 'Native-Browser Family',
      memberModels: ['FIM-028', 'FIM-029', 'FIM-030'],
      modalities: ['sw-code', 'worker-code', 'sensor-data', 'push-notification', 'pwa-manifest'],
      ringAffinity: 'Native Capability Ring',
      fusionStrategy: 'Browser substrate integration — SW manages lifecycle, Workers handle compute, Sensors feed environment data',
      autonomous: true
    });
  }

  /* ================================================================== */
  /*  Query Methods                                                      */
  /* ================================================================== */

  /**
   * Get a family by ID.
   * @param {string} familyId
   * @returns {MultimodalFamily|undefined}
   */
  getFamily(familyId) {
    return this.families.get(familyId);
  }

  /**
   * List all families.
   * @returns {MultimodalFamily[]}
   */
  listFamilies() {
    return Array.from(this.families.values());
  }

  /**
   * Find families that cover a specific modality.
   * @param {string} modality
   * @returns {MultimodalFamily[]}
   */
  findByModality(modality) {
    const lower = modality.toLowerCase();
    return this.listFamilies().filter(f =>
      f.modalities.some(m => m.toLowerCase().includes(lower))
    );
  }

  /**
   * Find the family that contains a given model.
   * @param {string} modelId
   * @returns {MultimodalFamily|undefined}
   */
  findFamilyForModel(modelId) {
    return this.listFamilies().find(f => f.memberModels.includes(modelId));
  }

  /**
   * Get families by ring affinity.
   * @param {string} ring
   * @returns {MultimodalFamily[]}
   */
  getByRing(ring) {
    return this.listFamilies().filter(f => f.ringAffinity === ring);
  }

  /**
   * Total family count.
   * @returns {number}
   */
  get size() {
    return this.families.size;
  }
}

export { MultimodalFamilyEngine };
export default MultimodalFamilyEngine;
