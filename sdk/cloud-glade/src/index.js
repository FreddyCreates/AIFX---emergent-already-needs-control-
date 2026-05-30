/**
 * 🌲 Cloud Glade Security Biome SDK — Index
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Unified entry point for the Cloud Glade security biome SDK.
 * Integrates Phantom blockchain primitives with AI-powered threat defense.
 *
 * Usage:
 *   import { CloudGladeBiomeEngine, PhantomIntegration } from '@medina/cloud-glade';
 *
 * Or:
 *   const { CloudGladeBiomeEngine } = require('@medina/cloud-glade');
 *
 * @module sdk/cloud-glade
 * @version 1.0.0
 */

// Biome Engine — Main orchestration
export { 
  CloudGladeBiomeEngine,
  BIOME_SEASONS,
  BIOME_HEALTH,
  THREAT_PLAYBOOKS,
  BIOME_EVENTS,
} from './biome-engine.js';

// Phantom Integration — Blockchain primitives
export {
  PhantomIntegration,
  PhantomStealthRouter,
  PhantomEncryptionWeave,
  PhantomKeyRotation,
  PhantomDecoyGenerator,
  PhantomCloakCompute,
  PHANTOM_TIERS,
} from './phantom-integration.js';

// Re-export default
export { default as CloudGlade } from './biome-engine.js';
