/**
 * @medina/medina-timers - Sacred Geometry
 * 
 * Timer implementations based on sacred geometric principles:
 * Fibonacci sequences, phi oscillators, golden angle rotation,
 * Metatron's cube routing, and multi-heart generators.
 */

const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;
const PHI_SQ = PHI * PHI;
const GOLDEN_ANGLE = 137.508; // degrees
const HEARTBEAT = 873;

// ═══════════════════════════════════════════════════════════════════════════
// FIBONACCI TIMERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Fibonacci sequence timer
 * Intervals follow Fibonacci sequence: 1, 1, 2, 3, 5, 8, 13, 21, 34, 55...
 */
export function createFibonacciTimer(callback, options = {}) {
  const baseMs = options.baseMs || HEARTBEAT;
  const maxFib = options.maxFib || 21; // Reset after this Fibonacci number
  
  let fib = [1, 1];
  let index = 0;
  let timerId = null;
  
  function tick() {
    const currentFib = fib[index];
    
    callback({
      timer: 'fibonacci',
      index,
      fibonacci: currentFib,
      ratio: index > 0 ? fib[index] / fib[Math.max(0, index - 1)] : 1,
      goldenApprox: index > 5 ? fib[index] / fib[index - 1] : 1,
      timestamp: Date.now(),
      phiPhase: (currentFib * PHI) % 1,
    });
    
    // Move to next Fibonacci
    index++;
    if (index >= fib.length) {
      fib.push(fib[fib.length - 1] + fib[fib.length - 2]);
    }
    
    // Reset if exceeded maxFib
    if (fib[index] > maxFib) {
      index = 0;
      fib = [1, 1];
    }
    
    // Schedule next tick with Fibonacci interval
    timerId = setTimeout(tick, baseMs * fib[index]);
  }
  
  // Start the timer
  timerId = setTimeout(tick, baseMs);
  
  // Return control object
  return {
    stop: () => clearTimeout(timerId),
    getId: () => timerId,
  };
}

/**
 * Fibonacci spiral timer (2D position tracking)
 */
export function createFibonacciSpiralTimer(callback, options = {}) {
  const baseMs = options.baseMs || HEARTBEAT;
  const interval = baseMs * PHI;
  
  let step = 0;
  let x = 0, y = 0;
  let fibA = 1, fibB = 1;
  
  return setInterval(() => {
    step++;
    
    // Fibonacci spiral coordinates
    const angle = step * GOLDEN_ANGLE * Math.PI / 180;
    const radius = Math.sqrt(step) * PHI;
    x = radius * Math.cos(angle);
    y = radius * Math.sin(angle);
    
    // Update Fibonacci
    const nextFib = fibA + fibB;
    fibA = fibB;
    fibB = nextFib;
    
    callback({
      timer: 'fibonacci-spiral',
      step,
      x, y,
      angle: (step * GOLDEN_ANGLE) % 360,
      radius,
      fibonacci: fibB,
      timestamp: Date.now(),
      phiPhase: (step * PHI) % 1,
    });
  }, interval);
}

// ═══════════════════════════════════════════════════════════════════════════
// PHI OSCILLATOR TIMERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Phi oscillator - oscillates at golden ratio frequency
 */
export function createPhiOscillator(callback, options = {}) {
  const baseMs = options.baseMs || HEARTBEAT;
  const amplitude = options.amplitude || 1.0;
  const damping = options.damping || 0.999;
  
  let t = 0;
  let currentAmplitude = amplitude;
  
  return setInterval(() => {
    t += PHI_INV;
    currentAmplitude *= damping;
    
    // Phi-frequency oscillation
    const phiWave = Math.sin(t * PHI * 2 * Math.PI) * currentAmplitude;
    const phiInvWave = Math.cos(t * PHI_INV * 2 * Math.PI) * currentAmplitude;
    
    // Combined resonance
    const resonance = (phiWave + phiInvWave) / 2;
    
    callback({
      timer: 'phi-oscillator',
      t,
      phiWave,
      phiInvWave,
      resonance,
      amplitude: currentAmplitude,
      frequency: PHI,
      timestamp: Date.now(),
      phiPhase: t % 1,
    });
  }, baseMs);
}

/**
 * Dual phi oscillator with phase coupling (Kuramoto-inspired)
 */
