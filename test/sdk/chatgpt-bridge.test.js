const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { pathToFileURL } = require('url');

describe('ChatGPT marketplace bridge', () => {
  let ToolSchemaBuilder;
  let ToolRegistry;
  let ToolInvoker;
  let ChatGPTToolAdapter;
  let RepoIntelligenceBridge;

  before(async () => {
    const modulePath = pathToFileURL(
      path.resolve(__dirname, '../../sdk/organism-marketplace/src/index.js'),
    ).href;
    ({
      ToolSchemaBuilder,
      ToolRegistry,
      ToolInvoker,
      ChatGPTToolAdapter,
      RepoIntelligenceBridge,
    } = await import(modulePath));
  });

  it('adapts Chat Completions tool calls to marketplace invocations', async () => {
    const registry = new ToolRegistry();
    const invoker = new ToolInvoker(registry);

    const schema = ToolSchemaBuilder.create({
      callId: 'TOOL-900',
      name: 'repo_status',
      purpose: 'Returns repository status for a path',
      permissionClass: 'organism.read',
      inputSchema: [
        { name: 'path', type: 'string', required: true, description: 'Path in repository' },
      ],
      outputSchema: [
        { name: 'status', type: 'string', required: true, description: 'Status result' },
      ],
      exposure: 'INTERNAL',
      family: 'Context',
    });

    registry.register(schema);
    invoker.registerHandler('TOOL-900', async (input) => ({ status: `ok:${input.path}` }));
    invoker.grantPermission('chatgpt-agent', 'TOOL-900');

    const adapter = new ChatGPTToolAdapter(registry, invoker, { defaultPrincipalId: 'chatgpt-agent' });
    const executions = await adapter.executeToolCalls([
      {
        id: 'call_1',
        type: 'function',
        function: {
          name: 'repo_status',
          arguments: JSON.stringify({ path: 'sdk' }),
        },
      },
    ]);

    assert.equal(executions.length, 1);
    assert.equal(executions[0].callId, 'TOOL-900');
    assert.equal(executions[0].invocation.status, 'completed');
    assert.deepEqual(executions[0].invocation.data, { status: 'ok:sdk' });
  });

  it('normalizes Responses API function_call entries', async () => {
    const registry = new ToolRegistry();
    const invoker = new ToolInvoker(registry);

    const schema = ToolSchemaBuilder.create({
      callId: 'TOOL-901',
      name: 'engine_ping',
      purpose: 'Ping engine',
      inputSchema: [],
      outputSchema: [{ name: 'pong', type: 'boolean', required: true, description: 'Pong response' }],
      family: 'Commander',
    });

    registry.register(schema);
    invoker.registerHandler('TOOL-901', async () => ({ pong: true }));
    invoker.grantPermission('chatgpt-agent', 'TOOL-901');

    const adapter = new ChatGPTToolAdapter(registry, invoker, { defaultPrincipalId: 'chatgpt-agent' });
    const executions = await adapter.executeToolCalls({
      output: [
        {
          type: 'function_call',
          id: 'fc_1',
          call_id: 'call_fc_1',
          name: 'engine_ping',
          arguments: '{}',
        },
      ],
    });

    assert.equal(executions.length, 1);
    assert.equal(executions[0].toolCallId, 'call_fc_1');
    assert.equal(executions[0].invocation.status, 'completed');
    assert.deepEqual(executions[0].invocation.data, { pong: true });
  });

  it('registers repo callable intelligence via RepoIntelligenceBridge', async () => {
    const registry = new ToolRegistry();
    const invoker = new ToolInvoker(registry);
    const bridge = new RepoIntelligenceBridge(registry, invoker, { namespace: 'REPO' });

    const querySchema = bridge.registerQuery({
      name: 'repo_query_metrics',
      purpose: 'Reads metrics from repo memory',
      inputSchema: [{ name: 'domain', type: 'string', required: true, description: 'Metrics domain' }],
      outputSchema: [{ name: 'count', type: 'number', required: true, description: 'Metric count' }],
      exposure: 'INTERNAL',
    }, async (input) => ({ count: input.domain.length }));

    bridge.grantPrincipal('agent-bridge', 'INTERNAL');

    const adapter = new ChatGPTToolAdapter(registry, invoker, { defaultPrincipalId: 'agent-bridge' });
    const executions = await adapter.executeToolCalls([
      {
        id: 'call_q',
        type: 'function',
        function: {
          name: querySchema.name,
          arguments: JSON.stringify({ domain: 'governance' }),
        },
      },
    ]);

    assert.equal(executions[0].invocation.status, 'completed');
    assert.deepEqual(executions[0].invocation.data, { count: 10 });
  });

  it('returns structured error for invalid tool-call JSON arguments', async () => {
    const registry = new ToolRegistry();
    const invoker = new ToolInvoker(registry);
    const adapter = new ChatGPTToolAdapter(registry, invoker, { defaultPrincipalId: 'chatgpt-agent' });

    const executions = await adapter.executeToolCalls([
      {
        id: 'call_bad',
        type: 'function',
        function: {
          name: 'repo_status',
          arguments: '{not-json',
        },
      },
    ]);

    assert.equal(executions.length, 1);
    assert.equal(executions[0].invocation, null);
    assert.match(executions[0].error, /Invalid JSON arguments/);
  });
});
