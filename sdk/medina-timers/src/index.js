/**
 * @medina/medina-timers - Main Index
 * 
 * Mathematical timer implementations for living intelligent systems.
 * All timers use phi-weighted intervals based on ancient calendar systems,
 * sacred geometry patterns, and cosmic cycles.
 * 
 * TIMER CATEGORIES:
 * 1. Ancient Calendars - Mayan, Sumerian, Vedic, Egyptian, Chinese
 * 2. Sacred Geometry - Fibonacci, phi oscillators, golden angle, Metatron
 * 3. Cosmic Cycles - Lunar, solar, planetary, precession
 */

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

export const PHI = 1.618033988749895;
export const PHI_INV = 1 / PHI;
export const PHI_SQ = PHI * PHI;
export const GOLDEN_ANGLE = 137.508;
export const HEARTBEAT = 873;

// ═══════════════════════════════════════════════════════════════════════════
// IMPORT FOR INTERNAL USE
// ═══════════════════════════════════════════════════════════════════════════

import { createMultiHeartGenerator as _createMultiHeartGenerator } from './sacred-geometry.js';

// ═══════════════════════════════════════════════════════════════════════════
// ANCIENT CALENDAR EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export {
  // Mayan
  createMayanTzolkinTimer,
  createMayanHaabTimer,
  createMayanLongCountTimer,
  // Sumerian
  createSumerianSexagesimalTimer,
  createSumerianLunarTimer,
  // Vedic
  createVedicPanchangaTimer,
  createVedicYugaTimer,
  // Egyptian
  createEgyptianDecanTimer,
  createEgyptianSeasonTimer,
  // Chinese
  createChineseSexagenaryCycleTimer,
  createChineseSolarTermsTimer,
} from './ancient-calendars.js';

// ═══════════════════════════════════════════════════════════════════════════
// SACRED GEOMETRY EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export {
  // Fibonacci
  createFibonacciTimer,
  createFibonacciSpiralTimer,
  // Phi Oscillators
  createPhiOscillator,
  createDualPhiOscillator,
  // Golden Angle
  createGoldenAngleRotator,
  createPhyllotaxisTimer,
  // Metatron
  createMetatronRouter,
  // Multi-Heart
  createMultiHeartGenerator,
  // Suite
  createSacredGeometrySuite,
} from './sacred-geometry.js';

// ═══════════════════════════════════════════════════════════════════════════
// COSMIC CYCLE EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export {
  // Lunar
  createLunarPhaseTimer,
  createLunarNodeTimer,
  // Solar
  createSolarDeclinationTimer,
  createSunspotCycleTimer,
  // Planetary
  createPlanetarySynodicTimer,
  createAllPlanetsTimer,
  // Precession
  createPrecessionTimer,
  // Multi-Brain
  createMultiBrainTimer,
  // Suite
  createCosmicCycleSuite,
  // Constants
  SYNODIC_PERIODS,
  LUNAR_MONTH,
  SOLAR_YEAR,
  PRECESSION_CYCLE,
} from './cosmic-cycles.js';

// ═══════════════════════════════════════════════════════════════════════════
// AGENT TIMER SUITE FACTORY
// ═══════════════════════════════════════════════════════════════════════════

import { createSacredGeometrySuite } from './sacred-geometry.js';
import { createCosmicCycleSuite } from './cosmic-cycles.js';

/**
 * Create a complete timer suite for an agent
 * Combines all timer categories into a unified interface
 * 
 * @param {string} agentId - Unique identifier for the agent
 * @param {object} options - Configuration options
 * @returns {object} Complete timer suite with start/stop controls
 */
