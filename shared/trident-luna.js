/* ============================================================
 * Trident & Luna - substrate mini-animations.
 *   trident: raw protocol particles COMPILE into ordered logic.
 *   luna:    a governed orbit that RECORDS each run (pulse + stamp).
 * ============================================================ */
(function () {
  var nodes = [].slice.call(document.querySelectorAll("canvas.mini"));
  if (!nodes.length) return;
  var REDUCED = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var DPR = Math.min(2, window.devicePixelRatio || 1);
  var minis = [];

  function hexToRgb(h) { if (!h || h.charAt(0) !== "#") return null; h = h.slice(1); if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2]; var n = parseInt(h, 16); return [(n>>16)&255,(n>>8)&255,n&255]; }
  function colors() {
    var cs = getComputedStyle(document.documentElement), g = function (n) { return cs.getPropertyValue(n).trim(); };
    return { blue: hexToRgb(g("--accent-2")) || [169,192,214], green: hexToRgb(g("--locked")) || [60,200,140],
             purple: hexToRgb(g("--luna")) || [192,132,252],
             line: hexToRgb(g("--bd-strong")) || [70,84,100], dim: hexToRgb(g("--fg-3")) || [120,134,150] };
  }
  function rgb(c, a) { return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + (a<0?0:a>1?1:a) + ")"; }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function smooth(t) { t = t<0?0:t>1?1:t; return t*t*(3-2*t); }

  function layout(m) {
    var r = m.cv.getBoundingClientRect(); m.W = r.width; m.H = r.height; if (!m.W || !m.H) return;
    m.cv.width = Math.round(m.W * DPR); m.cv.height = Math.round(m.H * DPR); m.ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    var cx = m.W * 0.5, cy = m.H * 0.5;
    if (m.mode === "trident") {
      var N = 30, R = Math.min(m.W, m.H) * 0.36;
      m.cx = cx; m.cy = m.H * 0.46; m.R = R;
      m.dots = [];
      for (var i = 0; i < N; i++) {
        var a = i * 2.39996, rr = Math.sqrt((i + 0.5) / N) * R;
        m.dots.push({ ox: m.cx + Math.cos(a) * rr, oy: m.cy + Math.sin(a) * rr * 0.86, ph: rnd(0, 6.28) });
      }
      m.nbr = [];
      for (var p = 0; p < N; p++) {
        var ds = [];
        for (var q = 0; q < N; q++) { if (p === q) continue; var ddx = m.dots[p].ox - m.dots[q].ox, ddy = m.dots[p].oy - m.dots[q].oy; ds.push([ddx*ddx+ddy*ddy, q]); }
        ds.sort(function (a2, b2) { return a2[0] - b2[0]; });
        m.nbr[p] = [ds[0][1], ds[1][1], ds[2][1], ds[3][1]];
      }
      m.act = []; for (var z = 0; z < N; z++) m.act[z] = 0;
      m.disp = []; for (var z2 = 0; z2 < N; z2++) m.disp[z2] = 0;
      m.lastStep = 0; m.lastSeed = 0; m.prevNow = 0;
    } else {
      m.cx = cx; m.cy = m.H * 0.47; m.R = Math.min(m.W, m.H) * 0.4;
      m.rings = [
        { rx: m.R * 0.96, ry: m.R * 0.36, dir: 1,  speed: 0.042 },
        { rx: m.R * 0.70, ry: m.R * 0.26, dir: -1, speed: 0.052 },
        { rx: m.R * 0.46, ry: m.R * 0.17, dir: 1,  speed: 0.062 }
      ];
      m.dots = [];
      var dotR = 0.52, spacing = dotR * 2.05;
      for (var ri = 0; ri < m.rings.length; ri++) {
        var ring = m.rings[ri];
        var approx = Math.PI * (3 * (ring.rx + ring.ry) - Math.sqrt((3 * ring.rx + ring.ry) * (ring.rx + 3 * ring.ry)));
        var count = Math.max(32, Math.round(approx / spacing));
        for (var j = 0; j < count; j++) {
          m.dots.push({ ring: ri, theta: (j / count) * 6.2832, ph: rnd(0, 6.28), size: dotR * rnd(0.94, 1.06) });
        }
      }
    }
  }

  function drawTrident(m, now) {
    var ctx = m.ctx, C = m.C, t = now / 1000, N = m.dots.length;
    ctx.clearRect(0, 0, m.W, m.H);
    // slow rotation of the phyllotaxis disk (stays centered)
    var ang = t * 0.05, ca = Math.cos(ang), sa = Math.sin(ang), px = [], py = [];
    for (var i = 0; i < N; i++) {
      var ox = m.dots[i].ox - m.cx, oy = m.dots[i].oy - m.cy;
      px[i] = m.cx + ox * ca - oy * sa; py[i] = m.cy + ox * sa + oy * ca;
    }
    // seed one gentle pulse every few seconds (calm, not hectic)
    if (now - m.lastSeed > 3400) { m.act[Math.floor(Math.random() * N)] = 1; m.lastSeed = now; }
    // advance the spread on a slow fixed cadence, decoupled from frame rate
    if (now - m.lastStep > 105) {
      m.lastStep = now;
      var nxt = [];
      for (var a3 = 0; a3 < N; a3++) {
        var bv = m.act[a3] * 0.84, nb = m.nbr[a3];
        for (var n = 0; n < nb.length; n++) { var nv = m.act[nb[n]] * 0.78; if (nv > bv) bv = nv; }
        nxt[a3] = bv < 0.02 ? 0 : bv;
      }
      m.act = nxt;
    }
    // ease a smooth display value toward the stepped activation (no visible stepping)
    var dts = m.prevNow ? Math.min(0.05, (now - m.prevNow) / 1000) : 0.016; m.prevNow = now;
    var ek = Math.min(1, dts * 8);
    for (var di = 0; di < N; di++) m.disp[di] += ((m.act[di] || 0) - m.disp[di]) * ek;
    // synapses
    for (var e = 0; e < N; e++) {
      var nb2 = m.nbr[e];
      for (var f = 0; f < nb2.length; f++) {
        var k = nb2[f]; if (k < e) continue;
        var ae = m.disp[e] || 0, ak = m.disp[k] || 0, act = Math.max(ae, ak), fired = act > 0.06;
        ctx.strokeStyle = fired ? rgb(C.blue, 0.14 + act * 0.5) : rgb(C.line, 0.22);
        ctx.lineWidth = fired ? 1 + act * 0.5 : 1;
        ctx.beginPath(); ctx.moveTo(px[e], py[e]); ctx.lineTo(px[k], py[k]); ctx.stroke();
        if (act > 0.16) { // a spike travels the synapse from the more-charged node
          var hi = ae >= ak, sx = hi ? px[e] : px[k], sy = hi ? py[e] : py[k];
          var dxp = (hi ? px[k] : px[e]) - sx, dyp = (hi ? py[k] : py[e]) - sy;
          var seed = ((e * 73 + k * 131) % 97) / 97, fr = (t * 0.5 + seed) % 1, env = Math.sin(fr * Math.PI);
          ctx.fillStyle = rgb(C.blue, act * env * 0.9);
          ctx.beginPath(); ctx.arc(sx + dxp * fr, sy + dyp * fr, 1.3 + act * 1.4, 0, 6.2832); ctx.fill();
        }
      }
    }
    ctx.lineWidth = 1;
    // nodes
    for (var d = 0; d < N; d++) {
      var aav = m.disp[d] || 0, pl = 0.5 + 0.5 * Math.sin(t * 0.7 + m.dots[d].ph);
      ctx.fillStyle = rgb(C.blue, Math.min(1, 0.4 + 0.24 * pl + aav * 0.5));
      if (aav > 0.1) { ctx.shadowColor = rgb(C.blue, 0.9); ctx.shadowBlur = 3 + aav * 4; }
      ctx.beginPath(); ctx.arc(px[d], py[d], 1.4 + pl * 0.5 + aav * 1.8, 0, 6.2832); ctx.fill(); ctx.shadowBlur = 0;
    }
  }

  function drawLuna(m, now) {
    var ctx = m.ctx, C = m.C, t = now / 1000;
    ctx.clearRect(0, 0, m.W, m.H);
    for (var j = 0; j < m.dots.length; j++) {
      var d = m.dots[j], ring = m.rings[d.ring];
      var a = d.theta + t * ring.speed * ring.dir;
      var x = m.cx + Math.cos(a) * ring.rx, y = m.cy + Math.sin(a) * ring.ry;
      var pl = 0.5 + 0.5 * Math.sin(t * 1.1 + d.ph);
      ctx.fillStyle = rgb(C.purple, 0.52 + 0.4 * pl);
      ctx.shadowColor = rgb(C.purple, 0.82); ctx.shadowBlur = 1.5 + pl * 1.8;
      ctx.beginPath(); ctx.arc(x, y, d.size * (0.92 + 0.08 * pl), 0, 6.2832); ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  function caption(m, txt, C) {
    var ctx = m.ctx;
    ctx.font = '600 8px "Space Grotesk", ui-monospace, monospace';
    ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    ctx.save(); ctx.letterSpacing = "1.5px"; ctx.fillStyle = rgb(C.dim, 0.7);
    ctx.fillText(txt, m.W * 0.5, m.H - 10); ctx.restore();
  }

  function tick(now) {
    for (var i = 0; i < minis.length; i++) { var m = minis[i]; if (!m.W) continue; if (m.mode === "trident") drawTrident(m, now); else drawLuna(m, now); }
    requestAnimationFrame(tick);
  }

  function staticOne(m) { if (!m.W) return; var now = performance.now(); if (m.mode === "trident") drawTrident(m, now); else drawLuna(m, now); }

  function init() {
    var C = colors();
    nodes.forEach(function (cv) { var m = { cv: cv, ctx: cv.getContext("2d"), mode: cv.dataset.mode, C: C, W: 0, H: 0, dots: [] }; minis.push(m); layout(m); });
    if (REDUCED) { minis.forEach(staticOne); return; }
    requestAnimationFrame(tick);
  }
  var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(function () { minis.forEach(layout); if (REDUCED) minis.forEach(staticOne); }, 150); });
  new MutationObserver(function () { var C = colors(); minis.forEach(function (m) { m.C = C; }); if (REDUCED) minis.forEach(staticOne); }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  if (document.readyState !== "loading") init(); else document.addEventListener("DOMContentLoaded", init);
})();
