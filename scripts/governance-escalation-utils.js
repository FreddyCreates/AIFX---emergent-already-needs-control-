'use strict';

const fs = require('fs');
const path = require('path');

function parseFeedbackYaml(text) {
  const entityMatch = text.match(/^\s*entity:\s*"?([^"\n]+)"?\s*$/m);
  const ruleMatch = text.match(/^\s*rule_name:\s*"?([^"\n]+)"?\s*$/m);
  const humanMatch = text.match(/^\s*human:\s*"?([^"\n]+)"?\s*$/m);
  const atMatch = text.match(/^\s*at:\s*"?([^"\n]+)"?\s*$/m);

  return {
    entity: entityMatch ? entityMatch[1].trim() : null,
    ruleName: ruleMatch ? ruleMatch[1].trim() : null,
    humanDecision: humanMatch ? humanMatch[1].trim() : null,
    at: atMatch ? atMatch[1].trim() : null,
  };
}

function loadDismissedEscalations(feedbackDir, { now = Date.now(), windowDays = 30 } = {}) {
  const dismissed = new Set();
  const windowMs = windowDays * 24 * 60 * 60 * 1000;

  if (!feedbackDir || !fs.existsSync(feedbackDir)) return dismissed;

  for (const file of fs.readdirSync(feedbackDir)) {
    if (!file.endsWith('.yaml') && !file.endsWith('.yml')) continue;
    const filePath = path.join(feedbackDir, file);
    let text;
    try {
      text = fs.readFileSync(filePath, 'utf8');
    } catch {
      continue;
    }

    const parsed = parseFeedbackYaml(text);
    if (!parsed.entity || !parsed.ruleName) continue;
    if (String(parsed.humanDecision || '').toUpperCase() !== 'DISMISS') continue;

    if (parsed.at) {
      const atMs = Date.parse(parsed.at);
      if (!Number.isNaN(atMs) && now - atMs > windowMs) continue;
    }

    dismissed.add(`${parsed.entity}|${parsed.ruleName}`);
  }

  return dismissed;
}

module.exports = {
  loadDismissedEscalations,
};

