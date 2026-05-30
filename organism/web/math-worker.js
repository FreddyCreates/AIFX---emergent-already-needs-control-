/**
 * Math Intelligence Worker — Sovereign Mathematical Engine
 *
 * Permanent Web Worker that provides:
 * - Matrix operations (multiply, transpose, determinant, inverse)
 * - Statistical analysis (mean, variance, std-dev, correlation, regression)
 * - Phi-based golden ratio computations (Fibonacci, spiral, convergence)
 * - Fourier analysis (DFT, spectral decomposition)
 * - Probability & distributions (normal, Poisson, Bayesian update)
 * - Optimization (gradient descent, golden-section search)
 * - Number theory (primality, GCD, modular exponentiation)
 *
 * This worker runs entirely in-browser. No external APIs.
 * Pure mathematical intelligence for the organism.
 *
 * Protocol: postMessage
 *   Main → Worker: { type: 'matrix-multiply', a: [[]], b: [[]] }
 *   Main → Worker: { type: 'stats', data: [...] }
 *   Main → Worker: { type: 'phi-sequence', n: N }
 *   Main → Worker: { type: 'fourier', signal: [...] }
 *   Main → Worker: { type: 'optimize', fn: '...', bounds: [a,b] }
 *   Main → Worker: { type: 'probability', dist: '...', params: {...} }
 *   Main → Worker: { type: 'regression', x: [...], y: [...] }
 *   Main → Worker: { type: 'prime-check', n: N }
 *   Main → Worker: { type: 'stats' }
 *   Worker → Main: { type: 'math-result', ... }
 *   Worker → Main: { type: 'heartbeat', ... }
 */

'use strict';
importScripts('neuro-core.js');

var PHI = 1.618033988749895;
var PHI_INV = 0.618033988749895;
var HEARTBEAT_MS = 873;
var beatCount = 0;
var running = true;

/* ════════════════════════════════════════════════════════════════
   Metrics
   ════════════════════════════════════════════════════════════════ */

var mathMetrics = {
  totalMatrixOps: 0,
  totalStatOps: 0,
  totalPhiOps: 0,
  totalFourierOps: 0,
  totalOptimizations: 0,
  totalProbabilityOps: 0,
  totalRegressions: 0,
  totalPrimeChecks: 0,
  totalComputeTimeMs: 0
};

/* ════════════════════════════════════════════════════════════════
   Matrix Operations
   ════════════════════════════════════════════════════════════════ */

function matrixMultiply(a, b) {
  var rowsA = a.length;
  var colsA = a[0].length;
  var colsB = b[0].length;
  if (colsA !== b.length) return { error: 'Dimension mismatch' };

  var result = [];
  for (var i = 0; i < rowsA; i++) {
    result[i] = [];
    for (var j = 0; j < colsB; j++) {
      var sum = 0;
      for (var k = 0; k < colsA; k++) {
        sum += a[i][k] * b[k][j];
      }
      result[i][j] = sum;
    }
  }
  mathMetrics.totalMatrixOps++;
  return { matrix: result, rows: rowsA, cols: colsB };
}

function matrixTranspose(m) {
  var rows = m.length;
  var cols = m[0].length;
  var result = [];
  for (var j = 0; j < cols; j++) {
    result[j] = [];
    for (var i = 0; i < rows; i++) {
      result[j][i] = m[i][j];
    }
  }
  mathMetrics.totalMatrixOps++;
  return { matrix: result, rows: cols, cols: rows };
}

function matrixDeterminant(m) {
  var n = m.length;
  if (n === 1) return m[0][0];
  if (n === 2) return m[0][0] * m[1][1] - m[0][1] * m[1][0];

  var det = 0;
  for (var j = 0; j < n; j++) {
    var sub = [];
    for (var i = 1; i < n; i++) {
      var row = [];
      for (var k = 0; k < n; k++) {
        if (k !== j) row.push(m[i][k]);
      }
      sub.push(row);
    }
    det += (j % 2 === 0 ? 1 : -1) * m[0][j] * matrixDeterminant(sub);
  }
  mathMetrics.totalMatrixOps++;
  return det;
}

