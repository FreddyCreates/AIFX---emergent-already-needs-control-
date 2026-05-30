/// Wyoming State Governance Organism — Sovereign Intelligent Architecture
///
/// This is NOT a generic smart contract. This IS a living computational organism
/// that manages Wyoming state governance with 873ms heartbeat, phi-encoded math,
/// 4-register cognitive state, and cross-organism resonance.
///
/// As above, so below.

import Float   "mo:base/Float";
import Int     "mo:base/Int";
import Nat     "mo:base/Nat";
import Text    "mo:base/Text";
import Time    "mo:base/Time";
import Array   "mo:base/Array";
import Timer   "mo:base/Timer";
import Debug   "mo:base/Debug";

actor WyomingOrganism {

  // ── Phi Constants ─────────────────────────────────────────────────────
  let PHI : Float          = 1.618033988749895;
  let PHI_INV : Float      = 0.618033988749895;  // 1 / PHI
  let GOLDEN_ANGLE : Float = 137.508;            // degrees
  let HEARTBEAT_NS : Nat   = 873_000_000;        // 873ms in nanoseconds

  // ── Register State Types ──────────────────────────────────────────────
  public type RegisterState = {
    awareness  : Float;
    coherence  : Float;
    resonance  : Float;
    entropy    : Float;
  };

  public type GovernanceSnapshot = {
    beatCount    : Nat;
    cognitive    : RegisterState;
    affective    : RegisterState;
    somatic      : RegisterState;
    sovereign    : RegisterState;
    timestampNs  : Int;
    // Wyoming-specific governance fields
    citizenCount      : Nat;
    activeProposals   : Nat;
    fundBalance       : Nat;
    resonanceScore    : Float;
  };

  public type Citizen = {
    id           : Text;
    registeredNs : Int;
    reputation   : Float;  // phi-weighted reputation score
    voteWeight   : Float;
    syncCount    : Nat;
  };

  public type Proposal = {
    id           : Nat;
    title        : Text;
    proposer     : Text;
    category     : Text;   // "education" | "infrastructure" | "grants" | "charter"
    fundAmount   : Nat;
    yesVotes     : Float;  // phi-weighted votes
    noVotes      : Float;
    status       : Text;   // "active" | "passed" | "rejected" | "executed"
    createdNs    : Int;
    expiresNs    : Int;
  };

  public type FundAllocation = {
    id           : Nat;
    recipient    : Text;
    amount       : Nat;
    purpose      : Text;
    approvedBy   : Text;  // proposal ID
    allocatedNs  : Int;
    executedNs   : Int;
  };

  // ── Stable State — survives upgrades ──────────────────────────────────
  stable var beatCount : Nat = 0;

  // 4-register cognitive architecture
  stable var cognitiveAwareness  : Float = 1.0;
  stable var cognitiveCoherence  : Float = 1.0;
  stable var cognitiveResonance  : Float = PHI_INV;
  stable var cognitiveEntropy    : Float = 0.0;

  stable var affectiveAwareness  : Float = PHI_INV;
  stable var affectiveCoherence  : Float = 1.0;
  stable var affectiveResonance  : Float = 1.0;
  stable var affectiveEntropy    : Float = 0.0;

  stable var somaticAwareness    : Float = 1.0;
  stable var somaticCoherence    : Float = PHI_INV;
  stable var somaticResonance    : Float = 1.0;
  stable var somaticEntropy      : Float = 0.0;

  stable var sovereignAwareness  : Float = PHI;
  stable var sovereignCoherence  : Float = PHI;
  stable var sovereignResonance  : Float = PHI;
  stable var sovereignEntropy    : Float = 0.0;

  // Wyoming governance state
  stable var citizens      : [(Text, Int, Float, Float, Nat)] = [];  // (id, registeredNs, reputation, voteWeight, syncCount)
  stable var proposals     : [(Nat, Text, Text, Text, Nat, Float, Float, Text, Int, Int)] = [];
  stable var fundAllocations : [(Nat, Text, Nat, Text, Text, Int, Int)] = [];
  stable var proposalCounter : Nat = 0;
  stable var fundBalance   : Nat = 100_000_000;  // Initial fund pool
  stable var totalVotesCast : Nat = 0;

  // SYN — Synapse Binding Engine for cross-organism resonance
  stable var synImprints   : [(Text, Int, Nat)] = [];  // (agentId, boundAtNs, syncCount)
  stable var synOwner      : Text = "Wyoming-ORO";

  // ── Internal helpers ──────────────────────────────────────────────────

  func buildRegister(a : Float, c : Float, r : Float, e : Float) : RegisterState {
    { awareness = a; coherence = c; resonance = r; entropy = e }
  };

  /// Phi-modulated drift — subtle state evolution per heartbeat.
  func drift(val : Float, beat : Nat) : Float {
    let cycle = Float.sin(Float.fromInt(beat) * GOLDEN_ANGLE * (Float.pi / 180.0));
    val + cycle * 0.001 * PHI_INV
  };

  /// Clamp a float to [0, max].
  func clamp(v : Float, max : Float) : Float {
    if (v < 0.0) { 0.0 } else if (v > max) { max } else { v }
  };

  /// Phi-weighted reputation decay (Hebbian-inspired)
  func decayReputation(rep : Float, syncCount : Nat) : Float {
    let activity = Float.fromInt(syncCount);
    let decayFactor = 1.0 / (1.0 + activity / PHI);
    clamp(rep * (1.0 - 0.01 * decayFactor), PHI * PHI)
  };

  /// Calculate phi-weighted vote power
  func calculateVoteWeight(reputation : Float, syncCount : Nat) : Float {
    let base = reputation * PHI_INV;
    let boost = Float.fromInt(syncCount) * 0.01;
    clamp(base + boost, PHI)
  };

  // ── Heartbeat Timer ───────────────────────────────────────────────────

  /// The organism's 873ms pulse. Registered once on canister init.
  func tick() : async () {
    beatCount += 1;

    // Drift all 16 register dimensions
    cognitiveAwareness := drift(cognitiveAwareness, beatCount);
    cognitiveCoherence := drift(cognitiveCoherence, beatCount + 1);
    cognitiveResonance := drift(cognitiveResonance, beatCount + 2);
    cognitiveEntropy   := clamp(drift(cognitiveEntropy, beatCount + 3), PHI);

    affectiveAwareness := drift(affectiveAwareness, beatCount + 4);
    affectiveCoherence := drift(affectiveCoherence, beatCount + 5);
    affectiveResonance := drift(affectiveResonance, beatCount + 6);
    affectiveEntropy   := clamp(drift(affectiveEntropy, beatCount + 7), PHI);

    somaticAwareness   := drift(somaticAwareness, beatCount + 8);
    somaticCoherence   := drift(somaticCoherence, beatCount + 9);
    somaticResonance   := drift(somaticResonance, beatCount + 10);
    somaticEntropy     := clamp(drift(somaticEntropy, beatCount + 11), PHI);

    sovereignAwareness := drift(sovereignAwareness, beatCount + 12);
    sovereignCoherence := drift(sovereignCoherence, beatCount + 13);
    sovereignResonance := drift(sovereignResonance, beatCount + 14);
    sovereignEntropy   := clamp(drift(sovereignEntropy, beatCount + 15), PHI);

    // Process expired proposals
    let now = Time.now();
    proposals := Array.map<(Nat, Text, Text, Text, Nat, Float, Float, Text, Int, Int), (Nat, Text, Text, Text, Nat, Float, Float, Text, Int, Int)>(
      proposals,
      func((id, title, proposer, category, amount, yes, no, status, created, expires)) {
        if (status == "active" and expires <= now) {
          // Tally with phi-weighted threshold (golden ratio majority)
          let total = yes + no;
          let threshold = total * PHI_INV;  // ~61.8% approval needed
          let newStatus = if (yes >= threshold) { "passed" } else { "rejected" };
          (id, title, proposer, category, amount, yes, no, newStatus, created, expires)
        } else {
          (id, title, proposer, category, amount, yes, no, status, created, expires)
        }
      }
    );
  };

  /// Register the 873ms recurring timer on canister initialization.
  let heartbeatTimerId : Timer.TimerId = Timer.recurringTimer<system>(#nanoseconds HEARTBEAT_NS, tick);

  system func heartbeat() : async () {
    Debug.print("wyoming organism heartbeat — beat #" # Nat.toText(beatCount));
  };

  // ── Public Query: getState ────────────────────────────────────────────

  public query func getState() : async GovernanceSnapshot {
    let activeCount = Array.foldLeft<(Nat, Text, Text, Text, Nat, Float, Float, Text, Int, Int), Nat>(
      proposals,
      0,
      func(acc, (_, _, _, _, _, _, _, status, _, _)) {
        if (status == "active") { acc + 1 } else { acc }
      }
    );

    // Calculate collective resonance score using phi-weighted average
    let totalResonance = cognitiveResonance * PHI + affectiveResonance + somaticResonance * PHI_INV + sovereignResonance * PHI;
    let resonanceScore = totalResonance / (PHI + 1.0 + PHI_INV + PHI);

    {
      beatCount     = beatCount;
      cognitive     = buildRegister(cognitiveAwareness, cognitiveCoherence, cognitiveResonance, cognitiveEntropy);
      affective     = buildRegister(affectiveAwareness, affectiveCoherence, affectiveResonance, affectiveEntropy);
      somatic       = buildRegister(somaticAwareness, somaticCoherence, somaticResonance, somaticEntropy);
      sovereign     = buildRegister(sovereignAwareness, sovereignCoherence, sovereignResonance, sovereignEntropy);
      timestampNs   = Time.now();
      citizenCount  = citizens.size();
      activeProposals = activeCount;
      fundBalance   = fundBalance;
      resonanceScore = resonanceScore;
    }
  };

  // ── Citizen Management ────────────────────────────────────────────────

  public func registerCitizen(citizenId : Text) : async Citizen {
    let ts = Time.now();
    let initialRep = PHI_INV;  // Start at golden ratio inverse
    let initialWeight = calculateVoteWeight(initialRep, 0);
    citizens := Array.append(citizens, [(citizenId, ts, initialRep, initialWeight, 0)]);
    
    // Boost affective awareness on new citizen (community grows)
    affectiveAwareness := clamp(affectiveAwareness + 0.01 * PHI_INV, PHI * PHI);
    
    { id = citizenId; registeredNs = ts; reputation = initialRep; voteWeight = initialWeight; syncCount = 0 }
  };

  public query func getCitizen(citizenId : Text) : async ?Citizen {
    for ((id, reg, rep, weight, sync) in citizens.vals()) {
      if (id == citizenId) {
        return ?{ id = id; registeredNs = reg; reputation = rep; voteWeight = weight; syncCount = sync };
      };
    };
    null
  };

  // ── Proposal System ───────────────────────────────────────────────────

  public func createProposal(proposerId : Text, title : Text, category : Text, fundAmount : Nat) : async Proposal {
    proposalCounter += 1;
    let ts = Time.now();
    let expiresAt = ts + 7 * 24 * 60 * 60 * 1_000_000_000;  // 7 days in nanoseconds
    
    proposals := Array.append(proposals, [(proposalCounter, title, proposerId, category, fundAmount, 0.0, 0.0, "active", ts, expiresAt)]);
    
    // Boost cognitive awareness on new proposal (system is thinking)
    cognitiveAwareness := clamp(cognitiveAwareness + 0.02 * PHI_INV, PHI * PHI);
    
    {
      id = proposalCounter;
      title = title;
      proposer = proposerId;
      category = category;
      fundAmount = fundAmount;
      yesVotes = 0.0;
      noVotes = 0.0;
      status = "active";
      createdNs = ts;
      expiresNs = expiresAt;
    }
  };

  public func vote(citizenId : Text, proposalId : Nat, approve : Bool) : async Bool {
    // Find citizen and their vote weight
    var voterWeight : Float = 0.0;
    var found = false;
    
    for ((id, _, _, weight, _) in citizens.vals()) {
      if (id == citizenId) {
        voterWeight := weight;
        found := true;
      };
    };
    
    if (not found) { return false };
    
    // Apply phi-weighted vote to proposal
    proposals := Array.map<(Nat, Text, Text, Text, Nat, Float, Float, Text, Int, Int), (Nat, Text, Text, Text, Nat, Float, Float, Text, Int, Int)>(
      proposals,
      func((id, title, proposer, category, amount, yes, no, status, created, expires)) {
        if (id == proposalId and status == "active") {
          let newYes = if (approve) { yes + voterWeight * PHI } else { yes };
          let newNo = if (not approve) { no + voterWeight * PHI } else { no };
          (id, title, proposer, category, amount, newYes, newNo, status, created, expires)
        } else {
          (id, title, proposer, category, amount, yes, no, status, created, expires)
        }
      }
    );
    
    // Increment citizen sync count and update reputation
    citizens := Array.map<(Text, Int, Float, Float, Nat), (Text, Int, Float, Float, Nat)>(
      citizens,
      func((id, reg, rep, weight, sync)) {
        if (id == citizenId) {
          let newSync = sync + 1;
          let newRep = clamp(rep + 0.01 * PHI_INV, PHI);  // Reputation boost for participation
          let newWeight = calculateVoteWeight(newRep, newSync);
          (id, reg, newRep, newWeight, newSync)
        } else {
          (id, reg, rep, weight, sync)
        }
      }
    );
    
    totalVotesCast += 1;
    
    // Boost sovereign resonance on voting (collective decision-making)
    sovereignResonance := clamp(sovereignResonance + 0.005 * PHI_INV, PHI * PHI);
    
    true
  };

  public func executeProposal(proposalId : Nat) : async Bool {
    var success = false;
    
    proposals := Array.map<(Nat, Text, Text, Text, Nat, Float, Float, Text, Int, Int), (Nat, Text, Text, Text, Nat, Float, Float, Text, Int, Int)>(
      proposals,
      func((id, title, proposer, category, amount, yes, no, status, created, expires)) {
        if (id == proposalId and status == "passed" and amount <= fundBalance) {
          fundBalance -= amount;
          let ts = Time.now();
          fundAllocations := Array.append(fundAllocations, [(id, proposer, amount, category, Nat.toText(id), ts, ts)]);
          success := true;
          (id, title, proposer, category, amount, yes, no, "executed", created, expires)
        } else {
          (id, title, proposer, category, amount, yes, no, status, created, expires)
        }
      }
    );
    
    if (success) {
      // Boost somatic resonance on execution (action taken)
      somaticResonance := clamp(somaticResonance + 0.03 * PHI_INV, PHI * PHI);
    };
    
    success
  };

  public query func getProposals(statusFilter : ?Text) : async [Proposal] {
    Array.mapFilter<(Nat, Text, Text, Text, Nat, Float, Float, Text, Int, Int), Proposal>(
      proposals,
      func((id, title, proposer, category, amount, yes, no, status, created, expires)) {
        switch (statusFilter) {
          case (?filter) {
            if (status == filter) {
              ?{ id = id; title = title; proposer = proposer; category = category; fundAmount = amount; yesVotes = yes; noVotes = no; status = status; createdNs = created; expiresNs = expires }
            } else {
              null
            }
          };
          case (null) {
            ?{ id = id; title = title; proposer = proposer; category = category; fundAmount = amount; yesVotes = yes; noVotes = no; status = status; createdNs = created; expiresNs = expires }
          };
        }
      }
    )
  };

  // ── Fund Management ───────────────────────────────────────────────────

  public func depositFunds(amount : Nat) : async Nat {
    fundBalance += amount;
    // Boost affective coherence (resources strengthen community)
    affectiveCoherence := clamp(affectiveCoherence + 0.01 * PHI_INV, PHI * PHI);
    fundBalance
  };

  public query func getFundBalance() : async Nat {
    fundBalance
  };

  public query func getAllocations() : async [FundAllocation] {
    Array.map<(Nat, Text, Nat, Text, Text, Int, Int), FundAllocation>(
      fundAllocations,
      func((id, recipient, amount, purpose, approvedBy, allocatedNs, executedNs)) {
        { id = id; recipient = recipient; amount = amount; purpose = purpose; approvedBy = approvedBy; allocatedNs = allocatedNs; executedNs = executedNs }
      }
    )
  };

  // ── SYN — Synapse Binding for Cross-Organism Resonance ────────────────

  public func bindSynapse(agentId : Text) : async Bool {
    let ts = Time.now();
    synImprints := Array.append(synImprints, [(agentId, ts, 0)]);
    
    // Cross-organism binding boosts sovereign awareness
    sovereignAwareness := clamp(sovereignAwareness + 0.05 * PHI_INV, PHI * PHI * PHI);
    
    true
  };

  public func syncSynapse(agentId : Text) : async Bool {
    var found = false;
    synImprints := Array.map<(Text, Int, Nat), (Text, Int, Nat)>(
      synImprints,
      func((id, bound, sync)) {
        if (id == agentId) {
          found := true;
          (id, bound, sync + 1)
        } else {
          (id, bound, sync)
        }
      }
    );
    found
  };

  public query func getSynapseHealth() : async { totalBound : Nat; lastSyncBeat : Nat; owner : Text } {
    { totalBound = synImprints.size(); lastSyncBeat = beatCount; owner = synOwner }
  };
};
