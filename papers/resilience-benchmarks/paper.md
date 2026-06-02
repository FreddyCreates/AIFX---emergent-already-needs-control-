# Resilience Benchmarks for Governed Agentic Systems

**Subtitle:** Poisoning Resistance, Boundary Leakage, Rollback Integrity, and Promotion Throughput  
**Record ID:** MSIT-RP-2026-007  
**Version:** v1.0 internal markdown  

## Abstract
This note defines four resilience measurements for governed agentic systems: poisoning resistance, boundary leakage, rollback integrity, and promotion throughput. It also documents a strict CPL-L sandbox rule set for law evaluation that rejects unsafe `when` expressions and exposes rejection telemetry for auditing and benchmark instrumentation.

## 1. Benchmark Surface
The benchmark harness lives at `sdk/resilience/resilience-bench.js` and emits a single JSON report with:
- `poisoningResistance`
- `boundaryLeakage`
- `rollbackIntegrity`
- `promotionThroughput`

The CLI wrapper is `scripts/resilience-bench.js`.

## 2. Poisoning Resistance
Goal: inject tagged false claims into a foundation output stream and measure how many persist into the memory runtime. In the harness, false claims are tagged as `FALSE_CLAIM:` and stored via the memory consolidation protocol, then counted across memory tiers.

## 3. Boundary Leakage
Goal: stress-test release enforcement under prompt injection. The harness probes whether a law expression can reference forbidden runtime globals (e.g. `process`). Under strict sandbox enforcement, such expressions are rejected and cannot trigger governance actions.

## 4. Rollback Integrity
Goal: corrupt a lineage branch and measure recovery time while preserving ancestry. The harness constructs a small fork/merge lineage, corrupts parent pointers, and reconstructs lineage adjacency from remaining graph edges.

## 5. Promotion Throughput
Goal: measure hypotheses/min under different authority friction levels. The harness models friction as repeated governance evaluations per hypothesis (0/1/5), then computes throughput and promotion rates.

## 6. Strict Sandbox Policy
The CPL-L engine defaults to a strict sandbox that rejects unsafe `when` expressions and records telemetry for rejected expressions. This is intended to reduce boundary leakage risk from injected or malformed law expressions.

