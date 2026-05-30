/**
 * ╔═══════════════════════════════════════════════════════════════════════╗
 * ║                         ALPHA ONE                                    ║
 * ║          The First Bot Fleet Release Package                         ║
 * ║                                                                      ║
 * ║  Bundles:                                                            ║
 * ║    • 4 Agents (Animus, Corpus, Sensus, Memoria)                     ║
 * ║    • 6 Microbots (Learning + Crawler divisions)                     ║
 * ║    • MicrobotRunner (parallel execution infrastructure)             ║
 * ║    • Fleet Orchestrator (coordinates agents + microbots)            ║
 * ║                                                                      ║
 * ║  Version: 0.1.0-alpha.1                                             ║
 * ║  Codename: ALPHA ONE                                                ║
 * ╚═══════════════════════════════════════════════════════════════════════╝
 */

'use strict';

const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;
const HEARTBEAT_MS = 873;

// ═══════════════════════════════════════════════════════════════════════════
// MICROBOTS — The Atoms of Automation
// ═══════════════════════════════════════════════════════════════════════════

const {
  MicrobotBase,
  MicrobotRunner,
  MICROBOT_REGISTRY,
  createMicrobots,
  createRunner,
  SignalGathererMicrobot,
  SynapseTrainerMicrobot,
  WeightEvolverMicrobot,
  OrphanScannerMicrobot,
  LinkCheckerMicrobot,
  GraphBuilderMicrobot,
} = require('../../sdk/microbots/index.js');

// ═══════════════════════════════════════════════════════════════════════════
// AGENTS — The Organs of Intelligence
// ═══════════════════════════════════════════════════════════════════════════

// Note: Agents use ESM exports, so we reference them by path for the bundle
const AGENT_MANIFEST = {
  animus:  { path: '../../sdk/agents/animus-agent.js',  role: 'Mind — reasoning, decisions, planning' },
  corpus:  { path: '../../sdk/agents/corpus-agent.js',  role: 'Body — execution, action, resources' },
  sensus:  { path: '../../sdk/agents/sensus-agent.js',  role: 'Senses — perception, filtering, attention' },
  memoria: { path: '../../sdk/agents/memoria-agent.js', role: 'Memory — encoding, retrieval, consolidation' },
};

// ═══════════════════════════════════════════════════════════════════════════
// FLEET ORCHESTRATOR — Coordinates the entire bot fleet
// ═══════════════════════════════════════════════════════════════════════════

class AlphaOneFleet {
  constructor(config = {}) {
    this.name = 'ALPHA ONE';
    this.version = '0.1.0-alpha.1';
    this.codename = 'ALPHA-ONE';
    this.config = config;
    this.status = 'idle';
    this.bootedAt = null;

    // Bot divisions
    this.divisions = {
      learning: {
        name: 'Learning Division',
        microbots: ['signal-gatherer', 'synapse-trainer', 'weight-evolver'],
        description: 'Collects training signals, trains synapses, evolves weights',
      },
      crawler: {
        name: 'Crawler Division',
        microbots: ['orphan-scanner', 'link-checker', 'graph-builder'],
        description: 'Finds orphans, checks links, builds dependency graphs',
      },
    };

    // Runners (created on boot)
    this.runners = {};

    // Fleet metrics
    this.metrics = {
      totalRuns: 0,
      successfulRuns: 0,
      failedRuns: 0,
      lastRunAt: null,
      averageDurationMs: 0,
      uptime: 0,
    };
  }

  /**
   * Boot the fleet — initialize all microbot runners
   */
  boot() {
    this.status = 'booting';
    this.bootedAt = Date.now();

    for (const [divName, div] of Object.entries(this.divisions)) {
      this.runners[divName] = createRunner(
        `alpha-one-${divName}`,
        div.microbots,
        this.config
      );
    }

    this.status = 'ready';
    return this;
  }

