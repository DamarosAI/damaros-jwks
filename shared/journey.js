/* ============================================================
 * DAMAROS — Journey engine.
 *
 * A scroll-scrubbed traversal through a governed system. Each
 * <section class="scene" data-scene="x"> pins to the viewport; the
 * user's scroll scrubs that scene's transformation (p: 0→1). Scenes
 * also receive a wall-clock `t` for ambient life (rotation, drift,
 * breathing). Meaningful change is driven by p; ambient motion keeps a
 * paused scroll alive.
 *
 * Design law: nothing moves unless it means something. Light = state.
 * Palette is mineral black · cold white · deep blue · steel · restrained
 * amber · rare red (breach only).
 *
 * Rendering: everything luminous is drawn with ADDITIVE light (cached
 * glow sprites composited with 'lighter') so overlapping energy blooms
 * to white — depth and mass instead of flat wireframe.
 *
 * ---- Scene contract -------------------------------------------------
 *   Damaros.registerScene('protocol', {
 *     init(env){},            // optional: precompute on (re)layout
 *     draw(env){},            // required: render one frame
 *     // env = { ctx, w, h, dpr, p, t, mobile, reduced, C, fx, rng, data }
 *   });
 *   - env.p     scene progress 0..1 (scroll-scrubbed; the "camera")
 *   - env.t     seconds since load (ambient only)
 *   - env.C     palette as {name:[r,g,b]} + .raw strings
 *   - env.fx    shared primitive library (see Damaros.fx)
 *   - env.rng   deterministic rng seeded per scene+layout: rng()→0..1
 *   - env.data  per-scene scratch object (persisted across frames)
 *   Captions: <p class="cap-line" data-from="0.15" data-to="0.5"> get
 *   a `.on` class while p is in [from,to]; CSS animates them.
 * ============================================================ */
