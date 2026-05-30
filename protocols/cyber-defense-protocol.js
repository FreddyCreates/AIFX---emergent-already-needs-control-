/**
 * PROTO-225: Cyber Defense Protocol (CDP)
 * Threat intelligence, attack surface mapping, and defense/offense matrix.
 *
 * Implements a full cyber defense stack inside the organism:
 *   1. THREAT SCANNER — detects threat indicators in code and configs
 *   2. ATTACK SURFACE MAP — inventories all public-facing entry points
 *   3. DEFENSE MATRIX — evaluates and scores security posture
 *   4. INCIDENT ENGINE — manages active incidents and response playbooks
 *   5. THREAT INTEL FEED — aggregates threat signals across the fleet
 *
 * Threat levels (phi-scaled):
 *   INFO (< 0.2) → LOW (0.2–0.4) → MEDIUM (0.4–0.618) →
 *   HIGH (0.618–0.9) → CRITICAL (> 0.9)
 *
 * @module protocols/cyber-defense-protocol
 * @version 1.0.0
 */

const PHI     = 1.618033988749895;
const PHI_INV = 1 / PHI;
const HEARTBEAT = 873;

// Threat level thresholds (phi-based)
const THREAT_LEVELS = {
  INFO:     { min: 0,       max: 0.2,    label: 'INFO',     color: '🟢' },
  LOW:      { min: 0.2,     max: 0.4,    label: 'LOW',      color: '🟡' },
  MEDIUM:   { min: 0.4,     max: PHI_INV, label: 'MEDIUM',  color: '🟠' },
  HIGH:     { min: PHI_INV, max: 0.9,    label: 'HIGH',     color: '🔴' },
  CRITICAL: { min: 0.9,     max: 1.0,    label: 'CRITICAL', color: '🚨' },
};

// Attack surface categories
const SURFACE_CATEGORIES = {
  API:        'api',
  EXTENSION:  'extension',
  SDK:        'sdk',
  PROTOCOL:   'protocol',
  DEPLOYMENT: 'deployment',
  AUTH:       'auth',
  STORAGE:    'storage',
  NETWORK:    'network',
};

