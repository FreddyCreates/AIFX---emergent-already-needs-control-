/**
 * @medina/ai-model-engines — AlphaResolver
 *
 * Determines which model is the "alpha" (leader) of each AI family,
 * tracks version lineage, and resolves fallback chains when the
 * primary alpha is unavailable.
 *
 * @module @medina/ai-model-engines/alpha-resolver
 */

class AlphaResolver {
  /**
   * Creates a new AlphaResolver instance.
   * @param {object} [config={}] — resolver configuration
   * @param {number} [config.fallbackDepth=3] — maximum fallback depth
   */
  constructor(config = {}) {
    /** @type {number} */
    this.fallbackDepth = config.fallbackDepth ?? 3;

    /** @type {Map<string, object>} familyId → alpha record */
    this.alphas = new Map();

    /** @type {Map<string, string[]>} familyId → version history (newest first) */
    this.lineage = new Map();

    /** @type {Map<string, string[]>} familyId → ordered fallback family IDs */
    this.fallbackChains = new Map();

    this._seedAlphas();
  }

  /* ------------------------------------------------------------------ */
  /*  Internal seeding                                                   */
  /* ------------------------------------------------------------------ */

  /**
   * Registers a single alpha record and its lineage.
   * @param {object} rec — alpha descriptor
   * @private
   */
  _registerAlpha(rec) {
    this.alphas.set(rec.familyId, rec);
    this.lineage.set(rec.familyId, [rec.alphaModel, ...rec.predecessors]);
  }

