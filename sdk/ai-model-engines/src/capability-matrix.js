/**
 * @medina/ai-model-engines — CapabilityMatrix
 *
 * Maps every intelligence capability to the AI model families that
 * support it, ranked by strength and routing tier. Acts as the
 * authoritative lookup table for the organism routing layer:
 * "I need capability X → these families deliver it, in priority order."
 *
 * @module @medina/ai-model-engines/capability-matrix
 */

/**
 * @typedef {'exceptional' | 'strong' | 'moderate' | 'basic'} Strength
 */

/**
 * @typedef {'P0' | 'P1' | 'P2' | 'P3'} Tier
 */

/**
 * @typedef {object} FamilyEntry
 * @property {string} familyId   — deterministic family identifier (e.g. AIF-001)
 * @property {string} familyName — human-readable family name
 * @property {Strength} strength — how well the family handles this capability
 * @property {Tier} tier         — routing priority tier
 */

/** Canonical ordering for strength (lower index = better). */
const STRENGTH_RANK = /** @type {const} */ ({
  exceptional: 0,
  strong: 1,
  moderate: 2,
  basic: 3,
});

/** Canonical ordering for tier (lower index = better). */
const TIER_RANK = /** @type {const} */ ({
  P0: 0,
  P1: 1,
  P2: 2,
  P3: 3,
});

class CapabilityMatrix {
  /* ------------------------------------------------------------------ */
  /*  Construction                                                       */
  /* ------------------------------------------------------------------ */

  /**
   * Creates a new CapabilityMatrix instance.
   * Initialises the internal lookup map and auto-seeds all known
   * capability → family mappings.
   */
  constructor() {
    /** @type {Map<string, FamilyEntry[]>} capabilityName → supporting families */
    this.capabilities = new Map();

    this._seed();
  }

  /* ------------------------------------------------------------------ */
  /*  Internal helpers                                                   */
  /* ------------------------------------------------------------------ */

  /**
   * Registers one capability with its supporting families.
   * @param {string} name          — capability name (kebab-case)
   * @param {FamilyEntry[]} entries — families that support this capability
   * @private
   */
  _register(name, entries) {
    this.capabilities.set(name, entries);
  }

  /**
   * Comparator: sort by tier first (P0 < P1 …), then by strength
   * (exceptional < strong …).
   * @param {FamilyEntry} a
   * @param {FamilyEntry} b
   * @returns {number}
   * @private
   */
  _compare(a, b) {
    const tierDiff = TIER_RANK[a.tier] - TIER_RANK[b.tier];
    if (tierDiff !== 0) return tierDiff;
    return STRENGTH_RANK[a.strength] - STRENGTH_RANK[b.strength];
  }

