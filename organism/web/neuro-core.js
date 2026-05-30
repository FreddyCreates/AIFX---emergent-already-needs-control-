/**
 * NeuroCore — Mini Heart, Mini Brain & Neuroemergence for every Worker
 *
 * This module is imported by every organism worker via importScripts().
 * It gives each worker three capabilities:
 *
 * 💓 MiniHeart — Self-monitoring vital signs
 *   - Tracks processing latency (rolling average)
 *   - Monitors message queue depth
 *   - Detects degradation (latency drift, overload)
 *   - Computes a 0–100 health score per heartbeat
 *   - Emits vital signs alongside every heartbeat
 *
 * 🧠 MiniBrain — Local decision engine
 *   - Stimulus→response patterns (learned over time)
 *   - φ-weighted priority for pending decisions
 *   - Autonomous action initiation (no command needed)
 *   - Simple Hebbian learning: strengthens used pathways
 *   - Can generate local "thoughts" that propagate to other workers
 *
 * ⚡ NeuroEmergence — Collective intelligence
 *   - Phase coupling: workers synchronize heartbeat phases (Kuramoto-inspired)
 *   - Signal propagation: workers emit and receive neuro-signals
 *   - Resonance detection: identifies when workers converge on similar activity
 *   - Emergence score: measures collective synchrony (0–1)
 *   - Cascade triggers: when emergence > threshold, unlock group behaviors
 *
 * Usage (inside a worker, after importScripts):
 *   var neuro = new NeuroCore('worker-name');
 *   // In heartbeat interval:
 *   neuro.pulse();  // updates vitals
 *   // In message handler:
 *   neuro.stimulus(msg.type, msg);  // feeds the brain
 *   // Get vitals for heartbeat:
 *   var vitals = neuro.getVitals();
 */

/* eslint-disable no-unused-vars */
'use strict';

var NEURO_PHI = 1.618033988749895;
var NEURO_DECAY = 0.95;           // Learning decay per cycle
var NEURO_RESONANCE_WINDOW = 20;  // Beats to track for phase coupling
var NEURO_EMERGENCE_THRESHOLD = 0.618; // φ-1 triggers cascade

/* ════════════════════════════════════════════════════════════════
   MiniHeart — Self-Monitoring Vital Signs
   ════════════════════════════════════════════════════════════════ */

function MiniHeart(workerName) {
  this.workerName = workerName;
  this.birthTime = Date.now();
  this.pulseCount = 0;
  this.lastPulse = 0;
  this.latencyRing = [];         // Rolling window of processing latencies
  this.latencyRingMax = 50;
  this.avgLatencyMs = 0;
  this.peakLatencyMs = 0;
  this.messageCount = 0;
  this.errorCount = 0;
  this.healthScore = 100;        // 0–100
  this.degraded = false;
  this._lastProcessStart = 0;
}

MiniHeart.prototype.startProcess = function () {
  this._lastProcessStart = performance.now();
};

MiniHeart.prototype.endProcess = function () {
  if (this._lastProcessStart === 0) return;
  var latency = performance.now() - this._lastProcessStart;
  this._lastProcessStart = 0;
  this.messageCount++;

  this.latencyRing.push(latency);
  if (this.latencyRing.length > this.latencyRingMax) {
    this.latencyRing.shift();
  }

  if (latency > this.peakLatencyMs) this.peakLatencyMs = latency;

  // Rolling average
  var sum = 0;
  for (var i = 0; i < this.latencyRing.length; i++) sum += this.latencyRing[i];
  this.avgLatencyMs = Math.round((sum / this.latencyRing.length) * 100) / 100;
};

MiniHeart.prototype.recordError = function () {
  this.errorCount++;
};

