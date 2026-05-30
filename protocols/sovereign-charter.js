/**
 * PROTO-227: Sovereign Charter Protocol (SCP)
 *
 * The hierarchical covenant that binds all sovereign protocols into a living
 * system.  The charter defines:
 *
 *   1. Protocol hierarchy — 5 tiers from foundational physics to sovereign access
 *   2. Inter-protocol dependencies (directed acyclic graph)
 *   3. Binding rules — which protocols can call which
 *   4. Canister bindings — which Motoko canisters embody which protocols
 *   5. Log covenant — immutable event log shared across the sovereign stack
 *   6. Charter activation sequence — ordered boot protocol
 *
 * The charter does not "govern" the protocols — it IS the organism's self-
 * knowledge of its own architecture.  Every component that reads the charter
 * knows exactly where it sits in the sovereign topology.
 *
 * ── Five Tiers ────────────────────────────────────────────────────────────────
 *
 *   Tier I  — Foundations (PROTO-001…011, PROTO-204)
 *     The physical laws of the organism: phi-math, HMAC, resonance, lifecycle.
 *     Nothing depends on these depending on something above them.
 *
 *   Tier II — Cognition (PROTO-203, PROTO-210, PROTO-211, PROTO-214…218)
 *     Hebbian learning, mini-brain, neuro-emergence, predictive coding,
 *     attention, memory, reward, homeostatic drive.
 *     Depends on: Tier I.
 *
 *   Tier III — Infrastructure (PROTO-205…209, PROTO-212, PROTO-213, PROTO-219…222)
 *     Vitality, kernel, cross-substrate, synapse, mini-heart, edge sensor,
 *     auto-generate calls, goal stack, artifact generation, meta-learning,
 *     curriculum.
 *     Depends on: Tier I + II.
 *
 *   Tier IV — Intelligence Contracts & Security (PROTO-223…226)
 *     Active intelligence contracts, edge compute, cyber defense,
 *     and the Geometric Key Protocol (sovereignty gate).
 *     Depends on: Tier I + III.
 *
 *   Tier V  — Sovereign Organism (PROTO-181…185, PROTO-227)
 *     AURO charter, guardian intelligence, sovereign cognition, this charter.
 *     Binds everything together — the organism's self-concept.
 *     Depends on: All tiers.
 *
 * @module protocols/sovereign-charter
 * @version 1.0.0
 */

const PHI     = 1.618033988749895;
const PHI_INV = 1 / PHI;

// ── Tier definitions ──────────────────────────────────────────────────────────

const TIERS = {
  I:   { id: 'I',   label: 'Foundations',           weight: PHI ** 4 },
  II:  { id: 'II',  label: 'Cognition',              weight: PHI ** 3 },
  III: { id: 'III', label: 'Infrastructure',         weight: PHI ** 2 },
  IV:  { id: 'IV',  label: 'Intelligence & Security', weight: PHI     },
  V:   { id: 'V',   label: 'Sovereign Organism',     weight: 1        },
};

// ── Protocol registry (expanded sovereign stack including Mycelium family) ─────

