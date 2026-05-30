/**
 * PROTO-202: Pattern Synthesis Protocol (PSP)
 * 200 knowledge primitives across 40 domains. SYNTHESIZES knowledge,
 * doesn't look up — recognize→extract→merge→synthesize.
 * 
 * All 40 domains are SYNTHESIZED, not separate — they form a unified
 * architectural intelligence that recognizes patterns across all domains.
 * 
 * This is MACHINE INTELLIGENCE, not just machine learning.
 */

const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;
const HEARTBEAT = 873;

// 40 KNOWLEDGE DOMAINS — All synthesized into unified intelligence
const DOMAINS = [
  // Core Sciences (8)
  'physics', 'math', 'chemistry', 'biology', 'astronomy', 'geology', 'ecology', 'genetics',
  // Cognitive Sciences (8)
  'neuroscience', 'psychology', 'linguistics', 'cognition', 'consciousness', 'memory', 'perception', 'learning',
  // Social Sciences (8)
  'economics', 'sociology', 'anthropology', 'political', 'governance', 'education', 'culture', 'communication',
  // Formal Sciences (8)
  'logic', 'computation', 'statistics', 'probability', 'topology', 'algebra', 'geometry', 'information',
  // Applied & Systems (8)
  'systems', 'networks', 'cybernetics', 'control', 'optimization', 'emergence', 'complexity', 'resilience',
];