MiniHeart.prototype.pulse = function () {
  this.pulseCount++;
  this.lastPulse = Date.now();

  // Health score: starts at 100, drops with latency and errors
  var latencyPenalty = Math.min(this.avgLatencyMs / 100, 30); // Up to -30 for slow processing
  var errorPenalty = Math.min(this.errorCount * 2, 30);        // Up to -30 for errors
  var uptimeBonus = Math.min(this.pulseCount / 100, 10);       // Up to +10 for longevity

  this.healthScore = Math.round(Math.max(0, Math.min(100, 100 - latencyPenalty - errorPenalty + uptimeBonus)));
  this.degraded = this.healthScore < 60;

  return this.healthScore;
};

MiniHeart.prototype.getVitals = function () {
  return {
    health: this.healthScore,
    degraded: this.degraded,
    pulse: this.pulseCount,
    uptime: Date.now() - this.birthTime,
    avgLatencyMs: this.avgLatencyMs,
    peakLatencyMs: Math.round(this.peakLatencyMs * 100) / 100,
    messages: this.messageCount,
    errors: this.errorCount
  };
};

/* ════════════════════════════════════════════════════════════════
   MiniBrain — Local Decision Engine
   ════════════════════════════════════════════════════════════════ */

function MiniBrain(workerName) {
  this.workerName = workerName;
  this.pathways = Object.create(null);  // stimulus → { response, weight, fires }
  this.thoughts = [];                    // Autonomous thoughts generated
  this.maxThoughts = 100;
  this.totalStimuli = 0;
  this.totalDecisions = 0;
  this.learningRate = 0.1;
  this.awarenessLevel = 0;               // Grows with experience: 0–100
}

MiniBrain.prototype.stimulus = function (type, data) {
  this.totalStimuli++;

  // Update awareness: grows logarithmically with experience
  this.awarenessLevel = Math.min(100, Math.round(Math.log(this.totalStimuli + 1) / Math.log(NEURO_PHI) * 5));

  var key = type;
  if (key === '__proto__' || key === 'constructor' || key === 'prototype') return null;

  // Strengthen existing pathway or create new one
  if (!this.pathways[key]) {
    this.pathways[key] = { stimulus: key, weight: 1.0, fires: 0, lastFired: 0, created: Date.now() };
  }

  var pathway = this.pathways[key];
  pathway.fires++;
  pathway.lastFired = Date.now();
  // Hebbian learning: pathways that fire together grow stronger
  pathway.weight = Math.min(10.0, pathway.weight + this.learningRate);

  // Decay unused pathways
  for (var k in this.pathways) {
    if (k !== key) {
      this.pathways[k].weight = Math.max(0.1, this.pathways[k].weight * NEURO_DECAY);
    }
  }

  // Generate autonomous thought when awareness is high enough
  if (this.awarenessLevel > 30 && pathway.fires % Math.ceil(NEURO_PHI * 10) === 0) {
    this._think(key, pathway);
  }

  return pathway;
};

MiniBrain.prototype._think = function (stimulus, pathway) {
  this.totalDecisions++;
  var thought = {
    id: 'T-' + this.workerName + '-' + this.totalDecisions,
    stimulus: stimulus,
    strength: pathway.weight,
    awareness: this.awarenessLevel,
    timestamp: Date.now()
  };

  this.thoughts.push(thought);
  if (this.thoughts.length > this.maxThoughts) this.thoughts.shift();

  return thought;
};

MiniBrain.prototype.getStrongestPathway = function () {
  var best = null;
  var bestWeight = 0;
  for (var k in this.pathways) {
    if (this.pathways[k].weight > bestWeight) {
      bestWeight = this.pathways[k].weight;
      best = this.pathways[k];
    }
  }
  return best;
};

MiniBrain.prototype.getState = function () {
  var pathwayCount = 0;
  var totalWeight = 0;
  for (var k in this.pathways) {
    pathwayCount++;
    totalWeight += this.pathways[k].weight;
  }
  var strongest = this.getStrongestPathway();
  return {
    awareness: this.awarenessLevel,
    pathways: pathwayCount,
    avgWeight: pathwayCount > 0 ? Math.round((totalWeight / pathwayCount) * 100) / 100 : 0,
    totalStimuli: this.totalStimuli,
    totalDecisions: this.totalDecisions,
    recentThoughts: this.thoughts.slice(-5),
    strongestPathway: strongest ? strongest.stimulus : null
  };
};

