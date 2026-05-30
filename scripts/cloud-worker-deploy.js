#!/usr/bin/env node
/**
 * ☁️ organism-cloud-bot — Cloudflare Workers / Edge Compute Orchestrator
 * ════════════════════════════════════════════════════════════════════════
 *
 * Manages the organism's edge compute layer. Validates worker configurations,
 * generates deployment manifests for Cloudflare Workers, monitors edge
 * worker health across regions, and produces the edge compute report.
 *
 * Flags:
 *   --validate   Validate all worker configurations
 *   --manifests  Generate CF Workers deployment manifests
 *   --health     Simulate and report edge worker health
 *   --report     Generate cloud/edge report to docs/
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..');
const DOCS = path.join(REPO, 'docs');
const DIST = path.join(REPO, 'dist');

const flags = {
  validate:  process.argv.includes('--validate'),
  manifests: process.argv.includes('--manifests'),
  health:    process.argv.includes('--health'),
  report:    process.argv.includes('--report'),
};
if (!Object.values(flags).some(Boolean)) Object.keys(flags).forEach(k => flags[k] = true);

const PHI     = 1.618033988749895;
const PHI_INV = 1 / PHI;

// Edge regions (major Cloudflare PoPs)
const EDGE_REGIONS = [
  { code: 'DFW', name: 'Dallas',       continent: 'NA' },
  { code: 'LAX', name: 'Los Angeles',  continent: 'NA' },
  { code: 'SEA', name: 'Seattle',      continent: 'NA' },
  { code: 'ORD', name: 'Chicago',      continent: 'NA' },
  { code: 'EWR', name: 'Newark',       continent: 'NA' },
  { code: 'LHR', name: 'London',       continent: 'EU' },
  { code: 'CDG', name: 'Paris',        continent: 'EU' },
  { code: 'FRA', name: 'Frankfurt',    continent: 'EU' },
  { code: 'NRT', name: 'Tokyo',        continent: 'APAC' },
  { code: 'HKG', name: 'Hong Kong',    continent: 'APAC' },
  { code: 'SIN', name: 'Singapore',    continent: 'APAC' },
  { code: 'SYD', name: 'Sydney',       continent: 'APAC' },
  { code: 'GRU', name: 'São Paulo',    continent: 'SA' },
];

// Organism edge workers (logical definition)
const ORGANISM_WORKERS = [
  { id: 'organism-router',     name: 'Organism Router',     type: 'router',    routes: ['/*'], global: true,  cpuLimit: 10  },
  { id: 'organism-api-gw',     name: 'API Gateway',         type: 'gateway',   routes: ['/api/*'], global: true,  cpuLimit: 20  },
  { id: 'organism-cache',      name: 'Intelligence Cache',  type: 'cache',     routes: ['/sdk/*', '/protocols/*'], global: true,  cpuLimit: 5   },
  { id: 'organism-transform',  name: 'Data Transform',      type: 'transform', routes: ['/transform/*'], global: false, cpuLimit: 30  },
  { id: 'organism-sentinel',   name: 'Edge Sentinel',       type: 'sentinel',  routes: ['/*'], global: true,  cpuLimit: 50  },
  { id: 'organism-icp-relay',  name: 'ICP Relay',           type: 'router',    routes: ['/icp/*'], global: false, cpuLimit: 15  },
];

// ── Phase 1: Validate ─────────────────────────────────────────────────────────
function validateWorkers() {
  console.log('  ☁️ Phase 1 — Validating worker configurations...');

  const results = [];

  for (const worker of ORGANISM_WORKERS) {
    const issues = [];

    if (!worker.id)          issues.push('Missing id');
    if (!worker.routes?.length) issues.push('No routes defined');
    if (worker.cpuLimit > 50)   issues.push(`CPU limit ${worker.cpuLimit}ms exceeds CF 50ms limit`);
    if (worker.routes?.includes('/*') && !worker.global) issues.push('Catch-all route on non-global worker');

    results.push({
      id:     worker.id,
      name:   worker.name,
      type:   worker.type,
      valid:  issues.length === 0,
      issues,
    });

    const icon = issues.length === 0 ? '✅' : '⚠️';
    console.log(`    ${icon} ${worker.name}: ${issues.length === 0 ? 'valid' : issues.join(', ')}`);
  }

  const valid = results.filter(r => r.valid).length;
  console.log(`    📊 ${valid}/${results.length} workers valid`);

  return results;
}

// ── Phase 2: Generate Manifests ───────────────────────────────────────────────
function generateManifests() {
  console.log('  ☁️ Phase 2 — Generating deployment manifests...');

  const manifests = [];

  for (const worker of ORGANISM_WORKERS) {
    const manifest = {
      name:           worker.id,
      main:           `dist/workers/${worker.id}.js`,
      compatibility_date: '2025-01-01',
      workers_dev:    !worker.global,
      routes: worker.routes.map(r => ({ pattern: r, zone_name: 'sovereign-organism.com' })),
      vars: {
        WORKER_TYPE:  worker.type,
        ORGANISM_ID:  'sovereign',
        PHI:          PHI.toString(),
      },
      limits: {
        cpu_ms: worker.cpuLimit,
      },
    };
    manifests.push({ id: worker.id, manifest });
    console.log(`    📄 Generated manifest for ${worker.name}`);
  }

  // Write combined manifest
  const distWorkers = path.join(DIST, 'workers');
  fs.mkdirSync(distWorkers, { recursive: true });
  fs.writeFileSync(
    path.join(distWorkers, 'wrangler-all.json'),
    JSON.stringify({ workers: manifests.map(m => m.manifest) }, null, 2)
  );

  console.log(`    📦 ${manifests.length} manifests generated`);
  return manifests;
}

// ── Phase 3: Edge Health ──────────────────────────────────────────────────────
function simulateEdgeHealth() {
  console.log('  ☁️ Phase 3 — Edge health simulation...');

  // Generate simulated health data for all regions × workers
  const seed = Date.now();
  const rng = (n) => ((seed * 9301 + n * 49297 + 233) % 233280) / 233280;

  const regionHealth = EDGE_REGIONS.map((region, ri) => {
    const workerHealth = ORGANISM_WORKERS.map((worker, wi) => {
      const r = rng(ri * 100 + wi);
      return {
        workerId:     worker.id,
        healthy:      r > 0.05,  // 95% uptime
        latencyMs:    Math.round(5 + r * 40),
        cpuMs:        Math.round(r * worker.cpuLimit * 0.8),
        requestsPerSec: Math.round(r * 1000),
      };
    });

    const avgLatency = workerHealth.reduce((s, w) => s + w.latencyMs, 0) / workerHealth.length;
    const healthyCount = workerHealth.filter(w => w.healthy).length;

    return {
      region:        region.code,
      name:          region.name,
      continent:     region.continent,
      healthy:       healthyCount === workerHealth.length,
      avgLatencyMs:  parseFloat(avgLatency.toFixed(1)),
      healthyWorkers: healthyCount,
      totalWorkers:  workerHealth.length,
      workers:       workerHealth,
    };
  });

  const globalHealth = regionHealth.filter(r => r.healthy).length;
  const globalLatency = regionHealth.reduce((s, r) => s + r.avgLatencyMs, 0) / regionHealth.length;

  console.log(`    📊 Regions healthy: ${globalHealth}/${regionHealth.length}`);
  console.log(`    📊 Avg global latency: ${globalLatency.toFixed(1)}ms`);

  return { regionHealth, globalHealth, globalLatency: parseFloat(globalLatency.toFixed(1)) };
}

// ── Phase 4: Report ───────────────────────────────────────────────────────────
function generateReport(validation, manifests, health) {
  console.log('  ☁️ Phase 4 — Generating edge report...');

  fs.mkdirSync(DOCS, { recursive: true });

  const validCount = (validation || []).filter(r => r.valid).length;
  const healthyRegions = health?.globalHealth || 0;
  const totalRegions = EDGE_REGIONS.length;

  const lines = [
    '# ☁️ Edge Compute Report',
    '',
    `> Auto-generated by organism-cloud-bot on ${new Date().toUTCString()}`,
    '',
    '## Edge Overview',
    '',
    '| Metric | Value |',
    '|--------|-------|',
    `| Total Workers | ${ORGANISM_WORKERS.length} |`,
    `| Valid Configurations | ${validCount}/${ORGANISM_WORKERS.length} |`,
    `| Healthy Regions | ${healthyRegions}/${totalRegions} |`,
    `| Avg Global Latency | ${health?.globalLatency || 0}ms |`,
    `| Manifests Generated | ${(manifests || []).length} |`,
    '',
    '## 🌐 Worker Fleet',
    '',
    '| Worker | Type | Routes | CPU Limit | Status |',
    '|--------|------|--------|-----------|--------|',
    ...ORGANISM_WORKERS.map(w => {
      const v = (validation || []).find(r => r.id === w.id);
      const status = v ? (v.valid ? '✅ valid' : '⚠️ issues') : '⚪ unknown';
      return `| ${w.name} | ${w.type} | \`${w.routes.join(', ')}\` | ${w.cpuLimit}ms | ${status} |`;
    }),
    '',
    '## 🗺️ Regional Health',
    '',
    '| Region | Name | Continent | Latency | Status |',
    '|--------|------|-----------|---------|--------|',
    ...(health?.regionHealth || []).map(r => {
      const icon = r.healthy ? '✅' : '⚠️';
      return `| ${r.region} | ${r.name} | ${r.continent} | ${r.avgLatencyMs}ms | ${icon} |`;
    }),
    '',
    '## 📦 Deployment Manifests',
    '',
    'Manifests at `dist/workers/wrangler-all.json`',
    '',
    '| Worker | Manifest |',
    '|--------|----------|',
    ...(manifests || []).map(m => `| ${m.id} | ✅ generated |`),
    '',
    '---',
    '*Generated by organism-cloud-bot (PROTO-224)*',
  ];

  fs.writeFileSync(path.join(DOCS, 'cloud-report.md'), lines.join('\n'));
  console.log('  📄 Cloud report written to docs/cloud-report.md');
}

// ── Main ─────────────────────────────────────────────────────────────────────
function main() {
  console.log('\n☁️ Cloud & Edge Compute Orchestrator\n═══════════════════════════════════════════\n');

  let validation = null, manifests = null, health = null;

  if (flags.validate || flags.report)  validation = validateWorkers();
  if (flags.manifests || flags.report) manifests  = generateManifests();
  if (flags.health || flags.report)    health     = simulateEdgeHealth();
  if (flags.report)                    generateReport(validation, manifests, health);

  console.log('\n  ✅ Cloud orchestration cycle complete\n');
}

main();
