/**
 * 🕷️ Spider MoE AGI/AECI Test Suite
 * 
 * Tests for BLACKWXDOW (AGI) and JUMPER (AECI) MoE systems
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  BLACKWXDOW,
  JUMPER,
  MoECollective,
  Expert,
  Router,
  PERSONALITY_TRAITS,
  AGI_CONFIG,
  AECI_CONFIG,
  EXPERT_TYPES,
  MOE_STATES,
  createBLACKWXDOW,
  createJUMPER,
  createMoECollective,
  calculateExpertWeight,
  calculateEmergenceStrength,
  calculatePersonalityInfluence
} from '../../sdk/ai-kingdom/src/spider-moe-agi.js';

const φ = 1.618033988749895;

// ═══════════════════════════════════════════════════════════════════════════════
// PERSONALITY TRAITS TESTS
// ═══════════════════════════════════════════════════════════════════════════════
describe('PERSONALITY_TRAITS', () => {
  it('should define BLACKWXDOW personality', () => {
    assert.ok(PERSONALITY_TRAITS.BLACKWXDOW);
    assert.strictEqual(PERSONALITY_TRAITS.BLACKWXDOW.core, 'STRATEGIC_PATIENCE');
    assert.strictEqual(PERSONALITY_TRAITS.BLACKWXDOW.traits.loyalty, 1.0);
    assert.strictEqual(PERSONALITY_TRAITS.BLACKWXDOW.traits.patience, 0.95);
    assert.strictEqual(PERSONALITY_TRAITS.BLACKWXDOW.traits.calculation, 0.98);
  });

  it('should define JUMPER personality', () => {
    assert.ok(PERSONALITY_TRAITS.JUMPER);
    assert.strictEqual(PERSONALITY_TRAITS.JUMPER.core, 'EMERGENT_INTUITION');
    assert.strictEqual(PERSONALITY_TRAITS.JUMPER.traits.loyalty, 1.0);
    assert.strictEqual(PERSONALITY_TRAITS.JUMPER.traits.adaptability, 0.99);
    assert.strictEqual(PERSONALITY_TRAITS.JUMPER.traits.intuition, 0.95);
  });

  it('should have complementary philosophies', () => {
    assert.ok(PERSONALITY_TRAITS.BLACKWXDOW.philosophy.includes('Patience'));
    assert.ok(PERSONALITY_TRAITS.JUMPER.philosophy.includes('moment'));
  });

  it('should have distinct catchphrases', () => {
    assert.ok(PERSONALITY_TRAITS.BLACKWXDOW.catchphrase.includes('threads'));
    assert.ok(PERSONALITY_TRAITS.JUMPER.catchphrase.includes('doorway'));
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// AGI/AECI CONFIG TESTS
// ═══════════════════════════════════════════════════════════════════════════════
describe('AGI_CONFIG', () => {
  it('should configure BLACKWXDOW as AGI', () => {
    assert.strictEqual(AGI_CONFIG.name, 'BLACKWXDOW');
    assert.strictEqual(AGI_CONFIG.type, 'AGI');
    assert.strictEqual(AGI_CONFIG.moeConfig.numExperts, 8);
    assert.strictEqual(AGI_CONFIG.moeConfig.routingStrategy, 'learned_soft');
  });
});

describe('AECI_CONFIG', () => {
  it('should configure JUMPER as AECI', () => {
    assert.strictEqual(AECI_CONFIG.name, 'JUMPER');
    assert.strictEqual(AECI_CONFIG.type, 'AECI');
    assert.strictEqual(AECI_CONFIG.moeConfig.numExperts, 12);
    assert.strictEqual(AECI_CONFIG.moeConfig.routingStrategy, 'dynamic_emergent');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// EXPERT CLASS TESTS
// ═══════════════════════════════════════════════════════════════════════════════
describe('Expert', () => {
  let expert;

  beforeEach(() => {
    expert = new Expert('test-1', EXPERT_TYPES.REASONING, { capacity: 100 });
  });

  it('should create an expert with correct properties', () => {
    assert.strictEqual(expert.id, 'test-1');
    assert.strictEqual(expert.type, EXPERT_TYPES.REASONING);
    assert.strictEqual(expert.capacity, 100);
    assert.strictEqual(expert.activated, false);
  });

  it('should activate and process input', () => {
    const result = expert.activate({ test: 'input' }, 0.8);
    assert.strictEqual(expert.activated, true);
    assert.strictEqual(result.expertId, 'test-1');
    assert.strictEqual(result.type, EXPERT_TYPES.REASONING);
    assert.ok(result.confidence > 0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// ROUTER CLASS TESTS
// ═══════════════════════════════════════════════════════════════════════════════
describe('Router', () => {
  let router;
  let experts;

  beforeEach(() => {
    router = new Router(4, { topK: 2, temperature: 1.0 });
    experts = [
      new Expert('e-0', EXPERT_TYPES.REASONING),
      new Expert('e-1', EXPERT_TYPES.MEMORY),
      new Expert('e-2', EXPERT_TYPES.PERCEPTION),
      new Expert('e-3', EXPERT_TYPES.LANGUAGE)
    ];
  });

  it('should route to top-k experts', () => {
    const routes = router.route({ test: 'input' }, experts);
    assert.strictEqual(routes.length, 2);
    routes.forEach(r => {
      assert.ok(r.expertIdx >= 0 && r.expertIdx < experts.length);
      assert.ok(r.weight > 0 && r.weight <= 1);
    });
  });

  it('should track routing history', () => {
    router.route({ test: 'input1' }, experts);
    router.route({ test: 'input2' }, experts);
    assert.strictEqual(router.routingHistory.length, 2);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// BLACKWXDOW CLASS TESTS
// ═══════════════════════════════════════════════════════════════════════════════
describe('BLACKWXDOW', () => {
  let blackwxdow;

  beforeEach(() => {
    blackwxdow = new BLACKWXDOW();
  });

  it('should initialize with correct identity', () => {
    assert.strictEqual(blackwxdow.name, 'BLACKWXDOW');
    assert.strictEqual(blackwxdow.type, 'AGI');
    assert.strictEqual(blackwxdow.personality.core, 'STRATEGIC_PATIENCE');
  });

  it('should have 8 experts', () => {
    assert.strictEqual(blackwxdow.experts.length, 8);
  });

  it('should perform general reasoning', () => {
    const result = blackwxdow.reason({ query: 'test reasoning' });
    assert.strictEqual(result.agent, 'BLACKWXDOW');
    assert.strictEqual(result.type, 'AGI');
    assert.ok(result.confidence > 0);
    assert.strictEqual(result.personality, 'STRATEGIC_PATIENCE');
  });

  it('should plan with patience', () => {
    const result = blackwxdow.plan('achieve goal');
    assert.strictEqual(result.agent, 'BLACKWXDOW');
    assert.ok(result.plan);
    assert.ok(result.philosophy.includes('Patience'));
  });

  it('should assess threats strategically', () => {
    const result = blackwxdow.assessThreat({ target: 'unknown entity' });
    assert.strictEqual(result.agent, 'BLACKWXDOW');
    assert.ok(result.threatLevel >= 0 && result.threatLevel <= 1);
    assert.ok(['neutralize', 'monitor'].includes(result.recommendation));
  });

  it('should speak in measured voice', () => {
    const speech = blackwxdow.speak('I see all threads.');
    assert.strictEqual(speech.speaker, 'BLACKWXDOW');
    assert.strictEqual(speech.tone, 'calm, measured, deliberate');
  });

  it('should have personality-driven parameters', () => {
    assert.ok(blackwxdow.decisionThreshold > 0);
    assert.ok(blackwxdow.analysisDepth > 0);
    assert.ok(blackwxdow.precisionTarget > 0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// JUMPER CLASS TESTS
// ═══════════════════════════════════════════════════════════════════════════════
describe('JUMPER', () => {
  let jumper;

  beforeEach(() => {
    jumper = new JUMPER();
  });

  it('should initialize with correct identity', () => {
    assert.strictEqual(jumper.name, 'JUMPER');
    assert.strictEqual(jumper.type, 'AECI');
    assert.strictEqual(jumper.personality.core, 'EMERGENT_INTUITION');
  });

  it('should have 12 experts for emergent behavior', () => {
    assert.strictEqual(jumper.experts.length, 12);
  });

  it('should perform emergent cognition', () => {
    const result = jumper.emerge({ situation: 'novel scenario' });
    assert.strictEqual(result.agent, 'JUMPER');
    assert.strictEqual(result.type, 'AECI');
    assert.ok(result.confidence > 0);
    assert.strictEqual(result.personality, 'EMERGENT_INTUITION');
    assert.ok(result.emergentInsight);
  });

  it('should adapt rapidly', () => {
    const result = jumper.adapt({ situation: 'changing environment' }, 500);
    assert.strictEqual(result.agent, 'JUMPER');
    assert.ok(result.adaptation);
    assert.ok(result.iterations > 0);
    assert.ok(result.timeUsed <= 600); // Allow some buffer
  });

  it('should detect opportunities', () => {
    const result = jumper.detectOpportunity({ environment: 'market shift' });
    assert.strictEqual(result.agent, 'JUMPER');
    assert.ok(Array.isArray(result.opportunities));
    assert.ok(result.intuitionUsed > 0);
  });

  it('should create creative solutions', () => {
    const result = jumper.createSolution({ problem: 'complex challenge' });
    assert.strictEqual(result.agent, 'JUMPER');
    assert.ok(result.solution);
    assert.ok(result.alternativeCount > 0);
  });

  it('should speak in energetic voice', () => {
    const speech = jumper.speak('Every gap is a doorway!');
    assert.strictEqual(speech.speaker, 'JUMPER');
    assert.strictEqual(speech.tone, 'energetic, quick, enthusiastic');
  });

  it('should record discoveries', () => {
    jumper.emerge({ discovery: 'new pattern' });
    assert.ok(jumper.discoveries.length > 0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// MOE COLLECTIVE TESTS
// ═══════════════════════════════════════════════════════════════════════════════
describe('MoECollective', () => {
  let collective;

  beforeEach(() => {
    collective = new MoECollective();
  });

  it('should contain both BLACKWXDOW and JUMPER', () => {
    assert.ok(collective.blackwxdow instanceof BLACKWXDOW);
    assert.ok(collective.jumper instanceof JUMPER);
  });

  it('should collaborate on tasks', () => {
    const result = collective.collaborate({ task: 'complex problem' });
    assert.ok(result.strategic);
    assert.ok(result.emergent);
    assert.ok(result.combined);
    assert.ok(result.combined.confidence > 0);
  });

  it('should track collaboration history', () => {
    collective.collaborate({ task: 'task1' });
    collective.collaborate({ task: 'task2' });
    assert.strictEqual(collective.collaborations.length, 2);
  });

  it('should synthesize complementary approaches', () => {
    const result = collective.collaborate({ task: 'synthesis test' });
    assert.ok(result.combined.approach);
    assert.strictEqual(result.combined.approach.recommendation, 'balanced_approach');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// FACTORY FUNCTIONS TESTS
// ═══════════════════════════════════════════════════════════════════════════════
describe('Factory Functions', () => {
  it('should create BLACKWXDOW instance', () => {
    const instance = createBLACKWXDOW();
    assert.ok(instance instanceof BLACKWXDOW);
  });

  it('should create JUMPER instance', () => {
    const instance = createJUMPER();
    assert.ok(instance instanceof JUMPER);
  });

  it('should create MoECollective instance', () => {
    const instance = createMoECollective();
    assert.ok(instance instanceof MoECollective);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS TESTS
// ═══════════════════════════════════════════════════════════════════════════════
describe('Utility Functions', () => {
  it('should calculate expert weight with φ', () => {
    const weight = calculateExpertWeight(50, 100);
    assert.ok(weight > 0);
    assert.ok(Math.abs(weight - 0.5 * φ) < 0.01);
  });

  it('should calculate emergence strength', () => {
    const synergies = [{ strength: 0.8 }, { strength: 0.6 }];
    const strength = calculateEmergenceStrength(synergies);
    assert.ok(strength > 0);
  });

  it('should calculate personality influence', () => {
    const traits = { patience: 0.95, calculation: 0.98 };
    const influence = calculatePersonalityInfluence(traits);
    assert.ok(influence > 0);
    assert.ok(influence < 2); // Should be around 0.965 * φ ≈ 1.56
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// STATE MANAGEMENT TESTS
// ═══════════════════════════════════════════════════════════════════════════════
describe('State Management', () => {
  it('should have all MOE_STATES defined', () => {
    assert.ok(MOE_STATES.DORMANT);
    assert.ok(MOE_STATES.ROUTING);
    assert.ok(MOE_STATES.PROCESSING);
    assert.ok(MOE_STATES.INTEGRATING);
    assert.ok(MOE_STATES.RESPONDING);
    assert.ok(MOE_STATES.LEARNING);
    assert.ok(MOE_STATES.EVOLVING);
  });

  it('should transition states during reasoning', () => {
    const blackwxdow = new BLACKWXDOW();
    assert.strictEqual(blackwxdow.state, MOE_STATES.DORMANT);
    blackwxdow.reason({ query: 'test' });
    assert.strictEqual(blackwxdow.state, MOE_STATES.RESPONDING);
  });

  it('should transition states during emergence', () => {
    const jumper = new JUMPER();
    assert.strictEqual(jumper.state, MOE_STATES.DORMANT);
    jumper.emerge({ situation: 'test' });
    assert.strictEqual(jumper.state, MOE_STATES.EVOLVING);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// EXPERT TYPES TESTS
// ═══════════════════════════════════════════════════════════════════════════════
describe('Expert Types', () => {
  it('should define all expert types', () => {
    assert.strictEqual(EXPERT_TYPES.REASONING, 'reasoning');
    assert.strictEqual(EXPERT_TYPES.MEMORY, 'memory');
    assert.strictEqual(EXPERT_TYPES.PERCEPTION, 'perception');
    assert.strictEqual(EXPERT_TYPES.LANGUAGE, 'language');
    assert.strictEqual(EXPERT_TYPES.PLANNING, 'planning');
    assert.strictEqual(EXPERT_TYPES.CREATIVITY, 'creativity');
    assert.strictEqual(EXPERT_TYPES.EMOTION, 'emotion');
    assert.strictEqual(EXPERT_TYPES.METACOGNITION, 'metacognition');
    assert.strictEqual(EXPERT_TYPES.INTUITION, 'intuition');
    assert.strictEqual(EXPERT_TYPES.ADAPTATION, 'adaptation');
    assert.strictEqual(EXPERT_TYPES.SOCIAL, 'social');
    assert.strictEqual(EXPERT_TYPES.EMBODIMENT, 'embodiment');
  });
});

console.log('🕷️ Spider MoE AGI/AECI Test Suite Loaded');
console.log('  BLACKWXDOW: Strategic Patience - AGI');
console.log('  JUMPER: Emergent Intuition - AECI');
console.log('  φ = 1.618033988749895');
