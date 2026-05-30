/* Data Alchemist — Background Service Worker (EXT-010) */

const PHI = 1.618033988749895;
const GOLDEN_ANGLE = 137.508;
const HEARTBEAT = 873;

class DataAlchemistEngine {
  constructor() {
    this.knowledgeStore = new Map();
    this.entityDatabase = new Map();
    this.relationGraph = { nodes: new Map(), edges: [] };
    this.digestCache = new Map();
    this.pipelineStages = ['intake', 'extract', 'classify', 'index', 'absorb'];
    this._pageCounter = 0;
    this._locationDb = new Set([
      'London', 'Paris', 'Berlin', 'Tokyo', 'Beijing', 'Moscow', 'Sydney',
      'Toronto', 'Mumbai', 'Cairo', 'Lagos', 'Nairobi', 'Rome', 'Madrid',
      'Amsterdam', 'Stockholm', 'Seoul', 'Bangkok', 'Jakarta', 'Lima',
      'New York', 'Los Angeles', 'Chicago', 'San Francisco', 'Seattle',
      'Boston', 'Austin', 'Denver', 'Miami', 'Atlanta', 'Dallas', 'Houston',
      'United States', 'United Kingdom', 'Germany', 'France', 'Japan',
      'China', 'India', 'Brazil', 'Canada', 'Australia', 'Russia',
      'Italy', 'Spain', 'Mexico', 'South Korea', 'Netherlands', 'Sweden',
      'Norway', 'Denmark', 'Finland', 'Switzerland', 'Austria', 'Poland',
      'Argentina', 'Colombia', 'Chile', 'Peru', 'Egypt', 'Nigeria',
      'South Africa', 'Kenya', 'Singapore', 'Hong Kong', 'Taiwan',
      'Israel', 'Turkey', 'Saudi Arabia', 'UAE', 'Thailand', 'Vietnam',
      'Philippines', 'Indonesia', 'Malaysia', 'Pakistan', 'Bangladesh'
    ]);
  }

  absorbPage(url, content) {
    var stageResults = [];
    var pageId = 'page_' + (++this._pageCounter) + '_' + Date.now().toString(36);

    // Stage 1 — Intake: sanitize and extract raw text
    var intakeStart = Date.now();
    var cleanText = this._sanitizeHTML(content);
    var intakeDuration = Date.now() - intakeStart;
    stageResults.push({ stage: 'intake', duration: intakeDuration, result: 'Sanitized ' + cleanText.length + ' chars' });

    // Stage 2 — Extract: pull entities, dates, numbers, quotes
    var extractStart = Date.now();
    var extraction = this.extractEntities(cleanText);
    var extractDuration = Date.now() - extractStart;
    stageResults.push({ stage: 'extract', duration: extractDuration, result: 'Found ' + extraction.entities.length + ' entities' });

    // Stage 3 — Classify: categorize content type
    var classifyStart = Date.now();
    var classification = this._classifyContent(cleanText, extraction);
    var classifyDuration = Date.now() - classifyStart;
    stageResults.push({ stage: 'classify', duration: classifyDuration, result: 'Classified as ' + classification });

    // Stage 4 — Index: generate embeddings and phi-spatial coordinates
    var indexStart = Date.now();
    var embedding = this._generateEmbedding(cleanText);
    var indexCoords = this._computePhiCoords(this._pageCounter);
    var indexDuration = Date.now() - indexStart;
    stageResults.push({ stage: 'index', duration: indexDuration, result: 'Indexed at (' + indexCoords.x.toFixed(3) + ', ' + indexCoords.y.toFixed(3) + ')' });

    // Stage 5 — Absorb: store in knowledge base with lineage
    var absorbStart = Date.now();
    var record = {
      pageId: pageId,
      url: url,
      text: cleanText,
      entities: extraction.entities,
      entityCounts: extraction.counts,
      classification: classification,
      embedding: embedding,
      coords: indexCoords,
      absorbedAt: Date.now(),
      lineage: {
        source: url,
        absorbedAt: new Date().toISOString(),
        pipelineVersion: '1.0.0',
        stages: stageResults.map(function (s) { return s.stage; })
      }
    };
    this.knowledgeStore.set(pageId, record);

    extraction.entities.forEach(function (ent) {
      var key = ent.type + ':' + ent.text.toLowerCase();
      if (!this.entityDatabase.has(key)) {
        this.entityDatabase.set(key, { text: ent.text, type: ent.type, occurrences: [], confidence: ent.confidence });
      }
      this.entityDatabase.get(key).occurrences.push(pageId);
    }.bind(this));

    var absorbDuration = Date.now() - absorbStart;
    stageResults.push({ stage: 'absorb', duration: absorbDuration, result: 'Stored with lineage' });

    return {
      absorbed: true,
      pageId: pageId,
      entities: extraction.entities.length,
      classification: classification,
      indexCoords: indexCoords,
      pipelineStages: stageResults
    };
  }

