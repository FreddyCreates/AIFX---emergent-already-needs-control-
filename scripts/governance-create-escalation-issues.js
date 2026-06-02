/**
 * Create GitHub Issues for governance escalations.
 *
 * Designed to run under `actions/github-script` with a checked-out workspace.
 * The goal is to be idempotent and avoid "issue storms" by:
 * - deduping repeated ESCALATE decisions within the same cycle
 * - skipping if an equivalent open escalation issue already exists
 * - respecting recent human DISMISS feedback for the same entity+rule
 */

'use strict';

const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..');
const AUDIT_FILE = path.join(REPO, 'dist', 'governance', 'audit-log.jsonl');
const FEEDBACK_DIR = path.join(REPO, 'governance', 'feedback');

function readJsonLines(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, 'utf8');
  const lines = raw.trim().split('\n').filter(Boolean);
  const out = [];
  for (const line of lines) {
    try { out.push(JSON.parse(line)); } catch { /* ignore */ }
  }
  return out;
}

function extractRecentEscalations(auditEntries, { cutoffMs }) {
  const escalations = [];
  for (const entry of auditEntries) {
    const atMs = new Date(entry.at || 0).getTime();
    if (!Number.isFinite(atMs) || atMs <= cutoffMs) continue;
    for (const decision of (entry.decisions || [])) {
      if (decision?.action !== 'ESCALATE') continue;
      escalations.push({
        entity: entry.entity || decision.entity,
        law: decision.law,
        rule: decision.rule,
        target: decision.target,
        reason: decision.reason,
        at: entry.at,
      });
    }
  }
  return escalations;
}

function dedupeEscalations(escalations) {
  const grouped = new Map();
  for (const esc of escalations) {
    const key = `${esc.entity}||${esc.law}||${esc.rule}||${esc.target}`;
    const existing = grouped.get(key);
    const atMs = new Date(esc.at || 0).getTime();
    if (!existing) {
      grouped.set(key, {
        ...esc,
        count: 1,
        firstAt: esc.at,
        lastAt: esc.at,
        _firstAtMs: atMs,
        _lastAtMs: atMs,
      });
      continue;
    }
    existing.count++;
    if (Number.isFinite(atMs) && (!Number.isFinite(existing._firstAtMs) || atMs < existing._firstAtMs)) {
      existing._firstAtMs = atMs;
      existing.firstAt = esc.at;
    }
    if (Number.isFinite(atMs) && (!Number.isFinite(existing._lastAtMs) || atMs > existing._lastAtMs)) {
      existing._lastAtMs = atMs;
      existing.lastAt = esc.at;
    }
  }
  return Array.from(grouped.values()).map(({ _firstAtMs, _lastAtMs, ...rest }) => rest);
}

function parseFeedbackYaml(yamlText) {
  const entity = yamlText.match(/^\s*entity:\s*"?([^"\n]+)"?\s*$/m)?.[1];
  const ruleName = yamlText.match(/^\s*rule_name:\s*"?([^"\n]+)"?\s*$/m)?.[1];
  const humanDecision = yamlText.match(/^\s*human:\s*"?([^"\n]+)"?\s*$/m)?.[1];
  const at = yamlText.match(/^\s*at:\s*"?([^"\n]+)"?\s*$/m)?.[1];
  return { entity, ruleName, humanDecision, at };
}

function loadDismissFeedback(feedbackDir = FEEDBACK_DIR) {
  if (!fs.existsSync(feedbackDir)) return [];
  const files = fs.readdirSync(feedbackDir).filter(f => /\.(ya?ml)$/i.test(f));
  const out = [];
  for (const file of files) {
    const filePath = path.join(feedbackDir, file);
    try {
      const parsed = parseFeedbackYaml(fs.readFileSync(filePath, 'utf8'));
      if (!parsed.entity || !parsed.ruleName || !parsed.humanDecision || !parsed.at) continue;
      if (String(parsed.humanDecision).toUpperCase() !== 'DISMISS') continue;
      const atMs = new Date(parsed.at).getTime();
      if (!Number.isFinite(atMs)) continue;
      out.push({ ...parsed, atMs, file: filePath });
    } catch {
      // ignore malformed feedback
    }
  }
  return out;
}

function isSuppressedByDismissFeedback({ dismissFeedback, entity, rule, nowMs, windowMs }) {
  return dismissFeedback.some(f =>
    f.entity === entity &&
    f.ruleName === rule &&
    f.atMs >= (nowMs - windowMs)
  );
}

