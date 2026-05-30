# 🤝 AI Workspace Map

This repository now has a dedicated collaboration layer for **Copilot**, **ChatGPT-class agents**, and the user's **internal AI** to work through the repo instead of pretending to directly chat with each other.

## Why this layer exists

- Keep AI coordination **inside the workspace**
- Make handoffs **durable and inspectable**
- Let external AI docks use repo-native tools through structured lanes
- Organize shared work without deleting or reshaping existing repo content

## Workspace categories

| Workspace | Purpose | Primary Participants |
|---|---|---|
| `copilot-internal-workspace` | Execution, implementation, validation | Copilot |
| `my-ai-internal-workspace` | Internal triage, review, staging | My AI |
| `chatgpt-shared-workspace` | Tool-calling dock for ChatGPT adapters | ChatGPT |
| `shared-handoff-workspace` | Cross-agent coordination and work exchange | Copilot, My AI, ChatGPT |

## Protocol

- **PROTO-228: Agent Workspace Protocol**
  - queue handoffs
  - claim work
  - move work into progress
  - complete or block work
  - preserve acceptance criteria and resolution payloads

## Code surface

- SDK: `/home/runner/work/PRODUCTION-/PRODUCTION-/sdk/agent-workspace-sdk`
- Protocol: `/home/runner/work/PRODUCTION-/PRODUCTION-/protocols/agent-workspace-protocol.js`
- Root exports updated via:
  - `/home/runner/work/PRODUCTION-/PRODUCTION-/sdk/index.js`
  - `/home/runner/work/PRODUCTION-/PRODUCTION-/protocols/index.js`

## Intended usage

1. Seed the default workspaces
2. Register AI participants
3. Post notes/artifacts into a workspace
4. Queue handoffs into the shared lane
5. Let the receiving AI claim and complete work through the protocol

This is a categorization and coordination layer, not a deletion or migration pass.
