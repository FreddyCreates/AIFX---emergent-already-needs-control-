/**
 * 🕷️🦗 Spider MoE Advanced Capabilities Tests
 * 
 * Tests for BLACKWXDOW and JUMPER advanced features
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  DeepReasoningEngine,
  EmergentSynthesisEngine,
  BLACKWXDOWInterface,
  JUMPERInterface,
  AdvancedCollective,
  createBLACKWXDOWInterface,
  createJUMPERInterface,
  createAdvancedCollective
} from '../../sdk/ai-kingdom/src/spider-moe-advanced.js';

import { BLACKWXDOW, JUMPER } from '../../sdk/ai-kingdom/src/spider-moe-agi.js';

const φ = 1.618033988749895;

describe('DeepReasoningEngine', () => {
  let engine;
  let blackwxdow;

  beforeEach(() => {
    blackwxdow = new BLACKWXDOW();
    engine = new DeepReasoningEngine(blackwxdow);
  });

  it('should initialize with correct default depth', () => {
    assert.strictEqual(engine.reasoningDepth, 7);
    assert.ok(Array.isArray(engine.causalChains));
    assert.ok(engine.hypotheses instanceof Map);
  });

  it('should perform deep analysis with multiple layers', () => {
    const result = engine.analyzeDeep({ topic: 'test situation' }, 3);
    
    assert.strictEqual(result.agent, 'BLACKWXDOW');
    assert.strictEqual(result.capability, 'deep_reasoning');
    assert.ok(result.chain.length > 0);
    assert.ok(result.chain.length <= 3);
    assert.ok(typeof result.finalConfidence === 'number');
  });

  it('should explore counterfactuals', () => {
    const result = engine.exploreCounterfactual(
      { scenario: 'original' },
      { altered: true }
    );
    
    assert.ok(result.original);
    assert.ok(result.altered);
    assert.ok(typeof result.impact === 'number');
  });

  it('should generate and select hypotheses', () => {
    const result = engine.hypothesize({ observation: 'pattern detected' });
    
    assert.ok(Array.isArray(result.hypotheses));
    assert.ok(result.hypotheses.length === 5);
    assert.ok(result.selected);
    assert.ok(result.selected.id);
  });
});

describe('EmergentSynthesisEngine', () => {
  let engine;
  let jumper;

  beforeEach(() => {
    jumper = new JUMPER();
    engine = new EmergentSynthesisEngine(jumper);
  });

  it('should initialize with empty collections', () => {
    assert.ok(Array.isArray(engine.syntheses));
    assert.ok(engine.emergentPatterns instanceof Map);
    assert.ok(Array.isArray(engine.creativeBursts));
  });

  it('should synthesize across domains', () => {
    const result = engine.synthesize(['domain1', 'domain2'], 'challenge');
    
    assert.strictEqual(result.agent, 'JUMPER');
    assert.strictEqual(result.capability, 'emergent_synthesis');
    assert.ok(result.synthesis);
    assert.ok(result.synthesis.novelSolution);
  });

  it('should perform rapid ideation', () => {
    const result = engine.ideate('problem to solve', 5);
    
    assert.strictEqual(result.agent, 'JUMPER');
    assert.strictEqual(result.capability, 'rapid_ideation');
    assert.strictEqual(result.ideasGenerated, 5);
    assert.ok(result.topIdeas.length <= 3);
  });

  it('should detect emergent patterns', () => {
    const observations = ['obs1', 'obs2', 'obs3'];
    const result = engine.detectEmergentPattern(observations);
    
    assert.ok(result.type);
    assert.ok(result.strength > 0);
    assert.ok(Array.isArray(result.implications));
  });
});

describe('BLACKWXDOWInterface', () => {
  let interface_;

  beforeEach(() => {
    interface_ = new BLACKWXDOWInterface();
  });

  it('should create interface with session', () => {
    assert.ok(interface_.sessionId.startsWith('BW-SESSION-'));
    assert.ok(interface_.core instanceof BLACKWXDOW);
    assert.ok(interface_.deepReasoning instanceof DeepReasoningEngine);
  });

  it('should handle chat messages', async () => {
    const response = await interface_.chat('Hello, BLACKWXDOW');
    
    assert.strictEqual(response.agent, 'BLACKWXDOW');
    assert.ok(response.message);
    assert.ok(typeof response.confidence === 'number');
    assert.strictEqual(response.voice, 'calm, measured, deliberate');
  });

  it('should maintain conversation history', async () => {
    await interface_.chat('First message');
    await interface_.chat('Second message');
    
    assert.strictEqual(interface_.conversationHistory.length, 4); // 2 user + 2 assistant
  });

  it('should analyze strategy', async () => {
    const result = await interface_.analyzeStrategy('test topic', 'shallow');
    
    assert.strictEqual(result.agent, 'BLACKWXDOW');
    assert.ok(result.analysis);
    assert.ok(result.recommendation);
  });

  it('should assess threats', async () => {
    const result = await interface_.assessThreat('potential danger');
    
    assert.strictEqual(result.agent, 'BLACKWXDOW');
    assert.ok(result.recommendation);
  });

  it('should get perspective', async () => {
    const result = await interface_.getPerspective('interesting topic');
    
    assert.strictEqual(result.agent, 'BLACKWXDOW');
    assert.ok(result.perspective);
    assert.ok(result.philosophy);
    assert.ok(result.catchphrase);
  });
});

describe('JUMPERInterface', () => {
  let interface_;

  beforeEach(() => {
    interface_ = new JUMPERInterface();
  });

  it('should create interface with session', () => {
    assert.ok(interface_.sessionId.startsWith('JP-SESSION-'));
    assert.ok(interface_.core instanceof JUMPER);
    assert.ok(interface_.synthesis instanceof EmergentSynthesisEngine);
  });

  it('should handle chat messages', async () => {
    const response = await interface_.chat('Hello, JUMPER');
    
    assert.strictEqual(response.agent, 'JUMPER');
    assert.ok(response.message);
    assert.ok(typeof response.confidence === 'number');
    assert.strictEqual(response.voice, 'energetic, quick, enthusiastic');
  });

  it('should brainstorm ideas', async () => {
    const result = await interface_.brainstorm('creative problem', { intensity: 'high' });
    
    assert.strictEqual(result.agent, 'JUMPER');
    assert.strictEqual(result.ideasGenerated, 20);
  });

  it('should synthesize domains', async () => {
    const result = await interface_.synthesizeDomains(['art', 'science'], 'create something new');
    
    assert.strictEqual(result.agent, 'JUMPER');
    assert.ok(result.synthesis);
  });

  it('should find opportunities', async () => {
    const result = await interface_.findOpportunities({ market: 'emerging' });
    
    assert.strictEqual(result.agent, 'JUMPER');
    assert.ok(Array.isArray(result.opportunities));
  });

  it('should get perspective', async () => {
    const result = await interface_.getPerspective('interesting topic');
    
    assert.strictEqual(result.agent, 'JUMPER');
    assert.ok(result.perspective);
    assert.ok(result.philosophy);
    assert.ok(result.catchphrase);
  });
});

describe('AdvancedCollective', () => {
  let collective;

  beforeEach(() => {
    collective = new AdvancedCollective();
  });

  it('should create collective with both interfaces', () => {
    assert.ok(collective.blackwxdow instanceof BLACKWXDOWInterface);
    assert.ok(collective.jumper instanceof JUMPERInterface);
    assert.strictEqual(collective.collaborationMode, 'balanced');
  });

  it('should handle collaborative chat', async () => {
    const result = await collective.collaborativeChat('Hello both of you');
    
    assert.strictEqual(result.mode, 'collaborative');
    assert.ok(result.blackwxdow);
    assert.ok(result.jumper);
    assert.ok(result.synthesized);
    assert.ok(result.recommendation);
  });

  it('should solve problems collaboratively', async () => {
    const result = await collective.solveProblem('complex challenge');
    
    assert.ok(result.problem);
    assert.ok(result.strategicFoundation);
    assert.ok(result.creativeApproaches);
    assert.ok(result.hybridSolution);
    assert.ok(typeof result.confidence === 'number');
  });

  it('should conduct debates', async () => {
    const result = await collective.debate('controversial topic', 2);
    
    assert.ok(result.topic);
    assert.strictEqual(result.rounds.length, 2);
    assert.ok(result.conclusion);
    assert.ok(result.winner);
  });

  it('should switch collaboration modes', () => {
    collective.setMode('strategic');
    assert.strictEqual(collective.collaborationMode, 'strategic');
    
    collective.setMode('creative');
    assert.strictEqual(collective.collaborationMode, 'creative');
    
    // Invalid mode should not change
    collective.setMode('invalid');
    assert.strictEqual(collective.collaborationMode, 'creative');
  });
});

describe('Factory Functions', () => {
  it('should create BLACKWXDOW interface', () => {
    const interface_ = createBLACKWXDOWInterface();
    assert.ok(interface_ instanceof BLACKWXDOWInterface);
  });

  it('should create JUMPER interface', () => {
    const interface_ = createJUMPERInterface();
    assert.ok(interface_ instanceof JUMPERInterface);
  });

  it('should create advanced collective', () => {
    const collective = createAdvancedCollective();
    assert.ok(collective instanceof AdvancedCollective);
  });
});