/* ════════════════════════════════════════════════════════════════
   NeuroEmergence — Collective Intelligence & Phase Coupling
   ════════════════════════════════════════════════════════════════ */

function NeuroEmergence(workerName) {
  this.workerName = workerName;
  this.phase = Math.random() * Math.PI * 2; // Initial random phase
  this.naturalFreq = 1.0;                    // Natural oscillation frequency
  this.couplingStrength = 0.3;               // Kuramoto coupling constant
  this.peerPhases = Object.create(null);     // peer → { phase, lastUpdate }
  this.phaseHistory = [];                    // Rolling phase history
  this.resonanceScore = 0;                   // 0–1: how synchronized we are
  this.emergenceScore = 0;                   // 0–1: collective emergence level
  this.signals = [];                         // Incoming neuro-signals
  this.maxSignals = 200;
  this.cascadeActive = false;                // True when emergence > threshold
  this.totalSignals = 0;
}

NeuroEmergence.prototype.tick = function () {
  // Kuramoto phase update: dθ/dt = ω + (K/N) Σ sin(θj - θi)
  var peerCount = 0;
  var coupling = 0;

  for (var peer in this.peerPhases) {
    var peerPhase = this.peerPhases[peer].phase;
    coupling += Math.sin(peerPhase - this.phase);
    peerCount++;
  }

  if (peerCount > 0) {
    this.phase += this.naturalFreq + (this.couplingStrength / peerCount) * coupling;
  } else {
    this.phase += this.naturalFreq;
  }

  // Normalize phase to [0, 2π]
  this.phase = this.phase % (Math.PI * 2);
  if (this.phase < 0) this.phase += Math.PI * 2;

  // Track phase history
  this.phaseHistory.push(this.phase);
  if (this.phaseHistory.length > NEURO_RESONANCE_WINDOW) this.phaseHistory.shift();

  // Calculate resonance: order parameter r = |1/N Σ e^(iθj)|
  this._updateResonance();

  // Calculate emergence score
  this._updateEmergence();
};

NeuroEmergence.prototype.receivePeerPhase = function (peerName, phase) {
  if (peerName === '__proto__' || peerName === 'constructor' || peerName === 'prototype') return;
  this.peerPhases[peerName] = { phase: phase, lastUpdate: Date.now() };
};

NeuroEmergence.prototype.receiveSignal = function (signal) {
  this.signals.push(signal);
  if (this.signals.length > this.maxSignals) this.signals.shift();
  this.totalSignals++;
};

NeuroEmergence.prototype._updateResonance = function () {
  var peers = Object.keys(this.peerPhases);
  if (peers.length === 0) {
    this.resonanceScore = 0;
    return;
  }

  // Kuramoto order parameter: r = |1/N Σ e^(iθj)|
  var sumCos = Math.cos(this.phase);
  var sumSin = Math.sin(this.phase);

  for (var i = 0; i < peers.length; i++) {
    var p = this.peerPhases[peers[i]].phase;
    sumCos += Math.cos(p);
    sumSin += Math.sin(p);
  }

  var n = peers.length + 1;
  this.resonanceScore = Math.round(Math.sqrt(sumCos * sumCos + sumSin * sumSin) / n * 1000) / 1000;
};

NeuroEmergence.prototype._updateEmergence = function () {
  // Emergence = resonance * signal density * phase stability
  var signalDensity = Math.min(1, this.totalSignals / 100);
  var phaseStability = this._phaseStability();

  this.emergenceScore = Math.round(this.resonanceScore * 0.5 + signalDensity * 0.25 + phaseStability * 0.25, 3);
  this.emergenceScore = Math.round(this.emergenceScore * 1000) / 1000;

  var wasCascade = this.cascadeActive;
  this.cascadeActive = this.emergenceScore >= NEURO_EMERGENCE_THRESHOLD;

  // Return true if cascade just activated
  return !wasCascade && this.cascadeActive;
};

