import { BaseConnector } from './base-connector.js';

/**
 * Salesforce CRM connector.
 * Supported entities: accounts, contacts, opportunities
 */
export class SalesforceConnector extends BaseConnector {
  name = 'salesforce';
  supportedEntities = new Set(['accounts', 'contacts', 'opportunities']);

  /** @type {Map<string, Object[]>} In-memory store keyed by entity type */
  _store = new Map([
    ['accounts', []],
    ['contacts', []],
    ['opportunities', []],
  ]);

  /**
   * @param {import('./base-connector.js').ConnectorConfig & { instanceUrl?: string }} config
   */
  constructor(config = {}) {
    super(config);
    this.instanceUrl = config.instanceUrl ?? 'https://login.salesforce.com';
  }

  /** @override */
  async connect() {
    const result = await super.connect();
    this.accessToken = this.config.apiKey;
    return { ...result, instanceUrl: this.instanceUrl };
  }

  /**
   * Salesforce-specific sync with SOQL-style pagination.
   * @override
   */
  async sync(direction, entity, options = {}) {
    if (!this.connected) throw new Error('[salesforce] connector is not connected');
    if (!this.supportedEntities.has(entity)) {
      throw new Error(`[salesforce] unsupported entity "${entity}". Supported: ${[...this.supportedEntities].join(', ')}`);
    }

    const records = this._store.get(entity) ?? [];
    let filtered = records;

    if (options.since) {
      const sinceDate = new Date(options.since);
      filtered = records.filter((r) => new Date(r.updatedAt) >= sinceDate);
    }

    if (options.limit && options.limit < filtered.length) {
      filtered = filtered.slice(0, options.limit);
    }

    return {
      connectorId: this.id,
      entity,
      direction,
      recordsSynced: filtered.length,
      records: direction === 'inbound' ? filtered : undefined,
      syncedAt: new Date().toISOString(),
      queryLocator: filtered.length > 0 ? `soql-${entity}-${Date.now()}` : null,
    };
  }

  /**
   * Map Salesforce field names to the internal schema.
   * Handles Salesforce conventions like `Name`, `Account.Name`, `OwnerId`.
   * @override
   */
  mapFields(sourceSchema, targetSchema) {
    const base = super.mapFields(sourceSchema, targetSchema);

    const sfAliases = {
      Name: 'name',
      AccountId: 'accountId',
      OwnerId: 'ownerId',
      Amount: 'amount',
      StageName: 'stage',
      CloseDate: 'closeDate',
      Email: 'email',
      Phone: 'phone',
      Industry: 'industry',
    };

    const extraMappings = [];
    for (const [sfField, alias] of Object.entries(sfAliases)) {
      const inSource = sourceSchema[sfField] !== undefined;
      const aliasInTarget = targetSchema[alias] !== undefined;
      const alreadyMapped = base.auto.some((m) => m.source === sfField);

      if (inSource && aliasInTarget && !alreadyMapped) {
        extraMappings.push({ source: sfField, target: alias });
      }
    }

    return {
      ...base,
      auto: [...base.auto, ...extraMappings],
      unmappedSource: base.unmappedSource.filter(
        (k) => !extraMappings.some((m) => m.source === k),
      ),
      unmappedTarget: base.unmappedTarget.filter(
        (k) => !extraMappings.some((m) => m.target === k),
      ),
    };
  }
}

export default SalesforceConnector;
