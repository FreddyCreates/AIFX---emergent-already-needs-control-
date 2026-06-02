#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const args = {
    seed: undefined,
    out: undefined,
    pretty: false,
  };

  for (const a of argv.slice(2)) {
    if (a === '--pretty') args.pretty = true;
    else if (a.startsWith('--seed=')) args.seed = Number(a.split('=')[1]);
    else if (a.startsWith('--out=')) args.out = a.split('=')[1];
  }

  return args;
}

async function main() {
  const args = parseArgs(process.argv);
  const { runResilienceBench } = await import('../sdk/resilience/resilience-bench.js');

  const report = await runResilienceBench({
    seed: Number.isFinite(args.seed) ? args.seed : undefined,
  });

  const json = JSON.stringify(report, null, args.pretty ? 2 : 0);
  process.stdout.write(json + '\n');

  if (args.out) {
    const outPath = path.resolve(process.cwd(), args.out);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, json);
  }
}

main().catch(err => {
  console.error(err?.stack || err?.message || String(err));
  process.exit(1);
});

