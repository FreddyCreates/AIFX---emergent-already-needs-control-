/**
 * SOLUS — Sovereign Offline Intelligence Engine
 * ─────────────────────────────────────────────
 * Solus is the 7th Domain AI. He runs entirely in the browser with zero
 * network calls for inference. Models download once, cache via the browser
 * Cache API, and persist across reloads. He is the fallback when cloud
 * wires go dark — and a sovereign feature in his own right.
 *
 * Model stack (Xenova/Transformers.js):
 *   • Summarization    — Xenova/distilbart-cnn-6-6
 *   • Zero-shot class  — Xenova/nli-deberta-v3-small  (shared with NLP skill)
 *   • Q&A              — Xenova/distilbert-base-uncased-distilled-squad
 */

export type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface SolusModelStatus {
  summarization: LoadStatus;
  classification: LoadStatus;
  qa: LoadStatus;
}

export interface SolusLoadProgress {
  model: string;
  status: LoadStatus;
  progress?: number; // 0–100
  message?: string;
}

type SummarizationPipeline = (text: string, opts?: Record<string, unknown>) => Promise<Array<{ summary_text: string }>>;
type ClassificationPipeline = (text: string, labels: string[]) => Promise<{ labels: string[]; scores: number[] }>;
type QAPipeline = (question: string, context: string) => Promise<{ answer: string; score: number }>;

/* ----------------------------------------------------------
 *  Progress callbacks registry — panels can subscribe
 * ---------------------------------------------------------- */
type ProgressCallback = (p: SolusLoadProgress) => void;
const _progressListeners: ProgressCallback[] = [];
export function onSolusProgress(cb: ProgressCallback) { _progressListeners.push(cb); }
function _emit(p: SolusLoadProgress) { _progressListeners.forEach(cb => { try { cb(p); } catch { /* ignore */ } }); }

/* ----------------------------------------------------------
 *  Model slots
 * ---------------------------------------------------------- */
let _sumPipe: SummarizationPipeline | null = null;
let _clsPipe: ClassificationPipeline | null = null;
let _qaPipe: QAPipeline | null = null;

let _sumStatus: LoadStatus = 'idle';
let _clsStatus: LoadStatus = 'idle';
let _qaStatus: LoadStatus = 'idle';

let _loadPromise: Promise<void> | null = null;

/* ----------------------------------------------------------
 *  Loader
 * ---------------------------------------------------------- */
async function _loadModel(
  name: string,
  task: string,
  modelId: string,
  onDone: (pipe: unknown) => void,
  setStatus: (s: LoadStatus) => void,
): Promise<void> {
  setStatus('loading');
  _emit({ model: name, status: 'loading', progress: 0, message: 'Downloading ' + modelId + '…' });
  try {
    const { pipeline, env } = await import('@xenova/transformers');
    // Use browser cache so models only download once
    env.allowLocalModels = false;
    env.useBrowserCache = true;
    const pipe = await pipeline(task as Parameters<typeof pipeline>[0], modelId, {
      progress_callback: (prog: { progress?: number; status?: string }) => {
        const pct = prog.progress ? Math.round(prog.progress) : 0;
        _emit({ model: name, status: 'loading', progress: pct, message: prog.status || ('Loading ' + modelId) });
      },
    });
    onDone(pipe);
    setStatus('ready');
    _emit({ model: name, status: 'ready', progress: 100, message: name + ' ready' });
  } catch (e) {
    setStatus('error');
    _emit({ model: name, status: 'error', message: (e as Error).message });
    throw e;
  }
}

/* ----------------------------------------------------------
 *  Public API
 * ---------------------------------------------------------- */

/** Preload all Solus models. Idempotent — safe to call multiple times. */
export async function solusLoad(): Promise<void> {
  if (_loadPromise) return _loadPromise;
  _loadPromise = (async () => {
    const tasks: Promise<void>[] = [];

    if (_sumStatus === 'idle') {
      tasks.push(_loadModel(
        'Summarization', 'summarization', 'Xenova/distilbart-cnn-6-6',
        p => { _sumPipe = p as SummarizationPipeline; },
        s => { _sumStatus = s; },
      ));
    }
    if (_clsStatus === 'idle') {
      tasks.push(_loadModel(
        'Classification', 'zero-shot-classification', 'Xenova/nli-deberta-v3-small',
        p => { _clsPipe = p as ClassificationPipeline; },
        s => { _clsStatus = s; },
      ));
    }
    if (_qaStatus === 'idle') {
      tasks.push(_loadModel(
        'Q&A', 'question-answering', 'Xenova/distilbert-base-uncased-distilled-squad',
        p => { _qaPipe = p as QAPipeline; },
        s => { _qaStatus = s; },
      ));
    }

    try {
      await Promise.all(tasks);
    } catch (error) {
      _loadPromise = null;
      throw error;
    }
  })();
  return _loadPromise;
}

/** Summarize text. Returns the summary string. */
export async function solusSummarize(text: string): Promise<string> {
  if (!_sumPipe) {
    if (_sumStatus === 'idle') await solusLoad();
    if (!_sumPipe) throw new Error('Summarization model not ready. Load Solus first.');
  }
  // DistilBART works best on ≤1024 tokens — truncate gracefully
  const trimmed = text.length > 3000 ? text.substring(0, 3000) + '…' : text;
  const result = await _sumPipe(trimmed, {
    max_new_tokens: 150,
    min_new_tokens: 30,
    no_repeat_ngram_size: 3,
  });
  return result[0]?.summary_text ?? '(no summary produced)';
}

/** Zero-shot classify text against provided labels. */
export async function solusClassify(text: string, labels: string[]): Promise<{ label: string; score: number; all: Array<{ label: string; score: number }> }> {
  if (!_clsPipe) {
    if (_clsStatus === 'idle') await solusLoad();
    if (!_clsPipe) throw new Error('Classification model not ready. Load Solus first.');
  }
  const result = await _clsPipe(text, labels);
  const all = result.labels.map((l, i) => ({ label: l, score: Math.round(result.scores[i] * 1000) / 1000 }));
  return { label: result.labels[0], score: result.scores[0], all };
}

/** Answer a question using context text (extractive Q&A). */
export async function solusAnswer(context: string, question: string): Promise<{ answer: string; score: number }> {
  if (!_qaPipe) {
    if (_qaStatus === 'idle') await solusLoad();
    if (!_qaPipe) throw new Error('Q&A model not ready. Load Solus first.');
  }
  const result = await _qaPipe(question, context);
  return { answer: result.answer, score: Math.round(result.score * 1000) / 1000 };
}

export function solusIsReady(): boolean {
  return _sumStatus === 'ready' && _clsStatus === 'ready' && _qaStatus === 'ready';
}

export function solusModelStatus(): SolusModelStatus {
  return { summarization: _sumStatus, classification: _clsStatus, qa: _qaStatus };
}