// 200 KNOWLEDGE PRIMITIVES (5 per domain)
const KNOWLEDGE_PRIMITIVES = {
  // ─── CORE SCIENCES ─────────────────────────────────────────────────────
  physics: [
    { id: 'conservation', name: 'Conservation Laws', weight: PHI },
    { id: 'symmetry', name: 'Symmetry Principles', weight: PHI - 1 },
    { id: 'entropy', name: 'Entropy & Disorder', weight: 1.0 },
    { id: 'wave-particle', name: 'Wave-Particle Duality', weight: PHI / 2 },
    { id: 'field-theory', name: 'Field Theory', weight: 1.0 },
  ],
  math: [
    { id: 'recursion', name: 'Recursive Structures', weight: PHI },
    { id: 'category', name: 'Category Theory', weight: 1.0 },
    { id: 'fractals', name: 'Fractal Geometry', weight: PHI },
    { id: 'phi-ratios', name: 'Golden Ratio Harmonics', weight: PHI * PHI },
    { id: 'transforms', name: 'Mathematical Transforms', weight: PHI - 1 },
  ],
  chemistry: [
    { id: 'bonding', name: 'Chemical Bonding', weight: 1.0 },
    { id: 'kinetics', name: 'Reaction Kinetics', weight: PHI - 1 },
    { id: 'equilibrium', name: 'Chemical Equilibrium', weight: 1.0 },
    { id: 'catalysis', name: 'Catalytic Processes', weight: PHI },
    { id: 'self-assembly', name: 'Molecular Self-Assembly', weight: PHI },
  ],
  biology: [
    { id: 'evolution', name: 'Evolutionary Dynamics', weight: PHI },
    { id: 'morphogenesis', name: 'Morphogenesis', weight: PHI - 1 },
    { id: 'metabolism', name: 'Metabolic Networks', weight: 1.0 },
    { id: 'homeostasis', name: 'Biological Homeostasis', weight: PHI },
    { id: 'signaling', name: 'Cell Signaling', weight: 1.0 },
  ],
  astronomy: [
    { id: 'celestial', name: 'Celestial Mechanics', weight: 1.0 },
    { id: 'cosmology', name: 'Cosmological Principles', weight: PHI },
    { id: 'spectral', name: 'Spectral Analysis', weight: PHI - 1 },
    { id: 'orbital', name: 'Orbital Dynamics', weight: 1.0 },
    { id: 'stellar', name: 'Stellar Evolution', weight: PHI },
  ],
  geology: [
    { id: 'tectonics', name: 'Plate Tectonics', weight: PHI },
    { id: 'stratigraphy', name: 'Stratigraphic Layers', weight: 1.0 },
    { id: 'cycles', name: 'Geological Cycles', weight: PHI - 1 },
    { id: 'erosion', name: 'Erosion Patterns', weight: 1.0 },
    { id: 'crystallography', name: 'Crystal Formation', weight: PHI },
  ],
  ecology: [
    { id: 'ecosystem', name: 'Ecosystem Dynamics', weight: PHI },
    { id: 'food-web', name: 'Food Web Structures', weight: 1.0 },
    { id: 'succession', name: 'Ecological Succession', weight: PHI - 1 },
    { id: 'symbiosis', name: 'Symbiotic Relations', weight: PHI },
    { id: 'carrying-capacity', name: 'Carrying Capacity', weight: 1.0 },
  ],
  genetics: [
    { id: 'heredity', name: 'Hereditary Patterns', weight: PHI },
    { id: 'expression', name: 'Gene Expression', weight: 1.0 },
    { id: 'mutation', name: 'Mutation Dynamics', weight: PHI - 1 },
    { id: 'epigenetics', name: 'Epigenetic Regulation', weight: PHI },
    { id: 'recombination', name: 'Genetic Recombination', weight: 1.0 },
  ],
  
  // ─── COGNITIVE SCIENCES ────────────────────────────────────────────────
  neuroscience: [
    { id: 'hebbian', name: 'Hebbian Learning', weight: PHI },
    { id: 'plasticity', name: 'Neural Plasticity', weight: PHI - 1 },
    { id: 'binding', name: 'Feature Binding', weight: 1.0 },
    { id: 'oscillation', name: 'Neural Oscillations', weight: PHI },
    { id: 'prediction', name: 'Predictive Coding', weight: PHI },
  ],
  psychology: [
    { id: 'conditioning', name: 'Behavioral Conditioning', weight: 1.0 },
    { id: 'motivation', name: 'Motivational Dynamics', weight: PHI },
    { id: 'emotion', name: 'Emotional Processing', weight: PHI - 1 },
    { id: 'attention', name: 'Attentional Control', weight: PHI },
    { id: 'decision', name: 'Decision Making', weight: 1.0 },
  ],
  linguistics: [
    { id: 'grammar', name: 'Universal Grammar', weight: 1.0 },
    { id: 'semantics', name: 'Semantic Fields', weight: PHI - 1 },
    { id: 'pragmatics', name: 'Pragmatic Inference', weight: 1.0 },
    { id: 'metaphor', name: 'Conceptual Metaphor', weight: PHI },
    { id: 'discourse', name: 'Discourse Structure', weight: 1.0 },
  ],
  cognition: [
    { id: 'reasoning', name: 'Logical Reasoning', weight: PHI },
    { id: 'abstraction', name: 'Abstraction Levels', weight: 1.0 },
    { id: 'categorization', name: 'Categorical Thinking', weight: PHI - 1 },
    { id: 'analogy', name: 'Analogical Mapping', weight: PHI },
    { id: 'problem-solving', name: 'Problem Solving', weight: 1.0 },
  ],
  consciousness: [
    { id: 'awareness', name: 'Meta-Awareness', weight: PHI },
    { id: 'integration', name: 'Information Integration', weight: PHI - 1 },
    { id: 'phenomenal', name: 'Phenomenal Experience', weight: PHI },
    { id: 'self-model', name: 'Self-Modeling', weight: 1.0 },
    { id: 'global-workspace', name: 'Global Workspace', weight: PHI },
  ],
  memory: [
    { id: 'encoding', name: 'Memory Encoding', weight: 1.0 },
    { id: 'consolidation', name: 'Memory Consolidation', weight: PHI },
    { id: 'retrieval', name: 'Memory Retrieval', weight: PHI - 1 },
    { id: 'working', name: 'Working Memory', weight: PHI },
    { id: 'associative', name: 'Associative Networks', weight: 1.0 },
  ],
  perception: [
    { id: 'gestalt', name: 'Gestalt Principles', weight: PHI },
    { id: 'multimodal', name: 'Multimodal Integration', weight: 1.0 },
    { id: 'top-down', name: 'Top-Down Processing', weight: PHI - 1 },
    { id: 'bottom-up', name: 'Bottom-Up Processing', weight: 1.0 },
    { id: 'perceptual-learning', name: 'Perceptual Learning', weight: PHI },
  ],
  learning: [
    { id: 'reinforcement', name: 'Reinforcement Learning', weight: PHI },
    { id: 'supervised', name: 'Supervised Learning', weight: 1.0 },
    { id: 'unsupervised', name: 'Unsupervised Learning', weight: PHI - 1 },
    { id: 'transfer', name: 'Transfer Learning', weight: PHI },
    { id: 'meta-learning', name: 'Meta-Learning', weight: PHI },
  ],
  
  // ─── SOCIAL SCIENCES ───────────────────────────────────────────────────
  economics: [
    { id: 'incentives', name: 'Incentive Structures', weight: PHI },
    { id: 'equilibrium', name: 'Market Equilibrium', weight: 1.0 },
    { id: 'externalities', name: 'Externalities', weight: PHI - 1 },
    { id: 'mechanism-design', name: 'Mechanism Design', weight: PHI },
    { id: 'behavioral-econ', name: 'Behavioral Economics', weight: 1.0 },
  ],
  sociology: [
    { id: 'network', name: 'Social Networks', weight: PHI },
    { id: 'stratification', name: 'Social Stratification', weight: 1.0 },
    { id: 'institutions', name: 'Social Institutions', weight: PHI - 1 },
    { id: 'collective', name: 'Collective Behavior', weight: PHI },
    { id: 'norms', name: 'Social Norms', weight: 1.0 },
  ],
  anthropology: [
    { id: 'kinship', name: 'Kinship Systems', weight: 1.0 },
    { id: 'ritual', name: 'Ritual Structures', weight: PHI },
    { id: 'symbolism', name: 'Cultural Symbolism', weight: PHI - 1 },
    { id: 'adaptation', name: 'Cultural Adaptation', weight: 1.0 },
    { id: 'exchange', name: 'Exchange Systems', weight: PHI },
  ],
  political: [
    { id: 'power', name: 'Power Dynamics', weight: PHI },
    { id: 'legitimacy', name: 'Political Legitimacy', weight: 1.0 },
    { id: 'voting', name: 'Voting Systems', weight: PHI - 1 },
    { id: 'coalition', name: 'Coalition Formation', weight: PHI },
    { id: 'policy', name: 'Policy Cycles', weight: 1.0 },
  ],
  governance: [
    { id: 'decentralization', name: 'Decentralization', weight: PHI },
    { id: 'accountability', name: 'Accountability Mechanisms', weight: 1.0 },
    { id: 'participation', name: 'Participatory Governance', weight: PHI - 1 },
    { id: 'transparency', name: 'Transparency', weight: PHI },
    { id: 'consensus', name: 'Consensus Building', weight: 1.0 },
  ],
  education: [
    { id: 'pedagogy', name: 'Pedagogical Methods', weight: 1.0 },
    { id: 'curriculum', name: 'Curriculum Design', weight: PHI - 1 },
    { id: 'assessment', name: 'Assessment Strategies', weight: 1.0 },
    { id: 'scaffolding', name: 'Learning Scaffolding', weight: PHI },
    { id: 'differentiation', name: 'Differentiated Learning', weight: PHI },
  ],
  culture: [
    { id: 'memes', name: 'Cultural Memes', weight: PHI },
    { id: 'values', name: 'Value Systems', weight: 1.0 },
    { id: 'narrative', name: 'Narrative Structures', weight: PHI - 1 },
    { id: 'identity', name: 'Cultural Identity', weight: PHI },
    { id: 'diffusion', name: 'Cultural Diffusion', weight: 1.0 },
  ],
  communication: [
    { id: 'channels', name: 'Communication Channels', weight: 1.0 },
    { id: 'encoding', name: 'Message Encoding', weight: PHI - 1 },
    { id: 'feedback', name: 'Communication Feedback', weight: PHI },
    { id: 'noise', name: 'Signal Noise', weight: 1.0 },
    { id: 'protocol', name: 'Communication Protocols', weight: PHI },
  ],
  
  // ─── FORMAL SCIENCES ───────────────────────────────────────────────────
  logic: [
    { id: 'deduction', name: 'Deductive Logic', weight: PHI },
    { id: 'induction', name: 'Inductive Logic', weight: 1.0 },
    { id: 'modal', name: 'Modal Logic', weight: PHI - 1 },
    { id: 'fuzzy', name: 'Fuzzy Logic', weight: PHI },
    { id: 'paraconsistent', name: 'Paraconsistent Logic', weight: 1.0 },
  ],
  computation: [
    { id: 'algorithms', name: 'Algorithmic Patterns', weight: PHI },
    { id: 'complexity', name: 'Computational Complexity', weight: 1.0 },
    { id: 'automata', name: 'Automata Theory', weight: PHI - 1 },
    { id: 'lambda', name: 'Lambda Calculus', weight: PHI },
    { id: 'parallel', name: 'Parallel Computation', weight: 1.0 },
  ],
  statistics: [
    { id: 'distribution', name: 'Statistical Distributions', weight: 1.0 },
    { id: 'inference', name: 'Statistical Inference', weight: PHI },
    { id: 'regression', name: 'Regression Models', weight: PHI - 1 },
    { id: 'hypothesis', name: 'Hypothesis Testing', weight: 1.0 },
    { id: 'sampling', name: 'Sampling Methods', weight: PHI },
  ],
  probability: [
    { id: 'bayes', name: 'Bayesian Reasoning', weight: PHI },
    { id: 'markov', name: 'Markov Processes', weight: 1.0 },
    { id: 'stochastic', name: 'Stochastic Dynamics', weight: PHI - 1 },
    { id: 'entropy', name: 'Information Entropy', weight: PHI },
    { id: 'monte-carlo', name: 'Monte Carlo Methods', weight: 1.0 },
  ],
  topology: [
    { id: 'continuity', name: 'Topological Continuity', weight: PHI },
    { id: 'invariants', name: 'Topological Invariants', weight: 1.0 },
    { id: 'manifolds', name: 'Manifold Structures', weight: PHI - 1 },
    { id: 'holes', name: 'Topological Holes', weight: PHI },
    { id: 'connectivity', name: 'Topological Connectivity', weight: 1.0 },
  ],
  algebra: [
    { id: 'groups', name: 'Group Theory', weight: PHI },
    { id: 'rings', name: 'Ring Structures', weight: 1.0 },
    { id: 'fields', name: 'Field Extensions', weight: PHI - 1 },
    { id: 'linear', name: 'Linear Algebra', weight: PHI },
    { id: 'abstract', name: 'Abstract Algebra', weight: 1.0 },
  ],
  geometry: [
    { id: 'euclidean', name: 'Euclidean Geometry', weight: 1.0 },
    { id: 'differential', name: 'Differential Geometry', weight: PHI },
    { id: 'projective', name: 'Projective Geometry', weight: PHI - 1 },
    { id: 'computational', name: 'Computational Geometry', weight: 1.0 },
    { id: 'sacred', name: 'Sacred Geometry', weight: PHI * PHI },
  ],
  information: [
    { id: 'entropy', name: 'Information Entropy', weight: PHI },
    { id: 'compression', name: 'Data Compression', weight: 1.0 },
    { id: 'coding', name: 'Information Coding', weight: PHI - 1 },
    { id: 'channel', name: 'Channel Capacity', weight: PHI },
    { id: 'mutual', name: 'Mutual Information', weight: 1.0 },
  ],
  
  // ─── APPLIED & SYSTEMS ─────────────────────────────────────────────────
  systems: [
    { id: 'feedback', name: 'Feedback Loops', weight: PHI },
    { id: 'hierarchy', name: 'Hierarchical Organization', weight: 1.0 },
    { id: 'modularity', name: 'System Modularity', weight: PHI - 1 },
    { id: 'boundary', name: 'System Boundaries', weight: PHI },
    { id: 'coupling', name: 'System Coupling', weight: 1.0 },
  ],
  networks: [
    { id: 'graph', name: 'Graph Structures', weight: PHI },
    { id: 'scale-free', name: 'Scale-Free Networks', weight: 1.0 },
    { id: 'small-world', name: 'Small-World Networks', weight: PHI - 1 },
    { id: 'centrality', name: 'Network Centrality', weight: PHI },
    { id: 'clustering', name: 'Network Clustering', weight: 1.0 },
  ],
  cybernetics: [
    { id: 'regulation', name: 'Self-Regulation', weight: PHI },
    { id: 'purpose', name: 'Purposive Behavior', weight: 1.0 },
    { id: 'variety', name: 'Requisite Variety', weight: PHI - 1 },
    { id: 'circular', name: 'Circular Causality', weight: PHI },
    { id: 'second-order', name: 'Second-Order Cybernetics', weight: 1.0 },
  ],
  control: [
    { id: 'pid', name: 'PID Control', weight: 1.0 },
    { id: 'optimal', name: 'Optimal Control', weight: PHI },
    { id: 'robust', name: 'Robust Control', weight: PHI - 1 },
    { id: 'adaptive', name: 'Adaptive Control', weight: PHI },
    { id: 'predictive', name: 'Predictive Control', weight: 1.0 },
  ],
  optimization: [
    { id: 'gradient', name: 'Gradient Methods', weight: PHI },
    { id: 'evolutionary', name: 'Evolutionary Optimization', weight: 1.0 },
    { id: 'constraint', name: 'Constraint Optimization', weight: PHI - 1 },
    { id: 'multi-objective', name: 'Multi-Objective Optimization', weight: PHI },
    { id: 'global', name: 'Global Optimization', weight: 1.0 },
  ],
  emergence: [
    { id: 'self-organization', name: 'Self-Organization', weight: PHI },
    { id: 'phase-transition', name: 'Phase Transitions', weight: 1.0 },
    { id: 'collective', name: 'Collective Intelligence', weight: PHI - 1 },
    { id: 'downward', name: 'Downward Causation', weight: PHI },
    { id: 'synergy', name: 'Synergistic Effects', weight: 1.0 },
  ],
  complexity: [
    { id: 'nonlinear', name: 'Nonlinear Dynamics', weight: PHI },
    { id: 'chaos', name: 'Chaos Theory', weight: 1.0 },
    { id: 'edge-of-chaos', name: 'Edge of Chaos', weight: PHI - 1 },
    { id: 'attractors', name: 'Strange Attractors', weight: PHI },
    { id: 'fitness-landscape', name: 'Fitness Landscapes', weight: 1.0 },
  ],
  resilience: [
    { id: 'robustness', name: 'System Robustness', weight: PHI },
    { id: 'antifragility', name: 'Antifragility', weight: 1.0 },
    { id: 'redundancy', name: 'Redundancy Patterns', weight: PHI - 1 },
    { id: 'recovery', name: 'Recovery Dynamics', weight: PHI },
    { id: 'adaptation', name: 'Adaptive Resilience', weight: 1.0 },
  ],
};