export function createAgentTimerSuite(agentId, options = {}) {
  const baseMs = options.baseMs || HEARTBEAT;
  const sacredSuite = createSacredGeometrySuite(`${agentId}-sacred`, { baseMs });
  const cosmicSuite = createCosmicCycleSuite(`${agentId}-cosmic`, { baseMs });
  
  const customTimers = {};
  
  return {
    agentId,
    baseMs,
    
    // Sacred Geometry timers
    sacred: sacredSuite,
    
    // Cosmic Cycle timers
    cosmic: cosmicSuite,
    
    // Custom timer creation
    createCustomTimer: (name, intervalMs, callback) => {
      customTimers[name] = setInterval(callback, intervalMs);
      return customTimers[name];
    },
    
    // Stop individual custom timer
    stopCustomTimer: (name) => {
      if (customTimers[name]) {
        clearInterval(customTimers[name]);
        delete customTimers[name];
      }
    },
    
    // Start all core timers with callbacks
    startAll: (callbacks = {}) => {
      const results = {};
      
      if (callbacks.goldenAngle) results.goldenAngle = sacredSuite.startGoldenAngle(callbacks.goldenAngle);
      if (callbacks.phiOscillator) results.phiOscillator = sacredSuite.startPhiOscillator(callbacks.phiOscillator);
      if (callbacks.fibonacci) results.fibonacci = sacredSuite.startFibonacci(callbacks.fibonacci);
      if (callbacks.metatron) results.metatron = sacredSuite.startMetatron(callbacks.metatron);
      if (callbacks.lunar) results.lunar = cosmicSuite.startLunar(callbacks.lunar);
      if (callbacks.solar) results.solar = cosmicSuite.startSolar(callbacks.solar);
      if (callbacks.precession) results.precession = cosmicSuite.startPrecession(callbacks.precession);
      
      return results;
    },
    
    // Stop everything
    stopAll: () => {
      sacredSuite.stopAll();
      cosmicSuite.stopAll();
      Object.values(customTimers).forEach(t => clearInterval(t));
      Object.keys(customTimers).forEach(k => delete customTimers[k]);
    },
    
    // Get all active timers
    getActiveTimers: () => ({
      sacred: sacredSuite.getActiveTimers(),
      cosmic: cosmicSuite.getActiveTimers(),
      custom: Object.keys(customTimers),
    }),
    
    // Create multi-heart for this agent
    createMultiHeart: (heartCount, callback) => {
      return _createMultiHeartGenerator(heartCount, callback, { baseMs });
    },
    
    // Create multi-brain for this agent
    createMultiBrain: (brainCount, callback) => {
      return cosmicSuite.startMultiBrain(brainCount, callback);
    },
  };
}

/**
 * Create timer suites for multiple agents
 * 
 * @param {string[]} agentIds - Array of agent identifiers
 * @param {object} options - Configuration options
 * @returns {object} Map of agent ID to timer suite
 */
export function createMultiAgentTimerSuites(agentIds, options = {}) {
  const suites = {};
  
  agentIds.forEach((agentId, index) => {
    // Offset each agent's timers by phi-scaled amount
    const offsetMs = index * HEARTBEAT * PHI_INV;
    suites[agentId] = createAgentTimerSuite(agentId, {
      ...options,
      baseMs: (options.baseMs || HEARTBEAT) + offsetMs,
    });
  });
  
  return {
    suites,
    
    // Start same timer on all agents
    startAllAgents: (timerName, callbacks) => {
      Object.entries(suites).forEach(([agentId, suite]) => {
        if (callbacks[agentId]) {
          suite[timerName]?.(callbacks[agentId]);
        }
      });
    },
    
    // Stop all timers on all agents
    stopAllAgents: () => {
      Object.values(suites).forEach(suite => suite.stopAll());
    },
    
    // Get collective coherence across all agents
    getCollectiveCoherence: () => {
      // This would be implemented to check phase alignment
      // across all agent timers
      return null; // Placeholder
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export default {
  // Constants
  PHI, PHI_INV, PHI_SQ, GOLDEN_ANGLE, HEARTBEAT,
  
  // Factory functions
  createAgentTimerSuite,
  createMultiAgentTimerSuites,
  
  // Suite creators
  createSacredGeometrySuite,
  createCosmicCycleSuite,
};
