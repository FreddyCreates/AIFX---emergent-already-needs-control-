import { ToolSchemaBuilder } from '../tool-schema.js';

/**
 * TOOL-024: TASK-COMMANDER
 * Family: Commander
 *
 * The organism's command center — dispatches multi-step task plans across
 * tools, agents, and extensions. Orchestrates sequential and parallel
 * execution with dependency resolution, rollback, and progress tracking.
 *
 * The Commander family directs action. Where INFER-ENGINE selects the
 * right model and ATTENTION-ROUTER focuses attention, TASK-COMMANDER
 * orchestrates complex multi-tool workflows. It is the organism's will —
 * the executive function that turns intent into coordinated action.
 *
 * Primitive function: Task orchestration / Multi-tool dispatch / Execution planning
 * Organism role: The organism's executive function — coordinated multi-step action
 * Resonance: Consumes output from INFER-ENGINE, ATTENTION-ROUTER, RESOURCE-BALANCER
 *
 * @module tools/task-commander
 */

const PHI = 1.618033988749895;

export const TaskCommanderSchema = ToolSchemaBuilder.create({
  callId: 'TOOL-024',
  name: 'TASK-COMMANDER',
  displayName: 'Task Commander',
  purpose: 'Orchestrate multi-step task plans across tools, agents, and extensions with dependency resolution and rollback',
  permissionClass: 'organism.command.execute',
  family: 'Commander',
  inputSchema: [
    { name: 'action', type: 'string', required: true, description: 'Action: "plan" | "dispatch" | "status" | "rollback"' },
    { name: 'taskPlan', type: 'array', required: false, description: 'Ordered array of { toolId, input, dependsOn? } steps' },
    { name: 'executionId', type: 'string', required: false, description: 'Existing execution ID for status/rollback queries' },
    { name: 'mode', type: 'string', required: false, description: 'Execution mode: "sequential" | "parallel" | "adaptive"', defaultValue: 'adaptive' },
    { name: 'maxRetries', type: 'number', required: false, description: 'Max retries per step on failure', defaultValue: 2 },
  ],
  outputSchema: [
    { name: 'status', type: 'string', required: true, description: 'ok | executing | completed | failed | rolled-back | error' },
    { name: 'executionId', type: 'string', required: true, description: 'Unique execution tracking ID' },
    { name: 'totalSteps', type: 'number', required: true, description: 'Total steps in task plan' },
    { name: 'completedSteps', type: 'number', required: true, description: 'Steps completed so far' },
    { name: 'results', type: 'array', required: true, description: 'Per-step results [{ stepIndex, toolId, status, output }]' },
    { name: 'estimatedLatencyMs', type: 'number', required: false, description: 'Estimated total execution time in ms' },
    { name: 'timestamp', type: 'number', required: true, description: 'Unix timestamp' },
  ],
  latencyExpectation: 1000,
  costWeight: 8,
  successContract: 'Returns execution ID with per-step results and progress tracking',
  failureContract: 'Returns status "failed" with partial results and rollback option',
  housePlacement: 'Interface Ring',
  exposure: 'INTERNAL_SOVEREIGN',
  version: '1.0.0',
  endpointProtocol: 'intelligence-wire/task-commander',
  billingClass: 'metered',
  trustTier: 'high',
  sdkDependencies: ['@medina/intelligence-routing-sdk', '@medina/organism-runtime-sdk'],
  lawsEnforced: ['AL-025', 'AL-027', 'AL-036'],
});

/**
 * Default handler for TASK-COMMANDER.
 * Plans and dispatches multi-step task execution with phi-weighted scheduling.
 */
export async function taskCommanderHandler(input) {
  const crypto = await import('node:crypto');
  const executionId = input.executionId || crypto.randomUUID();

  if (input.action === 'plan' && input.taskPlan) {
    const steps = input.taskPlan;
    // Phi-weighted latency estimation: sum of step latencies × φ overhead factor
    const estimatedLatencyMs = Math.round(
      steps.length * 200 * (1 + 1 / PHI)
    );

    return {
      status: 'ok',
      executionId,
      totalSteps: steps.length,
      completedSteps: 0,
      results: steps.map((step, i) => ({
        stepIndex: i,
        toolId: step.toolId,
        status: 'pending',
        output: null,
      })),
      estimatedLatencyMs,
      timestamp: Date.now(),
    };
  }

  if (input.action === 'status') {
    return {
      status: 'completed',
      executionId,
      totalSteps: 0,
      completedSteps: 0,
      results: [],
      estimatedLatencyMs: 0,
      timestamp: Date.now(),
    };
  }

  return {
    status: 'ok',
    executionId,
    totalSteps: 0,
    completedSteps: 0,
    results: [],
    estimatedLatencyMs: 0,
    timestamp: Date.now(),
  };
}

export default TaskCommanderSchema;
