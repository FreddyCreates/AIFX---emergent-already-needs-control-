import { ToolSchemaBuilder } from '../tool-schema.js';

/**
 * TOOL-009: ATTENTION-ROUTER
 *
 * Routes attention and focus across organism subsystems.
 * Determines which tools, agents, or extensions should receive priority
 * processing based on current organism state and task urgency.
 *
 * @module tools/attention-router
 */

export const AttentionRouterSchema = ToolSchemaBuilder.create({
  callId: 'TOOL-009',
  name: 'ATTENTION-ROUTER',
  displayName: 'Attention Router',
  purpose: 'Route attention and focus across organism subsystems — prioritize tools, agents, and extensions by urgency',
  permissionClass: 'organism.routing.write',
  inputSchema: [
    { name: 'action', type: 'string', required: true, description: 'Action: "focus" | "distribute" | "query"' },
    { name: 'target', type: 'string', required: false, description: 'Specific target to focus on (tool ID, extension ID, or agent ID)' },
    { name: 'urgency', type: 'string', required: false, description: 'Urgency: "low" | "normal" | "high" | "critical"', defaultValue: 'normal' },
  ],
  outputSchema: [
    { name: 'status', type: 'string', required: true, description: 'ok | overloaded | error' },
    { name: 'focusTarget', type: 'string', required: false, description: 'Current primary focus target' },
    { name: 'attentionMap', type: 'object', required: true, description: 'Attention weights by subsystem' },
    { name: 'timestamp', type: 'number', required: true, description: 'Unix timestamp' },
  ],
  latencyExpectation: 100,
  costWeight: 2,
  successContract: 'Returns attention distribution map with focus target',
  failureContract: 'Returns status "overloaded" if attention cannot be allocated',
  housePlacement: 'Interface Ring',
  exposure: 'INTERNAL',
  version: '1.0.0',
  endpointProtocol: 'intelligence-wire/attention-router',
  billingClass: 'free',
  trustTier: 'medium',
  sdkDependencies: ['@medina/intelligence-routing-sdk'],
  lawsEnforced: ['AL-025', 'AL-027'],
});

export async function attentionRouterHandler(input) {
  return {
    status: 'ok',
    focusTarget: input.target || 'organism-core',
    attentionMap: {
      'Sovereign Ring': 0.3,
      'Interface Ring': 0.25,
      'Memory Ring': 0.2,
      'Transport Ring': 0.1,
      'Geometry Ring': 0.08,
      'Build Ring': 0.04,
      'Counsel Ring': 0.03,
    },
    timestamp: Date.now(),
  };
}

export default AttentionRouterSchema;
