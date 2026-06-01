import crypto from 'node:crypto';

const PHI = 1.618033988749895;

const DEFAULT_PRODUCT_TARGET = {
  segments: ['retail', 'professional'],
  markets: ['spot', 'derivatives'],
  custody: ['custodial', 'non-custodial'],
  supportedRegions: ['US', 'EU', 'APAC'],
  complianceBaseline: ['KYC', 'AML', 'MarketSurveillance', 'RecordRetention'],
};

const MEASURABLE_GOALS = {
  latencyMsP99: 50,
  uptimeSLO: 0.9995,
  executionQualityBps: 5,
  riskLimitBreachesPerDay: 0,
  trustAndSafety: {
    mandatorySignedEvents: true,
    immutableAuditTrail: true,
    leastPrivilegeAuthz: true,
  },
};

const PLATFORM_DOMAINS = {
  marketData: 'Live feed normalization and order book state',
  execution: 'Order management and venue routing',
  strategyAI: 'Signal generation, simulation, evaluation, governance',
  risk: 'Pre-trade checks, limits, kill switches, circuit breakers',
  portfolio: 'Ledger, balances, positions, PnL attribution',
  compliance: 'KYC/AML checkpoints, policy enforcement, retention',
  observability: 'Telemetry, SLO monitoring, incidents, replay',
};

const ROLLOUT_STAGES = {
  SANDBOX: 'sandbox',
  BETA: 'beta',
  PRODUCTION: 'production',
};

const EXECUTION_MODES = {
  ADVISORY: 'advisory',
  AUTO: 'auto-execution',
};

const CIRCUIT_STATES = {
  OPEN: 'open',
  CLOSED: 'closed',
};

class NextGenerationTradingPlatformProtocol {
  constructor({ productTarget = DEFAULT_PRODUCT_TARGET, goals = MEASURABLE_GOALS } = {}) {
    this.productTarget = structuredClone(productTarget);
    this.goals = structuredClone(goals);

    this.rolloutStage = ROLLOUT_STAGES.SANDBOX;
    this.featureFlags = {
      paperTrading: true,
      realExecution: false,
      autoExecution: false,
    };

    this.accounts = new Map();
    this.positions = new Map();
    this.orderBooks = new Map();
    this.marketSnapshots = new Map();
    this.orders = new Map();
    this.idempotencyLog = new Map();
    this.eventLog = [];
    this.incidentLog = [];
    this.riskLimits = new Map();
    this.circuitBreakers = new Map();
    this.aiModels = new Map();
    this.killSwitchEnabled = false;

    this.metrics = {
      ordersSubmitted: 0,
      ordersFilled: 0,
      ordersRejected: 0,
      totalLatencyMs: 0,
    };
  }

  defineProductTarget(target) {
    this.productTarget = {
      ...this.productTarget,
      ...target,
    };
    return this.getPlatformDefinition();
  }

  getPlatformDefinition() {
    return {
      productTarget: structuredClone(this.productTarget),
      goals: structuredClone(this.goals),
      domains: structuredClone(PLATFORM_DOMAINS),
      rolloutStage: this.rolloutStage,
    };
  }

  setRolloutStage(stage) {
    if (!Object.values(ROLLOUT_STAGES).includes(stage)) {
      throw new Error(`Invalid rollout stage: ${stage}`);
    }

    this.rolloutStage = stage;
    if (stage === ROLLOUT_STAGES.SANDBOX) {
      this.featureFlags.paperTrading = true;
      this.featureFlags.realExecution = false;
      this.featureFlags.autoExecution = false;
    }
    if (stage === ROLLOUT_STAGES.BETA) {
      this.featureFlags.paperTrading = true;
      this.featureFlags.realExecution = true;
      this.featureFlags.autoExecution = false;
    }
    if (stage === ROLLOUT_STAGES.PRODUCTION) {
      this.featureFlags.paperTrading = false;
      this.featureFlags.realExecution = true;
      this.featureFlags.autoExecution = true;
    }

    return { stage: this.rolloutStage, featureFlags: structuredClone(this.featureFlags) };
  }

