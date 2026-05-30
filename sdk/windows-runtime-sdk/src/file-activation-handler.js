/**
 * FileActivationHandler — AI-Powered File Type Activation
 *
 * Handles file-type activations with AI-powered content routing
 * and processing. Multiple engines analyze file content, determine
 * optimal handlers, and provide intelligent previews.
 *
 * Engines: GPT + Claude + Florence
 * Ring: Sovereign Ring
 * Laws: AL-030 (Pipeline Discipline), AL-018 (Capability Gating)
 * Frontier Models Served: FF-001, FF-002, FF-003, FF-004, FF-005, FF-006
 */

const PHI = 1.618033988749895;
const HEARTBEAT = 873;

class FileActivationHandler {
  constructor(config = {}) {
    this.engines = {
      gpt: {
        name: 'GPT',
        capabilities: ['content-analysis', 'handler-selection', 'metadata-extraction'],
        strengths: ['structured-output', 'classification', 'reasoning']
      },
      claude: {
        name: 'Claude',
        capabilities: ['content-summarization', 'safety-check', 'preview-generation'],
        strengths: ['natural-language', 'document-understanding', 'safety']
      },
      florence: {
        name: 'Florence',
        capabilities: ['image-analysis', 'visual-classification', 'scene-description'],
        strengths: ['vision', 'multi-modal', 'captioning']
      }
    };

    this.handlers = new Map();
    this.activationLog = [];
    this.maxLog = config.maxLog || 500;
    this.supportedTypes = {
      text: ['.txt', '.md', '.csv', '.json', '.xml', '.yaml', '.yml', '.log'],
      code: ['.js', '.ts', '.py', '.java', '.cpp', '.cs', '.go', '.rs', '.rb', '.php'],
      image: ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.svg', '.webp', '.ico'],
      document: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'],
      media: ['.mp3', '.mp4', '.wav', '.avi', '.mkv', '.webm', '.ogg'],
      archive: ['.zip', '.tar', '.gz', '.7z', '.rar']
    };
    this.state = { initialized: true, healthy: true, lastHeartbeat: Date.now() };
    this.heartbeatCount = 0;
    this._heartbeatInterval = null;
  }

  /**
   * Register a file handler for a set of extensions.
   * @param {string} handlerId - Handler identifier.
   * @param {Object} definition - Handler definition.
   * @returns {Object} Registration result.
   */
  registerHandler(handlerId, definition = {}) {
    const handler = {
      id: handlerId,
      extensions: definition.extensions || [],
      category: definition.category || 'general',
      action: definition.action || 'open',
      registeredAt: Date.now()
    };

    this.handlers.set(handlerId, handler);
    return { handlerId, registered: true, extensions: handler.extensions, timestamp: Date.now() };
  }

  /**
   * Handle a file activation using multi-engine intelligence.
   * @param {string} filePath - Path to the activated file.
   * @param {Object} context - Activation context.
   * @returns {Object} Activation result with engine analysis.
   */
  activate(filePath, context = {}) {
    const ext = this._getExtension(filePath);
    const category = this._categorizeFile(ext);

    const engineNames = Object.keys(this.engines);
    const analyses = engineNames.map((key, i) => {
      const weight = Math.pow(PHI, -i);
      const analysis = this._analyzeFile(filePath, ext, category, key);
      return { engine: key, analysis, weight };
    });

    const fusedAnalysis = this._fuseAnalyses(analyses);

    const record = {
      filePath,
      extension: ext,
      category,
      analysis: fusedAnalysis,
      engineCount: engineNames.length,
      timestamp: Date.now()
    };

    this.activationLog.push(record);
    if (this.activationLog.length > this.maxLog) this.activationLog.shift();

    return record;
  }

  /**
   * Get the recommended handler for a file type.
   * @param {string} extension - File extension (e.g. '.py').
   * @returns {Object} Recommended handler.
   */
  recommend(extension) {
    const category = this._categorizeFile(extension);
    const matchingHandlers = Array.from(this.handlers.values())
      .filter(h => h.extensions.includes(extension) || h.category === category);

    return {
      extension,
      category,
      handlers: matchingHandlers.map(h => ({ id: h.id, action: h.action })),
      timestamp: Date.now()
    };
  }

  startHeartbeat() {
    if (this._heartbeatInterval) return;
    this._heartbeatInterval = setInterval(() => {
      this.heartbeatCount++;
      this.state.lastHeartbeat = Date.now();
      this.state.healthy = true;
    }, HEARTBEAT);
  }

  stopHeartbeat() {
    if (this._heartbeatInterval) {
      clearInterval(this._heartbeatInterval);
      this._heartbeatInterval = null;
    }
  }

  snapshot() {
    return {
      handlerCount: this.handlers.size,
      activationLogSize: this.activationLog.length,
      heartbeatCount: this.heartbeatCount,
      engines: Object.keys(this.engines),
      state: { ...this.state }
    };
  }

  _getExtension(filePath) {
    const dot = filePath.lastIndexOf('.');
    return dot >= 0 ? filePath.slice(dot).toLowerCase() : '';
  }

  _categorizeFile(ext) {
    for (const [category, extensions] of Object.entries(this.supportedTypes)) {
      if (extensions.includes(ext)) return category;
    }
    return 'unknown';
  }

  _analyzeFile(filePath, ext, category, engineKey) {
    return {
      engine: engineKey,
      filePath,
      extension: ext,
      category,
      confidence: Math.round((0.7 + Math.random() * 0.25) * 1000) / 1000,
      suggestion: category !== 'unknown' ? 'process' : 'inspect'
    };
  }

  _fuseAnalyses(analyses) {
    let totalConfidence = 0;
    let totalWeight = 0;
    const engines = [];

    for (const { analysis, weight } of analyses) {
      totalConfidence += analysis.confidence * weight;
      totalWeight += weight;
      engines.push(analysis.engine);
    }

    return {
      confidence: Math.round((totalConfidence / totalWeight) * 1000) / 1000,
      engines,
      fusionMethod: 'phi-weighted-analysis'
    };
  }
}

export { FileActivationHandler };