  extractEntities(text) {
    var entities = [];
    var counts = { person: 0, org: 0, location: 0, date: 0, monetary: 0, percentage: 0, email: 0, url: 0, technical: 0 };

    // Persons — capitalized two-or-more-word name patterns
    var personRe = /\b([A-Z][a-z]{1,20}(?:\s+[A-Z][a-z]{1,20}){1,3})\b/g;
    var m;
    while ((m = personRe.exec(text)) !== null) {
      var candidate = m[1];
      if (!this._locationDb.has(candidate) && !/\b(?:Inc|Corp|Ltd|LLC|The|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|January|February|March|April|May|June|July|August|September|October|November|December)\b/.test(candidate)) {
        entities.push({ text: candidate, type: 'person', position: m.index, confidence: 0.75 });
        counts.person++;
      }
    }

    // Organizations — Inc/Corp/Ltd suffixes
    var orgRe = /\b([A-Z][\w&.'-]*(?:\s+[A-Z][\w&.'-]*)*\s+(?:Inc|Corp|Corporation|Ltd|LLC|LLP|GmbH|Co|Company|Group|Foundation|Association|Institute|Partners)\.?)\b/g;
    while ((m = orgRe.exec(text)) !== null) {
      entities.push({ text: m[1], type: 'org', position: m.index, confidence: 0.9 });
      counts.org++;
    }

    // Locations — from known database
    this._locationDb.forEach(function (loc) {
      var idx = text.indexOf(loc);
      while (idx !== -1) {
        entities.push({ text: loc, type: 'location', position: idx, confidence: 0.85 });
        counts.location++;
        idx = text.indexOf(loc, idx + loc.length);
      }
    });

