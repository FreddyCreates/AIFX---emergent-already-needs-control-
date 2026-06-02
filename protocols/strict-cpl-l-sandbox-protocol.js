/**
 * PROTO-272: Strict CPL-L Sandbox Protocol (SCSP)
 * Evaluate CPL-L law conditions under a strict sandbox to prevent boundary escape.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import CplLEngine from '../sdk/governance/cpl-l-engine.js';

const PHI = 1.618033988749895;
const PROTOCOL_ID = 'PROTO-272';
const PROTOCOL_NAME = 'Strict CPL-L Sandbox Protocol';

class StrictCplLSandboxProtocol {
  constructor() {
    this.protocolId = PROTOCOL_ID;
    this.protocolName = PROTOCOL_NAME;
    this.version = '1.0.0';
    this.phi = PHI;
  }

  async evaluateWhenExpression(expression, options = {}) {
    const entityId = options.entityId || 'atlas://bot/organism-release-bot';
    const op = options.op || 'policy_probe';
    const context = options.context || {};

    const tmpLawFile = path.join(
      os.tmpdir(),
      `cpl-l-sandbox-${Date.now()}-${Math.random().toString(16).slice(2)}.cpl-l`
    );

    const lawContent = `
id: "STRICT_SANDBOX_PROBE"
subjects:
  - id: "${entityId}"
    rules:
      - name: "PROBE"
        when: '${String(expression).replace(/'/g, "\\'")}'
        then:
          - action: "FORBID"
            target: "probe_target"
            reason: "probe fired"
`;

    fs.writeFileSync(tmpLawFile, lawContent);
    try {
      const engine = new CplLEngine(tmpLawFile, { sandbox: 'strict' });
      const result = engine.apply(entityId, {}, { op, context }, context);
      return {
        triggered: result.blocked,
        decisions: result.decisions,
        unsafeExpressions: engine.getUnsafeExpressionStats?.() ?? null,
      };
    } finally {
      try { fs.unlinkSync(tmpLawFile); } catch {}
    }
  }

  getMetadata() {
    return {
      id: this.protocolId,
      name: this.protocolName,
      version: this.version,
      purpose: 'Strict sandbox evaluation of CPL-L `when` expressions',
      phi: this.phi,
    };
  }
}

export { StrictCplLSandboxProtocol };
export default StrictCplLSandboxProtocol;

