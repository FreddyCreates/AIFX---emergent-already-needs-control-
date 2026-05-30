import { BaseConnector } from './base-connector.js';

/**
 * SAP ERP connector.
 * Supported entities: materials, purchase_orders, business_partners
 */
export class SAPConnector extends BaseConnector {
  name = 'sap';
  supportedEntities = new Set(['materials', 'purchase_orders', 'business_partners']);

  /** @type {Map<string, Object[]>} */
  _store = new Map([
    ['materials', []],
    ['purchase_orders', []],
    ['business_partners', []],
  ]);

  /**
   * @param {import('./base-connector.js').ConnectorConfig & { systemId?: string, client?: string }} config
   */
  constructor(config = {}) {
    super(config);
    this.systemId = config.systemId ?? 'S4H';
    this.client = config.client ?? '100';
  }

  /** @override */
  async connect() {
    const result = await super.connect();
    return { ...result, systemId: this.systemId, client: this.client };
  }

  /**
   * SAP sync using OData-style entity sets with delta tokens.
   * @override
   */
  async sync(direction, entity, options = {}) {
    if (!this.connected) throw new Error('[sap] connector is not connected');
    if (!this.supportedEntities.has(entity)) {
      throw new Error(`[sap] unsupported entity "${entity}". Supported: ${[...this.supportedEntities].join(', ')}`);
    }

    const entitySetMap = {
      materials: 'A_Product',
      purchase_orders: 'A_PurchaseOrder',
      business_partners: 'A_BusinessPartner',
    };

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
      entitySet: entitySetMap[entity],
      direction,
      recordsSynced: filtered.length,
      records: direction === 'inbound' ? filtered : undefined,
      deltaToken: `sap-delta-${Date.now()}`,
      syncedAt: new Date().toISOString(),
    };
  }

  /**
   * Map SAP-style field names (PascalCase, prefixed) to the internal schema.
   * @override
   */
  mapFields(sourceSchema, targetSchema) {
    const base = super.mapFields(sourceSchema, targetSchema);

    const sapAliases = {
      Material: 'materialId',
      MaterialDescription: 'description',
      PurchaseOrder: 'purchaseOrderId',
      Supplier: 'supplierId',
      BusinessPartner: 'partnerId',
      BusinessPartnerFullName: 'partnerName',
      CompanyCode: 'companyCode',
      Currency: 'currency',
    };

    const extraMappings = [];
    for (const [sapField, alias] of Object.entries(sapAliases)) {
      const inSource = sourceSchema[sapField] !== undefined;
      const aliasInTarget = targetSchema[alias] !== undefined;
      const alreadyMapped = base.auto.some((m) => m.source === sapField);

      if (inSource && aliasInTarget && !alreadyMapped) {
        extraMappings.push({ source: sapField, target: alias });
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

export default SAPConnector;
