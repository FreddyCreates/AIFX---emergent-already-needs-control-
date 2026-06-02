'use strict';

const fs = require('node:fs');
const path = require('node:path');

function safeJsonParse(line) {
  try {
    return JSON.parse(line);
  } catch {
    return null;
  }
}

function toMillis(value) {
  const ms = new Date(value).getTime();
  return Number.isFinite(ms) ? ms : null;
}

function issueKeyFromEscalation(esc) {
  const entity = esc.entity || '';
  const rule = esc.rule || '';
  const target = esc.target || '';
  return `${entity}::${rule}::${target}`;
}

function buildIssueTitle(esc) {
  const botName = (esc.entity || '').replace('atlas://bot/', '');
  return `🏛️ Governance Escalation: ${esc.rule} — ${botName}`;
}

function buildIssueBody(esc) {
  const botName = (esc.entity || '').replace('atlas://bot/', '');
  return [
    '## Governance Escalation',
    '',
    `**Bot:** \`${botName}\``,
    `**Rule:** \`${esc.rule}\``,
    `**Action:** ${esc.action}`,
    `**Target:** ${esc.target}`,
    `**Reason:** ${esc.reason}`,
    '',
    '### What to do',
    '1. Review the governance report: `docs/governance-report.md`',
    '2. Review the Atlas governance report: `docs/atlas-governance-report.md`',
    '3. If this escalation is incorrect, create a feedback file in `governance/feedback/`',
    '4. See `governance/feedback/TEMPLATE.yaml` for the override format',
    '',
    '### Governance References',
    '- OCL: `governance/organism/bot-fleet.ocl`',
    '- Laws: `governance/laws/bot-fleet.cpl-l`',
    '- Pipeline: `governance/pipelines/bot-governance.cpl-p`',
    '',
    '*Auto-created by organism-governance-bot*',
  ].join('\n');
}

function getRecentEscalationsFromAudit({
  auditFile,
  now = Date.now(),
  windowMs = 10 * 60 * 1000,
} = {}) {
  if (!auditFile || !fs.existsSync(auditFile)) return [];

  const text = fs.readFileSync(auditFile, 'utf8');
  const lines = text.trim().split('\n').filter(Boolean);
  if (lines.length === 0) return [];

  const cutoff = now - windowMs;
  const escalations = [];

  for (const line of lines) {
    const entry = safeJsonParse(line);
    if (!entry) continue;

    const entryAt = toMillis(entry.at) ?? 0;
    if (entryAt < cutoff) continue;

    const decisions = Array.isArray(entry.decisions) ? entry.decisions : [];
    for (const d of decisions) {
      if (!d || d.action !== 'ESCALATE') continue;
      escalations.push({
        entity: entry.entity || d.entity,
        rule: d.rule,
        action: d.action,
        target: d.target,
        reason: d.reason,
        law: d.law,
        at: d.at || entry.at,
      });
    }
  }

  return escalations;
}

function dedupeEscalations(escalations) {
  const out = [];
  const seen = new Set();

  for (const esc of escalations || []) {
    const key = issueKeyFromEscalation(esc);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(esc);
  }

  return out;
}

function loadDismissedFeedback({
  feedbackDir,
  now = Date.now(),
  windowDays = 30,
} = {}) {
  if (!feedbackDir || !fs.existsSync(feedbackDir)) return new Set();

  const cutoff = now - windowDays * 24 * 60 * 60 * 1000;
  const dismissed = new Set();

  const files = fs
    .readdirSync(feedbackDir)
    .filter(f => f.startsWith('fb-') && f.endsWith('.yaml'));

  for (const file of files) {
    const fullPath = path.join(feedbackDir, file);
    let content = '';
    try {
      content = fs.readFileSync(fullPath, 'utf8');
    } catch {
      continue;
    }

    const entity = content.match(/^\s*entity:\s*"([^"]+)"/m)?.[1];
    const rule = content.match(/^\s*rule_name:\s*"([^"]+)"/m)?.[1];
    const humanDecision = content.match(/^\s*human:\s*"([^"]+)"/m)?.[1];
    const at = content.match(/^\s*at:\s*"([^"]+)"/m)?.[1];

    if (!entity || !rule || !humanDecision || !at) continue;
    if (humanDecision !== 'DISMISS') continue;

    const atMs = toMillis(at);
    if (atMs === null || atMs < cutoff) continue;

    dismissed.add(`${entity}::${rule}`);
  }

  return dismissed;
}

function isSuppressedByFeedback(esc, dismissedSet) {
  if (!dismissedSet || dismissedSet.size === 0) return false;
  const key = `${esc.entity}::${esc.rule}`;
  return dismissedSet.has(key);
}

module.exports = {
  buildIssueTitle,
  buildIssueBody,
  dedupeEscalations,
  getRecentEscalationsFromAudit,
  isSuppressedByFeedback,
  loadDismissedFeedback,
};

