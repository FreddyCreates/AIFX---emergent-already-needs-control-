const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CplLEngine = require('../../sdk/governance/cpl-l-engine.js');
const { AtlasMemory } = require('../../sdk/governance/atlas-memory.js');

describe('CplLEngine', () => {
  let engine;
  let tmpLawFile;

  beforeEach(() => {
    // Create a temporary law file for testing
    tmpLawFile = path.join(os.tmpdir(), `test-law-${Date.now()}.cpl-l`);
    const lawContent = `
id: "TEST_LAW"
subjects:
  - id: "atlas://bot/test-bot"
    rules:
      - name: "HIGH_RISK_FORBID"
        when: 'context.risk_score > 0.7'
        then:
          - action: "FORBID"
            target: "release"
            reason: "High risk score detected"
      - name: "REQUIRE_REVIEW"
        when: 'context.needs_review === true'
        then:
          - action: "REQUIRE"
            target: "human_review"
            arg: "security_team"
      - name: "ESCALATE_CRITICAL"
        when: 'context.severity === "critical"'
        then:
          - action: "ESCALATE"
            target: "security_lead"
            reason: "Critical issue requires escalation"
`;
    fs.writeFileSync(tmpLawFile, lawContent);
    engine = new CplLEngine(tmpLawFile);
  });

  afterEach(() => {
    if (fs.existsSync(tmpLawFile)) {
      fs.unlinkSync(tmpLawFile);
    }
  });

  describe('_parseLaws()', () => {
    it('should parse subject IDs from law file', () => {
      const subjects = engine._loadSubjects();
      const ids = engine.subjects();
      assert.ok(ids.includes('atlas://bot/test-bot'), 'Should find test-bot subject');
    });

    it('should parse rule names', () => {
      engine._loadSubjects();
      const rules = engine.rulesFor('atlas://bot/test-bot');
      const ruleNames = rules.map(r => r.name);
      assert.ok(ruleNames.includes('HIGH_RISK_FORBID'));
      assert.ok(ruleNames.includes('REQUIRE_REVIEW'));
      assert.ok(ruleNames.includes('ESCALATE_CRITICAL'));
    });

    it('should parse when conditions', () => {
      engine._loadSubjects();
      const rules = engine.rulesFor('atlas://bot/test-bot');
      const forbidRule = rules.find(r => r.name === 'HIGH_RISK_FORBID');
      assert.ok(forbidRule.when.includes('risk_score'));
    });

    it('should parse then actions', () => {
      engine._loadSubjects();
      const rules = engine.rulesFor('atlas://bot/test-bot');
      const forbidRule = rules.find(r => r.name === 'HIGH_RISK_FORBID');
      assert.ok(forbidRule.then.length > 0);
      assert.equal(forbidRule.then[0].action, 'FORBID');
    });
  });

  describe('_evalCondition()', () => {
    it('should evaluate simple boolean expressions', () => {
      const result = engine._evalCondition('context.risk_score > 0.5', {}, {}, { risk_score: 0.8 });
      assert.equal(result, true);
    });

    it('should return false for non-matching conditions', () => {
      const result = engine._evalCondition('context.risk_score > 0.5', {}, {}, { risk_score: 0.3 });
      assert.equal(result, false);
    });

    it('should handle entity fields', () => {
      const result = engine._evalCondition(
        'entity.division === "Security"',
        { division: 'Security' },
        {},
        {}
      );
      assert.equal(result, true);
    });

    it('should handle null conditions gracefully', () => {
      const result = engine._evalCondition(null, {}, {}, {});
      assert.equal(result, false);
    });

    it('should handle malformed expressions gracefully', () => {
      const result = engine._evalCondition('this is not valid javascript {{}}', {}, {}, {});
      assert.equal(result, false);
    });
  });

  describe('apply()', () => {
    it('should return blocked=true when FORBID rule triggers', () => {
      const result = engine.apply(
        'atlas://bot/test-bot',
        {},
        {},
        { risk_score: 0.9 }
      );
      assert.equal(result.blocked, true);
      assert.ok(result.decisions.some(d => d.action === 'FORBID'));
    });

    it('should return blocked=false when no FORBID rule triggers', () => {
      const result = engine.apply(
        'atlas://bot/test-bot',
        {},
        {},
        { risk_score: 0.3 }
      );
      assert.equal(result.blocked, false);
    });

    it('should populate required array for REQUIRE actions', () => {
      const result = engine.apply(
        'atlas://bot/test-bot',
        {},
        {},
        { needs_review: true }
      );
      assert.ok(result.required.length > 0);
      assert.ok(result.required.some(r => r.target === 'human_review'));
    });

    it('should populate escalations array for ESCALATE actions', () => {
      const result = engine.apply(
        'atlas://bot/test-bot',
        {},
        {},
        { severity: 'critical' }
      );
      assert.ok(result.escalations.length > 0);
      assert.ok(result.escalations.some(e => e.target === 'security_lead'));
    });

    it('should return empty decisions for unknown entity', () => {
      const result = engine.apply(
        'atlas://bot/unknown-bot',
        {},
        {},
        { risk_score: 0.9 }
      );
      assert.equal(result.decisions.length, 0);
      assert.equal(result.blocked, false);
    });
  });

  describe('applyBatch()', () => {
    it('should process multiple events', () => {
      const events = [
        { id: 'evt-1', entity_id: 'atlas://bot/test-bot', op: 'release', context: { risk_score: 0.9 } },
        { id: 'evt-2', entity_id: 'atlas://bot/test-bot', op: 'deploy', context: { risk_score: 0.3 } },
      ];
      const results = engine.applyBatch(events);
      assert.equal(results.length, 2);
      assert.equal(results[0].blocked, true);
      assert.equal(results[1].blocked, false);
    });

    it('should include event_id in results', () => {
      const events = [
        { id: 'evt-123', entity_id: 'atlas://bot/test-bot', op: 'test', context: {} },
      ];
      const results = engine.applyBatch(events);
      assert.equal(results[0].event_id, 'evt-123');
    });
  });

  describe('subjects()', () => {
    it('should list all subject IDs', () => {
      const subjects = engine.subjects();
      assert.ok(Array.isArray(subjects));
      assert.ok(subjects.length > 0);
    });
  });

  describe('rulesFor()', () => {
    it('should return rules for known entity', () => {
      const rules = engine.rulesFor('atlas://bot/test-bot');
      assert.ok(Array.isArray(rules));
      assert.equal(rules.length, 3);
    });

    it('should return empty array for unknown entity', () => {
      const rules = engine.rulesFor('atlas://bot/unknown');
      assert.ok(Array.isArray(rules));
      assert.equal(rules.length, 0);
    });
  });
});

