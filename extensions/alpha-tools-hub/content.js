/* Alpha Tools Hub — Content Layer (EXT-041) */

(function() {
  'use strict';

  const PHI = 1.618033988749895;
  const HEARTBEAT = 873;

  class AlphaToolsContent {
    constructor() {
      this.overlay = null;
      this.active = false;
      this.selectedData = null;
      this._init();
    }

    _init() {
      document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'T') {
          e.preventDefault();
          this.toggle();
        }
      });

      document.addEventListener('selectionchange', () => {
        const sel = window.getSelection();
        if (sel && sel.toString().trim()) {
          this.selectedData = sel.toString().trim();
        }
      });

      window.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'ALPHA_TOOLS_COMMAND') {
          this._handleCommand(event.data);
        }
      });
    }

    toggle() {
      this.active = !this.active;
      if (this.active) this._showOverlay();
      else this._hideOverlay();
    }

    _showOverlay() {
      if (this.overlay) return;
      this.overlay = document.createElement('div');
      this.overlay.id = 'alpha-tools-overlay';
      this.overlay.innerHTML = `
        <div style="position:fixed;top:12px;right:12px;width:320px;background:rgba(3,7,18,0.95);border:1px solid rgba(168,85,247,0.3);border-radius:12px;padding:16px;z-index:999999;font-family:Inter,system-ui,sans-serif;color:#f8fafc;backdrop-filter:blur(12px);box-shadow:0 8px 32px rgba(0,0,0,0.5);">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <span style="font-weight:700;font-size:14px;color:#a855f7;">⚡ Alpha Tools</span>
            <span id="alpha-tools-close" style="cursor:pointer;color:#64748b;font-size:18px;">×</span>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
            <button class="alpha-btn" data-tool="transform" style="all:unset;padding:8px;text-align:center;background:rgba(168,85,247,0.15);border:1px solid rgba(168,85,247,0.3);border-radius:8px;cursor:pointer;font-size:11px;color:#a855f7;">🔄 Transform</button>
            <button class="alpha-btn" data-tool="analyze" style="all:unset;padding:8px;text-align:center;background:rgba(0,255,204,0.1);border:1px solid rgba(0,255,204,0.3);border-radius:8px;cursor:pointer;font-size:11px;color:#00ffcc;">📊 Analyze</button>
            <button class="alpha-btn" data-tool="generate" style="all:unset;padding:8px;text-align:center;background:rgba(59,130,246,0.15);border:1px solid rgba(59,130,246,0.3);border-radius:8px;cursor:pointer;font-size:11px;color:#3b82f6;">✨ Generate</button>
            <button class="alpha-btn" data-tool="connect" style="all:unset;padding:8px;text-align:center;background:rgba(34,197,94,0.15);border:1px solid rgba(34,197,94,0.3);border-radius:8px;cursor:pointer;font-size:11px;color:#22c55e;">🔗 Connect</button>
            <button class="alpha-btn" data-tool="automate" style="all:unset;padding:8px;text-align:center;background:rgba(212,175,55,0.15);border:1px solid rgba(212,175,55,0.3);border-radius:8px;cursor:pointer;font-size:11px;color:#d4af37;grid-column:span 2;">⚙️ Automate</button>
          </div>
          <div id="alpha-tools-result" style="margin-top:10px;padding:8px;background:rgba(0,0,0,0.3);border-radius:6px;font-size:10px;font-family:monospace;max-height:150px;overflow-y:auto;display:none;"></div>
        </div>
      `;
      document.body.appendChild(this.overlay);

      this.overlay.querySelector('#alpha-tools-close').addEventListener('click', () => this.toggle());
      this.overlay.querySelectorAll('.alpha-btn').forEach(btn => {
        btn.addEventListener('click', () => this._invokeTool(btn.dataset.tool));
      });
    }

    _hideOverlay() {
      if (this.overlay) {
        this.overlay.remove();
        this.overlay = null;
      }
    }

    _invokeTool(category) {
      const input = this.selectedData || document.title;
      chrome.runtime.sendMessage({ type: 'ALPHA_INVOKE_TOOL', category, input }, (response) => {
        const resultEl = this.overlay && this.overlay.querySelector('#alpha-tools-result');
        if (resultEl) {
          resultEl.style.display = 'block';
          resultEl.textContent = JSON.stringify(response, null, 2);
        }
      });
    }

    _handleCommand(data) {
      if (data.command === 'invoke') {
        this._invokeTool(data.category);
      }
    }
  }

  new AlphaToolsContent();
})();
