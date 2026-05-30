/**
 * MissionEngine — Jarvis's internal mission dispatch architecture.
 *
 * This is the engine that runs inside Jarvis. When a mission is issued,
 * MissionEngine:
 *   1. Validates the license (SOVEREIGN_LICENSE)
 *   2. Classifies the mission to the right domain AI
 *   3. Dispatches to that AI's execute() method
 *   4. Records the mission in the mission log
 *   5. Returns a formatted report back to Jarvis
 *
 * Architecture:
 *
 *   Jarvis (executeChat)
 *       ↓  "dispatch mission: ..."
 *   MissionEngine.dispatch()
 *       ↓  classifyMission()
 *   DomainAI.execute()     ← WebAI / BlockchainAI / DataAI / SentryAI / ContextAI / CommanderAI
 *       ↓  ToolInvocation[]
 *   MissionResult           ← returned to Jarvis for formatting + memory
 *
 * The engine also exposes:
 *   - listMissions()      — recent mission history
 *   - getMission(id)      — fetch a specific mission result
 *   - getStatus()         — engine health + license summary
 */

import { SOVEREIGN_LICENSE, LICENSED_TOOLS, isToolLicensed } from './sovereign-license.js';
import {
  classifyMission, DOMAIN_AIS,
  WebAI, BlockchainAI, DataAI, SentryAI, ContextAI, CommanderAI,
  type DomainMission, type DomainAIResult, type DomainAIName,
} from './domain-ais.js';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MissionRecord {
  id: string;
  description: string;
  target?: string;
  domainAI: string;
  status: 'pending' | 'running' | 'complete' | 'failed';
  result?: DomainAIResult;
  issuedAt: number;
  completedAt?: number;
}

export interface MissionEngineStatus {
  licensee: string;
  licensor: string;
  licenseVersion: string;
  toolCount: number;
  families: readonly string[];
  totalMissions: number;
  completedMissions: number;
  failedMissions: number;
  activeMissions: number;
  uptime: number;
  heartbeat: number;
}

export interface DispatchOptions {
  target?: string;
  domainAIOverride?: DomainAIName;
  memoryTurns?: number;
  heartbeat?: number;
  params?: Record<string, unknown>;
}

// ─── MissionEngine ────────────────────────────────────────────────────────────

export class MissionEngine {
  private _missions: Map<string, MissionRecord> = new Map();
  private _bootTime: number = Date.now();
  private _heartbeat: number = 0;
  private _memoryTurns: number = 0;

  /** Max missions kept in memory */
  private static readonly MAX_MISSION_LOG = 50;

  constructor() {
    // Verify license on boot
    if (!SOVEREIGN_LICENSE.licensee || SOVEREIGN_LICENSE.toolCount !== LICENSED_TOOLS.length) {
      throw new Error('MissionEngine: Sovereign Tool License validation failed');
    }
  }

  /** Update internal state from Jarvis heartbeat tick */
  tick(heartbeat: number, memoryTurns: number): void {
    this._heartbeat = heartbeat;
    this._memoryTurns = memoryTurns;
  }

  /**
   * Dispatch a mission to the appropriate domain AI.
   *
   * @param description  Natural language mission description
   * @param options      Optional target URL/address, domain AI override, params
   * @returns            Formatted mission report string (for Jarvis chat output)
   */
  async dispatch(description: string, options: DispatchOptions = {}): Promise<{ report: string; result: DomainAIResult; missionId: string }> {
    const missionId = this._genId();
    const issuedAt = Date.now();

    // Determine the domain AI
    const AI = options.domainAIOverride
      ? DOMAIN_AIS.find(a => a.id === options.domainAIOverride) ?? classifyMission(description)
      : classifyMission(description);

    const mission: DomainMission = {
      id: missionId,
      description,
      target: options.target,
      params: options.params,
      issuedAt,
    };

    // Record mission as pending
    const record: MissionRecord = {
      id: missionId,
      description,
      target: options.target,
      domainAI: AI.id,
      status: 'pending',
      issuedAt,
    };
    this._missions.set(missionId, record);
    this._pruneLog();

    // Execute
    record.status = 'running';
    this._missions.set(missionId, record);
    let result: DomainAIResult;
    try {
      if (AI.id === 'ContextAI') {
        result = await (ContextAI as typeof ContextAI).execute(mission, this._memoryTurns, this._heartbeat);
      } else if (AI.id === 'CommanderAI') {
        result = await (CommanderAI as typeof CommanderAI).execute(mission);
      } else if (AI.id === 'WebAI') {
        result = await (WebAI as typeof WebAI).execute(mission);
      } else if (AI.id === 'BlockchainAI') {
        result = await (BlockchainAI as typeof BlockchainAI).execute(mission);
      } else if (AI.id === 'DataAI') {
        result = await (DataAI as typeof DataAI).execute(mission);
      } else {
        result = await (SentryAI as typeof SentryAI).execute(mission);
      }
      record.status = 'complete';
    } catch (err) {
      record.status = 'failed';
      const errMsg = err instanceof Error ? err.message : String(err);
      result = {
        missionId,
        domainAI: AI.id,
        domainEmoji: '❌',
        status: 'failed',
        toolsUsed: [],
        summary: 'Mission failed: ' + errMsg,
        data: { error: errMsg },
        durationMs: Date.now() - issuedAt,
      };
    }

    record.result = result;
    record.completedAt = Date.now();
    this._missions.set(missionId, record);

    const report = this._formatReport(result, missionId);
    return { report, result, missionId };
  }