export function createDualPhiOscillator(callback, options = {}) {
  const baseMs = options.baseMs || HEARTBEAT;
  const coupling = options.coupling || PHI_INV;
  
  let theta1 = 0;
  let theta2 = Math.PI; // Start in antiphase
  const omega1 = PHI;
  const omega2 = PHI_INV;
  
  return setInterval(() => {
    // Kuramoto model phase coupling
    const phaseDiff = theta2 - theta1;
    const coupling1 = coupling * Math.sin(phaseDiff);
    const coupling2 = coupling * Math.sin(-phaseDiff);
    
    theta1 += omega1 + coupling1;
    theta2 += omega2 + coupling2;
    
    // Wrap to [0, 2π]
    theta1 = theta1 % (2 * Math.PI);
    theta2 = theta2 % (2 * Math.PI);
    
    const coherence = Math.cos(phaseDiff);
    const emergence = coherence > PHI_INV ? (coherence - PHI_INV) / (1 - PHI_INV) : 0;
    
    callback({
      timer: 'dual-phi-oscillator',
      theta1, theta2,
      phaseDiff,
      coherence,
      emergence,
      synchronized: Math.abs(phaseDiff) < 0.1 || Math.abs(phaseDiff - 2 * Math.PI) < 0.1,
      timestamp: Date.now(),
      phiPhase: (theta1 * PHI) % 1,
    });
  }, baseMs);
}

// ═══════════════════════════════════════════════════════════════════════════
// GOLDEN ANGLE ROTATION TIMERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Golden angle rotation timer
 * Each tick rotates by 137.508° (golden angle)
 */
export function createGoldenAngleRotator(callback, options = {}) {
  const baseMs = options.baseMs || HEARTBEAT;
  const positions = options.positions || 12; // Number of positions before reset
  
  let step = 0;
  let angle = 0;
  
  return setInterval(() => {
    step++;
    angle = (step * GOLDEN_ANGLE) % 360;
    
    // Convert to radians for calculations
    const radians = angle * Math.PI / 180;
    const x = Math.cos(radians);
    const y = Math.sin(radians);
    
    // Position index (which "slot" we're in)
    const positionIndex = Math.floor(angle / (360 / positions));
    
    callback({
      timer: 'golden-angle-rotator',
      step,
      angle,
      radians,
      x, y,
      positionIndex,
      positions,
      revolution: Math.floor(step * GOLDEN_ANGLE / 360),
      timestamp: Date.now(),
      phiPhase: (angle / 360 * PHI) % 1,
    });
  }, baseMs);
}

/**
 * Phyllotaxis timer (plant-like spiral pattern)
 */
export function createPhyllotaxisTimer(callback, options = {}) {
  const baseMs = options.baseMs || HEARTBEAT;
  const scaleFactor = options.scaleFactor || 10;
  
  let n = 0;
  
  return setInterval(() => {
    n++;
    
    // Phyllotaxis formula
    const angle = n * GOLDEN_ANGLE * Math.PI / 180;
    const radius = scaleFactor * Math.sqrt(n);
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    
    // Vogel's model parameters
    const c = scaleFactor;
    const theta = n * GOLDEN_ANGLE;
    
    callback({
      timer: 'phyllotaxis',
      n,
      angle: theta % 360,
      radius,
      x, y,
      spiralArm: Math.floor(theta / 360) % 8, // Which spiral arm
      timestamp: Date.now(),
      phiPhase: (n * PHI) % 1,
    });
  }, baseMs);
}

// ═══════════════════════════════════════════════════════════════════════════
// METATRON'S CUBE ROUTER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Metatron's cube router - 13 circles, 78 lines
 * Routes through the sacred geometry pattern
 */
export function createMetatronRouter(callback, options = {}) {
  const baseMs = options.baseMs || HEARTBEAT;
  
  // 13 positions in Metatron's cube
  const positions = [
    { name: 'Center', x: 0, y: 0 },
    { name: 'North', x: 0, y: 2 },
    { name: 'NorthEast', x: Math.sqrt(3), y: 1 },
    { name: 'SouthEast', x: Math.sqrt(3), y: -1 },
    { name: 'South', x: 0, y: -2 },
    { name: 'SouthWest', x: -Math.sqrt(3), y: -1 },
    { name: 'NorthWest', x: -Math.sqrt(3), y: 1 },
    // Outer ring
    { name: 'OuterNorth', x: 0, y: 4 },
    { name: 'OuterNE', x: 2 * Math.sqrt(3), y: 2 },
    { name: 'OuterSE', x: 2 * Math.sqrt(3), y: -2 },
    { name: 'OuterSouth', x: 0, y: -4 },
    { name: 'OuterSW', x: -2 * Math.sqrt(3), y: -2 },
    { name: 'OuterNW', x: -2 * Math.sqrt(3), y: 2 },
  ];
  
  // Platonic solids encoded in the cube
  const platonic = ['Tetrahedron', 'Cube', 'Octahedron', 'Icosahedron', 'Dodecahedron'];
  
  let step = 0;
  let currentPos = 0;
  
  return setInterval(() => {
    step++;
    
    // Move through positions using golden angle
    const nextPosFloat = (currentPos + GOLDEN_ANGLE / 360 * 13) % 13;
    currentPos = Math.floor(nextPosFloat);
    
    const pos = positions[currentPos];
    const platonicIndex = step % 5;
    
    callback({
      timer: 'metatron-router',
      step,
      position: pos.name,
      positionIndex: currentPos,
      x: pos.x,
      y: pos.y,
      platonic: platonic[platonicIndex],
      isCenter: currentPos === 0,
      isInner: currentPos > 0 && currentPos < 7,
      isOuter: currentPos >= 7,
      timestamp: Date.now(),
      phiPhase: (step * PHI / 13) % 1,
    });
  }, baseMs * PHI);
}

