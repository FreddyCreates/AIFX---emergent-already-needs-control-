/**
 * PROTO-267: Mycelium Evolutionary Adaptation Protocol (MEAP)
 * Self-modifying behavior, fitness landscapes, protocol mutation, and
 * network-level natural selection.
 *
 * Biological inspiration: mycelial networks exhibit extraordinary plasticity —
 * they can redirect growth, abandon failing paths, and evolve new strategies
 * in response to environmental pressure. Over time, successful strategies
 * dominate while maladaptive behaviors are pruned. This protocol encodes
 * evolutionary dynamics at the protocol level itself.
 *
 * Core Mechanisms:
 *  - Fitness landscape: each protocol strategy has a measurable fitness score
 *    based on network health, throughput, trust stability, and efficiency.
 *  - Mutation: strategies can be mutated (parameter tweaks, rule modifications)
 *    with phi-bounded mutation rates to explore adaptation space.
 *  - Selection: fitter strategies propagate across more nodes; weak strategies
 *    are pruned when fitness drops below survival threshold.
 *  - Speciation: when strategies diverge sufficiently, they form distinct species
 *    that can coexist in different network niches (domains, substrates).
 *  - Epoch lifecycle: evolution proceeds in epochs; each epoch evaluates fitness,
 *    applies selection, introduces mutations, and records lineage.
 */

const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;
const HEARTBEAT = 873;

export const EVOLUTION_STATES = {
  DORMANT: 'dormant',
  EVALUATING: 'evaluating',
  SELECTING: 'selecting',
  MUTATING: 'mutating',
  SPECIATION: 'speciation',
};

export const MESSAGE_TYPES = {
  FITNESS_EVALUATE: 'mycelium.evolve.fitness.evaluate',
  STRATEGY_MUTATE: 'mycelium.evolve.strategy.mutate',
  STRATEGY_SELECT: 'mycelium.evolve.strategy.select',
  STRATEGY_PRUNE: 'mycelium.evolve.strategy.prune',
  SPECIES_FORK: 'mycelium.evolve.species.fork',
  EPOCH_COMPLETE: 'mycelium.evolve.epoch.complete',
};

export const MUTATION_TYPES = {
  PARAMETER_SHIFT: 'parameter_shift',
  RULE_SWAP: 'rule_swap',
  THRESHOLD_DRIFT: 'threshold_drift',
  TOPOLOGY_ADAPT: 'topology_adapt',
  WEIGHT_REDISTRIBUTION: 'weight_redistribution',
};

/**
 * Calculate strategy fitness from network health metrics.
 * Fitness = (throughput * trust * efficiency) / (failures * latency_penalty)
 */
export function calculateFitness(metrics = {}) {
  const throughput = Math.max(0, Math.min(1, metrics.throughput ?? 0.5));
  const trust = Math.max(0, Math.min(1, metrics.trust ?? 0.5));
  const efficiency = Math.max(0, Math.min(1, metrics.efficiency ?? 0.5));
  const failures = Math.max(0, metrics.failures ?? 0);
  const latencyMs = Math.max(1, metrics.latencyMs ?? 50);
  const latencyPenalty = 1 + latencyMs / 1000;
  const failurePenalty = 1 + failures * PHI;
  return (throughput * trust * efficiency * PHI) / (latencyPenalty * failurePenalty);
}

/**
 * Apply a mutation to a strategy parameter with phi-bounded magnitude.
 */
export function applyMutation(currentValue, mutationRate = 0.1, bounds = { min: 0, max: 1 }) {
  const magnitude = mutationRate * PHI_INV;
  const direction = Math.random() < 0.5 ? -1 : 1;
  const delta = direction * magnitude * (bounds.max - bounds.min);
  return Math.max(bounds.min, Math.min(bounds.max, currentValue + delta));
}

/**
 * Calculate speciation distance between two strategies.
 * If distance > PHI_INV, strategies are considered distinct species.
 */
