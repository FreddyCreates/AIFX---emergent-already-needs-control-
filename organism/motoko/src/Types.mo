/// Shared types for the Sovereign Organism canister.
/// 4-register state architecture: Cognitive / Affective / Somatic / Sovereign.

module {

  /// A single register holds named float values representing internal state dimensions.
  public type RegisterState = {
    awareness   : Float;
    coherence   : Float;
    resonance   : Float;
    entropy     : Float;
  };

  /// Full organism snapshot frozen at a point in time.
  public type OrganismSnapshot = {
    beatCount   : Nat;
    cognitive   : RegisterState;
    affective   : RegisterState;
    somatic     : RegisterState;
    sovereign   : RegisterState;
    timestampNs : Int;
  };

  /// Phi-weighted vitality score across all registers.
  public type VitalityScore = {
    overall     : Float;
    cognitive   : Float;
    affective   : Float;
    somatic     : Float;
    sovereign   : Float;
    phiRatio    : Float;
  };

  /// Edge sensor reading from the organism runtime.
  public type SensorReading = {
    sensorId    : Text;
    sensorType  : Text;  // "temperature" | "network" | "resource" | "signal" | "custom"
    value       : Float;
    unit        : Text;
    timestampNs : Int;
  };

  // ── AutoGenerateCallsEngine Types ────────────────────────────────────

  /// Worker Builder AI engine triad (Generator + Router + Builder)
  public type EngineTriad = {
    generator : EngineState;
    router    : EngineState;
    builder   : EngineState;
  };

  /// Individual engine state within a triad
  public type EngineState = {
    name         : Text;
    status       : Text;
    callsRouted  : Nat;
    confidence   : Float;
    lastActiveNs : Int;
  };

  /// Auto-generated call definition
  public type CallDefinition = {
    callId       : Nat;
    callName     : Text;
    domain       : Text;
    targetModule : Text;
    workerName   : Text;
    priority     : Float;
    autoRouted   : Bool;
  };

  /// Worker Builder AI state (one of 12)
  public type WorkerState = {
    id             : Nat;
    name           : Text;
    latinName      : Text;
    domain         : Text;
    engines        : EngineTriad;
    totalCalls     : Nat;
    callsGenerated : Nat;
    healthy        : Bool;
  };

  /// Full AutoGenerateCallsEngine snapshot
  public type AutoGenSnapshot = {
    workers        : [WorkerState];
    totalWorkers   : Nat;
    totalEngines   : Nat;
    totalCalls     : Nat;
    healthyWorkers : Nat;
    timestampNs    : Int;
  };

  /// Call routing result
  public type CallRoutingResult = {
    callName   : Text;
    routedTo   : Text;
    workerUsed : Text;
    engineUsed : Text;
    confidence : Float;
    phiWeight  : Float;
  };

  /// Result of multi-model fusion with phi-weighted scoring.
  public type FusionResult = {
    prompt         : Text;
    fusedOutput    : Text;
    confidence     : Float;
    modelsUsed     : [Text];
    phiWeight      : Float;
    processingMs   : Nat;
  };

  /// Routing result for alpha-model selection.
  public type RoutingResult = {
    task           : Text;
    selectedModel  : Text;
    score          : Float;
    reasoning      : Text;
    alternates     : [Text];
  };

  // ── JARVISIUS Types ──────────────────────────────────────────────────

  /// A note stored in the JARVISIUS sovereign canister.
  public type JarvisNote = {
    id          : Nat;
    content     : Text;
    tags        : [Text];
    source      : Text;   // "extension" | "dashboard" | "voice" | "auto"
    timestampNs : Int;
  };

  /// A command executed through JARVIS.
  public type JarvisCommand = {
    id          : Nat;
    intent      : Text;   // "open_tab" | "close_tab" | "switch_tab" | "navigate" | "screenshot" | "create_pdf" | "take_note" | "search" | "chat" | "alpha_ai"
    payload     : Text;   // URL, tab ID, search query, etc.
    status      : Text;   // "pending" | "executed" | "failed"
    result      : Text;
    alphaAi     : Text;   // which Alpha Script AI handled it (if any)
    timestampNs : Int;
  };

  /// A document (PDF, text) generated or captured by JARVIS.
  public type JarvisDocument = {
    id          : Nat;
    title       : Text;
    docType     : Text;   // "pdf" | "text" | "html" | "screenshot"
    contentHash : Text;   // SHA-256 of the content
    sizeBytes   : Nat;
    source      : Text;   // "generated" | "captured" | "imported"
    timestampNs : Int;
  };

  /// A tab action logged by the JARVIS extension.
  public type JarvisTabAction = {
    id          : Nat;
    action      : Text;   // "opened" | "closed" | "switched" | "navigated" | "captured"
    tabTitle    : Text;
    tabUrl      : Text;
    timestampNs : Int;
  };

  /// Full JARVISIUS canister snapshot.
  public type JarvisSnapshot = {
    owner       : Text;
    tier        : Text;
    beatCount   : Nat;
    totalNotes  : Nat;
    totalCmds   : Nat;
    totalDocs   : Nat;
    totalTabs   : Nat;
    uptimeNs    : Int;
    timestampNs : Int;
  };

  // ── SYN — Synapse Binding Engine Types ──────────────────────────────

  /// Permanent imprint of a remote agent's state, stored in local stable memory.
  /// Invariant: once written, this imprint persists across upgrades (imprint permanence).
  public type SynapseImprint = {
    agentId     : Text;
    snapshot    : OrganismSnapshot;
    boundAtNs   : Int;   // timestamp of first binding (never changes)
    syncCount   : Nat;   // governance-sync refresh counter
    stalenessNs : Int;   // age of current imprint relative to last sync
  };

  /// Job types processed by the autonomous priority-scheduled queue.
  /// Five types: BIND · SYNC · HEAL · VERIFY · TERMINATE
  public type SynapseJobType = {
    #BIND;       // priority 0 — CRITICAL: imprint a new remote agent
    #SYNC;       // priority 1 — HIGH: governance-sync refresh
    #HEAL;       // priority 1 — HIGH: self-healing after transient failure
    #VERIFY;     // priority 2 — NORMAL: validate staleness bounds
    #TERMINATE;  // priority 0 — CRITICAL (owner-only): revoke binding
  };

  /// A single entry in the autonomous job queue.
  public type SynapseJob = {
    jobId       : Nat;
    jobType     : SynapseJobType;
    priority    : Nat;    // 0=CRITICAL 1=HIGH 2=NORMAL 3=LOW
    targetAgent : Text;
    retryCount  : Nat;    // exponential back-off counter
    scheduledNs : Int;    // earliest execution timestamp
    createdNs   : Int;
  };

  /// Failure class taxonomy (seven classes, indexed 1–7).
  /// Classes 1–2: Transient; 3–4: Permanent; 5–7: Cascade.
  public type FailureClass = {
    classId     : Nat;   // 1..7
    label       : Text;  // e.g. "TransientTimeout", "CascadeTopologyFault"
    category    : Text;  // "Transient" | "Permanent" | "Cascade"
    worstCaseNs : Int;   // proven upper bound on recovery time
  };

  /// Overall SYN health snapshot — zero-cost query.
  public type SynapseHealth = {
    totalBound    : Nat;
    activeBonds   : Nat;
    staleBonds    : Nat;   // staleness > governance-sync interval
    jobQueueDepth : Nat;
    pendingHeals  : Nat;
    lastSyncNs    : Int;
    selfHealing   : Bool;
    timestampNs   : Int;
  };

  /// Result returned from bindSynapse — confirms permanent imprint.
  public type SynapseBindResult = {
    agentId    : Text;
    success    : Bool;
    boundAtNs  : Int;
    message    : Text;
  };
};
