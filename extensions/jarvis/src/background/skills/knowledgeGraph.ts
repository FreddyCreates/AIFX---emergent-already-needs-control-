/**
 * KnowledgeGraph — Cartographer Engine
 * ──────────────────────────────────────
 * Builds an entity-based knowledge graph from pages visited.
 * Entity extraction: proper nouns, capitalized sequences, quoted strings.
 * Edges form when the same entity appears on two different pages.
 */

const STORAGE_KEY = 'vigil_knowledge_graph';

export interface GraphNode {
  id: string;
  title: string;
  url: string;
  entities: string[];
  timestamp: number;
  visitCount: number;
}

export interface GraphEdge {
  id: string;
  from: string; // node id
  to: string;   // node id
  type: 'entity';
  sharedEntities: string[];
  weight: number;
}

export interface KnowledgeGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  updatedAt: number;
}

/* ----------------------------------------------------------
 *  Storage
 * ---------------------------------------------------------- */

async function loadGraph(): Promise<KnowledgeGraph> {
  return new Promise(r => chrome.storage.local.get([STORAGE_KEY], d => {
    r((d[STORAGE_KEY] as KnowledgeGraph) || { nodes: [], edges: [], updatedAt: 0 });
  }));
}

async function saveGraph(g: KnowledgeGraph): Promise<void> {
  g.updatedAt = Date.now();
  return new Promise(r => chrome.storage.local.set({ [STORAGE_KEY]: g }, r));
}

/* ----------------------------------------------------------
 *  Entity extraction
 * ---------------------------------------------------------- */

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'shall', 'can', 'must', 'of', 'in', 'on',
  'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into',
  'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from',
  'and', 'or', 'but', 'not', 'if', 'then', 'that', 'this', 'it', 'its',
  'I', 'you', 'he', 'she', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
  'my', 'your', 'his', 'our', 'their', 'what', 'which', 'who', 'when',
  'where', 'how', 'why', 'all', 'each', 'every', 'both', 'few', 'more',
  'most', 'other', 'some', 'such', 'no', 'nor', 'so', 'yet',
]);

/** Extract entities (proper nouns + quoted strings) from text */
export function extractEntities(text: string): string[] {
  const entities = new Set<string>();

  // 1. Quoted strings
  const quotedMatches = text.match(/"([^"]{3,60})"/g) || [];
  quotedMatches.forEach(m => entities.add(m.replace(/"/g, '').trim()));

  // 2. Capitalized multi-word sequences (proper nouns)
  const words = text.split(/\s+/);
  let sequence: string[] = [];
  for (const word of words) {
    const clean = word.replace(/[^a-zA-Z'-]/g, '');
    const isCapitalized = /^[A-Z][a-z]{1,}/.test(clean) && !STOP_WORDS.has(clean.toLowerCase());
    if (isCapitalized) {
      sequence.push(clean);
    } else {
      if (sequence.length >= 1) {
        const entity = sequence.join(' ');
        if (entity.length >= 3 && !STOP_WORDS.has(entity.toLowerCase())) {
          entities.add(entity);
        }
      }
      sequence = [];
    }
  }
  if (sequence.length >= 1) {
    const entity = sequence.join(' ');
    if (entity.length >= 3) entities.add(entity);
  }

  // 3. Hashtag-style terms
  const hashMatches = text.match(/#([a-zA-Z][a-zA-Z0-9]{2,})/g) || [];
  hashMatches.forEach(m => entities.add(m.slice(1)));

  // Deduplicate, limit
  return [...entities].slice(0, 50);
}

/* ----------------------------------------------------------
 *  Graph mutations
 * ---------------------------------------------------------- */

/** Add or update a page node; rebuild edges to existing nodes */
export async function addPage(url: string, title: string, text: string): Promise<{ node: GraphNode; newEdges: GraphEdge[] }> {
  const g = await loadGraph();

  const entities = extractEntities(text.substring(0, 5000));

  // Check if node exists
  let node = g.nodes.find(n => n.url === url);
  if (node) {
    node.entities = [...new Set([...node.entities, ...entities])].slice(0, 50);
    node.visitCount++;
    node.timestamp = Date.now();
  } else {
    node = {
      id: 'gn-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5),
      title: title || url,
      url,
      entities,
      timestamp: Date.now(),
      visitCount: 1,
    };
    g.nodes.unshift(node);
    if (g.nodes.length > 300) g.nodes = g.nodes.slice(0, 300);
  }

  // Build new edges with other nodes that share entities
  const newEdges: GraphEdge[] = [];
  const entitySet = new Set(node.entities.map(e => e.toLowerCase()));

  for (const other of g.nodes) {
    if (other.id === node.id) continue;
    const shared = other.entities.filter(e => entitySet.has(e.toLowerCase()));
    if (!shared.length) continue;

    // Check if edge already exists
    const existing = g.edges.find(e =>
      (e.from === node!.id && e.to === other.id) ||
      (e.from === other.id && e.to === node!.id)
    );

    if (existing) {
      existing.sharedEntities = [...new Set([...existing.sharedEntities, ...shared])];
      existing.weight = existing.sharedEntities.length;
    } else {
      const edge: GraphEdge = {
        id: 'ge-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5),
        from: node.id,
        to: other.id,
        type: 'entity',
        sharedEntities: shared,
        weight: shared.length,
      };
      g.edges.push(edge);
      newEdges.push(edge);
      if (g.edges.length > 2000) g.edges = g.edges.slice(0, 2000);
    }
  }

  await saveGraph(g);
  return { node, newEdges };
}

export async function getGraph(): Promise<KnowledgeGraph> {
  return loadGraph();
}

/** Get nodes related to a given URL (directly connected by edges) */
export async function getRelated(url: string): Promise<{ node: GraphNode; edge: GraphEdge }[]> {
  const g = await loadGraph();
  const node = g.nodes.find(n => n.url === url);
  if (!node) return [];

  const related: { node: GraphNode; edge: GraphEdge }[] = [];
  for (const edge of g.edges) {
    if (edge.from === node.id || edge.to === node.id) {
      const otherId = edge.from === node.id ? edge.to : edge.from;
      const other = g.nodes.find(n => n.id === otherId);
      if (other) related.push({ node: other, edge });
    }
  }
  return related.sort((a, b) => b.edge.weight - a.edge.weight).slice(0, 20);
}

export async function clearGraph(): Promise<void> {
  await saveGraph({ nodes: [], edges: [], updatedAt: Date.now() });
}

export async function graphStats(): Promise<{ nodes: number; edges: number; entities: number }> {
  const g = await loadGraph();
  const allEntities = new Set(g.nodes.flatMap(n => n.entities));
  return { nodes: g.nodes.length, edges: g.edges.length, entities: allEntities.size };
}
