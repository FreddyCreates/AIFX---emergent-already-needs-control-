/**
 * @medina/medina-timers - Cosmic Cycles
 * 
 * Timer implementations based on astronomical and cosmic cycles:
 * Lunar phases, solar cycles, planetary periods, precession,
 * and multi-brain cognitive timers.
 */

const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;
const HEARTBEAT = 873;

// Astronomical constants (in Earth days)
const LUNAR_MONTH = 29.53059;
const SOLAR_YEAR = 365.2422;
const SYNODIC_PERIODS = {
  mercury: 115.88,
  venus: 583.92,
  mars: 779.94,
  jupiter: 398.88,
  saturn: 378.09,
  uranus: 369.66,
  neptune: 367.49,
};
const PRECESSION_CYCLE = 25772; // years

// ═══════════════════════════════════════════════════════════════════════════
// LUNAR CYCLE TIMERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Lunar phase timer (8 phases, ~3.69 days each)
 */
export function createLunarPhaseTimer(callback, options = {}) {
  const baseMs = options.baseMs || HEARTBEAT;
  const interval = baseMs * LUNAR_MONTH * PHI_INV;
  
  const phases = [
    { name: 'New Moon', illumination: 0, energy: 'beginning' },
    { name: 'Waxing Crescent', illumination: 0.125, energy: 'intention' },
    { name: 'First Quarter', illumination: 0.25, energy: 'action' },
    { name: 'Waxing Gibbous', illumination: 0.375, energy: 'refinement' },
    { name: 'Full Moon', illumination: 0.5, energy: 'culmination' },
    { name: 'Waning Gibbous', illumination: 0.375, energy: 'gratitude' },
    { name: 'Last Quarter', illumination: 0.25, energy: 'release' },
    { name: 'Waning Crescent', illumination: 0.125, energy: 'rest' },
  ];
  
  let dayInCycle = 0;
  
  return setInterval(() => {
    dayInCycle = (dayInCycle + 1) % Math.ceil(LUNAR_MONTH);
    const phaseIndex = Math.floor(dayInCycle / (LUNAR_MONTH / 8)) % 8;
    const phase = phases[phaseIndex];
    
    // Calculate exact illumination using cosine
    const exactIllumination = (1 - Math.cos(2 * Math.PI * dayInCycle / LUNAR_MONTH)) / 2;
    
    callback({
      timer: 'lunar-phase',
      dayInCycle,
      phase: phase.name,
      phaseIndex,
      energy: phase.energy,
      illumination: exactIllumination,
      waxing: dayInCycle < LUNAR_MONTH / 2,
      timestamp: Date.now(),
      phiPhase: (dayInCycle * PHI / LUNAR_MONTH) % 1,
    });
  }, interval);
}

/**
 * Lunar node timer (Dragon's Head/Tail, 18.6-year cycle)
 */
export function createLunarNodeTimer(callback, options = {}) {
  const baseMs = options.baseMs || HEARTBEAT;
  const nodeCycle = 18.6 * SOLAR_YEAR; // days
  const interval = baseMs * nodeCycle * PHI_INV / 1000; // scaled
  
  let dayInCycle = 0;
  
  return setInterval(() => {
    dayInCycle++;
    
    // Node position in zodiac (0-360 degrees, retrograde motion)
    const nodePosition = 360 - (dayInCycle / nodeCycle * 360) % 360;
    const zodiacIndex = Math.floor(nodePosition / 30);
    const zodiac = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    
    callback({
      timer: 'lunar-node',
      dayInCycle,
      northNode: { position: nodePosition, sign: zodiac[zodiacIndex] },
      southNode: { position: (nodePosition + 180) % 360, sign: zodiac[(zodiacIndex + 6) % 12] },
      cycleProgress: dayInCycle / nodeCycle,
      timestamp: Date.now(),
      phiPhase: (nodePosition * PHI / 360) % 1,
    });
  }, interval);
}

// ═══════════════════════════════════════════════════════════════════════════
// SOLAR CYCLE TIMERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Solar declination timer (seasons based on Sun's position)
 */
