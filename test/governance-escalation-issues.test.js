const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const issueUtils = require('../scripts/governance-escalation-issues.js');

function tmpDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

describe('governance escalation issue utils', () => {
  it('loads DISMISS feedback within window', () => {
    const dir = tmpDir('gov-feedback-');

    fs.writeFileSync(
      path.join(dir, 'fb-2026-06-01-001.yaml'),
      [
        'target:',
        '  entity: "atlas://bot/organism-learning-bot"',
        '  rule_name: "HALT_ON_REWARD_DIVERGENCE"',
        'decision:',
        '  system: "ESCALATE"',
        '  human: "DISMISS"',
        'at: "2026-06-01T22:36:00Z"',
        '',
      ].join('\n')
    );

    fs.writeFileSync(
      path.join(dir, 'fb-2026-06-01-002.yaml'),
      [
        'target:',
        '  entity: "atlas://bot/organism-learning-bot"',
        '  rule_name: "HALT_ON_REWARD_DIVERGENCE"',
        'decision:',
        '  system: "ESCALATE"',
        '  human: "ALLOW"',
        'at: "2026-06-01T22:36:00Z"',
        '',
      ].join('\n')
    );

    const dismissed = issueUtils.loadDismissedFeedback({
      feedbackDir: dir,
      now: new Date('2026-06-02T00:00:00Z').getTime(),
      windowDays: 30,
    });

    assert.ok(dismissed instanceof Set);
    assert.equal(dismissed.size, 1);
    assert.ok(dismissed.has('atlas://bot/organism-learning-bot::HALT_ON_REWARD_DIVERGENCE'));
  });

  it('dedupes recent escalations from audit jsonl', () => {
    const dir = tmpDir('gov-audit-');
    const auditFile = path.join(dir, 'audit-log.jsonl');
    const nowIso = '2026-06-02T02:44:46.671Z';

    const entry = {
      entity: 'atlas://bot/organism-learning-bot',
      op: 'ci_run_completed',
      decisions: [
        {
          rule: 'HALT_ON_REWARD_DIVERGENCE',
          law: 'governance://law/learning-stability',
          action: 'ESCALATE',
          target: 'human://operator',
          reason: 'Reward divergence requires manual inspection of training data',
          at: nowIso,
        },
      ],
      blocked: true,
      at: nowIso,
    };

    const oldEntry = { ...entry, at: '2026-05-01T00:00:00Z' };

    fs.writeFileSync(
      auditFile,
      [JSON.stringify(oldEntry), JSON.stringify(entry), JSON.stringify(entry)].join('\n') + '\n'
    );

    const escalations = issueUtils.getRecentEscalationsFromAudit({
      auditFile,
      now: new Date('2026-06-02T02:50:00Z').getTime(),
      windowMs: 10 * 60 * 1000,
    });
    assert.equal(escalations.length, 2);

    const deduped = issueUtils.dedupeEscalations(escalations);
    assert.equal(deduped.length, 1);
    assert.equal(deduped[0].rule, 'HALT_ON_REWARD_DIVERGENCE');
  });
});

