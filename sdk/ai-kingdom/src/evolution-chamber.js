/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                                       ║
 * ║   🧬 EVOLUTION CHAMBER — Genetic Algorithm Model Evolution 🧬                          ║
 * ║                                                                                       ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════╝
 * 
 * The Evolution Chamber breeds, mutates, and selects AI models through
 * genetic algorithm principles for continuous improvement.
 * 
 * EVOLUTION PRINCIPLES:
 *   - Population-based optimization
 *   - Selection favors high-fitness individuals
 *   - Crossover combines successful traits
 *   - Mutation introduces beneficial variations
 *   - φ-based fitness scaling for natural selection pressure
 * 
 * @module sdk/ai-kingdom/evolution-chamber
 * @version 1.0.0
 */

const PHI = 1.618033988749895;
const PHI_INVERSE = 0.618033988749895;

// ═══════════════════════════════════════════════════════════════════════════════
// EVOLUTION STATES
// ═══════════════════════════════════════════════════════════════════════════════
export const EVOLUTION_STATES = {
  DORMANT: 'dormant',             // Not active
  INITIALIZING: 'initializing',   // Creating initial population
  EVALUATING: 'evaluating',       // Assessing fitness
  SELECTING: 'selecting',         // Choosing parents
  BREEDING: 'breeding',           // Creating offspring
  MUTATING: 'mutating',           // Introducing variations
  EVOLVING: 'evolving'            // Full generation cycle
};

// ═══════════════════════════════════════════════════════════════════════════════
// SELECTION METHODS
// ═══════════════════════════════════════════════════════════════════════════════
export const SELECTION_METHODS = {
  ROULETTE: 'roulette',           // Fitness-proportional
  TOURNAMENT: 'tournament',       // Competition-based
  RANK: 'rank',                   // Position-based
  ELITISM: 'elitism',             // Top performers guaranteed
  BOLTZMANN: 'boltzmann'          // Temperature-scaled
};

// ═══════════════════════════════════════════════════════════════════════════════
// CROSSOVER TYPES
// ═══════════════════════════════════════════════════════════════════════════════
export const CROSSOVER_TYPES = {
  SINGLE_POINT: 'single_point',   // One cut point
  TWO_POINT: 'two_point',         // Two cut points
  UNIFORM: 'uniform',             // Random gene selection
  ARITHMETIC: 'arithmetic',       // Weighted average
  PHI_BLEND: 'phi_blend'          // Golden ratio blending
};

// ═══════════════════════════════════════════════════════════════════════════════
// MUTATION TYPES
// ═══════════════════════════════════════════════════════════════════════════════
export const MUTATION_TYPES = {
  GAUSSIAN: 'gaussian',           // Normal distribution
  UNIFORM: 'uniform',             // Uniform random
  POLYNOMIAL: 'polynomial',       // Polynomial bounded
  ADAPTIVE: 'adaptive',           // Self-adjusting
  QUANTUM: 'quantum'              // Quantum-inspired leaps
};

// ═══════════════════════════════════════════════════════════════════════════════
// GENOME CLASS
// ═══════════════════════════════════════════════════════════════════════════════
export class Genome {
  constructor(genomeId, genes = null, config = {}) {
    this.genomeId = genomeId;
    this.genes = genes || this._randomGenes(config.geneCount || 100);
    this.fitness = 0;
    this.generation = config.generation || 0;
    this.parents = config.parents || [];
    this.mutations = 0;
    this.createdAt = Date.now();
  }

  /**
   * Generate random genes
   */
  _randomGenes(count) {
    const genes = new Array(count);
    for (let i = 0; i < count; i++) {
      genes[i] = (Math.random() - 0.5) * 2; // -1 to 1
    }
    return genes;
  }

  /**
   * Clone this genome
   */
  clone() {
    const clone = new Genome(
      `${this.genomeId}-clone-${Date.now()}`,
      [...this.genes],
      {
        generation: this.generation,
        parents: [this.genomeId]
      }
    );
    return clone;
  }

