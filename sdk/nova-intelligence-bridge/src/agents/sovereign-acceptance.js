/**
 * Sovereign Acceptance Agent
 * 
 * Final gate:
 *   - Accept
 *   - Reject
 *   - Request replay
 *   - Request human review
 *   - Store as unverified
 *   - Store as verified
 */

const PHI = 1.618033988749895;

export class SovereignAcceptanceAgent {
  constructor() {
    this.id = 'sovereign_acceptance';
    this.name = 'Sovereign Acceptance Agent';
    this.decisions = [];
  }

  decide(contract, agentReports = {}) {
    const julia = agentReports.julia;
    const motoko = agentReports.motoko;
    const candid = agentReports.candid;
    const js = agentReports.js;
    const critic = agentReports.critic;
    const proof = agentReports.proof;

    let decision = 'accept';
    let reason = 'All checks passed';
    let storage_mode = 'verified';

    // Check critic recommendation
    if (critic?.recommendation === 'reject') {
      decision = 'reject';
      reason = `Critic rejected: ${critic.warnings?.[0] || 'too risky'}`;
    } else if (critic?.recommendation === 'request_human_review') {
      decision = 'request_human_review';
      reason = 'High risk — requires human review';
      storage_mode = 'unverified';
    }

    // Check representability
    if (motoko && !motoko.representable) {
      decision = 'reject';
      reason = 'Output type not representable in Motoko';
    }

    // Check Candid shareability
    if (candid && !candid.shareable) {
      decision = 'reject';
      reason = 'Candid interface cannot be generated';
    }

    // Check JS transport
    if (js && !js.input_transportable && !js.output_transportable) {
      decision = 'reject';
      reason = 'JavaScript cannot transport input or output';
    }

    // Proof verification
    if (proof && !proof.all_hashes_present) {
      storage_mode = 'unverified';
      if (decision === 'accept') {
        decision = 'accept_unverified';
        reason = 'Accepted but hashes incomplete';
      }
    }

    const result = {
      agent: this.id,
      contract_id: contract.contract_id,
      decision,
      reason,
      storage_mode,
      phi_seal: decision === 'accept' ? PHI : null,
      timestamp: new Date().toISOString(),
    };

    this.decisions.push(result);
    return result;
  }
}
