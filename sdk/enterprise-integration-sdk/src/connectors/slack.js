import { BaseConnector } from './base-connector.js';

/**
 * Slack connector.
 * Supported entities: channels, messages, users
 */
export class SlackConnector extends BaseConnector {
  name = 'slack';
  supportedEntities = new Set(['channels', 'messages', 'users']);

  /** @type {Map<string, Object[]>} */
  _store = new Map([
    ['channels', []],
    ['messages', []],
    ['users', []],
  ]);

  /**
   * @param {import('./base-connector.js').ConnectorConfig & { workspaceId?: string }} config
   */
  constructor(config = {}) {
    super(config);
    this.workspaceId = config.workspaceId ?? null;
  }

  /** @override */
  async connect() {
    const result = await super.connect();
    return { ...result, workspaceId: this.workspaceId };
  }

  /**
   * Slack-specific sync using cursor-based pagination.
   * @override
   */
  async sync(direction, entity, options = {}) {
    if (!this.connected) throw new Error('[slack] connector is not connected');
    if (!this.supportedEntities.has(entity)) {
      throw new Error(`[slack] unsupported entity "${entity}". Supported: ${[...this.supportedEntities].join(', ')}`);
    }

    const records = this._store.get(entity) ?? [];
    let filtered = records;

    if (options.since) {
      const sinceTs = new Date(options.since).getTime() / 1000;
      filtered = records.filter((r) => Number(r.ts ?? r.updated ?? 0) >= sinceTs);
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
      nextCursor: filtered.length > 0 ? `slack-cursor-${Date.now()}` : null,
      syncedAt: new Date().toISOString(),
    };
  }

  /**
   * Map Slack API field names to the internal schema.
   * @override
   */
  mapFields(sourceSchema, targetSchema) {
    const base = super.mapFields(sourceSchema, targetSchema);

    const slackAliases = {
      real_name: 'displayName',
      is_bot: 'bot',
      channel: 'channelId',
      ts: 'timestamp',
      thread_ts: 'threadId',
      is_private: 'private',
      num_members: 'memberCount',
    };

    const extraMappings = [];
    for (const [slackField, alias] of Object.entries(slackAliases)) {
      const inSource = sourceSchema[slackField] !== undefined;
      const aliasInTarget = targetSchema[alias] !== undefined;
      const alreadyMapped = base.auto.some((m) => m.source === slackField);

      if (inSource && aliasInTarget && !alreadyMapped) {
        extraMappings.push({ source: slackField, target: alias });
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

export default SlackConnector;
