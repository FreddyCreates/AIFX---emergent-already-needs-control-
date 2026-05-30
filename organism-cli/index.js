#!/usr/bin/env node

/**
 * organism-cli — Terminal AI for the Sovereign Organism
 *
 * True 1-click install. Run this command:
 *
 *   node organism-cli/index.js
 *
 * That's it. Register AI scans all 35 extensions, validates them,
 * finds your Edge/Chrome/Brave, and launches it with every extension
 * already attached. Edge-first on Windows. No zip. No extract.
 * No developer mode. No manual steps.
 *
 * Commands:
 *   install   — (default) scan + validate + detect browser + launch with extensions
 *   validate  — check all extensions for Manifest V3 compliance
 *   list      — show all extensions with status
 *   status    — show Register AI health
 *   help      — show this help
 *
 * The CLI itself IS an AI. It's the Register AI (TOOL-025) from the
 * Builder family, running in your terminal instead of in the browser.
 */

'use strict';

const path = require('path');
const RegisterAIEngine = require('./ai-engine');

/* ─── Resolve repo root ─────────────────────────────────────── */
const repoRoot = path.resolve(__dirname, '..');

/* ─── Parse command ─────────────────────────────────────────── */
const args = process.argv.slice(2);
const command = (args[0] || 'install').toLowerCase();

/* ─── Colors ────────────────────────────────────────────────── */
const c = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  yellow: '\x1b[33m', cyan: '\x1b[36m', green: '\x1b[32m',
};

/* ─── Initialize AI Engine ──────────────────────────────────── */
const ai = new RegisterAIEngine(repoRoot);

/* ─── Execute ───────────────────────────────────────────────── */
switch (command) {
  case 'install':
  case 'i':
    ai.runFullPipeline();
    break;

  case 'validate':
  case 'v':
    ai.banner();
    ai.scan();
    ai.validate();
    ai.list();
    break;

  case 'list':
  case 'l':
  case 'ls':
    ai.scan();
    ai.validate();
    ai.list();
    break;

  case 'status':
  case 's':
    ai.scan();
    ai.validate();
    ai.detectBrowser();
    ai.status();
    break;

  case 'help':
  case '-h':
  case '--help':
    console.log('');
    console.log(`${c.bold}${c.yellow}  🏗  Register AI — Terminal Intelligence${c.reset}`);
    console.log('');
    console.log(`  ${c.bold}Usage:${c.reset}  node organism-cli/index.js [command]`);
    console.log('');
    console.log(`  ${c.bold}Commands:${c.reset}`);
    console.log(`    ${c.cyan}install${c.reset}   ${c.dim}(default)${c.reset} Scan → Validate → Detect → Launch with all extensions`);
    console.log(`    ${c.cyan}validate${c.reset}  Check all extensions for Manifest V3 compliance`);
    console.log(`    ${c.cyan}list${c.reset}      Show all extensions with status`);
    console.log(`    ${c.cyan}status${c.reset}    Show Register AI health + browser detection`);
    console.log(`    ${c.cyan}help${c.reset}      Show this help`);
    console.log('');
    console.log(`  ${c.bold}1-Click Install:${c.reset}`);
    console.log(`    ${c.green}node organism-cli${c.reset}     ← that's it, extensions are live (Edge-first on Windows)`);
    console.log('');
    console.log(`  No zip. No extract. No manual steps. Edge-first on Windows.`);
    console.log(`  Extensions load directly from ${c.cyan}extensions/${c.reset} into Edge/Chrome.`);
    console.log('');
    break;

  default:
    console.log(`  Unknown command: ${command}`);
    console.log(`  Run: node organism-cli/index.js help`);
    process.exit(1);
}
