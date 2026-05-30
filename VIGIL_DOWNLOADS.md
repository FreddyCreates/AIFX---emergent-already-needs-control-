# Vigil AI v19 — Download Links

> Updated by native workflow engine (same dispatch protocol as VigilEngine) — 2026-04-28

---

## 🔵 Chrome / Edge Extension — v19.0.0

**Direct download (sideload zip):**
```
https://raw.githubusercontent.com/FreddyCreates/potential-succotash/copilot/create-jarvis-integration/dist/extensions/vigil-ai-v19.zip
```

**Install steps:**
1. Download the zip above
2. Unzip it
3. Go to `chrome://extensions` or `edge://extensions`
4. Enable **Developer Mode**
5. Click **Load Unpacked** → select the unzipped folder

---

## 🟣 All Extensions Bundle

```
https://raw.githubusercontent.com/FreddyCreates/potential-succotash/copilot/create-jarvis-integration/dist/extensions/all-extensions.zip
```

---

## 🌐 ICP Deployment — Straight to the Runtime

```bash
# 1. Install dfx (one time)
sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"

# 2. Deploy
git clone https://github.com/FreddyCreates/potential-succotash
cd potential-succotash
node scripts/workflow-runner.js workflows/deploy-icp.json
```

No GitHub Actions. No intermediary. Deploys straight to ICP runtime using `dfx deploy --network ic`.

---

## 📥 One-Click Installers

| Platform | File |
|----------|------|
| Windows  | `install-vigil-edge.bat` |
| macOS/Linux | `bash install.sh` |

---

## 🔧 Native Workflow Build

```bash
git clone https://github.com/FreddyCreates/potential-succotash
cd potential-succotash

# List workflows
node scripts/workflow-runner.js --list

# Full build
node scripts/workflow-runner.js workflows/build.json

# Deploy to ICP
node scripts/workflow-runner.js workflows/deploy-icp.json
```

### Trigger from Vigil AI chat (v19):
- `"run build workflow"` → SUBSTRATUM agent
- `"deploy to ICP"` → CANISTRUM agent  
- `"workflow status"` → ORCHESTRATOR

---

## 🧠 Architecture — Native, Not a Bridge

```
User: "deploy to ICP"
  → VigilEngine.parseCommand()          intent: 'workflow-deploy-icp'
  → ProtocolRegistry.routeToAgent()     CANISTRUM
  → executeChat()                       WorkflowSkill.startWorkflow()
  → Node.js runner                      { action, payload, agent } dispatch
  → executeIcpDeploy()                  dfx deploy --network ic
  → ICP runtime                         canister live at xxx.icp0.io
```

Same `{ action, payload, agent }` protocol end-to-end. Solus/PSE/MiniBrain are native — zero external AI bridges.

---

*Vigil AI v19 — WorkflowSkill · CANISTRUM · ICP deploy · 406 modules*
