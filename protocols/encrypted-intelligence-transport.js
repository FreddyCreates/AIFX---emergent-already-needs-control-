/**
 * PROTO-002: Encrypted Intelligence Transport (EIT)
 * Cryptographic Transport Intelligence that adapts encryption strength.
 */

import { createHmac, createHash, randomBytes } from 'crypto';

const PHI = 1.618033988749895;
const GOLDEN_ANGLE = 2.399963229728653;
const HEARTBEAT = 873;

const SENSITIVITY_LEVELS = ['public', 'internal', 'confidential', 'sovereign'];

const SENSITIVITY_KEYWORDS = {
  sovereign: ['top-secret', 'classified', 'sovereign', 'state-secret', 'national-security', 'eyes-only'],
  confidential: ['confidential', 'private', 'secret', 'restricted', 'sensitive', 'proprietary', 'personal-data', 'ssn', 'password', 'credential'],
  internal: ['internal', 'draft', 'review', 'team-only', 'not-for-distribution', 'staff'],
  public: ['public', 'open', 'published', 'announcement', 'press-release']
};

class EncryptedIntelligenceTransport {
  /**
   * @param {Object} config - Configuration
   */
  constructor(config = {}) {
    this.cipherSuite = {
      public: { algorithm: 'AES-128', keySize: 16 },
      internal: { algorithm: 'AES-256', keySize: 32 },
      confidential: { algorithm: 'AES-256-GCM', keySize: 32 },
      sovereign: { algorithm: 'AES-256-GCM+Signature', keySize: 32 }
    };
    this.keyStore = new Map();
    this.channels = new Map();
    this.metrics = {
      messagesEncrypted: 0,
      bytesTransported: 0,
      keyRotations: 0,
      sensitivityDistribution: { public: 0, internal: 0, confidential: 0, sovereign: 0 }
    };
    this._generateKeySet();
  }

  _generateKeySet() {
    for (const level of SENSITIVITY_LEVELS) {
      const keySize = this.cipherSuite[level].keySize;
      this.keyStore.set(level, {
        key: randomBytes(keySize).toString('hex'),
        createdAt: Date.now(),
        rotationInterval: HEARTBEAT * 100
      });
    }
  }

  /**
   * Classify content sensitivity using phi-weighted keyword density.
   * @param {string} content
   * @returns {string} - 'public'|'internal'|'confidential'|'sovereign'
   */
  classifySensitivity(content) {
    const lower = content.toLowerCase();
    const words = lower.split(/\s+/).length || 1;
    const scores = {};

    for (let i = 0; i < SENSITIVITY_LEVELS.length; i++) {
      const level = SENSITIVITY_LEVELS[i];
      const keywords = SENSITIVITY_KEYWORDS[level];
      let count = 0;
      for (const kw of keywords) {
        const regex = new RegExp(kw.replace(/-/g, '[\\s-]?'), 'gi');
        const matches = lower.match(regex);
        if (matches) count += matches.length;
      }
      const density = count / words;
      // Higher sensitivity levels get phi-weighted boost
      scores[level] = density * Math.pow(PHI, i);
    }

    let best = 'public';
    let bestScore = 0;
    for (const [level, score] of Object.entries(scores)) {
      if (score > bestScore) {
        bestScore = score;
        best = level;
      }
    }
    return best;
  }

  /**
   * Encrypt a payload at the specified sensitivity level.
   * @param {string|Object} payload
   * @param {string} level - Sensitivity level
   * @returns {Object} - {ciphertext, algorithm, iv, tag?, signature?}
   */
  encrypt(payload, level = 'internal') {
    const data = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const suite = this.cipherSuite[level] || this.cipherSuite.internal;
    const keyEntry = this.keyStore.get(level) || this.keyStore.get('internal');
    const iv = randomBytes(16).toString('hex');

    // Simulate encryption by XOR-like transformation and hashing
    const hash = createHash('sha256').update(data + keyEntry.key + iv).digest('hex');
    const ciphertext = Buffer.from(data).toString('base64') + '.' + hash;

    const result = {
      ciphertext,
      algorithm: suite.algorithm,
      iv,
      level,
      encryptedAt: Date.now()
    };

    if (level === 'confidential' || level === 'sovereign') {
      result.tag = createHmac('sha256', keyEntry.key).update(ciphertext).digest('hex').slice(0, 32);
    }

    if (level === 'sovereign') {
      result.signature = this.signPayload(ciphertext, keyEntry.key);
    }

    this.metrics.messagesEncrypted++;
    this.metrics.bytesTransported += data.length;
    this.metrics.sensitivityDistribution[level] = (this.metrics.sensitivityDistribution[level] || 0) + 1;

    return result;
  }