async function listOpenEscalationIssues({ github, owner, repo }) {
  const issues = await github.paginate(github.rest.issues.listForRepo, {
    owner,
    repo,
    state: 'open',
    labels: 'governance,escalation',
    per_page: 100,
  });
  return issues || [];
}

function buildIssueTitle({ entity, rule }) {
  const botName = String(entity || '').replace('atlas://bot/', '');
  return `🏛️ Governance Escalation: ${rule} — ${botName}`;
}

function buildIssueBody({ entity, law, rule, target, reason, count, firstAt, lastAt }) {
  const botName = String(entity || '').replace('atlas://bot/', '');
  const refs = [
    `- OCL: \`governance/organism/bot-fleet.ocl\``,
    `- Laws: \`governance/laws/\``,
    `- Pipeline: \`governance/pipelines/\``,
  ];

  return [
    `## Governance Escalation`,
    ``,
    `**Bot:** \`${botName}\``,
    `**Law:** \`${law || 'unknown'}\``,
    `**Rule:** \`${rule}\``,
    `**Action:** ESCALATE`,
    `**Target:** ${target}`,
    `**Reason:** ${reason || ''}`,
    count > 1 ? `**Occurrences:** ${count} (from ${firstAt} to ${lastAt})` : '',
    ``,
    `### What to do`,
    `1. Review the governance reports:`,
    `   - \`docs/governance-report.md\` (bot-fleet cycle)`,
    `   - \`docs/atlas-governance-report.md\` (universal cycle)`,
    `2. If this escalation is incorrect, create a feedback file in \`governance/feedback/\``,
    `3. See \`governance/feedback/TEMPLATE.yaml\` for the override format`,
    ``,
    `### Governance References`,
    ...refs,
    ``,
    `*Auto-created by organism-governance-bot*`,
  ].filter(Boolean).join('\n');
}

async function createEscalationIssues({ github, context, core, options = {} }) {
  const owner = context.repo.owner;
  const repo = context.repo.repo;

  const nowMs = options.nowMs ?? Date.now();
  const cutoffMs = nowMs - (options.cutoffMinutes ?? 10) * 60 * 1000;
  const dismissWindowMs = (options.dismissWindowDays ?? 30) * 24 * 60 * 60 * 1000;

  if (!fs.existsSync(AUDIT_FILE)) {
    core?.info?.('No audit log found');
    return { created: 0, skipped: 0, candidates: 0 };
  }

  const auditEntries = readJsonLines(AUDIT_FILE);
  const recentEscalations = extractRecentEscalations(auditEntries, { cutoffMs });
  const deduped = dedupeEscalations(recentEscalations);

  const dismissFeedback = loadDismissFeedback(FEEDBACK_DIR);
  const openIssues = await listOpenEscalationIssues({ github, owner, repo });
  const openTitles = new Set(openIssues.map(i => i.title));

  let created = 0;
  let skipped = 0;

  for (const esc of deduped) {
    const title = buildIssueTitle({ entity: esc.entity, rule: esc.rule });

    if (openTitles.has(title)) {
      skipped++;
      core?.info?.(`Skip (already open): ${title}`);
      continue;
    }

    if (isSuppressedByDismissFeedback({
      dismissFeedback,
      entity: esc.entity,
      rule: esc.rule,
      nowMs,
      windowMs: dismissWindowMs,
    })) {
      skipped++;
      core?.info?.(`Skip (recent DISMISS feedback): ${title}`);
      continue;
    }

    const body = buildIssueBody({
      ...esc,
      count: esc.count || 1,
      firstAt: esc.firstAt || esc.at,
      lastAt: esc.lastAt || esc.at,
    });

    try {
      await github.rest.issues.create({
        owner,
        repo,
        title,
        body,
        labels: ['governance', 'escalation'],
      });
      created++;
      core?.info?.(`Created issue: ${title}`);
    } catch (err) {
      skipped++;
      core?.warning?.(`Could not create issue: ${title} (${err?.message || err})`);
    }
  }

  core?.info?.(`Escalation issues: candidates=${deduped.length}, created=${created}, skipped=${skipped}`);
  return { created, skipped, candidates: deduped.length };
}

module.exports = {
  readJsonLines,
  extractRecentEscalations,
  dedupeEscalations,
  parseFeedbackYaml,
  loadDismissFeedback,
  isSuppressedByDismissFeedback,
  buildIssueTitle,
  buildIssueBody,
  createEscalationIssues,
};

