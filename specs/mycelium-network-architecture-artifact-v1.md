# Mycelium Network Architecture Artifact v1

## Identity
- **Artifact ID:** `MYCELIUM-ARCH-V1`
- **Protocol Family:** `PROTO-257` through `PROTO-267`
- **Substrate Role:** Sovereign neuro-network substrate for governed multi-node intelligence execution.

## Scope and Boundaries
- Defines sovereign behavior for node identity, topology, routing, trust, healing, economics, and cross-substrate exchange.
- Excludes application-level business workflows; only governs substrate-level network intelligence.
- Requires append-only audit events and explicit proof references for governance actions.

## Topology Model
- Directed sovereign mesh with optional symmetric links.
- Supports ring, lattice, and clustered geodesic overlays.
- Core domains:
  - `core` (critical governance and routing primitives)
  - `edge` (latency-sensitive execution)
  - `archive` (lineage and evidence retention)
  - `exchange` (cross-substrate transfer lanes)

## Trust Model
- Trust range is `[0,1]` and phi-aware (`PHI_INV` minimum operational target).
- Trust changes are driven by:
  - Attestation proofs
  - Heartbeat stability
  - Failure incidents and recovery completion
  - Audit conformance
- Trust bands:
  - `green`: `>= 0.618`
  - `amber`: `>= 0.34 && < 0.618`
  - `red`: `< 0.34`

## Node Roles
- **Sentinel:** governance and audit authority.
- **Relay:** high-throughput forwarding and routing stability.
- **Spore:** elastic edge participation with constrained rights.
- **Bridge:** cross-substrate exchange connector.
- **Archivist:** evidence and lineage continuity keeper.

## Routing Domains
- Domain routing is policy-constrained; each domain defines max hops and trust floor.
- Route quality combines hop count, latency, trust, and congestion pressure.
- Partition-aware rerouting is mandatory if isolated nodes intersect active paths.

## Resilience Model
- Failure law requires detection within one heartbeat window (`873ms` target cadence).
- Healing priority uses downtime, path stress, demand pressure, and trust penalty.
- Partition reconciliation must restore stable topology or escalate to critical state.

## Lifecycle States
- **Formation:** node admission and initial link graph growth.
- **Stabilization:** baseline routing and trust loops converge.
- **Adaptive Operation:** steady state with continuous trust/economic/healing loops.
- **Partition Response:** degraded operation with mandatory reconcile attempts.
- **Recovery:** repair confirmation and trust restoration.
- **Governed Upgrade:** law-checked protocol evolution with rollback readiness.

## Operational Intelligence Loops
- **Topology optimization loop:** degree/latency/trust rebalance.
- **Congestion adaptation loop:** dynamic route score adjustment.
- **Trust decay/recovery loop:** heartbeat + proof-driven trust modulation.
- **Partition-aware reroute loop:** isolate avoidance and fast alternate pathing.
- **Quorum sensing loop:** signal density monitoring → emergent behavior activation.
- **Memory consolidation loop:** short-term encoding → gradient propagation → long-term engram formation.
- **Evolutionary selection loop:** fitness evaluation → selection → mutation → speciation.

## Governance Covenant Alignment
- Charter authority: `PROTO-257`.
- Sovereign hierarchy reference: integrated into `PROTO-227` dependency graph.
- Message namespaces: `mycelium.identity.*`, `mycelium.mesh.*`, `mycelium.route.*`, `mycelium.trust.*`, `mycelium.heal.*`, `mycelium.economy.*`, `mycelium.exchange.*`, `mycelium.collective.*`, `mycelium.memory.*`, `mycelium.evolve.*`.
