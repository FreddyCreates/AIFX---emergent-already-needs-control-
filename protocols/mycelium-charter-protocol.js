/**
 * PROTO-257: Mycelium Charter Protocol (MCP)
 * Governance covenant for sovereign mycelium substrate operations.
 */

const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;

export const PROTOCOL_FAMILY = [
  { id: 'PROTO-257', name: 'MyceliumCharterProtocol' },
  { id: 'PROTO-258', name: 'MyceliumNodeIdentityProtocol' },
  { id: 'PROTO-259', name: 'MyceliumMeshFormationProtocol' },
  { id: 'PROTO-260', name: 'MyceliumRoutingIntelligenceProtocol' },
  { id: 'PROTO-261', name: 'MyceliumTrustReputationProtocol' },
  { id: 'PROTO-262', name: 'MyceliumHealingRecoveryProtocol' },
  { id: 'PROTO-263', name: 'MyceliumEconomicSignalingProtocol' },
  { id: 'PROTO-264', name: 'MyceliumCrossSubstrateExchangeProtocol' },
  { id: 'PROTO-265', name: 'MyceliumCollectiveIntelligenceProtocol' },
  { id: 'PROTO-266', name: 'MyceliumMemoryPropagationProtocol' },
  { id: 'PROTO-267', name: 'MyceliumEvolutionaryAdaptationProtocol' },
];

export const MYCELIUM_DOCTRINE = {
  sovereigntyRules: [
    'Node identity is sovereign and cryptographically attestable.',
    'No route may bypass trust floor requirements.',
    'Audit events are append-only and retention-bound.',
  ],
  admissionPolicy: {
    minimumAttestation: PHI_INV,
    minimumStakeSignal: 0,
    heartbeatBoundMs: 873,
  },
  interNodeRights: ['observe', 'relay', 'vote', 'heal', 'audit'],
  failureLaw: {
    detectWithinMs: 873,
    criticalEscalationFactor: PHI,
    mandatoryReconcile: true,
  },
  auditLaw: {
    appendOnly: true,
    maxRetentionEvents: 5000,
    requiredFields: ['timestamp', 'eventType', 'subject', 'proofRef'],
  },
  upgradeLaw: {
    minimumCompatibilityScore: PHI_INV,
    requiresEvidenceCount: 2,
    requiresRollbackPlan: true,
  },
};

export const CHARTER_STATES = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  LOCKED: 'locked',
};

export class MyceliumCharterProtocol {
  constructor(config = {}) {
    this.id = config.id || `mycelium-charter-${Date.now().toString(36)}`;
    this.state = CHARTER_STATES.DRAFT;
    this.doctrine = { ...MYCELIUM_DOCTRINE, ...(config.doctrine || {}) };
    this.log = [];
  }

  activate() {
    this.state = CHARTER_STATES.ACTIVE;
    this._append('charter.activated', { family: PROTOCOL_FAMILY.map(p => p.id) });
    return { ok: true, state: this.state };
  }

  evaluateAdmission(candidate = {}) {
    const attestation = candidate.attestationScore ?? 0;
    const accepted = attestation >= this.doctrine.admissionPolicy.minimumAttestation;
    this._append('charter.admission.evaluated', { nodeId: candidate.nodeId, accepted, attestation });
    return {
      accepted,
      requiredRights: accepted ? this.doctrine.interNodeRights : ['observe'],
      reason: accepted ? 'admission_threshold_met' : 'insufficient_attestation',
    };
  }

  evaluateInterNodeRights(trustScore) {
    if (trustScore >= PHI_INV) return this.doctrine.interNodeRights;
    if (trustScore >= 0.34) return ['observe', 'relay'];
    return ['observe'];
  }

  applyFailureLaw(incident = {}) {
    const critical = (incident.priority ?? 0) >= this.doctrine.failureLaw.criticalEscalationFactor;
    this._append('charter.failure.applied', { incidentId: incident.id, critical });
    return {
      critical,
      mustReconcile: this.doctrine.failureLaw.mandatoryReconcile,
      escalation: critical ? 'critical' : 'standard',
    };
  }

  runAudit(snapshot = {}) {
    const findings = [];
    if (!snapshot.eventType) findings.push('missing_event_type');
    if (!snapshot.subject) findings.push('missing_subject');
    if (!snapshot.proofRef) findings.push('missing_proof_ref');
    const pass = findings.length === 0;
    this._append('charter.audit.run', { pass, findings, snapshot });
    return { pass, findings };
  }

  evaluateUpgrade(proposal = {}) {
    const compatibility = proposal.compatibilityScore ?? 0;
    const evidenceCount = proposal.evidenceCount ?? 0;
    const rollback = !!proposal.rollbackPlan;
    const accepted = compatibility >= this.doctrine.upgradeLaw.minimumCompatibilityScore
      && evidenceCount >= this.doctrine.upgradeLaw.requiresEvidenceCount
      && (!this.doctrine.upgradeLaw.requiresRollbackPlan || rollback);

    this._append('charter.upgrade.evaluated', { accepted, compatibility, evidenceCount, rollback });
    return {
      accepted,
      reason: accepted ? 'upgrade_law_satisfied' : 'upgrade_law_failed',
    };
  }

  getCharter() {
    return {
      id: this.id,
      state: this.state,
      doctrine: this.doctrine,
      family: PROTOCOL_FAMILY,
      logCount: this.log.length,
    };
  }

  getLog() {
    return [...this.log];
  }

  _append(eventType, payload) {
    this.log.push({ timestamp: Date.now(), eventType, subject: this.id, proofRef: payload?.proofRef || null, payload });
    if (this.log.length > this.doctrine.auditLaw.maxRetentionEvents) this.log.shift();
  }
}

export default MyceliumCharterProtocol;
