/**
 * PROTO-274: Deterministic RNG Protocol (DRP)
 * Deterministic RNG stream to support reproducible benchmarks.
 */

import { createDeterministicRng } from '../sdk/resilience/resilience-bench.js';

const PHI = 1.618033988749895;
const PROTOCOL_ID = 'PROTO-274';
const PROTOCOL_NAME = 'Deterministic RNG Protocol';

class DeterministicRngProtocol {
  constructor() {
    this.protocolId = PROTOCOL_ID;
    this.protocolName = PROTOCOL_NAME;
    this.version = '1.0.0';
    this.phi = PHI;
  }

  sample(seed = 123456789, count = 10) {
    const rng = createDeterministicRng(seed);
    const out = [];
    for (let i = 0; i < count; i++) out.push(rng());
    return out;
  }

  getMetadata() {
    return {
      id: this.protocolId,
      name: this.protocolName,
      version: this.version,
      purpose: 'Generate a deterministic RNG stream for reproducibility',
      phi: this.phi,
    };
  }
}

export { DeterministicRngProtocol };
export default DeterministicRngProtocol;

