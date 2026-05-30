/**
 * Crypto & Security Worker — In-Browser Cryptographic Operations
 *
 * Permanent Web Worker that provides:
 * - AES-256-GCM encryption/decryption via SubtleCrypto
 * - PBKDF2 key derivation (100K iterations)
 * - SHA-256/SHA-512 hashing
 * - HMAC message authentication
 * - Secure random token generation
 * - Wire token creation for encrypted intelligence transport
 *
 * This worker handles ALL cryptographic operations off the main thread.
 * No crypto on the UI thread. Ever. That's what a product does.
 *
 * Protocol: postMessage
 *   Main → Worker: { type: 'encrypt', plaintext: '...', password: '...' }
 *   Main → Worker: { type: 'decrypt', ciphertext: '...', password: '...', iv: '...', salt: '...' }
 *   Main → Worker: { type: 'hash', data: '...', algorithm: 'SHA-256'|'SHA-512' }
 *   Main → Worker: { type: 'hmac', data: '...', key: '...' }
 *   Main → Worker: { type: 'derive-key', password: '...', salt: '...' }
 *   Main → Worker: { type: 'generate-token', length: N }
 *   Main → Worker: { type: 'wire-token', wireId: '...', engineId: '...' }
 *   Main → Worker: { type: 'verify-hash', data: '...', expectedHash: '...' }
 *   Worker → Main: { type: 'encrypted', ... }
 *   Worker → Main: { type: 'decrypted', ... }
 *   Worker → Main: { type: 'hashed', ... }
 *   Worker → Main: { type: 'token', ... }
 *   Worker → Main: { type: 'heartbeat', ... }
 */

'use strict';
importScripts('neuro-core.js');

var PHI = 1.618033988749895;
var HEARTBEAT_MS = 873;
var beatCount = 0;
var running = true;
var PBKDF2_ITERATIONS = 100000;

/* ════════════════════════════════════════════════════════════════
   Metrics
   ════════════════════════════════════════════════════════════════ */

var cryptoMetrics = {
  totalEncryptions: 0,
  totalDecryptions: 0,
  totalHashes: 0,
  totalTokens: 0,
  totalKeyDerivations: 0,
  totalErrors: 0,
  totalBytesProcessed: 0
};

/* ════════════════════════════════════════════════════════════════
   Helpers — ArrayBuffer ↔ Hex conversion
   ════════════════════════════════════════════════════════════════ */

function bufToHex(buf) {
  var arr = new Uint8Array(buf);
  var hex = '';
  for (var i = 0; i < arr.length; i++) {
    var h = arr[i].toString(16);
    hex += h.length === 1 ? '0' + h : h;
  }
  return hex;
}

function hexToBuf(hex) {
  var arr = new Uint8Array(hex.length / 2);
  for (var i = 0; i < hex.length; i += 2) {
    arr[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return arr.buffer;
}

function strToBytes(str) {
  return new TextEncoder().encode(str);
}

function bytesToStr(buf) {
  return new TextDecoder().decode(buf);
}

/* ════════════════════════════════════════════════════════════════
   Key Derivation — PBKDF2
   ════════════════════════════════════════════════════════════════ */

function deriveKey(password, salt) {
  var enc = strToBytes(password);
  var saltBuf = salt ? hexToBuf(salt) : crypto.getRandomValues(new Uint8Array(16));
  var saltHex = salt || bufToHex(saltBuf);

  return crypto.subtle.importKey('raw', enc, 'PBKDF2', false, ['deriveKey']).then(function (keyMaterial) {
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: saltBuf instanceof ArrayBuffer ? new Uint8Array(saltBuf) : saltBuf, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    ).then(function (key) {
      return { key: key, salt: saltHex };
    });
  });
}

/* ════════════════════════════════════════════════════════════════
   AES-256-GCM Encrypt/Decrypt
   ════════════════════════════════════════════════════════════════ */

function encrypt(plaintext, password) {
  var iv = crypto.getRandomValues(new Uint8Array(12));
  var plaintextBuf = strToBytes(plaintext);
  cryptoMetrics.totalBytesProcessed += plaintextBuf.length;

  return deriveKey(password).then(function (result) {
    return crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      result.key,
      plaintextBuf
    ).then(function (ciphertext) {
      cryptoMetrics.totalEncryptions++;
      return {
        ciphertext: bufToHex(ciphertext),
        iv: bufToHex(iv),
        salt: result.salt,
        algorithm: 'AES-256-GCM',
        iterations: PBKDF2_ITERATIONS
      };
    });
  });
}

