/* ============================================================
 * Damaros — signal-field hero centerpiece.
 *
 *   ONE idea, legible in a single static frame:
 *   fragmented evidence (dim, scattered noise on the left) is
 *   continuously selected, drawn to an ordered vertical SIGNAL
 *   SPINE on the right, and LOCKED (pass-green flash) into a clean,
 *   live signal line. Occasionally a locked node drops to REVIEW
 *   (amber) and re-resolves — deterministic where trust requires.
 *
 *   Canvas 2D only (universal device support). Colours are read
 *   from CSS custom properties so it tracks the theme. Governed by
 *   DamarosAnim.loop (auto-pauses off-screen / tab-hidden). Reduced
 *   motion + low-end devices fall back to a composed static frame.
 *
 *   DOM contract:  #heroStage  >  canvas#heroField
 * ============================================================ */
(function () {
  var stage = document.getElementById("heroStage"); if (!stage) return;
  var cv = document.getElementById("heroField"); if (!cv) return;
  var ctx = cv.getContext("2d");

  var REDUCED = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var PF = window.DamarosAnim ? DamarosAnim.perf()
    : { mobile: matchMedia("(hover: none),(pointer: coarse)").matches || window.innerWidth <= 900,
        dpr: Math.min(2, window.devicePixelRatio || 1), glow: 1 };
  var MOBILE = PF.mobile, SFX = PF.glow, DPR = PF.dpr;
  var SMALL = window.innerWidth <= 700;
  var TOUCH = matchMedia("(hover: none), (pointer: coarse)").matches;

  var W = 0, H = 0, last = 0, sweep = 0, reviewTimer = 2.4, seekTimer = 0.6;
  var C = {}, axisX = 0, yTop = 0, yBot = 0;
  var nodes = [], frags = [];
  var NODES = MOBILE ? 7 : 11;
  var FRAGS = MOBILE ? 20 : (SMALL ? 38 : 78);
  var par = { x: 0, y: 0, tx: 0, ty: 0 };   // pointer parallax for the noise field

  function hexToRgb(h) {
    if (!h || h.charAt(0) !== "#") return null;
    h = h.slice(1); if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    var n = parseInt(h, 16); return [(n>>16)&255, (n>>8)&255, n&255];
  }
  function readColors() {
    var cs = getComputedStyle(document.documentElement), g = function (n) { return cs.getPropertyValue(n).trim(); };
    C.signal = hexToRgb(g("--accent-2")) || [169,192,214];
    C.accent = hexToRgb(g("--accent"))   || [123,150,178];
    C.lock   = hexToRgb(g("--pass"))     || [74,222,128];
    C.review = hexToRgb(g("--review"))   || [250,204,21];
    C.dim    = hexToRgb(g("--fg-3"))     || [120,134,150];
    C.line   = hexToRgb(g("--bd-strong"))|| [70,84,100];
  }
  function rgb(c, a) { return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + (a<0?0:a>1?1:a) + ")"; }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function dot(x, y, r, c, a, glow) {
    if (glow && SFX) { ctx.shadowColor = rgb(c, 0.9); ctx.shadowBlur = glow; }
    ctx.fillStyle = rgb(c, a); ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill();
    if (glow) ctx.shadowBlur = 0;
  }

  function spawnFrag() {
    var fx = rnd(W * 0.04, axisX - W * 0.05);
    var fy = rnd(yTop - H * 0.05, yBot + H * 0.05);
    return { hx: fx, hy: fy, x: fx, y: fy, ph: rnd(0, 6.28), sp: rnd(0.25, 0.8),
             amp: rnd(4, 13), r: rnd(0.6, 1.7), state: 0, node: -1, t: 0, sx: 0, sy: 0 };
  }

  function layout() {
    var r = stage.getBoundingClientRect(); W = r.width; H = r.height;
    if (!W || !H) return;
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    axisX = W * (MOBILE ? 0.5 : 0.64);
    yTop = H * 0.13; yBot = H * 0.87;
    nodes = [];
    for (var i = 0; i < NODES; i++) {
      var f = NODES === 1 ? 0 : i / (NODES - 1);
      nodes.push({ x: axisX, y: yTop + f * (yBot - yTop), fill: 0, lock: 0, review: 0, assigned: false });
    }
    // pre-fill most of the spine so the very first frame already shows a signal
    for (var n = 0; n < nodes.length; n++) nodes[n].fill = (n < nodes.length * 0.62) ? rnd(0.72, 1) : 0;
    frags = [];
    for (var k = 0; k < FRAGS; k++) frags.push(spawnFrag());
  }

  function nextTarget() {
    var best = -1, bf = 2;
    for (var i = 0; i < nodes.length; i++) {
      if (!nodes[i].assigned && nodes[i].fill < bf) { bf = nodes[i].fill; best = i; }
    }
    return best;
  }

  function update(dt, t) {
    sweep += dt * (MOBILE ? 0.10 : 0.13); if (sweep > 1) sweep -= 1;
    par.x += (par.tx - par.x) * 0.06; par.y += (par.ty - par.y) * 0.06;

    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].lock > 0)   nodes[i].lock   = Math.max(0, nodes[i].lock   - dt * 1.9);
      if (nodes[i].review > 0) nodes[i].review = Math.max(0, nodes[i].review - dt * 1.0);
    }

    // a filled node occasionally drops to REVIEW, then re-resolves over time
    reviewTimer -= dt;
    if (reviewTimer <= 0) {
      reviewTimer = rnd(2.6, 5.0);
      var cand = [];
      for (var r2 = 0; r2 < nodes.length; r2++) if (nodes[r2].fill > 0.82 && nodes[r2].review <= 0) cand.push(r2);
      if (cand.length) { var rn = cand[(Math.random() * cand.length) | 0]; nodes[rn].review = 1; nodes[rn].fill = 0.5; }
    }

    // throttled assignment of a noise fragment to the least-resolved node
    seekTimer -= dt;
    if (seekTimer <= 0) {
      seekTimer = rnd(0.16, 0.36) * (MOBILE ? 1.8 : 1);
      var tIdx = nextTarget();
      if (tIdx >= 0) {
        var fIdx = -1, bd = 1e9, nd = nodes[tIdx];
        for (var f = 0; f < frags.length; f++) {
          if (frags[f].state !== 0) continue;
          var d = Math.abs(frags[f].y - nd.y) + Math.abs(frags[f].x - axisX) * 0.3;
          if (d < bd) { bd = d; fIdx = f; }
        }
        if (fIdx >= 0) { var p = frags[fIdx]; p.state = 1; p.node = tIdx; p.t = 0; p.sx = p.x; p.sy = p.y; nd.assigned = true; }
      }
    }

    // advance seekers; lock on arrival
    for (var s = 0; s < frags.length; s++) {
      var q = frags[s]; if (q.state !== 1) continue;
      q.t += dt * 1.5; var e = easeOut(Math.min(1, q.t)); var n2 = nodes[q.node];
      q.x = q.sx + (n2.x - q.sx) * e; q.y = q.sy + (n2.y - q.sy) * e;
      if (q.t >= 1) { n2.fill = Math.min(1, n2.fill + rnd(0.5, 0.9)); n2.lock = 1; n2.assigned = false; frags[s] = spawnFrag(); }
    }
  }

  // small horizontal ripple on the filled spine so it reads as a live trace
  function wave(y, t, fill) { return Math.sin(y * 0.045 + t * 2.2) * 2.6 * fill; }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);

    // faint axis guide
    ctx.strokeStyle = rgb(C.line, 0.12); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(axisX, yTop - 8); ctx.lineTo(axisX, yBot + 8); ctx.stroke();

    // evidence noise (parallax drift)
    for (var i = 0; i < frags.length; i++) {
      var p = frags[i]; if (p.state !== 0) continue;
      p.x = p.hx + Math.cos(t * p.sp + p.ph) * p.amp + par.x;
      p.y = p.hy + Math.sin(t * p.sp * 0.8 + p.ph) * p.amp * 0.7 + par.y;
      var tw = 0.45 + 0.3 * Math.sin(t * 1.5 + p.ph);
      dot(p.x, p.y, p.r, C.dim, 0.26 + 0.2 * tw, 0);
    }

    // signal line through the spine (brightness from resolution)
    ctx.lineWidth = MOBILE ? 1.4 : 1.8; ctx.lineJoin = "round";
    for (var n = 0; n < nodes.length - 1; n++) {
      var a = nodes[n], b = nodes[n + 1], seg = Math.min(a.fill, b.fill);
      if (seg <= 0.04) continue;
      ctx.strokeStyle = rgb(C.signal, 0.16 + 0.5 * seg);
      ctx.beginPath();
      ctx.moveTo(a.x + wave(a.y, t, a.fill), a.y);
      ctx.lineTo(b.x + wave(b.y, t, b.fill), b.y);
      ctx.stroke();
    }

    // seekers (incoming evidence) + their resolving threads
    for (i = 0; i < frags.length; i++) {
      var q = frags[i]; if (q.state !== 1) continue; var nd = nodes[q.node];
      ctx.strokeStyle = rgb(C.signal, 0.16 * (1 - q.t)); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(q.x, q.y); ctx.lineTo(nd.x, nd.y); ctx.stroke();
      dot(q.x, q.y, 1.6, C.signal, 0.72, SFX ? 5 : 0);
    }

    // sweep band — the "live" oscilloscope pass
    var sy = yTop + sweep * (yBot - yTop);
    if (SFX) {
      var g = ctx.createLinearGradient(0, sy - 32, 0, sy + 32);
      g.addColorStop(0, rgb(C.signal, 0)); g.addColorStop(0.5, rgb(C.signal, 0.09)); g.addColorStop(1, rgb(C.signal, 0));
      ctx.fillStyle = g; ctx.fillRect(axisX - 2.5, sy - 32, 5, 64);
    }

    // spine nodes + lock / review states
    for (n = 0; n < nodes.length; n++) {
      var node = nodes[n];
      var prox = Math.max(0, 1 - Math.abs(node.y - sy) / (H * 0.13));
      var col = C.signal, a2 = 0.22 + 0.55 * node.fill + prox * 0.4 * node.fill;
      var rad = 1.7 + 2.3 * node.fill + prox * 1.3 * node.fill;
      if (node.review > 0) { col = C.review; a2 = Math.max(a2, 0.5 + 0.4 * node.review); }
      dot(node.x, node.y, rad, col, a2, SFX ? (3 + prox * 8 * node.fill) : 0);
      if (node.lock > 0) {
        var lk = node.lock;
        ctx.strokeStyle = rgb(C.lock, lk * 0.9); ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(node.x, node.y, rad + (1 - lk) * 13, 0, 6.2832); ctx.stroke();
        dot(node.x, node.y, rad, C.lock, lk * 0.8, SFX ? 10 * lk : 0);
      }
      if (node.review > 0) {
        ctx.strokeStyle = rgb(C.review, node.review * 0.8); ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(node.x, node.y, rad + 3.5, 0, 6.2832); ctx.stroke();
      }
    }
    if (SFX) dot(axisX, sy, 2, C.signal, 0.5, 10);
  }

  function frame(now) {
    var dt = Math.min(0.05, (now - last) / 1000); last = now;
    update(dt, now / 1000); draw(now / 1000);
  }

  function staticFrame() {
    // composed, message-legible still: scatter left, resolved signal right
    for (var n = 0; n < nodes.length; n++) nodes[n].fill = (n < nodes.length * 0.72) ? 1 : (n < nodes.length * 0.82 ? 0.5 : 0);
    draw(0);
  }

  if (!TOUCH && !MOBILE) {
    stage.addEventListener("pointermove", function (ev) {
      var r = stage.getBoundingClientRect();
      par.tx = ((ev.clientX - r.left) / r.width - 0.5) * 10;
      par.ty = ((ev.clientY - r.top) / r.height - 0.5) * 8;
    });
    stage.addEventListener("pointerleave", function () { par.tx = 0; par.ty = 0; });
  }

  function boot() {
    readColors(); layout();
    if (!W || !H) { requestAnimationFrame(boot); return; }
    if (REDUCED) { staticFrame(); return; }
    last = performance.now();
    if (window.DamarosAnim) DamarosAnim.loop({ root: stage, onFrame: frame }).start();
    else (function spin(now) { frame(now); requestAnimationFrame(spin); })(last);
  }

  var rt;
  window.addEventListener("resize", function () {
    clearTimeout(rt); rt = setTimeout(function () { layout(); if (REDUCED) staticFrame(); }, 150);
  });
  if (window.ResizeObserver) {
    var ro;
    new ResizeObserver(function () { clearTimeout(ro); ro = setTimeout(function () { layout(); if (REDUCED) staticFrame(); }, 90); }).observe(stage);
  }
  new MutationObserver(function () { readColors(); if (REDUCED) staticFrame(); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  var schemeMq = window.matchMedia("(prefers-color-scheme: light)");
  var onScheme = function () { readColors(); if (REDUCED) staticFrame(); };
  if (schemeMq.addEventListener) schemeMq.addEventListener("change", onScheme);
  else if (schemeMq.addListener) schemeMq.addListener(onScheme);

  if (document.readyState !== "loading") boot();
  else document.addEventListener("DOMContentLoaded", boot);
})();