const PROTOCOLS = [
  // ── Tier I: Foundations ────────────────────────────────────────────────────
  { id: 'PROTO-001', name: 'SovereignRoutingProtocol',            tier: 'I',   canister: null },
  { id: 'PROTO-002', name: 'EncryptedIntelligenceTransport',      tier: 'I',   canister: null },
  { id: 'PROTO-003', name: 'PhiResonanceSyncProtocol',            tier: 'I',   canister: null },
  { id: 'PROTO-004', name: 'AdaptiveKnowledgeAbsorptionProtocol', tier: 'I',   canister: null },
  { id: 'PROTO-005', name: 'MultiModelFusionProtocol',            tier: 'I',   canister: null },
  { id: 'PROTO-006', name: 'SovereignContractVerificationProtocol', tier: 'I', canister: null },
  { id: 'PROTO-007', name: 'EdgeMeshIntelligenceProtocol',        tier: 'I',   canister: null },
  { id: 'PROTO-008', name: 'VisualSceneIntelligenceProtocol',     tier: 'I',   canister: null },
  { id: 'PROTO-009', name: 'MemoryLineageProtocol',               tier: 'I',   canister: null },
  { id: 'PROTO-010', name: 'OrganismLifecycleProtocol',           tier: 'I',   canister: 'organism' },
  { id: 'PROTO-011', name: 'OrganismMarketplaceProtocol',         tier: 'I',   canister: null },
  { id: 'PROTO-204', name: 'KuramotoOscillatorProtocol',          tier: 'I',   canister: null },

  // ── Tier II: Cognition ─────────────────────────────────────────────────────
  { id: 'PROTO-203', name: 'HebbianLearningProtocol',             tier: 'II',  canister: 'geometry_lock' },
  { id: 'PROTO-210', name: 'MiniBrainProtocol',                   tier: 'II',  canister: null },
  { id: 'PROTO-211', name: 'NeuroEmergenceProtocol',              tier: 'II',  canister: null },
  { id: 'PROTO-214', name: 'PredictiveCodingProtocol',            tier: 'II',  canister: null },
  { id: 'PROTO-215', name: 'AttentionRoutingProtocol',            tier: 'II',  canister: null },
  { id: 'PROTO-216', name: 'MemoryConsolidationProtocol',         tier: 'II',  canister: null },
  { id: 'PROTO-217', name: 'RewardSignalProtocol',                tier: 'II',  canister: null },
  { id: 'PROTO-218', name: 'HomeostaticDriveProtocol',            tier: 'II',  canister: null },

  // ── Tier III: Infrastructure ───────────────────────────────────────────────
  { id: 'PROTO-201', name: 'NeurochemistryODEProtocol',           tier: 'III', canister: null },
  { id: 'PROTO-202', name: 'PatternSynthesisProtocol',            tier: 'III', canister: null },
  { id: 'PROTO-205', name: 'VitalityHomeostasisProtocol',         tier: 'III', canister: null },
  { id: 'PROTO-206', name: 'KernelExecutionProtocol',             tier: 'III', canister: null },
  { id: 'PROTO-207', name: 'CrossSubstrateResonanceProtocol',     tier: 'III', canister: null },
  { id: 'PROTO-208', name: 'SynapseBindingEngineProtocol',        tier: 'III', canister: null },
  { id: 'PROTO-209', name: 'MiniHeartProtocol',                   tier: 'III', canister: null },
  { id: 'PROTO-212', name: 'EdgeSensorProtocol',                  tier: 'III', canister: null },
  { id: 'PROTO-213', name: 'AutoGenerateCallsEngineProtocol',     tier: 'III', canister: 'auto_generate_calls' },
  { id: 'PROTO-219', name: 'GoalStackProtocol',                   tier: 'III', canister: null },
  { id: 'PROTO-220', name: 'ArtifactGenerationProtocol',          tier: 'III', canister: null },
  { id: 'PROTO-221', name: 'MetaLearningProtocol',                tier: 'III', canister: null },
  { id: 'PROTO-222', name: 'CurriculumProtocol',                  tier: 'III', canister: null },

  // ── Tier IV: Intelligence & Security ──────────────────────────────────────
  { id: 'PROTO-223', name: 'IntelligenceContractProtocol',        tier: 'IV',  canister: null },
  { id: 'PROTO-224', name: 'EdgeComputeProtocol',                 tier: 'IV',  canister: null },
  { id: 'PROTO-225', name: 'CyberDefenseProtocol',                tier: 'IV',  canister: null },
  { id: 'PROTO-226', name: 'GeometricKeyProtocol',                tier: 'IV',  canister: 'geometry_lock' },

  // ── Tier V: Sovereign Organism ─────────────────────────────────────────────
  { id: 'PROTO-181', name: 'AuroGuardianIntelligenceProtocol',    tier: 'V',   canister: null },
  { id: 'PROTO-182', name: 'MemoryLineageEnhancementProtocol',    tier: 'V',   canister: null },
  { id: 'PROTO-183', name: 'SovereignOfflineCognitionProtocol',   tier: 'V',   canister: null },
  { id: 'PROTO-184', name: 'OroEngineIntegrationProtocol',        tier: 'V',   canister: null },
  { id: 'PROTO-185', name: 'AuroAbsorptionCharterProtocol',       tier: 'V',   canister: null },
  { id: 'PROTO-227', name: 'SovereignCharterProtocol',            tier: 'V',   canister: null },
  { id: 'PROTO-257', name: 'MyceliumCharterProtocol',            tier: 'V',   canister: null },
  { id: 'PROTO-258', name: 'MyceliumNodeIdentityProtocol',       tier: 'III', canister: null },
  { id: 'PROTO-259', name: 'MyceliumMeshFormationProtocol',      tier: 'III', canister: null },
  { id: 'PROTO-260', name: 'MyceliumRoutingIntelligenceProtocol', tier: 'IV', canister: null },
  { id: 'PROTO-261', name: 'MyceliumTrustReputationProtocol',    tier: 'IV',  canister: null },
  { id: 'PROTO-262', name: 'MyceliumHealingRecoveryProtocol',    tier: 'IV',  canister: null },
  { id: 'PROTO-263', name: 'MyceliumEconomicSignalingProtocol',  tier: 'IV',  canister: null },
  { id: 'PROTO-264', name: 'MyceliumCrossSubstrateExchangeProtocol', tier: 'IV', canister: null },
];

