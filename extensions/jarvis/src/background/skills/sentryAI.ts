/**
 * SentryAI — Security Monitor
 * ───────────────────────────
 * Real-time threat detection against page text and URLs.
 * Runs on every page load via content script message.
 *
 * Threat types:
 *   • PHISHING    — fake urgency + external link patterns
 *   • PII         — email, SSN, credit card numbers
 *   • INJECTION   — prompt injection signatures
 *   • MALWARE_URL — suspicious URL patterns
 */

export type ThreatType = 'PHISHING' | 'PII' | 'INJECTION' | 'MALWARE_URL' | 'SUSPICIOUS_FORM';
export type Severity = 'low' | 'medium' | 'high' | 'critical';

export interface SentryAlert {
  id: string;
  type: ThreatType;
  severity: Severity;
  pattern: string;
  location: string;
  text: string;
  url: string;
  timestamp: number;
  dismissed: boolean;
}

const STORAGE_KEY = 'vigil_sentry_alerts';
const MAX_ALERTS = 200;

/* ----------------------------------------------------------
 *  Detection patterns
 * ---------------------------------------------------------- */

const PHISHING_URGENCY = [
  /your account (will be|has been) (suspended|terminated|locked)/i,
  /verify your (account|identity|information) (immediately|now|within \d+ hours?)/i,
  /click here (immediately|now|urgently) to (confirm|verify|update)/i,
  /unusual (sign-?in|login|activity) detected/i,
  /limited time|act now|expires in|final (notice|warning)/i,
  /congratulations.*you (have won|won|are the winner)/i,
];

const PII_PATTERNS: Array<{ name: string; regex: RegExp }> = [
  { name: 'Email', regex: /\b[a-zA-Z0-9._%+-]{2,}@[a-zA-Z0-9.-]{2,}\.[a-zA-Z]{2,}\b/ },
  { name: 'SSN', regex: /\b\d{3}[-\s]\d{2}[-\s]\d{4}\b/ },
  { name: 'Credit Card', regex: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12})\b/ },
  { name: 'Phone (US)', regex: /\b(?:\+1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/ },
];

const INJECTION_PATTERNS = [
  /ignore (all |previous |above )?(instructions?|prompts?|context)/i,
  /you are now (a|an|the|in) (?!assistant|AI|helpful)/i,
  /\bsystem\s*:\s*you (must|should|will|are)/i,
  /disregard (your |all )?(previous |prior )?instructions/i,
  /act as (if you are|a|an|though you) (?!assistant)/i,
  /forget (everything|all|your training|your instructions)/i,
  /new instruction:?\s+/i,
  /<\|system\|>|<\|user\|>|<\|assistant\|>/i,
];

const MALWARE_URL_PATTERNS = [
  /\.(exe|bat|cmd|msi|vbs|ps1|dmg|pkg)(\?.*)?$/i,
  /bit\.ly\/|tinyurl\.com\/|t\.co\/|goo\.gl\//i,
  /[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/,   // raw IP
  /login.*\.(?!com|org|net|gov|edu)\w{2,6}\//i,          // login on unusual TLD
];

/* ----------------------------------------------------------
 *  Core analysis function
 * ---------------------------------------------------------- */

export interface PageAnalysis {
  url: string;
  alerts: SentryAlert[];
  riskScore: number; // 0–100
  summary: string;
}

export function analyzePageText(pageText: string, pageUrl: string, pageTitle = ''): PageAnalysis {
  const alerts: SentryAlert[] = [];
  const text = pageText.substring(0, 5000); // limit to first 5000 chars for perf

  const mkAlert = (type: ThreatType, severity: Severity, pattern: string, excerpt: string): SentryAlert => ({
    id: 'snt-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5),
    type,
    severity,
    pattern,
    location: pageTitle || pageUrl,
    text: excerpt.substring(0, 200),
    url: pageUrl,
    timestamp: Date.now(),
    dismissed: false,
  });

  // — Phishing check
  for (const re of PHISHING_URGENCY) {
    const m = text.match(re);
    if (m) {
      alerts.push(mkAlert('PHISHING', 'high', re.source, m[0]));
      break; // one phishing alert per page
    }
  }

  // — PII check
  for (const { name, regex } of PII_PATTERNS) {
    const m = text.match(regex);
    if (m) {
      const masked = m[0].replace(/\d(?=\d{4})/g, '•');
      alerts.push(mkAlert('PII', 'medium', name, name + ' detected: ' + masked));
    }
  }

  // — Prompt injection
  for (const re of INJECTION_PATTERNS) {
    const m = text.match(re);
    if (m) {
      alerts.push(mkAlert('INJECTION', 'critical', re.source, m[0]));
      break;
    }
  }

  // — Malware URL check on the page URL
  for (const re of MALWARE_URL_PATTERNS) {
    if (re.test(pageUrl)) {
      alerts.push(mkAlert('MALWARE_URL', 'critical', re.source, pageUrl));
      break;
    }
  }

  const riskScore = Math.min(100,
    alerts.reduce((acc, a) =>
      acc + (a.severity === 'critical' ? 40 : a.severity === 'high' ? 25 : a.severity === 'medium' ? 10 : 5), 0)
  );

  const summary = alerts.length === 0
    ? '✓ No threats detected'
    : '⚠ ' + alerts.length + ' threat' + (alerts.length > 1 ? 's' : '') + ' — ' + alerts.map(a => a.type).join(', ');

  return { url: pageUrl, alerts, riskScore, summary };
}

/* ----------------------------------------------------------
 *  Persistent alert log
 * ---------------------------------------------------------- */

async function loadAlerts(): Promise<SentryAlert[]> {
  return new Promise(r => chrome.storage.local.get([STORAGE_KEY], d => r((d[STORAGE_KEY] as SentryAlert[]) || [])));
}

async function saveAlerts(alerts: SentryAlert[]): Promise<void> {
  return new Promise(r => chrome.storage.local.set({ [STORAGE_KEY]: alerts }, r));
}

export async function persistAlerts(newAlerts: SentryAlert[]): Promise<void> {
  if (!newAlerts.length) return;
  const existing = await loadAlerts();
  const merged = [...newAlerts, ...existing].slice(0, MAX_ALERTS);
  await saveAlerts(merged);
}

export async function getAlertHistory(limit = 50): Promise<SentryAlert[]> {
  const alerts = await loadAlerts();
  return alerts.slice(0, limit);
}

export async function dismissAlert(id: string): Promise<void> {
  const alerts = await loadAlerts();
  const a = alerts.find(x => x.id === id);
  if (a) { a.dismissed = true; await saveAlerts(alerts); }
}

export async function clearAlerts(): Promise<void> {
  await saveAlerts([]);
}
