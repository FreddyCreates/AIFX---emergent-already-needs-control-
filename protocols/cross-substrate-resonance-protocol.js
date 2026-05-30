/**
 * PROTO-207: Cross-Substrate Resonance Protocol (CSRP)
 * Communication between 6 organism substrates: Motoko, TypeScript, Python, C++, Java, WebWorkers
 * 
 * Uses phi-encoded message envelopes and resonance bonding for cross-substrate sync.
 */

const PHI = 1.618033988749895;
const HEARTBEAT = 873;

const SUBSTRATES = ['motoko', 'typescript', 'python', 'cpp', 'java', 'webworkers'];

class CrossSubstrateResonanceProtocol {
  constructor(selfSubstrate) {
    this.selfSubstrate = selfSubstrate;
    this.peers = new Map();
    this.messageQueue = [];
    this.receivedMessages = [];
    this.resonanceBonds = new Map();
    this.totalMessages = 0;
  }

  registerPeer(substrate, endpoint) {
    if (!SUBSTRATES.includes(substrate)) {
      throw new Error(`Unknown substrate: ${substrate}`);
    }
    
    this.peers.set(substrate, {
      substrate,
      endpoint,
      lastSeen: Date.now(),
      messageCount: 0,
      resonanceStrength: 0.5,
    });
    
    return substrate;
  }

  createEnvelope(targetSubstrate, payload, type = 'sync') {
    return {
      id: `${this.selfSubstrate}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      source: this.selfSubstrate,
      target: targetSubstrate,
      type,
      payload,
      timestamp: Date.now(),
      phiSignature: this.computePhiSignature(payload),
      heartbeatOffset: Date.now() % HEARTBEAT,
    };
  }

  computePhiSignature(payload) {
    const str = JSON.stringify(payload);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
    }
    return Math.abs(hash % 1000000) * PHI / 1000000;
  }

  send(targetSubstrate, payload, type = 'sync') {
    const envelope = this.createEnvelope(targetSubstrate, payload, type);
    this.messageQueue.push(envelope);
    this.totalMessages++;
    
    // Update resonance with target
    const peer = this.peers.get(targetSubstrate);
    if (peer) {
      peer.messageCount++;
      peer.resonanceStrength = Math.min(1, peer.resonanceStrength + 0.01 * PHI);
    }
    
    return envelope.id;
  }

  receive(envelope) {
    if (envelope.target !== this.selfSubstrate) {
      return { accepted: false, reason: 'Wrong target substrate' };
    }
    
    // Validate phi signature
    const expectedSig = this.computePhiSignature(envelope.payload);
    const sigValid = Math.abs(envelope.phiSignature - expectedSig) < 0.001;
    
    if (!sigValid) {
      return { accepted: false, reason: 'Invalid phi signature' };
    }
    
    this.receivedMessages.push({
      ...envelope,
      receivedAt: Date.now(),
    });
    
    // Update peer info
    const peer = this.peers.get(envelope.source);
    if (peer) {
      peer.lastSeen = Date.now();
      peer.resonanceStrength = Math.min(1, peer.resonanceStrength + 0.02 * PHI);
    }
    
    return { accepted: true, envelope };
  }

  bond(substrate1, substrate2) {
    const key = [substrate1, substrate2].sort().join('<->');
    this.resonanceBonds.set(key, {
      substrates: [substrate1, substrate2],
      strength: PHI - 1,
      createdAt: Date.now(),
    });
    return key;
  }

  getResonanceField() {
    const peers = [];
    for (const [substrate, peer] of this.peers) {
      peers.push({
        substrate,
        resonanceStrength: peer.resonanceStrength,
        lastSeen: peer.lastSeen,
        messageCount: peer.messageCount,
      });
    }
    
    const bonds = [];
    for (const [key, bond] of this.resonanceBonds) {
      bonds.push({
        key,
        substrates: bond.substrates,
        strength: bond.strength,
      });
    }
    
    return {
      self: this.selfSubstrate,
      peers,
      bonds,
      totalMessages: this.totalMessages,
      queueLength: this.messageQueue.length,
    };
  }

  flush() {
    const messages = [...this.messageQueue];
    this.messageQueue = [];
    return messages;
  }

  getMetrics() {
    return {
      selfSubstrate: this.selfSubstrate,
      peerCount: this.peers.size,
      totalMessages: this.totalMessages,
      queueLength: this.messageQueue.length,
      receivedCount: this.receivedMessages.length,
      bondCount: this.resonanceBonds.size,
      substrates: SUBSTRATES,
      phi: PHI,
      heartbeat: HEARTBEAT,
    };
  }
}

export { CrossSubstrateResonanceProtocol, SUBSTRATES };
export default CrossSubstrateResonanceProtocol;
