/* Sovereign Alpha — Unified Content Script
 * φ-compresses three content scripts into one:
 *   Page Intelligence · Secure Vault · Command Bar
 */
(() => {
  "use strict";

  // ══════════════════════════════════════════════════════════════════════════
  // GUARD — prevent double-injection
  // ══════════════════════════════════════════════════════════════════════════
  if (window.__sovereignAlphaInjected) return;
  window.__sovereignAlphaInjected = true;

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE INTELLIGENCE — DOM analysis engine
  // ══════════════════════════════════════════════════════════════════════════

  const STOP_WORDS = new Set([
    "the","be","to","of","and","a","in","that","have","i","it","for","not","on",
    "with","he","as","you","do","at","this","but","his","by","from","they","we",
    "say","her","she","or","an","will","my","one","all","would","there","their",
    "what","so","up","out","if","about","who","get","which","go","me","when",
    "make","can","like","time","no","just","him","know","take","people","into",
    "year","your","good","some","could","them","see","other","than","then","now",
    "look","only","come","its","over","think","also","back","after","use","two",
    "how","our","work","first","well","way","even","new","want","because","any",
    "these","give","day","most","us","is","are","was","were","been","has","had",
    "did","does","am","being","do","very","more","much","such","each","few",
    "many","own","same","too","should","must","may","might","shall","need",
    "let","here","where","why","yet","still","already","else"
  ]);

  function piAnalyzeText() {
    const body = document.body;
    if (!body) return { wordCount: 0, charCount: 0, sentenceCount: 0, paragraphCount: 0, readingTime: "0 min", topWords: [] };
    const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const tag = node.parentElement ? node.parentElement.tagName : "";
        if (["SCRIPT","STYLE","NOSCRIPT","SVG","IFRAME"].includes(tag)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    let fullText = "";
    while (walker.nextNode()) fullText += " " + walker.currentNode.textContent;
    fullText = fullText.replace(/\s+/g, " ").trim();
    const words = fullText.split(/\s+/).filter(w => w.length > 0);
    const sentences = fullText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const freq = {};
    for (const w of words) {
      const lower = w.toLowerCase().replace(/[^a-z0-9'-]/g, "");
      if (lower.length < 3 || STOP_WORDS.has(lower)) continue;
      freq[lower] = (freq[lower] || 0) + 1;
    }
    const topWords = Object.entries(freq).sort((a,b) => b[1]-a[1]).slice(0,20).map(([word,count]) => ({ word, count }));
    return {
      wordCount: words.length,
      charCount: fullText.length,
      sentenceCount: sentences.length,
      paragraphCount: document.querySelectorAll("p").length,
      readingTime: Math.max(1, Math.ceil(words.length / 200)) + " min",
      topWords
    };
  }

  function piAnalyzeHeadings() {
    const headings = [], issues = [];
    let hasH1 = false, h1Count = 0, prevLevel = 0;
    document.querySelectorAll("h1,h2,h3,h4,h5,h6").forEach(el => {
      const level = parseInt(el.tagName[1], 10);
      headings.push({ tag: el.tagName, level, text: el.textContent.trim().substring(0, 200) });
      if (level === 1) { hasH1 = true; h1Count++; }
      if (prevLevel > 0 && level > prevLevel + 1) issues.push(`Skipped heading level: h${prevLevel} → h${level}`);
      prevLevel = level;
    });
    if (!hasH1) issues.push("Missing h1 element");
    if (h1Count > 1) issues.push(`Multiple h1 elements found (${h1Count})`);
    return { headings, issues, count: headings.length };
  }

  function piAnalyzeLinks() {
    const currentHost = location.hostname;
    const links = [];
    let internal = 0, external = 0, emptyText = 0, newTab = 0, mailto = 0, tel = 0, suspicious = 0;
    document.querySelectorAll("a[href]").forEach(el => {
      const href = el.getAttribute("href") || "";
      const text = el.textContent.trim().substring(0, 150);
      const isExternal = (() => {
        try { return new URL(href, location.href).hostname !== currentHost; } catch { return false; }
      })();
      if (isExternal) external++; else internal++;
      if (!text && !el.querySelector("img")) emptyText++;
      if (el.target === "_blank") newTab++;
      if (href.startsWith("mailto:")) mailto++;
      if (href.startsWith("tel:")) tel++;
      const isSuspicious = href === "#" || href.startsWith("javascript:") || href.startsWith("data:") || href.startsWith("vbscript:");
      if (isSuspicious) suspicious++;
      links.push({
        href: href.substring(0, 300), text: text || "(empty)", isExternal,
        newTab: el.target === "_blank",
        type: href.startsWith("mailto:") ? "mailto" : href.startsWith("tel:") ? "tel" : isSuspicious ? "suspicious" : "normal"
      });
    });
    return { links, total: links.length, internal, external, emptyText, newTab, mailto, tel, suspicious };
  }

  function piAnalyzeImages() {
    const images = [];
    let missingAlt = 0, emptyAlt = 0, lazyLoaded = 0;
    document.querySelectorAll("img").forEach(el => {
      const src = el.getAttribute("src") || el.getAttribute("data-src") || "";
      const alt = el.getAttribute("alt");
      const hasAlt = alt !== null;
      const isEmptyAlt = hasAlt && alt.trim() === "";
      if (!hasAlt) missingAlt++;
      if (isEmptyAlt) emptyAlt++;
      if (el.loading === "lazy" || el.hasAttribute("data-src") || el.dataset.lazy) lazyLoaded++;
      images.push({
        src: src.substring(0, 300), alt: hasAlt ? alt.substring(0, 200) : null,
        width: el.naturalWidth || el.width || 0, height: el.naturalHeight || el.height || 0,
        hasAlt, isEmptyAlt, isLazy: el.loading === "lazy" || el.hasAttribute("data-src")
      });
    });
    return { images, total: images.length, missingAlt, emptyAlt, lazyLoaded };
  }

  function piAnalyzeSEO() {
    const getMeta = (name) => {
      const el = document.querySelector(`meta[name="${name}"],meta[property="${name}"]`);
      return el ? el.getAttribute("content") || "" : null;
    };
    const title = document.title || "";
    const description = getMeta("description");
    const canonical = document.querySelector("link[rel='canonical']");
    const ogTags = {}, twitterTags = {};
    document.querySelectorAll('meta[property^="og:"]').forEach(el => { ogTags[el.getAttribute("property")] = el.getAttribute("content") || ""; });
    document.querySelectorAll('meta[name^="twitter:"]').forEach(el => { twitterTags[el.getAttribute("name")] = el.getAttribute("content") || ""; });
    const issues = [];
    if (!title) issues.push("Missing page title");
    else if (title.length > 60) issues.push(`Title too long (${title.length} chars)`);
    if (!description) issues.push("Missing meta description");
    else if (description.length > 160) issues.push(`Meta description too long (${description.length} chars)`);
    if (!canonical) issues.push("Missing canonical URL");
    if (!getMeta("viewport")) issues.push("Missing viewport meta tag");
    if (!document.documentElement.lang) issues.push("Missing lang attribute on <html>");
    if (!Object.keys(ogTags).length) issues.push("No Open Graph tags found");
    if (!Object.keys(twitterTags).length) issues.push("No Twitter Card tags found");
    return { title, titleLength: title.length, description, descriptionLength: description ? description.length : 0,
      canonical: canonical ? canonical.href : null, lang: document.documentElement.lang || null,
      ogTags, twitterTags, issues };
  }

  function piAnalyzeAccessibility() {
    const issues = [];
    let unlabeled = 0, unnamedButtons = 0;
    document.querySelectorAll("input,select,textarea").forEach(el => {
      const id = el.id || "";
      const hasLabel = id && document.querySelector(`label[for="${CSS.escape(id)}"]`);
      const hasAria = el.getAttribute("aria-label") || el.getAttribute("aria-labelledby");
      if (!hasLabel && !hasAria && !el.closest("label") && el.type !== "hidden") {
        unlabeled++;
        issues.push({ severity: "error", message: `Input without label: <${el.tagName.toLowerCase()} type="${el.type || "text"}">` });
      }
    });
    document.querySelectorAll("button,[role='button']").forEach(el => {
      if (!el.textContent.trim() && !el.getAttribute("aria-label") && !el.getAttribute("title") && !el.querySelector("img[alt]")) {
        unnamedButtons++;
        issues.push({ severity: "error", message: "Button without accessible name" });
      }
    });
    const imgsNoAlt = document.querySelectorAll("img:not([alt])").length;
    if (imgsNoAlt > 0) issues.push({ severity: "error", message: `${imgsNoAlt} image(s) missing alt attribute` });
    if (!document.documentElement.lang) issues.push({ severity: "warning", message: "Missing lang attribute on <html>" });
    return { issues, unlabeledInputs: unlabeled, unnamedButtons };
  }

  function piAnalyzePerformance() {
    const domNodeCount = document.querySelectorAll("*").length;
    let navTiming = null;
    try {
      const entries = performance.getEntriesByType("navigation");
      if (entries.length > 0) {
        const nav = entries[0];
        navTiming = {
          domContentLoaded: Math.round(nav.domContentLoadedEventEnd),
          domComplete: Math.round(nav.domComplete),
          loadEvent: Math.round(nav.loadEventEnd),
          ttfb: Math.round(nav.responseStart),
          transferSize: nav.transferSize || 0
        };
      }
    } catch { /* not available */ }
    return {
      domNodeCount,
      scripts: document.querySelectorAll("script").length,
      stylesheets: document.querySelectorAll('link[rel="stylesheet"],style').length,
      timing: navTiming,
      warnings: domNodeCount > 1500 ? [`High DOM node count: ${domNodeCount}`] : []
    };
  }

  // Page Intelligence message handler
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "runAnalysis") {
      try {
        sendResponse({
          url: location.href, title: document.title, timestamp: new Date().toISOString(),
          text: piAnalyzeText(), headings: piAnalyzeHeadings(), links: piAnalyzeLinks(),
          images: piAnalyzeImages(), seo: piAnalyzeSEO(),
          accessibility: piAnalyzeAccessibility(), performance: piAnalyzePerformance()
        });
      } catch (err) {
        sendResponse({ error: err.message });
      }
      return true;
    }
  });

  // ══════════════════════════════════════════════════════════════════════════
  // SECURE VAULT — clipboard capture & paste
  // ══════════════════════════════════════════════════════════════════════════

  let _toastTimeout = null;

  document.addEventListener("copy", (e) => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;
    const text = selection.toString();
    if (!text || !text.trim()) return;
    try {
      chrome.runtime.sendMessage({ type: "COPY_EVENT", text, url: window.location.href }, (response) => {
        if (chrome.runtime.lastError) return;
        if (response?.ok) showVaultToast("Saved to Secure Vault");
      });
    } catch { /* extension context invalidated */ }
  });

  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === "S") {
      const text = window.getSelection()?.toString();
      if (text && text.trim()) {
        e.preventDefault();
        try {
          chrome.runtime.sendMessage({ type: "COPY_EVENT", text, url: window.location.href }, () => {
            if (!chrome.runtime.lastError) showVaultToast("Saved to Secure Vault");
          });
        } catch { /* extension context invalidated */ }
      }
    }
  });

  function pasteAtCursor(text) {
    const el = document.activeElement;
    if (!el) return;
    if (el.isContentEditable) { document.execCommand("insertText", false, text); showVaultToast("Pasted from Vault"); return; }
    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
      const start = el.selectionStart ?? el.value.length;
      const end   = el.selectionEnd ?? el.value.length;
      el.value = el.value.substring(0, start) + text + el.value.substring(end);
      el.selectionStart = el.selectionEnd = start + text.length;
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
      showVaultToast("Pasted from Vault"); return;
    }
    try { document.execCommand("insertText", false, text); showVaultToast("Pasted from Vault"); }
    catch { showVaultToast("Could not paste — focus an input first"); }
  }

  function showVaultToast(message) {
    let toast = document.getElementById("sa-vault-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "sa-vault-toast";
      Object.assign(toast.style, {
        position: "fixed", bottom: "20px", right: "20px",
        background: "#1e1e2e", color: "#89b4fa",
        padding: "10px 20px", borderRadius: "8px", fontSize: "13px",
        fontFamily: "system-ui,-apple-system,sans-serif",
        zIndex: "2147483647", boxShadow: "0 4px 20px rgba(0,0,0,.5)",
        border: "1px solid #89b4fa", transition: "opacity .3s ease",
        opacity: "0", pointerEvents: "none"
      });
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = "1";
    if (_toastTimeout) clearTimeout(_toastTimeout);
    _toastTimeout = setTimeout(() => { toast.style.opacity = "0"; }, 2000);
  }

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "PASTE_AT_CURSOR" && msg.text) pasteAtCursor(msg.text);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // COMMAND BAR — floating palette + command executor
  // ══════════════════════════════════════════════════════════════════════════

  let _darkModeActive = false;
  let _paletteEl = null;
  let _selectedIdx = -1;
  let _suggestionItems = [];
  let _recentCmds = [];

  const COMMAND_NAMES = [
    "scroll up","scroll down","scroll top","scroll bottom","find","click","read",
    "goto","summarize","extract links","extract images","extract headings",
    "extract emails","extract numbers","word count","highlight","dark mode",
    "zoom in","zoom out","bookmark","copy title","copy url","tabs","close tab","history"
  ];

  function cbEscHtml(str) {
    const d = document.createElement("div");
    d.appendChild(document.createTextNode(str));
    return d.innerHTML;
  }

  function cbEscRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

  function cbExecuteCommand(raw) {
    const cmd = (raw || "").trim();
    if (!cmd) return { ok: false, result: "Empty command." };
    const lower = cmd.toLowerCase();

    if (lower === "scroll up") { window.scrollBy({ top: -400, behavior: "smooth" }); return { ok: true, result: "Scrolled up." }; }
    if (lower === "scroll down") { window.scrollBy({ top: 400, behavior: "smooth" }); return { ok: true, result: "Scrolled down." }; }
    if (lower === "scroll top") { window.scrollTo({ top: 0, behavior: "smooth" }); return { ok: true, result: "Scrolled to top." }; }
    if (lower === "scroll bottom") { window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }); return { ok: true, result: "Scrolled to bottom." }; }

    const findMatch = cmd.match(/^find\s+"(.+)"$/i) || cmd.match(/^find\s+(.+)$/i);
    if (findMatch) { const t = findMatch[1]; return { ok: true, result: window.find(t, false, false, true) ? `Found: "${t}"` : `"${t}" not found.` }; }

    if (lower.startsWith("click ")) {
      const sel = cmd.slice(6).trim();
      try { const el = document.querySelector(sel); if (!el) return { ok: false, result: `No element: ${sel}` }; el.click(); return { ok: true, result: `Clicked: ${sel}` }; }
      catch (e) { return { ok: false, result: `Invalid selector: ${e.message}` }; }
    }
    if (lower.startsWith("read ")) {
      const sel = cmd.slice(5).trim();
      try { const el = document.querySelector(sel); if (!el) return { ok: false, result: `No element: ${sel}` }; return { ok: true, result: el.innerText.trim().slice(0, 3000) || "(empty)" }; }
      catch (e) { return { ok: false, result: `Invalid selector: ${e.message}` }; }
    }
    if (lower.startsWith("goto ")) { let url = cmd.slice(5).trim(); if (!/^https?:\/\//i.test(url)) url = "https://" + url; location.href = url; return { ok: true, result: `Navigating to ${url}` }; }
    if (lower === "summarize") { const text = document.body.innerText || ""; const sentences = text.replace(/\s+/g," ").match(/[^.!?]+[.!?]+/g) || []; return { ok: true, result: sentences.slice(0,7).join(" ").trim() || "Could not extract sentences." }; }
    if (lower === "extract links") { const anchors = Array.from(document.querySelectorAll("a[href]")); if (!anchors.length) return { ok: true, result: "No links found." }; return { ok: true, result: `${anchors.length} link(s):\n` + anchors.slice(0,200).map(a => `${a.textContent.trim().slice(0,80)||"(no text)"} → ${a.href}`).join("\n") }; }
    if (lower === "extract images") { const imgs = Array.from(document.querySelectorAll("img[src]")); if (!imgs.length) return { ok: true, result: "No images found." }; return { ok: true, result: `${imgs.length} image(s):\n` + imgs.slice(0,200).map(img => `${img.alt||"(no alt)"} → ${img.src}`).join("\n") }; }
    if (lower === "extract headings") { const hs = Array.from(document.querySelectorAll("h1,h2,h3,h4,h5,h6")); if (!hs.length) return { ok: true, result: "No headings found." }; return { ok: true, result: `${hs.length} heading(s):\n` + hs.map(h => `<${h.tagName}> ${h.textContent.trim().slice(0,120)}`).join("\n") }; }
    if (lower === "extract emails") { const text = document.body.innerText || ""; const emails = [...new Set(text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g) || [])]; return { ok: true, result: emails.length ? `${emails.length} email(s):\n${emails.join("\n")}` : "No emails found." }; }
    if (lower === "extract numbers") { const text = document.body.innerText || ""; const nums = [...new Set(text.match(/-?\d[\d,]*\.?\d*/g) || [])]; return { ok: true, result: nums.length ? `${nums.length} number(s):\n${nums.slice(0,100).join(", ")}` : "No numbers found." }; }
    if (lower === "word count") { const text = (document.body.innerText || "").trim(); return { ok: true, result: `Words: ${text ? text.split(/\s+/).length : 0}\nChars: ${text.length}` }; }

    const hlMatch = cmd.match(/^highlight\s+"(.+)"$/i) || cmd.match(/^highlight\s+(.+)$/i);
    if (hlMatch) { cbRemoveHighlights(); const count = cbHighlightText(document.body, hlMatch[1]); return { ok: true, result: count ? `Highlighted ${count} occurrence(s).` : `"${hlMatch[1]}" not found.` }; }

    if (lower === "dark mode") {
      _darkModeActive = !_darkModeActive;
      document.documentElement.style.filter = _darkModeActive ? "invert(1) hue-rotate(180deg)" : "";
      document.querySelectorAll("img,video,picture,canvas,svg").forEach(el => { el.style.filter = _darkModeActive ? "invert(1) hue-rotate(180deg)" : ""; });
      return { ok: true, result: _darkModeActive ? "Dark mode enabled." : "Dark mode disabled." };
    }
    if (lower === "zoom in") { const cur = parseFloat(document.body.style.zoom || "1"); document.body.style.zoom = String(Math.min(cur + 0.1, 3).toFixed(1)); return { ok: true, result: `Zoom: ${document.body.style.zoom}` }; }
    if (lower === "zoom out") { const cur = parseFloat(document.body.style.zoom || "1"); document.body.style.zoom = String(Math.max(cur - 0.1, 0.3).toFixed(1)); return { ok: true, result: `Zoom: ${document.body.style.zoom}` }; }
    if (lower === "copy title") { navigator.clipboard.writeText(document.title).catch(() => {}); return { ok: true, result: `Copied: "${document.title}"` }; }
    if (lower === "copy url") { navigator.clipboard.writeText(location.href).catch(() => {}); return { ok: true, result: `Copied: ${location.href}` }; }

    if (["tabs","close tab","bookmark","history"].includes(lower)) return null; // forward to background
    return { ok: false, result: `Unknown command: "${cmd}"` };
  }

  function cbHighlightText(root, term) {
    let count = 0;
    const regex = new RegExp(cbEscRe(term), "gi");
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (node.parentElement && ["SCRIPT","STYLE","MARK"].includes(node.parentElement.tagName)) return NodeFilter.FILTER_REJECT;
        if (node.parentElement?.closest("#sa-command-palette")) return NodeFilter.FILTER_REJECT;
        return regex.test(node.textContent) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(textNode => {
      const frag = document.createDocumentFragment();
      let lastIdx = 0;
      const txt = textNode.textContent;
      regex.lastIndex = 0;
      let m;
      while ((m = regex.exec(txt)) !== null) {
        if (m.index > lastIdx) frag.appendChild(document.createTextNode(txt.slice(lastIdx, m.index)));
        const mark = document.createElement("mark");
        mark.className = "sa-highlight";
        mark.style.cssText = "background:#fabd2f;color:#1e1e2e;";
        mark.textContent = m[0];
        frag.appendChild(mark);
        count++;
        lastIdx = regex.lastIndex;
      }
      if (lastIdx < txt.length) frag.appendChild(document.createTextNode(txt.slice(lastIdx)));
      textNode.parentNode.replaceChild(frag, textNode);
    });
    return count;
  }

  function cbRemoveHighlights() {
    document.querySelectorAll("mark.sa-highlight").forEach(m => {
      m.parentNode.replaceChild(document.createTextNode(m.textContent), m);
      m.parentNode.normalize();
    });
  }

  function cbCreatePalette() {
    if (_paletteEl) { _paletteEl.style.display = _paletteEl.style.display === "none" ? "flex" : "none"; return; }
    _paletteEl = document.createElement("div");
    _paletteEl.id = "sa-command-palette";
    _paletteEl.innerHTML = `
      <style>
        #sa-command-palette *{box-sizing:border-box;margin:0;padding:0;}
        #sa-command-palette{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:flex-start;justify-content:center;padding-top:15vh;background:rgba(0,0,0,.55);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;color:#cdd6f4;}
        .sa-cp-box{width:560px;max-width:92vw;background:#1e1e2e;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,.6);overflow:hidden;display:flex;flex-direction:column;max-height:70vh;}
        .sa-cp-row{display:flex;align-items:center;padding:14px 16px;border-bottom:1px solid #313244;}
        .sa-cp-row svg{flex-shrink:0;margin-right:10px;color:#89b4fa;}
        .sa-cp-input{flex:1;background:none;border:none;outline:none;font-size:16px;color:#cdd6f4;font-family:inherit;}
        .sa-cp-input::placeholder{color:#6c7086;}
        .sa-cp-sugs{overflow-y:auto;max-height:260px;}
        .sa-cp-sug{padding:10px 16px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #181825;}
        .sa-cp-sug:hover,.sa-cp-sug.active{background:#313244;}
        .sa-cp-result{padding:12px 16px;max-height:200px;overflow-y:auto;background:#181825;white-space:pre-wrap;word-break:break-word;font-size:13px;line-height:1.5;color:#a6e3a1;display:none;}
        .sa-cp-result.error{color:#f38ba8;}
        .sa-cp-footer{padding:8px 16px;text-align:center;font-size:11px;color:#45475a;border-top:1px solid #313244;}
      </style>
      <div class="sa-cp-box">
        <div class="sa-cp-row">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input class="sa-cp-input" placeholder="Type a command (scroll down, find, summarize…)" autofocus autocomplete="off" spellcheck="false"/>
        </div>
        <div class="sa-cp-sugs"></div>
        <div class="sa-cp-result"></div>
        <div class="sa-cp-footer">↑↓ Navigate · Enter Execute · Esc Close · Ctrl+Shift+K Toggle</div>
      </div>
    `;
    document.documentElement.appendChild(_paletteEl);
    const input = _paletteEl.querySelector(".sa-cp-input");
    const sugBox = _paletteEl.querySelector(".sa-cp-sugs");
    const resultBox = _paletteEl.querySelector(".sa-cp-result");
    _paletteEl.addEventListener("mousedown", e => { if (e.target === _paletteEl) cbClosePalette(); });
    input.addEventListener("input", () => {
      const q = input.value.trim().toLowerCase();
      resultBox.style.display = "none";
      if (!q) { sugBox.innerHTML = ""; _suggestionItems = []; _selectedIdx = -1; return; }
      _suggestionItems = COMMAND_NAMES.filter(c => c.includes(q));
      _selectedIdx = -1;
      cbRenderSuggestions(sugBox, _suggestionItems, input, resultBox);
    });
    input.addEventListener("keydown", e => {
      if (e.key === "Escape") { cbClosePalette(); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); cbMoveSel(1, sugBox); return; }
      if (e.key === "ArrowUp") { e.preventDefault(); cbMoveSel(-1, sugBox); return; }
      if (e.key === "Enter") {
        e.preventDefault();
        let cmd = input.value.trim();
        if (_selectedIdx >= 0 && _selectedIdx < _suggestionItems.length) { cmd = _suggestionItems[_selectedIdx]; input.value = cmd; }
        if (cmd) cbRunFromPalette(cmd, resultBox);
      }
    });
    input.focus();
  }

  function cbRenderSuggestions(box, items, input, resultBox) {
    if (!items.length) { box.innerHTML = ""; return; }
    box.innerHTML = items.map((it, i) => `<div class="sa-cp-sug${i === _selectedIdx ? " active" : ""}" data-idx="${i}">${cbEscHtml(it)}</div>`).join("");
    box.querySelectorAll(".sa-cp-sug").forEach(el => {
      el.addEventListener("mousedown", e => { e.preventDefault(); input.value = el.textContent; cbRunFromPalette(el.textContent.trim(), resultBox); });
    });
  }

  function cbMoveSel(dir, sugBox) {
    if (!_suggestionItems.length) return;
    _selectedIdx = Math.max(-1, Math.min(_suggestionItems.length - 1, _selectedIdx + dir));
    sugBox.querySelectorAll(".sa-cp-sug").forEach((el, i) => { el.classList.toggle("active", i === _selectedIdx); if (i === _selectedIdx) el.scrollIntoView({ block: "nearest" }); });
  }

  async function cbRunFromPalette(cmd, resultBox) {
    if (!_recentCmds.includes(cmd)) _recentCmds.unshift(cmd);
    if (_recentCmds.length > 20) _recentCmds.length = 20;
    let res = cbExecuteCommand(cmd);
    if (res === null) {
      try { res = await chrome.runtime.sendMessage({ type: "execute-command", command: cmd }); }
      catch (e) { res = { ok: false, result: e.message }; }
    } else {
      chrome.runtime.sendMessage({ type: "execute-command", command: cmd }).catch(() => {});
    }
    if (resultBox) {
      resultBox.style.display = "block";
      resultBox.className = "sa-cp-result" + (res?.ok ? "" : " error");
      resultBox.textContent = res ? res.result : "No result.";
    }
  }

  function cbClosePalette() { if (_paletteEl) _paletteEl.style.display = "none"; }

  // Command Bar message listener
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "toggle-palette") { cbCreatePalette(); sendResponse({ ok: true }); return false; }
    if (msg.type === "run-command") {
      let res = cbExecuteCommand(msg.command);
      if (res === null) {
        chrome.runtime.sendMessage({ type: "execute-command", command: msg.command })
          .then(sendResponse).catch(e => sendResponse({ ok: false, result: e.message }));
        return true;
      }
      sendResponse(res);
      return false;
    }
  });

  // Global keyboard shortcut: Ctrl+Shift+K
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === "K") { e.preventDefault(); cbCreatePalette(); }
  });

})();
