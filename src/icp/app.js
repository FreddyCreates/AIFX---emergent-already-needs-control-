/**
 * Sovereign Organism — ICP Frontend Application
 *
 * Connects to the organism_backend canister via @dfinity/agent
 * and renders real-time canister state in the dashboard.
 *
 * This file is bundled into icp-dist/ by scripts/build-icp.js.
 * The Candid interface (IDL) is defined inline so the frontend
 * works without a dfx generate step — making it truly standalone.
 */

// ── Candid IDL for organism_backend ─────────────────────────────────────
// Mirrors the public query/update methods in organism/motoko/src/Organism.mo

const RegisterState = ({ IDL }) => IDL.Record({
  awareness: IDL.Float64,
  coherence: IDL.Float64,
  resonance: IDL.Float64,
  entropy:   IDL.Float64,
});

const OrganismSnapshot = ({ IDL }) => IDL.Record({
  beatCount:   IDL.Nat,
  cognitive:   RegisterState({ IDL }),
  affective:   RegisterState({ IDL }),
  somatic:     RegisterState({ IDL }),
  sovereign:   RegisterState({ IDL }),
  timestampNs: IDL.Int,
});

const VitalityScore = ({ IDL }) => IDL.Record({
  overall:   IDL.Float64,
  cognitive: IDL.Float64,
  affective: IDL.Float64,
  somatic:   IDL.Float64,
  sovereign: IDL.Float64,
  phiRatio:  IDL.Float64,
});

const SensorReading = ({ IDL }) => IDL.Record({
  sensorId:    IDL.Text,
  sensorType:  IDL.Text,
  value:       IDL.Float64,
  unit:        IDL.Text,
  timestampNs: IDL.Int,
});

const idlFactory = ({ IDL }) => {
  const RS = RegisterState({ IDL });
  const Snap = IDL.Record({
    beatCount:   IDL.Nat,
    cognitive:   RS,
    affective:   RS,
    somatic:     RS,
    sovereign:   RS,
    timestampNs: IDL.Int,
  });
  const Vitality = IDL.Record({
    overall:   IDL.Float64,
    cognitive: IDL.Float64,
    affective: IDL.Float64,
    somatic:   IDL.Float64,
    sovereign: IDL.Float64,
    phiRatio:  IDL.Float64,
  });
  const Sensor = IDL.Record({
    sensorId:    IDL.Text,
    sensorType:  IDL.Text,
    value:       IDL.Float64,
    unit:        IDL.Text,
    timestampNs: IDL.Int,
  });

  return IDL.Service({
    getState:           IDL.Func([], [Snap], ['query']),
    snapshot:           IDL.Func([], [Snap], ['query']),
    calculateVitality:  IDL.Func([], [Vitality], ['query']),
    readSensors:        IDL.Func([], [IDL.Vec(Sensor)], ['query']),
    listSynapseBindings: IDL.Func([], [IDL.Vec(IDL.Text)], ['query']),
  });
};

// ── Agent Initialization ────────────────────────────────────────────────

let actor = null;
let canisterId = null;

/**
 * Detect whether we're running on a local replica or mainnet.
 * The build script injects __CANISTER_ID_ORGANISM_BACKEND__ and
 * __DFX_NETWORK__ into the HTML as global variables.  If those are
 * missing (e.g. opened as a plain file), we fall back to a
 * demo/offline mode.
 */
async function initAgent() {
  const log = addLog;

  // Check for injected canister ID (set by dfx / build script)
  canisterId = typeof window.__CANISTER_ID_ORGANISM_BACKEND__ !== 'undefined'
    ? window.__CANISTER_ID_ORGANISM_BACKEND__
    : null;

  const network = typeof window.__DFX_NETWORK__ !== 'undefined'
    ? window.__DFX_NETWORK__
    : 'local';

  document.getElementById('networkId').textContent = network;

  if (!canisterId) {
    log('No canister ID detected — running in demo mode', 'error');
    document.getElementById('canisterId').textContent = 'demo (no canister)';
    setStatus(false);
    loadDemoData();
    return;
  }

  document.getElementById('canisterId').textContent = canisterId;
  log(`Canister: ${canisterId} on ${network}`);

  try {
    // Dynamically import @dfinity/agent from CDN (bundled in icp-dist by build script)
    // This avoids requiring npm install for the frontend
    const host = network === 'ic'
      ? 'https://icp0.io'
      : 'http://127.0.0.1:4943';

    const { HttpAgent, Actor } = await import(
      /* webpackIgnore: true */
      'https://cdn.jsdelivr.net/npm/@dfinity/agent@2.2.0/+esm'
    );

    const agent = new HttpAgent({ host });

    // In local development, fetch the root key
    if (network !== 'ic') {
      await agent.fetchRootKey();
    }

    actor = Actor.createActor(idlFactory, { agent, canisterId });
    setStatus(true);
    log('Connected to organism_backend canister', 'success');
    await refreshState();
  } catch (err) {
    log(`Agent init failed: ${err.message}`, 'error');
    setStatus(false);
    loadDemoData();
  }
}

// ── UI Helpers ──────────────────────────────────────────────────────────

