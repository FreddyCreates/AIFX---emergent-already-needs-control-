import crypto from 'node:crypto';

/**
 * @typedef {'express' | 'standard' | 'sovereign'} OnboardingMode
 */

/**
 * @typedef {Object} OnboardingSession
 * @property {string} sessionId
 * @property {string} companyName
 * @property {OnboardingMode} mode
 * @property {string} status - 'in_progress' | 'completed' | 'failed'
 * @property {Object} companyData
 * @property {Map<string, Object>} steps
 * @property {string} createdAt
 * @property {string} [completedAt]
 */

const MODE_STEPS = {
  express: ['basic_info', 'api_credentials', 'confirmation'],
  standard: ['basic_info', 'company_profile', 'team_setup', 'api_credentials', 'billing', 'confirmation'],
  sovereign: [
    'basic_info',
    'company_profile',
    'team_setup',
    'api_credentials',
    'billing',
    'doctrine_alignment',
    'sovereignty_audit',
    'confirmation',
  ],
};

const REQUIRED_FIELDS = {
  express: ['companyName', 'adminEmail'],
  standard: ['companyName', 'adminEmail', 'industry', 'size', 'address'],
  sovereign: ['companyName', 'adminEmail', 'industry', 'size', 'address', 'doctrineAcceptance', 'jurisdictionId'],
};

/**
 * Manages company onboarding across three escalation modes:
 * - **express**: minimal-friction, fewest fields
 * - **standard**: full company profile
 * - **sovereign**: full profile + doctrine alignment & sovereignty audit
 */
export class CompanyOnboarding {
  constructor() {
    /** @type {Map<string, OnboardingSession>} */
    this._sessions = new Map();
  }

  /**
   * Validate required fields for the given mode.
   * @param {Object} companyData
   * @param {OnboardingMode} mode
   * @returns {string[]} missing field names (empty if valid)
   */
  _validate(companyData, mode) {
    const required = REQUIRED_FIELDS[mode] ?? [];
    return required.filter((f) => companyData[f] === undefined || companyData[f] === '');
  }

  /**
   * Start a new onboarding session.
   *
   * @param {Object} companyData - Company information payload
   * @param {OnboardingMode} mode - `express` | `standard` | `sovereign`
   * @returns {{ sessionId: string, mode: OnboardingMode, steps: string[], status: string }}
   */
  beginOnboarding(companyData, mode = 'standard') {
    if (!MODE_STEPS[mode]) {
      throw new Error(`Invalid onboarding mode "${mode}". Use: express, standard, sovereign`);
    }

    const missing = this._validate(companyData, mode);
    if (missing.length > 0) {
      throw new Error(`Missing required fields for "${mode}" mode: ${missing.join(', ')}`);
    }

    const sessionId = crypto.randomUUID();
    const steps = new Map();
    for (const step of MODE_STEPS[mode]) {
      steps.set(step, { status: 'pending', data: null, completedAt: null });
    }

    /** @type {OnboardingSession} */
    const session = {
      sessionId,
      companyName: companyData.companyName,
      mode,
      status: 'in_progress',
      companyData: { ...companyData },
      steps,
      createdAt: new Date().toISOString(),
      completedAt: null,
    };

    this._sessions.set(sessionId, session);

    return {
      sessionId,
      mode,
      steps: MODE_STEPS[mode],
      status: 'in_progress',
    };
  }

  /**
   * Mark a single onboarding step as complete.
   *
   * @param {string} sessionId
   * @param {string} stepName
   * @param {Object} [data={}] - Step-specific payload
   * @returns {{ sessionId: string, step: string, status: string, remainingSteps: string[] }}
   */
  completeStep(sessionId, stepName, data = {}) {
    const session = this._sessions.get(sessionId);
    if (!session) throw new Error(`Onboarding session "${sessionId}" not found`);
    if (session.status === 'completed') throw new Error('Onboarding already completed');

    if (!session.steps.has(stepName)) {
      throw new Error(`Step "${stepName}" does not exist in ${session.mode} onboarding`);
    }

    const stepEntry = session.steps.get(stepName);
    if (stepEntry.status === 'completed') {
      throw new Error(`Step "${stepName}" is already completed`);
    }

    stepEntry.status = 'completed';
    stepEntry.data = data;
    stepEntry.completedAt = new Date().toISOString();

    const remainingSteps = [...session.steps.entries()]
      .filter(([, v]) => v.status !== 'completed')
      .map(([k]) => k);

    return { sessionId, step: stepName, status: 'completed', remainingSteps };
  }

  /**
   * Finalize the onboarding session and produce a company record.
   *
   * @param {string} sessionId
   * @returns {{ companyId: string, companyName: string, mode: OnboardingMode, status: string, record: Object, completedAt: string }}
   */
  finalize(sessionId) {
    const session = this._sessions.get(sessionId);
    if (!session) throw new Error(`Onboarding session "${sessionId}" not found`);

    const incomplete = [...session.steps.entries()]
      .filter(([, v]) => v.status !== 'completed')
      .map(([k]) => k);

    if (incomplete.length > 0) {
      throw new Error(`Cannot finalize — incomplete steps: ${incomplete.join(', ')}`);
    }

    session.status = 'completed';
    session.completedAt = new Date().toISOString();

    const companyId = crypto.randomUUID();

    const record = {
      companyId,
      companyName: session.companyName,
      mode: session.mode,
      companyData: session.companyData,
      stepData: Object.fromEntries(
        [...session.steps.entries()].map(([k, v]) => [k, v.data]),
      ),
      onboardedAt: session.completedAt,
    };

    return {
      companyId,
      companyName: session.companyName,
      mode: session.mode,
      status: 'completed',
      record,
      completedAt: session.completedAt,
    };
  }

  /**
   * Return current progress for an onboarding session.
   *
   * @param {string} sessionId
   * @returns {{ sessionId: string, mode: OnboardingMode, status: string, progress: Object, completedSteps: string[], remainingSteps: string[] }}
   */
  getStatus(sessionId) {
    const session = this._sessions.get(sessionId);
    if (!session) throw new Error(`Onboarding session "${sessionId}" not found`);

    const completedSteps = [];
    const remainingSteps = [];
    for (const [name, entry] of session.steps) {
      (entry.status === 'completed' ? completedSteps : remainingSteps).push(name);
    }

    const totalSteps = session.steps.size;
    const pct = totalSteps === 0 ? 100 : Math.round((completedSteps.length / totalSteps) * 100);

    return {
      sessionId,
      mode: session.mode,
      status: session.status,
      progress: {
        total: totalSteps,
        completed: completedSteps.length,
        remaining: remainingSteps.length,
        percentComplete: pct,
      },
      completedSteps,
      remainingSteps,
    };
  }
}

export default CompanyOnboarding;