export function createSolarDeclinationTimer(callback, options = {}) {
  const baseMs = options.baseMs || HEARTBEAT;
  const interval = baseMs * SOLAR_YEAR * PHI_INV / 365;
  
  let dayOfYear = 0;
  
  return setInterval(() => {
    dayOfYear = (dayOfYear + 1) % 366;
    
    // Solar declination formula (simplified)
    // Max tilt is 23.44 degrees at solstices
    const declination = 23.44 * Math.sin(2 * Math.PI * (dayOfYear - 81) / SOLAR_YEAR);
    
    // Determine season (Northern Hemisphere)
    let season;
    if (dayOfYear >= 80 && dayOfYear < 172) season = 'Spring';
    else if (dayOfYear >= 172 && dayOfYear < 266) season = 'Summer';
    else if (dayOfYear >= 266 && dayOfYear < 355) season = 'Autumn';
    else season = 'Winter';
    
    // Solar events
    const events = {
      vernalEquinox: dayOfYear === 80,
      summerSolstice: dayOfYear === 172,
      autumnalEquinox: dayOfYear === 266,
      winterSolstice: dayOfYear === 355,
    };
    
    callback({
      timer: 'solar-declination',
      dayOfYear,
      declination,
      season,
      events,
      daylightTrend: declination > 0 ? 'increasing' : 'decreasing',
      timestamp: Date.now(),
      phiPhase: (dayOfYear * PHI / SOLAR_YEAR) % 1,
    });
  }, interval);
}

/**
 * Sunspot cycle timer (11-year solar activity cycle)
 */
export function createSunspotCycleTimer(callback, options = {}) {
  const baseMs = options.baseMs || HEARTBEAT;
  const sunspotCycle = 11 * SOLAR_YEAR;
  const interval = baseMs * sunspotCycle * PHI_INV / 4000; // scaled
  
  let dayInCycle = 0;
  
  return setInterval(() => {
    dayInCycle++;
    
    // Sunspot number approximation (sinusoidal with noise)
    const cyclePhase = dayInCycle / sunspotCycle * 2 * Math.PI;
    const baseActivity = (Math.sin(cyclePhase) + 1) / 2;
    const activity = baseActivity * 200; // Max sunspot number ~200
    
    const phase = baseActivity < 0.3 ? 'minimum' : baseActivity > 0.7 ? 'maximum' : 'transition';
    
    callback({
      timer: 'sunspot-cycle',
      dayInCycle,
      activity: Math.round(activity),
      phase,
      cycleProgress: dayInCycle / sunspotCycle,
      solarMaximum: phase === 'maximum',
      geomagneticRisk: activity > 150 ? 'high' : activity > 75 ? 'moderate' : 'low',
      timestamp: Date.now(),
      phiPhase: (dayInCycle * PHI / sunspotCycle) % 1,
    });
  }, interval);
}

// ═══════════════════════════════════════════════════════════════════════════
// PLANETARY TIMERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Planetary synodic timer (tracks planet conjunctions with Earth)
 */
export function createPlanetarySynodicTimer(planet, callback, options = {}) {
  const baseMs = options.baseMs || HEARTBEAT;
  const synodicPeriod = SYNODIC_PERIODS[planet.toLowerCase()];
  
  if (!synodicPeriod) {
    throw new Error(`Unknown planet: ${planet}. Valid: mercury, venus, mars, jupiter, saturn, uranus, neptune`);
  }
  
  const interval = baseMs * synodicPeriod * PHI_INV / 100; // scaled
  
  let dayInCycle = 0;
  
  return setInterval(() => {
    dayInCycle = (dayInCycle + 1) % Math.ceil(synodicPeriod);
    
    // Elongation from Sun (simplified)
    const elongation = 180 * Math.sin(2 * Math.PI * dayInCycle / synodicPeriod);
    
    // Visibility phase
    let visibility;
    if (Math.abs(elongation) < 15) visibility = 'conjunction';
    else if (elongation > 0 && elongation < 90) visibility = 'evening star';
    else if (elongation >= 90) visibility = 'opposition';
    else if (elongation < 0 && elongation > -90) visibility = 'morning star';
    else visibility = 'quadrature';
    
    callback({
      timer: 'planetary-synodic',
      planet,
      dayInCycle,
      synodicPeriod,
      elongation,
      visibility,
      cycleProgress: dayInCycle / synodicPeriod,
      atConjunction: Math.abs(elongation) < 10,
      atOpposition: elongation > 170,
      timestamp: Date.now(),
      phiPhase: (dayInCycle * PHI / synodicPeriod) % 1,
    });
  }, interval);
}