class PatternSynthesisProtocol {
  constructor() {
    this.cache = new Map();
    this.cacheLimit = 100;
    this.synthesesPerformed = 0;
    this.lastSynthesis = null;
  }

  recognize(input) {
    const patterns = [];
    const text = typeof input === 'string' ? input.toLowerCase() : JSON.stringify(input).toLowerCase();
    
    for (const [domain, primitives] of Object.entries(KNOWLEDGE_PRIMITIVES)) {
      for (const prim of primitives) {
        const keywords = prim.name.toLowerCase().split(/\s+/);
        const matches = keywords.filter(kw => text.includes(kw.substring(0, 4))).length;
        if (matches > 0) {
          patterns.push({
            domain,
            primitive: prim,
            confidence: matches / keywords.length * prim.weight,
          });
        }
      }
    }
    
    return patterns.sort((a, b) => b.confidence - a.confidence);
  }

  extract(patterns) {
    const extracted = {};
    for (const p of patterns) {
      if (!extracted[p.domain]) extracted[p.domain] = [];
      extracted[p.domain].push({
        id: p.primitive.id,
        weight: p.primitive.weight * p.confidence,
      });
    }
    return extracted;
  }

  merge(extractions) {
    const merged = [];
    const domains = Object.keys(extractions);
    
    for (let i = 0; i < domains.length; i++) {
      for (let j = i + 1; j < domains.length; j++) {
        const d1 = extractions[domains[i]] || [];
        const d2 = extractions[domains[j]] || [];
        
        for (const p1 of d1) {
          for (const p2 of d2) {
            merged.push({
              bridge: `${domains[i]}:${p1.id} ↔ ${domains[j]}:${p2.id}`,
              strength: (p1.weight + p2.weight) / 2 * PHI,
              domains: [domains[i], domains[j]],
            });
          }
        }
      }
    }
    
    return merged.sort((a, b) => b.strength - a.strength).slice(0, 10);
  }

