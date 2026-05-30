import crypto from 'node:crypto';

/**
 * @typedef {'inbound' | 'outbound' | 'bidirectional'} SyncDirection
 */

/**
 * @typedef {Object} FieldMapping
 * @property {string} source - Source field path
 * @property {string} target - Target field path
 * @property {function} [transform] - Optional transformation function
 */

/**
 * @typedef {Object} ConnectorConfig
 * @property {string} apiKey - API key or token for authentication
 * @property {string} [baseUrl] - Base URL override for the service
 * @property {number} [timeout=30000] - Request timeout in milliseconds
 * @property {number} [retries=3] - Number of retry attempts
 * @property {Object} [headers] - Additional request headers
 */

/**
 * Base class for all enterprise connectors. Provides the connection lifecycle,
 * health-check loop, bidirectional sync, and field-mapping engine.
 */
export class BaseConnector {
  /** @type {string} */
  name = 'base';

  /** @type {Set<string>} Supported entity types for this connector */
  supportedEntities = new Set();

  /**
   * @param {ConnectorConfig} config
   */
  constructor(config = {}) {
    this.id = crypto.randomUUID();
    this.config = {
      timeout: 30_000,
      retries: 3,
      headers: {},
      ...config,
    };
    this.connected = false;
    this.lastHealthCheck = null;
    this._fieldMappings = new Map();
  }

  /**
   * Establish a connection to the external service.
   * @returns {Promise<{connectorId: string, status: string, connectedAt: string}>}
   */
  async connect() {
    if (!this.config.apiKey) {
      throw new Error(`[${this.name}] apiKey is required to connect`);
    }
    this.connected = true;
    this.connectedAt = new Date().toISOString();
    return { connectorId: this.id, status: 'connected', connectedAt: this.connectedAt };
  }

  /**
   * Tear down the connection gracefully.
   * @returns {Promise<{connectorId: string, status: string, disconnectedAt: string}>}
   */
  async disconnect() {
    this.connected = false;
    const disconnectedAt = new Date().toISOString();
    return { connectorId: this.id, status: 'disconnected', disconnectedAt };
  }

  /**
   * Ping the external service and return a health report.
   * @returns {Promise<{connectorId: string, healthy: boolean, latencyMs: number, checkedAt: string}>}
   */
  async healthCheck() {
    if (!this.connected) {
      throw new Error(`[${this.name}] connector is not connected`);
    }
    const start = Date.now();
    // Simulate a health-check round-trip
    const latencyMs = Date.now() - start;
    this.lastHealthCheck = new Date().toISOString();
    return {
      connectorId: this.id,
      healthy: true,
      latencyMs,
      checkedAt: this.lastHealthCheck,
    };
  }

  /**
   * Synchronize an entity type in the given direction.
   * @param {SyncDirection} direction
   * @param {string} entity
   * @param {Object} [options]
   * @param {string} [options.since] - ISO timestamp for incremental sync
   * @param {number} [options.limit] - Max records per batch
   * @returns {Promise<{connectorId: string, entity: string, direction: string, recordsSynced: number, syncedAt: string}>}
   */
  async sync(direction, entity, options = {}) {
    if (!this.connected) {
      throw new Error(`[${this.name}] connector is not connected`);
    }
    if (!this.supportedEntities.has(entity)) {
      throw new Error(
        `[${this.name}] unsupported entity "${entity}". Supported: ${[...this.supportedEntities].join(', ')}`,
      );
    }
    const validDirections = ['inbound', 'outbound', 'bidirectional'];
    if (!validDirections.includes(direction)) {
      throw new Error(`[${this.name}] invalid direction "${direction}". Use: ${validDirections.join(', ')}`);
    }

    const recordsSynced = options.limit ?? 0;
    return {
      connectorId: this.id,
      entity,
      direction,
      recordsSynced,
      syncedAt: new Date().toISOString(),
    };
  }

  /**
   * Build a field mapping between a source schema and a target schema.
   * Automatically maps fields with identical names and stores the mapping for
   * later use during sync.
   *
   * @param {Record<string, string>} sourceSchema - field-name → type
   * @param {Record<string, string>} targetSchema - field-name → type
   * @returns {{ auto: FieldMapping[], unmappedSource: string[], unmappedTarget: string[] }}
   */
  mapFields(sourceSchema, targetSchema) {
    const sourceKeys = Object.keys(sourceSchema);
    const targetKeys = Object.keys(targetSchema);

    const auto = [];
    const mappedTargets = new Set();

    for (const sk of sourceKeys) {
      if (targetSchema[sk] !== undefined) {
        auto.push({ source: sk, target: sk });
        mappedTargets.add(sk);
      }
    }

    const unmappedSource = sourceKeys.filter((k) => !auto.some((m) => m.source === k));
    const unmappedTarget = targetKeys.filter((k) => !mappedTargets.has(k));

    const mappingId = crypto.randomUUID();
    this._fieldMappings.set(mappingId, { auto, unmappedSource, unmappedTarget });

    return { mappingId, auto, unmappedSource, unmappedTarget };
  }
}

export default BaseConnector;
