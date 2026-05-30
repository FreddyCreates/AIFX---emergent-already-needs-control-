/**
 * 📦 Atlas Governance SDK — Index
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Unified entry point for the Atlas governance SDK.
 *
 * Usage:
 *   const { AtlasEvent, CplLEngine, CplPRunner, AtlasMemory, atlasRegistry } = require('./sdk/governance');
 *
 * Or:
 *   import { AtlasEvent, CplLEngine } from './sdk/governance/index.js';
 */

'use strict';

const AtlasEvent   = require('./atlas-event.js');
const CplLEngine   = require('./cpl-l-engine.js');
const CplPRunner   = require('./cpl-p-runner.js');
const atlasMemory  = require('./atlas-memory.js');
const atlasRegistry = require('./atlas-registry.js');
const { AtlasMemory }            = require('./atlas-memory.js');
const { UniversalAtlasRegistry } = require('./atlas-registry.js');

module.exports = {
  // Classes
  AtlasEvent,
  CplLEngine,
  CplPRunner,
  AtlasMemory,
  UniversalAtlasRegistry,

  // Singletons
  atlasMemory,
  atlasRegistry,
};
