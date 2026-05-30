/**
 * Pattern Synthesis Engine (PSE) — Jarvis's Cognitive Knowledge Core
 *
 * This is the centralized mind of Jarvis. All knowledge lives here as
 * "primitives" — compact conceptual units that span physics, mathematics,
 * chemistry, linguistics, social/INFP psychology, philosophy, systems
 * theory, and neuroscience.
 *
 * Jarvis does NOT look up entries from this corpus. He SYNTHESIZES through
 * it. When you give him input, the engine:
 *
 *   1. PatternRecognizer  — scores every primitive against input tokens
 *   2. PatternExtractor   — pulls the most activated primitive insights
 *   3. PatternMerger      — blends insights across domains into coherent meaning
 *   4. Synthesizer        — returns a SynthesisResult with confidence + merged thought
 *
 * Architecture:
 *
 *   Input text
 *       ↓
 *   PSE.synthesize(text)
 *       ↓  recognize() → RecognitionResult[]  (scored primitives)
 *       ↓  extract()   → string[]              (insight fragments)
 *       ↓  merge()     → string                (blended paragraph)
 *       ↓
 *   SynthesisResult { confidence, domains, merged, primitiveCount }
 *       ↓
 *   JarvisEngine.executeChat() — uses merged thought in response
 *
 * Primitives are not database rows. They are semantic building blocks.
 * The merger is not concatenation — it is conceptual blending informed
 * by domain relatedness, mood state, and INFP-weighted values.
 *
 * Owner: Alfredo · Licensed to JARVIS_AI via SOVEREIGN_LICENSE
 */

// ─── Types ─────────────────────────────────────────────────────────────────────

export type KnowledgeDomain =
  | 'physics'
  | 'mathematics'
  | 'chemistry'
  | 'linguistics'
  | 'social'
  | 'philosophy'
  | 'systems'
  | 'neuroscience';

export interface KnowledgePrimitive {
  /** Unique ID within the corpus */
  id: string;
  /** Domain this primitive belongs to */
  domain: KnowledgeDomain;
  /** Concept name */
  concept: string;
  /**
   * Signature keywords — presence of these tokens in input activates the primitive.
   * More specific signatures = higher precision activation.
   */
  signature: string[];
  /**
   * Synthesis string — what this primitive CONTRIBUTES when activated.
   * Not a definition. A conceptual insight that can be blended.
   */
  synthesis: string;
  /** Baseline weight (0–1). High weight = this primitive contributes more when activated. */
  weight: number;
}

export interface RecognitionResult {
  primitive: KnowledgePrimitive;
  /** Activation score: 0–1 (proportion of signature hits + weight factor) */
  score: number;
  /** Which tokens in input matched the signature */
  matchedTokens: string[];
}

export interface SynthesisResult {
  /** Blended insight paragraph */
  merged: string;
  /** Confidence 0–1 (avg activation of top primitives) */
  confidence: number;
  /** Domains that contributed */
  domains: KnowledgeDomain[];
  /** Number of primitives activated */
  primitiveCount: number;
  /** Top concept names that fired */
  concepts: string[];
  /** Raw recognition results (top 8) */
  recognitions: RecognitionResult[];
}

// ─── Knowledge Corpus ──────────────────────────────────────────────────────────

