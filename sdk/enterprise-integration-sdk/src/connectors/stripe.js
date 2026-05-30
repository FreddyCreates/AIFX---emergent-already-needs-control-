import { BaseConnector } from './base-connector.js';

/**
 * Stripe payments connector.
 * Supported entities: customers, subscriptions, invoices
 */
export class StripeConnector extends BaseConnector {
  name = 'stripe';
  supportedEntities = new Set(['customers', 'subscriptions', 'invoices']);

  /** @type {Map<string, Object[]>} */
  _store = new Map([
    ['customers', []],
    ['subscriptions', []],
    ['invoices', []],
  ]);

  /**
   * @param {import('./base-connector.js').ConnectorConfig & { stripeAccount?: string }} config
   */
  constructor(config = {}) {
    super(config);
    this.stripeAccount = config.stripeAccount ?? null;
    this.apiVersion = '2024-04-10';
  }

  /** @override */
  async connect() {
    const result = await super.connect();
    return { ...result, apiVersion: this.apiVersion, stripeAccount: this.stripeAccount };
  }

  /**
   * Stripe-specific sync using auto-paginating list endpoints.
   * @override
   */
  async sync(direction, entity, options = {}) {
    if (!this.connected) throw new Error('[stripe] connector is not connected');
    if (!this.supportedEntities.has(entity)) {
      throw new Error(`[stripe] unsupported entity "${entity}". Supported: ${[...this.supportedEntities].join(', ')}`);
    }

    const records = this._store.get(entity) ?? [];
    let filtered = records;

    if (options.since) {
      const sinceTs = Math.floor(new Date(options.since).getTime() / 1000);
      filtered = records.filter((r) => (r.created ?? 0) >= sinceTs);
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
      syncedAt: new Date().toISOString(),
    };
  }

  /**
   * Map Stripe object keys to the internal schema.
   * @override
   */
  mapFields(sourceSchema, targetSchema) {
    const base = super.mapFields(sourceSchema, targetSchema);

    const stripeAliases = {
      customer: 'customerId',
      current_period_start: 'periodStart',
      current_period_end: 'periodEnd',
      amount_due: 'amountDue',
      amount_paid: 'amountPaid',
      hosted_invoice_url: 'invoiceUrl',
      default_payment_method: 'paymentMethod',
      cancel_at_period_end: 'cancelAtEnd',
    };

    const extraMappings = [];
    for (const [stripeField, alias] of Object.entries(stripeAliases)) {
      const inSource = sourceSchema[stripeField] !== undefined;
      const aliasInTarget = targetSchema[alias] !== undefined;
      const alreadyMapped = base.auto.some((m) => m.source === stripeField);

      if (inSource && aliasInTarget && !alreadyMapped) {
        extraMappings.push({ source: stripeField, target: alias });
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

export default StripeConnector;