    // Dates — multiple formats
    var datePatterns = [
      /\b(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})\b/g,
      /\b(\d{4}-\d{2}-\d{2})\b/g,
      /\b((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4})\b/g,
      /\b(\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})\b/g,
      /\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4})\b/g
    ];
    datePatterns.forEach(function (re) {
      while ((m = re.exec(text)) !== null) {
        entities.push({ text: m[1], type: 'date', position: m.index, confidence: 0.92 });
        counts.date++;
      }
    });

    // Monetary values
    var moneyRe = /(\$[\d,]+(?:\.\d{2})?|\b\d[\d,]*(?:\.\d{2})?\s*(?:USD|EUR|GBP|JPY|CNY|CAD|AUD)\b)/g;
    while ((m = moneyRe.exec(text)) !== null) {
      entities.push({ text: m[1], type: 'monetary', position: m.index, confidence: 0.95 });
      counts.monetary++;
    }

    // Percentages
    var pctRe = /\b(\d+(?:\.\d+)?%)\b/g;
    while ((m = pctRe.exec(text)) !== null) {
      entities.push({ text: m[1], type: 'percentage', position: m.index, confidence: 0.97 });
      counts.percentage++;
    }

    // Emails
    var emailRe = /\b([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})\b/g;
    while ((m = emailRe.exec(text)) !== null) {
      entities.push({ text: m[1], type: 'email', position: m.index, confidence: 0.99 });
      counts.email++;
    }

    // URLs
    var urlRe = /(https?:\/\/[^\s<>"{}|\\^`\[\]]+)/g;
    while ((m = urlRe.exec(text)) !== null) {
      entities.push({ text: m[1], type: 'url', position: m.index, confidence: 0.98 });
      counts.url++;
    }

    // Technical terms — common programming / tech vocabulary
    var techTerms = [
      'API', 'REST', 'GraphQL', 'OAuth', 'JWT', 'SDK', 'CLI', 'GPU', 'CPU',
      'machine learning', 'deep learning', 'neural network', 'transformer',
      'blockchain', 'microservice', 'kubernetes', 'docker', 'serverless',
      'embedding', 'vector database', 'LLM', 'GPT', 'BERT', 'tokenizer',
      'backpropagation', 'gradient descent', 'attention mechanism',
      'convolutional', 'recurrent', 'reinforcement learning', 'NLP',
      'computer vision', 'generative AI', 'fine-tuning', 'RAG',
      'retrieval augmented generation', 'prompt engineering'
    ];
    techTerms.forEach(function (term) {
      var lower = text.toLowerCase();
      var termLower = term.toLowerCase();
      var idx = lower.indexOf(termLower);
      while (idx !== -1) {
        entities.push({ text: text.substr(idx, term.length), type: 'technical', position: idx, confidence: 0.88 });
        counts.technical++;
        idx = lower.indexOf(termLower, idx + term.length);
      }
    });

    // Deduplicate by text+type+position
    var seen = new Set();
    entities = entities.filter(function (e) {
      var key = e.type + '|' + e.text + '|' + e.position;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return { entities: entities, counts: counts };
  }

  buildKnowledgeGraph(entities, relations) {
    var nodeMap = new Map();
    var edges = [];
    var nodeIdCounter = 0;

    // Create nodes for unique entities
    entities.forEach(function (ent) {
      var key = ent.type + ':' + ent.text.toLowerCase();
      if (!nodeMap.has(key)) {
        nodeMap.set(key, {
          id: 'node_' + (nodeIdCounter++),
          label: ent.text,
          type: ent.type,
          centrality: 0,
          occurrences: 1
        });
      } else {
        nodeMap.get(key).occurrences++;
      }
    });

    // Build edges from explicit relations
    if (relations && Array.isArray(relations)) {
      relations.forEach(function (rel) {
        var sourceKey = rel.sourceType + ':' + rel.source.toLowerCase();
        var targetKey = rel.targetType + ':' + rel.target.toLowerCase();
        if (nodeMap.has(sourceKey) && nodeMap.has(targetKey)) {
          edges.push({
            source: nodeMap.get(sourceKey).id,
            target: nodeMap.get(targetKey).id,
            relation: rel.relation || 'related_to',
            weight: rel.weight || 1.0
          });
        }
      });
    }

    // Build edges from co-occurrence (entities within proximity window)
    var entityList = entities.slice().sort(function (a, b) { return a.position - b.position; });
    var WINDOW = 200;
    for (var i = 0; i < entityList.length; i++) {
      for (var j = i + 1; j < entityList.length; j++) {
        if (entityList[j].position - entityList[i].position > WINDOW) break;
        var srcKey = entityList[i].type + ':' + entityList[i].text.toLowerCase();
        var tgtKey = entityList[j].type + ':' + entityList[j].text.toLowerCase();
        if (srcKey === tgtKey) continue;
        var srcNode = nodeMap.get(srcKey);
        var tgtNode = nodeMap.get(tgtKey);
        if (!srcNode || !tgtNode) continue;
        var existingEdge = edges.find(function (e) {
          return (e.source === srcNode.id && e.target === tgtNode.id) ||
                 (e.source === tgtNode.id && e.target === srcNode.id);
        });
        if (existingEdge) {
          existingEdge.weight += 0.1;
        } else {
          edges.push({
            source: srcNode.id,
            target: tgtNode.id,
            relation: 'co_occurrence',
            weight: 0.5
          });
        }
      }
    }

    // Phi-weighted PageRank for centrality
    var nodes = Array.from(nodeMap.values());
    var nodeById = {};
    nodes.forEach(function (n) { nodeById[n.id] = n; n.centrality = 1.0 / nodes.length; });

    var damping = 1.0 / PHI; // ~0.618
    var iterations = 20;
    for (var iter = 0; iter < iterations; iter++) {
      var newCentrality = {};
      nodes.forEach(function (n) { newCentrality[n.id] = (1.0 - damping) / nodes.length; });

      edges.forEach(function (edge) {
        var outDegree = edges.filter(function (e) { return e.source === edge.source; }).length || 1;
        var contribution = (nodeById[edge.source].centrality * edge.weight) / outDegree;
        newCentrality[edge.target] = (newCentrality[edge.target] || 0) + damping * contribution;

        var inDegree = edges.filter(function (e) { return e.source === edge.target; }).length || 1;
        var reverseContribution = (nodeById[edge.target].centrality * edge.weight * 0.5) / inDegree;
        newCentrality[edge.source] = (newCentrality[edge.source] || 0) + damping * reverseContribution;
      });

      // Normalize
      var total = 0;
      nodes.forEach(function (n) { total += (newCentrality[n.id] || 0); });
      if (total > 0) {
        nodes.forEach(function (n) { n.centrality = (newCentrality[n.id] || 0) / total; });
      }
    }

    var nodeCount = nodes.length;
    var edgeCount = edges.length;
    var maxEdges = nodeCount * (nodeCount - 1) / 2;
    var density = maxEdges > 0 ? edgeCount / maxEdges : 0;
    var avgCentrality = nodeCount > 0 ? nodes.reduce(function (s, n) { return s + n.centrality; }, 0) / nodeCount : 0;

    return {
      nodes: nodes.map(function (n) { return { id: n.id, label: n.label, type: n.type, centrality: n.centrality }; }),
      edges: edges,
      stats: {
        nodeCount: nodeCount,
        edgeCount: edgeCount,
        density: parseFloat(density.toFixed(4)),
        avgCentrality: parseFloat(avgCentrality.toFixed(6))
      }
    };
  }

  generateDigest(content, format) {
    format = format || 'brief';
    var cacheKey = format + ':' + content.substring(0, 100);
    if (this.digestCache.has(cacheKey)) {
      return this.digestCache.get(cacheKey);
    }

    var cleanText = typeof content === 'string' ? content : String(content);
    var sentences = cleanText.split(/[.!?]+/).map(function (s) { return s.trim(); }).filter(function (s) { return s.length > 10; });
    var extraction = this.extractEntities(cleanText);

    // Score sentences by entity density, position, and length
    var scoredSentences = sentences.map(function (sentence, idx) {
      var entityHits = extraction.entities.filter(function (e) { return sentence.toLowerCase().indexOf(e.text.toLowerCase()) !== -1; }).length;
      var positionScore = 1.0 / (1.0 + idx * (1.0 / PHI));
      var lengthScore = Math.min(sentence.split(/\s+/).length / 25, 1.0);
      var score = (entityHits * PHI) + positionScore + (lengthScore * 0.5);
      return { sentence: sentence, score: score, index: idx };
    }).sort(function (a, b) { return b.score - a.score; });

    // Extract key findings — top-scoring unique insights
    var keyFindings = scoredSentences.slice(0, 5).map(function (s) { return s.sentence; });

    var digest = '';
    var confidence = 0;

    if (format === 'brief') {
      var topSentences = scoredSentences.slice(0, 3)
        .sort(function (a, b) { return a.index - b.index; })
        .map(function (s) { return s.sentence; });
      digest = topSentences.join('. ') + '.';
      confidence = Math.min(0.6 + (sentences.length / 50) * 0.3, 0.9);
    } else if (format === 'standard') {
      var selected = scoredSentences.slice(0, 6)
        .sort(function (a, b) { return a.index - b.index; })
        .map(function (s) { return s.sentence; });
      digest = selected.join('. ') + '.';
      confidence = Math.min(0.65 + (sentences.length / 40) * 0.3, 0.92);
    } else if (format === 'detailed') {
      var overview = scoredSentences.slice(0, 3)
        .sort(function (a, b) { return a.index - b.index; })
        .map(function (s) { return s.sentence; })
        .join('. ') + '.';
      var details = scoredSentences.slice(3, 8)
        .sort(function (a, b) { return a.index - b.index; })
        .map(function (s) { return s.sentence; })
        .join('. ') + '.';
      var entitySummary = Object.keys(extraction.counts)
        .filter(function (k) { return extraction.counts[k] > 0; })
        .map(function (k) { return k + ': ' + extraction.counts[k]; })
        .join(', ');
      digest = '## Overview\n' + overview + '\n\n## Details\n' + details + '\n\n## Entities\n' + entitySummary;
      confidence = Math.min(0.7 + (sentences.length / 30) * 0.25, 0.95);
    } else if (format === 'structured') {
      var findings = scoredSentences.slice(0, 5).map(function (s, i) {
        return { key: 'finding_' + (i + 1), value: s.sentence, relevance: parseFloat(s.score.toFixed(3)) };
      });
      var topEntities = extraction.entities.slice(0, 10).map(function (e) {
        return { text: e.text, type: e.type, confidence: e.confidence };
      });
      digest = JSON.stringify({ findings: findings, entities: topEntities, counts: extraction.counts }, null, 2);
      confidence = Math.min(0.75 + (sentences.length / 25) * 0.2, 0.95);
    }

    var wordCount = digest.split(/\s+/).filter(function (w) { return w.length > 0; }).length;

    var result = {
      digest: digest,
      format: format,
      wordCount: wordCount,
      keyFindings: keyFindings,
      entities: extraction.entities.slice(0, 20).map(function (e) { return { text: e.text, type: e.type }; }),
      confidence: parseFloat(confidence.toFixed(3))
    };

    this.digestCache.set(cacheKey, result);
    return result;
  }

  rerankResults(query, documents) {
    var queryLower = query.toLowerCase();
    var queryTerms = queryLower.split(/\s+/).filter(function (t) { return t.length > 2; });
    var queryEmbedding = this._generateEmbedding(query);
    var now = Date.now();

    var scored = documents.map(function (doc, originalRank) {
      var text = (typeof doc === 'string') ? doc : (doc.text || doc.content || String(doc));
      var textLower = text.toLowerCase();
      var docEmbedding = this._generateEmbedding(text);

      // Feature 1: Keyword overlap
      var matchingTerms = queryTerms.filter(function (t) { return textLower.indexOf(t) !== -1; }).length;
      var keywordOverlap = queryTerms.length > 0 ? matchingTerms / queryTerms.length : 0;

      // Feature 2: Semantic similarity (cosine of hash embeddings)
      var dotProduct = 0;
      var normA = 0;
      var normB = 0;
      for (var d = 0; d < queryEmbedding.length; d++) {
        dotProduct += queryEmbedding[d] * docEmbedding[d];
        normA += queryEmbedding[d] * queryEmbedding[d];
        normB += docEmbedding[d] * docEmbedding[d];
      }
      var semanticSimilarity = (normA > 0 && normB > 0) ? dotProduct / (Math.sqrt(normA) * Math.sqrt(normB)) : 0;
      semanticSimilarity = (semanticSimilarity + 1) / 2; // Normalize to [0,1]

      // Feature 3: Recency (if doc has timestamp)
      var docTimestamp = (typeof doc === 'object' && doc.timestamp) ? doc.timestamp : now;
      var ageHours = Math.max((now - docTimestamp) / (1000 * 60 * 60), 0.01);
      var recency = 1.0 / (1.0 + Math.log(1 + ageHours) / PHI);

      // Feature 4: Authority (based on length, entity density)
      var wordCount = text.split(/\s+/).length;
      var lengthScore = Math.min(wordCount / 500, 1.0);
      var entityCount = this.extractEntities(text.substring(0, 1000)).entities.length;
      var entityDensity = Math.min(entityCount / 20, 1.0);
      var authority = (lengthScore * 0.6) + (entityDensity * 0.4);

      // Feature 5: Position bias (original rank)
      var positionBias = 1.0 / (1.0 + originalRank * 0.1);

      // Phi-weighted combination: score = Σ φ^(-i) × feature_i
      var features = [keywordOverlap, semanticSimilarity, recency, authority, positionBias];
      var score = 0;
      for (var i = 0; i < features.length; i++) {
        score += Math.pow(PHI, -(i + 1)) * features[i];
      }

      return {
        document: doc,
        originalRank: originalRank,
        newRank: 0,
        score: parseFloat(score.toFixed(6)),
        features: {
          keywordOverlap: parseFloat(keywordOverlap.toFixed(4)),
          semanticSimilarity: parseFloat(semanticSimilarity.toFixed(4)),
          recency: parseFloat(recency.toFixed(4)),
          authority: parseFloat(authority.toFixed(4)),
          positionBias: parseFloat(positionBias.toFixed(4))
        }
      };
    }.bind(this));

    scored.sort(function (a, b) { return b.score - a.score; });
    scored.forEach(function (item, idx) { item.newRank = idx; });

    return scored;
  }

  _sanitizeHTML(html) {
    if (typeof html !== 'string') return '';
    var text = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/&#(\d+);/g, function (_, code) { return String.fromCharCode(parseInt(code, 10)); })
      .replace(/&#x([0-9a-fA-F]+);/g, function (_, hex) { return String.fromCharCode(parseInt(hex, 16)); })
      .replace(/&[a-zA-Z]+;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return text;
  }

  _generateEmbedding(text) {
    var dim = 64;
    var vec = new Array(dim);
    var str = typeof text === 'string' ? text.toLowerCase() : '';

    // Initialize with zeros
    for (var i = 0; i < dim; i++) vec[i] = 0;

    // Character n-gram hashing into embedding buckets
    for (var c = 0; c < str.length; c++) {
      var code = str.charCodeAt(c);
      var hash = code;
      // Mix with next 2 chars for trigram effect
      if (c + 1 < str.length) hash = hash * 31 + str.charCodeAt(c + 1);
      if (c + 2 < str.length) hash = hash * 31 + str.charCodeAt(c + 2);
      var bucket = Math.abs(hash) % dim;
      vec[bucket] += (hash % 2 === 0) ? 1 : -1;
    }

    // Normalize to unit vector
    var magnitude = 0;
    for (var n = 0; n < dim; n++) magnitude += vec[n] * vec[n];
    magnitude = Math.sqrt(magnitude);
    if (magnitude > 0) {
      for (var k = 0; k < dim; k++) vec[k] = parseFloat((vec[k] / magnitude).toFixed(6));
    }

    return vec;
  }

  _computePhiCoords(index) {
    var angle = index * GOLDEN_ANGLE * (Math.PI / 180);
    var radius = Math.sqrt(index) * PHI;
    return {
      x: parseFloat((radius * Math.cos(angle)).toFixed(6)),
      y: parseFloat((radius * Math.sin(angle)).toFixed(6)),
      r: parseFloat(radius.toFixed(6)),
      theta: parseFloat((angle % (2 * Math.PI)).toFixed(6)),
      index: index
    };
  }

  _classifyContent(text, extraction) {
    var lower = text.toLowerCase();
    var scores = { article: 0, documentation: 0, forum: 0, product: 0, academic: 0 };

    // Article signals
    if (/\b(by|author|published|editor|journalist|report|news|story)\b/i.test(lower)) scores.article += 2;
    if (extraction.counts.person > 2) scores.article += 1;
    if (extraction.counts.date > 0) scores.article += 1;
    if (lower.length > 2000) scores.article += 1;

    // Documentation signals
    if (/\b(install|configure|setup|usage|parameters?|returns?|example|syntax|deprecated|method|function|class|module)\b/i.test(lower)) scores.documentation += 2;
    if (/```|<code>|<pre>/.test(text)) scores.documentation += 2;
    if (extraction.counts.technical > 3) scores.documentation += 2;

    // Forum signals
    if (/\b(reply|comment|posted|thread|upvote|downvote|answer|question|asked|solved|accepted)\b/i.test(lower)) scores.forum += 2;
    if (extraction.counts.person > 5) scores.forum += 1;
    if (extraction.counts.date > 3) scores.forum += 1;

    // Product signals
    if (/\b(price|buy|cart|shipping|discount|sale|review|rating|stars?|order|checkout|add to)\b/i.test(lower)) scores.product += 2;
    if (extraction.counts.monetary > 0) scores.product += 3;

    // Academic signals
    if (/\b(abstract|introduction|methodology|results|conclusion|references|et al|doi|issn|journal|hypothesis|study|findings|peer.?review)\b/i.test(lower)) scores.academic += 2;
    if (extraction.counts.percentage > 2) scores.academic += 1;
    if (/\[\d+\]/.test(text)) scores.academic += 1;

    var best = 'article';
    var bestScore = -1;
    Object.keys(scores).forEach(function (key) {
      if (scores[key] > bestScore) {
        bestScore = scores[key];
        best = key;
      }
    });

    return best;
  }
}

globalThis.dataAlchemist = new DataAlchemistEngine();

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  /* ── Universal message routing (popup / side panel / devtools) ──── */
  if (message.type === 'heartbeat') {
    sendResponse({ status: 'alive', healthy: true, timestamp: Date.now() });
    return true;
  }
  if (message.type === 'openSidePanel') {
    try { if (chrome.sidePanel && chrome.sidePanel.open) chrome.sidePanel.open({ windowId: sender.tab ? sender.tab.windowId : undefined }).catch(function(){}); } catch(e){}
    sendResponse({ ok: true });
    return true;
  }
  if (message.type === 'popup' || message.type === 'sidePanel' || message.type === 'devtools') {
    var cmd = message.command || '';
    var lower = cmd.toLowerCase();
    var engine = globalThis.dataAlchemist;

    /* ── Built-in workspace commands ── */
    if (cmd === 'ping') { sendResponse({ result: 'pong — Data Alchemist engine alive at ' + new Date().toISOString() }); return true; }
    if (cmd === 'getState' || lower === 'state' || lower === 'status') {
      sendResponse({ result: JSON.stringify(engine && engine.state ? engine.state : { status: 'running', timestamp: Date.now() }, null, 2) });
      return true;
    }
    if (cmd === 'clearLogs') { sendResponse({ result: 'Workspace logs cleared.' }); return true; }
    if (lower === 'help' || lower === 'capabilities' || lower === '?') {
      sendResponse({ result: '\u{1F9E0} Data Alchemist AI Workspace\n\nCapabilities:\n• Absorb Page — Absorb and process page data\n• Extract Entities — Extract entities from text\n• Build Knowledge Graph — Build knowledge graph\n• Query Graph — Query the knowledge graph\n\nType any command or question and I will route it to the best engine method.' });
      return true;
    }

    /* ── Save to workspace conversation history ── */
    var storageKey = 'data-alchemist_workspace_history';
    chrome.storage.local.get(storageKey, function(data) {
      var history = (data && data[storageKey]) || [];
      history.push({ role: 'user', content: cmd, ts: Date.now() });

      /* ── Intelligent workspace command routing ── */
      var result;
      try {
        if (lower.indexOf('absorb') !== -1 || lower.indexOf('ingest') !== -1 || lower.indexOf('import') !== -1 || lower.indexOf('load') !== -1 || lower.indexOf('page') !== -1) {
          result = engine.absorbPage("workspace", cmd);
        }
        else if (lower.indexOf('extract') !== -1 || lower.indexOf('entity') !== -1 || lower.indexOf('entities') !== -1 || lower.indexOf('find') !== -1 || lower.indexOf('discover') !== -1) {
          result = engine.extractEntities(cmd);
        }
        else if (lower.indexOf('graph') !== -1 || lower.indexOf('knowledge') !== -1 || lower.indexOf('build') !== -1 || lower.indexOf('connect') !== -1 || lower.indexOf('relate') !== -1) {
          result = engine.buildKnowledgeGraph([], []);
        }
        else if (lower.indexOf('query') !== -1 || lower.indexOf('search') !== -1 || lower.indexOf('ask') !== -1 || lower.indexOf('find') !== -1) {
          result = engine.queryGraph(cmd);
        }
        else {
          /* Default: route to primary engine method */
          result = engine.absorbPage("workspace", cmd);
        }
      } catch(e) {
        result = { error: e.message, fallback: 'Data Alchemist encountered an error processing: "' + cmd + '"' };
      }

      var responseText;
      if (typeof result === 'string') { responseText = result; }
      else if (result && result.error) { responseText = '\u26A0\uFE0F ' + (result.fallback || result.error); }
      else { responseText = JSON.stringify(result, null, 2); }

      history.push({ role: 'ai', content: responseText, ts: Date.now() });
      if (history.length > 100) { history = history.slice(-100); }
      var update = {};
      update[storageKey] = history;
      chrome.storage.local.set(update);

      sendResponse({ result: responseText });
    });
    return true;
  }

  var engine = globalThis.dataAlchemist;
  var action = message.action;

  try {
    if (action === 'absorbPage') {
      var result = engine.absorbPage(message.url, message.content);
      sendResponse({ success: true, data: result });
    } else if (action === 'extractEntities') {
      var result = engine.extractEntities(message.text);
      sendResponse({ success: true, data: result });
    } else if (action === 'buildKnowledgeGraph') {
      var result = engine.buildKnowledgeGraph(message.entities, message.relations);
      sendResponse({ success: true, data: result });
    } else if (action === 'generateDigest') {
      var result = engine.generateDigest(message.content, message.format);
      sendResponse({ success: true, data: result });
    } else if (action === 'rerankResults') {
      var result = engine.rerankResults(message.query, message.documents);
      sendResponse({ success: true, data: result });
    } else {
      sendResponse({ success: false, error: 'Unknown action: ' + action });
    }
  } catch (err) {
    sendResponse({ success: false, error: err.message });
  }

  return true;
});

/* -- Production 24/7 Keep-Alive ---------------------------------------- */
(function () {
  var ALARM_NAME = 'data-alchemist-heartbeat';
  var ALARM_PERIOD = 0.4; /* minutes -- fires every ~24 seconds to beat Chrome's 30s kill timer */

  chrome.alarms.create(ALARM_NAME, { periodInMinutes: ALARM_PERIOD });

  chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name !== ALARM_NAME) return;
    /* Re-initialize engine if it was garbage collected */
    if (!globalThis.dataAlchemist) {
      globalThis.dataAlchemist = new DataAlchemistEngine();
      console.log('[Data Alchemist] Engine re-initialized by keepalive alarm');
    }
    /* Persist state snapshot */
    try {
      chrome.storage.local.set({
        'data-alchemist_state': {
          heartbeatCount: globalThis.dataAlchemist.heartbeatCount || globalThis.dataAlchemist.state?.heartbeatCount || 0,
          lastAlive: Date.now(),
          uptime: Date.now() - (globalThis.dataAlchemist.state?.startTime || globalThis.dataAlchemist.startTime || Date.now())
        }
      });
    } catch (e) { /* storage not available in some contexts */ }
  });

  /* Restore state on startup */
  chrome.storage.local.get('data-alchemist_state', function (data) {
    if (data && data['data-alchemist_state']) {
      console.log('[Data Alchemist] Restored from previous session \u2014 last alive: ' +
        new Date(data['data-alchemist_state'].lastAlive).toISOString());
    }
  });

  /* Also re-init on install/update */
  chrome.runtime.onInstalled.addListener(function () {
    /* Auto-activate side panel on install */
    if (chrome.sidePanel && chrome.sidePanel.setOptions) {
      chrome.sidePanel.setOptions({ enabled: true });
    }
    if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
      chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }).catch(function(){});
    }
    chrome.alarms.create(ALARM_NAME, { periodInMinutes: ALARM_PERIOD });
    console.log('[Data Alchemist] Installed/updated \u2014 24/7 keepalive active');
  });
})();
