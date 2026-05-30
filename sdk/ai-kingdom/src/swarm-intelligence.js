/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                                       ║
 * ║   🐝 SWARM INTELLIGENCE — Multi-Agent Coordination System 🐝                           ║
 * ║                                                                                       ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════╝
 * 
 * The Swarm Intelligence system enables emergent problem-solving through
 * coordinated behavior of multiple simple agents.
 * 
 * SWARM PRINCIPLES:
 *   - Individual agents follow simple rules
 *   - Complex behavior emerges from interactions
 *   - No central controller - distributed intelligence
 *   - φ-based pheromone decay and attraction
 * 
 * @module sdk/ai-kingdom/swarm-intelligence
 * @version 1.0.0
 */

const PHI = 1.618033988749895;
const PHI_INVERSE = 0.618033988749895;

// ═══════════════════════════════════════════════════════════════════════════════
// SWARM STATES
// ═══════════════════════════════════════════════════════════════════════════════
export const SWARM_STATES = {
  DORMANT: 'dormant',             // Not active
  SCOUTING: 'scouting',           // Exploring environment
  FORAGING: 'foraging',           // Gathering resources
  BUILDING: 'building',           // Constructing solutions
  DEFENDING: 'defending',         // Protection mode
  MIGRATING: 'migrating',         // Moving to new area
  CONVERGING: 'converging'        // Focusing on best solution
};