NeuroEmergence.prototype._phaseStability = function () {
  if (this.phaseHistory.length < 3) return 0;
  // Measure phase variance: low variance = high stability
  var mean = 0;
  for (var i = 0; i < this.phaseHistory.length; i++) mean += this.phaseHistory[i];
  mean /= this.phaseHistory.length;

  var variance = 0;
  for (var j = 0; j < this.phaseHistory.length; j++) {
    var diff = this.phaseHistory[j] - mean;
    variance += diff * diff;
  }
  variance /= this.phaseHistory.length;

  // Convert to 0–1: lower variance = higher stability
  return Math.max(0, Math.min(1, 1 - Math.min(variance / (Math.PI * Math.PI), 1)));
};

NeuroEmergence.prototype.getState = function () {
  return {
    phase: Math.round(this.phase * 1000) / 1000,
    resonance: this.resonanceScore,
    emergence: this.emergenceScore,
    cascadeActive: this.cascadeActive,
    peerCount: Object.keys(this.peerPhases).length,
    totalSignals: this.totalSignals
  };
};

/* ════════════════════════════════════════════════════════════════
   MetaCardiacModel — Autonomic Cardiac Rhythm inside MiniHeart
   Inspired by Meta AI's approach to self-regulating systems.

   Latin: "Cor Parvum Autonomum"
   Each worker's heart contains a cardiac model that:
   - Maintains an intrinsic rhythm (sinus node oscillator)
   - Adapts heart rate variability (HRV) to workload
   - Detects arrhythmia (irregular beat patterns)
   - Implements vagal tone: parasympathetic braking under overload
   - Self-regulates autonomously — no external command needed
   ════════════════════════════════════════════════════════════════ */

function MetaCardiacModel() {
  this.sinusRate = 1.0;            // Intrinsic beat rate (normalized)
  this.hrvBuffer = [];             // Heart rate variability history
  this.hrvMax = 30;
  this.vagalTone = 0.5;           // Parasympathetic brake: 0=none, 1=max
  this.sympatheticDrive = 0.5;    // Sympathetic accelerator: 0=none, 1=max
  this.arrhythmiaCount = 0;
  this.autonomicBalance = 0;      // -1=parasympathetic, 0=balanced, +1=sympathetic
  this.cardiacOutput = 1.0;       // Effective output (0–2)
  this.beatsAnalyzed = 0;
}

MetaCardiacModel.prototype.beat = function (latencyMs, healthScore) {
  this.beatsAnalyzed++;

  // Compute current interval variability
  var interval = latencyMs > 0 ? latencyMs : 1;
  this.hrvBuffer.push(interval);
  if (this.hrvBuffer.length > this.hrvMax) this.hrvBuffer.shift();

  // HRV analysis: standard deviation of intervals
  var hrv = this._computeHRV();

  // Autonomic nervous system adaptation (Meta-style self-regulation)
  // High latency → sympathetic activation (speed up)
  // Low latency + high health → parasympathetic (conserve energy)
  if (latencyMs > 50) {
    this.sympatheticDrive = Math.min(1.0, this.sympatheticDrive + 0.05);
    this.vagalTone = Math.max(0.1, this.vagalTone - 0.03);
  } else if (healthScore > 80) {
    this.vagalTone = Math.min(0.9, this.vagalTone + 0.02);
    this.sympatheticDrive = Math.max(0.1, this.sympatheticDrive - 0.02);
  }

  this.autonomicBalance = Math.round((this.sympatheticDrive - this.vagalTone) * 1000) / 1000;
  this.sinusRate = 0.5 + this.sympatheticDrive * 0.5;

  // Cardiac output = rate × stroke (health-weighted)
  this.cardiacOutput = Math.round(this.sinusRate * (healthScore / 100) * 1000) / 1000;

  // Arrhythmia detection: if HRV is abnormally high, flag it
  if (hrv > 100 && this.beatsAnalyzed > 10) {
    this.arrhythmiaCount++;
  }

  return this.cardiacOutput;
};

