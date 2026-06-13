/**
 * Arbitrage Engine
 * Cross-exchange, triangular FX, futures basis arbitrage detection
 */

export class ArbitrageEngine {
  constructor(config = {}) {
    this.minProfitBps = config.minProfitBps || 5; // 5 bps minimum profit
    this.maxLatencyMs = config.maxLatencyMs || 500;
    this.opportunities = [];
  }

  // ─── Cross-Exchange Arbitrage ──────────────────────────────────────────

  detectCrossExchange(quotes) {
    // quotes: [{ exchange, symbol, bid, ask, timestamp }]
    const opportunities = [];
    
    for (let i = 0; i < quotes.length; i++) {
      for (let j = i + 1; j < quotes.length; j++) {
        const a = quotes[i], b = quotes[j];
        if (a.symbol !== b.symbol) continue;

        // Buy on exchange with lower ask, sell on exchange with higher bid
        const profitAB = (b.bid - a.ask) / a.ask * 10000; // bps
        const profitBA = (a.bid - b.ask) / b.ask * 10000;

        if (profitAB > this.minProfitBps) {
          opportunities.push({
            type: 'CROSS_EXCHANGE',
            symbol: a.symbol,
            buyExchange: a.exchange,
            sellExchange: b.exchange,
            buyPrice: a.ask,
            sellPrice: b.bid,
            profitBps: profitAB,
            estimatedProfit: b.bid - a.ask,
            timestamp: Date.now(),
          });
        }
        if (profitBA > this.minProfitBps) {
          opportunities.push({
            type: 'CROSS_EXCHANGE',
            symbol: b.symbol,
            buyExchange: b.exchange,
            sellExchange: a.exchange,
            buyPrice: b.ask,
            sellPrice: a.bid,
            profitBps: profitBA,
            estimatedProfit: a.bid - b.ask,
            timestamp: Date.now(),
          });
        }
      }
    }

    this.opportunities.push(...opportunities);
    return opportunities;
  }

  // ─── Triangular FX Arbitrage ───────────────────────────────────────────

  detectTriangularFX(rates) {
    // rates: { 'EUR/USD': { bid, ask }, 'GBP/USD': { bid, ask }, 'EUR/GBP': { bid, ask } }
    const opportunities = [];
    const pairs = Object.keys(rates);

    // Find all possible triangles
    const currencies = new Set();
    for (const pair of pairs) {
      const [base, quote] = pair.split('/');
      currencies.add(base);
      currencies.add(quote);
    }

    const currList = [...currencies];
    for (let i = 0; i < currList.length; i++) {
      for (let j = 0; j < currList.length; j++) {
        if (i === j) continue;
        for (let k = 0; k < currList.length; k++) {
          if (k === i || k === j) continue;
          const leg1 = this._getRate(rates, currList[i], currList[j]);
          const leg2 = this._getRate(rates, currList[j], currList[k]);
          const leg3 = this._getRate(rates, currList[k], currList[i]);
          if (!leg1 || !leg2 || !leg3) continue;

          const product = leg1.rate * leg2.rate * leg3.rate;
          const profitBps = (product - 1) * 10000;

          if (profitBps > this.minProfitBps) {
            opportunities.push({
              type: 'TRIANGULAR_FX',
              path: [currList[i], currList[j], currList[k], currList[i]],
              legs: [leg1, leg2, leg3],
              product,
              profitBps,
              timestamp: Date.now(),
            });
          }
        }
      }
    }

    this.opportunities.push(...opportunities);
    return opportunities;
  }

  _getRate(rates, from, to) {
    const direct = rates[`${from}/${to}`];
    if (direct) return { pair: `${from}/${to}`, rate: direct.ask, direction: 'BUY' };
    const inverse = rates[`${to}/${from}`];
    if (inverse) return { pair: `${to}/${from}`, rate: 1 / inverse.bid, direction: 'SELL' };
    return null;
  }

  // ─── Futures Basis Arbitrage ───────────────────────────────────────────

  detectFuturesBasis(spotPrice, futuresPrice, daysToExpiry, fundingRate = 0) {
    const basis = futuresPrice - spotPrice;
    const basisPct = basis / spotPrice;
    const annualizedBasis = basisPct * (365 / daysToExpiry);
    const annualizedBasisBps = annualizedBasis * 10000;

    const opportunity = {
      type: 'FUTURES_BASIS',
      spotPrice,
      futuresPrice,
      basis,
      basisPct,
      annualizedBasis,
      annualizedBasisBps,
      daysToExpiry,
      fundingRate,
      profitable: annualizedBasisBps > this.minProfitBps,
      direction: basis > 0 ? 'SELL_FUTURES_BUY_SPOT' : 'BUY_FUTURES_SELL_SPOT',
      timestamp: Date.now(),
    };

    if (opportunity.profitable) {
      this.opportunities.push(opportunity);
    }
    return opportunity;
  }

  // ─── Opportunity Management ────────────────────────────────────────────

  getOpportunities(filter = {}) {
    let ops = [...this.opportunities];
    if (filter.type) ops = ops.filter(o => o.type === filter.type);
    if (filter.minProfit) ops = ops.filter(o => o.profitBps >= filter.minProfit);
    if (filter.maxAge) ops = ops.filter(o => Date.now() - o.timestamp < filter.maxAge);
    return ops.sort((a, b) => (b.profitBps || 0) - (a.profitBps || 0));
  }

  clearOpportunities() {
    this.opportunities = [];
  }
}
