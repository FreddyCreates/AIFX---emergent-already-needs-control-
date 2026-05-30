/**
 * Vigil AI — WorkflowSkill
 * ════════════════════════
 * Native workflow state machine wired directly into VigilEngine.
 * Same dispatch protocol as background/index.ts: { action, payload, agent }
 *
 * In-browser role:
 *   - Tracks active workflow state (mirrors workflowState on VigilEngine)
 *   - Receives workflow step results pushed from the Node.js runner via
 *     chrome.storage.local / chrome.runtime messaging
 *   - Reports progress to the sidepanel UI via _workflowProgress push
 *
 * CLI/Node.js role (via scripts/workflow-runner.js):
 *   - Same action registry, same dispatch table
 *   - Runs shell commands, builds, packages, deploys
 *
 * The shared WorkflowAction type IS the protocol — exactly like
 * VigilEngine's { action, payload, agent } pattern.
 */

export type WorkflowStatus = 'idle' | 'running' | 'done' | 'failed';

export interface WorkflowAction {
  action:   string;
  payload:  Record<string, unknown>;
  agent:    string;
  failFast: boolean;
}

export interface WorkflowStepResult {
  action:    string;
  success:   boolean;
  message:   string;
  data?:     Record<string, unknown>;
  timestamp: number;
}

export interface WorkflowState {
  name:        string;
  status:      WorkflowStatus;
  steps:       WorkflowAction[];
  stepIndex:   number;
  results:     WorkflowStepResult[];
  startedAt:   number;
  completedAt: number | null;
  awareness:   number;   // MiniBrain-style: grows with PHI as steps complete
}

const PHI = 1.618033988749895;
const STORAGE_KEY = 'vigil_workflow_state';

let _state: WorkflowState = {
  name: '', status: 'idle', steps: [], stepIndex: 0,
  results: [], startedAt: 0, completedAt: null, awareness: 0,
};

// ── State accessors ────────────────────────────────────────────────────────────

export function getWorkflowState(): WorkflowState { return { ..._state }; }
export function isWorkflowRunning(): boolean { return _state.status === 'running'; }

// ── Load persisted state on boot ───────────────────────────────────────────────

export function initWorkflowSkill(): void {
  try {
    chrome.storage.local.get(STORAGE_KEY, data => {
      const saved = data[STORAGE_KEY] as WorkflowState | undefined;
      if (saved) _state = saved;
    });
  } catch { /* non-browser env — no-op */ }
}

// ── Start a workflow (triggered by chat intent or background action) ───────────

export function startWorkflow(name: string, steps: WorkflowAction[]): void {
  _state = {
    name, status: 'running', steps, stepIndex: 0,
    results: [], startedAt: Date.now(), completedAt: null, awareness: 0,
  };
  _persist();
  _notify();
}

// ── Record a completed step (pushed by workflow-runner.js via native messaging
//    or by direct in-extension execution for lightweight steps) ───────────────

export function recordStep(result: WorkflowStepResult): void {
  _state.results.push(result);
  _state.stepIndex = _state.results.length;

  // Awareness grows with PHI — mirrors MiniBrain.stimulus()
  const fired = _state.stepIndex;
  _state.awareness = Math.min(100, Math.round(Math.log(fired + 1) / Math.log(PHI) * 5));

  if (!result.success) {
    const step = _state.steps[_state.stepIndex - 1];
    if (step?.failFast) {
      _state.status = 'failed';
      _state.completedAt = Date.now();
    }
  } else if (_state.stepIndex >= _state.steps.length) {
    _state.status = 'done';
    _state.completedAt = Date.now();
  }

  _persist();
  _notify();
}

// ── Build a human-readable status string (for chat response) ─────────────────

export function workflowStatusText(): string {
  const s = _state;
  if (s.status === 'idle') return 'No workflow running.';

  const elapsed = s.completedAt
    ? ((s.completedAt - s.startedAt) / 1000).toFixed(1) + 's'
    : ((Date.now() - s.startedAt) / 1000).toFixed(1) + 's elapsed';

  const done    = s.results.filter(r => r.success).length;
  const failed  = s.results.filter(r => !r.success).length;
  const total   = s.steps.length;
  const current = s.steps[s.stepIndex]?.action || '—';

  if (s.status === 'running') {
    return `⚡ Workflow "${s.name}" running — step ${s.stepIndex + 1}/${total}: ${current} | ${done} done, ${failed} failed | ${elapsed}`;
  }
  if (s.status === 'done') {
    return `✓ Workflow "${s.name}" complete — ${done}/${total} steps passed in ${elapsed}`;
  }
  if (s.status === 'failed') {
    const lastFail = [...s.results].reverse().find(r => !r.success);
    return `✗ Workflow "${s.name}" failed at step ${s.stepIndex}/${total}: ${lastFail?.message || 'unknown error'} | ${elapsed}`;
  }
  return `Workflow "${s.name}" — ${s.status}`;
}

// ── Available workflows (maps intent → workflow file name) ────────────────────
// Intent keys match VigilEngine.parseCommand() output.

export const WORKFLOW_INTENTS: Record<string, { file: string; description: string }> = {
  'workflow-build':      { file: 'build.json',      description: 'Build and package all extensions' },
  'workflow-deploy-icp': { file: 'deploy-icp.json', description: 'Deploy PWA to Internet Computer Protocol' },
  'workflow-status':     { file: '',                description: 'Show current workflow status' },
};

// ── Private helpers ────────────────────────────────────────────────────────────

function _persist(): void {
  try { chrome.storage.local.set({ [STORAGE_KEY]: _state }); }
  catch { /* non-browser — no-op */ }
}

function _notify(): void {
  try {
    chrome.runtime.sendMessage({
      action: '_workflowProgress',
      state:  getWorkflowState(),
    }).catch(() => {});
  } catch { /* no listeners yet */ }
}