  /**
   * Seeds all 40 families with alpha records, version lineage,
   * and cross-family fallback chains.
   * @private
   */
  _seedAlphas() {
    const now = Date.now();

    /* ---- 8 major lineages ---- */

    this._registerAlpha({
      familyId: 'AIF-001',
      familyName: 'GPT',
      alphaModel: 'GPT-4o',
      alphaVersion: '2024.08',
      predecessors: ['GPT-4 Turbo', 'GPT-4', 'GPT-3.5', 'GPT-3', 'GPT-2'],
      successorCandidate: 'GPT-5',
      status: 'active',
      resolvedAt: now
    });

    this._registerAlpha({
      familyId: 'AIF-002',
      familyName: 'Claude',
      alphaModel: 'Claude 3.5 Sonnet',
      alphaVersion: '2024.06',
      predecessors: ['Claude 3 Opus', 'Claude 2.1', 'Claude 2', 'Claude 1.3'],
      successorCandidate: 'Claude 4',
      status: 'active',
      resolvedAt: now
    });

    this._registerAlpha({
      familyId: 'AIF-003',
      familyName: 'Gemini',
      alphaModel: 'Gemini 1.5 Pro',
      alphaVersion: '2024.05',
      predecessors: ['Gemini 1.0 Ultra', 'Gemini 1.0 Pro', 'PaLM 2'],
      successorCandidate: 'Gemini 2.0',
      status: 'active',
      resolvedAt: now
    });

    this._registerAlpha({
      familyId: 'AIF-004',
      familyName: 'Llama',
      alphaModel: 'Llama 3.1 405B',
      alphaVersion: '2024.07',
      predecessors: ['Llama 3 70B', 'Llama 2 70B', 'LLaMA 65B'],
      successorCandidate: 'Llama 4',
      status: 'active',
      resolvedAt: now
    });

    this._registerAlpha({
      familyId: 'AIF-005',
      familyName: 'Mistral',
      alphaModel: 'Mistral Large 2',
      alphaVersion: '2024.07',
      predecessors: ['Mistral Large', 'Mistral Medium', 'Mistral 7B'],
      successorCandidate: null,
      status: 'active',
      resolvedAt: now
    });

    this._registerAlpha({
      familyId: 'AIF-013',
      familyName: 'Stable Diffusion',
      alphaModel: 'SDXL Turbo',
      alphaVersion: '2024.02',
      predecessors: ['SDXL 1.0', 'SD 2.1', 'SD 1.5'],
      successorCandidate: 'SD3',
      status: 'active',
      resolvedAt: now
    });

    this._registerAlpha({
      familyId: 'AIF-014',
      familyName: 'DALL-E',
      alphaModel: 'DALL-E 3',
      alphaVersion: '2023.10',
      predecessors: ['DALL-E 2', 'DALL-E 1'],
      successorCandidate: 'DALL-E 4',
      status: 'active',
      resolvedAt: now
    });

    this._registerAlpha({
      familyId: 'AIF-019',
      familyName: 'Codex / Copilot',
      alphaModel: 'GPT-4o (code-tuned)',
      alphaVersion: '2024.08',
      predecessors: ['Codex', 'GPT-3 davinci'],
      successorCandidate: null,
      status: 'active',
      resolvedAt: now
    });

    /* ---- Remaining 32 families ---- */

    this._registerAlpha({
      familyId: 'AIF-006',
      familyName: 'Command R',
      alphaModel: 'Command R+',
      alphaVersion: '2024.04',
      predecessors: ['Command R', 'Command'],
      successorCandidate: null,
      status: 'active',
      resolvedAt: now
    });

    this._registerAlpha({
      familyId: 'AIF-007',
      familyName: 'Phi',
      alphaModel: 'Phi-3 Medium',
      alphaVersion: '2024.05',
      predecessors: ['Phi-2', 'Phi-1.5'],
      successorCandidate: 'Phi-4',
      status: 'active',
      resolvedAt: now
    });

    this._registerAlpha({
      familyId: 'AIF-008',
      familyName: 'Gemma',
      alphaModel: 'Gemma 2 27B',
      alphaVersion: '2024.06',
      predecessors: ['Gemma 7B'],
      successorCandidate: null,
      status: 'active',
      resolvedAt: now
    });

    this._registerAlpha({
      familyId: 'AIF-009',
      familyName: 'Qwen',
      alphaModel: 'Qwen2 72B',
      alphaVersion: '2024.06',
      predecessors: ['Qwen 72B', 'Qwen 14B'],
      successorCandidate: 'Qwen3',
      status: 'active',
      resolvedAt: now
    });

    this._registerAlpha({
      familyId: 'AIF-010',
      familyName: 'DBRX',
      alphaModel: 'DBRX 132B',
      alphaVersion: '2024.03',
      predecessors: ['Dolly v2'],
      successorCandidate: null,
      status: 'active',
      resolvedAt: now
    });

    this._registerAlpha({
      familyId: 'AIF-011',
      familyName: 'Falcon',
      alphaModel: 'Falcon 180B',
      alphaVersion: '2023.09',
      predecessors: ['Falcon 40B', 'Falcon 7B'],
      successorCandidate: null,
      status: 'active',
      resolvedAt: now
    });

    this._registerAlpha({
      familyId: 'AIF-012',
      familyName: 'Yi',
      alphaModel: 'Yi-34B',
      alphaVersion: '2024.03',
      predecessors: ['Yi-6B'],
      successorCandidate: null,
      status: 'active',
      resolvedAt: now
    });

    this._registerAlpha({
      familyId: 'AIF-015',
      familyName: 'Midjourney',
      alphaModel: 'Midjourney v6',
      alphaVersion: '2024.01',
      predecessors: ['Midjourney v5.2', 'Midjourney v5'],
      successorCandidate: 'Midjourney v7',
      status: 'active',
      resolvedAt: now
    });

    this._registerAlpha({
      familyId: 'AIF-016',
      familyName: 'Whisper',
      alphaModel: 'Whisper Large v3',
      alphaVersion: '2023.11',
      predecessors: ['Whisper Large v2', 'Whisper Large'],
      successorCandidate: null,
      status: 'active',
      resolvedAt: now
    });

    this._registerAlpha({
      familyId: 'AIF-017',
      familyName: 'ElevenLabs',
      alphaModel: 'Turbo v2.5',
      alphaVersion: '2024.04',
      predecessors: ['Turbo v2', 'Multilingual v2'],
      successorCandidate: null,
      status: 'active',
      resolvedAt: now
    });

    this._registerAlpha({
      familyId: 'AIF-018',
      familyName: 'Suno',
      alphaModel: 'Suno v3.5',
      alphaVersion: '2024.06',
      predecessors: ['Suno v3', 'Suno v2'],
      successorCandidate: null,
      status: 'active',
      resolvedAt: now
    });

    this._registerAlpha({
      familyId: 'AIF-020',
      familyName: 'CodeLlama',
      alphaModel: 'CodeLlama 70B',
      alphaVersion: '2024.01',
      predecessors: ['CodeLlama 34B', 'CodeLlama 13B'],
      successorCandidate: null,
      status: 'active',
      resolvedAt: now
    });

    this._registerAlpha({
      familyId: 'AIF-021',
      familyName: 'DeepSeek',
      alphaModel: 'DeepSeek-V2',
      alphaVersion: '2024.05',
      predecessors: ['DeepSeek-Coder 33B', 'DeepSeek 67B'],
      successorCandidate: 'DeepSeek-V3',
      status: 'active',
      resolvedAt: now
    });

    this._registerAlpha({
      familyId: 'AIF-022',
      familyName: 'Perplexity',
      alphaModel: 'Perplexity Online',
      alphaVersion: '2024.08',
      predecessors: ['Perplexity pplx-70b'],
      successorCandidate: null,
      status: 'active',
      resolvedAt: now
    });

    this._registerAlpha({
      familyId: 'AIF-023',
      familyName: 'Grok',
      alphaModel: 'Grok-2',
      alphaVersion: '2024.08',
      predecessors: ['Grok-1.5', 'Grok-1'],
      successorCandidate: 'Grok-3',
      status: 'active',
      resolvedAt: now
    });

    this._registerAlpha({
      familyId: 'AIF-024',
      familyName: 'Inflection',
      alphaModel: 'Pi',
      alphaVersion: '2024.03',
      predecessors: ['Inflection-1'],
      successorCandidate: null,
      status: 'active',
      resolvedAt: now
    });

    this._registerAlpha({
      familyId: 'AIF-025',
      familyName: 'Jamba',
      alphaModel: 'Jamba 1.5',
      alphaVersion: '2024.08',
      predecessors: ['Jamba 1.0'],
      successorCandidate: null,
      status: 'active',
      resolvedAt: now
    });

    this._registerAlpha({
      familyId: 'AIF-026',
      familyName: 'Sora',
      alphaModel: 'Sora',
      alphaVersion: '2024.02',
      predecessors: [],
      successorCandidate: null,
      status: 'preview',
      resolvedAt: now
    });

    this._registerAlpha({
      familyId: 'AIF-027',
      familyName: 'Runway',
      alphaModel: 'Gen-3 Alpha',
      alphaVersion: '2024.06',
      predecessors: ['Gen-2', 'Gen-1'],
      successorCandidate: null,
      status: 'active',
      resolvedAt: now
    });

    this._registerAlpha({
      familyId: 'AIF-028',
      familyName: 'Pika',
      alphaModel: 'Pika 1.0',
      alphaVersion: '2024.03',
      predecessors: ['Pika Beta'],
      successorCandidate: null,
      status: 'active',
      resolvedAt: now
    });

    this._registerAlpha({
      familyId: 'AIF-029',
      familyName: 'Kling',
      alphaModel: 'Kling',
      alphaVersion: '2024.06',
      predecessors: [],
      successorCandidate: null,
      status: 'active',
      resolvedAt: now
    });

    this._registerAlpha({
      familyId: 'AIF-030',
      familyName: 'AlphaFold',
      alphaModel: 'AlphaFold 3',
      alphaVersion: '2024.05',
      predecessors: ['AlphaFold 2', 'AlphaFold 1'],
      successorCandidate: null,
      status: 'active',
      resolvedAt: now
    });

    this._registerAlpha({
      familyId: 'AIF-031',
      familyName: 'AlphaCode',
      alphaModel: 'AlphaCode 2',
      alphaVersion: '2023.12',
      predecessors: ['AlphaCode 1'],
      successorCandidate: null,
      status: 'active',
      resolvedAt: now
    });

    this._registerAlpha({
      familyId: 'AIF-032',
      familyName: 'RT-2',
      alphaModel: 'RT-2-X',
      alphaVersion: '2023.10',
      predecessors: ['RT-2', 'RT-1'],
      successorCandidate: null,
      status: 'preview',
      resolvedAt: now
    });

    this._registerAlpha({
      familyId: 'AIF-033',
      familyName: 'Segment Anything',
      alphaModel: 'SAM 2',
      alphaVersion: '2024.07',
      predecessors: ['SAM 1'],
      successorCandidate: null,
      status: 'active',
      resolvedAt: now
    });

    this._registerAlpha({
      familyId: 'AIF-034',
      familyName: 'CLIP',
      alphaModel: 'CLIP ViT-L/14',
      alphaVersion: '2023.01',
      predecessors: ['CLIP ViT-B/32'],
      successorCandidate: null,
      status: 'active',
      resolvedAt: now
    });

    this._registerAlpha({
      familyId: 'AIF-035',
      familyName: 'Florence',
      alphaModel: 'Florence-2',
      alphaVersion: '2024.06',
      predecessors: ['Florence-1'],
      successorCandidate: null,
      status: 'active',
      resolvedAt: now
    });

    this._registerAlpha({
      familyId: 'AIF-036',
      familyName: 'Minerva / Llemma',
      alphaModel: 'Llemma 34B',
      alphaVersion: '2023.10',
      predecessors: ['Minerva 540B'],
      successorCandidate: null,
      status: 'active',
      resolvedAt: now
    });

    this._registerAlpha({
      familyId: 'AIF-037',
      familyName: 'MusicLM / MusicGen',
      alphaModel: 'MusicGen Large',
      alphaVersion: '2024.01',
      predecessors: ['MusicLM'],
      successorCandidate: null,
      status: 'active',
      resolvedAt: now
    });

    this._registerAlpha({
      familyId: 'AIF-038',
      familyName: 'Embedding Models',
      alphaModel: 'text-embedding-3-large',
      alphaVersion: '2024.01',
      predecessors: ['text-embedding-ada-002'],
      successorCandidate: null,
      status: 'active',
      resolvedAt: now
    });

    this._registerAlpha({
      familyId: 'AIF-039',
      familyName: 'Reranking Models',
      alphaModel: 'Cohere Rerank v3',
      alphaVersion: '2024.03',
      predecessors: ['Cohere Rerank v2'],
      successorCandidate: null,
      status: 'active',
      resolvedAt: now
    });

    this._registerAlpha({
      familyId: 'AIF-040',
      familyName: 'Guard Models',
      alphaModel: 'Llama Guard 3',
      alphaVersion: '2024.07',
      predecessors: ['Llama Guard 2', 'Llama Guard 1'],
      successorCandidate: null,
      status: 'active',
      resolvedAt: now
    });

    /* ---- Cross-family fallback chains ---- */

    // P0 fallback — general-purpose frontier reasoning
    this.fallbackChains.set('AIF-001', ['AIF-002', 'AIF-003', 'AIF-004']);
    this.fallbackChains.set('AIF-002', ['AIF-001', 'AIF-003', 'AIF-004']);
    this.fallbackChains.set('AIF-003', ['AIF-001', 'AIF-002', 'AIF-004']);
    this.fallbackChains.set('AIF-004', ['AIF-001', 'AIF-002', 'AIF-003']);
    this.fallbackChains.set('AIF-005', ['AIF-004', 'AIF-001', 'AIF-002']);

    // Code fallback chain
    this.fallbackChains.set('AIF-019', ['AIF-020', 'AIF-021']);
    this.fallbackChains.set('AIF-020', ['AIF-019', 'AIF-021']);
    this.fallbackChains.set('AIF-021', ['AIF-019', 'AIF-020']);

    // Vision / image-gen fallback chain
    this.fallbackChains.set('AIF-014', ['AIF-013', 'AIF-015']);
    this.fallbackChains.set('AIF-013', ['AIF-014', 'AIF-015']);
    this.fallbackChains.set('AIF-015', ['AIF-014', 'AIF-013']);

    // Audio fallback chain
    this.fallbackChains.set('AIF-016', []);
    this.fallbackChains.set('AIF-017', ['AIF-018']);
    this.fallbackChains.set('AIF-018', ['AIF-017']);

    // Safety fallback chain
    this.fallbackChains.set('AIF-040', []);

    // Embedding fallback chain
    this.fallbackChains.set('AIF-038', ['AIF-034']);
    this.fallbackChains.set('AIF-034', ['AIF-038']);

    // Reranking fallback
    this.fallbackChains.set('AIF-039', ['AIF-006']);

    // RAG fallback
    this.fallbackChains.set('AIF-006', ['AIF-022', 'AIF-001']);

    // Edge model fallback
    this.fallbackChains.set('AIF-007', ['AIF-008']);
    this.fallbackChains.set('AIF-008', ['AIF-007']);

    // Multilingual fallback
    this.fallbackChains.set('AIF-009', ['AIF-012', 'AIF-005']);
    this.fallbackChains.set('AIF-012', ['AIF-009', 'AIF-005']);

    // Data / MoE fallback
    this.fallbackChains.set('AIF-010', ['AIF-021', 'AIF-009']);

    // Open multilingual fallback
    this.fallbackChains.set('AIF-011', ['AIF-004', 'AIF-009']);

    // Search fallback
    this.fallbackChains.set('AIF-022', ['AIF-023', 'AIF-001']);
    this.fallbackChains.set('AIF-023', ['AIF-022', 'AIF-001']);

    // Empathy / conversational fallback
    this.fallbackChains.set('AIF-024', ['AIF-002']);

    // Hybrid architecture fallback
    this.fallbackChains.set('AIF-025', ['AIF-005', 'AIF-009']);

    // Video generation fallback
    this.fallbackChains.set('AIF-026', ['AIF-027', 'AIF-028']);
    this.fallbackChains.set('AIF-027', ['AIF-026', 'AIF-028']);
    this.fallbackChains.set('AIF-028', ['AIF-027', 'AIF-029']);
    this.fallbackChains.set('AIF-029', ['AIF-027', 'AIF-028']);

    // Science / structure fallback
    this.fallbackChains.set('AIF-030', []);
    this.fallbackChains.set('AIF-031', ['AIF-021', 'AIF-019']);

    // Robotics fallback
    this.fallbackChains.set('AIF-032', []);

    // Vision understanding fallback
    this.fallbackChains.set('AIF-033', ['AIF-035']);
    this.fallbackChains.set('AIF-035', ['AIF-033']);

    // Math fallback
    this.fallbackChains.set('AIF-036', ['AIF-031', 'AIF-021']);

    // Music generation fallback
    this.fallbackChains.set('AIF-037', ['AIF-018']);
  }

