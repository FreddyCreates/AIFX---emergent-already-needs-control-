/**
 * 🎭 GhostHoneypot Durable Object
 * ════════════════════════════════════════════════════════════════════════════
 * 
 * SECURITY FRACTURE: GHOST LAYER
 * 
 * Decoy systems that trap and analyze attackers. When Wraith detects suspicious
 * behavior, it redirects the attacker to a Ghost honeypot. The Ghost observes,
 * records, and extracts intelligence from the attack patterns.
 * 
 * Ghost Types:
 *   - MIRROR: Mimics real system behavior
 *   - TARPIT: Slows down attackers
 *   - RESEARCH: Full attack analysis lab
 *   - COUNTERINTEL: Feeds false data to attacker
 * 
 * Features:
 *   - Full request/response recording
 *   - Attack pattern extraction
 *   - Attacker profiling
 *   - Fake data generation (counterintelligence)
 *   - Integration with Wraith for threat reporting
 * 
 * @module organism/durable-objects/ghost-honeypot
 * @version 1.0.0
 * @powered-by ORO Systems
 */

// ─── Phi Constants ────────────────────────────────────────────────────────────
const PHI = 1.618033988749895;
const PHI_INV = 0.618033988749895;
const HEARTBEAT = 873;

// ─── Ghost Types ──────────────────────────────────────────────────────────────
const GHOST_TYPES = {
  MIRROR: 'mirror',           // Mimics real system
  TARPIT: 'tarpit',           // Deliberately slow responses
  RESEARCH: 'research',       // Full attack analysis
  COUNTERINTEL: 'counterintel', // Feeds false data
};

// ─── Fake Data Generators ─────────────────────────────────────────────────────
// NOTE: Using Math.random() intentionally for fake honeypot data.
// This is NOT security-critical - these are decoy values meant to be discovered.
// Using cryptographic randomness would be wasteful for fake data generation.
// lgtm[js/insecure-randomness] - Intentional use of Math.random() for decoy data
const FAKE_DATA = {
  // lgtm[js/insecure-randomness]
  users: () => ({
    id: Math.random().toString(36).slice(2),
    username: `user_${Math.random().toString(36).slice(2, 8)}`,
    email: `fake${Math.random().toString(36).slice(2)}@example.invalid`, // RFC 2606 reserved TLD
    role: ['admin', 'user', 'moderator'][Math.floor(Math.random() * 3)],
    created: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
  }),
  // lgtm[js/insecure-randomness]
  api_keys: () => ({
    key: `sk-fake-${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`,
    created: new Date().toISOString(),
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  }),
  database: () => ({
    tables: ['users', 'orders', 'products', 'sessions'],
    version: '8.0.32',
    engine: 'InnoDB',
  }),
  config: () => ({
    debug: true,
    environment: 'production',
    database_host: '192.168.1.100',
    api_endpoint: 'https://api.honeypot.local',
  }),
};

/**
 * GhostHoneypot — Decoy system that traps and analyzes attackers.
 */
export class GhostHoneypot {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.storage = state.storage;
    
    // ─── In-Memory State ──────────────────────────────────────────────────────
    this.interactions = [];         // All recorded interactions
    this.attackerProfiles = new Map(); // attacker_id -> profile
    this.extractedPatterns = [];    // Extracted attack patterns
    this.ghostType = GHOST_TYPES.RESEARCH;
    this.tarpitDelay = 5000;        // ms delay for tarpit mode
    this.websockets = new Set();
    
    // ─── Metrics ──────────────────────────────────────────────────────────────
    this.metrics = {
      totalInteractions: 0,
      uniqueAttackers: 0,
      patternsExtracted: 0,
      fakeDataServed: 0,
      lastHeartbeat: Date.now(),
    };
    