function decrypt(ciphertextHex, password, ivHex, saltHex) {
  var cipherBuf = hexToBuf(ciphertextHex);
  var ivBuf = new Uint8Array(hexToBuf(ivHex));

  return deriveKey(password, saltHex).then(function (result) {
    return crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: ivBuf },
      result.key,
      cipherBuf
    ).then(function (plainBuf) {
      cryptoMetrics.totalDecryptions++;
      cryptoMetrics.totalBytesProcessed += plainBuf.byteLength;
      return { plaintext: bytesToStr(plainBuf) };
    });
  });
}

/* ════════════════════════════════════════════════════════════════
   Hashing — SHA-256 / SHA-512
   ════════════════════════════════════════════════════════════════ */

function hash(data, algorithm) {
  algorithm = algorithm || 'SHA-256';
  var dataBuf = strToBytes(data);
  cryptoMetrics.totalBytesProcessed += dataBuf.length;

  return crypto.subtle.digest(algorithm, dataBuf).then(function (hashBuf) {
    cryptoMetrics.totalHashes++;
    return { hash: bufToHex(hashBuf), algorithm: algorithm, inputLength: data.length };
  });
}

function verifyHash(data, expectedHash, algorithm) {
  return hash(data, algorithm).then(function (result) {
    return { verified: result.hash === expectedHash, hash: result.hash, expected: expectedHash };
  });
}

/* ════════════════════════════════════════════════════════════════
   HMAC — Message Authentication
   ════════════════════════════════════════════════════════════════ */

function hmac(data, keyStr) {
  var keyBuf = strToBytes(keyStr);
  var dataBuf = strToBytes(data);

  return crypto.subtle.importKey(
    'raw', keyBuf, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  ).then(function (key) {
    return crypto.subtle.sign('HMAC', key, dataBuf).then(function (sig) {
      return { hmac: bufToHex(sig), algorithm: 'HMAC-SHA-256' };
    });
  });
}

/* ════════════════════════════════════════════════════════════════
   Token Generation
   ════════════════════════════════════════════════════════════════ */

function generateToken(length) {
  length = length || 32;
  var buf = crypto.getRandomValues(new Uint8Array(length));
  cryptoMetrics.totalTokens++;
  return { token: bufToHex(buf), length: length, entropy: length * 8 };
}

function wireToken(wireId, engineId) {
  var payload = wireId + ':' + engineId + ':' + Date.now();
  var buf = crypto.getRandomValues(new Uint8Array(16));
  var nonce = bufToHex(buf);
  cryptoMetrics.totalTokens++;

  return hash(payload + ':' + nonce, 'SHA-256').then(function (result) {
    return {
      wireToken: result.hash.substring(0, 64),
      wireId: wireId,
      engineId: engineId,
      nonce: nonce,
      timestamp: Date.now(),
      expiresAt: Date.now() + 3600000  // 1 hour
    };
  });
}

/* ════════════════════════════════════════════════════════════════
   Message handler
   ════════════════════════════════════════════════════════════════ */

