import { BaseConnector } from './base-connector.js';

/**
 * Shopify e-commerce connector.
 * Supported entities: products, orders, customers
 */
export class ShopifyConnector extends BaseConnector {
  name = 'shopify';
  supportedEntities = new Set(['products', 'orders', 'customers']);

  /** @type {Map<string, Object[]>} */
  _store = new Map([
    ['products', []],
    ['orders', []],
    ['customers', []],
  ]);

  /**
   * @param {import('./base-connector.js').ConnectorConfig & { shopDomain?: string, apiVersion?: string }} config
   */
  constructor(config = {}) {
    super(config);
    this.shopDomain = config.shopDomain ?? null;
    this.apiVersion = config.apiVersion ?? '2024-04';
  }

  /** @override */
  async connect() {
    if (!this.shopDomain) throw new Error('[shopify] shopDomain is required');
    const result = await super.connect();
    return { ...result, shopDomain: this.shopDomain, apiVersion: this.apiVersion };
  }

  /**
   * Shopify-specific sync using link-header pagination.
   * @override
   */
  async sync(direction, entity, options = {}) {
    if (!this.connected) throw new Error('[shopify] connector is not connected');
    if (!this.supportedEntities.has(entity)) {
      throw new Error(`[shopify] unsupported entity "${entity}". Supported: ${[...this.supportedEntities].join(', ')}`);
    }

    const records = this._store.get(entity) ?? [];
    let filtered = records;

    if (options.since) {
      const sinceDate = new Date(options.since);
      filtered = records.filter((r) => new Date(r.updated_at) >= sinceDate);
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
      nextPageInfo: null,
      syncedAt: new Date().toISOString(),
    };
  }

  /**
   * Map Shopify REST Admin API fields to the internal schema.
   * @override
   */
  mapFields(sourceSchema, targetSchema) {
    const base = super.mapFields(sourceSchema, targetSchema);

    const shopifyAliases = {
      title: 'productName',
      body_html: 'description',
      product_type: 'category',
      vendor: 'brand',
      order_number: 'orderNumber',
      financial_status: 'paymentStatus',
      fulfillment_status: 'fulfillmentStatus',
      total_price: 'totalAmount',
      first_name: 'firstName',
      last_name: 'lastName',
    };

    const extraMappings = [];
    for (const [shopField, alias] of Object.entries(shopifyAliases)) {
      const inSource = sourceSchema[shopField] !== undefined;
      const aliasInTarget = targetSchema[alias] !== undefined;
      const alreadyMapped = base.auto.some((m) => m.source === shopField);

      if (inSource && aliasInTarget && !alreadyMapped) {
        extraMappings.push({ source: shopField, target: alias });
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

export default ShopifyConnector;
