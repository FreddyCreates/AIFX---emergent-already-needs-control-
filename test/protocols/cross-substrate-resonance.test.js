const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

describe('CrossSubstrateResonanceProtocol', () => {
  let CrossSubstrateResonanceProtocol, SUBSTRATES;
  let protocol;
  const PHI = 1.618033988749895;

  beforeEach(async () => {
    const module = await import('../../protocols/cross-substrate-resonance-protocol.js');
    CrossSubstrateResonanceProtocol = module.CrossSubstrateResonanceProtocol;
    SUBSTRATES = module.SUBSTRATES;
    protocol = new CrossSubstrateResonanceProtocol('typescript');
  });

  describe('SUBSTRATES constant', () => {
    it('should include motoko', () => {
      assert.ok(SUBSTRATES.includes('motoko'));
    });

    it('should include typescript', () => {
      assert.ok(SUBSTRATES.includes('typescript'));
    });

    it('should include python', () => {
      assert.ok(SUBSTRATES.includes('python'));
    });

    it('should include cpp', () => {
      assert.ok(SUBSTRATES.includes('cpp'));
    });

    it('should include java', () => {
      assert.ok(SUBSTRATES.includes('java'));
    });

    it('should include webworkers', () => {
      assert.ok(SUBSTRATES.includes('webworkers'));
    });

    it('should have 6 substrates', () => {
      assert.equal(SUBSTRATES.length, 6);
    });
  });

  describe('constructor', () => {
    it('should store self substrate', () => {
      assert.equal(protocol.selfSubstrate, 'typescript');
    });

    it('should initialize empty peers map', () => {
      assert.ok(protocol.peers instanceof Map);
      assert.equal(protocol.peers.size, 0);
    });

    it('should initialize empty message queue', () => {
      assert.ok(Array.isArray(protocol.messageQueue));
      assert.equal(protocol.messageQueue.length, 0);
    });

    it('should initialize empty received messages', () => {
      assert.ok(Array.isArray(protocol.receivedMessages));
      assert.equal(protocol.receivedMessages.length, 0);
    });

    it('should initialize empty resonance bonds', () => {
      assert.ok(protocol.resonanceBonds instanceof Map);
    });

    it('should initialize total messages to 0', () => {
      assert.equal(protocol.totalMessages, 0);
    });
  });

  describe('registerPeer()', () => {
    it('should register peer and return substrate', () => {
      const result = protocol.registerPeer('python', 'http://localhost:8000');
      assert.equal(result, 'python');
    });

    it('should add peer to peers map', () => {
      protocol.registerPeer('python', 'http://localhost:8000');
      assert.ok(protocol.peers.has('python'));
    });

    it('should store endpoint', () => {
      protocol.registerPeer('python', 'http://localhost:8000');
      const peer = protocol.peers.get('python');
      assert.equal(peer.endpoint, 'http://localhost:8000');
    });

    it('should initialize lastSeen timestamp', () => {
      const before = Date.now();
      protocol.registerPeer('python', 'http://localhost:8000');
      const after = Date.now();
      const peer = protocol.peers.get('python');
      assert.ok(peer.lastSeen >= before);
      assert.ok(peer.lastSeen <= after);
    });

    it('should initialize message count to 0', () => {
      protocol.registerPeer('python', 'http://localhost:8000');
      const peer = protocol.peers.get('python');
      assert.equal(peer.messageCount, 0);
    });

    it('should initialize resonance strength to 0.5', () => {
      protocol.registerPeer('python', 'http://localhost:8000');
      const peer = protocol.peers.get('python');
      assert.equal(peer.resonanceStrength, 0.5);
    });

    it('should throw for unknown substrate', () => {
      assert.throws(() => {
        protocol.registerPeer('unknown', 'http://localhost:8000');
      });
    });
  });

  describe('createEnvelope()', () => {
    it('should create envelope with id', () => {
      const envelope = protocol.createEnvelope('python', { data: 'test' });
      assert.ok(envelope.id);
    });

    it('should set source to self substrate', () => {
      const envelope = protocol.createEnvelope('python', { data: 'test' });
      assert.equal(envelope.source, 'typescript');
    });

    it('should set target substrate', () => {
      const envelope = protocol.createEnvelope('python', { data: 'test' });
      assert.equal(envelope.target, 'python');
    });

    it('should default type to sync', () => {
      const envelope = protocol.createEnvelope('python', { data: 'test' });
      assert.equal(envelope.type, 'sync');
    });

    it('should accept custom type', () => {
      const envelope = protocol.createEnvelope('python', { data: 'test' }, 'broadcast');
      assert.equal(envelope.type, 'broadcast');
    });

    it('should store payload', () => {
      const envelope = protocol.createEnvelope('python', { key: 'value' });
      assert.deepEqual(envelope.payload, { key: 'value' });
    });

    it('should set timestamp', () => {
      const before = Date.now();
      const envelope = protocol.createEnvelope('python', {});
      const after = Date.now();
      assert.ok(envelope.timestamp >= before);
      assert.ok(envelope.timestamp <= after);
    });

    it('should compute phi signature', () => {
      const envelope = protocol.createEnvelope('python', { data: 'test' });
      assert.ok(typeof envelope.phiSignature === 'number');
    });

    it('should include heartbeat offset', () => {
      const envelope = protocol.createEnvelope('python', {});
      assert.ok(typeof envelope.heartbeatOffset === 'number');
      assert.ok(envelope.heartbeatOffset < 873);
    });
  });

  describe('computePhiSignature()', () => {
    it('should return number', () => {
      const sig = protocol.computePhiSignature({ test: 'data' });
      assert.ok(typeof sig === 'number');
    });

    it('should be consistent for same data', () => {
      const sig1 = protocol.computePhiSignature({ a: 1 });
      const sig2 = protocol.computePhiSignature({ a: 1 });
      assert.equal(sig1, sig2);
    });

    it('should differ for different data', () => {
      const sig1 = protocol.computePhiSignature({ a: 1 });
      const sig2 = protocol.computePhiSignature({ a: 2 });
      assert.notEqual(sig1, sig2);
    });

    it('should use phi in computation', () => {
      const sig = protocol.computePhiSignature({ test: 'data' });
      assert.ok(sig >= 0);
      assert.ok(sig <= PHI);
    });
  });

  describe('send()', () => {
    beforeEach(() => {
      protocol.registerPeer('python', 'http://localhost:8000');
    });

    it('should return envelope id', () => {
      const id = protocol.send('python', { data: 'test' });
      assert.ok(id);
    });

    it('should add to message queue', () => {
      protocol.send('python', { data: 'test' });
      assert.equal(protocol.messageQueue.length, 1);
    });

    it('should increment total messages', () => {
      protocol.send('python', { data: 'test' });
      protocol.send('python', { data: 'test2' });
      assert.equal(protocol.totalMessages, 2);
    });

    it('should increment peer message count', () => {
      protocol.send('python', { data: 'test' });
      const peer = protocol.peers.get('python');
      assert.equal(peer.messageCount, 1);
    });

    it('should increase resonance strength', () => {
      const before = protocol.peers.get('python').resonanceStrength;
      protocol.send('python', { data: 'test' });
      const after = protocol.peers.get('python').resonanceStrength;
      assert.ok(after > before);
    });

    it('should cap resonance at 1', () => {
      for (let i = 0; i < 100; i++) {
        protocol.send('python', { data: i });
      }
      const peer = protocol.peers.get('python');
      assert.ok(peer.resonanceStrength <= 1);
    });
  });

  describe('receive()', () => {
    let envelope;

    beforeEach(() => {
      const pythonProtocol = new CrossSubstrateResonanceProtocol('python');
      pythonProtocol.registerPeer('typescript', 'http://localhost:3000');
      envelope = pythonProtocol.createEnvelope('typescript', { message: 'hello' });
    });

    it('should accept envelope for self', () => {
      const result = protocol.receive(envelope);
      assert.ok(result.accepted);
    });

    it('should reject envelope for wrong target', () => {
      envelope.target = 'python';
      const result = protocol.receive(envelope);
      assert.ok(!result.accepted);
    });

    it('should add to received messages', () => {
      protocol.receive(envelope);
      assert.ok(protocol.receivedMessages.length >= 1);
    });
  });

  describe('broadcast()', () => {
    beforeEach(() => {
      protocol.registerPeer('python', 'http://localhost:8000');
      protocol.registerPeer('java', 'http://localhost:9000');
      protocol.registerPeer('cpp', 'http://localhost:10000');
    });

    it('should send to all peers', () => {
      protocol.broadcast({ announcement: 'test' });
      assert.ok(protocol.messageQueue.length >= 3);
    });
  });

  describe('getResonanceBond()', () => {
    beforeEach(() => {
      protocol.registerPeer('python', 'http://localhost:8000');
      // Send some messages to build resonance
      for (let i = 0; i < 10; i++) {
        protocol.send('python', { data: i });
      }
    });

    it('should return resonance strength', () => {
      const resonance = protocol.getResonanceBond('python');
      assert.ok(typeof resonance === 'number');
    });

    it('should return 0 for unknown peer', () => {
      const resonance = protocol.getResonanceBond('unknown');
      assert.ok(resonance === 0 || resonance === undefined || resonance === null);
    });
  });

  describe('getMetrics()', () => {
    it('should return metrics object', () => {
      const metrics = protocol.getMetrics();
      assert.ok(metrics);
    });

    it('should include total messages', () => {
      protocol.registerPeer('python', 'http://localhost:8000');
      protocol.send('python', {});
      const metrics = protocol.getMetrics();
      assert.ok(metrics.totalMessages >= 1 || metrics.messageCount >= 1);
    });

    it('should include peer count', () => {
      protocol.registerPeer('python', 'http://localhost:8000');
      const metrics = protocol.getMetrics();
      assert.ok(metrics.peerCount >= 1 || metrics.peers >= 1);
    });
  });

  describe('integration', () => {
    it('should handle cross-substrate communication', () => {
      // Setup TypeScript protocol
      const tsProtocol = new CrossSubstrateResonanceProtocol('typescript');
      tsProtocol.registerPeer('python', 'http://localhost:8000');
      
      // Setup Python protocol
      const pyProtocol = new CrossSubstrateResonanceProtocol('python');
      pyProtocol.registerPeer('typescript', 'http://localhost:3000');
      
      // Send from TypeScript to Python
      const msgId = tsProtocol.send('python', { request: 'process data' });
      assert.ok(msgId);
      
      // Get envelope from queue and deliver to Python
      const envelope = tsProtocol.messageQueue[0];
      envelope.target = 'python'; // Ensure correct target
      const result = pyProtocol.receive(envelope);
      
      assert.ok(result.accepted);
    });

    it('should build resonance over time', () => {
      protocol.registerPeer('python', 'http://localhost:8000');
      
      // Send many messages
      for (let i = 0; i < 50; i++) {
        protocol.send('python', { iteration: i });
      }
      
      // Check resonance has increased
      const peer = protocol.peers.get('python');
      assert.ok(peer.resonanceStrength > 0.5);
    });
  });
});
