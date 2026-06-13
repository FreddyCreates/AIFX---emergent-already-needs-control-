# Tokenomics Engine

**Location:** `sdk/engines/tokenomics/`
**Record ID:** MSIT-RP-2026-008
**Status:** Implemented

Runtime engine for cognitive resource allocation in AI agents. Measures and governs token expenditure through Cognitive Return Per Token (CRPT).

## Modules

| Module | File | Function |
|--------|------|----------|
| Token Governor | `token-governor.js` | Controls max token budget by task type |
| Salience Engine | `salience-engine.js` | Ranks what deserves attention |
| Cognitive Return Scorer | `cognitive-return-scorer.js` | Scores output usefulness |
| Compression Auditor | `compression-auditor.js` | Audits meaning preservation |
| Waste Detector | `waste-detector.js` | Flags redundancy and filler |
| Reuse Extractor | `reuse-extractor.js` | Extracts rules/templates/memory |
| Benchmark Harness | `benchmark-harness.js` | Tokenomic vs non-tokenomic comparisons |
| Tokenomics Engine | `tokenomics-engine.js` | Full runtime loop orchestrator |

## Core Formulas

```
TV = DQ + ACT + RISK + REUSE + LEARN − WASTE
CRPT = TV / Tokens
S = α·U + β·R + γ·M + δ·T + ε·N − ζ·K
Budget_i = TotalBudget · (S_i / ΣS)
CE = (MeaningPreserved + ActionClarity + RiskPreserved) / OutputTokens
```

## Tests

```bash
node --test test/sdk/tokenomics-engine.test.js
```
