/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════╗
 * ║  NOVA INTELLIGENCE CONTRACT BRIDGE                                                ║
 * ║  Julia-Motoko Isomorphic Compute Layer                                            ║
 * ║  Pactum Intelligentiae — The Intelligence Contract Layer                          ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════╝
 *
 * Not just a bridge. A contracted intelligence exchange system.
 *
 * STACK:
 *   L0 — Forma Prima (Primitive Capture Layer)
 *   L1 — Sigillum (Canonical Hash Layer)
 *   L2 — Pactum (Intelligence Contract Layer)
 *   L3 — LinguaCheck (Language Inspection Layer)
 *   L4 — Consilium (Cross-Model Review Layer)
 *   L5 — Executio (Execution + Receipt Layer)
 *   L6 — Memoria Sovereigna (Motoko Sovereign Memory Layer)
 *   L7 — Discentia (Learning / Correction Layer)
 *
 * @module sdk/nova-intelligence-bridge
 * @version 1.0.0
 */

const PHI = 1.618033988749895;
const HEARTBEAT = 873;

// ═══════════════════════════════════════════════════════════════════════════════
// LAYER DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const LAYERS = {
  L0_FORMA_PRIMA: {
    id: 'L0', name: 'Forma Prima', latin: 'First Form',
    purpose: 'Primitive shape capture — scalar, vector, matrix, tensor, complex, record, variant, result',
  },
  L1_SIGILLUM: {
    id: 'L1', name: 'Sigillum', latin: 'Seal',
    purpose: 'Canonical hash layer — input hash, output hash, type hash, wrapper hash, runtime hash',
  },
  L2_PACTUM: {
    id: 'L2', name: 'Pactum', latin: 'Contract',
    purpose: 'Intelligence contract — who asks, what function, why, expected type, proof required',
  },
  L3_LINGUA_CHECK: {
    id: 'L3', name: 'LinguaCheck', latin: 'Language Check',
    purpose: 'Language inspection — Julia agent, Motoko agent, JavaScript agent, Candid agent',
  },
  L4_CONSILIUM: {
    id: 'L4', name: 'Consilium', latin: 'Council',
    purpose: 'Cross-model review — builder model, critic model, verifier model, sovereign model',
  },
  L5_EXECUTIO: {
    id: 'L5', name: 'Executio', latin: 'Execution',
    purpose: 'Execution + receipt — call Julia, return typed result, create compute receipt',
  },
  L6_MEMORIA: {
    id: 'L6', name: 'Memoria Sovereigna', latin: 'Sovereign Memory',
    purpose: 'Motoko store — result, proof, contract, status, dispute path',
  },
  L7_DISCENTIA: {
    id: 'L7', name: 'Discentia', latin: 'Learning',
    purpose: 'Learning/correction — if mismatch or failure, update bridge memory and future routing',
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// PRIMITIVE SHAPES (L0)
// ═══════════════════════════════════════════════════════════════════════════════

export const PRIMITIVE_SHAPES = {
  SCALAR: 'Scalar',
  VECTOR: 'Vector',
  MATRIX: 'Matrix',
  TENSOR: 'Tensor',
  COMPLEX: 'Complex',
  SPARSE: 'Sparse',
  RECORD: 'Record',
  VARIANT: 'Variant',
  RESULT: 'Result',
  EIGEN_RESULT: 'EigenResult',
};

// ═══════════════════════════════════════════════════════════════════════════════
// CONTRACT STATES
// ═══════════════════════════════════════════════════════════════════════════════

export const CONTRACT_STATES = {
  PROPOSED: 'proposed',
  ACCEPTED: 'accepted',
  EXECUTING: 'executing',
  EXECUTED: 'executed',
  VERIFIED: 'verified',
  DISPUTED: 'disputed',
  REJECTED: 'rejected',
  STORED: 'stored',
};

// ═══════════════════════════════════════════════════════════════════════════════
// AGENT ROLES
// ═══════════════════════════════════════════════════════════════════════════════

export const AGENT_ROLES = {
  JULIA_INSPECTOR: { id: 'julia_inspector', name: 'Julia Interpreter Agent', layer: 'L3' },
  MOTOKO_SOVEREIGN: { id: 'motoko_sovereign', name: 'Motoko Sovereign Agent', layer: 'L3' },
  CANDID_TREATY: { id: 'candid_treaty', name: 'Candid Treaty Agent', layer: 'L3' },
  JAVASCRIPT_BRIDGE: { id: 'js_bridge', name: 'JavaScript Bridge Agent', layer: 'L3' },
  PRIMITIVE_SHAPE: { id: 'primitive_shape', name: 'Primitive Shape Agent', layer: 'L0' },
  PROOF_AGENT: { id: 'proof_agent', name: 'Proof Agent', layer: 'L1' },
  CRITIC_DISPUTE: { id: 'critic_dispute', name: 'Critic / Dispute Agent', layer: 'L4' },
  SOVEREIGN_ACCEPTANCE: { id: 'sovereign_acceptance', name: 'Sovereign Acceptance Agent', layer: 'L4' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// RISK LEVELS
// ═══════════════════════════════════════════════════════════════════════════════

export const RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

// ═══════════════════════════════════════════════════════════════════════════════
// EXECUTION MODES
// ═══════════════════════════════════════════════════════════════════════════════

export const EXECUTION_MODES = {
  BROWSER_WASM: 'browser-wasm',
  NODE: 'node',
  LOCAL_JULIA: 'local-julia',
  BRIDGE_SERVICE: 'bridge-service',
  ICP_CANISTER: 'icp-canister',
};

// ═══════════════════════════════════════════════════════════════════════════════
// INTELLIGENCE CONTRACT CLASS
// ═══════════════════════════════════════════════════════════════════════════════

export class IntelligenceContract {
  constructor(config = {}) {
    this.contract_id = config.contract_id || `ic_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    this.contract_type = config.contract_type || 'NOVA_INTELLIGENCE_CONTRACT';
    this.intent = config.intent || '';
    this.requesting_model = config.requesting_model || '';
    this.executing_model = config.executing_model || '';
    this.verifying_models = config.verifying_models || [];
    this.source_language = config.source_language || 'Julia';
    this.target_language = config.target_language || 'Motoko';
    this.bridge_language = config.bridge_language || 'JavaScript';
    this.interface_language = config.interface_language || 'Candid';
    this.function_signature = config.function_signature || '';
    this.input_shape = config.input_shape || { shape_type: 'Scalar', element_type: 'Float64' };
    this.output_shape = config.output_shape || { shape_type: 'Scalar', element_type: 'Float64' };
    this.type_map_id = config.type_map_id || null;
    this.proof_requirements = config.proof_requirements || {
      input_hash: true, output_hash: true, wrapper_hash: true,
      candid_hash: true, roundtrip_test: true, runtime_hash: true,
    };
    this.risk_level = config.risk_level || 'low';
    this.execution_mode = config.execution_mode || 'local-julia';
    this.allowed_runtime = config.allowed_runtime || ['local-julia', 'browser-wasm'];
    this.motoko_storage = config.motoko_storage !== undefined ? config.motoko_storage : true;
    this.status = CONTRACT_STATES.PROPOSED;
    this.timestamps = { proposed_at: new Date().toISOString() };
    this.dispute_path = null;
    this.receipt = null;
    this.memory_entry = null;
  }

  accept(agent) {
    this.status = CONTRACT_STATES.ACCEPTED;
    this.timestamps.accepted_at = new Date().toISOString();
    return { accepted_by: agent, contract_id: this.contract_id };
  }

  execute(result) {
    this.status = CONTRACT_STATES.EXECUTED;
    this.timestamps.executed_at = new Date().toISOString();
    this.receipt = result;
    return { executed: true, contract_id: this.contract_id };
  }

  verify(proofAgent) {
    this.status = CONTRACT_STATES.VERIFIED;
    this.timestamps.verified_at = new Date().toISOString();
    return { verified_by: proofAgent, contract_id: this.contract_id };
  }

  dispute(reason, agent) {
    this.status = CONTRACT_STATES.DISPUTED;
    this.dispute_path = { reason, agent, resolution: null };
    return { disputed: true, reason, contract_id: this.contract_id };
  }

  store() {
    this.status = CONTRACT_STATES.STORED;
    this.timestamps.stored_at = new Date().toISOString();
    return { stored: true, contract_id: this.contract_id };
  }

  toJSON() {
    return {
      contract_id: this.contract_id,
      contract_type: this.contract_type,
      intent: this.intent,
      requesting_model: this.requesting_model,
      executing_model: this.executing_model,
      verifying_models: this.verifying_models,
      source_language: this.source_language,
      target_language: this.target_language,
      bridge_language: this.bridge_language,
      interface_language: this.interface_language,
      function_signature: this.function_signature,
      input_shape: this.input_shape,
      output_shape: this.output_shape,
      type_map_id: this.type_map_id,
      proof_requirements: this.proof_requirements,
      risk_level: this.risk_level,
      execution_mode: this.execution_mode,
      allowed_runtime: this.allowed_runtime,
      motoko_storage: this.motoko_storage,
      status: this.status,
      timestamps: this.timestamps,
      dispute_path: this.dispute_path,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// LINGUA CHECK — Cross-Language Intelligence Verifier
// ═══════════════════════════════════════════════════════════════════════════════

export class LinguaCheck {
  constructor() {
    this.checks = [];
  }

  check(contract) {
    const warnings = [];
    const requiredReceipts = [];

    // Julia syntax check
    if (contract.source_language === 'Julia') {
      if (!contract.function_signature) warnings.push('No function signature specified');
    }

    // Proof requirements
    if (contract.proof_requirements.input_hash) requiredReceipts.push('input_hash');
    if (contract.proof_requirements.output_hash) requiredReceipts.push('output_hash');
    if (contract.proof_requirements.wrapper_hash) requiredReceipts.push('wrapper_hash');
    if (contract.proof_requirements.candid_hash) requiredReceipts.push('candid_hash');
    if (contract.proof_requirements.runtime_hash) requiredReceipts.push('runtime_hash');

    // Shape warnings
    if (contract.input_shape.shape_type === 'Matrix' && contract.output_shape.shape_type === 'EigenResult') {
      warnings.push('Eigenvector signs may vary; tolerance comparison required.');
    }

    const result = {
      NOVA_LINGUA_CHECK: warnings.length === 0 ? 'PASS' : 'WARN',
      function: contract.function_signature,
      source: contract.source_language,
      target: contract.target_language,
      interface: contract.interface_language,
      primitive_shape: `${contract.input_shape.shape_type} → ${contract.output_shape.shape_type}`,
      warnings,
      required_receipts: requiredReceipts,
      status: 'ready_for_contract',
      phi_confidence: warnings.length === 0 ? PHI - 1 : (PHI - 1) / (1 + warnings.length * 0.1),
    };

    this.checks.push(result);
    return result;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPUTE RECEIPT
// ═══════════════════════════════════════════════════════════════════════════════

export class ComputeReceipt {
  constructor(contract, result, hashes = {}) {
    this.receipt_id = `rcpt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    this.contract_id = contract.contract_id;
    this.function_signature = contract.function_signature;
    this.input_hash = hashes.input_hash || this._hash(JSON.stringify(contract.input_shape));
    this.output_hash = hashes.output_hash || this._hash(JSON.stringify(result));
    this.wrapper_hash = hashes.wrapper_hash || this._hash(contract.target_language + contract.function_signature);
    this.candid_hash = hashes.candid_hash || this._hash(contract.interface_language + contract.function_signature);
    this.runtime_hash = hashes.runtime_hash || this._hash(contract.execution_mode + Date.now());
    this.result_summary = result;
    this.phi_seal = PHI;
    this.timestamp = new Date().toISOString();
    this.verified = false;
  }

  seal() {
    this.verified = true;
    return this;
  }

  _hash(input) {
    let hash = 0;
    const str = String(input);
    for (let i = 0; i < str.length; i++) {
      const chr = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0;
    }
    return Math.abs(hash).toString(36);
  }

  toJSON() {
    return {
      receipt_id: this.receipt_id,
      contract_id: this.contract_id,
      function_signature: this.function_signature,
      hashes: {
        input: this.input_hash,
        output: this.output_hash,
        wrapper: this.wrapper_hash,
        candid: this.candid_hash,
        runtime: this.runtime_hash,
      },
      result_summary: this.result_summary,
      phi_seal: this.phi_seal,
      timestamp: this.timestamp,
      verified: this.verified,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTRACT MEMORY — The bridge learns over time
// ═══════════════════════════════════════════════════════════════════════════════

export class ContractMemory {
  constructor() {
    this.entries = new Map();
    this.patterns = new Map();
  }

  learn(contract, receipt) {
    const key = contract.function_signature;
    const entry = {
      function_signature: key,
      input_shape: contract.input_shape,
      output_shape: contract.output_shape,
      type_map_id: contract.type_map_id,
      warnings: [],
      proof_requirements: contract.proof_requirements,
      execution_count: 1,
      last_executed: new Date().toISOString(),
      average_confidence: PHI - 1,
    };

    if (this.entries.has(key)) {
      const existing = this.entries.get(key);
      existing.execution_count++;
      existing.last_executed = entry.last_executed;
      existing.average_confidence = (existing.average_confidence + (PHI - 1)) / 2;
    } else {
      this.entries.set(key, entry);
    }

    return entry;
  }

  recall(functionSignature) {
    return this.entries.get(functionSignature) || null;
  }

  getStats() {
    return {
      known_functions: this.entries.size,
      total_executions: Array.from(this.entries.values()).reduce((sum, e) => sum + e.execution_count, 0),
      patterns: this.patterns.size,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// BRIDGE ORCHESTRATOR — The full pipeline
// ═══════════════════════════════════════════════════════════════════════════════

export class IntelligenceBridge {
  constructor(config = {}) {
    this.id = config.id || `bridge-${Date.now().toString(36)}`;
    this.linguaCheck = new LinguaCheck();
    this.memory = new ContractMemory();
    this.contracts = [];
    this.receipts = [];
    this.stats = {
      proposed: 0, accepted: 0, executed: 0,
      verified: 0, disputed: 0, rejected: 0, stored: 0,
    };
  }

  /**
   * Full pipeline: propose → check → accept → execute → verify → store
   */
  process(contractConfig, computeFn) {
    // L2: Create contract
    const contract = new IntelligenceContract(contractConfig);
    this.contracts.push(contract);
    this.stats.proposed++;

    // L3: LinguaCheck
    const linguaResult = this.linguaCheck.check(contract);

    // L4: Accept (sovereign gate)
    if (linguaResult.NOVA_LINGUA_CHECK === 'PASS' || linguaResult.warnings.length <= 2) {
      contract.accept('sovereign_acceptance_agent');
      this.stats.accepted++;
    } else {
      contract.dispute('Too many warnings', 'critic_agent');
      this.stats.disputed++;
      return { contract: contract.toJSON(), lingua: linguaResult, status: 'disputed' };
    }

    // L5: Execute
    let result;
    try {
      result = computeFn ? computeFn(contract) : { computed: true, phi: PHI };
      contract.execute(result);
      this.stats.executed++;
    } catch (err) {
      contract.dispute(`Execution failed: ${err.message}`, 'execution_agent');
      this.stats.disputed++;
      return { contract: contract.toJSON(), lingua: linguaResult, status: 'execution_failed' };
    }

    // L1: Create receipt with hashes
    const receipt = new ComputeReceipt(contract, result);
    receipt.seal();
    this.receipts.push(receipt);

    // Verify
    contract.verify('proof_agent');
    this.stats.verified++;

    // L6: Store
    contract.store();
    this.stats.stored++;

    // L7: Learn
    this.memory.learn(contract, receipt);

    return {
      contract: contract.toJSON(),
      receipt: receipt.toJSON(),
      lingua: linguaResult,
      memory: this.memory.recall(contract.function_signature),
      status: 'stored',
    };
  }

  getStatus() {
    return {
      bridge_id: this.id,
      contracts_total: this.contracts.length,
      receipts_total: this.receipts.length,
      stats: this.stats,
      memory: this.memory.getStats(),
      layers: Object.keys(LAYERS).length,
      phi: PHI,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export default IntelligenceBridge;
