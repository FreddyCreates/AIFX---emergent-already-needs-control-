/**
 * Register AI — Builder Family SDK
 *
 * The 5th tool family: Builder. The Register AI is the organism's native
 * build intelligence. It replaces CI/CD with autonomous in-browser AI
 * that scans, validates, packages, and deploys extensions.
 *
 * Family: Builder (6 members)
 *   1. Register     — Orchestrator AGI. Runs the full 7-step pipeline.
 *   2. Packager     — Packages extensions into downloadable zips.
 *   3. Validator    — Validates Manifest V3 compliance.
 *   4. IconForge    — Generates icons via OffscreenCanvas.
 *   5. Deployer     — Creates download links and install instructions.
 *   6. Monitor      — Health monitoring with 873ms heartbeat.
 *
 * Architecture:
 *   - Web Worker (register-worker.js) — off-main-thread build engine
 *   - Observer Family (register-observer.js) — 4 browser observers as AGI sensors
 *   - Extension (EXT-026) — background.js + content.js user experience
 *
 * @module register-ai
 */

const PHI = 1.618033988749895;
const HEARTBEAT = 873;

// ────────────────────────────────────────────────────────────
//  Builder Family Profile
// ────────────────────────────────────────────────────────────

const BUILDER_FAMILY = {
  id: 'FAM-005',
  name: 'Builder',
  icon: '\uD83C\uDFD7',
  motto: 'The builder turns source into sovereign intelligence you can touch.',
  description: 'The Builder family is the organism\'s construction intelligence. Where Crawling sees, Context understands, Commander acts, and Sentry guards \u2014 Builder creates. It scans extension sources, validates manifests, generates icons, packages zips, creates download links, deploys to Chrome/Edge/Brave, and monitors health. The Builder doesn\'t wait for CI/CD. It builds natively, in-browser, off-main-thread via Web Workers.',
  primitiveFunction: 'Transform source code into deployable, downloadable, installable intelligence',
  organismRole: 'The organism\'s construction and deployment system \u2014 its ability to reproduce and distribute itself',
  resonancePattern: 'Builder feeds Deployer feeds User \u2014 the organism extends itself into the world',
  coreRings: ['Build Ring', 'Interface Ring'],
  archetypes: ['builder', 'packager', 'validator', 'deployer', 'monitor', 'installer'],
  lawsDomain: ['build-integrity', 'manifest-compliance', 'distribution-safety', 'version-control'],
  members: [
    {
      callId: 'TOOL-025',
      name: 'REGISTER',
      displayName: 'Register',
      family: 'Builder',
      purpose: 'Orchestrator AGI \u2014 runs the full 7-step build pipeline automatically. Scan \u2192 Validate \u2192 Icons \u2192 Package \u2192 Download \u2192 Install \u2192 Monitor.',
      permissionClass: 'organism.build.register',
      housePlacement: 'Build Ring',
      exposure: 'PUBLIC',
      trustTier: 'critical',
      billingClass: 'free',
    },
    {
      callId: 'TOOL-026',
      name: 'PACKAGER',
      displayName: 'Packager',
      family: 'Builder',
      purpose: 'Packages extension source files into downloadable .zip archives with proper Manifest V3 structure.',
      permissionClass: 'organism.build.packager',
      housePlacement: 'Build Ring',
      exposure: 'INTERNAL',
      trustTier: 'high',
      billingClass: 'free',
    },
    {
      callId: 'TOOL-027',
      name: 'VALIDATOR',
      displayName: 'Validator',
      family: 'Builder',
      purpose: 'Validates extension manifests for Chrome Manifest V3 compliance.',
      permissionClass: 'organism.build.validator',
      housePlacement: 'Build Ring',
      exposure: 'INTERNAL',
      trustTier: 'high',
      billingClass: 'free',
    },
    {
      callId: 'TOOL-028',
      name: 'ICON-FORGE',
      displayName: 'Icon Forge',
      family: 'Builder',
      purpose: 'Generates PNG icons for extensions using OffscreenCanvas or Canvas API.',
      permissionClass: 'organism.build.icon_forge',
      housePlacement: 'Build Ring',
      exposure: 'INTERNAL',
      trustTier: 'medium',
      billingClass: 'free',
    },
    {
      callId: 'TOOL-029',
      name: 'DEPLOYER',
      displayName: 'Deployer',
      family: 'Builder',
      purpose: 'Creates download links and generates browser-specific sideload instructions.',
      permissionClass: 'organism.build.deployer',
      housePlacement: 'Interface Ring',
      exposure: 'PUBLIC',
      trustTier: 'high',
      billingClass: 'free',
    },
    {
      callId: 'TOOL-030',
      name: 'MONITOR',
      displayName: 'Monitor',
      family: 'Builder',
      purpose: 'Health monitoring for all built extensions at 873ms heartbeat.',
      permissionClass: 'organism.build.monitor',
      housePlacement: 'Build Ring',
      exposure: 'INTERNAL',
      trustTier: 'medium',
      billingClass: 'free',
    },
  ],
};

// ────────────────────────────────────────────────────────────
//  Register AI — Main Orchestrator Class
// ────────────────────────────────────────────────────────────

class RegisterAI {
  constructor() {
    this.worker = null;
    this.workerReady = false;
    this.family = BUILDER_FAMILY;
    this.listeners = new Map();
    this.pipelineComplete = false;
    this.downloads = [];
  }

  init() {
    if (typeof Worker === 'undefined') {
      console.warn('[Register AI] Web Workers not available');
      return this;
    }

    try {
      this.worker = new Worker(new URL('./register-worker.js', import.meta.url), { type: 'module' });
    } catch (e) {
      try {
        this.worker = new Worker('register-worker.js');
      } catch (e2) {
        console.warn('[Register AI] Worker init failed:', e2.message);
        return this;
      }
    }

    this.worker.onmessage = (e) => {
      var msg = e.data;
      var handler = this.listeners.get(msg.type);
      if (handler) handler(msg);

      if (msg.type === 'pipeline-complete') {
        this.pipelineComplete = true;
      }
      if (msg.type === 'downloads-ready') {
        this.downloads = msg.downloads;
      }
    };

    this.worker.onerror = (e) => {
      console.error('[Register AI] Worker error:', e.message);
    };

    this.workerReady = true;
    return this;
  }

  on(type, callback) {
    this.listeners.set(type, callback);
    return this;
  }

  send(type, data) {
    if (!this.worker) return;
    this.worker.postMessage(Object.assign({ type: type }, data || {}));
  }

  runPipeline() {
    this.send('runPipeline');
  }

  getFamily() {
    return BUILDER_FAMILY;
  }

  getMembers() {
    return BUILDER_FAMILY.members;
  }

  destroy() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.workerReady = false;
  }
}

export { RegisterAI, BUILDER_FAMILY };
export default RegisterAI;
