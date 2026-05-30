const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

describe('CyberDefenseProtocol', () => {
  let CyberDefenseProtocol, ThreatIndicator, AttackSurfaceEntry, THREAT_LEVELS, THREAT_PATTERNS, SURFACE_CATEGORIES;
  let protocol;
  const PHI = 1.618033988749895;
  const PHI_INV = 1 / PHI;

  beforeEach(async () => {
    const module = await import('../../protocols/cyber-defense-protocol.js');
    CyberDefenseProtocol = module.CyberDefenseProtocol;
    ThreatIndicator = module.ThreatIndicator;
    AttackSurfaceEntry = module.AttackSurfaceEntry;
    THREAT_LEVELS = module.THREAT_LEVELS;
    THREAT_PATTERNS = module.THREAT_PATTERNS;
    SURFACE_CATEGORIES = module.SURFACE_CATEGORIES;
    protocol = new CyberDefenseProtocol();
  });

  describe('THREAT_LEVELS export', () => {
    it('should have INFO level', () => { assert.ok(THREAT_LEVELS.INFO); });
    it('should have LOW level', () => { assert.ok(THREAT_LEVELS.LOW); });
    it('should have MEDIUM level', () => { assert.ok(THREAT_LEVELS.MEDIUM); });
    it('should have HIGH level', () => { assert.ok(THREAT_LEVELS.HIGH); });
    it('should have CRITICAL level', () => { assert.ok(THREAT_LEVELS.CRITICAL); });
    it('should have INFO min 0', () => { assert.equal(THREAT_LEVELS.INFO.min, 0); });
    it('should have INFO max 0.2', () => { assert.equal(THREAT_LEVELS.INFO.max, 0.2); });
    it('should have CRITICAL min 0.9', () => { assert.equal(THREAT_LEVELS.CRITICAL.min, 0.9); });
    it('should have MEDIUM max as PHI_INV', () => { assert.ok(Math.abs(THREAT_LEVELS.MEDIUM.max - PHI_INV) < 0.001); });
  });

  describe('SURFACE_CATEGORIES export', () => {
    it('should have API', () => { assert.equal(SURFACE_CATEGORIES.API, 'api'); });
    it('should have EXTENSION', () => { assert.equal(SURFACE_CATEGORIES.EXTENSION, 'extension'); });
    it('should have SDK', () => { assert.equal(SURFACE_CATEGORIES.SDK, 'sdk'); });
    it('should have PROTOCOL', () => { assert.equal(SURFACE_CATEGORIES.PROTOCOL, 'protocol'); });
    it('should have DEPLOYMENT', () => { assert.equal(SURFACE_CATEGORIES.DEPLOYMENT, 'deployment'); });
    it('should have AUTH', () => { assert.equal(SURFACE_CATEGORIES.AUTH, 'auth'); });
    it('should have STORAGE', () => { assert.equal(SURFACE_CATEGORIES.STORAGE, 'storage'); });
    it('should have NETWORK', () => { assert.equal(SURFACE_CATEGORIES.NETWORK, 'network'); });
  });

  describe('THREAT_PATTERNS export', () => {
    it('should be an array', () => { assert.ok(Array.isArray(THREAT_PATTERNS)); });
    it('should have hardcoded-secret pattern', () => { assert.ok(THREAT_PATTERNS.find(p => p.name === 'hardcoded-secret')); });
    it('should have eval-usage pattern', () => { assert.ok(THREAT_PATTERNS.find(p => p.name === 'eval-usage')); });
    it('should have dangerouslySetHTML pattern', () => { assert.ok(THREAT_PATTERNS.find(p => p.name === 'dangerouslySetHTML')); });
    it('should have prototype-pollution pattern', () => { assert.ok(THREAT_PATTERNS.find(p => p.name === 'prototype-pollution')); });
    it('should have command-injection pattern', () => { assert.ok(THREAT_PATTERNS.find(p => p.name === 'command-injection')); });
  });

  describe('ThreatIndicator', () => {
    it('should create with required fields', () => {
      const ti = new ThreatIndicator({ name: 'test', severity: 0.5, file: 'a.js', line: 1, pattern: 'x' });
      assert.equal(ti.name, 'test');
      assert.equal(ti.severity, 0.5);
    });
    it('should generate unique id', () => {
      const ti = new ThreatIndicator({ name: 'test', severity: 0.5, file: 'a.js', line: 1, pattern: 'x' });
      assert.ok(ti.id.startsWith('threat-'));
    });
    it('should set detectedAt', () => {
      const ti = new ThreatIndicator({ name: 'test', severity: 0.5, file: 'a.js', line: 1, pattern: 'x' });
      assert.ok(ti.detectedAt <= Date.now());
    });
    it('should default mitigated to false', () => {
      const ti = new ThreatIndicator({ name: 'test', severity: 0.5, file: 'a.js', line: 1, pattern: 'x' });
      assert.equal(ti.mitigated, false);
    });
    it('should compute level from severity', () => {
      const ti = new ThreatIndicator({ name: 'test', severity: 0.95, file: 'a.js', line: 1, pattern: 'x' });
      assert.equal(ti.level.label, 'CRITICAL');
    });
    it('should mitigate threat', () => {
      const ti = new ThreatIndicator({ name: 'test', severity: 0.5, file: 'a.js', line: 1, pattern: 'x' });
      ti.mitigate('fixed');
      assert.equal(ti.mitigated, true);
      assert.ok(ti.mitigatedAt);
    });
    it('should generate report', () => {
      const ti = new ThreatIndicator({ name: 'test', severity: 0.5, file: 'a.js', line: 1, pattern: 'x' });
      const report = ti.toReport();
      assert.ok(report.id);
      assert.equal(report.name, 'test');
    });
  });

  describe('AttackSurfaceEntry', () => {
    it('should create entry', () => {
      const e = new AttackSurfaceEntry({ id: 'e1', category: 'api', name: 'Test' });
      assert.equal(e.id, 'e1');
      assert.equal(e.category, 'api');
    });
    it('should compute risk score', () => {
      const e = new AttackSurfaceEntry({ id: 'e1', category: 'api', name: 'Test', exposed: true });
      assert.ok(e.riskScore >= 0.3);
    });
    it('should increase risk with wildcard permissions', () => {
      const e = new AttackSurfaceEntry({ id: 'e1', category: 'api', name: 'Test', permissions: ['*'] });
      assert.ok(e.riskScore >= 0.4);
    });
    it('should increase risk with http URL', () => {
      const e = new AttackSurfaceEntry({ id: 'e1', category: 'api', name: 'Test', url: 'http://example.com' });
      assert.ok(e.riskScore >= 0.2);
    });
    it('should cap risk at 1.0', () => {
      const e = new AttackSurfaceEntry({ id: 'e1', category: 'api', name: 'Test', exposed: true, permissions: ['*', 'a', 'b', 'c', 'd', 'e', 'f'], url: 'http://x.com' });
      assert.ok(e.riskScore <= 1.0);
    });
  });

  describe('CyberDefenseProtocol constructor', () => {
    it('should initialize empty threats', () => { assert.deepEqual(protocol.threats, []); });
    it('should initialize empty attackSurface', () => { assert.deepEqual(protocol.attackSurface, []); });
    it('should initialize empty incidents', () => { assert.deepEqual(protocol.incidents, []); });
    it('should initialize empty threatIntelFeed', () => { assert.deepEqual(protocol.threatIntelFeed, []); });
    it('should initialize posture with score 100', () => { assert.equal(protocol.posture.overallScore, 100); });
    it('should initialize ticks to 0', () => { assert.equal(protocol.ticks, 0); });
  });

  describe('scanContent()', () => {
    it('should detect eval usage', () => {
      const indicators = protocol.scanContent('test.js', 'eval(x)');
      assert.ok(indicators.length > 0);
    });
    it('should detect hardcoded secrets', () => {
      const indicators = protocol.scanContent('test.js', 'password = "secretpass123"');
      assert.ok(indicators.some(i => i.name === 'hardcoded-secret'));
    });
    it('should detect dangerouslySetInnerHTML', () => {
      const indicators = protocol.scanContent('test.js', 'dangerouslySetInnerHTML={html}');
      assert.ok(indicators.some(i => i.name === 'dangerouslySetHTML'));
    });
    it('should return empty for clean code', () => {
      const indicators = protocol.scanContent('test.js', 'const x = 1;');
      assert.equal(indicators.length, 0);
    });
    it('should include file path in indicator', () => {
      const indicators = protocol.scanContent('src/app.js', 'eval(x)');
      assert.equal(indicators[0].file, 'src/app.js');
    });
    it('should include line number', () => {
      const indicators = protocol.scanContent('test.js', 'line1\neval(x)\nline3');
      assert.equal(indicators[0].line, 2);
    });
    it('should add to threats array', () => {
      protocol.scanContent('test.js', 'eval(x)');
      assert.ok(protocol.threats.length > 0);
    });
    it('should update posture threatCount', () => {
      protocol.scanContent('test.js', 'eval(x)');
      assert.ok(protocol.posture.threatCount > 0);
    });
    it('should update lastScanAt', () => {
      protocol.scanContent('test.js', 'const x = 1;');
      assert.ok(protocol.posture.lastScanAt);
    });
  });

  describe('registerSurface()', () => {
    it('should add entry to attackSurface', () => {
      protocol.registerSurface({ id: 's1', category: 'api', name: 'API' });
      assert.equal(protocol.attackSurface.length, 1);
    });
    it('should return AttackSurfaceEntry', () => {
      const entry = protocol.registerSurface({ id: 's1', category: 'api', name: 'API' });
      assert.ok(entry instanceof AttackSurfaceEntry);
    });
    it('should update surfaceEntries count', () => {
      protocol.registerSurface({ id: 's1', category: 'api', name: 'API' });
      assert.equal(protocol.posture.surfaceEntries, 1);
    });
  });

  describe('getAttackSurface()', () => {
    it('should return categorized surface', () => {
      protocol.registerSurface({ id: 's1', category: 'api', name: 'API' });
      const surface = protocol.getAttackSurface();
      assert.ok(surface.api);
      assert.equal(surface.api.length, 1);
    });
  });

  describe('computeDefenseMatrix()', () => {
    it('should return matrix object', () => {
      const matrix = protocol.computeDefenseMatrix();
      assert.ok(matrix);
    });
    it('should include codeSecurity', () => {
      const matrix = protocol.computeDefenseMatrix();
      assert.ok('codeSecurity' in matrix);
    });
    it('should include aggregate score', () => {
      const matrix = protocol.computeDefenseMatrix();
      assert.ok('aggregate' in matrix);
    });
    it('should return 100 with no threats', () => {
      const matrix = protocol.computeDefenseMatrix();
      assert.equal(matrix.codeSecurity, 100);
    });
  });

  describe('createIncident()', () => {
    it('should create incident from threats', () => {
      const ti = new ThreatIndicator({ name: 'test', severity: 0.5, file: 'a.js', line: 1, pattern: 'x' });
      const incident = protocol.createIncident([ti]);
      assert.ok(incident.id.startsWith('incident-'));
    });
    it('should calculate average severity', () => {
      const t1 = new ThreatIndicator({ name: 'a', severity: 0.4, file: 'a.js', line: 1, pattern: 'x' });
      const t2 = new ThreatIndicator({ name: 'b', severity: 0.6, file: 'a.js', line: 1, pattern: 'x' });
      const incident = protocol.createIncident([t1, t2]);
      assert.equal(incident.severity, 0.5);
    });
    it('should add to incidents array', () => {
      const ti = new ThreatIndicator({ name: 'test', severity: 0.5, file: 'a.js', line: 1, pattern: 'x' });
      protocol.createIncident([ti]);
      assert.equal(protocol.incidents.length, 1);
    });
  });

  describe('mitigate()', () => {
    it('should mitigate threat by id', () => {
      protocol.scanContent('test.js', 'eval(x)');
      const threatId = protocol.threats[0].id;
      const result = protocol.mitigate(threatId);
      assert.equal(result, true);
      assert.equal(protocol.threats[0].mitigated, true);
    });
    it('should return false for unknown threat', () => {
      const result = protocol.mitigate('unknown');
      assert.equal(result, false);
    });
    it('should increment mitigatedCount', () => {
      protocol.scanContent('test.js', 'eval(x)');
      protocol.mitigate(protocol.threats[0].id);
      assert.equal(protocol.posture.mitigatedCount, 1);
    });
  });

  describe('ingestThreatIntel()', () => {
    it('should add intel to feed', () => {
      protocol.ingestThreatIntel({ type: 'malware', severity: 0.8 });
      assert.equal(protocol.threatIntelFeed.length, 1);
    });
    it('should add receivedAt timestamp', () => {
      protocol.ingestThreatIntel({ type: 'malware' });
      assert.ok(protocol.threatIntelFeed[0].receivedAt);
    });
    it('should limit feed to 1000', () => {
      for (let i = 0; i < 1100; i++) protocol.ingestThreatIntel({ i });
      assert.equal(protocol.threatIntelFeed.length, 1000);
    });
  });

  describe('tick()', () => {
    it('should increment ticks', () => {
      protocol.tick();
      protocol.tick();
      assert.equal(protocol.ticks, 2);
    });
  });

  describe('getState()', () => {
    it('should return state object', () => {
      const state = protocol.getState();
      assert.ok(state.posture);
      assert.ok(state.defenseMatrix);
    });
    it('should include recentThreats', () => {
      const state = protocol.getState();
      assert.ok(Array.isArray(state.recentThreats));
    });
    it('should include openIncidents count', () => {
      const state = protocol.getState();
      assert.ok('openIncidents' in state);
    });
  });

  describe('integration', () => {
    it('should track security posture degradation', () => {
      const initialScore = protocol.posture.overallScore;
      protocol.scanContent('test.js', 'eval(x)\neval(y)\npassword = "secret123456"');
      assert.ok(protocol.posture.overallScore < initialScore);
    });
    it('should improve posture after mitigation', () => {
      protocol.scanContent('test.js', 'eval(x)');
      const beforeMitigation = protocol.computeDefenseMatrix().aggregate;
      protocol.mitigate(protocol.threats[0].id);
      const afterMitigation = protocol.computeDefenseMatrix().aggregate;
      assert.ok(afterMitigation >= beforeMitigation);
    });
  });
});
