/**
 * CENTERFOLD KERNEL BANK
 *
 * Large calibration lattice for linear/exponential/perpendicular/centerfold behavior.
 * Each kernel is traceable and selectable by entropy band or explicit id.
 */

const CENTERFOLD_KERNEL_CATALOG = {
  'KERNEL-0001': {
    id: 'KERNEL-0001',
    version: '1.0.1',
    entropyBand: [0.000000, 0.001111],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.685000,
        bias: -0.060000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.018000,
        gain: 0.460000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.480000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0002': {
    id: 'KERNEL-0002',
    version: '1.0.2',
    entropyBand: [0.001111, 0.002222],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.720000,
        bias: -0.045000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.026000,
        gain: 0.520000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.510000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0003': {
    id: 'KERNEL-0003',
    version: '1.0.3',
    entropyBand: [0.002222, 0.003333],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.755000,
        bias: -0.030000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.034000,
        gain: 0.580000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.540000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0004': {
    id: 'KERNEL-0004',
    version: '1.0.4',
    entropyBand: [0.003333, 0.004444],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.790000,
        bias: -0.015000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.042000,
        gain: 0.640000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.570000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0005': {
    id: 'KERNEL-0005',
    version: '1.0.5',
    entropyBand: [0.004444, 0.005556],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.825000,
        bias: 0.000000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.050000,
        gain: 0.700000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.600000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0006': {
    id: 'KERNEL-0006',
    version: '1.0.6',
    entropyBand: [0.005556, 0.006667],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.860000,
        bias: 0.015000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.058000,
        gain: 0.760000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.630000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0007': {
    id: 'KERNEL-0007',
    version: '1.0.7',
    entropyBand: [0.006667, 0.007778],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.895000,
        bias: 0.030000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.066000,
        gain: 0.820000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.660000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0008': {
    id: 'KERNEL-0008',
    version: '1.0.8',
    entropyBand: [0.007778, 0.008889],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.930000,
        bias: 0.045000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.074000,
        gain: 0.880000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.690000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0009': {
    id: 'KERNEL-0009',
    version: '1.0.9',
    entropyBand: [0.008889, 0.010000],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.965000,
        bias: 0.060000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.082000,
        gain: 0.940000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.720000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0010': {
    id: 'KERNEL-0010',
    version: '1.0.10',
    entropyBand: [0.010000, 0.011111],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.000000,
        bias: 0.075000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.090000,
        gain: 1.000000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.750000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0011': {
    id: 'KERNEL-0011',
    version: '1.0.11',
    entropyBand: [0.011111, 0.012222],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.035000,
        bias: -0.075000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.098000,
        gain: 1.060000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.780000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0012': {
    id: 'KERNEL-0012',
    version: '1.0.12',
    entropyBand: [0.012222, 0.013333],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.070000,
        bias: -0.060000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.106000,
        gain: 1.120000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.810000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0013': {
    id: 'KERNEL-0013',
    version: '1.0.13',
    entropyBand: [0.013333, 0.014444],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.105000,
        bias: -0.045000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.114000,
        gain: 1.180000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.840000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0014': {
    id: 'KERNEL-0014',
    version: '1.0.14',
    entropyBand: [0.014444, 0.015556],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.140000,
        bias: -0.030000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.122000,
        gain: 1.240000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.870000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0015': {
    id: 'KERNEL-0015',
    version: '1.0.15',
    entropyBand: [0.015556, 0.016667],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.175000,
        bias: -0.015000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.130000,
        gain: 1.300000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.900000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0016': {
    id: 'KERNEL-0016',
    version: '1.0.16',
    entropyBand: [0.016667, 0.017778],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.210000,
        bias: 0.000000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.138000,
        gain: 1.360000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.930000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0017': {
    id: 'KERNEL-0017',
    version: '1.0.17',
    entropyBand: [0.017778, 0.018889],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.650000,
        bias: 0.015000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.146000,
        gain: 1.420000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.960000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0018': {
    id: 'KERNEL-0018',
    version: '1.0.18',
    entropyBand: [0.018889, 0.020000],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.685000,
        bias: 0.030000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.154000,
        gain: 1.480000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.990000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0019': {
    id: 'KERNEL-0019',
    version: '1.0.19',
    entropyBand: [0.020000, 0.021111],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.720000,
        bias: 0.045000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.010000,
        gain: 1.540000,
        branches: 7,
      },
      perpendicular: {
        coupling: 1.020000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0020': {
    id: 'KERNEL-0020',
    version: '1.0.20',
    entropyBand: [0.021111, 0.022222],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.755000,
        bias: 0.060000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.018000,
        gain: 1.600000,
        branches: 8,
      },
      perpendicular: {
        coupling: 1.050000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0021': {
    id: 'KERNEL-0021',
    version: '1.0.21',
    entropyBand: [0.022222, 0.023333],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.790000,
        bias: 0.075000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.026000,
        gain: 1.660000,
        branches: 2,
      },
      perpendicular: {
        coupling: 1.080000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0022': {
    id: 'KERNEL-0022',
    version: '1.0.22',
    entropyBand: [0.023333, 0.024444],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.825000,
        bias: -0.075000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.034000,
        gain: 1.720000,
        branches: 3,
      },
      perpendicular: {
        coupling: 1.110000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0023': {
    id: 'KERNEL-0023',
    version: '1.0.23',
    entropyBand: [0.024444, 0.025556],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.860000,
        bias: -0.060000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.042000,
        gain: 0.400000,
        branches: 4,
      },
      perpendicular: {
        coupling: 1.140000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0024': {
    id: 'KERNEL-0024',
    version: '1.0.24',
    entropyBand: [0.025556, 0.026667],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.895000,
        bias: -0.045000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.050000,
        gain: 0.460000,
        branches: 5,
      },
      perpendicular: {
        coupling: 1.170000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0025': {
    id: 'KERNEL-0025',
    version: '1.0.25',
    entropyBand: [0.026667, 0.027778],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.930000,
        bias: -0.030000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.058000,
        gain: 0.520000,
        branches: 6,
      },
      perpendicular: {
        coupling: 1.200000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0026': {
    id: 'KERNEL-0026',
    version: '1.0.26',
    entropyBand: [0.027778, 0.028889],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.965000,
        bias: -0.015000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.066000,
        gain: 0.580000,
        branches: 7,
      },
      perpendicular: {
        coupling: 1.230000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0027': {
    id: 'KERNEL-0027',
    version: '1.0.27',
    entropyBand: [0.028889, 0.030000],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.000000,
        bias: 0.000000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.074000,
        gain: 0.640000,
        branches: 8,
      },
      perpendicular: {
        coupling: 1.260000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0028': {
    id: 'KERNEL-0028',
    version: '1.0.28',
    entropyBand: [0.030000, 0.031111],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.035000,
        bias: 0.015000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.082000,
        gain: 0.700000,
        branches: 2,
      },
      perpendicular: {
        coupling: 1.290000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0029': {
    id: 'KERNEL-0029',
    version: '1.0.29',
    entropyBand: [0.031111, 0.032222],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.070000,
        bias: 0.030000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.090000,
        gain: 0.760000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.450000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0030': {
    id: 'KERNEL-0030',
    version: '1.0.30',
    entropyBand: [0.032222, 0.033333],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.105000,
        bias: 0.045000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.098000,
        gain: 0.820000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.480000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0031': {
    id: 'KERNEL-0031',
    version: '1.0.31',
    entropyBand: [0.033333, 0.034444],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.140000,
        bias: 0.060000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.106000,
        gain: 0.880000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.510000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0032': {
    id: 'KERNEL-0032',
    version: '1.0.32',
    entropyBand: [0.034444, 0.035556],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.175000,
        bias: 0.075000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.114000,
        gain: 0.940000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.540000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0033': {
    id: 'KERNEL-0033',
    version: '1.0.33',
    entropyBand: [0.035556, 0.036667],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.210000,
        bias: -0.075000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.122000,
        gain: 1.000000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.570000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0034': {
    id: 'KERNEL-0034',
    version: '1.0.34',
    entropyBand: [0.036667, 0.037778],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.650000,
        bias: -0.060000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.130000,
        gain: 1.060000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.600000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0035': {
    id: 'KERNEL-0035',
    version: '1.0.35',
    entropyBand: [0.037778, 0.038889],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.685000,
        bias: -0.045000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.138000,
        gain: 1.120000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.630000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0036': {
    id: 'KERNEL-0036',
    version: '1.0.36',
    entropyBand: [0.038889, 0.040000],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.720000,
        bias: -0.030000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.146000,
        gain: 1.180000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.660000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0037': {
    id: 'KERNEL-0037',
    version: '1.0.37',
    entropyBand: [0.040000, 0.041111],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.755000,
        bias: -0.015000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.154000,
        gain: 1.240000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.690000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0038': {
    id: 'KERNEL-0038',
    version: '1.0.38',
    entropyBand: [0.041111, 0.042222],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.790000,
        bias: 0.000000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.010000,
        gain: 1.300000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.720000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0039': {
    id: 'KERNEL-0039',
    version: '1.0.39',
    entropyBand: [0.042222, 0.043333],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.825000,
        bias: 0.015000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.018000,
        gain: 1.360000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.750000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0040': {
    id: 'KERNEL-0040',
    version: '1.0.40',
    entropyBand: [0.043333, 0.044444],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.860000,
        bias: 0.030000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.026000,
        gain: 1.420000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.780000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0041': {
    id: 'KERNEL-0041',
    version: '1.0.41',
    entropyBand: [0.044444, 0.045556],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.895000,
        bias: 0.045000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.034000,
        gain: 1.480000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.810000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0042': {
    id: 'KERNEL-0042',
    version: '1.0.42',
    entropyBand: [0.045556, 0.046667],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.930000,
        bias: 0.060000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.042000,
        gain: 1.540000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.840000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0043': {
    id: 'KERNEL-0043',
    version: '1.0.43',
    entropyBand: [0.046667, 0.047778],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.965000,
        bias: 0.075000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.050000,
        gain: 1.600000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.870000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0044': {
    id: 'KERNEL-0044',
    version: '1.0.44',
    entropyBand: [0.047778, 0.048889],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.000000,
        bias: -0.075000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.058000,
        gain: 1.660000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.900000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0045': {
    id: 'KERNEL-0045',
    version: '1.0.45',
    entropyBand: [0.048889, 0.050000],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.035000,
        bias: -0.060000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.066000,
        gain: 1.720000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.930000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0046': {
    id: 'KERNEL-0046',
    version: '1.0.46',
    entropyBand: [0.050000, 0.051111],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.070000,
        bias: -0.045000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.074000,
        gain: 0.400000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.960000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0047': {
    id: 'KERNEL-0047',
    version: '1.0.47',
    entropyBand: [0.051111, 0.052222],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.105000,
        bias: -0.030000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.082000,
        gain: 0.460000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.990000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0048': {
    id: 'KERNEL-0048',
    version: '1.0.48',
    entropyBand: [0.052222, 0.053333],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.140000,
        bias: -0.015000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.090000,
        gain: 0.520000,
        branches: 8,
      },
      perpendicular: {
        coupling: 1.020000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0049': {
    id: 'KERNEL-0049',
    version: '1.0.49',
    entropyBand: [0.053333, 0.054444],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.175000,
        bias: 0.000000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.098000,
        gain: 0.580000,
        branches: 2,
      },
      perpendicular: {
        coupling: 1.050000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0050': {
    id: 'KERNEL-0050',
    version: '1.0.50',
    entropyBand: [0.054444, 0.055556],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.210000,
        bias: 0.015000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.106000,
        gain: 0.640000,
        branches: 3,
      },
      perpendicular: {
        coupling: 1.080000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0051': {
    id: 'KERNEL-0051',
    version: '1.0.51',
    entropyBand: [0.055556, 0.056667],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.650000,
        bias: 0.030000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.114000,
        gain: 0.700000,
        branches: 4,
      },
      perpendicular: {
        coupling: 1.110000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0052': {
    id: 'KERNEL-0052',
    version: '1.0.52',
    entropyBand: [0.056667, 0.057778],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.685000,
        bias: 0.045000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.122000,
        gain: 0.760000,
        branches: 5,
      },
      perpendicular: {
        coupling: 1.140000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0053': {
    id: 'KERNEL-0053',
    version: '1.0.53',
    entropyBand: [0.057778, 0.058889],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.720000,
        bias: 0.060000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.130000,
        gain: 0.820000,
        branches: 6,
      },
      perpendicular: {
        coupling: 1.170000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0054': {
    id: 'KERNEL-0054',
    version: '1.0.54',
    entropyBand: [0.058889, 0.060000],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.755000,
        bias: 0.075000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.138000,
        gain: 0.880000,
        branches: 7,
      },
      perpendicular: {
        coupling: 1.200000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0055': {
    id: 'KERNEL-0055',
    version: '1.0.55',
    entropyBand: [0.060000, 0.061111],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.790000,
        bias: -0.075000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.146000,
        gain: 0.940000,
        branches: 8,
      },
      perpendicular: {
        coupling: 1.230000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0056': {
    id: 'KERNEL-0056',
    version: '1.0.56',
    entropyBand: [0.061111, 0.062222],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.825000,
        bias: -0.060000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.154000,
        gain: 1.000000,
        branches: 2,
      },
      perpendicular: {
        coupling: 1.260000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0057': {
    id: 'KERNEL-0057',
    version: '1.0.57',
    entropyBand: [0.062222, 0.063333],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.860000,
        bias: -0.045000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.010000,
        gain: 1.060000,
        branches: 3,
      },
      perpendicular: {
        coupling: 1.290000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0058': {
    id: 'KERNEL-0058',
    version: '1.0.58',
    entropyBand: [0.063333, 0.064444],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.895000,
        bias: -0.030000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.018000,
        gain: 1.120000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.450000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0059': {
    id: 'KERNEL-0059',
    version: '1.0.59',
    entropyBand: [0.064444, 0.065556],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.930000,
        bias: -0.015000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.026000,
        gain: 1.180000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.480000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0060': {
    id: 'KERNEL-0060',
    version: '1.0.60',
    entropyBand: [0.065556, 0.066667],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.965000,
        bias: 0.000000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.034000,
        gain: 1.240000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.510000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0061': {
    id: 'KERNEL-0061',
    version: '1.0.61',
    entropyBand: [0.066667, 0.067778],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.000000,
        bias: 0.015000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.042000,
        gain: 1.300000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.540000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0062': {
    id: 'KERNEL-0062',
    version: '1.0.62',
    entropyBand: [0.067778, 0.068889],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.035000,
        bias: 0.030000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.050000,
        gain: 1.360000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.570000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0063': {
    id: 'KERNEL-0063',
    version: '1.0.63',
    entropyBand: [0.068889, 0.070000],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.070000,
        bias: 0.045000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.058000,
        gain: 1.420000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.600000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0064': {
    id: 'KERNEL-0064',
    version: '1.0.64',
    entropyBand: [0.070000, 0.071111],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.105000,
        bias: 0.060000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.066000,
        gain: 1.480000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.630000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0065': {
    id: 'KERNEL-0065',
    version: '1.0.65',
    entropyBand: [0.071111, 0.072222],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.140000,
        bias: 0.075000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.074000,
        gain: 1.540000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.660000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0066': {
    id: 'KERNEL-0066',
    version: '1.0.66',
    entropyBand: [0.072222, 0.073333],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.175000,
        bias: -0.075000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.082000,
        gain: 1.600000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.690000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0067': {
    id: 'KERNEL-0067',
    version: '1.0.67',
    entropyBand: [0.073333, 0.074444],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.210000,
        bias: -0.060000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.090000,
        gain: 1.660000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.720000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0068': {
    id: 'KERNEL-0068',
    version: '1.0.68',
    entropyBand: [0.074444, 0.075556],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.650000,
        bias: -0.045000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.098000,
        gain: 1.720000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.750000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0069': {
    id: 'KERNEL-0069',
    version: '1.0.69',
    entropyBand: [0.075556, 0.076667],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.685000,
        bias: -0.030000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.106000,
        gain: 0.400000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.780000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0070': {
    id: 'KERNEL-0070',
    version: '1.0.70',
    entropyBand: [0.076667, 0.077778],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.720000,
        bias: -0.015000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.114000,
        gain: 0.460000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.810000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0071': {
    id: 'KERNEL-0071',
    version: '1.0.71',
    entropyBand: [0.077778, 0.078889],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.755000,
        bias: 0.000000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.122000,
        gain: 0.520000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.840000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0072': {
    id: 'KERNEL-0072',
    version: '1.0.72',
    entropyBand: [0.078889, 0.080000],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.790000,
        bias: 0.015000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.130000,
        gain: 0.580000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.870000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0073': {
    id: 'KERNEL-0073',
    version: '1.0.73',
    entropyBand: [0.080000, 0.081111],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.825000,
        bias: 0.030000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.138000,
        gain: 0.640000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.900000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0074': {
    id: 'KERNEL-0074',
    version: '1.0.74',
    entropyBand: [0.081111, 0.082222],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.860000,
        bias: 0.045000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.146000,
        gain: 0.700000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.930000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0075': {
    id: 'KERNEL-0075',
    version: '1.0.75',
    entropyBand: [0.082222, 0.083333],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.895000,
        bias: 0.060000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.154000,
        gain: 0.760000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.960000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0076': {
    id: 'KERNEL-0076',
    version: '1.0.76',
    entropyBand: [0.083333, 0.084444],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.930000,
        bias: 0.075000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.010000,
        gain: 0.820000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.990000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0077': {
    id: 'KERNEL-0077',
    version: '1.0.77',
    entropyBand: [0.084444, 0.085556],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.965000,
        bias: -0.075000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.018000,
        gain: 0.880000,
        branches: 2,
      },
      perpendicular: {
        coupling: 1.020000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0078': {
    id: 'KERNEL-0078',
    version: '1.0.78',
    entropyBand: [0.085556, 0.086667],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.000000,
        bias: -0.060000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.026000,
        gain: 0.940000,
        branches: 3,
      },
      perpendicular: {
        coupling: 1.050000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0079': {
    id: 'KERNEL-0079',
    version: '1.0.79',
    entropyBand: [0.086667, 0.087778],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.035000,
        bias: -0.045000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.034000,
        gain: 1.000000,
        branches: 4,
      },
      perpendicular: {
        coupling: 1.080000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0080': {
    id: 'KERNEL-0080',
    version: '1.0.80',
    entropyBand: [0.087778, 0.088889],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.070000,
        bias: -0.030000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.042000,
        gain: 1.060000,
        branches: 5,
      },
      perpendicular: {
        coupling: 1.110000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0081': {
    id: 'KERNEL-0081',
    version: '1.0.81',
    entropyBand: [0.088889, 0.090000],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.105000,
        bias: -0.015000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.050000,
        gain: 1.120000,
        branches: 6,
      },
      perpendicular: {
        coupling: 1.140000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0082': {
    id: 'KERNEL-0082',
    version: '1.0.82',
    entropyBand: [0.090000, 0.091111],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.140000,
        bias: 0.000000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.058000,
        gain: 1.180000,
        branches: 7,
      },
      perpendicular: {
        coupling: 1.170000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0083': {
    id: 'KERNEL-0083',
    version: '1.0.83',
    entropyBand: [0.091111, 0.092222],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.175000,
        bias: 0.015000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.066000,
        gain: 1.240000,
        branches: 8,
      },
      perpendicular: {
        coupling: 1.200000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0084': {
    id: 'KERNEL-0084',
    version: '1.0.84',
    entropyBand: [0.092222, 0.093333],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.210000,
        bias: 0.030000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.074000,
        gain: 1.300000,
        branches: 2,
      },
      perpendicular: {
        coupling: 1.230000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0085': {
    id: 'KERNEL-0085',
    version: '1.0.85',
    entropyBand: [0.093333, 0.094444],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.650000,
        bias: 0.045000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.082000,
        gain: 1.360000,
        branches: 3,
      },
      perpendicular: {
        coupling: 1.260000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0086': {
    id: 'KERNEL-0086',
    version: '1.0.86',
    entropyBand: [0.094444, 0.095556],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.685000,
        bias: 0.060000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.090000,
        gain: 1.420000,
        branches: 4,
      },
      perpendicular: {
        coupling: 1.290000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0087': {
    id: 'KERNEL-0087',
    version: '1.0.87',
    entropyBand: [0.095556, 0.096667],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.720000,
        bias: 0.075000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.098000,
        gain: 1.480000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.450000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0088': {
    id: 'KERNEL-0088',
    version: '1.0.88',
    entropyBand: [0.096667, 0.097778],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.755000,
        bias: -0.075000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.106000,
        gain: 1.540000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.480000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0089': {
    id: 'KERNEL-0089',
    version: '1.0.89',
    entropyBand: [0.097778, 0.098889],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.790000,
        bias: -0.060000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.114000,
        gain: 1.600000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.510000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0090': {
    id: 'KERNEL-0090',
    version: '1.0.90',
    entropyBand: [0.098889, 0.100000],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.825000,
        bias: -0.045000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.122000,
        gain: 1.660000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.540000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0091': {
    id: 'KERNEL-0091',
    version: '1.0.91',
    entropyBand: [0.100000, 0.101111],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.860000,
        bias: -0.030000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.130000,
        gain: 1.720000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.570000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0092': {
    id: 'KERNEL-0092',
    version: '1.0.92',
    entropyBand: [0.101111, 0.102222],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.895000,
        bias: -0.015000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.138000,
        gain: 0.400000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.600000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0093': {
    id: 'KERNEL-0093',
    version: '1.0.93',
    entropyBand: [0.102222, 0.103333],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.930000,
        bias: 0.000000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.146000,
        gain: 0.460000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.630000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0094': {
    id: 'KERNEL-0094',
    version: '1.0.94',
    entropyBand: [0.103333, 0.104444],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.965000,
        bias: 0.015000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.154000,
        gain: 0.520000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.660000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0095': {
    id: 'KERNEL-0095',
    version: '1.0.95',
    entropyBand: [0.104444, 0.105556],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.000000,
        bias: 0.030000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.010000,
        gain: 0.580000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.690000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0096': {
    id: 'KERNEL-0096',
    version: '1.0.96',
    entropyBand: [0.105556, 0.106667],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.035000,
        bias: 0.045000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.018000,
        gain: 0.640000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.720000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0097': {
    id: 'KERNEL-0097',
    version: '1.0.97',
    entropyBand: [0.106667, 0.107778],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.070000,
        bias: 0.060000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.026000,
        gain: 0.700000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.750000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0098': {
    id: 'KERNEL-0098',
    version: '1.0.98',
    entropyBand: [0.107778, 0.108889],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.105000,
        bias: 0.075000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.034000,
        gain: 0.760000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.780000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0099': {
    id: 'KERNEL-0099',
    version: '1.0.99',
    entropyBand: [0.108889, 0.110000],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.140000,
        bias: -0.075000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.042000,
        gain: 0.820000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.810000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0100': {
    id: 'KERNEL-0100',
    version: '1.0.100',
    entropyBand: [0.110000, 0.111111],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.175000,
        bias: -0.060000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.050000,
        gain: 0.880000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.840000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0101': {
    id: 'KERNEL-0101',
    version: '1.0.101',
    entropyBand: [0.111111, 0.112222],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.210000,
        bias: -0.045000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.058000,
        gain: 0.940000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.870000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0102': {
    id: 'KERNEL-0102',
    version: '1.0.102',
    entropyBand: [0.112222, 0.113333],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.650000,
        bias: -0.030000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.066000,
        gain: 1.000000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.900000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0103': {
    id: 'KERNEL-0103',
    version: '1.0.103',
    entropyBand: [0.113333, 0.114444],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.685000,
        bias: -0.015000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.074000,
        gain: 1.060000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.930000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0104': {
    id: 'KERNEL-0104',
    version: '1.0.104',
    entropyBand: [0.114444, 0.115556],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.720000,
        bias: 0.000000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.082000,
        gain: 1.120000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.960000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0105': {
    id: 'KERNEL-0105',
    version: '1.0.105',
    entropyBand: [0.115556, 0.116667],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.755000,
        bias: 0.015000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.090000,
        gain: 1.180000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.990000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0106': {
    id: 'KERNEL-0106',
    version: '1.0.106',
    entropyBand: [0.116667, 0.117778],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.790000,
        bias: 0.030000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.098000,
        gain: 1.240000,
        branches: 3,
      },
      perpendicular: {
        coupling: 1.020000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0107': {
    id: 'KERNEL-0107',
    version: '1.0.107',
    entropyBand: [0.117778, 0.118889],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.825000,
        bias: 0.045000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.106000,
        gain: 1.300000,
        branches: 4,
      },
      perpendicular: {
        coupling: 1.050000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0108': {
    id: 'KERNEL-0108',
    version: '1.0.108',
    entropyBand: [0.118889, 0.120000],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.860000,
        bias: 0.060000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.114000,
        gain: 1.360000,
        branches: 5,
      },
      perpendicular: {
        coupling: 1.080000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0109': {
    id: 'KERNEL-0109',
    version: '1.0.109',
    entropyBand: [0.120000, 0.121111],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.895000,
        bias: 0.075000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.122000,
        gain: 1.420000,
        branches: 6,
      },
      perpendicular: {
        coupling: 1.110000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0110': {
    id: 'KERNEL-0110',
    version: '1.0.110',
    entropyBand: [0.121111, 0.122222],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.930000,
        bias: -0.075000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.130000,
        gain: 1.480000,
        branches: 7,
      },
      perpendicular: {
        coupling: 1.140000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0111': {
    id: 'KERNEL-0111',
    version: '1.0.111',
    entropyBand: [0.122222, 0.123333],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.965000,
        bias: -0.060000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.138000,
        gain: 1.540000,
        branches: 8,
      },
      perpendicular: {
        coupling: 1.170000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0112': {
    id: 'KERNEL-0112',
    version: '1.0.112',
    entropyBand: [0.123333, 0.124444],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.000000,
        bias: -0.045000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.146000,
        gain: 1.600000,
        branches: 2,
      },
      perpendicular: {
        coupling: 1.200000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0113': {
    id: 'KERNEL-0113',
    version: '1.0.113',
    entropyBand: [0.124444, 0.125556],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.035000,
        bias: -0.030000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.154000,
        gain: 1.660000,
        branches: 3,
      },
      perpendicular: {
        coupling: 1.230000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0114': {
    id: 'KERNEL-0114',
    version: '1.0.114',
    entropyBand: [0.125556, 0.126667],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.070000,
        bias: -0.015000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.010000,
        gain: 1.720000,
        branches: 4,
      },
      perpendicular: {
        coupling: 1.260000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0115': {
    id: 'KERNEL-0115',
    version: '1.0.115',
    entropyBand: [0.126667, 0.127778],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.105000,
        bias: 0.000000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.018000,
        gain: 0.400000,
        branches: 5,
      },
      perpendicular: {
        coupling: 1.290000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0116': {
    id: 'KERNEL-0116',
    version: '1.0.116',
    entropyBand: [0.127778, 0.128889],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.140000,
        bias: 0.015000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.026000,
        gain: 0.460000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.450000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0117': {
    id: 'KERNEL-0117',
    version: '1.0.117',
    entropyBand: [0.128889, 0.130000],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.175000,
        bias: 0.030000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.034000,
        gain: 0.520000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.480000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0118': {
    id: 'KERNEL-0118',
    version: '1.0.118',
    entropyBand: [0.130000, 0.131111],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.210000,
        bias: 0.045000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.042000,
        gain: 0.580000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.510000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0119': {
    id: 'KERNEL-0119',
    version: '1.0.119',
    entropyBand: [0.131111, 0.132222],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.650000,
        bias: 0.060000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.050000,
        gain: 0.640000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.540000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0120': {
    id: 'KERNEL-0120',
    version: '1.0.120',
    entropyBand: [0.132222, 0.133333],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.685000,
        bias: 0.075000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.058000,
        gain: 0.700000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.570000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0121': {
    id: 'KERNEL-0121',
    version: '1.0.121',
    entropyBand: [0.133333, 0.134444],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.720000,
        bias: -0.075000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.066000,
        gain: 0.760000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.600000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0122': {
    id: 'KERNEL-0122',
    version: '1.0.122',
    entropyBand: [0.134444, 0.135556],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.755000,
        bias: -0.060000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.074000,
        gain: 0.820000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.630000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0123': {
    id: 'KERNEL-0123',
    version: '1.0.123',
    entropyBand: [0.135556, 0.136667],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.790000,
        bias: -0.045000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.082000,
        gain: 0.880000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.660000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0124': {
    id: 'KERNEL-0124',
    version: '1.0.124',
    entropyBand: [0.136667, 0.137778],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.825000,
        bias: -0.030000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.090000,
        gain: 0.940000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.690000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0125': {
    id: 'KERNEL-0125',
    version: '1.0.125',
    entropyBand: [0.137778, 0.138889],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.860000,
        bias: -0.015000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.098000,
        gain: 1.000000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.720000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0126': {
    id: 'KERNEL-0126',
    version: '1.0.126',
    entropyBand: [0.138889, 0.140000],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.895000,
        bias: 0.000000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.106000,
        gain: 1.060000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.750000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0127': {
    id: 'KERNEL-0127',
    version: '1.0.127',
    entropyBand: [0.140000, 0.141111],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.930000,
        bias: 0.015000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.114000,
        gain: 1.120000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.780000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0128': {
    id: 'KERNEL-0128',
    version: '1.0.128',
    entropyBand: [0.141111, 0.142222],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.965000,
        bias: 0.030000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.122000,
        gain: 1.180000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.810000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0129': {
    id: 'KERNEL-0129',
    version: '1.0.129',
    entropyBand: [0.142222, 0.143333],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.000000,
        bias: 0.045000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.130000,
        gain: 1.240000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.840000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0130': {
    id: 'KERNEL-0130',
    version: '1.0.130',
    entropyBand: [0.143333, 0.144444],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.035000,
        bias: 0.060000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.138000,
        gain: 1.300000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.870000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0131': {
    id: 'KERNEL-0131',
    version: '1.0.131',
    entropyBand: [0.144444, 0.145556],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.070000,
        bias: 0.075000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.146000,
        gain: 1.360000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.900000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0132': {
    id: 'KERNEL-0132',
    version: '1.0.132',
    entropyBand: [0.145556, 0.146667],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.105000,
        bias: -0.075000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.154000,
        gain: 1.420000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.930000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0133': {
    id: 'KERNEL-0133',
    version: '1.0.133',
    entropyBand: [0.146667, 0.147778],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.140000,
        bias: -0.060000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.010000,
        gain: 1.480000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.960000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0134': {
    id: 'KERNEL-0134',
    version: '1.0.134',
    entropyBand: [0.147778, 0.148889],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.175000,
        bias: -0.045000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.018000,
        gain: 1.540000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.990000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0135': {
    id: 'KERNEL-0135',
    version: '1.0.135',
    entropyBand: [0.148889, 0.150000],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.210000,
        bias: -0.030000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.026000,
        gain: 1.600000,
        branches: 4,
      },
      perpendicular: {
        coupling: 1.020000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0136': {
    id: 'KERNEL-0136',
    version: '1.0.136',
    entropyBand: [0.150000, 0.151111],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.650000,
        bias: -0.015000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.034000,
        gain: 1.660000,
        branches: 5,
      },
      perpendicular: {
        coupling: 1.050000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0137': {
    id: 'KERNEL-0137',
    version: '1.0.137',
    entropyBand: [0.151111, 0.152222],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.685000,
        bias: 0.000000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.042000,
        gain: 1.720000,
        branches: 6,
      },
      perpendicular: {
        coupling: 1.080000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0138': {
    id: 'KERNEL-0138',
    version: '1.0.138',
    entropyBand: [0.152222, 0.153333],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.720000,
        bias: 0.015000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.050000,
        gain: 0.400000,
        branches: 7,
      },
      perpendicular: {
        coupling: 1.110000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0139': {
    id: 'KERNEL-0139',
    version: '1.0.139',
    entropyBand: [0.153333, 0.154444],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.755000,
        bias: 0.030000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.058000,
        gain: 0.460000,
        branches: 8,
      },
      perpendicular: {
        coupling: 1.140000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0140': {
    id: 'KERNEL-0140',
    version: '1.0.140',
    entropyBand: [0.154444, 0.155556],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.790000,
        bias: 0.045000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.066000,
        gain: 0.520000,
        branches: 2,
      },
      perpendicular: {
        coupling: 1.170000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0141': {
    id: 'KERNEL-0141',
    version: '1.0.141',
    entropyBand: [0.155556, 0.156667],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.825000,
        bias: 0.060000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.074000,
        gain: 0.580000,
        branches: 3,
      },
      perpendicular: {
        coupling: 1.200000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0142': {
    id: 'KERNEL-0142',
    version: '1.0.142',
    entropyBand: [0.156667, 0.157778],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.860000,
        bias: 0.075000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.082000,
        gain: 0.640000,
        branches: 4,
      },
      perpendicular: {
        coupling: 1.230000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0143': {
    id: 'KERNEL-0143',
    version: '1.0.143',
    entropyBand: [0.157778, 0.158889],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.895000,
        bias: -0.075000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.090000,
        gain: 0.700000,
        branches: 5,
      },
      perpendicular: {
        coupling: 1.260000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0144': {
    id: 'KERNEL-0144',
    version: '1.0.144',
    entropyBand: [0.158889, 0.160000],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.930000,
        bias: -0.060000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.098000,
        gain: 0.760000,
        branches: 6,
      },
      perpendicular: {
        coupling: 1.290000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0145': {
    id: 'KERNEL-0145',
    version: '1.0.145',
    entropyBand: [0.160000, 0.161111],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.965000,
        bias: -0.045000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.106000,
        gain: 0.820000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.450000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0146': {
    id: 'KERNEL-0146',
    version: '1.0.146',
    entropyBand: [0.161111, 0.162222],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.000000,
        bias: -0.030000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.114000,
        gain: 0.880000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.480000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0147': {
    id: 'KERNEL-0147',
    version: '1.0.147',
    entropyBand: [0.162222, 0.163333],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.035000,
        bias: -0.015000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.122000,
        gain: 0.940000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.510000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0148': {
    id: 'KERNEL-0148',
    version: '1.0.148',
    entropyBand: [0.163333, 0.164444],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.070000,
        bias: 0.000000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.130000,
        gain: 1.000000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.540000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0149': {
    id: 'KERNEL-0149',
    version: '1.0.149',
    entropyBand: [0.164444, 0.165556],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.105000,
        bias: 0.015000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.138000,
        gain: 1.060000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.570000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0150': {
    id: 'KERNEL-0150',
    version: '1.0.150',
    entropyBand: [0.165556, 0.166667],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.140000,
        bias: 0.030000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.146000,
        gain: 1.120000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.600000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0151': {
    id: 'KERNEL-0151',
    version: '1.0.151',
    entropyBand: [0.166667, 0.167778],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.175000,
        bias: 0.045000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.154000,
        gain: 1.180000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.630000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0152': {
    id: 'KERNEL-0152',
    version: '1.0.152',
    entropyBand: [0.167778, 0.168889],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.210000,
        bias: 0.060000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.010000,
        gain: 1.240000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.660000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0153': {
    id: 'KERNEL-0153',
    version: '1.0.153',
    entropyBand: [0.168889, 0.170000],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.650000,
        bias: 0.075000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.018000,
        gain: 1.300000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.690000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0154': {
    id: 'KERNEL-0154',
    version: '1.0.154',
    entropyBand: [0.170000, 0.171111],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.685000,
        bias: -0.075000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.026000,
        gain: 1.360000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.720000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0155': {
    id: 'KERNEL-0155',
    version: '1.0.155',
    entropyBand: [0.171111, 0.172222],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.720000,
        bias: -0.060000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.034000,
        gain: 1.420000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.750000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0156': {
    id: 'KERNEL-0156',
    version: '1.0.156',
    entropyBand: [0.172222, 0.173333],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.755000,
        bias: -0.045000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.042000,
        gain: 1.480000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.780000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0157': {
    id: 'KERNEL-0157',
    version: '1.0.157',
    entropyBand: [0.173333, 0.174444],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.790000,
        bias: -0.030000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.050000,
        gain: 1.540000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.810000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0158': {
    id: 'KERNEL-0158',
    version: '1.0.158',
    entropyBand: [0.174444, 0.175556],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.825000,
        bias: -0.015000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.058000,
        gain: 1.600000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.840000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0159': {
    id: 'KERNEL-0159',
    version: '1.0.159',
    entropyBand: [0.175556, 0.176667],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.860000,
        bias: 0.000000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.066000,
        gain: 1.660000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.870000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0160': {
    id: 'KERNEL-0160',
    version: '1.0.160',
    entropyBand: [0.176667, 0.177778],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.895000,
        bias: 0.015000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.074000,
        gain: 1.720000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.900000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0161': {
    id: 'KERNEL-0161',
    version: '1.0.161',
    entropyBand: [0.177778, 0.178889],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.930000,
        bias: 0.030000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.082000,
        gain: 0.400000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.930000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0162': {
    id: 'KERNEL-0162',
    version: '1.0.162',
    entropyBand: [0.178889, 0.180000],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.965000,
        bias: 0.045000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.090000,
        gain: 0.460000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.960000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0163': {
    id: 'KERNEL-0163',
    version: '1.0.163',
    entropyBand: [0.180000, 0.181111],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.000000,
        bias: 0.060000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.098000,
        gain: 0.520000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.990000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0164': {
    id: 'KERNEL-0164',
    version: '1.0.164',
    entropyBand: [0.181111, 0.182222],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.035000,
        bias: 0.075000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.106000,
        gain: 0.580000,
        branches: 5,
      },
      perpendicular: {
        coupling: 1.020000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0165': {
    id: 'KERNEL-0165',
    version: '1.0.165',
    entropyBand: [0.182222, 0.183333],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.070000,
        bias: -0.075000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.114000,
        gain: 0.640000,
        branches: 6,
      },
      perpendicular: {
        coupling: 1.050000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0166': {
    id: 'KERNEL-0166',
    version: '1.0.166',
    entropyBand: [0.183333, 0.184444],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.105000,
        bias: -0.060000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.122000,
        gain: 0.700000,
        branches: 7,
      },
      perpendicular: {
        coupling: 1.080000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0167': {
    id: 'KERNEL-0167',
    version: '1.0.167',
    entropyBand: [0.184444, 0.185556],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.140000,
        bias: -0.045000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.130000,
        gain: 0.760000,
        branches: 8,
      },
      perpendicular: {
        coupling: 1.110000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0168': {
    id: 'KERNEL-0168',
    version: '1.0.168',
    entropyBand: [0.185556, 0.186667],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.175000,
        bias: -0.030000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.138000,
        gain: 0.820000,
        branches: 2,
      },
      perpendicular: {
        coupling: 1.140000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0169': {
    id: 'KERNEL-0169',
    version: '1.0.169',
    entropyBand: [0.186667, 0.187778],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.210000,
        bias: -0.015000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.146000,
        gain: 0.880000,
        branches: 3,
      },
      perpendicular: {
        coupling: 1.170000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0170': {
    id: 'KERNEL-0170',
    version: '1.0.170',
    entropyBand: [0.187778, 0.188889],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.650000,
        bias: 0.000000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.154000,
        gain: 0.940000,
        branches: 4,
      },
      perpendicular: {
        coupling: 1.200000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0171': {
    id: 'KERNEL-0171',
    version: '1.0.171',
    entropyBand: [0.188889, 0.190000],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.685000,
        bias: 0.015000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.010000,
        gain: 1.000000,
        branches: 5,
      },
      perpendicular: {
        coupling: 1.230000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0172': {
    id: 'KERNEL-0172',
    version: '1.0.172',
    entropyBand: [0.190000, 0.191111],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.720000,
        bias: 0.030000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.018000,
        gain: 1.060000,
        branches: 6,
      },
      perpendicular: {
        coupling: 1.260000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0173': {
    id: 'KERNEL-0173',
    version: '1.0.173',
    entropyBand: [0.191111, 0.192222],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.755000,
        bias: 0.045000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.026000,
        gain: 1.120000,
        branches: 7,
      },
      perpendicular: {
        coupling: 1.290000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0174': {
    id: 'KERNEL-0174',
    version: '1.0.174',
    entropyBand: [0.192222, 0.193333],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.790000,
        bias: 0.060000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.034000,
        gain: 1.180000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.450000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0175': {
    id: 'KERNEL-0175',
    version: '1.0.175',
    entropyBand: [0.193333, 0.194444],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.825000,
        bias: 0.075000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.042000,
        gain: 1.240000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.480000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0176': {
    id: 'KERNEL-0176',
    version: '1.0.176',
    entropyBand: [0.194444, 0.195556],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.860000,
        bias: -0.075000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.050000,
        gain: 1.300000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.510000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0177': {
    id: 'KERNEL-0177',
    version: '1.0.177',
    entropyBand: [0.195556, 0.196667],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.895000,
        bias: -0.060000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.058000,
        gain: 1.360000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.540000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0178': {
    id: 'KERNEL-0178',
    version: '1.0.178',
    entropyBand: [0.196667, 0.197778],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.930000,
        bias: -0.045000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.066000,
        gain: 1.420000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.570000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0179': {
    id: 'KERNEL-0179',
    version: '1.0.179',
    entropyBand: [0.197778, 0.198889],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.965000,
        bias: -0.030000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.074000,
        gain: 1.480000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.600000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0180': {
    id: 'KERNEL-0180',
    version: '1.0.180',
    entropyBand: [0.198889, 0.200000],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.000000,
        bias: -0.015000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.082000,
        gain: 1.540000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.630000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0181': {
    id: 'KERNEL-0181',
    version: '1.0.181',
    entropyBand: [0.200000, 0.201111],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.035000,
        bias: 0.000000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.090000,
        gain: 1.600000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.660000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0182': {
    id: 'KERNEL-0182',
    version: '1.0.182',
    entropyBand: [0.201111, 0.202222],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.070000,
        bias: 0.015000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.098000,
        gain: 1.660000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.690000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0183': {
    id: 'KERNEL-0183',
    version: '1.0.183',
    entropyBand: [0.202222, 0.203333],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.105000,
        bias: 0.030000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.106000,
        gain: 1.720000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.720000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0184': {
    id: 'KERNEL-0184',
    version: '1.0.184',
    entropyBand: [0.203333, 0.204444],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.140000,
        bias: 0.045000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.114000,
        gain: 0.400000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.750000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0185': {
    id: 'KERNEL-0185',
    version: '1.0.185',
    entropyBand: [0.204444, 0.205556],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.175000,
        bias: 0.060000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.122000,
        gain: 0.460000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.780000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0186': {
    id: 'KERNEL-0186',
    version: '1.0.186',
    entropyBand: [0.205556, 0.206667],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.210000,
        bias: 0.075000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.130000,
        gain: 0.520000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.810000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0187': {
    id: 'KERNEL-0187',
    version: '1.0.187',
    entropyBand: [0.206667, 0.207778],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.650000,
        bias: -0.075000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.138000,
        gain: 0.580000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.840000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0188': {
    id: 'KERNEL-0188',
    version: '1.0.188',
    entropyBand: [0.207778, 0.208889],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.685000,
        bias: -0.060000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.146000,
        gain: 0.640000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.870000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0189': {
    id: 'KERNEL-0189',
    version: '1.0.189',
    entropyBand: [0.208889, 0.210000],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.720000,
        bias: -0.045000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.154000,
        gain: 0.700000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.900000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0190': {
    id: 'KERNEL-0190',
    version: '1.0.190',
    entropyBand: [0.210000, 0.211111],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.755000,
        bias: -0.030000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.010000,
        gain: 0.760000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.930000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0191': {
    id: 'KERNEL-0191',
    version: '1.0.191',
    entropyBand: [0.211111, 0.212222],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.790000,
        bias: -0.015000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.018000,
        gain: 0.820000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.960000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0192': {
    id: 'KERNEL-0192',
    version: '1.0.192',
    entropyBand: [0.212222, 0.213333],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.825000,
        bias: 0.000000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.026000,
        gain: 0.880000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.990000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0193': {
    id: 'KERNEL-0193',
    version: '1.0.193',
    entropyBand: [0.213333, 0.214444],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.860000,
        bias: 0.015000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.034000,
        gain: 0.940000,
        branches: 6,
      },
      perpendicular: {
        coupling: 1.020000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0194': {
    id: 'KERNEL-0194',
    version: '1.0.194',
    entropyBand: [0.214444, 0.215556],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.895000,
        bias: 0.030000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.042000,
        gain: 1.000000,
        branches: 7,
      },
      perpendicular: {
        coupling: 1.050000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0195': {
    id: 'KERNEL-0195',
    version: '1.0.195',
    entropyBand: [0.215556, 0.216667],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.930000,
        bias: 0.045000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.050000,
        gain: 1.060000,
        branches: 8,
      },
      perpendicular: {
        coupling: 1.080000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0196': {
    id: 'KERNEL-0196',
    version: '1.0.196',
    entropyBand: [0.216667, 0.217778],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.965000,
        bias: 0.060000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.058000,
        gain: 1.120000,
        branches: 2,
      },
      perpendicular: {
        coupling: 1.110000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0197': {
    id: 'KERNEL-0197',
    version: '1.0.197',
    entropyBand: [0.217778, 0.218889],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.000000,
        bias: 0.075000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.066000,
        gain: 1.180000,
        branches: 3,
      },
      perpendicular: {
        coupling: 1.140000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0198': {
    id: 'KERNEL-0198',
    version: '1.0.198',
    entropyBand: [0.218889, 0.220000],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.035000,
        bias: -0.075000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.074000,
        gain: 1.240000,
        branches: 4,
      },
      perpendicular: {
        coupling: 1.170000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0199': {
    id: 'KERNEL-0199',
    version: '1.0.199',
    entropyBand: [0.220000, 0.221111],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.070000,
        bias: -0.060000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.082000,
        gain: 1.300000,
        branches: 5,
      },
      perpendicular: {
        coupling: 1.200000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0200': {
    id: 'KERNEL-0200',
    version: '1.0.200',
    entropyBand: [0.221111, 0.222222],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.105000,
        bias: -0.045000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.090000,
        gain: 1.360000,
        branches: 6,
      },
      perpendicular: {
        coupling: 1.230000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0201': {
    id: 'KERNEL-0201',
    version: '1.0.201',
    entropyBand: [0.222222, 0.223333],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.140000,
        bias: -0.030000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.098000,
        gain: 1.420000,
        branches: 7,
      },
      perpendicular: {
        coupling: 1.260000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0202': {
    id: 'KERNEL-0202',
    version: '1.0.202',
    entropyBand: [0.223333, 0.224444],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.175000,
        bias: -0.015000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.106000,
        gain: 1.480000,
        branches: 8,
      },
      perpendicular: {
        coupling: 1.290000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0203': {
    id: 'KERNEL-0203',
    version: '1.0.203',
    entropyBand: [0.224444, 0.225556],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.210000,
        bias: 0.000000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.114000,
        gain: 1.540000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.450000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0204': {
    id: 'KERNEL-0204',
    version: '1.0.204',
    entropyBand: [0.225556, 0.226667],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.650000,
        bias: 0.015000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.122000,
        gain: 1.600000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.480000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0205': {
    id: 'KERNEL-0205',
    version: '1.0.205',
    entropyBand: [0.226667, 0.227778],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.685000,
        bias: 0.030000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.130000,
        gain: 1.660000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.510000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0206': {
    id: 'KERNEL-0206',
    version: '1.0.206',
    entropyBand: [0.227778, 0.228889],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.720000,
        bias: 0.045000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.138000,
        gain: 1.720000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.540000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0207': {
    id: 'KERNEL-0207',
    version: '1.0.207',
    entropyBand: [0.228889, 0.230000],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.755000,
        bias: 0.060000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.146000,
        gain: 0.400000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.570000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0208': {
    id: 'KERNEL-0208',
    version: '1.0.208',
    entropyBand: [0.230000, 0.231111],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.790000,
        bias: 0.075000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.154000,
        gain: 0.460000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.600000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0209': {
    id: 'KERNEL-0209',
    version: '1.0.209',
    entropyBand: [0.231111, 0.232222],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.825000,
        bias: -0.075000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.010000,
        gain: 0.520000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.630000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0210': {
    id: 'KERNEL-0210',
    version: '1.0.210',
    entropyBand: [0.232222, 0.233333],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.860000,
        bias: -0.060000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.018000,
        gain: 0.580000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.660000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0211': {
    id: 'KERNEL-0211',
    version: '1.0.211',
    entropyBand: [0.233333, 0.234444],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.895000,
        bias: -0.045000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.026000,
        gain: 0.640000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.690000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0212': {
    id: 'KERNEL-0212',
    version: '1.0.212',
    entropyBand: [0.234444, 0.235556],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.930000,
        bias: -0.030000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.034000,
        gain: 0.700000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.720000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0213': {
    id: 'KERNEL-0213',
    version: '1.0.213',
    entropyBand: [0.235556, 0.236667],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.965000,
        bias: -0.015000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.042000,
        gain: 0.760000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.750000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0214': {
    id: 'KERNEL-0214',
    version: '1.0.214',
    entropyBand: [0.236667, 0.237778],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.000000,
        bias: 0.000000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.050000,
        gain: 0.820000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.780000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0215': {
    id: 'KERNEL-0215',
    version: '1.0.215',
    entropyBand: [0.237778, 0.238889],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.035000,
        bias: 0.015000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.058000,
        gain: 0.880000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.810000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0216': {
    id: 'KERNEL-0216',
    version: '1.0.216',
    entropyBand: [0.238889, 0.240000],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.070000,
        bias: 0.030000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.066000,
        gain: 0.940000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.840000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0217': {
    id: 'KERNEL-0217',
    version: '1.0.217',
    entropyBand: [0.240000, 0.241111],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.105000,
        bias: 0.045000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.074000,
        gain: 1.000000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.870000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0218': {
    id: 'KERNEL-0218',
    version: '1.0.218',
    entropyBand: [0.241111, 0.242222],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.140000,
        bias: 0.060000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.082000,
        gain: 1.060000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.900000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0219': {
    id: 'KERNEL-0219',
    version: '1.0.219',
    entropyBand: [0.242222, 0.243333],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.175000,
        bias: 0.075000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.090000,
        gain: 1.120000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.930000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0220': {
    id: 'KERNEL-0220',
    version: '1.0.220',
    entropyBand: [0.243333, 0.244444],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.210000,
        bias: -0.075000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.098000,
        gain: 1.180000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.960000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0221': {
    id: 'KERNEL-0221',
    version: '1.0.221',
    entropyBand: [0.244444, 0.245556],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.650000,
        bias: -0.060000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.106000,
        gain: 1.240000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.990000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0222': {
    id: 'KERNEL-0222',
    version: '1.0.222',
    entropyBand: [0.245556, 0.246667],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.685000,
        bias: -0.045000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.114000,
        gain: 1.300000,
        branches: 7,
      },
      perpendicular: {
        coupling: 1.020000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0223': {
    id: 'KERNEL-0223',
    version: '1.0.223',
    entropyBand: [0.246667, 0.247778],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.720000,
        bias: -0.030000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.122000,
        gain: 1.360000,
        branches: 8,
      },
      perpendicular: {
        coupling: 1.050000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0224': {
    id: 'KERNEL-0224',
    version: '1.0.224',
    entropyBand: [0.247778, 0.248889],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.755000,
        bias: -0.015000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.130000,
        gain: 1.420000,
        branches: 2,
      },
      perpendicular: {
        coupling: 1.080000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0225': {
    id: 'KERNEL-0225',
    version: '1.0.225',
    entropyBand: [0.248889, 0.250000],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.790000,
        bias: 0.000000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.138000,
        gain: 1.480000,
        branches: 3,
      },
      perpendicular: {
        coupling: 1.110000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0226': {
    id: 'KERNEL-0226',
    version: '1.0.226',
    entropyBand: [0.250000, 0.251111],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.825000,
        bias: 0.015000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.146000,
        gain: 1.540000,
        branches: 4,
      },
      perpendicular: {
        coupling: 1.140000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0227': {
    id: 'KERNEL-0227',
    version: '1.0.227',
    entropyBand: [0.251111, 0.252222],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.860000,
        bias: 0.030000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.154000,
        gain: 1.600000,
        branches: 5,
      },
      perpendicular: {
        coupling: 1.170000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0228': {
    id: 'KERNEL-0228',
    version: '1.0.228',
    entropyBand: [0.252222, 0.253333],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.895000,
        bias: 0.045000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.010000,
        gain: 1.660000,
        branches: 6,
      },
      perpendicular: {
        coupling: 1.200000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0229': {
    id: 'KERNEL-0229',
    version: '1.0.229',
    entropyBand: [0.253333, 0.254444],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.930000,
        bias: 0.060000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.018000,
        gain: 1.720000,
        branches: 7,
      },
      perpendicular: {
        coupling: 1.230000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0230': {
    id: 'KERNEL-0230',
    version: '1.0.230',
    entropyBand: [0.254444, 0.255556],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.965000,
        bias: 0.075000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.026000,
        gain: 0.400000,
        branches: 8,
      },
      perpendicular: {
        coupling: 1.260000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0231': {
    id: 'KERNEL-0231',
    version: '1.0.231',
    entropyBand: [0.255556, 0.256667],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.000000,
        bias: -0.075000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.034000,
        gain: 0.460000,
        branches: 2,
      },
      perpendicular: {
        coupling: 1.290000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0232': {
    id: 'KERNEL-0232',
    version: '1.0.232',
    entropyBand: [0.256667, 0.257778],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.035000,
        bias: -0.060000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.042000,
        gain: 0.520000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.450000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0233': {
    id: 'KERNEL-0233',
    version: '1.0.233',
    entropyBand: [0.257778, 0.258889],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.070000,
        bias: -0.045000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.050000,
        gain: 0.580000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.480000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0234': {
    id: 'KERNEL-0234',
    version: '1.0.234',
    entropyBand: [0.258889, 0.260000],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.105000,
        bias: -0.030000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.058000,
        gain: 0.640000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.510000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0235': {
    id: 'KERNEL-0235',
    version: '1.0.235',
    entropyBand: [0.260000, 0.261111],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.140000,
        bias: -0.015000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.066000,
        gain: 0.700000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.540000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0236': {
    id: 'KERNEL-0236',
    version: '1.0.236',
    entropyBand: [0.261111, 0.262222],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.175000,
        bias: 0.000000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.074000,
        gain: 0.760000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.570000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0237': {
    id: 'KERNEL-0237',
    version: '1.0.237',
    entropyBand: [0.262222, 0.263333],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.210000,
        bias: 0.015000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.082000,
        gain: 0.820000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.600000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0238': {
    id: 'KERNEL-0238',
    version: '1.0.238',
    entropyBand: [0.263333, 0.264444],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.650000,
        bias: 0.030000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.090000,
        gain: 0.880000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.630000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0239': {
    id: 'KERNEL-0239',
    version: '1.0.239',
    entropyBand: [0.264444, 0.265556],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.685000,
        bias: 0.045000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.098000,
        gain: 0.940000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.660000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0240': {
    id: 'KERNEL-0240',
    version: '1.0.240',
    entropyBand: [0.265556, 0.266667],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.720000,
        bias: 0.060000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.106000,
        gain: 1.000000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.690000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0241': {
    id: 'KERNEL-0241',
    version: '1.0.241',
    entropyBand: [0.266667, 0.267778],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.755000,
        bias: 0.075000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.114000,
        gain: 1.060000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.720000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0242': {
    id: 'KERNEL-0242',
    version: '1.0.242',
    entropyBand: [0.267778, 0.268889],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.790000,
        bias: -0.075000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.122000,
        gain: 1.120000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.750000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0243': {
    id: 'KERNEL-0243',
    version: '1.0.243',
    entropyBand: [0.268889, 0.270000],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.825000,
        bias: -0.060000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.130000,
        gain: 1.180000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.780000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0244': {
    id: 'KERNEL-0244',
    version: '1.0.244',
    entropyBand: [0.270000, 0.271111],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.860000,
        bias: -0.045000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.138000,
        gain: 1.240000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.810000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0245': {
    id: 'KERNEL-0245',
    version: '1.0.245',
    entropyBand: [0.271111, 0.272222],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.895000,
        bias: -0.030000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.146000,
        gain: 1.300000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.840000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0246': {
    id: 'KERNEL-0246',
    version: '1.0.246',
    entropyBand: [0.272222, 0.273333],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.930000,
        bias: -0.015000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.154000,
        gain: 1.360000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.870000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0247': {
    id: 'KERNEL-0247',
    version: '1.0.247',
    entropyBand: [0.273333, 0.274444],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.965000,
        bias: 0.000000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.010000,
        gain: 1.420000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.900000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0248': {
    id: 'KERNEL-0248',
    version: '1.0.248',
    entropyBand: [0.274444, 0.275556],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.000000,
        bias: 0.015000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.018000,
        gain: 1.480000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.930000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0249': {
    id: 'KERNEL-0249',
    version: '1.0.249',
    entropyBand: [0.275556, 0.276667],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.035000,
        bias: 0.030000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.026000,
        gain: 1.540000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.960000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0250': {
    id: 'KERNEL-0250',
    version: '1.0.250',
    entropyBand: [0.276667, 0.277778],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.070000,
        bias: 0.045000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.034000,
        gain: 1.600000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.990000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0251': {
    id: 'KERNEL-0251',
    version: '1.0.251',
    entropyBand: [0.277778, 0.278889],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.105000,
        bias: 0.060000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.042000,
        gain: 1.660000,
        branches: 8,
      },
      perpendicular: {
        coupling: 1.020000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0252': {
    id: 'KERNEL-0252',
    version: '1.0.252',
    entropyBand: [0.278889, 0.280000],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.140000,
        bias: 0.075000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.050000,
        gain: 1.720000,
        branches: 2,
      },
      perpendicular: {
        coupling: 1.050000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0253': {
    id: 'KERNEL-0253',
    version: '1.0.253',
    entropyBand: [0.280000, 0.281111],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.175000,
        bias: -0.075000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.058000,
        gain: 0.400000,
        branches: 3,
      },
      perpendicular: {
        coupling: 1.080000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0254': {
    id: 'KERNEL-0254',
    version: '1.0.254',
    entropyBand: [0.281111, 0.282222],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.210000,
        bias: -0.060000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.066000,
        gain: 0.460000,
        branches: 4,
      },
      perpendicular: {
        coupling: 1.110000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0255': {
    id: 'KERNEL-0255',
    version: '1.0.255',
    entropyBand: [0.282222, 0.283333],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.650000,
        bias: -0.045000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.074000,
        gain: 0.520000,
        branches: 5,
      },
      perpendicular: {
        coupling: 1.140000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0256': {
    id: 'KERNEL-0256',
    version: '1.0.256',
    entropyBand: [0.283333, 0.284444],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.685000,
        bias: -0.030000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.082000,
        gain: 0.580000,
        branches: 6,
      },
      perpendicular: {
        coupling: 1.170000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0257': {
    id: 'KERNEL-0257',
    version: '1.0.257',
    entropyBand: [0.284444, 0.285556],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.720000,
        bias: -0.015000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.090000,
        gain: 0.640000,
        branches: 7,
      },
      perpendicular: {
        coupling: 1.200000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0258': {
    id: 'KERNEL-0258',
    version: '1.0.258',
    entropyBand: [0.285556, 0.286667],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.755000,
        bias: 0.000000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.098000,
        gain: 0.700000,
        branches: 8,
      },
      perpendicular: {
        coupling: 1.230000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0259': {
    id: 'KERNEL-0259',
    version: '1.0.259',
    entropyBand: [0.286667, 0.287778],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.790000,
        bias: 0.015000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.106000,
        gain: 0.760000,
        branches: 2,
      },
      perpendicular: {
        coupling: 1.260000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0260': {
    id: 'KERNEL-0260',
    version: '1.0.260',
    entropyBand: [0.287778, 0.288889],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.825000,
        bias: 0.030000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.114000,
        gain: 0.820000,
        branches: 3,
      },
      perpendicular: {
        coupling: 1.290000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0261': {
    id: 'KERNEL-0261',
    version: '1.0.261',
    entropyBand: [0.288889, 0.290000],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.860000,
        bias: 0.045000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.122000,
        gain: 0.880000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.450000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0262': {
    id: 'KERNEL-0262',
    version: '1.0.262',
    entropyBand: [0.290000, 0.291111],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.895000,
        bias: 0.060000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.130000,
        gain: 0.940000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.480000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0263': {
    id: 'KERNEL-0263',
    version: '1.0.263',
    entropyBand: [0.291111, 0.292222],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.930000,
        bias: 0.075000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.138000,
        gain: 1.000000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.510000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0264': {
    id: 'KERNEL-0264',
    version: '1.0.264',
    entropyBand: [0.292222, 0.293333],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.965000,
        bias: -0.075000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.146000,
        gain: 1.060000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.540000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0265': {
    id: 'KERNEL-0265',
    version: '1.0.265',
    entropyBand: [0.293333, 0.294444],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.000000,
        bias: -0.060000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.154000,
        gain: 1.120000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.570000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0266': {
    id: 'KERNEL-0266',
    version: '1.0.266',
    entropyBand: [0.294444, 0.295556],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.035000,
        bias: -0.045000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.010000,
        gain: 1.180000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.600000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0267': {
    id: 'KERNEL-0267',
    version: '1.0.267',
    entropyBand: [0.295556, 0.296667],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.070000,
        bias: -0.030000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.018000,
        gain: 1.240000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.630000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0268': {
    id: 'KERNEL-0268',
    version: '1.0.268',
    entropyBand: [0.296667, 0.297778],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.105000,
        bias: -0.015000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.026000,
        gain: 1.300000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.660000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0269': {
    id: 'KERNEL-0269',
    version: '1.0.269',
    entropyBand: [0.297778, 0.298889],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.140000,
        bias: 0.000000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.034000,
        gain: 1.360000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.690000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0270': {
    id: 'KERNEL-0270',
    version: '1.0.270',
    entropyBand: [0.298889, 0.300000],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.175000,
        bias: 0.015000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.042000,
        gain: 1.420000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.720000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0271': {
    id: 'KERNEL-0271',
    version: '1.0.271',
    entropyBand: [0.300000, 0.301111],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.210000,
        bias: 0.030000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.050000,
        gain: 1.480000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.750000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0272': {
    id: 'KERNEL-0272',
    version: '1.0.272',
    entropyBand: [0.301111, 0.302222],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.650000,
        bias: 0.045000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.058000,
        gain: 1.540000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.780000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0273': {
    id: 'KERNEL-0273',
    version: '1.0.273',
    entropyBand: [0.302222, 0.303333],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.685000,
        bias: 0.060000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.066000,
        gain: 1.600000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.810000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0274': {
    id: 'KERNEL-0274',
    version: '1.0.274',
    entropyBand: [0.303333, 0.304444],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.720000,
        bias: 0.075000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.074000,
        gain: 1.660000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.840000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0275': {
    id: 'KERNEL-0275',
    version: '1.0.275',
    entropyBand: [0.304444, 0.305556],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.755000,
        bias: -0.075000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.082000,
        gain: 1.720000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.870000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0276': {
    id: 'KERNEL-0276',
    version: '1.0.276',
    entropyBand: [0.305556, 0.306667],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.790000,
        bias: -0.060000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.090000,
        gain: 0.400000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.900000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0277': {
    id: 'KERNEL-0277',
    version: '1.0.277',
    entropyBand: [0.306667, 0.307778],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.825000,
        bias: -0.045000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.098000,
        gain: 0.460000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.930000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0278': {
    id: 'KERNEL-0278',
    version: '1.0.278',
    entropyBand: [0.307778, 0.308889],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.860000,
        bias: -0.030000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.106000,
        gain: 0.520000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.960000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0279': {
    id: 'KERNEL-0279',
    version: '1.0.279',
    entropyBand: [0.308889, 0.310000],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.895000,
        bias: -0.015000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.114000,
        gain: 0.580000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.990000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0280': {
    id: 'KERNEL-0280',
    version: '1.0.280',
    entropyBand: [0.310000, 0.311111],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.930000,
        bias: 0.000000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.122000,
        gain: 0.640000,
        branches: 2,
      },
      perpendicular: {
        coupling: 1.020000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0281': {
    id: 'KERNEL-0281',
    version: '1.0.281',
    entropyBand: [0.311111, 0.312222],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.965000,
        bias: 0.015000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.130000,
        gain: 0.700000,
        branches: 3,
      },
      perpendicular: {
        coupling: 1.050000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0282': {
    id: 'KERNEL-0282',
    version: '1.0.282',
    entropyBand: [0.312222, 0.313333],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.000000,
        bias: 0.030000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.138000,
        gain: 0.760000,
        branches: 4,
      },
      perpendicular: {
        coupling: 1.080000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0283': {
    id: 'KERNEL-0283',
    version: '1.0.283',
    entropyBand: [0.313333, 0.314444],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.035000,
        bias: 0.045000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.146000,
        gain: 0.820000,
        branches: 5,
      },
      perpendicular: {
        coupling: 1.110000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0284': {
    id: 'KERNEL-0284',
    version: '1.0.284',
    entropyBand: [0.314444, 0.315556],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.070000,
        bias: 0.060000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.154000,
        gain: 0.880000,
        branches: 6,
      },
      perpendicular: {
        coupling: 1.140000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0285': {
    id: 'KERNEL-0285',
    version: '1.0.285',
    entropyBand: [0.315556, 0.316667],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.105000,
        bias: 0.075000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.010000,
        gain: 0.940000,
        branches: 7,
      },
      perpendicular: {
        coupling: 1.170000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0286': {
    id: 'KERNEL-0286',
    version: '1.0.286',
    entropyBand: [0.316667, 0.317778],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.140000,
        bias: -0.075000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.018000,
        gain: 1.000000,
        branches: 8,
      },
      perpendicular: {
        coupling: 1.200000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0287': {
    id: 'KERNEL-0287',
    version: '1.0.287',
    entropyBand: [0.317778, 0.318889],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.175000,
        bias: -0.060000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.026000,
        gain: 1.060000,
        branches: 2,
      },
      perpendicular: {
        coupling: 1.230000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0288': {
    id: 'KERNEL-0288',
    version: '1.0.288',
    entropyBand: [0.318889, 0.320000],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.210000,
        bias: -0.045000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.034000,
        gain: 1.120000,
        branches: 3,
      },
      perpendicular: {
        coupling: 1.260000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0289': {
    id: 'KERNEL-0289',
    version: '1.0.289',
    entropyBand: [0.320000, 0.321111],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.650000,
        bias: -0.030000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.042000,
        gain: 1.180000,
        branches: 4,
      },
      perpendicular: {
        coupling: 1.290000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0290': {
    id: 'KERNEL-0290',
    version: '1.0.290',
    entropyBand: [0.321111, 0.322222],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.685000,
        bias: -0.015000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.050000,
        gain: 1.240000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.450000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0291': {
    id: 'KERNEL-0291',
    version: '1.0.291',
    entropyBand: [0.322222, 0.323333],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.720000,
        bias: 0.000000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.058000,
        gain: 1.300000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.480000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0292': {
    id: 'KERNEL-0292',
    version: '1.0.292',
    entropyBand: [0.323333, 0.324444],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.755000,
        bias: 0.015000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.066000,
        gain: 1.360000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.510000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0293': {
    id: 'KERNEL-0293',
    version: '1.0.293',
    entropyBand: [0.324444, 0.325556],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.790000,
        bias: 0.030000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.074000,
        gain: 1.420000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.540000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0294': {
    id: 'KERNEL-0294',
    version: '1.0.294',
    entropyBand: [0.325556, 0.326667],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.825000,
        bias: 0.045000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.082000,
        gain: 1.480000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.570000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0295': {
    id: 'KERNEL-0295',
    version: '1.0.295',
    entropyBand: [0.326667, 0.327778],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.860000,
        bias: 0.060000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.090000,
        gain: 1.540000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.600000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0296': {
    id: 'KERNEL-0296',
    version: '1.0.296',
    entropyBand: [0.327778, 0.328889],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.895000,
        bias: 0.075000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.098000,
        gain: 1.600000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.630000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0297': {
    id: 'KERNEL-0297',
    version: '1.0.297',
    entropyBand: [0.328889, 0.330000],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.930000,
        bias: -0.075000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.106000,
        gain: 1.660000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.660000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0298': {
    id: 'KERNEL-0298',
    version: '1.0.298',
    entropyBand: [0.330000, 0.331111],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.965000,
        bias: -0.060000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.114000,
        gain: 1.720000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.690000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0299': {
    id: 'KERNEL-0299',
    version: '1.0.299',
    entropyBand: [0.331111, 0.332222],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.000000,
        bias: -0.045000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.122000,
        gain: 0.400000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.720000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0300': {
    id: 'KERNEL-0300',
    version: '1.0.300',
    entropyBand: [0.332222, 0.333333],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.035000,
        bias: -0.030000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.130000,
        gain: 0.460000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.750000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0301': {
    id: 'KERNEL-0301',
    version: '1.0.301',
    entropyBand: [0.333333, 0.334444],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.070000,
        bias: -0.015000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.138000,
        gain: 0.520000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.780000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0302': {
    id: 'KERNEL-0302',
    version: '1.0.302',
    entropyBand: [0.334444, 0.335556],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.105000,
        bias: 0.000000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.146000,
        gain: 0.580000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.810000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0303': {
    id: 'KERNEL-0303',
    version: '1.0.303',
    entropyBand: [0.335556, 0.336667],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.140000,
        bias: 0.015000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.154000,
        gain: 0.640000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.840000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0304': {
    id: 'KERNEL-0304',
    version: '1.0.304',
    entropyBand: [0.336667, 0.337778],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.175000,
        bias: 0.030000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.010000,
        gain: 0.700000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.870000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0305': {
    id: 'KERNEL-0305',
    version: '1.0.305',
    entropyBand: [0.337778, 0.338889],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.210000,
        bias: 0.045000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.018000,
        gain: 0.760000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.900000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0306': {
    id: 'KERNEL-0306',
    version: '1.0.306',
    entropyBand: [0.338889, 0.340000],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.650000,
        bias: 0.060000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.026000,
        gain: 0.820000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.930000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0307': {
    id: 'KERNEL-0307',
    version: '1.0.307',
    entropyBand: [0.340000, 0.341111],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.685000,
        bias: 0.075000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.034000,
        gain: 0.880000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.960000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0308': {
    id: 'KERNEL-0308',
    version: '1.0.308',
    entropyBand: [0.341111, 0.342222],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.720000,
        bias: -0.075000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.042000,
        gain: 0.940000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.990000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0309': {
    id: 'KERNEL-0309',
    version: '1.0.309',
    entropyBand: [0.342222, 0.343333],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.755000,
        bias: -0.060000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.050000,
        gain: 1.000000,
        branches: 3,
      },
      perpendicular: {
        coupling: 1.020000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0310': {
    id: 'KERNEL-0310',
    version: '1.0.310',
    entropyBand: [0.343333, 0.344444],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.790000,
        bias: -0.045000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.058000,
        gain: 1.060000,
        branches: 4,
      },
      perpendicular: {
        coupling: 1.050000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0311': {
    id: 'KERNEL-0311',
    version: '1.0.311',
    entropyBand: [0.344444, 0.345556],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.825000,
        bias: -0.030000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.066000,
        gain: 1.120000,
        branches: 5,
      },
      perpendicular: {
        coupling: 1.080000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0312': {
    id: 'KERNEL-0312',
    version: '1.0.312',
    entropyBand: [0.345556, 0.346667],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.860000,
        bias: -0.015000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.074000,
        gain: 1.180000,
        branches: 6,
      },
      perpendicular: {
        coupling: 1.110000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0313': {
    id: 'KERNEL-0313',
    version: '1.0.313',
    entropyBand: [0.346667, 0.347778],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.895000,
        bias: 0.000000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.082000,
        gain: 1.240000,
        branches: 7,
      },
      perpendicular: {
        coupling: 1.140000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0314': {
    id: 'KERNEL-0314',
    version: '1.0.314',
    entropyBand: [0.347778, 0.348889],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.930000,
        bias: 0.015000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.090000,
        gain: 1.300000,
        branches: 8,
      },
      perpendicular: {
        coupling: 1.170000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0315': {
    id: 'KERNEL-0315',
    version: '1.0.315',
    entropyBand: [0.348889, 0.350000],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.965000,
        bias: 0.030000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.098000,
        gain: 1.360000,
        branches: 2,
      },
      perpendicular: {
        coupling: 1.200000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0316': {
    id: 'KERNEL-0316',
    version: '1.0.316',
    entropyBand: [0.350000, 0.351111],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.000000,
        bias: 0.045000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.106000,
        gain: 1.420000,
        branches: 3,
      },
      perpendicular: {
        coupling: 1.230000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0317': {
    id: 'KERNEL-0317',
    version: '1.0.317',
    entropyBand: [0.351111, 0.352222],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.035000,
        bias: 0.060000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.114000,
        gain: 1.480000,
        branches: 4,
      },
      perpendicular: {
        coupling: 1.260000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0318': {
    id: 'KERNEL-0318',
    version: '1.0.318',
    entropyBand: [0.352222, 0.353333],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.070000,
        bias: 0.075000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.122000,
        gain: 1.540000,
        branches: 5,
      },
      perpendicular: {
        coupling: 1.290000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0319': {
    id: 'KERNEL-0319',
    version: '1.0.319',
    entropyBand: [0.353333, 0.354444],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.105000,
        bias: -0.075000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.130000,
        gain: 1.600000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.450000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0320': {
    id: 'KERNEL-0320',
    version: '1.0.320',
    entropyBand: [0.354444, 0.355556],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.140000,
        bias: -0.060000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.138000,
        gain: 1.660000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.480000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0321': {
    id: 'KERNEL-0321',
    version: '1.0.321',
    entropyBand: [0.355556, 0.356667],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.175000,
        bias: -0.045000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.146000,
        gain: 1.720000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.510000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0322': {
    id: 'KERNEL-0322',
    version: '1.0.322',
    entropyBand: [0.356667, 0.357778],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.210000,
        bias: -0.030000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.154000,
        gain: 0.400000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.540000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0323': {
    id: 'KERNEL-0323',
    version: '1.0.323',
    entropyBand: [0.357778, 0.358889],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.650000,
        bias: -0.015000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.010000,
        gain: 0.460000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.570000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0324': {
    id: 'KERNEL-0324',
    version: '1.0.324',
    entropyBand: [0.358889, 0.360000],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.685000,
        bias: 0.000000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.018000,
        gain: 0.520000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.600000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0325': {
    id: 'KERNEL-0325',
    version: '1.0.325',
    entropyBand: [0.360000, 0.361111],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.720000,
        bias: 0.015000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.026000,
        gain: 0.580000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.630000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0326': {
    id: 'KERNEL-0326',
    version: '1.0.326',
    entropyBand: [0.361111, 0.362222],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.755000,
        bias: 0.030000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.034000,
        gain: 0.640000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.660000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0327': {
    id: 'KERNEL-0327',
    version: '1.0.327',
    entropyBand: [0.362222, 0.363333],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.790000,
        bias: 0.045000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.042000,
        gain: 0.700000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.690000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0328': {
    id: 'KERNEL-0328',
    version: '1.0.328',
    entropyBand: [0.363333, 0.364444],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.825000,
        bias: 0.060000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.050000,
        gain: 0.760000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.720000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0329': {
    id: 'KERNEL-0329',
    version: '1.0.329',
    entropyBand: [0.364444, 0.365556],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.860000,
        bias: 0.075000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.058000,
        gain: 0.820000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.750000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0330': {
    id: 'KERNEL-0330',
    version: '1.0.330',
    entropyBand: [0.365556, 0.366667],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.895000,
        bias: -0.075000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.066000,
        gain: 0.880000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.780000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0331': {
    id: 'KERNEL-0331',
    version: '1.0.331',
    entropyBand: [0.366667, 0.367778],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.930000,
        bias: -0.060000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.074000,
        gain: 0.940000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.810000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0332': {
    id: 'KERNEL-0332',
    version: '1.0.332',
    entropyBand: [0.367778, 0.368889],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.965000,
        bias: -0.045000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.082000,
        gain: 1.000000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.840000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0333': {
    id: 'KERNEL-0333',
    version: '1.0.333',
    entropyBand: [0.368889, 0.370000],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.000000,
        bias: -0.030000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.090000,
        gain: 1.060000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.870000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0334': {
    id: 'KERNEL-0334',
    version: '1.0.334',
    entropyBand: [0.370000, 0.371111],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.035000,
        bias: -0.015000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.098000,
        gain: 1.120000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.900000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0335': {
    id: 'KERNEL-0335',
    version: '1.0.335',
    entropyBand: [0.371111, 0.372222],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.070000,
        bias: 0.000000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.106000,
        gain: 1.180000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.930000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0336': {
    id: 'KERNEL-0336',
    version: '1.0.336',
    entropyBand: [0.372222, 0.373333],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.105000,
        bias: 0.015000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.114000,
        gain: 1.240000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.960000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0337': {
    id: 'KERNEL-0337',
    version: '1.0.337',
    entropyBand: [0.373333, 0.374444],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.140000,
        bias: 0.030000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.122000,
        gain: 1.300000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.990000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0338': {
    id: 'KERNEL-0338',
    version: '1.0.338',
    entropyBand: [0.374444, 0.375556],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.175000,
        bias: 0.045000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.130000,
        gain: 1.360000,
        branches: 4,
      },
      perpendicular: {
        coupling: 1.020000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0339': {
    id: 'KERNEL-0339',
    version: '1.0.339',
    entropyBand: [0.375556, 0.376667],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.210000,
        bias: 0.060000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.138000,
        gain: 1.420000,
        branches: 5,
      },
      perpendicular: {
        coupling: 1.050000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0340': {
    id: 'KERNEL-0340',
    version: '1.0.340',
    entropyBand: [0.376667, 0.377778],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.650000,
        bias: 0.075000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.146000,
        gain: 1.480000,
        branches: 6,
      },
      perpendicular: {
        coupling: 1.080000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0341': {
    id: 'KERNEL-0341',
    version: '1.0.341',
    entropyBand: [0.377778, 0.378889],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.685000,
        bias: -0.075000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.154000,
        gain: 1.540000,
        branches: 7,
      },
      perpendicular: {
        coupling: 1.110000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0342': {
    id: 'KERNEL-0342',
    version: '1.0.342',
    entropyBand: [0.378889, 0.380000],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.720000,
        bias: -0.060000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.010000,
        gain: 1.600000,
        branches: 8,
      },
      perpendicular: {
        coupling: 1.140000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0343': {
    id: 'KERNEL-0343',
    version: '1.0.343',
    entropyBand: [0.380000, 0.381111],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.755000,
        bias: -0.045000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.018000,
        gain: 1.660000,
        branches: 2,
      },
      perpendicular: {
        coupling: 1.170000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0344': {
    id: 'KERNEL-0344',
    version: '1.0.344',
    entropyBand: [0.381111, 0.382222],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.790000,
        bias: -0.030000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.026000,
        gain: 1.720000,
        branches: 3,
      },
      perpendicular: {
        coupling: 1.200000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0345': {
    id: 'KERNEL-0345',
    version: '1.0.345',
    entropyBand: [0.382222, 0.383333],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.825000,
        bias: -0.015000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.034000,
        gain: 0.400000,
        branches: 4,
      },
      perpendicular: {
        coupling: 1.230000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0346': {
    id: 'KERNEL-0346',
    version: '1.0.346',
    entropyBand: [0.383333, 0.384444],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.860000,
        bias: 0.000000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.042000,
        gain: 0.460000,
        branches: 5,
      },
      perpendicular: {
        coupling: 1.260000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0347': {
    id: 'KERNEL-0347',
    version: '1.0.347',
    entropyBand: [0.384444, 0.385556],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.895000,
        bias: 0.015000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.050000,
        gain: 0.520000,
        branches: 6,
      },
      perpendicular: {
        coupling: 1.290000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0348': {
    id: 'KERNEL-0348',
    version: '1.0.348',
    entropyBand: [0.385556, 0.386667],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.930000,
        bias: 0.030000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.058000,
        gain: 0.580000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.450000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0349': {
    id: 'KERNEL-0349',
    version: '1.0.349',
    entropyBand: [0.386667, 0.387778],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.965000,
        bias: 0.045000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.066000,
        gain: 0.640000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.480000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0350': {
    id: 'KERNEL-0350',
    version: '1.0.350',
    entropyBand: [0.387778, 0.388889],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.000000,
        bias: 0.060000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.074000,
        gain: 0.700000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.510000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0351': {
    id: 'KERNEL-0351',
    version: '1.0.351',
    entropyBand: [0.388889, 0.390000],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.035000,
        bias: 0.075000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.082000,
        gain: 0.760000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.540000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0352': {
    id: 'KERNEL-0352',
    version: '1.0.352',
    entropyBand: [0.390000, 0.391111],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.070000,
        bias: -0.075000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.090000,
        gain: 0.820000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.570000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0353': {
    id: 'KERNEL-0353',
    version: '1.0.353',
    entropyBand: [0.391111, 0.392222],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.105000,
        bias: -0.060000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.098000,
        gain: 0.880000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.600000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0354': {
    id: 'KERNEL-0354',
    version: '1.0.354',
    entropyBand: [0.392222, 0.393333],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.140000,
        bias: -0.045000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.106000,
        gain: 0.940000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.630000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0355': {
    id: 'KERNEL-0355',
    version: '1.0.355',
    entropyBand: [0.393333, 0.394444],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.175000,
        bias: -0.030000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.114000,
        gain: 1.000000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.660000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0356': {
    id: 'KERNEL-0356',
    version: '1.0.356',
    entropyBand: [0.394444, 0.395556],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.210000,
        bias: -0.015000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.122000,
        gain: 1.060000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.690000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0357': {
    id: 'KERNEL-0357',
    version: '1.0.357',
    entropyBand: [0.395556, 0.396667],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.650000,
        bias: 0.000000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.130000,
        gain: 1.120000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.720000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0358': {
    id: 'KERNEL-0358',
    version: '1.0.358',
    entropyBand: [0.396667, 0.397778],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.685000,
        bias: 0.015000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.138000,
        gain: 1.180000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.750000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0359': {
    id: 'KERNEL-0359',
    version: '1.0.359',
    entropyBand: [0.397778, 0.398889],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.720000,
        bias: 0.030000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.146000,
        gain: 1.240000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.780000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0360': {
    id: 'KERNEL-0360',
    version: '1.0.360',
    entropyBand: [0.398889, 0.400000],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.755000,
        bias: 0.045000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.154000,
        gain: 1.300000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.810000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0361': {
    id: 'KERNEL-0361',
    version: '1.0.361',
    entropyBand: [0.400000, 0.401111],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.790000,
        bias: 0.060000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.010000,
        gain: 1.360000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.840000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0362': {
    id: 'KERNEL-0362',
    version: '1.0.362',
    entropyBand: [0.401111, 0.402222],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.825000,
        bias: 0.075000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.018000,
        gain: 1.420000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.870000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0363': {
    id: 'KERNEL-0363',
    version: '1.0.363',
    entropyBand: [0.402222, 0.403333],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.860000,
        bias: -0.075000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.026000,
        gain: 1.480000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.900000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0364': {
    id: 'KERNEL-0364',
    version: '1.0.364',
    entropyBand: [0.403333, 0.404444],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.895000,
        bias: -0.060000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.034000,
        gain: 1.540000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.930000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0365': {
    id: 'KERNEL-0365',
    version: '1.0.365',
    entropyBand: [0.404444, 0.405556],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.930000,
        bias: -0.045000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.042000,
        gain: 1.600000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.960000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0366': {
    id: 'KERNEL-0366',
    version: '1.0.366',
    entropyBand: [0.405556, 0.406667],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.965000,
        bias: -0.030000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.050000,
        gain: 1.660000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.990000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0367': {
    id: 'KERNEL-0367',
    version: '1.0.367',
    entropyBand: [0.406667, 0.407778],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.000000,
        bias: -0.015000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.058000,
        gain: 1.720000,
        branches: 5,
      },
      perpendicular: {
        coupling: 1.020000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0368': {
    id: 'KERNEL-0368',
    version: '1.0.368',
    entropyBand: [0.407778, 0.408889],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.035000,
        bias: 0.000000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.066000,
        gain: 0.400000,
        branches: 6,
      },
      perpendicular: {
        coupling: 1.050000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0369': {
    id: 'KERNEL-0369',
    version: '1.0.369',
    entropyBand: [0.408889, 0.410000],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.070000,
        bias: 0.015000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.074000,
        gain: 0.460000,
        branches: 7,
      },
      perpendicular: {
        coupling: 1.080000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0370': {
    id: 'KERNEL-0370',
    version: '1.0.370',
    entropyBand: [0.410000, 0.411111],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.105000,
        bias: 0.030000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.082000,
        gain: 0.520000,
        branches: 8,
      },
      perpendicular: {
        coupling: 1.110000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0371': {
    id: 'KERNEL-0371',
    version: '1.0.371',
    entropyBand: [0.411111, 0.412222],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.140000,
        bias: 0.045000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.090000,
        gain: 0.580000,
        branches: 2,
      },
      perpendicular: {
        coupling: 1.140000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0372': {
    id: 'KERNEL-0372',
    version: '1.0.372',
    entropyBand: [0.412222, 0.413333],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.175000,
        bias: 0.060000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.098000,
        gain: 0.640000,
        branches: 3,
      },
      perpendicular: {
        coupling: 1.170000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0373': {
    id: 'KERNEL-0373',
    version: '1.0.373',
    entropyBand: [0.413333, 0.414444],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.210000,
        bias: 0.075000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.106000,
        gain: 0.700000,
        branches: 4,
      },
      perpendicular: {
        coupling: 1.200000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0374': {
    id: 'KERNEL-0374',
    version: '1.0.374',
    entropyBand: [0.414444, 0.415556],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.650000,
        bias: -0.075000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.114000,
        gain: 0.760000,
        branches: 5,
      },
      perpendicular: {
        coupling: 1.230000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0375': {
    id: 'KERNEL-0375',
    version: '1.0.375',
    entropyBand: [0.415556, 0.416667],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.685000,
        bias: -0.060000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.122000,
        gain: 0.820000,
        branches: 6,
      },
      perpendicular: {
        coupling: 1.260000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0376': {
    id: 'KERNEL-0376',
    version: '1.0.376',
    entropyBand: [0.416667, 0.417778],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.720000,
        bias: -0.045000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.130000,
        gain: 0.880000,
        branches: 7,
      },
      perpendicular: {
        coupling: 1.290000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0377': {
    id: 'KERNEL-0377',
    version: '1.0.377',
    entropyBand: [0.417778, 0.418889],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.755000,
        bias: -0.030000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.138000,
        gain: 0.940000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.450000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0378': {
    id: 'KERNEL-0378',
    version: '1.0.378',
    entropyBand: [0.418889, 0.420000],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.790000,
        bias: -0.015000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.146000,
        gain: 1.000000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.480000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0379': {
    id: 'KERNEL-0379',
    version: '1.0.379',
    entropyBand: [0.420000, 0.421111],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.825000,
        bias: 0.000000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.154000,
        gain: 1.060000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.510000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0380': {
    id: 'KERNEL-0380',
    version: '1.0.380',
    entropyBand: [0.421111, 0.422222],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.860000,
        bias: 0.015000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.010000,
        gain: 1.120000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.540000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0381': {
    id: 'KERNEL-0381',
    version: '1.0.381',
    entropyBand: [0.422222, 0.423333],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.895000,
        bias: 0.030000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.018000,
        gain: 1.180000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.570000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0382': {
    id: 'KERNEL-0382',
    version: '1.0.382',
    entropyBand: [0.423333, 0.424444],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.930000,
        bias: 0.045000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.026000,
        gain: 1.240000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.600000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0383': {
    id: 'KERNEL-0383',
    version: '1.0.383',
    entropyBand: [0.424444, 0.425556],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.965000,
        bias: 0.060000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.034000,
        gain: 1.300000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.630000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0384': {
    id: 'KERNEL-0384',
    version: '1.0.384',
    entropyBand: [0.425556, 0.426667],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.000000,
        bias: 0.075000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.042000,
        gain: 1.360000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.660000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0385': {
    id: 'KERNEL-0385',
    version: '1.0.385',
    entropyBand: [0.426667, 0.427778],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.035000,
        bias: -0.075000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.050000,
        gain: 1.420000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.690000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0386': {
    id: 'KERNEL-0386',
    version: '1.0.386',
    entropyBand: [0.427778, 0.428889],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.070000,
        bias: -0.060000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.058000,
        gain: 1.480000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.720000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0387': {
    id: 'KERNEL-0387',
    version: '1.0.387',
    entropyBand: [0.428889, 0.430000],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.105000,
        bias: -0.045000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.066000,
        gain: 1.540000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.750000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0388': {
    id: 'KERNEL-0388',
    version: '1.0.388',
    entropyBand: [0.430000, 0.431111],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.140000,
        bias: -0.030000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.074000,
        gain: 1.600000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.780000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0389': {
    id: 'KERNEL-0389',
    version: '1.0.389',
    entropyBand: [0.431111, 0.432222],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.175000,
        bias: -0.015000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.082000,
        gain: 1.660000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.810000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0390': {
    id: 'KERNEL-0390',
    version: '1.0.390',
    entropyBand: [0.432222, 0.433333],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.210000,
        bias: 0.000000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.090000,
        gain: 1.720000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.840000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0391': {
    id: 'KERNEL-0391',
    version: '1.0.391',
    entropyBand: [0.433333, 0.434444],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.650000,
        bias: 0.015000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.098000,
        gain: 0.400000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.870000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0392': {
    id: 'KERNEL-0392',
    version: '1.0.392',
    entropyBand: [0.434444, 0.435556],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.685000,
        bias: 0.030000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.106000,
        gain: 0.460000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.900000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0393': {
    id: 'KERNEL-0393',
    version: '1.0.393',
    entropyBand: [0.435556, 0.436667],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.720000,
        bias: 0.045000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.114000,
        gain: 0.520000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.930000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0394': {
    id: 'KERNEL-0394',
    version: '1.0.394',
    entropyBand: [0.436667, 0.437778],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.755000,
        bias: 0.060000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.122000,
        gain: 0.580000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.960000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0395': {
    id: 'KERNEL-0395',
    version: '1.0.395',
    entropyBand: [0.437778, 0.438889],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.790000,
        bias: 0.075000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.130000,
        gain: 0.640000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.990000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0396': {
    id: 'KERNEL-0396',
    version: '1.0.396',
    entropyBand: [0.438889, 0.440000],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.825000,
        bias: -0.075000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.138000,
        gain: 0.700000,
        branches: 6,
      },
      perpendicular: {
        coupling: 1.020000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0397': {
    id: 'KERNEL-0397',
    version: '1.0.397',
    entropyBand: [0.440000, 0.441111],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.860000,
        bias: -0.060000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.146000,
        gain: 0.760000,
        branches: 7,
      },
      perpendicular: {
        coupling: 1.050000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0398': {
    id: 'KERNEL-0398',
    version: '1.0.398',
    entropyBand: [0.441111, 0.442222],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.895000,
        bias: -0.045000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.154000,
        gain: 0.820000,
        branches: 8,
      },
      perpendicular: {
        coupling: 1.080000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0399': {
    id: 'KERNEL-0399',
    version: '1.0.399',
    entropyBand: [0.442222, 0.443333],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.930000,
        bias: -0.030000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.010000,
        gain: 0.880000,
        branches: 2,
      },
      perpendicular: {
        coupling: 1.110000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0400': {
    id: 'KERNEL-0400',
    version: '1.0.400',
    entropyBand: [0.443333, 0.444444],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.965000,
        bias: -0.015000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.018000,
        gain: 0.940000,
        branches: 3,
      },
      perpendicular: {
        coupling: 1.140000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0401': {
    id: 'KERNEL-0401',
    version: '1.0.401',
    entropyBand: [0.444444, 0.445556],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.000000,
        bias: 0.000000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.026000,
        gain: 1.000000,
        branches: 4,
      },
      perpendicular: {
        coupling: 1.170000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0402': {
    id: 'KERNEL-0402',
    version: '1.0.402',
    entropyBand: [0.445556, 0.446667],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.035000,
        bias: 0.015000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.034000,
        gain: 1.060000,
        branches: 5,
      },
      perpendicular: {
        coupling: 1.200000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0403': {
    id: 'KERNEL-0403',
    version: '1.0.403',
    entropyBand: [0.446667, 0.447778],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.070000,
        bias: 0.030000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.042000,
        gain: 1.120000,
        branches: 6,
      },
      perpendicular: {
        coupling: 1.230000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0404': {
    id: 'KERNEL-0404',
    version: '1.0.404',
    entropyBand: [0.447778, 0.448889],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.105000,
        bias: 0.045000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.050000,
        gain: 1.180000,
        branches: 7,
      },
      perpendicular: {
        coupling: 1.260000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0405': {
    id: 'KERNEL-0405',
    version: '1.0.405',
    entropyBand: [0.448889, 0.450000],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.140000,
        bias: 0.060000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.058000,
        gain: 1.240000,
        branches: 8,
      },
      perpendicular: {
        coupling: 1.290000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0406': {
    id: 'KERNEL-0406',
    version: '1.0.406',
    entropyBand: [0.450000, 0.451111],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.175000,
        bias: 0.075000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.066000,
        gain: 1.300000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.450000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0407': {
    id: 'KERNEL-0407',
    version: '1.0.407',
    entropyBand: [0.451111, 0.452222],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.210000,
        bias: -0.075000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.074000,
        gain: 1.360000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.480000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0408': {
    id: 'KERNEL-0408',
    version: '1.0.408',
    entropyBand: [0.452222, 0.453333],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.650000,
        bias: -0.060000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.082000,
        gain: 1.420000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.510000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0409': {
    id: 'KERNEL-0409',
    version: '1.0.409',
    entropyBand: [0.453333, 0.454444],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.685000,
        bias: -0.045000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.090000,
        gain: 1.480000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.540000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0410': {
    id: 'KERNEL-0410',
    version: '1.0.410',
    entropyBand: [0.454444, 0.455556],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.720000,
        bias: -0.030000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.098000,
        gain: 1.540000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.570000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0411': {
    id: 'KERNEL-0411',
    version: '1.0.411',
    entropyBand: [0.455556, 0.456667],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.755000,
        bias: -0.015000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.106000,
        gain: 1.600000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.600000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0412': {
    id: 'KERNEL-0412',
    version: '1.0.412',
    entropyBand: [0.456667, 0.457778],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.790000,
        bias: 0.000000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.114000,
        gain: 1.660000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.630000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0413': {
    id: 'KERNEL-0413',
    version: '1.0.413',
    entropyBand: [0.457778, 0.458889],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.825000,
        bias: 0.015000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.122000,
        gain: 1.720000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.660000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0414': {
    id: 'KERNEL-0414',
    version: '1.0.414',
    entropyBand: [0.458889, 0.460000],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.860000,
        bias: 0.030000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.130000,
        gain: 0.400000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.690000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0415': {
    id: 'KERNEL-0415',
    version: '1.0.415',
    entropyBand: [0.460000, 0.461111],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.895000,
        bias: 0.045000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.138000,
        gain: 0.460000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.720000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0416': {
    id: 'KERNEL-0416',
    version: '1.0.416',
    entropyBand: [0.461111, 0.462222],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.930000,
        bias: 0.060000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.146000,
        gain: 0.520000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.750000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0417': {
    id: 'KERNEL-0417',
    version: '1.0.417',
    entropyBand: [0.462222, 0.463333],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.965000,
        bias: 0.075000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.154000,
        gain: 0.580000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.780000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0418': {
    id: 'KERNEL-0418',
    version: '1.0.418',
    entropyBand: [0.463333, 0.464444],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.000000,
        bias: -0.075000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.010000,
        gain: 0.640000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.810000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0419': {
    id: 'KERNEL-0419',
    version: '1.0.419',
    entropyBand: [0.464444, 0.465556],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.035000,
        bias: -0.060000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.018000,
        gain: 0.700000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.840000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0420': {
    id: 'KERNEL-0420',
    version: '1.0.420',
    entropyBand: [0.465556, 0.466667],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.070000,
        bias: -0.045000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.026000,
        gain: 0.760000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.870000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0421': {
    id: 'KERNEL-0421',
    version: '1.0.421',
    entropyBand: [0.466667, 0.467778],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.105000,
        bias: -0.030000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.034000,
        gain: 0.820000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.900000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0422': {
    id: 'KERNEL-0422',
    version: '1.0.422',
    entropyBand: [0.467778, 0.468889],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.140000,
        bias: -0.015000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.042000,
        gain: 0.880000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.930000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0423': {
    id: 'KERNEL-0423',
    version: '1.0.423',
    entropyBand: [0.468889, 0.470000],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.175000,
        bias: 0.000000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.050000,
        gain: 0.940000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.960000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0424': {
    id: 'KERNEL-0424',
    version: '1.0.424',
    entropyBand: [0.470000, 0.471111],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.210000,
        bias: 0.015000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.058000,
        gain: 1.000000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.990000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0425': {
    id: 'KERNEL-0425',
    version: '1.0.425',
    entropyBand: [0.471111, 0.472222],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.650000,
        bias: 0.030000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.066000,
        gain: 1.060000,
        branches: 7,
      },
      perpendicular: {
        coupling: 1.020000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0426': {
    id: 'KERNEL-0426',
    version: '1.0.426',
    entropyBand: [0.472222, 0.473333],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.685000,
        bias: 0.045000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.074000,
        gain: 1.120000,
        branches: 8,
      },
      perpendicular: {
        coupling: 1.050000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0427': {
    id: 'KERNEL-0427',
    version: '1.0.427',
    entropyBand: [0.473333, 0.474444],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.720000,
        bias: 0.060000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.082000,
        gain: 1.180000,
        branches: 2,
      },
      perpendicular: {
        coupling: 1.080000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0428': {
    id: 'KERNEL-0428',
    version: '1.0.428',
    entropyBand: [0.474444, 0.475556],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.755000,
        bias: 0.075000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.090000,
        gain: 1.240000,
        branches: 3,
      },
      perpendicular: {
        coupling: 1.110000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0429': {
    id: 'KERNEL-0429',
    version: '1.0.429',
    entropyBand: [0.475556, 0.476667],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.790000,
        bias: -0.075000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.098000,
        gain: 1.300000,
        branches: 4,
      },
      perpendicular: {
        coupling: 1.140000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0430': {
    id: 'KERNEL-0430',
    version: '1.0.430',
    entropyBand: [0.476667, 0.477778],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.825000,
        bias: -0.060000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.106000,
        gain: 1.360000,
        branches: 5,
      },
      perpendicular: {
        coupling: 1.170000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0431': {
    id: 'KERNEL-0431',
    version: '1.0.431',
    entropyBand: [0.477778, 0.478889],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.860000,
        bias: -0.045000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.114000,
        gain: 1.420000,
        branches: 6,
      },
      perpendicular: {
        coupling: 1.200000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0432': {
    id: 'KERNEL-0432',
    version: '1.0.432',
    entropyBand: [0.478889, 0.480000],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.895000,
        bias: -0.030000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.122000,
        gain: 1.480000,
        branches: 7,
      },
      perpendicular: {
        coupling: 1.230000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0433': {
    id: 'KERNEL-0433',
    version: '1.0.433',
    entropyBand: [0.480000, 0.481111],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.930000,
        bias: -0.015000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.130000,
        gain: 1.540000,
        branches: 8,
      },
      perpendicular: {
        coupling: 1.260000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0434': {
    id: 'KERNEL-0434',
    version: '1.0.434',
    entropyBand: [0.481111, 0.482222],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.965000,
        bias: 0.000000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.138000,
        gain: 1.600000,
        branches: 2,
      },
      perpendicular: {
        coupling: 1.290000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0435': {
    id: 'KERNEL-0435',
    version: '1.0.435',
    entropyBand: [0.482222, 0.483333],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.000000,
        bias: 0.015000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.146000,
        gain: 1.660000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.450000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0436': {
    id: 'KERNEL-0436',
    version: '1.0.436',
    entropyBand: [0.483333, 0.484444],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.035000,
        bias: 0.030000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.154000,
        gain: 1.720000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.480000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0437': {
    id: 'KERNEL-0437',
    version: '1.0.437',
    entropyBand: [0.484444, 0.485556],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.070000,
        bias: 0.045000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.010000,
        gain: 0.400000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.510000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0438': {
    id: 'KERNEL-0438',
    version: '1.0.438',
    entropyBand: [0.485556, 0.486667],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.105000,
        bias: 0.060000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.018000,
        gain: 0.460000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.540000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0439': {
    id: 'KERNEL-0439',
    version: '1.0.439',
    entropyBand: [0.486667, 0.487778],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.140000,
        bias: 0.075000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.026000,
        gain: 0.520000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.570000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0440': {
    id: 'KERNEL-0440',
    version: '1.0.440',
    entropyBand: [0.487778, 0.488889],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.175000,
        bias: -0.075000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.034000,
        gain: 0.580000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.600000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0441': {
    id: 'KERNEL-0441',
    version: '1.0.441',
    entropyBand: [0.488889, 0.490000],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.210000,
        bias: -0.060000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.042000,
        gain: 0.640000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.630000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0442': {
    id: 'KERNEL-0442',
    version: '1.0.442',
    entropyBand: [0.490000, 0.491111],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.650000,
        bias: -0.045000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.050000,
        gain: 0.700000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.660000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0443': {
    id: 'KERNEL-0443',
    version: '1.0.443',
    entropyBand: [0.491111, 0.492222],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.685000,
        bias: -0.030000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.058000,
        gain: 0.760000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.690000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0444': {
    id: 'KERNEL-0444',
    version: '1.0.444',
    entropyBand: [0.492222, 0.493333],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.720000,
        bias: -0.015000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.066000,
        gain: 0.820000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.720000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0445': {
    id: 'KERNEL-0445',
    version: '1.0.445',
    entropyBand: [0.493333, 0.494444],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.755000,
        bias: 0.000000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.074000,
        gain: 0.880000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.750000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0446': {
    id: 'KERNEL-0446',
    version: '1.0.446',
    entropyBand: [0.494444, 0.495556],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.790000,
        bias: 0.015000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.082000,
        gain: 0.940000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.780000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0447': {
    id: 'KERNEL-0447',
    version: '1.0.447',
    entropyBand: [0.495556, 0.496667],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.825000,
        bias: 0.030000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.090000,
        gain: 1.000000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.810000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0448': {
    id: 'KERNEL-0448',
    version: '1.0.448',
    entropyBand: [0.496667, 0.497778],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.860000,
        bias: 0.045000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.098000,
        gain: 1.060000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.840000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0449': {
    id: 'KERNEL-0449',
    version: '1.0.449',
    entropyBand: [0.497778, 0.498889],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.895000,
        bias: 0.060000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.106000,
        gain: 1.120000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.870000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0450': {
    id: 'KERNEL-0450',
    version: '1.0.450',
    entropyBand: [0.498889, 0.500000],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.930000,
        bias: 0.075000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.114000,
        gain: 1.180000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.900000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0451': {
    id: 'KERNEL-0451',
    version: '1.0.451',
    entropyBand: [0.500000, 0.501111],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.965000,
        bias: -0.075000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.122000,
        gain: 1.240000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.930000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0452': {
    id: 'KERNEL-0452',
    version: '1.0.452',
    entropyBand: [0.501111, 0.502222],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.000000,
        bias: -0.060000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.130000,
        gain: 1.300000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.960000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0453': {
    id: 'KERNEL-0453',
    version: '1.0.453',
    entropyBand: [0.502222, 0.503333],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.035000,
        bias: -0.045000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.138000,
        gain: 1.360000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.990000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0454': {
    id: 'KERNEL-0454',
    version: '1.0.454',
    entropyBand: [0.503333, 0.504444],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.070000,
        bias: -0.030000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.146000,
        gain: 1.420000,
        branches: 8,
      },
      perpendicular: {
        coupling: 1.020000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0455': {
    id: 'KERNEL-0455',
    version: '1.0.455',
    entropyBand: [0.504444, 0.505556],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.105000,
        bias: -0.015000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.154000,
        gain: 1.480000,
        branches: 2,
      },
      perpendicular: {
        coupling: 1.050000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0456': {
    id: 'KERNEL-0456',
    version: '1.0.456',
    entropyBand: [0.505556, 0.506667],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.140000,
        bias: 0.000000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.010000,
        gain: 1.540000,
        branches: 3,
      },
      perpendicular: {
        coupling: 1.080000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0457': {
    id: 'KERNEL-0457',
    version: '1.0.457',
    entropyBand: [0.506667, 0.507778],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.175000,
        bias: 0.015000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.018000,
        gain: 1.600000,
        branches: 4,
      },
      perpendicular: {
        coupling: 1.110000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0458': {
    id: 'KERNEL-0458',
    version: '1.0.458',
    entropyBand: [0.507778, 0.508889],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.210000,
        bias: 0.030000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.026000,
        gain: 1.660000,
        branches: 5,
      },
      perpendicular: {
        coupling: 1.140000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0459': {
    id: 'KERNEL-0459',
    version: '1.0.459',
    entropyBand: [0.508889, 0.510000],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.650000,
        bias: 0.045000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.034000,
        gain: 1.720000,
        branches: 6,
      },
      perpendicular: {
        coupling: 1.170000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0460': {
    id: 'KERNEL-0460',
    version: '1.0.460',
    entropyBand: [0.510000, 0.511111],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.685000,
        bias: 0.060000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.042000,
        gain: 0.400000,
        branches: 7,
      },
      perpendicular: {
        coupling: 1.200000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0461': {
    id: 'KERNEL-0461',
    version: '1.0.461',
    entropyBand: [0.511111, 0.512222],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.720000,
        bias: 0.075000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.050000,
        gain: 0.460000,
        branches: 8,
      },
      perpendicular: {
        coupling: 1.230000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0462': {
    id: 'KERNEL-0462',
    version: '1.0.462',
    entropyBand: [0.512222, 0.513333],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.755000,
        bias: -0.075000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.058000,
        gain: 0.520000,
        branches: 2,
      },
      perpendicular: {
        coupling: 1.260000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0463': {
    id: 'KERNEL-0463',
    version: '1.0.463',
    entropyBand: [0.513333, 0.514444],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.790000,
        bias: -0.060000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.066000,
        gain: 0.580000,
        branches: 3,
      },
      perpendicular: {
        coupling: 1.290000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0464': {
    id: 'KERNEL-0464',
    version: '1.0.464',
    entropyBand: [0.514444, 0.515556],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.825000,
        bias: -0.045000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.074000,
        gain: 0.640000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.450000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0465': {
    id: 'KERNEL-0465',
    version: '1.0.465',
    entropyBand: [0.515556, 0.516667],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.860000,
        bias: -0.030000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.082000,
        gain: 0.700000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.480000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0466': {
    id: 'KERNEL-0466',
    version: '1.0.466',
    entropyBand: [0.516667, 0.517778],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.895000,
        bias: -0.015000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.090000,
        gain: 0.760000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.510000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0467': {
    id: 'KERNEL-0467',
    version: '1.0.467',
    entropyBand: [0.517778, 0.518889],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.930000,
        bias: 0.000000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.098000,
        gain: 0.820000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.540000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0468': {
    id: 'KERNEL-0468',
    version: '1.0.468',
    entropyBand: [0.518889, 0.520000],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.965000,
        bias: 0.015000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.106000,
        gain: 0.880000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.570000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0469': {
    id: 'KERNEL-0469',
    version: '1.0.469',
    entropyBand: [0.520000, 0.521111],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.000000,
        bias: 0.030000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.114000,
        gain: 0.940000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.600000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0470': {
    id: 'KERNEL-0470',
    version: '1.0.470',
    entropyBand: [0.521111, 0.522222],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.035000,
        bias: 0.045000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.122000,
        gain: 1.000000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.630000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0471': {
    id: 'KERNEL-0471',
    version: '1.0.471',
    entropyBand: [0.522222, 0.523333],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.070000,
        bias: 0.060000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.130000,
        gain: 1.060000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.660000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0472': {
    id: 'KERNEL-0472',
    version: '1.0.472',
    entropyBand: [0.523333, 0.524444],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.105000,
        bias: 0.075000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.138000,
        gain: 1.120000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.690000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0473': {
    id: 'KERNEL-0473',
    version: '1.0.473',
    entropyBand: [0.524444, 0.525556],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.140000,
        bias: -0.075000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.146000,
        gain: 1.180000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.720000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0474': {
    id: 'KERNEL-0474',
    version: '1.0.474',
    entropyBand: [0.525556, 0.526667],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.175000,
        bias: -0.060000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.154000,
        gain: 1.240000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.750000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0475': {
    id: 'KERNEL-0475',
    version: '1.0.475',
    entropyBand: [0.526667, 0.527778],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.210000,
        bias: -0.045000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.010000,
        gain: 1.300000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.780000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0476': {
    id: 'KERNEL-0476',
    version: '1.0.476',
    entropyBand: [0.527778, 0.528889],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.650000,
        bias: -0.030000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.018000,
        gain: 1.360000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.810000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0477': {
    id: 'KERNEL-0477',
    version: '1.0.477',
    entropyBand: [0.528889, 0.530000],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.685000,
        bias: -0.015000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.026000,
        gain: 1.420000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.840000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0478': {
    id: 'KERNEL-0478',
    version: '1.0.478',
    entropyBand: [0.530000, 0.531111],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.720000,
        bias: 0.000000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.034000,
        gain: 1.480000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.870000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0479': {
    id: 'KERNEL-0479',
    version: '1.0.479',
    entropyBand: [0.531111, 0.532222],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.755000,
        bias: 0.015000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.042000,
        gain: 1.540000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.900000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0480': {
    id: 'KERNEL-0480',
    version: '1.0.480',
    entropyBand: [0.532222, 0.533333],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.790000,
        bias: 0.030000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.050000,
        gain: 1.600000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.930000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0481': {
    id: 'KERNEL-0481',
    version: '1.0.481',
    entropyBand: [0.533333, 0.534444],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.825000,
        bias: 0.045000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.058000,
        gain: 1.660000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.960000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0482': {
    id: 'KERNEL-0482',
    version: '1.0.482',
    entropyBand: [0.534444, 0.535556],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.860000,
        bias: 0.060000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.066000,
        gain: 1.720000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.990000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0483': {
    id: 'KERNEL-0483',
    version: '1.0.483',
    entropyBand: [0.535556, 0.536667],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.895000,
        bias: 0.075000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.074000,
        gain: 0.400000,
        branches: 2,
      },
      perpendicular: {
        coupling: 1.020000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0484': {
    id: 'KERNEL-0484',
    version: '1.0.484',
    entropyBand: [0.536667, 0.537778],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.930000,
        bias: -0.075000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.082000,
        gain: 0.460000,
        branches: 3,
      },
      perpendicular: {
        coupling: 1.050000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0485': {
    id: 'KERNEL-0485',
    version: '1.0.485',
    entropyBand: [0.537778, 0.538889],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.965000,
        bias: -0.060000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.090000,
        gain: 0.520000,
        branches: 4,
      },
      perpendicular: {
        coupling: 1.080000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0486': {
    id: 'KERNEL-0486',
    version: '1.0.486',
    entropyBand: [0.538889, 0.540000],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.000000,
        bias: -0.045000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.098000,
        gain: 0.580000,
        branches: 5,
      },
      perpendicular: {
        coupling: 1.110000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0487': {
    id: 'KERNEL-0487',
    version: '1.0.487',
    entropyBand: [0.540000, 0.541111],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.035000,
        bias: -0.030000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.106000,
        gain: 0.640000,
        branches: 6,
      },
      perpendicular: {
        coupling: 1.140000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0488': {
    id: 'KERNEL-0488',
    version: '1.0.488',
    entropyBand: [0.541111, 0.542222],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.070000,
        bias: -0.015000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.114000,
        gain: 0.700000,
        branches: 7,
      },
      perpendicular: {
        coupling: 1.170000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0489': {
    id: 'KERNEL-0489',
    version: '1.0.489',
    entropyBand: [0.542222, 0.543333],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.105000,
        bias: 0.000000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.122000,
        gain: 0.760000,
        branches: 8,
      },
      perpendicular: {
        coupling: 1.200000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0490': {
    id: 'KERNEL-0490',
    version: '1.0.490',
    entropyBand: [0.543333, 0.544444],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.140000,
        bias: 0.015000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.130000,
        gain: 0.820000,
        branches: 2,
      },
      perpendicular: {
        coupling: 1.230000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0491': {
    id: 'KERNEL-0491',
    version: '1.0.491',
    entropyBand: [0.544444, 0.545556],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.175000,
        bias: 0.030000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.138000,
        gain: 0.880000,
        branches: 3,
      },
      perpendicular: {
        coupling: 1.260000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0492': {
    id: 'KERNEL-0492',
    version: '1.0.492',
    entropyBand: [0.545556, 0.546667],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.210000,
        bias: 0.045000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.146000,
        gain: 0.940000,
        branches: 4,
      },
      perpendicular: {
        coupling: 1.290000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0493': {
    id: 'KERNEL-0493',
    version: '1.0.493',
    entropyBand: [0.546667, 0.547778],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.650000,
        bias: 0.060000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.154000,
        gain: 1.000000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.450000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0494': {
    id: 'KERNEL-0494',
    version: '1.0.494',
    entropyBand: [0.547778, 0.548889],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.685000,
        bias: 0.075000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.010000,
        gain: 1.060000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.480000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0495': {
    id: 'KERNEL-0495',
    version: '1.0.495',
    entropyBand: [0.548889, 0.550000],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.720000,
        bias: -0.075000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.018000,
        gain: 1.120000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.510000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0496': {
    id: 'KERNEL-0496',
    version: '1.0.496',
    entropyBand: [0.550000, 0.551111],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.755000,
        bias: -0.060000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.026000,
        gain: 1.180000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.540000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0497': {
    id: 'KERNEL-0497',
    version: '1.0.497',
    entropyBand: [0.551111, 0.552222],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.790000,
        bias: -0.045000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.034000,
        gain: 1.240000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.570000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0498': {
    id: 'KERNEL-0498',
    version: '1.0.498',
    entropyBand: [0.552222, 0.553333],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.825000,
        bias: -0.030000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.042000,
        gain: 1.300000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.600000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0499': {
    id: 'KERNEL-0499',
    version: '1.0.499',
    entropyBand: [0.553333, 0.554444],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.860000,
        bias: -0.015000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.050000,
        gain: 1.360000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.630000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0500': {
    id: 'KERNEL-0500',
    version: '1.0.500',
    entropyBand: [0.554444, 0.555556],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.895000,
        bias: 0.000000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.058000,
        gain: 1.420000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.660000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0501': {
    id: 'KERNEL-0501',
    version: '1.0.501',
    entropyBand: [0.555556, 0.556667],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.930000,
        bias: 0.015000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.066000,
        gain: 1.480000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.690000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0502': {
    id: 'KERNEL-0502',
    version: '1.0.502',
    entropyBand: [0.556667, 0.557778],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.965000,
        bias: 0.030000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.074000,
        gain: 1.540000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.720000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0503': {
    id: 'KERNEL-0503',
    version: '1.0.503',
    entropyBand: [0.557778, 0.558889],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.000000,
        bias: 0.045000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.082000,
        gain: 1.600000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.750000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0504': {
    id: 'KERNEL-0504',
    version: '1.0.504',
    entropyBand: [0.558889, 0.560000],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.035000,
        bias: 0.060000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.090000,
        gain: 1.660000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.780000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0505': {
    id: 'KERNEL-0505',
    version: '1.0.505',
    entropyBand: [0.560000, 0.561111],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.070000,
        bias: 0.075000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.098000,
        gain: 1.720000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.810000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0506': {
    id: 'KERNEL-0506',
    version: '1.0.506',
    entropyBand: [0.561111, 0.562222],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.105000,
        bias: -0.075000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.106000,
        gain: 0.400000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.840000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0507': {
    id: 'KERNEL-0507',
    version: '1.0.507',
    entropyBand: [0.562222, 0.563333],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.140000,
        bias: -0.060000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.114000,
        gain: 0.460000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.870000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0508': {
    id: 'KERNEL-0508',
    version: '1.0.508',
    entropyBand: [0.563333, 0.564444],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.175000,
        bias: -0.045000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.122000,
        gain: 0.520000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.900000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0509': {
    id: 'KERNEL-0509',
    version: '1.0.509',
    entropyBand: [0.564444, 0.565556],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.210000,
        bias: -0.030000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.130000,
        gain: 0.580000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.930000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0510': {
    id: 'KERNEL-0510',
    version: '1.0.510',
    entropyBand: [0.565556, 0.566667],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.650000,
        bias: -0.015000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.138000,
        gain: 0.640000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.960000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0511': {
    id: 'KERNEL-0511',
    version: '1.0.511',
    entropyBand: [0.566667, 0.567778],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.685000,
        bias: 0.000000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.146000,
        gain: 0.700000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.990000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0512': {
    id: 'KERNEL-0512',
    version: '1.0.512',
    entropyBand: [0.567778, 0.568889],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.720000,
        bias: 0.015000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.154000,
        gain: 0.760000,
        branches: 3,
      },
      perpendicular: {
        coupling: 1.020000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0513': {
    id: 'KERNEL-0513',
    version: '1.0.513',
    entropyBand: [0.568889, 0.570000],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.755000,
        bias: 0.030000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.010000,
        gain: 0.820000,
        branches: 4,
      },
      perpendicular: {
        coupling: 1.050000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0514': {
    id: 'KERNEL-0514',
    version: '1.0.514',
    entropyBand: [0.570000, 0.571111],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.790000,
        bias: 0.045000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.018000,
        gain: 0.880000,
        branches: 5,
      },
      perpendicular: {
        coupling: 1.080000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0515': {
    id: 'KERNEL-0515',
    version: '1.0.515',
    entropyBand: [0.571111, 0.572222],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.825000,
        bias: 0.060000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.026000,
        gain: 0.940000,
        branches: 6,
      },
      perpendicular: {
        coupling: 1.110000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0516': {
    id: 'KERNEL-0516',
    version: '1.0.516',
    entropyBand: [0.572222, 0.573333],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.860000,
        bias: 0.075000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.034000,
        gain: 1.000000,
        branches: 7,
      },
      perpendicular: {
        coupling: 1.140000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0517': {
    id: 'KERNEL-0517',
    version: '1.0.517',
    entropyBand: [0.573333, 0.574444],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.895000,
        bias: -0.075000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.042000,
        gain: 1.060000,
        branches: 8,
      },
      perpendicular: {
        coupling: 1.170000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0518': {
    id: 'KERNEL-0518',
    version: '1.0.518',
    entropyBand: [0.574444, 0.575556],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.930000,
        bias: -0.060000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.050000,
        gain: 1.120000,
        branches: 2,
      },
      perpendicular: {
        coupling: 1.200000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0519': {
    id: 'KERNEL-0519',
    version: '1.0.519',
    entropyBand: [0.575556, 0.576667],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.965000,
        bias: -0.045000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.058000,
        gain: 1.180000,
        branches: 3,
      },
      perpendicular: {
        coupling: 1.230000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0520': {
    id: 'KERNEL-0520',
    version: '1.0.520',
    entropyBand: [0.576667, 0.577778],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.000000,
        bias: -0.030000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.066000,
        gain: 1.240000,
        branches: 4,
      },
      perpendicular: {
        coupling: 1.260000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0521': {
    id: 'KERNEL-0521',
    version: '1.0.521',
    entropyBand: [0.577778, 0.578889],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.035000,
        bias: -0.015000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.074000,
        gain: 1.300000,
        branches: 5,
      },
      perpendicular: {
        coupling: 1.290000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0522': {
    id: 'KERNEL-0522',
    version: '1.0.522',
    entropyBand: [0.578889, 0.580000],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.070000,
        bias: 0.000000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.082000,
        gain: 1.360000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.450000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0523': {
    id: 'KERNEL-0523',
    version: '1.0.523',
    entropyBand: [0.580000, 0.581111],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.105000,
        bias: 0.015000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.090000,
        gain: 1.420000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.480000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0524': {
    id: 'KERNEL-0524',
    version: '1.0.524',
    entropyBand: [0.581111, 0.582222],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.140000,
        bias: 0.030000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.098000,
        gain: 1.480000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.510000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0525': {
    id: 'KERNEL-0525',
    version: '1.0.525',
    entropyBand: [0.582222, 0.583333],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.175000,
        bias: 0.045000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.106000,
        gain: 1.540000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.540000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0526': {
    id: 'KERNEL-0526',
    version: '1.0.526',
    entropyBand: [0.583333, 0.584444],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.210000,
        bias: 0.060000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.114000,
        gain: 1.600000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.570000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0527': {
    id: 'KERNEL-0527',
    version: '1.0.527',
    entropyBand: [0.584444, 0.585556],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.650000,
        bias: 0.075000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.122000,
        gain: 1.660000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.600000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0528': {
    id: 'KERNEL-0528',
    version: '1.0.528',
    entropyBand: [0.585556, 0.586667],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.685000,
        bias: -0.075000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.130000,
        gain: 1.720000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.630000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0529': {
    id: 'KERNEL-0529',
    version: '1.0.529',
    entropyBand: [0.586667, 0.587778],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.720000,
        bias: -0.060000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.138000,
        gain: 0.400000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.660000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0530': {
    id: 'KERNEL-0530',
    version: '1.0.530',
    entropyBand: [0.587778, 0.588889],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.755000,
        bias: -0.045000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.146000,
        gain: 0.460000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.690000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0531': {
    id: 'KERNEL-0531',
    version: '1.0.531',
    entropyBand: [0.588889, 0.590000],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.790000,
        bias: -0.030000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.154000,
        gain: 0.520000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.720000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0532': {
    id: 'KERNEL-0532',
    version: '1.0.532',
    entropyBand: [0.590000, 0.591111],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.825000,
        bias: -0.015000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.010000,
        gain: 0.580000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.750000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0533': {
    id: 'KERNEL-0533',
    version: '1.0.533',
    entropyBand: [0.591111, 0.592222],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.860000,
        bias: 0.000000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.018000,
        gain: 0.640000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.780000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0534': {
    id: 'KERNEL-0534',
    version: '1.0.534',
    entropyBand: [0.592222, 0.593333],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.895000,
        bias: 0.015000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.026000,
        gain: 0.700000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.810000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0535': {
    id: 'KERNEL-0535',
    version: '1.0.535',
    entropyBand: [0.593333, 0.594444],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.930000,
        bias: 0.030000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.034000,
        gain: 0.760000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.840000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0536': {
    id: 'KERNEL-0536',
    version: '1.0.536',
    entropyBand: [0.594444, 0.595556],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.965000,
        bias: 0.045000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.042000,
        gain: 0.820000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.870000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0537': {
    id: 'KERNEL-0537',
    version: '1.0.537',
    entropyBand: [0.595556, 0.596667],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.000000,
        bias: 0.060000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.050000,
        gain: 0.880000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.900000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0538': {
    id: 'KERNEL-0538',
    version: '1.0.538',
    entropyBand: [0.596667, 0.597778],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.035000,
        bias: 0.075000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.058000,
        gain: 0.940000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.930000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0539': {
    id: 'KERNEL-0539',
    version: '1.0.539',
    entropyBand: [0.597778, 0.598889],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.070000,
        bias: -0.075000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.066000,
        gain: 1.000000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.960000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0540': {
    id: 'KERNEL-0540',
    version: '1.0.540',
    entropyBand: [0.598889, 0.600000],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.105000,
        bias: -0.060000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.074000,
        gain: 1.060000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.990000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0541': {
    id: 'KERNEL-0541',
    version: '1.0.541',
    entropyBand: [0.600000, 0.601111],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.140000,
        bias: -0.045000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.082000,
        gain: 1.120000,
        branches: 4,
      },
      perpendicular: {
        coupling: 1.020000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0542': {
    id: 'KERNEL-0542',
    version: '1.0.542',
    entropyBand: [0.601111, 0.602222],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.175000,
        bias: -0.030000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.090000,
        gain: 1.180000,
        branches: 5,
      },
      perpendicular: {
        coupling: 1.050000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0543': {
    id: 'KERNEL-0543',
    version: '1.0.543',
    entropyBand: [0.602222, 0.603333],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.210000,
        bias: -0.015000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.098000,
        gain: 1.240000,
        branches: 6,
      },
      perpendicular: {
        coupling: 1.080000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0544': {
    id: 'KERNEL-0544',
    version: '1.0.544',
    entropyBand: [0.603333, 0.604444],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.650000,
        bias: 0.000000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.106000,
        gain: 1.300000,
        branches: 7,
      },
      perpendicular: {
        coupling: 1.110000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0545': {
    id: 'KERNEL-0545',
    version: '1.0.545',
    entropyBand: [0.604444, 0.605556],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.685000,
        bias: 0.015000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.114000,
        gain: 1.360000,
        branches: 8,
      },
      perpendicular: {
        coupling: 1.140000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0546': {
    id: 'KERNEL-0546',
    version: '1.0.546',
    entropyBand: [0.605556, 0.606667],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.720000,
        bias: 0.030000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.122000,
        gain: 1.420000,
        branches: 2,
      },
      perpendicular: {
        coupling: 1.170000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0547': {
    id: 'KERNEL-0547',
    version: '1.0.547',
    entropyBand: [0.606667, 0.607778],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.755000,
        bias: 0.045000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.130000,
        gain: 1.480000,
        branches: 3,
      },
      perpendicular: {
        coupling: 1.200000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0548': {
    id: 'KERNEL-0548',
    version: '1.0.548',
    entropyBand: [0.607778, 0.608889],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.790000,
        bias: 0.060000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.138000,
        gain: 1.540000,
        branches: 4,
      },
      perpendicular: {
        coupling: 1.230000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0549': {
    id: 'KERNEL-0549',
    version: '1.0.549',
    entropyBand: [0.608889, 0.610000],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.825000,
        bias: 0.075000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.146000,
        gain: 1.600000,
        branches: 5,
      },
      perpendicular: {
        coupling: 1.260000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0550': {
    id: 'KERNEL-0550',
    version: '1.0.550',
    entropyBand: [0.610000, 0.611111],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.860000,
        bias: -0.075000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.154000,
        gain: 1.660000,
        branches: 6,
      },
      perpendicular: {
        coupling: 1.290000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0551': {
    id: 'KERNEL-0551',
    version: '1.0.551',
    entropyBand: [0.611111, 0.612222],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.895000,
        bias: -0.060000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.010000,
        gain: 1.720000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.450000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0552': {
    id: 'KERNEL-0552',
    version: '1.0.552',
    entropyBand: [0.612222, 0.613333],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.930000,
        bias: -0.045000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.018000,
        gain: 0.400000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.480000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0553': {
    id: 'KERNEL-0553',
    version: '1.0.553',
    entropyBand: [0.613333, 0.614444],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.965000,
        bias: -0.030000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.026000,
        gain: 0.460000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.510000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0554': {
    id: 'KERNEL-0554',
    version: '1.0.554',
    entropyBand: [0.614444, 0.615556],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.000000,
        bias: -0.015000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.034000,
        gain: 0.520000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.540000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0555': {
    id: 'KERNEL-0555',
    version: '1.0.555',
    entropyBand: [0.615556, 0.616667],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.035000,
        bias: 0.000000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.042000,
        gain: 0.580000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.570000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0556': {
    id: 'KERNEL-0556',
    version: '1.0.556',
    entropyBand: [0.616667, 0.617778],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.070000,
        bias: 0.015000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.050000,
        gain: 0.640000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.600000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0557': {
    id: 'KERNEL-0557',
    version: '1.0.557',
    entropyBand: [0.617778, 0.618889],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.105000,
        bias: 0.030000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.058000,
        gain: 0.700000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.630000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0558': {
    id: 'KERNEL-0558',
    version: '1.0.558',
    entropyBand: [0.618889, 0.620000],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.140000,
        bias: 0.045000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.066000,
        gain: 0.760000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.660000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0559': {
    id: 'KERNEL-0559',
    version: '1.0.559',
    entropyBand: [0.620000, 0.621111],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.175000,
        bias: 0.060000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.074000,
        gain: 0.820000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.690000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0560': {
    id: 'KERNEL-0560',
    version: '1.0.560',
    entropyBand: [0.621111, 0.622222],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.210000,
        bias: 0.075000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.082000,
        gain: 0.880000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.720000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0561': {
    id: 'KERNEL-0561',
    version: '1.0.561',
    entropyBand: [0.622222, 0.623333],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.650000,
        bias: -0.075000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.090000,
        gain: 0.940000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.750000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0562': {
    id: 'KERNEL-0562',
    version: '1.0.562',
    entropyBand: [0.623333, 0.624444],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.685000,
        bias: -0.060000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.098000,
        gain: 1.000000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.780000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0563': {
    id: 'KERNEL-0563',
    version: '1.0.563',
    entropyBand: [0.624444, 0.625556],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.720000,
        bias: -0.045000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.106000,
        gain: 1.060000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.810000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0564': {
    id: 'KERNEL-0564',
    version: '1.0.564',
    entropyBand: [0.625556, 0.626667],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.755000,
        bias: -0.030000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.114000,
        gain: 1.120000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.840000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0565': {
    id: 'KERNEL-0565',
    version: '1.0.565',
    entropyBand: [0.626667, 0.627778],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.790000,
        bias: -0.015000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.122000,
        gain: 1.180000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.870000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0566': {
    id: 'KERNEL-0566',
    version: '1.0.566',
    entropyBand: [0.627778, 0.628889],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.825000,
        bias: 0.000000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.130000,
        gain: 1.240000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.900000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0567': {
    id: 'KERNEL-0567',
    version: '1.0.567',
    entropyBand: [0.628889, 0.630000],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.860000,
        bias: 0.015000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.138000,
        gain: 1.300000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.930000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0568': {
    id: 'KERNEL-0568',
    version: '1.0.568',
    entropyBand: [0.630000, 0.631111],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.895000,
        bias: 0.030000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.146000,
        gain: 1.360000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.960000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0569': {
    id: 'KERNEL-0569',
    version: '1.0.569',
    entropyBand: [0.631111, 0.632222],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.930000,
        bias: 0.045000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.154000,
        gain: 1.420000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.990000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0570': {
    id: 'KERNEL-0570',
    version: '1.0.570',
    entropyBand: [0.632222, 0.633333],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.965000,
        bias: 0.060000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.010000,
        gain: 1.480000,
        branches: 5,
      },
      perpendicular: {
        coupling: 1.020000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0571': {
    id: 'KERNEL-0571',
    version: '1.0.571',
    entropyBand: [0.633333, 0.634444],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.000000,
        bias: 0.075000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.018000,
        gain: 1.540000,
        branches: 6,
      },
      perpendicular: {
        coupling: 1.050000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0572': {
    id: 'KERNEL-0572',
    version: '1.0.572',
    entropyBand: [0.634444, 0.635556],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.035000,
        bias: -0.075000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.026000,
        gain: 1.600000,
        branches: 7,
      },
      perpendicular: {
        coupling: 1.080000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0573': {
    id: 'KERNEL-0573',
    version: '1.0.573',
    entropyBand: [0.635556, 0.636667],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.070000,
        bias: -0.060000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.034000,
        gain: 1.660000,
        branches: 8,
      },
      perpendicular: {
        coupling: 1.110000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0574': {
    id: 'KERNEL-0574',
    version: '1.0.574',
    entropyBand: [0.636667, 0.637778],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.105000,
        bias: -0.045000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.042000,
        gain: 1.720000,
        branches: 2,
      },
      perpendicular: {
        coupling: 1.140000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0575': {
    id: 'KERNEL-0575',
    version: '1.0.575',
    entropyBand: [0.637778, 0.638889],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.140000,
        bias: -0.030000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.050000,
        gain: 0.400000,
        branches: 3,
      },
      perpendicular: {
        coupling: 1.170000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0576': {
    id: 'KERNEL-0576',
    version: '1.0.576',
    entropyBand: [0.638889, 0.640000],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.175000,
        bias: -0.015000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.058000,
        gain: 0.460000,
        branches: 4,
      },
      perpendicular: {
        coupling: 1.200000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0577': {
    id: 'KERNEL-0577',
    version: '1.0.577',
    entropyBand: [0.640000, 0.641111],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.210000,
        bias: 0.000000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.066000,
        gain: 0.520000,
        branches: 5,
      },
      perpendicular: {
        coupling: 1.230000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0578': {
    id: 'KERNEL-0578',
    version: '1.0.578',
    entropyBand: [0.641111, 0.642222],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.650000,
        bias: 0.015000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.074000,
        gain: 0.580000,
        branches: 6,
      },
      perpendicular: {
        coupling: 1.260000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0579': {
    id: 'KERNEL-0579',
    version: '1.0.579',
    entropyBand: [0.642222, 0.643333],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.685000,
        bias: 0.030000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.082000,
        gain: 0.640000,
        branches: 7,
      },
      perpendicular: {
        coupling: 1.290000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0580': {
    id: 'KERNEL-0580',
    version: '1.0.580',
    entropyBand: [0.643333, 0.644444],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.720000,
        bias: 0.045000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.090000,
        gain: 0.700000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.450000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0581': {
    id: 'KERNEL-0581',
    version: '1.0.581',
    entropyBand: [0.644444, 0.645556],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.755000,
        bias: 0.060000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.098000,
        gain: 0.760000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.480000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0582': {
    id: 'KERNEL-0582',
    version: '1.0.582',
    entropyBand: [0.645556, 0.646667],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.790000,
        bias: 0.075000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.106000,
        gain: 0.820000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.510000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0583': {
    id: 'KERNEL-0583',
    version: '1.0.583',
    entropyBand: [0.646667, 0.647778],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.825000,
        bias: -0.075000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.114000,
        gain: 0.880000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.540000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0584': {
    id: 'KERNEL-0584',
    version: '1.0.584',
    entropyBand: [0.647778, 0.648889],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.860000,
        bias: -0.060000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.122000,
        gain: 0.940000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.570000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0585': {
    id: 'KERNEL-0585',
    version: '1.0.585',
    entropyBand: [0.648889, 0.650000],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.895000,
        bias: -0.045000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.130000,
        gain: 1.000000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.600000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0586': {
    id: 'KERNEL-0586',
    version: '1.0.586',
    entropyBand: [0.650000, 0.651111],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.930000,
        bias: -0.030000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.138000,
        gain: 1.060000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.630000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0587': {
    id: 'KERNEL-0587',
    version: '1.0.587',
    entropyBand: [0.651111, 0.652222],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.965000,
        bias: -0.015000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.146000,
        gain: 1.120000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.660000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0588': {
    id: 'KERNEL-0588',
    version: '1.0.588',
    entropyBand: [0.652222, 0.653333],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.000000,
        bias: 0.000000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.154000,
        gain: 1.180000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.690000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0589': {
    id: 'KERNEL-0589',
    version: '1.0.589',
    entropyBand: [0.653333, 0.654444],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.035000,
        bias: 0.015000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.010000,
        gain: 1.240000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.720000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0590': {
    id: 'KERNEL-0590',
    version: '1.0.590',
    entropyBand: [0.654444, 0.655556],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.070000,
        bias: 0.030000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.018000,
        gain: 1.300000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.750000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0591': {
    id: 'KERNEL-0591',
    version: '1.0.591',
    entropyBand: [0.655556, 0.656667],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.105000,
        bias: 0.045000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.026000,
        gain: 1.360000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.780000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0592': {
    id: 'KERNEL-0592',
    version: '1.0.592',
    entropyBand: [0.656667, 0.657778],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.140000,
        bias: 0.060000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.034000,
        gain: 1.420000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.810000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0593': {
    id: 'KERNEL-0593',
    version: '1.0.593',
    entropyBand: [0.657778, 0.658889],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.175000,
        bias: 0.075000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.042000,
        gain: 1.480000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.840000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0594': {
    id: 'KERNEL-0594',
    version: '1.0.594',
    entropyBand: [0.658889, 0.660000],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.210000,
        bias: -0.075000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.050000,
        gain: 1.540000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.870000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0595': {
    id: 'KERNEL-0595',
    version: '1.0.595',
    entropyBand: [0.660000, 0.661111],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.650000,
        bias: -0.060000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.058000,
        gain: 1.600000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.900000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0596': {
    id: 'KERNEL-0596',
    version: '1.0.596',
    entropyBand: [0.661111, 0.662222],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.685000,
        bias: -0.045000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.066000,
        gain: 1.660000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.930000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0597': {
    id: 'KERNEL-0597',
    version: '1.0.597',
    entropyBand: [0.662222, 0.663333],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.720000,
        bias: -0.030000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.074000,
        gain: 1.720000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.960000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0598': {
    id: 'KERNEL-0598',
    version: '1.0.598',
    entropyBand: [0.663333, 0.664444],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.755000,
        bias: -0.015000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.082000,
        gain: 0.400000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.990000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0599': {
    id: 'KERNEL-0599',
    version: '1.0.599',
    entropyBand: [0.664444, 0.665556],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.790000,
        bias: 0.000000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.090000,
        gain: 0.460000,
        branches: 6,
      },
      perpendicular: {
        coupling: 1.020000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0600': {
    id: 'KERNEL-0600',
    version: '1.0.600',
    entropyBand: [0.665556, 0.666667],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.825000,
        bias: 0.015000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.098000,
        gain: 0.520000,
        branches: 7,
      },
      perpendicular: {
        coupling: 1.050000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0601': {
    id: 'KERNEL-0601',
    version: '1.0.601',
    entropyBand: [0.666667, 0.667778],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.860000,
        bias: 0.030000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.106000,
        gain: 0.580000,
        branches: 8,
      },
      perpendicular: {
        coupling: 1.080000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0602': {
    id: 'KERNEL-0602',
    version: '1.0.602',
    entropyBand: [0.667778, 0.668889],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.895000,
        bias: 0.045000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.114000,
        gain: 0.640000,
        branches: 2,
      },
      perpendicular: {
        coupling: 1.110000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0603': {
    id: 'KERNEL-0603',
    version: '1.0.603',
    entropyBand: [0.668889, 0.670000],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.930000,
        bias: 0.060000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.122000,
        gain: 0.700000,
        branches: 3,
      },
      perpendicular: {
        coupling: 1.140000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0604': {
    id: 'KERNEL-0604',
    version: '1.0.604',
    entropyBand: [0.670000, 0.671111],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.965000,
        bias: 0.075000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.130000,
        gain: 0.760000,
        branches: 4,
      },
      perpendicular: {
        coupling: 1.170000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0605': {
    id: 'KERNEL-0605',
    version: '1.0.605',
    entropyBand: [0.671111, 0.672222],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.000000,
        bias: -0.075000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.138000,
        gain: 0.820000,
        branches: 5,
      },
      perpendicular: {
        coupling: 1.200000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0606': {
    id: 'KERNEL-0606',
    version: '1.0.606',
    entropyBand: [0.672222, 0.673333],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.035000,
        bias: -0.060000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.146000,
        gain: 0.880000,
        branches: 6,
      },
      perpendicular: {
        coupling: 1.230000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0607': {
    id: 'KERNEL-0607',
    version: '1.0.607',
    entropyBand: [0.673333, 0.674444],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.070000,
        bias: -0.045000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.154000,
        gain: 0.940000,
        branches: 7,
      },
      perpendicular: {
        coupling: 1.260000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0608': {
    id: 'KERNEL-0608',
    version: '1.0.608',
    entropyBand: [0.674444, 0.675556],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.105000,
        bias: -0.030000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.010000,
        gain: 1.000000,
        branches: 8,
      },
      perpendicular: {
        coupling: 1.290000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0609': {
    id: 'KERNEL-0609',
    version: '1.0.609',
    entropyBand: [0.675556, 0.676667],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.140000,
        bias: -0.015000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.018000,
        gain: 1.060000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.450000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0610': {
    id: 'KERNEL-0610',
    version: '1.0.610',
    entropyBand: [0.676667, 0.677778],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.175000,
        bias: 0.000000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.026000,
        gain: 1.120000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.480000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0611': {
    id: 'KERNEL-0611',
    version: '1.0.611',
    entropyBand: [0.677778, 0.678889],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.210000,
        bias: 0.015000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.034000,
        gain: 1.180000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.510000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0612': {
    id: 'KERNEL-0612',
    version: '1.0.612',
    entropyBand: [0.678889, 0.680000],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.650000,
        bias: 0.030000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.042000,
        gain: 1.240000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.540000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0613': {
    id: 'KERNEL-0613',
    version: '1.0.613',
    entropyBand: [0.680000, 0.681111],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.685000,
        bias: 0.045000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.050000,
        gain: 1.300000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.570000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0614': {
    id: 'KERNEL-0614',
    version: '1.0.614',
    entropyBand: [0.681111, 0.682222],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.720000,
        bias: 0.060000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.058000,
        gain: 1.360000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.600000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0615': {
    id: 'KERNEL-0615',
    version: '1.0.615',
    entropyBand: [0.682222, 0.683333],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.755000,
        bias: 0.075000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.066000,
        gain: 1.420000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.630000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0616': {
    id: 'KERNEL-0616',
    version: '1.0.616',
    entropyBand: [0.683333, 0.684444],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.790000,
        bias: -0.075000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.074000,
        gain: 1.480000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.660000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0617': {
    id: 'KERNEL-0617',
    version: '1.0.617',
    entropyBand: [0.684444, 0.685556],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.825000,
        bias: -0.060000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.082000,
        gain: 1.540000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.690000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0618': {
    id: 'KERNEL-0618',
    version: '1.0.618',
    entropyBand: [0.685556, 0.686667],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.860000,
        bias: -0.045000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.090000,
        gain: 1.600000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.720000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0619': {
    id: 'KERNEL-0619',
    version: '1.0.619',
    entropyBand: [0.686667, 0.687778],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.895000,
        bias: -0.030000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.098000,
        gain: 1.660000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.750000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0620': {
    id: 'KERNEL-0620',
    version: '1.0.620',
    entropyBand: [0.687778, 0.688889],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.930000,
        bias: -0.015000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.106000,
        gain: 1.720000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.780000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0621': {
    id: 'KERNEL-0621',
    version: '1.0.621',
    entropyBand: [0.688889, 0.690000],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.965000,
        bias: 0.000000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.114000,
        gain: 0.400000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.810000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0622': {
    id: 'KERNEL-0622',
    version: '1.0.622',
    entropyBand: [0.690000, 0.691111],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.000000,
        bias: 0.015000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.122000,
        gain: 0.460000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.840000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0623': {
    id: 'KERNEL-0623',
    version: '1.0.623',
    entropyBand: [0.691111, 0.692222],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.035000,
        bias: 0.030000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.130000,
        gain: 0.520000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.870000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0624': {
    id: 'KERNEL-0624',
    version: '1.0.624',
    entropyBand: [0.692222, 0.693333],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.070000,
        bias: 0.045000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.138000,
        gain: 0.580000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.900000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0625': {
    id: 'KERNEL-0625',
    version: '1.0.625',
    entropyBand: [0.693333, 0.694444],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.105000,
        bias: 0.060000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.146000,
        gain: 0.640000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.930000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0626': {
    id: 'KERNEL-0626',
    version: '1.0.626',
    entropyBand: [0.694444, 0.695556],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.140000,
        bias: 0.075000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.154000,
        gain: 0.700000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.960000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0627': {
    id: 'KERNEL-0627',
    version: '1.0.627',
    entropyBand: [0.695556, 0.696667],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.175000,
        bias: -0.075000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.010000,
        gain: 0.760000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.990000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0628': {
    id: 'KERNEL-0628',
    version: '1.0.628',
    entropyBand: [0.696667, 0.697778],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.210000,
        bias: -0.060000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.018000,
        gain: 0.820000,
        branches: 7,
      },
      perpendicular: {
        coupling: 1.020000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0629': {
    id: 'KERNEL-0629',
    version: '1.0.629',
    entropyBand: [0.697778, 0.698889],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.650000,
        bias: -0.045000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.026000,
        gain: 0.880000,
        branches: 8,
      },
      perpendicular: {
        coupling: 1.050000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0630': {
    id: 'KERNEL-0630',
    version: '1.0.630',
    entropyBand: [0.698889, 0.700000],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.685000,
        bias: -0.030000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.034000,
        gain: 0.940000,
        branches: 2,
      },
      perpendicular: {
        coupling: 1.080000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0631': {
    id: 'KERNEL-0631',
    version: '1.0.631',
    entropyBand: [0.700000, 0.701111],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.720000,
        bias: -0.015000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.042000,
        gain: 1.000000,
        branches: 3,
      },
      perpendicular: {
        coupling: 1.110000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0632': {
    id: 'KERNEL-0632',
    version: '1.0.632',
    entropyBand: [0.701111, 0.702222],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.755000,
        bias: 0.000000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.050000,
        gain: 1.060000,
        branches: 4,
      },
      perpendicular: {
        coupling: 1.140000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0633': {
    id: 'KERNEL-0633',
    version: '1.0.633',
    entropyBand: [0.702222, 0.703333],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.790000,
        bias: 0.015000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.058000,
        gain: 1.120000,
        branches: 5,
      },
      perpendicular: {
        coupling: 1.170000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0634': {
    id: 'KERNEL-0634',
    version: '1.0.634',
    entropyBand: [0.703333, 0.704444],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.825000,
        bias: 0.030000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.066000,
        gain: 1.180000,
        branches: 6,
      },
      perpendicular: {
        coupling: 1.200000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0635': {
    id: 'KERNEL-0635',
    version: '1.0.635',
    entropyBand: [0.704444, 0.705556],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.860000,
        bias: 0.045000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.074000,
        gain: 1.240000,
        branches: 7,
      },
      perpendicular: {
        coupling: 1.230000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0636': {
    id: 'KERNEL-0636',
    version: '1.0.636',
    entropyBand: [0.705556, 0.706667],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.895000,
        bias: 0.060000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.082000,
        gain: 1.300000,
        branches: 8,
      },
      perpendicular: {
        coupling: 1.260000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0637': {
    id: 'KERNEL-0637',
    version: '1.0.637',
    entropyBand: [0.706667, 0.707778],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.930000,
        bias: 0.075000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.090000,
        gain: 1.360000,
        branches: 2,
      },
      perpendicular: {
        coupling: 1.290000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0638': {
    id: 'KERNEL-0638',
    version: '1.0.638',
    entropyBand: [0.707778, 0.708889],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.965000,
        bias: -0.075000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.098000,
        gain: 1.420000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.450000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0639': {
    id: 'KERNEL-0639',
    version: '1.0.639',
    entropyBand: [0.708889, 0.710000],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.000000,
        bias: -0.060000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.106000,
        gain: 1.480000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.480000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0640': {
    id: 'KERNEL-0640',
    version: '1.0.640',
    entropyBand: [0.710000, 0.711111],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.035000,
        bias: -0.045000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.114000,
        gain: 1.540000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.510000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0641': {
    id: 'KERNEL-0641',
    version: '1.0.641',
    entropyBand: [0.711111, 0.712222],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.070000,
        bias: -0.030000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.122000,
        gain: 1.600000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.540000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0642': {
    id: 'KERNEL-0642',
    version: '1.0.642',
    entropyBand: [0.712222, 0.713333],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.105000,
        bias: -0.015000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.130000,
        gain: 1.660000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.570000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0643': {
    id: 'KERNEL-0643',
    version: '1.0.643',
    entropyBand: [0.713333, 0.714444],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.140000,
        bias: 0.000000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.138000,
        gain: 1.720000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.600000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0644': {
    id: 'KERNEL-0644',
    version: '1.0.644',
    entropyBand: [0.714444, 0.715556],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.175000,
        bias: 0.015000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.146000,
        gain: 0.400000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.630000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0645': {
    id: 'KERNEL-0645',
    version: '1.0.645',
    entropyBand: [0.715556, 0.716667],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.210000,
        bias: 0.030000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.154000,
        gain: 0.460000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.660000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0646': {
    id: 'KERNEL-0646',
    version: '1.0.646',
    entropyBand: [0.716667, 0.717778],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.650000,
        bias: 0.045000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.010000,
        gain: 0.520000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.690000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0647': {
    id: 'KERNEL-0647',
    version: '1.0.647',
    entropyBand: [0.717778, 0.718889],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.685000,
        bias: 0.060000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.018000,
        gain: 0.580000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.720000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0648': {
    id: 'KERNEL-0648',
    version: '1.0.648',
    entropyBand: [0.718889, 0.720000],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.720000,
        bias: 0.075000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.026000,
        gain: 0.640000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.750000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0649': {
    id: 'KERNEL-0649',
    version: '1.0.649',
    entropyBand: [0.720000, 0.721111],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.755000,
        bias: -0.075000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.034000,
        gain: 0.700000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.780000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0650': {
    id: 'KERNEL-0650',
    version: '1.0.650',
    entropyBand: [0.721111, 0.722222],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.790000,
        bias: -0.060000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.042000,
        gain: 0.760000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.810000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0651': {
    id: 'KERNEL-0651',
    version: '1.0.651',
    entropyBand: [0.722222, 0.723333],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.825000,
        bias: -0.045000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.050000,
        gain: 0.820000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.840000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0652': {
    id: 'KERNEL-0652',
    version: '1.0.652',
    entropyBand: [0.723333, 0.724444],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.860000,
        bias: -0.030000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.058000,
        gain: 0.880000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.870000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0653': {
    id: 'KERNEL-0653',
    version: '1.0.653',
    entropyBand: [0.724444, 0.725556],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.895000,
        bias: -0.015000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.066000,
        gain: 0.940000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.900000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0654': {
    id: 'KERNEL-0654',
    version: '1.0.654',
    entropyBand: [0.725556, 0.726667],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.930000,
        bias: 0.000000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.074000,
        gain: 1.000000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.930000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0655': {
    id: 'KERNEL-0655',
    version: '1.0.655',
    entropyBand: [0.726667, 0.727778],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.965000,
        bias: 0.015000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.082000,
        gain: 1.060000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.960000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0656': {
    id: 'KERNEL-0656',
    version: '1.0.656',
    entropyBand: [0.727778, 0.728889],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.000000,
        bias: 0.030000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.090000,
        gain: 1.120000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.990000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0657': {
    id: 'KERNEL-0657',
    version: '1.0.657',
    entropyBand: [0.728889, 0.730000],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.035000,
        bias: 0.045000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.098000,
        gain: 1.180000,
        branches: 8,
      },
      perpendicular: {
        coupling: 1.020000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0658': {
    id: 'KERNEL-0658',
    version: '1.0.658',
    entropyBand: [0.730000, 0.731111],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.070000,
        bias: 0.060000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.106000,
        gain: 1.240000,
        branches: 2,
      },
      perpendicular: {
        coupling: 1.050000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0659': {
    id: 'KERNEL-0659',
    version: '1.0.659',
    entropyBand: [0.731111, 0.732222],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.105000,
        bias: 0.075000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.114000,
        gain: 1.300000,
        branches: 3,
      },
      perpendicular: {
        coupling: 1.080000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0660': {
    id: 'KERNEL-0660',
    version: '1.0.660',
    entropyBand: [0.732222, 0.733333],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.140000,
        bias: -0.075000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.122000,
        gain: 1.360000,
        branches: 4,
      },
      perpendicular: {
        coupling: 1.110000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0661': {
    id: 'KERNEL-0661',
    version: '1.0.661',
    entropyBand: [0.733333, 0.734444],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.175000,
        bias: -0.060000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.130000,
        gain: 1.420000,
        branches: 5,
      },
      perpendicular: {
        coupling: 1.140000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0662': {
    id: 'KERNEL-0662',
    version: '1.0.662',
    entropyBand: [0.734444, 0.735556],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.210000,
        bias: -0.045000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.138000,
        gain: 1.480000,
        branches: 6,
      },
      perpendicular: {
        coupling: 1.170000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0663': {
    id: 'KERNEL-0663',
    version: '1.0.663',
    entropyBand: [0.735556, 0.736667],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.650000,
        bias: -0.030000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.146000,
        gain: 1.540000,
        branches: 7,
      },
      perpendicular: {
        coupling: 1.200000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0664': {
    id: 'KERNEL-0664',
    version: '1.0.664',
    entropyBand: [0.736667, 0.737778],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.685000,
        bias: -0.015000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.154000,
        gain: 1.600000,
        branches: 8,
      },
      perpendicular: {
        coupling: 1.230000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0665': {
    id: 'KERNEL-0665',
    version: '1.0.665',
    entropyBand: [0.737778, 0.738889],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.720000,
        bias: 0.000000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.010000,
        gain: 1.660000,
        branches: 2,
      },
      perpendicular: {
        coupling: 1.260000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0666': {
    id: 'KERNEL-0666',
    version: '1.0.666',
    entropyBand: [0.738889, 0.740000],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.755000,
        bias: 0.015000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.018000,
        gain: 1.720000,
        branches: 3,
      },
      perpendicular: {
        coupling: 1.290000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0667': {
    id: 'KERNEL-0667',
    version: '1.0.667',
    entropyBand: [0.740000, 0.741111],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.790000,
        bias: 0.030000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.026000,
        gain: 0.400000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.450000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0668': {
    id: 'KERNEL-0668',
    version: '1.0.668',
    entropyBand: [0.741111, 0.742222],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.825000,
        bias: 0.045000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.034000,
        gain: 0.460000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.480000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0669': {
    id: 'KERNEL-0669',
    version: '1.0.669',
    entropyBand: [0.742222, 0.743333],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.860000,
        bias: 0.060000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.042000,
        gain: 0.520000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.510000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0670': {
    id: 'KERNEL-0670',
    version: '1.0.670',
    entropyBand: [0.743333, 0.744444],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.895000,
        bias: 0.075000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.050000,
        gain: 0.580000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.540000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0671': {
    id: 'KERNEL-0671',
    version: '1.0.671',
    entropyBand: [0.744444, 0.745556],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.930000,
        bias: -0.075000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.058000,
        gain: 0.640000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.570000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0672': {
    id: 'KERNEL-0672',
    version: '1.0.672',
    entropyBand: [0.745556, 0.746667],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.965000,
        bias: -0.060000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.066000,
        gain: 0.700000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.600000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0673': {
    id: 'KERNEL-0673',
    version: '1.0.673',
    entropyBand: [0.746667, 0.747778],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.000000,
        bias: -0.045000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.074000,
        gain: 0.760000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.630000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0674': {
    id: 'KERNEL-0674',
    version: '1.0.674',
    entropyBand: [0.747778, 0.748889],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.035000,
        bias: -0.030000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.082000,
        gain: 0.820000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.660000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0675': {
    id: 'KERNEL-0675',
    version: '1.0.675',
    entropyBand: [0.748889, 0.750000],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.070000,
        bias: -0.015000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.090000,
        gain: 0.880000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.690000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0676': {
    id: 'KERNEL-0676',
    version: '1.0.676',
    entropyBand: [0.750000, 0.751111],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.105000,
        bias: 0.000000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.098000,
        gain: 0.940000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.720000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0677': {
    id: 'KERNEL-0677',
    version: '1.0.677',
    entropyBand: [0.751111, 0.752222],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.140000,
        bias: 0.015000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.106000,
        gain: 1.000000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.750000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0678': {
    id: 'KERNEL-0678',
    version: '1.0.678',
    entropyBand: [0.752222, 0.753333],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.175000,
        bias: 0.030000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.114000,
        gain: 1.060000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.780000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0679': {
    id: 'KERNEL-0679',
    version: '1.0.679',
    entropyBand: [0.753333, 0.754444],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.210000,
        bias: 0.045000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.122000,
        gain: 1.120000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.810000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0680': {
    id: 'KERNEL-0680',
    version: '1.0.680',
    entropyBand: [0.754444, 0.755556],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.650000,
        bias: 0.060000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.130000,
        gain: 1.180000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.840000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0681': {
    id: 'KERNEL-0681',
    version: '1.0.681',
    entropyBand: [0.755556, 0.756667],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.685000,
        bias: 0.075000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.138000,
        gain: 1.240000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.870000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0682': {
    id: 'KERNEL-0682',
    version: '1.0.682',
    entropyBand: [0.756667, 0.757778],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.720000,
        bias: -0.075000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.146000,
        gain: 1.300000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.900000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0683': {
    id: 'KERNEL-0683',
    version: '1.0.683',
    entropyBand: [0.757778, 0.758889],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.755000,
        bias: -0.060000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.154000,
        gain: 1.360000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.930000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0684': {
    id: 'KERNEL-0684',
    version: '1.0.684',
    entropyBand: [0.758889, 0.760000],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.790000,
        bias: -0.045000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.010000,
        gain: 1.420000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.960000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0685': {
    id: 'KERNEL-0685',
    version: '1.0.685',
    entropyBand: [0.760000, 0.761111],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.825000,
        bias: -0.030000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.018000,
        gain: 1.480000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.990000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0686': {
    id: 'KERNEL-0686',
    version: '1.0.686',
    entropyBand: [0.761111, 0.762222],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.860000,
        bias: -0.015000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.026000,
        gain: 1.540000,
        branches: 2,
      },
      perpendicular: {
        coupling: 1.020000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0687': {
    id: 'KERNEL-0687',
    version: '1.0.687',
    entropyBand: [0.762222, 0.763333],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.895000,
        bias: 0.000000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.034000,
        gain: 1.600000,
        branches: 3,
      },
      perpendicular: {
        coupling: 1.050000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0688': {
    id: 'KERNEL-0688',
    version: '1.0.688',
    entropyBand: [0.763333, 0.764444],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.930000,
        bias: 0.015000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.042000,
        gain: 1.660000,
        branches: 4,
      },
      perpendicular: {
        coupling: 1.080000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0689': {
    id: 'KERNEL-0689',
    version: '1.0.689',
    entropyBand: [0.764444, 0.765556],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.965000,
        bias: 0.030000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.050000,
        gain: 1.720000,
        branches: 5,
      },
      perpendicular: {
        coupling: 1.110000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0690': {
    id: 'KERNEL-0690',
    version: '1.0.690',
    entropyBand: [0.765556, 0.766667],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.000000,
        bias: 0.045000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.058000,
        gain: 0.400000,
        branches: 6,
      },
      perpendicular: {
        coupling: 1.140000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0691': {
    id: 'KERNEL-0691',
    version: '1.0.691',
    entropyBand: [0.766667, 0.767778],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.035000,
        bias: 0.060000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.066000,
        gain: 0.460000,
        branches: 7,
      },
      perpendicular: {
        coupling: 1.170000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0692': {
    id: 'KERNEL-0692',
    version: '1.0.692',
    entropyBand: [0.767778, 0.768889],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.070000,
        bias: 0.075000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.074000,
        gain: 0.520000,
        branches: 8,
      },
      perpendicular: {
        coupling: 1.200000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0693': {
    id: 'KERNEL-0693',
    version: '1.0.693',
    entropyBand: [0.768889, 0.770000],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.105000,
        bias: -0.075000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.082000,
        gain: 0.580000,
        branches: 2,
      },
      perpendicular: {
        coupling: 1.230000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0694': {
    id: 'KERNEL-0694',
    version: '1.0.694',
    entropyBand: [0.770000, 0.771111],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.140000,
        bias: -0.060000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.090000,
        gain: 0.640000,
        branches: 3,
      },
      perpendicular: {
        coupling: 1.260000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0695': {
    id: 'KERNEL-0695',
    version: '1.0.695',
    entropyBand: [0.771111, 0.772222],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.175000,
        bias: -0.045000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.098000,
        gain: 0.700000,
        branches: 4,
      },
      perpendicular: {
        coupling: 1.290000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0696': {
    id: 'KERNEL-0696',
    version: '1.0.696',
    entropyBand: [0.772222, 0.773333],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.210000,
        bias: -0.030000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.106000,
        gain: 0.760000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.450000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0697': {
    id: 'KERNEL-0697',
    version: '1.0.697',
    entropyBand: [0.773333, 0.774444],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.650000,
        bias: -0.015000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.114000,
        gain: 0.820000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.480000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0698': {
    id: 'KERNEL-0698',
    version: '1.0.698',
    entropyBand: [0.774444, 0.775556],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.685000,
        bias: 0.000000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.122000,
        gain: 0.880000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.510000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0699': {
    id: 'KERNEL-0699',
    version: '1.0.699',
    entropyBand: [0.775556, 0.776667],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.720000,
        bias: 0.015000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.130000,
        gain: 0.940000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.540000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0700': {
    id: 'KERNEL-0700',
    version: '1.0.700',
    entropyBand: [0.776667, 0.777778],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.755000,
        bias: 0.030000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.138000,
        gain: 1.000000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.570000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0701': {
    id: 'KERNEL-0701',
    version: '1.0.701',
    entropyBand: [0.777778, 0.778889],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.790000,
        bias: 0.045000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.146000,
        gain: 1.060000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.600000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0702': {
    id: 'KERNEL-0702',
    version: '1.0.702',
    entropyBand: [0.778889, 0.780000],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.825000,
        bias: 0.060000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.154000,
        gain: 1.120000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.630000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0703': {
    id: 'KERNEL-0703',
    version: '1.0.703',
    entropyBand: [0.780000, 0.781111],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.860000,
        bias: 0.075000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.010000,
        gain: 1.180000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.660000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0704': {
    id: 'KERNEL-0704',
    version: '1.0.704',
    entropyBand: [0.781111, 0.782222],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.895000,
        bias: -0.075000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.018000,
        gain: 1.240000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.690000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0705': {
    id: 'KERNEL-0705',
    version: '1.0.705',
    entropyBand: [0.782222, 0.783333],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.930000,
        bias: -0.060000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.026000,
        gain: 1.300000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.720000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0706': {
    id: 'KERNEL-0706',
    version: '1.0.706',
    entropyBand: [0.783333, 0.784444],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.965000,
        bias: -0.045000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.034000,
        gain: 1.360000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.750000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0707': {
    id: 'KERNEL-0707',
    version: '1.0.707',
    entropyBand: [0.784444, 0.785556],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.000000,
        bias: -0.030000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.042000,
        gain: 1.420000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.780000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0708': {
    id: 'KERNEL-0708',
    version: '1.0.708',
    entropyBand: [0.785556, 0.786667],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.035000,
        bias: -0.015000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.050000,
        gain: 1.480000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.810000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0709': {
    id: 'KERNEL-0709',
    version: '1.0.709',
    entropyBand: [0.786667, 0.787778],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.070000,
        bias: 0.000000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.058000,
        gain: 1.540000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.840000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0710': {
    id: 'KERNEL-0710',
    version: '1.0.710',
    entropyBand: [0.787778, 0.788889],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.105000,
        bias: 0.015000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.066000,
        gain: 1.600000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.870000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0711': {
    id: 'KERNEL-0711',
    version: '1.0.711',
    entropyBand: [0.788889, 0.790000],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.140000,
        bias: 0.030000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.074000,
        gain: 1.660000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.900000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0712': {
    id: 'KERNEL-0712',
    version: '1.0.712',
    entropyBand: [0.790000, 0.791111],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.175000,
        bias: 0.045000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.082000,
        gain: 1.720000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.930000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0713': {
    id: 'KERNEL-0713',
    version: '1.0.713',
    entropyBand: [0.791111, 0.792222],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.210000,
        bias: 0.060000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.090000,
        gain: 0.400000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.960000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0714': {
    id: 'KERNEL-0714',
    version: '1.0.714',
    entropyBand: [0.792222, 0.793333],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.650000,
        bias: 0.075000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.098000,
        gain: 0.460000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.990000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0715': {
    id: 'KERNEL-0715',
    version: '1.0.715',
    entropyBand: [0.793333, 0.794444],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.685000,
        bias: -0.075000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.106000,
        gain: 0.520000,
        branches: 3,
      },
      perpendicular: {
        coupling: 1.020000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0716': {
    id: 'KERNEL-0716',
    version: '1.0.716',
    entropyBand: [0.794444, 0.795556],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.720000,
        bias: -0.060000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.114000,
        gain: 0.580000,
        branches: 4,
      },
      perpendicular: {
        coupling: 1.050000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0717': {
    id: 'KERNEL-0717',
    version: '1.0.717',
    entropyBand: [0.795556, 0.796667],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.755000,
        bias: -0.045000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.122000,
        gain: 0.640000,
        branches: 5,
      },
      perpendicular: {
        coupling: 1.080000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0718': {
    id: 'KERNEL-0718',
    version: '1.0.718',
    entropyBand: [0.796667, 0.797778],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.790000,
        bias: -0.030000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.130000,
        gain: 0.700000,
        branches: 6,
      },
      perpendicular: {
        coupling: 1.110000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0719': {
    id: 'KERNEL-0719',
    version: '1.0.719',
    entropyBand: [0.797778, 0.798889],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.825000,
        bias: -0.015000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.138000,
        gain: 0.760000,
        branches: 7,
      },
      perpendicular: {
        coupling: 1.140000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0720': {
    id: 'KERNEL-0720',
    version: '1.0.720',
    entropyBand: [0.798889, 0.800000],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.860000,
        bias: 0.000000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.146000,
        gain: 0.820000,
        branches: 8,
      },
      perpendicular: {
        coupling: 1.170000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0721': {
    id: 'KERNEL-0721',
    version: '1.0.721',
    entropyBand: [0.800000, 0.801111],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.895000,
        bias: 0.015000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.154000,
        gain: 0.880000,
        branches: 2,
      },
      perpendicular: {
        coupling: 1.200000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0722': {
    id: 'KERNEL-0722',
    version: '1.0.722',
    entropyBand: [0.801111, 0.802222],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.930000,
        bias: 0.030000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.010000,
        gain: 0.940000,
        branches: 3,
      },
      perpendicular: {
        coupling: 1.230000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0723': {
    id: 'KERNEL-0723',
    version: '1.0.723',
    entropyBand: [0.802222, 0.803333],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.965000,
        bias: 0.045000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.018000,
        gain: 1.000000,
        branches: 4,
      },
      perpendicular: {
        coupling: 1.260000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0724': {
    id: 'KERNEL-0724',
    version: '1.0.724',
    entropyBand: [0.803333, 0.804444],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.000000,
        bias: 0.060000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.026000,
        gain: 1.060000,
        branches: 5,
      },
      perpendicular: {
        coupling: 1.290000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0725': {
    id: 'KERNEL-0725',
    version: '1.0.725',
    entropyBand: [0.804444, 0.805556],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.035000,
        bias: 0.075000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.034000,
        gain: 1.120000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.450000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0726': {
    id: 'KERNEL-0726',
    version: '1.0.726',
    entropyBand: [0.805556, 0.806667],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.070000,
        bias: -0.075000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.042000,
        gain: 1.180000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.480000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0727': {
    id: 'KERNEL-0727',
    version: '1.0.727',
    entropyBand: [0.806667, 0.807778],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.105000,
        bias: -0.060000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.050000,
        gain: 1.240000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.510000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0728': {
    id: 'KERNEL-0728',
    version: '1.0.728',
    entropyBand: [0.807778, 0.808889],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.140000,
        bias: -0.045000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.058000,
        gain: 1.300000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.540000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0729': {
    id: 'KERNEL-0729',
    version: '1.0.729',
    entropyBand: [0.808889, 0.810000],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.175000,
        bias: -0.030000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.066000,
        gain: 1.360000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.570000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0730': {
    id: 'KERNEL-0730',
    version: '1.0.730',
    entropyBand: [0.810000, 0.811111],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.210000,
        bias: -0.015000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.074000,
        gain: 1.420000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.600000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0731': {
    id: 'KERNEL-0731',
    version: '1.0.731',
    entropyBand: [0.811111, 0.812222],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.650000,
        bias: 0.000000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.082000,
        gain: 1.480000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.630000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0732': {
    id: 'KERNEL-0732',
    version: '1.0.732',
    entropyBand: [0.812222, 0.813333],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.685000,
        bias: 0.015000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.090000,
        gain: 1.540000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.660000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0733': {
    id: 'KERNEL-0733',
    version: '1.0.733',
    entropyBand: [0.813333, 0.814444],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.720000,
        bias: 0.030000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.098000,
        gain: 1.600000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.690000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0734': {
    id: 'KERNEL-0734',
    version: '1.0.734',
    entropyBand: [0.814444, 0.815556],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.755000,
        bias: 0.045000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.106000,
        gain: 1.660000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.720000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0735': {
    id: 'KERNEL-0735',
    version: '1.0.735',
    entropyBand: [0.815556, 0.816667],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.790000,
        bias: 0.060000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.114000,
        gain: 1.720000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.750000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0736': {
    id: 'KERNEL-0736',
    version: '1.0.736',
    entropyBand: [0.816667, 0.817778],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.825000,
        bias: 0.075000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.122000,
        gain: 0.400000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.780000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0737': {
    id: 'KERNEL-0737',
    version: '1.0.737',
    entropyBand: [0.817778, 0.818889],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.860000,
        bias: -0.075000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.130000,
        gain: 0.460000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.810000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0738': {
    id: 'KERNEL-0738',
    version: '1.0.738',
    entropyBand: [0.818889, 0.820000],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.895000,
        bias: -0.060000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.138000,
        gain: 0.520000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.840000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0739': {
    id: 'KERNEL-0739',
    version: '1.0.739',
    entropyBand: [0.820000, 0.821111],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.930000,
        bias: -0.045000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.146000,
        gain: 0.580000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.870000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0740': {
    id: 'KERNEL-0740',
    version: '1.0.740',
    entropyBand: [0.821111, 0.822222],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.965000,
        bias: -0.030000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.154000,
        gain: 0.640000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.900000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0741': {
    id: 'KERNEL-0741',
    version: '1.0.741',
    entropyBand: [0.822222, 0.823333],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.000000,
        bias: -0.015000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.010000,
        gain: 0.700000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.930000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0742': {
    id: 'KERNEL-0742',
    version: '1.0.742',
    entropyBand: [0.823333, 0.824444],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.035000,
        bias: 0.000000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.018000,
        gain: 0.760000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.960000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0743': {
    id: 'KERNEL-0743',
    version: '1.0.743',
    entropyBand: [0.824444, 0.825556],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.070000,
        bias: 0.015000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.026000,
        gain: 0.820000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.990000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0744': {
    id: 'KERNEL-0744',
    version: '1.0.744',
    entropyBand: [0.825556, 0.826667],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.105000,
        bias: 0.030000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.034000,
        gain: 0.880000,
        branches: 4,
      },
      perpendicular: {
        coupling: 1.020000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0745': {
    id: 'KERNEL-0745',
    version: '1.0.745',
    entropyBand: [0.826667, 0.827778],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.140000,
        bias: 0.045000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.042000,
        gain: 0.940000,
        branches: 5,
      },
      perpendicular: {
        coupling: 1.050000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0746': {
    id: 'KERNEL-0746',
    version: '1.0.746',
    entropyBand: [0.827778, 0.828889],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.175000,
        bias: 0.060000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.050000,
        gain: 1.000000,
        branches: 6,
      },
      perpendicular: {
        coupling: 1.080000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0747': {
    id: 'KERNEL-0747',
    version: '1.0.747',
    entropyBand: [0.828889, 0.830000],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.210000,
        bias: 0.075000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.058000,
        gain: 1.060000,
        branches: 7,
      },
      perpendicular: {
        coupling: 1.110000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0748': {
    id: 'KERNEL-0748',
    version: '1.0.748',
    entropyBand: [0.830000, 0.831111],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.650000,
        bias: -0.075000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.066000,
        gain: 1.120000,
        branches: 8,
      },
      perpendicular: {
        coupling: 1.140000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0749': {
    id: 'KERNEL-0749',
    version: '1.0.749',
    entropyBand: [0.831111, 0.832222],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.685000,
        bias: -0.060000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.074000,
        gain: 1.180000,
        branches: 2,
      },
      perpendicular: {
        coupling: 1.170000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0750': {
    id: 'KERNEL-0750',
    version: '1.0.750',
    entropyBand: [0.832222, 0.833333],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.720000,
        bias: -0.045000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.082000,
        gain: 1.240000,
        branches: 3,
      },
      perpendicular: {
        coupling: 1.200000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0751': {
    id: 'KERNEL-0751',
    version: '1.0.751',
    entropyBand: [0.833333, 0.834444],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.755000,
        bias: -0.030000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.090000,
        gain: 1.300000,
        branches: 4,
      },
      perpendicular: {
        coupling: 1.230000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0752': {
    id: 'KERNEL-0752',
    version: '1.0.752',
    entropyBand: [0.834444, 0.835556],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.790000,
        bias: -0.015000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.098000,
        gain: 1.360000,
        branches: 5,
      },
      perpendicular: {
        coupling: 1.260000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0753': {
    id: 'KERNEL-0753',
    version: '1.0.753',
    entropyBand: [0.835556, 0.836667],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.825000,
        bias: 0.000000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.106000,
        gain: 1.420000,
        branches: 6,
      },
      perpendicular: {
        coupling: 1.290000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0754': {
    id: 'KERNEL-0754',
    version: '1.0.754',
    entropyBand: [0.836667, 0.837778],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.860000,
        bias: 0.015000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.114000,
        gain: 1.480000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.450000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0755': {
    id: 'KERNEL-0755',
    version: '1.0.755',
    entropyBand: [0.837778, 0.838889],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.895000,
        bias: 0.030000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.122000,
        gain: 1.540000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.480000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0756': {
    id: 'KERNEL-0756',
    version: '1.0.756',
    entropyBand: [0.838889, 0.840000],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.930000,
        bias: 0.045000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.130000,
        gain: 1.600000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.510000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0757': {
    id: 'KERNEL-0757',
    version: '1.0.757',
    entropyBand: [0.840000, 0.841111],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.965000,
        bias: 0.060000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.138000,
        gain: 1.660000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.540000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0758': {
    id: 'KERNEL-0758',
    version: '1.0.758',
    entropyBand: [0.841111, 0.842222],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.000000,
        bias: 0.075000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.146000,
        gain: 1.720000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.570000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0759': {
    id: 'KERNEL-0759',
    version: '1.0.759',
    entropyBand: [0.842222, 0.843333],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.035000,
        bias: -0.075000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.154000,
        gain: 0.400000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.600000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0760': {
    id: 'KERNEL-0760',
    version: '1.0.760',
    entropyBand: [0.843333, 0.844444],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.070000,
        bias: -0.060000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.010000,
        gain: 0.460000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.630000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0761': {
    id: 'KERNEL-0761',
    version: '1.0.761',
    entropyBand: [0.844444, 0.845556],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.105000,
        bias: -0.045000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.018000,
        gain: 0.520000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.660000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0762': {
    id: 'KERNEL-0762',
    version: '1.0.762',
    entropyBand: [0.845556, 0.846667],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.140000,
        bias: -0.030000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.026000,
        gain: 0.580000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.690000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0763': {
    id: 'KERNEL-0763',
    version: '1.0.763',
    entropyBand: [0.846667, 0.847778],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.175000,
        bias: -0.015000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.034000,
        gain: 0.640000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.720000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0764': {
    id: 'KERNEL-0764',
    version: '1.0.764',
    entropyBand: [0.847778, 0.848889],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.210000,
        bias: 0.000000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.042000,
        gain: 0.700000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.750000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0765': {
    id: 'KERNEL-0765',
    version: '1.0.765',
    entropyBand: [0.848889, 0.850000],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.650000,
        bias: 0.015000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.050000,
        gain: 0.760000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.780000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0766': {
    id: 'KERNEL-0766',
    version: '1.0.766',
    entropyBand: [0.850000, 0.851111],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.685000,
        bias: 0.030000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.058000,
        gain: 0.820000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.810000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0767': {
    id: 'KERNEL-0767',
    version: '1.0.767',
    entropyBand: [0.851111, 0.852222],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.720000,
        bias: 0.045000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.066000,
        gain: 0.880000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.840000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0768': {
    id: 'KERNEL-0768',
    version: '1.0.768',
    entropyBand: [0.852222, 0.853333],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.755000,
        bias: 0.060000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.074000,
        gain: 0.940000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.870000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0769': {
    id: 'KERNEL-0769',
    version: '1.0.769',
    entropyBand: [0.853333, 0.854444],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.790000,
        bias: 0.075000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.082000,
        gain: 1.000000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.900000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0770': {
    id: 'KERNEL-0770',
    version: '1.0.770',
    entropyBand: [0.854444, 0.855556],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.825000,
        bias: -0.075000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.090000,
        gain: 1.060000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.930000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0771': {
    id: 'KERNEL-0771',
    version: '1.0.771',
    entropyBand: [0.855556, 0.856667],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.860000,
        bias: -0.060000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.098000,
        gain: 1.120000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.960000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0772': {
    id: 'KERNEL-0772',
    version: '1.0.772',
    entropyBand: [0.856667, 0.857778],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.895000,
        bias: -0.045000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.106000,
        gain: 1.180000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.990000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0773': {
    id: 'KERNEL-0773',
    version: '1.0.773',
    entropyBand: [0.857778, 0.858889],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.930000,
        bias: -0.030000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.114000,
        gain: 1.240000,
        branches: 5,
      },
      perpendicular: {
        coupling: 1.020000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0774': {
    id: 'KERNEL-0774',
    version: '1.0.774',
    entropyBand: [0.858889, 0.860000],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.965000,
        bias: -0.015000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.122000,
        gain: 1.300000,
        branches: 6,
      },
      perpendicular: {
        coupling: 1.050000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0775': {
    id: 'KERNEL-0775',
    version: '1.0.775',
    entropyBand: [0.860000, 0.861111],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.000000,
        bias: 0.000000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.130000,
        gain: 1.360000,
        branches: 7,
      },
      perpendicular: {
        coupling: 1.080000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0776': {
    id: 'KERNEL-0776',
    version: '1.0.776',
    entropyBand: [0.861111, 0.862222],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.035000,
        bias: 0.015000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.138000,
        gain: 1.420000,
        branches: 8,
      },
      perpendicular: {
        coupling: 1.110000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0777': {
    id: 'KERNEL-0777',
    version: '1.0.777',
    entropyBand: [0.862222, 0.863333],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.070000,
        bias: 0.030000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.146000,
        gain: 1.480000,
        branches: 2,
      },
      perpendicular: {
        coupling: 1.140000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0778': {
    id: 'KERNEL-0778',
    version: '1.0.778',
    entropyBand: [0.863333, 0.864444],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.105000,
        bias: 0.045000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.154000,
        gain: 1.540000,
        branches: 3,
      },
      perpendicular: {
        coupling: 1.170000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0779': {
    id: 'KERNEL-0779',
    version: '1.0.779',
    entropyBand: [0.864444, 0.865556],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.140000,
        bias: 0.060000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.010000,
        gain: 1.600000,
        branches: 4,
      },
      perpendicular: {
        coupling: 1.200000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0780': {
    id: 'KERNEL-0780',
    version: '1.0.780',
    entropyBand: [0.865556, 0.866667],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.175000,
        bias: 0.075000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.018000,
        gain: 1.660000,
        branches: 5,
      },
      perpendicular: {
        coupling: 1.230000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0781': {
    id: 'KERNEL-0781',
    version: '1.0.781',
    entropyBand: [0.866667, 0.867778],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.210000,
        bias: -0.075000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.026000,
        gain: 1.720000,
        branches: 6,
      },
      perpendicular: {
        coupling: 1.260000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0782': {
    id: 'KERNEL-0782',
    version: '1.0.782',
    entropyBand: [0.867778, 0.868889],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.650000,
        bias: -0.060000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.034000,
        gain: 0.400000,
        branches: 7,
      },
      perpendicular: {
        coupling: 1.290000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0783': {
    id: 'KERNEL-0783',
    version: '1.0.783',
    entropyBand: [0.868889, 0.870000],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.685000,
        bias: -0.045000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.042000,
        gain: 0.460000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.450000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0784': {
    id: 'KERNEL-0784',
    version: '1.0.784',
    entropyBand: [0.870000, 0.871111],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.720000,
        bias: -0.030000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.050000,
        gain: 0.520000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.480000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0785': {
    id: 'KERNEL-0785',
    version: '1.0.785',
    entropyBand: [0.871111, 0.872222],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.755000,
        bias: -0.015000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.058000,
        gain: 0.580000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.510000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0786': {
    id: 'KERNEL-0786',
    version: '1.0.786',
    entropyBand: [0.872222, 0.873333],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.790000,
        bias: 0.000000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.066000,
        gain: 0.640000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.540000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0787': {
    id: 'KERNEL-0787',
    version: '1.0.787',
    entropyBand: [0.873333, 0.874444],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.825000,
        bias: 0.015000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.074000,
        gain: 0.700000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.570000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0788': {
    id: 'KERNEL-0788',
    version: '1.0.788',
    entropyBand: [0.874444, 0.875556],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.860000,
        bias: 0.030000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.082000,
        gain: 0.760000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.600000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0789': {
    id: 'KERNEL-0789',
    version: '1.0.789',
    entropyBand: [0.875556, 0.876667],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.895000,
        bias: 0.045000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.090000,
        gain: 0.820000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.630000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0790': {
    id: 'KERNEL-0790',
    version: '1.0.790',
    entropyBand: [0.876667, 0.877778],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.930000,
        bias: 0.060000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.098000,
        gain: 0.880000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.660000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0791': {
    id: 'KERNEL-0791',
    version: '1.0.791',
    entropyBand: [0.877778, 0.878889],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.965000,
        bias: 0.075000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.106000,
        gain: 0.940000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.690000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0792': {
    id: 'KERNEL-0792',
    version: '1.0.792',
    entropyBand: [0.878889, 0.880000],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.000000,
        bias: -0.075000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.114000,
        gain: 1.000000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.720000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0793': {
    id: 'KERNEL-0793',
    version: '1.0.793',
    entropyBand: [0.880000, 0.881111],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.035000,
        bias: -0.060000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.122000,
        gain: 1.060000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.750000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0794': {
    id: 'KERNEL-0794',
    version: '1.0.794',
    entropyBand: [0.881111, 0.882222],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.070000,
        bias: -0.045000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.130000,
        gain: 1.120000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.780000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0795': {
    id: 'KERNEL-0795',
    version: '1.0.795',
    entropyBand: [0.882222, 0.883333],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.105000,
        bias: -0.030000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.138000,
        gain: 1.180000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.810000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0796': {
    id: 'KERNEL-0796',
    version: '1.0.796',
    entropyBand: [0.883333, 0.884444],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.140000,
        bias: -0.015000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.146000,
        gain: 1.240000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.840000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0797': {
    id: 'KERNEL-0797',
    version: '1.0.797',
    entropyBand: [0.884444, 0.885556],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.175000,
        bias: 0.000000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.154000,
        gain: 1.300000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.870000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0798': {
    id: 'KERNEL-0798',
    version: '1.0.798',
    entropyBand: [0.885556, 0.886667],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.210000,
        bias: 0.015000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.010000,
        gain: 1.360000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.900000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0799': {
    id: 'KERNEL-0799',
    version: '1.0.799',
    entropyBand: [0.886667, 0.887778],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.650000,
        bias: 0.030000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.018000,
        gain: 1.420000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.930000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0800': {
    id: 'KERNEL-0800',
    version: '1.0.800',
    entropyBand: [0.887778, 0.888889],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.685000,
        bias: 0.045000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.026000,
        gain: 1.480000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.960000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0801': {
    id: 'KERNEL-0801',
    version: '1.0.801',
    entropyBand: [0.888889, 0.890000],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.720000,
        bias: 0.060000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.034000,
        gain: 1.540000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.990000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0802': {
    id: 'KERNEL-0802',
    version: '1.0.802',
    entropyBand: [0.890000, 0.891111],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.755000,
        bias: 0.075000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.042000,
        gain: 1.600000,
        branches: 6,
      },
      perpendicular: {
        coupling: 1.020000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0803': {
    id: 'KERNEL-0803',
    version: '1.0.803',
    entropyBand: [0.891111, 0.892222],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.790000,
        bias: -0.075000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.050000,
        gain: 1.660000,
        branches: 7,
      },
      perpendicular: {
        coupling: 1.050000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0804': {
    id: 'KERNEL-0804',
    version: '1.0.804',
    entropyBand: [0.892222, 0.893333],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.825000,
        bias: -0.060000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.058000,
        gain: 1.720000,
        branches: 8,
      },
      perpendicular: {
        coupling: 1.080000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0805': {
    id: 'KERNEL-0805',
    version: '1.0.805',
    entropyBand: [0.893333, 0.894444],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.860000,
        bias: -0.045000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.066000,
        gain: 0.400000,
        branches: 2,
      },
      perpendicular: {
        coupling: 1.110000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0806': {
    id: 'KERNEL-0806',
    version: '1.0.806',
    entropyBand: [0.894444, 0.895556],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.895000,
        bias: -0.030000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.074000,
        gain: 0.460000,
        branches: 3,
      },
      perpendicular: {
        coupling: 1.140000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0807': {
    id: 'KERNEL-0807',
    version: '1.0.807',
    entropyBand: [0.895556, 0.896667],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.930000,
        bias: -0.015000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.082000,
        gain: 0.520000,
        branches: 4,
      },
      perpendicular: {
        coupling: 1.170000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0808': {
    id: 'KERNEL-0808',
    version: '1.0.808',
    entropyBand: [0.896667, 0.897778],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.965000,
        bias: 0.000000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.090000,
        gain: 0.580000,
        branches: 5,
      },
      perpendicular: {
        coupling: 1.200000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0809': {
    id: 'KERNEL-0809',
    version: '1.0.809',
    entropyBand: [0.897778, 0.898889],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.000000,
        bias: 0.015000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.098000,
        gain: 0.640000,
        branches: 6,
      },
      perpendicular: {
        coupling: 1.230000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0810': {
    id: 'KERNEL-0810',
    version: '1.0.810',
    entropyBand: [0.898889, 0.900000],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.035000,
        bias: 0.030000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.106000,
        gain: 0.700000,
        branches: 7,
      },
      perpendicular: {
        coupling: 1.260000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0811': {
    id: 'KERNEL-0811',
    version: '1.0.811',
    entropyBand: [0.900000, 0.901111],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.070000,
        bias: 0.045000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.114000,
        gain: 0.760000,
        branches: 8,
      },
      perpendicular: {
        coupling: 1.290000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0812': {
    id: 'KERNEL-0812',
    version: '1.0.812',
    entropyBand: [0.901111, 0.902222],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.105000,
        bias: 0.060000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.122000,
        gain: 0.820000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.450000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0813': {
    id: 'KERNEL-0813',
    version: '1.0.813',
    entropyBand: [0.902222, 0.903333],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.140000,
        bias: 0.075000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.130000,
        gain: 0.880000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.480000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0814': {
    id: 'KERNEL-0814',
    version: '1.0.814',
    entropyBand: [0.903333, 0.904444],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.175000,
        bias: -0.075000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.138000,
        gain: 0.940000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.510000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0815': {
    id: 'KERNEL-0815',
    version: '1.0.815',
    entropyBand: [0.904444, 0.905556],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.210000,
        bias: -0.060000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.146000,
        gain: 1.000000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.540000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0816': {
    id: 'KERNEL-0816',
    version: '1.0.816',
    entropyBand: [0.905556, 0.906667],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.650000,
        bias: -0.045000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.154000,
        gain: 1.060000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.570000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0817': {
    id: 'KERNEL-0817',
    version: '1.0.817',
    entropyBand: [0.906667, 0.907778],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.685000,
        bias: -0.030000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.010000,
        gain: 1.120000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.600000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0818': {
    id: 'KERNEL-0818',
    version: '1.0.818',
    entropyBand: [0.907778, 0.908889],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.720000,
        bias: -0.015000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.018000,
        gain: 1.180000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.630000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0819': {
    id: 'KERNEL-0819',
    version: '1.0.819',
    entropyBand: [0.908889, 0.910000],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.755000,
        bias: 0.000000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.026000,
        gain: 1.240000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.660000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0820': {
    id: 'KERNEL-0820',
    version: '1.0.820',
    entropyBand: [0.910000, 0.911111],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.790000,
        bias: 0.015000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.034000,
        gain: 1.300000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.690000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0821': {
    id: 'KERNEL-0821',
    version: '1.0.821',
    entropyBand: [0.911111, 0.912222],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.825000,
        bias: 0.030000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.042000,
        gain: 1.360000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.720000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0822': {
    id: 'KERNEL-0822',
    version: '1.0.822',
    entropyBand: [0.912222, 0.913333],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.860000,
        bias: 0.045000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.050000,
        gain: 1.420000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.750000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0823': {
    id: 'KERNEL-0823',
    version: '1.0.823',
    entropyBand: [0.913333, 0.914444],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.895000,
        bias: 0.060000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.058000,
        gain: 1.480000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.780000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0824': {
    id: 'KERNEL-0824',
    version: '1.0.824',
    entropyBand: [0.914444, 0.915556],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.930000,
        bias: 0.075000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.066000,
        gain: 1.540000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.810000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0825': {
    id: 'KERNEL-0825',
    version: '1.0.825',
    entropyBand: [0.915556, 0.916667],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.965000,
        bias: -0.075000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.074000,
        gain: 1.600000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.840000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0826': {
    id: 'KERNEL-0826',
    version: '1.0.826',
    entropyBand: [0.916667, 0.917778],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.000000,
        bias: -0.060000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.082000,
        gain: 1.660000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.870000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0827': {
    id: 'KERNEL-0827',
    version: '1.0.827',
    entropyBand: [0.917778, 0.918889],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.035000,
        bias: -0.045000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.090000,
        gain: 1.720000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.900000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0828': {
    id: 'KERNEL-0828',
    version: '1.0.828',
    entropyBand: [0.918889, 0.920000],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.070000,
        bias: -0.030000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.098000,
        gain: 0.400000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.930000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0829': {
    id: 'KERNEL-0829',
    version: '1.0.829',
    entropyBand: [0.920000, 0.921111],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.105000,
        bias: -0.015000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.106000,
        gain: 0.460000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.960000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0830': {
    id: 'KERNEL-0830',
    version: '1.0.830',
    entropyBand: [0.921111, 0.922222],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.140000,
        bias: 0.000000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.114000,
        gain: 0.520000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.990000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0831': {
    id: 'KERNEL-0831',
    version: '1.0.831',
    entropyBand: [0.922222, 0.923333],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.175000,
        bias: 0.015000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.122000,
        gain: 0.580000,
        branches: 7,
      },
      perpendicular: {
        coupling: 1.020000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0832': {
    id: 'KERNEL-0832',
    version: '1.0.832',
    entropyBand: [0.923333, 0.924444],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.210000,
        bias: 0.030000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.130000,
        gain: 0.640000,
        branches: 8,
      },
      perpendicular: {
        coupling: 1.050000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0833': {
    id: 'KERNEL-0833',
    version: '1.0.833',
    entropyBand: [0.924444, 0.925556],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.650000,
        bias: 0.045000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.138000,
        gain: 0.700000,
        branches: 2,
      },
      perpendicular: {
        coupling: 1.080000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0834': {
    id: 'KERNEL-0834',
    version: '1.0.834',
    entropyBand: [0.925556, 0.926667],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.685000,
        bias: 0.060000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.146000,
        gain: 0.760000,
        branches: 3,
      },
      perpendicular: {
        coupling: 1.110000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0835': {
    id: 'KERNEL-0835',
    version: '1.0.835',
    entropyBand: [0.926667, 0.927778],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.720000,
        bias: 0.075000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.154000,
        gain: 0.820000,
        branches: 4,
      },
      perpendicular: {
        coupling: 1.140000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0836': {
    id: 'KERNEL-0836',
    version: '1.0.836',
    entropyBand: [0.927778, 0.928889],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.755000,
        bias: -0.075000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.010000,
        gain: 0.880000,
        branches: 5,
      },
      perpendicular: {
        coupling: 1.170000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0837': {
    id: 'KERNEL-0837',
    version: '1.0.837',
    entropyBand: [0.928889, 0.930000],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.790000,
        bias: -0.060000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.018000,
        gain: 0.940000,
        branches: 6,
      },
      perpendicular: {
        coupling: 1.200000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0838': {
    id: 'KERNEL-0838',
    version: '1.0.838',
    entropyBand: [0.930000, 0.931111],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.825000,
        bias: -0.045000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.026000,
        gain: 1.000000,
        branches: 7,
      },
      perpendicular: {
        coupling: 1.230000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0839': {
    id: 'KERNEL-0839',
    version: '1.0.839',
    entropyBand: [0.931111, 0.932222],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.860000,
        bias: -0.030000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.034000,
        gain: 1.060000,
        branches: 8,
      },
      perpendicular: {
        coupling: 1.260000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0840': {
    id: 'KERNEL-0840',
    version: '1.0.840',
    entropyBand: [0.932222, 0.933333],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.895000,
        bias: -0.015000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.042000,
        gain: 1.120000,
        branches: 2,
      },
      perpendicular: {
        coupling: 1.290000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0841': {
    id: 'KERNEL-0841',
    version: '1.0.841',
    entropyBand: [0.933333, 0.934444],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.930000,
        bias: 0.000000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.050000,
        gain: 1.180000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.450000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0842': {
    id: 'KERNEL-0842',
    version: '1.0.842',
    entropyBand: [0.934444, 0.935556],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.965000,
        bias: 0.015000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.058000,
        gain: 1.240000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.480000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0843': {
    id: 'KERNEL-0843',
    version: '1.0.843',
    entropyBand: [0.935556, 0.936667],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.000000,
        bias: 0.030000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.066000,
        gain: 1.300000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.510000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0844': {
    id: 'KERNEL-0844',
    version: '1.0.844',
    entropyBand: [0.936667, 0.937778],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.035000,
        bias: 0.045000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.074000,
        gain: 1.360000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.540000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0845': {
    id: 'KERNEL-0845',
    version: '1.0.845',
    entropyBand: [0.937778, 0.938889],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.070000,
        bias: 0.060000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.082000,
        gain: 1.420000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.570000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0846': {
    id: 'KERNEL-0846',
    version: '1.0.846',
    entropyBand: [0.938889, 0.940000],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.105000,
        bias: 0.075000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.090000,
        gain: 1.480000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.600000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0847': {
    id: 'KERNEL-0847',
    version: '1.0.847',
    entropyBand: [0.940000, 0.941111],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.140000,
        bias: -0.075000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.098000,
        gain: 1.540000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.630000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0848': {
    id: 'KERNEL-0848',
    version: '1.0.848',
    entropyBand: [0.941111, 0.942222],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.175000,
        bias: -0.060000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.106000,
        gain: 1.600000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.660000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0849': {
    id: 'KERNEL-0849',
    version: '1.0.849',
    entropyBand: [0.942222, 0.943333],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.210000,
        bias: -0.045000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.114000,
        gain: 1.660000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.690000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0850': {
    id: 'KERNEL-0850',
    version: '1.0.850',
    entropyBand: [0.943333, 0.944444],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.650000,
        bias: -0.030000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.122000,
        gain: 1.720000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.720000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0851': {
    id: 'KERNEL-0851',
    version: '1.0.851',
    entropyBand: [0.944444, 0.945556],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.685000,
        bias: -0.015000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.130000,
        gain: 0.400000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.750000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0852': {
    id: 'KERNEL-0852',
    version: '1.0.852',
    entropyBand: [0.945556, 0.946667],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.720000,
        bias: 0.000000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.138000,
        gain: 0.460000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.780000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0853': {
    id: 'KERNEL-0853',
    version: '1.0.853',
    entropyBand: [0.946667, 0.947778],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.755000,
        bias: 0.015000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.146000,
        gain: 0.520000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.810000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0854': {
    id: 'KERNEL-0854',
    version: '1.0.854',
    entropyBand: [0.947778, 0.948889],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.790000,
        bias: 0.030000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.154000,
        gain: 0.580000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.840000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0855': {
    id: 'KERNEL-0855',
    version: '1.0.855',
    entropyBand: [0.948889, 0.950000],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.825000,
        bias: 0.045000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.010000,
        gain: 0.640000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.870000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0856': {
    id: 'KERNEL-0856',
    version: '1.0.856',
    entropyBand: [0.950000, 0.951111],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.860000,
        bias: 0.060000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.018000,
        gain: 0.700000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.900000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0857': {
    id: 'KERNEL-0857',
    version: '1.0.857',
    entropyBand: [0.951111, 0.952222],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.895000,
        bias: 0.075000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.026000,
        gain: 0.760000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.930000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0858': {
    id: 'KERNEL-0858',
    version: '1.0.858',
    entropyBand: [0.952222, 0.953333],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.930000,
        bias: -0.075000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.034000,
        gain: 0.820000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.960000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0859': {
    id: 'KERNEL-0859',
    version: '1.0.859',
    entropyBand: [0.953333, 0.954444],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.965000,
        bias: -0.060000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.042000,
        gain: 0.880000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.990000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0860': {
    id: 'KERNEL-0860',
    version: '1.0.860',
    entropyBand: [0.954444, 0.955556],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.000000,
        bias: -0.045000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.050000,
        gain: 0.940000,
        branches: 8,
      },
      perpendicular: {
        coupling: 1.020000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0861': {
    id: 'KERNEL-0861',
    version: '1.0.861',
    entropyBand: [0.955556, 0.956667],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.035000,
        bias: -0.030000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.058000,
        gain: 1.000000,
        branches: 2,
      },
      perpendicular: {
        coupling: 1.050000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0862': {
    id: 'KERNEL-0862',
    version: '1.0.862',
    entropyBand: [0.956667, 0.957778],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.070000,
        bias: -0.015000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.066000,
        gain: 1.060000,
        branches: 3,
      },
      perpendicular: {
        coupling: 1.080000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0863': {
    id: 'KERNEL-0863',
    version: '1.0.863',
    entropyBand: [0.957778, 0.958889],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.105000,
        bias: 0.000000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.074000,
        gain: 1.120000,
        branches: 4,
      },
      perpendicular: {
        coupling: 1.110000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0864': {
    id: 'KERNEL-0864',
    version: '1.0.864',
    entropyBand: [0.958889, 0.960000],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.140000,
        bias: 0.015000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.082000,
        gain: 1.180000,
        branches: 5,
      },
      perpendicular: {
        coupling: 1.140000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0865': {
    id: 'KERNEL-0865',
    version: '1.0.865',
    entropyBand: [0.960000, 0.961111],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.175000,
        bias: 0.030000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.090000,
        gain: 1.240000,
        branches: 6,
      },
      perpendicular: {
        coupling: 1.170000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0866': {
    id: 'KERNEL-0866',
    version: '1.0.866',
    entropyBand: [0.961111, 0.962222],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.210000,
        bias: 0.045000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.098000,
        gain: 1.300000,
        branches: 7,
      },
      perpendicular: {
        coupling: 1.200000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0867': {
    id: 'KERNEL-0867',
    version: '1.0.867',
    entropyBand: [0.962222, 0.963333],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.650000,
        bias: 0.060000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.106000,
        gain: 1.360000,
        branches: 8,
      },
      perpendicular: {
        coupling: 1.230000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0868': {
    id: 'KERNEL-0868',
    version: '1.0.868',
    entropyBand: [0.963333, 0.964444],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.685000,
        bias: 0.075000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.114000,
        gain: 1.420000,
        branches: 2,
      },
      perpendicular: {
        coupling: 1.260000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0869': {
    id: 'KERNEL-0869',
    version: '1.0.869',
    entropyBand: [0.964444, 0.965556],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.720000,
        bias: -0.075000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.122000,
        gain: 1.480000,
        branches: 3,
      },
      perpendicular: {
        coupling: 1.290000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0870': {
    id: 'KERNEL-0870',
    version: '1.0.870',
    entropyBand: [0.965556, 0.966667],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.755000,
        bias: -0.060000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.130000,
        gain: 1.540000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.450000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0871': {
    id: 'KERNEL-0871',
    version: '1.0.871',
    entropyBand: [0.966667, 0.967778],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.790000,
        bias: -0.045000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.138000,
        gain: 1.600000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.480000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0872': {
    id: 'KERNEL-0872',
    version: '1.0.872',
    entropyBand: [0.967778, 0.968889],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.825000,
        bias: -0.030000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.146000,
        gain: 1.660000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.510000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0873': {
    id: 'KERNEL-0873',
    version: '1.0.873',
    entropyBand: [0.968889, 0.970000],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.860000,
        bias: -0.015000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.154000,
        gain: 1.720000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.540000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0874': {
    id: 'KERNEL-0874',
    version: '1.0.874',
    entropyBand: [0.970000, 0.971111],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.895000,
        bias: 0.000000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.010000,
        gain: 0.400000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.570000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0875': {
    id: 'KERNEL-0875',
    version: '1.0.875',
    entropyBand: [0.971111, 0.972222],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.930000,
        bias: 0.015000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.018000,
        gain: 0.460000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.600000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0876': {
    id: 'KERNEL-0876',
    version: '1.0.876',
    entropyBand: [0.972222, 0.973333],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.965000,
        bias: 0.030000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.026000,
        gain: 0.520000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.630000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0877': {
    id: 'KERNEL-0877',
    version: '1.0.877',
    entropyBand: [0.973333, 0.974444],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.000000,
        bias: 0.045000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.034000,
        gain: 0.580000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.660000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0878': {
    id: 'KERNEL-0878',
    version: '1.0.878',
    entropyBand: [0.974444, 0.975556],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.035000,
        bias: 0.060000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.042000,
        gain: 0.640000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.690000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0879': {
    id: 'KERNEL-0879',
    version: '1.0.879',
    entropyBand: [0.975556, 0.976667],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.070000,
        bias: 0.075000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.050000,
        gain: 0.700000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.720000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0880': {
    id: 'KERNEL-0880',
    version: '1.0.880',
    entropyBand: [0.976667, 0.977778],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.105000,
        bias: -0.075000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.058000,
        gain: 0.760000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.750000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0881': {
    id: 'KERNEL-0881',
    version: '1.0.881',
    entropyBand: [0.977778, 0.978889],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.140000,
        bias: -0.060000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.066000,
        gain: 0.820000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.780000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0882': {
    id: 'KERNEL-0882',
    version: '1.0.882',
    entropyBand: [0.978889, 0.980000],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.175000,
        bias: -0.045000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.074000,
        gain: 0.880000,
        branches: 2,
      },
      perpendicular: {
        coupling: 0.810000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0883': {
    id: 'KERNEL-0883',
    version: '1.0.883',
    entropyBand: [0.980000, 0.981111],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.210000,
        bias: -0.030000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.082000,
        gain: 0.940000,
        branches: 3,
      },
      perpendicular: {
        coupling: 0.840000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0884': {
    id: 'KERNEL-0884',
    version: '1.0.884',
    entropyBand: [0.981111, 0.982222],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.650000,
        bias: -0.015000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.090000,
        gain: 1.000000,
        branches: 4,
      },
      perpendicular: {
        coupling: 0.870000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0885': {
    id: 'KERNEL-0885',
    version: '1.0.885',
    entropyBand: [0.982222, 0.983333],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.685000,
        bias: 0.000000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.098000,
        gain: 1.060000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.900000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0886': {
    id: 'KERNEL-0886',
    version: '1.0.886',
    entropyBand: [0.983333, 0.984444],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.720000,
        bias: 0.015000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.106000,
        gain: 1.120000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.930000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0887': {
    id: 'KERNEL-0887',
    version: '1.0.887',
    entropyBand: [0.984444, 0.985556],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.755000,
        bias: 0.030000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.114000,
        gain: 1.180000,
        branches: 7,
      },
      perpendicular: {
        coupling: 0.960000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0888': {
    id: 'KERNEL-0888',
    version: '1.0.888',
    entropyBand: [0.985556, 0.986667],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.790000,
        bias: 0.045000,
        damping: 0.026000,
      },
      exponential: {
        base: 1.122000,
        gain: 1.240000,
        branches: 8,
      },
      perpendicular: {
        coupling: 0.990000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0889': {
    id: 'KERNEL-0889',
    version: '1.0.889',
    entropyBand: [0.986667, 0.987778],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.825000,
        bias: 0.060000,
        damping: 0.030000,
      },
      exponential: {
        base: 1.130000,
        gain: 1.300000,
        branches: 2,
      },
      perpendicular: {
        coupling: 1.020000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0890': {
    id: 'KERNEL-0890',
    version: '1.0.890',
    entropyBand: [0.987778, 0.988889],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 0.860000,
        bias: 0.075000,
        damping: 0.034000,
      },
      exponential: {
        base: 1.138000,
        gain: 1.360000,
        branches: 3,
      },
      perpendicular: {
        coupling: 1.050000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0891': {
    id: 'KERNEL-0891',
    version: '1.0.891',
    entropyBand: [0.988889, 0.990000],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 0.895000,
        bias: -0.075000,
        damping: 0.038000,
      },
      exponential: {
        base: 1.146000,
        gain: 1.420000,
        branches: 4,
      },
      perpendicular: {
        coupling: 1.080000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
  'KERNEL-0892': {
    id: 'KERNEL-0892',
    version: '1.0.892',
    entropyBand: [0.990000, 0.991111],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 0.930000,
        bias: -0.060000,
        damping: 0.042000,
      },
      exponential: {
        base: 1.154000,
        gain: 1.480000,
        branches: 5,
      },
      perpendicular: {
        coupling: 1.110000,
      },
      centerfold: {
        linearWeight: 0.270000,
        exponentialWeight: 0.330000,
        perpendicularWeight: 0.400000,
      },
    },
  },
  'KERNEL-0893': {
    id: 'KERNEL-0893',
    version: '1.0.893',
    entropyBand: [0.991111, 0.992222],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 0.965000,
        bias: -0.045000,
        damping: 0.046000,
      },
      exponential: {
        base: 1.010000,
        gain: 1.540000,
        branches: 6,
      },
      perpendicular: {
        coupling: 1.140000,
      },
      centerfold: {
        linearWeight: 0.290000,
        exponentialWeight: 0.350000,
        perpendicularWeight: 0.360000,
      },
    },
  },
  'KERNEL-0894': {
    id: 'KERNEL-0894',
    version: '1.0.894',
    entropyBand: [0.992222, 0.993333],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.000000,
        bias: -0.030000,
        damping: 0.050000,
      },
      exponential: {
        base: 1.018000,
        gain: 1.600000,
        branches: 7,
      },
      perpendicular: {
        coupling: 1.170000,
      },
      centerfold: {
        linearWeight: 0.310000,
        exponentialWeight: 0.370000,
        perpendicularWeight: 0.320000,
      },
    },
  },
  'KERNEL-0895': {
    id: 'KERNEL-0895',
    version: '1.0.895',
    entropyBand: [0.993333, 0.994444],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.035000,
        bias: -0.015000,
        damping: 0.054000,
      },
      exponential: {
        base: 1.026000,
        gain: 1.660000,
        branches: 8,
      },
      perpendicular: {
        coupling: 1.200000,
      },
      centerfold: {
        linearWeight: 0.330000,
        exponentialWeight: 0.390000,
        perpendicularWeight: 0.280000,
      },
    },
  },
  'KERNEL-0896': {
    id: 'KERNEL-0896',
    version: '1.0.896',
    entropyBand: [0.994444, 0.995556],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.070000,
        bias: 0.000000,
        damping: 0.058000,
      },
      exponential: {
        base: 1.034000,
        gain: 1.720000,
        branches: 2,
      },
      perpendicular: {
        coupling: 1.230000,
      },
      centerfold: {
        linearWeight: 0.350000,
        exponentialWeight: 0.410000,
        perpendicularWeight: 0.240000,
      },
    },
  },
  'KERNEL-0897': {
    id: 'KERNEL-0897',
    version: '1.0.897',
    entropyBand: [0.995556, 0.996667],
    ring: 'exponential-branch',
    overrides: {
      linear: {
        slope: 1.105000,
        bias: 0.015000,
        damping: 0.010000,
      },
      exponential: {
        base: 1.042000,
        gain: 0.400000,
        branches: 3,
      },
      perpendicular: {
        coupling: 1.260000,
      },
      centerfold: {
        linearWeight: 0.370000,
        exponentialWeight: 0.250000,
        perpendicularWeight: 0.380000,
      },
    },
  },
  'KERNEL-0898': {
    id: 'KERNEL-0898',
    version: '1.0.898',
    entropyBand: [0.996667, 0.997778],
    ring: 'perpendicular-cross',
    overrides: {
      linear: {
        slope: 1.140000,
        bias: 0.030000,
        damping: 0.014000,
      },
      exponential: {
        base: 1.050000,
        gain: 0.460000,
        branches: 4,
      },
      perpendicular: {
        coupling: 1.290000,
      },
      centerfold: {
        linearWeight: 0.390000,
        exponentialWeight: 0.270000,
        perpendicularWeight: 0.340000,
      },
    },
  },
  'KERNEL-0899': {
    id: 'KERNEL-0899',
    version: '1.0.899',
    entropyBand: [0.997778, 0.998889],
    ring: 'centerfold-core',
    overrides: {
      linear: {
        slope: 1.175000,
        bias: 0.045000,
        damping: 0.018000,
      },
      exponential: {
        base: 1.058000,
        gain: 0.520000,
        branches: 5,
      },
      perpendicular: {
        coupling: 0.450000,
      },
      centerfold: {
        linearWeight: 0.410000,
        exponentialWeight: 0.290000,
        perpendicularWeight: 0.300000,
      },
    },
  },
  'KERNEL-0900': {
    id: 'KERNEL-0900',
    version: '1.0.900',
    entropyBand: [0.998889, 1.000000],
    ring: 'linear-axis',
    overrides: {
      linear: {
        slope: 1.210000,
        bias: 0.060000,
        damping: 0.022000,
      },
      exponential: {
        base: 1.066000,
        gain: 0.580000,
        branches: 6,
      },
      perpendicular: {
        coupling: 0.480000,
      },
      centerfold: {
        linearWeight: 0.250000,
        exponentialWeight: 0.310000,
        perpendicularWeight: 0.440000,
      },
    },
  },
};

