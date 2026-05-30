import { ToolSchemaBuilder } from '../tool-schema.js';

/**
 * TOOL-023: DOCTRINE-AUDITOR
 * Family: Sentry
 *
 * Audits organism behavior against the 40 architectural laws and
 * the sovereign doctrine. Detects law violations, governance drift,
 * and doctrine misalignment across all organism layers.
 *
 * The Sentry family protects the organism. Where SENTINEL-WATCH guards
 * against external threats, DOCTRINE-AUDITOR guards against internal drift.
 * It ensures the organism remains true to its own laws — the immune system
 * of the architecture itself.
 *
 * Primitive function: Governance audit / Law compliance / Doctrine alignment
 * Organism role: The organism's conscience — architectural self-regulation
 * Resonance: Feeds violations into INTEGRITY-CHECKER and BOUNDARY-ENFORCER
 *
 * @module tools/doctrine-auditor
 */

export const DoctrineAuditorSchema = ToolSchemaBuilder.create({
  callId: 'TOOL-023',
  name: 'DOCTRINE-AUDITOR',
  displayName: 'Doctrine Auditor',
  purpose: 'Audit organism behavior against 40 architectural laws and sovereign doctrine — detect violations and governance drift',
  permissionClass: 'organism.governance.read',
  family: 'Sentry',
  inputSchema: [
    { name: 'action', type: 'string', required: true, description: 'Action: "audit" | "check-law" | "drift-report" | "compliance-score"' },
    { name: 'lawId', type: 'string', required: false, description: 'Specific architectural law ID to check (e.g. "AL-019")' },
    { name: 'scope', type: 'string', required: false, description: 'Audit scope: "structural" | "visual" | "state" | "runtime" | "all"', defaultValue: 'all' },
    { name: 'includeEvidence', type: 'boolean', required: false, description: 'Include evidence for each finding', defaultValue: true },
  ],
  outputSchema: [
    { name: 'status', type: 'string', required: true, description: 'ok | violations-found | critical-drift | error' },
    { name: 'complianceScore', type: 'number', required: true, description: 'Overall compliance score (0-100)' },
    { name: 'lawsChecked', type: 'number', required: true, description: 'Number of architectural laws audited' },
    { name: 'violations', type: 'array', required: true, description: 'Array of { lawId, severity, description, evidence }' },
    { name: 'driftVector', type: 'object', required: false, description: 'Governance drift direction and magnitude' },
    { name: 'timestamp', type: 'number', required: true, description: 'Unix timestamp' },
  ],
  latencyExpectation: 600,
  costWeight: 4,
  successContract: 'Returns compliance score with per-law violation details and evidence',
  failureContract: 'Returns status "critical-drift" if fundamental doctrine alignment is broken',
  housePlacement: 'Counsel Ring',
  exposure: 'INTERNAL_SOVEREIGN',
  version: '1.0.0',
  endpointProtocol: 'intelligence-wire/doctrine-auditor',
  billingClass: 'metered',
  trustTier: 'critical',
  sdkDependencies: ['@medina/organism-runtime-sdk'],
  lawsEnforced: ['AL-021', 'AL-037', 'AL-038', 'AL-039', 'AL-040'],
});

/**
 * Default handler for DOCTRINE-AUDITOR.
 * Audits all 40 architectural laws or a specific law.
 */
export async function doctrineAuditorHandler(input) {
  const allLaws = [];
  for (let i = 1; i <= 40; i++) {
    allLaws.push(`AL-${String(i).padStart(3, '0')}`);
  }

  const lawsToCheck = input.lawId ? [input.lawId] : allLaws;
  const violations = [];

  // Synthetic audit — in production this checks real organism compliance
  for (const lawId of lawsToCheck) {
    // All laws pass in default handler
    // Real implementation would check organism state against each law
  }

  const complianceScore = lawsToCheck.length > 0
    ? Math.round(((lawsToCheck.length - violations.length) / lawsToCheck.length) * 100)
    : 100;

  return {
    status: violations.length === 0 ? 'ok' : 'violations-found',
    complianceScore,
    lawsChecked: lawsToCheck.length,
    violations,
    driftVector: { magnitude: 0, direction: 'aligned' },
    timestamp: Date.now(),
  };
}

export default DoctrineAuditorSchema;
