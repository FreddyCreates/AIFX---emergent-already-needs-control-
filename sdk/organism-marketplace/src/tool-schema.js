import crypto from 'node:crypto';

/**
 * @typedef {'INTERNAL'|'INTERNAL_SOVEREIGN'|'PARTNER'|'ENTERPRISE'|'PUBLIC'} ExposureTier
 */

/**
 * @typedef {'free'|'metered'|'per-call'|'per-seat'|'enterprise-license'} BillingClass
 */

/**
 * @typedef {'low'|'medium'|'high'|'critical'} TrustTier
 */

/**
 * @typedef {'Crawling'|'Context'|'Commander'|'Sentry'} ToolFamily
 */

/**
 * @typedef {Object} FieldSchema
 * @property {string} name - Field name
 * @property {string} type - JSON Schema type: string | number | boolean | object | array
 * @property {boolean} required - Whether the field is required
 * @property {string} description - Human-readable description
 * @property {*} [defaultValue] - Default value if not provided
 */

/**
 * @typedef {Object} ToolSchema
 * @property {string} callId - Unique tool call identifier (e.g. TOOL-001)
 * @property {string} name - Machine-readable tool name (e.g. PULSE-KEEPER)
 * @property {string} displayName - Human-readable display name
 * @property {string} purpose - What the tool does in one sentence
 * @property {string} permissionClass - Required permission level
 * @property {FieldSchema[]} inputSchema - Input parameters
 * @property {FieldSchema[]} outputSchema - Output fields
 * @property {number} latencyExpectation - Expected latency in milliseconds
 * @property {number} costWeight - Relative cost weight (0-100)
 * @property {string} successContract - What constitutes a successful call
 * @property {string} failureContract - What constitutes a failed call
 * @property {string} housePlacement - Organism ring or house placement
 * @property {ExposureTier} exposure - Visibility tier
 * @property {string} version - Semantic version
 * @property {string} endpointProtocol - Wire protocol path
 * @property {BillingClass} billingClass - Billing model
 * @property {TrustTier} trustTier - Required trust level
 * @property {string[]} sdkDependencies - SDK modules this tool depends on
 * @property {string[]} lawsEnforced - Architectural laws this tool enforces
 * @property {ToolFamily} [family] - Core family classification: Crawling | Context | Commander | Sentry
 */

const PHI = 1.618033988749895;
const HEARTBEAT = 873;

const VALID_TYPES = ['string', 'number', 'boolean', 'object', 'array'];
const VALID_EXPOSURES = ['INTERNAL', 'INTERNAL_SOVEREIGN', 'PARTNER', 'ENTERPRISE', 'PUBLIC'];
const VALID_BILLING = ['free', 'metered', 'per-call', 'per-seat', 'enterprise-license'];
const VALID_TRUST = ['low', 'medium', 'high', 'critical'];
const VALID_FAMILIES = ['Crawling', 'Context', 'Commander', 'Sentry'];

/**
 * ToolSchema — Defines the canonical schema for every callable tool in the organism marketplace.
 *
 * Every tool must have a clear callable interface with:
 * - name & purpose
 * - permission class
 * - input/output schemas
 * - latency expectations
 * - cost/usage weight
 * - success/failure contracts
 *
 * AIs do not automatically "understand the market." They use tools reliably only when
 * the tool has a clear callable interface, is discoverable in a registry, is routed
 * by policy/orchestration, and the result comes back in a usable schema.
 */
export class ToolSchemaBuilder {
  /**
   * Creates a new tool schema definition.
   * @param {Partial<ToolSchema>} definition
   * @returns {ToolSchema}
   */
  static create(definition) {
    ToolSchemaBuilder.#validate(definition);

    return Object.freeze({
      callId: definition.callId,
      name: definition.name,
      displayName: definition.displayName || definition.name,
      purpose: definition.purpose,
      permissionClass: definition.permissionClass || 'organism.read',
      inputSchema: Object.freeze((definition.inputSchema || []).map((f) => Object.freeze({ ...f }))),
      outputSchema: Object.freeze((definition.outputSchema || []).map((f) => Object.freeze({ ...f }))),
      latencyExpectation: definition.latencyExpectation ?? HEARTBEAT,
      costWeight: definition.costWeight ?? 1,
      successContract: definition.successContract || 'Returns result with status === "ok"',
      failureContract: definition.failureContract || 'Returns error with status === "error" and error message',
      housePlacement: definition.housePlacement || 'Sovereign Ring',
      exposure: definition.exposure || 'INTERNAL',
      version: definition.version || '1.0.0',
      endpointProtocol: definition.endpointProtocol || `intelligence-wire/${definition.name?.toLowerCase()}`,
      billingClass: definition.billingClass || 'free',
      trustTier: definition.trustTier || 'medium',
      sdkDependencies: Object.freeze(definition.sdkDependencies || []),
      lawsEnforced: Object.freeze(definition.lawsEnforced || []),
      family: definition.family || null,
    });
  }

