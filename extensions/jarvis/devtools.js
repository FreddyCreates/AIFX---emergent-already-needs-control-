/* Jarvis AI — DevTools Page
 * Registers the JARVIS Intelligence Panel in Chrome/Edge DevTools.
 * Universal CPL WASM — composes into any runtime, any call, any query.
 */
chrome.devtools.panels.create(
  'JARVIS CPL',
  'icons/icon16.png',
  'devtools-panel.html',
  function (panel) {
    panel.onShown.addListener(function (win) {
      /* notify background that devtools panel is active */
      chrome.runtime.sendMessage({ type: 'devtools', action: 'opened' });
    });
    panel.onHidden.addListener(function () {
      chrome.runtime.sendMessage({ type: 'devtools', action: 'closed' });
    });
  }
);
