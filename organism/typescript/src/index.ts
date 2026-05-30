import { OrganismState } from './organism-state.js';
import { Heartbeat } from './heartbeat.js';
import { KernelExecutor } from './kernel-executor.js';
import { EdgeSensor } from './edge-sensor.js';
import { CrossOrganismResonance } from './cross-organism-resonance.js';
import { VitalityCalculator } from './vitality.js';
import { PHI, GOLDEN_ANGLE, HEARTBEAT_MS } from './types.js';

// ─── Re-export all modules ─────────────────────────────────────────────────
export { OrganismState } from './organism-state.js';
export { Heartbeat } from './heartbeat.js';
export { KernelExecutor } from './kernel-executor.js';
export { EdgeSensor } from './edge-sensor.js';
export { CrossOrganismResonance } from './cross-organism-resonance.js';
export { VitalityCalculator } from './vitality.js';
export * from './types.js';

// ─── Bootstrap the Organism ─────────────────────────────────────────────────

const ORGANISM_ID = `organism-${Date.now().toString(36)}`;

console.log(`\n╔══════════════════════════════════════════════════════════╗`);
console.log(`║  SOVEREIGN ORGANISM RUNTIME — TypeScript                ║`);
console.log(`║  ID:        ${ORGANISM_ID.padEnd(43)}║`);
console.log(`║  Heartbeat: ${HEARTBEAT_MS}ms                                      ║`);
console.log(`║  PHI:       ${PHI}                         ║`);
console.log(`║  Angle:     ${GOLDEN_ANGLE}°                                   ║`);
console.log(`╚══════════════════════════════════════════════════════════╝\n`);

// 1. State
const state = new OrganismState();

// 2. Heartbeat
const heartbeat = new Heartbeat(state);

// 3. Kernel Executor
const kernelExecutor = new KernelExecutor(heartbeat);

// 4. Edge Sensors
const edgeSensor = new EdgeSensor();

// 5. Cross-Organism Resonance
const resonance = new CrossOrganismResonance(ORGANISM_ID);

// 6. Vitality Calculator
const vitality = new VitalityCalculator();

// ─── Register Default Sensors ───────────────────────────────────────────────

edgeSensor.registerSensor(
  {
    id: 'cpu-temp',
    name: 'CPU Temperature',
    type: 'temperature',
    pollIntervalMs: HEARTBEAT_MS * 2,
    thresholdMin: 30,
    thresholdMax: 85,
    calibrationOffset: 0,
  },
  () => 40 + Math.random() * 30
);

edgeSensor.registerSensor(
  {
    id: 'net-latency',
    name: 'Network Latency',
    type: 'network',
    pollIntervalMs: HEARTBEAT_MS * 3,
    thresholdMin: 0,
    thresholdMax: 200,
    calibrationOffset: 0,
  },
  () => Math.random() * 150
);

edgeSensor.registerSensor(
  {
    id: 'mem-usage',
    name: 'Memory Usage',
    type: 'resource',
    pollIntervalMs: HEARTBEAT_MS,
    thresholdMin: 0,
    thresholdMax: 0.9,
    calibrationOffset: 0,
  },
  () => {
    const mem = process.memoryUsage();
    return mem.heapUsed / mem.heapTotal;
  }
);

edgeSensor.registerSensor(
  {
    id: 'phi-signal',
    name: 'Phi Resonance Signal',
    type: 'signal',
    pollIntervalMs: HEARTBEAT_MS * 5,
    thresholdMin: 0,
    thresholdMax: PHI,
    calibrationOffset: 0,
  },
  () => Math.random() * PHI
);

// ─── Load Sample Kernels ────────────────────────────────────────────────────

