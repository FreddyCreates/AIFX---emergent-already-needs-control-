/**
 * 🔮 MemoryVault Durable Object
 * ════════════════════════════════════════════════════════════════════════════
 * 
 * FRACTURE II OF THE VEIN OF INTELLIGENCE
 * 
 * A synthetic memory system with three-tier consolidation: Working → Episodic → Semantic.
 * AI systems can write, read, search, and evolve memories. Memories strengthen
 * on access (Hebbian recall) and decay over time (phi-weighted forgetting).
 * 
 * Features:
 *   - Working Memory (fast decay, 7±2 capacity — Miller's magic number)
 *   - Episodic Memory (event-based, associative)
 *   - Semantic Memory (abstracted knowledge, slow decay)
 *   - Memory consolidation during heartbeat cycles
 *   - Phi-weighted importance scoring
 *   - Full lineage tracking (who wrote what, when, why)
 * 
 * @module organism/durable-objects/memory-vault
 * @version 1.0.0
 * @powered-by ORO Systems
 */

// ─── Phi Constants ────────────────────────────────────────────────────────────
const PHI = 1.618033988749895;
const PHI_INV = 0.618033988749895;
const HEARTBEAT = 873;

// Miller's magic number: working memory capacity
const WORKING_CAPACITY = 7;
const CONSOLIDATION_THRESHOLD = PHI_INV;  // 0.618...

/**
 * MemoryVault — A Durable Object representing a persistent memory system
 * with three-tier consolidation.
 */
export class MemoryVault {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.storage = state.storage;
    
    // ─── In-Memory State ──────────────────────────────────────────────────────
    this.working = new Map();    // Fast-access working memory
    this.episodic = new Map();   // Event-based memories
    this.semantic = new Map();   // Abstracted knowledge
    this.lineage = [];           // Memory evolution log
    this.websockets = new Set();
    
    // ─── Metrics ──────────────────────────────────────────────────────────────
    this.totalEncodes = 0;
    this.totalRecalls = 0;
    this.totalConsolidations = 0;
    this.lastHeartbeat = Date.now();
    this.initialized = false;
    
