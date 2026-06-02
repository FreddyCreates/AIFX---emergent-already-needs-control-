'use strict';

function asTimeMs(value) {
  if (!value) return null;
  const ms = new Date(value).getTime();
  return Number.isFinite(ms) ? ms : null;
}

function collectRecentEscalations({ auditText, nowMs = Date.now(), windowMs = 10 * 60 * 1000 } = {}) {
  if (!auditText || typeof auditText !== 'string') return [];

  const cutoff = nowMs - windowMs;
  const latestByEntityRule = new Map();

  const lines = auditText.split('\n').filter(Boolean);
  for (const line of lines) {
    let entry;
    try {
      entry = JSON.parse(line);
    } catch {
      continue;
    }

    const entryAtMs = asTimeMs(entry.at);
    if (entryAtMs === null || entryAtMs <= cutoff) continue;

    const decisions = Array.isArray(entry.decisions) ? entry.decisions : [];
    for (const decision of decisions) {
      if (!decision || decision.action !== 'ESCALATE') continue;

      const entity = entry.entity || decision.entity;
      const rule = decision.rule;
      if (!entity || !rule) continue;

      const decisionAtMs = asTimeMs(decision.at) ?? entryAtMs;
      const key = `${entity}|${rule}`;
      const existing = latestByEntityRule.get(key);
      if (!existing || (decisionAtMs !== null && decisionAtMs > existing._atMs)) {
        latestByEntityRule.set(key, {
          entity,
          rule,
          action: decision.action,
          target: decision.target || '',
          reason: decision.reason || '',
          at: decision.at || entry.at || null,
          _atMs: decisionAtMs ?? entryAtMs,
        });
      }
    }
  }

  return [...latestByEntityRule.values()]
    .sort((a, b) => (b._atMs || 0) - (a._atMs || 0))
    .map(({ _atMs, ...esc }) => esc);
}

module.exports = {
  collectRecentEscalations,
};