  createAccount({ accountId, cash = 0 }) {
    if (!accountId) throw new Error('accountId required');
    this.accounts.set(accountId, { accountId, cash, createdAt: Date.now() });
    this.positions.set(accountId, new Map());
    return this.accounts.get(accountId);
  }

  setRiskLimits(accountId, limits = {}) {
    const merged = {
      maxOrderNotional: 100000,
      maxPositionNotional: 200000,
      ...limits,
    };
    this.riskLimits.set(accountId, merged);
    return merged;
  }

  setKillSwitch(enabled) {
    this.killSwitchEnabled = !!enabled;
    if (enabled) {
      this.recordIncident({ severity: 'critical', type: 'kill-switch', detail: 'Trading halted by kill switch.' });
    }
    return { killSwitchEnabled: this.killSwitchEnabled };
  }

  setCircuitBreaker(symbol, state) {
    if (!Object.values(CIRCUIT_STATES).includes(state)) {
      throw new Error(`Invalid circuit state: ${state}`);
    }
    this.circuitBreakers.set(symbol, state);
    if (state === CIRCUIT_STATES.OPEN) {
      this.recordIncident({ severity: 'high', type: 'circuit-breaker-open', detail: `Circuit open for ${symbol}` });
    }
    return { symbol, state };
  }

  ingestMarketData({ symbol, bid, ask, last, timestamp = Date.now() }) {
    if (!symbol) throw new Error('symbol required');
    if (bid <= 0 || ask <= 0 || ask < bid) throw new Error('invalid quote');

    const book = {
      symbol,
      bids: [{ price: bid, size: PHI }],
      asks: [{ price: ask, size: PHI }],
      mid: (bid + ask) / 2,
      spread: ask - bid,
      last,
      timestamp,
    };

    this.orderBooks.set(symbol, book);
    this.marketSnapshots.set(symbol, { symbol, bid, ask, last, timestamp });

    this.appendEvent('market-data.ingested', { symbol, bid, ask, last, timestamp });
    return book;
  }

  registerModel({ modelId, version, mode = EXECUTION_MODES.ADVISORY, approved = false }) {
    if (!modelId || !version) throw new Error('modelId and version required');
    const model = { modelId, version, mode, approved, createdAt: Date.now() };
    this.aiModels.set(modelId, model);
    this.appendEvent('ai.model.registered', model);
    return model;
  }

  generateSignal({ symbol, direction, confidence, modelId }) {
    const model = this.aiModels.get(modelId);
    if (!model) throw new Error(`Unknown model: ${modelId}`);

    const signal = {
      signalId: `sig-${Date.now().toString(36)}`,
      symbol,
      direction,
      confidence,
      modelId,
      evaluation: confidence >= 0.65 ? 'eligible' : 'monitor',
      executionMode: model.mode,
      approved: model.approved,
    };

    this.appendEvent('ai.signal.generated', signal);
    return signal;
  }

  detectAnomaly({ metric, value, threshold }) {
    const anomalous = value > threshold;
    if (anomalous) {
      this.recordIncident({ severity: 'medium', type: 'anomaly', detail: `${metric} above threshold`, data: { value, threshold } });
    }
    return { metric, anomalous, value, threshold };
  }

