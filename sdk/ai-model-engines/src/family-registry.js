/**
 * @medina/ai-model-engines — FamilyRegistry
 *
 * Complete catalogue of all 40 AI model families with deterministic IDs,
 * capability metadata, ring affinity, routing priority, and organism placement.
 *
 * @module @medina/ai-model-engines/family-registry
 */

class FamilyRegistry {
  /** Initialises the registry and seeds all 40 model families. */
  constructor() {
    /** @type {Map<string, object>} */
    this.families = new Map();
    this._seed();
  }

  /* ------------------------------------------------------------------ */
  /*  Internal helpers                                                   */
  /* ------------------------------------------------------------------ */

  /**
   * Registers a single family record.
   * @param {object} family — family descriptor object
   * @private
   */
  _register(family) {
    this.families.set(family.id, family);
  }

  /**
   * Seeds the registry with all 40 AI model families.
   * @private
   */
  _seed() {
    this._register({
      id: 'AIF-001',
      name: 'GPT',
      parentOrg: 'OpenAI',
      alphaModel: 'GPT-4o',
      alphaVersion: '2024.08',
      intelligenceClass: 'Generative Transformer Intelligence',
      primaryCapability: 'Multi-modal reasoning',
      secondaryCapabilities: [
        'code generation',
        'vision',
        'audio',
        'function calling',
        'structured output'
      ],
      parameterClass: 'Frontier (>100B)',
      contextWindow: '128K tokens',
      modality: 'Text + Vision + Audio',
      ringAffinity: 'Interface Ring',
      organismPlacement: 'Organism core / reasoning layer',
      routingPriority: 'P0',
      wireProtocol: 'intelligence-wire/openai',
      engineStatus: 'active'
    });

    this._register({
      id: 'AIF-002',
      name: 'Claude',
      parentOrg: 'Anthropic',
      alphaModel: 'Claude 3.5 Sonnet',
      alphaVersion: '2024.06',
      intelligenceClass: 'Constitutional AI Intelligence',
      primaryCapability: 'Long-context reasoning',
      secondaryCapabilities: [
        'code generation',
        'analysis',
        'vision',
        'structured output',
        'safety-first'
      ],
      parameterClass: 'Frontier (>100B)',
      contextWindow: '200K tokens',
      modality: 'Text + Vision',
      ringAffinity: 'Interface Ring',
      organismPlacement: 'Organism core / reasoning layer',
      routingPriority: 'P0',
      wireProtocol: 'intelligence-wire/anthropic',
      engineStatus: 'active'
    });

    this._register({
      id: 'AIF-003',
      name: 'Gemini',
      parentOrg: 'Google DeepMind',
      alphaModel: 'Gemini 1.5 Pro',
      alphaVersion: '2024.05',
      intelligenceClass: 'Multi-modal Fusion Intelligence',
      primaryCapability: 'Native multi-modal reasoning',
      secondaryCapabilities: [
        'code generation',
        'vision',
        'audio',
        'video',
        'long-context',
        'grounding'
      ],
      parameterClass: 'Frontier (>100B)',
      contextWindow: '2M tokens',
      modality: 'Text + Vision + Audio + Video',
      ringAffinity: 'Interface Ring',
      organismPlacement: 'Organism core / reasoning layer',
      routingPriority: 'P0',
      wireProtocol: 'intelligence-wire/google',
      engineStatus: 'active'
    });

    this._register({
      id: 'AIF-004',
      name: 'Llama',
      parentOrg: 'Meta',
      alphaModel: 'Llama 3.1 405B',
      alphaVersion: '2024.07',
      intelligenceClass: 'Open-Weight Transformer Intelligence',
      primaryCapability: 'Open-source frontier reasoning',
      secondaryCapabilities: [
        'code generation',
        'multilingual',
        'instruction following',
        'tool use'
      ],
      parameterClass: 'Open Frontier (405B)',
      contextWindow: '128K tokens',
      modality: 'Text',
      ringAffinity: 'Sovereign Ring',
      organismPlacement: 'Organism core / sovereign compute layer',
      routingPriority: 'P1',
      wireProtocol: 'intelligence-wire/meta',
      engineStatus: 'active'
    });

    this._register({
      id: 'AIF-005',
      name: 'Mistral',
      parentOrg: 'Mistral AI',
      alphaModel: 'Mistral Large 2',
      alphaVersion: '2024.07',
      intelligenceClass: 'Efficient Frontier Intelligence',
      primaryCapability: 'Efficient high-capability reasoning',
      secondaryCapabilities: [
        'code generation',
        'multilingual',
        'function calling',
        'JSON mode'
      ],
      parameterClass: 'Frontier (>100B)',
      contextWindow: '128K tokens',
      modality: 'Text',
      ringAffinity: 'Interface Ring',
      organismPlacement: 'Organism core / reasoning layer',
      routingPriority: 'P1',
      wireProtocol: 'intelligence-wire/mistral',
      engineStatus: 'active'
    });

    this._register({
      id: 'AIF-006',
      name: 'Command R',
      parentOrg: 'Cohere',
      alphaModel: 'Command R+',
      alphaVersion: '2024.04',
      intelligenceClass: 'Retrieval-Augmented Intelligence',
      primaryCapability: 'Enterprise RAG reasoning',
      secondaryCapabilities: [
        'search grounding',
        'citation',
        'multilingual',
        'tool use'
      ],
      parameterClass: 'Frontier (>100B)',
      contextWindow: '128K tokens',
      modality: 'Text',
      ringAffinity: 'Memory Ring',
      organismPlacement: 'Frontend organism / knowledge layer',
      routingPriority: 'P1',
      wireProtocol: 'intelligence-wire/cohere',
      engineStatus: 'active'
    });

    this._register({
      id: 'AIF-007',
      name: 'Phi',
      parentOrg: 'Microsoft Research',
      alphaModel: 'Phi-3 Medium',
      alphaVersion: '2024.05',
      intelligenceClass: 'Small Language Model Intelligence',
      primaryCapability: 'Efficient edge reasoning',
      secondaryCapabilities: [
        'code generation',
        'math',
        'reasoning at small scale'
      ],
      parameterClass: 'Compact (14B)',
      contextWindow: '128K tokens',
      modality: 'Text',
      ringAffinity: 'Sovereign Ring',
      organismPlacement: 'Organism core / edge compute layer',
      routingPriority: 'P2',
      wireProtocol: 'intelligence-wire/microsoft',
      engineStatus: 'active'
    });

    this._register({
      id: 'AIF-008',
      name: 'Gemma',
      parentOrg: 'Google DeepMind',
      alphaModel: 'Gemma 2 27B',
      alphaVersion: '2024.06',
      intelligenceClass: 'Open Small Model Intelligence',
      primaryCapability: 'Open efficient reasoning',
      secondaryCapabilities: [
        'code generation',
        'instruction following',
        'safety'
      ],
      parameterClass: 'Compact (27B)',
      contextWindow: '8K tokens',
      modality: 'Text',
      ringAffinity: 'Sovereign Ring',
      organismPlacement: 'Organism core / edge compute layer',
      routingPriority: 'P2',
      wireProtocol: 'intelligence-wire/google-open',
      engineStatus: 'active'
    });

    this._register({
      id: 'AIF-009',
      name: 'Qwen',
      parentOrg: 'Alibaba Cloud',
      alphaModel: 'Qwen2 72B',
      alphaVersion: '2024.06',
      intelligenceClass: 'Multilingual Transformer Intelligence',
      primaryCapability: 'Multilingual reasoning',
      secondaryCapabilities: [
        'code generation',
        'math',
        'multilingual',
        'long-context'
      ],
      parameterClass: 'Large (72B)',
      contextWindow: '128K tokens',
      modality: 'Text',
      ringAffinity: 'Interface Ring',
      organismPlacement: 'Organism core / multilingual layer',
      routingPriority: 'P2',
      wireProtocol: 'intelligence-wire/alibaba',
      engineStatus: 'active'
    });

    this._register({
      id: 'AIF-010',
      name: 'DBRX',
      parentOrg: 'Databricks',
      alphaModel: 'DBRX 132B',
      alphaVersion: '2024.03',
      intelligenceClass: 'Mixture-of-Experts Intelligence',
      primaryCapability: 'Efficient MoE reasoning',
      secondaryCapabilities: [
        'code generation',
        'SQL',
        'data analysis',
        'retrieval'
      ],
      parameterClass: 'MoE (132B/36B active)',
      contextWindow: '32K tokens',
      modality: 'Text',
      ringAffinity: 'Build Ring',
      organismPlacement: 'Frontend organism / data layer',
      routingPriority: 'P2',
      wireProtocol: 'intelligence-wire/databricks',
      engineStatus: 'active'
    });

    this._register({
      id: 'AIF-011',
      name: 'Falcon',
      parentOrg: 'TII (UAE)',
      alphaModel: 'Falcon 180B',
      alphaVersion: '2023.09',
      intelligenceClass: 'Open Multilingual Intelligence',
      primaryCapability: 'Multilingual open reasoning',
      secondaryCapabilities: [
        'multilingual',
        'instruction following',
        'long-form generation'
      ],
      parameterClass: 'Open Frontier (180B)',
      contextWindow: '4K tokens',
      modality: 'Text',
      ringAffinity: 'Sovereign Ring',
      organismPlacement: 'Organism core / sovereign compute layer',
      routingPriority: 'P3',
      wireProtocol: 'intelligence-wire/tii',
      engineStatus: 'active'
    });

    this._register({
      id: 'AIF-012',
      name: 'Yi',
      parentOrg: '01.AI',
      alphaModel: 'Yi-34B',
      alphaVersion: '2024.03',
      intelligenceClass: 'Dense Bilingual Intelligence',
      primaryCapability: 'Chinese-English bilingual reasoning',
      secondaryCapabilities: [
        'bilingual',
        'code',
        'math',
        'long-context'
      ],
      parameterClass: 'Large (34B)',
      contextWindow: '200K tokens',
      modality: 'Text',
      ringAffinity: 'Interface Ring',
      organismPlacement: 'Organism core / multilingual layer',
      routingPriority: 'P3',
      wireProtocol: 'intelligence-wire/01ai',
      engineStatus: 'active'
    });

    this._register({
      id: 'AIF-013',
      name: 'Stable Diffusion',
      parentOrg: 'Stability AI',
      alphaModel: 'SDXL Turbo',
      alphaVersion: '2024.02',
      intelligenceClass: 'Diffusion Generation Intelligence',
      primaryCapability: 'Image generation from text',
      secondaryCapabilities: [
        'image synthesis',
        'inpainting',
        'img2img',
        'controlnet'
      ],
      parameterClass: 'Diffusion (3.5B)',
      contextWindow: '77 tokens (prompt)',
      modality: 'Text → Image',
      ringAffinity: 'Geometry Ring',
      organismPlacement: 'Frontend organism / scene layer',
      routingPriority: 'P1',
      wireProtocol: 'intelligence-wire/stability',
      engineStatus: 'active'
    });

    this._register({
      id: 'AIF-014',
      name: 'DALL-E',
      parentOrg: 'OpenAI',
      alphaModel: 'DALL-E 3',
      alphaVersion: '2023.10',
      intelligenceClass: 'Prompt-Guided Diffusion Intelligence',
      primaryCapability: 'High-fidelity image generation',
      secondaryCapabilities: [
        'image synthesis',
        'text rendering',
        'style control'
      ],
      parameterClass: 'Diffusion (>10B)',
      contextWindow: '4000 chars (prompt)',
      modality: 'Text → Image',
      ringAffinity: 'Geometry Ring',
      organismPlacement: 'Frontend organism / scene layer',
      routingPriority: 'P1',
      wireProtocol: 'intelligence-wire/openai-vision',
      engineStatus: 'active'
    });

    this._register({
      id: 'AIF-015',
      name: 'Midjourney',
      parentOrg: 'Midjourney',
      alphaModel: 'Midjourney v6',
      alphaVersion: '2024.01',
      intelligenceClass: 'Aesthetic Diffusion Intelligence',
      primaryCapability: 'Aesthetic-optimized image generation',
      secondaryCapabilities: [
        'image synthesis',
        'style transfer',
        'upscaling',
        'variation'
      ],
      parameterClass: 'Diffusion (est. >10B)',
      contextWindow: '6000 chars (prompt)',
      modality: 'Text → Image',
      ringAffinity: 'Geometry Ring',
      organismPlacement: 'Frontend organism / scene layer',
      routingPriority: 'P2',
      wireProtocol: 'intelligence-wire/midjourney',
      engineStatus: 'active'
    });

    this._register({
      id: 'AIF-016',
      name: 'Whisper',
      parentOrg: 'OpenAI',
      alphaModel: 'Whisper Large v3',
      alphaVersion: '2023.11',
      intelligenceClass: 'Speech Recognition Intelligence',
      primaryCapability: 'Multilingual speech-to-text',
      secondaryCapabilities: [
        'transcription',
        'translation',
        'timestamp',
        'language detection'
      ],
      parameterClass: 'Compact (1.5B)',
      contextWindow: '30s chunks',
      modality: 'Audio → Text',
      ringAffinity: 'Native Capability Ring',
      organismPlacement: 'Frontend organism / native runtime layer',
      routingPriority: 'P1',
      wireProtocol: 'intelligence-wire/openai-audio',
      engineStatus: 'active'
    });

    this._register({
      id: 'AIF-017',
      name: 'ElevenLabs',
      parentOrg: 'ElevenLabs',
      alphaModel: 'Turbo v2.5',
      alphaVersion: '2024.04',
      intelligenceClass: 'Voice Synthesis Intelligence',
      primaryCapability: 'Natural voice generation',
      secondaryCapabilities: [
        'text-to-speech',
        'voice cloning',
        'emotion control',
        'streaming'
      ],
      parameterClass: 'Proprietary',
      contextWindow: '5000 chars',
      modality: 'Text → Audio',
      ringAffinity: 'Native Capability Ring',
      organismPlacement: 'Frontend organism / native runtime layer',
      routingPriority: 'P1',
      wireProtocol: 'intelligence-wire/elevenlabs',
      engineStatus: 'active'
    });

    this._register({
      id: 'AIF-018',
      name: 'Suno',
      parentOrg: 'Suno',
      alphaModel: 'Suno v3.5',
      alphaVersion: '2024.06',
      intelligenceClass: 'Music Generation Intelligence',
      primaryCapability: 'AI music composition',
      secondaryCapabilities: [
        'music generation',
        'lyrics',
        'vocals',
        'instrumentation'
      ],
      parameterClass: 'Proprietary',
      contextWindow: '3000 chars (prompt)',
      modality: 'Text → Audio',
      ringAffinity: 'Geometry Ring',
      organismPlacement: 'Frontend organism / scene layer',
      routingPriority: 'P2',
      wireProtocol: 'intelligence-wire/suno',
      engineStatus: 'active'
    });

    this._register({
      id: 'AIF-019',
      name: 'Codex / Copilot',
      parentOrg: 'OpenAI / GitHub',
      alphaModel: 'GPT-4o (code-tuned)',
      alphaVersion: '2024.08',
      intelligenceClass: 'Code Generation Intelligence',
      primaryCapability: 'Autonomous code generation',
      secondaryCapabilities: [
        'code completion',
        'refactoring',
        'debugging',
        'documentation',
        'testing'
      ],
      parameterClass: 'Frontier (>100B)',
      contextWindow: '128K tokens',
      modality: 'Text → Code',
      ringAffinity: 'Build Ring',
      organismPlacement: 'Frontend organism / packaging layer',
      routingPriority: 'P0',
      wireProtocol: 'intelligence-wire/github',
      engineStatus: 'active'
    });

    this._register({
      id: 'AIF-020',
      name: 'CodeLlama',
      parentOrg: 'Meta',
      alphaModel: 'CodeLlama 70B',
      alphaVersion: '2024.01',
      intelligenceClass: 'Open Code Intelligence',
      primaryCapability: 'Open-source code generation',
      secondaryCapabilities: [
        'code completion',
        'infilling',
        'instruction',
        'multi-language'
      ],
      parameterClass: 'Open Large (70B)',
      contextWindow: '16K tokens',
      modality: 'Text → Code',
      ringAffinity: 'Build Ring',
      organismPlacement: 'Frontend organism / packaging layer',
      routingPriority: 'P2',
      wireProtocol: 'intelligence-wire/meta-code',
      engineStatus: 'active'
    });

    this._register({
      id: 'AIF-021',
      name: 'DeepSeek',
      parentOrg: 'DeepSeek',
      alphaModel: 'DeepSeek-V2',
      alphaVersion: '2024.05',
      intelligenceClass: 'Mixture-of-Experts Code Intelligence',
      primaryCapability: 'Efficient code + math reasoning',
      secondaryCapabilities: [
        'code generation',
        'math',
        'reasoning',
        'MoE efficiency'
      ],
      parameterClass: 'MoE (236B/21B active)',
      contextWindow: '128K tokens',
      modality: 'Text',
      ringAffinity: 'Build Ring',
      organismPlacement: 'Frontend organism / packaging layer',
      routingPriority: 'P2',
      wireProtocol: 'intelligence-wire/deepseek',
      engineStatus: 'active'
    });

    this._register({
      id: 'AIF-022',
      name: 'Perplexity',
      parentOrg: 'Perplexity AI',
      alphaModel: 'Perplexity Online',
      alphaVersion: '2024.08',
      intelligenceClass: 'Search-Augmented Intelligence',
      primaryCapability: 'Real-time search + reasoning',
      secondaryCapabilities: [
        'web search',
        'citation',
        'fact-checking',
        'real-time data'
      ],
      parameterClass: 'Proprietary',
      contextWindow: '128K tokens',
      modality: 'Text + Search',
      ringAffinity: 'Transport Ring',
      organismPlacement: 'Frontend organism / channel layer',
      routingPriority: 'P1',
      wireProtocol: 'intelligence-wire/perplexity',
      engineStatus: 'active'
    });

    this._register({
      id: 'AIF-023',
      name: 'Grok',
      parentOrg: 'xAI',
      alphaModel: 'Grok-2',
      alphaVersion: '2024.08',
      intelligenceClass: 'Real-Time Social Intelligence',
      primaryCapability: 'Real-time social reasoning',
      secondaryCapabilities: [
        'social media analysis',
        'real-time data',
        'humor',
        'unfiltered'
      ],
      parameterClass: 'Frontier (>100B)',
      contextWindow: '128K tokens',
      modality: 'Text + Social',
      ringAffinity: 'Transport Ring',
      organismPlacement: 'Frontend organism / channel layer',
      routingPriority: 'P2',
      wireProtocol: 'intelligence-wire/xai',
      engineStatus: 'active'
    });

    this._register({
      id: 'AIF-024',
      name: 'Inflection',
      parentOrg: 'Inflection AI',
      alphaModel: 'Pi',
      alphaVersion: '2024.03',
      intelligenceClass: 'Empathic AI Intelligence',
      primaryCapability: 'Conversational empathy',
      secondaryCapabilities: [
        'emotional intelligence',
        'therapy-adjacent',
        'long conversation'
      ],
      parameterClass: 'Frontier (>100B)',
      contextWindow: 'Unlimited (session)',
      modality: 'Text',
      ringAffinity: 'Memory Ring',
      organismPlacement: 'Frontend organism / memory layer',
      routingPriority: 'P2',
      wireProtocol: 'intelligence-wire/inflection',
      engineStatus: 'active'
    });

    this._register({
      id: 'AIF-025',
      name: 'Jamba',
      parentOrg: 'AI21 Labs',
      alphaModel: 'Jamba 1.5',
      alphaVersion: '2024.08',
      intelligenceClass: 'Hybrid SSM-Transformer Intelligence',
      primaryCapability: 'Long-context hybrid reasoning',
      secondaryCapabilities: [
        'Mamba + Transformer hybrid',
        'long-context',
        'efficiency'
      ],
      parameterClass: 'Hybrid (52B)',
      contextWindow: '256K tokens',
      modality: 'Text',
      ringAffinity: 'Memory Ring',
      organismPlacement: 'Frontend organism / memory layer',
      routingPriority: 'P2',
      wireProtocol: 'intelligence-wire/ai21',
      engineStatus: 'active'
    });

    this._register({
      id: 'AIF-026',
      name: 'Sora',
      parentOrg: 'OpenAI',
      alphaModel: 'Sora',
      alphaVersion: '2024.02',
      intelligenceClass: 'Video Generation Intelligence',
      primaryCapability: 'Text-to-video generation',
      secondaryCapabilities: [
        'video synthesis',
        'scene generation',
        'physics simulation',
        'camera control'
      ],
      parameterClass: 'Diffusion Transformer',
      contextWindow: 'Text prompt',
      modality: 'Text → Video',
      ringAffinity: 'Geometry Ring',
      organismPlacement: 'Frontend organism / scene layer',
      routingPriority: 'P1',
      wireProtocol: 'intelligence-wire/openai-video',
      engineStatus: 'preview'
    });

    this._register({
      id: 'AIF-027',
      name: 'Runway',
      parentOrg: 'Runway',
      alphaModel: 'Gen-3 Alpha',
      alphaVersion: '2024.06',
      intelligenceClass: 'Video Intelligence',
      primaryCapability: 'AI video editing + generation',
      secondaryCapabilities: [
        'video generation',
        'motion brush',
        'text-to-video',
        'image-to-video'
      ],
      parameterClass: 'Proprietary',
      contextWindow: 'Text + Image',
      modality: 'Multi → Video',
      ringAffinity: 'Geometry Ring',
      organismPlacement: 'Frontend organism / scene layer',
      routingPriority: 'P2',
      wireProtocol: 'intelligence-wire/runway',
      engineStatus: 'active'
    });

    this._register({
      id: 'AIF-028',
      name: 'Pika',
      parentOrg: 'Pika Labs',
      alphaModel: 'Pika 1.0',
      alphaVersion: '2024.03',
      intelligenceClass: 'Motion Generation Intelligence',
      primaryCapability: 'Text/image to video motion',
      secondaryCapabilities: [
        'video generation',
        'lip sync',
        'motion control'
      ],
      parameterClass: 'Proprietary',
      contextWindow: 'Text + Image',
      modality: 'Multi → Video',
      ringAffinity: 'Geometry Ring',
      organismPlacement: 'Frontend organism / scene layer',
      routingPriority: 'P3',
      wireProtocol: 'intelligence-wire/pika',
      engineStatus: 'active'
    });

    this._register({
      id: 'AIF-029',
      name: 'Kling',
      parentOrg: 'Kuaishou',
      alphaModel: 'Kling',
      alphaVersion: '2024.06',
      intelligenceClass: 'Long-Form Video Intelligence',
      primaryCapability: 'Extended video generation',
      secondaryCapabilities: [
        'long video generation',
        'physics-aware',
        'character consistency'
      ],
      parameterClass: 'Proprietary',
      contextWindow: 'Text prompt',
      modality: 'Text → Video',
      ringAffinity: 'Geometry Ring',
      organismPlacement: 'Frontend organism / scene layer',
      routingPriority: 'P3',
      wireProtocol: 'intelligence-wire/kuaishou',
      engineStatus: 'active'
    });

    this._register({
      id: 'AIF-030',
      name: 'AlphaFold',
      parentOrg: 'Google DeepMind',
      alphaModel: 'AlphaFold 3',
      alphaVersion: '2024.05',
      intelligenceClass: 'Protein Structure Intelligence',
      primaryCapability: 'Molecular structure prediction',
      secondaryCapabilities: [
        'protein folding',
        'drug discovery',
        'biomolecular interaction'
      ],
      parameterClass: 'Specialized',
      contextWindow: 'Amino acid sequence',
      modality: 'Sequence → Structure',
      ringAffinity: 'Proof Ring',
      organismPlacement: 'Organism core / verification layer',
      routingPriority: 'P1',
      wireProtocol: 'intelligence-wire/deepmind-science',
      engineStatus: 'active'
    });

    this._register({
      id: 'AIF-031',
      name: 'AlphaCode',
      parentOrg: 'Google DeepMind',
      alphaModel: 'AlphaCode 2',
      alphaVersion: '2023.12',
      intelligenceClass: 'Competitive Programming Intelligence',
      primaryCapability: 'Algorithmic problem solving',
      secondaryCapabilities: [
        'competitive programming',
        'algorithm design',
        'proof generation'
      ],
      parameterClass: 'Specialized',
      contextWindow: 'Problem statement',
      modality: 'Text → Code',
      ringAffinity: 'Proof Ring',
      organismPlacement: 'Organism core / verification layer',
      routingPriority: 'P2',
      wireProtocol: 'intelligence-wire/deepmind-code',
      engineStatus: 'active'
    });

    this._register({
      id: 'AIF-032',
      name: 'RT-2',
      parentOrg: 'Google DeepMind',
      alphaModel: 'RT-2-X',
      alphaVersion: '2023.10',
      intelligenceClass: 'Robotic Transformer Intelligence',
      primaryCapability: 'Robotic action generation',
      secondaryCapabilities: [
        'robot control',
        'vision-language-action',
        'manipulation'
      ],
      parameterClass: 'Specialized',
      contextWindow: 'Vision + Language',
      modality: 'Multi → Action',
      ringAffinity: 'Sovereign Ring',
      organismPlacement: 'Organism core / somatic layer',
      routingPriority: 'P2',
      wireProtocol: 'intelligence-wire/deepmind-robotics',
      engineStatus: 'preview'
    });

    this._register({
      id: 'AIF-033',
      name: 'Segment Anything',
      parentOrg: 'Meta',
      alphaModel: 'SAM 2',
      alphaVersion: '2024.07',
      intelligenceClass: 'Visual Segmentation Intelligence',
      primaryCapability: 'Zero-shot image/video segmentation',
      secondaryCapabilities: [
        'object segmentation',
        'tracking',
        'interactive annotation'
      ],
      parameterClass: 'Specialized (600M)',
      contextWindow: 'Image/Video',
      modality: 'Vision → Masks',
      ringAffinity: 'Geometry Ring',
      organismPlacement: 'Frontend organism / scene layer',
      routingPriority: 'P1',
      wireProtocol: 'intelligence-wire/meta-vision',
      engineStatus: 'active'
    });

    this._register({
      id: 'AIF-034',
      name: 'CLIP',
      parentOrg: 'OpenAI',
      alphaModel: 'CLIP ViT-L/14',
      alphaVersion: '2023.01',
      intelligenceClass: 'Vision-Language Alignment Intelligence',
      primaryCapability: 'Image-text alignment',
      secondaryCapabilities: [
        'zero-shot classification',
        'image search',
        'embedding'
      ],
      parameterClass: 'Specialized (428M)',
      contextWindow: 'Text + Image',
      modality: 'Multi → Embedding',
      ringAffinity: 'Memory Ring',
      organismPlacement: 'Frontend organism / memory layer',
      routingPriority: 'P1',
      wireProtocol: 'intelligence-wire/openai-embed',
      engineStatus: 'active'
    });

    this._register({
      id: 'AIF-035',
      name: 'Florence',
      parentOrg: 'Microsoft',
      alphaModel: 'Florence-2',
      alphaVersion: '2024.06',
      intelligenceClass: 'Unified Vision Intelligence',
      primaryCapability: 'Multi-task visual understanding',
      secondaryCapabilities: [
        'object detection',
        'segmentation',
        'captioning',
        'OCR',
        'grounding'
      ],
      parameterClass: 'Specialized (770M)',
      contextWindow: 'Image',
      modality: 'Vision → Multi',
      ringAffinity: 'Geometry Ring',
      organismPlacement: 'Frontend organism / scene layer',
      routingPriority: 'P2',
      wireProtocol: 'intelligence-wire/microsoft-vision',
      engineStatus: 'active'
    });

    this._register({
      id: 'AIF-036',
      name: 'Minerva / Llemma',
      parentOrg: 'Google / EleutherAI',
      alphaModel: 'Llemma 34B',
      alphaVersion: '2023.10',
      intelligenceClass: 'Mathematical Reasoning Intelligence',
      primaryCapability: 'Formal mathematical reasoning',
      secondaryCapabilities: [
        'theorem proving',
        'symbolic math',
        'step-by-step reasoning'
      ],
      parameterClass: 'Large (34B)',
      contextWindow: '4K tokens',
      modality: 'Text → Math',
      ringAffinity: 'Proof Ring',
      organismPlacement: 'Organism core / verification layer',
      routingPriority: 'P2',
      wireProtocol: 'intelligence-wire/math',
      engineStatus: 'active'
    });

    this._register({
      id: 'AIF-037',
      name: 'MusicLM / MusicGen',
      parentOrg: 'Google / Meta',
      alphaModel: 'MusicGen Large',
      alphaVersion: '2024.01',
      intelligenceClass: 'Music Understanding Intelligence',
      primaryCapability: 'Music generation + understanding',
      secondaryCapabilities: [
        'music generation',
        'melody conditioning',
        'style transfer'
      ],
      parameterClass: 'Specialized (3.3B)',
      contextWindow: '30s audio',
      modality: 'Text → Music',
      ringAffinity: 'Geometry Ring',
      organismPlacement: 'Frontend organism / scene layer',
      routingPriority: 'P3',
      wireProtocol: 'intelligence-wire/music',
      engineStatus: 'active'
    });

    this._register({
      id: 'AIF-038',
      name: 'Embedding Models',
      parentOrg: 'Various',
      alphaModel: 'text-embedding-3-large',
      alphaVersion: '2024.01',
      intelligenceClass: 'Vector Embedding Intelligence',
      primaryCapability: 'Dense vector representation',
      secondaryCapabilities: [
        'semantic search',
        'clustering',
        'classification',
        'RAG retrieval'
      ],
      parameterClass: 'Specialized (varies)',
      contextWindow: '8K tokens',
      modality: 'Text → Vector',
      ringAffinity: 'Memory Ring',
      organismPlacement: 'Frontend organism / memory layer',
      routingPriority: 'P0',
      wireProtocol: 'intelligence-wire/embeddings',
      engineStatus: 'active'
    });

    this._register({
      id: 'AIF-039',
      name: 'Reranking Models',
      parentOrg: 'Cohere / Various',
      alphaModel: 'Cohere Rerank v3',
      alphaVersion: '2024.03',
      intelligenceClass: 'Relevance Scoring Intelligence',
      primaryCapability: 'Search result reranking',
      secondaryCapabilities: [
        'document reranking',
        'relevance scoring',
        'RAG precision'
      ],
      parameterClass: 'Specialized',
      contextWindow: '4K tokens',
      modality: 'Text → Score',
      ringAffinity: 'Memory Ring',
      organismPlacement: 'Frontend organism / memory layer',
      routingPriority: 'P1',
      wireProtocol: 'intelligence-wire/rerankers',
      engineStatus: 'active'
    });

    this._register({
      id: 'AIF-040',
      name: 'Guard Models',
      parentOrg: 'Various',
      alphaModel: 'Llama Guard 3',
      alphaVersion: '2024.07',
      intelligenceClass: 'Safety Classification Intelligence',
      primaryCapability: 'Content safety classification',
      secondaryCapabilities: [
        'toxicity detection',
        'prompt injection',
        'jailbreak detection',
        'PII'
      ],
      parameterClass: 'Specialized (8B)',
      contextWindow: '8K tokens',
      modality: 'Text → Safety',
      ringAffinity: 'Counsel Ring',
      organismPlacement: 'Organism core / governance layer',
      routingPriority: 'P0',
      wireProtocol: 'intelligence-wire/guards',
      engineStatus: 'active'
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Public API                                                         */
  /* ------------------------------------------------------------------ */

  /**
   * Returns a family object by its deterministic ID (e.g. "AIF-001").
   * @param {string} familyId
   * @returns {object|undefined}
   */
  getFamily(familyId) {
    return this.families.get(familyId);
  }

  /**
   * Returns a family by its name (case-insensitive match).
   * @param {string} name
   * @returns {object|undefined}
   */
  getFamilyByName(name) {
    const lower = name.toLowerCase();
    for (const family of this.families.values()) {
      if (family.name.toLowerCase() === lower) return family;
    }
    return undefined;
  }

  /**
   * Returns every registered family as an array.
   * @returns {object[]}
   */
  listFamilies() {
    return [...this.families.values()];
  }

  /**
   * Returns all families belonging to a given ring (e.g. "Interface Ring").
   * @param {string} ringAffinity
   * @returns {object[]}
   */
  listByRing(ringAffinity) {
    const lower = ringAffinity.toLowerCase();
    return this.listFamilies().filter(
      (f) => f.ringAffinity.toLowerCase() === lower
    );
  }

  /**
   * Returns all families with the given routing priority (e.g. "P0").
   * @param {string} priority
   * @returns {object[]}
   */
  listByPriority(priority) {
    const lower = priority.toLowerCase();
    return this.listFamilies().filter(
      (f) => f.routingPriority.toLowerCase() === lower
    );
  }

  /**
   * Returns families whose primaryCapability or any secondaryCapability
   * includes the given keyword (case-insensitive).
   * @param {string} capability
   * @returns {object[]}
   */
  listByCapability(capability) {
    const lower = capability.toLowerCase();
    return this.listFamilies().filter((f) => {
      if (f.primaryCapability.toLowerCase().includes(lower)) return true;
      return f.secondaryCapabilities.some((sc) =>
        sc.toLowerCase().includes(lower)
      );
    });
  }

  /**
   * Returns all families from a given parent organization (case-insensitive).
   * @param {string} parentOrg
   * @returns {object[]}
   */
  listByOrg(parentOrg) {
    const lower = parentOrg.toLowerCase();
    return this.listFamilies().filter(
      (f) => f.parentOrg.toLowerCase().includes(lower)
    );
  }

  /**
   * Returns families whose modality includes the given keyword (case-insensitive).
   * @param {string} modality
   * @returns {object[]}
   */
  listByModality(modality) {
    const lower = modality.toLowerCase();
    return this.listFamilies().filter(
      (f) => f.modality.toLowerCase().includes(lower)
    );
  }

  /**
   * Returns a compact array of `{ id, alphaModel, alphaVersion }` for every family.
   * @returns {{ id: string, alphaModel: string, alphaVersion: string }[]}
   */
  listAlphas() {
    return this.listFamilies().map((f) => ({
      id: f.id,
      alphaModel: f.alphaModel,
      alphaVersion: f.alphaVersion
    }));
  }

  /**
   * Returns the total number of registered families.
   * @returns {number}
   */
  count() {
    return this.families.size;
  }
}

export { FamilyRegistry };
export default FamilyRegistry;
