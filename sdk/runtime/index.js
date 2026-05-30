/**
 * RUNTIME INDEX
 * 
 * The runtime layer provides:
 *   - CivitasRuntime: The coordinator that creates and wires everything
 *   - bootstrapCivitas: One-call activation function
 *   - Hash routing: Navigate between civilizations
 */

export { CivitasRuntime } from './civitas-runtime.js';
export { bootstrapCivitas, bootstrapMultiple, bootstrapWithHashRouting } from './bootstrap.js';

// Default export is the bootstrap function
export { default } from './bootstrap.js';