  /**
   * Seeds the matrix with all known capability → family mappings.
   * @private
   */
  _seed() {
    /* -------------------------------------------------------------- */
    /*  Reasoning capabilities                                        */
    /* -------------------------------------------------------------- */

    this._register('multi-modal-reasoning', [
      { familyId: 'AIF-001', familyName: 'GPT', strength: 'strong', tier: 'P0' },
      { familyId: 'AIF-002', familyName: 'Claude', strength: 'strong', tier: 'P0' },
      { familyId: 'AIF-003', familyName: 'Gemini', strength: 'strong', tier: 'P0' },
      { familyId: 'AIF-004', familyName: 'Llama', strength: 'strong', tier: 'P1' },
      { familyId: 'AIF-005', familyName: 'Mistral', strength: 'strong', tier: 'P1' },
    ]);

    this._register('long-context-reasoning', [
      { familyId: 'AIF-002', familyName: 'Claude', strength: 'exceptional', tier: 'P0' },
      { familyId: 'AIF-003', familyName: 'Gemini', strength: 'exceptional', tier: 'P0' },
      { familyId: 'AIF-025', familyName: 'Jamba', strength: 'strong', tier: 'P2' },
    ]);

    this._register('mathematical-reasoning', [
      { familyId: 'AIF-036', familyName: 'Minerva-Llemma', strength: 'exceptional', tier: 'P2' },
      { familyId: 'AIF-001', familyName: 'GPT', strength: 'strong', tier: 'P0' },
      { familyId: 'AIF-021', familyName: 'DeepSeek', strength: 'strong', tier: 'P2' },
    ]);

    /* -------------------------------------------------------------- */
    /*  Code capabilities                                             */
    /* -------------------------------------------------------------- */

    this._register('code-generation', [
      { familyId: 'AIF-019', familyName: 'Codex', strength: 'exceptional', tier: 'P0' },
      { familyId: 'AIF-001', familyName: 'GPT', strength: 'strong', tier: 'P0' },
      { familyId: 'AIF-020', familyName: 'CodeLlama', strength: 'strong', tier: 'P2' },
      { familyId: 'AIF-021', familyName: 'DeepSeek', strength: 'strong', tier: 'P2' },
    ]);

    this._register('code-review', [
      { familyId: 'AIF-019', familyName: 'Codex', strength: 'strong', tier: 'P0' },
      { familyId: 'AIF-002', familyName: 'Claude', strength: 'strong', tier: 'P0' },
    ]);

    this._register('code-debugging', [
      { familyId: 'AIF-019', familyName: 'Codex', strength: 'strong', tier: 'P0' },
      { familyId: 'AIF-001', familyName: 'GPT', strength: 'strong', tier: 'P0' },
    ]);

    /* -------------------------------------------------------------- */
    /*  Vision capabilities                                           */
    /* -------------------------------------------------------------- */

    this._register('image-generation', [
      { familyId: 'AIF-013', familyName: 'SD', strength: 'exceptional', tier: 'P1' },
      { familyId: 'AIF-014', familyName: 'DALL-E', strength: 'exceptional', tier: 'P1' },
      { familyId: 'AIF-015', familyName: 'Midjourney', strength: 'strong', tier: 'P2' },
    ]);

    this._register('image-understanding', [
      { familyId: 'AIF-001', familyName: 'GPT', strength: 'strong', tier: 'P0' },
      { familyId: 'AIF-003', familyName: 'Gemini', strength: 'strong', tier: 'P0' },
      { familyId: 'AIF-035', familyName: 'Florence', strength: 'strong', tier: 'P2' },
    ]);

    this._register('image-segmentation', [
      { familyId: 'AIF-033', familyName: 'SAM', strength: 'exceptional', tier: 'P1' },
    ]);

    this._register('vision-language-alignment', [
      { familyId: 'AIF-034', familyName: 'CLIP', strength: 'exceptional', tier: 'P1' },
    ]);

    /* -------------------------------------------------------------- */
    /*  Video capabilities                                            */
    /* -------------------------------------------------------------- */

    this._register('video-generation', [
      { familyId: 'AIF-026', familyName: 'Sora', strength: 'exceptional', tier: 'P1' },
      { familyId: 'AIF-027', familyName: 'Runway', strength: 'strong', tier: 'P2' },
      { familyId: 'AIF-028', familyName: 'Pika', strength: 'moderate', tier: 'P3' },
      { familyId: 'AIF-029', familyName: 'Kling', strength: 'moderate', tier: 'P3' },
    ]);

    /* -------------------------------------------------------------- */
    /*  Audio capabilities                                            */
    /* -------------------------------------------------------------- */

    this._register('speech-to-text', [
      { familyId: 'AIF-016', familyName: 'Whisper', strength: 'exceptional', tier: 'P1' },
    ]);

    this._register('text-to-speech', [
      { familyId: 'AIF-017', familyName: 'ElevenLabs', strength: 'exceptional', tier: 'P1' },
    ]);

    this._register('music-generation', [
      { familyId: 'AIF-018', familyName: 'Suno', strength: 'strong', tier: 'P2' },
      { familyId: 'AIF-037', familyName: 'MusicGen', strength: 'moderate', tier: 'P3' },
    ]);

    /* -------------------------------------------------------------- */
    /*  Search & retrieval capabilities                               */
    /* -------------------------------------------------------------- */

    this._register('semantic-search', [
      { familyId: 'AIF-038', familyName: 'Embeddings', strength: 'exceptional', tier: 'P0' },
      { familyId: 'AIF-006', familyName: 'Command R', strength: 'strong', tier: 'P1' },
    ]);

    this._register('search-augmented-reasoning', [
      { familyId: 'AIF-022', familyName: 'Perplexity', strength: 'exceptional', tier: 'P1' },
      { familyId: 'AIF-006', familyName: 'Command R', strength: 'strong', tier: 'P1' },
    ]);

    this._register('document-reranking', [
      { familyId: 'AIF-039', familyName: 'Rerankers', strength: 'exceptional', tier: 'P1' },
    ]);

    /* -------------------------------------------------------------- */
    /*  Safety capabilities                                           */
    /* -------------------------------------------------------------- */

    this._register('content-safety', [
      { familyId: 'AIF-040', familyName: 'Guards', strength: 'exceptional', tier: 'P0' },
    ]);

    this._register('prompt-injection-detection', [
      { familyId: 'AIF-040', familyName: 'Guards', strength: 'strong', tier: 'P0' },
    ]);

    /* -------------------------------------------------------------- */
    /*  Enterprise capabilities                                       */
    /* -------------------------------------------------------------- */

    this._register('function-calling', [
      { familyId: 'AIF-001', familyName: 'GPT', strength: 'exceptional', tier: 'P0' },
      { familyId: 'AIF-002', familyName: 'Claude', strength: 'strong', tier: 'P0' },
      { familyId: 'AIF-003', familyName: 'Gemini', strength: 'strong', tier: 'P0' },
      { familyId: 'AIF-005', familyName: 'Mistral', strength: 'strong', tier: 'P1' },
    ]);

    this._register('structured-output', [
      { familyId: 'AIF-001', familyName: 'GPT', strength: 'exceptional', tier: 'P0' },
      { familyId: 'AIF-002', familyName: 'Claude', strength: 'strong', tier: 'P0' },
    ]);

    this._register('multilingual', [
      { familyId: 'AIF-009', familyName: 'Qwen', strength: 'exceptional', tier: 'P2' },
      { familyId: 'AIF-003', familyName: 'Gemini', strength: 'strong', tier: 'P0' },
      { familyId: 'AIF-004', familyName: 'Llama', strength: 'strong', tier: 'P1' },
    ]);

    /* -------------------------------------------------------------- */
    /*  Edge capabilities                                             */
    /* -------------------------------------------------------------- */

    this._register('edge-inference', [
      { familyId: 'AIF-007', familyName: 'Phi', strength: 'exceptional', tier: 'P2' },
      { familyId: 'AIF-008', familyName: 'Gemma', strength: 'strong', tier: 'P2' },
    ]);

    this._register('efficient-inference', [
      { familyId: 'AIF-010', familyName: 'DBRX', strength: 'strong', tier: 'P2' },
      { familyId: 'AIF-021', familyName: 'DeepSeek', strength: 'strong', tier: 'P2' },
    ]);

    /* -------------------------------------------------------------- */
    /*  Science capabilities                                          */
    /* -------------------------------------------------------------- */

    this._register('protein-folding', [
      { familyId: 'AIF-030', familyName: 'AlphaFold', strength: 'exceptional', tier: 'P1' },
    ]);

    this._register('algorithmic-problem-solving', [
      { familyId: 'AIF-031', familyName: 'AlphaCode', strength: 'exceptional', tier: 'P2' },
    ]);

    this._register('robotic-control', [
      { familyId: 'AIF-032', familyName: 'RT-2', strength: 'strong', tier: 'P2' },
    ]);

    /* -------------------------------------------------------------- */
    /*  Conversational capabilities                                   */
    /* -------------------------------------------------------------- */

    this._register('empathic-conversation', [
      { familyId: 'AIF-024', familyName: 'Inflection', strength: 'exceptional', tier: 'P2' },
    ]);

    this._register('social-reasoning', [
      { familyId: 'AIF-023', familyName: 'Grok', strength: 'strong', tier: 'P2' },
    ]);
  }

