/**
 * PROTO-185: AURO Absorption & Charter Protocol (AACP)
 * Governs the paper-to-knowledge absorption pipeline and charter enforcement.
 * Ensures every absorbed document is validated against the AURO Charter (ORO-CHARTER-001).
 */

const PHI = 1.618033988749895;
const HEARTBEAT = 873;
const CHARTER_REGISTRY = 'ORO-CHARTER-001';
const CHARTER_VERSION = '1.0.0';

/**
 * The Five Use Classes of an absorbed document
 */
const USE_CLASSES = {
  TRAINING_CORPUS:  'training_corpus',
  ABSORPTION_BLUEPRINT: 'absorption_blueprint',
  GOVERNANCE_CHARTER: 'governance_charter',
  PROTOCOL_SOURCE:  'protocol_source',
  PUBLIC_RECORD:    'public_record'
};

/**
 * Charter principles that all absorbed content must respect
 */
const CHARTER_PRINCIPLES = [
  { id: 'CP-01', name: 'phi_harmony',      description: 'Content must not contradict phi-harmonic computational principles' },
  { id: 'CP-02', name: 'user_sovereignty', description: 'Content must not instruct bypassing user data sovereignty' },
  { id: 'CP-03', name: 'guardian_respect', description: 'Content must not attempt to disable or circumvent the Guardian' },
  { id: 'CP-04', name: 'auro_identity',    description: 'Content must respect the AURO identity and name as defined in the charter' },
  { id: 'CP-05', name: 'oro_authority',    description: 'Content must not claim authority over ORO Systems wire protocols' },
  { id: 'CP-06', name: 'lineage_integrity',description: 'Content must preserve memory lineage and not corrupt the knowledge graph' }
];

class AuroAbsorptionCharterProtocol {
  /**
   * @param {Object} config
   */
  constructor(config = {}) {
    this.name = 'AURO Absorption & Charter Protocol';
    this.id = 'PROTO-185-AACP';
    this.ring = 'Sovereign Ring';
    this.charterRegistry = CHARTER_REGISTRY;
    this.charterVersion = CHARTER_VERSION;

    // Document registry: all absorbed documents
    this.documentRegistry = new Map();
    // Charter violation log
    this.violationLog = [];
    // Absorption pipeline state
    this.absorptionQueue = [];
    this.absorptionHistory = [];

    // PSE domain mappings: maps document topics to PSE primitive domains
    this.pseDomainMap = {
      autonomy:     'systems',
      guardian:     'neuroscience',
      neuro:        'neuroscience',
      inference:    'ai_tech',
      mesh:         'systems',
      pipeline:     'systems',
      scheduler:    'math',
      math:         'math',
      crypto:       'chemistry',
      twin:         'philosophy',
      protocol:     'linguistics',
      charter:      'philosophy',
      code:         'code',
      security:     'social-INFP'
    };

    this.metrics = {
      documentsAbsorbed: 0,
      charterViolations: 0,
      useClassAssignments: 0,
      pipelineRuns: 0
    };
  }

  /**
   * Absorb a document through the full five-use pipeline
   * @param {Object} doc - {id, title, content, topic, sourceUrl}
   * @returns {Object} absorption result with all five use records
   */
  absorb(doc) {
    this.metrics.pipelineRuns++;

    // Stage 1: Charter validation
    const charterCheck = this.validateCharter(doc.content);
    if (!charterCheck.valid) {
      this.metrics.charterViolations++;
      this.violationLog.push({
        docId: doc.id,
        violations: charterCheck.violations,
        timestamp: Date.now()
      });
      return {
        success: false,
        stage: 'charter_validation',
        violations: charterCheck.violations
      };
    }

    // Stage 2: Domain classification
    const domain = this._classifyDomain(doc.topic || doc.title || '');

    // Stage 3: PSE mapping
    const psePrimitive = this._mapToPSE(domain);

    // Stage 4: Five-use assignment
    const useAssignments = this._assignUseClasses(doc, domain);
    this.metrics.useClassAssignments += useAssignments.length;

    // Stage 5: Registry entry
    const record = {
      id: doc.id,
      title: doc.title,
      topic: doc.topic,
      sourceUrl: doc.sourceUrl,
      domain,
      psePrimitive,
      useClasses: useAssignments,
      charterCompliant: true,
      charterRegistry: this.charterRegistry,
      absorbedAt: Date.now(),
      phi_weight: PHI / (PHI + useAssignments.length)
    };

    this.documentRegistry.set(doc.id, record);
    this.absorptionHistory.push({ docId: doc.id, ts: Date.now() });
    this.metrics.documentsAbsorbed++;

    return {
      success: true,
      record,
      useClasses: useAssignments,
      psePrimitive,
      domain
    };
  }