describe('Learning stability laws', () => {
  it('should not escalate when reward_signal is missing', () => {
    const lawPath = path.join(__dirname, '../../governance/laws/learning-stability.cpl-l');
    const engine = new CplLEngine(lawPath);

    const result = engine.apply(
      'atlas://bot/organism-learning-bot',
      {},
      {},
      {}
    );

    assert.equal(result.decisions.length, 0);
    assert.equal(result.blocked, false);
    assert.equal(result.escalations.length, 0);
  });

  it('should forbid and escalate when reward_signal is NaN', () => {
    const lawPath = path.join(__dirname, '../../governance/laws/learning-stability.cpl-l');
    const engine = new CplLEngine(lawPath);

    const result = engine.apply(
      'atlas://bot/organism-learning-bot',
      {},
      {},
      { reward_signal: NaN }
    );

    assert.ok(result.decisions.some(d => d.rule === 'HALT_ON_REWARD_DIVERGENCE' && d.action === 'FORBID'));
    assert.ok(result.decisions.some(d => d.rule === 'HALT_ON_REWARD_DIVERGENCE' && d.action === 'ESCALATE'));
    assert.equal(result.blocked, true);
    assert.ok(result.escalations.some(e => e.target === 'human://operator'));
  });
});

describe('AtlasMemory', () => {
  let memory;
  let tmpDir;

  beforeEach(() => {
    tmpDir = path.join(os.tmpdir(), `atlas-mem-test-${Date.now()}`);
    memory = new AtlasMemory(tmpDir);
  });

  afterEach(() => {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  describe('constructor', () => {
    it('should create the directory if it does not exist', () => {
      assert.ok(fs.existsSync(tmpDir));
    });
  });

  describe('recordLawStats()', () => {
    it('should create mml-stats.json file', () => {
      memory.recordLawStats({
        decisions: [{ action: 'FORBID', rule: 'TEST_RULE', law: 'TEST_LAW' }],
        entityId: 'atlas://bot/test-bot',
        blocked: true,
        domain: 'bot',
      });
      assert.ok(fs.existsSync(path.join(tmpDir, 'mml-stats.json')));
    });

    it('should increment cycle count', () => {
      memory.recordLawStats({ decisions: [], entityId: 'test', domain: 'bot' });
      memory.recordLawStats({ decisions: [], entityId: 'test', domain: 'bot' });
      const stats = memory.mmlSnapshot();
      assert.equal(stats.cycles, 2);
    });

    it('should track domain stats', () => {
      memory.recordLawStats({ decisions: [], entityId: 'test', blocked: true, domain: 'security' });
      const stats = memory.mmlSnapshot();
      assert.ok(stats.domains.security);
      assert.equal(stats.domains.security.blocked, 1);
    });

    it('should track entity stats', () => {
      memory.recordLawStats({
        decisions: [{ action: 'ESCALATE', rule: 'R1', law: 'L1' }],
        entityId: 'atlas://bot/test',
        blocked: false,
        domain: 'bot',
      });
      const stats = memory.mmlSnapshot();
      assert.ok(stats.entities['atlas://bot/test']);
      assert.equal(stats.entities['atlas://bot/test'].escalated, 1);
    });

    it('should track rule trigger counts', () => {
      memory.recordLawStats({
        decisions: [{ action: 'FORBID', rule: 'RULE_A', law: 'LAW_X' }],
        entityId: 'e1',
        domain: 'bot',
      });
      memory.recordLawStats({
        decisions: [{ action: 'FORBID', rule: 'RULE_A', law: 'LAW_X' }],
        entityId: 'e2',
        domain: 'bot',
      });
      const stats = memory.mmlSnapshot();
      assert.ok(stats.rules['LAW_X#RULE_A']);
      assert.equal(stats.rules['LAW_X#RULE_A'].triggered, 2);
    });
  });

  describe('recordPipelineStats()', () => {
    it('should create pipeline-stats.json file', () => {
      memory.recordPipelineStats({
        pipelineId: 'test-pipeline',
        result: { context: { steps_run: ['step1', 'step2'] } },
        domain: 'bot',
      });
      assert.ok(fs.existsSync(path.join(tmpDir, 'pipeline-stats.json')));
    });

    it('should track success/error counts', () => {
      memory.recordPipelineStats({
        pipelineId: 'p1',
        result: { context: {} },
        domain: 'bot',
      });
      memory.recordPipelineStats({
        pipelineId: 'p1',
        result: { context: { errors: ['error1'] } },
        domain: 'bot',
      });
      const stats = memory.pipelineSnapshot();
      assert.equal(stats.pipelines.p1.success, 1);
      assert.equal(stats.pipelines.p1.errors, 1);
    });

    it('should calculate average steps', () => {
      memory.recordPipelineStats({
        pipelineId: 'p1',
        result: { context: { steps_run: ['a', 'b', 'c'] } },
        domain: 'bot',
      });
      memory.recordPipelineStats({
        pipelineId: 'p1',
        result: { context: { steps_run: ['a'] } },
        domain: 'bot',
      });
      const stats = memory.pipelineSnapshot();
      assert.equal(stats.pipelines.p1.avg_steps, 2); // (3 + 1) / 2
    });
  });

  describe('recordIncident() and recentIncidents()', () => {
    it('should append incident to RIL', () => {
      memory.recordIncident({ entity_id: 'e1', cause: 'timeout', severity: 'high' });
      const incidents = memory.recentIncidents();
      assert.equal(incidents.length, 1);
      assert.equal(incidents[0].cause, 'timeout');
    });

    it('should return most recent N incidents', () => {
      for (let i = 0; i < 30; i++) {
        memory.recordIncident({ entity_id: `e${i}`, cause: `cause-${i}` });
      }
      const recent = memory.recentIncidents(10);
      assert.equal(recent.length, 10);
      assert.equal(recent[9].cause, 'cause-29');
    });
  });

  describe('incidentPatterns()', () => {
    it('should aggregate incidents by cause', () => {
      memory.recordIncident({ entity_id: 'e1', cause: 'timeout' });
      memory.recordIncident({ entity_id: 'e2', cause: 'timeout' });
      memory.recordIncident({ entity_id: 'e3', cause: 'oom' });
      
      const patterns = memory.incidentPatterns();
      const timeout = patterns.find(p => p.cause === 'timeout');
      assert.ok(timeout);
      assert.equal(timeout.count, 2);
      assert.ok(timeout.entities.includes('e1'));
      assert.ok(timeout.entities.includes('e2'));
    });

    it('should sort by count descending', () => {
      memory.recordIncident({ cause: 'rare' });
      memory.recordIncident({ cause: 'common' });
      memory.recordIncident({ cause: 'common' });
      memory.recordIncident({ cause: 'common' });
      
      const patterns = memory.incidentPatterns();
      assert.equal(patterns[0].cause, 'common');
    });
  });

  describe('addEvolutionRule() and evolutionRules()', () => {
    it('should add new evolution rule', () => {
      memory.addEvolutionRule({
        id: 'rule-1',
        type: 'threshold_adjustment',
        description: 'Lower risk threshold',
        suggestion: 'Change from 0.7 to 0.6',
        source: 'meta-engine',
      });
      const rules = memory.evolutionRules();
      assert.equal(rules.length, 1);
      assert.equal(rules[0].id, 'rule-1');
    });

    it('should update existing rule with same id', () => {
      memory.addEvolutionRule({ id: 'r1', description: 'v1' });
      memory.addEvolutionRule({ id: 'r1', description: 'v2' });
      const rules = memory.evolutionRules();
      assert.equal(rules.length, 1);
      assert.equal(rules[0].description, 'v2');
    });
  });

  describe('appendAudit() and recentAudit()', () => {
    it('should append audit entry', () => {
      memory.appendAudit({ action: 'deploy', actor: 'bot-1' });
      const audits = memory.recentAudit();
      assert.equal(audits.length, 1);
      assert.equal(audits[0].action, 'deploy');
    });

    it('should return most recent N entries', () => {
      for (let i = 0; i < 100; i++) {
        memory.appendAudit({ index: i });
      }
      const recent = memory.recentAudit(20);
      assert.equal(recent.length, 20);
      assert.equal(recent[19].index, 99);
    });
  });
});
