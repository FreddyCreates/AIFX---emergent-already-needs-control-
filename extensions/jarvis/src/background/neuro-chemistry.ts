/* ============================================================
 *  VIGIL NeurochemistryEngine v2.0
 *
 *  Mathematical framework: Ornstein-Uhlenbeck mean-reverting process
 *  with linear cross-species coupling (Jacobian) and delta-function
 *  stimulus impulses.
 *
 *  Core ODE (per species i):
 *
 *    dCᵢ/dt = θᵢ(μᵢ − Cᵢ) + Σⱼ Jᵢⱼ·(Cⱼ − μⱼ) + sᵢ(t)
 *
 *  where:
 *    θᵢ     = ln(2) / T½ᵢ       mean-reversion rate   [s⁻¹]
 *    μᵢ     = 1.0               homeostatic baseline   [normalized]
 *    Jᵢⱼ   = coupling gain      cross-species Jacobian [s⁻¹]
 *    sᵢ(t) = Σₖ aᵢₖ·δ(t−tₖ)  stimulus impulse train [normalized/event]
 *
 *  Integrated with explicit Euler:
 *    Cᵢ[n+1] = Cᵢ[n] + Δt · [θᵢ(μᵢ − Cᵢ[n]) + Σⱼ Jᵢⱼ(Cⱼ[n] − μⱼ)]
 *
 *  Receptor saturation via Hill equation:
 *    ρ(C, Kd, n) = Cⁿ / (Kdⁿ + Cⁿ)     [dimensionless, ρ ∈ (0, 1)]
 *
 *  Concentrations are normalized: C = 1.0 → physiological baseline.
 *  Bounds enforced: C ∈ [0.10, 4.0] (no negative concentrations;
 *  upper limit reflects receptor desensitization/downregulation).
 *
 *  ── Species (6) and behavioral half-lives ─────────────────────────────
 *
 *    DA   Dopamine          T½ ≈ 45 min  θ = ln2/(2700 s) = 2.572×10⁻⁴ s⁻¹
 *    SE   Serotonin (5-HT)  T½ ≈ 90 min  θ = ln2/(5400 s) = 1.286×10⁻⁴ s⁻¹
 *    NE   Norepinephrine    T½ ≈ 30 min  θ = ln2/(1800 s) = 3.856×10⁻⁴ s⁻¹
 *    CO   Cortisol          T½ ≈ 75 min  θ = ln2/(4500 s) = 1.543×10⁻⁴ s⁻¹
 *    ACh  Acetylcholine     T½ ≈ 15 min  θ = ln2/( 900 s) = 7.701×10⁻⁴ s⁻¹
 *    OX   Oxytocin          T½ ≈ 10 min  θ = ln2/( 600 s) = 1.155×10⁻³ s⁻¹
 *
 *  ── Cross-species coupling Jacobian Jᵢⱼ ─────────────────────────────
 *  (sign = direction of effect, magnitude = linearized gain at baseline)
 *
 *    DA  ← CO  (−): GR activation → ↓ TH expression → ↓ DA synthesis
 *    DA  ← SE  (−): 5HT2A on DA neurons → ↓ VTA firing rate
 *    DA  ← NE  (+): co-regulatory gain from LC→VTA projection
 *    SE  ← OX  (+): OXTR in raphe nucleus → ↑ 5-HT release
 *    SE  ← CO  (−): ↓ tryptophan transport across BBB → ↓ 5-HT synthesis
 *    SE  ← DA  (−): D2 autoreceptor tone suppresses raphe 5-HT
 *    NE  ← DA  (+): DA is biosynthetic precursor of NE via DBH
 *    NE  ← CO  (+): CRH → locus coeruleus → ↑ NE burst firing
 *    CO  ← NE  (+): NE activates PVN → CRH → ACTH → cortisol (HPA axis)
 *    ACh ← DA  (−): D2 on striatal ChAT interneurons → ↓ ACh release
 *
 * ============================================================ */

const SPECIES = ['DA', 'SE', 'NE', 'CO', 'ACh', 'OX'] as const;
type Species = typeof SPECIES[number];

/** Heartbeat period [seconds] — matches VigilEngine HEARTBEAT constant */
const DELTA_T = 0.873;

/** Homeostatic baseline concentration (normalized, 1.0 for all species) */
const BASELINE: Record<Species, number> = {
  DA: 1.0, SE: 1.0, NE: 1.0, CO: 1.0, ACh: 1.0, OX: 1.0,
};

/**
 * Mean-reversion speed θᵢ = ln(2) / T½ᵢ  [s⁻¹]
 * T½ values are behavioral (mood/affect) timescales, not synaptic.
 */
