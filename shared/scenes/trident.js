/* 05 TRIDENT — ambiguity becomes structure. Trident is the intelligence of
   STRUCTURE: not an assistant, not a voice, not a face. A precision FORCE that
   makes the field executable. The scene opens as FOG — drifting clusters of
   unresolved bloom and scattered clinical fragments, dim and ambiguous. A
   trident-shaped instrument (three converging tines closing to a single focal
   haft) descends and sweeps the field, driven entirely by scroll. In its wake
   the fog CLARIFIES: criteria snap onto a rigid lattice, evidence expectations
   ATTACH beneath each point, the temporal axis STABILIZES from jitter to a true
   line. What it cannot resolve it MARKS in amber — honest, never hidden. Where
   the protocol has changed, the geometry carries visible SCARS (offset seams in
   the lattice). The result is not an answer; it is STRUCTURE. Motion is
   surgical, high-friction — it sharpens, it does not perform.
   Beats: 0..0.35 fog · 0.35..0.80 the instrument cuts, structure assembles ·
   0.80..1 executable field with marked unknowns still honest.
   Palette: white-blue + metallic cyan (mixc steel,cold), sharp shadow, amber
   for the unresolved, a faint purple provenance thread that strengthens toward
   Luna. Hover: ambiguous fog near the cursor CONDENSES into structured lines;
   nearby structure refracts subtly toward the pointer. Continuity: emerges from
   Replay's exposed need for structure; hands the clarified, witnessed field to
   Luna. */
