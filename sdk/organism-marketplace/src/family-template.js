import { ToolSchemaBuilder, PHI, HEARTBEAT, VALID_FAMILIES } from './tool-schema.js';
import { FAMILY_PROFILES } from './family-profiles.js';

/**
 * FamilyTemplate — Template generator for creating new tools from family blueprints.
 *
 * The 24 hand-crafted core profiles define the 4 families. This template system
 * lets you generate additional tools that inherit their family's characteristics:
 * - default ring placement
 * - permission class prefix
 * - trust tier
 * - billing class
 * - law enforcement
 * - SDK dependencies
 * - resonance wiring pattern
 *
 * Usage:
 *   const template = new FamilyTemplate('Crawling');
 *   const schema = template.generate({
 *     callId: 'TOOL-025',
 *     name: 'ENDPOINT-SCANNER',
 *     purpose: 'Scan and enumerate all reachable endpoints in the organism',
 *     inputSchema: [...],
 *     outputSchema: [...],
 *   });
 *
 * @module family-template
 */

/**
 * @typedef {Object} FamilyBlueprint
 * @property {string} family - Family name
 * @property {string} defaultHouse - Default ring placement
 * @property {string} permissionPrefix - Permission class prefix
 * @property {string} trustTier - Default trust tier
 * @property {string} billingClass - Default billing class
 * @property {string} exposure - Default exposure tier
 * @property {string[]} defaultLaws - Default architectural laws enforced
 * @property {string[]} defaultSdkDeps - Default SDK dependencies
 * @property {number} latencyBaseline - Baseline latency expectation in ms
 * @property {number} costBaseline - Baseline cost weight
 * @property {Object} defaultInputFields - Standard input fields every tool in this family gets
 * @property {Object} defaultOutputFields - Standard output fields every tool in this family gets
 */

/**
 * Family blueprints — the template DNA for each family.
 * @type {Record<string, FamilyBlueprint>}
 */
const FAMILY_BLUEPRINTS = {
  Crawling: {
    family: 'Crawling',
    defaultHouse: 'Transport Ring',
    permissionPrefix: 'organism.crawl',
    trustTier: 'medium',
    billingClass: 'free',
    exposure: 'INTERNAL',
    defaultLaws: ['AL-005', 'AL-014', 'AL-034'],
    defaultSdkDeps: ['@medina/intelligence-routing-sdk'],
    latencyBaseline: 300,
    costBaseline: 2,
    defaultInputFields: [
      { name: 'action', type: 'string', required: true, description: 'Action to perform' },
      { name: 'scope', type: 'string', required: false, description: 'Crawl scope: "local" | "ring" | "organism" | "all"', defaultValue: 'organism' },
    ],
    defaultOutputFields: [
      { name: 'status', type: 'string', required: true, description: 'ok | partial | unreachable | error' },
      { name: 'itemsScanned', type: 'number', required: true, description: 'Number of items scanned/crawled' },
      { name: 'timestamp', type: 'number', required: true, description: 'Unix timestamp' },
    ],
  },

  Context: {
    family: 'Context',
    defaultHouse: 'Sovereign Ring',
    permissionPrefix: 'organism.context',
    trustTier: 'medium',
    billingClass: 'free',
    exposure: 'INTERNAL',
    defaultLaws: ['AL-004', 'AL-020', 'AL-022'],
    defaultSdkDeps: ['@medina/organism-runtime-sdk', '@medina/sovereign-memory-sdk'],
    latencyBaseline: 200,
    costBaseline: 2,
    defaultInputFields: [
      { name: 'action', type: 'string', required: true, description: 'Action to perform' },
      { name: 'includeHistory', type: 'boolean', required: false, description: 'Include historical context', defaultValue: false },
    ],
    defaultOutputFields: [
      { name: 'status', type: 'string', required: true, description: 'ok | partial | error' },
      { name: 'context', type: 'object', required: true, description: 'Assembled context data' },
      { name: 'timestamp', type: 'number', required: true, description: 'Unix timestamp' },
    ],
  },

  Commander: {
    family: 'Commander',
    defaultHouse: 'Interface Ring',
    permissionPrefix: 'organism.command',
    trustTier: 'high',
    billingClass: 'metered',
    exposure: 'INTERNAL_SOVEREIGN',
    defaultLaws: ['AL-025', 'AL-027', 'AL-036'],
    defaultSdkDeps: ['@medina/intelligence-routing-sdk', '@medina/organism-runtime-sdk'],
    latencyBaseline: 400,
    costBaseline: 5,
    defaultInputFields: [
      { name: 'action', type: 'string', required: true, description: 'Action to perform' },
      { name: 'priority', type: 'string', required: false, description: 'Priority: "low" | "normal" | "high" | "critical"', defaultValue: 'normal' },
    ],
    defaultOutputFields: [
      { name: 'status', type: 'string', required: true, description: 'ok | dispatched | queued | error' },
      { name: 'executionId', type: 'string', required: true, description: 'Execution tracking ID' },
      { name: 'timestamp', type: 'number', required: true, description: 'Unix timestamp' },
    ],
  },

  Sentry: {
    family: 'Sentry',
    defaultHouse: 'Counsel Ring',
    permissionPrefix: 'organism.security',
    trustTier: 'critical',
    billingClass: 'free',
    exposure: 'INTERNAL',
    defaultLaws: ['AL-010', 'AL-011', 'AL-021'],
    defaultSdkDeps: [],
    latencyBaseline: 200,
    costBaseline: 3,
    defaultInputFields: [
      { name: 'action', type: 'string', required: true, description: 'Action to perform' },
      { name: 'target', type: 'string', required: false, description: 'Specific target to check' },
    ],
    defaultOutputFields: [
      { name: 'status', type: 'string', required: true, description: 'ok | threat-detected | violation | error' },
      { name: 'findings', type: 'array', required: true, description: 'Array of findings with severity' },
      { name: 'timestamp', type: 'number', required: true, description: 'Unix timestamp' },
    ],
  },
};