  /** Format a DomainAIResult into a readable Jarvis chat response */
  private _formatReport(result: DomainAIResult, missionId: string): string {
    const toolLines = result.toolsUsed.map(t =>
      `  ${t.status === 'ok' ? '✓' : t.status === 'skipped' ? '—' : '✗'} ${t.toolName} (${t.latencyMs}ms)`
    ).join('\n');

    const statusEmoji = result.status === 'complete' ? '✅' : result.status === 'partial' ? '⚠️' : '❌';
    const durationSec = (result.durationMs / 1000).toFixed(2);

    return [
      `${result.domainEmoji} **${result.domainAI}** — Mission \`${missionId}\``,
      '',
      result.summary,
      '',
      `🔧 Tools invoked (${result.toolsUsed.length}):`,
      toolLines,
      '',
      `${statusEmoji} Status: ${result.status} · Duration: ${durationSec}s`,
      '',
      `Licensed via: ${SOVEREIGN_LICENSE.licensor} · ${SOVEREIGN_LICENSE.licenseType}`,
    ].join('\n');
  }

  /** List recent missions (most recent first) */
  listMissions(limit = 10): MissionRecord[] {
    return Array.from(this._missions.values())
      .sort((a, b) => b.issuedAt - a.issuedAt)
      .slice(0, limit);
  }

  /** Get a specific mission by ID */
  getMission(id: string): MissionRecord | undefined {
    return this._missions.get(id);
  }

  /** Engine health + license summary */
  getStatus(): MissionEngineStatus {
    const all = Array.from(this._missions.values());
    return {
      licensee:          SOVEREIGN_LICENSE.licensee,
      licensor:          SOVEREIGN_LICENSE.licensor,
      licenseVersion:    SOVEREIGN_LICENSE.version,
      toolCount:         SOVEREIGN_LICENSE.toolCount,
      families:          SOVEREIGN_LICENSE.families,
      totalMissions:     all.length,
      completedMissions: all.filter(m => m.status === 'complete').length,
      failedMissions:    all.filter(m => m.status === 'failed').length,
      activeMissions:    all.filter(m => m.status === 'running').length,
      uptime:            Date.now() - this._bootTime,
      heartbeat:         this._heartbeat,
    };
  }

  /** Verify a tool callId is covered by the license */
  verifyTool(callId: string): boolean {
    return isToolLicensed(callId);
  }

  /** Get all licensed domain AIs with metadata */
  getAvailableAIs(): Array<{ name: string; emoji: string; description: string; domains: string[]; toolCount: number }> {
    return DOMAIN_AIS.map(AI => ({
      name:        AI.id,
      emoji:       AI.emoji,
      description: AI.description,
      domains:     AI.domains.slice(0, 6),
      toolCount:   AI.tools.length,
    }));
  }

  private _genId(): string {
    return 'mssn-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 7);
  }

  private _pruneLog(): void {
    if (this._missions.size > MissionEngine.MAX_MISSION_LOG) {
      const oldest = Array.from(this._missions.entries())
        .sort(([, a], [, b]) => a.issuedAt - b.issuedAt)
        .slice(0, this._missions.size - MissionEngine.MAX_MISSION_LOG);
      oldest.forEach(([id]) => this._missions.delete(id));
    }
  }
}

/** Singleton — shared across the background service worker */
export const missionEngine = new MissionEngine();
