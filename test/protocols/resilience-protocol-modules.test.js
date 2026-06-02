const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

describe('Resilience Protocol Modules', () => {
  it('imports 10 protocols and exposes metadata', async () => {
    const modules = await Promise.all([
      import('../../protocols/resilience-poisoning-resistance-protocol.js'),
      import('../../protocols/resilience-boundary-leakage-protocol.js'),
      import('../../protocols/resilience-rollback-integrity-protocol.js'),
      import('../../protocols/resilience-promotion-throughput-protocol.js'),
      import('../../protocols/strict-cpl-l-sandbox-protocol.js'),
      import('../../protocols/unsafe-expression-telemetry-protocol.js'),
      import('../../protocols/deterministic-rng-protocol.js'),
      import('../../protocols/resilience-report-contract-protocol.js'),
      import('../../protocols/resilience-cli-archival-protocol.js'),
      import('../../protocols/resilience-verification-protocol.js'),
    ]);

    const protocols = modules.map(m => m.default).map(Proto => new Proto());
    assert.equal(protocols.length, 10);

    const ids = protocols.map(p => p.getMetadata().id);
    assert.deepEqual(ids, [
      'PROTO-268',
      'PROTO-269',
      'PROTO-270',
      'PROTO-271',
      'PROTO-272',
      'PROTO-273',
      'PROTO-274',
      'PROTO-275',
      'PROTO-276',
      'PROTO-277',
    ]);
  });

  it('runs a small end-to-end verification', async () => {
    const { default: ResilienceVerificationProtocol } = await import('../../protocols/resilience-verification-protocol.js');
    const verifier = new ResilienceVerificationProtocol();

    const result = await verifier.verify({
      seed: 7,
      poisoningResistance: { claimsTotal: 25, poisonRate: 0.2 },
      promotionThroughput: { hypothesesTotal: 150 },
    });

    assert.equal(result.ok, true, `verification failures: ${result.failures.join(', ')}`);
  });
});

