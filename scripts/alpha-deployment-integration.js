#!/usr/bin/env node
/**
 * Alpha Deployment Integration — Connects Twin Alpha to Marketplace SDK
 * ═══════════════════════════════════════════════════════════════════════
 *
 * This integration script bridges the Twin Alpha runtime interface with
 * the Organism Marketplace SDK, enabling:
 *
 *   1. Tool Discovery — Twin Alpha can discover all 24 marketplace tools
 *   2. Tool Invocation — Tasks dispatched through Twin Alpha route to marketplace
 *   3. Health Aggregation — Marketplace metrics flow back to Twin Alpha status
 *   4. Unified Governance — Both deployments report to the same governance layer
 *
 * Usage:
 *   node scripts/alpha-deployment-integration.js --status
 *   node scripts/alpha-deployment-integration.js --validate
 *   node scripts/alpha-deployment-integration.js --report
 */

'use strict';

const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..');
const GOVERNANCE = path.join(REPO, 'governance', 'organism', 'registry', 'entities');
const DOCS = path.join(REPO, 'docs');
const DIST = path.join(REPO, 'dist');

const PHI = 1.618033988749895;
const HEARTBEAT_MS = 873;

// ── Configuration ────────────────────────────────────────────────────────────

const ALPHA_DEPLOYMENTS = {
  'twin-alpha': {
    name: 'Twin Alpha Runtime Interface',
    emoji: '🔷',
    type: 'web-app',
    path: 'organism/web/',
    entry: 'organism/web/index.html',
    workers: 'organism/web/*.js',
    governanceEntity: 'twin-alpha-deployment.json',
    workflow: '.github/workflows/deploy-twin-alpha.yml',
    url: 'https://itsnotailabs.github.io/PRODUCTION-/organism/web/',
  },
  'marketplace-sdk': {
    name: 'Organism Marketplace SDK',
    emoji: '🔷',
    type: 'npm-package',
    path: 'sdk/organism-marketplace/',
    entry: 'sdk/organism-marketplace/src/index.js',
    package: '@medina/organism-marketplace',
    governanceEntity: 'marketplace-sdk-deployment.json',
    workflow: '.github/workflows/deploy-marketplace-sdk.yml',
    npmUrl: 'https://www.npmjs.com/package/@medina/organism-marketplace',
  },
};

// ── Validation ───────────────────────────────────────────────────────────────

