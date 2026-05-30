/**
 * 👻 WraithGuard Durable Object
 * ════════════════════════════════════════════════════════════════════════════
 * 
 * SECURITY FRACTURE: WRAITH LAYER
 * 
 * Invisible threat detection and response system. The Wraith watches all
 * traffic, detects anomalies, and can instantly block threats across the
 * entire organism network. Unlike traditional firewalls, Wraith learns
 * attack patterns via Hebbian associations.
 * 
 * Wraith/Ghost/Phantom Hierarchy:
 *   - WRAITH: Invisible watchers — observe, detect, alert
 *   - GHOST: Decoys and honeypots — trap and analyze attackers
 *   - PHANTOM: Stealth countermeasures — obscure, encrypt, route evasively
 * 
 * Features:
 *   - Phi-weighted threat scoring
 *   - Hebbian anomaly learning (patterns that occur together = threat)
 *   - Adaptive rate limiting with credit system
 *   - IP/Agent/Token blocklists with expiration
 *   - Honeypot coordination with Ghost layer
 *   - Stealth mode activation via Phantom layer
 * 
 * @module organism/durable-objects/wraith-guard
 * @version 1.0.0
 * @powered-by ORO Systems
 */

// ─── Phi Constants ────────────────────────────────────────────────────────────
const PHI = 1.618033988749895;
const PHI_INV = 0.618033988749895;
const HEARTBEAT = 873;

// ─── Threat Severity Levels ───────────────────────────────────────────────────
const SEVERITY = {
  INFO: 0,
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
  CATASTROPHIC: 5,
};

// ─── Threat Categories ────────────────────────────────────────────────────────
const THREAT_TYPES = {
  RATE_LIMIT: 'rate_limit',
  INJECTION: 'injection',
  ANOMALY: 'anomaly',
  BRUTE_FORCE: 'brute_force',
  SCRAPING: 'scraping',
  DATA_EXFIL: 'data_exfiltration',
  REPLAY: 'replay_attack',
  SPOOFING: 'spoofing',
  PRIVILEGE_ESCALATION: 'privilege_escalation',
  UNKNOWN: 'unknown',
};

// ─── Actions ──────────────────────────────────────────────────────────────────
const ACTIONS = {
  ALLOW: 'allow',
  BLOCK: 'block',
  CHALLENGE: 'challenge',
  HONEYPOT: 'honeypot',    // Redirect to Ghost layer
  PHANTOM: 'phantom',      // Activate stealth countermeasures
  ALERT: 'alert',
};

/**
 * WraithGuard — Invisible security Durable Object that learns threats.
 */
export class WraithGuard {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.storage = state.storage;
    
    // ─── In-Memory Security State ─────────────────────────────────────────────
    this.blocklist = new Map();       // key -> { reason, expiresAt, severity }
    this.rateLimiters = new Map();    // key -> { tokens, lastRefill, windowMs }
    this.threatLog = [];              // Recent threats (max 1000)
    this.anomalyBaseline = new Map(); // metric -> { mean, variance, samples }
    this.hebbianThreatLinks = new Map(); // "source->pattern" -> weight
    this.websockets = new Set();
    
    // ─── Metrics ──────────────────────────────────────────────────────────────
    this.metrics = {
      totalChecks: 0,
      totalBlocked: 0,
      totalAllowed: 0,
      totalThreats: 0,
      totalHoneypotRedirects: 0,
      totalPhantomActivations: 0,
      cumulativeThreatScore: 0,
      lastHeartbeat: Date.now(),
    };
    
