/// Nevada State Governance Organism — Sovereign Intelligent Architecture
///
/// Living computational organism for Nevada state governance.
/// 873ms heartbeat, phi-encoded math, 4-register cognitive state,
/// cross-organism resonance with Wyoming and other state organisms.
///
/// Focus: Gaming regulation, energy (solar), tourism, innovation zones
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

actor NevadaOrganism {

  // ── Phi Constants ─────────────────────────────────────────────────────
  let PHI : Float          = 1.618033988749895;
  let PHI_INV : Float      = 0.618033988749895;
  let GOLDEN_ANGLE : Float = 137.508;
  let HEARTBEAT_NS : Nat   = 873_000_000;

  // ── Register State Types ──────────────────────────────────────────────
  public type RegisterState = {
    awareness  : Float;
    coherence  : Float;
    resonance  : Float;
    entropy    : Float;
  };

  public type GovernanceSnapshot = {
    beatCount         : Nat;
    cognitive         : RegisterState;
    affective         : RegisterState;
    somatic           : RegisterState;
    sovereign         : RegisterState;
    timestampNs       : Int;
    citizenCount      : Nat;
    activeProposals   : Nat;
    fundBalance       : Nat;
    resonanceScore    : Float;
    // Nevada-specific
    innovationZones   : Nat;
    energyCredits     : Nat;
  };

  public type Citizen = {
    id           : Text;
    registeredNs : Int;
    reputation   : Float;
    voteWeight   : Float;
    syncCount    : Nat;
    zone         : Text;  // Nevada zone: "clark" | "washoe" | "innovation" | "rural"
  };

  public type InnovationZone = {
    id           : Nat;
    name         : Text;
    county       : Text;
    sponsor      : Text;
    status       : Text;   // "proposed" | "active" | "suspended"
    energyCredits : Nat;
    createdNs    : Int;
  };

  public type Proposal = {
    id           : Nat;
    title        : Text;
    proposer     : Text;
    category     : Text;   // "energy" | "gaming" | "innovation" | "infrastructure" | "tourism"
    fundAmount   : Nat;
    yesVotes     : Float;
    noVotes      : Float;
    status       : Text;
    createdNs    : Int;
    expiresNs    : Int;
  };

  public type EnergyCredit = {
    id           : Nat;
    source       : Text;   // "solar" | "geothermal" | "wind"
    amount       : Nat;
    generatedNs  : Int;
    owner        : Text;
  };

  // ── Stable State ──────────────────────────────────────────────────────
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

  // Nevada governance state
  stable var citizens        : [(Text, Int, Float, Float, Nat, Text)] = [];
  stable var proposals       : [(Nat, Text, Text, Text, Nat, Float, Float, Text, Int, Int)] = [];
  stable var innovationZones : [(Nat, Text, Text, Text, Text, Nat, Int)] = [];
  stable var energyCredits   : [(Nat, Text, Nat, Int, Text)] = [];
  stable var proposalCounter : Nat = 0;
  stable var zoneCounter     : Nat = 0;
  stable var creditCounter   : Nat = 0;
  stable var fundBalance     : Nat = 150_000_000;  // Nevada innovation fund
  stable var totalEnergyCredits : Nat = 0;

  // SYN — Cross-organism bindings
  stable var synImprints     : [(Text, Int, Nat)] = [];
  stable var synOwner        : Text = "Nevada-ORO";

  // ── Internal helpers ──────────────────────────────────────────────────

  func buildRegister(a : Float, c : Float, r : Float, e : Float) : RegisterState {
    { awareness = a; coherence = c; resonance = r; entropy = e }
  };

  func drift(val : Float, beat : Nat) : Float {
    let cycle = Float.sin(Float.fromInt(beat) * GOLDEN_ANGLE * (Float.pi / 180.0));
    val + cycle * 0.001 * PHI_INV
  };

  func clamp(v : Float, max : Float) : Float {
    if (v < 0.0) { 0.0 } else if (v > max) { max } else { v }
  };

  func calculateVoteWeight(reputation : Float, syncCount : Nat, zone : Text) : Float {
    let base = reputation * PHI_INV;
    let syncBoost = Float.fromInt(syncCount) * 0.01;
    // Innovation zone citizens get phi-weighted boost
    let zoneBoost = if (zone == "innovation") { PHI_INV * 0.1 } else { 0.0 };
    clamp(base + syncBoost + zoneBoost, PHI)
  };

  // ── Heartbeat Timer ───────────────────────────────────────────────────

  func tick() : async () {
    beatCount += 1;

    // Drift all registers
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

    // Generate energy credits based on active innovation zones (phi-scaled)
    let activeZones = Array.filter<(Nat, Text, Text, Text, Text, Nat, Int)>(
      innovationZones,
      func((_, _, _, _, status, _, _)) { status == "active" }
    );
    
    for ((zoneId, _, _, _, _, _, _) in activeZones.vals()) {
      // Each active zone generates phi-weighted energy credits per heartbeat
      let creditsGenerated = Nat.max(1, Int.abs(Float.toInt(Float.fromInt(beatCount % 100) * PHI_INV)));
      creditCounter += 1;
      energyCredits := Array.append(energyCredits, [(creditCounter, "solar", creditsGenerated, Time.now(), "zone-" # Nat.toText(zoneId))]);
      totalEnergyCredits += creditsGenerated;
    };

    // Process expired proposals
    let now = Time.now();
    proposals := Array.map<(Nat, Text, Text, Text, Nat, Float, Float, Text, Int, Int), (Nat, Text, Text, Text, Nat, Float, Float, Text, Int, Int)>(
      proposals,
      func((id, title, proposer, category, amount, yes, no, status, created, expires)) {
        if (status == "active" and expires <= now) {
          let total = yes + no;
          let threshold = total * PHI_INV;
          let newStatus = if (yes >= threshold) { "passed" } else { "rejected" };
          (id, title, proposer, category, amount, yes, no, newStatus, created, expires)
        } else {
          (id, title, proposer, category, amount, yes, no, status, created, expires)
        }
      }
    );
  };

  let heartbeatTimerId : Timer.TimerId = Timer.recurringTimer<system>(#nanoseconds HEARTBEAT_NS, tick);

  system func heartbeat() : async () {
    Debug.print("nevada organism heartbeat — beat #" # Nat.toText(beatCount));
  };

  // ── Public Query: getState ────────────────────────────────────────────

  public query func getState() : async GovernanceSnapshot {
    let activeProposalCount = Array.foldLeft<(Nat, Text, Text, Text, Nat, Float, Float, Text, Int, Int), Nat>(
      proposals, 0,
      func(acc, (_, _, _, _, _, _, _, status, _, _)) { if (status == "active") { acc + 1 } else { acc } }
    );

    let activeZoneCount = Array.foldLeft<(Nat, Text, Text, Text, Text, Nat, Int), Nat>(
      innovationZones, 0,
      func(acc, (_, _, _, _, status, _, _)) { if (status == "active") { acc + 1 } else { acc } }
    );

    let totalResonance = cognitiveResonance * PHI + affectiveResonance + somaticResonance * PHI_INV + sovereignResonance * PHI;
    let resonanceScore = totalResonance / (PHI + 1.0 + PHI_INV + PHI);

    {
      beatCount       = beatCount;
      cognitive       = buildRegister(cognitiveAwareness, cognitiveCoherence, cognitiveResonance, cognitiveEntropy);
      affective       = buildRegister(affectiveAwareness, affectiveCoherence, affectiveResonance, affectiveEntropy);
      somatic         = buildRegister(somaticAwareness, somaticCoherence, somaticResonance, somaticEntropy);
      sovereign       = buildRegister(sovereignAwareness, sovereignCoherence, sovereignResonance, sovereignEntropy);
      timestampNs     = Time.now();
      citizenCount    = citizens.size();
      activeProposals = activeProposalCount;
      fundBalance     = fundBalance;
      resonanceScore  = resonanceScore;
      innovationZones = activeZoneCount;
      energyCredits   = totalEnergyCredits;
    }
  };

  // ── Citizen Management ────────────────────────────────────────────────

  public func registerCitizen(citizenId : Text, zone : Text) : async Citizen {
    let ts = Time.now();
    let initialRep = PHI_INV;
    let initialWeight = calculateVoteWeight(initialRep, 0, zone);
    citizens := Array.append(citizens, [(citizenId, ts, initialRep, initialWeight, 0, zone)]);
    
    affectiveAwareness := clamp(affectiveAwareness + 0.01 * PHI_INV, PHI * PHI);
    
    { id = citizenId; registeredNs = ts; reputation = initialRep; voteWeight = initialWeight; syncCount = 0; zone = zone }
  };

  public query func getCitizen(citizenId : Text) : async ?Citizen {
    for ((id, reg, rep, weight, sync, zone) in citizens.vals()) {
      if (id == citizenId) {
        return ?{ id = id; registeredNs = reg; reputation = rep; voteWeight = weight; syncCount = sync; zone = zone };
      };
    };
    null
  };

  // ── Innovation Zones ──────────────────────────────────────────────────

  public func createInnovationZone(name : Text, county : Text, sponsor : Text) : async InnovationZone {
    zoneCounter += 1;
    let ts = Time.now();
    innovationZones := Array.append(innovationZones, [(zoneCounter, name, county, sponsor, "proposed", 0, ts)]);
    
    // Innovation zones boost cognitive awareness (new ideas)
    cognitiveAwareness := clamp(cognitiveAwareness + 0.05 * PHI_INV, PHI * PHI);
    
    { id = zoneCounter; name = name; county = county; sponsor = sponsor; status = "proposed"; energyCredits = 0; createdNs = ts }
  };

  public func activateInnovationZone(zoneId : Nat) : async Bool {
    var found = false;
    innovationZones := Array.map<(Nat, Text, Text, Text, Text, Nat, Int), (Nat, Text, Text, Text, Text, Nat, Int)>(
      innovationZones,
      func((id, name, county, sponsor, status, credits, created)) {
        if (id == zoneId and status == "proposed") {
          found := true;
          (id, name, county, sponsor, "active", credits, created)
        } else {
          (id, name, county, sponsor, status, credits, created)
        }
      }
    );
    
    if (found) {
      // Zone activation boosts somatic resonance (real-world action)
      somaticResonance := clamp(somaticResonance + 0.03 * PHI_INV, PHI * PHI);
    };
    
    found
  };

  public query func getInnovationZones() : async [InnovationZone] {
    Array.map<(Nat, Text, Text, Text, Text, Nat, Int), InnovationZone>(
      innovationZones,
      func((id, name, county, sponsor, status, credits, created)) {
        { id = id; name = name; county = county; sponsor = sponsor; status = status; energyCredits = credits; createdNs = created }
      }
    )
  };

  // ── Proposal System ───────────────────────────────────────────────────

  public func createProposal(proposerId : Text, title : Text, category : Text, fundAmount : Nat) : async Proposal {
    proposalCounter += 1;
    let ts = Time.now();
    let expiresAt = ts + 7 * 24 * 60 * 60 * 1_000_000_000;
    
    proposals := Array.append(proposals, [(proposalCounter, title, proposerId, category, fundAmount, 0.0, 0.0, "active", ts, expiresAt)]);
    cognitiveAwareness := clamp(cognitiveAwareness + 0.02 * PHI_INV, PHI * PHI);
    
    {
      id = proposalCounter; title = title; proposer = proposerId; category = category;
      fundAmount = fundAmount; yesVotes = 0.0; noVotes = 0.0; status = "active";
      createdNs = ts; expiresNs = expiresAt;
    }
  };

  public func vote(citizenId : Text, proposalId : Nat, approve : Bool) : async Bool {
    var voterWeight : Float = 0.0;
    var found = false;
    
    for ((id, _, _, weight, _, _) in citizens.vals()) {
      if (id == citizenId) { voterWeight := weight; found := true; };
    };
    
    if (not found) { return false };
    
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
    
    // Update citizen reputation
    citizens := Array.map<(Text, Int, Float, Float, Nat, Text), (Text, Int, Float, Float, Nat, Text)>(
      citizens,
      func((id, reg, rep, weight, sync, zone)) {
        if (id == citizenId) {
          let newSync = sync + 1;
          let newRep = clamp(rep + 0.01 * PHI_INV, PHI);
          let newWeight = calculateVoteWeight(newRep, newSync, zone);
          (id, reg, newRep, newWeight, newSync, zone)
        } else {
          (id, reg, rep, weight, sync, zone)
        }
      }
    );
    
    sovereignResonance := clamp(sovereignResonance + 0.005 * PHI_INV, PHI * PHI);
    true
  };

  public query func getProposals(statusFilter : ?Text) : async [Proposal] {
    Array.mapFilter<(Nat, Text, Text, Text, Nat, Float, Float, Text, Int, Int), Proposal>(
      proposals,
      func((id, title, proposer, category, amount, yes, no, status, created, expires)) {
        switch (statusFilter) {
          case (?filter) {
            if (status == filter) {
              ?{ id = id; title = title; proposer = proposer; category = category; fundAmount = amount; yesVotes = yes; noVotes = no; status = status; createdNs = created; expiresNs = expires }
            } else { null }
          };
          case (null) {
            ?{ id = id; title = title; proposer = proposer; category = category; fundAmount = amount; yesVotes = yes; noVotes = no; status = status; createdNs = created; expiresNs = expires }
          };
        }
      }
    )
  };

  // ── Energy Credits ────────────────────────────────────────────────────

  public query func getEnergyCredits(owner : ?Text) : async [EnergyCredit] {
    Array.mapFilter<(Nat, Text, Nat, Int, Text), EnergyCredit>(
      energyCredits,
      func((id, source, amount, generated, creditOwner)) {
        switch (owner) {
          case (?o) {
            if (creditOwner == o) {
              ?{ id = id; source = source; amount = amount; generatedNs = generated; owner = creditOwner }
            } else { null }
          };
          case (null) {
            ?{ id = id; source = source; amount = amount; generatedNs = generated; owner = creditOwner }
          };
        }
      }
    )
  };

  public query func getTotalEnergyCredits() : async Nat { totalEnergyCredits };

  // ── Fund Management ───────────────────────────────────────────────────

  public func depositFunds(amount : Nat) : async Nat {
    fundBalance += amount;
    affectiveCoherence := clamp(affectiveCoherence + 0.01 * PHI_INV, PHI * PHI);
    fundBalance
  };

  public query func getFundBalance() : async Nat { fundBalance };

  // ── SYN — Synapse Binding ─────────────────────────────────────────────

  public func bindSynapse(agentId : Text) : async Bool {
    let ts = Time.now();
    synImprints := Array.append(synImprints, [(agentId, ts, 0)]);
    sovereignAwareness := clamp(sovereignAwareness + 0.05 * PHI_INV, PHI * PHI * PHI);
    true
  };

  public func syncSynapse(agentId : Text) : async Bool {
    var found = false;
    synImprints := Array.map<(Text, Int, Nat), (Text, Int, Nat)>(
      synImprints,
      func((id, bound, sync)) {
        if (id == agentId) { found := true; (id, bound, sync + 1) }
        else { (id, bound, sync) }
      }
    );
    found
  };

  public query func getSynapseHealth() : async { totalBound : Nat; lastSyncBeat : Nat; owner : Text } {
    { totalBound = synImprints.size(); lastSyncBeat = beatCount; owner = synOwner }
  };
};