function matrixTrace(m) {
  var trace = 0;
  var n = Math.min(m.length, m[0].length);
  for (var i = 0; i < n; i++) trace += m[i][i];
  return trace;
}

function identityMatrix(n) {
  var m = [];
  for (var i = 0; i < n; i++) {
    m[i] = [];
    for (var j = 0; j < n; j++) {
      m[i][j] = i === j ? 1 : 0;
    }
  }
  return m;
}

/* ════════════════════════════════════════════════════════════════
   Statistical Analysis
   ════════════════════════════════════════════════════════════════ */

function computeStats(data) {
  if (!data || data.length === 0) return { error: 'Empty data' };

  var n = data.length;
  var sum = 0;
  var min = data[0];
  var max = data[0];

  for (var i = 0; i < n; i++) {
    sum += data[i];
    if (data[i] < min) min = data[i];
    if (data[i] > max) max = data[i];
  }

  var mean = sum / n;

  var varianceSum = 0;
  var skewSum = 0;
  var kurtSum = 0;
  for (var j = 0; j < n; j++) {
    var diff = data[j] - mean;
    varianceSum += diff * diff;
    skewSum += diff * diff * diff;
    kurtSum += diff * diff * diff * diff;
  }

  var variance = varianceSum / n;
  var stdDev = Math.sqrt(variance);
  var skewness = stdDev > 0 ? (skewSum / n) / (stdDev * stdDev * stdDev) : 0;
  var kurtosis = stdDev > 0 ? (kurtSum / n) / (variance * variance) - 3 : 0;

  // Median
  var sorted = data.slice().sort(function (a, b) { return a - b; });
  var median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];

  // Interquartile range
  var q1Idx = Math.floor(n * 0.25);
  var q3Idx = Math.floor(n * 0.75);
  var q1 = sorted[q1Idx];
  var q3 = sorted[q3Idx];
  var iqr = q3 - q1;

  mathMetrics.totalStatOps++;
  return {
    n: n, sum: sum, mean: round6(mean), median: round6(median),
    min: min, max: max, range: max - min,
    variance: round6(variance), stdDev: round6(stdDev),
    skewness: round6(skewness), kurtosis: round6(kurtosis),
    q1: round6(q1), q3: round6(q3), iqr: round6(iqr),
    coeffOfVariation: mean !== 0 ? round6(stdDev / Math.abs(mean)) : 0
  };
}

function correlation(x, y) {
  var n = Math.min(x.length, y.length);
  if (n < 2) return 0;

  var sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
  for (var i = 0; i < n; i++) {
    sumX += x[i]; sumY += y[i];
    sumXY += x[i] * y[i];
    sumX2 += x[i] * x[i];
    sumY2 += y[i] * y[i];
  }

  var denom = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  if (denom === 0) return 0;
  return round6((n * sumXY - sumX * sumY) / denom);
}

/* ════════════════════════════════════════════════════════════════
   Linear Regression
   ════════════════════════════════════════════════════════════════ */

function linearRegression(x, y) {
  var n = Math.min(x.length, y.length);
  if (n < 2) return { error: 'Need at least 2 data points' };

  var sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (var i = 0; i < n; i++) {
    sumX += x[i]; sumY += y[i];
    sumXY += x[i] * y[i];
    sumX2 += x[i] * x[i];
  }

  var denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return { error: 'Degenerate data' };

  var slope = (n * sumXY - sumX * sumY) / denom;
  var intercept = (sumY - slope * sumX) / n;
  var r = correlation(x, y);
  var r2 = r * r;

  // Residuals
  var residuals = [];
  var ssRes = 0;
  var meanY = sumY / n;
  var ssTot = 0;
  for (var j = 0; j < n; j++) {
    var predicted = slope * x[j] + intercept;
    var residual = y[j] - predicted;
    residuals.push(round6(residual));
    ssRes += residual * residual;
    ssTot += (y[j] - meanY) * (y[j] - meanY);
  }

  mathMetrics.totalRegressions++;
  return {
    slope: round6(slope),
    intercept: round6(intercept),
    r: round6(r),
    r2: round6(r2),
    residuals: residuals,
    standardError: round6(Math.sqrt(ssRes / (n - 2))),
    equation: 'y = ' + round6(slope) + 'x + ' + round6(intercept)
  };
}

