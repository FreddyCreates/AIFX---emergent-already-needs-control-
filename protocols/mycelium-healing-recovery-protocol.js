/**
 * PROTO-262: Mycelium Healing Recovery Protocol (MHRP)
 * Failure law execution, heal priority queue, and reconciliation loops.
 */

const PHI = 1.618033988749895;

export const HEALING_STATES = {
  HEALTHY: 'healthy',
  HEALING: 'healing',
  DEGRADED: 'degraded',
  CRITICAL: 'critical',
};

export const MESSAGE_TYPES = {
  HEAL_DETECT: 'mycelium.heal.detect',
  HEAL_PROPOSE: 'mycelium.heal.propose',
  HEAL_COMPLETE: 'mycelium.heal.complete',
  HEAL_FAIL: 'mycelium.heal.fail',
};

export function calculateHealPriority(downtimeMs, alternateHops, trafficDemand, trust = 1) {
  const timePressure = Math.log(downtimeMs + 1) / Math.log(PHI);
  const pathStress = Math.pow(PHI, Math.max(0, alternateHops - 1));
  const demand = Math.max(0, trafficDemand);
  const trustPenalty = 1 + Math.max(0, 1 - trust);
  return timePressure * pathStress * demand * trustPenalty;
}

export class MyceliumHealingRecoveryProtocol {
  constructor() {
    this.state = HEALING_STATES.HEALTHY;
    this.incidents = [];
    this.completed = [];
  }

  reportFailure(details) {
    const incident = {
      id: details.id || `heal-${Date.now().toString(36)}`,
      edge: details.edge,
      reason: details.reason || 'unknown',
      detectedAt: Date.now(),
      downtimeMs: details.downtimeMs || 0,
      alternateHops: details.alternateHops ?? 1,
      trafficDemand: details.trafficDemand ?? 0.5,
      trust: details.trust ?? 1,
      status: 'open',
      priority: calculateHealPriority(details.downtimeMs || 0, details.alternateHops ?? 1, details.trafficDemand ?? 0.5, details.trust ?? 1),
    };
    this.incidents.push(incident);
    this.incidents.sort((a, b) => b.priority - a.priority);
    this.state = HEALING_STATES.HEALING;
    return incident;
  }

  proposeRepair(incidentId, strategy = 'bridge-rewire') {
    const incident = this.incidents.find(i => i.id === incidentId && i.status === 'open');
    if (!incident) return null;
    incident.status = 'proposed';
    incident.strategy = strategy;
    incident.proposedAt = Date.now();
    return incident;
  }

  completeRepair(incidentId, evidence = {}) {
    const idx = this.incidents.findIndex(i => i.id === incidentId);
    if (idx === -1) return null;
    const [incident] = this.incidents.splice(idx, 1);
    incident.status = 'closed';
    incident.closedAt = Date.now();
    incident.evidence = evidence;
    this.completed.push(incident);
    this.state = this.incidents.length ? HEALING_STATES.HEALING : HEALING_STATES.HEALTHY;
    return incident;
  }

  failRepair(incidentId, error = 'repair_failed') {
    const incident = this.incidents.find(i => i.id === incidentId);
    if (!incident) return null;
    incident.status = 'failed';
    incident.error = error;
    incident.priority *= PHI;
    this.state = incident.priority > 5 ? HEALING_STATES.CRITICAL : HEALING_STATES.DEGRADED;
    return incident;
  }

  heartbeatTick(ms = 873) {
    for (const incident of this.incidents) {
      incident.downtimeMs += ms;
      incident.priority = calculateHealPriority(incident.downtimeMs, incident.alternateHops, incident.trafficDemand, incident.trust);
    }
    this.incidents.sort((a, b) => b.priority - a.priority);
  }

  getOpenIncidents() {
    return this.incidents.filter(i => i.status !== 'closed');
  }

  getMetrics() {
    return {
      state: this.state,
      openIncidents: this.incidents.length,
      closedIncidents: this.completed.length,
      criticalIncidents: this.incidents.filter(i => i.priority > 5).length,
    };
  }
}

export default MyceliumHealingRecoveryProtocol;