// ═══════════════════════════════════════════════════════════════════════════════
// AGENT ROLES
// ═══════════════════════════════════════════════════════════════════════════════
export const AGENT_ROLES = {
  SCOUT: 'scout',                 // Explores new territory
  WORKER: 'worker',               // Performs main tasks
  SOLDIER: 'soldier',             // Protects the swarm
  QUEEN: 'queen',                 // Spawns new agents
  MESSENGER: 'messenger',         // Spreads information
  SPECIALIST: 'specialist'        // Domain expertise
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMMUNICATION TYPES
// ═══════════════════════════════════════════════════════════════════════════════
export const COMMUNICATION_TYPES = {
  PHEROMONE: 'pheromone',         // Chemical-like signals
  WAGGLE: 'waggle',               // Direction/distance info
  ALERT: 'alert',                 // Danger signals
  RECRUIT: 'recruit',             // Call for help
  CELEBRATE: 'celebrate'          // Success signals
};

// ═══════════════════════════════════════════════════════════════════════════════
// SWARM AGENT CLASS
// ═══════════════════════════════════════════════════════════════════════════════
export class SwarmAgent {
  constructor(agentId, role = AGENT_ROLES.WORKER) {
    this.agentId = agentId;
    this.role = role;
    this.position = { x: 0, y: 0, z: 0 };
    this.velocity = { x: 0, y: 0, z: 0 };
    this.energy = 1.0;
    this.carrying = null;
    this.memory = [];
    this.neighbors = [];
    this.pheromoneTrail = [];
    this.createdAt = Date.now();
  }

  /**
   * Update agent position based on swarm rules
   */
  update(environment) {
    // Three classic swarm rules
    const separation = this._calculateSeparation();
    const alignment = this._calculateAlignment();
    const cohesion = this._calculateCohesion();
    
    // Pheromone attraction
    const pheromoneAttraction = this._followPheromone(environment);
    
    // Combine forces with φ-weighting
    this.velocity.x += (
      separation.x * PHI_INVERSE +
      alignment.x * PHI_INVERSE ** 2 +
      cohesion.x * PHI_INVERSE ** 3 +
      pheromoneAttraction.x * PHI_INVERSE
    );
    
    this.velocity.y += (
      separation.y * PHI_INVERSE +
      alignment.y * PHI_INVERSE ** 2 +
      cohesion.y * PHI_INVERSE ** 3 +
      pheromoneAttraction.y * PHI_INVERSE
    );
    
    this.velocity.z += (
      separation.z * PHI_INVERSE +
      alignment.z * PHI_INVERSE ** 2 +
      cohesion.z * PHI_INVERSE ** 3 +
      pheromoneAttraction.z * PHI_INVERSE
    );
    
    // Normalize and apply max speed
    this._limitSpeed(1.0);
    
    // Update position
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.position.z += this.velocity.z;
    
    // Energy decay
    this.energy *= PHI_INVERSE ** 0.01;
    
    return this.position;
  }

  /**
   * Separation: Avoid crowding neighbors
   */
  _calculateSeparation() {
    const force = { x: 0, y: 0, z: 0 };
    const separationDistance = 2.0;
    
    for (const neighbor of this.neighbors) {
      const dx = this.position.x - neighbor.position.x;
      const dy = this.position.y - neighbor.position.y;
      const dz = this.position.z - neighbor.position.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      
      if (dist < separationDistance && dist > 0) {
        force.x += dx / dist;
        force.y += dy / dist;
        force.z += dz / dist;
      }
    }
    
    return force;
  }

  /**
   * Alignment: Steer toward average heading of neighbors
   */
  _calculateAlignment() {
    const force = { x: 0, y: 0, z: 0 };
    
    if (this.neighbors.length === 0) return force;
    
    for (const neighbor of this.neighbors) {
      force.x += neighbor.velocity.x;
      force.y += neighbor.velocity.y;
      force.z += neighbor.velocity.z;
    }
    
    force.x /= this.neighbors.length;
    force.y /= this.neighbors.length;
    force.z /= this.neighbors.length;
    
    return force;
  }

  /**
   * Cohesion: Steer toward center of mass of neighbors
   */
  _calculateCohesion() {
    const center = { x: 0, y: 0, z: 0 };
    
    if (this.neighbors.length === 0) return center;
    
    for (const neighbor of this.neighbors) {
      center.x += neighbor.position.x;
      center.y += neighbor.position.y;
      center.z += neighbor.position.z;
    }
    
    center.x = center.x / this.neighbors.length - this.position.x;
    center.y = center.y / this.neighbors.length - this.position.y;
    center.z = center.z / this.neighbors.length - this.position.z;
    
    return center;
  }

  /**
   * Follow pheromone trails
   */
  _followPheromone(environment) {
    const force = { x: 0, y: 0, z: 0 };
    
    if (!environment || !environment.pheromones) return force;
    
    for (const pheromone of environment.pheromones) {
      const dx = pheromone.position.x - this.position.x;
      const dy = pheromone.position.y - this.position.y;
      const dz = pheromone.position.z - this.position.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      
      if (dist > 0 && dist < 10) {
        const attraction = pheromone.strength / (dist * dist);
        force.x += (dx / dist) * attraction;
        force.y += (dy / dist) * attraction;
        force.z += (dz / dist) * attraction;
      }
    }
    
    return force;
  }

  /**
   * Limit maximum speed
   */
  _limitSpeed(maxSpeed) {
    const speed = Math.sqrt(
      this.velocity.x ** 2 + 
      this.velocity.y ** 2 + 
      this.velocity.z ** 2
    );
    
    if (speed > maxSpeed) {
      this.velocity.x = (this.velocity.x / speed) * maxSpeed;
      this.velocity.y = (this.velocity.y / speed) * maxSpeed;
      this.velocity.z = (this.velocity.z / speed) * maxSpeed;
    }
  }

  /**
   * Deposit pheromone at current position
   */
  depositPheromone(type, strength = 1.0) {
    return {
      type,
      position: { ...this.position },
      strength,
      depositedBy: this.agentId,
      depositedAt: Date.now()
    };
  }

  /**
   * Send communication to nearby agents
   */
  broadcast(type, message) {
    return {
      type,
      from: this.agentId,
      position: { ...this.position },
      message,
      timestamp: Date.now()
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SWARM INTELLIGENCE CLASS
// ═══════════════════════════════════════════════════════════════════════════════
export class SwarmIntelligence {
  constructor(swarmId, config = {}) {
    this.swarmId = swarmId;
    this.state = SWARM_STATES.DORMANT;
    this.agents = new Map();
    this.environment = {
      pheromones: [],
      resources: [],
      obstacles: [],
      targets: []
    };
    this.maxAgents = config.maxAgents || 100;
    this.neighborRadius = config.neighborRadius || 5.0;
    this.pheromoneDecayRate = config.pheromoneDecayRate || PHI_INVERSE;
    this.metrics = {
      totalIterations: 0,
      resourcesCollected: 0,
      bestSolutionScore: 0,
      convergenceRate: 0
    };
    this.createdAt = Date.now();
  }

  /**
   * Spawn new agents in the swarm
   */
  spawn(count, role = AGENT_ROLES.WORKER) {
    const spawned = [];
    
    for (let i = 0; i < count && this.agents.size < this.maxAgents; i++) {
      const agentId = `agent-${this.swarmId}-${this.agents.size}`;
      const agent = new SwarmAgent(agentId, role);
      
      // Random initial position
      agent.position = {
        x: (Math.random() - 0.5) * 20,
        y: (Math.random() - 0.5) * 20,
        z: (Math.random() - 0.5) * 20
      };
      
      this.agents.set(agentId, agent);
      spawned.push(agentId);
    }
    
    return { spawned: spawned.length, total: this.agents.size };
  }

  /**
   * Update all agents for one iteration
   */
  iterate() {
    this.metrics.totalIterations++;
    
    // Update neighbor lists
    this._updateNeighbors();
    
    // Update each agent
    for (const agent of this.agents.values()) {
      agent.update(this.environment);
      
      // Check for resource collection
      this._checkResourceCollection(agent);
      
      // Deposit pheromones based on state
      if (agent.carrying) {
        const pheromone = agent.depositPheromone('success', agent.energy);
        this.environment.pheromones.push(pheromone);
      }
    }
    
    // Decay pheromones
    this._decayPheromones();
    
    // Update swarm state
    this._updateSwarmState();
    
    return this.getStatus();
  }

  /**
   * Update neighbor lists for all agents
   */
  _updateNeighbors() {
    const agentArray = Array.from(this.agents.values());
    
    for (const agent of agentArray) {
      agent.neighbors = agentArray.filter(other => {
        if (other.agentId === agent.agentId) return false;
        
        const dx = other.position.x - agent.position.x;
        const dy = other.position.y - agent.position.y;
        const dz = other.position.z - agent.position.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        return dist < this.neighborRadius;
      });
    }
  }

  /**
   * Check if agent can collect a resource
   */
  _checkResourceCollection(agent) {
    for (let i = this.environment.resources.length - 1; i >= 0; i--) {
      const resource = this.environment.resources[i];
      
      const dx = resource.position.x - agent.position.x;
      const dy = resource.position.y - agent.position.y;
      const dz = resource.position.z - agent.position.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      
      if (dist < 1.0 && !agent.carrying) {
        agent.carrying = resource;
        this.environment.resources.splice(i, 1);
        this.metrics.resourcesCollected++;
        break;
      }
    }
  }

  /**
   * Decay pheromones over time
   */
  _decayPheromones() {
    this.environment.pheromones = this.environment.pheromones
      .map(p => ({ ...p, strength: p.strength * this.pheromoneDecayRate }))
      .filter(p => p.strength > 0.01);
  }

  /**
   * Update overall swarm state
   */
  _updateSwarmState() {
    const agentStates = Array.from(this.agents.values());
    const carryingCount = agentStates.filter(a => a.carrying).length;
    
    // Calculate convergence (how clustered are agents)
    const center = this._calculateCenter();
    const avgDist = agentStates.reduce((sum, a) => {
      const dx = a.position.x - center.x;
      const dy = a.position.y - center.y;
      const dz = a.position.z - center.z;
      return sum + Math.sqrt(dx * dx + dy * dy + dz * dz);
    }, 0) / agentStates.length;
    
    this.metrics.convergenceRate = 1 / (avgDist + 1);
    
    // Update state based on activity
    if (this.metrics.convergenceRate > 0.5) {
      this.state = SWARM_STATES.CONVERGING;
    } else if (carryingCount > agentStates.length * 0.5) {
      this.state = SWARM_STATES.FORAGING;
    } else {
      this.state = SWARM_STATES.SCOUTING;
    }
  }

  /**
   * Calculate swarm center
   */
  _calculateCenter() {
    const agents = Array.from(this.agents.values());
    const center = { x: 0, y: 0, z: 0 };
    
    for (const agent of agents) {
      center.x += agent.position.x;
      center.y += agent.position.y;
      center.z += agent.position.z;
    }
    
    center.x /= agents.length;
    center.y /= agents.length;
    center.z /= agents.length;
    
    return center;
  }

  /**
   * Add resources to environment
   */
  addResources(resources) {
    for (const resource of resources) {
      this.environment.resources.push({
        id: `resource-${Date.now()}-${Math.random()}`,
        position: resource.position || { x: 0, y: 0, z: 0 },
        value: resource.value || 1.0,
        type: resource.type || 'generic'
      });
    }
    return { added: resources.length, total: this.environment.resources.length };
  }

  /**
   * Set target positions for swarm
   */
  setTargets(targets) {
    this.environment.targets = targets.map(t => ({
      id: `target-${Date.now()}-${Math.random()}`,
      position: t.position,
      priority: t.priority || 1.0
    }));
    return { targets: this.environment.targets.length };
  }

  /**
   * Get swarm status
   */
  getStatus() {
    return {
      swarmId: this.swarmId,
      state: this.state,
      agents: this.agents.size,
      resources: this.environment.resources.length,
      pheromones: this.environment.pheromones.length,
      targets: this.environment.targets.length,
      metrics: this.metrics,
      center: this._calculateCenter()
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SWARM NETWORK - Multiple swarms working together
// ═══════════════════════════════════════════════════════════════════════════════
export class SwarmNetwork {
  constructor(networkId) {
    this.networkId = networkId;
    this.swarms = new Map();
    this.sharedEnvironment = {
      pheromones: [],
      resources: [],
      obstacles: []
    };
    this.createdAt = Date.now();
  }

  addSwarm(swarmId, config = {}) {
    const swarm = new SwarmIntelligence(swarmId, config);
    this.swarms.set(swarmId, swarm);
    return swarm;
  }

  /**
   * Run iteration across all swarms
   */
  globalIterate() {
    const results = [];
    
    for (const [id, swarm] of this.swarms) {
      const result = swarm.iterate();
      results.push({ swarmId: id, ...result });
      
      // Share pheromones across swarms
      this.sharedEnvironment.pheromones.push(...swarm.environment.pheromones);
    }
    
    // Distribute shared pheromones
    for (const swarm of this.swarms.values()) {
      swarm.environment.pheromones.push(...this.sharedEnvironment.pheromones);
    }
    
    // Decay shared pheromones
    this.sharedEnvironment.pheromones = this.sharedEnvironment.pheromones
      .map(p => ({ ...p, strength: p.strength * PHI_INVERSE }))
      .filter(p => p.strength > 0.001);
    
    return results;
  }

  getNetworkStatus() {
    return {
      networkId: this.networkId,
      swarms: this.swarms.size,
      totalAgents: Array.from(this.swarms.values())
        .reduce((sum, s) => sum + s.agents.size, 0),
      sharedPheromones: this.sharedEnvironment.pheromones.length
    };
  }
}

export default SwarmIntelligence;
