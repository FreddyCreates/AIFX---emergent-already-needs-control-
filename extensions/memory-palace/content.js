/* Memory Palace — Content Script (EXT-006) */

(function () {
  "use strict";

  var PHI = 1.618033988749895;
  var GOLDEN_ANGLE = 137.508;
  var HEARTBEAT = 873;

  var memoryCount = 0;
  var overlayVisible = false;
  var localMemories = [];

  /* ---------- Sovereign Bookmarking: "📌 Remember" Button ---------- */

  var rememberBtn = document.createElement("button");
  rememberBtn.textContent = "\uD83D\uDCCC Remember";
  rememberBtn.setAttribute(
    "style",
    "position:fixed;z-index:2147483647;display:none;padding:6px 14px;" +
      "background:#1a1a2e;color:#e0c097;border:1px solid #e0c097;" +
      "border-radius:8px;font-size:13px;cursor:pointer;font-family:system-ui;" +
      "box-shadow:0 4px 16px rgba(0,0,0,0.4);transition:opacity 0.2s;"
  );
  document.documentElement.appendChild(rememberBtn);

  document.addEventListener("mouseup", function (e) {
    var selection = window.getSelection();
    var text = selection ? selection.toString().trim() : "";

    if (text.length < 2) {
      rememberBtn.style.display = "none";
      return;
    }

    rememberBtn.style.left = e.pageX + "px";
    rememberBtn.style.top = e.pageY - 40 + "px";
    rememberBtn.style.display = "block";
    rememberBtn.dataset.selectedText = text;
  });

  document.addEventListener("mousedown", function (e) {
    if (e.target !== rememberBtn) {
      rememberBtn.style.display = "none";
    }
  });

  rememberBtn.addEventListener("click", function () {
    var text = rememberBtn.dataset.selectedText;
    if (!text) return;

    chrome.runtime.sendMessage(
      { action: "storeMemory", content: text },
      function (response) {
        if (response && response.stored) {
          memoryCount++;
          updateBadge();
          localMemories.push({
            id: response.id,
            content: text,
            coords: response.coords,
          });
          showToast("Memory stored in the Palace (#" + response.id + ")");
        }
      }
    );

    rememberBtn.style.display = "none";
  });

  /* ---------- Toast Notification ---------- */

  function showToast(msg) {
    var toast = document.createElement("div");
    toast.textContent = msg;
    toast.setAttribute(
      "style",
      "position:fixed;bottom:80px;left:20px;z-index:2147483647;" +
        "padding:10px 18px;background:#1a1a2e;color:#e0c097;" +
        "border:1px solid #e0c097;border-radius:8px;font-size:13px;" +
        "font-family:system-ui;box-shadow:0 4px 16px rgba(0,0,0,0.4);" +
        "transition:opacity 0.5s;opacity:1;"
    );
    document.documentElement.appendChild(toast);
    setTimeout(function () {
      toast.style.opacity = "0";
      setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 500);
    }, 2200);
  }

  /* ---------- Palace Toggle Button ---------- */

  var palaceBtn = document.createElement("button");
  palaceBtn.innerHTML = "\uD83C\uDFDB\uFE0F Palace <span id='mp-badge'>0</span>";
  palaceBtn.setAttribute(
    "style",
    "position:fixed;bottom:20px;left:20px;z-index:2147483646;" +
      "padding:8px 16px;background:#1a1a2e;color:#e0c097;" +
      "border:1px solid #e0c097;border-radius:10px;font-size:14px;" +
      "cursor:pointer;font-family:system-ui;" +
      "box-shadow:0 4px 16px rgba(0,0,0,0.4);"
  );
  document.documentElement.appendChild(palaceBtn);

  function updateBadge() {
    var badge = document.getElementById("mp-badge");
    if (badge) {
      badge.textContent = String(memoryCount);
      badge.setAttribute(
        "style",
        "display:inline-block;min-width:18px;height:18px;line-height:18px;" +
          "text-align:center;background:#e0c097;color:#1a1a2e;" +
          "border-radius:9px;font-size:11px;font-weight:bold;margin-left:6px;"
      );
    }
  }
  updateBadge();

  /* ---------- Memory Map Overlay ---------- */

  var overlay = document.createElement("div");
  overlay.setAttribute(
    "style",
    "position:fixed;top:0;left:0;width:100vw;height:100vh;" +
      "z-index:2147483645;display:none;background:rgba(10,10,20,0.92);"
  );
  document.documentElement.appendChild(overlay);

  var canvas = document.createElement("canvas");
  canvas.setAttribute(
    "style",
    "position:absolute;top:0;left:0;width:100%;height:100%;cursor:crosshair;"
  );
  overlay.appendChild(canvas);

  var infoCard = document.createElement("div");
  infoCard.setAttribute(
    "style",
    "position:absolute;display:none;padding:16px 22px;max-width:380px;" +
      "background:#1a1a2e;color:#e0c097;border:1px solid #e0c097;" +
      "border-radius:10px;font-size:13px;line-height:1.5;" +
      "font-family:system-ui;box-shadow:0 6px 24px rgba(0,0,0,0.6);" +
      "word-wrap:break-word;pointer-events:auto;"
  );
  overlay.appendChild(infoCard);

  var closeOverlayBtn = document.createElement("button");
  closeOverlayBtn.textContent = "\u2715 Close";
  closeOverlayBtn.setAttribute(
    "style",
    "position:absolute;top:16px;right:20px;padding:6px 16px;" +
      "background:transparent;color:#e0c097;border:1px solid #e0c097;" +
      "border-radius:6px;font-size:13px;cursor:pointer;font-family:system-ui;"
  );
  overlay.appendChild(closeOverlayBtn);

  closeOverlayBtn.addEventListener("click", function () {
    overlayVisible = false;
    overlay.style.display = "none";
  });

  palaceBtn.addEventListener("click", function () {
    overlayVisible = !overlayVisible;
    overlay.style.display = overlayVisible ? "block" : "none";
    if (overlayVisible) renderMemoryMap();
  });

  /* ---------- Phyllotaxis Placement (local copy for rendering) ---------- */

  function phyllotaxisPlace(index) {
    var angleRad = (index * GOLDEN_ANGLE * Math.PI) / 180;
    var r = Math.sqrt(index + 1);
    return {
      x: r * Math.cos(angleRad),
      y: r * Math.sin(angleRad),
      r: r,
    };
  }

  /* ---------- Render Memory Map on Canvas ---------- */

  var dotPositions = [];

  function renderMemoryMap() {
    dotPositions = [];
    var w = window.innerWidth;
    var h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, w, h);

    var cx = w / 2;
    var cy = h / 2;
    var scale = Math.min(w, h) / (Math.sqrt(localMemories.length + 2) * 3 + 4);

    /* spiral guide lines */
    ctx.strokeStyle = "rgba(224,192,151,0.08)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (var s = 0; s < 200; s++) {
      var guide = phyllotaxisPlace(s);
      var gx = cx + guide.x * scale;
      var gy = cy + guide.y * scale;
      if (s === 0) ctx.moveTo(gx, gy);
      else ctx.lineTo(gx, gy);
    }
    ctx.stroke();

    /* memory dots */
    for (var i = 0; i < localMemories.length; i++) {
      var pos = phyllotaxisPlace(i);
      var dx = cx + pos.x * scale;
      var dy = cy + pos.y * scale;
      var dotRadius = 6 + (4 / (i / PHI + 1));

      ctx.beginPath();
      ctx.arc(dx, dy, dotRadius, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(224,192,151," + (0.6 + 0.4 / (i + 1)) + ")";
      ctx.fill();
      ctx.strokeStyle = "#e0c097";
      ctx.lineWidth = 1;
      ctx.stroke();

      /* index label */
      ctx.fillStyle = "#1a1a2e";
      ctx.font = "bold 10px system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(i + 1), dx, dy);

      dotPositions.push({
        x: dx,
        y: dy,
        radius: dotRadius,
        memory: localMemories[i],
      });
    }

    /* title */
    ctx.fillStyle = "#e0c097";
    ctx.font = "bold 18px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(
      "\uD83C\uDFDB\uFE0F Memory Palace \u2014 " + localMemories.length + " memories",
      cx,
      36
    );

    infoCard.style.display = "none";
  }

  /* ---------- Click Detection on Dots ---------- */

  canvas.addEventListener("click", function (e) {
    var rect = canvas.getBoundingClientRect();
    var mx = e.clientX - rect.left;
    var my = e.clientY - rect.top;

    for (var i = dotPositions.length - 1; i >= 0; i--) {
      var dot = dotPositions[i];
      var distSq = (mx - dot.x) * (mx - dot.x) + (my - dot.y) * (my - dot.y);
      if (distSq <= (dot.radius + 4) * (dot.radius + 4)) {
        showInfoCard(dot.memory, dot.x, dot.y);
        return;
      }
    }

    infoCard.style.display = "none";
  });

  function showInfoCard(memory, px, py) {
    var cardWidth = 380 / PHI;
    var cardText = memory.content;
    if (cardText.length > 300) {
      cardText = cardText.substring(0, 297) + "...";
    }

    infoCard.innerHTML =
      "<strong>#" +
      memory.id +
      "</strong><br>" +
      '<span style="font-size:12px;opacity:0.7;">' +
      "Coords: \u03B8=" +
      (memory.coords ? memory.coords.theta : "—") +
      " \u03C6=" +
      (memory.coords ? memory.coords.phi : "—") +
      "</span><hr style='border-color:#e0c09744;margin:8px 0;'>" +
      cardText;

    var left = px + 16;
    var top = py - 20;
    if (left + cardWidth > window.innerWidth) left = px - cardWidth - 16;
    if (top < 10) top = 10;

    infoCard.style.left = left + "px";
    infoCard.style.top = top + "px";
    infoCard.style.maxWidth = Math.round(380 * PHI) / PHI + "px";
    infoCard.style.display = "block";
  }

  /* ---------- Handle window resize ---------- */

  window.addEventListener("resize", function () {
    if (overlayVisible) renderMemoryMap();
  });
})();