  /* ------------------------------------------------------------------ */
  /*  Capability-to-family mapping (cached)                              */
  /* ------------------------------------------------------------------ */

  /**
   * Builds a capability → familyId[] index from seeded alpha records.
   * @returns {Map<string, string[]>}
   * @private
   */
  _buildCapabilityIndex() {
    if (this._capabilityIndex) return this._capabilityIndex;

    /** @type {Map<string, string[]>} */
    this._capabilityIndex = new Map();

    const capMap = {
      'multi-modal reasoning':  'AIF-001',
      'long-context reasoning': 'AIF-002',
      'native multi-modal reasoning': 'AIF-003',
      'open-source frontier reasoning': 'AIF-004',
      'efficient high-capability reasoning': 'AIF-005',
      'enterprise rag reasoning': 'AIF-006',
      'efficient edge reasoning': 'AIF-007',
      'open efficient reasoning': 'AIF-008',
      'multilingual reasoning': 'AIF-009',
      'efficient moe reasoning': 'AIF-010',
      'multilingual open reasoning': 'AIF-011',
      'chinese-english bilingual reasoning': 'AIF-012',
      'image generation from text': 'AIF-013',
      'high-fidelity image generation': 'AIF-014',
      'aesthetic-optimized image generation': 'AIF-015',
      'multilingual speech-to-text': 'AIF-016',
      'natural voice generation': 'AIF-017',
      'ai music composition': 'AIF-018',
      'autonomous code generation': 'AIF-019',
      'open-source code generation': 'AIF-020',
      'efficient code + math reasoning': 'AIF-021',
      'real-time search + reasoning': 'AIF-022',
      'real-time social reasoning': 'AIF-023',
      'conversational empathy': 'AIF-024',
      'long-context hybrid reasoning': 'AIF-025',
      'text-to-video generation': 'AIF-026',
      'ai video editing + generation': 'AIF-027',
      'text/image to video motion': 'AIF-028',
      'extended video generation': 'AIF-029',
      'molecular structure prediction': 'AIF-030',
      'algorithmic problem solving': 'AIF-031',
      'robotic action generation': 'AIF-032',
      'zero-shot image/video segmentation': 'AIF-033',
      'image-text alignment': 'AIF-034',
      'multi-task visual understanding': 'AIF-035',
      'formal mathematical reasoning': 'AIF-036',
      'music generation + understanding': 'AIF-037',
      'dense vector representation': 'AIF-038',
      'search result reranking': 'AIF-039',
      'content safety classification': 'AIF-040',
      // Broad aliases
      'reasoning':       'AIF-001',
      'code':            'AIF-019',
      'code generation': 'AIF-019',
      'image generation': 'AIF-014',
      'video generation': 'AIF-026',
      'audio':           'AIF-016',
      'speech':          'AIF-016',
      'voice':           'AIF-017',
      'music':           'AIF-018',
      'embedding':       'AIF-038',
      'search':          'AIF-022',
      'safety':          'AIF-040',
      'math':            'AIF-036',
      'robotics':        'AIF-032',
      'segmentation':    'AIF-033',
      'reranking':       'AIF-039',
      'rag':             'AIF-006',
      'science':         'AIF-030',
      'vision':          'AIF-014'
    };

    for (const [cap, fid] of Object.entries(capMap)) {
      const existing = this._capabilityIndex.get(cap) ?? [];
      if (!existing.includes(fid)) existing.push(fid);
      this._capabilityIndex.set(cap, existing);
    }

    return this._capabilityIndex;
  }