export function calculateSpeciationDistance(strategyA, strategyB) {
  if (!strategyA?.params || !strategyB?.params) return 1;
  const keysA = Object.keys(strategyA.params);
  const keysB = Object.keys(strategyB.params);
  const allKeys = new Set([...keysA, ...keysB]);
  if (allKeys.size === 0) return 0;
  let totalDiff = 0;
  for (const key of allKeys) {
    const a = strategyA.params[key] ?? 0;
    const b = strategyB.params[key] ?? 0;
    totalDiff += Math.abs(a - b);
  }
  return Math.min(1, totalDiff / allKeys.size);
}

/**
 * Calculate survival probability based on fitness relative to population average.
 */
export function calculateSurvivalProbability(fitness, populationAvgFitness) {
  if (populationAvgFitness <= 0) return fitness > 0 ? 1 : 0;
  const relative = fitness / populationAvgFitness;
  return Math.min(1, Math.pow(relative, PHI));
}

export class MyceliumEvolutionaryAdaptationProtocol {
  constructor(config = {}) {
    this.config = {
      mutationRate: config.mutationRate ?? 0.1,
      survivalThreshold: config.survivalThreshold ?? 0.34,
      speciationThreshold: config.speciationThreshold ?? PHI_INV,
      maxStrategies: config.maxStrategies ?? 50,
      maxSpecies: config.maxSpecies ?? 10,
      epochInterval: config.epochInterval ?? HEARTBEAT * 50,
      ...config,
    };
    this.state = EVOLUTION_STATES.DORMANT;
    this.strategies = [];
    this.species = [];
    this.epochs = [];
    this.lineage = [];
    this.events = [];
  }

  /**
   * Register a strategy into the evolutionary pool.
   */
  registerStrategy(id, params = {}, metadata = {}) {
    const strategy = {
      id: id || `strat-${Date.now().toString(36)}`,
      params,
      fitness: 0,
      generation: 0,
      speciesId: metadata.speciesId || 'default',
      parentId: metadata.parentId || null,
      createdAt: Date.now(),
      lastEvaluatedAt: null,
      survivalCount: 0,
    };
    this.strategies.push(strategy);
    if (this.strategies.length > this.config.maxStrategies) {
      this.strategies.sort((a, b) => b.fitness - a.fitness);
      this.strategies = this.strategies.slice(0, this.config.maxStrategies);
    }
    return strategy;
  }

  /**
   * Evaluate fitness of a strategy given current network metrics.
   */
  evaluateFitness(strategyId, metrics = {}) {
    const strategy = this.strategies.find(s => s.id === strategyId);
    if (!strategy) return null;
    this.state = EVOLUTION_STATES.EVALUATING;
    strategy.fitness = calculateFitness(metrics);
    strategy.lastEvaluatedAt = Date.now();
    this._event(MESSAGE_TYPES.FITNESS_EVALUATE, { strategyId, fitness: strategy.fitness, metrics });
    this.state = EVOLUTION_STATES.DORMANT;
    return { strategyId, fitness: strategy.fitness };
  }

