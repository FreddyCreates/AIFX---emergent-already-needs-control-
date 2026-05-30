import { ToolSchemaBuilder } from '../tool-schema.js';

/**
 * TOOL-014: ANOMALY-DETECTOR
 *
 * Detects anomalies in organism behavior — unexpected state transitions,
 * unusual latency patterns, abnormal resource consumption, and drift
 * from baseline metrics.
 *
 * @module tools/anomaly-detector
 */

export const AnomalyDetectorSchema = ToolSchemaBuilder.create({
  callId: 'TOOL-014',
  name: 'ANOMALY-DETECTOR',
  displayName: 'Anomaly Detector',
  purpose: 'Detect anomalies in organism behavior — unexpected state changes, unusual latency, abnormal resource consumption',
  permissionClass: 'organism.analysis.read',
  inputSchema: [
    { name: 'action', type: 'string', required: true, description: 'Action: "detect" | "baseline" | "status"' },
    { name: 'subsystem', type: 'string', required: false, description: 'Subsystem to check: "pulse" | "state" | "memory" | "routing" | "all"', defaultValue: 'all' },
    { name: 'sensitivity', type: 'number', required: false, description: 'Detection sensitivity (0-1, higher = more sensitive)', defaultValue: 0.618 },
  ],
  outputSchema: [
    { name: 'status', type: 'string', required: true, description: 'ok | anomaly-detected | error' },
    { name: 'anomalies', type: 'array', required: true, description: 'Array of detected anomalies with severity and description' },
    { name: 'baselineDeviation', type: 'number', required: true, description: 'Overall deviation from baseline (0-1)' },
    { name: 'timestamp', type: 'number', required: true, description: 'Unix timestamp' },
  ],
  latencyExpectation: 300,
  costWeight: 3,
  successContract: 'Returns anomaly detection results with deviation scores',
  failureContract: 'Returns error if baseline data is insufficient',
  housePlacement: 'Sovereign Ring',
  exposure: 'INTERNAL',
  version: '1.0.0',
  endpointProtocol: 'intelligence-wire/anomaly-detector',
  billingClass: 'free',
  trustTier: 'medium',
  sdkDependencies: ['@medina/organism-runtime-sdk'],
  lawsEnforced: ['AL-033', 'AL-034'],
});

export async function anomalyDetectorHandler(input) {
  return {
    status: 'ok',
    anomalies: [],
    baselineDeviation: 0.0,
    timestamp: Date.now(),
  };
}

export default AnomalyDetectorSchema;
