const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const {
  extractRecentEscalations,
  dedupeEscalations,
  isSuppressedByDismissFeedback,
  buildIssueTitle,
} = require('../../scripts/governance-create-escalation-issues.js');

describe('governance-create-escalation-issues', () => {
  it('extractRecentEscalations filters by cutoff and action', () => {
    const now = Date.now();
    const cutoffMs = now - 10_000;

    const entries = [
      {
        at: new Date(now - 20_000).toISOString(),
        entity: 'atlas://bot/old-bot',
        decisions: [{ action: 'ESCALATE', rule: 'R1', law: 'L1', target: 'human://operator' }],
      },
      {
        at: new Date(now - 1_000).toISOString(),
        entity: 'atlas://bot/new-bot',
        decisions: [
          { action: 'ALLOW', rule: 'R0', law: 'L0', target: 'none' },
          { action: 'ESCALATE', rule: 'R2', law: 'L2', target: 'human://operator', reason: 'x' },
        ],
      },
    ];

    const esc = extractRecentEscalations(entries, { cutoffMs });
    assert.equal(esc.length, 1);
    assert.equal(esc[0].entity, 'atlas://bot/new-bot');
    assert.equal(esc[0].rule, 'R2');
  });

  it('dedupeEscalations groups identical entity/law/rule/target', () => {
    const esc = [
      { entity: 'atlas://bot/a', law: 'L', rule: 'R', target: 't', at: '2026-01-01T00:00:00Z' },
      { entity: 'atlas://bot/a', law: 'L', rule: 'R', target: 't', at: '2026-01-01T00:01:00Z' },
      { entity: 'atlas://bot/a', law: 'L', rule: 'R', target: 'other', at: '2026-01-01T00:02:00Z' },
    ];

    const grouped = dedupeEscalations(esc);
    assert.equal(grouped.length, 2);

    const main = grouped.find(x => x.target === 't');
    assert.equal(main.count, 2);
    assert.equal(main.firstAt, '2026-01-01T00:00:00Z');
    assert.equal(main.lastAt, '2026-01-01T00:01:00Z');
  });

  it('isSuppressedByDismissFeedback suppresses within window', () => {
    const nowMs = Date.parse('2026-06-02T00:00:00Z');
    const windowMs = 30 * 24 * 60 * 60 * 1000;
    const dismissFeedback = [
      { entity: 'atlas://bot/x', ruleName: 'R', atMs: Date.parse('2026-06-01T00:00:00Z') },
    ];

    assert.equal(
      isSuppressedByDismissFeedback({ dismissFeedback, entity: 'atlas://bot/x', rule: 'R', nowMs, windowMs }),
      true
    );
    assert.equal(
      isSuppressedByDismissFeedback({ dismissFeedback, entity: 'atlas://bot/x', rule: 'R2', nowMs, windowMs }),
      false
    );
  });

  it('buildIssueTitle formats consistently', () => {
    const title = buildIssueTitle({ entity: 'atlas://bot/organism-learning-bot', rule: 'HALT_ON_REWARD_DIVERGENCE' });
    assert.equal(title, '🏛️ Governance Escalation: HALT_ON_REWARD_DIVERGENCE — organism-learning-bot');
  });
});