  /**
   * Mutate a strategy, producing a child variant.
   */
  mutateStrategy(strategyId, mutationType = MUTATION_TYPES.PARAMETER_SHIFT) {
    const parent = this.strategies.find(s => s.id === strategyId);
    if (!parent) return null;
    this.state = EVOLUTION_STATES.MUTATING;

    const childParams = { ...parent.params };
    for (const key of Object.keys(childParams)) {
      if (typeof childParams[key] === 'number') {
        childParams[key] = applyMutation(childParams[key], this.config.mutationRate);
      }
    }

    const child = {
      id: `strat-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      params: childParams,
      fitness: 0,
      generation: parent.generation + 1,
      speciesId: parent.speciesId,
      parentId: parent.id,
      createdAt: Date.now(),
      lastEvaluatedAt: null,
      survivalCount: 0,
    };

    this.strategies.push(child);
    this.lineage.push({ parentId: parent.id, childId: child.id, mutationType, generation: child.generation });
    this._event(MESSAGE_TYPES.STRATEGY_MUTATE, { parentId: parent.id, childId: child.id, mutationType, generation: child.generation });

    // Check speciation
    const distance = calculateSpeciationDistance(parent, child);
    if (distance >= this.config.speciationThreshold) {
      child.speciesId = `species-${Date.now().toString(36)}`;
      this.species.push({ id: child.speciesId, founderId: child.id, forkedAt: Date.now(), ancestorSpeciesId: parent.speciesId });
      this._event(MESSAGE_TYPES.SPECIES_FORK, { childId: child.id, speciesId: child.speciesId, distance });
      this.state = EVOLUTION_STATES.SPECIATION;
    }

    this.state = EVOLUTION_STATES.DORMANT;
    return child;
  }

  /**
   * Run selection: prune strategies below survival threshold.
   */
  select() {
    this.state = EVOLUTION_STATES.SELECTING;
    const avgFitness = this.strategies.length
      ? this.strategies.reduce((sum, s) => sum + s.fitness, 0) / this.strategies.length
      : 0;

    const survivors = [];
    const pruned = [];

    for (const strategy of this.strategies) {
      const probability = calculateSurvivalProbability(strategy.fitness, avgFitness);
      if (probability >= this.config.survivalThreshold) {
        strategy.survivalCount++;
        survivors.push(strategy);
      } else {
        pruned.push(strategy);
        this._event(MESSAGE_TYPES.STRATEGY_PRUNE, { strategyId: strategy.id, fitness: strategy.fitness, probability });
      }
    }

    this.strategies = survivors;
    for (const survivor of survivors) {
      this._event(MESSAGE_TYPES.STRATEGY_SELECT, { strategyId: survivor.id, fitness: survivor.fitness, survivalCount: survivor.survivalCount });
    }

    this.state = EVOLUTION_STATES.DORMANT;
    return { survivors: survivors.length, pruned: pruned.length, avgFitness };
  }

  /**
   * Run a full evolutionary epoch: evaluate all, select, mutate top performers.
   */
  runEpoch(metricsMap = {}) {
    // Evaluate
    for (const strategy of this.strategies) {
      const metrics = metricsMap[strategy.id] || metricsMap['*'] || {};
      this.evaluateFitness(strategy.id, metrics);
    }

    // Select
    const selection = this.select();

    // Mutate top performers
    const sorted = [...this.strategies].sort((a, b) => b.fitness - a.fitness);
    const topCount = Math.max(1, Math.floor(sorted.length * PHI_INV));
    const mutations = [];
    for (let i = 0; i < topCount && i < sorted.length; i++) {
      const child = this.mutateStrategy(sorted[i].id);
      if (child) mutations.push(child);
    }

    const epoch = {
      id: `epoch-${Date.now().toString(36)}`,
      at: Date.now(),
      strategyCount: this.strategies.length,
      survivors: selection.survivors,
      pruned: selection.pruned,
      mutations: mutations.length,
      avgFitness: selection.avgFitness,
      topFitness: sorted[0]?.fitness ?? 0,
      speciesCount: this.species.length,
    };
    this.epochs.push(epoch);
    this._event(MESSAGE_TYPES.EPOCH_COMPLETE, epoch);
    return epoch;
  }

  /**
   * Get the fittest strategy overall or within a species.
   */
  getFittest(speciesId = null) {
    const pool = speciesId
      ? this.strategies.filter(s => s.speciesId === speciesId)
      : this.strategies;
    if (pool.length === 0) return null;
    return pool.reduce((best, s) => s.fitness > best.fitness ? s : best);
  }

  /**
   * Get lineage tree for a strategy.
   */
  getLineage(strategyId) {
    const ancestors = [];
    let current = strategyId;
    while (current) {
      const link = this.lineage.find(l => l.childId === current);
      if (!link) break;
      ancestors.push(link);
      current = link.parentId;
    }
    return ancestors.reverse();
  }

  getMetrics() {
    return {
      state: this.state,
      strategyCount: this.strategies.length,
      speciesCount: this.species.length,
      epochCount: this.epochs.length,
      lineageDepth: this.lineage.length,
      avgFitness: this.strategies.length
        ? this.strategies.reduce((sum, s) => sum + s.fitness, 0) / this.strategies.length
        : 0,
      topFitness: this.strategies.reduce((max, s) => Math.max(max, s.fitness), 0),
      eventCount: this.events.length,
    };
  }

  _event(type, payload) {
    this.events.push({ at: Date.now(), type, payload });
    if (this.events.length > 1000) this.events.shift();
  }
}

export default MyceliumEvolutionaryAdaptationProtocol;