(function () {
  if (!window.Damaros) return;

  Damaros.registerScene("trident", {
    hud: "trident",

    init: function (env) {
      var r = env.rng;
      // The field lives in a band right-of-centre so the LEFT caption column
      // stays clear. Geometry is resolution-independent (0..1) and mapped to
      // pixels each frame. The ordered lattice is what the instrument REVEALS;
      // reality arrives slightly scattered (fog displaces every point).
      var cols = env.mobile ? 5 : 9;
      var rows = env.mobile ? 4 : 6;

      // PROTOCOL VERSION SCARS — a couple of vertical seams in the lattice where
      // the protocol changed. Columns to the right of a scar are shifted, so the
      // clarified geometry visibly carries its own edit history. Kept sparse.
      var scars = [];
      var sCount = env.mobile ? 1 : 2;
      var taken = {};
      for (var s = 0; s < sCount; s++) {
        var sc = 2 + Math.floor(r() * (cols - 3)); // interior column boundary
        if (taken[sc]) sc = (sc % (cols - 2)) + 1;
        taken[sc] = 1;
        scars.push({
          col: sc,                       // seam sits just left of this column
          shift: (r() < 0.5 ? -1 : 1) * (0.05 + r() * 0.05), // small lattice offset (gy)
          ph: r() * 6.2832
        });
      }
      // resolve the cumulative vertical shift applied to a given column index
      function shiftFor(ci) {
        var sh = 0;
        for (var k = 0; k < scars.length; k++) if (ci >= scars[k].col) sh += scars[k].shift;
        return sh;
      }

      var lat = [], i, j;
      for (j = 0; j < rows; j++) {
        for (i = 0; i < cols; i++) {
          var gx = (i + 0.5) / cols;                 // 0..1 across the band
          var gyBase = (j + 0.5) / rows;             // 0..1 down the band
          // a SCAR is a clean vertical translation of every column past the seam,
          // clamped so no row ever clips the band edge / temporal axis.
          var gy = gyBase + shiftFor(i);
          if (gy < 0.04) gy = 0.04; else if (gy > 0.96) gy = 0.96;
          // honest fog displacement: each point starts scattered off its true seat
          var jx = (r() - 0.5) * 0.9 / cols;
          var jy = (r() - 0.5) * 0.9 / rows;
          // what this point becomes once clarified. Mostly executable (pass); a
          // restrained minority is genuinely unresolvable (review/amber).
          var rv = r();
          var state = rv < 0.13 ? "review" : "pass";
          lat.push({
            ci: i, ri: j,
            gx: gx, gy: gy,
            jx: jx, jy: jy,                // fog scatter offset
            state: state,
            ph: r() * 6.2832,             // ambient phase
            br: 0.82 + r() * 0.18,        // per-node brightness (revealed, not uniform)
            sp: 0.4 + r() * 0.7,          // fog drift speed
            ev: 1 + (r() < 0.5 ? 1 : 2),  // evidence-expectation ticks that attach
            // wake threshold: the instrument clarifies this point once it passes
            // gx. A tiny per-node stagger so a column never snaps as one line.
            cut: gx + (r() - 0.5) * 0.035
          });
        }
      }

      // raw fog: drifting unresolved fragments adrift in the ambiguous field,
      // present before the instrument reaches them. Fewer on mobile.
      var motes = [], mn = env.mobile ? 8 : 20;
      for (var m = 0; m < mn; m++) {
        motes.push({
          gx: 0.04 + r() * 0.92, gy: 0.06 + r() * 0.88,
          ph: r() * 6.2832, sp: 0.3 + r() * 0.8,
          kind: (r() < 0.4 ? "tick" : (r() < 0.6 ? "bar" : "dot")),
          s: 1.8 + r() * 2.4,
          drift: 0.6 + r() * 0.8
        });
      }

      // soft fog BLOOM clusters — the body of the ambiguity (depth, not a wash).
      var clouds = [], cn = env.mobile ? 4 : 7;
      for (var cI = 0; cI < cn; cI++) {
        clouds.push({
          gx: 0.06 + r() * 0.9, gy: 0.12 + r() * 0.76,
          ph: r() * 6.2832, sp: 0.18 + r() * 0.3,
          rad: 0.10 + r() * 0.10,        // fraction of band width
          amp: 0.7 + r() * 0.5
        });
      }

      env.data.cols = cols; env.data.rows = rows;
      env.data.lat = lat; env.data.motes = motes; env.data.clouds = clouds;
      env.data.scars = scars;
    },

    draw: function (env) {
      var fx = env.fx, C = env.C, ctx = env.ctx, w = env.w, h = env.h, p = env.p, t = env.t;

      // metallic cyan — the instrument's signature (white-blue, cold steel).
      var CYAN = fx.mixc(C.steel, C.cold, 0.5);
      var CYAN_HOT = fx.mixc(C.steel, C.cold, 0.78);

      // ---- THE PERSISTENT WORLD (always first). The core seat stays anchored
      // near centre so this reads as the same place Replay left and Luna inherits.
      // A faint purple accent foreshadows Luna's provenance without dominating.
      fx.worldbg(env, { cx: w * 0.5, cy: h * 0.5, lift: 0.6, tint: 0.12,
                        accent: C.deep, core: 0.18, coreR: 0.15,
                        dust: env.mobile ? 14 : 30, seed: 51 });

      var d = env.data;
      if (!d || !d.lat) { return; }
      var lat = d.lat, motes = d.motes, clouds = d.clouds, scars = d.scars;
      var cols = d.cols, rows = d.rows;

      // ---- field band (where the lattice & fog live) — kept right-of-centre.
      var bx0 = w * (env.mobile ? 0.34 : 0.40);
      var bx1 = w * 0.94;
      var by0 = h * (env.mobile ? 0.30 : 0.24);
      var by1 = h * (env.mobile ? 0.80 : 0.84);
      var bandW = bx1 - bx0, bandH = by1 - by0;
      function px(gx) { return bx0 + gx * bandW; }
      function py(gy) { return by0 + gy * bandH; }

      // ---- THE INSTRUMENT AS CAMERA. The trident enters the field's left edge
      // and travels right under high friction. Position is driven entirely by p;
      // the ambient apex bob uses t (life only, never meaning).
      var travel = fx.easeInOut(fx.smooth(0.30, 0.86, p)); // 0..1 across band
      var headX = px(travel);
      var arrive = fx.smooth(0.20, 0.34, p);               // tines descend / form
      var settle = fx.smooth(0.86, 1.0, p);                // thins to resident haft
      var presence = arrive * (1 - settle * 0.6);

      // cursor refraction field: a smoothed nudge so nearby structure leans
      // toward the pointer. Vanishes cleanly when there is no fine pointer.
      var ptr = env.ptr, ptrHas = ptr && ptr.has;
      function refract(x, y, k, radius) {
        if (!ptrHas) return { dx: 0, dy: 0, prox: 0 };
        var dx = ptr.x - x, dy = ptr.y - y, dist = Math.sqrt(dx * dx + dy * dy) || 1;
        var prox = fx.clamp(1 - dist / (radius || 150), 0, 1);
        var f = prox * prox * (k == null ? 7 : k);
        return { dx: dx / dist * f, dy: dy / dist * f, prox: prox };
      }

      // ================================================================
      // 1. FOG OF AMBIGUITY — soft noisy bloom clusters + scattered
      //    fragments. Dominant at p=0, wiped from the instrument's wake.
      // ================================================================
      var fogGlobal = 1 - fx.smooth(0.0, 0.34, p) * 0.22;  // commit thins it a little
      var wakeEdge = headX - bandW * 0.03;                  // fog only survives ahead

      // (a) fog bloom clusters — the body of the unresolved field.
      var cI, cl;
      for (cI = 0; cI < clouds.length; cI++) {
        cl = clouds[cI];
        var cgx = cl.gx + Math.cos(t * cl.sp + cl.ph) * 0.018;
        var cgy = cl.gy + Math.sin(t * cl.sp * 0.8 + cl.ph) * 0.03;
        var cxp = px(cgx), cyp = py(cgy);
        // 0 ahead of instrument → recedes as the wake passes
        var ahead = fx.clamp((cxp - wakeEdge) / (bandW * 0.16), 0, 1);
        if (ahead <= 0.02) continue;
        var crad = bandW * cl.rad * (0.9 + 0.2 * Math.sin(t * 0.3 + cl.ph));
        var breath = 0.5 + 0.5 * Math.sin(t * 0.45 + cl.ph);
        // HOVER: fog near the cursor CONDENSES (loses radius, gains a faint cyan
        // cast) — the first sign that the field can be structured.
        var nearC = fx.proximity(env, cxp, cyp, bandW * 0.22);
        var condense = nearC * nearC;
        var fc = fx.mixc(C.dim, CYAN, condense * 0.6);
        fx.halo(env, cxp, cyp, crad * (1 - condense * 0.45),
                fc, (0.05 + 0.05 * breath) * ahead * fogGlobal * cl.amp);
      }

      // (b) connective murk veil so the unresolved zone reads as ONE field.
      if (wakeEdge < bx1) {
        var hx0 = Math.max(bx0, wakeEdge);
        var veilG = ctx.createLinearGradient(hx0, 0, bx1, 0);
        veilG.addColorStop(0, fx.rgba(C.dim, 0));
        veilG.addColorStop(0.16, fx.rgba(C.dim, 0.04 * fogGlobal));
        veilG.addColorStop(1, fx.rgba(C.dim, 0.055 * fogGlobal));
        ctx.fillStyle = veilG;
        ctx.fillRect(hx0, by0 - bandH * 0.06, bx1 - hx0, bandH * 1.12);
      }

      // (c) scattered fragments — unresolved artifacts adrift ahead of the wake.
      //     HOVER: a fragment near the cursor condenses into a short structured
      //     line-segment (a criterion finding its axis), even before the cut.
      var mi;
      for (mi = 0; mi < motes.length; mi++) {
        var mo = motes[mi];
        var ahead2 = fx.clamp((mo.gx - travel) / 0.07, 0, 1);
        if (ahead2 <= 0.02) continue;
        var mdx = Math.cos(t * mo.sp * 0.5 + mo.ph) * bandW * 0.014 * mo.drift;
        var mdy = Math.sin(t * mo.sp * 0.4 + mo.ph) * bandH * 0.020 * mo.drift;
        var mx = px(mo.gx) + mdx, my = py(mo.gy) + mdy;
        var ref = refract(mx, my, 10, bandW * 0.14);
        mx += ref.dx; my += ref.dy;
        var fl = 0.5 + 0.5 * Math.sin(t * 1.1 + mo.ph);
        var fa = (0.20 + 0.24 * fl) * ahead2 * fogGlobal;
        var pr = ref.prox;
        if (pr > 0.06) {
          // condense to a clean cyan stroke pointing along the lattice axis
          var sl = 5 + pr * 9;
          var col = fx.mixc(C.dim, CYAN, pr);
          fx.link(env, mx - sl, my, mx + sl, my, col, fa * (0.5 + 0.6 * pr), 1, true);
          fx.bloom(env, mx, my, 4 + pr * 4, col, fa * 0.4 * pr);
        } else {
          fx.fragment(env, mx, my, mo.s, mo.kind, C.dim, fa);
        }
      }

      // ================================================================
      // 2. THE LATTICE — fog → executable structure (the wake).
      //    Pass A: orthogonal links between two already-clarified points, so
      //    structure assembles itself behind the instrument. Scar columns leave
      //    a visible offset seam.
      // ================================================================
      // resolve each node's clarified amount + its current (refracted) position.
      // cache into the lat objects so pass B reuses pass A's geometry.
      var k, n;
      for (k = 0; k < lat.length; k++) {
        n = lat[k];
        var clr = fx.smooth(n.cut - 0.055, n.cut + 0.02, travel); // 0 fog → 1 clear
        n._clr = clr;
        var jit = 1 - clr;
        var driftx = Math.cos(t * n.sp + n.ph) * bandW * 0.010 * jit;
        var drifty = Math.sin(t * n.sp * 0.9 + n.ph) * bandH * 0.014 * jit;
        var nx = px(n.gx + n.jx * jit) + driftx;
        var ny = py(n.gy + n.jy * jit) + drifty;
        // refraction strengthens as the node clarifies (structure is "live")
        var rf = refract(nx, ny, 6 * (0.3 + 0.7 * clr), bandW * 0.13);
        n._x = nx + rf.dx; n._y = ny + rf.dy; n._prox = rf.prox;
      }

      // helper: index of a lattice node by column/row
      function at(ci, ri) { return ri * cols + ci; }
      // is there a scar seam between column ci and ci+1 ?
      function seamBetween(ci) {
        for (var z = 0; z < scars.length; z++) if (scars[z].col === ci + 1) return scars[z];
        return null;
      }

      // links
      for (k = 0; k < lat.length; k++) {
        n = lat[k];
        if (n._clr <= 0.02) continue;
        // rightward neighbour
        if (n.ci < cols - 1) {
          var rIdx = at(n.ci + 1, n.ri), nr = lat[rIdx];
          if (nr._clr > 0.02) {
            var la = Math.min(n._clr, nr._clr);
            var seam = seamBetween(n.ci);
            var isReview = (n.state === "review" || nr.state === "review");
            var lcol = isReview ? C.amber : CYAN;
            var lalpha = (isReview ? 0.13 : 0.24) * la;
            if (seam) {
              // a SCAR: the link crosses a protocol change. Draw it as a broken,
              // faintly purple-touched seam rather than a clean structural link —
              // the geometry remembers the edit.
              var midx = (n._x + nr._x) * 0.5, midy = (n._y + nr._y) * 0.5;
              var scol = fx.mixc(CYAN, C.luna, 0.5);
              fx.link(env, n._x, n._y, midx, midy, scol, lalpha * 0.7, 1, true);
              fx.link(env, midx, midy, nr._x, nr._y, scol, lalpha * 0.7, 1, true);
              // seam tick — a small vertical mark on the fault line
              var pulse = 0.5 + 0.5 * Math.sin(t * 1.3 + seam.ph);
              ctx.save();
              ctx.globalCompositeOperation = "lighter";
              ctx.strokeStyle = fx.rgba(C.luna, (0.18 + 0.16 * pulse) * la);
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(midx, midy - 5); ctx.lineTo(midx, midy + 5);
              ctx.stroke();
              ctx.restore();
            } else {
              fx.link(env, n._x, n._y, nr._x, nr._y, lcol, lalpha, 1, true);
            }
          }
        }
        // downward neighbour
        if (n.ri < rows - 1) {
          var dIdx = at(n.ci, n.ri + 1), nd = lat[dIdx];
          if (nd._clr > 0.02) {
            var la2 = Math.min(n._clr, nd._clr);
            var isR2 = (n.state === "review" || nd.state === "review");
            fx.link(env, n._x, n._y, nd._x, nd._y,
                    isR2 ? C.amber : CYAN, (isR2 ? 0.13 : 0.24) * la2, 1, true);
          }
        }
      }

      // ================================================================
      //    Pass B: the nodes. A fog seed (dim, scattered, jittering) resolves
      //    through the wake into an aligned stateful node. Evidence expectation
      //    ticks ATTACH beneath each clarified executable point.
      // ================================================================
      for (k = 0; k < lat.length; k++) {
        n = lat[k];
        var c = n._clr, nx2 = n._x, ny2 = n._y;

        if (c <= 0.02) {
          // pure fog: an unresolved seed — a dim point, no committed state yet.
          var seed = 0.20 + 0.16 * (0.5 + 0.5 * Math.sin(t * 1.2 + n.ph));
          // a cursor near a fog seed pre-condenses it toward cyan (intelligence)
          var sc2 = fx.mixc(C.dim, CYAN, n._prox * 0.7);
          fx.node(env, nx2, ny2, 1.5, "deep", seed + n._prox * 0.2, 0.4);
          if (n._prox > 0.05) fx.bloom(env, nx2, ny2, 5 + n._prox * 4, sc2, n._prox * 0.18);
          continue;
        }

        // the cut: a brief surgical flare exactly as the point is clarified.
        var flare = c * (1 - c) * 4; // peaks at c~0.5, gone once resolved
        if (flare > 0.02) {
          var fcol = n.state === "review" ? C.amber : CYAN_HOT;
          fx.halo(env, nx2, ny2, 8 + 7 * flare, fcol, 0.18 * flare);
        }

        if (n.state === "review") {
          // honestly MARKED, not decided: a restrained amber point that keeps a
          // faint unresolved tremor even when clarified. Never hidden.
          var trem = (1 - c) * 0.6;
          var rx = nx2 + Math.sin(t * 1.8 + n.ph) * 1.2 * trem;
          var ry = ny2 + Math.cos(t * 1.5 + n.ph) * 1.2 * trem;
          fx.node(env, rx, ry, 2.5, "review", 0.52 + 0.34 * c, 0.9);
          var rpulse = 0.5 + 0.5 * Math.sin(t * 1.5 + n.ph);
          fx.ring(env, rx, ry, 5.4 + rpulse * 1.2, C.amber, 0.24 * c, { w: 1 });
        } else {
          // executable: a clean aligned cyan node, brightest once fully resolved.
          var bb = 0.92 + 0.08 * Math.sin(t * 0.9 + n.ph);
          fx.halo(env, nx2, ny2, 6, CYAN, 0.08 * c * n.br);
          // draw as a steel/cyan stateful point (pass = executable structure)
          fx.node(env, nx2, ny2, 2.4, "pass", (0.5 + 0.4 * c) * n.br * bb, c);
          // recolour the bloomed core toward cyan via a small additive kiss
          fx.bloom(env, nx2, ny2, 5.2, CYAN, 0.10 * c * n.br);

          // EVIDENCE EXPECTATIONS ATTACH: tiny ticks descend and lock beneath the
          // node once it is essentially clarified — what proof this point demands.
          var att = fx.smooth(0.45, 1.0, c);
          if (att > 0.02) {
            ctx.save();
            ctx.globalCompositeOperation = "lighter";
            ctx.strokeStyle = fx.rgba(CYAN, 0.30 * att * n.br);
            ctx.lineWidth = 1;
            for (var e = 0; e < n.ev; e++) {
              var ex = nx2 + (e - (n.ev - 1) * 0.5) * 4.2;
              var ey0 = ny2 + 6;
              var ey1 = ny2 + 6 + (3 + e) * att; // settle to final length
              ctx.beginPath(); ctx.moveTo(ex, ey0); ctx.lineTo(ex, ey1); ctx.stroke();
            }
            ctx.restore();
          }
        }
      }

      // ================================================================
      // 3. TEMPORAL LOGIC STABILIZES — a horizontal time axis beneath the band
      //    that jitters in the fog region and STRAIGHTENS in the clarified wake.
      //    (The trial's temporal logic becoming sound.)
      // ================================================================
      var axisY = by1 + bandH * 0.02;
      var ticks = env.mobile ? 7 : 13;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (var ti = 0; ti <= ticks; ti++) {
        var tg = ti / ticks;
        var tx = px(tg);
        var clearedHere = fx.smooth(tg - 0.04, tg + 0.02, travel);
        // jitter in the fog, dead-straight once clarified
        var jy2 = (1 - clearedHere) * Math.sin(t * 2.2 + ti * 1.3) * 3.0;
        var ta = 0.10 + 0.26 * clearedHere;
        var tcol = fx.mixc(C.dim, CYAN, clearedHere);
        ctx.strokeStyle = fx.rgba(tcol, ta);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(tx, axisY + jy2 - 3); ctx.lineTo(tx, axisY + jy2 + 3);
        ctx.stroke();
        // connect consecutive ticks into the stabilized timeline behind the wake
        if (ti > 0) {
          var pg = (ti - 1) / ticks, pxg = px(pg);
          var clr0 = fx.smooth(pg - 0.04, pg + 0.02, travel);
          var seg = Math.min(clr0, clearedHere);
          if (seg > 0.02) {
            var pjy = (1 - clr0) * Math.sin(t * 2.2 + (ti - 1) * 1.3) * 3.0;
            ctx.strokeStyle = fx.rgba(CYAN, 0.18 * seg);
            ctx.beginPath();
            ctx.moveTo(pxg, axisY + pjy); ctx.lineTo(tx, axisY + jy2);
            ctx.stroke();
          }
        }
      }
      ctx.restore();

      // ================================================================
      // 4. THE TRIDENT INSTRUMENT — three converging tines closing to a single
      //    focal haft. Sharp, surgical, absolute. The motion of the scene.
      // ================================================================
      if (presence > 0.02) {
        var bp = presence;
        var topY = by0 - bandH * 0.06;
        var botY = by1 + bandH * 0.06;
        var spanY = botY - topY;
        // the haft (convergence point) bobs vertically — ambient life only.
        var apexY = fx.lerp(by0, by1, 0.5 + 0.30 * Math.sin(t * 0.5));
        // tines reach FORWARD into the unresolved fog and converge back to the
        // haft. forwardReach scales with how surgical (high-friction) the cut is.
        var reach = bandW * 0.17;
        var spread = spanY * 0.34; // outer tine separation at the leading edge

        ctx.save();
        ctx.globalCompositeOperation = "lighter";

        // (a) soft falloff sheath around the working axis — the pressure it cuts.
        var sheath = ctx.createLinearGradient(headX - 24, 0, headX + 24, 0);
        sheath.addColorStop(0.0, fx.rgba(CYAN, 0));
        sheath.addColorStop(0.5, fx.rgba(CYAN, 0.14 * bp));
        sheath.addColorStop(1.0, fx.rgba(CYAN, 0));
        ctx.fillStyle = sheath;
        ctx.fillRect(headX - 24, topY, 48, spanY);

        // (b) the THREE TINES — clean strokes from the leading edge converging
        // to the haft. Outer two angle in; the centre tine runs straight. This
        // is the trident reading the field it is about to make executable.
        var leadX = headX + reach;
        ctx.lineWidth = 1.2;
        // centre tine (bright core)
        ctx.strokeStyle = fx.rgba(CYAN_HOT, 0.85 * bp);
        ctx.beginPath();
        ctx.moveTo(leadX, apexY); ctx.lineTo(headX, apexY);
        ctx.stroke();
        // outer tines (slightly cooler)
        ctx.strokeStyle = fx.rgba(CYAN, 0.55 * bp);
        ctx.beginPath();
        ctx.moveTo(leadX, apexY - spread); ctx.lineTo(headX, apexY);
        ctx.moveTo(leadX, apexY + spread); ctx.lineTo(headX, apexY);
        ctx.stroke();
        // tine points — sharp leading tips probing the fog
        var tips = [apexY - spread, apexY, apexY + spread];
        for (var tp = 0; tp < 3; tp++) {
          fx.bloom(env, leadX, tips[tp], 6, CYAN, 0.22 * bp);
        }

        // (c) the working axis: a thin bright vertical core — the edge that
        // actually cuts fog into structure, dropping the full height of the band.
        ctx.strokeStyle = fx.rgba(CYAN_HOT, 0.8 * bp);
        ctx.lineWidth = 1.3;
        ctx.beginPath(); ctx.moveTo(headX, topY); ctx.lineTo(headX, botY); ctx.stroke();

        ctx.restore();

        // (d) the haft / focal point — the bright eye that converges the tines.
        fx.halo(env, headX, apexY, 24, CYAN_HOT, 0.20 * bp);
        fx.halo(env, headX, apexY, 10, CYAN, 0.40 * bp);
        fx.node(env, headX, apexY, 2.2, "cold", 0.95 * bp, 1);
        // a faint purple provenance kiss at the haft — every consequential move
        // leaves a witnessed trace (becomes dominant only in Luna).
        fx.bloom(env, headX, apexY, 14, C.luna, 0.10 * bp);
        // crosshair sighting ticks at the haft
        ctx.strokeStyle = fx.rgba(CYAN_HOT, 0.55 * bp); ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(headX - 7, apexY); ctx.lineTo(headX - 3, apexY);
        ctx.moveTo(headX + 3, apexY); ctx.lineTo(headX + 7, apexY);
        ctx.stroke();
      }

      // ================================================================
      // 5. RESIDENT HAFT (end state). The instrument does not vanish — it thins
      //    to a quiet vertical axis holding the now-executable field. Restraint.
      // ================================================================
      if (settle > 0.02) {
        var restX = px(1.0);
        fx.link(env, restX, by0 - bandH * 0.04, restX, by1 + bandH * 0.04, CYAN, 0.16 * settle, 1, true);
        fx.halo(env, restX, (by0 + by1) * 0.5, 20, CYAN, 0.06 * settle);
      }

      // ================================================================
      // 6. PROVENANCE HAND-OFF to Luna — a single faint purple thread that
      //    threads the clarified field and strengthens toward p=1, so the camera
      //    leaves Trident carrying a witnessed structure into governance.
      // ================================================================
      var hand = fx.smooth(0.72, 1.0, p);
      if (hand > 0.02) {
        var threadA = 0.10 * hand;
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.strokeStyle = fx.rgba(C.luna, threadA);
        ctx.lineWidth = 1;
        ctx.setLineDash([1, 6]);
        ctx.lineDashOffset = -(t * 10);
        // run the thread along the top row of the clarified lattice
        ctx.beginPath();
        var started = false;
        for (var q = 0; q < cols; q++) {
          var topNode = lat[at(q, 0)];
          if (!topNode || topNode._clr <= 0.05) continue;
          if (!started) { ctx.moveTo(topNode._x, topNode._y - 7); started = true; }
          else ctx.lineTo(topNode._x, topNode._y - 7);
        }
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }

      // ================================================================
      // 7. CLARIFICATION READOUT — one honest, minimal mark at the very end:
      //    the instrument resolved what it could and HELD the rest.
      // ================================================================
      var resolved = fx.smooth(0.86, 1.0, p);
      if (resolved > 0.02 && !env.mobile) {
        fx.label(env, "FIELD EXECUTABLE", bx0, by1 + 30,
          { size: 8.5, col: CYAN, alpha: 0.42 * resolved, spacing: 3, align: "left" });
      }
    }
  });
})();