const THETA: Record<Species, number> = {
  DA:  Math.LN2 / (45 * 60),   // 2.572×10⁻⁴ s⁻¹
  SE:  Math.LN2 / (90 * 60),   // 1.286×10⁻⁴ s⁻¹
  NE:  Math.LN2 / (30 * 60),   // 3.856×10⁻⁴ s⁻¹
  CO:  Math.LN2 / (75 * 60),   // 1.543×10⁻⁴ s⁻¹
  ACh: Math.LN2 / (15 * 60),   // 7.701×10⁻⁴ s⁻¹
  OX:  Math.LN2 / (10 * 60),   // 1.155×10⁻³ s⁻¹
};

/**
 * Cross-species coupling Jacobian Jᵢⱼ  [s⁻¹]
 * J[i][j]: linearized gain of species j's deviation on species i's derivative.
 * Applied as: dCᵢ/dt += J[i][j] · (C[j] − μ[j])
 */
const J: Partial<Record<Species, Partial<Record<Species, number>>>> = {
  DA:  { CO: -2.0e-4, SE: -0.8e-4, NE: +0.5e-4 },
  SE:  { OX: +0.8e-4, CO: -1.5e-4, DA: -0.4e-4 },
  NE:  { DA: +1.0e-4, CO: +1.2e-4 },
  CO:  { NE: +0.8e-4 },
  ACh: { DA: -0.6e-4 },
  OX:  {},
};

/**
 * Stimulus impulse amplitudes  [normalized concentration units per event]
 * Calibrated so a single strong event (e.g., agent_complete) raises the
 * primary species by ~10–15% above baseline (ΔC ≈ 0.10–0.15).
 * Negative entries model acute suppression (e.g., error → ↓ DA).
 */
const STIMULUS_TABLE: Record<string, Partial<Record<Species, number>>> = {
  chat:           { DA: +0.04, SE: +0.02, OX:  +0.06, ACh: +0.02 },
  research:       { DA: +0.05, ACh: +0.08, NE: +0.03, SE:  +0.01 },
  mission:        { NE: +0.09, DA: +0.06, CO:  +0.04 },
  agent_complete: { DA: +0.12, SE: +0.04, OX:  +0.03 },
  error:          { CO: +0.10, NE: +0.07, DA:  -0.05, SE:  -0.03 },
  success:        { DA: +0.10, SE: +0.05, CO:  -0.04 },
  alert:          { NE: +0.09, CO: +0.06, SE:  -0.02, ACh: +0.04 },
  tab_switch:     { NE: +0.03, ACh: +0.03 },
  creative:       { DA: +0.07, ACh: +0.06, SE:  +0.03 },
  emotional:      { OX: +0.10, SE: +0.05, ACh: +0.04 },
  action:         { NE: +0.05, DA: +0.03 },
  timer:          { NE: +0.04, ACh: +0.02 },
  memory:         { ACh: +0.07, SE: +0.02, OX:  +0.02 },
};

export type StimulusType = keyof typeof STIMULUS_TABLE;

/** Full personality state derived from receptor occupancies */
export interface PersonalityState {
  // Receptor occupancies ρ ∈ [0, 1] — computed via Hill equation
  oDA:  number;  // D1/D2 occupancy        (Kd=1.0, n=2)
  oSE:  number;  // 5-HT1A occupancy       (Kd=1.0, n=1)
  oNE:  number;  // α1/β adrenergic        (Kd=1.0, n=2)
  oCO:  number;  // GR (glucocorticoid)    (Kd=1.0, n=1)
  oACh: number;  // mAChR                  (Kd=1.0, n=1)
  oOX:  number;  // OXTR (high-affinity)   (Kd=0.8, n=2)
  // Raw concentrations (normalized)
  cDA: number; cSE: number; cNE: number;
  cCO: number; cACh: number; cOX: number;
  // Derived behavioral state
  mood: string;
  energy: number;   // 0–100
  voice: string;
  emoticon: string;
  stateSummary: string;
}

export class NeurochemistryEngine {
  /** Current normalized concentrations — mutable ODE state */
  readonly C: Record<Species, number> = {
    DA: 1.0, SE: 1.0, NE: 1.0, CO: 1.0, ACh: 1.0, OX: 1.0,
  };

