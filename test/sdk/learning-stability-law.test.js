const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const CplLEngine = require('../../sdk/governance/cpl-l-engine.js');

describe('learning-stability.cpl-l', () => {
  const lawFile = path.join(__dirname, '../../governance/laws/learning-stability.cpl-l');
  const entityId = 'atlas://bot/organism-learning-bot';

  it('does not trigger HALT_ON_REWARD_DIVERGENCE when reward_signal is missing', () => {
    const engine = new CplLEngine(lawFile);
    const result = engine.apply(entityId, {}, {}, {});

    assert.equal(result.decisions.length, 0);
    assert.equal(result.blocked, false);
    assert.equal(result.escalations.length, 0);
  });

  it('triggers HALT_ON_REWARD_DIVERGENCE when reward_signal is NaN', () => {
    const engine = new CplLEngine(lawFile);
    const result = engine.apply(entityId, {}, {}, { reward_signal: Number.NaN });

    assert.ok(result.decisions.some(d => d.rule === 'HALT_ON_REWARD_DIVERGENCE' && d.action === 'FORBID'));
    assert.ok(result.decisions.some(d => d.rule === 'HALT_ON_REWARD_DIVERGENCE' && d.action === 'ESCALATE'));
    assert.equal(result.blocked, true);
    assert.ok(result.escalations.some(e => e.target === 'human://operator'));
  });
});
