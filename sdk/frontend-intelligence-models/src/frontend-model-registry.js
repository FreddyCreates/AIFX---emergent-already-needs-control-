/**
 * @medina/frontend-intelligence-models — FrontendModelRegistry
 *
 * 30 front-end technology AI models. Every front-end primitive is treated
 * as an intelligence — each model has 5 distinct intelligence uses.
 *
 * The 30 technologies span 10 categories:
 *   Markup (3) · Styling (3) · Framework (3) · State (3) · Build (3)
 *   Testing (3) · Graphics (3) · Communication (3) · Storage (3) · Web API (3)
 *
 * Each model is a 24-hour autonomous organism cell that:
 *   1. Senses its domain continuously
 *   2. Generates intelligence outputs
 *   3. Routes through the EngineCore
 *   4. Self-heals on failure
 *   5. Reports telemetry to the organism dashboard
 *
 * @module @medina/frontend-intelligence-models/frontend-model-registry
 */

const PHI = 1.618033988749895;
const HEARTBEAT = 873;

/**
 * @typedef {Object} IntelligenceUse
 * @property {string} useId        — deterministic use identifier
 * @property {string} name         — human-readable use name
 * @property {string} description  — what the use does
 * @property {string} inputModality  — what it accepts
 * @property {string} outputModality — what it produces
 * @property {string} primitiveFunction — organism primitive
 */

/**
 * @typedef {Object} FrontendModel
 * @property {string} modelId          — deterministic model ID (FIM-001 … FIM-030)
 * @property {string} technology       — technology name
 * @property {string} category         — category name
 * @property {string} intelligenceType — type of intelligence
 * @property {string} ringAffinity     — organism ring
 * @property {string} organismPlacement — organism layer
 * @property {string} multimodalFamily — multimodal family membership
 * @property {boolean} autonomous      — always true (24-hour)
 * @property {IntelligenceUse[]} uses  — 5 intelligence uses
 */

class FrontendModelRegistry {
  constructor() {
    /** @type {Map<string, FrontendModel>} */
    this.models = new Map();
    this._seed();
  }

  /**
   * @param {FrontendModel} model
   * @private
   */
  _register(model) {
    this.models.set(model.modelId, model);
  }