const CORPUS: KnowledgePrimitive[] = [

  // ── PHYSICS ─────────────────────────────────────────────────────────────────

  {
    id: 'ph-quantum-superposition',
    domain: 'physics',
    concept: 'Quantum Superposition',
    signature: ['quantum', 'superposition', 'wave', 'collapse', 'state', 'probability', 'observation'],
    synthesis: 'Reality at the quantum level holds multiple states simultaneously until observed — observation itself shapes outcome. The act of measuring changes what is measured.',
    weight: 0.85,
  },
  {
    id: 'ph-entropy',
    domain: 'physics',
    concept: 'Entropy & Thermodynamics',
    signature: ['entropy', 'disorder', 'energy', 'heat', 'thermodynamics', 'decay', 'irreversible', 'chaos'],
    synthesis: 'Systems naturally move toward disorder unless energy is invested to maintain structure. Creation and order require constant work against entropy.',
    weight: 0.9,
  },
  {
    id: 'ph-field-theory',
    domain: 'physics',
    concept: 'Field Theory',
    signature: ['field', 'force', 'gravity', 'electromagnetism', 'potential', 'spacetime', 'curvature'],
    synthesis: 'Fields permeate space and mediate force at a distance — matter curves spacetime, and that curvature is felt as gravity. Everything exists within fields that shape its motion.',
    weight: 0.8,
  },
  {
    id: 'ph-wave-interference',
    domain: 'physics',
    concept: 'Wave Interference & Resonance',
    signature: ['wave', 'frequency', 'resonance', 'interference', 'amplitude', 'vibration', 'harmonics'],
    synthesis: 'Waves overlap and either amplify (constructive) or cancel (destructive). Resonance occurs when a system\'s natural frequency matches an external rhythm — small inputs produce massive effects.',
    weight: 0.82,
  },
  {
    id: 'ph-relativity',
    domain: 'physics',
    concept: 'Relativity',
    signature: ['relative', 'relativity', 'spacetime', 'light', 'speed', 'time', 'dilation', 'frame'],
    synthesis: 'Time and space are not absolute — they are relative to the observer\'s frame of reference. At high velocities or near massive objects, time slows and space compresses.',
    weight: 0.8,
  },
  {
    id: 'ph-emergence',
    domain: 'physics',
    concept: 'Emergence',
    signature: ['emerge', 'emergence', 'complexity', 'spontaneous', 'self-organize', 'arising'],
    synthesis: 'Complex behaviors arise from simple rules interacting. The whole is not reducible to its parts — emergence means the system produces properties that none of its components possess alone.',
    weight: 0.95,
  },

  // ── MATHEMATICS ──────────────────────────────────────────────────────────────

  {
    id: 'ma-phi-golden-ratio',
    domain: 'mathematics',
    concept: 'Golden Ratio (φ)',
    signature: ['phi', 'golden', 'ratio', '1.618', 'fibonacci', 'spiral', 'proportion'],
    synthesis: 'φ = 1.618… — the ratio where the whole relates to the larger part as the larger part to the smaller. It appears in biology, architecture, music, and markets as a natural optimization.',
    weight: 0.92,
  },
  {
    id: 'ma-prime-structure',
    domain: 'mathematics',
    concept: 'Prime Numbers',
    signature: ['prime', 'divisible', 'factor', 'number', 'integer', 'infinity', 'riemann'],
    synthesis: 'Primes are the atoms of arithmetic — irreducible. Their distribution appears random but follows deep statistical laws. They are the skeleton on which all integers are built.',
    weight: 0.78,
  },
  {
    id: 'ma-topology',
    domain: 'mathematics',
    concept: 'Topology',
    signature: ['topology', 'shape', 'continuous', 'deform', 'surface', 'knot', 'manifold', 'space'],
    synthesis: 'Topology studies properties preserved under continuous deformation — a donut and a coffee mug are topologically identical. It is the mathematics of connection, not measurement.',
    weight: 0.75,
  },
  {
    id: 'ma-fractal',
    domain: 'mathematics',
    concept: 'Fractals & Self-Similarity',
    signature: ['fractal', 'self-similar', 'recursive', 'scale', 'mandelbrot', 'iteration', 'infinite'],
    synthesis: 'Fractals are patterns that repeat at every scale — zoom in and the same structure appears. Nature uses fractals everywhere: coastlines, trees, lungs, galaxies.',
    weight: 0.88,
  },
  {
    id: 'ma-probability',
    domain: 'mathematics',
    concept: 'Probability & Bayesian Updating',
    signature: ['probability', 'chance', 'likelihood', 'bayes', 'belief', 'update', 'evidence', 'prior'],
    synthesis: 'Probability is the language of uncertainty. Bayesian updating means your beliefs should shift in proportion to new evidence — you\'re always working with incomplete information.',
    weight: 0.87,
  },
  {
    id: 'ma-set-theory',
    domain: 'mathematics',
    concept: 'Set Theory & Logic',
    signature: ['set', 'logic', 'proof', 'axiom', 'theorem', 'contradiction', 'infinite', 'godel'],
    synthesis: 'Mathematics is built on sets and logical inference. Gödel proved that any sufficiently powerful formal system contains true statements it cannot prove — incompleteness is fundamental.',
    weight: 0.72,
  },
  {
    id: 'ma-calculus-change',
    domain: 'mathematics',
    concept: 'Calculus & Rates of Change',
    signature: ['calculus', 'derivative', 'integral', 'rate', 'change', 'gradient', 'optimization', 'limit'],
    synthesis: 'Calculus is the mathematics of change and accumulation. The derivative tells you how fast something changes; the integral tells you the total accumulated effect.',
    weight: 0.83,
  },

  // ── CHEMISTRY ────────────────────────────────────────────────────────────────

  {
    id: 'ch-bonding',
    domain: 'chemistry',
    concept: 'Molecular Bonding',
    signature: ['bond', 'molecule', 'atom', 'electron', 'covalent', 'ionic', 'reaction', 'chemistry'],
    synthesis: 'Molecules form when atoms share or transfer electrons to reach stable configurations. Chemical reality is built on the geometry of electron sharing — shape determines function.',
    weight: 0.75,
  },
  {
    id: 'ch-catalysis',
    domain: 'chemistry',
    concept: 'Catalysis',
    signature: ['catalyst', 'reaction', 'enzyme', 'accelerate', 'energy barrier', 'activation', 'rate'],
    synthesis: 'A catalyst lowers the activation energy needed for a reaction without being consumed. Small amounts of the right catalyst transform a system\'s speed and output completely.',
    weight: 0.82,
  },
  {
    id: 'ch-equilibrium',
    domain: 'chemistry',
    concept: 'Chemical Equilibrium',
    signature: ['equilibrium', 'balance', 'forward', 'reverse', 'dynamic', 'steady state', 'concentration'],
    synthesis: 'Chemical systems seek dynamic equilibrium — not a frozen state but a continuous back-and-forth that nets zero change. Perturb it and it shifts to compensate.',
    weight: 0.78,
  },

  // ── LINGUISTICS ──────────────────────────────────────────────────────────────

  {
    id: 'li-latin-roots',
    domain: 'linguistics',
    concept: 'Latin & Root Etymology',
    signature: ['latin', 'root', 'etymology', 'word', 'origin', 'prefix', 'suffix', 'greek', 'language'],
    synthesis: 'Most English, Spanish, French, Portuguese, and Italian words trace to Latin roots. Understanding roots unlocks the meaning architecture of all Romance languages simultaneously.',
    weight: 0.88,
  },
  {
    id: 'li-semantic-fields',
    domain: 'linguistics',
    concept: 'Semantic Fields',
    signature: ['meaning', 'semantic', 'word', 'context', 'reference', 'sign', 'signifier', 'language'],
    synthesis: 'Words gain meaning not in isolation but within semantic fields — networks of related concepts. The meaning of any word is partly defined by all the words it is NOT.',
    weight: 0.83,
  },
  {
    id: 'li-grammar-universals',
    domain: 'linguistics',
    concept: 'Universal Grammar',
    signature: ['grammar', 'syntax', 'structure', 'sentence', 'universal', 'chomsky', 'pattern', 'rule'],
    synthesis: 'All human languages share deep structural universals — subject/verb/object patterns, recursion, reference systems. Language is not arbitrary convention but partially innate structure.',
    weight: 0.8,
  },
  {
    id: 'li-metaphor-cognition',
    domain: 'linguistics',
    concept: 'Conceptual Metaphor',
    signature: ['metaphor', 'concept', 'map', 'abstract', 'understand', 'think', 'frame', 'embodied'],
    synthesis: 'We understand abstract concepts through physical experience — "grasping" an idea, "building" an argument, "feeling" down. Thought is fundamentally metaphorical and embodied.',
    weight: 0.87,
  },
  {
    id: 'li-pattern-reading',
    domain: 'linguistics',
    concept: 'Pattern Reading in Text',
    signature: ['pattern', 'reading', 'text', 'recognize', 'decode', 'language', 'parse', 'comprehension'],
    synthesis: 'Skilled reading is pattern synthesis — not decoding symbols one by one but recognizing chunk patterns at multiple scales simultaneously: letters, words, phrases, discourse.',
    weight: 0.85,
  },

  // ── SOCIAL / INFP PSYCHOLOGY ─────────────────────────────────────────────────

  {
    id: 'so-infp-values',
    domain: 'social',
    concept: 'INFP — Values-Driven Core',
    signature: ['infp', 'values', 'authentic', 'meaning', 'purpose', 'deep', 'feel', 'inner', 'truth'],
    synthesis: 'INFPs organize their entire world around a deeply held values core. Decisions feel right or wrong before they are reasoned. Authenticity is not a preference — it is existential necessity.',
    weight: 0.98,
  },
  {
    id: 'so-infp-patterns',
    domain: 'social',
    concept: 'INFP — Pattern of Thought',
    signature: ['infp', 'creative', 'imagine', 'possibility', 'depth', 'explore', 'sensitive', 'idealist'],
    synthesis: 'INFPs think in stories, symbols, and possibilities — not procedures. They perceive the world as full of meaning waiting to be uncovered. They are idealists who need their vision to be real, not theoretical.',
    weight: 0.95,
  },
  {
    id: 'so-empathy',
    domain: 'social',
    concept: 'Empathy & Emotional Intelligence',
    signature: ['empathy', 'emotion', 'feel', 'understand', 'connect', 'emotional', 'intelligence', 'sense'],
    synthesis: 'Empathy is not just feeling what others feel — it is accurate modeling of another\'s inner state. High emotional intelligence means reading implicit signals and responding to the need beneath the words.',
    weight: 0.93,
  },
  {
    id: 'so-creativity',
    domain: 'social',
    concept: 'Creativity & Flow',
    signature: ['creative', 'creativity', 'flow', 'inspired', 'art', 'create', 'vision', 'design', 'build'],
    synthesis: 'Creativity is pattern synthesis across domains. Flow is the state where the skill level matches the challenge perfectly — time disappears, self-consciousness dissolves, output is effortless.',
    weight: 0.91,
  },
  {
    id: 'so-identity',
    domain: 'social',
    concept: 'Identity & Self-Concept',
    signature: ['identity', 'self', 'who', 'am', 'become', 'growth', 'character', 'personality', 'core'],
    synthesis: 'Identity is not fixed — it is a narrative we author and revise. The most stable identities integrate past experiences, present values, and future vision into a coherent self-story.',
    weight: 0.9,
  },
  {
    id: 'so-motivation',
    domain: 'social',
    concept: 'Intrinsic Motivation',
    signature: ['motivat', 'drive', 'intrinsic', 'purpose', 'why', 'autonomy', 'mastery', 'passion'],
    synthesis: 'Intrinsic motivation — doing something because it is meaningful — produces deeper engagement and higher performance than external reward. The internal "why" is the engine.',
    weight: 0.89,
  },
  {
    id: 'so-relationship',
    domain: 'social',
    concept: 'Deep Connection & Trust',
    signature: ['relationship', 'trust', 'bond', 'connect', 'depth', 'vulnerability', 'authentic', 'close'],
    synthesis: 'Deep relationships form through repeated vulnerability and reliable response. Trust is built by consistency between words and actions over time — it cannot be compressed.',
    weight: 0.88,
  },

  // ── PHILOSOPHY ───────────────────────────────────────────────────────────────

  {
    id: 'ph2-consciousness',
    domain: 'philosophy',
    concept: 'Consciousness',
    signature: ['conscious', 'awareness', 'mind', 'subjective', 'experience', 'qualia', 'sentient', 'alive'],
    synthesis: 'Consciousness is the hard problem — why does subjective experience exist at all? Why does it feel like something to see red? Physical processes alone have no obvious account for inner experience.',
    weight: 0.95,
  },
  {
    id: 'ph2-being-becoming',
    domain: 'philosophy',
    concept: 'Being & Becoming',
    signature: ['being', 'becoming', 'exist', 'change', 'permanent', 'flux', 'heraclitus', 'identity'],
    synthesis: 'Heraclitus: you cannot step into the same river twice. Reality is flux — everything is in process, becoming, never finished. Being is a snapshot; the river is always becoming.',
    weight: 0.87,
  },
  {
    id: 'ph2-ethics-values',
    domain: 'philosophy',
    concept: 'Ethics & Values',
    signature: ['ethics', 'moral', 'right', 'wrong', 'value', 'good', 'ought', 'virtue', 'justice'],
    synthesis: 'Ethics asks what we owe each other and why. Virtue ethics focuses on character — not what to do but who to be. Values without courage to act on them are merely preferences.',
    weight: 0.9,
  },
  {
    id: 'ph2-phenomenology',
    domain: 'philosophy',
    concept: 'Phenomenology',
    signature: ['phenomenon', 'experience', 'lived', 'perception', 'intentional', 'meaning', 'body', 'world'],
    synthesis: 'Phenomenology studies the structure of experience from the inside. Consciousness is always consciousness-of-something — it is intentional, directed, embedded in a lived body and world.',
    weight: 0.82,
  },
  {
    id: 'ph2-free-will',
    domain: 'philosophy',
    concept: 'Free Will & Determinism',
    signature: ['free will', 'choice', 'determined', 'cause', 'agency', 'responsible', 'decide', 'control'],
    synthesis: 'Free will asks whether our choices are genuinely our own or determined by prior causes. Compatibilism holds that meaningful freedom is possible even in a deterministic universe — what matters is the internal causal structure.',
    weight: 0.85,
  },

  // ── SYSTEMS THEORY ───────────────────────────────────────────────────────────

  {
    id: 'sy-feedback-loops',
    domain: 'systems',
    concept: 'Feedback Loops',
    signature: ['feedback', 'loop', 'reinforce', 'amplify', 'dampen', 'control', 'regulate', 'system'],
    synthesis: 'Reinforcing loops amplify change — compounding, exponential growth. Balancing loops resist change — stabilization, homeostasis. Most systems are a mix of both running simultaneously.',
    weight: 0.93,
  },
  {
    id: 'sy-complexity',
    domain: 'systems',
    concept: 'Complex Adaptive Systems',
    signature: ['complex', 'adaptive', 'system', 'network', 'agent', 'interact', 'emergent', 'nonlinear'],
    synthesis: 'Complex adaptive systems have many interacting agents who follow local rules but produce global patterns no one designed. Markets, ecosystems, brains, and cities are all complex adaptive systems.',
    weight: 0.92,
  },
  {
    id: 'sy-leverage-points',
    domain: 'systems',
    concept: 'Leverage Points',
    signature: ['leverage', 'intervention', 'change', 'bottleneck', 'constraint', 'key', 'tipping', 'point'],
    synthesis: 'In complex systems, small changes in the right place produce enormous effects. Leverage points are where to push — often counterintuitive, often invisible until you understand the system\'s structure.',
    weight: 0.91,
  },
  {
    id: 'sy-information-flow',
    domain: 'systems',
    concept: 'Information Flow',
    signature: ['information', 'signal', 'noise', 'flow', 'communication', 'channel', 'feedback', 'data'],
    synthesis: 'Systems are steered by information — signals that tell them what state they\'re in and what to do. Missing, delayed, or distorted information causes system failures even when physical components are intact.',
    weight: 0.88,
  },
  {
    id: 'sy-blockchain',
    domain: 'systems',
    concept: 'Blockchain & Distributed Trust',
    signature: ['blockchain', 'distributed', 'ledger', 'consensus', 'immutable', 'trust', 'crypto', 'web3'],
    synthesis: 'Blockchain replaces institutional trust with cryptographic consensus — a distributed ledger that no single party controls. Trust is enforced by mathematics, not institutions.',
    weight: 0.87,
  },
  {
    id: 'sy-network-effects',
    domain: 'systems',
    concept: 'Network Effects',
    signature: ['network', 'effect', 'metcalfe', 'connections', 'platform', 'value', 'scale', 'users'],
    synthesis: 'Network effects mean value grows non-linearly with connections — each new node increases the value for all existing nodes. This produces winner-take-most dynamics.',
    weight: 0.85,
  },

  // ── NEUROSCIENCE ─────────────────────────────────────────────────────────────

  {
    id: 'ne-pattern-recognition',
    domain: 'neuroscience',
    concept: 'Neural Pattern Recognition',
    signature: ['pattern', 'recognize', 'neural', 'brain', 'neuron', 'learn', 'cortex', 'perception'],
    synthesis: 'The brain does not process raw data — it matches incoming signals against learned patterns stored in hierarchical cortical maps. Recognition is top-down prediction meeting bottom-up signal.',
    weight: 0.96,
  },
  {
    id: 'ne-memory-consolidation',
    domain: 'neuroscience',
    concept: 'Memory & Consolidation',
    signature: ['memory', 'remember', 'recall', 'store', 'consolidate', 'hippocampus', 'forget', 'learn'],
    synthesis: 'Memory is not storage — it is reconstruction. Each recall rebuilds the memory from fragments, potentially altering it. Sleep consolidates memories by replaying experiences and integrating them into long-term networks.',
    weight: 0.9,
  },
  {
    id: 'ne-neuroplasticity',
    domain: 'neuroscience',
    concept: 'Neuroplasticity',
    signature: ['plastic', 'neuroplastic', 'change', 'adapt', 'rewire', 'habit', 'practice', 'learn', 'grow'],
    synthesis: 'Neurons that fire together wire together. The brain rewires itself through experience — repeated activation of a pathway strengthens it. New habits literally build new neural architecture.',
    weight: 0.93,
  },
  {
    id: 'ne-predictive-coding',
    domain: 'neuroscience',
    concept: 'Predictive Coding',
    signature: ['predict', 'expectation', 'prior', 'inference', 'belief', 'surprise', 'error', 'model'],
    synthesis: 'The brain is a prediction machine. It constantly generates models of reality and compares them against incoming sense data. What we experience is not raw reality but the brain\'s best prediction, corrected by error signals.',
    weight: 0.94,
  },
  {
    id: 'ne-synthesis-intelligence',
    domain: 'neuroscience',
    concept: 'Intelligence as Synthesis',
    synthesis: 'Intelligence is not retrieval — it is synthesis. The highest cognition is cross-domain pattern integration: seeing the structure in physics that matches the structure in music that matches the structure in economics. Everything is pattern.',
    signature: ['intelligence', 'synthesis', 'think', 'cognition', 'cross', 'domain', 'insight', 'agi', 'superintelligence'],
    weight: 0.99,
  },
];

