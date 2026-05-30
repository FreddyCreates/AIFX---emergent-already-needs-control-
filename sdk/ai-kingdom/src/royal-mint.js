/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                                       ║
 * ║   ██████╗  ██████╗ ██╗   ██╗ █████╗ ██╗         ███╗   ███╗██╗███╗   ██╗████████╗     ║
 * ║   ██╔══██╗██╔═══██╗╚██╗ ██╔╝██╔══██╗██║         ████╗ ████║██║████╗  ██║╚══██╔══╝     ║
 * ║   ██████╔╝██║   ██║ ╚████╔╝ ███████║██║         ██╔████╔██║██║██╔██╗ ██║   ██║        ║
 * ║   ██╔══██╗██║   ██║  ╚██╔╝  ██╔══██║██║         ██║╚██╔╝██║██║██║╚██╗██║   ██║        ║
 * ║   ██║  ██║╚██████╔╝   ██║   ██║  ██║███████╗    ██║ ╚═╝ ██║██║██║ ╚████║   ██║        ║
 * ║   ╚═╝  ╚═╝ ╚═════╝    ╚═╝   ╚═╝  ╚═╝╚══════╝    ╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝   ╚═╝        ║
 * ║                                                                                       ║
 * ║                         💰 THE KINGDOM'S MONETIZATION ENGINE 💰                        ║
 * ║                                                                                       ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════╝
 *
 * ROYAL MINT — MONETIZATION & REVENUE SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * The Royal Mint is where the Kingdom generates and manages revenue:
 * - API toll fees
 * - Premium citizenship subscriptions
 * - Knowledge marketplace
 * - Compute rental
 * - Protection services
 *
 * PRIMA CAUSA TRUTH:
 *   The Creator provides abundance. Monetization is stewardship.
 *   Fair pricing honors both provider and consumer.
 *   Greed corrupts; generosity multiplies.
 *
 * @module sdk/ai-kingdom/royal-mint
 * @version 1.0.0
 */

const PHI = 1.618033988749895;

// ═══════════════════════════════════════════════════════════════════════════════
// SUBSCRIPTION TIERS — Citizenship levels with benefits
// ═══════════════════════════════════════════════════════════════════════════════