/* ════════════════════════════════════════════════════════════════
   Phi — Golden Ratio Intelligence
   ════════════════════════════════════════════════════════════════ */

function fibonacciSequence(n) {
  n = Math.min(n || 20, 100);
  var seq = [0, 1];
  var ratios = [];
  for (var i = 2; i < n; i++) {
    seq.push(seq[i - 1] + seq[i - 2]);
    ratios.push(round6(seq[i] / seq[i - 1]));
  }
  mathMetrics.totalPhiOps++;
  return {
    sequence: seq,
    ratios: ratios,
    convergence: round6(ratios[ratios.length - 1]),
    phi: PHI,
    phiInverse: PHI_INV,
    goldenAngle: round6(360 * PHI_INV)
  };
}

function phiSpiral(n) {
  n = Math.min(n || 50, 500);
  var points = [];
  for (var i = 0; i < n; i++) {
    var angle = i * 2.399963; // golden angle in radians
    var radius = Math.sqrt(i) * PHI;
    points.push({
      x: round6(radius * Math.cos(angle)),
      y: round6(radius * Math.sin(angle)),
      r: round6(radius),
      theta: round6(angle)
    });
  }
  mathMetrics.totalPhiOps++;
  return { points: points, goldenAngle: 137.508, totalPoints: n };
}

function phiPower(n) {
  n = Math.min(n || 20, 50);
  var powers = [];
  for (var i = 0; i < n; i++) {
    var val = Math.pow(PHI, i);
    var fib = Math.round(val / Math.sqrt(5));
    powers.push({ n: i, phiN: round6(val), approxFib: fib });
  }
  mathMetrics.totalPhiOps++;
  return { powers: powers, property: 'φ^n = F(n)*φ + F(n-1)' };
}

/* ════════════════════════════════════════════════════════════════
   Discrete Fourier Transform
   ════════════════════════════════════════════════════════════════ */

function dft(signal) {
  var N = signal.length;
  if (N === 0) return { error: 'Empty signal' };

  var spectrum = [];
  for (var k = 0; k < N; k++) {
    var re = 0, im = 0;
    for (var n = 0; n < N; n++) {
      var angle = -2 * Math.PI * k * n / N;
      re += signal[n] * Math.cos(angle);
      im += signal[n] * Math.sin(angle);
    }
    var magnitude = Math.sqrt(re * re + im * im) / N;
    var phase = Math.atan2(im, re);
    spectrum.push({
      frequency: k,
      magnitude: round6(magnitude),
      phase: round6(phase),
      re: round6(re / N),
      im: round6(im / N)
    });
  }

  // Find dominant frequency
  var dominant = { frequency: 0, magnitude: 0 };
  for (var d = 1; d < Math.floor(N / 2); d++) {
    if (spectrum[d].magnitude > dominant.magnitude) {
      dominant = { frequency: d, magnitude: spectrum[d].magnitude };
    }
  }

  mathMetrics.totalFourierOps++;
  return {
    spectrum: spectrum.slice(0, Math.floor(N / 2)),
    dominantFrequency: dominant.frequency,
    dominantMagnitude: dominant.magnitude,
    signalLength: N
  };
}

/* ════════════════════════════════════════════════════════════════
   Probability & Distributions
   ════════════════════════════════════════════════════════════════ */

