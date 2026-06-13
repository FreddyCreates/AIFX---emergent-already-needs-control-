/**
 * TOKEN GOVERNOR
 *
 * Controls maximum token budget allocation by task type.
 * Prevents overexpenditure on low-value tasks and ensures
 * high-stakes tasks receive adequate budget.
 *
 * Implements:
 *   - Task classification → budget ceiling
 *   - Dynamic budget scaling by risk/complexity
 *   - Budget enforcement with hard/soft limits
 *   - Budget consumption tracking
 */

const DEFAULT_BUDGETS = {
  invoice:      { base: 400,  ceiling: 800,  floor: 100 },
  estimating:   { base: 600,  ceiling: 1200, floor: 200 },
  cashflow:     { base: 500,  ceiling: 1000, floor: 150 },
  proposal:     { base: 800,  ceiling: 1600, floor: 300 },
  research:     { base: 1000, ceiling: 2000, floor: 400 },
  architecture: { base: 1200, ceiling: 2400, floor: 500 },
  redteam:      { base: 700,  ceiling: 1400, floor: 250 },
  memory:       { base: 300,  ceiling: 600,  floor: 80  },
  general:      { base: 500,  ceiling: 1000, floor: 100 },
};

const RISK_MULTIPLIERS = {
  low:      0.8,
  medium:   1.0,
  high:     1.4,
  critical: 1.8,
};

class TokenGovernor {
  constructor(options = {}) {
    this.budgets = { ...DEFAULT_BUDGETS, ...(options.budgets || {}) };
    this.riskMultipliers = { ...RISK_MULTIPLIERS, ...(options.riskMultipliers || {}) };
    this.hardCeiling = options.hardCeiling || 5000;
    this.consumed = 0;
    this.activeBudget = null;
    this.history = [];
  }

  /**
   * Allocate a budget for a task.
   * @param {string} taskType - One of the known task types
   * @param {object} context - { risk, complexity, urgency }
   * @returns {{ budget, ceiling, floor, taskType, risk }}
   */
  allocate(taskType, context = {}) {
    const profile = this.budgets[taskType] || this.budgets.general;
    const risk = context.risk || 'medium';
    const multiplier = this.riskMultipliers[risk] || 1.0;
    const complexityFactor = Math.min(Math.max(context.complexity || 1.0, 0.5), 2.0);

    const budget = Math.round(profile.base * multiplier * complexityFactor);
    const ceiling = Math.min(
      Math.round(profile.ceiling * multiplier),
      this.hardCeiling
    );
    const floor = profile.floor;

    this.activeBudget = {
      budget: Math.min(budget, ceiling),
      ceiling,
      floor,
      taskType,
      risk,
      consumed: 0,
      startedAt: Date.now(),
    };

    return { ...this.activeBudget };
  }

  /**
   * Consume tokens against the active budget.
   * @param {number} tokens - Number of tokens consumed
   * @returns {{ remaining, overBudget, utilization }}
   */
  consume(tokens) {
    if (!this.activeBudget) {
      throw new Error('TokenGovernor: No active budget. Call allocate() first.');
    }

    this.activeBudget.consumed += tokens;
    this.consumed += tokens;

    const remaining = this.activeBudget.budget - this.activeBudget.consumed;
    const overBudget = remaining < 0;
    const utilization = this.activeBudget.consumed / this.activeBudget.budget;

    return { remaining, overBudget, utilization };
  }

  /**
   * Check if current generation should halt.
   * @returns {{ halt, reason }}
   */
  shouldHalt() {
    if (!this.activeBudget) return { halt: false, reason: null };

    if (this.activeBudget.consumed >= this.activeBudget.ceiling) {
      return { halt: true, reason: 'hard_ceiling_reached' };
    }

    if (this.activeBudget.consumed >= this.activeBudget.budget * 1.5) {
      return { halt: true, reason: 'soft_budget_exceeded_150pct' };
    }

    return { halt: false, reason: null };
  }

  /**
   * Complete the current budget cycle and record history.
   * @returns {object} Completed budget record
   */
  complete() {
    if (!this.activeBudget) return null;

    const record = {
      ...this.activeBudget,
      completedAt: Date.now(),
      durationMs: Date.now() - this.activeBudget.startedAt,
      utilization: this.activeBudget.consumed / this.activeBudget.budget,
    };

    this.history.push(record);
    this.activeBudget = null;
    return record;
  }

  /**
   * Get average utilization across all completed tasks.
   */
  getAverageUtilization() {
    if (this.history.length === 0) return 0;
    const total = this.history.reduce((sum, r) => sum + r.utilization, 0);
    return total / this.history.length;
  }

  /**
   * Get budget stats.
   */
  getStats() {
    return {
      totalConsumed: this.consumed,
      completedTasks: this.history.length,
      averageUtilization: this.getAverageUtilization(),
      activeBudget: this.activeBudget,
    };
  }

  reset() {
    this.consumed = 0;
    this.activeBudget = null;
    this.history = [];
  }
}

export { TokenGovernor, DEFAULT_BUDGETS, RISK_MULTIPLIERS };
export default TokenGovernor;
