/**
 * PROTO-004: Adaptive Knowledge Absorption Protocol (AKAP)
 * Knowledge Synthesis Intelligence that evolves extraction patterns.
 */

const PHI = 1.618033988749895;
const GOLDEN_ANGLE = 2.399963229728653;
const HEARTBEAT = 873;

class AdaptiveKnowledgeAbsorptionProtocol {
  /**
   * @param {Object} config - Configuration
   */
  constructor(config = {}) {
    this.pipeline = ['intake', 'extract', 'classify', 'index', 'absorb'];
    this.patternLibrary = new Map();
    this.knowledgeStore = [];
    this.knowledgeGraph = { nodes: new Map(), edges: [] };
    this.learningRate = 1 / PHI;
    this.metrics = {
      documentsAbsorbed: 0,
      entitiesExtracted: 0,
      graphNodes: 0,
      graphEdges: 0,
      patternsLearned: 0
    };

    // Initialize default patterns
    this._initDefaultPatterns();
  }

  _initDefaultPatterns() {
    const defaults = {
      person: { regex: /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, weight: 1.0 },
      organization: { regex: /\b(?:Inc|Corp|LLC|Ltd|Company|Association|Institute|University|Foundation)\b/gi, weight: 0.9 },
      location: { regex: /\b(?:New York|London|Paris|Tokyo|Berlin|Beijing|Moscow|Sydney|Mumbai|Cairo|San Francisco|Los Angeles|Chicago)\b/gi, weight: 0.85 },
      date: { regex: /\b\d{4}[-/]\d{1,2}[-/]\d{1,2}\b/g, weight: 0.8 },
      concept: { regex: /\b(?:intelligence|protocol|algorithm|network|system|model|framework|architecture|engine|pipeline)\b/gi, weight: 0.75 },
      email: { regex: /\b[\w.-]+@[\w.-]+\.\w+\b/g, weight: 0.7 },
      url: { regex: /https?:\/\/[^\s]+/g, weight: 0.65 },
      number: { regex: /\b\d+(?:\.\d+)?%?\b/g, weight: 0.5 }
    };
    for (const [type, pattern] of Object.entries(defaults)) {
      this.patternLibrary.set(type, { ...pattern, successCount: 0, totalAttempts: 0 });
    }
  }

  /**
   * Run 5-stage absorption pipeline: intake→extract→classify→index→absorb.
   * @param {string} content - Content to absorb
   * @param {string} contentType - Content type
   * @returns {Object} - {entities, keywords, summary, graphNodes, graphEdges}
   */
  absorb(content, contentType = 'text') {
    // Stage 1: Intake
    const normalized = content.trim().replace(/\s+/g, ' ');

    // Stage 2: Extract
    const entities = this.extractEntities(normalized);

    // Stage 3: Classify
    const classification = this.classifyContent(normalized);

    // Stage 4: Index - extract keywords
    const words = normalized.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    const freq = {};
    for (const w of words) {
      freq[w] = (freq[w] || 0) + 1;
    }
    const keywords = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({ word, frequency: count }));

