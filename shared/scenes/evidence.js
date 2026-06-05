/* 02 EVIDENCE — noise becomes evidence: admission at the trust boundary.
 *
 * The camera descends into a COLDER, denser chamber, below the sealed protocol.
 * Abstract artifacts of reality enter from varying depths — shards, pulses,
 * timestamps, traces — residue from systems never built to agree. They reach a
 * vertical TRUST BOUNDARY: a membrane of permission / provenance / admissibility.
 * The system does not beautify disorder; it DECIDES what may enter:
 *   pass       crosses, becomes SHARP & source-lit (white/steel), brightens,
 *              and gains a faint PURPLE provenance tail.
 *   fail       dims and drifts away into the dark (dim).
 *   incomplete held in SUSPENSION at the membrane — neither in nor out.
 *   conflict   splits into AMBER tension — two readings that will not reconcile.
 *   review     migrates toward a protected amber HOLDING FIELD.
 * Past the boundary a BOUNDED CLINICAL SIGNAL assembles from the admitted
 * evidence — NOT a person, NOT a body: a protected presence made of source +
 * time + permission + ABSENCE + trace. THE MOST IMPORTANT THING: the system
 * knows what it does NOT know — ABSENCE is rendered explicitly as unfilled gaps
 * in the evidence ring, honoured at every layer.
 *
 * HOVER: a fragment near the cursor brightens its PROVENANCE PATH (a short trace
 * back to the boundary) — no tooltips, and it vanishes cleanly without a pointer.
 * CONTINUITY: sits below the sealed protocol core; ends with the bounded signal
 * positioned right-of-centre, handed intact to Screening. */