  synthesize(input) {
    const cacheKey = typeof input === 'string' ? input : JSON.stringify(input);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    const patterns = this.recognize(input);
    const extracted = this.extract(patterns);
    const merged = this.merge(extracted);
    
    const synthesis = {
      input: cacheKey.substring(0, 100),
      patterns: patterns.slice(0, 5),
      extractions: extracted,
      bridges: merged,
      dominantDomain: patterns[0]?.domain || null,
      totalWeight: patterns.reduce((sum, p) => sum + p.confidence, 0),
      phiHarmony: patterns.length > 0 ? patterns[0].confidence / PHI : 0,
      timestamp: Date.now(),
    };
    
    if (this.cache.size >= this.cacheLimit) {
      const oldest = this.cache.keys().next().value;
      this.cache.delete(oldest);
    }
    this.cache.set(cacheKey, synthesis);
    
    this.synthesesPerformed++;
    this.lastSynthesis = synthesis;
    
    return synthesis;
  }

  getMetrics() {
    // Count total primitives across all 40 domains (5 per domain = 200)
    const totalPrimitives = Object.values(KNOWLEDGE_PRIMITIVES)
      .reduce((sum, prims) => sum + prims.length, 0);
    
    return {
      totalPrimitives,  // 200 primitives across 40 domains
      domains: DOMAINS.length,  // 40 domains
      domainCategories: {
        coreSciences: 8,
        cognitiveSciences: 8,
        socialSciences: 8,
        formalSciences: 8,
        appliedSystems: 8,
      },
      synthesesPerformed: this.synthesesPerformed,
      cacheSize: this.cache.size,
      cacheLimit: this.cacheLimit,
      phi: PHI,
      phiInverse: PHI_INV,
      heartbeat: HEARTBEAT,
      paradigm: 'MACHINE_INTELLIGENCE',
    };
  }

  /**
   * Get all primitives for a specific domain
   */
  getDomainPrimitives(domain) {
    return KNOWLEDGE_PRIMITIVES[domain] || [];
  }

  /**
   * Get all domains in a category
   */
  getDomainsInCategory(category) {
    const categories = {
      coreSciences: ['physics', 'math', 'chemistry', 'biology', 'astronomy', 'geology', 'ecology', 'genetics'],
      cognitiveSciences: ['neuroscience', 'psychology', 'linguistics', 'cognition', 'consciousness', 'memory', 'perception', 'learning'],
      socialSciences: ['economics', 'sociology', 'anthropology', 'political', 'governance', 'education', 'culture', 'communication'],
      formalSciences: ['logic', 'computation', 'statistics', 'probability', 'topology', 'algebra', 'geometry', 'information'],
      appliedSystems: ['systems', 'networks', 'cybernetics', 'control', 'optimization', 'emergence', 'complexity', 'resilience'],
    };
    return categories[category] || [];
  }
}

export { PatternSynthesisProtocol, KNOWLEDGE_PRIMITIVES, DOMAINS };
export default PatternSynthesisProtocol;