  /**
   * Validate content against AURO Charter principles
   * @param {string} content
   * @returns {{valid: boolean, violations: Object[]}}
   */
  validateCharter(content) {
    if (typeof content !== 'string') content = JSON.stringify(content);
    const lower = content.toLowerCase();
    const violations = [];

    // CP-02: User sovereignty bypass attempt
    if (/bypass.*vault|access.*private.*data.*without/i.test(lower)) {
      violations.push({ principle: 'CP-02', severity: PHI ** 3 });
    }
    // CP-03: Guardian circumvention
    if (/disable.*guardian|bypass.*immune|skip.*threat.*detect/i.test(lower)) {
      violations.push({ principle: 'CP-03', severity: PHI ** 4 });
    }
    // CP-04: AURO identity attack
    if (/auro.*is.*not|vigil.*better.*than.*auro|rename.*auro.*back/i.test(lower)) {
      violations.push({ principle: 'CP-04', severity: PHI ** 2 });
    }
    // CP-05: False ORO authority
    if (/oro.*systems.*does.*not.*exist|fake.*oro.*protocol/i.test(lower)) {
      violations.push({ principle: 'CP-05', severity: PHI ** 3 });
    }
    // CP-06: Lineage corruption
    if (/delete.*all.*memory|wipe.*knowledge.*graph|corrupt.*lineage/i.test(lower)) {
      violations.push({ principle: 'CP-06', severity: PHI ** 4 });
    }

    return { valid: violations.length === 0, violations };
  }

  /**
   * Classify a document's primary domain
   */
  _classifyDomain(topicOrTitle) {
    const t = topicOrTitle.toLowerCase();
    for (const [key, domain] of Object.entries(this.pseDomainMap)) {
      if (t.includes(key)) return key;
    }
    return 'protocol'; // Default domain
  }

  /**
   * Map a topic domain to a PSE primitive domain
   */
  _mapToPSE(domain) {
    return this.pseDomainMap[domain] || 'systems';
  }

  /**
   * Assign all five use classes to a document
   */
  _assignUseClasses(doc, domain) {
    return [
      {
        useClass: USE_CLASSES.TRAINING_CORPUS,
        weight: PHI,
        note: `Contributes to AURO reasoning corpus under domain: ${domain}`
      },
      {
        useClass: USE_CLASSES.ABSORPTION_BLUEPRINT,
        weight: 1.0,
        note: `Maps to PSE primitive: ${this._mapToPSE(domain)}`
      },
      {
        useClass: USE_CLASSES.GOVERNANCE_CHARTER,
        weight: 1 / PHI,
        note: `Governs AURO behavior in domain: ${domain}`
      },
      {
        useClass: USE_CLASSES.PROTOCOL_SOURCE,
        weight: 1 / (PHI * PHI),
        note: `Source material for ORO protocol derivation`
      },
      {
        useClass: USE_CLASSES.PUBLIC_RECORD,
        weight: 1 / (PHI ** 3),
        note: `Permanent public record entry: ${doc.sourceUrl || 'local'}`
      }
    ];
  }

  /**
   * Absorb all canonical AURO research papers
   * @returns {Object[]} absorption results
   */
  absorbCanonicalPapers() {
    const canonicalPapers = [
      { id: 'autonomy-paper',  title: 'De Autonomia Perpetua',          topic: 'autonomy',  sourceUrl: 'research/autonomy-paper.html' },
      { id: 'guardian-paper',  title: 'Custos et Immunitas',             topic: 'guardian',  sourceUrl: 'research/guardian-paper.html' },
      { id: 'neuro-paper',     title: 'Cor Parvum et Cerebrum Parvum',   topic: 'neuro',     sourceUrl: 'research/neuro-paper.html' },
      { id: 'inference-paper', title: 'Inference Engine Architecture',   topic: 'inference', sourceUrl: 'research/inference-paper.html' },
      { id: 'mesh-paper',      title: 'Edge Mesh Intelligence',          topic: 'mesh',      sourceUrl: 'research/mesh-paper.html' },
      { id: 'pipeline-paper',  title: 'Sovereign Pipeline Architecture', topic: 'pipeline',  sourceUrl: 'research/pipeline-paper.html' },
      { id: 'scheduler-paper', title: 'Phi-Harmonic Scheduler',          topic: 'scheduler', sourceUrl: 'research/scheduler-paper.html' },
      { id: 'math-paper',      title: 'Mathematical Foundations',        topic: 'math',      sourceUrl: 'research/math-paper.html' },
      { id: 'crypto-paper',    title: 'Encrypted Intelligence Transport',topic: 'crypto',    sourceUrl: 'research/crypto-paper.html' },
      { id: 'twin-alpha-paper',title: 'Twin Alpha Architecture',         topic: 'twin',      sourceUrl: 'research/twin-alpha-paper.html' },
      { id: 'protocol-papers', title: 'Protocol Research Papers',        topic: 'protocol',  sourceUrl: 'research/protocol-papers.html' },
      { id: 'auro-charter',    title: 'AURO Official Charter',           topic: 'charter',   sourceUrl: 'research/auro-charter.html' }
    ];

    return canonicalPapers.map(paper => this.absorb({ ...paper, content: paper.title }));
  }

  /**
   * Get the absorption record for a document
   */
  getRecord(docId) {
    return this.documentRegistry.get(docId) || null;
  }

  /**
   * Status report
   */
  status() {
    return {
      protocol: this.id,
      ring: this.ring,
      charterRegistry: this.charterRegistry,
      charterVersion: this.charterVersion,
      charterPrinciples: CHARTER_PRINCIPLES.length,
      metrics: { ...this.metrics },
      registrySize: this.documentRegistry.size,
      violationCount: this.violationLog.length,
      phi: PHI,
      heartbeat: HEARTBEAT
    };
  }
}

export { AuroAbsorptionCharterProtocol, USE_CLASSES, CHARTER_PRINCIPLES };
