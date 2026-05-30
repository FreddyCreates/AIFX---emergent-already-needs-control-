import { ToolSchemaBuilder } from './tool-schema.js';

/**
 * RepoIntelligenceBridge — adapter for exposing repository engines, tools,
 * and query surfaces as callable marketplace tools.
 */
export class RepoIntelligenceBridge {
  /** @type {import('./tool-registry.js').ToolRegistry} */
  #registry;

  /** @type {import('./tool-invoker.js').ToolInvoker} */
  #invoker;

  /** @type {string} */
  #namespace;

  /** @type {import('./tool-schema.js').ExposureTier} */
  #defaultExposure;

  /** @type {number} */
  #counter;

  /**
   * @param {import('./tool-registry.js').ToolRegistry} registry
   * @param {import('./tool-invoker.js').ToolInvoker} invoker
   * @param {{ namespace?: string, defaultExposure?: import('./tool-schema.js').ExposureTier }} [options]
   */
  constructor(registry, invoker, options = {}) {
    if (!registry) throw new Error('RepoIntelligenceBridge requires a ToolRegistry');
    if (!invoker) throw new Error('RepoIntelligenceBridge requires a ToolInvoker');

    this.#registry = registry;
    this.#invoker = invoker;
    this.#namespace = options.namespace || 'REPO';
    this.#defaultExposure = options.defaultExposure || 'INTERNAL';
    this.#counter = 900;
  }

  /**
   * Registers any callable capability (engine/tool/query) into marketplace.
   * @param {Partial<import('./tool-schema.js').ToolSchema> & { name: string, purpose: string }} definition
   * @param {(input: Record<string, *>, context: Object) => Promise<*>|*} handler
   * @returns {import('./tool-schema.js').ToolSchema}
   */
  registerCallable(definition, handler) {
    if (!definition?.name || !definition?.purpose) {
      throw new Error('registerCallable requires name and purpose');
    }
    if (typeof handler !== 'function') {
      throw new TypeError('registerCallable handler must be a function');
    }

    const schema = ToolSchemaBuilder.create({
      callId: definition.callId || this.#nextCallId(),
      name: definition.name,
      displayName: definition.displayName || definition.name,
      purpose: definition.purpose,
      permissionClass: definition.permissionClass || 'organism.call',
      inputSchema: definition.inputSchema || [],
      outputSchema: definition.outputSchema || [],
      latencyExpectation: definition.latencyExpectation ?? 873,
      costWeight: definition.costWeight ?? 1,
      successContract: definition.successContract || 'Returns payload with status="ok"',
      failureContract: definition.failureContract || 'Returns payload with status="error"',
      housePlacement: definition.housePlacement || 'Interface Ring',
      exposure: definition.exposure || this.#defaultExposure,
      version: definition.version || '1.0.0',
      endpointProtocol: definition.endpointProtocol || `repo-intel/${String(definition.name).toLowerCase()}`,
      billingClass: definition.billingClass || 'free',
      trustTier: definition.trustTier || 'medium',
      sdkDependencies: definition.sdkDependencies || [],
      lawsEnforced: definition.lawsEnforced || [],
      family: definition.family || 'Commander',
    });

    this.#registry.register(schema);
    this.#invoker.registerHandler(schema.callId, handler);
    return schema;
  }

  /**
   * Registers an engine adapter callable.
   * @param {{ name: string, purpose: string, inputSchema?: Array<Object>, outputSchema?: Array<Object>, callId?: string, exposure?: import('./tool-schema.js').ExposureTier }} engine
   * @param {(input: Record<string, *>, context: Object) => Promise<*>|*} handler
   * @returns {import('./tool-schema.js').ToolSchema}
   */
  registerEngine(engine, handler) {
    return this.registerCallable({
      ...engine,
      permissionClass: 'engine.invoke',
      housePlacement: engine.housePlacement || 'Sovereign Ring',
      family: 'Commander',
      sdkDependencies: Array.from(new Set([...(engine.sdkDependencies || []), 'engines'])),
    }, handler);
  }

  /**
   * Registers a query adapter callable.
   * @param {{ name: string, purpose: string, inputSchema?: Array<Object>, outputSchema?: Array<Object>, callId?: string, exposure?: import('./tool-schema.js').ExposureTier }} query
   * @param {(input: Record<string, *>, context: Object) => Promise<*>|*} handler
   * @returns {import('./tool-schema.js').ToolSchema}
   */
  registerQuery(query, handler) {
    return this.registerCallable({
      ...query,
      permissionClass: 'organism.read',
      housePlacement: query.housePlacement || 'Memory Ring',
      family: 'Context',
      sdkDependencies: Array.from(new Set([...(query.sdkDependencies || []), 'medina-queries'])),
    }, handler);
  }

  /**
   * Registers a tool adapter callable.
   * @param {{ name: string, purpose: string, inputSchema?: Array<Object>, outputSchema?: Array<Object>, callId?: string, exposure?: import('./tool-schema.js').ExposureTier }} tool
   * @param {(input: Record<string, *>, context: Object) => Promise<*>|*} handler
   * @returns {import('./tool-schema.js').ToolSchema}
   */
  registerTool(tool, handler) {
    return this.registerCallable({
      ...tool,
      permissionClass: 'tool.invoke',
      housePlacement: tool.housePlacement || 'Interface Ring',
      family: 'Commander',
      sdkDependencies: Array.from(new Set([...(tool.sdkDependencies || []), 'organism-marketplace'])),
    }, handler);
  }

  /**
   * Grants a principal broad access by exposure tier.
   * @param {string} principalId
   * @param {import('./tool-schema.js').ExposureTier} [maxTier]
   */
  grantPrincipal(principalId, maxTier = this.#defaultExposure) {
    this.#invoker.grantTierPermissions(principalId, maxTier);
  }

  /**
   * Creates a thin client for an agent to invoke by callId or tool name.
   * @param {string} principalId
   * @param {import('./tool-schema.js').ExposureTier} [maxTier]
   * @returns {{ listTools: () => Object[], execute: (callId: string, input?: Object, traceId?: string) => Promise<*>, executeByName: (toolName: string, input?: Object, traceId?: string) => Promise<*> }}
   */
  createAgentClient(principalId, maxTier = this.#defaultExposure) {
    this.grantPrincipal(principalId, maxTier);

    return {
      listTools: () => this.#registry.listByExposure(maxTier),
      execute: (callId, input = {}, traceId) =>
        this.#invoker.invoke(callId, input, { principalId, traceId }),
      executeByName: (toolName, input = {}, traceId) => {
        const schema = this.#registry.getByName(toolName)
          || this.#registry.listAll().find((t) => t.name.toLowerCase() === String(toolName).toLowerCase());
        if (!schema) {
          throw new Error(`Unknown tool name "${toolName}"`);
        }
        return this.#invoker.invoke(schema.callId, input, { principalId, traceId });
      },
    };
  }

  /**
   * @returns {string}
   */
  #nextCallId() {
    const id = this.#counter++;
    return `${this.#namespace}-${String(id).padStart(3, '0')}`;
  }
}

export default RepoIntelligenceBridge;
