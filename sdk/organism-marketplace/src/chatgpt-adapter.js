/**
 * ChatGPTToolAdapter — bridges OpenAI/ChatGPT tool-call formats to the
 * organism marketplace invocation surface.
 *
 * Supports:
 * - Chat Completions tool calls: { type: 'function', function: { name, arguments } }
 * - Responses API function calls: { type: 'function_call', name, arguments }
 */
export class ChatGPTToolAdapter {
  /** @type {import('./tool-registry.js').ToolRegistry} */
  #registry;

  /** @type {import('./tool-invoker.js').ToolInvoker} */
  #invoker;

  /** @type {string} */
  #defaultPrincipalId;

  /** @type {import('./tool-schema.js').ExposureTier} */
  #defaultExposure;

  /**
   * @param {import('./tool-registry.js').ToolRegistry} registry
   * @param {import('./tool-invoker.js').ToolInvoker} invoker
   * @param {{ defaultPrincipalId?: string, defaultExposure?: import('./tool-schema.js').ExposureTier }} [options]
   */
  constructor(registry, invoker, options = {}) {
    if (!registry) throw new Error('ChatGPTToolAdapter requires a ToolRegistry');
    if (!invoker) throw new Error('ChatGPTToolAdapter requires a ToolInvoker');

    this.#registry = registry;
    this.#invoker = invoker;
    this.#defaultPrincipalId = options.defaultPrincipalId || 'chatgpt-agent';
    this.#defaultExposure = options.defaultExposure || 'INTERNAL';
  }

  /**
   * Returns OpenAI-compatible tool definitions from the registry.
   * @param {import('./tool-schema.js').ExposureTier} [maxTier]
   * @returns {Object[]}
   */
  toOpenAITools(maxTier = this.#defaultExposure) {
    return this.#registry.toOpenAIFunctions(maxTier);
  }

  /**
   * Returns an AI-readable catalog of available tools.
   * @param {import('./tool-schema.js').ExposureTier} [maxTier]
   * @returns {Object}
   */
  toAgentCatalog(maxTier = this.#defaultExposure) {
    return this.#registry.toAgentCatalog(maxTier);
  }

  /**
   * Normalizes tool calls from OpenAI Chat Completions or Responses API.
   * @param {*} payload
   * @returns {Array<{ toolCallId: string, name: string, argumentsText: string }>}
   */
  normalizeToolCalls(payload) {
    if (!payload) return [];

    // Already an array of calls
    if (Array.isArray(payload)) {
      return payload
        .map((call, idx) => this.#normalizeOne(call, idx))
        .filter(Boolean);
    }

    // Responses API shape: { output: [{ type: 'function_call', ... }] }
    if (Array.isArray(payload.output)) {
      return payload.output
        .filter((o) => o && o.type === 'function_call')
        .map((call, idx) => this.#normalizeOne(call, idx))
        .filter(Boolean);
    }

    // Chat Completions shape: { choices[0].message.tool_calls: [...] }
    const toolCalls = payload?.choices?.[0]?.message?.tool_calls;
    if (Array.isArray(toolCalls)) {
      return toolCalls
        .map((call, idx) => this.#normalizeOne(call, idx))
        .filter(Boolean);
    }

    return [];
  }

  /**
   * Executes normalized or raw tool calls through ToolInvoker.
   * @param {*} toolCalls
   * @param {{ principalId?: string, traceId?: string, continueOnError?: boolean }} [options]
   * @returns {Promise<Array<{ toolCallId: string, name: string, callId: string|null, invocation: import('./tool-invoker.js').InvocationResult|null, error: string|null }>>}
   */
  async executeToolCalls(toolCalls, options = {}) {
    const principalId = options.principalId || this.#defaultPrincipalId;
    const traceId = options.traceId;
    const continueOnError = options.continueOnError !== false;
    const normalized = this.normalizeToolCalls(toolCalls);
    const results = [];

    for (const call of normalized) {
      let args = {};
      let schema = null;

      try {
        args = call.argumentsText ? JSON.parse(call.argumentsText) : {};
      } catch {
        results.push({
          toolCallId: call.toolCallId,
          name: call.name,
          callId: null,
          invocation: null,
          error: `Invalid JSON arguments for tool "${call.name}"`,
        });
        if (!continueOnError) break;
        continue;
      }

      schema = this.#registry.getByName(call.name);
      if (!schema) {
        schema = this.#registry.listAll().find((t) => t.name.toLowerCase() === String(call.name).toLowerCase()) || null;
      }

      if (!schema) {
        results.push({
          toolCallId: call.toolCallId,
          name: call.name,
          callId: null,
          invocation: null,
          error: `No registered tool named "${call.name}"`,
        });
        if (!continueOnError) break;
        continue;
      }

      const invocation = await this.#invoker.invoke(schema.callId, args, { principalId, traceId });
      results.push({
        toolCallId: call.toolCallId,
        name: call.name,
        callId: schema.callId,
        invocation,
        error: null,
      });

      if (!continueOnError && invocation.status !== 'completed') break;
    }

    return results;
  }

  /**
   * Formats execution results as Chat Completions tool messages.
   * @param {Array<{ toolCallId: string, name: string, invocation: any, error: string|null }>} executions
   * @returns {Array<{ role: 'tool', tool_call_id: string, name: string, content: string }>}
   */
  toChatCompletionToolMessages(executions) {
    return executions.map((e) => ({
      role: 'tool',
      tool_call_id: e.toolCallId,
      name: e.name,
      content: JSON.stringify(e.error ? { status: 'error', error: e.error } : (e.invocation?.data ?? {})),
    }));
  }

  /**
   * Formats execution results as Responses API function_call_output entries.
   * @param {Array<{ toolCallId: string, invocation: any, error: string|null }>} executions
   * @returns {Array<{ type: 'function_call_output', call_id: string, output: string }>}
   */
  toResponsesToolOutputs(executions) {
    return executions.map((e) => ({
      type: 'function_call_output',
      call_id: e.toolCallId,
      output: JSON.stringify(e.error ? { status: 'error', error: e.error } : (e.invocation?.data ?? {})),
    }));
  }

  /**
   * @param {*} call
   * @param {number} idx
   * @returns {{ toolCallId: string, name: string, argumentsText: string }|null}
   */
  #normalizeOne(call, idx) {
    if (!call) return null;

    // Chat Completions tool_call format
    if (call.type === 'function' && call.function?.name) {
      return {
        toolCallId: call.id || `tool-call-${idx + 1}`,
        name: call.function.name,
        argumentsText: call.function.arguments || '{}',
      };
    }

    // Responses API function_call format
    if (call.type === 'function_call' && call.name) {
      return {
        toolCallId: call.call_id || call.id || `tool-call-${idx + 1}`,
        name: call.name,
        argumentsText: call.arguments || '{}',
      };
    }

    return null;
  }
}

export default ChatGPTToolAdapter;
