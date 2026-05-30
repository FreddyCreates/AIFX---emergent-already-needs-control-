/// Dallas ISD Student Intelligence Organism — Sovereign Learning Architecture
///
/// This is NOT a database. This IS a living computational organism that
/// manages student growth, learning pathways, and educational resonance.
/// 873ms heartbeat, phi-encoded learning curves, 4-register cognitive state.
///
/// Focus: Student growth tracking, learning pathways, educator support,
/// family engagement, district-wide educational resonance.
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

actor DallasISDOrganism {

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

  public type DistrictSnapshot = {
    beatCount           : Nat;
    cognitive           : RegisterState;
    affective           : RegisterState;
    somatic             : RegisterState;
    sovereign           : RegisterState;
    timestampNs         : Int;
    // Dallas ISD specific
    studentCount        : Nat;
    educatorCount       : Nat;
    schoolCount         : Nat;
    averageGrowthRate   : Float;
    districtResonance   : Float;
  };

  // ── Student Learning Model ────────────────────────────────────────────
  public type Student = {
    id              : Text;
    enrolledNs      : Int;
    gradeLevel      : Nat;
    school          : Text;
    // 4-register learning state (mirrors organism architecture)
    cognitiveScore  : Float;   // Academic understanding
    affectiveScore  : Float;   // Engagement/motivation
    somaticScore    : Float;   // Physical/behavioral
    sovereignScore  : Float;   // Self-direction/autonomy
    growthRate      : Float;   // Phi-weighted growth trajectory
    pathwayId       : Nat;     // Current learning pathway
    syncCount       : Nat;     // Engagement frequency
  };

  public type LearningPathway = {
    id              : Nat;
    name            : Text;
    domain          : Text;   // "stem" | "humanities" | "arts" | "vocational" | "integrated"
    difficulty      : Float;  // Phi-scaled difficulty (1.0 to PHI^3)
    prerequisites   : [Nat];  // Pathway IDs
    outcomes        : [Text]; // Expected competencies
    createdNs       : Int;
  };

  public type Educator = {
    id              : Text;
    enrolledNs      : Int;
    school          : Text;
    specialty       : Text;
    effectivenessScore : Float;  // Phi-weighted teaching effectiveness
    studentLoad     : Nat;
    syncCount       : Nat;
  };

  public type School = {
    id              : Text;
    name            : Text;
    region          : Text;   // "north" | "south" | "east" | "west" | "central"
    studentCount    : Nat;
    educatorCount   : Nat;
    resonanceScore  : Float;  // Collective learning resonance
    createdNs       : Int;
  };

  public type LearningMilestone = {
    id              : Nat;
    studentId       : Text;
    pathwayId       : Nat;
    milestone       : Text;
    score           : Float;  // Achievement level (phi-scaled)
    achievedNs      : Int;
    validatedBy     : Text;   // Educator ID
  };

  public type FamilyEngagement = {
    id              : Nat;
    studentId       : Text;
    familyId        : Text;
    engagementType  : Text;   // "conference" | "event" | "volunteer" | "communication"
    impactScore     : Float;  // Phi-weighted impact on student
    recordedNs      : Int;
  };

  // ── Stable State ──────────────────────────────────────────────────────
  stable var beatCount : Nat = 0;

  // 4-register cognitive architecture (district-wide)
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

  // Student data (id, enrolledNs, gradeLevel, school, cog, aff, som, sov, growthRate, pathwayId, syncCount)
  stable var students : [(Text, Int, Nat, Text, Float, Float, Float, Float, Float, Nat, Nat)] = [];
  
  // Learning pathways (id, name, domain, difficulty, prereqs, outcomes, createdNs)
  stable var pathways : [(Nat, Text, Text, Float, Text, Text, Int)] = [];  // prereqs and outcomes as comma-separated
  
  // Educators (id, enrolledNs, school, specialty, effectiveness, load, syncCount)
  stable var educators : [(Text, Int, Text, Text, Float, Nat, Nat)] = [];
  
  // Schools (id, name, region, studentCount, educatorCount, resonance, createdNs)
  stable var schools : [(Text, Text, Text, Nat, Nat, Float, Int)] = [];
  
  // Milestones (id, studentId, pathwayId, milestone, score, achievedNs, validatedBy)
  stable var milestones : [(Nat, Text, Nat, Text, Float, Int, Text)] = [];
  
  // Family engagement (id, studentId, familyId, type, impact, recordedNs)
  stable var engagements : [(Nat, Text, Text, Text, Float, Int)] = [];

  stable var pathwayCounter : Nat = 0;
  stable var milestoneCounter : Nat = 0;
  stable var engagementCounter : Nat = 0;

  // SYN — Cross-organism bindings (for state/federal integration)
  stable var synImprints : [(Text, Int, Nat)] = [];
  stable var synOwner : Text = "DallasISD-ORO";

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

  /// Phi-weighted learning growth calculation
  /// Growth follows golden spiral: slow start, accelerating gains, plateau near mastery
  func calculateGrowthRate(cognitive : Float, affective : Float, somatic : Float, sovereign : Float, syncCount : Nat) : Float {
    let base = (cognitive * PHI + affective + somatic * PHI_INV + sovereign * PHI) / (PHI + 1.0 + PHI_INV + PHI);
    let engagement = Float.fromInt(syncCount) * 0.005;
    // Growth follows phi-spiral: peaks at ~61.8% of capacity, plateaus near PHI
    let potential = 1.0 / (1.0 + Float.exp(-3.0 * (base - PHI_INV)));
    clamp(potential + engagement, PHI)
  };

  /// Calculate school resonance from student collective growth
  func calculateSchoolResonance(schoolId : Text) : Float {
    var totalGrowth : Float = 0.0;
    var count : Nat = 0;
    
    for ((_, _, _, school, cog, aff, som, sov, growth, _, _) in students.vals()) {
      if (school == schoolId) {
        totalGrowth += growth;
        count += 1;
      };
    };
    
    if (count == 0) { return PHI_INV };
    let avg = totalGrowth / Float.fromInt(count);
    clamp(avg * PHI_INV, PHI)
  };

  // ── Heartbeat Timer ───────────────────────────────────────────────────

  func tick() : async () {
    beatCount += 1;

    // Drift all registers (district-wide learning state)
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

    // Update all student growth rates (learning never stops)
    students := Array.map<(Text, Int, Nat, Text, Float, Float, Float, Float, Float, Nat, Nat), (Text, Int, Nat, Text, Float, Float, Float, Float, Float, Nat, Nat)>(
      students,
      func((id, enrolled, grade, school, cog, aff, som, sov, _, pathway, sync)) {
        let newGrowth = calculateGrowthRate(cog, aff, som, sov, sync);
        (id, enrolled, grade, school, cog, aff, som, sov, newGrowth, pathway, sync)
      }
    );

    // Update all school resonance scores
    schools := Array.map<(Text, Text, Text, Nat, Nat, Float, Int), (Text, Text, Text, Nat, Nat, Float, Int)>(
      schools,
      func((id, name, region, studentCount, educatorCount, _, created)) {
        let newResonance = calculateSchoolResonance(id);
        (id, name, region, studentCount, educatorCount, newResonance, created)
      }
    );
  };

  let heartbeatTimerId : Timer.TimerId = Timer.recurringTimer<system>(#nanoseconds HEARTBEAT_NS, tick);

  system func heartbeat() : async () {
    Debug.print("dallas-isd organism heartbeat — beat #" # Nat.toText(beatCount) # " | students: " # Nat.toText(students.size()));
  };

  // ── Public Query: getState ────────────────────────────────────────────

  public query func getState() : async DistrictSnapshot {
    // Calculate average growth rate
    var totalGrowth : Float = 0.0;
    for ((_, _, _, _, _, _, _, _, growth, _, _) in students.vals()) {
      totalGrowth += growth;
    };
    let avgGrowth = if (students.size() == 0) { 0.0 } else { totalGrowth / Float.fromInt(students.size()) };

    // Calculate district resonance (phi-weighted from all registers)
    let totalResonance = cognitiveResonance * PHI + affectiveResonance + somaticResonance * PHI_INV + sovereignResonance * PHI;
    let districtResonance = totalResonance / (PHI + 1.0 + PHI_INV + PHI);

    {
      beatCount         = beatCount;
      cognitive         = buildRegister(cognitiveAwareness, cognitiveCoherence, cognitiveResonance, cognitiveEntropy);
      affective         = buildRegister(affectiveAwareness, affectiveCoherence, affectiveResonance, affectiveEntropy);
      somatic           = buildRegister(somaticAwareness, somaticCoherence, somaticResonance, somaticEntropy);
      sovereign         = buildRegister(sovereignAwareness, sovereignCoherence, sovereignResonance, sovereignEntropy);
      timestampNs       = Time.now();
      studentCount      = students.size();
      educatorCount     = educators.size();
      schoolCount       = schools.size();
      averageGrowthRate = avgGrowth;
      districtResonance = districtResonance;
    }
  };

  // ── School Management ─────────────────────────────────────────────────

  public func registerSchool(schoolId : Text, name : Text, region : Text) : async School {
    let ts = Time.now();
    schools := Array.append(schools, [(schoolId, name, region, 0, 0, PHI_INV, ts)]);
    
    // New school boosts somatic awareness (infrastructure growth)
    somaticAwareness := clamp(somaticAwareness + 0.02 * PHI_INV, PHI * PHI);
    
    { id = schoolId; name = name; region = region; studentCount = 0; educatorCount = 0; resonanceScore = PHI_INV; createdNs = ts }
  };

  public query func getSchool(schoolId : Text) : async ?School {
    for ((id, name, region, students, educators, resonance, created) in schools.vals()) {
      if (id == schoolId) {
        return ?{ id = id; name = name; region = region; studentCount = students; educatorCount = educators; resonanceScore = resonance; createdNs = created };
      };
    };
    null
  };

  public query func getSchools() : async [School] {
    Array.map<(Text, Text, Text, Nat, Nat, Float, Int), School>(
      schools,
      func((id, name, region, studentCount, educatorCount, resonance, created)) {
        { id = id; name = name; region = region; studentCount = studentCount; educatorCount = educatorCount; resonanceScore = resonance; createdNs = created }
      }
    )
  };

  // ── Student Management ────────────────────────────────────────────────

  public func enrollStudent(studentId : Text, gradeLevel : Nat, schoolId : Text) : async Student {
    let ts = Time.now();
    // Initial scores start at phi-inverse (the learning begins)
    let initialScore = PHI_INV;
    let initialGrowth = calculateGrowthRate(initialScore, initialScore, initialScore, initialScore, 0);
    
    students := Array.append(students, [(studentId, ts, gradeLevel, schoolId, initialScore, initialScore, initialScore, initialScore, initialGrowth, 0, 0)]);
    
    // Update school student count
    schools := Array.map<(Text, Text, Text, Nat, Nat, Float, Int), (Text, Text, Text, Nat, Nat, Float, Int)>(
      schools,
      func((id, name, region, count, edCount, resonance, created)) {
        if (id == schoolId) { (id, name, region, count + 1, edCount, resonance, created) }
        else { (id, name, region, count, edCount, resonance, created) }
      }
    );
    
    // New student boosts affective awareness (community growth)
    affectiveAwareness := clamp(affectiveAwareness + 0.005 * PHI_INV, PHI * PHI);
    
    { 
      id = studentId; enrolledNs = ts; gradeLevel = gradeLevel; school = schoolId;
      cognitiveScore = initialScore; affectiveScore = initialScore; somaticScore = initialScore; sovereignScore = initialScore;
      growthRate = initialGrowth; pathwayId = 0; syncCount = 0 
    }
  };

  public query func getStudent(studentId : Text) : async ?Student {
    for ((id, enrolled, grade, school, cog, aff, som, sov, growth, pathway, sync) in students.vals()) {
      if (id == studentId) {
        return ?{ id = id; enrolledNs = enrolled; gradeLevel = grade; school = school; 
                  cognitiveScore = cog; affectiveScore = aff; somaticScore = som; sovereignScore = sov;
                  growthRate = growth; pathwayId = pathway; syncCount = sync };
      };
    };
    null
  };

  public func updateStudentScores(studentId : Text, cognitive : Float, affective : Float, somatic : Float, sovereign : Float) : async Bool {
    var found = false;
    students := Array.map<(Text, Int, Nat, Text, Float, Float, Float, Float, Float, Nat, Nat), (Text, Int, Nat, Text, Float, Float, Float, Float, Float, Nat, Nat)>(
      students,
      func((id, enrolled, grade, school, _, _, _, _, _, pathway, sync)) {
        if (id == studentId) {
          found := true;
          let newCog = clamp(cognitive, PHI * PHI);
          let newAff = clamp(affective, PHI * PHI);
          let newSom = clamp(somatic, PHI * PHI);
          let newSov = clamp(sovereign, PHI * PHI);
          let newSync = sync + 1;
          let newGrowth = calculateGrowthRate(newCog, newAff, newSom, newSov, newSync);
          (id, enrolled, grade, school, newCog, newAff, newSom, newSov, newGrowth, pathway, newSync)
        } else {
          (id, enrolled, grade, school, cognitive, affective, somatic, sovereign, 0.0, pathway, sync)
        }
      }
    );
    
    if (found) {
      // Score update boosts cognitive resonance (learning happening)
      cognitiveResonance := clamp(cognitiveResonance + 0.002 * PHI_INV, PHI * PHI);
    };
    
    found
  };

  public func assignPathway(studentId : Text, pathwayId : Nat) : async Bool {
    var found = false;
    students := Array.map<(Text, Int, Nat, Text, Float, Float, Float, Float, Float, Nat, Nat), (Text, Int, Nat, Text, Float, Float, Float, Float, Float, Nat, Nat)>(
      students,
      func((id, enrolled, grade, school, cog, aff, som, sov, growth, _, sync)) {
        if (id == studentId) {
          found := true;
          (id, enrolled, grade, school, cog, aff, som, sov, growth, pathwayId, sync + 1)
        } else {
          (id, enrolled, grade, school, cog, aff, som, sov, growth, pathwayId, sync)
        }
      }
    );
    
    if (found) {
      sovereignAwareness := clamp(sovereignAwareness + 0.01 * PHI_INV, PHI * PHI);
    };
    
    found
  };

  // ── Learning Pathways ─────────────────────────────────────────────────

  public func createPathway(name : Text, domain : Text, difficulty : Float, prerequisites : Text, outcomes : Text) : async LearningPathway {
    pathwayCounter += 1;
    let ts = Time.now();
    let clampedDiff = clamp(difficulty, PHI * PHI * PHI);
    
    pathways := Array.append(pathways, [(pathwayCounter, name, domain, clampedDiff, prerequisites, outcomes, ts)]);
    
    // New pathway boosts cognitive awareness (curriculum expansion)
    cognitiveAwareness := clamp(cognitiveAwareness + 0.03 * PHI_INV, PHI * PHI);
    
    { id = pathwayCounter; name = name; domain = domain; difficulty = clampedDiff; prerequisites = []; outcomes = []; createdNs = ts }
  };

  public query func getPathways() : async [LearningPathway] {
    Array.map<(Nat, Text, Text, Float, Text, Text, Int), LearningPathway>(
      pathways,
      func((id, name, domain, difficulty, _, _, created)) {
        { id = id; name = name; domain = domain; difficulty = difficulty; prerequisites = []; outcomes = []; createdNs = created }
      }
    )
  };

  // ── Educator Management ───────────────────────────────────────────────

  public func registerEducator(educatorId : Text, schoolId : Text, specialty : Text) : async Educator {
    let ts = Time.now();
    let initialEffectiveness = PHI_INV;
    
    educators := Array.append(educators, [(educatorId, ts, schoolId, specialty, initialEffectiveness, 0, 0)]);
    
    // Update school educator count
    schools := Array.map<(Text, Text, Text, Nat, Nat, Float, Int), (Text, Text, Text, Nat, Nat, Float, Int)>(
      schools,
      func((id, name, region, studentCount, edCount, resonance, created)) {
        if (id == schoolId) { (id, name, region, studentCount, edCount + 1, resonance, created) }
        else { (id, name, region, studentCount, edCount, resonance, created) }
      }
    );
    
    // New educator boosts affective coherence (teaching capacity)
    affectiveCoherence := clamp(affectiveCoherence + 0.02 * PHI_INV, PHI * PHI);
    
    { id = educatorId; enrolledNs = ts; school = schoolId; specialty = specialty; effectivenessScore = initialEffectiveness; studentLoad = 0; syncCount = 0 }
  };

  public query func getEducator(educatorId : Text) : async ?Educator {
    for ((id, enrolled, school, specialty, effectiveness, load, sync) in educators.vals()) {
      if (id == educatorId) {
        return ?{ id = id; enrolledNs = enrolled; school = school; specialty = specialty; effectivenessScore = effectiveness; studentLoad = load; syncCount = sync };
      };
    };
    null
  };

  // ── Milestones ────────────────────────────────────────────────────────

  public func recordMilestone(studentId : Text, pathwayId : Nat, milestone : Text, score : Float, educatorId : Text) : async LearningMilestone {
    milestoneCounter += 1;
    let ts = Time.now();
    let clampedScore = clamp(score, PHI * PHI);
    
    milestones := Array.append(milestones, [(milestoneCounter, studentId, pathwayId, milestone, clampedScore, ts, educatorId)]);
    
    // Milestone achievement boosts all dimensions slightly
    cognitiveResonance := clamp(cognitiveResonance + 0.003 * PHI_INV, PHI * PHI);
    affectiveResonance := clamp(affectiveResonance + 0.002 * PHI_INV, PHI * PHI);
    sovereignResonance := clamp(sovereignResonance + 0.002 * PHI_INV, PHI * PHI);
    
    { id = milestoneCounter; studentId = studentId; pathwayId = pathwayId; milestone = milestone; score = clampedScore; achievedNs = ts; validatedBy = educatorId }
  };

  public query func getStudentMilestones(studentId : Text) : async [LearningMilestone] {
    Array.mapFilter<(Nat, Text, Nat, Text, Float, Int, Text), LearningMilestone>(
      milestones,
      func((id, sId, pathway, milestone, score, achieved, validator)) {
        if (sId == studentId) {
          ?{ id = id; studentId = sId; pathwayId = pathway; milestone = milestone; score = score; achievedNs = achieved; validatedBy = validator }
        } else { null }
      }
    )
  };

  // ── Family Engagement ─────────────────────────────────────────────────

  public func recordEngagement(studentId : Text, familyId : Text, engagementType : Text, impactScore : Float) : async FamilyEngagement {
    engagementCounter += 1;
    let ts = Time.now();
    let clampedImpact = clamp(impactScore, PHI);
    
    engagements := Array.append(engagements, [(engagementCounter, studentId, familyId, engagementType, clampedImpact, ts)]);
    
    // Family engagement boosts affective dimensions (community connection)
    affectiveAwareness := clamp(affectiveAwareness + 0.01 * clampedImpact * PHI_INV, PHI * PHI);
    affectiveCoherence := clamp(affectiveCoherence + 0.01 * clampedImpact * PHI_INV, PHI * PHI);
    
    { id = engagementCounter; studentId = studentId; familyId = familyId; engagementType = engagementType; impactScore = clampedImpact; recordedNs = ts }
  };

  public query func getStudentEngagements(studentId : Text) : async [FamilyEngagement] {
    Array.mapFilter<(Nat, Text, Text, Text, Float, Int), FamilyEngagement>(
      engagements,
      func((id, sId, familyId, engType, impact, recorded)) {
        if (sId == studentId) {
          ?{ id = id; studentId = sId; familyId = familyId; engagementType = engType; impactScore = impact; recordedNs = recorded }
        } else { null }
      }
    )
  };

  // ── SYN — Synapse Binding (State/Federal Integration) ─────────────────

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
