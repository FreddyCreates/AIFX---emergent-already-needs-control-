/**
 * Vigil Offscreen Document — Solus Runtime
 * ─────────────────────────────────────────
 * Runs in a dedicated offscreen document so onnxruntime-web (2.8 MB)
 * is loaded into a separate context and does NOT inflate the service
 * worker bundle or slow down its cold-start time.
 *
 * Communication: chrome.runtime.onMessage ↔ background service worker
 * Protocol: { action: '_solus_*', ... } messages
 */

import {
  solusLoad, solusSummarize, solusClassify, solusAnswer,
  solusIsReady, solusModelStatus, onSolusProgress,
} from '../background/skills/solus';

// Forward progress events back to the background
onSolusProgress(p => {
  chrome.runtime.sendMessage({ action: '_solusProgress', progress: p }).catch(() => {});
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  switch (message.action as string) {
    case '_solus_load':
      solusLoad()
        .then(() => sendResponse({ success: true }))
        .catch(e => sendResponse({ success: false, message: (e as Error).message }));
      return true;

    case '_solus_status':
      sendResponse({ success: true, status: solusModelStatus(), ready: solusIsReady() });
      return false;

    case '_solus_summarize':
      solusSummarize((message.text as string) || '')
        .then(summary => sendResponse({ success: true, summary }))
        .catch(e => sendResponse({ success: false, message: (e as Error).message }));
      return true;

    case '_solus_classify':
      solusClassify((message.text as string) || '', (message.labels as string[]) || [])
        .then(result => sendResponse({ success: true, result }))
        .catch(e => sendResponse({ success: false, message: (e as Error).message }));
      return true;

    case '_solus_answer':
      solusAnswer((message.context as string) || '', (message.question as string) || '')
        .then(r => sendResponse({ success: true, answer: r.answer, score: r.score }))
        .catch(e => sendResponse({ success: false, message: (e as Error).message }));
      return true;
  }
  return false;
});

console.log('[VIGIL Offscreen] Solus runtime ready.');