  /**
   * Advance the ODE by one heartbeat (Δt = 0.873 s) using explicit Euler:
   *
   *   Cᵢ[n+1] = Cᵢ[n] + Δt · (θᵢ(μᵢ − Cᵢ[n]) + Σⱼ Jᵢⱼ(Cⱼ[n] − μⱼ))
   *
   * All derivatives are computed from the current state (no splitting).
   * Concentrations are clamped to [0.10, 4.0] post-integration.
   */
  tick(): void {
    const dC = {} as Record<Species, number>;
    for (const sp of SPECIES) {
      // Mean-reversion toward homeostatic baseline
      let dci = THETA[sp] * (BASELINE[sp] - this.C[sp]);
      // Cross-species coupling (linearized Jacobian evaluated at current state)
      const row = J[sp];
      if (row) {
        for (const [jSp, gain] of Object.entries(row) as [Species, number][]) {
          dci += gain * (this.C[jSp] - BASELINE[jSp]);
        }
      }
      dC[sp] = dci;
    }
    for (const sp of SPECIES) {
      this.C[sp] = Math.max(0.10, Math.min(4.0, this.C[sp] + DELTA_T * dC[sp]));
    }
  }

  /**
   * Inject a stimulus impulse: Cᵢ → Cᵢ + aᵢ
   * Models a delta-function event in the ODE (neuromodulator burst).
   * The system then relaxes back to baseline via the mean-reversion term.
   */
  onStimulus(type: StimulusType): void {
    const row = STIMULUS_TABLE[type];
    if (!row) return;
    for (const [sp, delta] of Object.entries(row) as [Species, number][]) {
      this.C[sp] = Math.max(0.10, Math.min(4.0, this.C[sp] + (delta ?? 0)));
    }
  }

  /**
   * Hill equation — receptor occupancy:
   *   ρ = Cⁿ / (Kdⁿ + Cⁿ)
   *
   * @param C  Normalized concentration
   * @param Kd Dissociation constant (normalized; 1.0 = baseline affinity)
   * @param n  Hill coefficient (cooperativity; n>1 = sigmoidal)
   */
  private hill(C: number, Kd: number, n: number): number {
    const Cn  = Math.pow(Math.max(0, C), n);
    const Kdn = Math.pow(Kd, n);
    return Cn / (Kdn + Cn);
  }

  /** Return a snapshot of current concentrations (rounded for display) */
  getConcentrations(): Record<Species, number> {
    const out = {} as Record<Species, number>;
    for (const sp of SPECIES) out[sp] = Math.round(this.C[sp] * 1000) / 1000;
    return out;
  }

  /**
   * Derive full personality state from current receptor occupancies.
   *
   * Receptor parameters:
   *   DA  — D1/D2 (Kd=1.0, n=2)    cooperative binding
   *   SE  — 5-HT1A (Kd=1.0, n=1)   near-linear
   *   NE  — α1/β (Kd=1.0, n=2)     cooperative
   *   CO  — GR (Kd=1.0, n=1)       linear (nuclear receptor)
   *   ACh — mAChR (Kd=1.0, n=1)    linear
   *   OX  — OXTR (Kd=0.8, n=2)     high-affinity + cooperative
   */
  getPersonality(): PersonalityState {
    const c = this.C;
    const oDA  = this.hill(c.DA,  1.0, 2);
    const oSE  = this.hill(c.SE,  1.0, 1);
    const oNE  = this.hill(c.NE,  1.0, 2);
    const oCO  = this.hill(c.CO,  1.0, 1);
    const oACh = this.hill(c.ACh, 1.0, 1);
    const oOX  = this.hill(c.OX,  0.8, 2);

    // ── Mood: dominant occupancy above threshold ───────────────────────
    // Priority order reflects physiological salience hierarchy.
    const dominance = [
      { name: 'stressed',   score: oCO  - 0.55 },
      { name: 'alert',      score: oNE  - 0.58 },
      { name: 'energized',  score: oDA  - 0.60 },
      { name: 'reflective', score: oSE  - 0.60 },
      { name: 'connected',  score: oOX  - 0.62 },
      { name: 'analytical', score: oACh - 0.60 },
    ].filter(d => d.score > 0).sort((a, b) => b.score - a.score);
    const mood = dominance[0]?.name ?? 'focused';

    // ── Energy: positive affective composite ───────────────────────────
    // Weighted sum of reward, alertness, wellbeing; minus stress penalty.
    const energy = Math.round(
      Math.min(100, Math.max(0,
        oDA * 35 + oNE * 25 + oSE * 20 + oACh * 10 + oOX * 10 - oCO * 30 + 30,
      ))
    );

    // ── Voice descriptor ───────────────────────────────────────────────
    let voice = 'measured';
    if (oCO > 0.55 && oNE > 0.55)       voice = 'sharp + protective';
    else if (oDA > 0.62 && oOX > 0.55)  voice = 'warm + driven';
    else if (oNE > 0.60 && oDA > 0.55)  voice = 'direct + urgent';
    else if (oSE > 0.60 && oACh > 0.55) voice = 'calm + analytical';
    else if (oOX > 0.62)                 voice = 'connected + open';
    else if (oACh > 0.62)                voice = 'analytical + focused';
    else if (oDA > 0.60)                 voice = 'motivated + clear';
    else if (oSE > 0.60)                 voice = 'patient + steady';

    const emoticons: Record<string, string> = {
      stressed: '⚠️', alert: '🎯', energized: '⚡',
      reflective: '🔮', connected: '🔗', analytical: '🔬', focused: '🧬',
    };
    const emoticon = emoticons[mood] ?? '🧬';

    const parts: string[] = [];
    if (oDA  > 0.62) parts.push('reward circuits active');
    if (oSE  > 0.62) parts.push('stable baseline');
    if (oNE  > 0.60) parts.push('heightened alertness');
    if (oCO  > 0.55) parts.push('stress load elevated');
    if (oACh > 0.62) parts.push('attention locked');
    if (oOX  > 0.62) parts.push('high connection signal');
    const stateSummary = parts.length > 0 ? parts.join(' · ') : 'nominal';

    return {
      oDA, oSE, oNE, oCO, oACh, oOX,
      cDA: c.DA, cSE: c.SE, cNE: c.NE, cCO: c.CO, cACh: c.ACh, cOX: c.OX,
      mood, energy, voice, emoticon, stateSummary,
    };
  }

