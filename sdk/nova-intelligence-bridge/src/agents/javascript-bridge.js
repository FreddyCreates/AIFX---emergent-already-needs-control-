/**
 * JavaScript Bridge Agent
 * 
 * Checks:
 *   - Can PROTOCOL-JULIA.js transport this?
 *   - Does the runtime need WASM, Node, or browser?
 *   - Are conversions stable?
 *   - Are arrays copied correctly?
 */

const PHI = 1.618033988749895;

const JS_TRANSPORT_SUPPORT = {
  'Scalar': { stable: true, copy_needed: false, runtime: ['browser-wasm', 'node'] },
  'Vector': { stable: true, copy_needed: true, runtime: ['browser-wasm', 'node'] },
  'Matrix': { stable: true, copy_needed: true, runtime: ['browser-wasm', 'node'] },
  'Tensor': { stable: false, copy_needed: true, runtime: ['node'] },
  'Complex': { stable: true, copy_needed: false, runtime: ['browser-wasm', 'node'] },
  'EigenResult': { stable: true, copy_needed: true, runtime: ['browser-wasm', 'node'] },
  'Sparse': { stable: false, copy_needed: true, runtime: ['node'] },
};

export class JavaScriptBridgeAgent {
  constructor() {
    this.id = 'js_bridge';
    this.name = 'JavaScript Bridge Agent';
    this.inspections = [];
  }

  inspect(contract) {
    const inputShape = contract.input_shape?.shape_type || 'Scalar';
    const outputShape = contract.output_shape?.shape_type || 'Scalar';
    const inputSupport = JS_TRANSPORT_SUPPORT[inputShape];
    const outputSupport = JS_TRANSPORT_SUPPORT[outputShape];

    const result = {
      agent: this.id,
      input_transportable: inputSupport?.stable ?? false,
      output_transportable: outputSupport?.stable ?? false,
      copy_required: (inputSupport?.copy_needed || outputSupport?.copy_needed) ?? true,
      supported_runtimes: [...new Set([
        ...(inputSupport?.runtime || []),
        ...(outputSupport?.runtime || []),
      ])],
      execution_mode_compatible: contract.execution_mode
        ? (inputSupport?.runtime || []).includes(contract.execution_mode)
        : false,
      warnings: [],
      confidence: (inputSupport?.stable && outputSupport?.stable) ? PHI - 1 : 0.4,
    };

    if (!inputSupport?.stable) result.warnings.push(`Input shape '${inputShape}' may not transport stably via JS`);
    if (!outputSupport?.stable) result.warnings.push(`Output shape '${outputShape}' may not transport stably via JS`);
    if (inputSupport?.copy_needed) result.warnings.push('Input arrays must be deep-copied before transport');

    this.inspections.push(result);
    return result;
  }
}
