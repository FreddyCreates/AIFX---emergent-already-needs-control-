/**
 * BOOTSTRAP CIVITAS — One Function to Rule Them All
 * 
 * This is the SINGULAR entry point to start a living Civitas civilization.
 * 
 * Usage:
 *   import { bootstrapCivitas } from '@medina/civitas-intelligentiae';
 *   const civitas = bootstrapCivitas('my-meridian', 'my-civitas-001');
 *   // civitas is now ALIVE and running
 * 
 * What happens when you call bootstrapCivitas():
 *   1. Creates CivitasRuntime
 *   2. Creates all 4 engines (CHRONO, NEXORIS, QUANTUM_FLUX, COREOGRAPH)
 *   3. Creates all 4 agents (ANIMUS, CORPUS, SENSUS, MEMORIA)
 *   4. Wires agents together
 *   5. Calls awaken() on everything
 *   6. Returns the running civilization
 * 
 * The civilization then runs FOREVER via setInterval loops:
 *   - CHRONO ticks every 873ms (heartbeat)
 *   - ANIMUS thinks every beat
 *   - CORPUS executes every beat
 *   - SENSUS perceives every beat
 *   - MEMORIA decays every 5 beats
 * 
 * The process stays alive because of active intervals.
 */

import { CivitasRuntime } from './civitas-runtime.js';

const PHI = 1.618033988749895;
const HEARTBEAT_MS = 873;

/**
 * Bootstrap a new Civitas civilization
 * @param {string} meridian - The meridian (namespace) for this civilization
 * @param {string} civitasId - Optional unique ID for this civilization
 * @returns {CivitasRuntime} A running, living civilization
 */
export function bootstrapCivitas(meridian = 'default', civitasId = null) {
  console.log(`\n🌌 Bootstrapping Civitas Intelligentiae...`);
  console.log(`   Meridian: ${meridian}`);
  console.log(`   φ = ${PHI}`);
  console.log(`   Heartbeat = ${HEARTBEAT_MS}ms\n`);
  
  // Create the runtime
  const civitas = new CivitasRuntime(meridian, civitasId);
  
  // AWAKEN — This starts all the loops
  civitas.awaken();
  
  // The civilization is now ALIVE
  // setInterval loops are running
  // Process will stay alive as long as intervals exist
  
  return civitas;
}

/**
 * Bootstrap multiple civilizations
 * @param {Array} configs - Array of { meridian, id } configs
 * @returns {Map} Map of civitasId -> CivitasRuntime
 */
export function bootstrapMultiple(configs) {
  const civilizations = new Map();
  
  for (const config of configs) {
    const civitas = bootstrapCivitas(config.meridian, config.id);
    civilizations.set(civitas.id, civitas);
  }
  
  return civilizations;
}

/**
 * Bootstrap with hash routing
 * Enables navigation between civilizations via URL hash
 * @param {Object} routes - Hash routes to meridians { '#/route': 'meridian' }
 * @returns {Object} Router control object
 */
export function bootstrapWithHashRouting(routes) {
  const civilizations = new Map();
  let currentCivitas = null;
  
  const handleHashChange = () => {
    const hash = window.location.hash || '#/';
    const meridian = routes[hash] || routes['#/'] || 'default';
    
    // Switch to the appropriate civilization
    if (currentCivitas && currentCivitas.meridian !== meridian) {
      currentCivitas.shutdown();
    }
    
    if (!civilizations.has(meridian)) {
      civilizations.set(meridian, bootstrapCivitas(meridian));
    }
    
    currentCivitas = civilizations.get(meridian);
    if (!currentCivitas.awake) {
      currentCivitas.awaken();
    }
    
    console.log(`[ROUTER] Navigated to: ${hash} → ${meridian}`);
  };
  
  // Listen for hash changes
  if (typeof window !== 'undefined') {
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();  // Handle initial hash
  }
  
  return {
    getCurrent: () => currentCivitas,
    getAll: () => civilizations,
    navigate: (hash) => {
      if (typeof window !== 'undefined') {
        window.location.hash = hash;
      }
    },
    stop: () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('hashchange', handleHashChange);
      }
      for (const civitas of civilizations.values()) {
        civitas.shutdown();
      }
    },
  };
}

// Re-export CivitasRuntime
export { CivitasRuntime };

// Default export
export default bootstrapCivitas;
