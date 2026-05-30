const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { pathToFileURL } = require('url');

describe('Centerfold engine', () => {
  let CenterfoldEngine;
  let CENTERFOLD_KERNEL_BANK;
  let selectCenterfoldKernelByEntropy;
  let CenterfoldConvergenceProtocol;

  before(async () => {
    const engineModulePath = pathToFileURL(
      path.resolve(__dirname, '../../sdk/engines/centerfold-engine.js'),
    ).href;

    const kernelModulePath = pathToFileURL(
      path.resolve(__dirname, '../../sdk/engines/centerfold-kernel-bank.js'),
    ).href;

    const protocolModulePath = pathToFileURL(
      path.resolve(__dirname, '../../protocols/centerfold-convergence-protocol.js'),
    ).href;

    ({ CenterfoldEngine } = await import(engineModulePath));
    ({ CENTERFOLD_KERNEL_BANK, selectKernelByEntropy: selectCenterfoldKernelByEntropy } = await import(kernelModulePath));
    ({ CenterfoldConvergenceProtocol } = await import(protocolModulePath));
  });

  it('runs one cycle with explicit kernel id and produces all paths', () => {
    const engine = new CenterfoldEngine();

    const snapshot = engine.runCycle({
      vector: [0.1, 0.2, 0.3, 0.4],
      kernel: { kernelId: 'KERNEL-0100' },
      metadata: { test: 'explicit-kernel' },
    });

    assert.equal(snapshot.input.kernel.id, 'KERNEL-0100');
    assert.ok(Array.isArray(snapshot.output.linear.output));
    assert.ok(Array.isArray(snapshot.output.exponential.aggregate));
    assert.ok(Array.isArray(snapshot.output.perpendicular.vector));
    assert.ok(Array.isArray(snapshot.output.centerfold.vector));
    assert.ok(Number.isFinite(snapshot.output.centerfold.centerMass));
  });

  it('selects kernel from entropy band and tracks sequence growth', () => {
    const engine = new CenterfoldEngine();

    const first = engine.runCycle({ vector: [1, 2, 3], kernel: { entropy: 0.15 } });
    const second = engine.runCycle({ vector: [2, 3, 4], kernel: { entropy: 0.75 } });

    assert.ok(first.sequence < second.sequence);
    assert.ok(first.input.kernel.id.startsWith('KERNEL-'));
    assert.ok(second.input.kernel.id.startsWith('KERNEL-'));
    assert.notEqual(first.input.kernel.id, second.input.kernel.id);
  });

  it('supports batch execution and trend summaries', () => {
    const engine = new CenterfoldEngine();

    const result = engine.runBatch([
      { vector: [0.4, 0.3, 0.2], kernel: { entropy: 0.10 } },
      { vector: [0.8, 0.7, 0.6], kernel: { entropy: 0.90 } },
      { vector: [0.5, 0.5, 0.5], kernel: { entropy: 0.50 } },
    ]);

    assert.equal(result.length, 3);

    const summary = engine.state.getTrendSummary();
    assert.equal(summary.samples, 3);
    assert.ok(Number.isFinite(summary.centerfoldEnergy.average));
    assert.ok(Number.isFinite(summary.centerMass.current));
  });

  it('exposes observability metrics and cycle events', () => {
    const engine = new CenterfoldEngine();

    let completed = 0;
    engine.observability.on('centerfold:cycle:complete', () => {
      completed += 1;
    });

    engine.runCycle({ vector: [0.1, 0.1, 0.1], kernel: { entropy: 0.2 } });
    engine.runCycle({ vector: [0.2, 0.2, 0.2], kernel: { entropy: 0.4 } });

    const metrics = engine.observability.getMetrics();
    assert.equal(metrics.cycles, 2);
    assert.equal(completed, 2);
    assert.equal(metrics.failures, 0);
  });

  it('has a large traceable kernel bank for calibration', () => {
    const catalog = CENTERFOLD_KERNEL_BANK.catalog;
    const keys = Object.keys(catalog);

    assert.ok(keys.length >= 900);
    const selected = selectCenterfoldKernelByEntropy(CENTERFOLD_KERNEL_BANK, 0.501);
    assert.ok(selected);
    assert.ok(selected.id.startsWith('KERNEL-'));
  });

  it('protocol hook activates, ticks, and watches cycle output', () => {
    const protocol = new CenterfoldConvergenceProtocol();

    const activation = protocol.activate({
      vector: [0.2, 0.4, 0.8],
      kernel: { entropy: 0.3 },
    });

    assert.equal(activation.state, 'active');
    assert.ok(Number.isFinite(activation.centerMass));

    const watch = protocol.watchCycle(2);
    assert.equal(watch.state, 'active');
    assert.ok(Array.isArray(watch.recent));
    assert.ok(watch.recent.length >= 1);
  });
});