  /* ------------------------------------------------------------------ */
  /*  Public API                                                        */
  /* ------------------------------------------------------------------ */

  /**
   * Returns the families that support a given capability, sorted by
   * tier (ascending) then strength (ascending — exceptional first).
   * @param {string} capabilityName — kebab-case capability key
   * @returns {FamilyEntry[]} sorted supporting families, or empty array
   */
  getCapability(capabilityName) {
    const entries = this.capabilities.get(capabilityName);
    if (!entries) return [];
    return [...entries].sort((a, b) => this._compare(a, b));
  }

  /**
   * Returns the single best family for a capability.
   * Prefers lowest tier first, then highest strength.
   * @param {string} capabilityName
   * @returns {FamilyEntry | null}
   */
  getBestFamily(capabilityName) {
    const sorted = this.getCapability(capabilityName);
    return sorted.length > 0 ? sorted[0] : null;
  }

  /**
   * Lists every registered capability name.
   * @returns {string[]}
   */
  listCapabilities() {
    return [...this.capabilities.keys()];
  }

  /**
   * Returns all capabilities a specific family supports.
   * @param {string} familyId — e.g. 'AIF-001'
   * @returns {{ capabilityName: string, strength: Strength, tier: Tier }[]}
   */
  getFamilyCapabilities(familyId) {
    /** @type {{ capabilityName: string, strength: Strength, tier: Tier }[]} */
    const results = [];

    for (const [capName, entries] of this.capabilities) {
      for (const entry of entries) {
        if (entry.familyId === familyId) {
          results.push({
            capabilityName: capName,
            strength: entry.strength,
            tier: entry.tier,
          });
        }
      }
    }

    return results;
  }