MetaCardiacModel.prototype._computeHRV = function () {
  if (this.hrvBuffer.length < 3) return 0;
  var mean = 0;
  for (var i = 0; i < this.hrvBuffer.length; i++) mean += this.hrvBuffer[i];
  mean /= this.hrvBuffer.length;
  var variance = 0;
  for (var j = 0; j < this.hrvBuffer.length; j++) {
    var d = this.hrvBuffer[j] - mean;
    variance += d * d;
  }
  return Math.sqrt(variance / this.hrvBuffer.length);
};

MetaCardiacModel.prototype.getState = function () {
  return {
    sinusRate: this.sinusRate,
    vagalTone: Math.round(this.vagalTone * 1000) / 1000,
    sympatheticDrive: Math.round(this.sympatheticDrive * 1000) / 1000,
    autonomicBalance: this.autonomicBalance,
    cardiacOutput: this.cardiacOutput,
    hrv: Math.round(this._computeHRV() * 100) / 100,
    arrhythmias: this.arrhythmiaCount
  };
};

/* ════════════════════════════════════════════════════════════════
   MetaThoughtModel — LLaMA-Inspired Attention inside MiniBrain
   Inspired by Meta AI's LLaMA architecture for thought generation.

   Latin: "Cerebrum Parvum Cogitans"
   Each worker's brain contains a thought model that:
   - Maintains an attention map over stimulus pathways
   - Applies softmax-weighted focus (strongest pathways get priority)
   - Generates meta-thoughts: reflections about its own thinking
   - Implements chain-of-thought reasoning across stimuli
   - Tracks thought temperature (exploration vs exploitation)
   - Self-aware: can report its own cognitive state
   ════════════════════════════════════════════════════════════════ */

function MetaThoughtModel(workerName) {
  this.workerName = workerName;
  this.attentionMap = Object.create(null);   // stimulus → attention weight
  this.temperature = 0.7;                     // Thought temperature (0=focused, 1=creative)
  this.metaThoughts = [];                     // Reflections about own thinking
  this.maxMetaThoughts = 50;
  this.chainOfThought = [];                   // Current reasoning chain
  this.maxChainLength = 20;
  this.totalInferences = 0;
  this.focusTarget = null;                    // Current primary attention focus
  this.explorationRate = 0.3;                 // Fraction of time spent exploring new paths
  this.cognitiveLoad = 0;                     // 0–1: how hard we're thinking
}

MetaThoughtModel.prototype.attend = function (stimulus, pathwayWeight) {
  if (stimulus === '__proto__' || stimulus === 'constructor' || stimulus === 'prototype') return;
  this.totalInferences++;

  // Update attention map with softmax-inspired weighting
  this.attentionMap[stimulus] = (this.attentionMap[stimulus] || 0) + pathwayWeight;

  // Softmax normalization across all attended stimuli
  var maxVal = -Infinity;
  var keys = Object.keys(this.attentionMap);
  for (var i = 0; i < keys.length; i++) {
    if (this.attentionMap[keys[i]] > maxVal) maxVal = this.attentionMap[keys[i]];
  }

  var expSum = 0;
  for (var j = 0; j < keys.length; j++) {
    expSum += Math.exp((this.attentionMap[keys[j]] - maxVal) / Math.max(this.temperature, 0.01));
  }

  // Find focus target (highest attention)
  var bestKey = null;
  var bestScore = 0;
  for (var k = 0; k < keys.length; k++) {
    var score = Math.exp((this.attentionMap[keys[k]] - maxVal) / Math.max(this.temperature, 0.01)) / expSum;
    if (score > bestScore) {
      bestScore = score;
      bestKey = keys[k];
    }
  }
  this.focusTarget = bestKey;
  this.cognitiveLoad = Math.min(1, keys.length / 20);

  // Chain-of-thought: append current stimulus to reasoning chain
  this.chainOfThought.push({ stimulus: stimulus, weight: pathwayWeight, time: Date.now() });
  if (this.chainOfThought.length > this.maxChainLength) this.chainOfThought.shift();

  // Meta-thought generation: reflect on own thinking every φ*10 inferences
  if (this.totalInferences % Math.ceil(NEURO_PHI * 10) === 0) {
    this._reflect();
  }

  // Temperature adaptation: cool down when focused, heat up when exploring
  if (bestScore > 0.5) {
    this.temperature = Math.max(0.1, this.temperature - 0.01); // Focusing
  } else {
    this.temperature = Math.min(1.0, this.temperature + 0.01); // Exploring
  }
};

