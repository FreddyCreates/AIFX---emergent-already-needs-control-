# GitHub Fork Coordination Protocol

This protocol is for Alfredo Medina Hernandez’s own repositories and forks.

## Rule

Forks may be used as work lanes, experiments, cleanup surfaces, or release surfaces. All forks remain part of Alfredo’s own work unless otherwise stated.

## Branch Naming

Use descriptive branches:

```text
chore/research-release-structure
docs/release-protocols
paper/terminus-cleanup
paper/ordo-algorithm
paper/polyglot-orchestration
archive/triage-cleanup
```

## Commit Style

Use clear commits:

```text
docs: add research release protocol
docs: add rights statement
papers: add terminus metadata scaffold
archive: move unsorted drafts to triage
chore: normalize repository structure
```

## Safety Rules

* Do not delete uncertain files.
* Move uncertain files to `archive/triage/`.
* Do not rewrite authorship.
* Do not add open-source licenses.
* Do not expose private secrets, tokens, keys, credentials, or private emails.
* Do not convert drafts into final claims without approval.
* Do not publish to Zenodo, OSF, arXiv, npm, PyPI, or GitHub Releases unless explicitly instructed.

## Pull Request Summary Required

Every cleanup PR must include:

1. What changed.
2. What files moved.
3. What files were created.
4. What files are still in triage.
5. Any rights/license concerns.
6. Any unresolved questions.
7. Whether the repo is ready for public visibility.