/**
 * FamilyTemplate — generates tool schemas from family blueprints.
 *
 * The 24 hand-crafted profiles define the families. This template lets you
 * generate additional tools that inherit their family's DNA while providing
 * custom purpose, inputs, and outputs.
 */
export class FamilyTemplate {
  /** @type {FamilyBlueprint} */
  #blueprint;

  /** @type {string} */
  #familyName;

  /**
   * @param {string} familyName - Crawling | Context | Commander | Sentry
   */
  constructor(familyName) {
    if (!VALID_FAMILIES.includes(familyName)) {
      throw new Error(`Invalid family: "${familyName}". Valid: ${VALID_FAMILIES.join(', ')}`);
    }
    this.#familyName = familyName;
    this.#blueprint = FAMILY_BLUEPRINTS[familyName];
  }

  /**
   * Returns the family name.
   * @returns {string}
   */
  get familyName() {
    return this.#familyName;
  }

  /**
   * Returns the raw blueprint.
   * @returns {FamilyBlueprint}
   */
  get blueprint() {
    return { ...this.#blueprint };
  }

  /**
   * Generates a tool schema by merging custom overrides with family defaults.
   *
   * Required overrides: callId, name, purpose
   * Everything else falls back to the family blueprint.
   *
   * @param {Object} overrides - Custom tool definition fields
   * @param {string} overrides.callId - Required: unique call ID
   * @param {string} overrides.name - Required: tool name
   * @param {string} overrides.purpose - Required: tool purpose
   * @param {Array} [overrides.inputSchema] - Custom input fields (merged with family defaults)
   * @param {Array} [overrides.outputSchema] - Custom output fields (merged with family defaults)
   * @returns {import('./tool-schema.js').ToolSchema}
   */
  generate(overrides) {
    if (!overrides.callId || !overrides.name || !overrides.purpose) {
      throw new Error('FamilyTemplate.generate() requires callId, name, and purpose');
    }

    const bp = this.#blueprint;

    // Merge input/output schemas: family defaults + custom fields (deduplicated by name)
    const mergedInput = this.#mergeFields(bp.defaultInputFields, overrides.inputSchema || []);
    const mergedOutput = this.#mergeFields(bp.defaultOutputFields, overrides.outputSchema || []);

    return ToolSchemaBuilder.create({
      callId: overrides.callId,
      name: overrides.name,
      displayName: overrides.displayName || overrides.name.split('-').map(
        (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
      ).join(' '),
      purpose: overrides.purpose,
      family: bp.family,
      permissionClass: overrides.permissionClass || `${bp.permissionPrefix}.${overrides.name.toLowerCase().replace(/-/g, '_')}`,
      inputSchema: mergedInput,
      outputSchema: mergedOutput,
      latencyExpectation: overrides.latencyExpectation ?? bp.latencyBaseline,
      costWeight: overrides.costWeight ?? bp.costBaseline,
      successContract: overrides.successContract || `Returns result with status "ok"`,
      failureContract: overrides.failureContract || `Returns error with status "error" and error description`,
      housePlacement: overrides.housePlacement || bp.defaultHouse,
      exposure: overrides.exposure || bp.exposure,
      version: overrides.version || '1.0.0',
      endpointProtocol: overrides.endpointProtocol || `intelligence-wire/${overrides.name.toLowerCase()}`,
      billingClass: overrides.billingClass || bp.billingClass,
      trustTier: overrides.trustTier || bp.trustTier,
      sdkDependencies: overrides.sdkDependencies || bp.defaultSdkDeps,
      lawsEnforced: overrides.lawsEnforced || bp.defaultLaws,
    });
  }

  /**
   * Generates a tool schema AND a default handler stub.
   * @param {Object} overrides - Same as generate()
   * @param {Function} [handlerFn] - Custom handler; defaults to a stub returning family defaults
   * @returns {{ schema: import('./tool-schema.js').ToolSchema, handler: Function }}
   */
  generateWithHandler(overrides, handlerFn) {
    const schema = this.generate(overrides);

    const handler = handlerFn || (async (input) => {
      const output = {};
      for (const field of schema.outputSchema) {
        if (field.type === 'string') output[field.name] = field.name === 'status' ? 'ok' : '';
        else if (field.type === 'number') output[field.name] = field.name === 'timestamp' ? Date.now() : 0;
        else if (field.type === 'boolean') output[field.name] = true;
        else if (field.type === 'array') output[field.name] = [];
        else if (field.type === 'object') output[field.name] = {};
      }
      return output;
    });

    return { schema, handler };
  }

  /**
   * Merges family default fields with custom fields. Custom fields with the
   * same name as defaults override the default.
   * @param {Array} defaults
   * @param {Array} customs
   * @returns {Array}
   */
  #mergeFields(defaults, customs) {
    const byName = new Map();
    for (const field of defaults) {
      byName.set(field.name, { ...field });
    }
    for (const field of customs) {
      byName.set(field.name, { ...field });
    }
    return Array.from(byName.values());
  }
}

/**
 * Convenience: get the blueprint for a family.
 * @param {string} familyName
 * @returns {FamilyBlueprint}
 */
export function getFamilyBlueprint(familyName) {
  const bp = FAMILY_BLUEPRINTS[familyName];
  if (!bp) throw new Error(`Unknown family: "${familyName}"`);
  return { ...bp };
}

/**
 * All family blueprints.
 */
export const ALL_BLUEPRINTS = Object.freeze({ ...FAMILY_BLUEPRINTS });

export default FamilyTemplate;