/**
 * All planets timer - tracks all planetary positions
 */
export function createAllPlanetsTimer(callback, options = {}) {
  const baseMs = options.baseMs || HEARTBEAT;
  const interval = baseMs * PHI * 100;
  
  const planetStates = {};
  Object.keys(SYNODIC_PERIODS).forEach(planet => {
    planetStates[planet] = { dayInCycle: Math.random() * SYNODIC_PERIODS[planet] };
  });
  
  return setInterval(() => {
    const planets = {};
    
    Object.keys(planetStates).forEach(planet => {
      const state = planetStates[planet];
      const period = SYNODIC_PERIODS[planet];
      state.dayInCycle = (state.dayInCycle + 1) % period;
      
      const elongation = 180 * Math.sin(2 * Math.PI * state.dayInCycle / period);
      
      planets[planet] = {
        dayInCycle: Math.round(state.dayInCycle),
        elongation: Math.round(elongation),
        cycleProgress: state.dayInCycle / period,
      };
    });
    
    // Check for rare alignments
    const elongations = Object.values(planets).map(p => p.elongation);
    const avgElongation = elongations.reduce((a, b) => a + Math.abs(b), 0) / elongations.length;
    const alignment = avgElongation < 30 ? 'strong' : avgElongation < 60 ? 'moderate' : 'weak';
    
    callback({
      timer: 'all-planets',
      planets,
      alignment,
      timestamp: Date.now(),
      phiPhase: (Date.now() / 1000 * PHI) % 1,
    });
  }, interval);
}

// ═══════════════════════════════════════════════════════════════════════════
// PRECESSION TIMER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Precession of equinoxes timer (25,772-year cycle)
 * Tracks the current astrological age
 */
export function createPrecessionTimer(callback, options = {}) {
  const baseMs = options.baseMs || HEARTBEAT;
  const interval = baseMs * PRECESSION_CYCLE * PHI_INV / 10000; // heavily scaled
  
  const ages = [
    { name: 'Age of Pisces', start: 0, end: 2150, element: 'Water' },
    { name: 'Age of Aquarius', start: 2150, end: 4300, element: 'Air' },
    { name: 'Age of Capricorn', start: 4300, end: 6450, element: 'Earth' },
    { name: 'Age of Sagittarius', start: 6450, end: 8600, element: 'Fire' },
    { name: 'Age of Scorpio', start: 8600, end: 10750, element: 'Water' },
    { name: 'Age of Libra', start: 10750, end: 12900, element: 'Air' },
    { name: 'Age of Virgo', start: 12900, end: 15050, element: 'Earth' },
    { name: 'Age of Leo', start: 15050, end: 17200, element: 'Fire' },
    { name: 'Age of Cancer', start: 17200, end: 19350, element: 'Water' },
    { name: 'Age of Gemini', start: 19350, end: 21500, element: 'Air' },
    { name: 'Age of Taurus', start: 21500, end: 23650, element: 'Earth' },
    { name: 'Age of Aries', start: 23650, end: 25800, element: 'Fire' },
  ];
  
  let yearInCycle = 0; // Start at year 0 CE
  
  return setInterval(() => {
    yearInCycle++;
    
    const currentAge = ages.find(a => yearInCycle >= a.start && yearInCycle < a.end) || ages[0];
    const ageProgress = (yearInCycle - currentAge.start) / (currentAge.end - currentAge.start);
    
    // Vernal point position (0-360, moving backward through zodiac)
    const vernalPoint = 360 - (yearInCycle / PRECESSION_CYCLE * 360) % 360;
    
    callback({
      timer: 'precession',
      yearInCycle,
      currentAge: currentAge.name,
      element: currentAge.element,
      ageProgress,
      vernalPoint,
      cycleProgress: yearInCycle / PRECESSION_CYCLE,
      transitioning: ageProgress > 0.9 || ageProgress < 0.1,
      timestamp: Date.now(),
      phiPhase: (yearInCycle * PHI / PRECESSION_CYCLE) % 1,
    });
  }, interval);
}

