/**
 * Sovereign Organism — Web Worker Heartbeat Engine
 *
 * Golden-ratio driven heartbeat at 873ms.
 * Maintains 4 registers: cognitive, affective, somatic, sovereign.
 * Broadcasts full state to the main thread on every beat.
 */

const PHI = 1.618033988749895;
const GOLDEN_ANGLE = 137.508;
const HEARTBEAT = 873;

/* ── state ───────────────────────────────────────────────────────── */
let beatCount = 0;
let running = false;
let intervalId = null;

const registers = {
  cognitive: { attention: 0.72, reasoning: 0.68, memory: 0.75, creativity: 0.60 },
  affective: { valence: 0.65, arousal: 0.50, dominance: 0.58, empathy: 0.70 },
  somatic:   { energy: 0.80, tension: 0.30, rhythm: 0.73, resilience: 0.66 },
  sovereign: { autonomy: 0.85, coherence: 0.78, integrity: 0.82, emergence: 0.55 },
};

const sensors = {
  temperature: 36.6,
  network:     0.95,
  memory:      0.42,
  cpu:         0.35,
};

/* ── helpers ─────────────────────────────────────────────────────── */
function clamp(v, lo = 0, hi = 1) {
  return Math.max(lo, Math.min(hi, v));
}

function drift(value, beatIdx) {
  const d = Math.sin((beatIdx * GOLDEN_ANGLE * Math.PI) / 180) * 0.02;
  return clamp(value + d);
}

function driftRegister(reg, beatIdx) {
  const out = {};
  for (const key of Object.keys(reg)) {
    out[key] = drift(reg[key], beatIdx + key.length);
  }
  return out;
}

function updateSensors(beatIdx) {
  const t = beatIdx * 0.1;
  sensors.temperature = clamp(36.2 + Math.sin(t * 0.3) * 0.8 + Math.cos(t * PHI) * 0.3, 35.5, 38.5);
  sensors.network     = clamp(0.90 + Math.sin(t * 0.7) * 0.08, 0, 1);
  sensors.memory      = clamp(0.40 + Math.sin(t * 0.2) * 0.15 + beatIdx * 0.0001, 0, 1);
  sensors.cpu         = clamp(0.30 + Math.sin(t * 1.1) * 0.20 + Math.cos(t * 0.5) * 0.05, 0, 1);
}

function vitality() {
  const weights = { cognitive: 1 / PHI, affective: 1, somatic: PHI, sovereign: PHI * PHI };
  let totalW = 0;
  let totalV = 0;
  for (const [name, reg] of Object.entries(registers)) {
    const vals = Object.values(reg);
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    totalV += avg * weights[name];
    totalW += weights[name];
  }
  return clamp(totalV / totalW);
}

function vitalityStatus(v) {
  if (v >= 0.80) return "thriving";
  if (v >= 0.65) return "healthy";
  if (v >= 0.50) return "stressed";
  if (v >= 0.35) return "degraded";
  return "critical";
}

/* ── heartbeat ───────────────────────────────────────────────────── */
function beat() {
  beatCount++;

  registers.cognitive = driftRegister(registers.cognitive, beatCount);
  registers.affective = driftRegister(registers.affective, beatCount);
  registers.somatic   = driftRegister(registers.somatic, beatCount);
  registers.sovereign = driftRegister(registers.sovereign, beatCount);

  updateSensors(beatCount);

  const v = vitality();

  self.postMessage({
    type: "heartbeat",
    beatCount,
    registers: JSON.parse(JSON.stringify(registers)),
    sensors: { ...sensors },
    vitality: v,
    vitalityStatus: vitalityStatus(v),
    timestamp: Date.now(),
    phi: PHI,
    goldenAngle: GOLDEN_ANGLE,
    heartbeatMs: HEARTBEAT,
  });
}

function start() {
  if (running) return;
  running = true;
  beat();
  intervalId = setInterval(beat, HEARTBEAT);
  self.postMessage({ type: "started" });
}

function stop() {
  if (!running) return;
  running = false;
  clearInterval(intervalId);
  intervalId = null;
  self.postMessage({ type: "stopped" });
}

/* ── message handler ─────────────────────────────────────────────── */
self.onmessage = function (e) {
  const msg = e.data;
  switch (msg.type) {
    case "start":
      start();
      break;
    case "stop":
      stop();
      break;
    case "getState":
      self.postMessage({
        type: "state",
        beatCount,
        running,
        registers: JSON.parse(JSON.stringify(registers)),
        sensors: { ...sensors },
        vitality: vitality(),
        vitalityStatus: vitalityStatus(vitality()),
      });
      break;
    case "fuseReasoning": {
      const v = vitality();
      self.postMessage({
        type: "fuseResult",
        result: {
          fused: true,
          vitality: v,
          status: vitalityStatus(v),
          phi: PHI,
          beatCount,
        },
      });
      break;
    }
    case "routeToAlpha":
      self.postMessage({
        type: "alphaRouted",
        payload: msg.payload || null,
        beatCount,
      });
      break;
    default:
      self.postMessage({ type: "error", message: "Unknown command: " + msg.type });
  }
};
