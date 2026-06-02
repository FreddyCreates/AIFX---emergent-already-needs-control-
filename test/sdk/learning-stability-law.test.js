const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const CplLEngine = require('../../sdk/governance/cpl-l-engine.js');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const LAW_FILE = path.join(REPO_ROOT, 'governance', 'laws', 'learning-stability.cpl-l');
const ENTITY_ID = 'atlas://bot/organism-learning-bot';

describe('Learning stability law', () => {
  it('does not trigger HALT_ON_REWARD_DIVERGENCE when reward_signal is missing', () => {
    const engine = new CplLEngine(LAW_FILE);
    const result = engine.apply(ENTITY_ID, {}, {}, {});

    assert.equal(
      result.decisions.some(d => d.rule === 'HALT_ON_REWARD_DIVERGENCE'),
      false
    );
    assert.equal(result.blocked, false);
    assert.equal(result.escalations.length, 0);
  });

  it('triggers HALT_ON_REWARD_DIVERGENCE when reward_signal is NaN', () => {
    const engine = new CplLEngine(LAW_FILE);
    const result = engine.apply(ENTITY_ID, {}, {}, { reward_signal: NaN });

    assert.equal(
      result.decisions.some(d => d.rule === 'HALT_ON_REWARD_DIVERGENCE' && d.action === 'ESCALATE'),
      true
    );
    assert.equal(
      result.decisions.some(d => d.rule === 'HALT_ON_REWARD_DIVERGENCE' && d.action === 'FORBID'),
      true
    );
    assert.equal(result.blocked, true);
  });
});

