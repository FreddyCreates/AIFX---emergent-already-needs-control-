/**
 * 🏛️ Governance escalation → GitHub issue planner
 *
 * Used by the organism-governance-bot GitHub workflow to avoid:
 * - opening duplicate issues every cycle for the same escalation
 * - reopening escalations that have been explicitly dismissed by humans
 */
'use strict';

const fs = require('fs');
const path = require('path');

function safeJsonParse(line) {
  try { return JSON.parse(line); } catch { return null; }
}

function normalizeBotName(entityId = '') {
  return entityId.replace('atlas://bot/', '');
}

function buildIssueTitle(escalation) {
  const botName = normalizeBotName(escalation.entity);
  return `🏛️ Governance Escalation: ${escalation.rule} — ${botName}`;
}

function buildIssueBody(escalation) {
  const botName = normalizeBotName(escalation.entity);
  return [
    `## Governance Escalation`,
    ``,
    `**Bot:** \`${botName}\``,
    `**Rule:** \`${escalation.rule}\``,
    `**Law:** \`${escalation.law || 'unknown'}\``,
    `**Action:** ${escalation.action}`,
    `**Target:** ${escalation.target}`,
    `**Reason:** ${escalation.reason}`,
    ``,
    `### What to do`,
    `1. Review the governance report: \`docs/governance-report.md\``,
    `2. Cross-check universal report: \`docs/atlas-governance-report.md\``,
    `3. If this escalation is incorrect, create a feedback file in \`governance/feedback/\``,
    `4. See \`governance/feedback/TEMPLATE.yaml\` for the override format`,
    ``,
    `### Governance References`,
    `- OCL: \`governance/organism/bot-fleet.ocl\``,
    `- Laws: \`governance/laws/\``,
    `- Pipeline: \`governance/pipelines/bot-governance.cpl-p\``,
    ``,
    `*Auto-created by organism-governance-bot*`,
  ].join('\n');
}

function parseAuditLogTextForRecentEscalations(auditText, { cutoffMs, nowMs = Date.now() } = {}) {
  const cutoff = typeof cutoffMs === 'number' ? nowMs - cutoffMs : 0;
  const lines = (auditText || '').trim().split('\n').filter(Boolean);

  const escalations = [];
  for (const line of lines) {
    const entry = safeJsonParse(line);
    if (!entry) continue;

    const atMs = new Date(entry.at).getTime();
    if (!Number.isFinite(atMs) || atMs <= cutoff) continue;

    const entity = entry.entity || '';
    for (const d of (entry.decisions || [])) {
      if (!d || d.action !== 'ESCALATE') continue;
      escalations.push({
        entity,
        rule: d.rule,
        law: d.law,
        action: d.action,
        target: d.target,
        reason: d.reason,
        audit_at: entry.at,
      });
    }
  }

  return escalations;
}

function parseFeedbackYamlForDismissal(yamlText) {
  const entity = yamlText.match(/^\s*entity:\s*"([^"]+)"/m)?.[1] || '';
  const rule = yamlText.match(/^\s*rule_name:\s*"([^"]+)"/m)?.[1] || '';
  const system = yamlText.match(/^\s*system:\s*"([^"]+)"/m)?.[1] || '';
  const human = yamlText.match(/^\s*human:\s*"([^"]+)"/m)?.[1] || '';

  if (!entity || !rule) return null;
  if (system !== 'ESCALATE' || human !== 'DISMISS') return null;

  return { entity, rule };
}

function loadDismissedEscalationsFromDir(feedbackDir) {
  const dismissed = new Set();
  if (!feedbackDir || !fs.existsSync(feedbackDir)) return dismissed;

  const files = fs.readdirSync(feedbackDir).filter(f => f.startsWith('fb-') && f.endsWith('.yaml'));
  for (const file of files) {
    const fullPath = path.join(feedbackDir, file);
    let text = '';
    try { text = fs.readFileSync(fullPath, 'utf8'); } catch { continue; }
    const parsed = parseFeedbackYamlForDismissal(text);
    if (!parsed) continue;
    dismissed.add(`${parsed.entity}::${parsed.rule}`);
  }
  return dismissed;
}

function filterDismissedEscalations(escalations, dismissedSet) {
  if (!dismissedSet || dismissedSet.size === 0) return escalations;
  return escalations.filter(e => !dismissedSet.has(`${e.entity}::${e.rule}`));
}

function dedupeEscalationsByTitle(escalations) {
  const seen = new Set();
  const out = [];
  for (const esc of escalations) {
    const title = buildIssueTitle(esc);
    if (seen.has(title)) continue;
    seen.add(title);
    out.push(esc);
  }
  return out;
}

function planEscalationIssues({ auditLogText, feedbackDir, cutoffMs, nowMs } = {}) {
  const recent = parseAuditLogTextForRecentEscalations(auditLogText, { cutoffMs, nowMs });
  const dismissed = loadDismissedEscalationsFromDir(feedbackDir);
  const filtered = filterDismissedEscalations(recent, dismissed);
  const deduped = dedupeEscalationsByTitle(filtered);

  return deduped.map(esc => ({
    escalation: esc,
    title: buildIssueTitle(esc),
    body: buildIssueBody(esc),
    labels: ['governance', 'escalation'],
  }));
}

module.exports = {
  buildIssueTitle,
  buildIssueBody,
  parseAuditLogTextForRecentEscalations,
  parseFeedbackYamlForDismissal,
  loadDismissedEscalationsFromDir,
  filterDismissedEscalations,
  dedupeEscalationsByTitle,
  planEscalationIssues,
};