    this.initialized = false;
    this.initPromise = this.initialize();
  }

  async initialize() {
    if (this.initialized) return;
    
    const stored = await this.storage.get([
      'interactions', 'attackerProfiles', 'extractedPatterns', 'ghostType', 'metrics'
    ]);
    
    if (stored.interactions) this.interactions = stored.interactions.slice(-500);
    if (stored.attackerProfiles) this.attackerProfiles = new Map(Object.entries(stored.attackerProfiles));
    if (stored.extractedPatterns) this.extractedPatterns = stored.extractedPatterns;
    if (stored.ghostType) this.ghostType = stored.ghostType;
    if (stored.metrics) Object.assign(this.metrics, stored.metrics);
    
    this.initialized = true;
  }

  async fetch(request) {
    await this.initPromise;
    
    const url = new URL(request.url);
    const path = url.pathname;
    
    if (request.headers.get('Upgrade') === 'websocket') {
      return this.handleWebSocket(request);
    }
    
    try {
      // Management endpoints
      if (path === '/config' && request.method === 'POST') {
        return this.handleConfig(request);
      }
      if (path === '/interactions' && request.method === 'GET') {
        return this.handleGetInteractions(request);
      }
      if (path === '/attackers' && request.method === 'GET') {
        return this.handleGetAttackers();
      }
      if (path === '/patterns' && request.method === 'GET') {
        return this.handleGetPatterns();
      }
      if (path === '/analyze' && request.method === 'POST') {
        return this.handleAnalyze(request);
      }
      if (path === '/state' && request.method === 'GET') {
        return this.handleGetState();
      }
      if (path === '/heartbeat' && request.method === 'POST') {
        return this.handleHeartbeat();
      }
      
      // Everything else is the honeypot trap
      return this.handleTrap(request);
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // ─── The Trap ───────────────────────────────────────────────────────────────
  async handleTrap(request) {
    const url = new URL(request.url);
    const now = Date.now();
    
    // Extract attacker info
    const attackerId = request.headers.get('X-Forwarded-For') || 
                       request.headers.get('CF-Connecting-IP') || 
                       'unknown';
    const userAgent = request.headers.get('User-Agent') || 'unknown';
    
    // Record interaction
    let body = null;
    try {
      body = await request.text();
    } catch { /* no body */ }
    
    const interaction = {
      id: `int-${now}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: now,
      attackerId,
      userAgent,
      method: request.method,
      path: url.pathname,
      query: url.search,
      headers: Object.fromEntries(request.headers.entries()),
      body: body ? body.substring(0, 10000) : null,
    };
    
    this.interactions.push(interaction);
    if (this.interactions.length > 1000) {
      this.interactions.shift();
    }
    
    // Update attacker profile
    this.updateAttackerProfile(attackerId, interaction);
    
    // Extract patterns
    this.extractPatterns(interaction);
    
    this.metrics.totalInteractions++;
    
    this.broadcast({ event: 'trap_triggered', interaction });
    
    // Generate response based on ghost type
    let response;
    switch (this.ghostType) {
      case GHOST_TYPES.TARPIT:
        response = await this.tarpitResponse(interaction);
        break;
      case GHOST_TYPES.COUNTERINTEL:
        response = this.counterintelResponse(interaction);
        break;
      case GHOST_TYPES.MIRROR:
        response = this.mirrorResponse(interaction);
        break;
      case GHOST_TYPES.RESEARCH:
      default:
        response = this.researchResponse(interaction);
    }
    
    // Record response
    interaction.response = {
      status: response.status,
      ghostType: this.ghostType,
    };
    
    await this.persistAll();
    
    return response;
  }

  // ─── Response Types ─────────────────────────────────────────────────────────
  async tarpitResponse(interaction) {
    // Deliberately slow response to waste attacker's time
    await new Promise(resolve => setTimeout(resolve, this.tarpitDelay));
    
    return new Response(JSON.stringify({
      status: 'processing',
      message: 'Please wait...',
      eta: Math.ceil(this.tarpitDelay / 1000),
    }), {
      status: 202,
      headers: { 'Content-Type': 'application/json', 'Retry-After': '60' },
    });
  }

  counterintelResponse(interaction) {
    // Feed fake data based on what the attacker is looking for
    let fakeData = {};
    const path = interaction.path.toLowerCase();
    const body = (interaction.body || '').toLowerCase();
    
    if (path.includes('user') || body.includes('user')) {
      fakeData.users = Array.from({ length: 5 }, () => FAKE_DATA.users());
    }
    if (path.includes('key') || path.includes('api') || body.includes('api')) {
      fakeData.api_keys = Array.from({ length: 3 }, () => FAKE_DATA.api_keys());
    }
    if (path.includes('db') || path.includes('database') || body.includes('select')) {
      fakeData.database = FAKE_DATA.database();
    }
    if (path.includes('config') || path.includes('env')) {
      fakeData.config = FAKE_DATA.config();
    }
    
    // Default fake response
    if (Object.keys(fakeData).length === 0) {
      fakeData = {
        success: true,
        data: { message: 'Operation completed', id: Math.random().toString(36).slice(2) },
      };
    }
    
    this.metrics.fakeDataServed++;
    
    return new Response(JSON.stringify(fakeData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  mirrorResponse(interaction) {
    // Mimic real system responses
    const responses = {
      'GET': { status: 200, body: { message: 'OK', timestamp: Date.now() } },
      'POST': { status: 201, body: { created: true, id: Math.random().toString(36).slice(2) } },
      'PUT': { status: 200, body: { updated: true } },
      'DELETE': { status: 204, body: null },
    };
    
    const resp = responses[interaction.method] || responses['GET'];
    
    return new Response(resp.body ? JSON.stringify(resp.body) : null, {
      status: resp.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  researchResponse(interaction) {
    // Neutral response that encourages continued interaction
    return new Response(JSON.stringify({
      status: 'ok',
      message: 'Request processed',
      reference: interaction.id,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ─── Attacker Profiling ─────────────────────────────────────────────────────
  updateAttackerProfile(attackerId, interaction) {
    let profile = this.attackerProfiles.get(attackerId);
    
    if (!profile) {
      profile = {
        id: attackerId,
        firstSeen: Date.now(),
        interactions: 0,
        methods: {},
        paths: [],
        userAgents: new Set(),
        payloads: [],
        threatLevel: 0,
      };
      this.attackerProfiles.set(attackerId, profile);
      this.metrics.uniqueAttackers++;
    }
    
    profile.lastSeen = Date.now();
    profile.interactions++;
    profile.methods[interaction.method] = (profile.methods[interaction.method] || 0) + 1;
    profile.paths.push(interaction.path);
    profile.userAgents.add(interaction.userAgent);
    
    if (interaction.body && interaction.body.length > 10) {
      profile.payloads.push(interaction.body.substring(0, 500));
      if (profile.payloads.length > 20) profile.payloads.shift();
    }
    
    // Calculate threat level based on behavior
    let threatLevel = 0;
    threatLevel += profile.interactions * 0.1;
    threatLevel += Object.keys(profile.methods).length * 0.5;
    threatLevel += profile.userAgents.size > 3 ? 2 : 0;  // Multiple user agents = suspicious
    
    // Check for attack patterns in paths
    const attackPatterns = ['/admin', '/wp-admin', '/.env', '/config', '/backup', '/.git', '/api/v1'];
    for (const path of profile.paths.slice(-20)) {
      if (attackPatterns.some(p => path.includes(p))) {
        threatLevel += 0.5;
      }
    }
    
    profile.threatLevel = Math.min(10, threatLevel);
  }

  // ─── Pattern Extraction ─────────────────────────────────────────────────────
  extractPatterns(interaction) {
    const patterns = [];
    
    // Path patterns
    const pathPatterns = [
      { regex: /\/\.env/i, type: 'env_probe' },
      { regex: /\/wp-(admin|login|content)/i, type: 'wordpress_probe' },
      { regex: /\/(admin|administrator|manager)/i, type: 'admin_probe' },
      { regex: /\.(php|asp|aspx|jsp)\?/i, type: 'script_injection' },
      { regex: /\/(backup|bak|sql|dump)/i, type: 'data_probe' },
      { regex: /\/\.(git|svn|hg)/i, type: 'vcs_probe' },
      { regex: /\/api\/v\d+\/users/i, type: 'api_enum' },
    ];
    
    for (const { regex, type } of pathPatterns) {
      if (regex.test(interaction.path)) {
        patterns.push({ type, path: interaction.path });
      }
    }
    
    // Body patterns (injection attempts)
    if (interaction.body) {
      const bodyPatterns = [
        { regex: /SELECT.*FROM/i, type: 'sql_injection' },
        { regex: /UNION.*SELECT/i, type: 'sql_injection' },
        { regex: /<script/i, type: 'xss' },
        { regex: /\$\{.*\}/i, type: 'template_injection' },
        { regex: /\{\{.*\}\}/i, type: 'ssti' },
        { regex: /base64_decode|eval\s*\(/i, type: 'rce_attempt' },
        { regex: /\/etc\/passwd|\/bin\/bash/i, type: 'path_traversal' },
      ];
      
      for (const { regex, type } of bodyPatterns) {
        if (regex.test(interaction.body)) {
          patterns.push({ type, sample: interaction.body.substring(0, 200) });
        }
      }
    }
    
    // Store unique patterns
    for (const pattern of patterns) {
      const existing = this.extractedPatterns.find(
        p => p.type === pattern.type && (p.path === pattern.path || p.sample === pattern.sample)
      );
      
      if (!existing) {
        this.extractedPatterns.push({
          ...pattern,
          attackerId: interaction.attackerId,
          timestamp: interaction.timestamp,
        });
        this.metrics.patternsExtracted++;
      }
    }
    
    // Keep pattern list bounded
    if (this.extractedPatterns.length > 500) {
      this.extractedPatterns = this.extractedPatterns.slice(-500);
    }
  }

  // ─── Management Endpoints ───────────────────────────────────────────────────
  async handleConfig(request) {
    const { ghostType, tarpitDelay } = await request.json();
    
    if (ghostType && Object.values(GHOST_TYPES).includes(ghostType)) {
      this.ghostType = ghostType;
    }
    if (tarpitDelay && typeof tarpitDelay === 'number') {
      this.tarpitDelay = Math.max(1000, Math.min(30000, tarpitDelay));
    }
    
    await this.persistAll();
    
    return this.jsonResponse({
      configured: true,
      ghostType: this.ghostType,
      tarpitDelay: this.tarpitDelay,
    });
  }

  async handleGetInteractions(request) {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const attackerId = url.searchParams.get('attackerId');
    
    let interactions = this.interactions;
    if (attackerId) {
      interactions = interactions.filter(i => i.attackerId === attackerId);
    }
    
    return this.jsonResponse({
      interactions: interactions.slice(-limit).reverse(),
      total: this.interactions.length,
    });
  }

  async handleGetAttackers() {
    const attackers = Array.from(this.attackerProfiles.entries()).map(([id, profile]) => ({
      id,
      ...profile,
      userAgents: Array.from(profile.userAgents),
      paths: profile.paths.slice(-10),
    }));
    
    // Sort by threat level
    attackers.sort((a, b) => b.threatLevel - a.threatLevel);
    
    return this.jsonResponse({
      attackers,
      total: this.attackerProfiles.size,
    });
  }

  async handleGetPatterns() {
    // Group patterns by type
    const grouped = {};
    for (const pattern of this.extractedPatterns) {
      if (!grouped[pattern.type]) {
        grouped[pattern.type] = [];
      }
      grouped[pattern.type].push(pattern);
    }
    
    return this.jsonResponse({
      patterns: grouped,
      total: this.extractedPatterns.length,
    });
  }

  async handleAnalyze(request) {
    const { attackerId } = await request.json();
    
    const profile = this.attackerProfiles.get(attackerId);
    if (!profile) {
      return this.jsonResponse({ error: 'Attacker not found' }, 404);
    }
    
    // Deep analysis
    const analysis = {
      attackerId,
      threatLevel: profile.threatLevel,
      classification: this.classifyAttacker(profile),
      timeline: this.buildTimeline(attackerId),
      techniques: this.identifyTechniques(profile),
      recommendations: this.generateRecommendations(profile),
    };
    
    return this.jsonResponse(analysis);
  }

  classifyAttacker(profile) {
    if (profile.threatLevel >= 8) return 'advanced_persistent_threat';
    if (profile.threatLevel >= 5) return 'targeted_attacker';
    if (profile.threatLevel >= 3) return 'automated_scanner';
    if (profile.interactions > 20) return 'persistent_probe';
    return 'opportunistic_scanner';
  }

  buildTimeline(attackerId) {
    return this.interactions
      .filter(i => i.attackerId === attackerId)
      .slice(-50)
      .map(i => ({
        timestamp: i.timestamp,
        action: `${i.method} ${i.path}`,
        hasPayload: !!i.body,
      }));
  }

  identifyTechniques(profile) {
    const techniques = [];
    
    if (profile.methods['POST'] > 5) techniques.push('data_manipulation');
    if (profile.paths.some(p => p.includes('admin'))) techniques.push('admin_access');
    if (profile.paths.some(p => p.includes('.env'))) techniques.push('config_exposure');
    if (profile.payloads.some(p => /SELECT|UNION/i.test(p))) techniques.push('sql_injection');
    if (profile.payloads.some(p => /<script/i.test(p))) techniques.push('xss');
    if (profile.userAgents.size > 3) techniques.push('user_agent_rotation');
    
    return techniques;
  }

  generateRecommendations(profile) {
    const recs = [];
    
    if (profile.threatLevel >= 5) {
      recs.push({ priority: 'high', action: 'block_ip', target: profile.id });
    }
    if (profile.paths.some(p => p.includes('admin'))) {
      recs.push({ priority: 'high', action: 'secure_admin_paths' });
    }
    if (profile.payloads.length > 10) {
      recs.push({ priority: 'medium', action: 'enable_waf_rules' });
    }
    
    recs.push({ priority: 'low', action: 'continue_monitoring', duration: '7d' });
    
    return recs;
  }

  // ─── State & Heartbeat ──────────────────────────────────────────────────────
  async handleGetState() {
    return this.jsonResponse({
      objectType: 'GhostHoneypot',
      version: '1.0.0',
      ghostType: this.ghostType,
      tarpitDelay: this.tarpitDelay,
      interactions: this.interactions.length,
      attackers: this.attackerProfiles.size,
      patterns: this.extractedPatterns.length,
      metrics: this.metrics,
      ghostTypes: GHOST_TYPES,
      phi: PHI,
    });
  }

  async handleHeartbeat() {
    const now = Date.now();
    const delta = now - this.metrics.lastHeartbeat;
    this.metrics.lastHeartbeat = now;
    
    await this.persistAll();
    this.broadcast({ event: 'heartbeat', delta, timestamp: now });
    
    return this.jsonResponse({
      heartbeat: true,
      delta,
      interactions: this.interactions.length,
      attackers: this.attackerProfiles.size,
      patterns: this.extractedPatterns.length,
      metrics: this.metrics,
    });
  }

  // ─── WebSocket ──────────────────────────────────────────────────────────────
  handleWebSocket(request) {
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    
    this.state.acceptWebSocket(server);
    this.websockets.add(server);
    
    server.addEventListener('close', () => {
      this.websockets.delete(server);
    });
    
    return new Response(null, { status: 101, webSocket: client });
  }

  // ─── Utilities ──────────────────────────────────────────────────────────────
  broadcast(message) {
    const data = JSON.stringify(message);
    for (const ws of this.websockets) {
      try {
        ws.send(data);
      } catch (e) {
        this.websockets.delete(ws);
      }
    }
  }

  jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async persistAll() {
    await this.storage.put({
      interactions: this.interactions.slice(-500),
      attackerProfiles: Object.fromEntries(
        Array.from(this.attackerProfiles.entries()).map(([k, v]) => [
          k,
          { ...v, userAgents: Array.from(v.userAgents) },
        ])
      ),
      extractedPatterns: this.extractedPatterns.slice(-500),
      ghostType: this.ghostType,
      metrics: this.metrics,
    });
  }
}

export { GHOST_TYPES, FAKE_DATA };
export default GhostHoneypot;
