const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

const CplLEngine = require('../../sdk/governance/cpl-l-engine.js');

describe('learning-stability law: HALT_ON_REWARD_DIVERGENCE', () => {
  const lawFile = path.join(__dirname, '../../governance/laws/learning-stability.cpl-l');
  const engine = new CplLEngine(lawFile);

  it('does not trigger when reward_signal is missing', () => {
    const res = engine.apply('atlas://bot/organism-learning-bot', {}, {}, {});
    assert.equal(res.decisions.length, 0);
    assert.equal(res.escalations.length, 0);
    assert.equal(res.blocked, false);
  });

  it('triggers when reward_signal is NaN', () => {
    const res = engine.apply('atlas://bot/organism-learning-bot', {}, {}, { reward_signal: NaN });
    assert.ok(res.decisions.some(d => d.rule === 'HALT_ON_REWARD_DIVERGENCE' && d.action === 'ESCALATE'));
    assert.ok(res.decisions.some(d => d.rule === 'HALT_ON_REWARD_DIVERGENCE' && d.action === 'FORBID'));
    assert.equal(res.blocked, true);
  });

  it('triggers when reward_signal exceeds φ² threshold', () => {
    const res = engine.apply('atlas://bot/organism-learning-bot', {}, {}, { reward_signal: 3.0 });
    assert.ok(res.decisions.some(d => d.rule === 'HALT_ON_REWARD_DIVERGENCE' && d.action === 'ESCALATE'));
    assert.equal(res.blocked, true);
  });
});