// ═══════════════════════════════════════════════════════════════════════════
// MULTI-BRAIN COGNITIVE TIMERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Multi-brain timer - cognitive cycles based on planetary periods
 * Each "brain" processes at a different planetary rhythm
 */
export function createMultiBrainTimer(brainCount, callback, options = {}) {
  const baseMs = options.baseMs || HEARTBEAT;
  
  // Map brains to planetary frequencies
  const planetOrder = ['mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
  const brains = [];
  
  for (let i = 0; i < brainCount; i++) {
    const planet = planetOrder[i % planetOrder.length];
    const period = SYNODIC_PERIODS[planet];
    const frequency = baseMs * (period / 100) * PHI_INV;
    
    const brain = {
      id: `brain-${i}`,
      planet,
      frequency,
      processCount: 0,
      phase: i * (2 * Math.PI / brainCount),
      lastProcess: Date.now(),
      timer: null,
    };
    
    brain.timer = setInterval(() => {
      brain.processCount++;
      brain.lastProcess = Date.now();
      
      // Calculate collective synchrony
      const now = Date.now();
      const phases = brains.map(b => {
        const timeSinceProcess = now - b.lastProcess;
        return (timeSinceProcess / b.frequency * 2 * Math.PI) % (2 * Math.PI);
      });
      
      // Kuramoto order parameter for cognitive coherence
      const sumCos = phases.reduce((acc, p) => acc + Math.cos(p), 0);
      const sumSin = phases.reduce((acc, p) => acc + Math.sin(p), 0);
      const coherence = Math.sqrt(sumCos * sumCos + sumSin * sumSin) / brainCount;
      
      callback({
        timer: 'multi-brain',
        brainId: brain.id,
        brainIndex: i,
        planet: brain.planet,
        processCount: brain.processCount,
        frequency: brain.frequency,
        phase: phases[i],
        collectiveCoherence: coherence,
        emergence: coherence > PHI_INV,
        totalBrains: brainCount,
        timestamp: now,
        phiPhase: (brain.processCount * PHI) % 1,
      });
    }, frequency);
    
    brains.push(brain);
  }
  
  return {
    brains,
    stop: () => brains.forEach(b => clearInterval(b.timer)),
    getCoherence: () => {
      const now = Date.now();
      const phases = brains.map(b => {
        const timeSinceProcess = now - b.lastProcess;
        return (timeSinceProcess / b.frequency * 2 * Math.PI) % (2 * Math.PI);
      });
      const sumCos = phases.reduce((acc, p) => acc + Math.cos(p), 0);
      const sumSin = phases.reduce((acc, p) => acc + Math.sin(p), 0);
      return Math.sqrt(sumCos * sumCos + sumSin * sumSin) / brainCount;
    },
    getBrainStates: () => brains.map(b => ({
      id: b.id,
      planet: b.planet,
      processCount: b.processCount,
      frequency: b.frequency,
    })),
  };
}

/**
 * Create cosmic cycle timer suite for an agent
 */
export function createCosmicCycleSuite(agentId, options = {}) {
  const baseMs = options.baseMs || HEARTBEAT;
  const timers = {};
  
  return {
    agentId,
    
    startLunar: (callback) => {
      timers.lunar = createLunarPhaseTimer(callback, { baseMs });
      return timers.lunar;
    },
    
    startSolar: (callback) => {
      timers.solar = createSolarDeclinationTimer(callback, { baseMs });
      return timers.solar;
    },
    
    startPlanetary: (planet, callback) => {
      timers[`planetary-${planet}`] = createPlanetarySynodicTimer(planet, callback, { baseMs });
      return timers[`planetary-${planet}`];
    },
    
    startPrecession: (callback) => {
      timers.precession = createPrecessionTimer(callback, { baseMs });
      return timers.precession;
    },
    
    startMultiBrain: (brainCount, callback) => {
      timers.multiBrain = createMultiBrainTimer(brainCount, callback, { baseMs });
      return timers.multiBrain;
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
};