    // Stage 5: Absorb - build relations and store
    const relations = [];
    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        if (entities[i].type !== entities[j].type) {
          relations.push({
            source: entities[i].text,
            target: entities[j].text,
            relation: 'co-occurs',
            weight: Math.pow(PHI, -(Math.abs(i - j)))
          });
        }
      }
    }

    const graphResult = this.buildKnowledgeGraph(entities, relations);

    // Generate brief summary
    const sentences = normalized.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const summary = sentences.slice(0, 3).join('. ').trim() + (sentences.length > 3 ? '...' : '.');

    const record = {
      id: `doc-${this.metrics.documentsAbsorbed + 1}`,
      content: normalized,
      contentType,
      entities,
      keywords,
      classification,
      summary,
      absorbedAt: Date.now()
    };
    this.knowledgeStore.push(record);
    this.metrics.documentsAbsorbed++;

    // Learn from this extraction
    this.learnPattern(contentType, { entities, keywords });

    return {
      entities,
      keywords,
      summary,
      graphNodes: graphResult.nodes.length,
      graphEdges: graphResult.edges.length,
      classification
    };
  }

  /**
   * NER simulation extracting entities with confidence scores.
   * @param {string} text
   * @returns {Object[]} - Array of {text, type, confidence, position}
   */
  extractEntities(text) {
    const entities = [];
    const seen = new Set();

    for (const [type, pattern] of this.patternLibrary) {
      const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
      let match;
      while ((match = regex.exec(text)) !== null) {
        const key = `${type}:${match[0]}`;
        if (!seen.has(key)) {
          seen.add(key);
          const confidence = pattern.weight * (pattern.successCount + 1) / (pattern.totalAttempts + 2);
          entities.push({
            text: match[0],
            type,
            confidence: Math.min(confidence, 1.0),
            position: match.index
          });
          this.metrics.entitiesExtracted++;
        }
      }
    }

    entities.sort((a, b) => b.confidence - a.confidence);
    return entities;
  }

  /**
   * Classify content by topic with phi-weighted confidence distribution.
   * @param {string} text
   * @returns {Object} - {topCategory, categories} with confidence scores
   */
  classifyContent(text) {
    const lower = text.toLowerCase();
    const categories = {
      technology: ['algorithm', 'software', 'computer', 'ai', 'data', 'network', 'system', 'code', 'digital', 'protocol'],
      science: ['research', 'experiment', 'hypothesis', 'theory', 'study', 'analysis', 'scientific', 'evidence', 'discovery'],
      business: ['company', 'market', 'revenue', 'profit', 'investment', 'strategy', 'growth', 'enterprise', 'stakeholder'],
      health: ['medical', 'health', 'disease', 'treatment', 'patient', 'clinical', 'diagnosis', 'therapy', 'symptom'],
      education: ['learning', 'student', 'teacher', 'course', 'curriculum', 'education', 'training', 'knowledge', 'academic'],
      legal: ['law', 'legal', 'court', 'regulation', 'compliance', 'contract', 'rights', 'statute', 'liability'],
      creative: ['art', 'design', 'creative', 'music', 'writing', 'visual', 'aesthetic', 'composition', 'style']
    };

    const scores = {};
    let totalScore = 0;
    let idx = 0;
    for (const [category, keywords] of Object.entries(categories)) {
      let count = 0;
      for (const kw of keywords) {
        const regex = new RegExp(`\\b${kw}\\b`, 'gi');
        const matches = lower.match(regex);
        if (matches) count += matches.length;
      }
      const phiWeight = Math.pow(PHI, -idx * 0.1);
      scores[category] = count * phiWeight;
      totalScore += scores[category];
      idx++;
    }

    // Normalize
    if (totalScore > 0) {
      for (const cat of Object.keys(scores)) {
        scores[cat] /= totalScore;
      }
    }

    const topCategory = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    return {
      topCategory: topCategory ? topCategory[0] : 'general',
      confidence: topCategory ? topCategory[1] : 0,
      categories: scores
    };
  }

  /**
   * Build typed knowledge graph with nodes and directed edges.
   * @param {Object[]} entities
   * @param {Object[]} relations
   * @returns {Object} - {nodes, edges}
   */
  buildKnowledgeGraph(entities, relations) {
    const addedNodes = [];
    for (const entity of entities) {
      const nodeId = `${entity.type}:${entity.text}`;
      if (!this.knowledgeGraph.nodes.has(nodeId)) {
        this.knowledgeGraph.nodes.set(nodeId, {
          id: nodeId,
          label: entity.text,
          type: entity.type,
          confidence: entity.confidence,
          connections: 0
        });
        this.metrics.graphNodes++;
      }
      addedNodes.push(nodeId);
    }

    const addedEdges = [];
    for (const rel of relations) {
      const sourceId = entities.find(e => e.text === rel.source);
      const targetId = entities.find(e => e.text === rel.target);
      if (sourceId && targetId) {
        const edge = {
          source: `${sourceId.type}:${sourceId.text}`,
          target: `${targetId.type}:${targetId.text}`,
          relation: rel.relation,
          weight: rel.weight
        };
        this.knowledgeGraph.edges.push(edge);
        this.metrics.graphEdges++;
        addedEdges.push(edge);

        // Update connection counts
        const sNode = this.knowledgeGraph.nodes.get(edge.source);
        const tNode = this.knowledgeGraph.nodes.get(edge.target);
        if (sNode) sNode.connections++;
        if (tNode) tNode.connections++;
      }
    }

    return {
      nodes: addedNodes.map(id => this.knowledgeGraph.nodes.get(id)).filter(Boolean),
      edges: addedEdges
    };
  }

  /**
   * Search knowledge graph by entity, type, or relation.
   * @param {Object} graphQuery - {entity?, type?, relation?}
   * @returns {Object} - {nodes, edges}
   */
  query(graphQuery) {
    let matchingNodes = [];
    let matchingEdges = [];

    if (graphQuery.entity) {
      const lower = graphQuery.entity.toLowerCase();
      for (const node of this.knowledgeGraph.nodes.values()) {
        if (node.label.toLowerCase().includes(lower)) {
          matchingNodes.push(node);
        }
      }
    }

    if (graphQuery.type) {
      for (const node of this.knowledgeGraph.nodes.values()) {
        if (node.type === graphQuery.type) {
          matchingNodes.push(node);
        }
      }
    }

    // Deduplicate nodes
    const nodeSet = new Set(matchingNodes.map(n => n.id));
    matchingNodes = [...nodeSet].map(id => this.knowledgeGraph.nodes.get(id)).filter(Boolean);

    if (graphQuery.relation) {
      matchingEdges = this.knowledgeGraph.edges.filter(e => e.relation === graphQuery.relation);
    } else {
      // Get edges connected to matching nodes
      matchingEdges = this.knowledgeGraph.edges.filter(
        e => nodeSet.has(e.source) || nodeSet.has(e.target)
      );
    }

    return { nodes: matchingNodes, edges: matchingEdges };
  }

  /**
   * Generate summary from accumulated knowledge.
   * @param {string} topic - Topic to summarize
   * @param {string} format - 'brief'|'detailed'|'executive'
   * @returns {Object} - {format, content, sources}
   */
  generateDigest(topic, format = 'brief') {
    const lower = topic.toLowerCase();
    const relevant = this.knowledgeStore.filter(doc =>
      doc.content.toLowerCase().includes(lower) ||
      doc.keywords.some(k => k.word.includes(lower))
    );

    if (relevant.length === 0) {
      return { format, content: `No knowledge available on topic: ${topic}`, sources: 0 };
    }

    const allEntities = relevant.flatMap(d => d.entities);
    const allKeywords = relevant.flatMap(d => d.keywords);

    // Deduplicate keywords by word
    const kwMap = {};
    for (const kw of allKeywords) {
      kwMap[kw.word] = (kwMap[kw.word] || 0) + kw.frequency;
    }
    const topKw = Object.entries(kwMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

    let content;
    if (format === 'brief') {
      const summaries = relevant.map(d => d.summary).join(' ');
      content = summaries.slice(0, 500);
    } else if (format === 'detailed') {
      content = relevant.map(d => `[${d.id}] ${d.summary}\nEntities: ${d.entities.map(e => e.text).join(', ')}\nKeywords: ${d.keywords.map(k => k.word).join(', ')}`).join('\n\n');
    } else {
      // executive - bullet points
      content = '• Topic: ' + topic + '\n' +
        '• Sources: ' + relevant.length + ' documents\n' +
        '• Key entities: ' + allEntities.slice(0, 5).map(e => e.text).join(', ') + '\n' +
        '• Top keywords: ' + topKw.map(([w]) => w).join(', ') + '\n' +
        '• Summary: ' + relevant[0].summary;
    }

    return { format, content, sources: relevant.length };
  }

  /**
   * Update pattern library from successful extractions.
   * @param {string} contentType
   * @param {Object} extractionResult
   */
  learnPattern(contentType, extractionResult) {
    const { entities } = extractionResult;
    for (const entity of entities) {
      const pattern = this.patternLibrary.get(entity.type);
      if (pattern) {
        pattern.totalAttempts++;
        if (entity.confidence > 0.5) {
          pattern.successCount++;
        }
        // Adapt weight with learning rate 1/φ
        pattern.weight = this.learningRate * entity.confidence + (1 - this.learningRate) * pattern.weight;
      }
    }
    this.metrics.patternsLearned++;
  }

  /**
   * Returns absorption metrics.
   * @returns {Object}
   */
  getAbsorptionMetrics() {
    return { ...this.metrics };
  }
}

export { AdaptiveKnowledgeAbsorptionProtocol };
export default AdaptiveKnowledgeAbsorptionProtocol;
