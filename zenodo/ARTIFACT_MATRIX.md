# Zenodo-Ready Artifact Matrix

Single source planning matrix for all repository artifacts prepared for Zenodo release.

## Batch Definitions

- **Batch A**: Existing core paper releases already in ledger (MSIT-RP-2026-001/002/003)
- **Batch B**: Additional research-paper conversions from `research/` and `docs/papers/arxiv/`
- **Batch C**: First software/model/dataset deposits
- **Batch D**: Monthly recurring release cycle

## Artifact Matrix

| Artifact ID | Type | Source Path(s) | Owner | Status | Target Batch | Zenodo Record |
|---|---|---|---|---|---|---|
| MSIT-RP-2026-001 | Publication / Preprint | `papers/terminus/` | Alfredo Medina Hernandez | Pending publish metadata completion | A | `zenodo/records/MSIT-RP-2026-001.md` |
| MSIT-RP-2026-002 | Publication / Preprint | `papers/ordo-algorithm/` | Alfredo Medina Hernandez | Pending publish metadata completion | A | `zenodo/records/MSIT-RP-2026-002.md` |
| MSIT-RP-2026-003 | Publication / Preprint | `papers/polyglot-orchestration/` | Alfredo Medina Hernandez | Pending publish metadata completion | A | `zenodo/records/MSIT-RP-2026-003.md` |
| MSIT-RP-2026-004 | Publication / Preprint | `papers/math-aurea/`, `research/math-paper.html` | Alfredo Medina Hernandez | Package prepared in-repo | B | `zenodo/records/MSIT-RP-2026-004.md` |
| MSIT-RP-2026-005 | Publication / Preprint | `papers/intelligentia-localis/`, `research/inference-paper.html` | Alfredo Medina Hernandez | Package prepared in-repo | B | `zenodo/records/MSIT-RP-2026-005.md` |
| MSIT-RP-2026-006 | Publication / Preprint | `papers/rete-vivum/`, `research/mesh-paper.html` | Alfredo Medina Hernandez | Package prepared in-repo | B | `zenodo/records/MSIT-RP-2026-006.md` |
| MSIT-SW-2026-001 | Software | `sdk/`, `protocols/`, `dist/extensions/` | Alfredo Medina Hernandez | Package scaffold prepared | C | `zenodo/records/MSIT-SW-2026-001.md` |
| MSIT-MD-2026-001 | Model | `SDK_Model_Manifest.json`, `sdk/frontend-intelligence-models/` | Alfredo Medina Hernandez | Package scaffold prepared | C | `zenodo/records/MSIT-MD-2026-001.md` |
| MSIT-DS-2026-001 | Dataset | `docs/fleet-census.json` | Alfredo Medina Hernandez | Package scaffold prepared | C | `zenodo/records/MSIT-DS-2026-001.md` |
| MSIT-SP-2026-001 | Technical Report / Spec | `specs/` | Alfredo Medina Hernandez | Candidate list documented | D | Pending |
| MSIT-PR-2026-001 | Protocol Documentation | `protocols/*.md` | Alfredo Medina Hernandez | Candidate list documented | D | Pending |
| MSIT-SU-2026-001 | Supplementary (checksums/manifests) | `zenodo/checksums/` | Alfredo Medina Hernandez | Initial checksums added | C | Included in parent records |

## Candidate Pools for Future Batches

- `research/*.html` (remaining papers)
- `docs/papers/arxiv/*.tex`
- `docs/*.md` technical reports and architecture records
- `sdk/*` package-level source snapshots
- `protocols/*.js` and protocol markdown lifecycle docs
