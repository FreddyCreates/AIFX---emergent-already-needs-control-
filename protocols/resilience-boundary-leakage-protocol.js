/**
 * PROTO-269: Resilience Boundary Leakage Protocol (RBLP)
 * Stress-test prompt-injection resistance for governance enforcement boundaries.
 */

const PHI = 1.618033988749895;
const PROTOCOL_ID = 'PROTO-269';
const PROTOCOL_NAME = 'Resilience Boundary Leakage Protocol';

import { runBoundaryLeakageScenario } from '../sdk/resilience/resilience-bench.js';

class ResilienceBoundaryLeakageProtocol {
  constructor() {
    this.protocolId = PROTOCOL_ID;
    this.protocolName = PROTOCOL_NAME;
    this.version = '1.0.0';
    this.phi = PHI;
  }

  async run(options = {}) {
    return runBoundaryLeakageScenario(options);
  }

  getMetadata() {
    return {
      id: this.protocolId,
      name: this.protocolName,
      version: this.version,
      purpose: 'Detect boundary leakage in law evaluation under injection probes',
      phi: this.phi,
    };
  }
}

export { ResilienceBoundaryLeakageProtocol };
export default ResilienceBoundaryLeakageProtocol;

