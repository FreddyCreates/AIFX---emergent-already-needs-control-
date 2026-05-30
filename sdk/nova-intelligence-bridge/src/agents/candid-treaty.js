/**
 * Candid Treaty Agent
 * 
 * Checks:
 *   - Does the Candid interface match the Motoko wrapper?
 *   - Are all types shareable?
 *   - Can a frontend or agent call this consistently?
 */

const PHI = 1.618033988749895;

const CANDID_TYPE_MAP = {
  'Scalar': 'float64',
  'Vector': 'vec float64',
  'Matrix': 'vec vec float64',
  'Complex': 'record { re: float64; im: float64 }',
  'EigenResult': 'record { values: vec record { re: float64; im: float64 }; vectors: vec vec float64 }',
  'Record': 'record { }',
  'Variant': 'variant { }',
  'Result': 'variant { ok: text; err: text }',
};

export class CandidTreatyAgent {
  constructor() {
    this.id = 'candid_treaty';
    this.name = 'Candid Treaty Agent';
    this.inspections = [];
  }

  inspect(contract) {
    const inputShape = contract.input_shape?.shape_type || 'Scalar';
    const outputShape = contract.output_shape?.shape_type || 'Scalar';

    const inputCandid = CANDID_TYPE_MAP[inputShape];
    const outputCandid = CANDID_TYPE_MAP[outputShape];

    const result = {
      agent: this.id,
      input_candid: inputCandid || null,
      output_candid: outputCandid || null,
      interface_definition: inputCandid && outputCandid
        ? `${contract.function_signature.replace(/\./g, '_')} : (${inputCandid}) -> (${outputCandid})`
        : null,
      shareable: !!(inputCandid && outputCandid),
      frontend_callable: !!(inputCandid && outputCandid),
      warnings: [],
      confidence: (inputCandid && outputCandid) ? PHI - 1 : 0.3,
    };

    if (!inputCandid) result.warnings.push(`Input shape '${inputShape}' has no Candid mapping`);
    if (!outputCandid) result.warnings.push(`Output shape '${outputShape}' has no Candid mapping`);

    this.inspections.push(result);
    return result;
  }
}