function setStatus(live) {
  const badge = document.getElementById('statusBadge');
  const text  = document.getElementById('statusText');
  badge.className = `status-badge ${live ? 'live' : 'offline'}`;
  text.textContent = live ? 'Live on ICP' : 'Offline / Demo';
}

function addLog(msg, type = '') {
  const el = document.getElementById('log');
  const entry = document.createElement('div');
  entry.className = `entry ${type}`;
  const ts = new Date().toLocaleTimeString();
  entry.textContent = `[${ts}] ${msg}`;
  el.prepend(entry);
  // Keep log at max 50 entries
  while (el.children.length > 50) el.removeChild(el.lastChild);
}

function fmt(n) {
  if (typeof n === 'bigint') return n.toString();
  if (typeof n === 'number') return n.toFixed(4);
  return String(n);
}

function renderSnapshot(snap) {
  document.getElementById('beatCount').textContent = fmt(snap.beatCount);

  const regs = ['cognitive', 'affective', 'somatic', 'sovereign'];
  const prefixes = ['cog', 'aff', 'som', 'sov'];

  regs.forEach((reg, i) => {
    const data = snap[reg];
    const p = prefixes[i];
    document.getElementById(`${p}-awareness`).textContent = fmt(data.awareness);
    document.getElementById(`${p}-coherence`).textContent = fmt(data.coherence);
    document.getElementById(`${p}-resonance`).textContent = fmt(data.resonance);
    document.getElementById(`${p}-entropy`).textContent   = fmt(data.entropy);
  });
}

// ── Canister Calls ──────────────────────────────────────────────────────

window.refreshState = async function () {
  if (!actor) { addLog('No canister connection', 'error'); return; }
  try {
    addLog('Fetching organism state…');
    const snap = await actor.getState();
    renderSnapshot(snap);
    addLog(`Beat #${fmt(snap.beatCount)} — state refreshed`, 'success');
  } catch (err) {
    addLog(`getState failed: ${err.message}`, 'error');
  }
};

window.fetchVitality = async function () {
  if (!actor) { addLog('No canister connection', 'error'); return; }
  try {
    addLog('Calculating vitality…');
    const v = await actor.calculateVitality();
    document.getElementById('vitality').textContent = fmt(v.overall);
    document.getElementById('phiRatio').textContent = fmt(v.phiRatio);
    const pct = Math.min(v.overall / 2.618 * 100, 100);
    document.getElementById('vitalityBar').style.width = `${pct}%`;
    addLog(`Vitality: ${fmt(v.overall)} · φ-ratio: ${fmt(v.phiRatio)}`, 'success');
  } catch (err) {
    addLog(`calculateVitality failed: ${err.message}`, 'error');
  }
};

window.fetchSensors = async function () {
  if (!actor) { addLog('No canister connection', 'error'); return; }
  try {
    addLog('Reading sensors…');
    const sensors = await actor.readSensors();
    addLog(`${sensors.length} sensor(s) returned`, 'success');
    sensors.forEach(s => addLog(`  → ${s.sensorId}: ${fmt(s.value)} ${s.unit}`));
  } catch (err) {
    addLog(`readSensors failed: ${err.message}`, 'error');
  }
};

window.fetchSynapses = async function () {
  if (!actor) { addLog('No canister connection', 'error'); return; }
  try {
    addLog('Listing synapse bindings…');
    const bindings = await actor.listSynapseBindings();
    document.getElementById('synapseCount').textContent = bindings.length;
    addLog(`${bindings.length} binding(s): ${bindings.join(', ') || '(none)'}`, 'success');
  } catch (err) {
    addLog(`listSynapseBindings failed: ${err.message}`, 'error');
  }
};

// ── Demo Mode (offline/no canister) ─────────────────────────────────────

function loadDemoData() {
  addLog('Loading demo data (no live canister)');
  const PHI = 1.618033988749895;
  const PHI_INV = 0.618033988749895;
  const demo = {
    beatCount: 42n,
    cognitive:  { awareness: 1.0, coherence: 1.0, resonance: PHI_INV, entropy: 0.0 },
    affective:  { awareness: PHI_INV, coherence: 1.0, resonance: 1.0, entropy: 0.0 },
    somatic:    { awareness: 1.0, coherence: PHI_INV, resonance: 1.0, entropy: 0.0 },
    sovereign:  { awareness: PHI, coherence: PHI, resonance: PHI, entropy: 0.0 },
    timestampNs: 0n,
  };
  renderSnapshot(demo);
  document.getElementById('vitality').textContent = '2.4270';
  document.getElementById('phiRatio').textContent = fmt(PHI);
  document.getElementById('synapseCount').textContent = '0';
  document.getElementById('vitalityBar').style.width = '92%';
  addLog('Demo data loaded — deploy to ICP for live data', 'success');
}

// ── Auto-Refresh Loop ───────────────────────────────────────────────────
// Refresh state every 5 seconds when live
let refreshInterval = null;
function startAutoRefresh() {
  if (refreshInterval) return;
  refreshInterval = setInterval(async () => {
    if (actor) {
      try {
        const snap = await actor.getState();
        renderSnapshot(snap);
      } catch { /* silent on interval failures */ }
    }
  }, 5000);
}

// ── Boot ────────────────────────────────────────────────────────────────

initAgent().then(() => {
  if (actor) startAutoRefresh();
});