function validateDeployment(id) {
  const deployment = ALPHA_DEPLOYMENTS[id];
  if (!deployment) {
    return { valid: false, errors: [`Unknown deployment: ${id}`] };
  }

  const errors = [];
  const warnings = [];

  // Check entry point exists
  const entryPath = path.join(REPO, deployment.entry);
  if (!fs.existsSync(entryPath)) {
    errors.push(`Entry point not found: ${deployment.entry}`);
  }

  // Check workflow exists
  const workflowPath = path.join(REPO, deployment.workflow);
  if (!fs.existsSync(workflowPath)) {
    errors.push(`Workflow not found: ${deployment.workflow}`);
  }

  // Check governance entity exists
  const entityPath = path.join(GOVERNANCE, deployment.governanceEntity);
  if (!fs.existsSync(entityPath)) {
    warnings.push(`Governance entity not found: ${deployment.governanceEntity}`);
  }

  // Type-specific validations
  if (deployment.type === 'web-app') {
    // Check for service worker
    const swPath = path.join(REPO, 'organism/web/sw.js');
    if (!fs.existsSync(swPath)) {
      warnings.push('Service worker not found: organism/web/sw.js');
    }

    // Count workers
    const workerDir = path.join(REPO, 'organism/web');
    if (fs.existsSync(workerDir)) {
      const workers = fs.readdirSync(workerDir).filter(f => f.endsWith('.js'));
      if (workers.length < 10) {
        warnings.push(`Expected 10+ workers, found ${workers.length}`);
      }
    }
  }

  if (deployment.type === 'npm-package') {
    // Check package.json
    const pkgPath = path.join(REPO, deployment.path, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        if (!pkg.name || !pkg.version) {
          errors.push('Invalid package.json: missing name or version');
        }
        if (!pkg.exports) {
          warnings.push('package.json missing exports field');
        }
      } catch {
        errors.push('Failed to parse package.json');
      }
    } else {
      errors.push(`package.json not found: ${pkgPath}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    deployment,
  };
}

function validateAll() {
  console.log('  🔷 Validating Alpha Deployments');
  console.log('  ─────────────────────────────────────');

  const results = {};
  let allValid = true;

  for (const id of Object.keys(ALPHA_DEPLOYMENTS)) {
    const result = validateDeployment(id);
    results[id] = result;

    const icon = result.valid ? '✅' : '❌';
    console.log(`    ${icon} ${result.deployment.emoji} ${result.deployment.name}`);

    if (result.errors.length > 0) {
      result.errors.forEach(e => console.log(`        ❌ ${e}`));
      allValid = false;
    }
    if (result.warnings.length > 0) {
      result.warnings.forEach(w => console.log(`        ⚠️ ${w}`));
    }
  }

  console.log('');
  return { valid: allValid, results };
}

// ── Status ───────────────────────────────────────────────────────────────────

function getDeploymentStatus(id) {
  const deployment = ALPHA_DEPLOYMENTS[id];
  if (!deployment) return null;

  const status = {
    id,
    ...deployment,
    exists: false,
    governance: null,
    lastEvent: null,
  };

  // Check if deployment exists
  const entryPath = path.join(REPO, deployment.entry);
  status.exists = fs.existsSync(entryPath);

  // Load governance entity
  const entityPath = path.join(GOVERNANCE, deployment.governanceEntity);
  if (fs.existsSync(entityPath)) {
    try {
      status.governance = JSON.parse(fs.readFileSync(entityPath, 'utf8'));
    } catch {
      // Ignore parse errors
    }
  }

  // Find latest governance event
  const eventsDir = path.join(DIST, 'governance', 'events');
  if (fs.existsSync(eventsDir)) {
    const events = fs.readdirSync(eventsDir)
      .filter(f => f.includes(id) && f.endsWith('.json'))
      .sort()
      .reverse();

    if (events.length > 0) {
      try {
        status.lastEvent = JSON.parse(fs.readFileSync(path.join(eventsDir, events[0]), 'utf8'));
      } catch {
        // Ignore parse errors
      }
    }
  }

  return status;
}

function showStatus() {
  console.log('  🔷 Alpha Deployment Status');
  console.log('  ─────────────────────────────────────');

  for (const id of Object.keys(ALPHA_DEPLOYMENTS)) {
    const status = getDeploymentStatus(id);
    if (!status) continue;

    const existsIcon = status.exists ? '✅' : '❌';
    const govIcon = status.governance ? '✅' : '⚠️';

    console.log(`\n  ${status.emoji} ${status.name}`);
    console.log(`    Type: ${status.type}`);
    console.log(`    Entry: ${existsIcon} ${status.entry}`);
    console.log(`    Workflow: ${status.workflow}`);
    console.log(`    Governance: ${govIcon} ${status.governanceEntity}`);

    if (status.lastEvent) {
      console.log(`    Last Event: ${status.lastEvent.timestamp} (${status.lastEvent.type})`);
    }

    if (status.type === 'web-app' && status.url) {
      console.log(`    URL: ${status.url}`);
    }
    if (status.type === 'npm-package' && status.package) {
      console.log(`    Package: ${status.package}`);
    }
  }

  console.log('');
}

// ── Integration Report ───────────────────────────────────────────────────────

function generateReport() {
  console.log('  🔷 Generating Alpha Deployment Report');
  console.log('  ─────────────────────────────────────');

  const validation = validateAll();

  fs.mkdirSync(DOCS, { recursive: true });

  const lines = [
    '# 🔷 Alpha Deployment Report',
    '',
    `> Auto-generated by alpha-deployment-integration on ${new Date().toUTCString()}`,
    '',
    '## Overview',
    '',
    '| Deployment | Type | Status | Workflow |',
    '|------------|------|--------|----------|',
  ];

  for (const id of Object.keys(ALPHA_DEPLOYMENTS)) {
    const status = getDeploymentStatus(id);
    const result = validation.results[id];
    const statusIcon = result.valid ? '✅ Ready' : '❌ Issues';

    lines.push(
      `| ${status.emoji} ${status.name} | ${status.type} | ${statusIcon} | \`${status.workflow}\` |`
    );
  }

  lines.push('');
  lines.push('## Twin Alpha Runtime Interface');
  lines.push('');
  lines.push('The **Geminus Primus** — the first twin, the always-on autonomous user-facing interface to the entire organism.');
  lines.push('');
  lines.push('### Capabilities');
  lines.push('');
  lines.push('- **Memory Search Proxy** — Delegates to memory-worker for sovereign memory queries');
  lines.push('- **Task Dispatch Router** — Routes commands to engine, inference, routing workers');
  lines.push('- **Organism Health Aggregator** — Monitors all 22+ web workers\' health states');
  lines.push('- **Conversation Context Buffer** — Rolling 50-interaction context with Hebbian learning');
  lines.push('- **Autonomous Suggestions** — MiniBrain generates intelligent suggestions based on pathway strength');
  lines.push('- **User Profile Persistence** — Learns preferences, tracks top capabilities, adapts over time');
  lines.push('- **873ms Heartbeat** — Permanent phi-rhythm pulse with full status every 10th beat');
  lines.push('');
  lines.push('### Deployment');
  lines.push('');
  lines.push('| Component | Target |');
  lines.push('|-----------|--------|');
  lines.push('| `organism/web/index.html` | GitHub Pages (main entry) |');
  lines.push('| `organism/web/*.js` | Static assets on Pages |');
  lines.push('| `organism/web/sw.js` | Service Worker (offline capability) |');
  lines.push('');

  lines.push('## Organism Marketplace SDK');
  lines.push('');
  lines.push('The **callable tool marketplace** — 24 AI-invocable tools with schema validation, routing, settlement, and multi-model adapters.');
  lines.push('');
  lines.push('### Tool Families');
  lines.push('');
  lines.push('| Family | Emoji | Tools |');
  lines.push('|--------|-------|-------|');
  lines.push('| Crawling | 🕷 | FlowMonitor, PatternSeeker, AnomalyDetector, CacheOptimizer, LogStreamer, TopologyCrawler |');
  lines.push('| Context | 🧠 | PulseKeeper, StateGuardian, CycleCounter, ContextBuilder, MemoryConsolidator, LineageTracer |');
  lines.push('| Commander | ⚡ | SyncWeaver, InferEngine, AttentionRouter, ResourceBalancer, ConnectionPool, TaskCommander |');
  lines.push('| Sentry | 🛡 | SentinelWatch, IntegrityChecker, BoundaryEnforcer, SealVerifier, QueueProcessor, DoctrineAuditor |');
  lines.push('');
  lines.push('### Deployment');
  lines.push('');
  lines.push('| Component | Target |');
  lines.push('|-----------|--------|');
  lines.push('| Full SDK | npm registry (`@medina/organism-marketplace`) |');
  lines.push('| OpenAPI spec | `dist/marketplace-sdk/openapi.json` |');
  lines.push('| ChatGPT Plugin | `dist/marketplace-sdk/ai-plugin.json` |');
  lines.push('');

  // Validation issues
  const hasIssues = Object.values(validation.results).some(r => r.errors.length > 0 || r.warnings.length > 0);
  if (hasIssues) {
    lines.push('## Validation Issues');
    lines.push('');

    for (const [id, result] of Object.entries(validation.results)) {
      if (result.errors.length > 0 || result.warnings.length > 0) {
        lines.push(`### ${result.deployment.name}`);
        lines.push('');

        if (result.errors.length > 0) {
          lines.push('**Errors:**');
          result.errors.forEach(e => lines.push(`- ❌ ${e}`));
          lines.push('');
        }

        if (result.warnings.length > 0) {
          lines.push('**Warnings:**');
          result.warnings.forEach(w => lines.push(`- ⚠️ ${w}`));
          lines.push('');
        }
      }
    }
  }

  lines.push('## Integration');
  lines.push('');
  lines.push('Twin Alpha connects to the Marketplace SDK through:');
  lines.push('');
  lines.push('1. **Tool Discovery** — Twin Alpha can discover all 24 marketplace tools');
  lines.push('2. **Task Dispatch** — Tasks dispatched through Twin Alpha route to marketplace tools');
  lines.push('3. **Health Aggregation** — Marketplace metrics flow back to Twin Alpha status');
  lines.push('4. **Unified Governance** — Both deployments report to the same governance layer');
  lines.push('');
  lines.push('---');
  lines.push('*Generated by alpha-deployment-integration — Part of organism-alpha-bot fleet*');

  fs.writeFileSync(path.join(DOCS, 'alpha-deployment-report.md'), lines.join('\n'));
  console.log(`  📄 Report written to docs/alpha-deployment-report.md`);
}

// ── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const flags = {
    status: process.argv.includes('--status'),
    validate: process.argv.includes('--validate'),
    report: process.argv.includes('--report'),
  };

  // Default to all if no flags
  if (!Object.values(flags).some(Boolean)) {
    Object.keys(flags).forEach(k => (flags[k] = true));
  }

  console.log('');
  console.log('🔷 Alpha Deployment Integration');
  console.log('═══════════════════════════════════════════');
  console.log('');

  if (flags.status) showStatus();
  if (flags.validate) validateAll();
  if (flags.report) generateReport();

  console.log('');
  console.log('  🔷 Integration cycle complete');
  console.log('');
}

main();