  /**
   * Validates a tool call's input against the tool's input schema.
   * @param {ToolSchema} schema
   * @param {Record<string, *>} input
   * @returns {{ valid: boolean, errors: string[] }}
   */
  static validateInput(schema, input) {
    const errors = [];

    for (const field of schema.inputSchema) {
      const value = input[field.name];

      if (field.required && (value === undefined || value === null)) {
        errors.push(`Missing required field: "${field.name}"`);
        continue;
      }

      if (value !== undefined && value !== null) {
        const actualType = Array.isArray(value) ? 'array' : typeof value;
        if (actualType !== field.type) {
          errors.push(`Field "${field.name}" expected type "${field.type}", got "${actualType}"`);
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Validates a tool call's output against the tool's output schema.
   * @param {ToolSchema} schema
   * @param {Record<string, *>} output
   * @returns {{ valid: boolean, errors: string[] }}
   */
  static validateOutput(schema, output) {
    const errors = [];

    for (const field of schema.outputSchema) {
      const value = output[field.name];

      if (field.required && (value === undefined || value === null)) {
        errors.push(`Missing required output field: "${field.name}"`);
        continue;
      }

      if (value !== undefined && value !== null) {
        const actualType = Array.isArray(value) ? 'array' : typeof value;
        if (actualType !== field.type) {
          errors.push(`Output field "${field.name}" expected type "${field.type}", got "${actualType}"`);
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Generates a tool description optimized for AI agent consumption.
   * This is the "marketplace grammar" that makes tools legible to AIs.
   * @param {ToolSchema} schema
   * @returns {string}
   */
  static toAgentDescription(schema) {
    const inputParams = schema.inputSchema
      .map((f) => `  - ${f.name} (${f.type}${f.required ? ', required' : ', optional'}): ${f.description}`)
      .join('\n');

    const outputParams = schema.outputSchema
      .map((f) => `  - ${f.name} (${f.type}): ${f.description}`)
      .join('\n');

    return [
      `Tool: ${schema.name}`,
      `ID: ${schema.callId}`,
      `Purpose: ${schema.purpose}`,
      `Permission: ${schema.permissionClass}`,
      `Latency: ${schema.latencyExpectation}ms`,
      `Input:`,
      inputParams || '  (none)',
      `Output:`,
      outputParams || '  (none)',
      `Success: ${schema.successContract}`,
      `Failure: ${schema.failureContract}`,
    ].join('\n');
  }

  /**
   * Generates an OpenAI-compatible function definition for the tool.
   * @param {ToolSchema} schema
   * @returns {Object}
   */
  static toOpenAIFunction(schema) {
    const properties = {};
    const required = [];

    for (const field of schema.inputSchema) {
      properties[field.name] = {
        type: field.type === 'array' ? 'array' : field.type,
        description: field.description,
      };
      if (field.required) required.push(field.name);
      if (field.defaultValue !== undefined) properties[field.name].default = field.defaultValue;
    }

    return {
      type: 'function',
      function: {
        name: schema.name,
        description: schema.purpose,
        parameters: {
          type: 'object',
          properties,
          required,
        },
      },
    };
  }

  /**
   * @param {Partial<ToolSchema>} def
   */
  static #validate(def) {
    if (!def.callId || typeof def.callId !== 'string') {
      throw new Error('ToolSchema requires a callId string');
    }
    if (!def.name || typeof def.name !== 'string') {
      throw new Error('ToolSchema requires a name string');
    }
    if (!def.purpose || typeof def.purpose !== 'string') {
      throw new Error('ToolSchema requires a purpose string');
    }
    if (def.exposure && !VALID_EXPOSURES.includes(def.exposure)) {
      throw new Error(`Invalid exposure tier: "${def.exposure}". Valid: ${VALID_EXPOSURES.join(', ')}`);
    }
    if (def.billingClass && !VALID_BILLING.includes(def.billingClass)) {
      throw new Error(`Invalid billing class: "${def.billingClass}". Valid: ${VALID_BILLING.join(', ')}`);
    }
    if (def.trustTier && !VALID_TRUST.includes(def.trustTier)) {
      throw new Error(`Invalid trust tier: "${def.trustTier}". Valid: ${VALID_TRUST.join(', ')}`);
    }
    if (def.family && !VALID_FAMILIES.includes(def.family)) {
      throw new Error(`Invalid family: "${def.family}". Valid: ${VALID_FAMILIES.join(', ')}`);
    }

    for (const field of def.inputSchema || []) {
      if (!field.name || !field.type) {
        throw new Error('Each input schema field requires name and type');
      }
      if (!VALID_TYPES.includes(field.type)) {
        throw new Error(`Invalid field type "${field.type}" in input schema. Valid: ${VALID_TYPES.join(', ')}`);
      }
    }

    for (const field of def.outputSchema || []) {
      if (!field.name || !field.type) {
        throw new Error('Each output schema field requires name and type');
      }
      if (!VALID_TYPES.includes(field.type)) {
        throw new Error(`Invalid field type "${field.type}" in output schema. Valid: ${VALID_TYPES.join(', ')}`);
      }
    }
  }
}

export { ToolSchemaBuilder as default, PHI, HEARTBEAT, VALID_EXPOSURES, VALID_BILLING, VALID_TRUST, VALID_FAMILIES };
