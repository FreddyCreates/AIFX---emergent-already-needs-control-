/**
 * Primitive Shape Agent
 * 
 * Checks:
 *   - What is this value really?
 *   - Scalar? Vector? Matrix? Tensor? Complex? Sparse? Record? Variant? Result?
 */

const PHI = 1.618033988749895;

export class PrimitiveShapeAgent {
  constructor() {
    this.id = 'primitive_shape';
    this.name = 'Primitive Shape Agent';
    this.inspections = [];
  }

  classify(value) {
    let shape_type = 'Scalar';
    let element_type = 'Float64';
    let dimensions = [];
    let layout = null;

    if (value === null || value === undefined) {
      shape_type = 'Scalar';
      element_type = 'Any';
    } else if (typeof value === 'number') {
      shape_type = 'Scalar';
      element_type = Number.isInteger(value) ? 'Int64' : 'Float64';
    } else if (typeof value === 'boolean') {
      shape_type = 'Scalar';
      element_type = 'Bool';
    } else if (typeof value === 'string') {
      shape_type = 'Scalar';
      element_type = 'String';
    } else if (typeof value === 'object' && value.re !== undefined && value.im !== undefined) {
      shape_type = 'Complex';
      element_type = 'Complex128';
    } else if (Array.isArray(value)) {
      if (value.length === 0) {
        shape_type = 'Vector';
        dimensions = [0];
      } else if (Array.isArray(value[0])) {
        if (Array.isArray(value[0][0])) {
          shape_type = 'Tensor';
          dimensions = [value.length, value[0].length, value[0][0].length];
        } else {
          shape_type = 'Matrix';
          dimensions = [value.length, value[0].length];
          layout = 'row-major';
        }
      } else {
        shape_type = 'Vector';
        dimensions = [value.length];
      }
      element_type = 'Float64';
    } else if (typeof value === 'object' && value.values && value.vectors) {
      shape_type = 'EigenResult';
    } else if (typeof value === 'object') {
      shape_type = 'Record';
      element_type = 'Any';
    }

    const result = {
      agent: this.id,
      shape_type,
      element_type,
      dimensions,
      layout,
      confidence: PHI - 1,
    };

    this.inspections.push(result);
    return result;
  }

  inspectContract(contract) {
    return {
      agent: this.id,
      input_shape: contract.input_shape,
      output_shape: contract.output_shape,
      compatible: true,
      confidence: PHI - 1,
    };
  }
}
