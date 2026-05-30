/* Vision Weaver — Content Script (EXT-004) */

(function () {
  'use strict';

  var PHI = 1.618033988749895;
  var GOLDEN_ANGLE = 137.508;
  var HEARTBEAT = 873;

  var STYLES = {
    overlay: [
      'position: absolute',
      'top: 0',
      'left: 0',
      'width: 100%',
      'height: 100%',
      'background: rgba(99, 51, 255, 0.08)',
      'display: flex',
      'align-items: center',
      'justify-content: center',
      'opacity: 0',
      'transition: opacity 0.3s ease',
      'pointer-events: none',
      'z-index: 10000',
      'border-radius: 4px'
    ].join(';'),
    enhanceBtn: [
      'padding: 6px 14px',
      'background: rgba(99, 51, 255, 0.9)',
      'color: #fff',
      'border: none',
      'border-radius: 20px',
      'font-size: 13px',
      'cursor: pointer',
      'pointer-events: auto',
      'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      'box-shadow: 0 2px 8px rgba(0,0,0,0.25)',
      'transition: transform 0.2s ease'
    ].join(';'),
    contextMenu: [
      'position: fixed',
      'background: #1a1a2e',
      'border: 1px solid rgba(99, 51, 255, 0.5)',
      'border-radius: 8px',
      'padding: 6px 0',
      'min-width: 180px',
      'box-shadow: 0 8px 32px rgba(0,0,0,0.5)',
      'z-index: 10001',
      'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      'font-size: 13px'
    ].join(';'),
    contextMenuItem: [
      'padding: 8px 16px',
      'color: #e0e0ff',
      'cursor: pointer',
      'transition: background 0.15s ease',
      'display: flex',
      'align-items: center',
      'gap: 8px'
    ].join(';'),
    panel: [
      'position: relative',
      'width: 100%',
      'background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      'border: 1px solid rgba(99, 51, 255, 0.3)',
      'border-radius: 8px',
      'padding: 16px',
      'margin-top: 8px',
      'box-shadow: 0 4px 20px rgba(0,0,0,0.3)',
      'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      'z-index: 10000',
      'box-sizing: border-box'
    ].join(';'),
    input: [
      'width: 100%',
      'padding: 8px 12px',
      'background: rgba(255,255,255,0.08)',
      'border: 1px solid rgba(99, 51, 255, 0.4)',
      'border-radius: 6px',
      'color: #e0e0ff',
      'font-size: 13px',
      'outline: none',
      'box-sizing: border-box'
    ].join(';'),
    select: [
      'width: 100%',
      'padding: 8px 12px',
      'background: #1a1a2e',
      'border: 1px solid rgba(99, 51, 255, 0.4)',
      'border-radius: 6px',
      'color: #e0e0ff',
      'font-size: 13px',
      'outline: none',
      'box-sizing: border-box'
    ].join(';'),
    generateBtn: [
      'width: 100%',
      'padding: 10px',
      'background: linear-gradient(135deg, #6333ff 0%, #8b5cf6 100%)',
      'color: #fff',
      'border: none',
      'border-radius: 6px',
      'font-size: 14px',
      'font-weight: 600',
      'cursor: pointer',
      'transition: transform 0.2s ease, box-shadow 0.2s ease'
    ].join(';'),
    preview: [
      'width: 100%',
      'min-height: 60px',
      'background: rgba(255,255,255,0.04)',
      'border: 1px dashed rgba(99, 51, 255, 0.3)',
      'border-radius: 6px',
      'padding: 12px',
      'color: #8888aa',
      'font-size: 12px',
      'text-align: center',
      'box-sizing: border-box'
    ].join(';'),
    label: [
      'display: block',
      'color: #9999bb',
      'font-size: 11px',
      'margin-bottom: 4px',
      'text-transform: uppercase',
      'letter-spacing: 0.5px'
    ].join(';')
  };

  var activeMenu = null;
  var activePanel = null;

  /* ------------------------------------------------------------------ */
  /*  Context menu                                                       */
  /* ------------------------------------------------------------------ */

  function showContextMenu(x, y, imgElement) {
    removeContextMenu();

    var menu = document.createElement('div');
    menu.setAttribute('data-vw-menu', 'true');
    menu.style.cssText = STYLES.contextMenu;
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';

    var items = [
      { icon: '✨', label: 'Generate Similar', action: 'generateSimilar' },
      { icon: '🔍', label: 'Segment', action: 'segment' },
      { icon: '🎨', label: 'Edit Style', action: 'editStyle' }
    ];

    items.forEach(function (item) {
      var row = document.createElement('div');
      row.style.cssText = STYLES.contextMenuItem;
      row.textContent = item.icon + '  ' + item.label;

      row.addEventListener('mouseenter', function () {
        row.style.background = 'rgba(99, 51, 255, 0.25)';
      });
      row.addEventListener('mouseleave', function () {
        row.style.background = 'transparent';
      });

      row.addEventListener('click', function (e) {
        e.stopPropagation();
        removeContextMenu();
        handleContextAction(item.action, imgElement);
      });

      menu.appendChild(row);
    });

    document.body.appendChild(menu);
    activeMenu = menu;

    var rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth) menu.style.left = (window.innerWidth - rect.width - 8) + 'px';
    if (rect.bottom > window.innerHeight) menu.style.top = (window.innerHeight - rect.height - 8) + 'px';
  }

  function removeContextMenu() {
    if (activeMenu && activeMenu.parentNode) {
      activeMenu.parentNode.removeChild(activeMenu);
    }
    activeMenu = null;
  }

  function handleContextAction(action, imgElement) {
    switch (action) {
      case 'generateSimilar':
        showEditPanel(imgElement, 'Generate an image similar to this one');
        break;
      case 'segment':
        chrome.runtime.sendMessage({
          type: 'segmentImage',
          imageData: { width: imgElement.naturalWidth || 512, height: imgElement.naturalHeight || 512, src: imgElement.src }
        }, function (response) {
          if (response) showResultsInPanel(imgElement, response, 'Segmentation');
        });
        break;
      case 'editStyle':
        showEditPanel(imgElement, '');
        break;
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Inline editing panel                                               */
  /* ------------------------------------------------------------------ */

  function showEditPanel(imgElement, defaultPrompt) {
    removeEditPanel();

    var panel = document.createElement('div');
    panel.setAttribute('data-vw-panel', 'true');
    panel.style.cssText = STYLES.panel;

    var title = document.createElement('div');
    title.style.cssText = 'color: #e0e0ff; font-size: 14px; font-weight: 600; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;';
    title.innerHTML = '🎨 Vision Weaver';

    var closeBtn = document.createElement('span');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = 'cursor: pointer; color: #8888aa; font-size: 16px; padding: 0 4px;';
    closeBtn.addEventListener('click', function () { removeEditPanel(); });
    title.appendChild(closeBtn);
    panel.appendChild(title);

    var promptLabel = document.createElement('label');
    promptLabel.style.cssText = STYLES.label;
    promptLabel.textContent = 'Prompt';
    panel.appendChild(promptLabel);

    var promptInput = document.createElement('input');
    promptInput.type = 'text';
    promptInput.placeholder = 'Describe the image you want to generate…';
    promptInput.value = defaultPrompt || '';
    promptInput.style.cssText = STYLES.input;
    panel.appendChild(promptInput);

    var spacer1 = document.createElement('div');
    spacer1.style.height = '10px';
    panel.appendChild(spacer1);

    var engineLabel = document.createElement('label');
    engineLabel.style.cssText = STYLES.label;
    engineLabel.textContent = 'Engine';
    panel.appendChild(engineLabel);

    var engineSelect = document.createElement('select');
    engineSelect.style.cssText = STYLES.select;
    var engines = [
      { value: 'dall-e', text: 'DALL-E' },
      { value: 'stable-diffusion', text: 'Stable Diffusion' },
      { value: 'midjourney', text: 'Midjourney' }
    ];
    engines.forEach(function (eng) {
      var opt = document.createElement('option');
      opt.value = eng.value;
      opt.textContent = eng.text;
      engineSelect.appendChild(opt);
    });
    panel.appendChild(engineSelect);

    var spacer2 = document.createElement('div');
    spacer2.style.height = '12px';
    panel.appendChild(spacer2);

    var generateBtn = document.createElement('button');
    generateBtn.type = 'button';
    generateBtn.textContent = '⚡ Generate';
    generateBtn.style.cssText = STYLES.generateBtn;
    panel.appendChild(generateBtn);

    var spacer3 = document.createElement('div');
    spacer3.style.height = '12px';
    panel.appendChild(spacer3);

    var previewLabel = document.createElement('label');
    previewLabel.style.cssText = STYLES.label;
    previewLabel.textContent = 'Results Preview';
    panel.appendChild(previewLabel);

    var preview = document.createElement('div');
    preview.style.cssText = STYLES.preview;
    preview.textContent = 'Generated results will appear here';
    panel.appendChild(preview);

    generateBtn.addEventListener('click', function () {
      var prompt = promptInput.value.trim();
      if (!prompt) {
        preview.textContent = '⚠ Please enter a prompt';
        return;
      }

      preview.textContent = '⏳ Generating…';
      generateBtn.disabled = true;

      chrome.runtime.sendMessage({
        type: 'generateImage',
        prompt: prompt,
        engine: engineSelect.value
      }, function (response) {
        generateBtn.disabled = false;
        if (response && !response.error) {
          preview.innerHTML = '';

          var statusLine = document.createElement('div');
          statusLine.style.cssText = 'color: #66ffaa; font-weight: 600; margin-bottom: 6px;';
          statusLine.textContent = '✅ ' + response.status.charAt(0).toUpperCase() + response.status.slice(1);
          preview.appendChild(statusLine);

          var details = [
            'ID: ' + response.imageId,
            'Engine: ' + response.engine,
            'Size: ' + response.params.width + ' × ' + response.params.height,
            'Steps: ' + response.params.steps + ' | Guidance: ' + response.params.guidance,
            'Quality: ' + (response.quality * 100).toFixed(1) + '%',
            'Seed: ' + response.params.seed
          ];

          details.forEach(function (text) {
            var line = document.createElement('div');
            line.style.cssText = 'color: #aaaacc; font-size: 11px; line-height: 1.6;';
            line.textContent = text;
            preview.appendChild(line);
          });
        } else {
          preview.textContent = '❌ ' + ((response && response.error) || 'Generation failed');
        }
      });
    });

    imgElement.parentNode.insertBefore(panel, imgElement.nextSibling);
    activePanel = panel;
  }

  function showResultsInPanel(imgElement, data, title) {
    removeEditPanel();

    var panel = document.createElement('div');
    panel.setAttribute('data-vw-panel', 'true');
    panel.style.cssText = STYLES.panel;

    var heading = document.createElement('div');
    heading.style.cssText = 'color: #e0e0ff; font-size: 14px; font-weight: 600; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;';
    heading.textContent = '🔍 ' + title;

    var closeBtn = document.createElement('span');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = 'cursor: pointer; color: #8888aa; font-size: 16px; padding: 0 4px;';
    closeBtn.addEventListener('click', function () { removeEditPanel(); });
    heading.appendChild(closeBtn);
    panel.appendChild(heading);

    var info = document.createElement('div');
    info.style.cssText = 'color: #aaaacc; font-size: 12px; line-height: 1.8;';
    info.textContent = 'Total segments: ' + data.totalSegments + ' | Processing: ' + data.processingTime + 'ms';
    panel.appendChild(info);

    if (data.segments) {
      var maxDisplay = Math.min(data.segments.length, 5);
      for (var i = 0; i < maxDisplay; i++) {
        var seg = data.segments[i];
        var row = document.createElement('div');
        row.style.cssText = 'color: #ccccdd; font-size: 11px; padding: 4px 0; border-bottom: 1px solid rgba(99,51,255,0.15);';
        row.textContent = seg.id + ' — ' + seg.label + ' (confidence: ' + seg.confidence + ', area: ' + seg.area + 'px²)';
        panel.appendChild(row);
      }
      if (data.segments.length > maxDisplay) {
        var more = document.createElement('div');
        more.style.cssText = 'color: #8888aa; font-size: 11px; padding-top: 4px;';
        more.textContent = '… and ' + (data.segments.length - maxDisplay) + ' more segments';
        panel.appendChild(more);
      }
    }

    imgElement.parentNode.insertBefore(panel, imgElement.nextSibling);
    activePanel = panel;
  }

  function removeEditPanel() {
    if (activePanel && activePanel.parentNode) {
      activePanel.parentNode.removeChild(activePanel);
    }
    activePanel = null;
  }

  /* ------------------------------------------------------------------ */
  /*  Image hover overlays                                               */
  /* ------------------------------------------------------------------ */

  function attachOverlay(img) {
    if (img.getAttribute('data-vw-enhanced')) return;
    if (img.naturalWidth < 64 || img.naturalHeight < 64) return;

    img.setAttribute('data-vw-enhanced', 'true');

    var parent = img.parentElement;
    var needsWrapper = false;
    var wrapper;

    var computedPosition = window.getComputedStyle(parent).position;
    if (computedPosition === 'static') {
      needsWrapper = true;
    }

    if (needsWrapper) {
      wrapper = document.createElement('div');
      wrapper.style.cssText = 'position: relative; display: inline-block;';
      parent.insertBefore(wrapper, img);
      wrapper.appendChild(img);
    } else {
      wrapper = parent;
    }

    var overlay = document.createElement('div');
    overlay.style.cssText = STYLES.overlay;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = '🎨 Enhance';
    btn.style.cssText = STYLES.enhanceBtn;

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      showEditPanel(img, '');
    });

    overlay.appendChild(btn);
    wrapper.appendChild(overlay);

    img.addEventListener('mouseenter', function () { overlay.style.opacity = '1'; });
    wrapper.addEventListener('mouseleave', function () { overlay.style.opacity = '0'; });
  }

  function scanImages() {
    var images = document.querySelectorAll('img');
    images.forEach(function (img) {
      if (img.complete && img.naturalWidth >= 64) {
        attachOverlay(img);
      } else {
        img.addEventListener('load', function () { attachOverlay(img); }, { once: true });
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Right-click listener                                               */
  /* ------------------------------------------------------------------ */

  document.addEventListener('contextmenu', function (e) {
    var target = e.target;
    if (target.tagName === 'IMG' && target.naturalWidth >= 64) {
      e.preventDefault();
      showContextMenu(e.clientX, e.clientY, target);
    }
  });

  document.addEventListener('click', function () {
    removeContextMenu();
  });

  /* ------------------------------------------------------------------ */
  /*  Mutation observer for dynamically loaded images                    */
  /* ------------------------------------------------------------------ */

  var observer = new MutationObserver(function (mutations) {
    var shouldScan = false;
    for (var i = 0; i < mutations.length; i++) {
      if (mutations[i].addedNodes.length > 0) {
        shouldScan = true;
        break;
      }
    }
    if (shouldScan) scanImages();
  });

  observer.observe(document.body, { childList: true, subtree: true });

  /* ------------------------------------------------------------------ */
  /*  Init: heartbeat-delayed scan                                       */
  /* ------------------------------------------------------------------ */

  setTimeout(function () { scanImages(); }, HEARTBEAT);

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    scanImages();
  } else {
    document.addEventListener('DOMContentLoaded', scanImages);
  }
})();