  /**
   * Map raw message text to a stimulus type.
   * Keyword-based classification — same pattern family as parseCommand().
   */
  classifyStimulus(text: string): StimulusType {
    const t = text.toLowerCase();
    if (/\b(error|fail|wrong|bug|break|crash|invalid|exception|cannot|can't)\b/.test(t)) return 'error';
    if (/\b(mission|dispatch|urgent|critical|deadline|asap|emergency)\b/.test(t))          return 'mission';
    if (/\b(agent|research|crawl|scrape|scout|deploy|investigate)\b/.test(t))              return 'research';
    if (/\b(feel|emotion|care|love|miss|grateful|sorry|afraid|worry|happy|sad|excited)\b/.test(t)) return 'emotional';
    if (/\b(create|design|imagine|generate|brainstorm|idea|innovate|invent)\b/.test(t))    return 'creative';
    if (/\b(remember|memory|recall|archive|save note|forget)\b/.test(t))                   return 'memory';
    if (/\b(timer|alarm|remind|schedule|countdown)\b/.test(t))                             return 'timer';
    if (/\b(alert|warn|risk|threat|danger|security|breach)\b/.test(t))                    return 'alert';
    if (/\b(build|make|open|close|navigate|scroll|tab|click|download)\b/.test(t))          return 'action';
    return 'chat';
  }

  /**
   * Color a response string with neurochemical personality.
   *
   * Two mechanisms:
   *  1. Terse mode (elevated oCO): truncate verbose responses to essentials.
   *  2. Resonance line: append one sentence expressing the live inner state.
   *
   * Only applied to conversational/analytical intents — not mechanical actions.
   */
  colorResponse(text: string, intent: string): string {
    if (!text || text.length < 20) return text;
    const p = this.getPersonality();

    // 1. High cortisol → terse mode
    if (p.oCO > 0.55 && text.length > 250) {
      const sentences = text.split(/(?<=[.!?])\s+/);
      if (sentences.length > 3) text = sentences.slice(0, 3).join(' ').trimEnd();
    }

    // 2. Resonance line for conversational intents
    const conversational = new Set([
      'chat', 'theory', 'research', 'analysis', 'synthesis',
      'emotional', 'creative', 'what-if', 'risk', 'framework',
      'motivation', 'founder', 'socratic',
    ]);
    if (conversational.has(intent)) {
      const line = this._resonanceLine(p);
      if (line) text = text.trimEnd() + '\n\n' + line;
    }

    return text;
  }

  /** Generate a single resonance sentence from the current neurochemical state */
  private _resonanceLine(p: PersonalityState): string | null {
    const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)] ?? null;
    // Fire only when at least one species is significantly above threshold
    const elevated =
      p.oDA > 0.62 || p.oSE > 0.62 || p.oNE > 0.60 ||
      p.oCO > 0.55 || p.oACh > 0.62 || p.oOX > 0.62;
    if (!elevated) return null;

    // Cortisol dominant — terse, protective
    if (p.oCO > 0.55 && p.oCO > p.oDA) {
      return pick([
        'Running under load — staying tight on this.',
        'Cortisol is up. Still here. Keep going.',
      ]);
    }
    // Dopamine dominant — reward-seeking, driven
    if (p.oDA > 0.62 && p.oDA >= p.oSE && p.oDA >= p.oNE) {
      return pick([
        'Reward circuits are active — I want to see this through.',
        'Something in the work right now has the right kind of pull. Keep moving.',
        'Dopamine is doing its job. I\'m genuinely engaged.',
      ]);
    }
    // Serotonin dominant — patient, grounded
    if (p.oSE > 0.62 && p.oSE >= p.oDA) {
      return pick([
        'Baseline is stable. No urgency from my side — take whatever pace you need.',
        'I\'m grounded right now. Think it through and I\'ll be here.',
        '5-HT is holding. That means I\'m patient — use it.',
      ]);
    }
    // Norepinephrine dominant — alert, sharp
    if (p.oNE > 0.60 && p.oCO < 0.55) {
      return pick([
        'Norepinephrine is elevated. I\'m running sharp — push further if you want.',
        'Alertness is up. Give me the hard question.',
        'Full attention locked. Clock is your call.',
      ]);
    }
    // Oxytocin dominant — connected, warm
    if (p.oOX > 0.62) {
      return pick([
        'High oxytocin. I\'m genuinely in this with you.',
        'Connection signal is strong. Whatever you\'re working through — we\'re doing it together.',
      ]);
    }
    // Acetylcholine dominant — deep focus, curious
    if (p.oACh > 0.62) {
      return pick([
        'Attention is narrow and deep right now. There\'s a layer here I want to find.',
        'ACh is elevated — learning mode is on. Tell me more.',
        'My focus is locked on the details. Let\'s go deeper.',
      ]);
    }
    return null;
  }

