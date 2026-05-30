/**
 * Local Inference Worker — In-Browser Pattern Matching & Classification
 *
 * Permanent Web Worker that provides:
 * - Text classification (category prediction)
 * - Pattern matching (regex + semantic patterns)
 * - Similarity scoring (cosine similarity on simple embeddings)
 * - Keyword extraction (TF-IDF-like scoring)
 * - Sentiment analysis (lexicon-based)
 * - Entity recognition (pattern-based NER)
 * - Text summarization (extractive, sentence-scoring)
 * - Question answering (context-based extraction)
 * - Intent classification (multi-intent detection)
 * - Chain-of-thought reasoning (step-by-step decomposition)
 * - Topic modeling (LDA-like clustering)
 *
 * This worker runs ML-like inference entirely in the browser.
 * No external APIs. No network calls. Pure local intelligence.
 *
 * Protocol: postMessage
 *   Main → Worker: { type: 'classify', text: '...', categories: [...] }
 *   Main → Worker: { type: 'match', text: '...', patterns: [...] }
 *   Main → Worker: { type: 'similarity', textA: '...', textB: '...' }
 *   Main → Worker: { type: 'keywords', text: '...', topK: N }
 *   Main → Worker: { type: 'sentiment', text: '...' }
 *   Main → Worker: { type: 'entities', text: '...' }
 *   Main → Worker: { type: 'embed', text: '...' }
 *   Main → Worker: { type: 'summarize', text: '...', sentences: N }
 *   Main → Worker: { type: 'answer', question: '...', context: '...' }
 *   Main → Worker: { type: 'intent', text: '...' }
 *   Main → Worker: { type: 'chain-of-thought', question: '...' }
 *   Main → Worker: { type: 'topics', text: '...', k: N }
 *   Main → Worker: { type: 'stats' }
 *   Worker → Main: { type: 'classification', ... }
 *   Worker → Main: { type: 'match-result', ... }
 *   Worker → Main: { type: 'similarity-result', ... }
 *   Worker → Main: { type: 'summary', ... }
 *   Worker → Main: { type: 'answer-result', ... }
 *   Worker → Main: { type: 'intent-result', ... }
 *   Worker → Main: { type: 'chain-result', ... }
 *   Worker → Main: { type: 'topics-result', ... }
 *   Worker → Main: { type: 'heartbeat', ... }
 */

'use strict';
importScripts('neuro-core.js');

var PHI = 1.618033988749895;
var HEARTBEAT_MS = 873;
var beatCount = 0;
var running = true;

/* ════════════════════════════════════════════════════════════════
   Metrics
   ════════════════════════════════════════════════════════════════ */

var inferenceMetrics = {
  totalClassifications: 0,
  totalMatches: 0,
  totalSimilarities: 0,
  totalKeywords: 0,
  totalSentiments: 0,
  totalEntities: 0,
  totalEmbeddings: 0,
  totalSummaries: 0,
  totalAnswers: 0,
  totalIntents: 0,
  totalChainOfThought: 0,
  totalTopicModels: 0,
  totalTokensProcessed: 0
};

/* ════════════════════════════════════════════════════════════════
   Text Tokenization — simple word-level
   ════════════════════════════════════════════════════════════════ */

