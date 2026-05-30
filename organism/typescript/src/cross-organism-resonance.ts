import type {
  PeerOrganism,
  ResonanceCallback,
  ResonanceField,
  ResonanceSignal,
  Unsubscribe,
} from './types.js';
import { PHI, GOLDEN_ANGLE } from './types.js';

export class CrossOrganismResonance {
  private readonly selfId: string;
  private readonly peers: Map<string, PeerOrganism> = new Map();
  private readonly callbacks: Set<ResonanceCallback> = new Set();
  private readonly signalHistory: ResonanceSignal[] = [];
  private static readonly MAX_HISTORY = 1000;

  constructor(selfId: string) {
    this.selfId = selfId;
  }

  registerOrganism(peer: PeerOrganism): void {
    this.peers.set(peer.id, peer);
  }

  unregisterOrganism(peerId: string): boolean {
    return this.peers.delete(peerId);
  }

  resonate(targetId: string, payload: Readonly<Record<string, unknown>>): ResonanceSignal {
    const peer = this.peers.get(targetId);
    if (!peer) {
      throw new Error(`Peer organism not found: ${targetId}`);
    }

    const signal: ResonanceSignal = {
      sourceId: this.selfId,
      targetId,
      frequency: this.computeResonanceFrequency(peer),
      amplitude: peer.resonanceStrength,
      phase: (this.signalHistory.length * GOLDEN_ANGLE) % 360,
      payload,
      timestamp: Date.now(),
    };

    this.recordSignal(signal);
    return signal;
  }

  onResonance(callback: ResonanceCallback): Unsubscribe {
    this.callbacks.add(callback);
    return () => {
      this.callbacks.delete(callback);
    };
  }

  async receiveSignal(signal: ResonanceSignal): Promise<void> {
    this.recordSignal(signal);

    // Update peer's lastSeen timestamp
    const peer = this.peers.get(signal.sourceId);
    if (peer) {
      this.peers.set(signal.sourceId, {
        ...peer,
        lastSeen: signal.timestamp,
        resonanceStrength: Math.min(1, peer.resonanceStrength + 0.01 * PHI),
      });
    }

    const promises: Array<void | Promise<void>> = [];
    for (const cb of this.callbacks) {
      try {
        promises.push(cb(signal));
      } catch {
        // Callbacks must not break signal processing
      }
    }
    await Promise.allSettled(promises);
  }

  synchronize(): ResonanceField {
    return this.getResonanceField();
  }

  getResonanceField(): ResonanceField {
    const peerList = Array.from(this.peers.values());
    const totalResonance = peerList.reduce((sum, p) => sum + p.resonanceStrength, 0);

    // Dominant frequency: weighted average of peer resonance frequencies
    const dominantFrequency =
      peerList.length > 0
        ? peerList.reduce(
            (sum, p) => sum + this.computeResonanceFrequency(p) * p.resonanceStrength,
            0
          ) / Math.max(totalResonance, 1)
        : 0;

    // Phi alignment: how close the resonance network is to golden ratio harmony
    const phiAlignment =
      peerList.length > 0
        ? 1 - Math.abs((totalResonance / peerList.length / PHI) % 1 - (PHI - 1))
        : 0;

    return {
      peers: Object.freeze([...peerList]),
      totalResonance,
      dominantFrequency,
      phiAlignment: Math.max(0, Math.min(1, phiAlignment)),
      timestamp: Date.now(),
    };
  }

  getSignalHistory(): ReadonlyArray<ResonanceSignal> {
    return [...this.signalHistory];
  }

  private computeResonanceFrequency(peer: PeerOrganism): number {
    // Frequency based on peer properties and phi harmonics
    const age = Date.now() - peer.lastSeen;
    const decayFactor = Math.exp(-age / (GOLDEN_ANGLE * 1000));
    return peer.resonanceStrength * PHI * decayFactor;
  }

  private recordSignal(signal: ResonanceSignal): void {
    this.signalHistory.push(signal);
    if (this.signalHistory.length > CrossOrganismResonance.MAX_HISTORY) {
      this.signalHistory.splice(0, this.signalHistory.length - CrossOrganismResonance.MAX_HISTORY);
    }
  }
}