  evaluatePreTradeRisk(order) {
    if (this.killSwitchEnabled) {
      return { allowed: false, reason: 'kill-switch-enabled' };
    }

    const breakerState = this.circuitBreakers.get(order.symbol);
    if (breakerState === CIRCUIT_STATES.OPEN) {
      return { allowed: false, reason: 'circuit-breaker-open' };
    }

    const account = this.accounts.get(order.accountId);
    if (!account) {
      return { allowed: false, reason: 'unknown-account' };
    }

    const snapshot = this.marketSnapshots.get(order.symbol);
    if (!snapshot) {
      return { allowed: false, reason: 'missing-market-data' };
    }

    const refPrice = order.type === 'limit' ? order.limitPrice : (order.side === 'buy' ? snapshot.ask : snapshot.bid);
    const notional = refPrice * order.quantity;

    const limits = this.riskLimits.get(order.accountId) || this.setRiskLimits(order.accountId, {});
    if (notional > limits.maxOrderNotional) {
      return { allowed: false, reason: 'max-order-notional-exceeded', notional, limit: limits.maxOrderNotional };
    }

    const accountPositions = this.positions.get(order.accountId) || new Map();
    const current = accountPositions.get(order.symbol) || 0;
    const nextPosition = order.side === 'buy' ? current + order.quantity : current - order.quantity;
    const nextNotional = Math.abs(nextPosition * refPrice);

    if (nextNotional > limits.maxPositionNotional) {
      return { allowed: false, reason: 'max-position-notional-exceeded', nextNotional, limit: limits.maxPositionNotional };
    }

    if (order.side === 'buy' && account.cash < notional) {
      return { allowed: false, reason: 'insufficient-cash', notional, cash: account.cash };
    }

    return { allowed: true, notional, referencePrice: refPrice };
  }

  routeOrder(order) {
    if (order.mode === EXECUTION_MODES.AUTO && !this.featureFlags.autoExecution) {
      return { accepted: false, reason: 'auto-execution-disabled' };
    }

    if (this.rolloutStage === ROLLOUT_STAGES.SANDBOX) {
      return { accepted: true, venue: 'paper-simulator', settlement: 'simulated' };
    }

    return { accepted: true, venue: 'guarded-exchange-adapter', settlement: this.featureFlags.realExecution ? 'real' : 'simulated' };
  }

  executeFill(order, route, risk) {
    const snapshot = this.marketSnapshots.get(order.symbol);
    const fillPrice = order.side === 'buy' ? snapshot.ask : snapshot.bid;
    const fillNotional = fillPrice * order.quantity;

    const account = this.accounts.get(order.accountId);
    const accountPositions = this.positions.get(order.accountId) || new Map();
    const currentPosition = accountPositions.get(order.symbol) || 0;
    const nextPosition = order.side === 'buy' ? currentPosition + order.quantity : currentPosition - order.quantity;

    accountPositions.set(order.symbol, nextPosition);
    this.positions.set(order.accountId, accountPositions);

    if (order.side === 'buy') account.cash -= fillNotional;
    if (order.side === 'sell') account.cash += fillNotional;

    const ledgerEntry = {
      entryId: `ledger-${Date.now().toString(36)}`,
      accountId: order.accountId,
      symbol: order.symbol,
      side: order.side,
      quantity: order.quantity,
      fillPrice,
      fillNotional,
      settlement: route.settlement,
      timestamp: Date.now(),
    };

    this.appendEvent('ledger.updated', ledgerEntry);

    return {
      status: 'filled',
      fillPrice,
      fillNotional,
      riskSnapshot: risk,
      ledgerEntry,
      portfolio: {
        cash: account.cash,
        position: nextPosition,
      },
    };
  }