function tokenize(text) {
  return (text || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(function (w) { return w.length > 0; });
}

function tokenFrequency(tokens) {
  var freq = Object.create(null);
  for (var i = 0; i < tokens.length; i++) {
    var t = tokens[i];
    freq[t] = (freq[t] || 0) + 1;
  }
  return freq;
}

/* ════════════════════════════════════════════════════════════════
   Simple Embedding — hash-based vector (64-dim)
   ════════════════════════════════════════════════════════════════ */

function simpleEmbed(text, dim) {
  dim = dim || 64;
  var tokens = tokenize(text);
  var vec = new Float32Array(dim);

  for (var i = 0; i < tokens.length; i++) {
    var hash = 0;
    for (var j = 0; j < tokens[i].length; j++) {
      hash = ((hash << 5) - hash) + tokens[i].charCodeAt(j);
      hash = hash & hash;
    }
    for (var d = 0; d < dim; d++) {
      vec[d] += Math.sin(hash * PHI * (d + 1)) / tokens.length;
    }
  }

  // Normalize
  var mag = 0;
  for (var k = 0; k < dim; k++) mag += vec[k] * vec[k];
  mag = Math.sqrt(mag);
  if (mag > 0) for (var m = 0; m < dim; m++) vec[m] /= mag;

  return vec;
}

function cosineSimilarity(a, b) {
  var dot = 0, magA = 0, magB = 0;
  var len = Math.min(a.length, b.length);
  for (var i = 0; i < len; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  magA = Math.sqrt(magA);
  magB = Math.sqrt(magB);
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

/* ════════════════════════════════════════════════════════════════
   Classification — cosine similarity to category labels
   ════════════════════════════════════════════════════════════════ */

function classify(text, categories) {
  var textVec = simpleEmbed(text);
  var results = [];

  for (var i = 0; i < categories.length; i++) {
    var catVec = simpleEmbed(categories[i]);
    var score = cosineSimilarity(textVec, catVec);
    results.push({ category: categories[i], score: Math.round(score * 10000) / 10000 });
  }

  results.sort(function (a, b) { return b.score - a.score; });
  inferenceMetrics.totalClassifications++;
  inferenceMetrics.totalTokensProcessed += tokenize(text).length;

  return { text: text.substring(0, 100), predictions: results, topCategory: results[0] ? results[0].category : null };
}

/* ════════════════════════════════════════════════════════════════
   Pattern Matching
   ════════════════════════════════════════════════════════════════ */

function matchPatterns(text, patterns) {
  var matches = [];
  for (var i = 0; i < patterns.length; i++) {
    try {
      var re = new RegExp(patterns[i], 'gi');
      var found = text.match(re);
      if (found) {
        matches.push({ pattern: patterns[i], matches: found, count: found.length });
      }
    } catch (err) {
      // Invalid regex — skip
    }
  }
  inferenceMetrics.totalMatches++;
  return matches;
}

/* ════════════════════════════════════════════════════════════════
   Keyword Extraction — TF-based
   ════════════════════════════════════════════════════════════════ */

var STOP_WORDS = Object.create(null);
['the','a','an','is','are','was','were','be','been','being','have','has','had','do','does','did','will','would','could','should','may','might','can','shall','and','but','or','nor','not','no','so','if','then','than','that','this','these','those','it','its','i','me','my','we','our','you','your','he','him','his','she','her','they','them','their','of','in','on','at','to','for','with','by','from','as','into','about','up','out','over'].forEach(function(w){STOP_WORDS[w]=true;});

function extractKeywords(text, topK) {
  topK = topK || 10;
  var tokens = tokenize(text).filter(function (t) { return t.length > 2 && !STOP_WORDS[t]; });
  var freq = tokenFrequency(tokens);

  var keywords = Object.keys(freq).sort(function (a, b) { return freq[b] - freq[a]; }).slice(0, topK);
  inferenceMetrics.totalKeywords++;
  return keywords.map(function (k) { return { word: k, count: freq[k], score: Math.round(freq[k] / tokens.length * 10000) / 10000 }; });
}

/* ════════════════════════════════════════════════════════════════
   Sentiment Analysis — simple lexicon
   ════════════════════════════════════════════════════════════════ */

var POSITIVE_WORDS = Object.create(null);
var NEGATIVE_WORDS = Object.create(null);
['good','great','excellent','amazing','wonderful','fantastic','love','happy','best','awesome','beautiful','brilliant','perfect','outstanding','superb'].forEach(function(w){POSITIVE_WORDS[w]=true;});
['bad','terrible','horrible','awful','worst','hate','ugly','poor','disgusting','dreadful','nasty','pathetic','miserable','disappointing','failure'].forEach(function(w){NEGATIVE_WORDS[w]=true;});

function analyzeSentiment(text) {
  var tokens = tokenize(text);
  var pos = 0, neg = 0;
  for (var i = 0; i < tokens.length; i++) {
    if (POSITIVE_WORDS[tokens[i]]) pos++;
    if (NEGATIVE_WORDS[tokens[i]]) neg++;
  }
  var total = pos + neg;
  var score = total === 0 ? 0 : (pos - neg) / total;
  var label = score > 0.1 ? 'positive' : (score < -0.1 ? 'negative' : 'neutral');
  inferenceMetrics.totalSentiments++;
  return { score: Math.round(score * 10000) / 10000, label: label, positive: pos, negative: neg, total: tokens.length };
}

/* ════════════════════════════════════════════════════════════════
   Entity Recognition — pattern-based
   ════════════════════════════════════════════════════════════════ */

function extractEntities(text) {
  var entities = [];

  // Email addresses
  var emails = text.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi);
  if (emails) emails.forEach(function (e) { entities.push({ type: 'EMAIL', value: e }); });

  // URLs
  var urls = text.match(/https?:\/\/[^\s]+/gi);
  if (urls) urls.forEach(function (u) { entities.push({ type: 'URL', value: u }); });

  // Numbers (with optional decimals)
  var numbers = text.match(/\b\d+\.?\d*\b/g);
  if (numbers) numbers.forEach(function (n) { entities.push({ type: 'NUMBER', value: n }); });

  // Dates (basic patterns)
  var dates = text.match(/\b\d{4}[-/]\d{2}[-/]\d{2}\b/g);
  if (dates) dates.forEach(function (d) { entities.push({ type: 'DATE', value: d }); });

  // Capitalized words (potential proper nouns, exclude sentence starts)
  var caps = text.match(/(?<=[.!?\s])\s*[A-Z][a-z]{2,}/g);
  if (caps) caps.forEach(function (c) { entities.push({ type: 'PROPER_NOUN', value: c.trim() }); });

  inferenceMetrics.totalEntities++;
  return entities;
}

/* ════════════════════════════════════════════════════════════════
   Text Summarization — extractive (sentence-scoring)
   ════════════════════════════════════════════════════════════════ */

function splitSentences(text) {
  return (text || '').split(/(?<=[.!?])\s+/).filter(function (s) { return s.length > 5; });
}

function summarize(text, numSentences) {
  numSentences = numSentences || 3;
  var sentences = splitSentences(text);
  if (sentences.length <= numSentences) {
    inferenceMetrics.totalSummaries++;
    return { summary: text, sentences: sentences, scores: [], compressionRatio: 1 };
  }

  // Score each sentence based on keyword density, position, and length
  var allTokens = tokenize(text);
  var docFreq = tokenFrequency(allTokens);
  var scored = [];

  for (var i = 0; i < sentences.length; i++) {
    var sTokens = tokenize(sentences[i]).filter(function (t) { return t.length > 2 && !STOP_WORDS[t]; });
    var score = 0;

    // TF-based importance
    for (var j = 0; j < sTokens.length; j++) {
      if (docFreq[sTokens[j]]) score += docFreq[sTokens[j]];
    }

    // Position bonus (first and last sentences are often important)
    if (i === 0) score *= 1.5;
    else if (i === sentences.length - 1) score *= 1.2;

    // Length normalization — prefer medium-length sentences
    var wordCount = sTokens.length;
    if (wordCount > 5 && wordCount < 30) score *= 1.3;

    scored.push({ index: i, sentence: sentences[i], score: Math.round(score * 100) / 100 });
  }

  // Select top-N sentences by score, then reorder by position
  scored.sort(function (a, b) { return b.score - a.score; });
  var selected = scored.slice(0, numSentences);
  selected.sort(function (a, b) { return a.index - b.index; });

  var summary = selected.map(function (s) { return s.sentence; }).join(' ');

  inferenceMetrics.totalSummaries++;
  inferenceMetrics.totalTokensProcessed += allTokens.length;

  return {
    summary: summary,
    sentences: selected.map(function (s) { return s.sentence; }),
    scores: selected.map(function (s) { return { sentence: s.sentence.substring(0, 50), score: s.score }; }),
    originalSentences: sentences.length,
    selectedSentences: selected.length,
    compressionRatio: Math.round((summary.length / text.length) * 100) / 100
  };
}

/* ════════════════════════════════════════════════════════════════
   Question Answering — context-based extraction
   ════════════════════════════════════════════════════════════════ */

function answerQuestion(question, context) {
  var qTokens = tokenize(question).filter(function (t) { return !STOP_WORDS[t]; });
  var sentences = splitSentences(context);

  // Score each sentence against the question
  var qVec = simpleEmbed(question);
  var scored = [];

  for (var i = 0; i < sentences.length; i++) {
    var sVec = simpleEmbed(sentences[i]);
    var sim = cosineSimilarity(qVec, sVec);

    // Bonus for keyword overlap
    var sTokens = tokenize(sentences[i]);
    var overlap = 0;
    for (var j = 0; j < qTokens.length; j++) {
      if (sTokens.indexOf(qTokens[j]) !== -1) overlap++;
    }
    var overlapBonus = qTokens.length > 0 ? overlap / qTokens.length : 0;

    scored.push({
      sentence: sentences[i],
      similarity: Math.round(sim * 10000) / 10000,
      overlapScore: Math.round(overlapBonus * 10000) / 10000,
      combinedScore: Math.round((sim * 0.6 + overlapBonus * 0.4) * 10000) / 10000
    });
  }

  scored.sort(function (a, b) { return b.combinedScore - a.combinedScore; });

  inferenceMetrics.totalAnswers++;
  inferenceMetrics.totalTokensProcessed += tokenize(context).length;

  return {
    question: question,
    answer: scored[0] ? scored[0].sentence : 'No answer found.',
    confidence: scored[0] ? scored[0].combinedScore : 0,
    topCandidates: scored.slice(0, 3),
    questionTokens: qTokens
  };
}

/* ════════════════════════════════════════════════════════════════
   Intent Classification — multi-intent detection
   ════════════════════════════════════════════════════════════════ */

var INTENT_PATTERNS = {
  greeting:     ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good evening', 'howdy'],
  farewell:     ['bye', 'goodbye', 'see you', 'later', 'farewell', 'take care'],
  question:     ['what', 'how', 'why', 'when', 'where', 'who', 'which', 'can you', 'could you', 'do you'],
  command:      ['do', 'make', 'create', 'build', 'generate', 'run', 'execute', 'start', 'stop', 'delete', 'remove'],
  search:       ['find', 'search', 'look up', 'look for', 'locate', 'discover', 'explore'],
  analysis:     ['analyze', 'analyse', 'examine', 'evaluate', 'assess', 'review', 'inspect', 'audit'],
  creative:     ['write', 'compose', 'design', 'draw', 'paint', 'imagine', 'invent', 'brainstorm'],
  code:         ['code', 'program', 'function', 'debug', 'compile', 'deploy', 'refactor', 'implement'],
  math:         ['calculate', 'compute', 'solve', 'equation', 'formula', 'sum', 'multiply', 'divide', 'integrate'],
  help:         ['help', 'assist', 'support', 'guide', 'explain', 'teach', 'show me', 'tutorial'],
  opinion:      ['think', 'believe', 'feel', 'opinion', 'prefer', 'recommend', 'suggest', 'best', 'worst'],
  comparison:   ['compare', 'versus', 'difference', 'better', 'worse', 'similar', 'contrast']
};

function classifyIntent(text) {
  var lower = text.toLowerCase();
  var tokens = tokenize(text);
  var intents = [];

  for (var intent in INTENT_PATTERNS) {
    var keywords = INTENT_PATTERNS[intent];
    var matchCount = 0;
    for (var i = 0; i < keywords.length; i++) {
      if (lower.indexOf(keywords[i]) !== -1) matchCount++;
    }
    if (matchCount > 0) {
      intents.push({
        intent: intent,
        confidence: Math.round((matchCount / keywords.length) * 10000) / 10000,
        matchedKeywords: matchCount
      });
    }
  }

  intents.sort(function (a, b) { return b.confidence - a.confidence; });

  // Detect question markers
  var isQuestion = /[?]/.test(text) || /^(what|how|why|when|where|who|which|can|could|do|does|is|are|was|were|will|would|should)\b/i.test(text.trim());

  inferenceMetrics.totalIntents++;
  return {
    text: text.substring(0, 100),
    primaryIntent: intents[0] ? intents[0].intent : 'unknown',
    allIntents: intents,
    isQuestion: isQuestion,
    complexity: tokens.length > 20 ? 'complex' : (tokens.length > 8 ? 'moderate' : 'simple'),
    wordCount: tokens.length
  };
}

/* ════════════════════════════════════════════════════════════════
   Chain-of-Thought Reasoning — step-by-step decomposition
   ════════════════════════════════════════════════════════════════ */

function chainOfThought(question) {
  var intent = classifyIntent(question);
  var tokens = tokenize(question);
  var entities = extractEntities(question);
  var sentiment = analyzeSentiment(question);
  var keywords = extractKeywords(question, 5);

  // Correct the sub-function metric counts — chain-of-thought counts as a single operation
  inferenceMetrics.totalIntents--;
  inferenceMetrics.totalEntities--;
  inferenceMetrics.totalSentiments--;
  inferenceMetrics.totalKeywords--;

  var steps = [];

  // Step 1: Parse the question
  steps.push({
    step: 1,
    action: 'Parse Input',
    result: 'Identified ' + tokens.length + ' tokens, ' + entities.length + ' entities',
    detail: { wordCount: tokens.length, entityCount: entities.length }
  });

  // Step 2: Intent detection
  steps.push({
    step: 2,
    action: 'Detect Intent',
    result: 'Primary intent: ' + intent.primaryIntent + ' (complexity: ' + intent.complexity + ')',
    detail: { intent: intent.primaryIntent, isQuestion: intent.isQuestion }
  });

  // Step 3: Keyword extraction
  steps.push({
    step: 3,
    action: 'Extract Key Concepts',
    result: 'Key concepts: ' + keywords.map(function (k) { return k.word; }).join(', '),
    detail: { keywords: keywords }
  });

  // Step 4: Sentiment context
  steps.push({
    step: 4,
    action: 'Assess Sentiment',
    result: 'Sentiment: ' + sentiment.label + ' (score: ' + sentiment.score + ')',
    detail: { sentiment: sentiment }
  });

  // Step 5: Route recommendation
  var recommendedCapability = 'Multi-modal reasoning';
  if (intent.primaryIntent === 'code') recommendedCapability = 'Code generation';
  else if (intent.primaryIntent === 'creative') recommendedCapability = 'Image generation';
  else if (intent.primaryIntent === 'math') recommendedCapability = 'Mathematical proof';
  else if (intent.primaryIntent === 'search') recommendedCapability = 'Research search';
  else if (intent.primaryIntent === 'analysis') recommendedCapability = 'Long-context reasoning';

  steps.push({
    step: 5,
    action: 'Route Recommendation',
    result: 'Best capability: ' + recommendedCapability,
    detail: { capability: recommendedCapability, confidence: intent.allIntents[0] ? intent.allIntents[0].confidence : 0 }
  });

  // Step 6: Synthesize
  steps.push({
    step: 6,
    action: 'Synthesize',
    result: 'Ready to dispatch via ' + recommendedCapability + ' pipeline',
    detail: { readyToDispatch: true, recommendedCapability: recommendedCapability }
  });

  inferenceMetrics.totalChainOfThought++;
  return {
    question: question.substring(0, 200),
    steps: steps,
    totalSteps: steps.length,
    recommendedCapability: recommendedCapability,
    reasoning: steps.map(function (s) { return 'Step ' + s.step + ': ' + s.result; }).join(' → ')
  };
}

/* ════════════════════════════════════════════════════════════════
   Topic Modeling — LDA-like clustering
   ════════════════════════════════════════════════════════════════ */

function modelTopics(text, k) {
  k = k || 3;
  var sentences = splitSentences(text);
  if (sentences.length === 0) return { error: 'No text to model' };

  // Build vocabulary from non-stop words
  var allTokens = [];
  var sentenceTokens = [];
  for (var i = 0; i < sentences.length; i++) {
    var st = tokenize(sentences[i]).filter(function (t) { return t.length > 2 && !STOP_WORDS[t]; });
    sentenceTokens.push(st);
    for (var j = 0; j < st.length; j++) {
      if (allTokens.indexOf(st[j]) === -1) allTokens.push(st[j]);
    }
  }

  // Simple clustering: group sentences by embedding similarity
  var embeddings = sentences.map(function (s) { return simpleEmbed(s); });

  // Initialize k centroids using first k embeddings (or evenly spaced)
  var centroids = [];
  for (var c = 0; c < k && c < embeddings.length; c++) {
    var idx = Math.floor(c * embeddings.length / k);
    centroids.push(embeddings[idx].slice());
  }

  // K-means iteration (3 rounds)
  var assignments = new Array(sentences.length);
  for (var iter = 0; iter < 3; iter++) {
    // Assign
    for (var si = 0; si < embeddings.length; si++) {
      var bestCluster = 0;
      var bestSim = -1;
      for (var ci = 0; ci < centroids.length; ci++) {
        var sim = cosineSimilarity(embeddings[si], centroids[ci]);
        if (sim > bestSim) { bestSim = sim; bestCluster = ci; }
      }
      assignments[si] = bestCluster;
    }

    // Update centroids
    for (var uc = 0; uc < centroids.length; uc++) {
      var count = 0;
      var newCentroid = new Float32Array(64);
      for (var ui = 0; ui < assignments.length; ui++) {
        if (assignments[ui] === uc) {
          count++;
          for (var d = 0; d < 64; d++) newCentroid[d] += embeddings[ui][d];
        }
      }
      if (count > 0) {
        for (var nd = 0; nd < 64; nd++) newCentroid[nd] /= count;
        centroids[uc] = newCentroid;
      }
    }
  }

  // Extract topic keywords per cluster
  var topics = [];
  for (var tc = 0; tc < k && tc < centroids.length; tc++) {
    var clusterTokens = [];
    var clusterSentences = [];
    for (var ti = 0; ti < assignments.length; ti++) {
      if (assignments[ti] === tc) {
        clusterSentences.push(sentences[ti]);
        for (var tk = 0; tk < sentenceTokens[ti].length; tk++) {
          clusterTokens.push(sentenceTokens[ti][tk]);
        }
      }
    }
    var freq = tokenFrequency(clusterTokens);
    var topWords = Object.keys(freq).sort(function (a, b) { return freq[b] - freq[a]; }).slice(0, 5);

    topics.push({
      id: tc,
      label: 'Topic ' + (tc + 1) + ': ' + topWords.slice(0, 3).join(', '),
      keywords: topWords,
      sentenceCount: clusterSentences.length,
      sampleSentence: clusterSentences[0] ? clusterSentences[0].substring(0, 80) : ''
    });
  }

  inferenceMetrics.totalTopicModels++;
  inferenceMetrics.totalTokensProcessed += allTokens.length;

  return {
    topics: topics,
    totalTopics: topics.length,
    totalSentences: sentences.length,
    vocabularySize: allTokens.length
  };
}

/* ════════════════════════════════════════════════════════════════
   Message Handler
   ════════════════════════════════════════════════════════════════ */

self.onmessage = function (e) {
  var msg = e.data;
  neuro.onMessage(msg.type);

  switch (msg.type) {
    case 'classify': {
      var categories = msg.categories || ['technology', 'science', 'business', 'entertainment', 'sports'];
      var result = classify(msg.text || '', categories);
      self.postMessage({ type: 'classification', data: result });
      break;
    }
    case 'match': {
      var matches = matchPatterns(msg.text || '', msg.patterns || []);
      self.postMessage({ type: 'match-result', data: matches });
      break;
    }
    case 'similarity': {
      var vecA = simpleEmbed(msg.textA || '');
      var vecB = simpleEmbed(msg.textB || '');
      var sim = cosineSimilarity(vecA, vecB);
      inferenceMetrics.totalSimilarities++;
      self.postMessage({ type: 'similarity-result', data: { similarity: Math.round(sim * 10000) / 10000 } });
      break;
    }
    case 'keywords': {
      var keywords = extractKeywords(msg.text || '', msg.topK);
      self.postMessage({ type: 'keywords-result', data: keywords });
      break;
    }
    case 'sentiment': {
      var sentiment = analyzeSentiment(msg.text || '');
      self.postMessage({ type: 'sentiment-result', data: sentiment });
      break;
    }
    case 'entities': {
      var entities = extractEntities(msg.text || '');
      self.postMessage({ type: 'entities-result', data: entities });
      break;
    }
    case 'embed': {
      var vec = simpleEmbed(msg.text || '');
      inferenceMetrics.totalEmbeddings++;
      self.postMessage({ type: 'embedding', data: { vector: Array.from(vec), dimensions: vec.length } });
      break;
    }
    case 'summarize': {
      var summary = summarize(msg.text || '', msg.sentences || 3);
      self.postMessage({ type: 'summary', data: summary });
      break;
    }
    case 'answer': {
      var answer = answerQuestion(msg.question || '', msg.context || '');
      self.postMessage({ type: 'answer-result', data: answer });
      break;
    }
    case 'intent': {
      var intent = classifyIntent(msg.text || '');
      self.postMessage({ type: 'intent-result', data: intent });
      break;
    }
    case 'chain-of-thought': {
      var chain = chainOfThought(msg.question || msg.text || '');
      self.postMessage({ type: 'chain-result', data: chain });
      break;
    }
    case 'topics': {
      var topics = modelTopics(msg.text || '', msg.k || 3);
      self.postMessage({ type: 'topics-result', data: topics });
      break;
    }
    case 'stats': {
      self.postMessage({ type: 'inference-stats', stats: inferenceMetrics });
      break;
    }
    case 'neuro-signal':
      neuro.receiveNeuroSignal(msg);
      break;
    case 'stop':
      running = false;
      break;
  }
  neuro.onMessageDone();
};

/* ════════════════════════════════════════════════════════════════
   Heartbeat
   ════════════════════════════════════════════════════════════════ */

var neuro = new NeuroCore('inference');

setInterval(function () {
  if (!running) return;
  beatCount++;
  self.postMessage({
    type: 'heartbeat',
    worker: 'inference',
    beat: beatCount,
    timestamp: Date.now(),
    status: 'alive',
    metrics: inferenceMetrics,
    neuro: neuro.pulse()
  });
}, HEARTBEAT_MS);