self.onmessage = function (e) {
  var msg = e.data;
  neuro.onMessage(msg.type);

  switch (msg.type) {
    case 'encrypt': {
      encrypt(msg.plaintext || '', msg.password || 'sovereign').then(function (result) {
        self.postMessage({ type: 'encrypted', data: result });
      }).catch(function (err) {
        cryptoMetrics.totalErrors++;
        self.postMessage({ type: 'crypto-error', error: err.message, operation: 'encrypt' });
      });
      break;
    }

    case 'decrypt': {
      decrypt(msg.ciphertext || '', msg.password || 'sovereign', msg.iv || '', msg.salt || '').then(function (result) {
        self.postMessage({ type: 'decrypted', data: result });
      }).catch(function (err) {
        cryptoMetrics.totalErrors++;
        self.postMessage({ type: 'crypto-error', error: err.message, operation: 'decrypt' });
      });
      break;
    }

    case 'hash': {
      hash(msg.data || '', msg.algorithm).then(function (result) {
        self.postMessage({ type: 'hashed', data: result });
      }).catch(function (err) {
        cryptoMetrics.totalErrors++;
        self.postMessage({ type: 'crypto-error', error: err.message, operation: 'hash' });
      });
      break;
    }

    case 'verify-hash': {
      verifyHash(msg.data || '', msg.expectedHash || '', msg.algorithm).then(function (result) {
        self.postMessage({ type: 'hash-verified', data: result });
      }).catch(function (err) {
        cryptoMetrics.totalErrors++;
        self.postMessage({ type: 'crypto-error', error: err.message, operation: 'verify' });
      });
      break;
    }

    case 'hmac': {
      hmac(msg.data || '', msg.key || 'sovereign-key').then(function (result) {
        self.postMessage({ type: 'hmac-result', data: result });
      }).catch(function (err) {
        cryptoMetrics.totalErrors++;
        self.postMessage({ type: 'crypto-error', error: err.message, operation: 'hmac' });
      });
      break;
    }

    case 'derive-key': {
      deriveKey(msg.password || 'sovereign', msg.salt).then(function (result) {
        cryptoMetrics.totalKeyDerivations++;
        self.postMessage({ type: 'key-derived', salt: result.salt, iterations: PBKDF2_ITERATIONS });
      }).catch(function (err) {
        cryptoMetrics.totalErrors++;
        self.postMessage({ type: 'crypto-error', error: err.message, operation: 'derive-key' });
      });
      break;
    }

    case 'generate-token': {
      var tokenResult = generateToken(msg.length);
      self.postMessage({ type: 'token', data: tokenResult });
      break;
    }

    case 'wire-token': {
      wireToken(msg.wireId || 'wire-0', msg.engineId || 'AIF-001').then(function (result) {
        self.postMessage({ type: 'wire-token-result', data: result });
      }).catch(function (err) {
        cryptoMetrics.totalErrors++;
        self.postMessage({ type: 'crypto-error', error: err.message, operation: 'wire-token' });
      });
      break;
    }

    case 'stats': {
      self.postMessage({ type: 'crypto-stats', data: cryptoMetrics });
      break;
    }

    case 'neuro-signal':
      neuro.receiveNeuroSignal(msg);
      break;
    case 'stop':
      running = false;
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      self.postMessage({ type: 'stopped' });
      break;
  }
  neuro.onMessageDone();
};

/* ════════════════════════════════════════════════════════════════
   Heartbeat — permanent 873ms pulse
   ════════════════════════════════════════════════════════════════ */

var neuro = new NeuroCore('crypto');

var heartbeatInterval = setInterval(function () {
  if (!running) return;
  beatCount++;

  var payload = {
    type: 'heartbeat',
    worker: 'crypto',
    beat: beatCount,
    timestamp: Date.now(),
    status: 'alive'
  };

  // Add stats every 10th beat
  if (beatCount % 10 === 0) {
    payload.stats = cryptoMetrics;
  }

  payload.neuro = neuro.pulse();
  self.postMessage(payload);
}, HEARTBEAT_MS);
