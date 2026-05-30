/**
 * CENTERFOLD MATH LAYER
 *
 * Defines the core primitives for:
 * - Linear flow (deterministic directional propagation)
 * - Exponential parallel flow (amplitude growth/decay manifolds)
 * - Perpendicular interaction (cross-axis coupling)
 * - Centerfold convergence (weighted manifold collapse)
 */

const DEFAULT_EPSILON = 1e-9;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function safeNumber(value, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

function magnitude(vector = []) {
  let sum = 0;
  for (let i = 0; i < vector.length; i += 1) {
    const n = safeNumber(vector[i], 0);
    sum += n * n;
  }
  return Math.sqrt(sum);
}

function normalize(vector = []) {
  const len = magnitude(vector);
  if (len < DEFAULT_EPSILON) {
    return vector.map(() => 0);
  }
  return vector.map((entry) => safeNumber(entry, 0) / len);
}

function dot(a = [], b = []) {
  const limit = Math.min(a.length, b.length);
  let sum = 0;
  for (let i = 0; i < limit; i += 1) {
    sum += safeNumber(a[i], 0) * safeNumber(b[i], 0);
  }
  return sum;
}

function addVectors(a = [], b = []) {
  const limit = Math.max(a.length, b.length);
  const out = new Array(limit);
  for (let i = 0; i < limit; i += 1) {
    out[i] = safeNumber(a[i], 0) + safeNumber(b[i], 0);
  }
  return out;
}

function scaleVector(vector = [], factor = 1) {
  const f = safeNumber(factor, 1);
  return vector.map((entry) => safeNumber(entry, 0) * f);
}

function createLinearPath(inputVector = [], model = {}) {
  const {
    slope = 1,
    bias = 0,
    damping = 0,
    floor = -Infinity,
    ceiling = Infinity,
  } = model;

  const s = safeNumber(slope, 1);
  const b = safeNumber(bias, 0);
  const d = clamp(safeNumber(damping, 0), 0, 1);

  const output = inputVector.map((entry) => {
    const source = safeNumber(entry, 0);
    const transformed = source * s + b;
    const damped = transformed * (1 - d);
    return clamp(damped, floor, ceiling);
  });

  return {
    mode: 'linear',
    slope: s,
    bias: b,
    damping: d,
    output,
    energy: magnitude(output),
  };
}

function createExponentialParallel(inputVector = [], model = {}) {
  const {
    base = Math.E,
    gain = 1,
    offset = 0,
    branches = 3,
    maxValue = 1e6,
  } = model;

  const b = Math.max(DEFAULT_EPSILON, safeNumber(base, Math.E));
  const g = safeNumber(gain, 1);
  const o = safeNumber(offset, 0);
  const branchCount = Math.max(1, Math.floor(safeNumber(branches, 3)));

  const branchVectors = [];
  for (let branch = 0; branch < branchCount; branch += 1) {
    const branchGain = g * (1 + branch / branchCount);
    const vector = inputVector.map((entry, index) => {
      const x = safeNumber(entry, 0) * branchGain + o + index * 0.01;
      const exp = Math.pow(b, x);
      return clamp(exp, -maxValue, maxValue);
    });
    branchVectors.push(vector);
  }

  const aggregate = branchVectors.reduce((acc, current) => addVectors(acc, current), inputVector.map(() => 0));
  const normalizedAggregate = scaleVector(aggregate, 1 / branchVectors.length);

  return {
    mode: 'exponential_parallel',
    base: b,
    gain: g,
    offset: o,
    branches: branchVectors,
    aggregate: normalizedAggregate,
    energy: magnitude(normalizedAggregate),
  };
}

function createPerpendicularInteraction(linearVector = [], exponentialVector = [], model = {}) {
  const {
    coupling = 0.5,
    orthogonalityFloor = -1,
    orthogonalityCeiling = 1,
  } = model;

  const l = normalize(linearVector);
  const e = normalize(exponentialVector);
  const rawOrthogonality = dot(l, e);
  const orthogonality = clamp(rawOrthogonality, orthogonalityFloor, orthogonalityCeiling);
  const c = clamp(safeNumber(coupling, 0.5), 0, 5);

  const perpendicularVector = linearVector.map((entry, index) => {
    const lv = safeNumber(entry, 0);
    const ev = safeNumber(exponentialVector[index], 0);
    return (lv - ev * orthogonality) * c;
  });

  return {
    mode: 'perpendicular',
    coupling: c,
    orthogonality,
    vector: perpendicularVector,
    energy: magnitude(perpendicularVector),
  };
}

function convergeToCenterfold(linearPath = {}, exponentialPath = {}, perpendicularPath = {}, model = {}) {
  const {
    linearWeight = 0.34,
    exponentialWeight = 0.33,
    perpendicularWeight = 0.33,
    centerBias = 0,
    centerClamp = 1e6,
  } = model;

  const lw = safeNumber(linearWeight, 0.34);
  const ew = safeNumber(exponentialWeight, 0.33);
  const pw = safeNumber(perpendicularWeight, 0.33);

  const linear = Array.isArray(linearPath.output) ? linearPath.output : [];
  const exponential = Array.isArray(exponentialPath.aggregate) ? exponentialPath.aggregate : [];
  const perpendicular = Array.isArray(perpendicularPath.vector) ? perpendicularPath.vector : [];

  const maxLen = Math.max(linear.length, exponential.length, perpendicular.length);
  const centerVector = new Array(maxLen);

  for (let i = 0; i < maxLen; i += 1) {
    const l = safeNumber(linear[i], 0);
    const e = safeNumber(exponential[i], 0);
    const p = safeNumber(perpendicular[i], 0);
    const mixed = l * lw + e * ew + p * pw + centerBias;
    centerVector[i] = clamp(mixed, -centerClamp, centerClamp);
  }

  const centerMass = centerVector.reduce((sum, entry) => sum + Math.abs(entry), 0) / Math.max(1, centerVector.length);

  return {
    mode: 'centerfold',
    vector: centerVector,
    centerMass,
    energy: magnitude(centerVector),
    weights: {
      linear: lw,
      exponential: ew,
      perpendicular: pw,
    },
  };
}

export {
  DEFAULT_EPSILON,
  clamp,
  safeNumber,
  magnitude,
  normalize,
  dot,
  addVectors,
  scaleVector,
  createLinearPath,
  createExponentialParallel,
  createPerpendicularInteraction,
  convergeToCenterfold,
};
