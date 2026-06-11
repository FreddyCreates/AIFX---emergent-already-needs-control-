/**
 * AIFX Constants — Global exchange registry, regulatory frameworks,
 * and foundation model configuration.
 *
 * @module @medina/aifx-foundation-model/constants
 */

/** PHI golden ratio used in harmonic pattern detection */
export const PHI = 1.618033988749895;

/** Foundation model configuration */
export const AIFX_CONFIG = {
  modelId: 'aifx-foundation-v1',
  modelFamily: 'AIFX',
  intelligenceClass: 'Financial Market Foundation Intelligence',
  version: '1.0.0',
  contextWindow: '256K ticks',
  modalities: ['tick-data', 'ohlcv', 'order-book', 'time-and-sales', 'chart-patterns', 'volume-profile'],
  parameterClass: 'Foundation (multi-head attention over temporal financial data)',
  routingPriority: 'P0 — financial alpha',
  wireProtocol: 'intelligence-wire/aifx',
  engineStatus: 'active',
  ringAffinity: 'Build Ring',
  organismPlacement: 'Organism core / financial intelligence layer',
};

/** All supported global exchanges */
export const SUPPORTED_EXCHANGES = {
  // Equities
  NYSE: { id: 'NYSE', name: 'New York Stock Exchange', region: 'US', assetClass: 'equities', mic: 'XNYS' },
  NASDAQ: { id: 'NASDAQ', name: 'NASDAQ', region: 'US', assetClass: 'equities', mic: 'XNAS' },
  LSE: { id: 'LSE', name: 'London Stock Exchange', region: 'EU', assetClass: 'equities', mic: 'XLON' },
  TSE: { id: 'TSE', name: 'Tokyo Stock Exchange', region: 'APAC', assetClass: 'equities', mic: 'XJPX' },
  HKEX: { id: 'HKEX', name: 'Hong Kong Exchange', region: 'APAC', assetClass: 'equities', mic: 'XHKG' },
  SSE: { id: 'SSE', name: 'Shanghai Stock Exchange', region: 'APAC', assetClass: 'equities', mic: 'XSHG' },
  SZSE: { id: 'SZSE', name: 'Shenzhen Stock Exchange', region: 'APAC', assetClass: 'equities', mic: 'XSHE' },
  EUREX: { id: 'EUREX', name: 'Eurex', region: 'EU', assetClass: 'derivatives', mic: 'XEUR' },
  ASX: { id: 'ASX', name: 'Australian Securities Exchange', region: 'APAC', assetClass: 'equities', mic: 'XASX' },
  TSX: { id: 'TSX', name: 'Toronto Stock Exchange', region: 'NA', assetClass: 'equities', mic: 'XTSE' },
  BSE: { id: 'BSE', name: 'Bombay Stock Exchange', region: 'APAC', assetClass: 'equities', mic: 'XBOM' },
  NSE_INDIA: { id: 'NSE_INDIA', name: 'National Stock Exchange of India', region: 'APAC', assetClass: 'equities', mic: 'XNSE' },

  // Forex
  EBS: { id: 'EBS', name: 'EBS (ICAP)', region: 'GLOBAL', assetClass: 'forex', mic: 'EBSF' },
  REUTERS: { id: 'REUTERS', name: 'Reuters Matching', region: 'GLOBAL', assetClass: 'forex', mic: 'RTMH' },
  CURRENEX: { id: 'CURRENEX', name: 'Currenex', region: 'GLOBAL', assetClass: 'forex', mic: 'CRNX' },

  // Futures & Commodities
  CME: { id: 'CME', name: 'Chicago Mercantile Exchange', region: 'US', assetClass: 'futures', mic: 'XCME' },
  CBOT: { id: 'CBOT', name: 'Chicago Board of Trade', region: 'US', assetClass: 'futures', mic: 'XCBT' },
  NYMEX: { id: 'NYMEX', name: 'New York Mercantile Exchange', region: 'US', assetClass: 'futures', mic: 'XNYM' },
  ICE: { id: 'ICE', name: 'Intercontinental Exchange', region: 'GLOBAL', assetClass: 'futures', mic: 'IFEU' },
  LME: { id: 'LME', name: 'London Metal Exchange', region: 'EU', assetClass: 'commodities', mic: 'XLME' },

  // Crypto
  BINANCE: { id: 'BINANCE', name: 'Binance', region: 'GLOBAL', assetClass: 'crypto', mic: 'BINA' },
  COINBASE: { id: 'COINBASE', name: 'Coinbase', region: 'US', assetClass: 'crypto', mic: 'COIN' },
  KRAKEN: { id: 'KRAKEN', name: 'Kraken', region: 'GLOBAL', assetClass: 'crypto', mic: 'KRKN' },
  DERIBIT: { id: 'DERIBIT', name: 'Deribit', region: 'GLOBAL', assetClass: 'crypto-derivatives', mic: 'DRBT' },

  // Options
  CBOE: { id: 'CBOE', name: 'Chicago Board Options Exchange', region: 'US', assetClass: 'options', mic: 'XCBO' },
};

