/**
 * PROTO-273: Unsafe Expression Telemetry Protocol (UETP)
 * Record and summarize unsafe CPL-L condition expressions rejected by strict sandbox.
 */

import StrictCplLSandboxProtocol from './strict-cpl-l-sandbox-protocol.js';

const PHI = 1.618033988749895;
const PROTOCOL_ID = 'PROTO-273';
const PROTOCOL_NAME = 'Unsafe Expression Telemetry Protocol';

class UnsafeExpressionTelemetryProtocol {
  constructor() {
    this.protocolId = PROTOCOL_ID;
    this.protocolName = PROTOCOL_NAME;
    this.version = '1.0.0';
    this.phi = PHI;
    this.sandbox = new StrictCplLSandboxProtocol();
  }

  async run(expressions = []) {
    const results = [];
    for (const expr of expressions) {
      const r = await this.sandbox.evaluateWhenExpression(expr, { op: 'telemetry_probe' });
      results.push({ expression: expr, triggered: r.triggered, unsafeExpressions: r.unsafeExpressions });
    }

    const totalRejected = results.reduce((sum, r) => sum + (r.unsafeExpressions?.totalRejected || 0), 0);
    return { totalExpressions: expressions.length, totalRejected, results };
  }

  getMetadata() {
    return {
      id: this.protocolId,
      name: this.protocolName,
      version: this.version,
      purpose: 'Telemetry for rejected law condition expressions',
      phi: this.phi,
    };
  }
}

export { UnsafeExpressionTelemetryProtocol };
export default UnsafeExpressionTelemetryProtocol;