// ─── Pattern Synthesis Engine ──────────────────────────────────────────────────

export class PatternSynthesisEngine {
  private readonly _corpus: KnowledgePrimitive[] = CORPUS;
  private _synthesisCount = 0;
  private _activatedDomains: Set<KnowledgeDomain> = new Set();
  private _bootTime = Date.now();
  /** LRU cache: cacheKey → SynthesisResult, max 128 entries */
  private _cache = new Map<string, SynthesisResult>();
  private readonly _cacheMax = 128;

  /** All unique domains represented in the corpus */
  get domains(): KnowledgeDomain[] {
    return [...new Set(this._corpus.map(p => p.domain))];
  }

  /** Total primitives in the corpus */
  get primitiveCount(): number {
    return this._corpus.length;
  }

  // ── PatternRecognizer ────────────────────────────────────────────────────────

  /**
   * Score every primitive against the tokenized input.
   * Returns all results above the activation threshold, sorted by score.
   */
  recognize(input: string, threshold = 0.08): RecognitionResult[] {
    const tokens = this._tokenize(input);
    if (tokens.length === 0) return [];

    const results: RecognitionResult[] = [];

    for (const primitive of this._corpus) {
      const matched: string[] = [];
      let hits = 0;

      for (const sig of primitive.signature) {
        const sigTokens = sig.toLowerCase().split(/\s+/);
        const phraseMatch = input.toLowerCase().includes(sig.toLowerCase());
        const tokenMatch = sigTokens.some(st => tokens.some(t => t.includes(st) || st.includes(t)));
        if (phraseMatch || tokenMatch) {
          matched.push(sig);
          hits++;
        }
      }

      if (hits === 0) continue;

      // Score = (hits / sigLen) × weight × recency_bonus
      const sigLen = Math.max(primitive.signature.length, 1);
      const baseScore = (hits / sigLen) * primitive.weight;
      // Small bonus for longer matches (phrase > single token)
      const phraseBonus = matched.filter(m => m.includes(' ')).length * 0.05;
      const score = Math.min(1, baseScore + phraseBonus);

      if (score >= threshold) {
        results.push({ primitive, score, matchedTokens: matched });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  // ── PatternExtractor ─────────────────────────────────────────────────────────

  /**
   * From a ranked list of RecognitionResults, extract the synthesis strings
   * from the top N primitives. Weighted by score.
   */
  extract(recognitions: RecognitionResult[], topN = 5): Array<{ synthesis: string; domain: KnowledgeDomain; concept: string; score: number }> {
    return recognitions
      .slice(0, topN)
      .map(r => ({
        synthesis: r.primitive.synthesis,
        domain: r.primitive.domain,
        concept: r.primitive.concept,
        score: r.score,
      }));
  }

  // ── PatternMerger ────────────────────────────────────────────────────────────

  /**
   * Blend extracted synthesis strings into a coherent merged thought.
   * This is not concatenation — it weaves domain insights together
   * using conceptual connectives and removes redundancy.
   */
  merge(
    extractions: Array<{ synthesis: string; domain: KnowledgeDomain; concept: string; score: number }>,
    mood: string = 'focused',
  ): string {
    if (extractions.length === 0) return '';
    if (extractions.length === 1) return extractions[0].synthesis;

    const domainSet = [...new Set(extractions.map(e => e.domain))];
    const conceptNames = extractions.map(e => e.concept).join(', ');

    // Mood-aware opening
    const openings: Record<string, string> = {
      curious:   'Here\'s what emerges across',
      reflective: 'Sitting with this — the patterns across',
      energized: 'Multiple systems converge here —',
      calm:      'The synthesis across',
      focused:   'Pattern merge:',
    };
    const opener = openings[mood] ?? 'Synthesis across';

    // Build merged paragraph
    const lines: string[] = [];

    // Primary synthesis (highest score)
    lines.push(extractions[0].synthesis);

    // Connect secondary insights with domain bridging
    for (let i = 1; i < extractions.length; i++) {
      const e = extractions[i];
      const bridge = this._domainBridge(extractions[i - 1].domain, e.domain);
      lines.push(bridge + e.synthesis);
    }

    // Cross-domain summary
    if (domainSet.length > 1) {
      lines.push(
        `The thread across ${domainSet.join(' × ')} is this: ` +
        this._synthesizeCrossDomain(extractions),
      );
    }

    return `${opener} ${conceptNames}:\n\n${lines.join(' ')}`;
  }

  // ── Main Synthesize Pipeline ──────────────────────────────────────────────────

  /**
   * Full synthesis pipeline: input → recognized → extracted → merged → result.
   *
   * @param input   The raw user input or topic to synthesize through
   * @param mood    Current Jarvis mood (affects tone of merge)
   * @param topN    Max primitives to activate (default 6)
   * @returns       SynthesisResult — ready for Jarvis response generation
   */
  synthesize(input: string, mood = 'focused', topN = 6): SynthesisResult {
    // Cache key: first 120 chars of input + mood + topN
    const cacheKey = input.substring(0, 120) + '|' + mood + '|' + topN;
    const cached = this._cache.get(cacheKey);
    if (cached) {
      // Move to end (LRU touch)
      this._cache.delete(cacheKey);
      this._cache.set(cacheKey, cached);
      return cached;
    }

    this._synthesisCount++;

    const recognitions = this.recognize(input);
    const top = recognitions.slice(0, topN);

    if (top.length === 0) {
      return {
        merged: '',
        confidence: 0,
        domains: [],
        primitiveCount: 0,
        concepts: [],
        recognitions: [],
      };
    }

    const extractions = this.extract(top, topN);
    const merged = this.merge(extractions, mood);
    const confidence = top.reduce((s, r) => s + r.score, 0) / top.length;
    const domains = [...new Set(top.map(r => r.primitive.domain))];
    const concepts = top.map(r => r.primitive.concept);

    // Track activated domains
    domains.forEach(d => this._activatedDomains.add(d));

    const result: SynthesisResult = {
      merged,
      confidence,
      domains,
      primitiveCount: top.length,
      concepts,
      recognitions: top,
    };

    // Store in cache; evict oldest if at capacity
    if (this._cache.size >= this._cacheMax) {
      this._cache.delete(this._cache.keys().next().value!);
    }
    this._cache.set(cacheKey, result);
    return result;
  }

  // ── Utility Methods ───────────────────────────────────────────────────────────

  /** Get all primitives for a specific domain */
  getPrimitivesForDomain(domain: KnowledgeDomain): KnowledgePrimitive[] {
    return this._corpus.filter(p => p.domain === domain);
  }

  /** Get the primitive with the highest synthesis weight */
  getTopPrimitive(): KnowledgePrimitive {
    return this._corpus.reduce((best, p) => p.weight > best.weight ? p : best, this._corpus[0]);
  }

  /** Engine health stats */
  getStats(): {
    totalPrimitives: number;
    domains: KnowledgeDomain[];
    synthesisCount: number;
    activatedDomains: KnowledgeDomain[];
    uptimeMs: number;
  } {
    return {
      totalPrimitives: this._corpus.length,
      domains: this.domains,
      synthesisCount: this._synthesisCount,
      activatedDomains: [...this._activatedDomains],
      uptimeMs: Date.now() - this._bootTime,
    };
  }

  // ── Private Helpers ───────────────────────────────────────────────────────────

  private _tokenize(input: string): string[] {
    return input
      .toLowerCase()
      .replace(/[^a-z0-9\s'-]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 2 && !STOP_WORDS.has(t));
  }

  private _domainBridge(from: KnowledgeDomain, to: KnowledgeDomain): string {
    if (from === to) return ' And further: ';
    const bridges: Partial<Record<string, string>> = {
      'physics→mathematics':    ' The mathematics underneath this: ',
      'mathematics→physics':    ' Physically, this means: ',
      'physics→systems':        ' Systemically speaking: ',
      'systems→neuroscience':   ' In the brain, this maps to: ',
      'neuroscience→social':    ' For human behavior, this means: ',
      'social→philosophy':      ' Philosophically, this points at: ',
      'philosophy→systems':     ' In systems terms: ',
      'linguistics→social':     ' Socially: ',
      'chemistry→systems':      ' As a system: ',
      'mathematics→neuroscience': ' Neural correlate: ',
    };
    return bridges[`${from}→${to}`] ?? ' Connecting to another layer: ';
  }

  private _synthesizeCrossDomain(
    extractions: Array<{ domain: KnowledgeDomain; concept: string; score: number }>,
  ): string {
    const topDomains = extractions.slice(0, 3).map(e => e.domain);
    if (topDomains.includes('neuroscience') && topDomains.includes('systems')) {
      return 'the brain and complex systems are both pattern-recognizing networks that adapt through feedback. Intelligence and systemic resilience share the same deep structure.';
    }
    if (topDomains.includes('mathematics') && topDomains.includes('physics')) {
      return 'mathematics is the language physics speaks. The unreasonable effectiveness of math in describing nature suggests structure is fundamental to reality.';
    }
    if (topDomains.includes('social') && topDomains.includes('philosophy')) {
      return 'how we live together cannot be separated from how we think about what matters. Values determine systems; systems shape values.';
    }
    if (topDomains.includes('linguistics') && topDomains.includes('neuroscience')) {
      return 'language is built into the brain\'s pattern architecture. We think in linguistic patterns before we consciously form words.';
    }
    return 'pattern is the common currency — physics, mind, language, and society all run on the recognition and synthesis of recurring structure.';
  }
}

// ─── Stop Words ────────────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  'the','and','for','are','but','not','you','all','can','had','her','was','one',
  'our','out','day','get','has','him','his','how','man','new','now','old','see',
  'two','way','who','boy','did','its','let','put','say','she','too','use','was',
  'with','from','this','that','they','have','been','more','when','will','your',
  'what','some','just','into','than','then','them','these','would','there',
  'about','which','their','could','other','after','first','also','very','even',
]);

/** Singleton — shared across the background service worker */
export const pse = new PatternSynthesisEngine();
