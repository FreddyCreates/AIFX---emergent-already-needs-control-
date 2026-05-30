/**
 * 📚 KnowledgeCorpus Durable Object
 * ════════════════════════════════════════════════════════════════════════════
 * 
 * SMART AI DATASET LAYER
 * 
 * Self-organizing knowledge corpus that powers RAG (Retrieval-Augmented Generation).
 * Documents are chunked, embedded, and organized into semantic clusters that
 * evolve over time based on query patterns and reinforcement signals.
 * 
 * Architecture:
 *   - SQLite-backed storage for documents and embeddings
 *   - Phi-harmonic chunking (golden ratio based segment boundaries)
 *   - Hebbian link strengthening between frequently co-retrieved chunks
 *   - Kuramoto-style cluster synchronization
 * 
 * Integration:
 *   - Workers AI for embedding generation
 *   - Vectorize for high-speed similarity search
 *   - R2 for original document storage
 * 
 * @module organism/durable-objects/knowledge-corpus
 * @version 1.0.0
 * @powered-by ORO Systems
 */

// ─── Phi Constants ────────────────────────────────────────────────────────────
const PHI = 1.618033988749895;
const PHI_INV = 0.618033988749895;
const HEARTBEAT = 873;

// ─── Chunk Size Targets (Phi-scaled) ──────────────────────────────────────────
const CHUNK_SIZES = {
  MICRO: Math.round(100 * PHI_INV),     // ~62 chars
  SMALL: Math.round(100 * PHI),         // ~162 chars
  MEDIUM: Math.round(250 * PHI),        // ~405 chars
  LARGE: Math.round(400 * PHI),         // ~647 chars
  MAX: Math.round(650 * PHI),           // ~1052 chars
};

// ─── Document Types ───────────────────────────────────────────────────────────
const DOC_TYPES = {
  TEXT: 'text',
  CODE: 'code',
  MARKDOWN: 'markdown',
  JSON: 'json',
  PROTOCOL: 'protocol',
  CONVERSATION: 'conversation',
};

// ─── Cluster States ───────────────────────────────────────────────────────────
const CLUSTER_STATES = {
  FORMING: 'forming',
  ACTIVE: 'active',
  DORMANT: 'dormant',
  MERGING: 'merging',
};

/**
 * KnowledgeCorpus — Smart AI Dataset Durable Object
 */
export class KnowledgeCorpus {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.storage = state.storage;
    this.sql = state.storage.sql;
    
    // ─── In-Memory State ──────────────────────────────────────────────────────
    this.documents = new Map();       // docId -> metadata
    this.chunks = new Map();          // chunkId -> chunk
    this.clusters = new Map();        // clusterId -> cluster
    this.hebbianLinks = new Map();    // "chunkA->chunkB" -> weight
    this.queryCache = new Map();      // query -> { results, timestamp }
    this.websockets = new Set();
    
    // ─── Metrics ──────────────────────────────────────────────────────────────
    this.metrics = {
      totalDocuments: 0,
      totalChunks: 0,
      totalClusters: 0,
      totalQueries: 0,
      cacheHits: 0,
      hebbianStrengthenings: 0,
      lastHeartbeat: Date.now(),
    };
    