// ═══════════════════════════════════════════════════════════════════════════
// MULTI-HEART GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Multi-heart generator - creates and manages multiple heartbeat timers
 * Each heart runs at a phi-scaled frequency
 */
export function createMultiHeartGenerator(heartCount, callback, options = {}) {
  const baseMs = options.baseMs || HEARTBEAT;
  const hearts = [];
  
  for (let i = 0; i < heartCount; i++) {
    // Each heart has a phi-scaled frequency
    const heartFrequency = baseMs * Math.pow(PHI, i - heartCount / 2);
    
    const heart = {
      id: `heart-${i}`,
      frequency: heartFrequency,
      beatCount: 0,
      phase: i * (2 * Math.PI / heartCount), // Distributed phases
      lastBeat: Date.now(),
      timer: null,
    };
    
    heart.timer = setInterval(() => {
      heart.beatCount++;
      heart.lastBeat = Date.now();
      
      // Calculate collective coherence
      const now = Date.now();
      const phases = hearts.map(h => {
        const timeSinceBeat = now - h.lastBeat;
        return (timeSinceBeat / h.frequency * 2 * Math.PI) % (2 * Math.PI);
      });
      
      // Kuramoto order parameter
      const sumCos = phases.reduce((acc, p) => acc + Math.cos(p), 0);
      const sumSin = phases.reduce((acc, p) => acc + Math.sin(p), 0);
      const orderParameter = Math.sqrt(sumCos * sumCos + sumSin * sumSin) / heartCount;
      
      callback({
        timer: 'multi-heart',
        heartId: heart.id,
        heartIndex: i,
        beatCount: heart.beatCount,
        frequency: heart.frequency,
        phase: phases[i],
        collectiveCoherence: orderParameter,
        emergence: orderParameter > PHI_INV,
        totalHearts: heartCount,
        timestamp: now,
        phiPhase: (heart.beatCount * PHI) % 1,
      });
    }, heartFrequency);
    
    hearts.push(heart);
  }
  
  return {
    hearts,
    stop: () => hearts.forEach(h => clearInterval(h.timer)),
    getCoherence: () => {
      const now = Date.now();
      const phases = hearts.map(h => {
        const timeSinceBeat = now - h.lastBeat;
        return (timeSinceBeat / h.frequency * 2 * Math.PI) % (2 * Math.PI);
      });
      const sumCos = phases.reduce((acc, p) => acc + Math.cos(p), 0);
      const sumSin = phases.reduce((acc, p) => acc + Math.sin(p), 0);
      return Math.sqrt(sumCos * sumCos + sumSin * sumSin) / heartCount;
    },
  };
}

/**
 * Creates a sacred geometry timer suite for an agent
 */
export function createSacredGeometrySuite(agentId, options = {}) {
  const baseMs = options.baseMs || HEARTBEAT;
  const timers = {};
  
  return {
    agentId,
    
    startGoldenAngle: (callback) => {
      timers.goldenAngle = createGoldenAngleRotator(callback, { baseMs });
      return timers.goldenAngle;
    },
    
    startPhiOscillator: (callback) => {
      timers.phiOscillator = createPhiOscillator(callback, { baseMs });
      return timers.phiOscillator;
    },
    
    startFibonacci: (callback) => {
      timers.fibonacci = createFibonacciTimer(callback, { baseMs });
      return timers.fibonacci;
    },
    
    startMetatron: (callback) => {
      timers.metatron = createMetatronRouter(callback, { baseMs });
      return timers.metatron;
    },
    
    startPhyllotaxis: (callback) => {
      timers.phyllotaxis = createPhyllotaxisTimer(callback, { baseMs });
      return timers.phyllotaxis;
    },
    
    stopAll: () => {
      Object.values(timers).forEach(t => {
        if (t && typeof t === 'number') clearInterval(t);
        if (t && t.stop) t.stop();
      });
    },
    
    getActiveTimers: () => Object.keys(timers).filter(k => timers[k]),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export default {
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
};
