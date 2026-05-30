/// GeometryLock — Sovereign Access Canister
/// PROTO-226 (Geometric Key Protocol) on the Internet Computer.
///
/// This canister IS the geometry lock. It persists across every heartbeat,
/// upgrade, and network partition via stable var storage.
///
/// ── What lives here ──────────────────────────────────────────────────────────
///
///   Intelligence Interface  AI entities dock via phi-spiral geometric keys.
///     Phase vectors are derived from HMAC-SHA-256(secret, callerId|window).
///     Access is gated by Kuramoto phase resonance: R > threshold (φ⁻¹ base).
///
///   Hebbian immune memory  Each caller has a coreWeight [0, φ].
///     Grant → Long-Term Potentiation (+LTP_RATE × remaining headroom).
///     Deny  → Long-Term Depression  (−LTD_RATE × current weight).
///     Weights survive upgrades in stable storage.
///
///   Adaptive Kuramoto threshold  Global deny rate is tracked over a rolling
///     window. When denyRate ≥ 0.5, defensive mode auto-activates and raises
///     the threshold to cos(36°) ≈ 0.809. Manual override via setDefensiveMode.
///
///   Canister persistence  Every field that matters is a stable var.
///     State is never lost on upgrade.
///
/// ── SHA-256 note ─────────────────────────────────────────────────────────────
///   This file contains a self-contained SHA-256 implementation in pure Motoko.
///   In production, replace sha256Bytes with mo:sha2/Sha256 once the package
///   is available in your dfx project (add to mops.toml or vessel.dhall).
///
/// @version 1.0.0

import Array   "mo:base/Array";
import Blob    "mo:base/Blob";
import Float   "mo:base/Float";
import Int     "mo:base/Int";
import Iter    "mo:base/Iter";
import Nat     "mo:base/Nat";
import Nat8    "mo:base/Nat8";
import Nat32   "mo:base/Nat32";
import Nat64   "mo:base/Nat64";
import Text    "mo:base/Text";
import Time    "mo:base/Time";
import Debug   "mo:base/Debug";