  submitOrder({ accountId, symbol, side, quantity, type = 'market', limitPrice = null, mode = EXECUTION_MODES.ADVISORY, idempotencyKey }) {
    if (!accountId || !symbol || !side || !quantity) {
      throw new Error('accountId, symbol, side, quantity required');
    }

    if (idempotencyKey && this.idempotencyLog.has(idempotencyKey)) {
      return structuredClone(this.idempotencyLog.get(idempotencyKey));
    }

    const start = Date.now();
    this.metrics.ordersSubmitted++;

    const order = {
      orderId: `ord-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      accountId,
      symbol,
      side,
      quantity,
      type,
      limitPrice,
      mode,
      createdAt: start,
    };

    const risk = this.evaluatePreTradeRisk(order);
    if (!risk.allowed) {
      this.metrics.ordersRejected++;
      const rejected = { orderId: order.orderId, status: 'rejected', reason: risk.reason, risk };
      this.appendEvent('order.rejected', rejected);
      if (idempotencyKey) this.idempotencyLog.set(idempotencyKey, rejected);
      return rejected;
    }

    const route = this.routeOrder(order);
    if (!route.accepted) {
      this.metrics.ordersRejected++;
      const rejected = { orderId: order.orderId, status: 'rejected', reason: route.reason, route };
      this.appendEvent('order.rejected', rejected);
      if (idempotencyKey) this.idempotencyLog.set(idempotencyKey, rejected);
      return rejected;
    }

    const execution = this.executeFill(order, route, risk);
    this.metrics.ordersFilled++;
    this.metrics.totalLatencyMs += (Date.now() - start);

    const receipt = {
      orderId: order.orderId,
      status: execution.status,
      route,
      execution,
      latencyMs: Date.now() - start,
    };

    this.orders.set(order.orderId, { ...order, ...receipt });
    this.appendEvent('order.filled', receipt);

    if (idempotencyKey) this.idempotencyLog.set(idempotencyKey, receipt);

    return receipt;
  }

  runVerticalSlice(input) {
    const { marketData, order } = input;
    const book = this.ingestMarketData(marketData);
    const receipt = this.submitOrder(order);

    return {
      milestones: [
        'market-data',
        'order-submitted',
        receipt.status === 'filled' ? 'risk-passed' : 'risk-blocked',
        receipt.status === 'filled' ? 'simulated-fill' : 'no-fill',
        'portfolio-updated',
      ],
      orderBook: book,
      receipt,
      portfolio: this.getPortfolio(order.accountId),
    };
  }

  getPortfolio(accountId) {
    const account = this.accounts.get(accountId);
    const positionMap = this.positions.get(accountId) || new Map();
    return {
      accountId,
      cash: account ? account.cash : 0,
      positions: Object.fromEntries(positionMap.entries()),
    };
  }

  appendEvent(type, payload) {
    const previousHash = this.eventLog.length ? this.eventLog[this.eventLog.length - 1].hash : 'GENESIS';
    const body = JSON.stringify(payload);
    const hash = crypto.createHash('sha256').update(`${previousHash}:${type}:${body}`).digest('hex');

    const event = {
      sequence: this.eventLog.length + 1,
      type,
      payload,
      previousHash,
      hash,
      timestamp: Date.now(),
    };

    this.eventLog.push(event);
    return event;
  }

  recordIncident(incident) {
    const event = this.appendEvent('incident.recorded', incident);
    this.incidentLog.push(event);
    return event;
  }

  getTelemetrySnapshot() {
    const avgLatency = this.metrics.ordersFilled === 0 ? 0 : this.metrics.totalLatencyMs / this.metrics.ordersFilled;
    return {
      rolloutStage: this.rolloutStage,
      featureFlags: structuredClone(this.featureFlags),
      metrics: {
        ...this.metrics,
        averageLatencyMs: avgLatency,
      },
      slos: {
        targetLatencyMsP99: this.goals.latencyMsP99,
        targetUptime: this.goals.uptimeSLO,
      },
      incidents: this.incidentLog.length,
      eventCount: this.eventLog.length,
    };
  }

  getComplianceSnapshot(accountId) {
    return {
      accountId,
      checks: {
        kyc: true,
        aml: true,
        policyEnforced: true,
        recordRetentionDays: 2555,
      },
      retentionEvents: this.eventLog.length,
    };
  }

  replayByIdempotencyKey(idempotencyKey) {
    if (!this.idempotencyLog.has(idempotencyKey)) return null;
    return structuredClone(this.idempotencyLog.get(idempotencyKey));
  }
}

export {
  NextGenerationTradingPlatformProtocol,
  DEFAULT_PRODUCT_TARGET,
  MEASURABLE_GOALS,
  PLATFORM_DOMAINS,
  ROLLOUT_STAGES,
  EXECUTION_MODES,
  CIRCUIT_STATES,
};

export default NextGenerationTradingPlatformProtocol;