(function (global) {
  "use strict";

  /* ---------- math ---------- */
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function smooth(e0, e1, x) { var t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); }
  function easeInOut(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function easeIn(t) { return t * t * t; }
  function mkRng(seed) { var s = seed >>> 0 || 1; return function () { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }

  /* ---------- palette ---------- */
  var C = {};
  function hex(h) { h = h.trim(); if (h.charAt(0) !== "#") return null; h = h.slice(1); if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2]; var n = parseInt(h, 16); return [(n>>16)&255,(n>>8)&255,n&255]; }
  function readPalette() {
    var cs = getComputedStyle(document.documentElement), g = function (n, f) { return hex(cs.getPropertyValue(n)) || f; };
    C.jet    = g("--jet",   [5,7,10]);
    C.jet2   = g("--jet2",  [12,16,22]);
    C.cold   = g("--cold",  [232,236,240]);
    C.steel  = g("--steel", [169,192,214]);
    C.deep   = g("--deep",  [62,110,158]);
    C.amber  = g("--amber", [224,162,59]);
    C.breach = g("--breach",[251,113,133]);
    C.dim    = g("--dim",   [120,134,150]);
    C.ok     = g("--ok",    [91,185,140]);   /* resolution / readiness — green */
    C.luna   = g("--luna",  [140,124,240]);  /* governance / provenance / AI-origin — ultraviolet */
    C.raw = {};
    for (var k in C) if (k !== "raw" && C[k] && C[k].length) C.raw[k] = "rgb(" + C[k][0] + "," + C[k][1] + "," + C[k][2] + ")";
    glowCache = {}; // palette change → rebuild glow sprites lazily
  }
  function rgba(c, a) { a = a < 0 ? 0 : a > 1 ? 1 : a; return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")"; }
  function mixc(a, b, t) { return [Math.round(lerp(a[0],b[0],t)), Math.round(lerp(a[1],b[1],t)), Math.round(lerp(a[2],b[2],t))]; }
  /* colour-as-state doctrine (one law, every scene):
       green  resolution / readiness / PASS   amber  REVIEW / unresolved
       red    exclusion / breach / FAIL        blue   system structure
       white  evidence / proof / signal        purple provenance / AI-origin (Luna)
       steel  generic structure               dim    residue / inactive            */
  function stateCol(state) {
    switch (state) {
      case "pass": case "ok": case "ready": case "resolve": return C.ok;
      case "review": case "amber": case "hold":            return C.amber;
      case "fail": case "block": case "breach": case "exclude": return C.breach;
      case "deep": case "structure": case "blue":          return C.deep;
      case "cold": case "signal": case "proof": case "white": return C.cold;
      case "luna": case "prov": case "governance":         return C.luna;
      case "dim": case "idle":                             return C.dim;
      case "steel": default:                               return C.steel;
    }
  }

  /* ---------- grain tile (precomputed once) ---------- */
  var grainTile = null;
  function buildGrain() {
    var s = 140, c = document.createElement("canvas"); c.width = c.height = s;
    var x = c.getContext("2d"), img = x.createImageData(s, s), d = img.data, r = mkRng(99);
    for (var i = 0; i < d.length; i += 4) { var v = 120 + (r() * 135) | 0; d[i] = d[i+1] = d[i+2] = v; d[i+3] = (r() * 26) | 0; }
    x.putImageData(img, 0, 0); grainTile = c;
  }

  /* ---------- glow sprite cache (the unit of additive light) ----------
     A soft radial sprite per colour, drawn with 'lighter' and scaled to
     any size. This is what gives the world bloom / HDR presence. */
  var glowCache = {};
  function glowSprite(col) {
    var key = col[0] + "_" + col[1] + "_" + col[2];
    if (glowCache[key]) return glowCache[key];
    var s = 128, c = document.createElement("canvas"); c.width = c.height = s;
    var x = c.getContext("2d"), g = x.createRadialGradient(s/2, s/2, 0, s/2, s/2, s/2);
    g.addColorStop(0.0, "rgba(" + col[0] + "," + col[1] + "," + col[2] + ",1)");
    g.addColorStop(0.18, "rgba(" + col[0] + "," + col[1] + "," + col[2] + ",0.55)");
    g.addColorStop(0.55, "rgba(" + col[0] + "," + col[1] + "," + col[2] + ",0.12)");
    g.addColorStop(1.0, "rgba(" + col[0] + "," + col[1] + "," + col[2] + ",0)");
    x.fillStyle = g; x.fillRect(0, 0, s, s);
    glowCache[key] = c; return c;
  }

  /* ---------- fibonacci sphere directions (cached per count) ---------- */
  var sphereCache = {};
  function sphereDirs(n) {
    if (sphereCache[n]) return sphereCache[n];
    var pts = [], off = 2 / n, inc = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < n; i++) {
      var y = i * off - 1 + off / 2, rr = Math.sqrt(Math.max(0, 1 - y * y)), phi = i * inc;
      pts.push([Math.cos(phi) * rr, y, Math.sin(phi) * rr]);
    }
    sphereCache[n] = pts; return pts;
  }

  /* ============================================================
   * fx — shared primitive library. The visual vocabulary every
   * scene draws from, so the world stays one coherent system.
   * ============================================================ */
  var fx = {
    clamp: clamp, lerp: lerp, smooth: smooth, mix: lerp, mixc: mixc,
    easeInOut: easeInOut, easeOut: easeOut, easeIn: easeIn, rgba: rgba, TAU: Math.PI * 2,

    /* additive light blot — the core of the new look. r = glow radius. */
    bloom: function (env, x, y, r, col, alpha) {
      if (alpha <= 0 || r <= 0) return;
      var ctx = env.ctx, sp = glowSprite(col || C.steel);
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = clamp(alpha, 0, 1);
      ctx.drawImage(sp, x - r, y - r, r * 2, r * 2);
      ctx.restore();
    },

    /* geological black field: base wash + central light seat + vignette + grain */
    field: function (env, opts) {
      var ctx = env.ctx, w = env.w, h = env.h; opts = opts || {};
      var OV = 18;   // overscan: cursor parallax leans the chamber a few px — clear past the edge
      ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
      ctx.fillStyle = rgba(C.jet, 1); ctx.fillRect(-OV, -OV, w + OV * 2, h + OV * 2);
      var cx = opts.cx == null ? w * 0.5 : opts.cx, cy = opts.cy == null ? h * 0.5 : opts.cy;
      var lift = opts.lift == null ? 0.85 : opts.lift, mx = Math.max(w, h);
      // depth wash — a place for the form to sit in light
      var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, mx * 0.72);
      g.addColorStop(0, rgba(C.jet2, lift));
      g.addColorStop(0.5, rgba(C.jet2, lift * 0.4));
      g.addColorStop(1, rgba(C.jet, 0));
      ctx.fillStyle = g; ctx.fillRect(-OV, -OV, w + OV * 2, h + OV * 2);
      // faint deep-blue colour cast near the centre for atmosphere
      var g2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, mx * 0.5);
      g2.addColorStop(0, rgba(C.deep, (opts.tint == null ? 0.10 : opts.tint)));
      g2.addColorStop(1, rgba(C.deep, 0));
      ctx.fillStyle = g2; ctx.fillRect(-OV, -OV, w + OV * 2, h + OV * 2);
      // vignette to pull the eye inward
      var vg = ctx.createRadialGradient(w*0.5, h*0.5, Math.min(w,h)*0.26, w*0.5, h*0.5, mx*0.78);
      vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,0.66)");
      ctx.fillStyle = vg; ctx.fillRect(-OV, -OV, w + OV * 2, h + OV * 2);
      if (opts.grain !== false && grainTile && !env.mobile) {
        ctx.globalAlpha = 0.045; ctx.globalCompositeOperation = "overlay";
        var ox = (env.t * 14) % grainTile.width, oy = (env.t * 9) % grainTile.height;
        for (var gx = -grainTile.width; gx < w; gx += grainTile.width)
          for (var gy = -grainTile.height; gy < h; gy += grainTile.height)
            ctx.drawImage(grainTile, gx - ox, gy - oy);
        ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
      }
    },

    /* slow ambient dust — additive motes for depth (some catch the light) */
    dust: function (env, n, seed) {
      var ctx = env.ctx, w = env.w, h = env.h, r = mkRng(seed || 7), t = env.t;
      ctx.save(); ctx.globalCompositeOperation = "lighter";
      for (var i = 0; i < n; i++) {
        var bx = r() * w, by = r() * h, ph = r() * 6.28, sp = 0.04 + r() * 0.12, dz = r();
        var x = bx + Math.cos(t * sp + ph) * 12, y = by + Math.sin(t * sp * 0.8 + ph) * 10;
        var a = (0.05 + 0.10 * (0.5 + 0.5 * Math.sin(t + ph))) * (0.35 + dz * 0.8);
        ctx.fillStyle = rgba(dz > 0.86 ? C.steel : C.dim, a);
        ctx.beginPath(); ctx.arc(x, y, 0.5 + dz * 1.7, 0, 6.2832); ctx.fill();
      }
      ctx.restore();
    },

    /* THE PERSISTENT WORLD — the system is already running. Every scene draws
       this FIRST (instead of fx.field) so the world stays saturated and
       continuous: geological field + an ever-present seat of light at the
       heart (the core, faintly there in every chamber) + ambient dust.
         opts.cx,cy      anchor of the persistent core (default centre)
         opts.lift,tint  field depth / colour cast (passed through)
         opts.accent     atmosphere colour (default deep blue; Luna passes purple)
         opts.core 0..1  how present the central seat is (default .22)
         opts.orb  bool  render a faint ghost-orb at the seat (bookend scenes)
         opts.coreR      core radius as fraction of min(w,h) (default .16)
         opts.dust,seed  ambient mote count / seed */
    worldbg: function (env, opts) {
      opts = opts || {};
      var w = env.w, h = env.h, t = env.t, mn = Math.min(w, h);
      var cx = opts.cx == null ? w * 0.5 : opts.cx, cy = opts.cy == null ? h * 0.5 : opts.cy;
      var accent = opts.accent || C.deep;
      // the world is never still: the seat of light BREATHES on its own clock, so a
      // paused scroll still reads as a system that is running.
      var breath = 0.5 + 0.5 * Math.sin(t * 0.5 + (opts.phase || 0));
      fx.field(env, { cx: cx, cy: cy, lift: opts.lift == null ? 0.78 : opts.lift,
                      tint: opts.tint == null ? 0.12 : opts.tint, grain: opts.grain });
      var core = opts.core == null ? 0.22 : opts.core;
      if (core > 0) {
        var R = mn * (opts.coreR || 0.16), cm = 1 + 0.07 * breath;
        fx.bloom(env, cx, cy, R * (1.7 + 0.5 * core) * cm, accent, (0.05 + 0.11 * core) * (0.82 + 0.32 * breath));
        fx.bloom(env, cx, cy, R * 0.72 * cm, C.steel, (0.03 + 0.06 * core) * (0.78 + 0.42 * breath));
        if (opts.orb) fx.orb(env, cx, cy, R * 0.72, { charge: 0.22 * core + 0.06, spread: 1.25,
          pitch: 0.5, yaw: t * 0.05, flat: 0.96, n: env.mobile ? 80 : 170 });
      }
      fx.dust(env, opts.dust == null ? (env.mobile ? 18 : 38) : opts.dust, opts.seed || 13);
      // universal cursor presence — a weighted glow that trails the (smoothed) pointer
      // in every chamber. Magnetic, not decorative; vanishes entirely on touch/reduced.
      if (opts.cursor !== false && env.ptr && env.ptr.has) {
        var m = 0.55 + 0.45 * (env.ptr.mag || 0);
        fx.bloom(env, env.ptr.x, env.ptr.y, mn * 0.11, accent, 0.05 * m);
        fx.bloom(env, env.ptr.x, env.ptr.y, mn * 0.045, C.steel, 0.07 * m);
      }
    },

    /* cursor field — 0..1 nearness of the pointer to a canvas point.
       Returns 0 when there is no fine pointer (touch / off-canvas / reduced),
       so hover effects simply vanish on those devices. */
    proximity: function (env, x, y, radius) {
      var pt = env.ptr; if (!pt || !pt.has) return 0;
      var dx = pt.x - x, dy = pt.y - y, d = Math.sqrt(dx * dx + dy * dy);
      return clamp(1 - d / (radius || 170), 0, 1);
    },

    /* magnetic pull toward the cursor — a weighted nudge for hover life.
       Returns {dx,dy,prox}; dx/dy are pixel offsets, prox is 0..1 nearness. */
    pull: function (env, x, y, k, radius) {
      var pt = env.ptr; if (!pt || !pt.has) return { dx: 0, dy: 0, prox: 0 };
      var dx = pt.x - x, dy = pt.y - y, d = Math.sqrt(dx * dx + dy * dy) || 1;
      var prox = clamp(1 - d / (radius || 210), 0, 1), f = prox * prox * (k == null ? 12 : k);
      return { dx: dx / d * f, dy: dy / d * f, prox: prox };
    },

    /* a glowing point that carries STATE via colour — bloom + solid + hot core */
    node: function (env, x, y, r, state, alpha, glowK) {
      var ctx = env.ctx, col = stateCol(state);
      alpha = alpha == null ? 1 : alpha; glowK = glowK == null ? 1 : glowK;
      if (glowK > 0) fx.bloom(env, x, y, r * (3.2 + 3.4 * glowK), col, alpha * (0.34 + 0.20 * glowK));
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = rgba(col, alpha);
      ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill();
      // hot white core for that lit, dimensional read
      ctx.fillStyle = rgba(C.cold, alpha * 0.55);
      ctx.beginPath(); ctx.arc(x, y, r * 0.42, 0, 6.2832); ctx.fill();
      return col;
    },

    /* line / link between two points (optional additive glow) */
    link: function (env, x1, y1, x2, y2, col, alpha, width, glow) {
      var ctx = env.ctx; col = col || C.dim; alpha = alpha == null ? 0.3 : alpha;
      ctx.globalCompositeOperation = glow ? "lighter" : "source-over";
      ctx.strokeStyle = rgba(col, alpha);
      ctx.lineWidth = width || 1; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      ctx.globalCompositeOperation = "source-over";
    },

    /* soft radial halo — now additive bloom (trace / pressure / permission glow) */
    halo: function (env, x, y, r, col, alpha) {
      fx.bloom(env, x, y, r, col || C.steel, alpha == null ? 0.18 : alpha);
    },

    /* a calibration ring / dial — structural language; optional additive glow echo */
    ring: function (env, cx, cy, r, col, alpha, opts) {
      var ctx = env.ctx; opts = opts || {};
      col = col || C.steel; alpha = alpha == null ? 0.5 : alpha;
      var ry = opts.flat ? r * (opts.flat) : r, rot = opts.rot || 0, seg = opts.seg || 0, gap = opts.gap || 0, lw = opts.w || 1.2;
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = rgba(col, alpha); ctx.lineWidth = lw;
      if (!seg) { ctx.beginPath(); ctx.ellipse(cx, cy, r, ry, rot, 0, 6.2832); ctx.stroke(); }
      else {
        var step = 6.2832 / seg;
        for (var i = 0; i < seg; i++) {
          var a0 = rot + i * step + gap * 0.5, a1 = rot + (i + 1) * step - gap * 0.5;
          ctx.beginPath(); ctx.ellipse(cx, cy, r, ry, 0, a0, a1); ctx.stroke();
        }
      }
      // luminous echo — a wider, fainter additive stroke so rings read as lit, not inked
      if (opts.glow !== false && !env.mobile) {
        ctx.save(); ctx.globalCompositeOperation = "lighter";
        ctx.strokeStyle = rgba(col, alpha * 0.5); ctx.lineWidth = lw + 2.5;
        if (!seg) { ctx.beginPath(); ctx.ellipse(cx, cy, r, ry, rot, 0, 6.2832); ctx.stroke(); }
        else {
          var st = 6.2832 / seg;
          for (var k = 0; k < seg; k++) {
            var b0 = rot + k * st + gap * 0.5, b1 = rot + (k + 1) * st - gap * 0.5;
            ctx.beginPath(); ctx.ellipse(cx, cy, r, ry, 0, b0, b1); ctx.stroke();
          }
        }
        ctx.restore();
      }
    },

    /* ORB — the signature volumetric core. A rotating fibonacci point-sphere,
       depth-shaded and bloomed. Reads as one luminous mass with real depth.
         opts.charge  0..1 brightness / energy (default 1)
         opts.spread  radial scale of the shell (1 = sphere; >1 opens outward)
         opts.yaw,opts.pitch  rotation (default ambient yaw + fixed tilt)
         opts.col,opts.hot    base + front-hot colours
         opts.n       point count override */
    orb: function (env, cx, cy, R, opts) {
      opts = opts || {};
      var ctx = env.ctx, t = env.t;
      var n = opts.n || (env.mobile ? 130 : 340);
      var dirs = sphereDirs(n);
      var yaw = opts.yaw == null ? t * 0.16 : opts.yaw;
      var pitch = opts.pitch == null ? 0.46 : opts.pitch;
      var cyaw = Math.cos(yaw), syaw = Math.sin(yaw), cpit = Math.cos(pitch), spit = Math.sin(pitch);
      var col = opts.col || C.steel, hot = opts.hot || C.cold;
      var charge = opts.charge == null ? 1 : clamp(opts.charge, 0, 1.4);
      var spread = opts.spread == null ? 1 : opts.spread;
      var persp = 0.28, flat = opts.flat == null ? 0.92 : opts.flat;
      // volumetric atmosphere behind the points
      fx.bloom(env, cx, cy, R * (1.7 + 0.5 * charge), C.deep, 0.12 + 0.16 * charge);
      fx.bloom(env, cx, cy, R * (0.85 + 0.2 * charge), col, 0.08 + 0.16 * charge);
      // project + depth-sort
      var pr = env.data.__orb || (env.data.__orb = []);
      pr.length = 0;
      for (var i = 0; i < n; i++) {
        var d = dirs[i], x = d[0], y = d[1], z = d[2];
        var x1 = x * cyaw + z * syaw, z1 = -x * syaw + z * cyaw, y1 = y;
        var y2 = y1 * cpit - z1 * spit, z2 = y1 * spit + z1 * cpit;
        pr.push([x1, y2, z2]);
      }
      pr.sort(function (a, b) { return a[2] - b[2]; });
      for (var j = 0; j < n; j++) {
        var pp = pr[j], depth = (pp[2] + 1) * 0.5;            // 0 back .. 1 front
        var sc = 1 / (1 - pp[2] * persp);
        var px = cx + pp[0] * R * spread * sc;
        var py = cy + pp[1] * R * spread * sc * flat;
        var b = 0.12 + 0.88 * depth;
        var rr = (0.6 + 1.5 * depth) * (0.85 + 0.4 * charge);
        var c = mixc(col, hot, depth * depth * 0.7 * charge);
        fx.bloom(env, px, py, rr * 4.0, c, (0.07 + 0.20 * b) * charge);
        ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = rgba(c, (0.30 + 0.5 * b) * charge);
        ctx.beginPath(); ctx.arc(px, py, rr, 0, 6.2832); ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
    },

    /* the sealed execution core — concentric plated rings with seams.
       open: 0 sealed → 1 plates separated. */
    core: function (env, cx, cy, R, open, opts) {
      var ctx = env.ctx; opts = opts || {}; open = clamp(open, 0, 1);
      var t = env.t, baseCol = opts.col || C.steel;
      fx.bloom(env, cx, cy, R * (1.9 + open * 0.6), C.deep, 0.14 + 0.08 * open);
      var layers = opts.layers || 5;
      for (var i = layers - 1; i >= 0; i--) {
        var f = i / (layers - 1);
        var sep = open * R * 0.42 * f;
        var rr = R * (0.34 + f * 0.66) + sep;
        var rot = (t * 0.04) * (i % 2 ? -1 : 1) * (0.4 + f) + f * 0.6;
        var a = (0.18 + 0.42 * (1 - f)) * (1 - open * 0.35 * f);
        fx.ring(env, cx, cy, rr, baseCol, a, { flat: 0.9, seg: 3 + i * 2, gap: 0.16 + open * 0.5, rot: rot, w: 1.2 });
      }
      var innerR = R * 0.3 * (1 - open * 0.7);
      fx.bloom(env, cx, cy, innerR * 2.4, baseCol, 0.3 * (1 - open));
      if (opts.sealPulse) { var sp = opts.sealPulse; fx.ring(env, cx, cy, R * (0.36 + (1 - sp) * 0.8), C.cold, sp * 0.5, { flat: 0.9, w: 1.6 }); }
    },

    /* a boundary / membrane the artifacts must cross to be admitted */
    boundary: function (env, x, y, w, h, perm, col, alpha) {
      var ctx = env.ctx; col = col || C.deep; perm = perm == null ? 1 : perm;
      ctx.save();
      ctx.strokeStyle = rgba(col, (alpha == null ? 0.5 : alpha));
      ctx.lineWidth = 1.4; ctx.setLineDash([1, 7 - perm * 4]);
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + h); ctx.stroke();
      ctx.setLineDash([]);
      // luminous membrane glow on the admit side
      ctx.globalCompositeOperation = "lighter";
      var g = ctx.createLinearGradient(x - 34, 0, x + 6, 0);
      g.addColorStop(0, rgba(col, 0)); g.addColorStop(1, rgba(col, 0.18 * perm));
      ctx.fillStyle = g; ctx.fillRect(x - 34, y, 40, h);
      ctx.restore();
    },

    /* an artifact of reality — shard / pulse / timestamp / trace */
    fragment: function (env, x, y, s, kind, col, alpha) {
      var ctx = env.ctx; col = col || C.dim; alpha = alpha == null ? 0.7 : alpha;
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = rgba(col, alpha); ctx.fillStyle = rgba(col, alpha); ctx.lineWidth = 1.1;
      kind = kind || (s % 1 > 0.5 ? "bar" : "dot");
      if (kind === "bar") { ctx.fillRect(x - s, y - 0.6, s * 2, 1.3); }
      else if (kind === "tick") { ctx.beginPath(); ctx.moveTo(x, y - s); ctx.lineTo(x, y + s); ctx.stroke(); }
      else if (kind === "cross") { ctx.beginPath(); ctx.moveTo(x - s, y); ctx.lineTo(x + s, y); ctx.moveTo(x, y - s); ctx.lineTo(x, y + s); ctx.stroke(); }
      else if (kind === "ring") { ctx.beginPath(); ctx.arc(x, y, s, 0, 6.2832); ctx.stroke(); }
      else { ctx.beginPath(); ctx.arc(x, y, Math.max(0.8, s * 0.5), 0, 6.2832); ctx.fill(); }
    },

    /* the protected REVIEW chamber — a threshold, not an error */
    reviewChamber: function (env, x, y, r, intensity) {
      var ctx = env.ctx, t = env.t; intensity = intensity == null ? 1 : intensity;
      fx.bloom(env, x, y, r * 2.0, C.amber, 0.16 * intensity);
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = rgba(C.amber, 0.55 * intensity); ctx.lineWidth = 1.2;
      ctx.setLineDash([2, 4]);
      ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.stroke();
      ctx.setLineDash([]);
      var pulse = 0.5 + 0.5 * Math.sin(t * 1.4);
      ctx.strokeStyle = rgba(C.amber, (0.18 + 0.18 * pulse) * intensity);
      ctx.beginPath(); ctx.arc(x, y, r * (0.7 + 0.18 * pulse), 0, 6.2832); ctx.stroke();
    },

    /* provenance trace — a thin witnessed path (Luna) */
    trace: function (env, pts, col, alpha, dashShift) {
      var ctx = env.ctx; if (pts.length < 2) return;
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = rgba(col || C.steel, alpha == null ? 0.4 : alpha); ctx.lineWidth = 1.1;
      ctx.setLineDash([1, 5]); ctx.lineDashOffset = -(dashShift || 0);
      ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
      for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.stroke(); ctx.setLineDash([]); ctx.lineDashOffset = 0;
    },

    /* label (Hanken). Carries captions inside canvas sparingly. */
    label: function (env, text, x, y, opts) {
      var ctx = env.ctx; opts = opts || {};
      var size = opts.size || 11;
      ctx.globalCompositeOperation = "source-over";
      ctx.font = (opts.weight || 600) + " " + size + 'px "Hanken Grotesk", ui-sans-serif, system-ui, sans-serif';
      ctx.textAlign = opts.align || "center"; ctx.textBaseline = opts.baseline || "middle";
      ctx.save(); if (ctx.letterSpacing !== undefined) ctx.letterSpacing = (opts.spacing == null ? 2 : opts.spacing) + "px";
      ctx.fillStyle = rgba(opts.col || C.cold, opts.alpha == null ? 0.7 : opts.alpha);
      ctx.fillText(opts.upper === false ? text : text.toUpperCase(), x, y);
      ctx.restore();
    },

    /* command terrain — a field of stateful node points (Console) */
    terrain: function (env, cx, cy, nodes, reveal) {
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i]; if (i / nodes.length > reveal) continue;
        if (n.link >= 0 && nodes[n.link]) fx.link(env, n.x, n.y, nodes[n.link].x, nodes[n.link].y, C.deep, 0.16 * n.z, 1, true);
      }
      for (var j = 0; j < nodes.length; j++) {
        var m = nodes[j]; if (j / nodes.length > reveal) continue;
        var pulse = 0.6 + 0.4 * Math.sin(env.t * 1.2 + m.ph);
        fx.node(env, m.x, m.y, (1.2 + m.z * 2.0), m.state, (0.3 + 0.5 * m.z) * pulse, m.state === "idle" ? 0.2 : m.z);
      }
    }
  };

  /* ============================================================
   * Engine — registry + scroll controller
   * ============================================================ */
  var scenes = {};
  function registerScene(name, def) { scenes[name] = def; }

  var REDUCED = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var MOBILE = (global.DamarosAnim && DamarosAnim.isMobile()) || (window.matchMedia && matchMedia("(hover: none),(pointer: coarse)").matches) || window.innerWidth <= 820;
  var DPR = MOBILE ? 1 : Math.min(2, window.devicePixelRatio || 1);
  var t0 = (window.performance && performance.now()) ? performance.now() : 0;

  var sections = [], veil = null, hud = [], progressEl = null;
  var lastScrollY = 0, velSmooth = 0;                 // scroll velocity (px/frame, smoothed)
  var ptrCX = -1, ptrCY = -1, ptrHas = false, ptrMag = 0, ptrLX = 0, ptrLY = 0; // cursor field (raw)
  var ptrSX = -1, ptrSY = -1;                         // smoothed pointer — weighted/magnetic feel
  var ambBreath = 0;                                  // global ambient breath 0..1 (eased sine)
  var firstFramePainted = false;                      // the loader waits for the first real frame
  // chromatic-aberration transition overlay (desktop refinement; see renderOverlay)
  var fxo = null, fxoCtx = null, fxoTmp = null, fxoTmpCtx = null, fxoW = 0, fxoH = 0, abAmt = 0;

  function sizeCanvas(rec) {
    var r = rec.pin.getBoundingClientRect();
    var w = Math.max(1, r.width), h = Math.max(1, window.innerHeight);
    if (rec.w === w && rec.h === h) return;
    rec.w = w; rec.h = h;
    rec.cv.width = Math.round(w * DPR); rec.cv.height = Math.round(h * DPR);
    rec.cv.style.width = w + "px"; rec.cv.style.height = h + "px";
    rec.ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (rec.def.init) rec.def.init(envFor(rec, 0));
  }

  function envFor(rec, p) {
    return { ctx: rec.ctx, w: rec.w, h: rec.h, dpr: DPR, p: p, t: (now() - t0) / 1000,
             mobile: MOBILE, reduced: REDUCED, C: C, fx: fx, rng: rec.rng, data: rec.data, scene: rec.name,
             ptr: rec.ptr || { x: rec.w * 0.5, y: rec.h * 0.5, has: false, mag: 0 },
             vel: velSmooth, veln: clamp(Math.abs(velSmooth) / 40, 0, 1), scroll: lastScrollY,
             breath: ambBreath };   // env.breath: shared eased 0..1 idle pulse (ambient life)
  }
  function now() { return (window.performance && performance.now) ? performance.now() : Date.now(); }

  function setCaptions(rec, p) {
    var caps = rec.caps; if (!caps) return;
    for (var i = 0; i < caps.length; i++) {
      var c = caps[i], on = p >= c.from && p <= c.to;
      if (on !== c.on) { c.on = on; c.el.classList.toggle("on", on); }
    }
  }

  function frame() {
    var vh = window.innerHeight, active = null, gp = 0;
    var sy = window.scrollY || window.pageYOffset || 0;
    velSmooth += ((sy - lastScrollY) - velSmooth) * 0.25; lastScrollY = sy;
    ptrMag *= 0.92;
    // weighted pointer — ease the smoothed cursor toward the raw target so hover
    // reads magnetic and settled, never snappy. (Snap is what makes UI feel cheap.)
    if (ptrHas) {
      if (ptrSX < 0) { ptrSX = ptrCX; ptrSY = ptrCY; }
      ptrSX += (ptrCX - ptrSX) * 0.18; ptrSY += (ptrCY - ptrSY) * 0.18;
    }
    ambBreath = 0.5 + 0.5 * Math.sin(((now() - t0) / 1000) * 0.5);   // shared idle pulse
    for (var i = 0; i < sections.length; i++) {
      var rec = sections[i], r = rec.sec.getBoundingClientRect();
      var inView = r.top < vh && r.bottom > 0;
      if (!inView) { if (rec.wasIn) { rec.ctx.clearRect(0, 0, rec.w, rec.h); rec.wasIn = false; } continue; }
      sizeCanvas(rec);
      var span = (rec.sec.offsetHeight - vh) || 1;
      var p = clamp(-r.top / span, 0, 1);
      rec.sec.style.setProperty("--p", p.toFixed(4));
      if (ptrHas) {
        var cvr = rec.cv.getBoundingClientRect();
        rec.ptr = { x: ptrSX - cvr.left, y: ptrSY - cvr.top, mag: ptrMag,
          has: ptrSX >= cvr.left && ptrSX <= cvr.right && ptrSY >= cvr.top && ptrSY <= cvr.bottom };
      } else if (rec.ptr) { rec.ptr.has = false; }
      var env = envFor(rec, p);
      // cursor parallax — a weighted camera lean toward the pointer (desktop only),
      // so the whole chamber has depth that responds to the hand. fx.field overscans
      // its clear, so the lean never reveals an uncleared edge. Clamped to ±15px.
      if (rec.def.draw) {
        if (!MOBILE && rec.ptr && rec.ptr.has) {
          var pxo = clamp((rec.ptr.x - rec.w * 0.5) * 0.016, -15, 15);
          var pyo = clamp((rec.ptr.y - rec.h * 0.5) * 0.016, -15, 15);
          rec.ctx.save(); rec.ctx.translate(pxo, pyo); rec.def.draw(env); rec.ctx.restore();
        } else {
          rec.def.draw(env);
        }
      }
      setCaptions(rec, p);
      rec.wasIn = true;
      // the scene whose pin most fills the viewport is "active"
      var vis = Math.min(vh, r.bottom) - Math.max(0, r.top);
      if (vis > gp) { gp = vis; active = rec; }
      // edge darkness → veil masks the cut between chambers. The OUTER ends stay
      // open: the first scene is bright at the top (hero on load) and the last is
      // bright at the bottom (the locked terminal frame). Only interior cuts darken.
      var lead  = rec.isFirst ? 1 : p;
      var trail = rec.isLast  ? 1 : (1 - p);
      rec.edge = Math.min(lead, trail);
    }
    if (veil) {
      // softer than before — the cut is now carried by refraction (renderOverlay),
      // so the veil only needs to deepen the seam, not black it out.
      var ve = active ? smooth(0.12, 0.0, active.edge) * 0.6 : 0.6;
      veil.style.opacity = ve.toFixed(3);
    }
    renderOverlay(active);
    updateHud(active);
    updateProgress();
    firstFramePainted = true;        // the loader may now reveal a fully-painted hero
  }

  /* ============================================================
   * Chromatic-aberration overlay — the "between-sections" refraction that
   * makes the traversal feel liquid and expensive (hashgraph-grade). A single
   * fixed canvas above the scene layer (below captions, which stay crisp). Each
   * frame we re-tint the ACTIVE scene's pixels into split red/blue ghosts,
   * offset along the scroll axis. The amount tracks scroll velocity AND nearness
   * to a scene cut, and eases to zero when idle — so a still page is perfectly
   * crisp (and free), while motion and transitions fringe with light.
   * Desktop only: it is a refinement, never load-bearing.
   * ============================================================ */
  function ensureOverlay() {
    if (fxoCtx) return;
    fxo = document.getElementById("fxo");
    if (!fxo) { fxo = document.createElement("canvas"); fxo.id = "fxo"; fxo.setAttribute("aria-hidden", "true"); document.body.appendChild(fxo); }
    fxoCtx = fxo.getContext("2d");
    fxoTmp = document.createElement("canvas"); fxoTmpCtx = fxoTmp.getContext("2d");
  }
  function renderOverlay(active) {
    if (MOBILE) return;                       // desktop refinement only
    ensureOverlay(); if (!fxoCtx) return;
    var w = Math.round(window.innerWidth * DPR), h = Math.round(window.innerHeight * DPR);
    if (w !== fxoW || h !== fxoH) {
      fxoW = w; fxoH = h; fxo.width = w; fxo.height = h;
      fxo.style.width = window.innerWidth + "px"; fxo.style.height = window.innerHeight + "px";
      fxoTmp.width = w; fxoTmp.height = h;
    }
    // target aberration = fast scroll OR nearness to an interior cut
    var velA = clamp(Math.abs(velSmooth) / 26, 0, 1);
    var edgeA = active ? smooth(0.18, 0.0, active.edge) : 0;
    var target = clamp(velA * 0.9 + edgeA * 0.85, 0, 1);
    abAmt += (target - abAmt) * 0.2;
    fxoCtx.setTransform(1, 0, 0, 1, 0, 0);
    fxoCtx.clearRect(0, 0, fxoW, fxoH);
    if (abAmt < 0.012 || !active || !active.cv) return;     // crisp + free when settled
    var src = active.cv, tc = fxoTmpCtx;
    var dir = velSmooth < 0 ? -1 : 1;
    var dx = abAmt * 7 * DPR, dy = abAmt * 11 * DPR * dir;
    var a = clamp(abAmt, 0, 1) * 0.5;
    // RED ghost, shifted one way
    tc.setTransform(1, 0, 0, 1, 0, 0); tc.globalCompositeOperation = "source-over";
    tc.clearRect(0, 0, fxoW, fxoH); tc.drawImage(src, 0, 0, fxoW, fxoH);
    tc.globalCompositeOperation = "multiply"; tc.fillStyle = "#ff0000"; tc.fillRect(0, 0, fxoW, fxoH);
    tc.globalCompositeOperation = "source-over";
    fxoCtx.globalCompositeOperation = "lighter"; fxoCtx.globalAlpha = a;
    fxoCtx.drawImage(fxoTmp, dx, dy);
    // BLUE ghost, shifted the other way
    tc.clearRect(0, 0, fxoW, fxoH); tc.drawImage(src, 0, 0, fxoW, fxoH);
    tc.globalCompositeOperation = "multiply"; tc.fillStyle = "#0000ff"; tc.fillRect(0, 0, fxoW, fxoH);
    tc.globalCompositeOperation = "source-over";
    fxoCtx.globalAlpha = a; fxoCtx.drawImage(fxoTmp, -dx, -dy);
    fxoCtx.globalAlpha = 1; fxoCtx.globalCompositeOperation = "source-over";
  }

  function updateHud(active) {
    if (!hud.length) return;
    var key = active ? (active.def.hud || active.name) : null;
    for (var i = 0; i < hud.length; i++) hud[i].el.classList.toggle("active", hud[i].key === key);
  }
  function updateProgress() {
    if (!progressEl) return;
    var doc = document.documentElement;
    var max = (doc.scrollHeight - window.innerHeight) || 1;
    progressEl.style.transform = "scaleX(" + clamp(window.scrollY / max, 0, 1).toFixed(4) + ")";
  }

  function staticRender() {
    // reduced motion: compose each scene at its resolved end-state, all captions shown
    for (var i = 0; i < sections.length; i++) {
      var rec = sections[i]; sizeCanvas(rec);
      if (rec.def.draw) rec.def.draw(envFor(rec, 1));
      if (rec.caps) for (var j = 0; j < rec.caps.length; j++) rec.caps[j].el.classList.add("on");
    }
    if (veil) veil.style.opacity = 0;
    firstFramePainted = true;
  }

  function boot() {
    readPalette(); buildGrain();
    veil = document.getElementById("veil");
    progressEl = document.querySelector("[data-progress]");
    [].forEach.call(document.querySelectorAll("[data-hud]"), function (el) { hud.push({ el: el, key: el.getAttribute("data-hud") }); });

    [].forEach.call(document.querySelectorAll(".scene[data-scene]"), function (sec, idx) {
      var name = sec.getAttribute("data-scene");
      var def = scenes[name] || { draw: function (e) { fx.field(e); } };
      var pin = sec.querySelector(".pin") || sec;
      var cv = sec.querySelector("canvas.cv");
      if (!cv) { cv = document.createElement("canvas"); cv.className = "cv"; pin.insertBefore(cv, pin.firstChild); }
      var caps = [].slice.call(sec.querySelectorAll("[data-from]")).map(function (el) {
        return { el: el, from: parseFloat(el.getAttribute("data-from")) || 0, to: parseFloat(el.getAttribute("data-to")), on: false };
      }).map(function (c) { if (isNaN(c.to)) c.to = 1; return c; });
      sections.push({ sec: sec, pin: pin, cv: cv, ctx: cv.getContext("2d"), name: name, def: def,
                      rng: mkRng((idx + 1) * 2654435761), data: {}, w: 0, h: 0, wasIn: false, caps: caps, edge: 0 });
    });
    if (sections.length) { sections[0].isFirst = true; sections[sections.length - 1].isLast = true; }
    ensureOverlay();

    window.addEventListener("resize", function () { for (var i = 0; i < sections.length; i++) sections[i].w = 0; if (REDUCED) staticRender(); });
    new MutationObserver(function () { readPalette(); if (REDUCED) staticRender(); }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    // cursor field — fine pointers only; touch / reduced never engage hover life
    if (!MOBILE) {
      window.addEventListener("pointermove", function (e) {
        if (e.pointerType === "touch") { ptrHas = false; return; }
        var dm = Math.abs(e.clientX - ptrLX) + Math.abs(e.clientY - ptrLY);
        ptrMag = clamp(ptrMag + dm * 0.02, 0, 1);
        ptrLX = e.clientX; ptrLY = e.clientY; ptrCX = e.clientX; ptrCY = e.clientY; ptrHas = true;
      }, { passive: true });
      window.addEventListener("pointerout", function (e) { if (!e.relatedTarget) ptrHas = false; }, { passive: true });
      window.addEventListener("blur", function () { ptrHas = false; });
    }

    if (REDUCED) { staticRender(); window.addEventListener("scroll", updateProgress, { passive: true }); return; }
    if (global.DamarosAnim && DamarosAnim.loop) DamarosAnim.loop({ root: document.documentElement, onFrame: frame }).start();
    else (function spin() { frame(); requestAnimationFrame(spin); })();
  }

  /* ============================================================
   * Boot loader — INITIALIZING. A stone-blue rectangle that fills to 100%
   * beneath the Damaros wordmark, then lifts to reveal an already-bright hero.
   * Progress is honest: it tracks web-font readiness and the first painted
   * frame, with a short minimum so it reads as intentional, not a flash.
   * ============================================================ */
  function startLoader() {
    var box = document.getElementById("boot");
    if (!box) return;
    var html = document.documentElement;
    html.classList.add("booting");                                  // lock scroll during load
    setTimeout(function () { html.classList.remove("booting"); }, 6000);  // failsafe unlock
    var bar = box.querySelector("[data-boot-bar]");
    var pctEl = box.querySelector("[data-boot-pct]");
    var start = now(), prog = 0, fontsReady = false, done = false;
    if (document.fonts && document.fonts.ready && document.fonts.ready.then) {
      document.fonts.ready.then(function () { fontsReady = true; });
      setTimeout(function () { fontsReady = true; }, 3500);    // never hang on a slow font
    } else { fontsReady = true; }
    function step() {
      var el = now() - start, tg = 0.10;
      if (el > 120) tg = 0.32;
      if (fontsReady) tg = Math.max(tg, 0.64);
      if (firstFramePainted) tg = Math.max(tg, 0.90);
      var minMs = REDUCED ? 450 : 850;
      var ready = fontsReady && firstFramePainted && el > minMs;
      if (ready) tg = 1;
      prog += (tg - prog) * (ready ? 0.20 : 0.08);
      if (tg >= 1 && prog > 0.996) prog = 1;
      var shown = prog >= 1 ? 100 : Math.min(99, Math.round(prog * 100));
      if (bar) bar.style.transform = "scaleX(" + prog.toFixed(4) + ")";
      if (pctEl) { if (pctEl.firstChild) pctEl.firstChild.nodeValue = shown; else pctEl.textContent = shown; }
      box.setAttribute("aria-valuenow", String(shown));
      if (prog >= 1 && !done) {
        done = true;
        box.classList.add("boot--done");
        document.documentElement.classList.remove("booting");
        setTimeout(function () { if (box.parentNode) box.parentNode.removeChild(box); }, 760);
        return;
      }
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  global.Damaros = { registerScene: registerScene, fx: fx, C: C, _scenes: scenes };
  // defer boot so scene modules loaded AFTER this script register before we read the registry
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
    document.addEventListener("DOMContentLoaded", startLoader);
  } else { setTimeout(boot, 0); startLoader(); }
})(typeof window !== "undefined" ? window : this);