    this.initPromise = this.initialize();
  }

  async initialize() {
    if (this.initialized) return;
    
    // Load persisted memories
    const stored = await this.storage.get(['working', 'episodic', 'semantic', 'metrics', 'lineage']);
    
    if (stored.working) this.working = new Map(Object.entries(stored.working));
    if (stored.episodic) this.episodic = new Map(Object.entries(stored.episodic));
    if (stored.semantic) this.semantic = new Map(Object.entries(stored.semantic));
    if (stored.lineage) this.lineage = stored.lineage;
    if (stored.metrics) {
      this.totalEncodes = stored.metrics.totalEncodes || 0;
      this.totalRecalls = stored.metrics.totalRecalls || 0;
      this.totalConsolidations = stored.metrics.totalConsolidations || 0;
    }
    
    this.initialized = true;
  }

  async fetch(request) {
    await this.initPromise;
    
    const url = new URL(request.url);
    const path = url.pathname;
    
    // WebSocket for real-time memory streaming
    if (request.headers.get('Upgrade') === 'websocket') {
      return this.handleWebSocket(request);
    }
    
    try {
      // Memory operations
      if (path === '/memory/write' && request.method === 'POST') {
        return this.handleWrite(request);
      }
      if (path === '/memory/read' && request.method === 'GET') {
        return this.handleRead(request);
      }
      if (path === '/memory/search' && request.method === 'POST') {
        return this.handleSearch(request);
      }
      if (path === '/memory/recall' && request.method === 'POST') {
        return this.handleRecall(request);
      }
      if (path === '/memory/forget' && request.method === 'DELETE') {
        return this.handleForget(request);
      }
      if (path === '/memory/consolidate' && request.method === 'POST') {
        return this.handleConsolidate(request);
      }
      if (path === '/memory/lineage' && request.method === 'GET') {
        return this.handleLineage(request);
      }
      if (path === '/vault/state' && request.method === 'GET') {
        return this.handleGetState();
      }
      if (path === '/vault/heartbeat' && request.method === 'POST') {
        return this.handleHeartbeat();
      }
      
      // Context layer
      if (path === '/context/set' && request.method === 'POST') {
        return this.handleSetContext(request);
      }
      if (path === '/context/get' && request.method === 'GET') {
        return this.handleGetContext(request);
      }
      
      // Knowledge graph layer
      if (path === '/graph/link' && request.method === 'POST') {
        return this.handleGraphLink(request);
      }
      if (path === '/graph/query' && request.method === 'POST') {
        return this.handleGraphQuery(request);
      }
      
      return new Response(JSON.stringify({ error: 'Unknown route', path }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // ─── Memory Write (Encode) ──────────────────────────────────────────────────
  async handleWrite(request) {
    const { content, importance = 0.5, agentId = 'unknown', tags = [], metadata = {} } = await request.json();
    
    if (!content) {
      return this.jsonResponse({ error: 'content required' }, 400);
    }
    
    const id = `mem-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    
    const memory = {
      id,
      content,
      importance: Math.max(0, Math.min(1, importance)),
      encodedAt: Date.now(),
      accessCount: 0,
      lastAccess: Date.now(),
      strength: importance * PHI,
      type: 'working',
      agentId,
      tags,
      metadata,
    };
    
    // Add to working memory
    this.working.set(id, memory);
    this.totalEncodes++;
    
    // Enforce working memory capacity (evict weakest if over capacity)
    while (this.working.size > WORKING_CAPACITY) {
      let weakestId = null;
      let weakestStrength = Infinity;
      
      for (const [mid, mem] of this.working) {
        if (mem.strength < weakestStrength) {
          weakestStrength = mem.strength;
          weakestId = mid;
        }
      }
      
      if (weakestId) {
        const evicted = this.working.get(weakestId);
        this.working.delete(weakestId);
        
        // Move to episodic if strong enough
        if (evicted.strength >= CONSOLIDATION_THRESHOLD) {
          evicted.type = 'episodic';
          this.episodic.set(weakestId, evicted);
          this.logLineage('evict_to_episodic', weakestId, agentId);
        }
      } else {
        break;
      }
    }
    
    await this.persistAll();
    this.logLineage('encode', id, agentId);
    this.broadcast({ event: 'memory_encoded', id, type: 'working' });
    
    return this.jsonResponse({
      encoded: true,
      id,
      type: 'working',
      strength: parseFloat(memory.strength.toFixed(4)),
      workingSize: this.working.size,
    });
  }

  // ─── Memory Read ────────────────────────────────────────────────────────────
  async handleRead(request) {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return this.jsonResponse({ error: 'id required' }, 400);
    }
    
    // Search all stores
    let memory = this.working.get(id) || this.episodic.get(id) || this.semantic.get(id);
    
    if (!memory) {
      return this.jsonResponse({ error: 'Memory not found', id }, 404);
    }
    
    // Strengthen on recall (Hebbian)
    memory.accessCount++;
    memory.lastAccess = Date.now();
    memory.strength = Math.min(PHI, memory.strength * 1.1);
    this.totalRecalls++;
    
    await this.persistAll();
    
    return this.jsonResponse({
      found: true,
      memory: {
        id: memory.id,
        content: memory.content,
        type: memory.type,
        strength: parseFloat(memory.strength.toFixed(4)),
        accessCount: memory.accessCount,
        encodedAt: memory.encodedAt,
        agentId: memory.agentId,
        tags: memory.tags,
      },
    });
  }

  // ─── Memory Search ──────────────────────────────────────────────────────────
  async handleSearch(request) {
    const { query, types = ['working', 'episodic', 'semantic'], limit = 10 } = await request.json();
    
    const results = [];
    const queryLower = typeof query === 'string' ? query.toLowerCase() : JSON.stringify(query).toLowerCase();
    
    const searchStore = (store, type) => {
      if (!types.includes(type)) return;
      
      for (const [id, mem] of store) {
        const content = typeof mem.content === 'string'
          ? mem.content.toLowerCase()
          : JSON.stringify(mem.content).toLowerCase();
        
        if (content.includes(queryLower)) {
          results.push({
            id: mem.id,
            content: mem.content,
            type,
            strength: parseFloat(mem.strength.toFixed(4)),
            relevance: mem.strength,
            encodedAt: mem.encodedAt,
            tags: mem.tags,
          });
        }
      }
    };
    
    searchStore(this.working, 'working');
    searchStore(this.episodic, 'episodic');
    searchStore(this.semantic, 'semantic');
    
    // Sort by relevance (strength)
    results.sort((a, b) => b.relevance - a.relevance);
    
    return this.jsonResponse({
      query,
      found: results.length,
      results: results.slice(0, limit),
    });
  }

  // ─── Memory Recall (like read but more intelligent) ─────────────────────────
  async handleRecall(request) {
    const { cue, agentId = 'unknown' } = await request.json();
    
    if (!cue) {
      return this.jsonResponse({ error: 'cue required' }, 400);
    }
    
    // Pattern matching across all memories
    const cueLower = typeof cue === 'string' ? cue.toLowerCase() : JSON.stringify(cue).toLowerCase();
    const matches = [];
    
    const searchAndScore = (store, type) => {
      for (const [id, mem] of store) {
        const content = typeof mem.content === 'string'
          ? mem.content.toLowerCase()
          : JSON.stringify(mem.content).toLowerCase();
        
        // Compute similarity (simple overlap score)
        let overlap = 0;
        const cueWords = cueLower.split(/\s+/);
        for (const word of cueWords) {
          if (content.includes(word)) overlap++;
        }
        
        if (overlap > 0) {
          const score = (overlap / cueWords.length) * mem.strength;
          matches.push({
            memory: mem,
            type,
            score,
          });
        }
      }
    };
    
    searchAndScore(this.working, 'working');
    searchAndScore(this.episodic, 'episodic');
    searchAndScore(this.semantic, 'semantic');
    
    // Sort by score
    matches.sort((a, b) => b.score - a.score);
    
    if (matches.length === 0) {
      return this.jsonResponse({ recalled: false, cue, matches: 0 });
    }
    
    // Strengthen top match (Hebbian recall)
    const best = matches[0];
    best.memory.accessCount++;
    best.memory.lastAccess = Date.now();
    best.memory.strength = Math.min(PHI, best.memory.strength * 1.15);
    this.totalRecalls++;
    
    await this.persistAll();
    this.logLineage('recall', best.memory.id, agentId);
    
    return this.jsonResponse({
      recalled: true,
      memory: {
        id: best.memory.id,
        content: best.memory.content,
        type: best.type,
        strength: parseFloat(best.memory.strength.toFixed(4)),
        score: parseFloat(best.score.toFixed(4)),
      },
      alternatives: matches.slice(1, 4).map(m => ({
        id: m.memory.id,
        type: m.type,
        score: parseFloat(m.score.toFixed(4)),
      })),
    });
  }

  // ─── Memory Consolidation ───────────────────────────────────────────────────
  async handleConsolidate(request) {
    const { agentId = 'system' } = await request.json();
    
    const consolidated = {
      workingToEpisodic: [],
      episodicToSemantic: [],
    };
    
    // Working → Episodic (strong enough memories)
    for (const [id, mem] of this.working) {
      if (mem.strength >= CONSOLIDATION_THRESHOLD) {
        mem.type = 'episodic';
        this.episodic.set(id, mem);
        this.working.delete(id);
        consolidated.workingToEpisodic.push(id);
        this.logLineage('consolidate_to_episodic', id, agentId);
      }
    }
    
    // Episodic → Semantic (very strong + old + frequently accessed)
    for (const [id, mem] of this.episodic) {
      const age = Date.now() - mem.encodedAt;
      const isOld = age > HEARTBEAT * 100;  // About 1.5 minutes
      const isStrong = mem.strength >= CONSOLIDATION_THRESHOLD * PHI;
      const isFrequent = mem.accessCount >= 3;
      
      if (isOld && isStrong && isFrequent) {
        // Abstract the memory before moving to semantic
        const abstracted = this.abstract(mem);
        abstracted.type = 'semantic';
        this.semantic.set(id, abstracted);
        this.episodic.delete(id);
        consolidated.episodicToSemantic.push(id);
        this.logLineage('consolidate_to_semantic', id, agentId);
      }
    }
    
    this.totalConsolidations++;
    await this.persistAll();
    
    this.broadcast({ event: 'consolidated', ...consolidated });
    
    return this.jsonResponse({
      consolidated: true,
      workingToEpisodic: consolidated.workingToEpisodic.length,
      episodicToSemantic: consolidated.episodicToSemantic.length,
      totalConsolidations: this.totalConsolidations,
    });
  }

  // ─── Memory Forgetting ──────────────────────────────────────────────────────
  async handleForget(request) {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const agentId = url.searchParams.get('agentId') || 'unknown';
    
    if (!id) {
      return this.jsonResponse({ error: 'id required' }, 400);
    }
    
    let forgotten = false;
    let fromType = null;
    
    if (this.working.delete(id)) {
      forgotten = true;
      fromType = 'working';
    } else if (this.episodic.delete(id)) {
      forgotten = true;
      fromType = 'episodic';
    } else if (this.semantic.delete(id)) {
      forgotten = true;
      fromType = 'semantic';
    }
    
    if (forgotten) {
      await this.persistAll();
      this.logLineage('forget', id, agentId);
      this.broadcast({ event: 'memory_forgotten', id, fromType });
    }
    
    return this.jsonResponse({ forgotten, id, fromType });
  }

  // ─── Lineage Query ──────────────────────────────────────────────────────────
  async handleLineage(request) {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    
    let results = this.lineage;
    
    if (id) {
      results = results.filter(l => l.memoryId === id);
    }
    
    return this.jsonResponse({
      lineage: results.slice(-limit),
      total: results.length,
    });
  }

  // ─── Context Layer ──────────────────────────────────────────────────────────
  async handleSetContext(request) {
    const { key, value, agentId = 'unknown', ttl = null } = await request.json();
    
    if (!key) {
      return this.jsonResponse({ error: 'key required' }, 400);
    }
    
    const contextKey = `ctx:${key}`;
    const contextValue = {
      value,
      setAt: Date.now(),
      agentId,
      ttl,
      expiresAt: ttl ? Date.now() + ttl : null,
    };
    
    await this.storage.put(contextKey, contextValue);
    this.logLineage('context_set', key, agentId);
    
    return this.jsonResponse({ set: true, key, expiresAt: contextValue.expiresAt });
  }

  async handleGetContext(request) {
    const url = new URL(request.url);
    const key = url.searchParams.get('key');
    
    if (!key) {
      return this.jsonResponse({ error: 'key required' }, 400);
    }
    
    const contextKey = `ctx:${key}`;
    const contextValue = await this.storage.get(contextKey);
    
    if (!contextValue) {
      return this.jsonResponse({ found: false, key });
    }
    
    // Check expiration
    if (contextValue.expiresAt && Date.now() > contextValue.expiresAt) {
      await this.storage.delete(contextKey);
      return this.jsonResponse({ found: false, key, reason: 'expired' });
    }
    
    return this.jsonResponse({
      found: true,
      key,
      value: contextValue.value,
      setAt: contextValue.setAt,
      agentId: contextValue.agentId,
    });
  }

  // ─── Knowledge Graph Layer ──────────────────────────────────────────────────
  async handleGraphLink(request) {
    const { fromId, toId, relation, weight = 1.0, agentId = 'unknown' } = await request.json();
    
    if (!fromId || !toId || !relation) {
      return this.jsonResponse({ error: 'fromId, toId, and relation required' }, 400);
    }
    
    const linkKey = `link:${fromId}:${relation}:${toId}`;
    const link = {
      fromId,
      toId,
      relation,
      weight,
      createdAt: Date.now(),
      agentId,
    };
    
    await this.storage.put(linkKey, link);
    this.logLineage('graph_link', `${fromId}->${toId}`, agentId);
    
    return this.jsonResponse({ linked: true, key: linkKey });
  }

  async handleGraphQuery(request) {
    const { id, relation = null, direction = 'outgoing' } = await request.json();
    
    if (!id) {
      return this.jsonResponse({ error: 'id required' }, 400);
    }
    
    // Query all links (this is simplified — production would use SQL)
    const links = [];
    const prefix = direction === 'outgoing' ? `link:${id}:` : 'link:';
    const allKeys = await this.storage.list({ prefix });
    
    for (const [key, value] of allKeys) {
      const link = value;
      
      if (direction === 'outgoing' && link.fromId === id) {
        if (!relation || link.relation === relation) {
          links.push(link);
        }
      } else if (direction === 'incoming' && link.toId === id) {
        if (!relation || link.relation === relation) {
          links.push(link);
        }
      } else if (direction === 'both' && (link.fromId === id || link.toId === id)) {
        if (!relation || link.relation === relation) {
          links.push(link);
        }
      }
    }
    
    return this.jsonResponse({ id, direction, links });
  }

  // ─── Heartbeat ──────────────────────────────────────────────────────────────
  async handleHeartbeat() {
    const now = Date.now();
    const delta = now - this.lastHeartbeat;
    this.lastHeartbeat = now;
    
    // Decay all memories
    const decayFactor = Math.pow(PHI_INV, delta / (HEARTBEAT * 10));
    
    for (const [id, mem] of this.working) {
      mem.strength *= decayFactor;
    }
    for (const [id, mem] of this.episodic) {
      mem.strength *= Math.pow(decayFactor, 0.5);  // Slower decay
    }
    for (const [id, mem] of this.semantic) {
      mem.strength *= Math.pow(decayFactor, 0.1);  // Very slow decay
    }
    
    // Remove extremely weak memories
    for (const [id, mem] of this.working) {
      if (mem.strength < 0.01) this.working.delete(id);
    }
    
    await this.persistAll();
    this.broadcast({ event: 'heartbeat', delta, timestamp: now });
    
    return this.jsonResponse({
      heartbeat: true,
      delta,
      working: this.working.size,
      episodic: this.episodic.size,
      semantic: this.semantic.size,
      timestamp: now,
    });
  }

  // ─── Get State ──────────────────────────────────────────────────────────────
  async handleGetState() {
    return this.jsonResponse({
      objectType: 'MemoryVault',
      version: '1.0.0',
      stores: {
        working: this.working.size,
        episodic: this.episodic.size,
        semantic: this.semantic.size,
      },
      metrics: {
        totalEncodes: this.totalEncodes,
        totalRecalls: this.totalRecalls,
        totalConsolidations: this.totalConsolidations,
        lastHeartbeat: this.lastHeartbeat,
        lineageSize: this.lineage.length,
      },
      phi: PHI,
      workingCapacity: WORKING_CAPACITY,
      consolidationThreshold: CONSOLIDATION_THRESHOLD,
    });
  }

  // ─── WebSocket Handling ─────────────────────────────────────────────────────
  handleWebSocket(request) {
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    
    this.state.acceptWebSocket(server);
    this.websockets.add(server);
    
    server.addEventListener('message', async (event) => {
      try {
        const msg = JSON.parse(event.data);
        
        if (msg.action === 'write') {
          const result = await this.handleWrite({ json: async () => msg });
          server.send(JSON.stringify(await result.json()));
        } else if (msg.action === 'recall') {
          const result = await this.handleRecall({ json: async () => msg });
          server.send(JSON.stringify(await result.json()));
        } else if (msg.action === 'search') {
          const result = await this.handleSearch({ json: async () => msg });
          server.send(JSON.stringify(await result.json()));
        }
      } catch (e) {
        server.send(JSON.stringify({ error: e.message }));
      }
    });
    
    server.addEventListener('close', () => {
      this.websockets.delete(server);
    });
    
    return new Response(null, { status: 101, webSocket: client });
  }

  // ─── Utilities ──────────────────────────────────────────────────────────────
  abstract(memory) {
    // Simple abstraction: extract keywords/concepts
    return {
      ...memory,
      abstractedAt: Date.now(),
      original: memory.content,
    };
  }

  logLineage(action, memoryId, agentId) {
    this.lineage.push({
      action,
      memoryId,
      agentId,
      timestamp: Date.now(),
    });
    if (this.lineage.length > 1000) {
      this.lineage.shift();
    }
  }

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
      working: Object.fromEntries(this.working),
      episodic: Object.fromEntries(this.episodic),
      semantic: Object.fromEntries(this.semantic),
      lineage: this.lineage,
      metrics: {
        totalEncodes: this.totalEncodes,
        totalRecalls: this.totalRecalls,
        totalConsolidations: this.totalConsolidations,
      },
    });
  }
}

export default MemoryVault;
