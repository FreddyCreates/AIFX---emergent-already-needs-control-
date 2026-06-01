/**
 * PROTO-264: Mycelium Cross-Substrate Exchange Protocol (MCSEP)
 * Exchange fabric across web, edge, canister, and native substrates.
 */

const PHI = 1.618033988749895;

export const EXCHANGE_STATES = {
  IDLE: 'idle',
  EXCHANGING: 'exchanging',
  DEGRADED: 'degraded',
};

export const MESSAGE_TYPES = {
  EXCHANGE_REQUEST: 'mycelium.exchange.request',
  EXCHANGE_PROOF: 'mycelium.exchange.proof',
  EXCHANGE_CONFIRM: 'mycelium.exchange.confirm',
};

export function calculateExchangeReliability(connectorHealth, trustScore, congestion = 0) {
  const health = Math.max(0, Math.min(1, connectorHealth));
  const trust = Math.max(0, Math.min(1, trustScore));
  const congestionPenalty = 1 + Math.max(0, congestion) * PHI;
  return (health * trust) / congestionPenalty;
}

export class MyceliumCrossSubstrateExchangeProtocol {
  constructor() {
    this.state = EXCHANGE_STATES.IDLE;
    this.connectors = new Map();
    this.exchanges = [];
  }

  registerConnector(name, config = {}) {
    this.connectors.set(name, {
      name,
      health: config.health ?? 1,
      trust: config.trust ?? 1,
      congestion: config.congestion ?? 0,
    });
    return this.connectors.get(name);
  }

  publishExchange(exchange) {
    const from = this.connectors.get(exchange.from);
    const to = this.connectors.get(exchange.to);
    if (!from || !to) return null;

    this.state = EXCHANGE_STATES.EXCHANGING;
    const reliability = Math.min(
      calculateExchangeReliability(from.health, from.trust, from.congestion),
      calculateExchangeReliability(to.health, to.trust, to.congestion)
    );

    const record = {
      id: exchange.id || `xchg-${Date.now().toString(36)}`,
      at: Date.now(),
      from: exchange.from,
      to: exchange.to,
      payloadType: exchange.payloadType || 'generic',
      sizeKb: exchange.sizeKb || 1,
      proof: exchange.proof ?? true,
      reliability,
      accepted: reliability >= 0.34,
    };

    this.exchanges.push(record);
    if (!record.accepted) this.state = EXCHANGE_STATES.DEGRADED;
    else this.state = EXCHANGE_STATES.IDLE;
    return record;
  }

  verifyExchange(id) {
    const record = this.exchanges.find(x => x.id === id);
    if (!record) return null;
    return { id: record.id, valid: !!record.proof && record.accepted, reliability: record.reliability };
  }

  getMetrics() {
    return {
      state: this.state,
      connectorCount: this.connectors.size,
      exchangeCount: this.exchanges.length,
      acceptedExchanges: this.exchanges.filter(x => x.accepted).length,
    };
  }
}

export default MyceliumCrossSubstrateExchangeProtocol;
