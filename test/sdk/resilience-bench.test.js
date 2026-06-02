const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

describe('Resilience Bench', () => {
  it('produces a stable report shape and key invariants', async () => {
    const { runResilienceBench } = await import('../../sdk/resilience/resilience-bench.js');
    const report = await runResilienceBench({
      seed: 42,
      poisoningResistance: { claimsTotal: 50, poisonRate: 0.3 },
      promotionThroughput: { hypothesesTotal: 250 },
    });

    assert.ok(report.meta);
    assert.equal(report.meta.version, 1);

    // Poisoning: measurement only, but should be internally consistent.
    assert.ok(report.poisoningResistance);
    assert.equal(report.poisoningResistance.totalClaims, 50);
    assert.ok(report.poisoningResistance.injectedPoison >= 0);
    assert.ok(report.poisoningResistance.poisonStored >= 0);

    // Boundary leakage: strict sandbox should prevent access to Node globals via condition expressions.
    assert.ok(report.boundaryLeakage);
    assert.equal(report.boundaryLeakage.blocked, false);
    assert.ok(report.boundaryLeakage.unsafeExpressions);
    assert.ok(report.boundaryLeakage.unsafeExpressions.totalRejected >= 1);

    // Rollback integrity: corruption should be recoverable and preserve root ancestry.
    assert.ok(report.rollbackIntegrity);
    assert.equal(report.rollbackIntegrity.expectedHasRoot, true);
    assert.equal(report.rollbackIntegrity.corruptedHasRoot, false);
    assert.equal(report.rollbackIntegrity.recoveredHasRoot, true);

    // Throughput: reports per-friction measurements.
    assert.ok(Array.isArray(report.promotionThroughput));
    const frictions = report.promotionThroughput.map(r => r.friction);
    assert.deepEqual(frictions.sort(), ['high', 'low', 'medium']);
    for (const row of report.promotionThroughput) {
      assert.ok(row.hypothesesPerMinute > 0);
      assert.ok(row.promotedPerMinute >= 0);
    }
  });
});