  /* ------------------------------------------------------------------ */
  /*  Priority helpers                                                   */
  /* ------------------------------------------------------------------ */

  /**
   * Priority ranking for cross-family comparison.
   * @type {Record<string, number>}
   * @private
   */
  static _PRIORITY_RANK = {
    'P0': 0,
    'P1': 1,
    'P2': 2,
    'P3': 3
  };

  /**
   * @type {Record<string, string>}
   * @private
   */
  static _FAMILY_PRIORITY = {
    'AIF-001': 'P0', 'AIF-002': 'P0', 'AIF-003': 'P0',
    'AIF-004': 'P1', 'AIF-005': 'P1', 'AIF-006': 'P1',
    'AIF-007': 'P2', 'AIF-008': 'P2', 'AIF-009': 'P2',
    'AIF-010': 'P2', 'AIF-011': 'P3', 'AIF-012': 'P3',
    'AIF-013': 'P1', 'AIF-014': 'P1', 'AIF-015': 'P2',
    'AIF-016': 'P1', 'AIF-017': 'P1', 'AIF-018': 'P2',
    'AIF-019': 'P0', 'AIF-020': 'P2', 'AIF-021': 'P2',
    'AIF-022': 'P1', 'AIF-023': 'P2', 'AIF-024': 'P2',
    'AIF-025': 'P2', 'AIF-026': 'P1', 'AIF-027': 'P2',
    'AIF-028': 'P3', 'AIF-029': 'P3', 'AIF-030': 'P1',
    'AIF-031': 'P2', 'AIF-032': 'P2', 'AIF-033': 'P1',
    'AIF-034': 'P1', 'AIF-035': 'P2', 'AIF-036': 'P2',
    'AIF-037': 'P3', 'AIF-038': 'P0', 'AIF-039': 'P1',
    'AIF-040': 'P0'
  };

