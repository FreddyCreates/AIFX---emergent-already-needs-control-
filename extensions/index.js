/**
 * AI Intelligence Extensions — Organism Wire Index
 *
 * 26 multi-modal, multi-AI Edge extensions wired into the sovereign organism.
 * Each extension is a self-contained Manifest V3 directory with
 * background.js (engine), content.js (DOM UI), and manifest.json.
 *
 * Extensions are AI for user experiences — each one provides an intelligent,
 * interactive interface that users engage with directly. They are not internal
 * wiring. They are what users see, touch, hear, and talk to.
 *
 * This index maps every extension ID to its directory and metadata
 * for programmatic discovery and organism-level orchestration.
 *
 * @module extensions
 */

const EXTENSIONS = [
  { id: 'EXT-001', slug: 'sovereign-mind', name: 'Sovereign Mind', engines: ['FusionCore', 'AlphaRouter', 'PhiScorer'], ring: 'Interface Ring', wire: 'intelligence-wire/fusion', userExperience: 'Ask anything — three sovereign engines (FusionCore, AlphaRouter, PhiScorer) reason from your own data, fused into one answer with phi-weighted confidence. No GPT. No Claude. No Gemini. Your mind, your data.' },
  { id: 'EXT-002', slug: 'cipher-shield', name: 'Cipher Shield', engines: ['Guards', 'GPT', 'Claude'], ring: 'Counsel Ring', wire: 'intelligence-wire/cipher', userExperience: 'Real-time content encryption and prompt injection defense — threats blocked before they reach your eyes' },
  { id: 'EXT-003', slug: 'polyglot-oracle', name: 'Polyglot Oracle', engines: ['Qwen', 'Gemini', 'Llama'], ring: 'Interface Ring', wire: 'intelligence-wire/polyglot', userExperience: 'Browse any page in any language — live context-aware translation that rebuilds the page in your language' },
  { id: 'EXT-004', slug: 'vision-weaver', name: 'Vision Weaver', engines: ['DALL-E', 'SD', 'Midjourney', 'SAM'], ring: 'Geometry Ring', wire: 'intelligence-wire/vision', userExperience: 'Describe what you want to see — multiple AI models generate images side-by-side for you to compare and edit' },
  { id: 'EXT-005', slug: 'code-sovereign', name: 'Code Sovereign', engines: ['Codex', 'CodeLlama', 'DeepSeek'], ring: 'Build Ring', wire: 'intelligence-wire/code', userExperience: 'Highlight any code on any page — get AI-generated improvements and refactors with contract-verified output' },
  { id: 'EXT-006', slug: 'memory-palace', name: 'Memory Palace', engines: ['Embeddings', 'Command R', 'Rerankers'], ring: 'Memory Ring', wire: 'intelligence-wire/memory', userExperience: 'Sovereign bookmarking — every save gets phi-encoded spatial coordinates, searchable by meaning and resonance' },
  { id: 'EXT-007', slug: 'sentinel-watch', name: 'Sentinel Watch', engines: ['Guards', 'GPT', 'Claude'], ring: 'Counsel Ring', wire: 'intelligence-wire/sentinel', userExperience: 'Real-time phishing, malware, and social engineering detection on every page you visit' },
  { id: 'EXT-008', slug: 'research-nexus', name: 'Research Nexus', engines: ['Perplexity', 'Claude', 'Embeddings'], ring: 'Transport Ring', wire: 'intelligence-wire/research', userExperience: 'Ask a question — get a cited, sourced, reasoned research synthesis from multiple search and reasoning engines' },
  { id: 'EXT-009', slug: 'voice-forge', name: 'Voice Forge', engines: ['Whisper', 'ElevenLabs', 'Suno'], ring: 'Native Capability Ring', wire: 'intelligence-wire/voice', userExperience: 'Speak and the organism listens. Ask it to speak and it generates voice. Ask it to make music and it composes.' },
  { id: 'EXT-010', slug: 'data-alchemist', name: 'Data Alchemist', engines: ['GPT', 'Claude', 'Embeddings', 'Rerankers'], ring: 'Memory Ring', wire: 'intelligence-wire/absorb', userExperience: 'Any webpage auto-absorbed into your sovereign knowledge graph — entities, relationships, and meaning extracted and indexed' },
  { id: 'EXT-011', slug: 'video-architect', name: 'Video Architect', engines: ['Sora', 'Runway', 'Pika', 'Kling'], ring: 'Geometry Ring', wire: 'intelligence-wire/video', userExperience: 'Describe a scene — multiple video AI models generate it, the best output wins, text-to-video in your browser' },
  { id: 'EXT-012', slug: 'logic-prover', name: 'Logic Prover', engines: ['Minerva-Llemma', 'GPT', 'AlphaCode'], ring: 'Proof Ring', wire: 'intelligence-wire/proof', userExperience: 'Paste any math problem — get step-by-step formal proofs with verification, the AI proves not just solves' },
  { id: 'EXT-013', slug: 'social-cortex', name: 'Social Cortex', engines: ['Grok', 'Inflection', 'GPT'], ring: 'Interface Ring', wire: 'intelligence-wire/social', userExperience: 'AI reads the room — sentiment analysis, empathy detection, and response drafting for any social context' },
  { id: 'EXT-014', slug: 'edge-runner', name: 'Edge Runner', engines: ['Phi', 'Gemma', 'DBRX'], ring: 'Sovereign Ring', wire: 'intelligence-wire/edge', userExperience: 'Offline AI — run inference locally on your device with zero cloud, zero latency, full privacy' },
  { id: 'EXT-015', slug: 'contract-forge', name: 'Contract Forge', engines: ['GPT', 'Claude', 'Guards'], ring: 'Counsel Ring', wire: 'intelligence-wire/contract', userExperience: 'Draft and verify intelligence contracts — AI writes, reviews, and validates with cryptographic compliance proof' },
  { id: 'EXT-016', slug: 'organism-dashboard', name: 'Organism Dashboard', engines: ['Heartbeat', 'OrganismState', 'EdgeSensor'], ring: 'Sovereign Ring', wire: 'intelligence-wire/organism', userExperience: 'See the organism alive — 873ms heartbeat pulsing, 4 state registers updating, vitality scores and edge sensors in real-time' },
  { id: 'EXT-017', slug: 'knowledge-cartographer', name: 'Knowledge Cartographer', engines: ['Embeddings', 'Command R', 'Florence'], ring: 'Memory Ring', wire: 'intelligence-wire/graph', userExperience: 'Browse the web and watch your knowledge graph grow — every page adds nodes and edges to a visual map of everything you know' },
  { id: 'EXT-018', slug: 'protocol-bridge', name: 'Protocol Bridge', engines: ['All Foundation Models'], ring: 'Transport Ring', wire: 'intelligence-wire/bridge', userExperience: 'Bridge between any AI protocol — encrypted relay between different intelligence systems through one unified surface' },
  { id: 'EXT-019', slug: 'creative-muse', name: 'Creative Muse', engines: ['SD', 'DALL-E', 'MusicGen', 'Suno'], ring: 'Geometry Ring', wire: 'intelligence-wire/muse', userExperience: 'Multi-modal creative studio — images, music, and text generated and fused by multiple AI engines into one creation' },
  { id: 'EXT-020', slug: 'sovereign-nexus', name: 'Sovereign Nexus', engines: ['All 40 Foundation Models', 'Kuramoto'], ring: 'Sovereign Ring', wire: 'intelligence-wire/nexus', userExperience: 'The master hub — all 20 extensions unified into one sovereign intelligence interface, every model and every wire in one panel' },
  { id: 'EXT-021', slug: 'marketplace-hub', name: 'Marketplace Hub', engines: ['ToolRegistry', 'FamilyProfiles', 'MarketplaceRouter'], ring: 'Interface Ring', wire: 'intelligence-wire/marketplace', userExperience: 'Browse, search, and invoke 24 callable tools with natural language — family-tabbed browsing, one-click invocation, live results' },
  { id: 'EXT-022', slug: 'spread-scanner', name: 'Spread Scanner', engines: ['PatternRecognition', 'ZScore', 'CorrelationMatrix', 'PhiWeighted'], ring: 'Interface Ring', wire: 'intelligence-wire/spreads', userExperience: 'JARVIS-style spread and arbitrage scanner — reads financial data from any page, runs phi-weighted pattern recognition, highlights free-lunch mispricing opportunities in real-time' },
  { id: 'EXT-023', slug: 'data-oracle', name: 'Data Oracle', engines: ['XRayDepth', 'SqrtNormalization', 'SentimentAnalysis', 'EntityExtraction'], ring: 'Memory Ring', wire: 'intelligence-wire/oracle', userExperience: 'JARVIS-style data ingestion — reads all metadata and data from any page, structures it, runs X-ray depth analysis through the noise to find fundamental signals' },
  { id: 'EXT-024', slug: 'screen-commander', name: 'Screen Commander', engines: ['DOMControl', 'NLCommands', 'AutoNavigate', 'ScreenRead'], ring: 'Interface Ring', wire: 'intelligence-wire/commander', userExperience: 'JARVIS autonomous screen agent — reads, writes, moves elements, opens panels, navigates pages, AI that operates your screen with natural language commands' },
  { id: 'EXT-025', slug: 'pattern-forge', name: 'Pattern Forge', engines: ['SpectralDFT', 'CrossCorrelation', 'MeanReversion', 'AnomalyIQR'], ring: 'Proof Ring', wire: 'intelligence-wire/patterns', userExperience: 'X-ray mathematics engine — square-root normalization, spectral decomposition, cross-system correlation, z-depth analysis for pattern recognition across spreads and data, sees through noise to fundamentals' },
  { id: 'EXT-026', slug: 'register', name: 'Register', engines: ['RegisterWorker', 'MutationObserver', 'IntersectionObserver', 'PerformanceObserver', 'ResizeObserver'], ring: 'Build Ring', wire: 'intelligence-wire/register', userExperience: 'Builder AI — one-click install for all 26 extensions. Scans, validates, packages, and deploys extensions natively via Web Workers. Click install — extensions are live in Chrome/Edge/Brave. No manual steps.' },
  // ── Intelligence Adapters (production + internal) ─────────────────────────
  { id: 'EXT-036', slug: 'model-router-adapter', name: 'Model Router Adapter', engines: ['AlphaRouter', 'PhiScorer', 'FusionCore', 'KuramotoSync', 'Llama'], ring: 'Sovereign Ring', wire: 'intelligence-wire/router', userExperience: 'Production intelligence adapter — phi-weighted routing engine. Drop any prompt and the adapter scores every model against it using domain classification, phi-weighted confidence, and live calibration from feedback. Routes to the optimal model every time.' },
  { id: 'EXT-037', slug: 'context-bridge-adapter', name: 'Context Bridge Adapter', engines: ['ContextExtractor', 'PhiEncoder', 'MemoriaAgent', 'SensusAgent'], ring: 'Memory Ring', wire: 'intelligence-wire/context', userExperience: 'Production intelligence adapter — phi-encodes full page context (URL, title, selection, metadata, headings) into a structured bridge payload. Paste the payload as a prefix into any AI session for instant grounded, contextual responses without copy-pasting.' },
  { id: 'EXT-038', slug: 'api-mesh-adapter', name: 'API Mesh Adapter', engines: ['FetchInterceptor', 'SchemaDetector', 'PhiNormalizer', 'MeshRouter'], ring: 'Transport Ring', wire: 'intelligence-wire/mesh', userExperience: 'Production intelligence adapter — hooks into fetch/XHR on any page, intercepts API responses, detects schema type (REST-JSON, GraphQL, RSS-XML, CSV), normalizes the data, and routes structured payloads through the organism intelligence mesh. Internal use: debug live API surfaces.' },
  { id: 'EXT-039', slug: 'knowledge-sync-adapter', name: 'Knowledge Sync Adapter', engines: ['EntityExtractor', 'GraphSyncer', 'ResonanceEncoder', 'MemoryLineage'], ring: 'Memory Ring', wire: 'intelligence-wire/knowledge', userExperience: 'Production intelligence adapter — extracts named entities, organizations, technologies, and concepts from any page and syncs them to the organism knowledge graph with phi-resonance scoring and co-occurrence edge building. Graph persists across sessions. Query it anytime.' },
  { id: 'EXT-040', slug: 'signal-relay-adapter', name: 'Signal Relay Adapter', engines: ['SynapseBinding', 'KuramotoRelay', 'PhiPulse', 'CrossSubstrate'], ring: 'Sovereign Ring', wire: 'intelligence-wire/relay', userExperience: 'Internal intelligence adapter — the nervous system relay. Captures intelligence signals from all active extensions and relays them through the organism synapse binding engine via phi-pulse (873ms × φ). Cross-substrate routing: browser ↔ organism ↔ edge. Wire your extension ecosystem.' }
];

/**
 * Look up an extension by its ID (e.g. "EXT-001").
 * @param {string} id
 * @returns {Object|undefined}
 */
function getExtensionById(id) {
  return EXTENSIONS.find(e => e.id === id);
}

/**
 * Look up an extension by slug (directory name).
 * @param {string} slug
 * @returns {Object|undefined}
 */
function getExtensionBySlug(slug) {
  return EXTENSIONS.find(e => e.slug === slug);
}

/**
 * Filter extensions by organism ring.
 * @param {string} ring
 * @returns {Object[]}
 */
function getExtensionsByRing(ring) {
  return EXTENSIONS.filter(e => e.ring === ring);
}

/**
 * Filter extensions that wire a specific engine.
 * @param {string} engine
 * @returns {Object[]}
 */
function getExtensionsByEngine(engine) {
  return EXTENSIONS.filter(e => e.engines.some(eng => eng.toLowerCase().includes(engine.toLowerCase())));
}

export { EXTENSIONS, getExtensionById, getExtensionBySlug, getExtensionsByRing, getExtensionsByEngine };