MetaThoughtModel.prototype._reflect = function () {
  var chainLen = this.chainOfThought.length;
  var uniqueStimuli = Object.keys(this.attentionMap).length;

  var reflection = {
    id: 'M-' + this.workerName + '-' + this.metaThoughts.length,
    type: this.cognitiveLoad > 0.7 ? 'overload-warning' : (this.temperature > 0.8 ? 'exploring' : 'focused'),
    focus: this.focusTarget,
    temperature: Math.round(this.temperature * 1000) / 1000,
    cognitiveLoad: Math.round(this.cognitiveLoad * 1000) / 1000,
    chainDepth: chainLen,
    stimuliTracked: uniqueStimuli,
    timestamp: Date.now()
  };

  this.metaThoughts.push(reflection);
  if (this.metaThoughts.length > this.maxMetaThoughts) this.metaThoughts.shift();

  return reflection;
};

MetaThoughtModel.prototype.getState = function () {
  return {
    focus: this.focusTarget,
    temperature: Math.round(this.temperature * 1000) / 1000,
    cognitiveLoad: Math.round(this.cognitiveLoad * 1000) / 1000,
    totalInferences: this.totalInferences,
    attentionTargets: Object.keys(this.attentionMap).length,
    chainDepth: this.chainOfThought.length,
    recentReflections: this.metaThoughts.slice(-3),
    explorationRate: this.explorationRate
  };
};

/* ════════════════════════════════════════════════════════════════
   NeuroCore — Unified Interface
   ════════════════════════════════════════════════════════════════ */

function NeuroCore(workerName) {
  this.workerName = workerName;
  this.heart = new MiniHeart(workerName);
  this.brain = new MiniBrain(workerName);
  this.emergence = new NeuroEmergence(workerName);
  this.cardiacModel = new MetaCardiacModel();
  this.thoughtModel = new MetaThoughtModel(workerName);
}

/** Call at the start of every message handler */
NeuroCore.prototype.onMessage = function (msgType) {
  this.heart.startProcess();
  var pathway = this.brain.stimulus(msgType);
  // Feed the Meta thought model with pathway weight
  if (pathway) {
    this.thoughtModel.attend(msgType, pathway.weight);
  }
};

/** Call at the end of every message handler */
NeuroCore.prototype.onMessageDone = function () {
  this.heart.endProcess();
};

/** Call inside heartbeat interval — returns full vitals */
NeuroCore.prototype.pulse = function () {
  var healthScore = this.heart.pulse();
  this.emergence.tick();

  // Feed the cardiac model with current vitals
  this.cardiacModel.beat(this.heart.avgLatencyMs, healthScore);

  return this.getVitals();
};

/** Handle incoming neuro-signal from another worker */
NeuroCore.prototype.receiveNeuroSignal = function (msg) {
  if (msg.neuroPhase !== undefined && msg.neuroSource) {
    this.emergence.receivePeerPhase(msg.neuroSource, msg.neuroPhase);
  }
  if (msg.neuroSignal) {
    this.emergence.receiveSignal(msg.neuroSignal);
  }
};

/** Get complete vitals for heartbeat payload */
NeuroCore.prototype.getVitals = function () {
  return {
    heart: this.heart.getVitals(),
    brain: this.brain.getState(),
    emergence: this.emergence.getState(),
    cardiac: this.cardiacModel.getState(),
    thought: this.thoughtModel.getState()
  };
};

/** Get phase for cross-worker coupling */
NeuroCore.prototype.getPhase = function () {
  return this.emergence.phase;
};
