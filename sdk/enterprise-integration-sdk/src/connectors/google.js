import { BaseConnector } from './base-connector.js';

/**
 * Google Workspace connector.
 * Supported entities: drive, calendar, contacts
 */
export class GoogleConnector extends BaseConnector {
  name = 'google';
  supportedEntities = new Set(['drive', 'calendar', 'contacts']);

  /** @type {Map<string, Object[]>} */
  _store = new Map([
    ['drive', []],
    ['calendar', []],
    ['contacts', []],
  ]);

  /**
   * @param {import('./base-connector.js').ConnectorConfig & { domain?: string, serviceAccountEmail?: string }} config
   */
  constructor(config = {}) {
    super(config);
    this.domain = config.domain ?? null;
    this.serviceAccountEmail = config.serviceAccountEmail ?? null;
  }

  /** @override */
  async connect() {
    const result = await super.connect();
    return { ...result, domain: this.domain };
  }

  /**
   * Google-specific sync using page tokens for pagination.
   * @override
   */
  async sync(direction, entity, options = {}) {
    if (!this.connected) throw new Error('[google] connector is not connected');
    if (!this.supportedEntities.has(entity)) {
      throw new Error(`[google] unsupported entity "${entity}". Supported: ${[...this.supportedEntities].join(', ')}`);
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
      nextPageToken: filtered.length > 0 ? `goog-${entity}-${Date.now()}` : null,
      syncedAt: new Date().toISOString(),
    };
  }

  /**
   * Map Google Workspace field names to the internal schema.
   * @override
   */
  mapFields(sourceSchema, targetSchema) {
    const base = super.mapFields(sourceSchema, targetSchema);

    const googleAliases = {
      mimeType: 'fileType',
      webViewLink: 'url',
      modifiedTime: 'updatedAt',
      summary: 'title',
      organizer: 'organizerEmail',
      resourceName: 'contactId',
      emailAddresses: 'emails',
      phoneNumbers: 'phones',
    };

    const extraMappings = [];
    for (const [gField, alias] of Object.entries(googleAliases)) {
      const inSource = sourceSchema[gField] !== undefined;
      const aliasInTarget = targetSchema[alias] !== undefined;
      const alreadyMapped = base.auto.some((m) => m.source === gField);

      if (inSource && aliasInTarget && !alreadyMapped) {
        extraMappings.push({ source: gField, target: alias });
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

export default GoogleConnector;