  /* ------------------------------------------------------------------ */
  /*  Public API                                                         */
  /* ------------------------------------------------------------------ */

  /**
   * Returns the current alpha model record for a given family.
   * @param {string} familyId — e.g. "AIF-001"
   * @returns {object|null} alpha record or null if not found
   */
  resolveAlpha(familyId) {
    return this.alphas.get(familyId) ?? null;
  }

  /**
   * Returns the best alpha for a given capability keyword.
   * Matches against the primary capability of each family, preferring
   * P0 over P1 over P2 over P3.
   * @param {string} capability — e.g. "code generation", "reasoning"
   * @returns {object|null} alpha record of the best match, or null
   */
  resolveByCapability(capability) {
    const key = capability.toLowerCase().trim();
    const index = this._buildCapabilityIndex();
    const familyIds = index.get(key);

    if (!familyIds || familyIds.length === 0) {
      // Attempt partial match
      for (const [cap, fids] of index) {
        if (cap.includes(key) || key.includes(cap)) {
          return this.alphas.get(fids[0]) ?? null;
        }
      }
      return null;
    }

    // Sort by priority (P0 first)
    const sorted = [...familyIds].sort((a, b) => {
      const pa = AlphaResolver._PRIORITY_RANK[AlphaResolver._FAMILY_PRIORITY[a] ?? 'P3'] ?? 9;
      const pb = AlphaResolver._PRIORITY_RANK[AlphaResolver._FAMILY_PRIORITY[b] ?? 'P3'] ?? 9;
      return pa - pb;
    });

    return this.alphas.get(sorted[0]) ?? null;
  }

