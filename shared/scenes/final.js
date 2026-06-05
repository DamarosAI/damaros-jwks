/* FINAL — the declaration LOCKS. The whole governed system collapses into one
   coherent object, bookending the OPENING. At p=0 the camera has pulled back:
   Protocol · Evidence · Screening · Replay · Node · Console · Trident · Luna are
   all faintly present at once in one execution field, the core seated centre-upper.
   BEATS:
     0.00–0.20  the whole system BREATHES once — a single swell.
     0.20–0.55  complexity ALIGNS (not fades): the eight chapter echoes converge inward.
     0.40–0.80  the four AXES resolve around the core — forces moved through, not labels;
                colours settle into BALANCE (green resolved · blue structure · white proof ·
                amber review · PURPLE provenance — all present).
     0.55–0.92  the core gathers into the signature ORB, governed steel, fully resolved;
                settle rings tighten & breathe.
     0.80–1.00  the CTA emerges like an UNLOCKED DOOR — a vertical seam opens, a soft shaft
                descends toward where the CTA sits below.
   Restraint: no explosion, no confetti. The system, still running. p=1 = the locked,
   aligned, door-open terminal frame. The core is the SAME core from opening/worldbg,
   returned and resolved. */
(function () {
  if (!window.Damaros) return;

  // the four forces the viewer has moved through (resolve around the core again)
  var AX = ["Protocol", "Evidence", "Screening", "Replay"];
  // the eight chambers, faintly present at once — each converges home with its own motif.
  // kind chooses the glyph; state carries doctrine colour so the field reads balanced.
  var CHAPTERS = [
    { name: "Protocol",  kind: "bar",   state: "deep" },
    { name: "Evidence",  kind: "tick",  state: "cold" },
    { name: "Screening", kind: "cross", state: "review" },
    { name: "Replay",    kind: "ring",  state: "luna" },
    { name: "Node",      kind: "dot",   state: "pass" },
    { name: "Console",   kind: "dot",   state: "deep" },
    { name: "Trident",   kind: "tick",  state: "cold" },
    { name: "Luna",      kind: "ring",  state: "luna" }
  ];

  Damaros.registerScene("final", {
    hud: null,

    init: function (env) {
      var r = env.rng, i;

      // --- the eight chapter echoes: motifs that drift in from the edges and lock
      //     into a shell around the core (converge, not fade). On mobile we keep all
      //     eight chambers but drop the extra free fragments. ---
      var echoes = [];
      for (i = 0; i < CHAPTERS.length; i++) {
        var ch = CHAPTERS[i];
        echoes.push({
          name: ch.name, kind: ch.kind, state: ch.state,
          a: (i / CHAPTERS.length) * 6.2832 + r() * 0.5,  // spread evenly, slight scatter
          far: 1.95 + r() * 1.15,        // starting distance (core radii)
          near: 1.32 + r() * 0.30,       // resting shell distance
          flat: 0.62 + r() * 0.10,       // ellipse squash (the shell is flattened)
          s: 2.4 + r() * 1.6,            // glyph size
          ph: r() * 6.2832,              // ambient phase
          ord: 0.02 + (i / CHAPTERS.length) * 0.40 + r() * 0.10, // staggered commit
          wob: 0.7 + r() * 0.7           // pre-commit wobble
        });
      }
      env.data.echoes = echoes;

      // --- extra residual fragments (the journey's noise) converging home ---
      var nFrag = env.mobile ? 7 : 18, frags = [], kinds = ["bar", "tick", "cross", "ring", "dot"];
      for (i = 0; i < nFrag; i++) {
        frags.push({
          a: r() * 6.2832, far: 1.7 + r() * 1.4, near: 1.05 + r() * 0.5,
          flat: 0.66 + r() * 0.16, kind: kinds[(r() * kinds.length) | 0],
          s: 1.8 + r() * 1.8, ph: r() * 6.2832, ord: 0.04 + r() * 0.55,
          pass: r() < 0.66, wob: 0.6 + r() * 0.8
        });
      }
      env.data.frags = frags;

      // --- faint provenance traces converging toward the core (purple thread) ---
      var nTr = env.mobile ? 3 : 5, traces = [];
      for (i = 0; i < nTr; i++) {
        traces.push({ a: r() * 6.2832, segs: 3 + ((r() * 2) | 0), jit: 0.10 + r() * 0.16,
                      ph: r() * 6.2832, far: 1.9 + r() * 0.9 });
      }
      env.data.traces = traces;

      // --- inward-drifting motes (directional dust — residue returning home) ---
      var nMote = env.mobile ? 12 : 28, motes = [];
      for (i = 0; i < nMote; i++) {
        motes.push({ a: r() * 6.2832, d0: 1.5 + r() * 1.7, rad: 0.5 + r() * 0.9,
                     ph: r() * 6.2832, sp: 0.4 + r() * 0.7 });
      }
      env.data.motes = motes;
    },

    draw: function (env) {
      var fx = env.fx, C = env.C, w = env.w, h = env.h, p = env.p, t = env.t;
      var d = env.data, ctx = env.ctx;

      // core sits in the upper third — the centre band stays quiet for the centred
      // caption + CTA that overlay the canvas. This is the same seat as worldbg/opening.
      var cx = w * 0.5, cy = h * (env.mobile ? 0.30 : 0.33);
      var R = Math.min(w, h) * (env.mobile ? 0.17 : 0.185);

      // ---- timeline beats ----
      // a single SYSTEM BREATH: one swell that rises ~p<=0.12 then settles (not a loop).
      var swell = Math.sin(fx.clamp(p / 0.20, 0, 1) * Math.PI);   // 0→1→0 across 0..0.20
      var converge = fx.smooth(0.20, 0.55, p);                    // echoes commit inward
      var assemble = fx.easeInOut(fx.clamp((p - 0.10) / 0.55, 0, 1)); // core gathers/charges
      var axial    = fx.smooth(0.40, 0.80, p);                    // four forces resolve
      var settle   = fx.smooth(0.55, 0.92, p);                    // governed steel settles
      var door     = fx.easeOut(fx.smooth(0.80, 1.00, p));        // the seam opens
      // quiet end-state breathing (ambient), amplified slightly by the one-time swell
      var breath   = (0.5 + 0.5 * Math.sin(t * 0.55)) * (0.4 + 0.6 * settle);
      var sysBreath = 1 + swell * 0.06;                           // global gentle scale of the swell

      // guard (engine always inits, but be safe)
      if (!d || !d.echoes) { fx.worldbg(env, { cx: cx, cy: cy, accent: C.deep, core: 0.3 }); return; }

      // ---- the persistent world: the system already running. The core seat here is
      //      the SAME seat returned & resolved (continuity). A faint ghost-orb marks it
      //      as a bookend; the swell + settle lift its presence. ----
      fx.worldbg(env, {
        cx: cx, cy: cy,
        lift: 0.72 + 0.10 * settle + 0.04 * swell,
        tint: 0.12,
        accent: C.deep,
        core: 0.26 + 0.10 * swell + 0.06 * settle,
        coreR: 0.18,
        orb: true,
        dust: env.mobile ? 18 : 36,
        seed: 101
      });

      // ---- inward-drifting motes (the journey's residue returning home) ----
      var motes = d.motes;
      for (var mi = 0; mi < motes.length; mi++) {
        var mo = motes[mi];
        var md = fx.lerp(mo.d0, mo.rad, converge);
        var ma = mo.a + t * 0.02 * mo.sp + (1 - converge) * 0.25;
        var mx = cx + Math.cos(ma) * R * md, my = cy + Math.sin(ma) * R * md * 0.9;
        var mAlpha = (0.05 + 0.10 * converge) * (0.5 + 0.5 * Math.sin(t * mo.sp + mo.ph)) * (1 + swell * 0.5);
        fx.bloom(env, mx, my, (3 + (1 - converge) * 3) * sysBreath, C.dim, mAlpha);
      }

      // ---- provenance traces converging toward the core (the purple through-line) ----
      var traces = d.traces;
      for (var tri = 0; tri < traces.length; tri++) {
        var tr = traces[tri], reach = fx.lerp(tr.far, 1.10, converge), pts = [], sN = tr.segs;
        for (var si = 0; si <= sN; si++) {
          var f = si / sN, rr = fx.lerp(1.06, reach, f);
          var aa = tr.a + Math.sin(f * 3.0 + tr.ph) * tr.jit * (0.4 + 0.6 * (1 - converge));
          pts.push({ x: cx + Math.cos(aa) * R * rr, y: cy + Math.sin(aa) * R * rr * 0.85 });
        }
        // provenance is purple and never fully gone — even at rest a slow trace breathes.
        fx.trace(env, pts, C.luna, (0.10 + 0.14 * converge) * (1 - door * 0.35) + 0.04, t * 12 + tri * 9);
      }

      // ---- the eight CHAPTER ECHOES: every chamber present at once, converging into a
      //      flattened shell around the core. Each carries its doctrine colour so the
      //      whole field reads balanced (blue · white · amber · purple · green). ----
      var echoes = d.echoes;
      for (var ci = 0; ci < echoes.length; ci++) {
        var e = echoes[ci];
        var commit = fx.smooth(e.ord, e.ord + 0.40, p);
        var dist = fx.lerp(e.far, e.near, commit), wob = (1 - commit) * e.wob;
        var ang = e.a + t * 0.022 + Math.sin(t * 1.1 + e.ph) * 0.05 * (1 - commit);
        var ex = cx + Math.cos(ang) * R * dist + Math.cos(t * 1.4 + e.ph) * wob * 4;
        var ey = cy + Math.sin(ang) * R * dist * e.flat + Math.sin(t * 1.1 + e.ph) * wob * 3;
        // the swell briefly brightens every chamber at once (the one breath)
        var lit = (0.34 + 0.46 * commit) * (1 + swell * 0.6) * (1 - door * 0.28);
        if (commit > 0.55) {
          // locked into the shell: a stateful node carrying the chamber's colour
          fx.node(env, ex, ey, 2.0, e.state, lit, commit);
        } else {
          // still arriving: a faint colour-coded glyph drifting inward
          var fragCol = stateColLocal(C, e.state);
          fx.fragment(env, ex, ey, e.s, e.kind, fragCol, lit * 0.85);
        }
      }

      // ---- residual fragments (journey noise) committing into the shell ----
      var frags = d.frags;
      for (var fi = 0; fi < frags.length; fi++) {
        var fr = frags[fi];
        var fcommit = fx.smooth(fr.ord, fr.ord + 0.42, p);
        var fdist = fx.lerp(fr.far, fr.near, fcommit), fwob = (1 - fcommit) * fr.wob;
        var fang = fr.a + t * 0.03 + Math.sin(t * 1.2 + fr.ph) * 0.05 * (1 - fcommit);
        var fxp = cx + Math.cos(fang) * R * fdist + Math.cos(t * 1.4 + fr.ph) * fwob * 4;
        var fyp = cy + Math.sin(fang) * R * fdist * fr.flat + Math.sin(t * 1.1 + fr.ph) * fwob * 3;
        if (fr.pass && fcommit > 0.6) {
          fx.node(env, fxp, fyp, 1.6, fcommit > 0.86 ? "pass" : "deep",
                  (0.34 + 0.36 * fcommit) * (1 - door * 0.3) * (1 + swell * 0.4), fcommit);
        } else {
          fx.fragment(env, fxp, fyp, fr.s, fr.kind, fr.pass ? C.deep : C.dim,
                      (fr.pass ? 0.42 : 0.28) * (0.32 + 0.68 * fcommit) * (1 - door * 0.32) * (1 + swell * 0.4));
        }
      }

      // ---- THE FOUR FORCES, resolving around the core (forces moved through, not labels).
      //      On a flattened ellipse. Doctrine colours BALANCED: blue structure spokes,
      //      green resolved nodes, white proof ticks at the outer reach, amber review on
      //      the unresolved one, purple provenance feeding the apex. ----
      var ringR = R * (env.mobile ? 1.98 : 2.05);
      var ringFlat = 0.5;
      // the flat axis ellipse itself — structural seat for the forces
      if (axial > 0.01) {
        fx.ring(env, cx, cy, ringR, C.deep, 0.14 * axial * (1 - door * 0.3), { flat: ringFlat, w: 1.0, rot: 0.0 });
        fx.ring(env, cx, cy, ringR * 0.62, C.steel, 0.10 * axial, { flat: ringFlat, w: 1.0 });
      }
      for (var i = 0; i < 4; i++) {
        var a = -Math.PI / 2 + i * (Math.PI / 2) + t * 0.018;
        var ax = cx + Math.cos(a) * ringR, ay = cy + Math.sin(a) * ringR * ringFlat;
        var ix = cx + Math.cos(a) * R * 1.12, iy = cy + Math.sin(a) * R * 1.12 * ringFlat;

        // subtle magnetic life: each force node leans toward the cursor (vanishes on touch)
        var pull = fx.pull(env, ax, ay, env.mobile ? 0 : 7, 150);
        ax += pull.dx; ay += pull.dy;

        // blue structural spoke from core to force
        fx.link(env, ix, iy, ax, ay, C.deep, 0.20 * axial * (0.7 + 0.3 * (1 - door * 0.5)), 1, true);

        // the LAST force (Replay, i==3) reads as a held REVIEW — amber, honestly marked —
        // until the system fully settles, then it too resolves green. Keeps amber present.
        var isReview = (i === 3) && settle < 0.85;
        var resolved = settle > (0.12 + i * 0.12);

        if (isReview) {
          var trem = (1 - settle) * 1.4;
          var rx = ax + Math.sin(t * 3 + i) * trem, ry = ay + Math.cos(t * 2.6 + i) * trem;
          fx.node(env, rx, ry, 2.4, "review", (0.55 + 0.30 * axial), 0.9);
          var rpulse = 0.5 + 0.5 * Math.sin(t * 1.5 + i);
          fx.ring(env, rx, ry, 5.5 + rpulse * 1.2, C.amber, 0.24 * axial, { w: 1, glow: false });
        } else if (resolved) {
          // GREEN resolved force + a hot white proof tick just outside it (evidence)
          fx.node(env, ax, ay, 2.6, "pass", 0.85 * axial, 1.0 + 0.2 * pull.prox);
          var tox = cx + Math.cos(a) * (ringR + 11), toy = cy + Math.sin(a) * (ringR + 11) * ringFlat;
          fx.fragment(env, tox, toy, 2.4, "tick", C.cold, 0.42 * axial * (0.7 + 0.3 * breath));
        } else {
          // not yet resolved: deep-blue structural seed, faintly jittering
          var jit = (1 - axial) * 1.6;
          fx.node(env, ax + Math.sin(t * 3 + i) * jit, ay + Math.cos(t * 2.6 + i) * jit,
                  2.2, "deep", (0.45 + 0.25 * Math.sin(t * 2 + i)) * axial, 0.6);
        }

        // the force NAME, on the flat ellipse (tiny in-world annotation, not a caption)
        fx.label(env, AX[i], ax, ay - 15, { size: env.mobile ? 7.5 : 9.5, col: C.steel,
                 alpha: 0.55 * axial * (0.8 + 0.2 * pull.prox), spacing: 2.6 });
      }

      // a faint PURPLE provenance node feeding the topmost apex — governance present,
      // balancing the green/blue/white/amber of the forces.
      if (axial > 0.2) {
        var apexA = -Math.PI / 2 + t * 0.018;
        var pax = cx + Math.cos(apexA) * ringR * 0.78, pay = cy + Math.sin(apexA) * ringR * 0.78 * ringFlat;
        fx.node(env, pax, pay, 1.7, "luna", 0.40 * axial * (0.6 + 0.4 * breath), 0.8);
      }

      // ---- the core itself: the signature ORB, charging then governed steel ----
      var charge = fx.clamp(0.45 + 0.6 * assemble + door * 0.08 + swell * 0.10, 0, 1.25);
      var spread = fx.lerp(1.35, 1.0, assemble) + door * 0.04 + swell * 0.05;
      fx.bloom(env, cx, cy, R * (3.0 * sysBreath), C.deep, 0.10 + 0.08 * settle + 0.05 * swell);
      fx.orb(env, cx, cy, R, { charge: charge, spread: spread, pitch: 0.5, yaw: t * 0.12, flat: 0.96 });

      // governed structure rings — tighten / brighten as the system settles & breathes
      if (settle > 0.01) {
        fx.ring(env, cx, cy, R * (1.18 + 0.014 * breath), C.steel, 0.42 * settle, { flat: 0.5, w: 1.4 });
        fx.ring(env, cx, cy, R * (1.52 + 0.020 * breath), C.deep,  0.18 * settle, { flat: 0.5, w: 1.0 });
      }

      // ============================================================
      // THE DOOR — a single vertical seam of light OPENS in the core, with a soft
      // shaft descending toward where the CTA sits below. The unlocked invitation.
      // ============================================================
      if (door > 0.001) {
        var seamH = R * (0.7 + 0.4 * door), glowK = 0.55 + 0.45 * Math.sin(t * 0.9), half = seamH * 0.5;
        fx.halo(env, cx, cy, R * (0.5 + 0.6 * door), C.cold, (0.10 + 0.10 * glowK) * door);
        fx.halo(env, cx, cy, R * (0.3 + 0.4 * door), C.steel, 0.16 * door);

        // vertical bloom of the seam (additive sliver)
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        var bloomW = R * (0.08 + 0.05 * door);
        var vg = ctx.createLinearGradient(0, cy - half, 0, cy + half);
        vg.addColorStop(0.0, fx.rgba(C.steel, 0));
        vg.addColorStop(0.5, fx.rgba(C.cold, 0.30 * door));
        vg.addColorStop(1.0, fx.rgba(C.steel, 0));
        ctx.fillStyle = vg; ctx.fillRect(cx - bloomW, cy - half, bloomW * 2, half * 2);
        // the crisp filament — the unlocked edge
        ctx.lineCap = "round";
        ctx.strokeStyle = fx.rgba(C.cold, (0.55 + 0.30 * glowK) * door);
        ctx.lineWidth = 1.2 + 0.5 * door;
        ctx.beginPath(); ctx.moveTo(cx, cy - half * 0.94); ctx.lineTo(cx, cy + half * 0.94); ctx.stroke();
        ctx.restore();

        fx.node(env, cx, cy - half * 0.94, 1.5, "cold", 0.7 * door, 1.0);
        fx.node(env, cx, cy + half * 0.94, 1.5, "cold", 0.7 * door, 1.0);

        // a whisper of light descending toward the CTA — the invitation
        var shaftTop = cy + half * 0.94, shaftBot = h * (env.mobile ? 0.70 : 0.66);
        if (shaftBot > shaftTop) {
          ctx.save(); ctx.globalCompositeOperation = "lighter";
          var sg = ctx.createLinearGradient(cx, shaftTop, cx, shaftBot);
          sg.addColorStop(0, fx.rgba(C.steel, 0.12 * door)); sg.addColorStop(1, fx.rgba(C.steel, 0));
          ctx.fillStyle = sg;
          var sw0 = R * 0.05, sw1 = R * (0.18 + 0.12 * door);
          ctx.beginPath();
          ctx.moveTo(cx - sw0, shaftTop); ctx.lineTo(cx + sw0, shaftTop);
          ctx.lineTo(cx + sw1, shaftBot); ctx.lineTo(cx - sw1, shaftBot);
          ctx.closePath(); ctx.fill();
          ctx.restore();
        }
      }
    }
  });

  // local doctrine-colour resolver (fx.stateCol is internal to the engine; mirror the
  // one law here so chapter echoes can fragment in their true colour).
  function stateColLocal(C, state) {
    switch (state) {
      case "pass": case "ok": case "ready": return C.ok;
      case "review": case "amber": case "hold": return C.amber;
      case "fail": case "block": case "breach": return C.breach;
      case "deep": case "structure": case "blue": return C.deep;
      case "cold": case "signal": case "proof": return C.cold;
      case "luna": case "prov": case "governance": return C.luna;
      case "dim": case "idle": return C.dim;
      default: return C.steel;
    }
  }
})();
