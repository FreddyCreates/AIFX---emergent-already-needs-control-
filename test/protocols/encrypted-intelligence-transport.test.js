const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

describe('EncryptedIntelligenceTransport', () => {
  let EncryptedIntelligenceTransport;
  let protocol;

  beforeEach(async () => {
    const module = await import('../../protocols/encrypted-intelligence-transport.js');
    EncryptedIntelligenceTransport = module.EncryptedIntelligenceTransport;
    protocol = new EncryptedIntelligenceTransport();
  });

  describe('constructor', () => {
    it('should initialize cipher suite with all sensitivity levels', () => {
      assert.ok(protocol.cipherSuite);
      assert.ok(protocol.cipherSuite.public);
      assert.ok(protocol.cipherSuite.internal);
      assert.ok(protocol.cipherSuite.confidential);
      assert.ok(protocol.cipherSuite.sovereign);
    });

    it('should initialize keyStore with all levels', () => {
      assert.ok(protocol.keyStore.has('public'));
      assert.ok(protocol.keyStore.has('internal'));
      assert.ok(protocol.keyStore.has('confidential'));
      assert.ok(protocol.keyStore.has('sovereign'));
    });

    it('should initialize empty channels map', () => {
      assert.ok(protocol.channels instanceof Map);
      assert.equal(protocol.channels.size, 0);
    });

    it('should initialize metrics to zero', () => {
      assert.equal(protocol.metrics.messagesEncrypted, 0);
      assert.equal(protocol.metrics.bytesTransported, 0);
      assert.equal(protocol.metrics.keyRotations, 0);
    });

    it('should initialize sensitivity distribution', () => {
      assert.equal(protocol.metrics.sensitivityDistribution.public, 0);
      assert.equal(protocol.metrics.sensitivityDistribution.internal, 0);
      assert.equal(protocol.metrics.sensitivityDistribution.confidential, 0);
      assert.equal(protocol.metrics.sensitivityDistribution.sovereign, 0);
    });

    it('should set AES-128 for public level', () => {
      assert.equal(protocol.cipherSuite.public.algorithm, 'AES-128');
      assert.equal(protocol.cipherSuite.public.keySize, 16);
    });

    it('should set AES-256 for internal level', () => {
      assert.equal(protocol.cipherSuite.internal.algorithm, 'AES-256');
      assert.equal(protocol.cipherSuite.internal.keySize, 32);
    });

    it('should set AES-256-GCM for confidential level', () => {
      assert.equal(protocol.cipherSuite.confidential.algorithm, 'AES-256-GCM');
      assert.equal(protocol.cipherSuite.confidential.keySize, 32);
    });

    it('should set AES-256-GCM+Signature for sovereign level', () => {
      assert.equal(protocol.cipherSuite.sovereign.algorithm, 'AES-256-GCM+Signature');
      assert.equal(protocol.cipherSuite.sovereign.keySize, 32);
    });

    it('should generate keys with correct sizes', () => {
      const publicKey = protocol.keyStore.get('public');
      const internalKey = protocol.keyStore.get('internal');
      assert.equal(publicKey.key.length, 32); // 16 bytes = 32 hex chars
      assert.equal(internalKey.key.length, 64); // 32 bytes = 64 hex chars
    });

    it('should set createdAt timestamp for keys', () => {
      const key = protocol.keyStore.get('public');
      assert.ok(key.createdAt);
      assert.ok(key.createdAt <= Date.now());
    });

    it('should set rotation interval based on HEARTBEAT', () => {
      const key = protocol.keyStore.get('public');
      assert.equal(key.rotationInterval, 873 * 100);
    });
  });

  describe('classifySensitivity()', () => {
    it('should classify public content', () => {
      const result = protocol.classifySensitivity('This is a public announcement for press release');
      assert.equal(result, 'public');
    });

    it('should classify internal content', () => {
      const result = protocol.classifySensitivity('This is an internal draft for team only review');
      assert.equal(result, 'internal');
    });

    it('should classify confidential content', () => {
      const result = protocol.classifySensitivity('This is confidential private data with password and ssn');
      assert.equal(result, 'confidential');
    });

    it('should classify sovereign content', () => {
      const result = protocol.classifySensitivity('This is top-secret classified sovereign state-secret national-security eyes-only');
      assert.equal(result, 'sovereign');
    });

    it('should use phi-weighted boost for higher sensitivity', () => {
      // Content with equal mentions should favor higher sensitivity
      const result = protocol.classifySensitivity('public internal confidential sovereign');
      assert.ok(['sovereign', 'confidential', 'internal'].includes(result));
    });

    it('should handle empty content', () => {
      const result = protocol.classifySensitivity('');
      assert.equal(result, 'public');
    });

    it('should handle content with no keywords', () => {
      const result = protocol.classifySensitivity('hello world');
      assert.equal(result, 'public');
    });

    it('should be case insensitive', () => {
      const result1 = protocol.classifySensitivity('CONFIDENTIAL DATA');
      const result2 = protocol.classifySensitivity('confidential data');
      assert.equal(result1, result2);
    });

    it('should handle hyphenated keywords', () => {
      const result = protocol.classifySensitivity('top secret national security');
      assert.equal(result, 'sovereign');
    });

    it('should classify based on keyword density', () => {
      const result = protocol.classifySensitivity('private private private confidential secret');
      assert.equal(result, 'confidential');
    });

    it('should handle personal data keywords', () => {
      const result = protocol.classifySensitivity('personal data ssn credential');
      assert.equal(result, 'confidential');
    });

    it('should handle staff-only content', () => {
      const result = protocol.classifySensitivity('staff internal team-only document');
      assert.equal(result, 'internal');
    });
  });

  describe('encrypt()', () => {
    it('should return ciphertext', () => {
      const result = protocol.encrypt('test message', 'internal');
      assert.ok(result.ciphertext);
    });

    it('should return algorithm', () => {
      const result = protocol.encrypt('test message', 'internal');
      assert.equal(result.algorithm, 'AES-256');
    });

    it('should return IV', () => {
      const result = protocol.encrypt('test message', 'internal');
      assert.ok(result.iv);
      assert.equal(result.iv.length, 32); // 16 bytes = 32 hex chars
    });

    it('should return level', () => {
      const result = protocol.encrypt('test message', 'internal');
      assert.equal(result.level, 'internal');
    });

    it('should return encryptedAt timestamp', () => {
      const before = Date.now();
      const result = protocol.encrypt('test message', 'internal');
      const after = Date.now();
      assert.ok(result.encryptedAt >= before);
      assert.ok(result.encryptedAt <= after);
    });

    it('should add tag for confidential level', () => {
      const result = protocol.encrypt('test message', 'confidential');
      assert.ok(result.tag);
      assert.equal(result.tag.length, 32);
    });

    it('should add tag for sovereign level', () => {
      const result = protocol.encrypt('test message', 'sovereign');
      assert.ok(result.tag);
    });

    it('should not add tag for public level', () => {
      const result = protocol.encrypt('test message', 'public');
      assert.ok(!result.tag);
    });

    it('should not add tag for internal level', () => {
      const result = protocol.encrypt('test message', 'internal');
      assert.ok(!result.tag);
    });

    it('should add signature for sovereign level', () => {
      const result = protocol.encrypt('test message', 'sovereign');
      assert.ok(result.signature);
    });

    it('should not add signature for non-sovereign levels', () => {
      const result = protocol.encrypt('test message', 'confidential');
      assert.ok(!result.signature);
    });

    it('should increment messagesEncrypted metric', () => {
      protocol.encrypt('test message', 'internal');
      assert.equal(protocol.metrics.messagesEncrypted, 1);
    });

    it('should update bytesTransported metric', () => {
      protocol.encrypt('test message', 'internal');
      assert.equal(protocol.metrics.bytesTransported, 12);
    });

    it('should update sensitivityDistribution metric', () => {
      protocol.encrypt('test message', 'confidential');
      assert.equal(protocol.metrics.sensitivityDistribution.confidential, 1);
    });

    it('should handle object payloads', () => {
      const result = protocol.encrypt({ key: 'value' }, 'internal');
      assert.ok(result.ciphertext);
    });

    it('should default to internal level', () => {
      const result = protocol.encrypt('test message');
      assert.equal(result.level, 'internal');
    });

    it('should handle unknown level gracefully', () => {
      const result = protocol.encrypt('test message', 'unknown');
      assert.ok(result.ciphertext);
    });

    it('should produce different ciphertexts for same message', () => {
      const result1 = protocol.encrypt('test message', 'internal');
      const result2 = protocol.encrypt('test message', 'internal');
      assert.notEqual(result1.iv, result2.iv);
    });
  });

  describe('decrypt()', () => {
    it('should decrypt encrypted message', () => {
      const encrypted = protocol.encrypt('test message', 'internal');
      const result = protocol.decrypt(encrypted);
      assert.equal(result.plaintext, 'test message');
    });

    it('should return verified=true for valid message', () => {
      const encrypted = protocol.encrypt('test message', 'internal');
      const result = protocol.decrypt(encrypted);
      assert.equal(result.verified, true);
    });

    it('should return algorithm', () => {
      const encrypted = protocol.encrypt('test message', 'internal');
      const result = protocol.decrypt(encrypted);
      assert.equal(result.algorithm, 'AES-256');
    });

    it('should verify tag for confidential level', () => {
      const encrypted = protocol.encrypt('test message', 'confidential');
      const result = protocol.decrypt(encrypted);
      assert.equal(result.verified, true);
    });

    it('should fail verification with tampered tag', () => {
      const encrypted = protocol.encrypt('test message', 'confidential');
      encrypted.tag = 'tampered' + encrypted.tag.slice(8);
      const result = protocol.decrypt(encrypted);
      assert.equal(result.verified, false);
    });

    it('should verify signature for sovereign level', () => {
      const encrypted = protocol.encrypt('test message', 'sovereign');
      const result = protocol.decrypt(encrypted);
      assert.equal(result.verified, true);
    });

    it('should fail verification with tampered signature', () => {
      const encrypted = protocol.encrypt('test message', 'sovereign');
      encrypted.signature = 'tampered' + encrypted.signature.slice(8);
      const result = protocol.decrypt(encrypted);
      assert.equal(result.verified, false);
    });

    it('should handle missing key gracefully', () => {
      const encrypted = protocol.encrypt('test message', 'internal');
      encrypted.level = 'nonexistent';
      const result = protocol.decrypt(encrypted);
      assert.equal(result.verified, false);
      assert.ok(result.error);
    });

    it('should accept external key', () => {
      const encrypted = protocol.encrypt('test message', 'internal');
      const keyEntry = protocol.keyStore.get('internal');
      const result = protocol.decrypt(encrypted, keyEntry.key);
      assert.equal(result.plaintext, 'test message');
    });

    it('should decrypt object payloads', () => {
      const encrypted = protocol.encrypt({ key: 'value' }, 'internal');
      const result = protocol.decrypt(encrypted);
      assert.equal(result.plaintext, '{"key":"value"}');
    });

    it('should handle corrupted ciphertext', () => {
      const encrypted = protocol.encrypt('test message', 'internal');
      encrypted.ciphertext = 'invalid-base64';
      const result = protocol.decrypt(encrypted);
      assert.equal(result.verified, false);
    });
  });

  describe('rotateKeys()', () => {
    it('should generate new keys for all levels', () => {
      const oldKeys = {};
      for (const level of ['public', 'internal', 'confidential', 'sovereign']) {
        oldKeys[level] = protocol.keyStore.get(level).key;
      }
      protocol.rotateKeys();
      for (const level of ['public', 'internal', 'confidential', 'sovereign']) {
        assert.notEqual(protocol.keyStore.get(level).key, oldKeys[level]);
      }
    });

    it('should update createdAt timestamp', () => {
      const oldTime = protocol.keyStore.get('internal').createdAt;
      // Wait a bit to ensure time difference
      const before = Date.now();
      protocol.rotateKeys();
      const newTime = protocol.keyStore.get('internal').createdAt;
      assert.ok(newTime >= before);
    });

    it('should increment keyRotations metric', () => {
      protocol.rotateKeys();
      assert.equal(protocol.metrics.keyRotations, 1);
      protocol.rotateKeys();
      assert.equal(protocol.metrics.keyRotations, 2);
    });

    it('should accept custom interval', () => {
      protocol.rotateKeys(50000);
      const key = protocol.keyStore.get('internal');
      assert.equal(key.rotationInterval, 50000);
    });

    it('should use default interval of HEARTBEAT*100', () => {
      protocol.rotateKeys();
      const key = protocol.keyStore.get('internal');
      assert.equal(key.rotationInterval, 87300);
    });

    it('should preserve correct key sizes after rotation', () => {
      protocol.rotateKeys();
      assert.equal(protocol.keyStore.get('public').key.length, 32);
      assert.equal(protocol.keyStore.get('internal').key.length, 64);
      assert.equal(protocol.keyStore.get('confidential').key.length, 64);
      assert.equal(protocol.keyStore.get('sovereign').key.length, 64);
    });
  });

  describe('signPayload()', () => {
    it('should return hex string', () => {
      const signature = protocol.signPayload('test payload', 'secret-key');
      assert.match(signature, /^[a-f0-9]+$/i);
    });

    it('should return consistent signature for same input', () => {
      const sig1 = protocol.signPayload('test payload', 'secret-key');
      const sig2 = protocol.signPayload('test payload', 'secret-key');
      assert.equal(sig1, sig2);
    });

    it('should return different signature for different payload', () => {
      const sig1 = protocol.signPayload('payload 1', 'secret-key');
      const sig2 = protocol.signPayload('payload 2', 'secret-key');
      assert.notEqual(sig1, sig2);
    });

    it('should return different signature for different key', () => {
      const sig1 = protocol.signPayload('test payload', 'key-1');
      const sig2 = protocol.signPayload('test payload', 'key-2');
      assert.notEqual(sig1, sig2);
    });

    it('should handle object payloads', () => {
      const signature = protocol.signPayload({ key: 'value' }, 'secret-key');
      assert.ok(signature);
    });

    it('should return 64-character hex string (SHA256)', () => {
      const signature = protocol.signPayload('test', 'key');
      assert.equal(signature.length, 64);
    });
  });

  describe('verifySignature()', () => {
    it('should return true for valid signature', () => {
      const signature = protocol.signPayload('test payload', 'secret-key');
      const result = protocol.verifySignature('test payload', signature, 'secret-key');
      assert.equal(result, true);
    });

    it('should return false for invalid signature', () => {
      const result = protocol.verifySignature('test payload', 'invalid-signature', 'secret-key');
      assert.equal(result, false);
    });

    it('should return false for wrong key', () => {
      const signature = protocol.signPayload('test payload', 'correct-key');
      const result = protocol.verifySignature('test payload', signature, 'wrong-key');
      assert.equal(result, false);
    });

    it('should return false for tampered payload', () => {
      const signature = protocol.signPayload('original payload', 'secret-key');
      const result = protocol.verifySignature('tampered payload', signature, 'secret-key');
      assert.equal(result, false);
    });

    it('should handle object payloads', () => {
      const signature = protocol.signPayload({ key: 'value' }, 'secret-key');
      const result = protocol.verifySignature({ key: 'value' }, signature, 'secret-key');
      assert.equal(result, true);
    });
  });

  describe('createSecureChannel()', () => {
    it('should return channel info', () => {
      const result = protocol.createSecureChannel('endpoint-A', 'endpoint-B');
      assert.ok(result.channelId);
      assert.equal(result.endpointA, 'endpoint-A');
      assert.equal(result.endpointB, 'endpoint-B');
    });

    it('should return established=true', () => {
      const result = protocol.createSecureChannel('A', 'B');
      assert.equal(result.established, true);
    });

    it('should return algorithm', () => {
      const result = protocol.createSecureChannel('A', 'B');
      assert.equal(result.algorithm, 'AES-256-GCM');
    });

    it('should store channel in channels map', () => {
      protocol.createSecureChannel('A', 'B');
      assert.equal(protocol.channels.size, 1);
    });

    it('should generate unique channel ID', () => {
      const result = protocol.createSecureChannel('A', 'B');
      assert.equal(result.channelId, 'A<->B');
    });

    it('should generate shared key', () => {
      protocol.createSecureChannel('A', 'B');
      const channel = protocol.channels.get('A<->B');
      assert.ok(channel.sharedKey);
      assert.equal(channel.sharedKey.length, 64); // 32 bytes = 64 hex chars
    });

    it('should set createdAt timestamp', () => {
      const before = Date.now();
      protocol.createSecureChannel('A', 'B');
      const after = Date.now();
      const channel = protocol.channels.get('A<->B');
      assert.ok(channel.createdAt >= before);
      assert.ok(channel.createdAt <= after);
    });

    it('should initialize messagesExchanged to 0', () => {
      protocol.createSecureChannel('A', 'B');
      const channel = protocol.channels.get('A<->B');
      assert.equal(channel.messagesExchanged, 0);
    });

    it('should handle multiple channels', () => {
      protocol.createSecureChannel('A', 'B');
      protocol.createSecureChannel('C', 'D');
      assert.equal(protocol.channels.size, 2);
    });

    it('should generate unique keys per channel', () => {
      protocol.createSecureChannel('A', 'B');
      protocol.createSecureChannel('C', 'D');
      const channel1 = protocol.channels.get('A<->B');
      const channel2 = protocol.channels.get('C<->D');
      assert.notEqual(channel1.sharedKey, channel2.sharedKey);
    });
  });

  describe('getTransportMetrics()', () => {
    it('should return all metrics', () => {
      const metrics = protocol.getTransportMetrics();
      assert.ok('messagesEncrypted' in metrics);
      assert.ok('bytesTransported' in metrics);
      assert.ok('keyRotations' in metrics);
      assert.ok('sensitivityDistribution' in metrics);
    });

    it('should return copy of metrics', () => {
      const metrics = protocol.getTransportMetrics();
      metrics.messagesEncrypted = 999;
      assert.notEqual(protocol.metrics.messagesEncrypted, 999);
    });

    it('should reflect encryption activity', () => {
      protocol.encrypt('message 1', 'public');
      protocol.encrypt('message 2', 'confidential');
      const metrics = protocol.getTransportMetrics();
      assert.equal(metrics.messagesEncrypted, 2);
      assert.equal(metrics.sensitivityDistribution.public, 1);
      assert.equal(metrics.sensitivityDistribution.confidential, 1);
    });

    it('should reflect key rotation activity', () => {
      protocol.rotateKeys();
      protocol.rotateKeys();
      const metrics = protocol.getTransportMetrics();
      assert.equal(metrics.keyRotations, 2);
    });
  });

  describe('integration scenarios', () => {
    it('should encrypt and decrypt round-trip', () => {
      const original = 'sensitive data requiring encryption';
      const encrypted = protocol.encrypt(original, 'sovereign');
      const decrypted = protocol.decrypt(encrypted);
      assert.equal(decrypted.plaintext, original);
      assert.equal(decrypted.verified, true);
    });

    it('should handle key rotation and still decrypt old messages', () => {
      const encrypted = protocol.encrypt('test message', 'internal');
      const oldKey = protocol.keyStore.get('internal').key;
      protocol.rotateKeys();
      // Use old key for decryption
      const result = protocol.decrypt(encrypted, oldKey);
      assert.equal(result.plaintext, 'test message');
    });

    it('should auto-classify and encrypt accordingly', () => {
      const content = 'This is confidential private data with password';
      const level = protocol.classifySensitivity(content);
      const encrypted = protocol.encrypt(content, level);
      assert.equal(encrypted.level, 'confidential');
      assert.ok(encrypted.tag);
    });

    it('should handle secure channel communication pattern', () => {
      const channelInfo = protocol.createSecureChannel('client', 'server');
      const channel = protocol.channels.get(channelInfo.channelId);
      
      // Encrypt with channel's shared key concept (simulated)
      const message = 'hello from client';
      const encrypted = protocol.encrypt(message, 'confidential');
      const decrypted = protocol.decrypt(encrypted);
      
      assert.equal(decrypted.plaintext, message);
    });
  });
});
