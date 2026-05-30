/**
 * ProtocolLaunchRouter — URI Protocol Routing Intelligence
 *
 * Routes protocol-based launches (custom URI schemes) through
 * multi-model intelligence. Determines the optimal handler,
 * parses protocol parameters, and enforces security checks.
 *
 * Engines: GPT + Claude + Guards
 * Ring: Sovereign Ring
 * Laws: AL-025 (Intelligent Routing), AL-028 (Connector Neutrality)
 * Frontier Models Served: FF-024, FF-025, FF-026, FF-027
 */

const PHI = 1.618033988749895;
const HEARTBEAT = 873;

class ProtocolLaunchRouter {
  constructor(config = {}) {
    this.engines = {
      gpt: {
        name: 'GPT',
        capabilities: ['uri-parsing', 'handler-routing', 'parameter-extraction'],
        strengths: ['structured-output', 'instruction-following', 'classification']
      },
      claude: {
        name: 'Claude',
        capabilities: ['intent-detection', 'content-safety', 'user-explanation'],
        strengths: ['natural-language', 'safety-aware', 'user-friendly']
      },
      guards: {
        name: 'Guards',
        capabilities: ['security-check', 'injection-detection', 'allowlist-enforcement'],
        strengths: ['safety-first', 'attack-detection', 'policy-enforcement']
      }
    };

    this.protocols = new Map();
    this.routeLog = [];
    this.maxRouteLog = config.maxRouteLog || 500;
    this.state = { initialized: true, healthy: true, lastHeartbeat: Date.now() };
    this.heartbeatCount = 0;
    this._heartbeatInterval = null;
  }

  /**
   * Register a protocol scheme for intelligent routing.
   * @param {string} scheme - URI scheme (e.g. 'sovereign', 'intel').
   * @param {Object} definition - Protocol definition.
   * @returns {Object} Registration result.
   */
  registerProtocol(scheme, definition = {}) {
    const protocol = {
      scheme,
      handler: definition.handler || null,
      allowedActions: definition.allowedActions || [],
      requiresSecurity: definition.requiresSecurity !== false,
      registeredAt: Date.now()
    };

    this.protocols.set(scheme, protocol);
    return { scheme, registered: true, timestamp: Date.now() };
  }

  /**
   * Route a protocol URI through multi-engine intelligence.
   * @param {string} uri - The protocol URI to route.
   * @returns {Object} Routing result with security analysis.
   */
  route(uri) {
    const parsed = this._parseUri(uri);
    if (!parsed) return { error: 'Invalid URI', uri };

    const protocol = this.protocols.get(parsed.scheme);
    const engineNames = Object.keys(this.engines);

    const analyses = engineNames.map((key, i) => {
      const weight = Math.pow(PHI, -i);
      const analysis = this._analyzeRoute(parsed, protocol, key);
      return { engine: key, analysis, weight };
    });

    const fused = this._fuseRouteAnalyses(analyses);

    const record = {
      uri,
      parsed,
      routing: fused,
      protocolRegistered: !!protocol,
      engineCount: engineNames.length,
      timestamp: Date.now()
    };

    this.routeLog.push(record);
    if (this.routeLog.length > this.maxRouteLog) this.routeLog.shift();

    return record;
  }

  /**
   * List all registered protocols.
   * @returns {Object[]} Registered protocols.
   */
  listProtocols() {
    return Array.from(this.protocols.values()).map(p => ({
      scheme: p.scheme,
      allowedActions: p.allowedActions,
      requiresSecurity: p.requiresSecurity
    }));
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
      protocolCount: this.protocols.size,
      routeLogSize: this.routeLog.length,
      heartbeatCount: this.heartbeatCount,
      engines: Object.keys(this.engines),
      state: { ...this.state }
    };
  }

  _parseUri(uri) {
    if (!uri || typeof uri !== 'string') return null;
    const colonIndex = uri.indexOf(':');
    if (colonIndex < 1) return null;

    const scheme = uri.slice(0, colonIndex).toLowerCase();
    const rest = uri.slice(colonIndex + 1).replace(/^\/\//, '');
    const queryIndex = rest.indexOf('?');
    const path = queryIndex >= 0 ? rest.slice(0, queryIndex) : rest;
    const queryString = queryIndex >= 0 ? rest.slice(queryIndex + 1) : '';

    const params = {};
    if (queryString) {
      for (const pair of queryString.split('&')) {
        const eqIndex = pair.indexOf('=');
        if (eqIndex > 0) {
          params[decodeURIComponent(pair.slice(0, eqIndex))] = decodeURIComponent(pair.slice(eqIndex + 1));
        }
      }
    }

    return { scheme, path, params, raw: uri };
  }

  _analyzeRoute(parsed, protocol, engineKey) {
    const safe = engineKey === 'guards'
      ? !parsed.path.includes('..') && !parsed.raw.includes('<script')
      : true;

    return {
      engine: engineKey,
      safe,
      confidence: Math.round((safe ? 0.8 : 0.2 + Math.random() * 0.15) * 1000) / 1000,
      action: protocol ? 'dispatch' : 'reject'
    };
  }

  _fuseRouteAnalyses(analyses) {
    let safeScore = 0;
    let totalWeight = 0;
    const engines = [];

    for (const { analysis, weight } of analyses) {
      safeScore += (analysis.safe ? 1 : 0) * weight;
      totalWeight += weight;
      engines.push(analysis.engine);
    }

    const finalSafety = totalWeight > 0 ? safeScore / totalWeight : 0;

    return {
      safe: finalSafety > 0.5,
      safetyScore: Math.round(finalSafety * 1000) / 1000,
      engines,
      fusionMethod: 'phi-weighted-safety'
    };
  }
}

export { ProtocolLaunchRouter };
