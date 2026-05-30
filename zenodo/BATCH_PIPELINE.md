# Zenodo Release Pipeline by Batch

## Batch A (Existing Core Papers)

1. MSIT-RP-2026-001 (`papers/terminus/`)
2. MSIT-RP-2026-002 (`papers/ordo-algorithm/`)
3. MSIT-RP-2026-003 (`papers/polyglot-orchestration/`)

Publish each with metadata + source zip + paper PDF and update `RELEASE_LEDGER.md` with DOI/URL.

## Batch B (Research Backlog Conversions)

1. MSIT-RP-2026-004 (`papers/math-aurea/`)
2. MSIT-RP-2026-005 (`papers/intelligentia-localis/`)
3. MSIT-RP-2026-006 (`papers/rete-vivum/`)

Each package includes `paper.pdf`, `source/`, `metadata.txt`, `release-notes.txt`, and `citation.txt`.

## Batch C (Production Tracks)

1. MSIT-SW-2026-001 (software package)
2. MSIT-MD-2026-001 (model package)
3. MSIT-DS-2026-001 (dataset package)

Each package includes reproducibility details, dependency/integrity metadata, and release notes.

## Batch D (Recurring Cadence)

- Monthly release window: first full week of each month.
- Include only artifacts that pass governance/metadata/reproducibility gate.
- New versions are additive Zenodo versions (no silent overwrite).