    this.initialized = false;
    this.initPromise = this.initialize();
  }

  async initialize() {
    if (this.initialized) return;
    
    // Initialize SQLite tables
    await this.sql.exec(`
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        source TEXT,
        type TEXT,
        title TEXT,
        content TEXT,
        metadata TEXT,
        embedding TEXT,
        created_at INTEGER,
        updated_at INTEGER
      );
      
      CREATE TABLE IF NOT EXISTS chunks (
        id TEXT PRIMARY KEY,
        doc_id TEXT,
        sequence INTEGER,
        content TEXT,
        embedding TEXT,
        cluster_id TEXT,
        access_count INTEGER DEFAULT 0,
        created_at INTEGER,
        FOREIGN KEY (doc_id) REFERENCES documents(id)
      );
      
      CREATE TABLE IF NOT EXISTS clusters (
        id TEXT PRIMARY KEY,
        centroid TEXT,
        member_count INTEGER DEFAULT 0,
        state TEXT,
        keywords TEXT,
        phase REAL DEFAULT 0,
        created_at INTEGER,
        updated_at INTEGER
      );
      
      CREATE TABLE IF NOT EXISTS hebbian_links (
        source_chunk TEXT,
        target_chunk TEXT,
        weight REAL DEFAULT 0.1,
        co_retrievals INTEGER DEFAULT 0,
        PRIMARY KEY (source_chunk, target_chunk)
      );
      
      CREATE INDEX IF NOT EXISTS idx_chunks_doc ON chunks(doc_id);
      CREATE INDEX IF NOT EXISTS idx_chunks_cluster ON chunks(cluster_id);
      CREATE INDEX IF NOT EXISTS idx_docs_type ON documents(type);
    `);
    
    // Load metrics
    const storedMetrics = await this.storage.get('metrics');
    if (storedMetrics) Object.assign(this.metrics, storedMetrics);
    
    // Count records
    const docCount = await this.sql.exec('SELECT COUNT(*) as count FROM documents');
    const chunkCount = await this.sql.exec('SELECT COUNT(*) as count FROM chunks');
    const clusterCount = await this.sql.exec('SELECT COUNT(*) as count FROM clusters');
    
    this.metrics.totalDocuments = docCount.one()?.count || 0;
    this.metrics.totalChunks = chunkCount.one()?.count || 0;
    this.metrics.totalClusters = clusterCount.one()?.count || 0;
    
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
      // Document endpoints
      if (path === '/ingest' && request.method === 'POST') {
        return this.handleIngest(request);
      }
      if (path === '/query' && request.method === 'POST') {
        return this.handleQuery(request);
      }
      if (path === '/documents' && request.method === 'GET') {
        return this.handleListDocuments(request);
      }
      if (path.startsWith('/document/') && request.method === 'GET') {
        return this.handleGetDocument(request, path.split('/').pop());
      }
      if (path.startsWith('/document/') && request.method === 'DELETE') {
        return this.handleDeleteDocument(request, path.split('/').pop());
      }
      
      // Chunk endpoints
      if (path === '/chunks' && request.method === 'GET') {
        return this.handleListChunks(request);
      }
      if (path.startsWith('/chunk/') && request.method === 'GET') {
        return this.handleGetChunk(request, path.split('/').pop());
      }
      
      // Cluster endpoints
      if (path === '/clusters' && request.method === 'GET') {
        return this.handleListClusters();
      }
      if (path === '/cluster/reorganize' && request.method === 'POST') {
        return this.handleReorganizeClusters();
      }
      
      // Hebbian endpoints
      if (path === '/hebbian/strengthen' && request.method === 'POST') {
        return this.handleHebbianStrengthen(request);
      }
      if (path === '/hebbian/links' && request.method === 'GET') {
        return this.handleGetHebbianLinks();
      }
      
      // State endpoints
      if (path === '/state' && request.method === 'GET') {
        return this.handleGetState();
      }
      if (path === '/heartbeat' && request.method === 'POST') {
        return this.handleHeartbeat();
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

  // ─── Document Ingestion ─────────────────────────────────────────────────────
  async handleIngest(request) {
    const { source, content, type = DOC_TYPES.TEXT, title, metadata = {} } = await request.json();
    
    if (!content) {
      return this.jsonResponse({ error: 'content required' }, 400);
    }
    
    const now = Date.now();
    const docId = `doc-${now}-${Math.random().toString(36).slice(2, 8)}`;
    
    // Phi-harmonic chunking
    const chunks = this.chunkContent(content, type);
    
    // Insert document
    await this.sql.exec(
      `INSERT INTO documents (id, source, type, title, content, metadata, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      docId,
      source || 'unknown',
      type,
      title || `Document ${docId}`,
      content,
      JSON.stringify(metadata),
      now,
      now
    );
    
    // Insert chunks
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const chunkId = `${docId}-chunk-${i}`;
      
      await this.sql.exec(
        `INSERT INTO chunks (id, doc_id, sequence, content, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        chunkId,
        docId,
        i,
        chunk.content,
        now
      );
    }
    
    this.metrics.totalDocuments++;
    this.metrics.totalChunks += chunks.length;
    await this.storage.put('metrics', this.metrics);
    
    this.broadcast({ event: 'document_ingested', docId, chunkCount: chunks.length });
    
    return this.jsonResponse({
      ingested: true,
      docId,
      chunks: chunks.length,
      totalLength: content.length,
    });
  }

  /**
   * Phi-harmonic content chunking.
   * Creates chunks at natural boundaries, with sizes following golden ratio.
   */
  chunkContent(content, type) {
    const chunks = [];
    let remaining = content;
    let sequence = 0;
    
    // Detect natural boundaries based on type
    let boundaries;
    switch (type) {
      case DOC_TYPES.CODE:
        boundaries = /\n\n|\n(?=function|class|const|let|var|export|import|async|\/\*\*)/g;
        break;
      case DOC_TYPES.MARKDOWN:
        boundaries = /\n#{1,6}\s|\n\n\n?/g;
        break;
      case DOC_TYPES.JSON:
        boundaries = /\},?\s*\n/g;
        break;
      default:
        boundaries = /\n\n|\.\s+(?=[A-Z])/g;
    }
    
    // Split at boundaries
    const segments = remaining.split(boundaries).filter(s => s.trim());
    
    let currentChunk = '';
    const targetSize = CHUNK_SIZES.MEDIUM;
    
    for (const segment of segments) {
      if (currentChunk.length + segment.length <= targetSize * PHI) {
        currentChunk += (currentChunk ? '\n\n' : '') + segment;
      } else {
        if (currentChunk) {
          chunks.push({
            sequence: sequence++,
            content: currentChunk.trim(),
            size: currentChunk.length,
          });
        }
        currentChunk = segment;
      }
    }
    
    // Add final chunk
    if (currentChunk.trim()) {
      chunks.push({
        sequence: sequence,
        content: currentChunk.trim(),
        size: currentChunk.length,
      });
    }
    
    return chunks;
  }

  // ─── Query Processing ───────────────────────────────────────────────────────
  async handleQuery(request) {
    const { query, topK = 5, filter = {} } = await request.json();
    
    if (!query) {
      return this.jsonResponse({ error: 'query required' }, 400);
    }
    
    this.metrics.totalQueries++;
    
    // Check cache
    const cacheKey = `${query}:${topK}:${JSON.stringify(filter)}`;
    const cached = this.queryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 60000) {
      this.metrics.cacheHits++;
      return this.jsonResponse({
        results: cached.results,
        fromCache: true,
        query,
      });
    }
    
    // For now, do simple text matching (would use Vectorize embeddings in production)
    const queryTerms = query.toLowerCase().split(/\s+/);
    
    let sql = 'SELECT id, doc_id, content, access_count FROM chunks WHERE 1=1';
    const params = [];
    
    if (filter.docType) {
      sql += ' AND doc_id IN (SELECT id FROM documents WHERE type = ?)';
      params.push(filter.docType);
    }
    
    const allChunks = await this.sql.exec(sql, ...params).toArray();
    
    // Score chunks by term overlap
    const scored = allChunks.map(chunk => {
      const contentLower = chunk.content.toLowerCase();
      let score = 0;
      
      for (const term of queryTerms) {
        const count = (contentLower.match(new RegExp(term, 'g')) || []).length;
        score += count * PHI;
      }
      
      // Boost frequently accessed chunks
      score += (chunk.access_count || 0) * 0.1;
      
      return { ...chunk, score };
    }).filter(c => c.score > 0);
    
    // Sort by score and take topK
    scored.sort((a, b) => b.score - a.score);
    const results = scored.slice(0, topK);
    
    // Update access counts
    for (const result of results) {
      await this.sql.exec(
        'UPDATE chunks SET access_count = access_count + 1 WHERE id = ?',
        result.id
      );
    }
    
    // Strengthen Hebbian links between co-retrieved chunks
    if (results.length > 1) {
      for (let i = 0; i < results.length - 1; i++) {
        for (let j = i + 1; j < results.length; j++) {
          await this.strengthenHebbianLink(results[i].id, results[j].id);
        }
      }
    }
    
    // Cache results
    this.queryCache.set(cacheKey, { results, timestamp: Date.now() });
    
    // Clean old cache entries
    if (this.queryCache.size > 1000) {
      const entries = Array.from(this.queryCache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      for (let i = 0; i < 500; i++) {
        this.queryCache.delete(entries[i][0]);
      }
    }
    
    await this.storage.put('metrics', this.metrics);
    
    return this.jsonResponse({
      results: results.map(r => ({
        chunkId: r.id,
        docId: r.doc_id,
        content: r.content,
        score: parseFloat(r.score.toFixed(4)),
      })),
      fromCache: false,
      query,
      totalMatches: scored.length,
    });
  }

  // ─── Hebbian Learning ───────────────────────────────────────────────────────
  async strengthenHebbianLink(sourceChunk, targetChunk) {
    // Ensure consistent ordering
    const [a, b] = [sourceChunk, targetChunk].sort();
    
    const existing = await this.sql.exec(
      'SELECT weight, co_retrievals FROM hebbian_links WHERE source_chunk = ? AND target_chunk = ?',
      a, b
    ).one();
    
    if (existing) {
      const newWeight = Math.min(PHI * PHI, existing.weight + (PHI * 0.05));
      await this.sql.exec(
        'UPDATE hebbian_links SET weight = ?, co_retrievals = co_retrievals + 1 WHERE source_chunk = ? AND target_chunk = ?',
        newWeight, a, b
      );
    } else {
      await this.sql.exec(
        'INSERT INTO hebbian_links (source_chunk, target_chunk, weight, co_retrievals) VALUES (?, ?, ?, 1)',
        a, b, 0.1
      );
    }
    
    this.metrics.hebbianStrengthenings++;
  }

  async handleHebbianStrengthen(request) {
    const { sourceChunk, targetChunk, strength = 1 } = await request.json();
    
    if (!sourceChunk || !targetChunk) {
      return this.jsonResponse({ error: 'sourceChunk and targetChunk required' }, 400);
    }
    
    await this.strengthenHebbianLink(sourceChunk, targetChunk);
    
    return this.jsonResponse({ strengthened: true, sourceChunk, targetChunk });
  }

  async handleGetHebbianLinks() {
    const links = await this.sql.exec(
      'SELECT * FROM hebbian_links ORDER BY weight DESC LIMIT 100'
    ).toArray();
    
    return this.jsonResponse({
      links,
      total: links.length,
    });
  }

  // ─── Document Management ────────────────────────────────────────────────────
  async handleListDocuments(request) {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const type = url.searchParams.get('type');
    
    let sql = 'SELECT id, source, type, title, created_at FROM documents';
    const params = [];
    
    if (type) {
      sql += ' WHERE type = ?';
      params.push(type);
    }
    
    sql += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);
    
    const docs = await this.sql.exec(sql, ...params).toArray();
    
    return this.jsonResponse({
      documents: docs,
      total: this.metrics.totalDocuments,
    });
  }

  async handleGetDocument(request, docId) {
    const doc = await this.sql.exec(
      'SELECT * FROM documents WHERE id = ?', docId
    ).one();
    
    if (!doc) {
      return this.jsonResponse({ error: 'Document not found' }, 404);
    }
    
    const chunks = await this.sql.exec(
      'SELECT id, sequence, content, cluster_id, access_count FROM chunks WHERE doc_id = ? ORDER BY sequence',
      docId
    ).toArray();
    
    return this.jsonResponse({
      document: {
        ...doc,
        metadata: JSON.parse(doc.metadata || '{}'),
      },
      chunks,
    });
  }

  async handleDeleteDocument(request, docId) {
    await this.sql.exec('DELETE FROM chunks WHERE doc_id = ?', docId);
    await this.sql.exec('DELETE FROM documents WHERE id = ?', docId);
    
    this.metrics.totalDocuments--;
    await this.storage.put('metrics', this.metrics);
    
    this.broadcast({ event: 'document_deleted', docId });
    
    return this.jsonResponse({ deleted: true, docId });
  }

  // ─── Chunk Management ───────────────────────────────────────────────────────
  async handleListChunks(request) {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const docId = url.searchParams.get('docId');
    const clusterId = url.searchParams.get('clusterId');
    
    let sql = 'SELECT id, doc_id, sequence, content, cluster_id, access_count FROM chunks WHERE 1=1';
    const params = [];
    
    if (docId) {
      sql += ' AND doc_id = ?';
      params.push(docId);
    }
    if (clusterId) {
      sql += ' AND cluster_id = ?';
      params.push(clusterId);
    }
    
    sql += ' ORDER BY access_count DESC LIMIT ?';
    params.push(limit);
    
    const chunks = await this.sql.exec(sql, ...params).toArray();
    
    return this.jsonResponse({
      chunks,
      total: this.metrics.totalChunks,
    });
  }

  async handleGetChunk(request, chunkId) {
    const chunk = await this.sql.exec(
      'SELECT * FROM chunks WHERE id = ?', chunkId
    ).one();
    
    if (!chunk) {
      return this.jsonResponse({ error: 'Chunk not found' }, 404);
    }
    
    // Get related chunks via Hebbian links
    const related = await this.sql.exec(
      `SELECT c.*, h.weight FROM chunks c
       JOIN hebbian_links h ON (c.id = h.target_chunk OR c.id = h.source_chunk)
       WHERE (h.source_chunk = ? OR h.target_chunk = ?) AND c.id != ?
       ORDER BY h.weight DESC LIMIT 5`,
      chunkId, chunkId, chunkId
    ).toArray();
    
    return this.jsonResponse({
      chunk,
      relatedChunks: related,
    });
  }

  // ─── Cluster Management ─────────────────────────────────────────────────────
  async handleListClusters() {
    const clusters = await this.sql.exec(
      'SELECT * FROM clusters ORDER BY member_count DESC'
    ).toArray();
    
    return this.jsonResponse({
      clusters: clusters.map(c => ({
        ...c,
        keywords: JSON.parse(c.keywords || '[]'),
      })),
      total: clusters.length,
    });
  }

  async handleReorganizeClusters() {
    // Simple clustering based on Hebbian links
    // Chunks that are frequently co-retrieved form clusters
    
    const strongLinks = await this.sql.exec(
      'SELECT source_chunk, target_chunk, weight FROM hebbian_links WHERE weight > ? ORDER BY weight DESC',
      PHI_INV
    ).toArray();
    
    // Union-find style clustering
    const parent = new Map();
    const rank = new Map();
    
    const find = (x) => {
      if (!parent.has(x)) parent.set(x, x);
      if (parent.get(x) !== x) {
        parent.set(x, find(parent.get(x)));
      }
      return parent.get(x);
    };
    
    const union = (x, y) => {
      const px = find(x);
      const py = find(y);
      if (px === py) return;
      
      const rx = rank.get(px) || 0;
      const ry = rank.get(py) || 0;
      
      if (rx < ry) {
        parent.set(px, py);
      } else if (rx > ry) {
        parent.set(py, px);
      } else {
        parent.set(py, px);
        rank.set(px, rx + 1);
      }
    };
    
    // Build clusters from links
    for (const link of strongLinks) {
      union(link.source_chunk, link.target_chunk);
    }
    
    // Group chunks by cluster
    const clusterGroups = new Map();
    for (const [chunk, _] of parent) {
      const root = find(chunk);
      if (!clusterGroups.has(root)) {
        clusterGroups.set(root, []);
      }
      clusterGroups.get(root).push(chunk);
    }
    
    // Create/update cluster records
    const now = Date.now();
    let clustersCreated = 0;
    
    for (const [root, members] of clusterGroups) {
      if (members.length < 2) continue;
      
      const clusterId = `cluster-${root}`;
      
      // Get sample content for keywords
      const samples = await this.sql.exec(
        `SELECT content FROM chunks WHERE id IN (${members.slice(0, 5).map(() => '?').join(',')})`,
        ...members.slice(0, 5)
      ).toArray();
      
      const keywords = this.extractKeywords(samples.map(s => s.content).join(' '));
      
      await this.sql.exec(
        `INSERT OR REPLACE INTO clusters (id, member_count, state, keywords, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        clusterId,
        members.length,
        CLUSTER_STATES.ACTIVE,
        JSON.stringify(keywords),
        now,
        now
      );
      
      // Update chunk cluster assignments
      for (const chunkId of members) {
        await this.sql.exec(
          'UPDATE chunks SET cluster_id = ? WHERE id = ?',
          clusterId, chunkId
        );
      }
      
      clustersCreated++;
    }
    
    this.metrics.totalClusters = clustersCreated;
    await this.storage.put('metrics', this.metrics);
    
    this.broadcast({ event: 'clusters_reorganized', count: clustersCreated });
    
    return this.jsonResponse({
      reorganized: true,
      clustersCreated,
      totalLinks: strongLinks.length,
    });
  }

  extractKeywords(text, topN = 10) {
    const STOP = new Set([
      'the', 'a', 'an', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 'of', 'to',
      'and', 'or', 'but', 'for', 'with', 'this', 'that', 'it', 'as', 'by', 'from',
      'be', 'have', 'has', 'function', 'const', 'let', 'var', 'return', 'if', 'else',
    ]);
    
    const freq = new Map();
    const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 3 && !STOP.has(w));
    
    for (const w of words) {
      freq.set(w, (freq.get(w) || 0) + 1);
    }
    
    return [...freq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(e => e[0]);
  }

  // ─── State & Heartbeat ──────────────────────────────────────────────────────
  async handleGetState() {
    return this.jsonResponse({
      objectType: 'KnowledgeCorpus',
      version: '1.0.0',
      metrics: this.metrics,
      chunkSizes: CHUNK_SIZES,
      docTypes: DOC_TYPES,
      clusterStates: CLUSTER_STATES,
      phi: PHI,
    });
  }

  async handleHeartbeat() {
    const now = Date.now();
    const delta = now - this.metrics.lastHeartbeat;
    this.metrics.lastHeartbeat = now;
    
    // Decay Hebbian links (forgetting)
    await this.sql.exec(
      'UPDATE hebbian_links SET weight = weight * ?',
      PHI_INV
    );
    
    // Remove very weak links
    await this.sql.exec(
      'DELETE FROM hebbian_links WHERE weight < 0.01'
    );
    
    await this.storage.put('metrics', this.metrics);
    this.broadcast({ event: 'heartbeat', delta, timestamp: now });
    
    return this.jsonResponse({
      heartbeat: true,
      delta,
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
}

export { DOC_TYPES, CHUNK_SIZES, CLUSTER_STATES };
export default KnowledgeCorpus;
