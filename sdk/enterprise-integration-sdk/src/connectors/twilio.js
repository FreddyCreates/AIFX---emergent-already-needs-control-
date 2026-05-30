import { BaseConnector } from './base-connector.js';

/**
 * Twilio communications connector.
 * Supported entities: messages, calls, phone_numbers
 */
export class TwilioConnector extends BaseConnector {
  name = 'twilio';
  supportedEntities = new Set(['messages', 'calls', 'phone_numbers']);

  /** @type {Map<string, Object[]>} */
  _store = new Map([
    ['messages', []],
    ['calls', []],
    ['phone_numbers', []],
  ]);

  /**
   * @param {import('./base-connector.js').ConnectorConfig & { accountSid?: string }} config
   */
  constructor(config = {}) {
    super(config);
    this.accountSid = config.accountSid ?? null;
  }

  /** @override */
  async connect() {
    if (!this.accountSid) throw new Error('[twilio] accountSid is required');
    const result = await super.connect();
    return { ...result, accountSid: this.accountSid };
  }

  /**
   * Twilio-specific sync using page-based list resources.
   * @override
   */
  async sync(direction, entity, options = {}) {
    if (!this.connected) throw new Error('[twilio] connector is not connected');
    if (!this.supportedEntities.has(entity)) {
      throw new Error(`[twilio] unsupported entity "${entity}". Supported: ${[...this.supportedEntities].join(', ')}`);
    }

    const records = this._store.get(entity) ?? [];
    let filtered = records;

    if (options.since) {
      const sinceDate = new Date(options.since);
      filtered = records.filter((r) => new Date(r.dateCreated ?? r.date_created) >= sinceDate);
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
      nextPageUri: null,
      syncedAt: new Date().toISOString(),
    };
  }

  /**
   * Map Twilio resource fields to the internal schema.
   * @override
   */
  mapFields(sourceSchema, targetSchema) {
    const base = super.mapFields(sourceSchema, targetSchema);

    const twilioAliases = {
      sid: 'messageId',
      from: 'sender',
      to: 'recipient',
      body: 'content',
      date_sent: 'sentAt',
      date_created: 'createdAt',
      friendly_name: 'name',
      phone_number: 'phoneNumber',
      call_duration: 'duration',
    };

    const extraMappings = [];
    for (const [twField, alias] of Object.entries(twilioAliases)) {
      const inSource = sourceSchema[twField] !== undefined;
      const aliasInTarget = targetSchema[alias] !== undefined;
      const alreadyMapped = base.auto.some((m) => m.source === twField);

      if (inSource && aliasInTarget && !alreadyMapped) {
        extraMappings.push({ source: twField, target: alias });
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

export default TwilioConnector;
