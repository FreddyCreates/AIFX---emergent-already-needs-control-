# GitHub Pages Master Portal and Link Strategy

## What was consolidated

The repository now uses one **master GitHub Pages portal** concept:

- Master portal: `index.html`
- Sub-pages:
  - `download.html`
  - `research/*`
  - docs references (including this document)

The goal is to keep one central entry point while still allowing purpose-specific links.

---

## Public vs Private behavior

### Public repository

- Anyone with the URL can access GitHub Pages.
- Anyone can follow links to public raw/download assets.

### Private repository

- Access depends on GitHub Pages visibility and repository permissions.
- Links can exist, but access is permission-gated.

---

## Can multiple links coexist?

Yes.

You can keep:

1. One **master** public portal that links all sections.
2. Multiple **specialized links** for specific surfaces (downloads, research, PowerShell instructions, etc.).

This supports both:

- single-entry navigation for general users
- direct deep links for teams and workflows

---

## PowerShell expansion

PowerShell-oriented instructions are now represented in the master portal and deployment pages:

- Install script path: `install-extensions.ps1`
- Windows quick install path: `install-jarvis-edge.bat`
- Existing PowerShell-oriented extension surfaces:
  - `extensions/windows-shell-intelligence/`
  - `extensions/windows-terminal-forge/`

Suggested operational command:

```powershell
powershell -ExecutionPolicy Bypass -File install-extensions.ps1
```

---

## Operational recommendation

Use this strategy:

- Share the master portal (`index.html`) as the main URL.
- Keep sub-links for specific campaigns or workstreams.
- If privacy requirements differ, separate by repository visibility policy while preserving the same information architecture.