  /**
   * Returns the version history array for a family (newest first).
   * @param {string} familyId — e.g. "AIF-001"
   * @returns {string[]} version lineage or empty array
   */
  getLineage(familyId) {
    return this.lineage.get(familyId) ?? [];
  }

  /**
   * Returns the ordered fallback family IDs for a given family.
   * @param {string} familyId — e.g. "AIF-001"
   * @returns {string[]} ordered fallback chain or empty array
   */
  getFallbackChain(familyId) {
    return this.fallbackChains.get(familyId) ?? [];
  }

  /**
   * Returns the next fallback alpha if the primary alpha for the
   * given family is unavailable. Respects configured fallbackDepth.
   * @param {string} familyId — e.g. "AIF-001"
   * @returns {object|null} fallback alpha record, or null if none available
   */
  fallback(familyId) {
    const chain = this.fallbackChains.get(familyId);
    if (!chain || chain.length === 0) return null;

    const limit = Math.min(chain.length, this.fallbackDepth);
    for (let i = 0; i < limit; i++) {
      const candidate = this.alphas.get(chain[i]);
      if (candidate && candidate.status === 'active') {
        return candidate;
      }
    }
    return null;
  }

  /**
   * Promotes a new model to alpha status within a family.
   * The current alpha is pushed to the front of the predecessors list.
   * @param {string} familyId — e.g. "AIF-001"
   * @param {string} newAlphaModel — e.g. "GPT-5"
   * @param {string} newVersion — e.g. "2025.03"
   * @returns {object} the updated alpha record
   * @throws {Error} if familyId is not found
   */
  promoteAlpha(familyId, newAlphaModel, newVersion) {
    const existing = this.alphas.get(familyId);
    if (!existing) {
      throw new Error(`AlphaResolver: unknown family "${familyId}"`);
    }

    const updatedPredecessors = [existing.alphaModel, ...existing.predecessors];
    const updated = {
      ...existing,
      alphaModel: newAlphaModel,
      alphaVersion: newVersion,
      predecessors: updatedPredecessors,
      successorCandidate: null,
      status: 'active',
      resolvedAt: Date.now()
    };

    this.alphas.set(familyId, updated);
    this.lineage.set(familyId, [newAlphaModel, ...updatedPredecessors]);
    this._capabilityIndex = null; // bust cache

    return updated;
  }

