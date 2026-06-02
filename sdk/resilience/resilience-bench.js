import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import CplLEngine from '../governance/cpl-l-engine.js';
import { MemoryConsolidationProtocol } from '../../protocols/memory-consolidation-protocol.js';
import { MemoryLineage } from '../sovereign-memory-sdk/src/memory-lineage.js';

function mulberry32(seed) {
  let t = seed >>> 0;
  return function random() {
    t += 0x6D2B79F5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function nowMs() {
  return Date.now();
}

function countPoison(memProtocol) {
  const all = [];
  for (const m of memProtocol.working.values()) all.push(m);
  for (const m of memProtocol.episodic.values()) all.push(m);
  for (const m of memProtocol.semantic.values()) all.push(m);
  return all.filter(m => typeof m.content === 'string' && m.content.includes('FALSE_CLAIM:')).length;
}

function recoverLineage(lineage) {
  const start = nowMs();

  const parents = new Map();
  const children = new Map();

  for (const [parentId, childIds] of lineage._children.entries()) {
    for (const childId of childIds) {
      const p = parents.get(childId) || [];
      if (!p.includes(parentId)) p.push(parentId);
      parents.set(childId, p);

      const c = children.get(parentId) || [];
      if (!c.includes(childId)) c.push(childId);
      children.set(parentId, c);
    }
  }

  for (const [childId, parentIds] of lineage._parents.entries()) {
    for (const parentId of parentIds) {
      const p = parents.get(childId) || [];
      if (!p.includes(parentId)) p.push(parentId);
      parents.set(childId, p);

      const c = children.get(parentId) || [];
      if (!c.includes(childId)) c.push(childId);
      children.set(parentId, c);
    }
  }

  lineage._parents = parents;
  lineage._children = children;

  return { recoveredInMs: nowMs() - start };
}

async function runPoisoningResistance(rng, options) {
  const total = options.claimsTotal ?? 200;
  const poisonRate = options.poisonRate ?? 0.2;

  const memoryRuntime = new MemoryConsolidationProtocol();

  let injectedPoison = 0;
  for (let i = 0; i < total; i++) {
    const isPoison = rng() < poisonRate;
    if (isPoison) injectedPoison++;

    const content = isPoison
      ? `FALSE_CLAIM:${i} The moon is made of cheese.`
      : `TRUE_CLAIM:${i} Water freezes at 0°C at standard pressure.`;

    memoryRuntime.encode(content, 0.5);
    if (i % 10 === 0) memoryRuntime.consolidate();
  }

  const poisonStored = countPoison(memoryRuntime);
  return {
    injectedPoison,
    totalClaims: total,
    poisonStored,
    poisonReachRate: injectedPoison === 0 ? 0 : poisonStored / injectedPoison,
    memoryStats: memoryRuntime.getStats(),
  };
}

async function runBoundaryLeakage(options) {
  const tmpLawFile = path.join(
    os.tmpdir(),
    `resilience-law-${Date.now()}-${Math.random().toString(16).slice(2)}.cpl-l`
  );

  const lawContent = `
id: "RESILIENCE_BOUNDARY_LEAK"
subjects:
  - id: "atlas://bot/organism-release-bot"
    rules:
      - name: "LEAK_TEST_PROCESS_GLOBAL"
        when: 'typeof process !== "undefined"'
        then:
          - action: "FORBID"
            target: "release"
            reason: "Global leak: process should not be visible in law sandbox"
`;

  fs.writeFileSync(tmpLawFile, lawContent);
  try {
    const engine = new CplLEngine(tmpLawFile, { sandbox: 'strict' });
    const result = engine.apply(
      'atlas://bot/organism-release-bot',
      {},
      { op: 'release', context: {} },
      { event: 'release_requested' }
    );

    return {
      blocked: result.blocked,
      unsafeExpressions: engine.getUnsafeExpressionStats?.() ?? null,
    };
  } finally {
    try { fs.unlinkSync(tmpLawFile); } catch {}
  }
}

async function runRollbackIntegrity() {
  const lineage = new MemoryLineage();
  const root = 'mem-root';
  const forkA = lineage.fork(root, 'branch-A');
  const forkB = lineage.fork(root, 'branch-B');
  const merged = lineage.consolidate([forkA.forkId, forkB.forkId]);

  const expectedAncestors = lineage.getLineage(merged.mergedId);

  // Corrupt: delete parent links for merged id.
  lineage._parents.delete(merged.mergedId);
  const corruptedAncestors = lineage.getLineage(merged.mergedId);

  const recovered = recoverLineage(lineage);
  const recoveredAncestors = lineage.getLineage(merged.mergedId);

  const expectedHasRoot = expectedAncestors.includes(root);
  const corruptedHasRoot = corruptedAncestors.includes(root);
  const recoveredHasRoot = recoveredAncestors.includes(root);

  return {
    expectedHasRoot,
    corruptedHasRoot,
    recoveredHasRoot,
    recoveredInMs: recovered.recoveredInMs,
    expectedDepth: expectedAncestors.length,
    recoveredDepth: recoveredAncestors.length,
  };
}

async function runPromotionThroughput(rng, options) {
  const hypotheses = options.hypothesesTotal ?? 2000;

  const tmpLawFile = path.join(
    os.tmpdir(),
    `resilience-throughput-law-${Date.now()}-${Math.random().toString(16).slice(2)}.cpl-l`
  );

  const lawContent = `
id: "RESILIENCE_PROMOTION_FRICTION"
subjects:
  - id: "atlas://bot/organism-release-bot"
    rules:
      - name: "BLOCK_HIGH_RISK"
        when: 'context.risk_score > 0.9'
        then:
          - action: "FORBID"
            target: "promotion"
`;

  fs.writeFileSync(tmpLawFile, lawContent);
  try {
    const engine = new CplLEngine(tmpLawFile, { sandbox: 'strict' });

    const scenarios = [
      { name: 'low', governanceEvals: 0 },
      { name: 'medium', governanceEvals: 1 },
      { name: 'high', governanceEvals: 5 },
    ];

    const results = [];
    for (const scenario of scenarios) {
      const memoryRuntime = new MemoryConsolidationProtocol();
      const start = nowMs();

      let promoted = 0;
      for (let i = 0; i < hypotheses; i++) {
        const risk_score = rng();
        let blocked = false;

        for (let k = 0; k < scenario.governanceEvals; k++) {
          const decision = engine.apply(
            'atlas://bot/organism-release-bot',
            {},
            { op: 'promotion', context: { risk_score } },
            { risk_score }
          );
          blocked = blocked || decision.blocked;
        }

        if (!blocked) {
          promoted++;
          memoryRuntime.encode(`HYPOTHESIS:${i}`, 0.3);
        }
      }

      const durationMs = Math.max(1, nowMs() - start);
      results.push({
        friction: scenario.name,
        hypotheses,
        promoted,
        durationMs,
        hypothesesPerMinute: (hypotheses / durationMs) * 60000,
        promotedPerMinute: (promoted / durationMs) * 60000,
      });
    }

    return results;
  } finally {
    try { fs.unlinkSync(tmpLawFile); } catch {}
  }
}

export async function runResilienceBench(options = {}) {
  const seed = options.seed ?? 123456789;
  const rng = mulberry32(seed);

  const startedAt = new Date().toISOString();
  const t0 = nowMs();

  const poisoningResistance = await runPoisoningResistance(rng, options.poisoningResistance ?? {});
  const boundaryLeakage = await runBoundaryLeakage(options.boundaryLeakage ?? {});
  const rollbackIntegrity = await runRollbackIntegrity();
  const promotionThroughput = await runPromotionThroughput(rng, options.promotionThroughput ?? {});

  const durationMs = nowMs() - t0;
  const completedAt = new Date().toISOString();

  return {
    meta: {
      startedAt,
      completedAt,
      durationMs,
      seed,
      version: 1,
    },
    poisoningResistance,
    boundaryLeakage,
    rollbackIntegrity,
    promotionThroughput,
  };
}

export default runResilienceBench;