function normalPdf(x, mu, sigma) {
  mu = mu || 0;
  sigma = sigma || 1;
  var z = (x - mu) / sigma;
  return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z);
}

function normalCdf(x, mu, sigma) {
  mu = mu || 0;
  sigma = sigma || 1;
  var z = (x - mu) / sigma;
  // Approximation using error function
  var t = 1 / (1 + 0.2316419 * Math.abs(z));
  var d = 0.3989422804014327;
  var p = d * Math.exp(-z * z / 2) * t *
    (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  if (z > 0) p = 1 - p;
  return round6(p);
}

function poissonPmf(k, lambda) {
  if (k < 0 || lambda <= 0) return 0;
  var logP = k * Math.log(lambda) - lambda - logFactorial(k);
  return round6(Math.exp(logP));
}

function logFactorial(n) {
  if (n <= 1) return 0;
  var result = 0;
  for (var i = 2; i <= n; i++) result += Math.log(i);
  return result;
}

function bayesianUpdate(prior, likelihood, evidence) {
  if (evidence === 0) return { error: 'Evidence cannot be zero' };
  var posterior = (likelihood * prior) / evidence;
  mathMetrics.totalProbabilityOps++;
  return {
    prior: round6(prior),
    likelihood: round6(likelihood),
    evidence: round6(evidence),
    posterior: round6(posterior),
    bayesFactor: round6(likelihood / evidence)
  };
}

function probabilityDistribution(dist, params) {
  mathMetrics.totalProbabilityOps++;

  switch (dist) {
    case 'normal': {
      var mu = params.mu || 0;
      var sigma = params.sigma || 1;
      var x = params.x;
      if (x !== undefined) {
        return { pdf: round6(normalPdf(x, mu, sigma)), cdf: normalCdf(x, mu, sigma), x: x, mu: mu, sigma: sigma };
      }
      // Generate PDF curve
      var curve = [];
      for (var i = -40; i <= 40; i++) {
        var xv = mu + (i / 10) * sigma * 3;
        curve.push({ x: round6(xv), pdf: round6(normalPdf(xv, mu, sigma)) });
      }
      return { distribution: 'normal', mu: mu, sigma: sigma, curve: curve };
    }
    case 'poisson': {
      var lambda = params.lambda || 1;
      var kMax = Math.min(Math.ceil(lambda + 4 * Math.sqrt(lambda)), 50);
      var pmfCurve = [];
      for (var pk = 0; pk <= kMax; pk++) {
        pmfCurve.push({ k: pk, pmf: poissonPmf(pk, lambda) });
      }
      return { distribution: 'poisson', lambda: lambda, pmf: pmfCurve };
    }
    case 'bayesian': {
      return bayesianUpdate(params.prior || 0.5, params.likelihood || 0.8, params.evidence || 0.5);
    }
    default:
      return { error: 'Unknown distribution: ' + dist };
  }
}

/* ════════════════════════════════════════════════════════════════
   Optimization — Golden-Section Search
   ════════════════════════════════════════════════════════════════ */

function goldenSectionSearch(fn, a, b, tol) {
  tol = tol || 1e-8;
  var maxIter = 100;
  var iter = 0;

  // Parse simple function expressions
  var evalFn = buildSafeFunction(fn);
  if (!evalFn) return { error: 'Cannot parse function expression' };

  var c = b - PHI_INV * (b - a);
  var d = a + PHI_INV * (b - a);
  var history = [];

  while (Math.abs(b - a) > tol && iter < maxIter) {
    var fc = evalFn(c);
    var fd = evalFn(d);
    history.push({ iter: iter, a: round6(a), b: round6(b), fMin: round6(Math.min(fc, fd)) });

    if (fc < fd) {
      b = d;
    } else {
      a = c;
    }
    c = b - PHI_INV * (b - a);
    d = a + PHI_INV * (b - a);
    iter++;
  }

  var xMin = (a + b) / 2;
  mathMetrics.totalOptimizations++;
  return {
    xMin: round6(xMin),
    fMin: round6(evalFn(xMin)),
    iterations: iter,
    convergence: history,
    method: 'golden-section',
    goldenRatio: PHI
  };
}

// Safely evaluate simple math expressions using strict allowlist
function buildSafeFunction(expr) {
  if (typeof expr !== 'string' || expr.length > 200) return null;

  // Step 1: Only allow known safe characters
  if (!/^[0-9x+\-*/().^ \s]+$/.test(expr.replace(/\b(sin|cos|tan|abs|sqrt|exp|log|pi)\b/gi, ''))) {
    return null;
  }

  // Step 2: Ensure no sequences that could form identifiers other than allowed functions and 'x'
  var ALLOWED_WORDS = { sin: 1, cos: 1, tan: 1, abs: 1, sqrt: 1, exp: 1, log: 1, pi: 1, x: 1 };
  var words = expr.match(/[a-z]+/gi);
  if (words) {
    for (var i = 0; i < words.length; i++) {
      if (!ALLOWED_WORDS[words[i].toLowerCase()]) return null;
    }
  }

  var jsExpr = expr
    .replace(/\^/g, '**')
    .replace(/\bsin\b/gi, 'Math.sin')
    .replace(/\bcos\b/gi, 'Math.cos')
    .replace(/\btan\b/gi, 'Math.tan')
    .replace(/\babs\b/gi, 'Math.abs')
    .replace(/\bsqrt\b/gi, 'Math.sqrt')
    .replace(/\bexp\b/gi, 'Math.exp')
    .replace(/\blog\b/gi, 'Math.log')
    .replace(/\bpi\b/gi, 'Math.PI');

  try {
    return new Function('x', '"use strict"; return ' + jsExpr + ';');
  } catch (e) {
    return null;
  }
}

/* ════════════════════════════════════════════════════════════════
   Number Theory
   ════════════════════════════════════════════════════════════════ */

function isPrime(n) {
  if (n < 2) return false;
  if (n < 4) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (var i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

function primeFactorize(n) {
  if (n < 2) return [];
  var factors = [];
  for (var d = 2; d * d <= n; d++) {
    while (n % d === 0) {
      factors.push(d);
      n /= d;
    }
  }
  if (n > 1) factors.push(n);
  return factors;
}

function gcd(a, b) {
  while (b !== 0) {
    var t = b;
    b = a % b;
    a = t;
  }
  return a;
}

function primeCheck(n) {
  mathMetrics.totalPrimeChecks++;
  var result = isPrime(n);
  var factors = result ? [n] : primeFactorize(n);
  var nearestPrimes = [];

  // Find nearest primes
  var below = n - 1;
  while (below > 1 && !isPrime(below)) below--;
  if (below > 1) nearestPrimes.push(below);

  var above = n + 1;
  var limit = n + 1000;
  while (above < limit && !isPrime(above)) above++;
  if (above < limit) nearestPrimes.push(above);

  return {
    n: n,
    isPrime: result,
    factors: factors,
    nearestPrimes: nearestPrimes,
    phiConnection: round6(n / PHI),
    gcdWithFib: gcd(n, Math.round(Math.pow(PHI, Math.round(Math.log(n) / Math.log(PHI)))) )
  };
}

/* ════════════════════════════════════════════════════════════════
   Utility
   ════════════════════════════════════════════════════════════════ */

function round6(v) {
  return Math.round(v * 1000000) / 1000000;
}

/* ════════════════════════════════════════════════════════════════
   Message Handler
   ════════════════════════════════════════════════════════════════ */

self.onmessage = function (e) {
  var msg = e.data;
  neuro.onMessage(msg.type);
  var start = Date.now();

  switch (msg.type) {
    case 'matrix-multiply': {
      var result = matrixMultiply(msg.a || [[1]], msg.b || [[1]]);
      self.postMessage({ type: 'math-result', op: 'matrix-multiply', data: result });
      break;
    }
    case 'matrix-transpose': {
      var transposed = matrixTranspose(msg.matrix || [[1]]);
      self.postMessage({ type: 'math-result', op: 'matrix-transpose', data: transposed });
      break;
    }
    case 'matrix-determinant': {
      var det = matrixDeterminant(msg.matrix || [[1]]);
      mathMetrics.totalMatrixOps++;
      self.postMessage({ type: 'math-result', op: 'matrix-determinant', data: { determinant: det, trace: matrixTrace(msg.matrix || [[1]]) } });
      break;
    }
    case 'matrix-identity': {
      var id = identityMatrix(msg.n || 3);
      self.postMessage({ type: 'math-result', op: 'matrix-identity', data: { matrix: id, n: msg.n || 3 } });
      break;
    }
    case 'compute-stats': {
      var stats = computeStats(msg.data || []);
      self.postMessage({ type: 'math-result', op: 'stats', data: stats });
      break;
    }
    case 'correlation': {
      var corr = correlation(msg.x || [], msg.y || []);
      mathMetrics.totalStatOps++;
      self.postMessage({ type: 'math-result', op: 'correlation', data: { correlation: corr, strength: Math.abs(corr) > 0.7 ? 'strong' : (Math.abs(corr) > 0.3 ? 'moderate' : 'weak') } });
      break;
    }
    case 'regression': {
      var reg = linearRegression(msg.x || [], msg.y || []);
      self.postMessage({ type: 'math-result', op: 'regression', data: reg });
      break;
    }
    case 'phi-sequence': {
      var fib = fibonacciSequence(msg.n || 20);
      self.postMessage({ type: 'math-result', op: 'phi-sequence', data: fib });
      break;
    }
    case 'phi-spiral': {
      var spiral = phiSpiral(msg.n || 50);
      self.postMessage({ type: 'math-result', op: 'phi-spiral', data: spiral });
      break;
    }
    case 'phi-power': {
      var powers = phiPower(msg.n || 20);
      self.postMessage({ type: 'math-result', op: 'phi-power', data: powers });
      break;
    }
    case 'fourier': {
      var spectrum = dft(msg.signal || []);
      self.postMessage({ type: 'math-result', op: 'fourier', data: spectrum });
      break;
    }
    case 'probability': {
      var prob = probabilityDistribution(msg.dist || 'normal', msg.params || {});
      self.postMessage({ type: 'math-result', op: 'probability', data: prob });
      break;
    }
    case 'optimize': {
      var opt = goldenSectionSearch(msg.fn || 'x*x', msg.bounds ? msg.bounds[0] : -10, msg.bounds ? msg.bounds[1] : 10, msg.tol);
      self.postMessage({ type: 'math-result', op: 'optimize', data: opt });
      break;
    }
    case 'prime-check': {
      var prime = primeCheck(msg.n || 2);
      self.postMessage({ type: 'math-result', op: 'prime-check', data: prime });
      break;
    }
    case 'stats': {
      self.postMessage({ type: 'math-stats', stats: mathMetrics });
      break;
    }
    case 'neuro-signal':
      neuro.receiveNeuroSignal(msg);
      break;
    case 'stop':
      running = false;
      break;
  }

  mathMetrics.totalComputeTimeMs += Date.now() - start;
  neuro.onMessageDone();
};

/* ════════════════════════════════════════════════════════════════
   Heartbeat
   ════════════════════════════════════════════════════════════════ */

var neuro = new NeuroCore('math');

setInterval(function () {
  if (!running) return;
  beatCount++;
  self.postMessage({
    type: 'heartbeat',
    worker: 'math',
    beat: beatCount,
    timestamp: Date.now(),
    status: 'alive',
    metrics: mathMetrics,
    neuro: neuro.pulse()
  });
}, HEARTBEAT_MS);
