import { BaseConnector } from './base-connector.js';

/**
 * HubSpot CRM connector.
 * Supported entities: contacts, deals, tickets
 */
export class HubSpotConnector extends BaseConnector {
  name = 'hubspot';
  supportedEntities = new Set(['contacts', 'deals', 'tickets']);

  /** @type {Map<string, Object[]>} */
  _store = new Map([
    ['contacts', []],
    ['deals', []],
    ['tickets', []],
  ]);

  /**
   * @param {import('./base-connector.js').ConnectorConfig & { portalId?: string }} config
   */
  constructor(config = {}) {
    super(config);
    this.portalId = config.portalId ?? null;
  }

  /** @override */
  async connect() {
    const result = await super.connect();
    return { ...result, portalId: this.portalId };
  }

  /**
   * HubSpot-specific sync using offset-based pagination.
   * @override
   */
  async sync(direction, entity, options = {}) {
    if (!this.connected) throw new Error('[hubspot] connector is not connected');
    if (!this.supportedEntities.has(entity)) {
      throw new Error(`[hubspot] unsupported entity "${entity}". Supported: ${[...this.supportedEntities].join(', ')}`);
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
      hasMore: false,
      offset: filtered.length,
      syncedAt: new Date().toISOString(),
    };
  }

  /**
   * Map HubSpot property names to the internal schema.
   * @override
   */
  mapFields(sourceSchema, targetSchema) {
    const base = super.mapFields(sourceSchema, targetSchema);

    const hubspotAliases = {
      firstname: 'firstName',
      lastname: 'lastName',
      dealname: 'dealName',
      dealstage: 'stage',
      pipeline: 'pipelineId',
      hs_ticket_priority: 'priority',
      hs_pipeline_stage: 'ticketStage',
      associatedcompanyid: 'companyId',
    };

    const extraMappings = [];
    for (const [hsField, alias] of Object.entries(hubspotAliases)) {
      const inSource = sourceSchema[hsField] !== undefined;
      const aliasInTarget = targetSchema[alias] !== undefined;
      const alreadyMapped = base.auto.some((m) => m.source === hsField);

      if (inSource && aliasInTarget && !alreadyMapped) {
        extraMappings.push({ source: hsField, target: alias });
      }
    }

    return {
      ...base,
      auto: [...base.auto, ...extraMappings],
      unmappedSource: base.unmappedSource.filter((k) => !extraMappings.some((m) => m.source === k)),
      unmappedTarget: base.unmappedTarget.filter((k) => !extraMappings.some((m) => m.target === k)),
    };
  }
}

export default HubSpotConnector;
