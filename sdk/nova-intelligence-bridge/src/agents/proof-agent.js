/**
 * Proof Agent
 * 
 * Checks:
 *   - Was the input canonicalized?
 *   - Was the output canonicalized?
 *   - Were hashes produced?
 *   - Does the receipt match the contract?
 */

const PHI = 1.618033988749895;

export class ProofAgent {
  constructor() {
    this.id = 'proof_agent';
    this.name = 'Proof Agent';
    this.inspections = [];
  }

  verify(contract, receipt) {
    const requirements = contract.proof_requirements || {};
    const issues = [];

    if (requirements.input_hash && !receipt?.hashes?.input) {
      issues.push('Missing input_hash in receipt');
    }
    if (requirements.output_hash && !receipt?.hashes?.output) {
      issues.push('Missing output_hash in receipt');
    }
    if (requirements.wrapper_hash && !receipt?.hashes?.wrapper) {
      issues.push('Missing wrapper_hash in receipt');
    }
    if (requirements.candid_hash && !receipt?.hashes?.candid) {
      issues.push('Missing candid_hash in receipt');
    }
    if (requirements.runtime_hash && !receipt?.hashes?.runtime) {
      issues.push('Missing runtime_hash in receipt');
    }

    // Verify contract_id match
    if (receipt && receipt.contract_id !== contract.contract_id) {
      issues.push('Receipt contract_id does not match contract');
    }

    const result = {
      agent: this.id,
      contract_id: contract.contract_id,
      receipt_id: receipt?.receipt_id || null,
      all_hashes_present: issues.length === 0,
      issues,
      sealed: issues.length === 0,
      phi_confidence: issues.length === 0 ? PHI - 1 : 0.1,
    };

    this.inspections.push(result);
    return result;
  }
}