const CENTERFOLD_DEFAULT_KERNEL_ID = 'KERNEL-0450';

function selectKernel(bank, kernelId) {
  const catalog = bank?.catalog || {};
  if (kernelId && catalog[kernelId]) return catalog[kernelId];
  return bank?.default || catalog[CENTERFOLD_DEFAULT_KERNEL_ID];
}

function selectKernelByEntropy(bank, entropy = 0) {
  const catalog = Object.values(bank?.catalog || {});
  if (!catalog.length) return null;

  for (const kernel of catalog) {
    const [min, max] = kernel.entropyBand || [0, 1];
    if (entropy >= min && entropy <= max) {
      return kernel;
    }
  }

  if (entropy < 0) return catalog[0];
  return catalog[catalog.length - 1];
}

const CENTERFOLD_KERNEL_BANK = {
  catalog: CENTERFOLD_KERNEL_CATALOG,
  default: CENTERFOLD_KERNEL_CATALOG[CENTERFOLD_DEFAULT_KERNEL_ID],
};

export {
  CENTERFOLD_DEFAULT_KERNEL_ID,
  CENTERFOLD_KERNEL_CATALOG,
  CENTERFOLD_KERNEL_BANK,
  selectKernel,
  selectKernelByEntropy,
};

export default CENTERFOLD_KERNEL_BANK;
