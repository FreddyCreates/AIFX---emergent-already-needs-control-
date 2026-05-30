/**
 * Motoko Sovereign Agent
 * 
 * Checks:
 *   - Can Motoko represent this value?
 *   - Can the wrapper be generated safely?
 *   - Is this call async-safe?
 *   - Should the result be stored?
 *   - What proof record is needed?
 */

const PHI = 1.618033988749895;

const MOTOKO_TYPES = {
  'Scalar': { representable: true, wrapper: 'Float', async_safe: true, storable: true },
  'Vector': { representable: true, wrapper: '[Float]', async_safe: true, storable: true },
  'Matrix': { representable: true, wrapper: '[[Float]]', async_safe: true, storable: true },
  'Tensor': { representable: true, wrapper: '[[[Float]]]', async_safe: false, storable: false },
  'Complex': { representable: true, wrapper: '{ re: Float; im: Float }', async_safe: true, storable: true },
  'EigenResult': { representable: true, wrapper: '{ values: [Complex]; vectors: [[Float]] }', async_safe: true, storable: true },
  'Record': { representable: true, wrapper: 'Record', async_safe: true, storable: true },
  'Variant': { representable: true, wrapper: 'Variant', async_safe: true, storable: true },
  'Sparse': { representable: false, wrapper: null, async_safe: false, storable: false },
};

export class MotokoSovereignAgent {
  constructor() {
    this.id = 'motoko_sovereign';
    this.name = 'Motoko Sovereign Agent';
    this.inspections = [];
  }

  inspect(contract) {
    const outputType = contract.output_shape?.shape_type || 'Scalar';
    const typeInfo = MOTOKO_TYPES[outputType];

    const result = {
      agent: this.id,
      output_shape: outputType,
      representable: typeInfo?.representable ?? false,
      wrapper_type: typeInfo?.wrapper || null,
      async_safe: typeInfo?.async_safe ?? false,
      should_store: contract.motoko_storage && (typeInfo?.storable ?? false),
      proof_needed: contract.proof_requirements || {},
      warnings: [],
      confidence: typeInfo?.representable ? PHI - 1 : 0.2,
    };

    if (!typeInfo?.representable) result.warnings.push(`Type '${outputType}' cannot be represented in Motoko`);
    if (!typeInfo?.async_safe) result.warnings.push('Type may not be safe for async canister calls');
    if (!typeInfo?.storable) result.warnings.push('Type is too large for efficient stable storage');

    this.inspections.push(result);
    return result;
  }
}
