'use strict';
/**
 * SIGNAL GATHERER MICROBOT
 * Parent: organism-learning-bot
 *
 * Crawls docs/ reports, test results, and sandcastle outputs to collect
 * training signals — pass/fail ratios, protocol complexity, coverage scores.
 * Each signal becomes a (source, score) pair fed to the synapse trainer.
 */

const fs   = require('fs');
const path = require('path');
const { MicrobotBase } = require('../microbot-base.js');

class SignalGathererMicrobot extends MicrobotBase {
  constructor(parentBot, config = {}) {
    super('signal-gatherer', parentBot, config);
    this.repoRoot = config.repoRoot || path.resolve(__dirname, '../../..');
  }

  async _execute() {
    const signals = [];
    const docs = path.join(this.repoRoot, 'docs');
    const prot = path.join(this.repoRoot, 'protocols');

    // Scan docs/ for pass/fail markers
    const reportFiles = ['test-health-dashboard.md', 'sandcastle-report.md', 'security-report.md', 'fleet-report.md'];
    for (const file of reportFiles) {
      const filePath = path.join(docs, file);
      if (!fs.existsSync(filePath)) continue;
      const content = fs.readFileSync(filePath, 'utf8');
      const pass = (content.match(/✅/g) || []).length;
      const fail = (content.match(/❌|⚠️|🚨/g) || []).length;
      signals.push({ source: `report:${file}`, score: pass / (pass + fail + 1), pass, fail });
      this.tick();
    }

    // Scan protocols for complexity
    if (fs.existsSync(prot)) {
      const files = fs.readdirSync(prot).filter(f => f.endsWith('.js') && f !== 'index.js');
      for (const file of files) {
        const content = fs.readFileSync(path.join(prot, file), 'utf8');
        const lines = content.split('\n').length;
        const hasClass = /class\s+\w+/.test(content);
        signals.push({
          source: `protocol:${file.replace('.js', '')}`,
          score: Math.min(1.0, lines / 200) * (hasClass ? 1 : 0.5),
        });
        this.tick();
      }
    }

    return { signals, count: signals.length, timestamp: new Date().toISOString() };
  }
}

module.exports = SignalGathererMicrobot;