/** Regulatory frameworks and compliance charters */
export const REGULATORY_FRAMEWORKS = {
  // US Regulation
  SEC: {
    id: 'SEC',
    name: 'Securities and Exchange Commission',
    jurisdiction: 'US',
    scope: ['equities', 'options', 'etfs'],
    mandates: ['Reg NMS', 'Reg SHO', 'Rule 606', 'CAT Reporting', 'Form 13F', 'Reg ATS'],
  },
  CFTC: {
    id: 'CFTC',
    name: 'Commodity Futures Trading Commission',
    jurisdiction: 'US',
    scope: ['futures', 'swaps', 'commodities'],
    mandates: ['Dodd-Frank', 'Position Limits', 'Swap Reporting', 'Large Trader Reporting'],
  },
  FINRA: {
    id: 'FINRA',
    name: 'Financial Industry Regulatory Authority',
    jurisdiction: 'US',
    scope: ['broker-dealers', 'equities', 'bonds'],
    mandates: ['TRACE', 'OATS', 'Best Execution', 'Suitability', 'AML Compliance'],
  },
  NFA: {
    id: 'NFA',
    name: 'National Futures Association',
    jurisdiction: 'US',
    scope: ['futures', 'forex', 'swaps'],
    mandates: ['FOREX Dealer Requirements', 'CPO/CTA Registration', 'Customer Protection'],
  },

  // EU Regulation
  ESMA: {
    id: 'ESMA',
    name: 'European Securities and Markets Authority',
    jurisdiction: 'EU',
    scope: ['equities', 'derivatives', 'funds'],
    mandates: ['MiFID II', 'MiFIR', 'EMIR', 'MAR', 'SFTR', 'CSDR'],
  },
  FCA: {
    id: 'FCA',
    name: 'Financial Conduct Authority',
    jurisdiction: 'UK',
    scope: ['equities', 'derivatives', 'forex', 'crypto'],
    mandates: ['FCA Handbook', 'SM&CR', 'Consumer Duty', 'Transaction Reporting'],
  },

  // APAC Regulation
  FSA_JAPAN: {
    id: 'FSA_JAPAN',
    name: 'Financial Services Agency (Japan)',
    jurisdiction: 'JP',
    scope: ['equities', 'derivatives', 'crypto'],
    mandates: ['FIEA', 'Payment Services Act', 'Crypto Asset Exchange Registration'],
  },
  SFC: {
    id: 'SFC',
    name: 'Securities and Futures Commission (HK)',
    jurisdiction: 'HK',
    scope: ['equities', 'futures', 'crypto'],
    mandates: ['SFO', 'Type 1-9 Licensing', 'Virtual Asset Trading'],
  },
  MAS: {
    id: 'MAS',
    name: 'Monetary Authority of Singapore',
    jurisdiction: 'SG',
    scope: ['equities', 'derivatives', 'crypto', 'forex'],
    mandates: ['SFA', 'Payment Services Act', 'Technology Risk Management'],
  },

  // Global Standards
  IOSCO: {
    id: 'IOSCO',
    name: 'International Organization of Securities Commissions',
    jurisdiction: 'GLOBAL',
    scope: ['all'],
    mandates: ['Principles of Securities Regulation', 'CPMI-IOSCO PFMIs', 'Cross-border Cooperation'],
  },
  FATF: {
    id: 'FATF',
    name: 'Financial Action Task Force',
    jurisdiction: 'GLOBAL',
    scope: ['all'],
    mandates: ['AML/CFT', 'Travel Rule', 'Risk-Based Approach', 'Virtual Asset Guidelines'],
  },
  BASEL: {
    id: 'BASEL',
    name: 'Basel Committee on Banking Supervision',
    jurisdiction: 'GLOBAL',
    scope: ['banking', 'capital-markets'],
    mandates: ['Basel III', 'FRTB', 'Market Risk Framework', 'Operational Risk'],
  },
};

/** Chart timeframes for multi-resolution analysis */
export const TIMEFRAMES = {
  TICK: 'tick',
  S1: '1s',
  S5: '5s',
  S15: '15s',
  S30: '30s',
  M1: '1m',
  M5: '5m',
  M15: '15m',
  M30: '30m',
  H1: '1h',
  H4: '4h',
  D1: '1d',
  W1: '1w',
  MN: '1M',
};

/** Asset classes AIFX can analyze */
export const ASSET_CLASSES = [
  'equities',
  'forex',
  'futures',
  'options',
  'commodities',
  'crypto',
  'crypto-derivatives',
  'bonds',
  'etfs',
  'indices',
  'swaps',
];
