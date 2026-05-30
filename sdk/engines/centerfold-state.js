/**
 * CENTERFOLD STATE LAYER
 *
 * Keeps durable cycle snapshots and trend state for centerfold evolution.
 */

class CenterfoldStateStore {
  constructor(options = {}) {
    this.maxSnapshots = Math.max(10, options.maxSnapshots || 5000);
    this.snapshots = [];
    this.lastCenterfold = null;
    this.lastUpdatedAt = null;
    this.sequence = 0;
    this.trends = {
      linearEnergy: [],
      exponentialEnergy: [],
      perpendicularEnergy: [],
      centerfoldEnergy: [],
      centerMass: [],
    };
    this.maxTrendPoints = Math.max(50, options.maxTrendPoints || 10000);
  }

  record(snapshot = {}) {
    this.sequence += 1;

    const normalized = {
      sequence: this.sequence,
      timestamp: snapshot.timestamp || Date.now(),
      input: snapshot.input || {},
      model: snapshot.model || {},
      output: snapshot.output || {},
      observability: snapshot.observability || {},
    };

    this.snapshots.push(normalized);
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots = this.snapshots.slice(-this.maxSnapshots);
    }

    this.lastCenterfold = normalized.output.centerfold || null;
    this.lastUpdatedAt = normalized.timestamp;
    this._recordTrends(normalized);

    return normalized;
  }

  _recordTrends(snapshot) {
    const linearEnergy = snapshot.output?.linear?.energy || 0;
    const exponentialEnergy = snapshot.output?.exponential?.energy || 0;
    const perpendicularEnergy = snapshot.output?.perpendicular?.energy || 0;
    const centerfoldEnergy = snapshot.output?.centerfold?.energy || 0;
    const centerMass = snapshot.output?.centerfold?.centerMass || 0;

    this.trends.linearEnergy.push(linearEnergy);
    this.trends.exponentialEnergy.push(exponentialEnergy);
    this.trends.perpendicularEnergy.push(perpendicularEnergy);
    this.trends.centerfoldEnergy.push(centerfoldEnergy);
    this.trends.centerMass.push(centerMass);

    for (const key of Object.keys(this.trends)) {
      if (this.trends[key].length > this.maxTrendPoints) {
        this.trends[key] = this.trends[key].slice(-this.maxTrendPoints);
      }
    }
  }

  getLatest() {
    if (this.snapshots.length === 0) return null;
    return this.snapshots[this.snapshots.length - 1];
  }

  listRecent(limit = 50) {
    return this.snapshots.slice(-Math.max(1, limit));
  }

  getTrendSummary() {
    const summarize = (values = []) => {
      if (!values.length) return { min: 0, max: 0, average: 0, current: 0 };
      let min = Number.POSITIVE_INFINITY;
      let max = Number.NEGATIVE_INFINITY;
      let total = 0;
      for (const value of values) {
        if (value < min) min = value;
        if (value > max) max = value;
        total += value;
      }
      return {
        min,
        max,
        average: total / values.length,
        current: values[values.length - 1],
      };
    };

    return {
      linearEnergy: summarize(this.trends.linearEnergy),
      exponentialEnergy: summarize(this.trends.exponentialEnergy),
      perpendicularEnergy: summarize(this.trends.perpendicularEnergy),
      centerfoldEnergy: summarize(this.trends.centerfoldEnergy),
      centerMass: summarize(this.trends.centerMass),
      samples: this.sequence,
      updatedAt: this.lastUpdatedAt,
    };
  }

  reset() {
    this.snapshots = [];
    this.lastCenterfold = null;
    this.lastUpdatedAt = null;
    this.sequence = 0;
    this.trends = {
      linearEnergy: [],
      exponentialEnergy: [],
      perpendicularEnergy: [],
      centerfoldEnergy: [],
      centerMass: [],
    };
  }
}

export { CenterfoldStateStore };
export default CenterfoldStateStore;