    this.initialized = false;
    this.initPromise = this.initialize();
  }

  async initialize() {
    if (this.initialized) return;
    
    const stored = await this.storage.get([
      'blocklist', 'anomalyBaseline', 'hebbianThreatLinks', 'metrics'
    ]);
    
    if (stored.blocklist) this.blocklist = new Map(Object.entries(stored.blocklist));
    if (stored.anomalyBaseline) this.anomalyBaseline = new Map(Object.entries(stored.anomalyBaseline));
    if (stored.hebbianThreatLinks) this.hebbianThreatLinks = new Map(Object.entries(stored.hebbianThreatLinks));
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
      // Security check endpoints
      if (path === '/check' && request.method === 'POST') {
        return this.handleCheck(request);
      }
      if (path === '/rate-limit' && request.method === 'POST') {
        return this.handleRateLimit(request);
      }
      if (path === '/block' && request.method === 'POST') {
        return this.handleBlock(request);
      }
      if (path === '/unblock' && request.method === 'POST') {
        return this.handleUnblock(request);
      }
      if (path === '/report-threat' && request.method === 'POST') {
        return this.handleReportThreat(request);
      }
      if (path === '/threats' && request.method === 'GET') {
        return this.handleGetThreats(request);
      }
      if (path === '/honeypot/trigger' && request.method === 'POST') {
        return this.handleHoneypotTrigger(request);
      }
      if (path === '/phantom/activate' && request.method === 'POST') {
        return this.handlePhantomActivate(request);
      }
      if (path === '/anomaly/train' && request.method === 'POST') {
        return this.handleAnomalyTrain(request);
      }
      if (path === '/anomaly/detect' && request.method === 'POST') {
        return this.handleAnomalyDetect(request);
      }
      if (path === '/hebbian/strengthen' && request.method === 'POST') {
        return this.handleHebbianStrengthen(request);
      }
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

  // ─── Security Check ─────────────────────────────────────────────────────────
  async handleCheck(request) {
    const { source, action, target, payload, metadata = {} } = await request.json();
    
    this.metrics.totalChecks++;
    const now = Date.now();
    
    // 1. Check blocklist
    const blockEntry = this.blocklist.get(source);
    if (blockEntry) {
      if (blockEntry.expiresAt && now > blockEntry.expiresAt) {
        this.blocklist.delete(source);
      } else {
        this.metrics.totalBlocked++;
        return this.jsonResponse({
          action: ACTIONS.BLOCK,
          reason: blockEntry.reason,
          severity: blockEntry.severity,
        });
      }
    }
    
    // 2. Calculate threat score
    let threatScore = 0;
    const flags = [];
    
    // Dangerous actions
    if (['delete-all', 'wipe', 'drop', 'truncate'].includes(action)) {
      threatScore += 3 * PHI;
      flags.push('dangerous_action');
    }
    
    // Large payloads
    if (payload && typeof payload === 'string' && payload.length > 100000) {
      threatScore += 1 * PHI;
      flags.push('large_payload');
    }
    
    // Injection patterns (simplified to avoid ReDoS)
    // Note: These are for threat detection/flagging, not XSS sanitization
    const injectionPatterns = [
      /\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION)\b/i,  // SQL keywords
      /<script\b/i,                                      // Script tag opener (flags any script tag)
      /<\/script/i,                                      // Script tag closer
      /\$\{[^}]{0,100}\}/,                              // Template literals (bounded)
      /\{\{[^}]{0,100}\}\}/,                            // Mustache templates (bounded)
    ];
    if (payload) {
      for (const pattern of injectionPatterns) {
        if (pattern.test(payload)) {
          threatScore += 2 * PHI;
          flags.push('injection_pattern');
          break;
        }
      }
    }
    
    // Check Hebbian threat associations
    const hebbianKey = `${source}->${action}`;
    const hebbianWeight = this.hebbianThreatLinks.get(hebbianKey) || 0;
    if (hebbianWeight > PHI_INV) {
      threatScore += hebbianWeight * PHI;
      flags.push('hebbian_threat');
    }
    
    // Anomaly detection
    if (metadata.requestsPerMinute !== undefined) {
      const anomalyScore = this.detectAnomaly('requests_per_minute', metadata.requestsPerMinute);
      if (anomalyScore > 2) {
        threatScore += anomalyScore * PHI_INV;
        flags.push('rate_anomaly');
      }
    }
    
    // 3. Determine action
    let responseAction = ACTIONS.ALLOW;
    
    if (threatScore >= PHI * PHI * PHI) {  // ~4.24 — Critical
      responseAction = ACTIONS.BLOCK;
      this.addToBlocklist(source, 'critical_threat', 3600000); // 1 hour
    } else if (threatScore >= PHI * PHI) {  // ~2.62 — High
      responseAction = ACTIONS.PHANTOM;
      this.metrics.totalPhantomActivations++;
    } else if (threatScore >= PHI) {  // ~1.62 — Medium
      responseAction = ACTIONS.HONEYPOT;
      this.metrics.totalHoneypotRedirects++;
    } else if (threatScore >= 1) {  // Low
      responseAction = ACTIONS.CHALLENGE;
    }
    
    // Log threat if score > 0
    if (threatScore > 0) {
      this.logThreat({
        source,
        action,
        target,
        threatScore,
        flags,
        responseAction,
        timestamp: now,
      });
    }
    
    // Update metrics
    if (responseAction === ACTIONS.ALLOW) {
      this.metrics.totalAllowed++;
    } else if (responseAction === ACTIONS.BLOCK) {
      this.metrics.totalBlocked++;
    }
    
    this.broadcast({ event: 'security_check', source, responseAction, threatScore });
    
    return this.jsonResponse({
      action: responseAction,
      threatScore: parseFloat(threatScore.toFixed(4)),
      flags,
      allowed: responseAction === ACTIONS.ALLOW,
    });
  }

  // ─── Rate Limiting ──────────────────────────────────────────────────────────
  async handleRateLimit(request) {
    const { key, limit = 100, windowMs = 60000 } = await request.json();
    
    if (!key) {
      return this.jsonResponse({ error: 'key required' }, 400);
    }
    
    const now = Date.now();
    let limiter = this.rateLimiters.get(key);
    
    if (!limiter) {
      limiter = {
        tokens: limit,
        lastRefill: now,
        windowMs,
        limit,
      };
      this.rateLimiters.set(key, limiter);
    }
    
    // Refill tokens based on elapsed time
    const elapsed = now - limiter.lastRefill;
    const refill = Math.floor((elapsed / limiter.windowMs) * limiter.limit);
    if (refill > 0) {
      limiter.tokens = Math.min(limiter.limit, limiter.tokens + refill);
      limiter.lastRefill = now;
    }
    
    // Consume a token
    if (limiter.tokens > 0) {
      limiter.tokens--;
      return this.jsonResponse({
        allowed: true,
        remaining: limiter.tokens,
        resetIn: limiter.windowMs - (now - limiter.lastRefill),
      });
    }
    
    // Rate limited
    this.logThreat({
      source: key,
      type: THREAT_TYPES.RATE_LIMIT,
      severity: SEVERITY.LOW,
      timestamp: now,
    });
    
    return this.jsonResponse({
      allowed: false,
      remaining: 0,
      resetIn: limiter.windowMs - (now - limiter.lastRefill),
      retryAfter: Math.ceil((limiter.windowMs - (now - limiter.lastRefill)) / 1000),
    });
  }

  // ─── Block/Unblock ──────────────────────────────────────────────────────────
  async handleBlock(request) {
    const { key, reason = 'manual', durationMs = null, severity = SEVERITY.MEDIUM } = await request.json();
    
    if (!key) {
      return this.jsonResponse({ error: 'key required' }, 400);
    }
    
    this.addToBlocklist(key, reason, durationMs, severity);
    await this.persistAll();
    
    this.broadcast({ event: 'blocked', key, reason });
    
    return this.jsonResponse({ blocked: true, key, reason });
  }

  async handleUnblock(request) {
    const { key } = await request.json();
    
    if (!key) {
      return this.jsonResponse({ error: 'key required' }, 400);
    }
    
    const existed = this.blocklist.delete(key);
    await this.persistAll();
    
    this.broadcast({ event: 'unblocked', key });
    
    return this.jsonResponse({ unblocked: existed, key });
  }

  addToBlocklist(key, reason, durationMs = null, severity = SEVERITY.MEDIUM) {
    this.blocklist.set(key, {
      reason,
      severity,
      blockedAt: Date.now(),
      expiresAt: durationMs ? Date.now() + durationMs : null,
    });
  }

  // ─── Threat Reporting ───────────────────────────────────────────────────────
  async handleReportThreat(request) {
    const threat = await request.json();
    
    this.logThreat({
      ...threat,
      timestamp: threat.timestamp || Date.now(),
      reported: true,
    });
    
    // Auto-block on critical threats
    if (threat.severity >= SEVERITY.CRITICAL && threat.source) {
      this.addToBlocklist(threat.source, threat.type || 'reported_critical', 3600000);
    }
    
    // Strengthen Hebbian link
    if (threat.source && threat.action) {
      this.strengthenHebbianLink(threat.source, threat.action, threat.severity || 1);
    }
    
    await this.persistAll();
    this.broadcast({ event: 'threat_reported', threat });
    
    return this.jsonResponse({ reported: true, threatId: this.threatLog.length });
  }

  logThreat(threat) {
    this.threatLog.push(threat);
    if (this.threatLog.length > 1000) {
      this.threatLog.shift();
    }
    
    this.metrics.totalThreats++;
    this.metrics.cumulativeThreatScore += threat.threatScore || threat.severity || 1;
  }

  async handleGetThreats(request) {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const minSeverity = parseInt(url.searchParams.get('minSeverity') || '0');
    
    let threats = this.threatLog;
    if (minSeverity > 0) {
      threats = threats.filter(t => (t.severity || 0) >= minSeverity);
    }
    
    return this.jsonResponse({
      threats: threats.slice(-limit).reverse(),
      total: this.threatLog.length,
    });
  }

  // ─── Honeypot Integration (Ghost Layer) ─────────────────────────────────────
  async handleHoneypotTrigger(request) {
    const { source, originalTarget, honeypotId = 'default' } = await request.json();
    
    // Log honeypot activation
    this.logThreat({
      source,
      type: 'honeypot_triggered',
      severity: SEVERITY.MEDIUM,
      honeypotId,
      originalTarget,
      timestamp: Date.now(),
    });
    
    // Strengthen association
    this.strengthenHebbianLink(source, 'honeypot_visit', 2);
    
    this.metrics.totalHoneypotRedirects++;
    await this.persistAll();
    
    return this.jsonResponse({
      triggered: true,
      honeypotId,
      message: 'Ghost layer activated — attacker redirected to honeypot',
    });
  }

  // ─── Phantom Stealth Mode ───────────────────────────────────────────────────
  async handlePhantomActivate(request) {
    const { source, stealthMode = 'standard', duration = 60000 } = await request.json();
    
    // Phantom modes:
    // - standard: Basic traffic obscuring
    // - cloaked: Full encryption + routing obfuscation
    // - spectral: Decoy traffic injection
    // - polymorphic: Dynamic response variation
    
    const phantomSession = {
      id: `phantom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      source,
      stealthMode,
      activatedAt: Date.now(),
      expiresAt: Date.now() + duration,
    };
    
    // Store phantom session
    await this.storage.put(`phantom:${phantomSession.id}`, phantomSession);
    
    this.metrics.totalPhantomActivations++;
    this.broadcast({ event: 'phantom_activated', session: phantomSession });
    
    return this.jsonResponse({
      activated: true,
      session: phantomSession,
      message: `Phantom ${stealthMode} mode activated for ${duration}ms`,
    });
  }

  // ─── Anomaly Detection ──────────────────────────────────────────────────────
  async handleAnomalyTrain(request) {
    const { metric, value } = await request.json();
    
    if (!metric || value === undefined) {
      return this.jsonResponse({ error: 'metric and value required' }, 400);
    }
    
    let baseline = this.anomalyBaseline.get(metric);
    if (!baseline) {
      baseline = { mean: 0, variance: 0, samples: 0 };
      this.anomalyBaseline.set(metric, baseline);
    }
    
    // Welford's online algorithm for mean and variance
    baseline.samples++;
    const delta = value - baseline.mean;
    baseline.mean += delta / baseline.samples;
    const delta2 = value - baseline.mean;
    baseline.variance += delta * delta2;
    
    await this.persistAll();
    
    return this.jsonResponse({
      trained: true,
      metric,
      mean: parseFloat(baseline.mean.toFixed(4)),
      stddev: parseFloat(Math.sqrt(baseline.variance / Math.max(1, baseline.samples)).toFixed(4)),
      samples: baseline.samples,
    });
  }

  async handleAnomalyDetect(request) {
    const { metric, value } = await request.json();
    
    const score = this.detectAnomaly(metric, value);
    const isAnomaly = score > 2;  // 2 standard deviations
    
    if (isAnomaly) {
      this.logThreat({
        type: THREAT_TYPES.ANOMALY,
        metric,
        value,
        score,
        severity: Math.min(SEVERITY.CRITICAL, Math.floor(score)),
        timestamp: Date.now(),
      });
    }
    
    return this.jsonResponse({
      metric,
      value,
      score: parseFloat(score.toFixed(4)),
      isAnomaly,
      threshold: 2,
    });
  }

  detectAnomaly(metric, value) {
    const baseline = this.anomalyBaseline.get(metric);
    if (!baseline || baseline.samples < 10) {
      return 0;  // Not enough data
    }
    
    const stddev = Math.sqrt(baseline.variance / baseline.samples);
    if (stddev === 0) return 0;
    
    return Math.abs(value - baseline.mean) / stddev;
  }

  // ─── Hebbian Threat Learning ────────────────────────────────────────────────
  async handleHebbianStrengthen(request) {
    const { source, pattern, strength = 1 } = await request.json();
    
    if (!source || !pattern) {
      return this.jsonResponse({ error: 'source and pattern required' }, 400);
    }
    
    const newWeight = this.strengthenHebbianLink(source, pattern, strength);
    await this.persistAll();
    
    return this.jsonResponse({
      strengthened: true,
      link: `${source}->${pattern}`,
      weight: parseFloat(newWeight.toFixed(4)),
    });
  }

  strengthenHebbianLink(source, pattern, strength) {
    const key = `${source}->${pattern}`;
    const current = this.hebbianThreatLinks.get(key) || 0;
    const newWeight = Math.min(PHI * PHI, current + (strength * PHI * 0.1));
    this.hebbianThreatLinks.set(key, newWeight);
    return newWeight;
  }

  // ─── Heartbeat ──────────────────────────────────────────────────────────────
  async handleHeartbeat() {
    const now = Date.now();
    const delta = now - this.metrics.lastHeartbeat;
    this.metrics.lastHeartbeat = now;
    
    // Clean up expired blocklist entries
    for (const [key, entry] of this.blocklist) {
      if (entry.expiresAt && now > entry.expiresAt) {
        this.blocklist.delete(key);
      }
    }
    
    // Decay old rate limiters
    for (const [key, limiter] of this.rateLimiters) {
      if (now - limiter.lastRefill > limiter.windowMs * 10) {
        this.rateLimiters.delete(key);
      }
    }
    
    // Decay Hebbian links (forgetting)
    for (const [key, weight] of this.hebbianThreatLinks) {
      const newWeight = weight * PHI_INV;
      if (newWeight < 0.01) {
        this.hebbianThreatLinks.delete(key);
      } else {
        this.hebbianThreatLinks.set(key, newWeight);
      }
    }
    
    await this.persistAll();
    this.broadcast({ event: 'heartbeat', delta, timestamp: now });
    
    return this.jsonResponse({
      heartbeat: true,
      delta,
      blocklist: this.blocklist.size,
      rateLimiters: this.rateLimiters.size,
      hebbianLinks: this.hebbianThreatLinks.size,
      threats: this.threatLog.length,
      metrics: this.metrics,
    });
  }

  // ─── State ──────────────────────────────────────────────────────────────────
  async handleGetState() {
    return this.jsonResponse({
      objectType: 'WraithGuard',
      version: '1.0.0',
      securityLayers: ['wraith', 'ghost', 'phantom'],
      blocklist: this.blocklist.size,
      rateLimiters: this.rateLimiters.size,
      anomalyMetrics: this.anomalyBaseline.size,
      hebbianLinks: this.hebbianThreatLinks.size,
      recentThreats: this.threatLog.length,
      metrics: this.metrics,
      severityLevels: SEVERITY,
      threatTypes: THREAT_TYPES,
      actions: ACTIONS,
      phi: PHI,
    });
  }

  // ─── WebSocket ──────────────────────────────────────────────────────────────
  handleWebSocket(request) {
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    
    this.state.acceptWebSocket(server);
    this.websockets.add(server);
    
    server.addEventListener('message', async (event) => {
      try {
        const msg = JSON.parse(event.data);
        
        if (msg.action === 'check') {
          const result = await this.handleCheck({ json: async () => msg });
          server.send(JSON.stringify(await result.json()));
        } else if (msg.action === 'report') {
          const result = await this.handleReportThreat({ json: async () => msg });
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
      blocklist: Object.fromEntries(this.blocklist),
      anomalyBaseline: Object.fromEntries(this.anomalyBaseline),
      hebbianThreatLinks: Object.fromEntries(this.hebbianThreatLinks),
      metrics: this.metrics,
    });
  }
}

export { SEVERITY, THREAT_TYPES, ACTIONS };
export default WraithGuard;
