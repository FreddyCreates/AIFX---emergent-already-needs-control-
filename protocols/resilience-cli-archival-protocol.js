/**
 * PROTO-276: Resilience CLI Archival Protocol (RCAP)
 * Command-line contract for running and archiving resilience benchmark output.
 */

const PHI = 1.618033988749895;
const PROTOCOL_ID = 'PROTO-276';
const PROTOCOL_NAME = 'Resilience CLI Archival Protocol';

class ResilienceCliArchivalProtocol {
  constructor() {
    this.protocolId = PROTOCOL_ID;
    this.protocolName = PROTOCOL_NAME;
    this.version = '1.0.0';
    this.phi = PHI;
  }

  getCommand(options = {}) {
    const seed = Number.isFinite(options.seed) ? `--seed=${options.seed}` : '';
    const pretty = options.pretty ? '--pretty' : '';
    const out = options.out ? `--out=${options.out}` : '';

    return ['node scripts/resilience-bench.js', seed, pretty, out].filter(Boolean).join(' ');
  }

  getMetadata() {
    return {
      id: this.protocolId,
      name: this.protocolName,
      version: this.version,
      purpose: 'Provide a CLI contract to run and archive benchmark reports',
      phi: this.phi,
    };
  }
}

export { ResilienceCliArchivalProtocol };
export default ResilienceCliArchivalProtocol;

