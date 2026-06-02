const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { loadDismissedEscalations } = require('../../scripts/governance-escalation-utils.js');

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'aifx-governance-feedback-'));
}

test('loadDismissedEscalations returns dismissed entity+rule keys within window', () => {
  const dir = tmpDir();

  fs.writeFileSync(
    path.join(dir, 'fb-dismiss.yaml'),
    [
      'target:',
      '  entity: "atlas://bot/organism-learning-bot"',
      '  rule_name: "HALT_ON_REWARD_DIVERGENCE"',
      'decision:',
      '  system: "ESCALATE"',
      '  human: "DISMISS"',
      'at: "2026-06-01T22:36:00Z"',
      '',
    ].join('\n'),
    'utf8'
  );

  fs.writeFileSync(
    path.join(dir, 'fb-allow.yaml'),
    [
      'target:',
      '  entity: "atlas://bot/organism-release-bot"',
      '  rule_name: "NO_RELEASE_ON_RED"',
      'decision:',
      '  system: "FORBID"',
      '  human: "ALLOW"',
      'at: "2026-06-01T22:36:00Z"',
      '',
    ].join('\n'),
    'utf8'
  );

  const now = Date.parse('2026-06-02T00:00:00Z');
  const dismissed = loadDismissedEscalations(dir, { now, windowDays: 30 });

  assert.equal(dismissed.has('atlas://bot/organism-learning-bot|HALT_ON_REWARD_DIVERGENCE'), true);
  assert.equal(dismissed.has('atlas://bot/organism-release-bot|NO_RELEASE_ON_RED'), false);
});

test('loadDismissedEscalations ignores DISMISS feedback outside window', () => {
  const dir = tmpDir();

  fs.writeFileSync(
    path.join(dir, 'fb-old-dismiss.yaml'),
    [
      'target:',
      '  entity: "atlas://bot/organism-learning-bot"',
      '  rule_name: "HALT_ON_REWARD_DIVERGENCE"',
      'decision:',
      '  system: "ESCALATE"',
      '  human: "DISMISS"',
      'at: "2026-01-01T00:00:00Z"',
      '',
    ].join('\n'),
    'utf8'
  );

  const now = Date.parse('2026-06-02T00:00:00Z');
  const dismissed = loadDismissedEscalations(dir, { now, windowDays: 30 });

  assert.equal(dismissed.size, 0);
});