  /**
   * Deploy a specific division
   * @param {string} divisionName - 'learning' or 'crawler'
   * @param {object} input - Input data for the microbots
   */
  async deploy(divisionName, input = {}) {
    if (this.status !== 'ready') {
      throw new Error(`Fleet not ready. Current status: ${this.status}. Call boot() first.`);
    }

    const runner = this.runners[divisionName];
    if (!runner) {
      throw new Error(`Unknown division: ${divisionName}. Available: ${Object.keys(this.divisions).join(', ')}`);
    }

    this.status = 'deploying';
    this.metrics.totalRuns++;
    const startTime = Date.now();

    try {
      const results = await runner.runAll(input);
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      this.metrics.successfulRuns += successCount;
      this.metrics.failedRuns += failCount;
      this.metrics.lastRunAt = new Date().toISOString();

      const duration = Date.now() - startTime;
      this.metrics.averageDurationMs = this.metrics.averageDurationMs
        ? (this.metrics.averageDurationMs * PHI_INV + duration * (1 - PHI_INV))
        : duration;

      this.status = 'ready';
      return {
        division: divisionName,
        results,
        duration,
        successCount,
        failCount,
        timestamp: this.metrics.lastRunAt,
      };
    } catch (err) {
      this.status = 'ready';
      this.metrics.failedRuns++;
      throw err;
    }
  }

  /**
   * Deploy ALL divisions in parallel
   */
  async deployAll(input = {}) {
    const divisionNames = Object.keys(this.divisions);
    const results = await Promise.allSettled(
      divisionNames.map(name => this.deploy(name, input))
    );

    return results.map((r, i) => ({
      division: divisionNames[i],
      success: r.status === 'fulfilled',
      result: r.status === 'fulfilled' ? r.value : null,
      error: r.status === 'rejected' ? r.reason?.message : null,
    }));
  }

  /**
   * Get fleet status report
   */
  report() {
    return {
      name: this.name,
      version: this.version,
      codename: this.codename,
      status: this.status,
      bootedAt: this.bootedAt ? new Date(this.bootedAt).toISOString() : null,
      uptime: this.bootedAt ? Date.now() - this.bootedAt : 0,
      divisions: Object.entries(this.divisions).map(([key, div]) => ({
        name: div.name,
        key,
        microbots: div.microbots,
        description: div.description,
      })),
      agents: Object.entries(AGENT_MANIFEST).map(([key, agent]) => ({
        key,
        role: agent.role,
      })),
      metrics: { ...this.metrics },
    };
  }

  /**
   * Inventory — list everything in the package
   */
  inventory() {
    return {
      package: this.name,
      version: this.version,
      agents: Object.keys(AGENT_MANIFEST),
      microbots: Object.keys(MICROBOT_REGISTRY),
      divisions: Object.keys(this.divisions),
      totalBotCount: Object.keys(AGENT_MANIFEST).length + Object.keys(MICROBOT_REGISTRY).length,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FACTORY
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create and boot an ALPHA ONE fleet instance
 * @param {object} config - Fleet configuration
 */
function createAlphaOneFleet(config = {}) {
  const fleet = new AlphaOneFleet(config);
  fleet.boot();
  return fleet;
}

// ═══════════════════════════════════════════════════════════════════════════
// CLI — Status when run directly
// ═══════════════════════════════════════════════════════════════════════════

if (require.main === module) {
  console.log('');
  console.log('  ╔═══════════════════════════════════════════════╗');
  console.log('  ║            ALPHA ONE — Bot Fleet              ║');
  console.log('  ║         v0.1.0-alpha.1 • ALPHA                ║');
  console.log('  ╚═══════════════════════════════════════════════╝');
  console.log('');

  const fleet = createAlphaOneFleet();
  const inv = fleet.inventory();
  const report = fleet.report();

  console.log(`  Status: ${report.status}`);
  console.log(`  Total Bots: ${inv.totalBotCount}`);
  console.log('');
  console.log('  AGENTS (4):');
  report.agents.forEach(a => console.log(`    • ${a.key.toUpperCase()} — ${a.role}`));
  console.log('');
  console.log('  DIVISIONS:');
  report.divisions.forEach(d => {
    console.log(`    ${d.name} [${d.microbots.join(', ')}]`);
    console.log(`      ${d.description}`);
  });
  console.log('');
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

module.exports = {
  // Fleet
  AlphaOneFleet,
  createAlphaOneFleet,

  // Agents Manifest
  AGENT_MANIFEST,

  // Microbots (re-export)
  MicrobotBase,
  MicrobotRunner,
  MICROBOT_REGISTRY,
  createMicrobots,
  createRunner,
  SignalGathererMicrobot,
  SynapseTrainerMicrobot,
  WeightEvolverMicrobot,
  OrphanScannerMicrobot,
  LinkCheckerMicrobot,
  GraphBuilderMicrobot,

  // Constants
  PHI,
  PHI_INV,
  HEARTBEAT_MS,

  // Meta
  VERSION: '0.1.0-alpha.1',
  CODENAME: 'ALPHA-ONE',
};