// ── Key dependency edges (non-exhaustive; declares the critical paths) ────────

const DEPENDENCIES = [
  // Tier IV → Tier I foundations
  { from: 'PROTO-226', to: 'PROTO-006', label: 'HMAC / SCVP signing' },
  { from: 'PROTO-226', to: 'PROTO-204', label: 'Kuramoto resonance' },
  { from: 'PROTO-226', to: 'PROTO-223', label: 'EXCHANGE contract lifecycle' },

  // Tier IV → Tier II (Hebbian immune memory)
  { from: 'PROTO-226', to: 'PROTO-203', label: 'LTP/LTD on grant/deny' },

  // Tier IV → Tier III (cyber defense integration)
  { from: 'PROTO-226', to: 'PROTO-225', label: 'attack detection → defensive mode' },

  // Tier II cognition depends on Tier I
  { from: 'PROTO-203', to: 'PROTO-204', label: 'phase-locked synaptic updates' },
  { from: 'PROTO-210', to: 'PROTO-203', label: 'stimulus-response hebbian trace' },
  { from: 'PROTO-211', to: 'PROTO-204', label: 'phase coupling emergence' },

  // Tier III → Tier II
  { from: 'PROTO-205', to: 'PROTO-218', label: 'homeostatic drive signal' },
  { from: 'PROTO-209', to: 'PROTO-205', label: 'vitals → homeostasis' },
  { from: 'PROTO-208', to: 'PROTO-203', label: 'imprint permanence potentiation' },

  // Tier V binds everything
  { from: 'PROTO-227', to: 'PROTO-226', label: 'sovereign access gate' },
  { from: 'PROTO-227', to: 'PROTO-181', label: 'guardian intelligence' },
  { from: 'PROTO-227', to: 'PROTO-185', label: 'absorption charter' },
  { from: 'PROTO-227', to: 'PROTO-210', label: 'mini-brain cognition' },
  { from: 'PROTO-227', to: 'PROTO-208', label: 'synapse binding' },

  // Mycelium family integration
  { from: 'PROTO-257', to: 'PROTO-227', label: 'charter alignment' },
  { from: 'PROTO-257', to: 'PROTO-258', label: 'identity doctrine' },
  { from: 'PROTO-257', to: 'PROTO-259', label: 'topology doctrine' },
  { from: 'PROTO-257', to: 'PROTO-260', label: 'routing doctrine' },
  { from: 'PROTO-257', to: 'PROTO-261', label: 'trust doctrine' },
  { from: 'PROTO-257', to: 'PROTO-262', label: 'failure law' },
  { from: 'PROTO-257', to: 'PROTO-263', label: 'economic signaling law' },
  { from: 'PROTO-257', to: 'PROTO-264', label: 'exchange doctrine' },
];

// ── Canister bindings ─────────────────────────────────────────────────────────

const CANISTERS = {
  organism:            { protocols: ['PROTO-010'],               stable: true,  description: 'Sovereign Organism — 4-register state, synapse binding, heartbeat' },
  geometry_lock:       { protocols: ['PROTO-226', 'PROTO-203'],  stable: true,  description: 'Geometric Key Protocol — intelligence gate, Hebbian immune memory' },
  auto_generate_calls: { protocols: ['PROTO-213'],               stable: false, description: 'Auto-Generate Calls Engine — 12 workers, 3 engines each' },
  jarvisius:           { protocols: [],                          stable: true,  description: 'JARVISIUS — sovereign note, command, document and tab canister' },
};

// ── Immutable event log covenant ──────────────────────────────────────────────
// Every sovereign event (grant, deny, revoke, defensive-mode-change, upgrade)
// must be written to the access log of the responsible canister before returning.
// Log entries are append-only — the charter forbids deletion.

const LOG_COVENANT = {
  format:      '${timestampNs} ${event} ${subject} ${detail}',
  maxEntries:  500,
  appendOnly:  true,
  survivesUpgrade: true,  // must be stable var
  requiredFields: ['timestampNs', 'event', 'subject'],
};

// ── Charter activation sequence ───────────────────────────────────────────────
// Boot order matters. Each stage must complete before the next begins.

const ACTIVATION_SEQUENCE = [
  { stage: 1, label: 'Phi constants',      protocols: ['PROTO-003', 'PROTO-204'],          required: true  },
  { stage: 2, label: 'Lifecycle',          protocols: ['PROTO-010'],                        required: true  },
  { stage: 3, label: 'HMAC & SCVP',        protocols: ['PROTO-006', 'PROTO-002'],           required: true  },
  { stage: 4, label: 'Hebbian cognition',  protocols: ['PROTO-203', 'PROTO-210'],           required: false },
  { stage: 5, label: 'Infrastructure',     protocols: ['PROTO-205', 'PROTO-209', 'PROTO-208'], required: false },
  { stage: 6, label: 'Cyber defense',      protocols: ['PROTO-225'],                        required: false },
  { stage: 7, label: 'Geometry Lock',      protocols: ['PROTO-226'],                        required: true  },
  { stage: 8, label: 'Intelligence Contracts', protocols: ['PROTO-223'],                   required: false },
  { stage: 9, label: 'Sovereign Charter',  protocols: ['PROTO-227'],                        required: true  },
];

