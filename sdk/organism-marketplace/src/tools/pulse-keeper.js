import { ToolSchemaBuilder } from '../tool-schema.js';

/**
 * TOOL-001: PULSE-KEEPER
 *
 * The organism's heartbeat monitor. Maintains the 873ms natural pulse,
 * reports liveness, beat count, uptime, and drift from ideal cadence.
 * The fundamental clock of the organism — as above, so below.
 *
 * @module tools/pulse-keeper
 */

const HEARTBEAT = 873;

export const PulseKeeperSchema = ToolSchemaBuilder.create({
  callId: 'TOOL-001',
  name: 'PULSE-KEEPER',
  displayName: 'Pulse Keeper',
  purpose: 'Monitor and report organism heartbeat pulse at the 873ms cadence — liveness, beat count, uptime, and drift',
  permissionClass: 'organism.pulse.read',
  inputSchema: [
    { name: 'action', type: 'string', required: true, description: 'Action to perform: "status" | "beat" | "drift"' },
  ],
  outputSchema: [
    { name: 'status', type: 'string', required: true, description: 'ok | degraded | dead' },
    { name: 'beatNumber', type: 'number', required: true, description: 'Current beat count since boot' },
    { name: 'uptimeMs', type: 'number', required: true, description: 'Milliseconds since organism started' },
    { name: 'driftMs', type: 'number', required: false, description: 'Drift from ideal 873ms cadence' },
    { name: 'timestamp', type: 'number', required: true, description: 'Unix timestamp of this reading' },
  ],
  latencyExpectation: HEARTBEAT,
  costWeight: 0,
  successContract: 'Returns current heartbeat status with beat number and uptime',
  failureContract: 'Returns status "dead" if heartbeat is not running',
  housePlacement: 'Sovereign Ring',
  exposure: 'INTERNAL',
  version: '1.0.0',
  endpointProtocol: 'intelligence-wire/pulse-keeper',
  billingClass: 'free',
  trustTier: 'low',
  sdkDependencies: ['@medina/organism-runtime-sdk'],
  lawsEnforced: ['AL-019'],
});

/**
 * Default handler for PULSE-KEEPER.
 * @param {Record<string, *>} input
 * @returns {Promise<Object>}
 */
export async function pulseKeeperHandler(input) {
  const now = Date.now();
  const beatNumber = Math.floor(now / HEARTBEAT);
  const expectedBeatTime = beatNumber * HEARTBEAT;
  const driftMs = now - expectedBeatTime;

  return {
    status: 'ok',
    beatNumber,
    uptimeMs: now,
    driftMs: Math.round(driftMs * 100) / 100,
    timestamp: now,
  };
}

export default PulseKeeperSchema;
