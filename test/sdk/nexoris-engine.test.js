const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

describe('NexorisEngine', () => {
  let NexorisEngine;
  let engine;
  const PHI = 1.618033988749895;
  const PHI_INV = 1 / PHI;
  const REGISTERS = ['cognitive', 'affective', 'somatic', 'sovereign'];
  const DIMENSIONS = ['awareness', 'coherence', 'resonance', 'entropy'];

  beforeEach(async () => {
    const module = await import('../../sdk/engines/nexoris-engine.js');
    NexorisEngine = module.NexorisEngine;
    engine = new NexorisEngine();
  });

  describe('constructor', () => {
    it('should initialize 4-register state architecture', () => {
      assert.ok(engine.state);
      assert.ok(engine.state.cognitive);
      assert.ok(engine.state.affective);
      assert.ok(engine.state.somatic);
      assert.ok(engine.state.sovereign);
    });

    it('should initialize cognitive register defaults', () => {
      const cog = engine.state.cognitive;
      assert.equal(cog.awareness, 1.0);
      assert.equal(cog.coherence, 1.0);
      assert.ok(Math.abs(cog.resonance - PHI_INV) < 0.0001);
      assert.equal(cog.entropy, 0.0);
    });

    it('should initialize affective register defaults', () => {
      const aff = engine.state.affective;
      assert.ok(Math.abs(aff.awareness - PHI_INV) < 0.0001);
      assert.equal(aff.coherence, 1.0);
      assert.equal(aff.resonance, 1.0);
      assert.equal(aff.entropy, 0.0);
    });

    it('should initialize somatic register defaults', () => {
      const som = engine.state.somatic;
      assert.equal(som.awareness, 1.0);
      assert.ok(Math.abs(som.coherence - PHI_INV) < 0.0001);
      assert.equal(som.resonance, 1.0);
      assert.equal(som.entropy, 0.0);
    });

    it('should initialize sovereign register with PHI values', () => {
      const sov = engine.state.sovereign;
      assert.ok(Math.abs(sov.awareness - PHI) < 0.0001);
      assert.ok(Math.abs(sov.coherence - PHI) < 0.0001);
      assert.ok(Math.abs(sov.resonance - PHI) < 0.0001);
      assert.equal(sov.entropy, 0.0);
    });

    it('should initialize empty history', () => {
      assert.ok(Array.isArray(engine.history));
      assert.equal(engine.history.length, 0);
    });

    it('should set history limit', () => {
      assert.equal(engine.historyLimit, 100);
    });

    it('should initialize version to 0', () => {
      assert.equal(engine.version, 0);
    });

    it('should initialize empty subscribers map', () => {
      assert.ok(engine.subscribers instanceof Map);
      assert.equal(engine.subscribers.size, 0);
    });

    it('should initialize empty syncPeers map', () => {
      assert.ok(engine.syncPeers instanceof Map);
      assert.equal(engine.syncPeers.size, 0);
    });

    it('should initialize empty stores map', () => {
      assert.ok(engine.stores instanceof Map);
      assert.equal(engine.stores.size, 0);
    });
  });

  describe('get()', () => {
    it('should return cognitive awareness', () => {
      const value = engine.get('cognitive', 'awareness');
      assert.equal(value, 1.0);
    });

    it('should return affective coherence', () => {
      const value = engine.get('affective', 'coherence');
      assert.equal(value, 1.0);
    });

    it('should return somatic resonance', () => {
      const value = engine.get('somatic', 'resonance');
      assert.equal(value, 1.0);
    });

    it('should return sovereign entropy', () => {
      const value = engine.get('sovereign', 'entropy');
      assert.equal(value, 0.0);
    });

    it('should throw for invalid register', () => {
      assert.throws(() => engine.get('invalid', 'awareness'), /Invalid register/);
    });

    it('should throw for invalid dimension', () => {
      assert.throws(() => engine.get('cognitive', 'invalid'), /Invalid dimension/);
    });

    for (const reg of REGISTERS) {
      for (const dim of DIMENSIONS) {
        it(`should get ${reg}.${dim}`, () => {
          const value = engine.get(reg, dim);
          assert.ok(typeof value === 'number');
        });
      }
    }
  });

  describe('set()', () => {
    it('should set cognitive awareness', () => {
      engine.set('cognitive', 'awareness', 0.5, true);
      assert.equal(engine.state.cognitive.awareness, 0.5);
    });

    it('should apply phi-weighted transition by default', () => {
      engine.set('cognitive', 'awareness', 0.0);
      // Should not be 0 immediately due to phi-weighted transition
      assert.notEqual(engine.state.cognitive.awareness, 0.0);
    });

    it('should set immediately when immediate=true', () => {
      engine.set('cognitive', 'awareness', 0.5, true);
      assert.equal(engine.state.cognitive.awareness, 0.5);
    });

    it('should increment version', () => {
      const before = engine.version;
      engine.set('cognitive', 'awareness', 0.5, true);
      assert.ok(engine.version > before);
    });

    it('should record history', () => {
      engine.set('cognitive', 'awareness', 0.5, true);
      assert.ok(engine.history.length > 0);
    });

    it('should return new value', () => {
      const result = engine.set('cognitive', 'awareness', 0.5, true);
      assert.equal(result, 0.5);
    });

    it('should throw for invalid register', () => {
      assert.throws(() => engine.set('invalid', 'awareness', 0.5), /Invalid register/);
    });

    it('should throw for invalid dimension', () => {
      assert.throws(() => engine.set('cognitive', 'invalid', 0.5), /Invalid dimension/);
    });

    it('should clamp to valid range', () => {
      engine.set('cognitive', 'awareness', -5, true);
      assert.ok(engine.state.cognitive.awareness >= 0);
    });

    it('should notify subscribers', () => {
      let notified = false;
      engine.subscribe('cognitive', 'awareness', () => { notified = true; });
      engine.set('cognitive', 'awareness', 0.5, true);
      assert.ok(notified);
    });
  });

  describe('updateRegister()', () => {
    it('should update all dimensions of a register', () => {
      engine.updateRegister('cognitive', {
        awareness: 0.5,
        coherence: 0.6,
        resonance: 0.7,
        entropy: 0.1
      }, true);
      assert.equal(engine.state.cognitive.awareness, 0.5);
      assert.equal(engine.state.cognitive.coherence, 0.6);
      assert.equal(engine.state.cognitive.resonance, 0.7);
      assert.equal(engine.state.cognitive.entropy, 0.1);
    });

    it('should apply phi-weighted transition by default', () => {
      const before = engine.state.cognitive.awareness;
      engine.updateRegister('cognitive', { awareness: 0.0 });
      // Should not be 0 due to transition
      assert.notEqual(engine.state.cognitive.awareness, 0.0);
    });

    it('should increment version', () => {
      const before = engine.version;
      engine.updateRegister('cognitive', { awareness: 0.5 }, true);
      assert.ok(engine.version > before);
    });
  });

  describe('getSnapshot()', () => {
    it('should return complete state', () => {
      const snapshot = engine.getSnapshot();
      assert.ok(snapshot.cognitive);
      assert.ok(snapshot.affective);
      assert.ok(snapshot.somatic);
      assert.ok(snapshot.sovereign);
    });

    it('should return copy not reference', () => {
      const snapshot = engine.getSnapshot();
      snapshot.cognitive.awareness = 999;
      assert.notEqual(engine.state.cognitive.awareness, 999);
    });

    it('should include all dimensions', () => {
      const snapshot = engine.getSnapshot();
      for (const dim of DIMENSIONS) {
        assert.ok(dim in snapshot.cognitive);
      }
    });
  });

  describe('subscribe()', () => {
    it('should register callback for register/dimension', () => {
      engine.subscribe('cognitive', 'awareness', () => {});
      const key = 'cognitive:awareness';
      assert.ok(engine.subscribers.has(key));
    });

    it('should return unsubscribe function', () => {
      const unsub = engine.subscribe('cognitive', 'awareness', () => {});
      assert.ok(typeof unsub === 'function');
    });

    it('should unsubscribe when called', () => {
      const unsub = engine.subscribe('cognitive', 'awareness', () => {});
      unsub();
      const key = 'cognitive:awareness';
      const subs = engine.subscribers.get(key);
      assert.ok(!subs || subs.length === 0);
    });

    it('should call callback on state change', () => {
      let called = false;
      engine.subscribe('cognitive', 'awareness', () => { called = true; });
      engine.set('cognitive', 'awareness', 0.5, true);
      assert.ok(called);
    });

    it('should pass new value to callback', () => {
      let receivedValue = null;
      engine.subscribe('cognitive', 'awareness', (val) => { receivedValue = val; });
      engine.set('cognitive', 'awareness', 0.5, true);
      assert.equal(receivedValue, 0.5);
    });
  });

  describe('createStore()', () => {
    it('should create custom store', () => {
      engine.createStore('test', { key: 'value' });
      assert.ok(engine.stores.has('test'));
    });

    it('should store initial value', () => {
      engine.createStore('test', { key: 'value' });
      const store = engine.stores.get('test');
      assert.deepEqual(store.value, { key: 'value' });
    });

    it('should return store reference', () => {
      const store = engine.createStore('test', { key: 'value' });
      assert.ok(store);
      assert.deepEqual(store.value, { key: 'value' });
    });
  });

  describe('getStore()', () => {
    it('should retrieve existing store', () => {
      engine.createStore('test', { key: 'value' });
      const store = engine.getStore('test');
      assert.deepEqual(store.value, { key: 'value' });
    });

    it('should return undefined for non-existent store', () => {
      const store = engine.getStore('nonexistent');
      assert.equal(store, undefined);
    });
  });

  describe('updateStore()', () => {
    it('should update store value', () => {
      engine.createStore('test', { key: 'value' });
      engine.updateStore('test', { key: 'updated' });
      const store = engine.getStore('test');
      assert.equal(store.value.key, 'updated');
    });

    it('should increment store version', () => {
      engine.createStore('test', { key: 'value' });
      const before = engine.getStore('test').version;
      engine.updateStore('test', { key: 'updated' });
      const after = engine.getStore('test').version;
      assert.ok(after > before);
    });
  });

  describe('clamp()', () => {
    it('should return value within range', () => {
      assert.equal(engine.clamp(0.5, 0, 1), 0.5);
    });

    it('should clamp to min', () => {
      assert.equal(engine.clamp(-1, 0, 1), 0);
    });

    it('should clamp to max', () => {
      assert.equal(engine.clamp(2, 0, 1), 1);
    });

    it('should handle equal min and max', () => {
      assert.equal(engine.clamp(5, 1, 1), 1);
    });
  });

  describe('getHealth()', () => {
    it('should return health object', () => {
      const health = engine.getHealth();
      assert.ok(typeof health === 'object');
    });

    it('should include register health', () => {
      const health = engine.getHealth();
      assert.ok('cognitive' in health);
      assert.ok('affective' in health);
      assert.ok('somatic' in health);
      assert.ok('sovereign' in health);
    });

    it('should include overall score', () => {
      const health = engine.getHealth();
      assert.ok('overall' in health);
    });

    it('should have overall between 0 and 1', () => {
      const health = engine.getHealth();
      assert.ok(health.overall >= 0);
      assert.ok(health.overall <= PHI);
    });
  });

  describe('history operations', () => {
    it('should limit history size', () => {
      // Set many values to fill history
      for (let i = 0; i < 150; i++) {
        engine.set('cognitive', 'awareness', i * 0.01, true);
      }
      assert.ok(engine.history.length <= engine.historyLimit);
    });

    it('should record state changes', () => {
      engine.set('cognitive', 'awareness', 0.5, true);
      assert.ok(engine.history.length > 0);
    });

    it('should include register in history', () => {
      engine.set('cognitive', 'awareness', 0.5, true);
      assert.equal(engine.history[0].register, 'cognitive');
    });

    it('should include dimension in history', () => {
      engine.set('cognitive', 'awareness', 0.5, true);
      assert.equal(engine.history[0].dimension, 'awareness');
    });
  });

  describe('integration', () => {
    it('should maintain consistent state across operations', () => {
      engine.set('cognitive', 'awareness', 0.8, true);
      engine.set('cognitive', 'coherence', 0.9, true);
      
      const snapshot = engine.getSnapshot();
      assert.equal(snapshot.cognitive.awareness, 0.8);
      assert.equal(snapshot.cognitive.coherence, 0.9);
    });

    it('should notify all subscribers on update', () => {
      const notifications = [];
      engine.subscribe('cognitive', 'awareness', (v) => notifications.push(['awareness', v]));
      engine.subscribe('cognitive', 'coherence', (v) => notifications.push(['coherence', v]));
      
      engine.updateRegister('cognitive', { awareness: 0.5, coherence: 0.6 }, true);
      
      assert.ok(notifications.length >= 2);
    });

    it('should track version across all changes', () => {
      const initialVersion = engine.version;
      
      engine.set('cognitive', 'awareness', 0.5, true);
      engine.set('affective', 'resonance', 0.6, true);
      engine.set('somatic', 'entropy', 0.1, true);
      
      assert.equal(engine.version, initialVersion + 3);
    });
  });
});