(function () {
  if (!window.Damaros) return;
  Damaros.registerScene("evidence", {
    hud: "evidence",

    /* Precompute the stream of artifacts and each one's verdict. Deterministic
       so admission decisions are stable across frames and on resize. */
    init: function (env) {
      var r = env.rng;
      var n = env.mobile ? 9 : 19, arr = [];
      // verdict mix (admission is severe — most reality never makes the cut):
      //   pass ~0.22 · fail ~0.28 · incomplete ~0.16 · conflict ~0.16 · review ~0.18
      var kinds = ["bar", "tick", "cross", "ring", "dot"];
      for (var i = 0; i < n; i++) {
        var u = r();
        var verdict = u < 0.22 ? "pass"
                    : u < 0.50 ? "fail"
                    : u < 0.66 ? "incomplete"
                    : u < 0.82 ? "conflict"
                    : "review";
        arr.push({
          lane: 0.13 + r() * 0.74,          // vertical band (0..1 of usable height)
          y0: (r() - 0.5) * 0.04,           // tiny lane wobble seed
          depth: 0.06 + r() * 0.92,         // how far back it begins (parallax/Z)
          arrive: 0.05 + r() * 0.46,        // p at which it reaches the boundary
          ph: r() * 6.2832,                 // ambient phase
          kind: kinds[(r() * kinds.length) | 0],
          v: verdict,
          // post-admission destiny offsets (kept deterministic):
          slot: r() * 6.2832,               // ring slot a PASS occupies on the signal
          sy: (r() - 0.5) * 0.30,           // pre-gather settle lane offset for PASS
          frA: r() * 6.2832,                // conflict split seed
          spin: r() < 0.5 ? 1 : -1,         // residue drift direction for FAIL
          dimR: 0.4 + r() * 0.5             // residue glow / drift seed
        });
      }
      env.data.frag = arr;

      // the bounded signal's absence-arc: a fixed gap in its evidence ring.
      env.data.gap0 = -0.55 + r() * 0.5;    // rotation where the unknown sits
      env.data.gapW = 0.60 + r() * 0.22;    // angular width of what is NOT known
      // a SECOND, smaller absence — knowledge ends in more than one place.
      env.data.gap1 = 1.9 + r() * 0.7;
      env.data.gapW1 = 0.26 + r() * 0.12;

      // contributing rays for the bounded signal (built of admitted sources)
      var rays = [], rn = env.mobile ? 5 : 9;
      for (var k = 0; k < rn; k++) rays.push({ a: r() * 6.2832, len: 0.7 + r() * 0.7, ph: r() * 6.2832 });
      env.data.rays = rays;
    },

    draw: function (env) {
      var fx = env.fx, C = env.C, w = env.w, h = env.h, p = env.p, t = env.t;
      var mob = env.mobile;

      // ----- geometry (declare anchors before worldbg uses the seat) -----
      // Reality enters from the LEFT across a boundary near centre-left; what is
      // admitted is gathered into a bounded signal just PAST it. The far right is
      // kept clear for the right-aligned caption.
      var bx = w * (mob ? 0.40 : 0.405);   // trust boundary x (centre-left)
      var by = h * 0.15, bh = h * 0.70;    // boundary span
      var laneY = function (f) { return by + f * bh; };
      var entryX = function (depth) { return bx - w * (0.05 + depth * 0.34); };

      // bounded signal forms just past (right of) the boundary, still clear of
      // caption — and lands where Screening expects to receive it.
      var sigX = w * 0.555;
      var sigY = h * 0.50;
      var sigR = Math.min(w, h) * (mob ? 0.115 : 0.14);

      // ----- master beats -----
      var stream   = fx.smooth(0.00, 0.40, p);   // artifacts streaming in
      var perm     = fx.smooth(0.14, 0.66, p);   // boundary becomes decisive / permeable
      var formed   = fx.smooth(0.40, 0.88, p);   // bounded signal assembles past boundary
      var absence  = fx.smooth(0.62, 1.00, p);   // the arc of the unknown is emphasized
      var settled  = fx.smooth(0.85, 1.00, p);   // the protected signal stabilizes

      // ----- THE PERSISTENT WORLD — colder & denser than the chamber above ---
      // worldbg first; the central seat of light is the through-line. We seat it
      // at the signal so the heart of THIS chamber is exactly where the bounded
      // signal will assemble — the camera has descended onto it. Colder lift,
      // deeper blue cast for the glacial register the brief calls for.
      fx.worldbg(env, {
        cx: sigX, cy: sigY,
        lift: 0.70, tint: 0.16,
        accent: C.deep,
        core: 0.14 + 0.30 * formed,            // the seat strengthens as the signal forms
        coreR: 0.18,
        dust: mob ? 18 : 40, seed: 31
      });
      // a cold downward depth-breath: the descent into a denser, colder space.
      var descend = fx.smooth(0, 0.5, p);
      fx.bloom(env, w * 0.5, h * (0.06 - 0.04 * descend), Math.min(w, h) * 0.5, C.deep, 0.05 + 0.04 * (1 - descend));

      // a faint PURPLE provenance thread, ever-present (doctrine): the spine that
      // every admitted movement will witness. Subtle here; dominant only in Luna.
      fx.link(env, bx, by + bh * 0.04, sigX, sigY, C.luna,
              (0.05 + 0.07 * perm) * (0.6 + 0.4 * Math.sin(t * 0.6)), 1, true);

      // ===== 1. THE TRUST BOUNDARY =====
      // permission / provenance / admissibility. A faint admit-gradient on its
      // left; dashes loosen as it decides. Once the signal forms, the gate
      // recedes so the protected presence dominates the chamber.
      var gateA = (1 - formed * 0.55);
      fx.boundary(env, bx, by, 1, bh, perm, C.deep, (0.13 + 0.30 * perm) * gateA);
      // structural ticks along the boundary — the gate is graduated, not blank.
      if (perm > 0.02) {
        var gn = mob ? 6 : 11;
        for (var gi = 0; gi <= gn; gi++) {
          var gy = by + (gi / gn) * bh;
          fx.fragment(env, bx, gy, 2.2, "tick", C.deep, (0.07 + 0.13 * perm) * gateA);
        }
      }
      // a single provenance witness-mark on the membrane (admissibility = lineage)
      fx.node(env, bx, by + bh * (0.5 + 0.08 * Math.sin(t * 0.9)), 1.6, "luna",
              (0.16 + 0.18 * perm) * gateA, 0.5);

      // ===== 2. ARTIFACTS OF REALITY -> ADMISSION DECISIONS =====
      var frag = env.data.frag || [];
      for (var i = 0; i < frag.length; i++) {
        var f = frag[i];

        // approach progress 0..1: from entry depth to the boundary, gated by the
        // artifact's own arrival time. Reaches 1 by p = arrive. (stream gates the
        // overall sense of an incoming current; per-fragment timing rides arrive.)
        var app = fx.smooth(0, 1, fx.clamp(p / Math.max(0.001, f.arrive), 0, 1));

        var depthScale = 0.55 + 0.45 * (1 - f.depth);     // far fragments smaller/fainter
        var ly = laneY(f.lane) + Math.sin(t * 0.5 + f.ph) * 3 + f.y0 * h;
        var ex = entryX(f.depth);
        // ambient lateral drift while streaming (residue never travels clean)
        var driftX = (1 - app) * Math.sin(t * 0.6 + f.ph) * 5;
        var ax = fx.lerp(ex, bx, fx.easeIn(app)) + driftX;

        var atGate = app > 0.985;
        // verdict resolves once arrived AND this artifact's decision beat passes.
        var dRes = atGate ? fx.smooth(f.arrive, f.arrive + 0.30, p) : 0;

        // --- cursor PROVENANCE HOVER: a fragment near the pointer reveals its
        //     short provenance path back to the boundary witness. No tooltip; it
        //     simply brightens, and vanishes when there is no fine pointer. ---
        var hov = fx.proximity(env, atGate ? bx : ax, ly, 120) * (1 - dRes * 0.4);

        // --- streaming-in trail (faint, emerging from the dark) ---
        if (app < 0.999 && app > 0.02) {
          var trailA = stream * 0.5 * app * (1 - app * 0.3);
          fx.fragment(env, ax, ly, (3 + f.depth * 2) * depthScale, f.kind, C.dim, (0.16 + trailA) * depthScale);
          // a short residue tail behind it
          fx.link(env, ax - 9 - f.depth * 9, ly, ax - 2, ly, C.dim, (0.09 + trailA * 0.4) * depthScale, 1);
          if (hov > 0.02) {
            // hover while in transit: reveal the lineage it is bringing forward
            fx.trace(env, [{ x: ex, y: ly }, { x: ax, y: ly }], C.luna, 0.28 * hov, t * 22 + i * 5);
            fx.halo(env, ax, ly, 10, C.luna, 0.10 * hov);
          }
        }

        if (!atGate) continue; // still in transit

        // ---- the artifact has arrived: render its verdict ----
        if (f.v === "pass") {
          // ADMITTED: snaps across the boundary, becomes SHARP & source-lit, then
          // is GATHERED into the bounded signal as source / time / permission.
          var cross = fx.easeInOut(dRes);
          var settleX = bx + w * (0.04 + 0.04 * (0.5 + 0.5 * Math.sin(f.slot)));
          var settleY = sigY + f.sy * sigR * 1.1;
          var slotX = sigX + Math.cos(f.slot) * sigR * 0.9;
          var slotY = sigY + Math.sin(f.slot) * sigR * 0.9 * 0.9;
          var gather = fx.easeInOut(formed);
          var px0 = fx.lerp(bx, settleX, cross);
          var py0 = fx.lerp(ly, settleY, cross);
          var tx = fx.lerp(px0, slotX, gather);
          var ty = fx.lerp(py0, slotY, gather);

          // PURPLE provenance tail: every admitted fact crosses witnessed. It
          // runs boundary -> arc -> into the signal, and brightens on hover.
          if (cross > 0.04) {
            var provA = (0.12 + 0.18 * cross) * (1 - gather * 0.45) + 0.30 * hov;
            fx.trace(env,
              [{ x: bx, y: ly }, { x: (bx + tx) * 0.5, y: (ly + ty) * 0.5 - 7 }, { x: tx, y: ty }],
              C.luna, provA, t * 18 + i * 7);
          }
          // brief admission flash as it is source-lit at the gate
          if (dRes < 0.5) fx.halo(env, bx, ly, 14 * (1 - dRes * 2) + 6, C.cold, 0.20 * (1 - dRes * 2));
          // the admitted fact — SHARP, white/steel; dims slightly as it merges.
          var sharpCol = dRes < 0.4 ? "cold" : "signal";
          var passA = (0.5 + 0.5 * cross) * (1 - gather * 0.28) + 0.25 * hov;
          fx.node(env, tx, ty, (2.3 - gather * 0.4), sharpCol, passA, 0.85 + 0.2 * cross);

        } else if (f.v === "fail") {
          // FAILS: not admissible. Dims and DRIFTS AWAY from the boundary into
          // the dark, never crossing — residue the system declines to carry.
          var drift = fx.easeOut(dRes);
          var fxp = bx - 8 - f.depth * 16 - drift * (34 + f.dimR * 30);
          var fyp = ly + f.spin * drift * (10 + f.dimR * 16);
          var failA = (0.22) * (1 - drift * 0.85);
          fx.fragment(env, fxp, fyp, (3 - drift) * depthScale, f.kind, C.dim, failA);
          if (drift < 0.4) {
            // a faint last residue tail as it falls away
            fx.link(env, fxp + 5, fyp, fxp + 13 + f.depth * 8, ly, C.dim, 0.10 * (1 - drift * 2.5), 1);
          }

        } else if (f.v === "incomplete") {
          // HELD in SUSPENSION at the membrane — neither admitted nor refused.
          // It hovers ON the boundary, breathing, waiting on what it lacks.
          var sus = 0.5 + 0.5 * Math.sin(t * 1.3 + f.ph);
          var hy = ly + Math.sin(t * 0.8 + f.ph) * 2.2;
          fx.node(env, bx, hy, 2, "dim", (0.26 + 0.26 * sus) * dRes + 0.18 * hov, 0.35);
          // a thin unmet edge above/below — the part that never arrived
          fx.fragment(env, bx, hy - 6 - 2 * sus, 2.2, "tick", C.dim, (0.12 + 0.10 * sus) * dRes);
          if (hov > 0.02) {
            fx.trace(env, [{ x: entryX(f.depth), y: ly }, { x: bx, y: hy }], C.luna, 0.24 * hov, t * 20);
          }

        } else if (f.v === "conflict") {
          // CONFLICT: two readings that will not reconcile. The artifact SPLITS
          // at the membrane into AMBER tension — held apart, vibrating, unresolved.
          var split = fx.easeOut(dRes);
          var sep = split * (5 + f.depth * 6);
          var jit = (0.4 + 0.5 * Math.sin(t * 2.0 + f.ph)) * split;
          var ca = f.frA;
          var ux = bx + Math.cos(ca) * 1.5;
          // the two opposed shards
          var ax1 = ux + Math.cos(ca) * sep, ay1 = ly + Math.sin(ca) * sep * 0.8 + jit;
          var ax2 = ux - Math.cos(ca) * sep, ay2 = ly - Math.sin(ca) * sep * 0.8 - jit;
          var confA = (0.30 + 0.22 * Math.sin(t * 2.0 + f.ph)) * dRes + 0.2 * hov;
          fx.node(env, ax1, ay1, 1.9, "review", confA, 0.5);
          fx.node(env, ax2, ay2, 1.9, "review", confA, 0.5);
          // the tension line between them — the irreconcilable seam
          fx.link(env, ax1, ay1, ax2, ay2, C.amber, (0.18 + 0.16 * split) * dRes, 1, true);

        } else {
          // REVIEW: admissible but unresolved — MIGRATES toward the protected
          // amber HOLDING FIELD at the chamber's lower edge (a governed place,
          // not an error). Screening picks the threshold up from here.
          var mig = fx.easeInOut(fx.smooth(f.arrive, 0.9, p));
          var holdX = w * (mob ? 0.30 : 0.265);
          var holdY = h * (mob ? 0.84 : 0.80);
          // keep on-canvas
          if (holdX < w * 0.10) holdX = w * 0.10;
          var dgx = holdX + Math.cos(f.frA) * sigR * 0.55;
          var dgy = holdY + Math.sin(f.frA) * sigR * 0.40;
          var rx = fx.lerp(bx, dgx, mig);
          var ry = fx.lerp(ly, dgy, mig);
          // provenance carries it, intact, across to the holding field
          if (mig > 0.02) fx.trace(env, [{ x: bx, y: ly }, { x: rx, y: ry }], C.amber, (0.22 + 0.2 * hov) * (1 - mig * 0.3), t * 14 + i * 4);
          var revPulse = 0.5 + 0.3 * Math.sin(t * 2 + f.ph);
          fx.node(env, rx, ry, 2.1, "review", (0.32 + 0.26 * revPulse) * dRes + 0.2 * hov, 0.55);
        }
      }

      // ===== 2b. THE PROTECTED HOLDING FIELD (amber) — destination of REVIEW ==
      // A governed threshold at the lower-left edge where the unresolved gather.
      // Drawn after the migrants seat into it so it reads as a real place.
      var fieldOn = fx.smooth(0.40, 0.95, p);
      if (fieldOn > 0.01) {
        var hX = w * (mob ? 0.30 : 0.265);
        if (hX < w * 0.10) hX = w * 0.10;
        var hY = h * (mob ? 0.84 : 0.80);
        var hR = sigR * (mob ? 0.62 : 0.7);
        fx.reviewChamber(env, hX, hY, hR * (0.7 + 0.3 * fx.easeOut(fieldOn)), fieldOn * (1 - settled * 0.25));
      }

      // ===== 3. THE BOUNDED CLINICAL SIGNAL — a protected presence =====
      // Assembled from admitted evidence: source / time / permission + ABSENCE +
      // trace. NOT a body. Forms past the boundary, carrying deliberate arcs of
      // ABSENCE that stay UNFILLED — the system knows what it does not know.
      if (formed > 0.01) {
        var rot = t * 0.05;

        // contributing rays converge from admitted sources (built, not given)
        var rays = env.data.rays || [];
        for (var k = 0; k < rays.length; k++) {
          var rdef = rays[k];
          var ang = rdef.a + rot * 0.6;
          var rr = sigR * (1.5 + rdef.len);
          var rxs = sigX + Math.cos(ang) * rr;
          var rys = sigY + Math.sin(ang) * rr * 0.9;
          var exs = sigX + Math.cos(ang) * sigR * 1.02;
          var eys = sigY + Math.sin(ang) * sigR * 0.9 * 1.02;
          fx.link(env, rxs, rys, exs, eys, C.deep, 0.20 * formed * (0.6 + 0.4 * Math.sin(t * 1.2 + rdef.ph)), 1, true);
        }

        // permission halo / protected presence (settles to a steadier glow)
        fx.halo(env, sigX, sigY, sigR * (2.0 + 0.2 * Math.sin(t * 0.9)), C.deep, (0.12 + 0.06 * settled) * formed);

        // gaps of ABSENCE (two of them) — wrapped helper. The signal is built of
        // discrete admitted facts EXCEPT across these arcs, which stay open.
        var gap0 = (env.data.gap0 == null ? -0.5 : env.data.gap0);
        var gapW = (env.data.gapW == null ? 0.62 : env.data.gapW);
        var gap1 = (env.data.gap1 == null ? 2.1 : env.data.gap1);
        var gapW1 = (env.data.gapW1 == null ? 0.3 : env.data.gapW1);
        var inGap = function (a) {
          var r0 = a - (gap0 + rot);
          while (r0 > Math.PI) r0 -= 6.2832; while (r0 < -Math.PI) r0 += 6.2832;
          if (Math.abs(r0) < gapW * 0.5) return true;
          var r1 = a - (gap1 + rot);
          while (r1 > Math.PI) r1 -= 6.2832; while (r1 < -Math.PI) r1 += 6.2832;
          return Math.abs(r1) < gapW1 * 0.5;
        };

        // outer structural dial — the frame of the inquiry. It too is broken
        // across the gaps: the absence is honoured at every layer, not papered over.
        var odR = sigR * 1.28;
        var odSeg = mob ? 14 : 22;
        for (var od = 0; od < odSeg; od++) {
          var oa = (od / odSeg) * 6.2832 + rot * 0.5;
          if (inGap(oa)) continue;
          env.ctx.strokeStyle = fx.rgba(C.steel, 0.13 * formed);
          env.ctx.lineWidth = 1;
          env.ctx.beginPath();
          env.ctx.ellipse(sigX, sigY, odR, odR * 0.9, 0, oa + 0.03, oa + (6.2832 / odSeg) - 0.03);
          env.ctx.stroke();
        }

        // the assembled evidence arc: many short segments EXCEPT across the gaps,
        // revealed progressively as the signal is built.
        var segN = mob ? 16 : 26;
        var built = fx.smooth(0.0, 1.0, formed);
        for (var sgi = 0; sgi < segN; sgi++) {
          var a0 = (sgi / segN) * 6.2832 + rot;
          if (inGap(a0)) continue;                       // leave the unknown unfilled
          if (sgi / segN > built) continue;              // reveal as built
          var sa0 = a0 + 0.02, sa1 = a0 + (6.2832 / segN) - 0.02;
          env.ctx.strokeStyle = fx.rgba(C.steel, (0.45 + 0.25 * (0.5 + 0.5 * Math.sin(t * 1.1 + sgi * 0.7))) * formed);
          env.ctx.lineWidth = 1.4;
          env.ctx.beginPath();
          env.ctx.ellipse(sigX, sigY, sigR, sigR * 0.9, 0, sa0, sa1);
          env.ctx.stroke();
        }

        // inner certainty: source + time + permission as three small deep marks
        var triA = 0.5 * formed;
        for (var m = 0; m < 3; m++) {
          var ma = rot * 1.3 + m * (6.2832 / 3) + 0.4;
          var mr = sigR * 0.46;
          fx.node(env, sigX + Math.cos(ma) * mr, sigY + Math.sin(ma) * mr * 0.9, 1.7, "deep", triA, 0.6);
        }

        // a faint purple provenance witness orbiting inside — AI-origin lineage
        var wpa = rot * -1.6;
        fx.node(env, sigX + Math.cos(wpa) * sigR * 0.62, sigY + Math.sin(wpa) * sigR * 0.62 * 0.9,
                1.4, "luna", 0.34 * formed, 0.5);

        // the protected core node — quiet, certain, alive
        var corePulse = 0.6 + 0.4 * Math.sin(t * 1.1);
        fx.node(env, sigX, sigY, 2.8 + 0.6 * corePulse, "cold", (0.55 + 0.35 * corePulse) * formed, 0.9 * formed);

        // ===== 4. THE ARCS OF ABSENCE — what the system does NOT know =====
        // THE MOST IMPORTANT THING. Open mouths in the evidence ring, each
        // finished with radial edge-ticks + amber marker nodes: the ring KNOWS
        // exactly where its knowledge ends. Never filled in.
        if (absence > 0.01) {
          var unk = 0.5 + 0.5 * Math.sin(t * 0.7);
          var drawGap = function (gc0, ghw) {
            var gC = gc0 + rot, gHalf = ghw * 0.5;
            var m1 = gC - gHalf, m2 = gC + gHalf;
            var ang2 = [m1, m2];
            for (var em = 0; em < 2; em++) {
              var ea = ang2[em];
              var ix = sigX + Math.cos(ea) * sigR * 0.86, iy = sigY + Math.sin(ea) * sigR * 0.9 * 0.86;
              var oxk = sigX + Math.cos(ea) * sigR * 1.14, oyk = sigY + Math.sin(ea) * sigR * 0.9 * 1.14;
              fx.link(env, ix, iy, oxk, oyk, C.amber, (0.16 + 0.12 * unk) * absence, 1);
              var mkx = sigX + Math.cos(ea) * sigR, mky = sigY + Math.sin(ea) * sigR * 0.9;
              fx.node(env, mkx, mky, 1.6, "review", 0.30 * absence, 0.5);
            }
            // a faint dashed contour spanning the absence — drawn as MISSING,
            // never filled; it breathes, an unanswered question.
            env.ctx.save();
            env.ctx.setLineDash([1, 6]);
            env.ctx.lineDashOffset = -t * 6;
            env.ctx.strokeStyle = fx.rgba(C.amber, (0.11 + 0.12 * unk) * absence);
            env.ctx.lineWidth = 1;
            env.ctx.beginPath();
            env.ctx.ellipse(sigX, sigY, sigR, sigR * 0.9, 0, m1, m2);
            env.ctx.stroke();
            env.ctx.setLineDash([]);
            env.ctx.lineDashOffset = 0;
            env.ctx.restore();
            // the absence opens to the dark outside — soft outward amber residue
            // reading as "unresolved", never as light/permission granted.
            var gmx = sigX + Math.cos(gC) * sigR * 1.18;
            var gmy = sigY + Math.sin(gC) * sigR * 0.9 * 1.18;
            fx.halo(env, gmx, gmy, sigR * 0.55, C.amber, 0.055 * absence * (0.6 + 0.4 * unk));
          };
          drawGap(gap0, gapW);
          drawGap(gap1, gapW1);
        }

        // ===== 5. STABILIZE — ready for Screening =====
        // The protected signal quiets into a governed seal, handed on intact.
        if (settled > 0.01) {
          fx.ring(env, sigX, sigY, sigR * 1.5, C.steel, 0.16 * settled, { flat: 0.9, w: 1.2 });
          fx.bloom(env, sigX, sigY, sigR * 1.6, C.cold, 0.06 * settled);
        }
      }
    }
  });
})();
