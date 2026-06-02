const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');

const {
  parseAuditLogTextForRecentEscalations,
  loadDismissedEscalationsFromDir,
  filterDismissedEscalations,
  dedupeEscalationsByTitle,
  planEscalationIssues,
} = require('../../sdk/governance/escalation-issues.js');

describe('governance escalation issue planning', () => {
  it('parses recent ESCALATE decisions from audit log text', () => {
    const now = Date.now();
    const audit = [
      JSON.stringify({
        entity: 'atlas://bot/organism-learning-bot',
        at: new Date(now - 1000).toISOString(),
        decisions: [
          { action: 'ESCALATE', rule: 'HALT_ON_REWARD_DIVERGENCE', law: 'governance://law/learning-stability', target: 'human://operator', reason: 'Inspect' },
        ],
      }),
    ].join('\n');

    const esc = parseAuditLogTextForRecentEscalations(audit, { cutoffMs: 60_000, nowMs: now });
    assert.equal(esc.length, 1);
    assert.equal(esc[0].rule, 'HALT_ON_REWARD_DIVERGENCE');
  });

  it('filters out escalations dismissed by feedback files', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'aifx-feedback-'));
    try {
      fs.writeFileSync(path.join(tmp, 'fb-2026-06-01-001.yaml'), [
        'id: "fb-2026-06-01-001"',
        'target:',
        '  entity: "atlas://bot/organism-learning-bot"',
        '  rule_name: "HALT_ON_REWARD_DIVERGENCE"',
        'decision:',
        '  system: "ESCALATE"',
        '  human: "DISMISS"',
      ].join('\n'));

      const dismissed = loadDismissedEscalationsFromDir(tmp);
      assert.ok(dismissed.has('atlas://bot/organism-learning-bot::HALT_ON_REWARD_DIVERGENCE'));

      const input = [{ entity: 'atlas://bot/organism-learning-bot', rule: 'HALT_ON_REWARD_DIVERGENCE', action: 'ESCALATE' }];
      const output = filterDismissedEscalations(input, dismissed);
      assert.equal(output.length, 0);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('dedupes multiple audit entries to one issue per title', () => {
    const input = [
      { entity: 'atlas://bot/organism-learning-bot', rule: 'HALT_ON_REWARD_DIVERGENCE', action: 'ESCALATE', target: 'human://operator', reason: 'x' },
      { entity: 'atlas://bot/organism-learning-bot', rule: 'HALT_ON_REWARD_DIVERGENCE', action: 'ESCALATE', target: 'human://operator', reason: 'x' },
    ];
    const out = dedupeEscalationsByTitle(input);
    assert.equal(out.length, 1);
  });

  it('plans issues end-to-end (parse + feedback + dedupe)', () => {
    const now = Date.now();
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'aifx-feedback-'));
    try {
      fs.writeFileSync(path.join(tmp, 'fb-2026-06-01-001.yaml'), [
        'id: "fb-2026-06-01-001"',
        'target:',
        '  entity: "atlas://bot/organism-learning-bot"',
        '  rule_name: "HALT_ON_REWARD_DIVERGENCE"',
        'decision:',
        '  system: "ESCALATE"',
        '  human: "DISMISS"',
      ].join('\n'));

      const audit = [
        JSON.stringify({
          entity: 'atlas://bot/organism-learning-bot',
          at: new Date(now - 1000).toISOString(),
          decisions: [
            { action: 'ESCALATE', rule: 'HALT_ON_REWARD_DIVERGENCE', law: 'governance://law/learning-stability', target: 'human://operator', reason: 'Inspect' },
            { action: 'ESCALATE', rule: 'SOME_OTHER_RULE', law: 'governance://law/learning-stability', target: 'human://operator', reason: 'Other' },
          ],
        }),
      ].join('\n');

      const planned = planEscalationIssues({ auditLogText: audit, feedbackDir: tmp, cutoffMs: 60_000, nowMs: now });
      assert.equal(planned.length, 1);
      assert.ok(planned[0].title.includes('SOME_OTHER_RULE'));
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});