// Cognitive evolution kernel: adjusts reasoning based on phi harmonics
kernelExecutor.loadKernel(
  {
    id: 'cognitive-evolution',
    name: 'Cognitive Evolution',
    timeoutMs: 500,
    priority: 1,
    runOnBeat: true,
    beatInterval: 5,
  },
  async (snap, beatNum) => {
    const phiFactor = Math.sin(beatNum / PHI) * 0.05;
    state.setRegister('cognitive', {
      reasoning: Math.max(0, Math.min(1, snap.cognitive.reasoning + phiFactor)),
      pattern_recognition: Math.max(
        0,
        Math.min(1, snap.cognitive.pattern_recognition + phiFactor * (PHI - 1))
      ),
      abstraction: snap.cognitive.abstraction,
      memory_integration: Math.max(
        0,
        Math.min(1, snap.cognitive.memory_integration + phiFactor * 0.5)
      ),
    });
    return { evolved: true, phiFactor };
  }
);

// Affective coherence kernel: maintains emotional equilibrium
kernelExecutor.loadKernel(
  {
    id: 'affective-coherence',
    name: 'Affective Coherence',
    timeoutMs: 300,
    priority: 2,
    runOnBeat: true,
    beatInterval: 3,
  },
  async (snap) => {
    const targetCoherence = PHI - 1; // 0.618…
    const drift = (targetCoherence - snap.affective.coherence) * 0.1;
    state.setRegister('affective', {
      valence: snap.affective.valence * 0.99,
      arousal: snap.affective.arousal * 0.98 + 0.01,
      coherence: snap.affective.coherence + drift,
      resonance: snap.affective.resonance,
    });
    return { coherenceDrift: drift };
  }
);

// Sovereignty integrity kernel: ensures sovereign register maintains phi alignment
kernelExecutor.loadKernel(
  {
    id: 'sovereignty-check',
    name: 'Sovereignty Integrity',
    timeoutMs: 200,
    priority: 0,
    runOnBeat: true,
    beatInterval: 10,
  },
  async (snap) => {
    const phiDrift = Math.abs(snap.sovereign.phi_ratio - PHI);
    if (phiDrift > 0.001) {
      state.setRegister('sovereign', {
        ...snap.sovereign,
        phi_ratio: PHI,
        integrity: Math.max(0, snap.sovereign.integrity - phiDrift),
      });
    }
    return { phiDrift, corrected: phiDrift > 0.001 };
  }
);

// ─── Heartbeat Logger ───────────────────────────────────────────────────────

heartbeat.onBeat(async (payload) => {
  // Read sensors and compute vitality every 5 beats
  if (payload.beatNumber % 5 === 0) {
    const readings = await edgeSensor.readAll();
    const score = vitality.calculateVitality(payload.state, readings);

    const kernels = kernelExecutor.listKernels();
    const field = resonance.getResonanceField();

    console.log(
      `[Beat ${String(payload.beatNumber).padStart(6)}] ` +
        `φ-phase: ${payload.phiPhase.toFixed(1).padStart(6)}° | ` +
        `Vitality: ${(score.overall * 100).toFixed(1).padStart(5)}% | ` +
        `φ-harmony: ${(score.phiHarmony * 100).toFixed(1).padStart(5)}% | ` +
        `Sensors: ${readings.length} | ` +
        `Kernels: ${kernels.length} | ` +
        `Peers: ${field.peers.length}`
    );
  }
});

// ─── Graceful Shutdown ──────────────────────────────────────────────────────

function shutdown(): void {
  console.log(`\n⚡ Organism ${ORGANISM_ID} shutting down...`);
  console.log(`   Total beats: ${heartbeat.getBeatCount()}`);
  console.log(`   Uptime: ${(heartbeat.getUptime() / 1000).toFixed(1)}s`);

  heartbeat.stop();
  edgeSensor.stopAllPolling();

  console.log(`   Status: DORMANT\n`);
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// ─── Start the Organism ─────────────────────────────────────────────────────

console.log('🫀 Starting heartbeat...');
heartbeat.start();
console.log(`🫀 Organism is ALIVE — beating every ${HEARTBEAT_MS}ms\n`);