  /**
   * Compares two families across all capabilities they appear in.
   * @param {string} familyIdA
   * @param {string} familyIdB
   * @returns {{
   *   shared: string[],
   *   uniqueToA: string[],
   *   uniqueToB: string[]
   * }}
   */
  compareFamily(familyIdA, familyIdB) {
    const capsA = new Set(
      this.getFamilyCapabilities(familyIdA).map((c) => c.capabilityName),
    );
    const capsB = new Set(
      this.getFamilyCapabilities(familyIdB).map((c) => c.capabilityName),
    );

    const shared = [...capsA].filter((c) => capsB.has(c));
    const uniqueToA = [...capsA].filter((c) => !capsB.has(c));
    const uniqueToB = [...capsB].filter((c) => !capsA.has(c));

    return { shared, uniqueToA, uniqueToB };
  }

  /**
   * Fuzzy keyword search across capability names.
   * Returns every capability whose name contains the keyword
   * (case-insensitive).
   * @param {string} keyword
   * @returns {string[]} matching capability names
   */
  search(keyword) {
    const lower = keyword.toLowerCase();
    return this.listCapabilities().filter((name) => name.includes(lower));
  }

  /**
   * Returns the full matrix as a plain, serializable object.
   * @returns {Record<string, { familyId: string, strength: Strength, tier: Tier }[]>}
   */
  getMatrix() {
    /** @type {Record<string, { familyId: string, strength: Strength, tier: Tier }[]>} */
    const out = {};

    for (const [cap, entries] of this.capabilities) {
      out[cap] = entries.map(({ familyId, strength, tier }) => ({
        familyId,
        strength,
        tier,
      }));
    }

    return out;
  }

  /**
   * Adds a new capability mapping (or replaces an existing one).
   * @param {string} capabilityName — kebab-case capability key
   * @param {FamilyEntry[]} familyEntries — families supporting this capability
   */
  addCapability(capabilityName, familyEntries) {
    this.capabilities.set(capabilityName, familyEntries);
  }

  /**
   * Returns aggregate counts for the matrix.
   * @returns {{ capabilities: number, mappings: number }}
   */
  count() {
    let mappings = 0;
    for (const entries of this.capabilities.values()) {
      mappings += entries.length;
    }
    return { capabilities: this.capabilities.size, mappings };
  }
}

export { CapabilityMatrix };
