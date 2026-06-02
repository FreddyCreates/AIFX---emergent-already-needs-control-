const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('node:child_process');

describe('governance-engine report rendering', () => {
  const repo = path.resolve(__dirname, '..', '..');
  const auditDir = path.join(repo, 'dist', 'governance');
  const lastCycleFile = path.join(auditDir, 'last-cycle.json');
  const reportFile = path.join(repo, 'docs', 'governance-report.md');

  const backups = new Map();

  function backup(filePath) {
    if (fs.existsSync(filePath)) {
      backups.set(filePath, { exists: true, content: fs.readFileSync(filePath, 'utf8') });
    } else {
      backups.set(filePath, { exists: false, content: null });
    }
  }

  function restore(filePath) {
    const backupData = backups.get(filePath);
    if (!backupData) return;

    if (backupData.exists) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, backupData.content);
    } else if (fs.existsSync(filePath)) {
      fs.rmSync(filePath);
    }
  }

  beforeEach(() => {
    backup(lastCycleFile);
    backup(reportFile);
  });

  afterEach(() => {
    restore(lastCycleFile);
    restore(reportFile);
  });

  it('renders docs/governance-report.md from dist/governance/last-cycle.json', () => {
    fs.mkdirSync(auditDir, { recursive: true });

    fs.writeFileSync(lastCycleFile, JSON.stringify({
      version: 1,
      cycle_started_at: '2026-06-02T00:00:00.000Z',
      cycle_completed_at: '2026-06-02T00:01:00.000Z',
      fleetState: {
        fleetHealth: 'green',
        riskScore: 0.1706,
        totalPass: 516,
        totalFail: 45,
        totalWarn: 37,
        failedBots: [],
        botReports: {},
      },
      allResults: [
        {
          entity: 'atlas://bot/organism-learning-bot',
          blocked: false,
          required: [],
          decisions: [
            {
              entity: 'atlas://bot/organism-learning-bot',
              rule: 'HALT_ON_REWARD_DIVERGENCE',
              action: 'ESCALATE',
              target: 'human://operator',
              reason: 'Reward divergence requires manual inspection of training data',
              law: 'governance://law/BOT_FLEET_SAFETY',
            },
          ],
        },
      ],
    }, null, 2));

    const result = spawnSync('node', ['scripts/governance-engine.js', '--report'], {
      cwd: repo,
      encoding: 'utf8',
    });

    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.ok(fs.existsSync(reportFile), 'expected governance report to be written');

    const report = fs.readFileSync(reportFile, 'utf8');
    assert.match(report, /organism-learning-bot/);
    assert.match(report, /HALT_ON_REWARD_DIVERGENCE/);
    assert.match(report, /🔴 ESCALATE/);
    assert.match(report, /loaded \*\*1\*\* bot entities/);
  });
});

