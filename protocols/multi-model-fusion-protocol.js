/**
 * PROTO-005: Multi-Model Fusion Protocol (MMFP)
 * Ensemble Intelligence that fuses outputs from multiple foundation models.
 */

const PHI = 1.618033988749895;
const GOLDEN_ANGLE = 2.399963229728653;
const HEARTBEAT = 873;

class MultiModelFusionProtocol {
  /**
   * @param {Object} config - Configuration
   */
  constructor(config = {}) {
    this.modelRegistry = new Map();
    this.fusionWeights = {};
    this.consensusThreshold = config.consensusThreshold || 0.7;
    this.metrics = {
      totalFusions: 0,
      totalConsensus: 0,
      hallucinationsDetected: 0,
      modelContributions: {}
    };

    // Initialize 5 core models
    const coreModels = [
      { id: 'gpt', name: 'GPT-4', strengths: ['reasoning', 'coding', 'analysis'], confidence: 0.92 },
      { id: 'claude', name: 'Claude-3.5', strengths: ['reasoning', 'creative', 'safety'], confidence: 0.90 },
      { id: 'gemini', name: 'Gemini-2.0', strengths: ['multimodal', 'analysis', 'search'], confidence: 0.88 },
      { id: 'llama', name: 'Llama-3.1', strengths: ['coding', 'reasoning', 'efficiency'], confidence: 0.82 },
      { id: 'mistral', name: 'Mistral-Large', strengths: ['coding', 'multilingual', 'speed'], confidence: 0.80 }
    ];

    for (const model of coreModels) {
      this.modelRegistry.set(model.id, {
        ...model,
        totalContributions: 0,
        successfulContributions: 0
      });
      this.fusionWeights[model.id] = model.confidence;
      this.metrics.modelContributions[model.id] = 0;
    }
  }

  /**
   * Simulate model response generation.
   * @private
   */
  _simulateModelResponse(modelId, prompt) {
    const model = this.modelRegistry.get(modelId);
    if (!model) return null;

    // Simulate response based on model characteristics
    const hash = this._simpleHash(prompt + modelId);
    const confidence = model.confidence * (0.85 + (hash % 15) / 100);
    const tokens = prompt.split(/\s+/);
    const keyTerms = tokens.filter(t => t.length > 4).slice(0, 5);

    return {
      modelId,
      content: `[${model.name}] Analysis of "${tokens.slice(0, 3).join(' ')}...": Based on ${model.strengths.join(', ')} capabilities, the response addresses ${keyTerms.join(', ')}.`,
      confidence: Math.min(confidence, 1.0),
      latencyMs: HEARTBEAT * (0.5 + Math.random() * 0.5),
      tokens: 50 + (hash % 200)
    };
  }

  _simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  /**
   * Query each model and aggregate with phi-decay weighting.
   * w_i = φ^(-i) × confidence_i
   * @param {string} prompt - Input prompt
   * @param {string[]} models - Model IDs to query
   * @returns {Object} - {consensus, responses, fusedContent, consensusScore}
   */
  fuse(prompt, models = ['gpt', 'claude', 'gemini']) {
    const responses = [];
    for (const modelId of models) {
      const resp = this._simulateModelResponse(modelId, prompt);
      if (resp) {
        responses.push(resp);
        const model = this.modelRegistry.get(modelId);
        if (model) model.totalContributions++;
        this.metrics.modelContributions[modelId] = (this.metrics.modelContributions[modelId] || 0) + 1;
      }
    }

    // Phi-decay weighting
    let weightedContent = [];
    let totalWeight = 0;
    for (let i = 0; i < responses.length; i++) {
      const w = Math.pow(PHI, -i) * responses[i].confidence;
      weightedContent.push({ response: responses[i], weight: w });
      totalWeight += w;
    }

    // Normalize weights
    for (const wc of weightedContent) {
      wc.normalizedWeight = totalWeight > 0 ? wc.weight / totalWeight : 1 / responses.length;
    }

    const consensusScore = this.scoreConsensus(responses);
    const hallucinations = this.detectHallucination(responses[0], responses.slice(1));

    // Build fused content from highest-weighted response
    weightedContent.sort((a, b) => b.weight - a.weight);
    const fusedContent = weightedContent.length > 0 ? weightedContent[0].response.content : '';

    this.metrics.totalFusions++;
    this.metrics.totalConsensus += consensusScore;

    return {
      consensus: consensusScore >= this.consensusThreshold,
      responses,
      fusedContent,
      consensusScore,
      weights: weightedContent.map(wc => ({ modelId: wc.response.modelId, weight: wc.normalizedWeight })),
      hallucinations
    };
  }

  /**
   * Measure agreement across model responses using pairwise similarity.
   * @param {Object[]} responses - Array of model responses
   * @returns {number} - Consensus score 0-1
   */
  scoreConsensus(responses) {
    if (responses.length < 2) return 1.0;

    let totalSimilarity = 0;
    let pairs = 0;

    for (let i = 0; i < responses.length; i++) {
      for (let j = i + 1; j < responses.length; j++) {
        const sim = this._textSimilarity(responses[i].content, responses[j].content);
        totalSimilarity += sim;
        pairs++;
      }
    }

    return pairs > 0 ? totalSimilarity / pairs : 0;
  }