  /**
   * Marks the current alpha of a family as deprecated and activates
   * the fallback chain.
   * @param {string} familyId — e.g. "AIF-001"
   * @returns {object} the updated (deprecated) alpha record
   * @throws {Error} if familyId is not found
   */
  deprecateAlpha(familyId) {
    const existing = this.alphas.get(familyId);
    if (!existing) {
      throw new Error(`AlphaResolver: unknown family "${familyId}"`);
    }

    const updated = {
      ...existing,
      status: 'deprecated',
      resolvedAt: Date.now()
    };

    this.alphas.set(familyId, updated);
    this._capabilityIndex = null;

    return updated;
  }

  /**
   * Returns a full resolution report for all 40 families.
   * @returns {object[]} array of family summary objects
   */
  getResolutionReport() {
    const report = [];

    for (const [familyId, alpha] of this.alphas) {
      const lin = this.lineage.get(familyId) ?? [];
      const chain = this.fallbackChains.get(familyId) ?? [];

      report.push({
        familyId,
        familyName: alpha.familyName,
        alphaModel: alpha.alphaModel,
        alphaVersion: alpha.alphaVersion,
        status: alpha.status,
        lineageDepth: lin.length,
        fallbackChainLength: chain.length,
        fallbackFamilies: chain,
        predecessors: alpha.predecessors,
        successorCandidate: alpha.successorCandidate,
        resolvedAt: alpha.resolvedAt
      });
    }

    return report;
  }
}

export { AlphaResolver };
export default AlphaResolver;
