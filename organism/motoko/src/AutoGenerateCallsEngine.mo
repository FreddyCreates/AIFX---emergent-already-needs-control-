/// AutoGenerateCallsEngine.mo — MOTOR AUTO-GENERATIONIS VOCATIONUM
///
/// 22 Web Worker Builder AIs (OPERARII AEDIFICATORES), each Latin-named
/// with 3 dedicated engines (Generator + Router + Builder).
///
/// 66 engines total. 1359+ auto-generated calls across all domains.
/// Full routing table — every call auto-routed to correct target module.
/// All AI, AGI, 24/7, user-facing, cross-substrate.
///
/// AGENTICUS now includes SYN (Synapse Binding Engine) calls:
/// Nexus Perpetuus — one bind, zero-cost reads forever.
///
/// As above, so below.

import Float  "mo:base/Float";
import Nat    "mo:base/Nat";
import Text   "mo:base/Text";
import Array  "mo:base/Array";
import Int    "mo:base/Int";
import Time   "mo:base/Time";

import Types  "Types";

module {

  // ── Phi Constants ─────────────────────────────────────────────────────
  let PHI : Float      = 1.618033988749895;
  let PHI_INV : Float  = 0.618033988749895;

  // ══════════════════════════════════════════════════════════════════════
  //  TYPES — GENERIS DEFINITIONUM
  // ══════════════════════════════════════════════════════════════════════

  /// Engine triad — every worker has exactly 3
  public type EngineTriad = {
    generator : EngineState;
    router    : EngineState;
    builder   : EngineState;
  };

  public type EngineState = {
    name         : Text;
    status       : Text;   // "active" | "idle" | "healing"
    callsRouted  : Nat;
    confidence   : Float;
    lastActiveNs : Int;
  };

  /// A single auto-generated call definition
  public type CallDefinition = {
    callId       : Nat;
    callName     : Text;
    domain       : Text;
    targetModule : Text;
    workerName   : Text;
    priority     : Float;   // phi-weighted
    autoRouted   : Bool;
  };

  /// Worker state — one of the 22 Builder AIs
  public type WorkerState = {
    id           : Nat;
    name         : Text;
    latinName    : Text;
    domain       : Text;
    engines      : EngineTriad;
    totalCalls   : Nat;
    callsGenerated : Nat;
    healthy      : Bool;
  };

  /// Full engine snapshot
  public type EngineSnapshot = {
    workers        : [WorkerState];
    totalWorkers   : Nat;
    totalEngines   : Nat;
    totalCalls     : Nat;
    healthyWorkers : Nat;
    timestampNs    : Int;
  };

  /// Routing result for a call
  public type CallRoutingResult = {
    callName      : Text;
    routedTo      : Text;
    workerUsed    : Text;
    engineUsed    : Text;
    confidence    : Float;
    phiWeight     : Float;
  };

  // ══════════════════════════════════════════════════════════════════════
  //  WORKER REGISTRY — REGISTRUM OPERARIORUM
  //  22 Workers × 3 Engines = 66 Engines
  // ══════════════════════════════════════════════════════════════════════

  /// Build the initial engine triad for a worker
  public func buildTriad(workerName : Text, ts : Int) : EngineTriad {
    {
      generator = {
        name = workerName # "-Generator";
        status = "active";
        callsRouted = 0;
        confidence = PHI_INV;
        lastActiveNs = ts;
      };
      router = {
        name = workerName # "-Router";
        status = "active";
        callsRouted = 0;
        confidence = PHI_INV;
        lastActiveNs = ts;
      };
      builder = {
        name = workerName # "-Builder";
        status = "active";
        callsRouted = 0;
        confidence = PHI_INV;
        lastActiveNs = ts;
      };
    }
  };

  /// Initialize all 22 workers with their Latin names, domains, and call counts
  public func initWorkers(ts : Int) : [WorkerState] {
    [
      // 1. PROTOCOLLUM — Protocols, Consensus, BFT — 184 calls (+20 new protocols)
      {
        id = 1; name = "PROTOCOLLUM"; latinName = "OPERARIUS PROTOCOLLORUM";
        domain = "Protocols, Consensus, BFT";
        engines = buildTriad("PROTOCOLLUM", ts);
        totalCalls = 184; callsGenerated = 0; healthy = true;
      },
      // 2. TERMINALIS — Terminals, AI/AGI Hierarchy — 110 calls (+40 AI calls)
      {
        id = 2; name = "TERMINALIS"; latinName = "OPERARIUS TERMINALIUM";
        domain = "Terminals, AI/AGI Hierarchy";
        engines = buildTriad("TERMINALIS", ts);
        totalCalls = 110; callsGenerated = 0; healthy = true;
      },
      // 3. ORGANISMUS — SDK Organisms, Emergence — 215 calls (+20 blueprints)
      {
        id = 3; name = "ORGANISMUS"; latinName = "OPERARIUS ORGANISMORUM";
        domain = "SDK Organisms, Emergence";
        engines = buildTriad("ORGANISMUS", ts);
        totalCalls = 215; callsGenerated = 0; healthy = true;
      },
      // 4. MERCATOR — Marketplace, Tools, Tiers — 129 calls (+20 recipes + 20 adapters)
      {
        id = 4; name = "MERCATOR"; latinName = "OPERARIUS MERCATUS";
        domain = "Marketplace, Tools, Tiers";
        engines = buildTriad("MERCATOR", ts);
        totalCalls = 129; callsGenerated = 0; healthy = true;
      },
      // 5. ORCHESTRATOR — Houses, Models, Families — 87 calls (+20 lenses)
      {
        id = 5; name = "ORCHESTRATOR"; latinName = "OPERARIUS ORCHESTRATORUM";
        domain = "Houses, Models, Families";
        engines = buildTriad("ORCHESTRATOR", ts);
        totalCalls = 87; callsGenerated = 0; healthy = true;
      },
      // 6. MATHEMATICUS — Math Formulas, Constants — 60 calls
      {
        id = 6; name = "MATHEMATICUS"; latinName = "OPERARIUS MATHEMATICORUM";
        domain = "Math Formulas, Constants";
        engines = buildTriad("MATHEMATICUS", ts);
        totalCalls = 60; callsGenerated = 0; healthy = true;
      },
      // 7. SYNAPTICUS — Synapses, Chaos, Connections — 55 calls (+20 hooks)
      {
        id = 7; name = "SYNAPTICUS"; latinName = "OPERARIUS SYNAPSIUM";
        domain = "Synapses, Chaos, Connections";
        engines = buildTriad("SYNAPTICUS", ts);
        totalCalls = 55; callsGenerated = 0; healthy = true;
      },
      // 8. SUBSTRATUM — Blockchain, Nodes, Layers — 55 calls
      {
        id = 8; name = "SUBSTRATUM"; latinName = "OPERARIUS SUBSTRATI";
        domain = "Blockchain, Nodes, Layers";
        engines = buildTriad("SUBSTRATUM", ts);
        totalCalls = 55; callsGenerated = 0; healthy = true;
      },
      // 9. UNIVERSUM — Domains, Ecosystems, Councils — 150 calls (+20 triggers)
      {
        id = 9; name = "UNIVERSUM"; latinName = "OPERARIUS UNIVERSORUM";
        domain = "Domains, Ecosystems, Councils";
        engines = buildTriad("UNIVERSUM", ts);
        totalCalls = 150; callsGenerated = 0; healthy = true;
      },
      // 10. CANISTRUM — Canister Tech, Factory — 23 calls
      {
        id = 10; name = "CANISTRUM"; latinName = "OPERARIUS CANISTRORUM";
        domain = "Canister Tech, Factory";
        engines = buildTriad("CANISTRUM", ts);
        totalCalls = 23; callsGenerated = 0; healthy = true;
      },
      // 11. LICENTIATOR — Licenses, Documents, Rights — 39 calls
      {
        id = 11; name = "LICENTIATOR"; latinName = "OPERARIUS LICENTIARUM";
        domain = "Licenses, Documents, Rights";
        engines = buildTriad("LICENTIATOR", ts);
        totalCalls = 39; callsGenerated = 0; healthy = true;
      },
      // 12. DEFENSOR — Defense, Care, Arsenal — 69 calls (+20 shields)
      {
        id = 12; name = "DEFENSOR"; latinName = "OPERARIUS DEFENSIONIS ET CURAE";
        domain = "Defense, Care, Arsenal";
        engines = buildTriad("DEFENSOR", ts);
        totalCalls = 69; callsGenerated = 0; healthy = true;
      },
      // 13. FABRICATOR — Forgeworks, Software Engineering — 20 calls
      {
        id = 13; name = "FABRICATOR"; latinName = "OPERARIUS FABRICATIONIS";
        domain = "Forgeworks, Software Engineering";
        engines = buildTriad("FABRICATOR", ts);
        totalCalls = 20; callsGenerated = 0; healthy = true;
      },
      // 14. NEURONICUS — Neuromorphic Compute — 15 calls
      {
        id = 14; name = "NEURONICUS"; latinName = "OPERARIUS NEUROMORPHICORUM";
        domain = "Neuromorphic Compute";
        engines = buildTriad("NEURONICUS", ts);
        totalCalls = 15; callsGenerated = 0; healthy = true;
      },
      // 15. AGENTICUS — Multi-Agent Coordination + SYN Binding — 30 calls
      {
        id = 15; name = "AGENTICUS"; latinName = "OPERARIUS AGENTIUM";
        domain = "Multi-Agent Coordination, Synapse Binding";
        engines = buildTriad("AGENTICUS", ts);
        totalCalls = 30; callsGenerated = 0; healthy = true;
      },
      // 16. PRIVATICUS — Privacy-Preserving Analytics — 15 calls
      {
        id = 16; name = "PRIVATICUS"; latinName = "OPERARIUS PRIVATORUM";
        domain = "Privacy-Preserving Analytics";
        engines = buildTriad("PRIVATICUS", ts);
        totalCalls = 15; callsGenerated = 0; healthy = true;
      },
      // 17. CACHEXIUS — Intelligent Caching — 15 calls
      {
        id = 17; name = "CACHEXIUS"; latinName = "OPERARIUS CACHEORUM";
        domain = "Intelligent Caching";
        engines = buildTriad("CACHEXIUS", ts);
        totalCalls = 15; callsGenerated = 0; healthy = true;
      },
      // 18. TENANTIUS — Multi-Tenant Management — 18 calls
      {
        id = 18; name = "TENANTIUS"; latinName = "OPERARIUS TENANTIUM";
        domain = "Multi-Tenant Management";
        engines = buildTriad("TENANTIUS", ts);
        totalCalls = 18; callsGenerated = 0; healthy = true;
      },
      // 19. CHAOTICUS — Chaos Engineering, Scaling — 15 calls
      {
        id = 19; name = "CHAOTICUS"; latinName = "OPERARIUS CHAOTICUM";
        domain = "Chaos Engineering, Scaling";
        engines = buildTriad("CHAOTICUS", ts);
        totalCalls = 15; callsGenerated = 0; healthy = true;
      },
      // 20. EXTERNALIS — External SDK, API Gateway — 20 calls
      {
        id = 20; name = "EXTERNALIS"; latinName = "OPERARIUS EXTERNORUM";
        domain = "External SDK, API Gateway";
        engines = buildTriad("EXTERNALIS", ts);
        totalCalls = 20; callsGenerated = 0; healthy = true;
      },
      // 21. BLUEPRINTUS — Blueprint, Hook Discovery — 15 calls
      {
        id = 21; name = "BLUEPRINTUS"; latinName = "OPERARIUS BLUEPRINTORUM";
        domain = "Blueprint, Hook Discovery";
        engines = buildTriad("BLUEPRINTUS", ts);
        totalCalls = 15; callsGenerated = 0; healthy = true;
      },
      // 22. JARVISIUS — Jarvis AI Command, Orchestration — 20 calls
      {
        id = 22; name = "JARVISIUS"; latinName = "OPERARIUS JARVISII";
        domain = "Jarvis AI Command, Orchestration";
        engines = buildTriad("JARVISIUS", ts);
        totalCalls = 20; callsGenerated = 0; healthy = true;
      }
    ]
  };

  // ══════════════════════════════════════════════════════════════════════
  //  CALL GENERATION — GENERATIO VOCATIONUM
  //  1144+ calls auto-generated and routed
  // ══════════════════════════════════════════════════════════════════════

  /// Generate calls for PROTOCOLLUM — 144 protocol calls
  public func generateProtocolCalls(ts : Int) : [CallDefinition] {
    let protocols = [
      "SovereignRouting", "EncryptedTransport", "PhiResonanceSync",
      "KnowledgeAbsorption", "MultiModelFusion", "ContractVerification",
      "EdgeMesh", "OrganismLifecycle", "CrossOrganismResonance",
      "HeartbeatProtocol", "ConsensusProtocol", "BFTValidation"
    ];
    let operations = [
      "init", "validate", "route", "execute",
      "sync", "verify", "heal", "broadcast",
      "aggregate", "finalize", "snapshot", "restore"
    ];
    var calls : [CallDefinition] = [];
    var id : Nat = 0;
    for (p in protocols.vals()) {
      for (op in operations.vals()) {
        id += 1;
        let call : CallDefinition = {
          callId = id;
          callName = p # "." # op;
          domain = "Protocols";
          targetModule = "protocols/" # p;
          workerName = "PROTOCOLLUM";
          priority = PHI_INV * Float.fromInt(id % 8 + 1);
          autoRouted = true;
        };
        calls := Array.append(calls, [call]);
      };
    };
    calls
  };

  /// Generate calls for TERMINALIS — 50 terminal/AGI calls
  public func generateTerminalCalls(ts : Int) : [CallDefinition] {
    let terminals = [
      "AGIHierarchy", "TerminalInference", "CommandRouter",
      "ShellIntelligence", "PowerShellAI", "WSLBridge",
      "TerminalForge", "CommandHistory", "AutoComplete", "SessionState"
    ];
    let operations = ["init", "execute", "route", "complete", "analyze"];
    var calls : [CallDefinition] = [];
    var id : Nat = 200;
    for (t in terminals.vals()) {
      for (op in operations.vals()) {
        id += 1;
        calls := Array.append(calls, [{
          callId = id;
          callName = t # "." # op;
          domain = "Terminals";
          targetModule = "sdk/terminals/" # t;
          workerName = "TERMINALIS";
          priority = PHI * Float.fromInt(id % 5 + 1) / 5.0;
          autoRouted = true;
        }]);
      };
    };
    calls
  };

  /// Generate calls for ORGANISMUS — 180 organism/SDK calls
  public func generateOrganismCalls(ts : Int) : [CallDefinition] {
    let sdks = [
      "SpatialMemory", "EnterpriseIntegration", "IntelligenceRouting",
      "OrganismRuntime", "DocumentAbsorption", "ModelEngine",
      "FrontendIntelligence", "MarketplaceSDK", "RegisterBuilder"
    ];
    let operations = [
      "init", "boot", "heartbeat", "sense", "execute",
      "absorb", "route", "fuse", "score", "heal",
      "snapshot", "restore", "resonate", "broadcast",
      "sync", "validate", "register", "deploy",
      "monitor", "shutdown"
    ];
    var calls : [CallDefinition] = [];
    var id : Nat = 300;
    for (s in sdks.vals()) {
      for (op in operations.vals()) {
        id += 1;
        calls := Array.append(calls, [{
          callId = id;
          callName = s # "." # op;
          domain = "Organisms";
          targetModule = "sdk/" # s;
          workerName = "ORGANISMUS";
          priority = PHI * Float.fromInt(id % 10 + 1) / 10.0;
          autoRouted = true;
        }]);
      };
    };
    calls
  };

  /// Generate calls for MERCATOR — 64 marketplace calls
  public func generateMarketplaceCalls(ts : Int) : [CallDefinition] {
    let tools = [
      "ToolSchema", "ToolRegistry", "ToolRouter",
      "ToolInvoker", "ToolSettlement", "CrawlingFamily",
      "ContextFamily", "CommanderFamily", "SentryFamily",
      "BuilderFamily", "MarketplaceRouter", "FamilyProfiles",
      "TierManager", "PermissionGate", "UsageTracker", "RewardEngine"
    ];
    let operations = ["init", "register", "invoke", "settle"];
    var calls : [CallDefinition] = [];
    var id : Nat = 500;
    for (t in tools.vals()) {
      for (op in operations.vals()) {
        id += 1;
        calls := Array.append(calls, [{
          callId = id;
          callName = t # "." # op;
          domain = "Marketplace";
          targetModule = "sdk/marketplace/" # t;
          workerName = "MERCATOR";
          priority = PHI_INV * Float.fromInt(id % 6 + 1);
          autoRouted = true;
        }]);
      };
    };
    calls
  };

  /// Generate calls for ORCHESTRATOR — 37 model/family calls
  public func generateOrchestratorCalls(ts : Int) : [CallDefinition] {
    let houses = [
      "GPTHouse", "ClaudeHouse", "GeminiHouse", "LlamaHouse",
      "MistralHouse", "CohereHouse", "PhiHouse"
    ];
    let operations = [
      "init", "route", "score", "fuse", "rank"
    ];
    var calls : [CallDefinition] = [];
    var id : Nat = 600;
    for (h in houses.vals()) {
      for (op in operations.vals()) {
        id += 1;
        calls := Array.append(calls, [{
          callId = id;
          callName = h # "." # op;
          domain = "Models";
          targetModule = "sdk/models/" # h;
          workerName = "ORCHESTRATOR";
          priority = PHI * Float.fromInt(id % 7 + 1) / 7.0;
          autoRouted = true;
        }]);
      };
    };
    // 2 extra cross-family calls
    calls := Array.append(calls, [{
      callId = id + 1;
      callName = "ModelFamilies.rankAll";
      domain = "Models";
      targetModule = "sdk/models/families";
      workerName = "ORCHESTRATOR";
      priority = PHI;
      autoRouted = true;
    }]);
    calls := Array.append(calls, [{
      callId = id + 2;
      callName = "ModelFamilies.fuseAlpha";
      domain = "Models";
      targetModule = "sdk/models/fusion";
      workerName = "ORCHESTRATOR";
      priority = PHI;
      autoRouted = true;
    }]);
    calls
  };

  /// Generate calls for MATHEMATICUS — 60 math/constant calls
  public func generateMathCalls(ts : Int) : [CallDefinition] {
    let domains = [
      "PhiMath", "KuramotoSync", "FourierAnalysis",
      "GoldenAngle", "ZScoreNorm", "SqrtNorm",
      "IQRAnomaly", "PearsonCorrelation", "SpectralDFT",
      "MeanReversion", "PhiDecay", "EntropyCalc"
    ];
    let operations = ["compute", "validate", "normalize", "transform", "score"];
    var calls : [CallDefinition] = [];
    var id : Nat = 650;
    for (d in domains.vals()) {
      for (op in operations.vals()) {
        id += 1;
        calls := Array.append(calls, [{
          callId = id;
          callName = d # "." # op;
          domain = "Mathematics";
          targetModule = "sdk/math/" # d;
          workerName = "MATHEMATICUS";
          priority = PHI * Float.fromInt(id % 4 + 1) / 4.0;
          autoRouted = true;
        }]);
      };
    };
    calls
  };

  /// Generate calls for SYNAPTICUS — 20 synapse/chaos calls
  public func generateSynapseCalls(ts : Int) : [CallDefinition] {
    let synapses = [
      "NeuralMesh", "ChaosBridge", "ResonanceLink",
      "AttentionGate"
    ];
    let operations = ["fire", "connect", "resonate", "modulate", "heal"];
    var calls : [CallDefinition] = [];
    var id : Nat = 720;
    for (s in synapses.vals()) {
      for (op in operations.vals()) {
        id += 1;
        calls := Array.append(calls, [{
          callId = id;
          callName = s # "." # op;
          domain = "Synapses";
          targetModule = "sdk/synapses/" # s;
          workerName = "SYNAPTICUS";
          priority = PHI_INV * Float.fromInt(id % 5 + 1);
          autoRouted = true;
        }]);
      };
    };
    calls
  };

  /// Generate calls for SUBSTRATUM — 40 blockchain/node calls
  public func generateBlockchainCalls(ts : Int) : [CallDefinition] {
    let layers = [
      "ICPCanister", "EthereumBridge", "SolanaBridge",
      "BitcoinOracle", "NodeManager", "LayerRouter",
      "CrossChainRelay", "ConsensusEngine"
    ];
    let operations = ["init", "deploy", "query", "update", "bridge"];
    var calls : [CallDefinition] = [];
    var id : Nat = 750;
    for (l in layers.vals()) {
      for (op in operations.vals()) {
        id += 1;
        calls := Array.append(calls, [{
          callId = id;
          callName = l # "." # op;
          domain = "Blockchain";
          targetModule = "sdk/blockchain/" # l;
          workerName = "SUBSTRATUM";
          priority = PHI * Float.fromInt(id % 8 + 1) / 8.0;
          autoRouted = true;
        }]);
      };
    };
    calls
  };

  /// Generate calls for UNIVERSUM — 105 domain/ecosystem calls
  public func generateUniversumCalls(ts : Int) : [CallDefinition] {
    let ecosystems = [
      "IntelligenceDomain", "EnterpriseDomain", "CreativeDomain",
      "ResearchDomain", "SecurityDomain", "HealthDomain",
      "FinanceDomain", "EducationDomain", "InfrastructureDomain",
      "GovernanceDomain", "CommerceDomain", "SocialDomain",
      "MediaDomain", "LegalDomain", "ScienceDomain"
    ];
    let operations = [
      "register", "discover", "route", "govern",
      "audit", "sync", "evolve"
    ];
    var calls : [CallDefinition] = [];
    var id : Nat = 800;
    for (e in ecosystems.vals()) {
      for (op in operations.vals()) {
        id += 1;
        calls := Array.append(calls, [{
          callId = id;
          callName = e # "." # op;
          domain = "Ecosystems";
          targetModule = "sdk/universum/" # e;
          workerName = "UNIVERSUM";
          priority = PHI_INV * Float.fromInt(id % 7 + 1);
          autoRouted = true;
        }]);
      };
    };
    calls
  };

  /// Generate calls for CANISTRUM — 23 canister/factory calls
  public func generateCanisterCalls(ts : Int) : [CallDefinition] {
    let canisters = [
      "CanisterFactory", "CanisterUpgrade", "CanisterMonitor",
      "StableStorage", "InterCanister"
    ];
    let operations = ["create", "upgrade", "monitor", "snapshot"];
    var calls : [CallDefinition] = [];
    var id : Nat = 910;
    for (c in canisters.vals()) {
      for (op in operations.vals()) {
        id += 1;
        calls := Array.append(calls, [{
          callId = id;
          callName = c # "." # op;
          domain = "Canisters";
          targetModule = "sdk/canisters/" # c;
          workerName = "CANISTRUM";
          priority = PHI * Float.fromInt(id % 5 + 1) / 5.0;
          autoRouted = true;
        }]);
      };
    };
    // 3 extra factory calls
    calls := Array.append(calls, [{
      callId = id + 1; callName = "CanisterFactory.batchCreate";
      domain = "Canisters"; targetModule = "sdk/canisters/factory";
      workerName = "CANISTRUM"; priority = PHI; autoRouted = true;
    }]);
    calls := Array.append(calls, [{
      callId = id + 2; callName = "CanisterFactory.migrateAll";
      domain = "Canisters"; targetModule = "sdk/canisters/factory";
      workerName = "CANISTRUM"; priority = PHI; autoRouted = true;
    }]);
    calls := Array.append(calls, [{
      callId = id + 3; callName = "CanisterFactory.healthCheck";
      domain = "Canisters"; targetModule = "sdk/canisters/factory";
      workerName = "CANISTRUM"; priority = PHI_INV; autoRouted = true;
    }]);
    calls
  };

  /// Generate calls for LICENTIATOR — 24 license/document calls
  public func generateLicenseCalls(ts : Int) : [CallDefinition] {
    let licenses = [
      "LicenseIssuer", "LicenseVerifier", "DocumentForge",
      "RightsManager", "ComplianceEngine", "AuditTrail"
    ];
    let operations = ["issue", "verify", "revoke", "audit"];
    var calls : [CallDefinition] = [];
    var id : Nat = 940;
    for (l in licenses.vals()) {
      for (op in operations.vals()) {
        id += 1;
        calls := Array.append(calls, [{
          callId = id;
          callName = l # "." # op;
          domain = "Licenses";
          targetModule = "sdk/licenses/" # l;
          workerName = "LICENTIATOR";
          priority = PHI_INV * Float.fromInt(id % 6 + 1);
          autoRouted = true;
        }]);
      };
    };
    calls
  };

  /// Generate calls for DEFENSOR — 29 defense/care calls
  public func generateDefenseCalls(ts : Int) : [CallDefinition] {
    let defenses = [
      "ThreatDetector", "ImmunityEngine", "GuardianShield",
      "PromptInjectionGuard", "DataLeakPrevention", "AnomalyScanner"
    ];
    let operations = ["scan", "defend", "heal", "report"];
    var calls : [CallDefinition] = [];
    var id : Nat = 970;
    for (d in defenses.vals()) {
      for (op in operations.vals()) {
        id += 1;
        calls := Array.append(calls, [{
          callId = id;
          callName = d # "." # op;
          domain = "Defense";
          targetModule = "sdk/defense/" # d;
          workerName = "DEFENSOR";
          priority = PHI * Float.fromInt(id % 6 + 1) / 6.0;
          autoRouted = true;
        }]);
      };
    };
    // 5 extra arsenal calls
    calls := Array.append(calls, [{
      callId = id + 1; callName = "Arsenal.deployCountermeasure";
      domain = "Defense"; targetModule = "sdk/defense/arsenal";
      workerName = "DEFENSOR"; priority = PHI; autoRouted = true;
    }]);
    calls := Array.append(calls, [{
      callId = id + 2; callName = "Arsenal.quarantine";
      domain = "Defense"; targetModule = "sdk/defense/arsenal";
      workerName = "DEFENSOR"; priority = PHI; autoRouted = true;
    }]);
    calls := Array.append(calls, [{
      callId = id + 3; callName = "Arsenal.emergencyShutdown";
      domain = "Defense"; targetModule = "sdk/defense/arsenal";
      workerName = "DEFENSOR"; priority = PHI * PHI; autoRouted = true;
    }]);
    calls := Array.append(calls, [{
      callId = id + 4; callName = "CareEngine.selfHeal";
      domain = "Defense"; targetModule = "sdk/defense/care";
      workerName = "DEFENSOR"; priority = PHI; autoRouted = true;
    }]);
    calls := Array.append(calls, [{
      callId = id + 5; callName = "CareEngine.nurture";
      domain = "Defense"; targetModule = "sdk/defense/care";
      workerName = "DEFENSOR"; priority = PHI_INV; autoRouted = true;
    }]);
    calls
  };

  /// Generate calls for FABRICATOR — 20 forgeworks/software engineering calls
  public func generateFabricatorCalls(ts : Int) : [CallDefinition] {
    let entities = [
      "CodeAnalyzer", "RefactorEngine", "TestRunner",
      "CIPipeline", "BuildOrchestrator"
    ];
    let operations = ["analyze", "refactor", "test", "deploy"];
    var calls : [CallDefinition] = [];
    var id : Nat = 1200;
    for (e in entities.vals()) {
      for (op in operations.vals()) {
        id += 1;
        calls := Array.append(calls, [{
          callId = id;
          callName = e # "." # op;
          domain = "Forgeworks";
          targetModule = "sdk/forgeworks/" # e;
          workerName = "FABRICATOR";
          priority = PHI * Float.fromInt(id % 5 + 1) / 5.0;
          autoRouted = true;
        }]);
      };
    };
    calls
  };

  /// Generate calls for NEURONICUS — 15 neuromorphic compute calls
  public func generateNeuronicusCalls(ts : Int) : [CallDefinition] {
    let entities = [
      "SpikingNeural", "DendriticProcessor", "GlialNetwork"
    ];
    let operations = ["spike", "dendrite", "glial", "cortical", "simulate"];
    var calls : [CallDefinition] = [];
    var id : Nat = 1250;
    for (e in entities.vals()) {
      for (op in operations.vals()) {
        id += 1;
        calls := Array.append(calls, [{
          callId = id;
          callName = e # "." # op;
          domain = "Neuromorphic";
          targetModule = "sdk/neuromorphic/" # e;
          workerName = "NEURONICUS";
          priority = PHI_INV * Float.fromInt(id % 5 + 1);
          autoRouted = true;
        }]);
      };
    };
    calls
  };

  /// Generate calls for AGENTICUS — 15 multi-agent coordination calls
  public func generateAgenticusCalls(ts : Int) : [CallDefinition] {
    let entities = [
      "NegotiationEngine", "ConsensusAgent", "SwarmController"
    ];
    let operations = ["negotiate", "consensus", "swarm", "coalition", "coordinate"];
    var calls : [CallDefinition] = [];
    var id : Nat = 1300;
    for (e in entities.vals()) {
      for (op in operations.vals()) {
        id += 1;
        calls := Array.append(calls, [{
          callId = id;
          callName = e # "." # op;
          domain = "MultiAgent";
          targetModule = "sdk/multiagent/" # e;
          workerName = "AGENTICUS";
          priority = PHI * Float.fromInt(id % 5 + 1) / 5.0;
          autoRouted = true;
        }]);
      };
    };
    calls
  };

  /// Generate SYN (Synapse Binding Engine) calls for AGENTICUS — 15 binding calls
  ///
  /// These calls implement Nexus Perpetuus: a single cross-canister BIND converts
  /// a remote agent's state into a permanent local imprint, after which all queries
  /// are pure local reads with zero network cost.
  ///
  /// Five job types (BIND · SYNC · HEAL · VERIFY · TERMINATE) map to three
  /// priority tiers (CRITICAL=0, HIGH=1, NORMAL=2) driving the autonomous queue.
  public func generateSynapseBindingCalls(ts : Int) : [CallDefinition] {
    let operations = [
      // CRITICAL priority operations
      "bind",        // SynapseBinding.bind     — imprint remote agent (CRITICAL)
      "terminate",   // SynapseBinding.terminate — owner-revoke bond   (CRITICAL)
      // HIGH priority operations
      "sync",        // SynapseBinding.sync      — governance-sync refresh (HIGH)
      "heal",        // SynapseBinding.heal      — self-heal a failed bond (HIGH)
      // NORMAL priority operations
      "verify",      // SynapseBinding.verify    — validate staleness bounds (NORMAL)
    ];
    let synapseModules = [
      "SynapseBinding",    // core binding engine
      "ImprintStore",      // stable-memory imprint repository
      "SynapseJobQueue",   // priority-scheduled job queue with exponential back-off
    ];
    var calls : [CallDefinition] = [];
    var id : Nat = 1700;
    for (m in synapseModules.vals()) {
      for (op in operations.vals()) {
        id += 1;
        let prio : Float = switch (op) {
          case "bind"      { PHI * PHI };   // CRITICAL — highest weight
          case "terminate" { PHI * PHI };   // CRITICAL
          case "sync"      { PHI };         // HIGH
          case "heal"      { PHI };         // HIGH
          case _           { PHI_INV };     // NORMAL
        };
        calls := Array.append(calls, [{
          callId = id;
          callName = m # "." # op;
          domain = "SynapseBinding";
          targetModule = "sdk/syn/" # m;
          workerName = "AGENTICUS";
          priority = prio;
          autoRouted = true;
        }]);
      };
    };
    calls
  };

  /// Generate calls for PRIVATICUS — 15 privacy-preserving analytics calls
  public func generatePrivaticusCalls(ts : Int) : [CallDefinition] {
    let entities = [
      "DifferentialPrivacy", "HomomorphicEngine", "MPCProtocol"
    ];
    let operations = ["privatize", "encrypt", "compute", "verify", "aggregate"];
    var calls : [CallDefinition] = [];
    var id : Nat = 1350;
    for (e in entities.vals()) {
      for (op in operations.vals()) {
        id += 1;
        calls := Array.append(calls, [{
          callId = id;
          callName = e # "." # op;
          domain = "Privacy";
          targetModule = "sdk/privacy/" # e;
          workerName = "PRIVATICUS";
          priority = PHI_INV * Float.fromInt(id % 6 + 1);
          autoRouted = true;
        }]);
      };
    };
    calls
  };

  /// Generate calls for CACHEXIUS — 15 intelligent caching calls
  public func generateCachexiusCalls(ts : Int) : [CallDefinition] {
    let entities = [
      "PredictiveWarmer", "SemanticInvalidator", "CacheTiering"
    ];
    let operations = ["warm", "invalidate", "tier", "prefetch", "evict"];
    var calls : [CallDefinition] = [];
    var id : Nat = 1400;
    for (e in entities.vals()) {
      for (op in operations.vals()) {
        id += 1;
        calls := Array.append(calls, [{
          callId = id;
          callName = e # "." # op;
          domain = "Caching";
          targetModule = "sdk/caching/" # e;
          workerName = "CACHEXIUS";
          priority = PHI * Float.fromInt(id % 4 + 1) / 4.0;
          autoRouted = true;
        }]);
      };
    };
    calls
  };

  /// Generate calls for TENANTIUS — 18 multi-tenant management calls
  public func generateTentiusCalls(ts : Int) : [CallDefinition] {
    let entities = [
      "TenantIsolator", "TenantDeployer", "FeatureFlagManager"
    ];
    let operations = ["isolate", "deploy", "flag", "provision", "migrate", "audit"];
    var calls : [CallDefinition] = [];
    var id : Nat = 1450;
    for (e in entities.vals()) {
      for (op in operations.vals()) {
        id += 1;
        calls := Array.append(calls, [{
          callId = id;
          callName = e # "." # op;
          domain = "MultiTenant";
          targetModule = "sdk/multitenant/" # e;
          workerName = "TENANTIUS";
          priority = PHI * Float.fromInt(id % 6 + 1) / 6.0;
          autoRouted = true;
        }]);
      };
    };
    calls
  };

  /// Generate calls for CHAOTICUS — 15 chaos engineering/scaling calls
  public func generateChaoticusCalls(ts : Int) : [CallDefinition] {
    let entities = [
      "FaultInjector", "GameDayRunner", "ScalingEngine"
    ];
    let operations = ["inject", "simulate", "scale", "recover", "observe"];
    var calls : [CallDefinition] = [];
    var id : Nat = 1500;
    for (e in entities.vals()) {
      for (op in operations.vals()) {
        id += 1;
        calls := Array.append(calls, [{
          callId = id;
          callName = e # "." # op;
          domain = "ChaosEngineering";
          targetModule = "sdk/chaos/" # e;
          workerName = "CHAOTICUS";
          priority = PHI_INV * Float.fromInt(id % 5 + 1);
          autoRouted = true;
        }]);
      };
    };
    calls
  };

  /// Generate calls for EXTERNALIS — 20 external SDK/API gateway calls
  public func generateExternalisCalls(ts : Int) : [CallDefinition] {
    let entities = [
      "SDKRouter", "APIVersionManager", "DeveloperPortal", "RateLimiter"
    ];
    let operations = ["route", "version", "portal", "limit", "authorize"];
    var calls : [CallDefinition] = [];
    var id : Nat = 1550;
    for (e in entities.vals()) {
      for (op in operations.vals()) {
        id += 1;
        calls := Array.append(calls, [{
          callId = id;
          callName = e # "." # op;
          domain = "ExternalSDK";
          targetModule = "sdk/external/" # e;
          workerName = "EXTERNALIS";
          priority = PHI * Float.fromInt(id % 7 + 1) / 7.0;
          autoRouted = true;
        }]);
      };
    };
    calls
  };

  /// Generate calls for BLUEPRINTUS — 15 blueprint/hook discovery calls
  public func generateBlueprintusCalls(ts : Int) : [CallDefinition] {
    let entities = [
      "BlueprintScanner", "HookMapper", "InterfaceResolver"
    ];
    let operations = ["scan", "map", "resolve", "discover", "validate"];
    var calls : [CallDefinition] = [];
    var id : Nat = 1600;
    for (e in entities.vals()) {
      for (op in operations.vals()) {
        id += 1;
        calls := Array.append(calls, [{
          callId = id;
          callName = e # "." # op;
          domain = "Blueprints";
          targetModule = "sdk/blueprints/" # e;
          workerName = "BLUEPRINTUS";
          priority = PHI * Float.fromInt(id % 5 + 1) / 5.0;
          autoRouted = true;
        }]);
      };
    };
    calls
  };

  /// Generate calls for JARVISIUS — 20 Jarvis AI command/orchestration calls
  public func generateJarvisiusCalls(ts : Int) : [CallDefinition] {
    let entities = [
      "JarvisCommandRouter", "JarvisMemoryCore",
      "JarvisAutomation", "JarvisContext"
    ];
    let operations = ["command", "recall", "automate", "contextualize", "orchestrate"];
    var calls : [CallDefinition] = [];
    var id : Nat = 1650;
    for (e in entities.vals()) {
      for (op in operations.vals()) {
        id += 1;
        calls := Array.append(calls, [{
          callId = id;
          callName = e # "." # op;
          domain = "JarvisAI";
          targetModule = "sdk/jarvis/" # e;
          workerName = "JARVISIUS";
          priority = PHI * Float.fromInt(id % 8 + 1) / 8.0;
          autoRouted = true;
        }]);
      };
    };
    calls
  };

  /// Generate multi-power cross-domain calls — 200+ orchestration calls
  public func generateMultiPowerCalls(ts : Int) : [CallDefinition] {
    var calls : [CallDefinition] = [];
    var id : Nat = 1000;

    // ── 1. Protocol×Model Fusion — 20 calls (PROTOCOLLUM) ───────────
    let pfEntities = [
      "ProtocolFusionMultiModel", "ProtocolFusionConsensus",
      "ProtocolFusionBridge", "ProtocolFusionChain"
    ];
    let pfOps = ["init", "route", "fuse", "validate", "sync"];
    for (e in pfEntities.vals()) {
      for (op in pfOps.vals()) {
        id += 1;
        calls := Array.append(calls, [{
          callId = id;
          callName = e # "." # op;
          domain = "MultiPower";
          targetModule = "sdk/multipower/protocol-fusion";
          workerName = "PROTOCOLLUM";
          priority = PHI * Float.fromInt(id % 8 + 1) / 8.0;
          autoRouted = true;
        }]);
      };
    };

    // ── 2. Observer Intelligence — 15 calls (ORGANISMUS) ────────────
    let obsEntities = [
      "ObserverAIMutation", "ObserverAIIntersection", "ObserverAIPerformance"
    ];
    let obsOps = ["observe", "classify", "react", "predict", "aggregate"];
    for (e in obsEntities.vals()) {
      for (op in obsOps.vals()) {
        id += 1;
        calls := Array.append(calls, [{
          callId = id;
          callName = e # "." # op;
          domain = "MultiPower";
          targetModule = "sdk/multipower/observer-ai";
          workerName = "ORGANISMUS";
          priority = PHI * Float.fromInt(id % 6 + 1) / 6.0;
          autoRouted = true;
        }]);
      };
    };

    // ── 3. Web Worker Orchestration — 30 calls (ORCHESTRATOR) ───────
    let woEntities = [
      "WorkerOrchMessaging", "WorkerOrchMemory", "WorkerOrchLifecycle",
      "WorkerOrchBalancer", "WorkerOrchPool", "WorkerOrchScheduler"
    ];
    let woOps = ["dispatch", "allocate", "balance", "spawn", "terminate"];
    for (e in woEntities.vals()) {
      for (op in woOps.vals()) {
        id += 1;
        calls := Array.append(calls, [{
          callId = id;
          callName = e # "." # op;
          domain = "MultiPower";
          targetModule = "sdk/multipower/worker-orch";
          workerName = "ORCHESTRATOR";
          priority = PHI * Float.fromInt(id % 10 + 1) / 10.0;
          autoRouted = true;
        }]);
      };
    };

    // ── 4. Knowledge Graph Power — 25 calls (UNIVERSUM) ─────────────
    let kgEntities = [
      "KnowledgeGraphEntity", "KnowledgeGraphRelation",
      "KnowledgeGraphTraversal", "KnowledgeGraphFusion",
      "KnowledgeGraphOntology"
    ];
    let kgOps = ["link", "extract", "traverse", "fuse", "query"];
    for (e in kgEntities.vals()) {
      for (op in kgOps.vals()) {
        id += 1;
        calls := Array.append(calls, [{
          callId = id;
          callName = e # "." # op;
          domain = "MultiPower";
          targetModule = "sdk/multipower/knowledge-graph";
          workerName = "UNIVERSUM";
          priority = PHI_INV * Float.fromInt(id % 7 + 1);
          autoRouted = true;
        }]);
      };
    };

    // ── 5. Autonomous Agent — 20 calls (TERMINALIS) ─────────────────
    let aaEntities = [
      "AutonomousAgentPlanner", "AutonomousAgentGoal",
      "AutonomousAgentSelf", "AutonomousAgentDelegator"
    ];
    let aaOps = ["plan", "decompose", "improve", "delegate", "evaluate"];
    for (e in aaEntities.vals()) {
      for (op in aaOps.vals()) {
        id += 1;
        calls := Array.append(calls, [{
          callId = id;
          callName = e # "." # op;
          domain = "MultiPower";
          targetModule = "sdk/multipower/autonomous-agent";
          workerName = "TERMINALIS";
          priority = PHI * Float.fromInt(id % 5 + 1) / 5.0;
          autoRouted = true;
        }]);
      };
    };

    // ── 6. Cross-Substrate Bridge — 15 calls (SUBSTRATUM) ───────────
    let sbEntities = [
      "SubstrateBridgeICPtoETH", "SubstrateBridgeICPtoSOL",
      "SubstrateBridgeMultiChain"
    ];
    let sbOps = ["bridge", "verify", "settle", "relay", "sync"];
    for (e in sbEntities.vals()) {
      for (op in sbOps.vals()) {
        id += 1;
        calls := Array.append(calls, [{
          callId = id;
          callName = e # "." # op;
          domain = "MultiPower";
          targetModule = "sdk/multipower/substrate-bridge";
          workerName = "SUBSTRATUM";
          priority = PHI * Float.fromInt(id % 8 + 1) / 8.0;
          autoRouted = true;
        }]);
      };
    };

    // ── 7. Security Arsenal — 20 calls (DEFENSOR) ──────────────────
    let saEntities = [
      "SecurityArsenalZKP", "SecurityArsenalPromptShield",
      "SecurityArsenalPII", "SecurityArsenalThreatIntel"
    ];
    let saOps = ["prove", "detect", "shield", "report", "mitigate"];
    for (e in saEntities.vals()) {
      for (op in saOps.vals()) {
        id += 1;
        calls := Array.append(calls, [{
          callId = id;
          callName = e # "." # op;
          domain = "MultiPower";
          targetModule = "sdk/multipower/security-arsenal";
          workerName = "DEFENSOR";
          priority = PHI * Float.fromInt(id % 6 + 1) / 6.0;
          autoRouted = true;
        }]);
      };
    };

    // ── 8. Marketplace Registry — 25 calls (MERCATOR) ───────────────
    let mrEntities = [
      "MarketplaceRegistryDiscovery", "MarketplaceRegistryRegistrar",
      "MarketplaceRegistryPricing", "MarketplaceRegistrySettlement",
      "MarketplaceRegistryCompliance"
    ];
    let mrOps = ["discover", "register", "price", "settle", "audit"];
    for (e in mrEntities.vals()) {
      for (op in mrOps.vals()) {
        id += 1;
        calls := Array.append(calls, [{
          callId = id;
          callName = e # "." # op;
          domain = "MultiPower";
          targetModule = "sdk/multipower/marketplace-registry";
          workerName = "MERCATOR";
          priority = PHI_INV * Float.fromInt(id % 5 + 1);
          autoRouted = true;
        }]);
      };
    };

    // ── 9. Emergence Detection — 15 calls (SYNAPTICUS) ──────────────
    let edEntities = [
      "EmergenceDetectSelfOrg", "EmergenceDetectPattern",
      "EmergenceDetectComplexity"
    ];
    let edOps = ["detect", "measure", "classify", "predict", "alert"];
    for (e in edEntities.vals()) {
      for (op in edOps.vals()) {
        id += 1;
        calls := Array.append(calls, [{
          callId = id;
          callName = e # "." # op;
          domain = "MultiPower";
          targetModule = "sdk/multipower/emergence-detect";
          workerName = "SYNAPTICUS";
          priority = PHI * Float.fromInt(id % 4 + 1) / 4.0;
          autoRouted = true;
        }]);
      };
    };

    // ── 10. Law Enforcement Wire — 15 calls (LICENTIATOR) ───────────
    let leEntities = [
      "LawEnforcementDoctrine", "LawEnforcementCompliance",
      "LawEnforcementViolation"
    ];
    let leOps = ["audit", "check", "report", "remediate", "escalate"];
    for (e in leEntities.vals()) {
      for (op in leOps.vals()) {
        id += 1;
        calls := Array.append(calls, [{
          callId = id;
          callName = e # "." # op;
          domain = "MultiPower";
          targetModule = "sdk/multipower/law-enforcement";
          workerName = "LICENTIATOR";
          priority = PHI_INV * Float.fromInt(id % 6 + 1);
          autoRouted = true;
        }]);
      };
    };

    calls
  };

  // ══════════════════════════════════════════════════════════════════════
  //  ROUTING TABLE — TABULA ITINERUM
  //  Every call auto-routed to its correct target module
  // ══════════════════════════════════════════════════════════════════════

  /// Route a call by name to the correct worker and engine
  public func routeCall(callName : Text, workers : [WorkerState]) : CallRoutingResult {
    // Determine domain from call prefix
    let workerName = resolveWorker(callName);
    let engineType = resolveEngine(callName);

    // Phi-weighted confidence scoring
    let confidence = PHI_INV * 0.9;
    let phiWeight  = PHI / (PHI + 1.0);

    {
      callName = callName;
      routedTo = resolveTarget(callName);
      workerUsed = workerName;
      engineUsed = engineType;
      confidence = confidence;
      phiWeight = phiWeight;
    }
  };

  /// Resolve which worker handles a call based on domain prefix
  func resolveWorker(callName : Text) : Text {
    // Match by known domain prefixes
    if (textStartsWith(callName, "Sovereign") or textStartsWith(callName, "Encrypted") or
        textStartsWith(callName, "PhiResonance") or textStartsWith(callName, "Knowledge") or
        textStartsWith(callName, "MultiModel") or textStartsWith(callName, "Contract") or
        textStartsWith(callName, "EdgeMesh") or textStartsWith(callName, "Organism") or
        textStartsWith(callName, "CrossOrganism") or textStartsWith(callName, "Heartbeat") or
        textStartsWith(callName, "Consensus") or textStartsWith(callName, "BFT")) {
      "PROTOCOLLUM"
    } else if (textStartsWith(callName, "AGI") or textStartsWith(callName, "Terminal") or
               textStartsWith(callName, "Command") or textStartsWith(callName, "Shell") or
               textStartsWith(callName, "PowerShell") or textStartsWith(callName, "WSL")) {
      "TERMINALIS"
    } else if (textStartsWith(callName, "Spatial") or textStartsWith(callName, "Enterprise") or
               textStartsWith(callName, "Intelligence") or textStartsWith(callName, "Document") or
               textStartsWith(callName, "Model") or textStartsWith(callName, "Frontend") or
               textStartsWith(callName, "Marketplace") or textStartsWith(callName, "Register")) {
      "ORGANISMUS"
    } else if (textStartsWith(callName, "Tool") or textStartsWith(callName, "Crawling") or
               textStartsWith(callName, "Context") or textStartsWith(callName, "Sentry") or
               textStartsWith(callName, "Builder") or textStartsWith(callName, "Tier") or
               textStartsWith(callName, "Permission") or textStartsWith(callName, "Usage") or
               textStartsWith(callName, "Reward")) {
      "MERCATOR"
    } else if (textStartsWith(callName, "GPT") or textStartsWith(callName, "Claude") or
               textStartsWith(callName, "Gemini") or textStartsWith(callName, "Llama") or
               textStartsWith(callName, "Mistral") or textStartsWith(callName, "Cohere") or
               textStartsWith(callName, "Phi")) {
      "ORCHESTRATOR"
    } else if (textStartsWith(callName, "Phi") or textStartsWith(callName, "Kuramoto") or
               textStartsWith(callName, "Fourier") or textStartsWith(callName, "Golden") or
               textStartsWith(callName, "ZScore") or textStartsWith(callName, "Sqrt") or
               textStartsWith(callName, "IQR") or textStartsWith(callName, "Pearson") or
               textStartsWith(callName, "Spectral") or textStartsWith(callName, "Mean") or
               textStartsWith(callName, "Entropy")) {
      "MATHEMATICUS"
    } else if (textStartsWith(callName, "Neural") or textStartsWith(callName, "Chaos") or
               textStartsWith(callName, "Resonance") or textStartsWith(callName, "Attention")) {
      "SYNAPTICUS"
    } else if (textStartsWith(callName, "ICP") or textStartsWith(callName, "Ethereum") or
               textStartsWith(callName, "Solana") or textStartsWith(callName, "Bitcoin") or
               textStartsWith(callName, "Node") or textStartsWith(callName, "Layer") or
               textStartsWith(callName, "CrossChain")) {
      "SUBSTRATUM"
    } else if (textStartsWith(callName, "Intelligence") or textStartsWith(callName, "Creative") or
               textStartsWith(callName, "Research") or textStartsWith(callName, "Security") or
               textStartsWith(callName, "Health") or textStartsWith(callName, "Finance") or
               textStartsWith(callName, "Education") or textStartsWith(callName, "Infrastructure") or
               textStartsWith(callName, "Governance") or textStartsWith(callName, "Commerce") or
               textStartsWith(callName, "Social") or textStartsWith(callName, "Media") or
               textStartsWith(callName, "Legal") or textStartsWith(callName, "Science")) {
      "UNIVERSUM"
    } else if (textStartsWith(callName, "Canister") or textStartsWith(callName, "Stable") or
               textStartsWith(callName, "InterCanister")) {
      "CANISTRUM"
    } else if (textStartsWith(callName, "License") or textStartsWith(callName, "Document") or
               textStartsWith(callName, "Rights") or textStartsWith(callName, "Compliance") or
               textStartsWith(callName, "Audit")) {
      "LICENTIATOR"
    } else if (textStartsWith(callName, "Threat") or textStartsWith(callName, "Immunity") or
               textStartsWith(callName, "Guardian") or textStartsWith(callName, "Prompt") or
               textStartsWith(callName, "DataLeak") or textStartsWith(callName, "Anomaly") or
               textStartsWith(callName, "Arsenal") or textStartsWith(callName, "Care")) {
      "DEFENSOR"
    // ── Multi-Power cross-domain prefixes ──
    } else if (textStartsWith(callName, "ProtocolFusion")) {
      "PROTOCOLLUM"
    } else if (textStartsWith(callName, "ObserverAI")) {
      "ORGANISMUS"
    } else if (textStartsWith(callName, "WorkerOrch")) {
      "ORCHESTRATOR"
    } else if (textStartsWith(callName, "KnowledgeGraph")) {
      "UNIVERSUM"
    } else if (textStartsWith(callName, "AutonomousAgent")) {
      "TERMINALIS"
    } else if (textStartsWith(callName, "SubstrateBridge")) {
      "SUBSTRATUM"
    } else if (textStartsWith(callName, "SecurityArsenal")) {
      "DEFENSOR"
    } else if (textStartsWith(callName, "MarketplaceRegistry")) {
      "MERCATOR"
    } else if (textStartsWith(callName, "EmergenceDetect")) {
      "SYNAPTICUS"
    } else if (textStartsWith(callName, "LawEnforcement")) {
      "LICENTIATOR"
    // ── New Builder AI prefixes ──
    } else if (textStartsWith(callName, "CodeAnalyzer") or textStartsWith(callName, "RefactorEngine") or
               textStartsWith(callName, "TestRunner") or textStartsWith(callName, "CIPipeline") or
               textStartsWith(callName, "BuildOrchestrator")) {
      "FABRICATOR"
    } else if (textStartsWith(callName, "SpikingNeural") or textStartsWith(callName, "DendriticProcessor") or
               textStartsWith(callName, "GlialNetwork")) {
      "NEURONICUS"
    } else if (textStartsWith(callName, "NegotiationEngine") or textStartsWith(callName, "ConsensusAgent") or
               textStartsWith(callName, "SwarmController")) {
      "AGENTICUS"
    } else if (textStartsWith(callName, "DifferentialPrivacy") or textStartsWith(callName, "HomomorphicEngine") or
               textStartsWith(callName, "MPCProtocol")) {
      "PRIVATICUS"
    } else if (textStartsWith(callName, "PredictiveWarmer") or textStartsWith(callName, "SemanticInvalidator") or
               textStartsWith(callName, "CacheTiering")) {
      "CACHEXIUS"
    } else if (textStartsWith(callName, "TenantIsolator") or textStartsWith(callName, "TenantDeployer") or
               textStartsWith(callName, "FeatureFlag")) {
      "TENANTIUS"
    } else if (textStartsWith(callName, "FaultInjector") or textStartsWith(callName, "GameDayRunner") or
               textStartsWith(callName, "ScalingEngine")) {
      "CHAOTICUS"
    } else if (textStartsWith(callName, "SDKRouter") or textStartsWith(callName, "APIVersion") or
               textStartsWith(callName, "DeveloperPortal") or textStartsWith(callName, "RateLimiter")) {
      "EXTERNALIS"
    } else if (textStartsWith(callName, "BlueprintScanner") or textStartsWith(callName, "HookMapper") or
               textStartsWith(callName, "InterfaceResolver")) {
      "BLUEPRINTUS"
    } else if (textStartsWith(callName, "Jarvis")) {
      "JARVISIUS"
    } else {
      "ORGANISMUS" // Default fallback
    }
  };

  /// Resolve which engine type handles the operation
  func resolveEngine(callName : Text) : Text {
    if (textContains(callName, ".init") or textContains(callName, ".create") or
        textContains(callName, ".generate") or textContains(callName, ".issue") or
        textContains(callName, ".compute") or textContains(callName, ".fire") or
        textContains(callName, ".boot") or textContains(callName, ".deploy")) {
      "Generator"
    } else if (textContains(callName, ".route") or textContains(callName, ".discover") or
               textContains(callName, ".resolve") or textContains(callName, ".score") or
               textContains(callName, ".rank") or textContains(callName, ".analyze")) {
      "Router"
    } else {
      "Builder"
    }
  };

  /// Resolve the target module path
  func resolveTarget(callName : Text) : Text {
    let worker = resolveWorker(callName);
    switch (worker) {
      case "PROTOCOLLUM"   { "protocols/" # callName };
      case "TERMINALIS"    { "sdk/terminals/" # callName };
      case "ORGANISMUS"    { "sdk/" # callName };
      case "MERCATOR"      { "sdk/marketplace/" # callName };
      case "ORCHESTRATOR"  { "sdk/models/" # callName };
      case "MATHEMATICUS"  { "sdk/math/" # callName };
      case "SYNAPTICUS"    { "sdk/synapses/" # callName };
      case "SUBSTRATUM"    { "sdk/blockchain/" # callName };
      case "UNIVERSUM"     { "sdk/universum/" # callName };
      case "CANISTRUM"     { "sdk/canisters/" # callName };
      case "LICENTIATOR"   { "sdk/licenses/" # callName };
      case "DEFENSOR"      { "sdk/defense/" # callName };
      case "FABRICATOR"    { "sdk/forgeworks/" # callName };
      case "NEURONICUS"    { "sdk/neuromorphic/" # callName };
      case "AGENTICUS"     { "sdk/syn/" # callName };    // SYN Binding Engine + MultiAgent
      case "PRIVATICUS"    { "sdk/privacy/" # callName };
      case "CACHEXIUS"     { "sdk/caching/" # callName };
      case "TENANTIUS"     { "sdk/multitenant/" # callName };
      case "CHAOTICUS"     { "sdk/chaos/" # callName };
      case "EXTERNALIS"    { "sdk/external/" # callName };
      case "BLUEPRINTUS"   { "sdk/blueprints/" # callName };
      case "JARVISIUS"     { "sdk/jarvis/" # callName };
      case _               { "sdk/" # callName };
    }
  };

  // ══════════════════════════════════════════════════════════════════════
  //  SNAPSHOT — IMAGO MOTORIS
  // ══════════════════════════════════════════════════════════════════════

  /// Build a full engine snapshot
  public func snapshot(workers : [WorkerState], ts : Int) : EngineSnapshot {
    var healthy : Nat = 0;
    var totalCalls : Nat = 0;
    for (w in workers.vals()) {
      if (w.healthy) { healthy += 1 };
      totalCalls += w.totalCalls;
    };
    {
      workers = workers;
      totalWorkers = 22;
      totalEngines = 66;
      totalCalls = totalCalls;
      healthyWorkers = healthy;
      timestampNs = ts;
    }
  };

  // ══════════════════════════════════════════════════════════════════════
  //  HELPER — AUXILIUM TEXTUALE
  // ══════════════════════════════════════════════════════════════════════

  /// Simple prefix check (Motoko doesn't have Text.startsWith in base)
  func textStartsWith(text : Text, prefix : Text) : Bool {
    let textChars = Text.toArray(text);
    let prefixChars = Text.toArray(prefix);
    if (prefixChars.size() > textChars.size()) { return false };
    var i : Nat = 0;
    while (i < prefixChars.size()) {
      if (textChars[i] != prefixChars[i]) { return false };
      i += 1;
    };
    true
  };

  /// Simple contains check
  func textContains(text : Text, sub : Text) : Bool {
    let textChars = Text.toArray(text);
    let subChars = Text.toArray(sub);
    if (subChars.size() > textChars.size()) { return false };
    var i : Nat = 0;
    while (i + subChars.size() <= textChars.size()) {
      var match = true;
      var j : Nat = 0;
      while (j < subChars.size()) {
        if (textChars[i + j] != subChars[j]) { match := false };
        j += 1;
      };
      if (match) { return true };
      i += 1;
    };
    false
  };
}