  /* ================================================================== */
  /*  SEED — 30 models × 5 uses = 150 intelligence uses                 */
  /* ================================================================== */
  _seed() {

    /* ── MARKUP INTELLIGENCE (3) ────────────────────────────────────── */

    this._register({
      modelId: 'FIM-001', technology: 'HTML5 DOM Intelligence',
      category: 'Markup', intelligenceType: 'Structural Projection Intelligence',
      ringAffinity: 'Projection Ring', organismPlacement: 'Frontend organism / structure layer',
      multimodalFamily: 'Structure-Vision Family', autonomous: true,
      uses: [
        { useId: 'FIM-001-U1', name: 'Semantic Structure Generator', description: 'Generate semantically optimal HTML structures from natural language descriptions', inputModality: 'text', outputModality: 'html', primitiveFunction: 'project-structure' },
        { useId: 'FIM-001-U2', name: 'Accessibility Auditor', description: 'Continuously audit and auto-fix ARIA roles, landmarks, and tab order', inputModality: 'html', outputModality: 'report + patches', primitiveFunction: 'verify-accessibility' },
        { useId: 'FIM-001-U3', name: 'DOM Diff Intelligence', description: 'Compute minimal DOM diffs and predict optimal reconciliation paths', inputModality: 'dom-tree', outputModality: 'diff-ops', primitiveFunction: 'diff-reconcile' },
        { useId: 'FIM-001-U4', name: 'Schema Markup Synthesizer', description: 'Auto-generate JSON-LD, microdata, and Open Graph from page content', inputModality: 'html + text', outputModality: 'structured-data', primitiveFunction: 'synthesize-schema' },
        { useId: 'FIM-001-U5', name: 'Component Tree Architect', description: 'Design optimal component hierarchies from wireframes or descriptions', inputModality: 'vision + text', outputModality: 'component-tree', primitiveFunction: 'architect-components' }
      ]
    });

    this._register({
      modelId: 'FIM-002', technology: 'Web Components Intelligence',
      category: 'Markup', intelligenceType: 'Encapsulation Intelligence',
      ringAffinity: 'Projection Ring', organismPlacement: 'Frontend organism / structure layer',
      multimodalFamily: 'Structure-Vision Family', autonomous: true,
      uses: [
        { useId: 'FIM-002-U1', name: 'Custom Element Generator', description: 'Generate production-ready custom elements from behavioral specifications', inputModality: 'text', outputModality: 'code', primitiveFunction: 'generate-element' },
        { useId: 'FIM-002-U2', name: 'Shadow DOM Optimizer', description: 'Optimize shadow boundaries for render performance and style isolation', inputModality: 'dom-tree', outputModality: 'optimized-tree', primitiveFunction: 'optimize-shadow' },
        { useId: 'FIM-002-U3', name: 'Slot Distribution Planner', description: 'Plan optimal slot distributions for complex composed UIs', inputModality: 'component-spec', outputModality: 'slot-map', primitiveFunction: 'plan-slots' },
        { useId: 'FIM-002-U4', name: 'Lifecycle Hook Advisor', description: 'Suggest optimal lifecycle hook usage and timing for custom elements', inputModality: 'code', outputModality: 'advisory-report', primitiveFunction: 'advise-lifecycle' },
        { useId: 'FIM-002-U5', name: 'Cross-Framework Bridge', description: 'Generate wrapper adapters to use Web Components in React/Vue/Angular', inputModality: 'component-spec + framework', outputModality: 'bridge-code', primitiveFunction: 'bridge-frameworks' }
      ]
    });

    this._register({
      modelId: 'FIM-003', technology: 'SVG/MathML Intelligence',
      category: 'Markup', intelligenceType: 'Declarative Graphics Intelligence',
      ringAffinity: 'Projection Ring', organismPlacement: 'Frontend organism / structure layer',
      multimodalFamily: 'Structure-Vision Family', autonomous: true,
      uses: [
        { useId: 'FIM-003-U1', name: 'SVG Path Generator', description: 'Generate optimized SVG paths from sketches, images, or text descriptions', inputModality: 'vision + text', outputModality: 'svg', primitiveFunction: 'generate-svg' },
        { useId: 'FIM-003-U2', name: 'Math Equation Renderer', description: 'Convert LaTeX/natural language math to accessible MathML', inputModality: 'text + math', outputModality: 'mathml', primitiveFunction: 'render-math' },
        { useId: 'FIM-003-U3', name: 'Icon System Intelligence', description: 'Generate consistent icon systems with SVG sprite optimization', inputModality: 'text + style-spec', outputModality: 'svg-sprite', primitiveFunction: 'generate-icons' },
        { useId: 'FIM-003-U4', name: 'Vector Animation Engine', description: 'Generate SMIL and CSS-animated SVGs from motion descriptions', inputModality: 'text', outputModality: 'animated-svg', primitiveFunction: 'animate-vector' },
        { useId: 'FIM-003-U5', name: 'Diagram Intelligence', description: 'Auto-generate architectural diagrams, flowcharts, and data visualizations', inputModality: 'structured-data + text', outputModality: 'svg', primitiveFunction: 'generate-diagram' }
      ]
    });

    /* ── STYLING INTELLIGENCE (3) ───────────────────────────────────── */

    this._register({
      modelId: 'FIM-004', technology: 'CSS Layout Intelligence',
      category: 'Styling', intelligenceType: 'Visual Composition Intelligence',
      ringAffinity: 'Visual Ring', organismPlacement: 'Frontend organism / visual layer',
      multimodalFamily: 'Visual-Design Family', autonomous: true,
      uses: [
        { useId: 'FIM-004-U1', name: 'Layout Generator', description: 'Generate optimal CSS Grid/Flexbox layouts from wireframes or descriptions', inputModality: 'vision + text', outputModality: 'css', primitiveFunction: 'generate-layout' },
        { useId: 'FIM-004-U2', name: 'Responsive Breakpoint AI', description: 'Analyze content and generate optimal responsive breakpoints', inputModality: 'html + css', outputModality: 'media-queries', primitiveFunction: 'compute-breakpoints' },
        { useId: 'FIM-004-U3', name: 'Container Query Advisor', description: 'Recommend container query strategies for component-level responsiveness', inputModality: 'component-tree', outputModality: 'css + advisory', primitiveFunction: 'advise-containers' },
        { useId: 'FIM-004-U4', name: 'Spacing Harmonizer', description: 'Enforce phi-ratio spacing scales across entire design systems', inputModality: 'css', outputModality: 'harmonized-css', primitiveFunction: 'harmonize-spacing' },
        { useId: 'FIM-004-U5', name: 'Layout Performance Profiler', description: 'Detect layout thrashing, forced reflows, and suggest fixes', inputModality: 'dom-tree + css', outputModality: 'performance-report', primitiveFunction: 'profile-layout' }
      ]
    });

    this._register({
      modelId: 'FIM-005', technology: 'Design Token Intelligence',
      category: 'Styling', intelligenceType: 'Design System Intelligence',
      ringAffinity: 'Visual Ring', organismPlacement: 'Frontend organism / visual layer',
      multimodalFamily: 'Visual-Design Family', autonomous: true,
      uses: [
        { useId: 'FIM-005-U1', name: 'Token System Generator', description: 'Generate complete design token systems from brand guidelines or Figma files', inputModality: 'vision + text', outputModality: 'token-json', primitiveFunction: 'generate-tokens' },
        { useId: 'FIM-005-U2', name: 'Color Intelligence', description: 'Generate accessible, harmonious color palettes using phi-ratio calculations', inputModality: 'color + constraints', outputModality: 'palette', primitiveFunction: 'compute-colors' },
        { useId: 'FIM-005-U3', name: 'Typography Scale AI', description: 'Calculate optimal type scales using modular scale and golden ratio', inputModality: 'base-size + ratio', outputModality: 'type-scale', primitiveFunction: 'compute-typography' },
        { useId: 'FIM-005-U4', name: 'Theme Transformer', description: 'Transform design tokens between platforms (web/iOS/Android/Figma)', inputModality: 'token-json + target', outputModality: 'platform-tokens', primitiveFunction: 'transform-tokens' },
        { useId: 'FIM-005-U5', name: 'Consistency Auditor', description: 'Audit entire codebases for design token compliance and drift', inputModality: 'codebase + tokens', outputModality: 'audit-report', primitiveFunction: 'audit-consistency' }
      ]
    });

    this._register({
      modelId: 'FIM-006', technology: 'CSS Animation Intelligence',
      category: 'Styling', intelligenceType: 'Motion Design Intelligence',
      ringAffinity: 'Visual Ring', organismPlacement: 'Frontend organism / visual layer',
      multimodalFamily: 'Visual-Design Family', autonomous: true,
      uses: [
        { useId: 'FIM-006-U1', name: 'Animation Generator', description: 'Generate CSS animations and transitions from natural language motion descriptions', inputModality: 'text', outputModality: 'css-animation', primitiveFunction: 'generate-animation' },
        { useId: 'FIM-006-U2', name: 'Easing Curve Intelligence', description: 'Design custom cubic-bezier curves matching emotional intent (playful, professional, urgent)', inputModality: 'text + emotion', outputModality: 'easing-function', primitiveFunction: 'design-easing' },
        { useId: 'FIM-006-U3', name: 'Performance-Safe Motion', description: 'Ensure animations only use compositor-friendly properties (transform, opacity)', inputModality: 'css-animation', outputModality: 'optimized-animation', primitiveFunction: 'optimize-motion' },
        { useId: 'FIM-006-U4', name: 'Micro-Interaction Designer', description: 'Design stateful micro-interactions for buttons, toggles, and form elements', inputModality: 'component-spec + text', outputModality: 'interaction-css', primitiveFunction: 'design-microinteraction' },
        { useId: 'FIM-006-U5', name: 'Scroll Animation Choreographer', description: 'Create scroll-driven animations with intersection observer integration', inputModality: 'scroll-spec + text', outputModality: 'scroll-animation', primitiveFunction: 'choreograph-scroll' }
      ]
    });

    /* ── FRAMEWORK INTELLIGENCE (3) ─────────────────────────────────── */

    this._register({
      modelId: 'FIM-007', technology: 'React Intelligence',
      category: 'Framework', intelligenceType: 'Component Projection Intelligence',
      ringAffinity: 'Interface Ring', organismPlacement: 'Frontend organism / orchestration layer',
      multimodalFamily: 'Framework-Orchestration Family', autonomous: true,
      uses: [
        { useId: 'FIM-007-U1', name: 'Component Generator', description: 'Generate production React components from specifications or screenshots', inputModality: 'vision + text', outputModality: 'react-code', primitiveFunction: 'generate-component' },
        { useId: 'FIM-007-U2', name: 'Hook Composer', description: 'Compose custom hooks from behavioral descriptions with proper dependency management', inputModality: 'text', outputModality: 'hook-code', primitiveFunction: 'compose-hook' },
        { useId: 'FIM-007-U3', name: 'Render Optimizer', description: 'Analyze component trees and insert memo/useMemo/useCallback at optimal points', inputModality: 'react-code', outputModality: 'optimized-code', primitiveFunction: 'optimize-render' },
        { useId: 'FIM-007-U4', name: 'Server Component Advisor', description: 'Classify components as server/client and suggest RSC boundaries', inputModality: 'react-code', outputModality: 'boundary-map', primitiveFunction: 'advise-rsc' },
        { useId: 'FIM-007-U5', name: 'Migration Intelligence', description: 'Migrate class components to hooks, JavaScript to TypeScript, CRA to Next.js', inputModality: 'legacy-code + target', outputModality: 'migrated-code', primitiveFunction: 'migrate-react' }
      ]
    });

    this._register({
      modelId: 'FIM-008', technology: 'Vue Intelligence',
      category: 'Framework', intelligenceType: 'Reactive Projection Intelligence',
      ringAffinity: 'Interface Ring', organismPlacement: 'Frontend organism / orchestration layer',
      multimodalFamily: 'Framework-Orchestration Family', autonomous: true,
      uses: [
        { useId: 'FIM-008-U1', name: 'SFC Generator', description: 'Generate Vue Single-File Components from specifications with Composition API', inputModality: 'text + vision', outputModality: 'vue-code', primitiveFunction: 'generate-sfc' },
        { useId: 'FIM-008-U2', name: 'Composable Designer', description: 'Design Vue composables with reactive state and lifecycle integration', inputModality: 'text', outputModality: 'composable-code', primitiveFunction: 'design-composable' },
        { useId: 'FIM-008-U3', name: 'Reactivity Debugger', description: 'Trace and debug Vue reactivity chains, detect unnecessary watchers', inputModality: 'vue-code', outputModality: 'debug-report', primitiveFunction: 'debug-reactivity' },
        { useId: 'FIM-008-U4', name: 'Nuxt Route Planner', description: 'Generate optimal file-based route structures for Nuxt applications', inputModality: 'sitemap + text', outputModality: 'route-structure', primitiveFunction: 'plan-routes' },
        { useId: 'FIM-008-U5', name: 'Options-to-Composition Migrator', description: 'Automatically convert Options API to Composition API with script setup', inputModality: 'vue-code', outputModality: 'migrated-code', primitiveFunction: 'migrate-vue' }
      ]
    });

    this._register({
      modelId: 'FIM-009', technology: 'Meta-Framework Intelligence',
      category: 'Framework', intelligenceType: 'Full-Stack Projection Intelligence',
      ringAffinity: 'Interface Ring', organismPlacement: 'Frontend organism / orchestration layer',
      multimodalFamily: 'Framework-Orchestration Family', autonomous: true,
      uses: [
        { useId: 'FIM-009-U1', name: 'SSR/SSG Strategy Advisor', description: 'Recommend per-route rendering strategies (SSR, SSG, ISR, CSR) based on content type', inputModality: 'route-map + analytics', outputModality: 'rendering-strategy', primitiveFunction: 'advise-rendering' },
        { useId: 'FIM-009-U2', name: 'Edge Function Generator', description: 'Generate edge functions and middleware for Vercel/Cloudflare/Deno Deploy', inputModality: 'text + route-spec', outputModality: 'edge-code', primitiveFunction: 'generate-edge-function' },
        { useId: 'FIM-009-U3', name: 'Data Loading Optimizer', description: 'Optimize data fetching with parallel loaders, waterfall elimination, and caching', inputModality: 'route-code', outputModality: 'optimized-loaders', primitiveFunction: 'optimize-data-loading' },
        { useId: 'FIM-009-U4', name: 'Islands Architecture Planner', description: 'Identify interactive islands in static pages for partial hydration', inputModality: 'page-code', outputModality: 'island-map', primitiveFunction: 'plan-islands' },
        { useId: 'FIM-009-U5', name: 'Framework Selector', description: 'Recommend optimal framework (Next/Nuxt/SvelteKit/Astro/Remix) for project requirements', inputModality: 'project-requirements', outputModality: 'recommendation-report', primitiveFunction: 'select-framework' }
      ]
    });

    /* ── STATE INTELLIGENCE (3) ─────────────────────────────────────── */

    this._register({
      modelId: 'FIM-010', technology: 'Reactive State Intelligence',
      category: 'State', intelligenceType: 'Memory-State Intelligence',
      ringAffinity: 'Memory Ring', organismPlacement: 'Frontend organism / memory layer',
      multimodalFamily: 'Memory-State Family', autonomous: true,
      uses: [
        { useId: 'FIM-010-U1', name: 'State Architecture Designer', description: 'Design normalized, phi-structured state trees for complex applications', inputModality: 'requirements + data-model', outputModality: 'state-schema', primitiveFunction: 'design-state' },
        { useId: 'FIM-010-U2', name: 'Selector Optimizer', description: 'Generate memoized selectors and derived state computations', inputModality: 'state-schema', outputModality: 'selector-code', primitiveFunction: 'optimize-selectors' },
        { useId: 'FIM-010-U3', name: 'State Migration Engine', description: 'Generate migration scripts between state library versions and architectures', inputModality: 'old-state + new-schema', outputModality: 'migration-code', primitiveFunction: 'migrate-state' },
        { useId: 'FIM-010-U4', name: 'Side Effect Orchestrator', description: 'Design saga/thunk/effect patterns for complex async state workflows', inputModality: 'workflow-spec', outputModality: 'effect-code', primitiveFunction: 'orchestrate-effects' },
        { useId: 'FIM-010-U5', name: 'State Debugger Intelligence', description: 'Time-travel debug, detect mutations, and visualize state diff chains', inputModality: 'state-history', outputModality: 'debug-visualization', primitiveFunction: 'debug-state' }
      ]
    });

    this._register({
      modelId: 'FIM-011', technology: 'Form Intelligence',
      category: 'State', intelligenceType: 'Input Validation Intelligence',
      ringAffinity: 'Memory Ring', organismPlacement: 'Frontend organism / memory layer',
      multimodalFamily: 'Memory-State Family', autonomous: true,
      uses: [
        { useId: 'FIM-011-U1', name: 'Form Schema Generator', description: 'Generate form schemas from API specs, databases, or natural language', inputModality: 'text + api-spec', outputModality: 'form-schema', primitiveFunction: 'generate-form' },
        { useId: 'FIM-011-U2', name: 'Validation Rule Engine', description: 'Generate client + server validation rules with consistent error messages', inputModality: 'form-schema', outputModality: 'validation-rules', primitiveFunction: 'generate-validation' },
        { useId: 'FIM-011-U3', name: 'Multi-Step Form Orchestrator', description: 'Design multi-step form wizards with branching logic and state persistence', inputModality: 'form-spec', outputModality: 'wizard-code', primitiveFunction: 'orchestrate-wizard' },
        { useId: 'FIM-011-U4', name: 'Input Mask Intelligence', description: 'Generate input masks and formatters for phone, currency, dates, and custom formats', inputModality: 'format-spec', outputModality: 'mask-code', primitiveFunction: 'generate-masks' },
        { useId: 'FIM-011-U5', name: 'UX Error Intelligence', description: 'Generate contextual, helpful error messages and inline validation feedback', inputModality: 'validation-errors', outputModality: 'ux-messages', primitiveFunction: 'humanize-errors' }
      ]
    });

    this._register({
      modelId: 'FIM-012', technology: 'State Machine Intelligence',
      category: 'State', intelligenceType: 'Finite Automaton Intelligence',
      ringAffinity: 'Memory Ring', organismPlacement: 'Frontend organism / memory layer',
      multimodalFamily: 'Memory-State Family', autonomous: true,
      uses: [
        { useId: 'FIM-012-U1', name: 'Statechart Generator', description: 'Generate XState statecharts from workflow descriptions or UML diagrams', inputModality: 'text + vision', outputModality: 'statechart-code', primitiveFunction: 'generate-statechart' },
        { useId: 'FIM-012-U2', name: 'Guard Condition Advisor', description: 'Recommend guard conditions and transitions for safe state machine design', inputModality: 'statechart', outputModality: 'guard-advisory', primitiveFunction: 'advise-guards' },
        { useId: 'FIM-012-U3', name: 'Parallel State Coordinator', description: 'Design parallel state regions for concurrent UI behaviors', inputModality: 'behavior-spec', outputModality: 'parallel-statechart', primitiveFunction: 'coordinate-parallel' },
        { useId: 'FIM-012-U4', name: 'State Reachability Prover', description: 'Formally verify all states are reachable and no deadlocks exist', inputModality: 'statechart', outputModality: 'verification-proof', primitiveFunction: 'prove-reachability' },
        { useId: 'FIM-012-U5', name: 'Statechart Visualizer', description: 'Generate interactive state machine visualizations from code', inputModality: 'statechart-code', outputModality: 'visualization', primitiveFunction: 'visualize-statechart' }
      ]
    });

    /* ── BUILD INTELLIGENCE (3) ─────────────────────────────────────── */

    this._register({
      modelId: 'FIM-013', technology: 'Bundle Intelligence',
      category: 'Build', intelligenceType: 'Transformation Pipeline Intelligence',
      ringAffinity: 'Build Ring', organismPlacement: 'Frontend organism / packaging layer',
      multimodalFamily: 'Build-Transform Family', autonomous: true,
      uses: [
        { useId: 'FIM-013-U1', name: 'Bundle Analyzer', description: 'Analyze bundle composition, detect duplicate dependencies, suggest tree-shaking', inputModality: 'bundle-stats', outputModality: 'analysis-report', primitiveFunction: 'analyze-bundle' },
        { useId: 'FIM-013-U2', name: 'Code Splitting Advisor', description: 'Recommend optimal code splitting boundaries based on route and usage analytics', inputModality: 'route-map + analytics', outputModality: 'split-strategy', primitiveFunction: 'advise-splitting' },
        { useId: 'FIM-013-U3', name: 'Build Config Generator', description: 'Generate Vite/Webpack/Rollup configs from project requirements', inputModality: 'project-spec', outputModality: 'build-config', primitiveFunction: 'generate-config' },
        { useId: 'FIM-013-U4', name: 'Dependency Auditor', description: 'Audit dependencies for vulnerabilities, license compliance, and bloat', inputModality: 'package-manifest', outputModality: 'audit-report', primitiveFunction: 'audit-dependencies' },
        { useId: 'FIM-013-U5', name: 'Module Federation Planner', description: 'Design micro-frontend module federation architectures', inputModality: 'architecture-spec', outputModality: 'federation-config', primitiveFunction: 'plan-federation' }
      ]
    });

    this._register({
      modelId: 'FIM-014', technology: 'TypeScript Intelligence',
      category: 'Build', intelligenceType: 'Type System Intelligence',
      ringAffinity: 'Build Ring', organismPlacement: 'Frontend organism / packaging layer',
      multimodalFamily: 'Build-Transform Family', autonomous: true,
      uses: [
        { useId: 'FIM-014-U1', name: 'Type Generator', description: 'Generate TypeScript types from API responses, JSON schemas, or runtime data', inputModality: 'json + api-spec', outputModality: 'typescript-types', primitiveFunction: 'generate-types' },
        { useId: 'FIM-014-U2', name: 'Generic Type Architect', description: 'Design advanced generic types, conditional types, and mapped types', inputModality: 'type-requirements', outputModality: 'generic-types', primitiveFunction: 'architect-generics' },
        { useId: 'FIM-014-U3', name: 'Type Error Resolver', description: 'Diagnose and fix complex TypeScript type errors with explanations', inputModality: 'error + code', outputModality: 'fix + explanation', primitiveFunction: 'resolve-type-error' },
        { useId: 'FIM-014-U4', name: 'JS-to-TS Migrator', description: 'Incrementally migrate JavaScript projects to TypeScript with inferred types', inputModality: 'js-code', outputModality: 'ts-code', primitiveFunction: 'migrate-typescript' },
        { useId: 'FIM-014-U5', name: 'Type Narrowing Optimizer', description: 'Insert optimal type guards and narrowing patterns for safer code', inputModality: 'ts-code', outputModality: 'narrowed-code', primitiveFunction: 'optimize-narrowing' }
      ]
    });

    this._register({
      modelId: 'FIM-015', technology: 'CI/CD Pipeline Intelligence',
      category: 'Build', intelligenceType: 'Deployment Pipeline Intelligence',
      ringAffinity: 'Build Ring', organismPlacement: 'Frontend organism / packaging layer',
      multimodalFamily: 'Build-Transform Family', autonomous: true,
      uses: [
        { useId: 'FIM-015-U1', name: 'Pipeline Generator', description: 'Generate CI/CD pipelines for GitHub Actions/GitLab CI/Azure DevOps from project analysis', inputModality: 'project-spec', outputModality: 'pipeline-yaml', primitiveFunction: 'generate-pipeline' },
        { useId: 'FIM-015-U2', name: 'Deploy Strategy Advisor', description: 'Recommend blue-green, canary, or rolling deployment strategies', inputModality: 'infrastructure-spec', outputModality: 'deploy-strategy', primitiveFunction: 'advise-deploy' },
        { useId: 'FIM-015-U3', name: 'Cache Intelligence', description: 'Optimize build caches, CDN cache headers, and service worker cache strategies', inputModality: 'build-config + routes', outputModality: 'cache-config', primitiveFunction: 'optimize-cache' },
        { useId: 'FIM-015-U4', name: 'Preview Environment Manager', description: 'Generate preview environment configs for PR-based deployments', inputModality: 'project-spec', outputModality: 'preview-config', primitiveFunction: 'manage-preview' },
        { useId: 'FIM-015-U5', name: 'Release Intelligence', description: 'Generate changelogs, version bumps, and release notes from commit history', inputModality: 'git-history', outputModality: 'release-notes', primitiveFunction: 'generate-release' }
      ]
    });

    /* ── TESTING INTELLIGENCE (3) ───────────────────────────────────── */

    this._register({
      modelId: 'FIM-016', technology: 'Unit Test Intelligence',
      category: 'Testing', intelligenceType: 'Verification Intelligence',
      ringAffinity: 'Proof Ring', organismPlacement: 'Frontend organism / verification layer',
      multimodalFamily: 'Verification-Proof Family', autonomous: true,
      uses: [
        { useId: 'FIM-016-U1', name: 'Test Generator', description: 'Generate comprehensive unit tests from source code with edge case coverage', inputModality: 'code', outputModality: 'test-code', primitiveFunction: 'generate-tests' },
        { useId: 'FIM-016-U2', name: 'Mock Factory', description: 'Generate type-safe mocks, stubs, and spies for any dependency', inputModality: 'dependency-spec', outputModality: 'mock-code', primitiveFunction: 'generate-mocks' },
        { useId: 'FIM-016-U3', name: 'Coverage Gap Detector', description: 'Identify untested code paths, branches, and edge cases', inputModality: 'code + coverage', outputModality: 'gap-report', primitiveFunction: 'detect-gaps' },
        { useId: 'FIM-016-U4', name: 'Property-Based Test Designer', description: 'Generate property-based tests with fast-check for robust invariant testing', inputModality: 'function-spec', outputModality: 'property-tests', primitiveFunction: 'design-property-tests' },
        { useId: 'FIM-016-U5', name: 'Snapshot Intelligence', description: 'Manage snapshot tests, detect meaningful vs noise changes, auto-update', inputModality: 'snapshot-diff', outputModality: 'update-decision', primitiveFunction: 'manage-snapshots' }
      ]
    });

    this._register({
      modelId: 'FIM-017', technology: 'E2E Test Intelligence',
      category: 'Testing', intelligenceType: 'Integration Verification Intelligence',
      ringAffinity: 'Proof Ring', organismPlacement: 'Frontend organism / verification layer',
      multimodalFamily: 'Verification-Proof Family', autonomous: true,
      uses: [
        { useId: 'FIM-017-U1', name: 'E2E Scenario Generator', description: 'Generate Playwright/Cypress E2E tests from user stories or acceptance criteria', inputModality: 'user-story', outputModality: 'e2e-code', primitiveFunction: 'generate-e2e' },
        { useId: 'FIM-017-U2', name: 'Visual Regression Detector', description: 'Compare screenshots pixel-by-pixel with intelligent diff analysis', inputModality: 'screenshot-pair', outputModality: 'visual-diff', primitiveFunction: 'detect-visual-regression' },
        { useId: 'FIM-017-U3', name: 'Flaky Test Healer', description: 'Detect flaky tests, diagnose root causes, and generate stable alternatives', inputModality: 'test-results + code', outputModality: 'healed-tests', primitiveFunction: 'heal-flaky' },
        { useId: 'FIM-017-U4', name: 'Test Data Generator', description: 'Generate realistic test data fixtures matching schema and business rules', inputModality: 'schema + rules', outputModality: 'test-data', primitiveFunction: 'generate-test-data' },
        { useId: 'FIM-017-U5', name: 'Accessibility E2E Auditor', description: 'Run automated accessibility tests with axe-core integration on every page', inputModality: 'page-url', outputModality: 'a11y-report', primitiveFunction: 'audit-a11y-e2e' }
      ]
    });

    this._register({
      modelId: 'FIM-018', technology: 'Performance Test Intelligence',
      category: 'Testing', intelligenceType: 'Performance Verification Intelligence',
      ringAffinity: 'Proof Ring', organismPlacement: 'Frontend organism / verification layer',
      multimodalFamily: 'Verification-Proof Family', autonomous: true,
      uses: [
        { useId: 'FIM-018-U1', name: 'Core Web Vitals Optimizer', description: 'Measure and optimize LCP, FID, CLS, INP with actionable recommendations', inputModality: 'page-url + metrics', outputModality: 'optimization-plan', primitiveFunction: 'optimize-cwv' },
        { useId: 'FIM-018-U2', name: 'Lighthouse Automation', description: 'Run automated Lighthouse audits and track score regressions over time', inputModality: 'page-url', outputModality: 'lighthouse-report', primitiveFunction: 'automate-lighthouse' },
        { useId: 'FIM-018-U3', name: 'Bundle Budget Enforcer', description: 'Set and enforce JavaScript/CSS bundle size budgets with CI integration', inputModality: 'budget-config', outputModality: 'budget-report', primitiveFunction: 'enforce-budget' },
        { useId: 'FIM-018-U4', name: 'Runtime Performance Profiler', description: 'Profile React renders, DOM updates, and JavaScript execution time', inputModality: 'runtime-trace', outputModality: 'profile-report', primitiveFunction: 'profile-runtime' },
        { useId: 'FIM-018-U5', name: 'Network Waterfall Analyzer', description: 'Analyze network waterfalls, detect blocking resources, and recommend preloading', inputModality: 'har-file', outputModality: 'waterfall-analysis', primitiveFunction: 'analyze-waterfall' }
      ]
    });

    /* ── GRAPHICS INTELLIGENCE (3) ──────────────────────────────────── */

    this._register({
      modelId: 'FIM-019', technology: 'WebGL/WebGPU Intelligence',
      category: 'Graphics', intelligenceType: 'GPU Compute Intelligence',
      ringAffinity: 'Geometry Ring', organismPlacement: 'Frontend organism / scene layer',
      multimodalFamily: 'Scene-Graphics Family', autonomous: true,
      uses: [
        { useId: 'FIM-019-U1', name: 'Shader Generator', description: 'Generate GLSL/WGSL shaders from natural language or visual examples', inputModality: 'text + vision', outputModality: 'shader-code', primitiveFunction: 'generate-shader' },
        { useId: 'FIM-019-U2', name: '3D Scene Compositor', description: 'Compose Three.js/Babylon.js scenes from text descriptions or image references', inputModality: 'text + vision', outputModality: 'scene-code', primitiveFunction: 'compose-scene' },
        { useId: 'FIM-019-U3', name: 'GPU Performance Tuner', description: 'Profile and optimize WebGL draw calls, texture memory, and GPU utilization', inputModality: 'render-metrics', outputModality: 'optimization-report', primitiveFunction: 'tune-gpu' },
        { useId: 'FIM-019-U4', name: 'Particle System Designer', description: 'Design GPU-accelerated particle systems for effects (fire, smoke, rain, sparks)', inputModality: 'text + physics-params', outputModality: 'particle-code', primitiveFunction: 'design-particles' },
        { useId: 'FIM-019-U5', name: 'WebGPU Compute Pipeline', description: 'Generate compute shader pipelines for in-browser ML, physics, and data processing', inputModality: 'compute-spec', outputModality: 'wgsl-pipeline', primitiveFunction: 'generate-compute' }
      ]
    });

    this._register({
      modelId: 'FIM-020', technology: 'Data Visualization Intelligence',
      category: 'Graphics', intelligenceType: 'Visual Analytics Intelligence',
      ringAffinity: 'Geometry Ring', organismPlacement: 'Frontend organism / scene layer',
      multimodalFamily: 'Scene-Graphics Family', autonomous: true,
      uses: [
        { useId: 'FIM-020-U1', name: 'Chart Recommender', description: 'Recommend optimal chart types based on data shape, cardinality, and purpose', inputModality: 'data + intent', outputModality: 'chart-recommendation', primitiveFunction: 'recommend-chart' },
        { useId: 'FIM-020-U2', name: 'Dashboard Generator', description: 'Generate interactive dashboards from data sources and KPI specifications', inputModality: 'data + kpi-spec', outputModality: 'dashboard-code', primitiveFunction: 'generate-dashboard' },
        { useId: 'FIM-020-U3', name: 'Data Story Narrator', description: 'Generate narrative annotations for charts highlighting trends and anomalies', inputModality: 'chart-data', outputModality: 'annotations', primitiveFunction: 'narrate-data' },
        { useId: 'FIM-020-U4', name: 'Accessible Chart Builder', description: 'Generate charts with proper ARIA labels, screen-reader descriptions, and sonification', inputModality: 'data + chart-type', outputModality: 'accessible-chart', primitiveFunction: 'build-accessible-chart' },
        { useId: 'FIM-020-U5', name: 'Real-Time Stream Visualizer', description: 'Create streaming data visualizations for WebSocket/SSE data feeds', inputModality: 'stream-spec', outputModality: 'streaming-viz-code', primitiveFunction: 'visualize-stream' }
      ]
    });

    this._register({
      modelId: 'FIM-021', technology: 'Canvas/2D Intelligence',
      category: 'Graphics', intelligenceType: 'Raster Rendering Intelligence',
      ringAffinity: 'Geometry Ring', organismPlacement: 'Frontend organism / scene layer',
      multimodalFamily: 'Scene-Graphics Family', autonomous: true,
      uses: [
        { useId: 'FIM-021-U1', name: 'Canvas Drawing AI', description: 'Generate Canvas 2D drawing code from sketches or text descriptions', inputModality: 'vision + text', outputModality: 'canvas-code', primitiveFunction: 'generate-canvas' },
        { useId: 'FIM-021-U2', name: 'Image Filter Pipeline', description: 'Build custom image filter pipelines (blur, sharpen, color grade) using Canvas', inputModality: 'filter-spec', outputModality: 'filter-code', primitiveFunction: 'build-filters' },
        { useId: 'FIM-021-U3', name: 'Sprite Animation Engine', description: 'Create sprite sheet animations with frame management and playback control', inputModality: 'sprite-sheet + spec', outputModality: 'animation-code', primitiveFunction: 'animate-sprites' },
        { useId: 'FIM-021-U4', name: 'Chart Renderer', description: 'Custom high-performance Canvas-based chart rendering for large datasets', inputModality: 'data + chart-spec', outputModality: 'canvas-chart', primitiveFunction: 'render-chart-canvas' },
        { useId: 'FIM-021-U5', name: 'Pixel Manipulation Intelligence', description: 'Direct pixel manipulation for image processing, OCR prep, and effects', inputModality: 'image-data', outputModality: 'processed-image', primitiveFunction: 'manipulate-pixels' }
      ]
    });

    /* ── COMMUNICATION INTELLIGENCE (3) ─────────────────────────────── */

    this._register({
      modelId: 'FIM-022', technology: 'API Client Intelligence',
      category: 'Communication', intelligenceType: 'Request Intelligence',
      ringAffinity: 'Transport Ring', organismPlacement: 'Frontend organism / channel layer',
      multimodalFamily: 'Transport-Stream Family', autonomous: true,
      uses: [
        { useId: 'FIM-022-U1', name: 'API Client Generator', description: 'Generate type-safe API clients from OpenAPI/Swagger/GraphQL schemas', inputModality: 'api-schema', outputModality: 'client-code', primitiveFunction: 'generate-api-client' },
        { useId: 'FIM-022-U2', name: 'Request Retry Intelligence', description: 'Implement intelligent retry strategies with exponential backoff and circuit breaking', inputModality: 'endpoint-spec', outputModality: 'retry-code', primitiveFunction: 'design-retry' },
        { useId: 'FIM-022-U3', name: 'Response Cache Optimizer', description: 'Design optimal caching strategies (stale-while-revalidate, cache-first) per endpoint', inputModality: 'api-usage-analytics', outputModality: 'cache-strategy', primitiveFunction: 'optimize-response-cache' },
        { useId: 'FIM-022-U4', name: 'API Error Handler', description: 'Generate comprehensive error handling with user-friendly messages and recovery', inputModality: 'error-spec', outputModality: 'error-handler-code', primitiveFunction: 'handle-api-errors' },
        { useId: 'FIM-022-U5', name: 'Request Interceptor Designer', description: 'Design request/response interceptors for auth, logging, and transformation', inputModality: 'interceptor-spec', outputModality: 'interceptor-code', primitiveFunction: 'design-interceptors' }
      ]
    });

    this._register({
      modelId: 'FIM-023', technology: 'Real-Time Intelligence',
      category: 'Communication', intelligenceType: 'Stream Intelligence',
      ringAffinity: 'Transport Ring', organismPlacement: 'Frontend organism / channel layer',
      multimodalFamily: 'Transport-Stream Family', autonomous: true,
      uses: [
        { useId: 'FIM-023-U1', name: 'WebSocket Manager', description: 'Generate WebSocket connection managers with auto-reconnect and heartbeat', inputModality: 'ws-spec', outputModality: 'ws-client-code', primitiveFunction: 'manage-websocket' },
        { useId: 'FIM-023-U2', name: 'SSE Stream Processor', description: 'Process Server-Sent Events with buffering, parsing, and state synchronization', inputModality: 'sse-spec', outputModality: 'stream-processor', primitiveFunction: 'process-sse' },
        { useId: 'FIM-023-U3', name: 'WebRTC Peer Manager', description: 'Manage peer-to-peer connections for video, audio, and data channels', inputModality: 'peer-spec', outputModality: 'webrtc-code', primitiveFunction: 'manage-peers' },
        { useId: 'FIM-023-U4', name: 'Offline Sync Engine', description: 'Design offline-first sync strategies with conflict resolution', inputModality: 'data-model + sync-spec', outputModality: 'sync-engine-code', primitiveFunction: 'design-offline-sync' },
        { useId: 'FIM-023-U5', name: 'Event Stream Aggregator', description: 'Aggregate multiple real-time streams into unified event buses', inputModality: 'stream-sources', outputModality: 'aggregator-code', primitiveFunction: 'aggregate-streams' }
      ]
    });

    this._register({
      modelId: 'FIM-024', technology: 'GraphQL Intelligence',
      category: 'Communication', intelligenceType: 'Query Intelligence',
      ringAffinity: 'Transport Ring', organismPlacement: 'Frontend organism / channel layer',
      multimodalFamily: 'Transport-Stream Family', autonomous: true,
      uses: [
        { useId: 'FIM-024-U1', name: 'Schema Designer', description: 'Design GraphQL schemas from domain models and data requirements', inputModality: 'domain-model', outputModality: 'graphql-schema', primitiveFunction: 'design-schema' },
        { useId: 'FIM-024-U2', name: 'Query Optimizer', description: 'Optimize GraphQL queries to minimize over-fetching and N+1 problems', inputModality: 'query + schema', outputModality: 'optimized-query', primitiveFunction: 'optimize-query' },
        { useId: 'FIM-024-U3', name: 'Fragment Composer', description: 'Design reusable GraphQL fragments aligned to component data requirements', inputModality: 'component-tree + schema', outputModality: 'fragment-code', primitiveFunction: 'compose-fragments' },
        { useId: 'FIM-024-U4', name: 'Subscription Manager', description: 'Generate GraphQL subscription handlers with optimistic updates', inputModality: 'subscription-spec', outputModality: 'subscription-code', primitiveFunction: 'manage-subscriptions' },
        { useId: 'FIM-024-U5', name: 'Cache Normalization Advisor', description: 'Configure Apollo/urql cache normalization for optimal read/write patterns', inputModality: 'schema + queries', outputModality: 'cache-config', primitiveFunction: 'advise-cache-normalization' }
      ]
    });

    /* ── STORAGE INTELLIGENCE (3) ───────────────────────────────────── */

    this._register({
      modelId: 'FIM-025', technology: 'IndexedDB Intelligence',
      category: 'Storage', intelligenceType: 'Local Persistence Intelligence',
      ringAffinity: 'Persistence Ring', organismPlacement: 'Frontend organism / persistence layer',
      multimodalFamily: 'Persistence-Vault Family', autonomous: true,
      uses: [
        { useId: 'FIM-025-U1', name: 'Schema Migration Engine', description: 'Design and execute IndexedDB version migrations with data preservation', inputModality: 'old-schema + new-schema', outputModality: 'migration-code', primitiveFunction: 'migrate-idb' },
        { useId: 'FIM-025-U2', name: 'Query Builder', description: 'Build complex IndexedDB queries with index optimization and cursor management', inputModality: 'query-spec', outputModality: 'idb-query-code', primitiveFunction: 'build-idb-query' },
        { useId: 'FIM-025-U3', name: 'Storage Quota Manager', description: 'Monitor and manage storage quotas with intelligent eviction strategies', inputModality: 'storage-metrics', outputModality: 'eviction-plan', primitiveFunction: 'manage-quota' },
        { useId: 'FIM-025-U4', name: 'Encryption Layer', description: 'Add transparent encryption/decryption to IndexedDB operations', inputModality: 'data + key-spec', outputModality: 'encrypted-storage-code', primitiveFunction: 'encrypt-storage' },
        { useId: 'FIM-025-U5', name: 'Sync Adapter', description: 'Sync IndexedDB with remote databases using conflict-free replicated data types', inputModality: 'sync-spec', outputModality: 'crdt-sync-code', primitiveFunction: 'sync-idb' }
      ]
    });

    this._register({
      modelId: 'FIM-026', technology: 'Cache Intelligence',
      category: 'Storage', intelligenceType: 'Caching Strategy Intelligence',
      ringAffinity: 'Persistence Ring', organismPlacement: 'Frontend organism / persistence layer',
      multimodalFamily: 'Persistence-Vault Family', autonomous: true,
      uses: [
        { useId: 'FIM-026-U1', name: 'Service Worker Cache Designer', description: 'Design cache-first/network-first/stale-while-revalidate strategies per route', inputModality: 'route-map + spec', outputModality: 'sw-cache-code', primitiveFunction: 'design-sw-cache' },
        { useId: 'FIM-026-U2', name: 'Cache Invalidation Intelligence', description: 'Implement intelligent cache invalidation based on content hashing and versioning', inputModality: 'asset-manifest', outputModality: 'invalidation-strategy', primitiveFunction: 'invalidate-cache' },
        { useId: 'FIM-026-U3', name: 'Prefetch Predictor', description: 'Predict next navigation and prefetch assets using phi-weighted probability', inputModality: 'navigation-analytics', outputModality: 'prefetch-manifest', primitiveFunction: 'predict-prefetch' },
        { useId: 'FIM-026-U4', name: 'Multi-Layer Cache Orchestrator', description: 'Orchestrate memory → SW → CDN → origin cache layers with priority routing', inputModality: 'cache-topology', outputModality: 'orchestration-code', primitiveFunction: 'orchestrate-cache-layers' },
        { useId: 'FIM-026-U5', name: 'Offline Asset Manager', description: 'Manage offline-available asset sets with differential updates', inputModality: 'asset-spec', outputModality: 'offline-manifest', primitiveFunction: 'manage-offline-assets' }
      ]
    });

    this._register({
      modelId: 'FIM-027', technology: 'Auth Token Intelligence',
      category: 'Storage', intelligenceType: 'Credential Persistence Intelligence',
      ringAffinity: 'Persistence Ring', organismPlacement: 'Frontend organism / persistence layer',
      multimodalFamily: 'Persistence-Vault Family', autonomous: true,
      uses: [
        { useId: 'FIM-027-U1', name: 'Token Lifecycle Manager', description: 'Manage JWT/OAuth token refresh, rotation, and secure storage', inputModality: 'auth-spec', outputModality: 'token-manager-code', primitiveFunction: 'manage-tokens' },
        { useId: 'FIM-027-U2', name: 'Session Intelligence', description: 'Design session management with sliding windows, idle detection, and multi-tab sync', inputModality: 'session-spec', outputModality: 'session-code', primitiveFunction: 'manage-sessions' },
        { useId: 'FIM-027-U3', name: 'Secure Cookie Handler', description: 'Generate cookie management with HttpOnly, Secure, SameSite, and encryption', inputModality: 'cookie-spec', outputModality: 'cookie-handler-code', primitiveFunction: 'handle-cookies' },
        { useId: 'FIM-027-U4', name: 'PKCE Flow Generator', description: 'Generate OAuth 2.0 PKCE authorization flows for SPAs', inputModality: 'oauth-spec', outputModality: 'pkce-code', primitiveFunction: 'generate-pkce' },
        { useId: 'FIM-027-U5', name: 'Credential Vault', description: 'Manage Web Credentials API and WebAuthn passkey integration', inputModality: 'credential-spec', outputModality: 'vault-code', primitiveFunction: 'manage-credentials' }
      ]
    });

    /* ── WEB API INTELLIGENCE (3) ───────────────────────────────────── */

    this._register({
      modelId: 'FIM-028', technology: 'Service Worker Intelligence',
      category: 'Web API', intelligenceType: 'Background Process Intelligence',
      ringAffinity: 'Native Capability Ring', organismPlacement: 'Frontend organism / native runtime layer',
      multimodalFamily: 'Native-Browser Family', autonomous: true,
      uses: [
        { useId: 'FIM-028-U1', name: 'SW Lifecycle Manager', description: 'Generate service workers with proper install/activate/fetch lifecycle handling', inputModality: 'sw-spec', outputModality: 'sw-code', primitiveFunction: 'manage-sw-lifecycle' },
        { useId: 'FIM-028-U2', name: 'Push Notification Engine', description: 'Implement push notification subscription, delivery, and action handling', inputModality: 'notification-spec', outputModality: 'push-code', primitiveFunction: 'manage-push' },
        { useId: 'FIM-028-U3', name: 'Background Sync Orchestrator', description: 'Design background sync strategies for offline form submissions and queue processing', inputModality: 'sync-spec', outputModality: 'bg-sync-code', primitiveFunction: 'orchestrate-bg-sync' },
        { useId: 'FIM-028-U4', name: 'Workbox Config Generator', description: 'Generate Workbox configurations for precaching, routing, and strategies', inputModality: 'app-spec', outputModality: 'workbox-config', primitiveFunction: 'generate-workbox' },
        { useId: 'FIM-028-U5', name: 'PWA Manifest Intelligence', description: 'Generate and validate Web App Manifests with optimal PWA settings', inputModality: 'app-metadata', outputModality: 'manifest-json', primitiveFunction: 'generate-pwa-manifest' }
      ]
    });

    this._register({
      modelId: 'FIM-029', technology: 'Web Worker Intelligence',
      category: 'Web API', intelligenceType: 'Parallel Compute Intelligence',
      ringAffinity: 'Native Capability Ring', organismPlacement: 'Frontend organism / native runtime layer',
      multimodalFamily: 'Native-Browser Family', autonomous: true,
      uses: [
        { useId: 'FIM-029-U1', name: 'Worker Pool Manager', description: 'Create and manage pools of Web Workers for parallel task execution', inputModality: 'task-spec', outputModality: 'worker-pool-code', primitiveFunction: 'manage-worker-pool' },
        { useId: 'FIM-029-U2', name: 'Shared Worker Coordinator', description: 'Coordinate Shared Workers for multi-tab state synchronization', inputModality: 'sync-spec', outputModality: 'shared-worker-code', primitiveFunction: 'coordinate-shared-worker' },
        { useId: 'FIM-029-U3', name: 'Comlink Wrapper Generator', description: 'Generate Comlink-based worker wrappers for seamless async worker calls', inputModality: 'api-spec', outputModality: 'comlink-code', primitiveFunction: 'generate-comlink' },
        { useId: 'FIM-029-U4', name: 'Off-Main-Thread Advisor', description: 'Identify CPU-heavy operations and generate worker offloading strategies', inputModality: 'performance-trace', outputModality: 'offload-plan', primitiveFunction: 'advise-offloading' },
        { useId: 'FIM-029-U5', name: 'WASM Bridge Generator', description: 'Generate WebAssembly bridge code for high-performance worker computations', inputModality: 'wasm-module + api', outputModality: 'bridge-code', primitiveFunction: 'bridge-wasm' }
      ]
    });

    this._register({
      modelId: 'FIM-030', technology: 'Browser Sensor Intelligence',
      category: 'Web API', intelligenceType: 'Environment Sensing Intelligence',
      ringAffinity: 'Native Capability Ring', organismPlacement: 'Frontend organism / native runtime layer',
      multimodalFamily: 'Native-Browser Family', autonomous: true,
      uses: [
        { useId: 'FIM-030-U1', name: 'Geolocation Intelligence', description: 'Intelligent geolocation with geofencing, proximity alerts, and location-based content', inputModality: 'location-spec', outputModality: 'geo-code', primitiveFunction: 'sense-location' },
        { useId: 'FIM-030-U2', name: 'Device Motion Analyzer', description: 'Process accelerometer and gyroscope data for gesture recognition and motion UI', inputModality: 'sensor-stream', outputModality: 'gesture-events', primitiveFunction: 'analyze-motion' },
        { useId: 'FIM-030-U3', name: 'Media Capabilities Detector', description: 'Detect device capabilities and serve optimal media formats and resolutions', inputModality: 'device-query', outputModality: 'capability-profile', primitiveFunction: 'detect-capabilities' },
        { useId: 'FIM-030-U4', name: 'Network Quality Monitor', description: 'Monitor connection type, effective bandwidth, and adapt app behavior', inputModality: 'network-info', outputModality: 'quality-report', primitiveFunction: 'monitor-network' },
        { useId: 'FIM-030-U5', name: 'Battery & Performance Adapter', description: 'Adapt animations, fetching, and processing based on battery and CPU state', inputModality: 'device-state', outputModality: 'adaptation-config', primitiveFunction: 'adapt-resources' }
      ]
    });
  }

