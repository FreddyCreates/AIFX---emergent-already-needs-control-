'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const {
  AlphaOneFleet,
  createAlphaOneFleet,
  AGENT_MANIFEST,
  MICROBOT_REGISTRY,
  MicrobotBase,
  MicrobotRunner,
  VERSION,
  CODENAME,
  PHI,
} = require('./index.js');

describe('ALPHA ONE Release Package', () => {
  it('exports correct version and codename', () => {
    assert.equal(VERSION, '0.1.0-alpha.1');
    assert.equal(CODENAME, 'ALPHA-ONE');
  });

  it('exports PHI constant', () => {
    assert.equal(PHI, 1.618033988749895);
  });

  it('has 4 agents in manifest', () => {
    const agents = Object.keys(AGENT_MANIFEST);
    assert.equal(agents.length, 4);
    assert.ok(agents.includes('animus'));
    assert.ok(agents.includes('corpus'));
    assert.ok(agents.includes('sensus'));
    assert.ok(agents.includes('memoria'));
  });

  it('has 6 microbots in registry', () => {
    const bots = Object.keys(MICROBOT_REGISTRY);
    assert.equal(bots.length, 6);
    assert.ok(bots.includes('signal-gatherer'));
    assert.ok(bots.includes('synapse-trainer'));
    assert.ok(bots.includes('weight-evolver'));
    assert.ok(bots.includes('orphan-scanner'));
    assert.ok(bots.includes('link-checker'));
    assert.ok(bots.includes('graph-builder'));
  });

  it('creates a fleet instance with factory', () => {
    const fleet = createAlphaOneFleet();
    assert.equal(fleet.name, 'ALPHA ONE');
    assert.equal(fleet.status, 'ready');
    assert.ok(fleet.bootedAt);
  });

  it('fleet inventory reports correct totals', () => {
    const fleet = createAlphaOneFleet();
    const inv = fleet.inventory();
    assert.equal(inv.totalBotCount, 10); // 4 agents + 6 microbots
    assert.equal(inv.agents.length, 4);
    assert.equal(inv.microbots.length, 6);
    assert.equal(inv.divisions.length, 2);
  });

  it('fleet report includes all divisions', () => {
    const fleet = createAlphaOneFleet();
    const report = fleet.report();
    assert.equal(report.divisions.length, 2);
    assert.equal(report.agents.length, 4);
    assert.equal(report.status, 'ready');
  });

  it('rejects deploy before boot', async () => {
    const fleet = new AlphaOneFleet();
    await assert.rejects(fleet.deploy('learning'), /not ready/);
  });

  it('rejects unknown division', async () => {
    const fleet = createAlphaOneFleet();
    await assert.rejects(fleet.deploy('unknown'), /Unknown division/);
  });

  it('MicrobotBase and MicrobotRunner are exported', () => {
    assert.ok(MicrobotBase);
    assert.ok(MicrobotRunner);
  });
});