// Threat indicator patterns (simplified static analysis)
const THREAT_PATTERNS = [
  { name: 'hardcoded-secret',    pattern: /(?:password|secret|token|key)\s*=\s*['"][^'"]{8,}['"]/gi, severity: 0.9 },
  { name: 'eval-usage',          pattern: /\beval\s*\(/g,                                              severity: 0.7 },
  { name: 'dangerouslySetHTML',  pattern: /dangerouslySetInnerHTML/g,                                 severity: 0.6 },
  { name: 'prototype-pollution', pattern: /\.__proto__\s*=/g,                                         severity: 0.8 },
  { name: 'command-injection',   pattern: /exec\s*\([^)]*\+/g,                                        severity: 0.75 },
  { name: 'path-traversal',      pattern: /\.\.\//g,                                                  severity: 0.4 },
  { name: 'weak-crypto',         pattern: /(?:md5|sha1)\s*\(/gi,                                      severity: 0.5 },
  { name: 'insecure-random',     pattern: /Math\.random\(\)/g,                                        severity: 0.3 },
  { name: 'debug-in-prod',       pattern: /console\.(log|debug|info)\s*\(/g,                          severity: 0.1 },
  { name: 'http-not-https',      pattern: /http:\/\/(?!localhost)/g,                                  severity: 0.35 },
];

class ThreatIndicator {
  constructor({ name, severity, file, line, pattern, context = '' }) {
    this.id       = `threat-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    this.name     = name;
    this.severity = severity;
    this.file     = file;
    this.line     = line;
    this.pattern  = pattern;
    this.context  = context;
    this.detectedAt = Date.now();
    this.mitigated  = false;
    this.mitigatedAt = null;
  }

  get level() {
    for (const [, info] of Object.entries(THREAT_LEVELS)) {
      if (this.severity >= info.min && this.severity < info.max) return info;
    }
    return THREAT_LEVELS.INFO;
  }

  mitigate(note = '') {
    this.mitigated   = true;
    this.mitigatedAt = Date.now();
    this.mitigationNote = note;
  }

  toReport() {
    return {
      id:       this.id,
      name:     this.name,
      severity: parseFloat(this.severity.toFixed(3)),
      level:    this.level.label,
      color:    this.level.color,
      file:     this.file,
      line:     this.line,
      mitigated: this.mitigated,
    };
  }
}

class AttackSurfaceEntry {
  constructor({ id, category, name, url = null, permissions = [], exposed = true }) {
    this.id          = id;
    this.category    = category;
    this.name        = name;
    this.url         = url;
    this.permissions = permissions;
    this.exposed     = exposed;
    this.riskScore   = this._computeRisk();
  }

  _computeRisk() {
    let risk = 0;
    if (this.exposed)                   risk += 0.3;
    if (this.permissions.length > 5)    risk += 0.2;
    if (this.permissions.includes('*')) risk += 0.4;
    if (this.url && this.url.startsWith('http://')) risk += 0.2;
    return Math.min(1.0, parseFloat(risk.toFixed(3)));
  }
}

class CyberDefenseProtocol {
  constructor() {
    this.threats        = [];
    this.attackSurface  = [];
    this.incidents      = [];
    this.threatIntelFeed = [];

    this.posture = {
      overallScore:    100,  // 0–100, higher = more secure
      threatCount:     0,
      criticalCount:   0,
      surfaceEntries:  0,
      mitigatedCount:  0,
      lastScanAt:      null,
    };

    this.ticks = 0;
  }

  // ── Threat Scanning ────────────────────────────────────────────────────

  /**
   * Scan file content for threat indicators
   * @param {string} filePath - Path to the file being scanned
   * @param {string} content  - File content
   * @returns {ThreatIndicator[]} - Found indicators
   */
  scanContent(filePath, content) {
    const indicators = [];
    const lines = content.split('\n');

    for (const threatPattern of THREAT_PATTERNS) {
      let match;
      const regex = new RegExp(threatPattern.pattern.source, threatPattern.pattern.flags);

      for (let i = 0; i < lines.length; i++) {
        while ((match = regex.exec(lines[i])) !== null) {
          const indicator = new ThreatIndicator({
            name:     threatPattern.name,
            severity: threatPattern.severity,
            file:     filePath,
            line:     i + 1,
            pattern:  match[0].slice(0, 60),
            context:  lines[i].trim().slice(0, 100),
          });
          indicators.push(indicator);
          this.threats.push(indicator);
          this.posture.threatCount++;
          if (indicator.severity >= 0.9) this.posture.criticalCount++;
        }
      }
    }

    this.posture.lastScanAt = Date.now();
    this._updatePosture();
    return indicators;
  }

  // ── Attack Surface ─────────────────────────────────────────────────────

  /**
   * Register an attack surface entry
   */
  registerSurface(entry) {
    const surfaceEntry = new AttackSurfaceEntry(entry);
    this.attackSurface.push(surfaceEntry);
    this.posture.surfaceEntries++;
    this._updatePosture();
    return surfaceEntry;
  }

  /**
   * Get the full attack surface map
   */
  getAttackSurface() {
    const byCategory = {};
    for (const cat of Object.values(SURFACE_CATEGORIES)) byCategory[cat] = [];
    for (const entry of this.attackSurface) {
      if (byCategory[entry.category]) byCategory[entry.category].push(entry);
    }
    return byCategory;
  }

  // ── Defense Matrix ─────────────────────────────────────────────────────

  /**
   * Compute the current defense matrix score
   * Returns a matrix of security domains and their scores
   */
  computeDefenseMatrix() {
    const matrix = {
      codeSecurity:    this._scoreCodeSecurity(),
      surfaceSecurity: this._scoreSurfaceSecurity(),
      threatPosture:   this._scoreThreatPosture(),
      mitigation:      this._scoreMitigation(),
    };

    // Phi-weighted aggregate
    matrix.aggregate = parseFloat(
      (Object.values(matrix).reduce((s, v) => s + v, 0) / Object.keys(matrix).length).toFixed(1)
    );

    return matrix;
  }

  _scoreCodeSecurity() {
    if (this.threats.length === 0) return 100;
    const unmitigated = this.threats.filter(t => !t.mitigated);
    const avgSeverity = unmitigated.reduce((s, t) => s + t.severity, 0) / (unmitigated.length || 1);
    return Math.max(0, Math.round((1 - avgSeverity) * 100));
  }

  _scoreSurfaceSecurity() {
    if (this.attackSurface.length === 0) return 100;
    const avgRisk = this.attackSurface.reduce((s, e) => s + e.riskScore, 0) / this.attackSurface.length;
    return Math.max(0, Math.round((1 - avgRisk) * 100));
  }

  _scoreThreatPosture() {
    const criticalPenalty = this.posture.criticalCount * 15;
    const highPenalty = this.threats.filter(t => t.severity >= PHI_INV && !t.mitigated).length * 5;
    return Math.max(0, 100 - criticalPenalty - highPenalty);
  }

  _scoreMitigation() {
    if (this.threats.length === 0) return 100;
    return Math.round((this.posture.mitigatedCount / this.threats.length) * 100);
  }

  // ── Incident Engine ────────────────────────────────────────────────────

  /**
   * Create an incident from a set of threat indicators
   */
  createIncident(threats, playbook = 'default') {
    const severity = threats.reduce((s, t) => s + t.severity, 0) / threats.length;
    const incident = {
      id:         `incident-${Date.now().toString(36)}`,
      severity,
      level:      this._getLevel(severity),
      threats:    threats.map(t => t.id),
      playbook,
      createdAt:  Date.now(),
      status:     'open',
      timeline:   [{ event: 'created', at: Date.now() }],
    };
    this.incidents.push(incident);
    return incident;
  }

  /**
   * Mitigate a specific threat
   */
  mitigate(threatId, note = '') {
    const threat = this.threats.find(t => t.id === threatId);
    if (!threat) return false;
    threat.mitigate(note);
    this.posture.mitigatedCount++;
    this._updatePosture();
    return true;
  }

  // ── Threat Intel ──────────────────────────────────────────────────────

  /**
   * Ingest a threat intelligence signal from external sources
   */
  ingestThreatIntel(intel) {
    this.threatIntelFeed.push({
      ...intel,
      receivedAt: Date.now(),
    });
    if (this.threatIntelFeed.length > 1000) this.threatIntelFeed.shift();
  }

  // ── Utilities ─────────────────────────────────────────────────────────

  _getLevel(severity) {
    for (const [name, info] of Object.entries(THREAT_LEVELS)) {
      if (severity >= info.min && severity < info.max) return name;
    }
    return 'CRITICAL';
  }

  _updatePosture() {
    const matrix = this.computeDefenseMatrix();
    this.posture.overallScore = matrix.aggregate;
  }

  tick() { this.ticks++; }

  getState() {
    return {
      posture:        { ...this.posture },
      defenseMatrix:  this.computeDefenseMatrix(),
      recentThreats:  this.threats.slice(-20).map(t => t.toReport()),
      attackSurface:  this.getAttackSurface(),
      openIncidents:  this.incidents.filter(i => i.status === 'open').length,
      ticks:          this.ticks,
    };
  }
}

export { CyberDefenseProtocol, ThreatIndicator, AttackSurfaceEntry, THREAT_LEVELS, THREAT_PATTERNS, SURFACE_CATEGORIES };
export default CyberDefenseProtocol;
