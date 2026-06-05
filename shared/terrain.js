/* ============================================================
 * DAMAROS — Terrain. A flythrough of one continuous governed landscape.
 *
 * A virtual camera WEAVES across a single wireframe terrain — turning, banking,
 * and changing depth — stopping at ten LANDMARKS placed at varied lateral
 * offsets, heights, and distances (not a straight dolly). Navigation is
 * deliberate: click · arrow keys · dots · swipe · wheel-nudge; every move is a
 * timed, eased camera FLIGHT (turn + lift + settle). On approach each landmark
 * ASSEMBLES — parts converge, rings draw on, the core condenses — and a settle
 * pulse fires on arrival. Each landmark has its own motion + cursor interaction
 * while sharing one design language (additive bloom · wireframe · colour=state).
 *
 * Pseudo-3D in canvas 2D (universal, no WebGL): a perspective camera with
 * position (x,z) and heading (yaw) over a height-field. The horizon sky is
 * tinted by — and glows toward — the landmark you are travelling to.
 *
 * Self-contained, ES5.
 * ============================================================ */
(function (global) {
  "use strict";

  /* ---------- math ---------- */
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function smooth(e0, e1, x) { var t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); }
  function easeInOut(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function lerpAngle(a, b, t) { var d = b - a; while (d > Math.PI) d -= TAU; while (d < -Math.PI) d += TAU; return a + d * t; }
  function mkRng(seed) { var s = seed >>> 0 || 1; return function () { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
  var TAU = Math.PI * 2;

  /* ---------- palette ---------- */
  var C = {};
  function hex(h) { h = (h || "").trim(); if (h.charAt(0) !== "#") return null; h = h.slice(1); if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2]; var n = parseInt(h, 16); return [(n>>16)&255,(n>>8)&255,n&255]; }
  function readPalette() {
    var cs = getComputedStyle(document.documentElement), g = function (n, f) { return hex(cs.getPropertyValue(n)) || f; };
    C.jet=g("--jet",[5,7,10]); C.jet2=g("--jet2",[12,16,22]); C.cold=g("--cold",[232,236,240]);
    C.steel=g("--steel",[169,192,214]); C.deep=g("--deep",[47,95,140]); C.amber=g("--amber",[217,162,62]);
    C.breach=g("--breach",[242,86,110]); C.dim=g("--dim",[124,138,153]); C.ok=g("--ok",[91,185,140]);
    C.luna=g("--luna",[140,124,240]);
  }
  function rgba(c, a) { a = a < 0 ? 0 : a > 1 ? 1 : a; return "rgba(" + (c[0]|0) + "," + (c[1]|0) + "," + (c[2]|0) + "," + a + ")"; }
  function mixc(a, b, t) { return [lerp(a[0],b[0],t), lerp(a[1],b[1],t), lerp(a[2],b[2],t)]; }
  function stateCol(s){ switch(s){ case "pass": case "ok": case "ready": return C.ok; case "review": case "amber": return C.amber;
    case "fail": case "breach": return C.breach; case "deep": return C.deep; case "cold": return C.cold; case "luna": return C.luna; default: return C.steel; } }

  /* ---------- additive glow sprite cache ---------- */
  var glowCache = {};
  function glowSprite(col) {
    var key = (col[0]|0)+"_"+(col[1]|0)+"_"+(col[2]|0);
    if (glowCache[key]) return glowCache[key];
    var s = 128, c = document.createElement("canvas"); c.width = c.height = s;
    var x = c.getContext("2d"), g = x.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);
    g.addColorStop(0.0, "rgba("+(col[0]|0)+","+(col[1]|0)+","+(col[2]|0)+",1)");
    g.addColorStop(0.18,"rgba("+(col[0]|0)+","+(col[1]|0)+","+(col[2]|0)+",0.55)");
    g.addColorStop(0.55,"rgba("+(col[0]|0)+","+(col[1]|0)+","+(col[2]|0)+",0.12)");
    g.addColorStop(1.0, "rgba("+(col[0]|0)+","+(col[1]|0)+","+(col[2]|0)+",0)");
    x.fillStyle = g; x.fillRect(0,0,s,s); glowCache[key] = c; return c;
  }
  function bloom(x, y, r, col, a) {
    if (a <= 0 || r <= 0) return;
    ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = clamp(a,0,1);
    var sp = glowSprite(col || C.steel); ctx.drawImage(sp, x-r, y-r, r*2, r*2); ctx.restore();
  }

  /* fibonacci sphere directions */
  var sphereCache = {};
  function sphereDirs(n) {
    if (sphereCache[n]) return sphereCache[n];
    var pts = [], off = 2/n, inc = Math.PI*(3-Math.sqrt(5)), i;
    for (i=0;i<n;i++){ var y=i*off-1+off/2, rr=Math.sqrt(Math.max(0,1-y*y)), phi=i*inc;
      pts.push([Math.cos(phi)*rr, y, Math.sin(phi)*rr]); }
    sphereCache[n] = pts; return pts;
  }

  /* ============================================================
   * Landmarks — placed for SPATIAL VARIETY:
   *   z     lateral offset of the path point (the path meanders → camera turns)
   *   lift  monument height above the terrain (some tower, some sit low)
   *   rest  camera view-distance (some viewed close & large, some far & small)
   *   bias  framing yaw offset (monument frames left / centre / right)
   * accent = doctrine colour (also tints + glows the sky you travel toward).
   * ============================================================ */
  var STATIONS = [
    { kind:"opening",   accent:"steel", z:   0, lift: 2.8, rest: 10.5, bias:  0.00 },
    { kind:"protocol",  accent:"deep",  z:  11, lift: 2.6, rest:  9.0, bias: -0.16 },
    { kind:"evidence",  accent:"cold",  z: -10, lift: 2.8, rest: 11.5, bias:  0.19 },
    { kind:"screening", accent:"amber", z:  13, lift: 2.5, rest:  8.5, bias: -0.15 },
    { kind:"replay",    accent:"luna",  z: -12, lift: 2.8, rest: 12.0, bias:  0.17 },
    { kind:"trident",   accent:"steel", z:   9, lift: 2.6, rest:  9.0, bias: -0.19 },
    { kind:"luna",      accent:"luna",  z:  -9, lift: 2.7, rest: 10.0, bias:  0.15 },
    { kind:"node",      accent:"ok",    z:  12, lift: 2.4, rest:  8.0, bias: -0.13 },
    { kind:"console",   accent:"deep",  z: -13, lift: 2.7, rest: 10.5, bias:  0.16 },
    { kind:"final",     accent:"ok",    z:   0, lift: 2.8, rest: 11.0, bias:  0.00 }
  ];
  var N = STATIONS.length;

  var SPACING = 30;      // forward units between landmarks (with the z meander → banking turns)
  var EYE = 4.2;         // eye height above terrain
  var PITCH = 0.23;      // downward camera tilt
  var ZH = 34;          // terrain band half-width
  var FAR = 92;          // furthest rendered row

  // rolling terrain WITH FEATURES — ridge crests + finer sharp detail between
  // landmarks so the travel itself has something to read.
  function terrainH(x, z) {
    return 1.7 * Math.sin(x * 0.15 + z * 0.10)
         + 1.05 * Math.sin(x * 0.07 - z * 0.18 + 1.3)
         + 0.6 * Math.sin(z * 0.30 + x * 0.025)
         + 0.95 * (1 - Math.abs(Math.sin(x * 0.05 + z * 0.028)))   // ridge crests
         + 0.34 * Math.sin(x * 0.46 + z * 0.40)                    // finer sharp detail
         + 0.4 * Math.sin(x * 0.30 + 2.1);
  }

  // precompute the meandering path: each station's world point, the camera rest
  // pose (position behind the landmark along the path tangent) and heading.
  function buildPath() {
    var i;
    for (i = 0; i < N; i++) { STATIONS[i].px = i * SPACING; STATIONS[i].pz = STATIONS[i].z; }
    for (i = 0; i < N; i++) {
      var p0 = STATIONS[i > 0 ? i - 1 : i], p1 = STATIONS[i < N - 1 ? i + 1 : i];
      var tx = p1.px - p0.px, tz = p1.pz - p0.pz, tl = Math.sqrt(tx * tx + tz * tz) || 1;
      tx /= tl; tz /= tl;
      STATIONS[i].camx = STATIONS[i].px - STATIONS[i].rest * tx;
      STATIONS[i].camz = STATIONS[i].pz - STATIONS[i].rest * tz;
      STATIONS[i].yaw = Math.atan2(tz, tx) + STATIONS[i].bias;
    }
  }

  /* ---------- engine state ---------- */
  var MOBILE = (window.matchMedia && matchMedia("(hover: none),(pointer: coarse)").matches) || window.innerWidth <= 820;
  var REDUCED = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var DPR = MOBILE ? 1 : Math.min(2, window.devicePixelRatio || 1);

  var cv, ctx, W = 0, H = 0;
  var cur = 0, targetIdx = 0;
  var camPX = 0, camPZ = 0, camYaw = 0;
  var fromPX = 0, fromPZ = 0, fromYaw = 0, toPX = 0, toPZ = 0, toYaw = 0;
  var flying = false, flightT = 0, flightDur = 1.5;
  var idle = 0, t0 = now(), lastT = t0;
  var firstFramePainted = false, running = true;
  var arriveFlash = 0;                      // one-time assembly-complete pulse
  var ptrX = -1, ptrY = -1, ptrHas = false, ptrSX = 0, ptrSY = 0;
  var wheelAcc = 0, wheelLock = 0;
  var caps = [], dots = [], counterEl = null, progEl = null, btnPrev = null, btnNext = null;

  function now() { return (window.performance && performance.now) ? performance.now() : Date.now(); }

  /* ---------- projection (position + heading + pitch) ---------- */
  var NEAR = 0.7, cosP = Math.cos(PITCH), sinP = Math.sin(PITCH);
  var P = { sx: 0, sy: 0, depth: 0, vis: false };
  var cxs = 0, cys = 0, FOC = 0, eyeY = 0, cosY = 1, sinY = 0, roll = 0, cosR = 1, sinR = 0;
  function project(wx, wy, wz) {
    var dx = wx - camPX, dy = wy - eyeY, dz = wz - camPZ;
    var fwd = dx * cosY + dz * sinY, rt = -dx * sinY + dz * cosY;
    var camFwd = fwd * cosP - dy * sinP;
    if (camFwd < NEAR) { P.vis = false; P.depth = camFwd; return P; }
    var sx = cxs + FOC * rt / camFwd, sy = cys - FOC * (fwd * sinP + dy * cosP) / camFwd;
    if (roll !== 0) { var ox = sx - cxs, oy = sy - cys; sx = cxs + ox * cosR - oy * sinR; sy = cys + ox * sinR + oy * cosR; }  // bank into turns
    if (sx < -2*W) sx = -2*W; else if (sx > 3*W) sx = 3*W;
    if (sy < -2*H) sy = -2*H; else if (sy > 3*H) sy = 3*H;
    P.sx = sx; P.sy = sy; P.depth = camFwd; P.vis = true; return P;
  }

  /* ---------- cursor helpers (screen space) ---------- */
  function prox(px, py, r) { if (!ptrHas) return 0; var dx = ptrSX - px, dy = ptrSY - py, d = Math.sqrt(dx*dx+dy*dy); return clamp(1 - d / (r || 160), 0, 1); }
  function pull(px, py, k, r) { if (!ptrHas) return { dx:0, dy:0, pr:0 }; var dx = ptrSX - px, dy = ptrSY - py, d = Math.sqrt(dx*dx+dy*dy) || 1, pr = clamp(1 - d / (r || 200), 0, 1), f = pr*pr*(k==null?9:k); return { dx: dx/d*f, dy: dy/d*f, pr: pr }; }

  /* ---------- sky ---------- */
  var stars = null;
  function buildStars() { var n = MOBILE ? 40 : 90, r = mkRng(7), i; stars = []; for (i=0;i<n;i++) stars.push({ x:r(), y:r()*0.5, s:0.4+r()*1.3, ph:r()*TAU, tw:0.4+r()*0.8 }); }
  function drawSky(skyCol, horizonY, glowX) {
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, rgba(C.jet, 1));
    g.addColorStop(clamp(horizonY/H - 0.12, 0, 1), rgba([8,11,16], 1));
    g.addColorStop(clamp(horizonY/H, 0, 1), rgba(mixc(C.jet2, skyCol, 0.18), 1));
    g.addColorStop(1, rgba(C.jet, 1));
    ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    if (stars && !REDUCED) { ctx.save(); ctx.globalCompositeOperation = "lighter";
      for (var i=0;i<stars.length;i++){ var s=stars[i], yy=s.y*horizonY, a=0.10+0.16*(0.5+0.5*Math.sin(idle*s.tw+s.ph));
        ctx.fillStyle=rgba(C.steel, a*0.7); ctx.beginPath(); ctx.arc(s.x*W, yy, s.s, 0, TAU); ctx.fill(); } ctx.restore(); }
    var hb = 0.5 + 0.5 * Math.sin(idle * 0.5);
    bloom(glowX, horizonY, Math.max(W,H) * 0.46, skyCol, 0.11 + 0.05 * hb);
    bloom(glowX, horizonY, Math.max(W,H) * 0.24, mixc(skyCol, C.cold, 0.3), 0.06 + 0.04 * hb);
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    var hg = ctx.createLinearGradient(0, 0, W, 0);
    hg.addColorStop(0, rgba(skyCol, 0)); hg.addColorStop(0.5, rgba(skyCol, 0.5)); hg.addColorStop(1, rgba(skyCol, 0));
    ctx.fillStyle = hg; ctx.fillRect(0, horizonY - 0.6, W, 1.2); ctx.restore();
  }

  /* ---------- terrain (heading-aware) ---------- */
  function drawTerrain(nearCol, farCol) {
    var ROWS = MOBILE ? 30 : 56, COLS = MOBILE ? 24 : 48, r, c;
    var fX = cosY, fZ = sinY, rX = -sinY, rZ = cosY;     // forward / right on the ground plane
    for (r = 0; r < ROWS; r++) {
      var fr = r / (ROWS - 1), d = 1.4 + (FAR - 1.4) * fr * fr, fog = clamp(1 - d / FAR, 0, 1); fog *= fog;
      var col = mixc(farCol, nearCol, fog), a = 0.06 + 0.5 * fog;
      ctx.strokeStyle = rgba(col, a); ctx.lineWidth = 1;
      ctx.beginPath(); var started = false, peakX = 0, peakY = 0, peakUp = 1e9;
      for (c = 0; c <= COLS; c++) {
        var s = ((c / COLS) - 0.5) * 2 * ZH;
        var wx = camPX + d * fX + s * rX, wz = camPZ + d * fZ + s * rZ;
        project(wx, terrainH(wx, wz), wz);
        if (P.vis) { if (!started) { ctx.moveTo(P.sx, P.sy); started = true; } else ctx.lineTo(P.sx, P.sy);
          if (P.sy < peakUp) { peakUp = P.sy; peakX = P.sx; peakY = P.sy; } } else started = false;
      }
      ctx.stroke();
      if (fog > 0.55 && !MOBILE) bloom(peakX, peakY, 26 * fog, nearCol, 0.05 * fog);
    }
    var LN = MOBILE ? 9 : 15;
    for (c = 0; c <= LN; c++) {
      var s2 = ((c / LN) - 0.5) * 2 * ZH;
      ctx.strokeStyle = rgba(mixc(farCol, nearCol, 0.5), 0.05); ctx.lineWidth = 1;
      ctx.beginPath(); var st2 = false;
      for (r = 0; r < ROWS; r += 2) {
        var fr2 = r / (ROWS - 1), d2 = 1.4 + (FAR - 1.4) * fr2 * fr2;
        var wx2 = camPX + d2 * fX + s2 * rX, wz2 = camPZ + d2 * fZ + s2 * rZ;
        project(wx2, terrainH(wx2, wz2), wz2);
        if (P.vis) { if (!st2) { ctx.moveTo(P.sx, P.sy); st2 = true; } else ctx.lineTo(P.sx, P.sy); } else st2 = false;
      }
      ctx.stroke();
    }
  }

  /* ---------- monument primitives ---------- */
  function ring(cx, cy, r, col, a, flat, seg, gap, rot, lw) {
    if (a <= 0 || r <= 0.5) return;
    ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.strokeStyle = rgba(col, a); ctx.lineWidth = lw || 1.2;
    var ry = r * (flat == null ? 1 : flat);
    if (!seg) { ctx.beginPath(); ctx.ellipse(cx, cy, r, ry, rot || 0, 0, TAU); ctx.stroke(); }
    else { var step = TAU / seg, i; for (i=0;i<seg;i++){ var a0=(rot||0)+i*step+(gap||0)*0.5, a1=(rot||0)+(i+1)*step-(gap||0)*0.5;
      ctx.beginPath(); ctx.ellipse(cx, cy, r, ry, 0, a0, a1); ctx.stroke(); } }
    ctx.restore();
  }
  function mnode(cx, cy, r, col, a) {
    if (a <= 0) return;
    bloom(cx, cy, r * 5, col, a * 0.4);
    ctx.globalCompositeOperation = "source-over"; ctx.fillStyle = rgba(col, a);
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill();
    ctx.fillStyle = rgba(C.cold, a * 0.5); ctx.beginPath(); ctx.arc(cx, cy, r * 0.42, 0, TAU); ctx.fill();
  }
  function link(x1, y1, x2, y2, col, a, lw) {
    if (a <= 0) return; ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.strokeStyle = rgba(col, a); ctx.lineWidth = lw || 1;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore();
  }
  function orbCloud(cx, cy, R, col, hot, charge, yaw, n, spread) {
    var dirs = sphereDirs(n), pitch = 0.5, cyaw = Math.cos(yaw), syaw = Math.sin(yaw), cpit = Math.cos(pitch), spit = Math.sin(pitch);
    spread = spread == null ? 1 : spread;
    bloom(cx, cy, R * 1.9 * spread, C.deep, 0.12 + 0.14 * charge);
    bloom(cx, cy, R * 0.95, col, 0.08 + 0.16 * charge);
    var pr = orbCloud._b || (orbCloud._b = []); pr.length = 0;
    for (var i=0;i<n;i++){ var d=dirs[i], x=d[0],y=d[1],z=d[2];
      var x1=x*cyaw+z*syaw, z1=-x*syaw+z*cyaw, y2=y*cpit-z1*spit, z2=y*spit+z1*cpit; pr.push([x1,y2,z2]); }
    pr.sort(function(a,b){ return a[2]-b[2]; });
    ctx.globalCompositeOperation = "lighter";
    for (var j=0;j<n;j++){ var pp=pr[j], depth=(pp[2]+1)*0.5, sc=(1/(1-pp[2]*0.28))*spread;
      var px=cx+pp[0]*R*sc, py=cy+pp[1]*R*sc*0.92, b=0.12+0.88*depth, rr=(0.6+1.4*depth)*(0.85+0.4*charge);
      var cc=mixc(col, hot, depth*depth*0.7*charge);
      if (b > 0.45) bloom(px, py, rr*3.6, cc, (0.06+0.18*b)*charge);
      ctx.fillStyle=rgba(cc,(0.3+0.5*b)*charge); ctx.beginPath(); ctx.arc(px,py,rr,0,TAU); ctx.fill(); }
    ctx.globalCompositeOperation = "source-over";
  }

  /* ---------- a satellite that assembles (scatter→lock) + leans to the cursor ---------- */
  function satellite(cx, cy, baseR, ang, flat, col, a, asm, pulse) {
    var r = baseR * lerp(2.4, 1.0, asm), scatter = (1 - asm) * 0.5;
    var aa = ang + Math.sin(ang * 3.1) * scatter;
    var x = cx + Math.cos(aa) * r, y = cy + Math.sin(aa) * r * (flat == null ? 0.9 : flat);
    var pl = pull(x, y, 8, 150); x += pl.dx; y += pl.dy;
    var lit = a * (0.28 + 0.72 * asm) * (pulse == null ? 1 : pulse) + pl.pr * 0.35;
    mnode(x, y, 1.4 + pl.pr * 1.1, col, lit);
    return { x: x, y: y, pr: pl.pr };
  }

  // a plated polygon outline (machined forms — protocol)
  function polygon(cx, cy, r, sides, col, a, rot, flat, lw) {
    if (a <= 0 || r <= 0.5) return;
    ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.strokeStyle = rgba(col, a); ctx.lineWidth = lw || 1.2;
    ctx.beginPath(); for (var i = 0; i <= sides; i++) { var ang = (rot || 0) + (i / sides) * TAU, x = cx + Math.cos(ang) * r, y = cy + Math.sin(ang) * r * (flat == null ? 1 : flat); if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
    ctx.stroke(); ctx.restore();
  }
  // a tiny verdict mark (screening resolves under the cursor): tick / cross / ring
  function glyphMark(x, y, state, col, a) {
    if (a <= 0.02) return; ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.strokeStyle = rgba(col, 0.75 * a); ctx.lineWidth = 1.4; ctx.beginPath();
    if (state === "pass" || state === "ok") { ctx.moveTo(x - 3, y); ctx.lineTo(x - 1, y + 3); ctx.lineTo(x + 4, y - 3); }
    else if (state === "fail" || state === "breach") { ctx.moveTo(x - 3, y - 3); ctx.lineTo(x + 3, y + 3); ctx.moveTo(x + 3, y - 3); ctx.lineTo(x - 3, y + 3); }
    else { ctx.arc(x, y, 3, 0, TAU); }
    ctx.stroke(); ctx.restore();
  }

  /* ============================================================
   * Monuments — each landmark its OWN form (the orb is reserved for the
   * Opening/Final bookends). Each ASSEMBLES with `asm` (0→1 on approach) and
   * responds to the cursor. Node and the Sponsor (Console) share the green
   * verified-signal motif — it lifts off the Node and arrives into the Sponsor.
   * ============================================================ */
  function drawMonument(st, sx, sy, scale, near, asm, a) {
    if (a <= 0.003) return;
    var col = C[st.accent] || C.steel, Rm = 3.0 * scale, t = idle, yaw = t * 0.14, k = st.kind;
    var charge = 0.35 + 0.65 * asm;
    var hov = prox(sx, sy, Rm * 1.7);
    bloom(sx, sy, Rm * (2.0 + hov * 0.6), col, (0.05 + 0.05 * hov) * a);

    if (k === "opening" || k === "final") {
      // THE EXECUTION CORE — the one orb (signature; bookends only)
      orbCloud(sx, sy, Rm * 0.5, C.steel, C.cold, charge, yaw, MOBILE ? 90 : 200, lerp(1.7, 1.0, asm));
      ring(sx, sy, Rm * 1.05, col, 0.5 * a * asm, 0.5, 0, 0, t * 0.1, 1.4);
      ring(sx, sy, Rm * 1.5, C.deep, 0.28 * a * asm, 0.4, 7, lerp(0.9, 0.3, asm), -t * 0.06, 1);
      for (var f=0; f<4; f++){ var fa=-Math.PI/2+f*(Math.PI/2)+t*0.05; satellite(sx, sy, Rm*1.85, fa, 0.42, f===0?C.cold:(k==="final"?C.ok:C.steel), a, asm); }

    } else if (k === "protocol") {
      // SEALED PLATED MACHINE — nested rotating polygons separate, then a governed ring locks the clauses
      var sides=[6,4,6,4,3];
      for (var L=4; L>=0; L--){ var ff=L/4, sep=1+(1-asm)*0.22*L;
        polygon(sx, sy, Rm*(0.34+ff*0.74)*sep, sides[L], mixc(C.steel,C.cold,0.3*near), (0.16+0.32*(1-ff))*a*asm, t*0.06*(L%2?-1:1)+L*0.4, lerp(0.55,0.82,ff), 1.2); }
      polygon(sx, sy, Rm*0.26, 4, C.cold, 0.5*a*asm, -t*0.2, 0.9, 1.3);
      mnode(sx, sy, 2.3, mixc(C.steel,C.cold,0.5*near), 0.85*a);
      for (var pc=0; pc<6; pc++){ var pa=(pc/6)*TAU + t*0.04; satellite(sx, sy, Rm*1.34, pa, 0.92, C.deep, a, asm, 0.7+0.3*Math.sin(t*1.6+pc)); }
      ring(sx, sy, Rm*1.34, C.cold, 0.16*near*a*asm, 0.96, 20, 0.1, yaw*0.4, 1.2);

    } else if (k === "evidence") {
      // TRUST BOUNDARY + a CONSTRUCTED bounded signal (crossing admitted facts, not an orb)
      var bx = sx - Rm*1.5;
      ctx.save(); ctx.globalCompositeOperation="lighter"; ctx.strokeStyle=rgba(C.deep,0.4*a*asm); ctx.setLineDash([1,5]); ctx.lineWidth=1.3;
      ctx.beginPath(); ctx.moveTo(bx, sy-Rm*1.3); ctx.lineTo(bx, sy+Rm*1.3); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
      ctx.save(); ctx.globalCompositeOperation="lighter"; ctx.strokeStyle=rgba(C.cold,0.5*a*asm); ctx.lineWidth=1.4;
      for (var mb=0; mb<3; mb++){ var ba=(mb/3)*Math.PI + t*0.1, len=Rm*0.5*asm;
        ctx.beginPath(); ctx.moveTo(sx-Math.cos(ba)*len, sy-Math.sin(ba)*len); ctx.lineTo(sx+Math.cos(ba)*len, sy+Math.sin(ba)*len); ctx.stroke(); }
      ctx.restore();
      mnode(sx, sy, 2.1, C.cold, 0.8*a);
      var seg=MOBILE?16:24, gp0=-0.6, gw=0.7, er=Rm*1.05;
      ctx.save(); ctx.globalCompositeOperation="lighter"; ctx.strokeStyle=rgba(C.steel,0.42*a*asm); ctx.lineWidth=1.3;
      for (var e=0;e<seg;e++){ var ea=(e/seg)*TAU+t*0.05, rel=ea-(gp0+t*0.05); while(rel>Math.PI)rel-=TAU; while(rel<-Math.PI)rel+=TAU;
        if (Math.abs(rel)<gw*0.5) continue; ctx.beginPath(); ctx.ellipse(sx,sy,er,er*0.9,0, ea+0.04, ea+(TAU/seg)-0.04); ctx.stroke(); }
      ctx.restore();
      mnode(sx+Math.cos(gp0-gw*0.5+t*0.05)*er, sy+Math.sin(gp0-gw*0.5+t*0.05)*er*0.9, 1.4, C.amber, 0.55*a);
      mnode(sx+Math.cos(gp0+gw*0.5+t*0.05)*er, sy+Math.sin(gp0+gw*0.5+t*0.05)*er*0.9, 1.4, C.amber, 0.55*a);
      for (var fr=0; fr<5; fr++){ var fa2=(fr/5)*TAU+t*0.2, frd=Rm*1.0*lerp(2.0,1.0,asm), fx=sx+Math.cos(fa2)*frd, fy=sy+Math.sin(fa2)*frd*0.8;
        var fp=prox(fx,fy,70); if (fp>0.04) link(fx, fy, bx, sy, C.luna, 0.45*fp, 1);
        mnode(fx, fy, 1.2+fp*1.0, fp>0.04?C.cold:C.steel, (0.3+0.4*asm)*a + fp*0.4); }

    } else if (k === "screening") {
      // ENCLOSURE RINGS + verdicts the cursor RESOLVES (hover adjudicates)
      for (var s3=0;s3<3;s3++){ ring(sx,sy,Rm*(1.5-s3*0.32),s3===0?C.deep:C.steel,(0.12+0.18*near)*a*asm,0.9,3+s3*2,lerp(0.85,0.3,asm),t*0.04*(s3%2?-1:1),1.1); }
      var states=["pass","review","fail","pass","review"], coreTint=C.cold, coreOn=0;
      for (var p2=0;p2<5;p2++){ var pa2=-1.2+(p2/4)*2.6+t*0.03, pr2=Rm*1.3, vx=sx+Math.cos(pa2)*pr2, vy=sy+Math.sin(pa2)*pr2*0.9;
        var vp=prox(vx,vy,72), resolved=vp>0.3, scol=stateCol(states[p2]);
        mnode(vx, vy, 1.5+(resolved?1.0:0)+vp*0.7, resolved?scol:mixc(C.deep,scol,0.45), (0.32+0.5*asm)*(resolved?1:0.7)+vp*0.4);
        if (resolved){ glyphMark(vx, vy-8, states[p2], scol, vp); coreTint=scol; coreOn=vp; } }
      mnode(sx, sy, 2.6, coreOn>0.3?coreTint:(near>0.5?C.cold:C.deep), 0.82*a);

    } else if (k === "replay") {
      // CONCENTRIC STRATA — hover near the proof UNFOLDS the chain (strata expand + lineage links)
      var unfold = prox(sx, sy, Rm*2.2), ex = 1 + unfold*0.3;
      for (var st4=1;st4<=5;st4++){ var rr=Rm*(0.4+st4*0.32)*lerp(1.4,1.0,asm)*ex;
        ring(sx,sy,rr,st4===3?C.luna:(st4%2?C.deep:C.steel),(0.12+0.16*near)*a*asm*(0.7+0.5*unfold),0.82,4+st4,lerp(0.9,0.4,asm),t*0.016*(st4%2?-1:1)+st4*0.5,1);
        var an=st4*0.7+t*0.02, lx=sx+Math.cos(an)*rr, ly=sy+Math.sin(an)*rr*0.82;
        if (unfold>0.05) link(sx, sy, lx, ly, C.luna, 0.5*unfold*a, 1);
        mnode(lx, ly, 1.4, st4===3?C.luna:C.steel, (0.4*asm)*a + unfold*0.25); }
      bloom(sx, sy, Rm*(0.8+unfold), C.luna, 0.06*a*(0.5+unfold));
      mnode(sx, sy, 2.6+unfold*0.8, near>0.4?C.cold:C.deep, 0.85*a);

    } else if (k === "trident") {
      // THE INSTRUMENT — three converging tines + a lattice the cursor clarifies (no orb)
      var CYAN=mixc(C.steel,C.cold,0.55), lead=sx+Rm*1.7*asm, sp=Rm*0.95, haft=sx-Rm*0.3;
      link(lead, sy, haft, sy, CYAN, 0.8*a*asm, 1.4);
      link(lead, sy-sp, haft, sy, CYAN, 0.6*a*asm, 1.2); link(lead, sy+sp, haft, sy, CYAN, 0.6*a*asm, 1.2);
      bloom(lead, sy, 7, CYAN, 0.3*a*asm); mnode(lead, sy, 1.6, C.cold, 0.8*a*asm);
      mnode(lead, sy-sp, 1.2, CYAN, 0.5*a*asm); mnode(lead, sy+sp, 1.2, CYAN, 0.5*a*asm);
      mnode(haft, sy, 2.2, C.cold, 0.85*a);
      for (var gx=0;gx<3;gx++) for(var gy=0;gy<3;gy++){ var lxp=sx-Rm*(1.4-gx*0.45), lyp=sy+(gy-1)*Rm*0.55, cp=prox(lxp,lyp,70);
        if (gx<2) link(lxp,lyp, sx-Rm*(1.4-(gx+1)*0.45), lyp, CYAN, (0.1+0.2*cp)*a*near, 1);
        mnode(lxp, lyp, 1.0+cp*1.0, cp>0.05?CYAN:C.dim, (0.22+0.3*asm)*a*near + cp*0.4); }

    } else if (k === "luna") {
      // PROVENANCE CONSTELLATION — a witnessed web of nodes + links (no orb)
      var ln=MOBILE?7:11, pts=[]; for (var w=0;w<ln;w++){ var wa=(w/ln)*TAU+t*0.05, wr=Rm*(0.7+0.6*Math.sin(w*1.7+t*0.1))*lerp(1.6,1.0,asm);
        var wx3=sx+Math.cos(wa)*wr, wy3=sy+Math.sin(wa)*wr*0.78, wp=prox(wx3,wy3,70); pts.push([wx3,wy3,wp]); }
      for (var li=0; li<pts.length; li++){ var nx=pts[(li+1)%pts.length], cr=pts[(li+3)%pts.length], bri=Math.max(pts[li][2],0.16*asm);
        link(pts[li][0],pts[li][1],nx[0],nx[1],C.luna,0.18*a*bri+pts[li][2]*0.35,1);
        if (li%2===0) link(pts[li][0],pts[li][1],cr[0],cr[1],C.luna,0.10*a*asm+pts[li][2]*0.25,1); }
      for (var li2=0; li2<pts.length; li2++) mnode(pts[li2][0],pts[li2][1],1.3+pts[li2][2]*0.9,C.luna,(0.45*asm)*a+pts[li2][2]*0.3);
      mnode(sx, sy, 2.0, C.luna, 0.7*a);
      ring(sx,sy,Rm*1.45,C.luna,0.16*near*a*asm,0.62,0,0,-t*0.04,1);

    } else if (k === "node") {
      // POINT OF CARE — operational surface + intake column + a GREEN verified signal that LIFTS OFF
      // (the dual: this is the signal that arrives into the Sponsor's command field)
      ctx.save(); ctx.globalCompositeOperation="lighter"; ctx.strokeStyle=rgba(C.steel,0.32*a*asm); ctx.lineWidth=1.2;
      ctx.beginPath(); ctx.ellipse(sx, sy+Rm*0.55, Rm*1.45, Rm*0.5, 0, 0, TAU); ctx.stroke(); ctx.restore();
      for (var q=0;q<3;q++){ var qy=sy+(q-1)*Rm*0.32; link(sx-Rm*1.0, qy, sx-Rm*0.55, qy, C.steel, (0.3+0.18*Math.sin(t*1.2+q))*a*asm, 1.4); }
      link(sx-Rm*0.2, sy-Rm*0.45, sx-Rm*0.2, sy+Rm*0.45, C.deep, 0.4*a*asm, 1.2);
      mnode(sx+Rm*0.15, sy, 1.7, C.steel, 0.6*a*asm);
      var lift=0.5+0.5*Math.sin(t*0.7), rx=sx+Rm*0.7, ry=sy-Rm*0.55-lift*Rm*0.4, rp=prox(rx,ry,90);
      link(sx+Rm*0.15, sy, rx, ry, C.ok, 0.3*a*asm, 1);
      mnode(rx, ry, 2.2+rp*1.2, C.ok, (0.8*asm)*a + rp*0.3);
      ring(rx, ry, (5+lift*2)*(1+rp), C.ok, (0.3*asm)*a + rp*0.2, 1, 0, 0, 0, 1);
      link(rx, ry, rx+Rm*0.5, ry-Rm*0.5, C.ok, 0.3*a*asm*lift, 1.2);

    } else { // console — THE SPONSOR — a distributed command network the Node's signal ARRIVES INTO
      var fn=MOBILE?18:34, rr2=mkRng(99), fpts=[];
      for (var c2=0;c2<fn;c2++){ var ca=rr2()*TAU, cr=Rm*(0.42+rr2()*1.05)*lerp(1.6,1.0,asm);
        var st5=rr2(), cs=st5<0.46?"deep":(st5<0.66?"cold":(st5<0.82?"luna":(st5<0.92?"ok":"review")));
        fpts.push([sx+Math.cos(ca)*cr, sy+Math.sin(ca)*cr*0.64+Rm*0.12, cs]); }
      for (var i2=0;i2<fpts.length;i2++){ var best=-1,bd=1e9,j2; for(j2=0;j2<fpts.length;j2++){ if(i2===j2)continue; var dx=fpts[i2][0]-fpts[j2][0],dy=fpts[i2][1]-fpts[j2][1],dd=dx*dx+dy*dy; if(dd<bd){bd=dd;best=j2;} }
        if(best>=0){ var cp2=prox(fpts[i2][0],fpts[i2][1],85); var lc=(fpts[i2][2]==="luna"||fpts[best][2]==="luna")?C.luna:C.steel; link(fpts[i2][0],fpts[i2][1],fpts[best][0],fpts[best][1],lc,(0.10+0.18*cp2)*a*asm,1); } }
      for (var i3=0;i3<fpts.length;i3++){ var ripple=0.6+0.4*Math.sin(t*1.4 - i3*0.3), cp3=prox(fpts[i3][0],fpts[i3][1],62);
        mnode(fpts[i3][0],fpts[i3][1],(1.3+(i3%3)*0.5)*(1+cp3*0.6), stateCol(fpts[i3][2]), (0.52*asm*ripple)*a + cp3*0.45); }
      // the Node's verified GREEN signal arriving from below-left into the command field (the dual)
      var arr=(t*0.45)%1, ax2=sx-Rm*1.5+arr*Rm*1.5, ay2=sy+Rm*1.1-arr*Rm*1.0;
      link(sx-Rm*1.5, sy+Rm*1.1, sx, sy, C.ok, 0.16*a*asm, 1.1);
      mnode(ax2, ay2, 2.0, C.ok, 0.8*asm*a*(0.4+0.6*Math.sin(arr*Math.PI)));
      if (arr>0.9) ring(sx, sy, Rm*(0.5+(arr-0.9)*9), C.ok, (1-arr)*3*0.4*a, 0.64, 0,0,0,1.3);
      ring(sx, sy+Rm*0.12, Rm*1.55, C.steel, 0.12*near*a*asm, 0.5, 0, 0, 0, 1);
    }

    // arrival settle pulse — the assembly completes
    if (arriveFlash > 0.01 && near > 0.85) ring(sx, sy, Rm*(1.1+(1-arriveFlash)*1.3), C.cold, 0.4*arriveFlash, 0.6, 0,0,0,1.4);
    bloom(sx, sy + Rm * 1.2, Rm * 1.4, col, 0.05 * a);
  }

  /* ============================================================
   * Frame
   * ============================================================ */
  function frame() {
    if (!running) return;
    var tn = now(), dt = clamp((tn - lastT) / 1000, 0, 0.05); lastT = tn; idle = (tn - t0) / 1000;
    arriveFlash *= 0.94;

    if (flying) {
      flightT += dt / flightDur;
      if (flightT >= 1) { flightT = 1; flying = false; camPX = toPX; camPZ = toPZ; camYaw = toYaw; onArrive(); }
      else { var e = easeInOut(clamp(flightT, 0, 1)); camPX = lerp(fromPX, toPX, e); camPZ = lerp(fromPZ, toPZ, e); camYaw = lerpAngle(fromYaw, toYaw, e); }
    }
    var flightArc = flying ? Math.sin(clamp(flightT,0,1) * Math.PI) : 0;
    // bank INTO the turn during a flight (roll the whole view)
    roll = 0;
    if (flying) { var dY = toYaw - fromYaw; while (dY > Math.PI) dY -= TAU; while (dY < -Math.PI) dY += TAU; roll = -clamp(dY, -1, 1) * 0.17 * Math.sin(clamp(flightT,0,1) * Math.PI); }
    cosR = Math.cos(roll); sinR = Math.sin(roll);
    if (ptrHas) { ptrSX += (ptrX - ptrSX) * 0.12; ptrSY += (ptrY - ptrSY) * 0.12; }

    cxs = W * 0.5; cys = H * 0.5; FOC = H * 0.92; cosY = Math.cos(camYaw); sinY = Math.sin(camYaw);
    var bob = REDUCED ? 0 : Math.sin(idle * 0.4) * 0.18;
    eyeY = terrainH(camPX, camPZ) + EYE + bob + flightArc * 6.5;

    var aCur = C[STATIONS[cur].accent] || C.steel;
    var aTo = C[STATIONS[targetIdx].accent] || aCur;
    var skyCol = mixc(aCur, aTo, flying ? easeInOut(clamp(flightT,0,1)) : 0);
    var nearCol = mixc(C.steel, skyCol, 0.5), farCol = mixc(C.jet2, skyCol, 0.5);
    var horizonY = cys - FOC * Math.tan(PITCH);

    // directional sky glow — toward the landmark we travel to
    var tgt = STATIONS[targetIdx]; project(tgt.px, terrainH(tgt.px, tgt.pz) + tgt.lift, tgt.pz);
    var glowX = P.vis ? clamp(P.sx, W * 0.1, W * 0.9) : cxs;

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    drawSky(skyCol, horizonY, glowX);
    drawTerrain(nearCol, farCol);

    // landmarks (only the near one(s) carry alpha > 0)
    var i;
    for (i = 0; i < N; i++) {
      var stn = STATIONS[i];
      var wy = terrainH(stn.px, stn.pz) + stn.lift;
      project(stn.px, wy, stn.pz);
      if (!P.vis || P.depth > FAR * 0.9) continue;
      var depth = P.depth, scale = FOC / depth;
      var near = smooth(stn.rest + 20, stn.rest + 1, depth);
      var frontFade = clamp((depth - 1.2) / 3.5, 0, 1);
      var a = near * frontFade;
      if (a <= 0.003) continue;
      var msx = clamp(P.sx, W * 0.14, W * 0.86), msy = clamp(P.sy, H * 0.33, H * 0.57);
      drawMonument(stn, msx, msy, scale, near, easeOut(near), a);
    }

    // JOURNEY TRANSITION — the screen is OVERTAKEN mid-flight, then clears to the arrival reveal.
    // Speed streaks rush from the destination glow; a colour wash crests at the midpoint.
    if (flying) {
      var tk = Math.sin(clamp(flightT, 0, 1) * Math.PI), wash = tk * tk;
      ctx.save(); ctx.globalCompositeOperation = "lighter";
      var streaks = MOBILE ? 16 : 32;
      for (var ks = 0; ks < streaks; ks++) {
        var sa = (ks / streaks) * TAU + idle * 0.25, sl = (0.25 + 0.75 * (((ks * 37) % streaks) / streaks)) * Math.max(W, H) * 0.6 * wash;
        ctx.strokeStyle = rgba(mixc(skyCol, C.cold, 0.4), 0.10 * wash); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(glowX + Math.cos(sa) * 50, horizonY + Math.sin(sa) * 50); ctx.lineTo(glowX + Math.cos(sa) * (50 + sl), horizonY + Math.sin(sa) * (50 + sl)); ctx.stroke();
      }
      ctx.restore();
      bloom(glowX, horizonY, Math.max(W, H) * (0.4 + 0.5 * wash), skyCol, 0.55 * wash);
      ctx.globalCompositeOperation = "source-over"; ctx.fillStyle = rgba(skyCol, 0.26 * wash); ctx.fillRect(0, 0, W, H);
    }

    syncUI(); firstFramePainted = true; requestAnimationFrame(frame);
  }

  /* ============================================================
   * Navigation
   * ============================================================ */
  function go(i) {
    i = clamp(Math.round(i), 0, N - 1);
    if (i === cur && !flying) return;
    targetIdx = i;
    fromPX = camPX; fromPZ = camPZ; fromYaw = camYaw;
    toPX = STATIONS[i].camx; toPZ = STATIONS[i].camz; toYaw = STATIONS[i].yaw;
    flightDur = REDUCED ? 0.001 : (1.05 + 0.5 * Math.min(3, Math.abs(i - cur)));
    flightT = 0; flying = true; setCaps(-1);
  }
  function next() { go((flying ? targetIdx : cur) + 1); }
  function prev() { go((flying ? targetIdx : cur) - 1); }
  function onArrive() { cur = targetIdx; arriveFlash = 1; setCaps(cur); }

  function setCaps(activeIdx) {
    for (var i = 0; i < caps.length; i++) { var on = i === activeIdx, block = caps[i]; if (!block) continue;
      var lines = block.querySelectorAll(".cap-line"); for (var j = 0; j < lines.length; j++) lines[j].classList.toggle("on", on);
      block.classList.toggle("cap--active", on); }
  }
  function syncUI() {
    var shown = flying ? targetIdx : cur;
    if (counterEl) counterEl.textContent = ("0" + (shown + 1)).slice(-2) + " / " + ("0" + N).slice(-2);
    if (progEl) progEl.style.transform = "scaleX(" + (shown / (N - 1)).toFixed(4) + ")";
    for (var i = 0; i < dots.length; i++) if (dots[i]) dots[i].classList.toggle("active", i === shown);
    if (btnPrev) btnPrev.disabled = (shown <= 0 && !flying);
    if (btnNext) btnNext.disabled = (shown >= N - 1 && !flying);
  }

  /* ---------- boot loader ---------- */
  function startLoader() {
    var box = document.getElementById("boot"); if (!box) return;
    var html = document.documentElement; html.classList.add("booting");
    setTimeout(function () { html.classList.remove("booting"); }, 6000);
    var bar = box.querySelector("[data-boot-bar]"), pctEl = box.querySelector("[data-boot-pct]");
    var start = now(), prog = 0, fontsReady = false, done = false;
    if (document.fonts && document.fonts.ready && document.fonts.ready.then) { document.fonts.ready.then(function () { fontsReady = true; }); setTimeout(function () { fontsReady = true; }, 3000); }
    else fontsReady = true;
    function step() {
      var el = now() - start, tg = 0.10;
      if (el > 120) tg = 0.32; if (fontsReady) tg = Math.max(tg, 0.64); if (firstFramePainted) tg = Math.max(tg, 0.90);
      var minMs = REDUCED ? 450 : 850, ready = fontsReady && firstFramePainted && el > minMs; if (ready) tg = 1;
      prog += (tg - prog) * (ready ? 0.2 : 0.08); if (tg >= 1 && prog > 0.996) prog = 1;
      var shown = prog >= 1 ? 100 : Math.min(99, Math.round(prog * 100));
      if (bar) bar.style.transform = "scaleX(" + prog.toFixed(4) + ")";
      if (pctEl) { if (pctEl.firstChild) pctEl.firstChild.nodeValue = shown; else pctEl.textContent = shown; }
      box.setAttribute("aria-valuenow", String(shown));
      if (prog >= 1 && !done) { done = true; box.classList.add("boot--done"); html.classList.remove("booting");
        setTimeout(function () { if (box.parentNode) box.parentNode.removeChild(box); }, 760); return; }
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- wiring ---------- */
  function size() { W = window.innerWidth; H = window.innerHeight; cv.width = Math.round(W*DPR); cv.height = Math.round(H*DPR); cv.style.width = W+"px"; cv.style.height = H+"px"; }
  function boot() {
    readPalette(); buildStars(); buildPath();
    cv = document.getElementById("world"); if (!cv) return; ctx = cv.getContext("2d"); size();
    caps = [].slice.call(document.querySelectorAll("[data-cap]"));
    dots = [].slice.call(document.querySelectorAll("[data-dot]"));
    counterEl = document.querySelector("[data-counter]"); progEl = document.querySelector("[data-deck-progress]");
    btnPrev = document.querySelector("[data-prev]"); btnNext = document.querySelector("[data-next]");

    window.addEventListener("resize", function () { DPR = MOBILE ? 1 : Math.min(2, window.devicePixelRatio || 1); size(); });
    if (btnPrev) btnPrev.addEventListener("click", prev);
    if (btnNext) btnNext.addEventListener("click", next);
    for (var i = 0; i < dots.length; i++) (function (idx) { dots[idx].addEventListener("click", function () { go(idx); }); })(i);
    window.addEventListener("keydown", function (e) {
      var k = e.key;
      if (k === "ArrowRight" || k === "ArrowDown" || k === " " || k === "PageDown" || k === "d") { next(); e.preventDefault(); }
      else if (k === "ArrowLeft" || k === "ArrowUp" || k === "PageUp" || k === "a") { prev(); e.preventDefault(); }
      else if (k === "Home") go(0); else if (k === "End") go(N - 1);
    });
    window.addEventListener("wheel", function (e) {
      if (wheelLock > now() || flying) return; wheelAcc += e.deltaY;
      if (Math.abs(wheelAcc) > 60) { (wheelAcc > 0 ? next : prev)(); wheelAcc = 0; wheelLock = now() + 650; }
    }, { passive: true });
    var tx0 = 0, ty0 = 0, tracking = false;
    window.addEventListener("touchstart", function (e) { if (!e.touches[0]) return; tx0 = e.touches[0].clientX; ty0 = e.touches[0].clientY; tracking = true; }, { passive: true });
    window.addEventListener("touchend", function (e) {
      if (!tracking || !e.changedTouches[0]) return; tracking = false;
      var dx = e.changedTouches[0].clientX - tx0, dy = e.changedTouches[0].clientY - ty0;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) (dx < 0 ? next : prev)();
      else if (Math.abs(dy) > 60) (dy < 0 ? next : prev)();
    }, { passive: true });
    if (!MOBILE) {
      window.addEventListener("pointermove", function (e) { if (e.pointerType === "touch") { ptrHas = false; return; } ptrX = e.clientX; ptrY = e.clientY; if (!ptrHas) { ptrSX = ptrX; ptrSY = ptrY; } ptrHas = true; }, { passive: true });
      window.addEventListener("blur", function () { ptrHas = false; });
    }
    document.addEventListener("visibilitychange", function () { if (!document.hidden && running) { lastT = now(); requestAnimationFrame(frame); } });

    cur = 0; targetIdx = 0; camPX = STATIONS[0].camx; camPZ = STATIONS[0].camz; camYaw = STATIONS[0].yaw; flying = false;
    setCaps(0); lastT = now(); requestAnimationFrame(frame);
  }

  global.DamarosTerrain = { go: go, next: next, prev: prev, state: function () { return { cur: cur, target: targetIdx, flying: flying }; } };
  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", function () { boot(); startLoader(); }); }
  else { boot(); startLoader(); }
})(typeof window !== "undefined" ? window : this);
