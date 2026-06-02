const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');

const {
  loadEscalationsFromAudit,
  dedupeEscalations,
  loadDismissedEscalationsFromFeedback,
} = require('../../scripts/governance-escalation-utils.js');

describe('governance-escalation-utils', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gov-escalation-test-'));
  });

  afterEach(() => {
    if (tmpDir && fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('loads recent escalations from audit log and annotates keys', () => {
    const auditFile = path.join(tmpDir, 'audit-log.jsonl');
    const nowMs = Date.now();
    const oldAt = new Date(nowMs - 60_000).toISOString();
    const newAt = new Date(nowMs - 1_000).toISOString();

    fs.writeFileSync(auditFile, [
      JSON.stringify({
        at: oldAt,
        entity: 'atlas://bot/organism-learning-bot',
        decisions: [
          { rule: 'HALT_ON_REWARD_DIVERGENCE', action: 'ESCALATE', target: 'human://operator', reason: 'old' },
        ],
      }),
      JSON.stringify({
        at: newAt,
        entity: 'atlas://bot/organism-learning-bot',
        decisions: [
          { rule: 'HALT_ON_REWARD_DIVERGENCE', action: 'ESCALATE', target: 'human://operator', reason: 'new' },
        ],
      }),
    ].join('\n') + '\n');

    const sinceMs = nowMs - 10_000;
    const esc = loadEscalationsFromAudit(auditFile, { sinceMs, nowMs });

    assert.equal(esc.length, 1);
    assert.equal(esc[0].reason, 'new');
    assert.ok(esc[0].key.includes('HALT_ON_REWARD_DIVERGENCE'));
    assert.ok(esc[0].dismissKey.includes('HALT_ON_REWARD_DIVERGENCE'));
  });

  it('dedupes escalations by entity/rule/target, keeping newest', () => {
    const nowMs = Date.now();
    const esc = [
      {
        at: new Date(nowMs - 2_000).toISOString(),
        atMs: nowMs - 2_000,
        entity: 'atlas://bot/a',
        rule: 'R',
        action: 'ESCALATE',
        target: 'human://operator',
        reason: 'first',
        key: 'atlas://bot/a|R|human://operator',
        dismissKey: 'atlas://bot/a|R',
      },
      {
        at: new Date(nowMs - 1_000).toISOString(),
        atMs: nowMs - 1_000,
        entity: 'atlas://bot/a',
        rule: 'R',
        action: 'ESCALATE',
        target: 'human://operator',
        reason: 'second',
        key: 'atlas://bot/a|R|human://operator',
        dismissKey: 'atlas://bot/a|R',
      },
    ];

    const unique = dedupeEscalations(esc);
    assert.equal(unique.length, 1);
    assert.equal(unique[0].reason, 'second');
  });

  it('suppresses dismissed escalations within TTL', () => {
    const feedbackDir = path.join(tmpDir, 'feedback');
    fs.mkdirSync(feedbackDir, { recursive: true });

    const nowMs = Date.now();
    const at = new Date(nowMs - 1_000).toISOString();
    fs.writeFileSync(path.join(feedbackDir, 'fb-2026-06-01-001.yaml'), [
      'id: "fb-2026-06-01-001"',
      'actor: "human://operator"',
      '',
      'target:',
      '  type: "decision"',
      '  entity: "atlas://bot/organism-learning-bot"',
      '  rule_name: "HALT_ON_REWARD_DIVERGENCE"',
      '',
      'decision:',
      '  system: "ESCALATE"',
      '  human: "DISMISS"',
      '',
      `at: "${at}"`,
      '',
    ].join('\n'));

    const dismissed = loadDismissedEscalationsFromFeedback(feedbackDir, { nowMs, ttlMs: 30_000 });
    assert.ok(dismissed.has('atlas://bot/organism-learning-bot|HALT_ON_REWARD_DIVERGENCE'));
  });

  it('does not suppress dismissed escalations after TTL', () => {
    const feedbackDir = path.join(tmpDir, 'feedback');
    fs.mkdirSync(feedbackDir, { recursive: true });

    const nowMs = Date.now();
    const at = new Date(nowMs - 60_000).toISOString();
    fs.writeFileSync(path.join(feedbackDir, 'fb-2026-06-01-001.yaml'), [
      'id: "fb-2026-06-01-001"',
      'actor: "human://operator"',
      '',
      'target:',
      '  type: "decision"',
      '  entity: "atlas://bot/organism-learning-bot"',
      '  rule_name: "HALT_ON_REWARD_DIVERGENCE"',
      '',
      'decision:',
      '  system: "ESCALATE"',
      '  human: "DISMISS"',
      '',
      `at: "${at}"`,
      '',
    ].join('\n'));

    const dismissed = loadDismissedEscalationsFromFeedback(feedbackDir, { nowMs, ttlMs: 30_000 });
    assert.equal(dismissed.size, 0);
  });
});

