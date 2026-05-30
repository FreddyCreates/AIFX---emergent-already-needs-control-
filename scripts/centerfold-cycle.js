#!/usr/bin/env node

/**
 * Centerfold API/CLI entrypoint
 *
 * Usage:
 *   node scripts/centerfold-cycle.js --vector 0.2,0.4,0.9 --entropy 0.42
 *   node scripts/centerfold-cycle.js --vector 1,2,3 --kernel KERNEL-0300
 */

'use strict';

const path = require('path');
const { pathToFileURL } = require('url');

function parseArgs(argv = []) {
  const args = { vector: [0, 0, 0], entropy: null, kernel: null };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--vector') {
      const raw = argv[i + 1] || '';
      args.vector = raw.split(',').map((entry) => Number(entry.trim())).filter((n) => Number.isFinite(n));
      i += 1;
    } else if (token === '--entropy') {
      const value = Number(argv[i + 1]);
      args.entropy = Number.isFinite(value) ? value : null;
      i += 1;
    } else if (token === '--kernel') {
      args.kernel = argv[i + 1] || null;
      i += 1;
    }
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const moduleUrl = pathToFileURL(path.resolve(__dirname, '../sdk/engines/centerfold-engine.js')).href;
  const { CenterfoldEngine } = await import(moduleUrl);

  const engine = new CenterfoldEngine();
  const snapshot = engine.runCycle({
    vector: args.vector,
    kernel: args.kernel ? { kernelId: args.kernel } : { entropy: args.entropy ?? 0.5 },
    metadata: {
      source: 'scripts/centerfold-cycle.js',
    },
  });

  const response = {
    sequence: snapshot.sequence,
    kernelId: snapshot.input.kernel.id,
    centerMass: snapshot.output.centerfold.centerMass,
    centerEnergy: snapshot.output.centerfold.energy,
    trendSummary: engine.state.getTrendSummary(),
    observability: engine.observability.getMetrics(),
  };

  process.stdout.write(`${JSON.stringify(response, null, 2)}\n`);
}

main().catch((error) => {
  process.stderr.write(`centerfold-cycle failed: ${error.message}\n`);
  process.exit(1);
});
