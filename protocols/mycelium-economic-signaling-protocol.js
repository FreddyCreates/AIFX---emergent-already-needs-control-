/**
 * PROTO-263: Mycelium Economic Signaling Protocol (MESP)
 * Incentive law for rewards, penalties, stake, and routing bids.
 */

const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;

export const ECONOMIC_SIGNALS = {
  REWARD: 'reward',
  PENALTY: 'penalty',
  BOND: 'bond',
};

export const MESSAGE_TYPES = {
  ECONOMIC_SIGNAL: 'mycelium.economy.signal',
  EPOCH_SETTLE: 'mycelium.economy.epoch.settle',
};

export function calculateRoutingBid(trust, latencyMs, load = 0) {
  const trustFactor = Math.max(0.05, Math.min(1, trust));
  const latencyFactor = 1 / (1 + latencyMs / 1000);
  const loadPenalty = 1 + Math.max(0, load) * PHI;
  return (trustFactor * latencyFactor * PHI_INV) / loadPenalty;
}

export class MyceliumEconomicSignalingProtocol {
  constructor() {
    this.accounts = new Map();
    this.ledger = [];
  }

  ensureAccount(nodeId) {
    if (!this.accounts.has(nodeId)) {
      this.accounts.set(nodeId, { nodeId, credits: 0, stake: 0, penalties: 0, rewards: 0 });
    }
    return this.accounts.get(nodeId);
  }

  applySignal(nodeId, signal) {
    const account = this.ensureAccount(nodeId);
    const amount = Math.max(0, signal.amount || 0);

    if (signal.type === ECONOMIC_SIGNALS.REWARD) {
      account.credits += amount;
      account.rewards += amount;
    } else if (signal.type === ECONOMIC_SIGNALS.PENALTY) {
      account.credits = Math.max(0, account.credits - amount);
      account.penalties += amount;
    } else if (signal.type === ECONOMIC_SIGNALS.BOND) {
      account.stake += amount;
      account.credits = Math.max(0, account.credits - amount * 0.1);
    }

    this.ledger.push({ at: Date.now(), nodeId, signal: { ...signal, amount }, balance: account.credits });
    if (this.ledger.length > 2000) this.ledger.shift();
    return account;
  }

  settleEpoch(performance = {}) {
    const scores = [];
    for (const [nodeId, account] of this.accounts.entries()) {
      const trust = performance[nodeId]?.trust ?? PHI_INV;
      const latencyMs = performance[nodeId]?.latencyMs ?? 50;
      const load = performance[nodeId]?.load ?? 0.2;
      const bid = calculateRoutingBid(trust, latencyMs, load);
      scores.push({ nodeId, bid, credits: account.credits, stake: account.stake });
    }
    scores.sort((a, b) => b.bid - a.bid);
    return scores;
  }

  getMetrics() {
    const accounts = [...this.accounts.values()];
    return {
      accountCount: accounts.length,
      totalCredits: accounts.reduce((a, b) => a + b.credits, 0),
      totalStake: accounts.reduce((a, b) => a + b.stake, 0),
      ledgerEntries: this.ledger.length,
    };
  }
}

export default MyceliumEconomicSignalingProtocol;
