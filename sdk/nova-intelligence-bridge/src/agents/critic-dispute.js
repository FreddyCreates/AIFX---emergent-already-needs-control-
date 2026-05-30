/**
 * Critic / Dispute Agent
 * 
 * Checks:
 *   - What can go wrong?
 *   - Is the benchmark false?
 *   - Is the type lossy?
 *   - Is the computation non-deterministic?
 *   - Should this be marked unverified?
 */

const PHI = 1.618033988749895;

const KNOWN_RISKS = {
  'EigenResult': ['Eigenvector signs may vary', 'Order of eigenvalues not guaranteed'],
  'Tensor': ['Large memory footprint', 'May exceed canister stable storage'],
  'Sparse': ['Sparse format may differ between Julia and JS', 'Index offsets (0 vs 1)'],
  'Complex': ['Imaginary precision loss in Float32 transport'],
  'Matrix': ['Column-major (Julia) vs row-major (JS) layout difference'],
};

export class CriticDisputeAgent {
  constructor() {
    this.id = 'critic_dispute';
    this.name = 'Critic / Dispute Agent';
    this.inspections = [];
  }

  critique(contract) {
    const warnings = [];
    let risk_level = 'low';

    // Check output shape risks
    const outputShape = contract.output_shape?.shape_type;
    if (KNOWN_RISKS[outputShape]) {
      warnings.push(...KNOWN_RISKS[outputShape]);
    }

    // Check input shape risks
    const inputShape = contract.input_shape?.shape_type;
    if (KNOWN_RISKS[inputShape]) {
      warnings.push(...KNOWN_RISKS[inputShape]);
    }

    // Non-determinism check
    if (outputShape === 'EigenResult' || contract.function_signature?.includes('random')) {
      warnings.push('Result may be non-deterministic; tolerance comparison required');
      risk_level = 'medium';
    }

    // Large data check
    const dims = contract.input_shape?.dimensions || [];
    if (dims.some(d => d > 1000)) {
      warnings.push('Large dimensions may cause memory pressure');
      risk_level = 'high';
    }

    // Roundtrip risk
    if (contract.proof_requirements?.roundtrip_test) {
      warnings.push('Roundtrip test required — floating point precision may differ');
    }

    if (warnings.length > 5) risk_level = 'critical';

    const result = {
      agent: this.id,
      contract_id: contract.contract_id,
      risk_level,
      warnings,
      should_mark_unverified: risk_level === 'high' || risk_level === 'critical',
      recommendation: risk_level === 'critical' ? 'reject' :
                      risk_level === 'high' ? 'request_human_review' :
                      risk_level === 'medium' ? 'accept_with_tolerance' : 'accept',
      confidence: 1 - (warnings.length * 0.1),
    };

    this.inspections.push(result);
    return result;
  }
}
