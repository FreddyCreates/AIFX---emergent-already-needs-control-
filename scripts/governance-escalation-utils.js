'use strict';

const fs = require('fs');

function parseJsonLine(line) {
  try {
    return JSON.parse(line);
  } catch {
    return null;
  }
}

function toMs(dateLike) {
  const ms = new Date(dateLike).getTime();
  return Number.isFinite(ms) ? ms : null;
}

function botNameFromEntity(entity) {
  if (!entity) return 'unknown-bot';
  return entity.replace(/^atlas:\/\/bot\//, '');
}

function escalationKey(escalation) {
  return `${escalation.entity}|${escalation.rule}|${escalation.target}`;
}

function dismissalKey(escalation) {
  return `${escalation.entity}|${escalation.rule}`;
}

function loadEscalationsFromAudit(auditFile, { sinceMs = 0, nowMs = Date.now() } = {}) {
  if (!fs.existsSync(auditFile)) return [];
  const text = fs.readFileSync(auditFile, 'utf8').trim();
  if (!text) return [];

  const escalations = [];
  for (const line of text.split('\n')) {
    if (!line) continue;
    const entry = parseJsonLine(line);
    if (!entry) continue;

    const atMs = toMs(entry.at);
    if (atMs === null) continue;
    if (atMs < sinceMs) continue;
    if (atMs > nowMs) continue;

    const decisions = Array.isArray(entry.decisions) ? entry.decisions : [];
    for (const decision of decisions) {
      if (!decision || decision.action !== 'ESCALATE') continue;
      const entity = decision.entity || entry.entity || null;
      escalations.push({
        at: entry.at,
        atMs,
        entity,
        rule: decision.rule,
        action: decision.action,
        target: decision.target,
        reason: decision.reason || '',
        key: null,
        dismissKey: null,
      });
    }
  }

  for (const e of escalations) {
    e.key = escalationKey(e);
    e.dismissKey = dismissalKey(e);
  }

  return escalations;
}

function dedupeEscalations(escalations) {
  const byKey = new Map();
  for (const esc of escalations) {
    if (!esc || !esc.key) continue;
    const existing = byKey.get(esc.key);
    if (!existing || (esc.atMs ?? 0) > (existing.atMs ?? 0)) {
      byKey.set(esc.key, esc);
    }
  }
  return Array.from(byKey.values()).sort((a, b) => (b.atMs ?? 0) - (a.atMs ?? 0));
}

function loadDismissedEscalationsFromFeedback(feedbackDir, { nowMs = Date.now(), ttlMs = 30 * 24 * 60 * 60 * 1000 } = {}) {
  if (!fs.existsSync(feedbackDir)) return new Set();
  const files = fs.readdirSync(feedbackDir).filter(f => f.startsWith('fb-') && f.endsWith('.yaml'));
  const dismissed = new Set();

  for (const file of files) {
    const content = fs.readFileSync(`${feedbackDir}/${file}`, 'utf8');
    const lines = content.split('\n');

    let inTarget = false;
    let inDecision = false;
    let entity = '';
    let rule = '';
    let system = '';
    let human = '';
    let at = '';

    for (const rawLine of lines) {
      const line = rawLine.replace(/\t/g, '  ');
      const trim = line.trim();
      if (!trim || trim.startsWith('#')) continue;

      const isTopLevel = !/^\s/.test(rawLine);

      if (/^target:\s*$/.test(trim)) {
        inTarget = true;
        inDecision = false;
        continue;
      }
      if (/^decision:\s*$/.test(trim)) {
        inDecision = true;
        inTarget = false;
        continue;
      }
      if (isTopLevel) {
        // leaving nested sections when we hit a new top-level key/value
        inTarget = false;
        inDecision = false;
      }

      if (inTarget) {
        const entityMatch = trim.match(/^entity:\s*"?([^"']+)"?\s*$/);
        if (entityMatch) entity = entityMatch[1].trim();
        const ruleMatch = trim.match(/^rule_name:\s*"?([^"']+)"?\s*$/);
        if (ruleMatch) rule = ruleMatch[1].trim();
        continue;
      }

      if (inDecision) {
        const systemMatch = trim.match(/^system:\s*"?([^"']+)"?\s*$/);
        if (systemMatch) system = systemMatch[1].trim();
        const humanMatch = trim.match(/^human:\s*"?([^"']+)"?\s*$/);
        if (humanMatch) human = humanMatch[1].trim();
        continue;
      }

      const atMatch = trim.match(/^at:\s*"?([^"']+)"?\s*$/);
      if (atMatch) at = atMatch[1].trim();
    }

    if (!entity || !rule) continue;
    if (system !== 'ESCALATE' || human !== 'DISMISS') continue;

    const atMs = toMs(at);
    if (atMs === null) continue;
    if (nowMs - atMs > ttlMs) continue;

    dismissed.add(`${entity}|${rule}`);
  }

  return dismissed;
}

function buildEscalationIssue(escalation) {
  const botName = botNameFromEntity(escalation.entity);
  const title = `🏛️ Governance Escalation: ${escalation.rule} — ${botName}`;
  const body = [
    `## Governance Escalation`,
    ``,
    `**Bot:** \`${botName}\``,
    `**Rule:** \`${escalation.rule}\``,
    `**Action:** ${escalation.action}`,
    `**Target:** ${escalation.target}`,
    `**Reason:** ${escalation.reason}`,
    `**Observed At:** ${escalation.at}`,
    ``,
    `### What to do`,
    `1. Review the governance report: \`docs/governance-report.md\``,
    `2. If this escalation is incorrect, create a feedback file in \`governance/feedback/\``,
    `3. See \`governance/feedback/TEMPLATE.yaml\` for the override format`,
    ``,
    `### Governance References`,
    `- OCL: \`governance/organism/bot-fleet.ocl\``,
    `- Laws: \`governance/laws/bot-fleet.cpl-l\``,
    `- Pipeline: \`governance/pipelines/bot-governance.cpl-p\``,
    ``,
    `*Auto-created by organism-governance-bot*`,
  ].join('\n');

  return { title, body, botName };
}

module.exports = {
  loadEscalationsFromAudit,
  loadDismissedEscalationsFromFeedback,
  dedupeEscalations,
  buildEscalationIssue,
  // Exposed for tests
  _private: {
    botNameFromEntity,
    escalationKey,
    dismissalKey,
  },
};