  _textSimilarity(textA, textB) {
    const wordsA = new Set(textA.toLowerCase().split(/\W+/).filter(w => w.length > 3));
    const wordsB = new Set(textB.toLowerCase().split(/\W+/).filter(w => w.length > 3));
    if (wordsA.size === 0 && wordsB.size === 0) return 1.0;
    let intersection = 0;
    for (const w of wordsA) {
      if (wordsB.has(w)) intersection++;
    }
    const union = new Set([...wordsA, ...wordsB]).size;
    return union > 0 ? intersection / union : 0;
  }

  /**
   * Flag content that only one model produces and others contradict.
   * @param {Object} response - Primary response to check
   * @param {Object[]} otherResponses - Other model responses
   * @returns {Object[]} - Array of flagged hallucination items
   */
  detectHallucination(response, otherResponses) {
    if (!response || otherResponses.length === 0) return [];

    const flags = [];
    const primaryWords = new Set(response.content.toLowerCase().split(/\W+/).filter(w => w.length > 5));
    const otherWords = new Set();
    for (const r of otherResponses) {
      for (const w of r.content.toLowerCase().split(/\W+/).filter(w => w.length > 5)) {
        otherWords.add(w);
      }
    }

    for (const word of primaryWords) {
      if (!otherWords.has(word)) {
        flags.push({
          term: word,
          source: response.modelId,
          reason: 'unique_to_single_model',
          severity: 'low'
        });
      }
    }

    if (flags.length > primaryWords.size * 0.5) {
      this.metrics.hallucinationsDetected++;
    }

    return flags;
  }

  /**
   * Resolve contradictions between model responses.
   * @param {Object[]} responses - Model responses
   * @param {string} method - Resolution method: 'weighted-vote' or 'confidence-max'
   * @returns {Object} - Resolved response
   */
  resolveDisagreement(responses, method = 'weighted-vote') {
    if (responses.length === 0) return { content: '', modelId: null, method };

    if (method === 'confidence-max') {
      const best = responses.reduce((a, b) => a.confidence > b.confidence ? a : b);
      return { content: best.content, modelId: best.modelId, method, confidence: best.confidence };
    }

    // weighted-vote: weight by fusion weights × confidence
    let bestContent = '';
    let bestScore = -1;
    let bestModelId = null;
    for (const resp of responses) {
      const fusionWeight = this.fusionWeights[resp.modelId] || 0.5;
      const score = fusionWeight * resp.confidence;
      if (score > bestScore) {
        bestScore = score;
        bestContent = resp.content;
        bestModelId = resp.modelId;
      }
    }

    return { content: bestContent, modelId: bestModelId, method, confidence: bestScore };
  }

  /**
   * Iterative refinement chain: model1→model2→model3.
   * Each model improves on previous with φ^(-depth) contribution decay.
   * @param {string} prompt - Initial prompt
   * @param {number} maxDepth - Maximum chain depth
   * @returns {Object} - {finalContent, chain, totalContribution}
   */
  buildFusionChain(prompt, maxDepth = 3) {
    const modelIds = [...this.modelRegistry.keys()];
    const chain = [];
    let currentPrompt = prompt;
    let totalContribution = 0;

    for (let depth = 0; depth < maxDepth && depth < modelIds.length; depth++) {
      const modelId = modelIds[depth % modelIds.length];
      const response = this._simulateModelResponse(modelId, currentPrompt);
      if (!response) continue;

      const contribution = Math.pow(PHI, -depth);
      chain.push({
        depth,
        modelId,
        content: response.content,
        confidence: response.confidence,
        contribution
      });
      totalContribution += contribution;

      // Next model refines based on previous output
      currentPrompt = `Refine: ${response.content}`;
    }

    const finalContent = chain.length > 0 ? chain[chain.length - 1].content : '';
    return { finalContent, chain, totalContribution };
  }

  /**
   * Adjust fusion weights based on outcome feedback.
   * @param {string} modelId
   * @param {Object} outcome - {success: boolean, quality: number 0-1}
   */
  updateWeights(modelId, outcome) {
    const model = this.modelRegistry.get(modelId);
    if (!model) return;

    const alpha = 1 / PHI;
    const currentWeight = this.fusionWeights[modelId] || 0.5;
    const quality = outcome.quality || (outcome.success ? 1.0 : 0.0);
    this.fusionWeights[modelId] = alpha * quality + (1 - alpha) * currentWeight;

    if (outcome.success) {
      model.successfulContributions++;
    }
  }

  /**
   * Returns fusion metrics.
   * @returns {Object}
   */
  getFusionMetrics() {
    return {
      totalFusions: this.metrics.totalFusions,
      avgConsensus: this.metrics.totalFusions > 0 ? this.metrics.totalConsensus / this.metrics.totalFusions : 0,
      hallucinationsDetected: this.metrics.hallucinationsDetected,
      modelContributions: { ...this.metrics.modelContributions }
    };
  }
}

export { MultiModelFusionProtocol };
export default MultiModelFusionProtocol;