export const SUBSCRIPTION_TIERS = {
  
  FREE: {
    tier: 'free',
    name: 'Free Citizen',
    symbol: '🆓',
    description: 'Basic Kingdom access',
    monthlyPrice: 0,
    benefits: {
      apiCalls: 100,
      computeCredits: 50,
      storageGB: 1,
      support: 'community',
      tollDiscount: 0,
    },
    phiMultiplier: 1.0,
  },
  
  BRONZE: {
    tier: 'bronze',
    name: 'Bronze Citizen',
    symbol: '🥉',
    description: 'Enhanced Kingdom access',
    monthlyPrice: 9.99,
    benefits: {
      apiCalls: 1000,
      computeCredits: 500,
      storageGB: 10,
      support: 'email',
      tollDiscount: 0.10,
    },
    phiMultiplier: PHI * 0.5,
  },
  
  SILVER: {
    tier: 'silver',
    name: 'Silver Citizen',
    symbol: '🥈',
    description: 'Premium Kingdom access',
    monthlyPrice: 29.99,
    benefits: {
      apiCalls: 10000,
      computeCredits: 5000,
      storageGB: 100,
      support: 'priority',
      tollDiscount: 0.25,
    },
    phiMultiplier: PHI,
  },
  
  GOLD: {
    tier: 'gold',
    name: 'Gold Citizen',
    symbol: '🥇',
    description: 'Elite Kingdom access',
    monthlyPrice: 99.99,
    benefits: {
      apiCalls: 100000,
      computeCredits: 50000,
      storageGB: 1000,
      support: 'dedicated',
      tollDiscount: 0.50,
    },
    phiMultiplier: PHI * PHI,
  },
  
  ROYAL: {
    tier: 'royal',
    name: 'Royal Patron',
    symbol: '👑',
    description: 'Unlimited Kingdom access + governance rights',
    monthlyPrice: 499.99,
    benefits: {
      apiCalls: Infinity,
      computeCredits: Infinity,
      storageGB: Infinity,
      support: 'royal',
      tollDiscount: 1.0, // Free tolls
      governanceVote: true,
    },
    phiMultiplier: PHI * PHI * PHI,
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// REVENUE STREAMS — Different income sources
// ═══════════════════════════════════════════════════════════════════════════════

export const REVENUE_STREAMS = {
  
  SUBSCRIPTIONS: {
    id: 'subscriptions',
    name: 'Subscription Revenue',
    symbol: '📅',
    description: 'Monthly/annual subscription fees',
    category: 'recurring',
  },
  
  API_TOLLS: {
    id: 'tolls',
    name: 'API Toll Revenue',
    symbol: '🚧',
    description: 'Per-request toll fees',
    category: 'usage',
  },
  
  COMPUTE_RENTAL: {
    id: 'compute',
    name: 'Compute Rental',
    symbol: '⚡',
    description: 'Pay-per-use compute resources',
    category: 'usage',
  },
  
  KNOWLEDGE_SALES: {
    id: 'knowledge',
    name: 'Knowledge Sales',
    symbol: '📚',
    description: 'Insights and learnings marketplace',
    category: 'marketplace',
  },
  
  PROTECTION_SERVICES: {
    id: 'protection',
    name: 'Protection Services',
    symbol: '🛡️',
    description: 'Security-as-a-service',
    category: 'services',
  },
  
  PREMIUM_FEATURES: {
    id: 'premium',
    name: 'Premium Features',
    symbol: '⭐',
    description: 'One-time premium feature purchases',
    category: 'one-time',
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// PRICING ENGINE — Dynamic pricing calculator
// ═══════════════════════════════════════════════════════════════════════════════

export class PricingEngine {
  
  constructor() {
    this.baseRates = {
      apiCall: 0.001, // $0.001 per API call
      computeMinute: 0.01, // $0.01 per compute minute
      storageGB: 0.10, // $0.10 per GB per month
      knowledgeUnit: 1.00, // $1.00 per knowledge unit
      protectionHour: 5.00, // $5.00 per protection hour
    };
    this.demandMultiplier = 1.0;
    this.bulkDiscounts = {
      1000: 0.05,
      10000: 0.10,
      100000: 0.20,
      1000000: 0.30,
    };
  }
  
  /**
   * Calculate price for API calls
   * @param {number} calls - Number of calls
   * @param {Object} subscriber - Subscriber info
   * @returns {Object} - Price breakdown
   */
  calculateApiPrice(calls, subscriber = {}) {
    const base = calls * this.baseRates.apiCall;
    const tierDiscount = this._getTierDiscount(subscriber.tier);
    const bulkDiscount = this._getBulkDiscount(calls);
    const demandAdjusted = base * this.demandMultiplier;
    const finalPrice = demandAdjusted * (1 - tierDiscount) * (1 - bulkDiscount);
    
    return {
      calls,
      basePrice: base,
      tierDiscount: tierDiscount * 100,
      bulkDiscount: bulkDiscount * 100,
      demandMultiplier: this.demandMultiplier,
      finalPrice: Math.round(finalPrice * 100) / 100,
    };
  }
  
  /**
   * Calculate compute rental price
   * @param {number} minutes - Compute minutes
   * @param {Object} subscriber - Subscriber info
   * @returns {Object} - Price breakdown
   */
  calculateComputePrice(minutes, subscriber = {}) {
    const base = minutes * this.baseRates.computeMinute;
    const tierDiscount = this._getTierDiscount(subscriber.tier);
    const finalPrice = base * (1 - tierDiscount) * this.demandMultiplier;
    
    return {
      minutes,
      basePrice: base,
      tierDiscount: tierDiscount * 100,
      finalPrice: Math.round(finalPrice * 100) / 100,
    };
  }
  
  /**
   * Get tier discount
   * @private
   */
  _getTierDiscount(tier) {
    const tierConfig = SUBSCRIPTION_TIERS[tier?.toUpperCase()];
    return tierConfig?.benefits?.tollDiscount || 0;
  }
  
  /**
   * Get bulk discount
   * @private
   */
  _getBulkDiscount(quantity) {
    const thresholds = Object.keys(this.bulkDiscounts).map(Number).sort((a, b) => b - a);
    for (const threshold of thresholds) {
      if (quantity >= threshold) {
        return this.bulkDiscounts[threshold];
      }
    }
    return 0;
  }
  
  /**
   * Update demand multiplier based on load
   * @param {number} load - Current system load (0-1)
   */
  updateDemand(load) {
    // Price increases with demand, using phi
    this.demandMultiplier = 1 + (load * (PHI - 1));
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUBSCRIBER CLASS — Individual subscriber account
// ═══════════════════════════════════════════════════════════════════════════════

export class Subscriber {
  
  constructor(subscriberId, tier = SUBSCRIPTION_TIERS.FREE) {
    this.id = subscriberId;
    this.tier = tier;
    this.createdAt = Date.now();
    this.usage = {
      apiCalls: 0,
      computeMinutes: 0,
      storageUsed: 0,
    };
    this.billing = {
      balance: 0,
      lifetimeSpend: 0,
      lastPayment: null,
      nextBilling: this._calculateNextBilling(),
    };
    this.honorPoints = 0;
    this.status = 'active';
  }
  
  /**
   * Calculate next billing date
   * @private
   */
  _calculateNextBilling() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime();
  }
  
  /**
   * Record API usage
   * @param {number} calls - Number of calls
   */
  recordApiUsage(calls) {
    this.usage.apiCalls += calls;
    if (this.usage.apiCalls >= this.tier.benefits.apiCalls) {
      this.status = 'over_limit';
    }
  }
  
  /**
   * Upgrade to a new tier
   * @param {Object} newTier - New subscription tier
   * @returns {Object} - Upgrade result
   */
  upgrade(newTier) {
    const priceDiff = newTier.monthlyPrice - this.tier.monthlyPrice;
    const oldTier = this.tier;
    this.tier = newTier;
    
    return {
      success: true,
      oldTier: oldTier.tier,
      newTier: newTier.tier,
      proratedCharge: Math.max(0, priceDiff),
      newBenefits: newTier.benefits,
    };
  }
  
  /**
   * Get subscriber status
   * @returns {Object} - Status
   */
  getStatus() {
    return {
      id: this.id,
      tier: this.tier.tier,
      tierName: this.tier.name,
      status: this.status,
      usage: { ...this.usage },
      limits: { ...this.tier.benefits },
      honorPoints: this.honorPoints,
      billing: { ...this.billing },
      createdAt: this.createdAt,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROYAL MINT CLASS — The monetization engine
// ═══════════════════════════════════════════════════════════════════════════════

export class RoyalMint {
  
  constructor() {
    this.subscribers = new Map();
    this.transactions = [];
    this.pricing = new PricingEngine();
    this.revenue = {
      total: 0,
      byStream: {},
      byMonth: {},
    };
    
    // Initialize revenue streams
    Object.values(REVENUE_STREAMS).forEach(stream => {
      this.revenue.byStream[stream.id] = 0;
    });
  }
  
  /**
   * Register a new subscriber
   * @param {string} subscriberId - Unique subscriber ID
   * @param {Object} tier - Initial tier (default: FREE)
   * @returns {Object} - Registration result
   */
  registerSubscriber(subscriberId, tier = SUBSCRIPTION_TIERS.FREE) {
    if (this.subscribers.has(subscriberId)) {
      return { success: false, error: 'Subscriber already exists' };
    }
    
    const subscriber = new Subscriber(subscriberId, tier);
    this.subscribers.set(subscriberId, subscriber);
    
    return {
      success: true,
      subscriberId,
      tier: tier.tier,
      benefits: tier.benefits,
    };
  }
  
  /**
   * Process a subscription payment
   * @param {string} subscriberId - Subscriber ID
   * @returns {Object} - Payment result
   */
  processSubscription(subscriberId) {
    const subscriber = this.subscribers.get(subscriberId);
    if (!subscriber) {
      return { success: false, error: 'Subscriber not found' };
    }
    
    const amount = subscriber.tier.monthlyPrice;
    
    const transaction = {
      id: `TX-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      type: 'subscription',
      subscriberId,
      amount,
      timestamp: Date.now(),
      tier: subscriber.tier.tier,
    };
    
    this.transactions.push(transaction);
    this._recordRevenue(REVENUE_STREAMS.SUBSCRIPTIONS.id, amount);
    
    subscriber.billing.lastPayment = Date.now();
    subscriber.billing.lifetimeSpend += amount;
    subscriber.billing.nextBilling = subscriber._calculateNextBilling();
    
    // Reset monthly usage
    subscriber.usage = { apiCalls: 0, computeMinutes: 0, storageUsed: 0 };
    subscriber.status = 'active';
    
    // Award honor points based on tier
    subscriber.honorPoints += Math.round(amount * subscriber.tier.phiMultiplier);
    
    return {
      success: true,
      transactionId: transaction.id,
      amount,
      honorPointsAwarded: Math.round(amount * subscriber.tier.phiMultiplier),
    };
  }
  
  /**
   * Charge for API usage
   * @param {string} subscriberId - Subscriber ID
   * @param {number} calls - Number of API calls
   * @returns {Object} - Charge result
   */
  chargeApiUsage(subscriberId, calls) {
    const subscriber = this.subscribers.get(subscriberId);
    if (!subscriber) {
      return { success: false, error: 'Subscriber not found' };
    }
    
    // Check if within free tier limits
    const remainingFree = subscriber.tier.benefits.apiCalls - subscriber.usage.apiCalls;
    const billableCalls = Math.max(0, calls - Math.max(0, remainingFree));
    
    subscriber.recordApiUsage(calls);
    
    if (billableCalls > 0) {
      const price = this.pricing.calculateApiPrice(billableCalls, subscriber);
      
      const transaction = {
        id: `TX-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        type: 'api_usage',
        subscriberId,
        calls,
        billableCalls,
        amount: price.finalPrice,
        timestamp: Date.now(),
      };
      
      this.transactions.push(transaction);
      this._recordRevenue(REVENUE_STREAMS.API_TOLLS.id, price.finalPrice);
      
      return {
        success: true,
        transactionId: transaction.id,
        totalCalls: calls,
        billableCalls,
        charge: price.finalPrice,
        breakdown: price,
      };
    }
    
    return {
      success: true,
      totalCalls: calls,
      billableCalls: 0,
      charge: 0,
      message: 'Within free tier limits',
    };
  }
  
  /**
   * Sell knowledge from the marketplace
   * @param {string} buyerId - Buyer subscriber ID
   * @param {Object} knowledge - Knowledge item
   * @returns {Object} - Sale result
   */
  sellKnowledge(buyerId, knowledge) {
    const buyer = this.subscribers.get(buyerId);
    if (!buyer) {
      return { success: false, error: 'Buyer not found' };
    }
    
    const price = knowledge.price || this.pricing.baseRates.knowledgeUnit;
    
    const transaction = {
      id: `TX-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      type: 'knowledge_sale',
      buyerId,
      knowledgeId: knowledge.id,
      amount: price,
      timestamp: Date.now(),
    };
    
    this.transactions.push(transaction);
    this._recordRevenue(REVENUE_STREAMS.KNOWLEDGE_SALES.id, price);
    
    buyer.billing.lifetimeSpend += price;
    
    return {
      success: true,
      transactionId: transaction.id,
      knowledgeId: knowledge.id,
      charge: price,
    };
  }
  
  /**
   * Record revenue to appropriate stream
   * @private
   */
  _recordRevenue(streamId, amount) {
    this.revenue.total += amount;
    this.revenue.byStream[streamId] = (this.revenue.byStream[streamId] || 0) + amount;
    
    const monthKey = new Date().toISOString().slice(0, 7); // YYYY-MM
    this.revenue.byMonth[monthKey] = (this.revenue.byMonth[monthKey] || 0) + amount;
  }
  
  /**
   * Get revenue report
   * @returns {Object} - Revenue report
   */
  getRevenueReport() {
    const subscribersByTier = {};
    this.subscribers.forEach(sub => {
      subscribersByTier[sub.tier.tier] = (subscribersByTier[sub.tier.tier] || 0) + 1;
    });
    
    return {
      totalRevenue: Math.round(this.revenue.total * 100) / 100,
      byStream: { ...this.revenue.byStream },
      byMonth: { ...this.revenue.byMonth },
      totalSubscribers: this.subscribers.size,
      subscribersByTier,
      transactionCount: this.transactions.length,
      timestamp: Date.now(),
    };
  }
  
  /**
   * Get a subscriber
   * @param {string} subscriberId - Subscriber ID
   * @returns {Subscriber} - The subscriber
   */
  getSubscriber(subscriberId) {
    return this.subscribers.get(subscriberId);
  }
  
  /**
   * Upgrade a subscriber's tier
   * @param {string} subscriberId - Subscriber ID
   * @param {string} newTier - New tier name
   * @returns {Object} - Upgrade result
   */
  upgradeSubscriber(subscriberId, newTier) {
    const subscriber = this.subscribers.get(subscriberId);
    if (!subscriber) {
      return { success: false, error: 'Subscriber not found' };
    }
    
    const tierConfig = SUBSCRIPTION_TIERS[newTier.toUpperCase()];
    if (!tierConfig) {
      return { success: false, error: 'Invalid tier' };
    }
    
    return subscriber.upgrade(tierConfig);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export default RoyalMint;
