/// JARVISIUS — BRONZE Tier Sovereign Canister
///
/// Permanent storage for notes, commands, documents, and tab actions.
/// 873ms heartbeat · stable memory · attributed to Alfredo.

import Int     "mo:base/Int";
import Nat     "mo:base/Nat";
import Array   "mo:base/Array";
import Timer   "mo:base/Timer";
import Time    "mo:base/Time";
import Debug   "mo:base/Debug";

import Types   "Types";

actor Jarvisius {

  // ── Constants ──────────────────────────────────────────────────────────
  let HEARTBEAT_NS : Nat = 873_000_000; // 873ms in nanoseconds

  // ── Stable State — survives upgrades ──────────────────────────────────
  stable var heartbeatCount : Nat = 0;
  stable var notes      : [(Text, Text, Int)]       = [];
  stable var commands   : [(Text, Text, Text, Int)]  = [];
  stable var documents  : [(Text, Text, Text, Int)]  = [];
  stable var tabActions : [(Text, Text, Text, Int)]  = [];
  stable var owner      : Text = "Alfredo";

  // ── Internal helpers ──────────────────────────────────────────────────

  func generateId() : Text {
    "jarvis-" # Nat.toText(heartbeatCount) # "-" # Int.toText(Time.now())
  };

  // ── Heartbeat Timer ───────────────────────────────────────────────────

  func tick() : async () {
    heartbeatCount += 1;
  };

  let _heartbeatTimerId : Timer.TimerId = Timer.recurringTimer<system>(#nanoseconds HEARTBEAT_NS, tick);

  system func heartbeat() : async () {
    Debug.print("jarvisius heartbeat — beat #" # Nat.toText(heartbeatCount));
  };

  // ── Notes ─────────────────────────────────────────────────────────────

  public func addNote(content : Text) : async Types.JarvisNote {
    let id = generateId();
    let ts = Time.now();
    notes := Array.append<(Text, Text, Int)>(notes, [(id, content, ts)]);
    { id = id; content = content; owner = owner; timestampNs = ts }
  };

  public query func getNotes() : async [Types.JarvisNote] {
    Array.map<(Text, Text, Int), Types.JarvisNote>(
      notes,
      func((id, content, ts)) {
        { id = id; content = content; owner = owner; timestampNs = ts }
      }
    )
  };

  public func deleteNote(id : Text) : async Bool {
    let before = notes.size();
    notes := Array.filter<(Text, Text, Int)>(notes, func((nId, _, _)) { nId != id });
    notes.size() < before
  };

  // ── Commands ──────────────────────────────────────────────────────────

  public func addCommand(intent : Text, payload : Text) : async Types.JarvisCommand {
    let id = generateId();
    let ts = Time.now();
    commands := Array.append<(Text, Text, Text, Int)>(commands, [(id, intent, payload, ts)]);
    { id = id; intent = intent; payload = payload; owner = owner; timestampNs = ts }
  };

  public query func getCommands(limit : Nat) : async [Types.JarvisCommand] {
    let size = commands.size();
    let start = if (size > limit) { size - limit } else { 0 };
    let slice = Array.tabulate<(Text, Text, Text, Int)>(
      Nat.min(limit, size),
      func(i) { commands[start + i] }
    );
    Array.map<(Text, Text, Text, Int), Types.JarvisCommand>(
      slice,
      func((id, intent, payload, ts)) {
        { id = id; intent = intent; payload = payload; owner = owner; timestampNs = ts }
      }
    )
  };

  // ── Documents ─────────────────────────────────────────────────────────

  public func addDocument(docType : Text, content : Text) : async Types.JarvisDocument {
    let id = generateId();
    let ts = Time.now();
    documents := Array.append<(Text, Text, Text, Int)>(documents, [(id, docType, content, ts)]);
    { id = id; docType = docType; content = content; owner = owner; timestampNs = ts }
  };

  public query func getDocuments() : async [Types.JarvisDocument] {
    Array.map<(Text, Text, Text, Int), Types.JarvisDocument>(
      documents,
      func((id, docType, content, ts)) {
        { id = id; docType = docType; content = content; owner = owner; timestampNs = ts }
      }
    )
  };

  // ── Tab Actions ───────────────────────────────────────────────────────

  public func logTabAction(actionType : Text, tabInfo : Text) : async Types.JarvisTabAction {
    let id = generateId();
    let ts = Time.now();
    tabActions := Array.append<(Text, Text, Text, Int)>(tabActions, [(id, actionType, tabInfo, ts)]);
    { id = id; actionType = actionType; tabInfo = tabInfo; owner = owner; timestampNs = ts }
  };

  public query func getTabActions(limit : Nat) : async [Types.JarvisTabAction] {
    let size = tabActions.size();
    let start = if (size > limit) { size - limit } else { 0 };
    let slice = Array.tabulate<(Text, Text, Text, Int)>(
      Nat.min(limit, size),
      func(i) { tabActions[start + i] }
    );
    Array.map<(Text, Text, Text, Int), Types.JarvisTabAction>(
      slice,
      func((id, actionType, tabInfo, ts)) {
        { id = id; actionType = actionType; tabInfo = tabInfo; owner = owner; timestampNs = ts }
      }
    )
  };

  // ── Snapshot & Info ───────────────────────────────────────────────────

  public query func snapshot() : async Types.JarvisSnapshot {
    {
      heartbeatCount = heartbeatCount;
      noteCount      = notes.size();
      commandCount   = commands.size();
      documentCount  = documents.size();
      tabActionCount = tabActions.size();
      owner          = owner;
      timestampNs    = Time.now();
    }
  };

  public query func getOwner() : async Text {
    owner
  };

  public query func getHeartbeat() : async Nat {
    heartbeatCount
  };
};
