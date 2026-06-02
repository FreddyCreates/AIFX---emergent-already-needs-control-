const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { collectRecentEscalations } = require('../../scripts/governance-escalation-utils.js');

describe('collectRecentEscalations()', () => {
  it('deduplicates by (entity, rule) and keeps the latest decision', () => {
    const auditText = [
      JSON.stringify({
        entity: 'atlas://bot/organism-learning-bot',
        at: '2026-06-02T02:40:00.000Z',
        decisions: [
          { action: 'ESCALATE', rule: 'HALT_ON_REWARD_DIVERGENCE', target: 'human://operator', reason: 'old', at: '2026-06-02T02:40:00.000Z' },
        ],
      }),
      JSON.stringify({
        entity: 'atlas://bot/organism-learning-bot',
        at: '2026-06-02T02:44:46.667Z',
        decisions: [
          { action: 'ESCALATE', rule: 'HALT_ON_REWARD_DIVERGENCE', target: 'human://operator', reason: 'new', at: '2026-06-02T02:44:46.667Z' },
          { action: 'FORBID', rule: 'HALT_ON_REWARD_DIVERGENCE', target: 'weight_update', reason: 'ignored' },
        ],
      }),
      '{ this is not json',
      '',
    ].join('\n');

    const nowMs = new Date('2026-06-02T02:45:00.000Z').getTime();
    const escalations = collectRecentEscalations({ auditText, nowMs, windowMs: 10 * 60 * 1000 });
    assert.equal(escalations.length, 1);
    assert.equal(escalations[0].entity, 'atlas://bot/organism-learning-bot');
    assert.equal(escalations[0].rule, 'HALT_ON_REWARD_DIVERGENCE');
    assert.equal(escalations[0].reason, 'new');
    assert.equal(escalations[0].target, 'human://operator');
    assert.equal(escalations[0].action, 'ESCALATE');
    assert.equal(escalations[0].at, '2026-06-02T02:44:46.667Z');
  });

  it('filters out decisions outside the time window', () => {
    const auditText = JSON.stringify({
      entity: 'atlas://bot/organism-learning-bot',
      at: '2026-06-02T02:00:00.000Z',
      decisions: [
        { action: 'ESCALATE', rule: 'HALT_ON_REWARD_DIVERGENCE', target: 'human://operator', reason: 'too old', at: '2026-06-02T02:00:00.000Z' },
      ],
    });

    const nowMs = new Date('2026-06-02T02:45:00.000Z').getTime();
    const escalations = collectRecentEscalations({ auditText, nowMs, windowMs: 10 * 60 * 1000 });
    assert.deepEqual(escalations, []);
  });
});

