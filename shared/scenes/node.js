/* 07 NODE — a clinic becomes a node.
   The mood QUIETENS: the cosmic provenance lattice of LUNA compresses,
   out of the cathedral, into a calm operational SURFACE — cockpit, not
   cathedral. A bounded local field assembles over a low horizon: an
   intake queue waiting in a tidy column, a threshold to cross, a bounded
   REVIEW seat, and a confirmation a human makes. One item moves through —
   intake → review (amber) → confirmation → verified — then a single
   verified signal gathers, turns green (READY), and lifts off-node toward
   the upper-right, handing up to CONSOLE (whose origin node sits low and
   right, about to multiply). Abstraction has become local execution; the
   work is made small, governed, and usable. A faint purple provenance
   thread is seated throughout — every consequential move leaves a trace.
   Surfaces SETTLE like instruments (dampened easing); they never slide
   like SaaS cards. Hover reveals each item's evidence / review / path. */
(function () {
  if (!window.Damaros) return;

  Damaros.registerScene("node", {
    hud: "node",

    init: function (env) {
      var r = env.rng;
      // The queue of work items — a tidy COLUMN of artifacts awaiting intake.
      var n = env.mobile ? 4 : 6;
      var kinds = ["bar", "tick", "ring", "dot", "cross", "bar"];
      var q = [];
      for (var i = 0; i < n; i++) {
        q.push({
          kind: kinds[i % kinds.length],
          ph: r() * 6.2832,          // ambient breathing phase while waiting
          jit: 0.5 + r() * 0.5,      // waiting micro-jitter amount
          ev: 0.4 + r() * 0.6        // how much evidence this item reveals on hover
        });
      }
      env.data.q = q;
      env.data.n = n;

      // Faint structural ticks bedded into the baseplate (operational texture).
      var marks = [], mn = env.mobile ? 5 : 9;
      for (var m = 0; m < mn; m++) {
        marks.push({ u: 0.08 + r() * 0.84, v: 0.18 + r() * 0.7, on: r() < 0.5 });
      }
      env.data.marks = marks;

      // Residue motes of the prior LUNA lattice — faint purple points that
      // settle DOWN onto the surface as the camera lowers (continuity).
      var resN = env.mobile ? 5 : 9, res = [];
      for (var j = 0; j < resN; j++) {
        res.push({ ax: 0.12 + r() * 0.76, ay: 0.10 + r() * 0.30, ph: r() * 6.2832, sp: 0.5 + r() * 0.7 });
      }
      env.data.res = res;
    },

    draw: function (env) {
      var fx = env.fx, C = env.C, w = env.w, h = env.h, p = env.p, t = env.t;
      var smooth = fx.smooth, lerp = fx.lerp, easeOut = fx.easeOut, clamp = fx.clamp;
      var ctx = env.ctx;

      if (!env.data || !env.data.q) { fx.worldbg(env); return; }

      // ---- camera lowers: the cathedral compresses to a calm surface ----
      var descend = smooth(0.0, 0.30, p);
      var horizon = h * (0.40 + 0.16 * descend);     // baseplate horizon line

      // PERSISTENT WORLD first — the same core, now faint behind the local
      // view (continuity: this is the LOCAL view of one running system).
      // Core sits high/back and dims as we settle into the operational plane.
      fx.worldbg(env, {
        cx: w * (env.mobile ? 0.50 : 0.54),
        cy: horizon - h * (0.20 + 0.10 * descend),
        lift: lerp(0.74, 0.60, descend),
        tint: 0.10,
        core: 0.18 * (1 - 0.45 * descend),           // the heart, faintly there
        coreR: 0.13,
        dust: env.mobile ? 12 : 22,
        seed: 71
      });

      // ============================================================
      // BOUNDED SURFACE — a framed plane in light perspective.
      // Centre/right, lifted so the lower-left caption stays clear.
      // ============================================================
      var settle = easeOut(descend);
      var cx = w * (env.mobile ? 0.50 : 0.54);                              // surface centre x
      var halfTop = Math.min(w, h) * 0.30 * settle;                        // near (front) half-width
      var halfBack = halfTop * 0.46;                                       // far (back) half-width (perspective)
      var depth = Math.min(w, h) * (env.mobile ? 0.20 : 0.24) * settle;    // surface depth (screen)
      var yFront = horizon + depth * 0.62;                                 // near edge (closer to viewer)
      var yBack = horizon - depth * 0.38;                                  // far edge (recedes up)

      var xFL = cx - halfTop, xFR = cx + halfTop;        // front-left / front-right
      var xBL = cx - halfBack, xBR = cx + halfBack;      // back-left  / back-right

      // soft pressure pooled under the surface — permission resting on the plane
      fx.halo(env, cx, horizon + depth * 0.18, halfTop * 1.7, C.deep, 0.10 * settle);

      // residue of the LUNA provenance lattice, settling onto the plate as
      // faint purple motes — the witness arrives WITH the work (continuity).
      var res = env.data.res || [];
      for (var rI = 0; rI < res.length; rI++) {
        var rs = res[rI];
        var land = smooth(0.0, 0.34, p);
        var rx = cx + (rs.ax - 0.5) * 2 * lerp(halfTop * 1.3, halfTop * 0.9, land);
        var ryTop = horizon - h * (0.16 + rs.ay * 0.18);
        var ryFloor = lerp(yFront, yBack, 0.55 + rs.ay * 0.3);
        var ry = lerp(ryTop, ryFloor, easeOut(land));
        var ra = (1 - land * 0.55) * 0.4 + 0.12;
        var rb = 0.6 + 0.4 * Math.sin(t * rs.sp + rs.ph);
        fx.node(env, rx, ry, 1.2, "luna", ra * rb * (0.5 + 0.5 * settle), 0.5);
      }

      // baseplate fill — a faint mineral plate so it reads as a solid surface
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(xBL, yBack); ctx.lineTo(xBR, yBack);
      ctx.lineTo(xFR, yFront); ctx.lineTo(xFL, yFront); ctx.closePath();
      var pg = ctx.createLinearGradient(0, yBack, 0, yFront);
      pg.addColorStop(0, fx.rgba(C.jet2, 0.0));
      pg.addColorStop(1, fx.rgba(C.jet2, 0.55 * settle));
      ctx.fillStyle = pg; ctx.fill();
      ctx.restore();

      // ---- horizon line: the first thing the descending camera meets ----
      // Present from the very start so arrival reads as landing on a surface,
      // not emerging from a void. Widens and brightens as we settle.
      var horiA = smooth(0.0, 0.18, p);
      var horiHalf = lerp(Math.min(w, h) * 0.16, halfTop * 1.15, settle);
      var hgrad = ctx.createLinearGradient(cx - horiHalf, 0, cx + horiHalf, 0);
      hgrad.addColorStop(0, fx.rgba(C.steel, 0));
      hgrad.addColorStop(0.5, fx.rgba(C.steel, 0.28 * (0.4 + 0.6 * horiA)));
      hgrad.addColorStop(1, fx.rgba(C.steel, 0));
      ctx.strokeStyle = hgrad; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx - horiHalf, horizon); ctx.lineTo(cx + horiHalf, horizon); ctx.stroke();

      // ---- low operational grid on the plane (cockpit, not cathedral) ----
      var gridA = smooth(0.04, 0.30, p) * 0.5;
      if (gridA > 0.01) {
        var rows = env.mobile ? 3 : 4, cols = env.mobile ? 4 : 6;
        for (var ri = 0; ri <= rows; ri++) {                 // depth lines (front→back)
          var fr = ri / rows;
          var ly = lerp(yFront, yBack, fr);
          var lhl = lerp(halfTop, halfBack, fr);
          fx.link(env, cx - lhl, ly, cx + lhl, ly, C.steel, gridA * (1 - fr * 0.65), 1);
        }
        for (var ci = 0; ci <= cols; ci++) {                 // longitudinal lines, converging back
          var fc = ci / cols;
          fx.link(env, lerp(xFL, xFR, fc), yFront, lerp(xBL, xBR, fc), yBack, C.steel, gridA * 0.5, 1);
        }
      }

      // bounded frame — the surface edge, drawn brighter than the grid
      var frameA = settle * 0.5;
      fx.link(env, xFL, yFront, xFR, yFront, C.steel, frameA, 1.4);       // near edge (the lip)
      fx.link(env, xBL, yBack, xBR, yBack, C.steel, frameA * 0.6, 1);
      fx.link(env, xFL, yFront, xBL, yBack, C.steel, frameA * 0.7, 1);
      fx.link(env, xFR, yFront, xBR, yBack, C.steel, frameA * 0.7, 1);
      // corner anchors — small confirmations that the frame is governed
      var corn = settle * 0.5;
      fx.node(env, xFL, yFront, 1.5, "deep", corn, 0.35);
      fx.node(env, xFR, yFront, 1.5, "deep", corn, 0.35);

      // faint operational ticks bedded into the plate
      var marks = env.data.marks || [];
      for (var mi = 0; mi < marks.length; mi++) {
        var mk = marks[mi];
        var mhl = lerp(halfTop, halfBack, mk.v);
        var mx = cx + (mk.u - 0.5) * 2 * mhl;
        var my = lerp(yFront, yBack, mk.v);
        fx.fragment(env, mx, my, 3, mk.on ? "tick" : "dot", C.dim, 0.28 * settle * (1 - mk.v * 0.5));
      }

      // ============================================================
      // LANE GEOMETRY — the intake queue is a tidy COLUMN at the left of
      // the plate; items advance rightward through the threshold to a
      // confirmation seat. Cockpit ergonomics: everything in one glance.
      // ============================================================
      var q = env.data.q || [];
      var n = env.data.n || q.length;

      var laneY = lerp(yFront, yBack, 0.36);               // the working lane (near-mid of plane)
      var laneHalfH = depth * 0.20;                        // membrane / review half-height
      var xQueue = cx - halfTop * 0.82;                    // the intake column x
      var qStep = (depth * 0.30) / Math.max(1, n);         // vertical spacing of queued items
      var qTopY = laneY - qStep * (n - 1) * 0.5;           // column centred on the lane
      var thX = cx - halfTop * 0.12;                       // threshold x (just left of centre)
      var xConfirm = cx + halfTop * 0.34;                  // confirmation seat x
      var xVerified = cx + halfTop * 0.66;                 // verified-rest x (just inside the lip)

      // ============================================================
      // THRESHOLD — the admission boundary across the surface. A vertical
      // membrane items cross one at a time. Permeability rises as work
      // flows, eases once the lane has cleared.
      // ============================================================
      var thReveal = smooth(0.16, 0.40, p);
      var flow = smooth(0.30, 0.66, p);
      var perm = 0.25 + 0.6 * flow;
      if (thReveal > 0.01) {
        fx.boundary(env, thX, laneY - laneHalfH, 1, laneHalfH * 2, perm, C.deep, 0.55 * thReveal);
      }

      // a bounded REVIEW seat on the threshold — a PLACE, not an error.
      // Present through the advance beat; quiets once the work clears.
      var reviewOn = smooth(0.28, 0.40, p) * (1 - smooth(0.74, 0.88, p) * 0.8);
      if (reviewOn > 0.01) {
        var rPulse = 0.5 + 0.5 * Math.sin(t * 1.4);
        fx.halo(env, thX, laneY, laneHalfH * 1.5, C.amber, 0.09 * reviewOn);
        ctx.save();
        ctx.strokeStyle = fx.rgba(C.amber, (0.32 + 0.18 * rPulse) * reviewOn);
        ctx.lineWidth = 1; ctx.setLineDash([2, 4]);
        ctx.beginPath();
        ctx.ellipse(thX, laneY, laneHalfH * 0.5, laneHalfH * 0.95, 0, 0, 6.2832);
        ctx.stroke(); ctx.setLineDash([]);
        ctx.restore();
        // a steady restrained amber marker — review is a bounded place, always here
        fx.node(env, thX, laneY - laneHalfH * 0.9, 1.5, "review", (0.38 + 0.22 * rPulse) * reviewOn, 0.7);
      }

      // ---- the CONFIRMATION seat (a human decision) — a calm steel cradle
      // that brightens when the item arrives to be confirmed. Restrained:
      // a cradle and a single attesting tick, not a button. -----------
      var seatOn = smooth(0.34, 0.92, p);
      if (seatOn > 0.01) {
        ctx.save();
        ctx.strokeStyle = fx.rgba(C.steel, 0.30 * seatOn); ctx.lineWidth = 1;
        ctx.beginPath();
        // an open cradle (arc) — the seat where a human confirms
        ctx.ellipse(xConfirm, laneY, laneHalfH * 0.46, laneHalfH * 0.7, 0, Math.PI * 0.18, Math.PI * 0.82);
        ctx.stroke();
        ctx.restore();
      }

      // ============================================================
      // THE QUEUE — items wait in the column, then ONE moves through:
      // intake → review (amber, held at the membrane) → confirmation
      // (human, steel cradle) → verified. Earlier items confirm first;
      // the LAST becomes the ready-to-move signal.
      // ============================================================
      var advA = 0.30, advB = 0.70;                         // the "queue advances" beat
      var per = (advB - advA) / n;                          // time slice per item

      var ready = smooth(0.66, 0.82, p);                    // readiness gather / turn green
      var depart = smooth(0.74, 1.0, p);                    // off-node lift toward Console

      // a faint, ever-present PROVENANCE rail under the lane — every move is
      // witnessed (purple thread, subtle here; dominant only in Luna).
      if (thReveal > 0.01) {
        var rail = [
          { x: xQueue, y: laneY + laneHalfH * 0.8 },
          { x: thX, y: laneY + laneHalfH * 0.8 },
          { x: xConfirm, y: laneY + laneHalfH * 0.8 },
          { x: xVerified, y: laneY + laneHalfH * 0.8 }
        ];
        fx.trace(env, rail, C.luna, 0.16 * thReveal, t * 14);
      }

      for (var i = 0; i < n; i++) {
        var it = q[i];
        var ta = advA + i * per;
        var tb = ta + per * 0.82;                           // crossing window for this item
        var cross = smooth(ta, tb, p);                      // 0 waiting → 1 verified
        var isLast = (i === n - 1);

        // resting position in the intake column (waiting)
        var xw = xQueue;
        var yw = qTopY + i * qStep;

        // hover life — a low-k magnetic settle while WAITING only; vanishes
        // cleanly with no fine pointer (fx.pull returns 0 then).
        var waiting = (1 - cross);
        var pull = fx.pull(env, xw, yw, 7, 70);
        var prox = pull.prox;

        var jx = Math.sin(t * 1.5 + it.ph) * 0.7 * it.jit * waiting;
        var jy = Math.cos(t * 1.2 + it.ph) * 0.5 * it.jit * waiting;

        var x, y, scale, alpha, state;

        if (cross < 0.40) {
          // intake: rises out of the column toward the threshold lane
          var k = cross / 0.40;
          x = lerp(xw, thX, fx.easeIn(k)) + jx + pull.dx * waiting;
          y = lerp(yw, laneY, fx.easeInOut(k)) + jy + pull.dy * waiting;
          scale = 1;
          alpha = (0.42 + 0.4 * cross) * thReveal;
          state = "deep";
        } else if (cross < 0.58) {
          // held at the membrane, under review (a brief, deliberate dwell)
          x = thX; y = laneY; scale = 1.05; alpha = 0.92; state = "review";
        } else if (cross < 0.80) {
          // admitted → carried to the confirmation cradle
          var k2 = (cross - 0.58) / 0.22;
          x = lerp(thX, xConfirm, easeOut(k2)); y = laneY;
          scale = lerp(1.05, 0.95, k2); alpha = 0.7 + 0.3 * k2;
          state = "review";
        } else {
          // confirmed by a human → verified, seated to the right
          var k3 = (cross - 0.80) / 0.20;
          x = lerp(xConfirm, xVerified, easeOut(k3)); y = laneY;
          scale = lerp(0.95, 0.9, k3); alpha = 0.85 + 0.15 * k3;
          state = "pass";
        }

        // --- review moment at the membrane (a place, not an error) ---
        var atGate = smooth(0.40, 0.50, cross) * (1 - smooth(0.58, 0.68, cross));
        if (atGate > 0.02) {
          fx.halo(env, thX, laneY, 15 * scale, C.amber, 0.20 * atGate);
          fx.node(env, thX, laneY, 2.0, "review", 0.85 * atGate, 0.9);
        }

        // --- confirmation moment at the cradle (a human attests) ---
        var atSeat = smooth(0.78, 0.86, cross) * (1 - smooth(0.92, 0.99, cross));
        if (atSeat > 0.02) {
          fx.halo(env, xConfirm, laneY, 13 * scale, C.steel, 0.20 * atSeat);
          fx.node(env, xConfirm, laneY - laneHalfH * 0.66, 1.4, "cold", 0.8 * atSeat, 0.6); // the attesting mark
        }

        // --- the moving artifact itself ---
        if (cross > 0.02 && cross < 0.985) {
          // a faint admission link toward the threshold while approaching
          if (cross < 0.50) {
            fx.link(env, x, y, thX, laneY, C.deep, 0.18 * thReveal * (1 - cross), 1);
          }
          var fcol = state === "pass" ? C.ok : state === "review" ? C.amber : C.steel;
          fx.fragment(env, x, y, 5 * scale, it.kind, fcol, alpha);
        }

        // --- the locked, VERIFIED confirmation seated on the far side ---
        if (cross >= 0.985) {
          if (!(isLast && depart > 0.01)) {                 // the last item lifts instead
            fx.node(env, xVerified, laneY, 2.4, "pass", 0.85, 0.9);
            fx.fragment(env, xVerified, laneY + 7, 3, "tick", C.ok, 0.32); // provenance seated
          }
        }

        // --- still in the waiting column (not yet crossing) ---
        if (cross <= 0.02) {
          var wx = xw + jx + pull.dx, wy = yw + jy + pull.dy;
          // hover reveals this item's evidence trace + that its path is governed
          if (prox > 0.02) {
            fx.halo(env, wx, wy, 12 + 6 * prox, C.steel, 0.16 * prox);
            // a short evidence stub (source/time bars) revealed under the cursor
            var ev = it.ev * prox;
            fx.fragment(env, wx - 8, wy + 6, 4 * ev + 1, "bar", C.cold, 0.4 * prox);
            fx.fragment(env, wx - 8, wy + 9, 3 * ev + 1, "bar", C.dim, 0.32 * prox);
            // a faint purple provenance tail toward the threshold — its future path
            fx.trace(env, [{ x: wx, y: wy }, { x: thX, y: laneY }], C.luna, 0.22 * prox, t * 22);
          }
          fx.fragment(env, wx, wy, 5, it.kind, prox > 0.02 ? C.steel : C.dim, (0.4 + 0.4 * prox) * thReveal);
        }
      }

      // ============================================================
      // SIGNAL READY — the last verified item gathers, turns GREEN (ready),
      // and lifts off-node toward the upper-right, handing up to CONSOLE
      // (whose origin node sits low and right, about to multiply).
      // ============================================================
      if (ready > 0.01) {
        var lx = xVerified, ly0 = laneY;
        var dEase = fx.easeInOut(depart);
        // destination: high and biased right — the seat CONSOLE picks up from
        var dx = lerp(lx, w * (env.mobile ? 0.62 : 0.6), dEase);
        var dy = lerp(ly0, yBack - depth * 0.5, dEase);
        var sx = depart > 0.01 ? dx : lx;
        var sy = depart > 0.01 ? dy : ly0;

        // readiness gather — a green halo tightening as it turns ready
        var gather = ready * (1 - depart * 0.4);
        var gPulse = 0.5 + 0.5 * Math.sin(t * 2.2);
        fx.halo(env, sx, sy, 10 + 5 * gPulse, C.ok, 0.20 * gather);

        // a witnessed PROVENANCE trace following the signal off-node (purple)
        if (depart > 0.02) {
          var pts = [
            { x: lx, y: ly0 },
            { x: lerp(lx, dx, 0.5), y: lerp(ly0, dy, 0.5) - depth * 0.12 },
            { x: dx, y: dy }
          ];
          fx.trace(env, pts, C.luna, 0.34 * depart, t * 26);
        }

        // the signal itself — clean GREEN node (state "ready"), lifting/brightening
        var sPulse = 0.7 + 0.3 * Math.sin(t * 2.4);
        fx.node(env, sx, sy, 3.0 + 0.7 * depart, "ready", 0.85 + 0.15 * sPulse, 1);

        // a forward vector — direction of travel, off-node and UP toward Console
        if (depart > 0.05) {
          var vx = sx + (w * 0.05) * (1 - depart * 0.4);
          var vy = sy - depth * 0.14;
          fx.link(env, sx, sy, vx, vy, C.ok, 0.42 * depart, 1.2);
        }

        // a sparse in-world state word — restrained, the way OPENING names states
        var wordA = smooth(0.80, 0.95, p) * (1 - smooth(0.97, 1.0, p));
        if (wordA > 0.01) {
          fx.label(env, "ready", sx, sy + 16, { size: env.mobile ? 7.5 : 9, col: C.ok, alpha: 0.42 * wordA, spacing: 3 });
        }
      }

      // ---- final quiet: a single bounding ring affirms the node is sealed,
      // governed, and complete — usable, not burdensome. -----------
      var done = smooth(0.86, 1.0, p);
      if (done > 0.01) {
        fx.ring(env, cx, horizon + depth * 0.10, halfTop * 1.08, C.steel, 0.26 * done, { flat: 0.34, w: 1.2 });
      }
    }
  });
})();
