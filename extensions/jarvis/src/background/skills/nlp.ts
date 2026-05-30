/**
 * NLP skill — lightweight intent classification using Transformers.js.
 * Falls back gracefully if models aren't loaded yet (first run).
 */

type IntentPipeline = (text: string, labels: string[]) => Promise<{ labels: string[]; scores: number[] }>;

let intentPipeline: IntentPipeline | null = null;
let pipelineLoading = false;

async function getIntentPipeline(): Promise<IntentPipeline | null> {
  if (intentPipeline) return intentPipeline;
  if (pipelineLoading) return null;
  pipelineLoading = true;
  try {
    const { pipeline } = await import('@xenova/transformers');
    const pipe = await pipeline('zero-shot-classification', 'Xenova/nli-deberta-v3-small');
    intentPipeline = async (text: string, labels: string[]) => {
      const result = await pipe(text, labels);
      return result as { labels: string[]; scores: number[] };
    };
    return intentPipeline;
  } catch {
    pipelineLoading = false;
    return null;
  }
}

const INTENT_LABELS = [
  'tab management',
  'note taking',
  'web search',
  'page summary',
  'screenshot',
  'create pdf report',
  'create excel spreadsheet',
  'draft email',
  'greeting',
  'general conversation',
  'math calculation',
  'brainstorm ideas',
  'risk analysis',
  'market analysis',
  'product strategy',
  'memory recall',
  'workspace planning',
];

export interface NlpIntent {
  label: string;
  score: number;
  source: 'transformers' | 'fallback';
}

export async function classifyIntent(text: string): Promise<NlpIntent> {
  const pipe = await getIntentPipeline();
  if (!pipe) {
    return { label: 'general conversation', score: 0.5, source: 'fallback' };
  }
  try {
    const result = await pipe(text, INTENT_LABELS);
    return { label: result.labels[0], score: result.scores[0], source: 'transformers' };
  } catch {
    return { label: 'general conversation', score: 0.5, source: 'fallback' };
  }
}

export function extractTopics(text: string): string[] {
  const stop = new Set(['the', 'a', 'an', 'is', 'i', 'you', 'me', 'my', 'it', 'to', 'in', 'of', 'and', 'or', 'do', 'what', 'how', 'can', 'be', 'that', 'this', 'are', 'was', 'for', 'so', 'ok', 'just', 'like', 'know', 'its', 'with']);
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stop.has(w))
    .slice(0, 10);
}