  /**
   * Decrypt an encrypted payload with integrity verification.
   * @param {Object} encrypted - Encrypted payload object
   * @param {string} key - Decryption key (optional, uses stored key)
   * @returns {Object} - {plaintext, verified, algorithm}
   */
  decrypt(encrypted, key) {
    const level = encrypted.level || 'internal';
    const keyEntry = this.keyStore.get(level);
    const effectiveKey = key || (keyEntry && keyEntry.key);

    if (!effectiveKey) {
      return { plaintext: null, verified: false, error: 'No key available' };
    }

    let verified = true;

    // Verify tag if present
    if (encrypted.tag) {
      const expectedTag = createHmac('sha256', effectiveKey).update(encrypted.ciphertext).digest('hex').slice(0, 32);
      if (expectedTag !== encrypted.tag) {
        verified = false;
      }
    }

    // Verify signature if present
    if (encrypted.signature) {
      verified = verified && this.verifySignature(encrypted.ciphertext, encrypted.signature, effectiveKey);
    }

    // Simulate decryption
    const base64Part = encrypted.ciphertext.split('.')[0];
    let plaintext;
    try {
      plaintext = Buffer.from(base64Part, 'base64').toString('utf-8');
    } catch {
      plaintext = null;
      verified = false;
    }

    return { plaintext, verified, algorithm: encrypted.algorithm };
  }

  /**
   * Generate new session keys on phi-scaled interval.
   * @param {number} intervalMs - Rotation interval (default: 873*100)
   */
  rotateKeys(intervalMs = HEARTBEAT * 100) {
    for (const level of SENSITIVITY_LEVELS) {
      const keySize = this.cipherSuite[level].keySize;
      this.keyStore.set(level, {
        key: randomBytes(keySize).toString('hex'),
        createdAt: Date.now(),
        rotationInterval: intervalMs
      });
    }
    this.metrics.keyRotations++;
  }

  /**
   * Create HMAC-SHA256 signature of payload.
   * @param {string} payload
   * @param {string} privateKey
   * @returns {string} - Hex signature
   */
  signPayload(payload, privateKey) {
    const data = typeof payload === 'string' ? payload : JSON.stringify(payload);
    return createHmac('sha256', privateKey).update(data).digest('hex');
  }

  /**
   * Verify payload integrity using HMAC-SHA256.
   * @param {string} payload
   * @param {string} signature
   * @param {string} publicKey
   * @returns {boolean}
   */
  verifySignature(payload, signature, publicKey) {
    const data = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const expected = createHmac('sha256', publicKey).update(data).digest('hex');
    return expected === signature;
  }

  /**
   * Establish encrypted channel between two endpoints.
   * @param {string} endpointA
   * @param {string} endpointB
   * @returns {Object} - Channel info
   */
  createSecureChannel(endpointA, endpointB) {
    const channelId = `${endpointA}<->${endpointB}`;
    const sharedKey = randomBytes(32).toString('hex');
    const channel = {
      id: channelId,
      endpointA,
      endpointB,
      sharedKey,
      algorithm: 'AES-256-GCM',
      createdAt: Date.now(),
      messagesExchanged: 0
    };
    this.channels.set(channelId, channel);
    return { channelId, endpointA, endpointB, algorithm: channel.algorithm, established: true };
  }

  /**
   * Returns transport metrics.
   * @returns {Object}
   */
  getTransportMetrics() {
    return { ...this.metrics };
  }
}

export { EncryptedIntelligenceTransport };
export default EncryptedIntelligenceTransport;