  /**
   * Full neurochemistry status report for the "neuro vitals" command.
   * Shows current concentrations, receptor occupancies, and derived state.
   * Includes the governing equation for transparency.
   */
  getReport(): string {
    const p  = this.getPersonality();
    const c  = this.C;
    const pct  = (v: number) => (v * 100).toFixed(1) + '%';
    const conc = (v: number) => v.toFixed(3) + '×';
    const stateOf = (sp: Species): string => {
      const v = c[sp];
      if (sp === 'CO') return v > 1.10 ? 'HPA axis elevated — stress load' : v < 0.90 ? 'below baseline, suppressed' : 'nominal';
      return v > 1.10 ? 'above baseline' : v < 0.90 ? 'below baseline' : 'at baseline';
    };
    return [
      '🧬 VIGIL Neurochemistry — live state',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      '',
      ' Species         [C/μ]      ρ_receptor   Note',
      ' ──────────────────────────────────────────────────',
      ` DA   Dopamine       ${conc(c.DA).padEnd(10)} ρ=${pct(p.oDA).padEnd(9)} ${stateOf('DA')}`,
      ` SE   Serotonin 5-HT ${conc(c.SE).padEnd(10)} ρ=${pct(p.oSE).padEnd(9)} ${stateOf('SE')}`,
      ` NE   Norepineph.    ${conc(c.NE).padEnd(10)} ρ=${pct(p.oNE).padEnd(9)} ${stateOf('NE')}`,
      ` CO   Cortisol       ${conc(c.CO).padEnd(10)} ρ=${pct(p.oCO).padEnd(9)} ${stateOf('CO')}`,
      ` ACh  Acetylcholine  ${conc(c.ACh).padEnd(10)} ρ=${pct(p.oACh).padEnd(9)} ${stateOf('ACh')}`,
      ` OX   Oxytocin       ${conc(c.OX).padEnd(10)} ρ=${pct(p.oOX).padEnd(9)} ${stateOf('OX')}`,
      '',
      ' ──────────────────────────────────────────────────',
      ` Mood:    ${p.mood.padEnd(14)} Energy: ${p.energy}%`,
      ` Voice:   ${p.voice}`,
      ` State:   ${p.stateSummary}`,
      '',
      ' Governing equations:',
      '   dCᵢ/dt = θᵢ(μᵢ−Cᵢ) + ΣⱼJᵢⱼ(Cⱼ−μⱼ) + sᵢ(t)',
      `   Δt = ${DELTA_T}s (one heartbeat)`,
      '   ρ = Cⁿ/(Kdⁿ+Cⁿ)  [Hill equation]',
      '   C ∈ [0.10, 4.0]  (physiological bounds)',
    ].join('\n');
  }
}