  /* ================================================================== */
  /*  Query Methods                                                      */
  /* ================================================================== */

  /**
   * Get a model by its ID.
   * @param {string} modelId — e.g. 'FIM-001'
   * @returns {FrontendModel|undefined}
   */
  getModel(modelId) {
    return this.models.get(modelId);
  }

  /**
   * Get all models as an array.
   * @returns {FrontendModel[]}
   */
  listModels() {
    return Array.from(this.models.values());
  }

  /**
   * Filter models by category.
   * @param {string} category — e.g. 'Markup', 'Styling', 'Framework'
   * @returns {FrontendModel[]}
   */
  getByCategory(category) {
    return this.listModels().filter(m => m.category === category);
  }

  /**
   * Filter models by organism ring.
   * @param {string} ring — e.g. 'Interface Ring'
   * @returns {FrontendModel[]}
   */
  getByRing(ring) {
    return this.listModels().filter(m => m.ringAffinity === ring);
  }

  /**
   * Filter models by multimodal family.
   * @param {string} family — e.g. 'Visual-Design Family'
   * @returns {FrontendModel[]}
   */
  getByFamily(family) {
    return this.listModels().filter(m => m.multimodalFamily === family);
  }

  /**
   * Get all intelligence uses across all models (150 total).
   * @returns {{ modelId: string, use: IntelligenceUse }[]}
   */
  listAllUses() {
    const result = [];
    for (const model of this.models.values()) {
      for (const use of model.uses) {
        result.push({ modelId: model.modelId, use });
      }
    }
    return result;
  }

  /**
   * Search uses by input or output modality.
   * @param {string} modality — substring to match
   * @returns {{ modelId: string, use: IntelligenceUse }[]}
   */
  findUsesByModality(modality) {
    const lower = modality.toLowerCase();
    return this.listAllUses().filter(
      entry =>
        entry.use.inputModality.toLowerCase().includes(lower) ||
        entry.use.outputModality.toLowerCase().includes(lower)
    );
  }

  /**
   * Total model count.
   * @returns {number}
   */
  get size() {
    return this.models.size;
  }
}

export { FrontendModelRegistry };
export default FrontendModelRegistry;