  /**
   * Calculate distance to another genome
   */
  distance(other) {
    let sum = 0;
    for (let i = 0; i < this.genes.length; i++) {
      const diff = this.genes[i] - (other.genes[i] || 0);
      sum += diff * diff;
    }
    return Math.sqrt(sum);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EVOLUTION CHAMBER CLASS
// ═══════════════════════════════════════════════════════════════════════════════
export class EvolutionChamber {
  constructor(chamberId, config = {}) {
    this.chamberId = chamberId;
    this.state = EVOLUTION_STATES.DORMANT;
    this.population = [];
    this.generation = 0;
    this.bestGenome = null;
    this.bestFitness = -Infinity;
    
    // Configuration
    this.populationSize = config.populationSize || 50;
    this.geneCount = config.geneCount || 100;
    this.eliteCount = config.eliteCount || 2;
    this.mutationRate = config.mutationRate || 0.1;
    this.crossoverRate = config.crossoverRate || PHI_INVERSE;
    this.selectionMethod = config.selectionMethod || SELECTION_METHODS.TOURNAMENT;
    this.crossoverType = config.crossoverType || CROSSOVER_TYPES.PHI_BLEND;
    this.mutationType = config.mutationType || MUTATION_TYPES.ADAPTIVE;
    
    // Fitness function (user-provided)
    this.fitnessFunction = config.fitnessFunction || this._defaultFitness;
    
    // History
    this.fitnessHistory = [];
    this.diversityHistory = [];
    
    this.metrics = {
      totalGenerations: 0,
      totalEvaluations: 0,
      improvements: 0,
      stagnantGenerations: 0
    };
    
    this.createdAt = Date.now();
  }

  /**
   * Default fitness function (maximize sum)
   */
  _defaultFitness(genome) {
    return genome.genes.reduce((sum, g) => sum + g, 0);
  }

  /**
   * Initialize population
   */
  initialize(seedGenomes = null) {
    this.state = EVOLUTION_STATES.INITIALIZING;
    this.population = [];
    
    if (seedGenomes) {
      // Use seed genomes
      for (const seed of seedGenomes) {
        this.population.push(seed);
      }
    }
    
    // Fill remaining with random genomes
    while (this.population.length < this.populationSize) {
      const genome = new Genome(
        `genome-${this.chamberId}-${this.population.length}`,
        null,
        { geneCount: this.geneCount, generation: 0 }
      );
      this.population.push(genome);
    }
    
    return { initialized: true, size: this.population.length };
  }

  /**
   * Evaluate fitness of all genomes
   */
  evaluate() {
    this.state = EVOLUTION_STATES.EVALUATING;
    
    for (const genome of this.population) {
      genome.fitness = this.fitnessFunction(genome);
      this.metrics.totalEvaluations++;
      
      // Track best
      if (genome.fitness > this.bestFitness) {
        this.bestFitness = genome.fitness;
        this.bestGenome = genome.clone();
        this.metrics.improvements++;
      }
    }
    
    // Sort by fitness (descending)
    this.population.sort((a, b) => b.fitness - a.fitness);
    
    // Record history
    const avgFitness = this.population.reduce((sum, g) => sum + g.fitness, 0) / this.population.length;
    this.fitnessHistory.push({
      generation: this.generation,
      best: this.population[0].fitness,
      average: avgFitness,
      worst: this.population[this.population.length - 1].fitness
    });
    
    return {
      best: this.population[0].fitness,
      average: avgFitness,
      diversity: this._calculateDiversity()
    };
  }

  /**
   * Calculate population diversity
   */
  _calculateDiversity() {
    if (this.population.length < 2) return 0;
    
    let totalDistance = 0;
    let pairs = 0;
    
    for (let i = 0; i < Math.min(10, this.population.length); i++) {
      for (let j = i + 1; j < Math.min(10, this.population.length); j++) {
        totalDistance += this.population[i].distance(this.population[j]);
        pairs++;
      }
    }
    
    const diversity = pairs > 0 ? totalDistance / pairs : 0;
    this.diversityHistory.push({ generation: this.generation, diversity });
    
    return diversity;
  }

  /**
   * Select parents for breeding
   */
  select(count = 2) {
    this.state = EVOLUTION_STATES.SELECTING;
    
    switch (this.selectionMethod) {
      case SELECTION_METHODS.ROULETTE:
        return this._rouletteSelect(count);
      case SELECTION_METHODS.TOURNAMENT:
        return this._tournamentSelect(count);
      case SELECTION_METHODS.RANK:
        return this._rankSelect(count);
      case SELECTION_METHODS.ELITISM:
        return this._elitismSelect(count);
      case SELECTION_METHODS.BOLTZMANN:
        return this._boltzmannSelect(count);
      default:
        return this._tournamentSelect(count);
    }
  }

  /**
   * Roulette wheel selection
   */
  _rouletteSelect(count) {
    const selected = [];
    const minFitness = Math.min(...this.population.map(g => g.fitness));
    const totalFitness = this.population.reduce((sum, g) => sum + (g.fitness - minFitness + 1), 0);
    
    for (let i = 0; i < count; i++) {
      const threshold = Math.random() * totalFitness;
      let cumulative = 0;
      
      for (const genome of this.population) {
        cumulative += genome.fitness - minFitness + 1;
        if (cumulative >= threshold) {
          selected.push(genome);
          break;
        }
      }
    }
    
    return selected;
  }

  /**
   * Tournament selection
   */
  _tournamentSelect(count, tournamentSize = 3) {
    const selected = [];
    
    for (let i = 0; i < count; i++) {
      const tournament = [];
      for (let j = 0; j < tournamentSize; j++) {
        const idx = Math.floor(Math.random() * this.population.length);
        tournament.push(this.population[idx]);
      }
      tournament.sort((a, b) => b.fitness - a.fitness);
      selected.push(tournament[0]);
    }
    
    return selected;
  }

  /**
   * Rank-based selection
   */
  _rankSelect(count) {
    const selected = [];
    const n = this.population.length;
    const totalRank = (n * (n + 1)) / 2;
    
    for (let i = 0; i < count; i++) {
      const threshold = Math.random() * totalRank;
      let cumulative = 0;
      
      for (let j = 0; j < n; j++) {
        cumulative += n - j; // Higher rank = higher probability
        if (cumulative >= threshold) {
          selected.push(this.population[j]);
          break;
        }
      }
    }
    
    return selected;
  }

  /**
   * Elitism selection
   */
  _elitismSelect(count) {
    return this.population.slice(0, count);
  }

  /**
   * Boltzmann selection with temperature
   */
  _boltzmannSelect(count) {
    const temperature = Math.max(0.1, 1 - this.generation / 100);
    const selected = [];
    
    // Calculate Boltzmann probabilities
    const probs = this.population.map(g => Math.exp(g.fitness / temperature));
    const total = probs.reduce((a, b) => a + b, 0);
    
    for (let i = 0; i < count; i++) {
      const threshold = Math.random() * total;
      let cumulative = 0;
      
      for (let j = 0; j < this.population.length; j++) {
        cumulative += probs[j];
        if (cumulative >= threshold) {
          selected.push(this.population[j]);
          break;
        }
      }
    }
    
    return selected;
  }

  /**
   * Crossover two parents to create offspring
   */
  crossover(parent1, parent2) {
    this.state = EVOLUTION_STATES.BREEDING;
    
    if (Math.random() > this.crossoverRate) {
      // No crossover - return clones
      return [parent1.clone(), parent2.clone()];
    }
    
    switch (this.crossoverType) {
      case CROSSOVER_TYPES.SINGLE_POINT:
        return this._singlePointCrossover(parent1, parent2);
      case CROSSOVER_TYPES.TWO_POINT:
        return this._twoPointCrossover(parent1, parent2);
      case CROSSOVER_TYPES.UNIFORM:
        return this._uniformCrossover(parent1, parent2);
      case CROSSOVER_TYPES.ARITHMETIC:
        return this._arithmeticCrossover(parent1, parent2);
      case CROSSOVER_TYPES.PHI_BLEND:
        return this._phiBlendCrossover(parent1, parent2);
      default:
        return this._phiBlendCrossover(parent1, parent2);
    }
  }

  /**
   * Single point crossover
   */
  _singlePointCrossover(p1, p2) {
    const point = Math.floor(Math.random() * p1.genes.length);
    
    const child1Genes = [...p1.genes.slice(0, point), ...p2.genes.slice(point)];
    const child2Genes = [...p2.genes.slice(0, point), ...p1.genes.slice(point)];
    
    return [
      new Genome(`child-${Date.now()}-1`, child1Genes, {
        generation: this.generation + 1,
        parents: [p1.genomeId, p2.genomeId]
      }),
      new Genome(`child-${Date.now()}-2`, child2Genes, {
        generation: this.generation + 1,
        parents: [p1.genomeId, p2.genomeId]
      })
    ];
  }

  /**
   * Two point crossover
   */
  _twoPointCrossover(p1, p2) {
    let point1 = Math.floor(Math.random() * p1.genes.length);
    let point2 = Math.floor(Math.random() * p1.genes.length);
    if (point1 > point2) [point1, point2] = [point2, point1];
    
    const child1Genes = [
      ...p1.genes.slice(0, point1),
      ...p2.genes.slice(point1, point2),
      ...p1.genes.slice(point2)
    ];
    const child2Genes = [
      ...p2.genes.slice(0, point1),
      ...p1.genes.slice(point1, point2),
      ...p2.genes.slice(point2)
    ];
    
    return [
      new Genome(`child-${Date.now()}-1`, child1Genes, {
        generation: this.generation + 1,
        parents: [p1.genomeId, p2.genomeId]
      }),
      new Genome(`child-${Date.now()}-2`, child2Genes, {
        generation: this.generation + 1,
        parents: [p1.genomeId, p2.genomeId]
      })
    ];
  }

  /**
   * Uniform crossover
   */
  _uniformCrossover(p1, p2) {
    const child1Genes = [];
    const child2Genes = [];
    
    for (let i = 0; i < p1.genes.length; i++) {
      if (Math.random() < 0.5) {
        child1Genes.push(p1.genes[i]);
        child2Genes.push(p2.genes[i]);
      } else {
        child1Genes.push(p2.genes[i]);
        child2Genes.push(p1.genes[i]);
      }
    }
    
    return [
      new Genome(`child-${Date.now()}-1`, child1Genes, {
        generation: this.generation + 1,
        parents: [p1.genomeId, p2.genomeId]
      }),
      new Genome(`child-${Date.now()}-2`, child2Genes, {
        generation: this.generation + 1,
        parents: [p1.genomeId, p2.genomeId]
      })
    ];
  }

  /**
   * Arithmetic crossover
   */
  _arithmeticCrossover(p1, p2) {
    const alpha = Math.random();
    const child1Genes = p1.genes.map((g, i) => alpha * g + (1 - alpha) * p2.genes[i]);
    const child2Genes = p2.genes.map((g, i) => alpha * g + (1 - alpha) * p1.genes[i]);
    
    return [
      new Genome(`child-${Date.now()}-1`, child1Genes, {
        generation: this.generation + 1,
        parents: [p1.genomeId, p2.genomeId]
      }),
      new Genome(`child-${Date.now()}-2`, child2Genes, {
        generation: this.generation + 1,
        parents: [p1.genomeId, p2.genomeId]
      })
    ];
  }

  /**
   * φ-blend crossover (golden ratio weighted)
   */
  _phiBlendCrossover(p1, p2) {
    const child1Genes = p1.genes.map((g, i) => 
      PHI_INVERSE * g + (1 - PHI_INVERSE) * p2.genes[i]
    );
    const child2Genes = p2.genes.map((g, i) => 
      PHI_INVERSE * g + (1 - PHI_INVERSE) * p1.genes[i]
    );
    
    return [
      new Genome(`child-${Date.now()}-1`, child1Genes, {
        generation: this.generation + 1,
        parents: [p1.genomeId, p2.genomeId]
      }),
      new Genome(`child-${Date.now()}-2`, child2Genes, {
        generation: this.generation + 1,
        parents: [p1.genomeId, p2.genomeId]
      })
    ];
  }

  /**
   * Mutate a genome
   */
  mutate(genome) {
    this.state = EVOLUTION_STATES.MUTATING;
    
    switch (this.mutationType) {
      case MUTATION_TYPES.GAUSSIAN:
        return this._gaussianMutate(genome);
      case MUTATION_TYPES.UNIFORM:
        return this._uniformMutate(genome);
      case MUTATION_TYPES.POLYNOMIAL:
        return this._polynomialMutate(genome);
      case MUTATION_TYPES.ADAPTIVE:
        return this._adaptiveMutate(genome);
      case MUTATION_TYPES.QUANTUM:
        return this._quantumMutate(genome);
      default:
        return this._adaptiveMutate(genome);
    }
  }

  /**
   * Gaussian mutation
   */
  _gaussianMutate(genome) {
    for (let i = 0; i < genome.genes.length; i++) {
      if (Math.random() < this.mutationRate) {
        // Box-Muller transform for Gaussian random
        const u1 = Math.random();
        const u2 = Math.random();
        const gaussian = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        
        genome.genes[i] += gaussian * 0.1;
        genome.genes[i] = Math.max(-1, Math.min(1, genome.genes[i]));
        genome.mutations++;
      }
    }
    return genome;
  }

  /**
   * Uniform mutation
   */
  _uniformMutate(genome) {
    for (let i = 0; i < genome.genes.length; i++) {
      if (Math.random() < this.mutationRate) {
        genome.genes[i] = (Math.random() - 0.5) * 2;
        genome.mutations++;
      }
    }
    return genome;
  }

  /**
   * Polynomial mutation
   */
  _polynomialMutate(genome, eta = 20) {
    for (let i = 0; i < genome.genes.length; i++) {
      if (Math.random() < this.mutationRate) {
        const u = Math.random();
        const delta = u < 0.5 
          ? Math.pow(2 * u, 1 / (eta + 1)) - 1
          : 1 - Math.pow(2 * (1 - u), 1 / (eta + 1));
        
        genome.genes[i] += delta;
        genome.genes[i] = Math.max(-1, Math.min(1, genome.genes[i]));
        genome.mutations++;
      }
    }
    return genome;
  }

  /**
   * Adaptive mutation (adjusts rate based on fitness)
   */
  _adaptiveMutate(genome) {
    // Lower mutation rate for fitter individuals
    const fitnessRatio = genome.fitness / (this.bestFitness || 1);
    const adaptedRate = this.mutationRate * (1 - fitnessRatio * PHI_INVERSE);
    
    for (let i = 0; i < genome.genes.length; i++) {
      if (Math.random() < adaptedRate) {
        const magnitude = (1 - fitnessRatio) * 0.2;
        genome.genes[i] += (Math.random() - 0.5) * 2 * magnitude;
        genome.genes[i] = Math.max(-1, Math.min(1, genome.genes[i]));
        genome.mutations++;
      }
    }
    return genome;
  }

  /**
   * Quantum-inspired mutation (tunneling)
   */
  _quantumMutate(genome) {
    const temperature = Math.max(0.01, 1 - this.generation / 50);
    
    for (let i = 0; i < genome.genes.length; i++) {
      if (Math.random() < this.mutationRate) {
        // Quantum tunneling probability
        const tunnelProb = Math.exp(-Math.abs(genome.genes[i]) / (temperature * PHI));
        
        if (Math.random() < tunnelProb) {
          // Tunnel to new random position
          genome.genes[i] = (Math.random() - 0.5) * 2;
        } else {
          // Small classical mutation
          genome.genes[i] += (Math.random() - 0.5) * 0.1;
        }
        
        genome.genes[i] = Math.max(-1, Math.min(1, genome.genes[i]));
        genome.mutations++;
      }
    }
    return genome;
  }

  /**
   * Run one complete generation
   */
  evolve() {
    this.state = EVOLUTION_STATES.EVOLVING;
    
    // Evaluate current population
    this.evaluate();
    
    // Create new population
    const newPopulation = [];
    
    // Elitism: preserve top performers
    for (let i = 0; i < this.eliteCount; i++) {
      newPopulation.push(this.population[i].clone());
    }
    
    // Breed new individuals
    while (newPopulation.length < this.populationSize) {
      const [parent1, parent2] = this.select(2);
      const [child1, child2] = this.crossover(parent1, parent2);
      
      this.mutate(child1);
      this.mutate(child2);
      
      newPopulation.push(child1);
      if (newPopulation.length < this.populationSize) {
        newPopulation.push(child2);
      }
    }
    
    this.population = newPopulation;
    this.generation++;
    this.metrics.totalGenerations++;
    
    // Check for stagnation
    if (this.fitnessHistory.length >= 2) {
      const last = this.fitnessHistory[this.fitnessHistory.length - 1];
      const prev = this.fitnessHistory[this.fitnessHistory.length - 2];
      
      if (last.best <= prev.best) {
        this.metrics.stagnantGenerations++;
      } else {
        this.metrics.stagnantGenerations = 0;
      }
    }
    
    return this.getStatus();
  }

  /**
   * Run multiple generations
   */
  run(generations = 10) {
    const results = [];
    
    for (let i = 0; i < generations; i++) {
      const result = this.evolve();
      results.push(result);
    }
    
    return {
      generations: generations,
      results,
      bestFitness: this.bestFitness,
      bestGenome: this.bestGenome
    };
  }

  /**
   * Get chamber status
   */
  getStatus() {
    return {
      chamberId: this.chamberId,
      state: this.state,
      generation: this.generation,
      populationSize: this.population.length,
      bestFitness: this.bestFitness,
      currentBest: this.population[0]?.fitness,
      diversity: this._calculateDiversity(),
      metrics: this.metrics,
      selectionMethod: this.selectionMethod,
      crossoverType: this.crossoverType,
      mutationType: this.mutationType
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EVOLUTION NETWORK - Multiple chambers with migration
// ═══════════════════════════════════════════════════════════════════════════════
export class EvolutionNetwork {
  constructor(networkId) {
    this.networkId = networkId;
    this.chambers = new Map();
    this.migrationRate = 0.1;
    this.createdAt = Date.now();
  }

  addChamber(chamberId, config = {}) {
    const chamber = new EvolutionChamber(chamberId, config);
    this.chambers.set(chamberId, chamber);
    return chamber;
  }

  /**
   * Migrate individuals between chambers
   */
  migrate() {
    const chamberArray = Array.from(this.chambers.values());
    
    for (let i = 0; i < chamberArray.length; i++) {
      const source = chamberArray[i];
      const target = chamberArray[(i + 1) % chamberArray.length];
      
      const migrantCount = Math.floor(source.population.length * this.migrationRate);
      
      for (let j = 0; j < migrantCount; j++) {
        // Send top performers
        const migrant = source.population[j].clone();
        
        // Replace worst in target
        target.population[target.population.length - 1 - j] = migrant;
      }
    }
    
    return { migrated: true, chambers: this.chambers.size };
  }

  /**
   * Run evolution across all chambers
   */
  globalEvolve(generations = 10, migrateEvery = 5) {
    const results = [];
    
    for (let g = 0; g < generations; g++) {
      const genResults = [];
      
      for (const [id, chamber] of this.chambers) {
        const result = chamber.evolve();
        genResults.push({ chamberId: id, ...result });
      }
      
      // Periodic migration
      if ((g + 1) % migrateEvery === 0) {
        this.migrate();
      }
      
      results.push({
        generation: g,
        chambers: genResults
      });
    }
    
    return results;
  }

  /**
   * Get network best genome
   */
  getGlobalBest() {
    let best = null;
    let bestFitness = -Infinity;
    
    for (const chamber of this.chambers.values()) {
      if (chamber.bestFitness > bestFitness) {
        bestFitness = chamber.bestFitness;
        best = chamber.bestGenome;
      }
    }
    
    return { genome: best, fitness: bestFitness };
  }

  getNetworkStatus() {
    return {
      networkId: this.networkId,
      chambers: this.chambers.size,
      totalPopulation: Array.from(this.chambers.values())
        .reduce((sum, c) => sum + c.population.length, 0),
      globalBest: this.getGlobalBest().fitness,
      migrationRate: this.migrationRate
    };
  }
}

export default EvolutionChamber;