// ── SovereignCharterProtocol class ────────────────────────────────────────────

class SovereignCharterProtocol {
  /**
   * @param {object} config
   * @param {string}   [config.id]        - Instance id
   * @param {Function} [config.onStage]   - fn(stage) called at each activation stage
   */
  constructor(config = {}) {
    this.id            = config.id || `charter-${Date.now().toString(36)}`;
    this._onStage      = config.onStage || null;
    this._activated    = false;
    this._stagesCompleted = [];
    this._log          = [];  // charter event log
  }

  // ── Protocol lookup ─────────────────────────────────────────────────────────

  /** Return the protocol record for a given id (e.g. 'PROTO-226'). */
  getProtocol(id) {
    return PROTOCOLS.find(p => p.id === id) || null;
  }

  /** Return all protocols in a tier ('I'…'V'). */
  getByTier(tier) {
    return PROTOCOLS.filter(p => p.tier === tier);
  }

  /** Return all direct dependencies of a protocol. */
  getDependencies(id) {
    return DEPENDENCIES.filter(d => d.from === id).map(d => ({
      ...d,
      target: this.getProtocol(d.to),
    }));
  }

  /** Return all protocols that depend on a given protocol. */
  getDependents(id) {
    return DEPENDENCIES.filter(d => d.to === id).map(d => ({
      ...d,
      source: this.getProtocol(d.from),
    }));
  }

  /** Return canister bindings for a protocol. */
  getCanister(protocolId) {
    const proto = this.getProtocol(protocolId);
    if (!proto?.canister) return null;
    return { canisterId: proto.canister, ...CANISTERS[proto.canister] };
  }

  // ── Activation sequence ─────────────────────────────────────────────────────

  /**
   * Run the charter activation sequence.
   * Calls onStage(stage) at each step if provided.
   * @returns {{ ok: boolean, stages: object[], failedAt?: number }}
   */
  activate() {
    if (this._activated) {
      return { ok: true, stages: this._stagesCompleted, alreadyActivated: true };
    }

    this._appendLog('charter_activation_started');

    for (const stage of ACTIVATION_SEQUENCE) {
      try {
        if (this._onStage) this._onStage(stage);
        this._stagesCompleted.push({ ...stage, completedAt: Date.now(), ok: true });
        this._appendLog(`stage_${stage.stage}_complete: ${stage.label}`);
      } catch (err) {
        this._appendLog(`stage_${stage.stage}_failed: ${stage.label} — ${err.message}`);
        if (stage.required) {
          return { ok: false, stages: this._stagesCompleted, failedAt: stage.stage, error: err.message };
        }
        // Non-required stage failure is logged but doesn't abort
        this._stagesCompleted.push({ ...stage, completedAt: Date.now(), ok: false, error: err.message });
      }
    }

    this._activated = true;
    this._appendLog('charter_activated');
    return { ok: true, stages: this._stagesCompleted };
  }

  // ── Introspection ────────────────────────────────────────────────────────────

  /** Full charter summary. */
  getCharter() {
    return {
      id:         this.id,
      version:    '1.0.0',
      activated:  this._activated,
      protocols:  PROTOCOLS.length,
      tiers:      Object.values(TIERS),
      canisters:  CANISTERS,
      logCovenant: LOG_COVENANT,
      activationSequence: ACTIVATION_SEQUENCE,
      phi: PHI,
      phiInv: PHI_INV,
    };
  }

  /** Dependency graph (nodes + edges) for visualisation. */
  getDependencyGraph() {
    return {
      nodes: PROTOCOLS.map(p => ({
        id:     p.id,
        label:  p.name,
        tier:   p.tier,
        weight: TIERS[p.tier]?.weight || 1,
        canister: p.canister,
      })),
      edges: DEPENDENCIES,
    };
  }

  getLog() { return [...this._log]; }

  _appendLog(entry) {
    this._log.push({ entry, at: Date.now() });
    if (this._log.length > 500) this._log.shift();
  }
}

export {
  SovereignCharterProtocol,
  TIERS,
  PROTOCOLS,
  DEPENDENCIES,
  CANISTERS,
  LOG_COVENANT,
  ACTIVATION_SEQUENCE,
};
export default SovereignCharterProtocol;
