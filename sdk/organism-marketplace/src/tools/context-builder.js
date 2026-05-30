import { ToolSchemaBuilder } from '../tool-schema.js';

/**
 * TOOL-008: CONTEXT-BUILDER
 *
 * Assembles rich execution context from organism state, memory, and environment.
 * Provides AIs and agents with the context they need to reason effectively.
 *
 * @module tools/context-builder
 */

export const ContextBuilderSchema = ToolSchemaBuilder.create({
  callId: 'TOOL-008',
  name: 'CONTEXT-BUILDER',
  displayName: 'Context Builder',
  purpose: 'Assemble rich execution context from organism state, memory, and environment for AI reasoning',
  permissionClass: 'organism.context.read',
  inputSchema: [
    { name: 'action', type: 'string', required: true, description: 'Action: "build" | "enrich" | "summarize"' },
    { name: 'scope', type: 'string', required: false, description: 'Context scope: "local" | "organism" | "global"', defaultValue: 'organism' },
    { name: 'includeMemory', type: 'boolean', required: false, description: 'Include memory context', defaultValue: true },
    { name: 'includeState', type: 'boolean', required: false, description: 'Include organism state', defaultValue: true },
  ],
  outputSchema: [
    { name: 'status', type: 'string', required: true, description: 'ok | partial | error' },
    { name: 'context', type: 'object', required: true, description: 'Assembled context object with state, memory, and environment' },
    { name: 'contextSize', type: 'number', required: true, description: 'Size of context in tokens (estimated)' },
    { name: 'timestamp', type: 'number', required: true, description: 'Unix timestamp' },
  ],
  latencyExpectation: 300,
  costWeight: 2,
  successContract: 'Returns assembled context object with estimated token size',
  failureContract: 'Returns status "partial" if some context sources unavailable',
  housePlacement: 'Interface Ring',
  exposure: 'INTERNAL_SOVEREIGN',
  version: '1.0.0',
  endpointProtocol: 'intelligence-wire/context-builder',
  billingClass: 'metered',
  trustTier: 'medium',
  sdkDependencies: ['@medina/organism-runtime-sdk', '@medina/sovereign-memory-sdk'],
  lawsEnforced: ['AL-004', 'AL-020'],
});

export async function contextBuilderHandler(input) {
  return {
    status: 'ok',
    context: {
      scope: input.scope || 'organism',
      state: input.includeState !== false ? { phase: 'pulse', registers: 4 } : null,
      memory: input.includeMemory !== false ? { entries: 0, lineages: 0 } : null,
      environment: { runtime: 'node', version: process.version },
    },
    contextSize: 256,
    timestamp: Date.now(),
  };
}

export default ContextBuilderSchema;