actor GeometryLock {

  // ── Phi constants ───────────────────────────────────────────────────────────
  let PHI      : Float = 1.618033988749895;
  let PHI_INV  : Float = 0.618033988749895;
  let TWO_PI   : Float = 6.283185307179586;

  // ── Time window — 873ms × φ ≈ 1413ms in nanoseconds ───────────────────────
  let WINDOW_NS : Int = 1_413_000_000;

  // ── Thresholds ──────────────────────────────────────────────────────────────
  let BASE_THRESHOLD      : Float = 0.618033988749895;   // φ⁻¹
  let DEFENSIVE_THRESHOLD : Float = 0.809016994748;      // cos(36°) — tighter gate

  // ── Hebbian rates ───────────────────────────────────────────────────────────
  let LTP_RATE  : Float = 0.05;
  let LTD_RATE  : Float = 0.03;
  let MAX_WEIGHT : Float = 1.618033988749895;  // φ
  let MIN_WEIGHT : Float = 0.01;

  // Defensive mode rolling window size and trigger rate
  let ROLLING_WINDOW : Nat   = 10;
  let DEFEND_RATE    : Float = 0.5;

  // ── Stable storage — survives every upgrade ─────────────────────────────────
  // Caller table (parallel arrays — Motoko stable var cannot hold records)
  stable var callerIds      : [Text]  = [];
  stable var callerSecrets  : [Text]  = [];
  stable var callerDims     : [Nat]   = [];
  stable var callerGrants   : [Nat]   = [];
  stable var callerDenials  : [Nat]   = [];
  stable var callerRevoked  : [Bool]  = [];
  stable var callerRegAt    : [Int]   = [];
  stable var callerWeights  : [Float] = [];   // Hebbian core weights
  stable var callerLtp      : [Nat]   = [];   // lifetime LTP events
  stable var callerLtd      : [Nat]   = [];   // lifetime LTD events

  // Adaptive threshold state
  stable var defensiveMode  : Bool  = false;
  stable var threshold      : Float = 0.618033988749895;
  stable var totalGranted   : Nat   = 0;
  stable var totalDenied    : Nat   = 0;
  stable var beatCount      : Nat   = 0;

  // Rolling outcome window (0 = granted, 1 = denied)
  stable var rollingWindow   : [Nat] = [];   // circular, max ROLLING_WINDOW entries

  // Access log (rolling, max 200 entries — text summaries)
  stable var logEntries  : [Text] = [];
  stable var logCount    : Nat    = 0;

  // ── SHA-256 — pure Motoko implementation ────────────────────────────────────
  // Based on the FIPS 180-4 specification.
  // Replace with mo:sha2/Sha256 in production for performance.

  let K : [Nat32] = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
    0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
    0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
    0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
    0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
    0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  func rotr32(x : Nat32, n : Nat32) : Nat32 {
    (x >> n) | (x << (32 - n))
  };

  func sha256Bytes(data : [Nat8]) : [Nat8] {
    var h0 : Nat32 = 0x6a09e667;
    var h1 : Nat32 = 0xbb67ae85;
    var h2 : Nat32 = 0x3c6ef372;
    var h3 : Nat32 = 0xa54ff53a;
    var h4 : Nat32 = 0x510e527f;
    var h5 : Nat32 = 0x9b05688c;
    var h6 : Nat32 = 0x1f83d9ab;
    var h7 : Nat32 = 0x5be0cd19;

    // Pre-processing: adding padding bits
    let msgLen : Nat = data.size();
    let bitLen : Nat = msgLen * 8;

    // Build padded message
    var padded = Array.tabulate<Nat8>(msgLen, func(i) { data[i] });
    // append 0x80
    padded := Array.append(padded, [0x80 : Nat8]);
    // append zeros until length ≡ 56 (mod 64)
    while ((padded.size() % 64) != 56) {
      padded := Array.append(padded, [0x00 : Nat8]);
    };
    // append bit-length as 64-bit big-endian
    let bl64 : Nat64 = Nat64.fromNat(bitLen);
    padded := Array.append(padded, [
      Nat8.fromNat(Nat64.toNat((bl64 >> 56) & 0xff)),
      Nat8.fromNat(Nat64.toNat((bl64 >> 48) & 0xff)),
      Nat8.fromNat(Nat64.toNat((bl64 >> 40) & 0xff)),
      Nat8.fromNat(Nat64.toNat((bl64 >> 32) & 0xff)),
      Nat8.fromNat(Nat64.toNat((bl64 >> 24) & 0xff)),
      Nat8.fromNat(Nat64.toNat((bl64 >> 16) & 0xff)),
      Nat8.fromNat(Nat64.toNat((bl64 >>  8) & 0xff)),
      Nat8.fromNat(Nat64.toNat( bl64        & 0xff)),
    ]);

    // Process each 512-bit (64-byte) chunk
    let chunks = padded.size() / 64;
    var ci = 0;
    while (ci < chunks) {
      let chunk = Array.tabulate<Nat8>(64, func(i) { padded[ci * 64 + i] });

      // Prepare message schedule
      var w = Array.tabulate<Nat32>(64, func(_) { 0 : Nat32 });
      for (i in Iter.range(0, 15)) {
        let b = i * 4;
        w[i] := (Nat32.fromNat(Nat8.toNat(chunk[b]))     << 24)
               | (Nat32.fromNat(Nat8.toNat(chunk[b + 1])) << 16)
               | (Nat32.fromNat(Nat8.toNat(chunk[b + 2])) << 8)
               |  Nat32.fromNat(Nat8.toNat(chunk[b + 3]));
      };
      for (i in Iter.range(16, 63)) {
        let s0 = rotr32(w[i-15], 7)  ^ rotr32(w[i-15], 18) ^ (w[i-15] >> 3);
        let s1 = rotr32(w[i-2],  17) ^ rotr32(w[i-2],  19) ^ (w[i-2]  >> 10);
        w[i] := w[i-16] +% s0 +% w[i-7] +% s1;
      };

      var a = h0; var b = h1; var c = h2; var d = h3;
      var e = h4; var f = h5; var g = h6; var hh = h7;

      for (i in Iter.range(0, 63)) {
        let S1    = rotr32(e, 6) ^ rotr32(e, 11) ^ rotr32(e, 25);
        let ch    = (e & f) ^ ((^e) & g);
        let temp1 = hh +% S1 +% ch +% K[i] +% w[i];
        let S0    = rotr32(a, 2) ^ rotr32(a, 13) ^ rotr32(a, 22);
        let maj   = (a & b) ^ (a & c) ^ (b & c);
        let temp2 = S0 +% maj;

        hh := g; g := f; f := e; e := d +% temp1;
        d  := c; c := b; b := a; a := temp1 +% temp2;
      };

      h0 +%= a; h1 +%= b; h2 +%= c; h3 +%= d;
      h4 +%= e; h5 +%= f; h6 +%= g; h7 +%= hh;
      ci += 1;
    };

    // Produce digest
    func w32ToBytes(v : Nat32) : [Nat8] {
      [
        Nat8.fromNat(Nat32.toNat((v >> 24) & 0xff)),
        Nat8.fromNat(Nat32.toNat((v >> 16) & 0xff)),
        Nat8.fromNat(Nat32.toNat((v >>  8) & 0xff)),
        Nat8.fromNat(Nat32.toNat( v        & 0xff)),
      ]
    };
    Array.append(
      Array.append(Array.append(w32ToBytes(h0), w32ToBytes(h1)), Array.append(w32ToBytes(h2), w32ToBytes(h3))),
      Array.append(Array.append(w32ToBytes(h4), w32ToBytes(h5)), Array.append(w32ToBytes(h6), w32ToBytes(h7)))
    )
  };

  /// HMAC-SHA-256: RFC 2104
  func hmacSha256(key : [Nat8], msg : [Nat8]) : [Nat8] {
    // Normalise key to 64 bytes
    var normKey : [Nat8] = if (key.size() > 64) { sha256Bytes(key) } else { key };
    normKey := Array.append(normKey, Array.tabulate<Nat8>(64 - normKey.size(), func(_) { 0x00 }));

    let ipad = Array.tabulate<Nat8>(64, func(i) { Nat8.fromNat(Nat8.toNat(normKey[i]) ^ 0x36) });
    let opad = Array.tabulate<Nat8>(64, func(i) { Nat8.fromNat(Nat8.toNat(normKey[i]) ^ 0x5c) });

    let inner = sha256Bytes(Array.append(ipad, msg));
    sha256Bytes(Array.append(opad, inner))
  };

  // ── Phase vector derivation ─────────────────────────────────────────────────

  /// Derive a phi-spiral phase vector from HMAC-SHA-256(secret, callerId|window).
  /// Mirrors the JS derivePhaseVector — same math, ICP-native SHA-256.
  func derivePhaseVector(secret : Text, callerId : Text, window : Int, dims : Nat) : [Float] {
    let material  = Text.encodeUtf8(callerId # "|" # Int.toText(window));
    let keyBytes  = Blob.toArray(Text.encodeUtf8(secret));
    let msgBytes  = Blob.toArray(material);
    let digest    = hmacSha256(keyBytes, msgBytes);

    Array.tabulate<Float>(dims, func(i) {
      let byteA = Nat8.toNat(digest[(i * 2)     % digest.size()]);
      let byteB = Nat8.toNat(digest[(i * 2 + 1) % digest.size()]);
      let raw   = Float.fromInt((byteA * 256 + byteB)) / 65535.0;
      let phiOff = Float.fromInt(i) * (PHI - 1.0) * TWO_PI;
      let raw2  = raw * TWO_PI + phiOff;
      raw2 - TWO_PI * Float.fromInt(Float.toInt(raw2 / TWO_PI))
    })
  };

  /// Kuramoto order parameter on phase differences.
  func orderParameter(presented : [Float], expected : [Float]) : Float {
    let n = presented.size();
    if (n == 0 or n != expected.size()) { return 0.0 };
    var sumCos : Float = 0.0;
    var sumSin : Float = 0.0;
    var i = 0;
    while (i < n) {
      let diff = presented[i] - expected[i];
      sumCos += Float.cos(diff);
      sumSin += Float.sin(diff);
      i += 1;
    };
    sumCos /= Float.fromInt(n);
    sumSin /= Float.fromInt(n);
    Float.sqrt(sumCos * sumCos + sumSin * sumSin)
  };

  /// Current heartbeat window index.
  func currentWindow() : Int {
    Time.now() / WINDOW_NS
  };

  // ── Caller registry helpers ─────────────────────────────────────────────────

  func findCaller(callerId : Text) : ?Nat {
    var i = 0;
    while (i < callerIds.size()) {
      if (callerIds[i] == callerId) { return ?i };
      i += 1;
    };
    null
  };

  func arraySet<T>(arr : [T], idx : Nat, val : T) : [T] {
    Array.tabulate<T>(arr.size(), func(i) { if (i == idx) { val } else { arr[i] } })
  };

  // ── Adaptive threshold helpers ──────────────────────────────────────────────

  func updateRollingWindow(outcome : Nat) {
    var next = Array.append(rollingWindow, [outcome]);
    if (next.size() > ROLLING_WINDOW) {
      next := Array.tabulate<Nat>(ROLLING_WINDOW, func(i) { next[i + 1] });
    };
    rollingWindow := next;

    if (rollingWindow.size() < ROLLING_WINDOW) { return };
    var denies : Nat = 0;
    for (o in rollingWindow.vals()) { if (o == 1) { denies += 1 }; };
    let denyRate : Float = Float.fromInt(denies) / Float.fromInt(ROLLING_WINDOW);
    let shouldDefend = denyRate >= DEFEND_RATE;
    if (shouldDefend != defensiveMode) {
      defensiveMode := shouldDefend;
      threshold     := if (shouldDefend) { DEFENSIVE_THRESHOLD } else { BASE_THRESHOLD };
      _appendLog("defensive_mode:" # (if (shouldDefend) { "on" } else { "off" }) # " threshold:" # Float.toText(threshold));
    };
  };

  // ── Logging ─────────────────────────────────────────────────────────────────

  func _appendLog(entry : Text) {
    let ts = Int.toText(Time.now());
    let line = ts # " " # entry;
    if (logEntries.size() < 200) {
      logEntries := Array.append(logEntries, [line]);
    } else {
      // Rolling: drop the oldest entry
      logEntries := Array.append(
        Array.tabulate<Text>(199, func(i) { logEntries[i + 1] }),
        [line]
      );
    };
    logCount += 1;
  };

  // ── Public API ──────────────────────────────────────────────────────────────

  /// Register an intelligence caller. Secret stored as-is (caller ensures security).
  public func registerCaller(callerId : Text, secret : Text, dims : Nat) : async Text {
    switch (findCaller(callerId)) {
      case (?_) { return "already_registered" };
      case null {
        let d = if (dims == 0) { 8 } else { dims };
        callerIds     := Array.append(callerIds,     [callerId]);
        callerSecrets := Array.append(callerSecrets, [secret]);
        callerDims    := Array.append(callerDims,    [d]);
        callerGrants  := Array.append(callerGrants,  [0]);
        callerDenials := Array.append(callerDenials, [0]);
        callerRevoked := Array.append(callerRevoked, [false]);
        callerRegAt   := Array.append(callerRegAt,   [Time.now()]);
        callerWeights := Array.append(callerWeights, [PHI_INV]);
        callerLtp     := Array.append(callerLtp,     [0]);
        callerLtd     := Array.append(callerLtd,     [0]);
        _appendLog("registered " # callerId);
        "ok"
      };
    }
  };

  /// Revoke a caller permanently.
  public func revokeCaller(callerId : Text) : async Text {
    switch (findCaller(callerId)) {
      case null { "caller_not_found" };
      case (?i) {
        callerRevoked := arraySet(callerRevoked, i, true);
        _appendLog("revoked " # callerId);
        "revoked"
      };
    }
  };

  /// Explicitly set defensive mode (overrides auto-detection).
  public func setDefensiveMode(active : Bool) : async () {
    defensiveMode := active;
    threshold     := if (active) { DEFENSIVE_THRESHOLD } else { BASE_THRESHOLD };
    _appendLog("defensive_mode_manual:" # (if (active) { "on" } else { "off" }));
  };

  /// Validate a geometric key (intelligence interface).
  /// @param callerId  — caller identity
  /// @param phases    — presented phase vector (Float array)
  /// @param window    — time window index (from token)
  /// @param signature — HMAC-SHA-256 hex string of { callerId, phases, window }
  ///                    (signature verification is handled off-canister by the bridge;
  ///                     the canister validates resonance and updates Hebbian weights)
  ///
  /// Returns: "granted" | "denied:<reason>"
  public func validateKey(callerId : Text, phases : [Float], window : Int) : async Text {
    switch (findCaller(callerId)) {
      case null {
        updateRollingWindow(1);
        totalDenied += 1;
        _appendLog("denied " # callerId # " reason:not_registered");
        "denied:caller_not_registered"
      };
      case (?i) {
        if (callerRevoked[i]) {
          updateRollingWindow(1);
          totalDenied += 1;
          _appendLog("denied " # callerId # " reason:revoked");
          return "denied:caller_revoked";
        };

        let win = currentWindow();
        if (Int.abs(window - win) > 1) {
          updateRollingWindow(1);
          totalDenied += 1;
          callerDenials := arraySet(callerDenials, i, callerDenials[i] + 1);
          // LTD — time-window miss (stale key)
          let newW = Float.max(MIN_WEIGHT, callerWeights[i] - callerWeights[i] * LTD_RATE);
          callerWeights := arraySet(callerWeights, i, newW);
          callerLtd     := arraySet(callerLtd,     i, callerLtd[i] + 1);
          _appendLog("denied " # callerId # " reason:window_expired");
          return "denied:window_expired";
        };

        let expected = derivePhaseVector(callerSecrets[i], callerId, window, callerDims[i]);
        let R = orderParameter(phases, expected);

        if (R > threshold) {
          // GRANTED — LTP
          totalGranted += 1;
          callerGrants  := arraySet(callerGrants,  i, callerGrants[i] + 1);
          let newW = Float.min(MAX_WEIGHT, callerWeights[i] + (MAX_WEIGHT - callerWeights[i]) * LTP_RATE);
          callerWeights := arraySet(callerWeights, i, newW);
          callerLtp     := arraySet(callerLtp,     i, callerLtp[i] + 1);
          updateRollingWindow(0);
          beatCount += 1;
          _appendLog("granted " # callerId # " R:" # Float.toText(R));
          "granted"
        } else {
          // DENIED — LTD
          totalDenied   += 1;
          callerDenials := arraySet(callerDenials, i, callerDenials[i] + 1);
          let newW = Float.max(MIN_WEIGHT, callerWeights[i] - callerWeights[i] * LTD_RATE);
          callerWeights := arraySet(callerWeights, i, newW);
          callerLtd     := arraySet(callerLtd,     i, callerLtd[i] + 1);
          updateRollingWindow(1);
          _appendLog("denied " # callerId # " reason:resonance R:" # Float.toText(R) # " threshold:" # Float.toText(threshold));
          "denied:resonance_below_threshold"
        }
      };
    }
  };

  /// Generate a geometric key token (for testing within the canister).
  /// Returns (phases, window) so the caller can construct the full token off-canister.
  public query func generateKeyData(callerId : Text, secret : Text) : async ([Float], Int) {
    let win    = currentWindow();
    let phases = derivePhaseVector(secret, callerId, win, 8);
    (phases, win)
  };

  /// Compute the Kuramoto order parameter between two phase vectors.
  public query func computeResonance(presented : [Float], expected : [Float]) : async Float {
    orderParameter(presented, expected)
  };

  // ── Introspection ───────────────────────────────────────────────────────────

  public query func getCallerState(callerId : Text) : async ?{
    grantCount  : Nat;
    denyCount   : Nat;
    revoked     : Bool;
    coreWeight  : Float;
    ltpEvents   : Nat;
    ltdEvents   : Nat;
    registeredAt : Int;
  } {
    switch (findCaller(callerId)) {
      case null { null };
      case (?i) {
        ?{
          grantCount   = callerGrants[i];
          denyCount    = callerDenials[i];
          revoked      = callerRevoked[i];
          coreWeight   = callerWeights[i];
          ltpEvents    = callerLtp[i];
          ltdEvents    = callerLtd[i];
          registeredAt = callerRegAt[i];
        }
      };
    }
  };

  public query func getMetrics() : async {
    totalCallers  : Nat;
    totalGranted  : Nat;
    totalDenied   : Nat;
    beatCount     : Nat;
    threshold     : Float;
    defensiveMode : Bool;
    windowNs      : Int;
    logCount      : Nat;
  } {
    {
      totalCallers  = callerIds.size();
      totalGranted;
      totalDenied;
      beatCount;
      threshold;
      defensiveMode;
      windowNs      = WINDOW_NS;
      logCount;
    }
  };

  public query func getLog(limit : Nat) : async [Text] {
    let n = logEntries.size();
    let take = if (limit == 0 or limit > n) { n } else { limit };
    Array.tabulate<Text>(take, func(i) { logEntries[n - take + i] })
  };

}
