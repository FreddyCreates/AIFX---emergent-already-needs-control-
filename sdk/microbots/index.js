/**
 * MICROBOTS INDEX — Registry of all organism microbots
 *
 * Microbots are the atoms of the bot fleet. Each parent bot spawns
 * one or more microbots to handle specific sub-tasks in parallel.
 * This registry exports all microbot classes and a factory function.
 *
 * LEARNING BOT microbots:
 *   SignalGathererMicrobot  — collects training signals from CI reports
 *   SynapseTrainerMicrobot  — runs Hebbian learning on co-activation data
 *   WeightEvolverMicrobot   — evolves protocol weights via reward shaping
 *
 * CRAWLER BOT microbots:
 *   OrphanScannerMicrobot   — finds files with no importers
 *   LinkCheckerMicrobot     — detects broken require/import/href references
 *   GraphBuilderMicrobot    — builds the full dependency web
 *
 * CYBER BOT microbots:
 *   ThreatScannerMicrobot   — scans for threat indicators in code
 *   AttackSurfaceMicrobot   — maps external-facing attack surface
 *
 * CLOUD BOT microbots:
 *   WorkerHealthMicrobot    — checks Cloudflare Worker / edge health
 *   EdgeLatencyMicrobot     — measures edge latency distribution
 */

'use strict';

const { MicrobotBase, MicrobotRunner } = require('./microbot-base.js');

// Learning microbots
const SignalGathererMicrobot = require('./learning/signal-gatherer-microbot.js');
const SynapseTrainerMicrobot = require('./learning/synapse-trainer-microbot.js');
const WeightEvolverMicrobot  = require('./learning/weight-evolver-microbot.js');

// Crawler microbots
const OrphanScannerMicrobot = require('./crawler/orphan-scanner-microbot.js');
const LinkCheckerMicrobot   = require('./crawler/link-checker-microbot.js');
const GraphBuilderMicrobot  = require('./crawler/graph-builder-microbot.js');

// Registry: microbot name → class
const MICROBOT_REGISTRY = {
  // Learning division
  'signal-gatherer':  SignalGathererMicrobot,
  'synapse-trainer':  SynapseTrainerMicrobot,
  'weight-evolver':   WeightEvolverMicrobot,
  // Crawler division
  'orphan-scanner':   OrphanScannerMicrobot,
  'link-checker':     LinkCheckerMicrobot,
  'graph-builder':    GraphBuilderMicrobot,
};

/**
 * Create a set of microbots for a given parent bot
 * @param {string} parentBot - Parent bot name
 * @param {string[]} names   - Microbot names to instantiate
 * @param {object} config    - Shared config
 */
function createMicrobots(parentBot, names, config = {}) {
  return names.map(name => {
    const Cls = MICROBOT_REGISTRY[name];
    if (!Cls) throw new Error(`Unknown microbot: ${name}`);
    return new Cls(parentBot, config);
  });
}

/**
 * Create a MicrobotRunner with all microbots for the given parent
 */
function createRunner(parentBot, names, config = {}) {
  const runner = new MicrobotRunner(parentBot);
  const microbots = createMicrobots(parentBot, names, config);
  microbots.forEach(mb => runner.register(mb));
  return runner;
}

module.exports = {
  MicrobotBase,
  MicrobotRunner,
  MICROBOT_REGISTRY,
  createMicrobots,
  createRunner,
  // Re-export all microbot classes
  SignalGathererMicrobot,
  SynapseTrainerMicrobot,
  WeightEvolverMicrobot,
  OrphanScannerMicrobot,
  LinkCheckerMicrobot,
  GraphBuilderMicrobot,
};
