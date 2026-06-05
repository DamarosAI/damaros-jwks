/* 03 SCREENING — uncertainty becomes review. Execution under restraint.
   The governed structure (descending rings) drops around the bounded signal
   carried from Evidence and encloses it. Criteria resolve QUIETLY, one by one,
   as gates / paths / state-changes — never a checklist, never a checkmark:
     · one path LOCKS green   (pass)   — a quiet lock, it simply stops moving;
     · one CLOSES red         (fail)   — clean, mechanical finality;
     · one SUSPENDS amber     (review) — held, unsupported, breathing;
     · one migrates into a protected REVIEW CHAMBER — a threshold where the
       machine STOPS because human judgment must begin (sacred, not an error);
     · one WAITS for human confirmation — it never self-resolves.
   Then the resolved states orbit inward into a compact DECISION FIELD that
   collapses to ONE verified signal, handed forward to Replay.
   Doctrine made felt: Damaros does not erase uncertainty — it gives it a
   governed place to live; it refuses to counterfeit certainty; it protects the
   handoff to human judgment. PASS is quiet. FAIL is final. REVIEW is sacred.
   A faint PURPLE Luna provenance thread witnesses every consequential move.
   Caption is LEFT → composition biased right + slightly up so the text breathes.
   Continuity: signal IN from Evidence (steel/cold core, evidence ring, amber
   arc-of-absence) → OUT as one verified signal to Replay. */
(function () {
  if (!window.Damaros) return;

  Damaros.registerScene("screening", {
    hud: "screening",

    init: function (env) {
      var r = env.rng, mob = env.mobile;

      // ---- the sanctioned criterion-pathways ----------------------------
      // Each is a gate around the upper / right arc of the core (clear of the
      // LEFT caption). Each carries the OUTCOME it resolves to, and a staggered
      // ordinal so they settle in turn, not all at once.
      //   kind: "lock"(pass) | "close"(fail) | "suspend"(review) |
      //         "chamber"(into REVIEW) | "await"(human confirmation)
      // Mobile drops to the four load-bearing outcomes (no extra lock).
      var kinds = mob
        ? ["lock", "close", "suspend", "chamber", "await"]
        : ["lock", "close", "lock", "suspend", "chamber", "await", "lock"];
      var base = kinds.length;
      var arr = [];
      var i;
      for (i = 0; i < base; i++) {
        // sweep the gates across the upper-right arc: roughly -1.15 (upper) to
        // +1.5 (lower-right), with a little irregularity so it is structure, not
        // a clock face.
        var a = -1.18 + (i / (base - 1)) * 2.62 + (r() - 0.5) * 0.14;
        arr.push({
          a: a,
          rad: 1.40 + r() * 0.46,                 // resting distance from core (×R)
          kind: kinds[i],
          ord: 0.34 + (i / base) * 0.40 + (r() - 0.5) * 0.04, // when it resolves (p)
          ph: r() * 6.2832,
          slot: r() * 6.2832,                     // its angular seat inside REVIEW
          seedoff: (r() - 0.5)                     // misc per-path noise
        });
      }
      env.data.path = arr;

      // ---- governance rings that DESCEND and enclose --------------------
      // Concentric dials drop from above and tighten onto the signal.
      var rings = [], rn = mob ? 3 : 4;
      for (i = 0; i < rn; i++) {
        rings.push({
          radf: 1.95 - i * (1.05 / rn),           // outer→inner resting radius (×R)
          seg: 3 + i * 2,
          rotdir: (i % 2 ? -1 : 1),
          rotoff: r() * 6.2832,
          drop: 1.7 + i * 0.55,                    // how far up it starts (×R)
          ord: i * 0.05,
          col: i === 0 ? "deep" : "steel"
        });
      }
      env.data.rings = rings;

      // ---- residue marks orbiting the inbound signal before enclosure ---
      var mk = mob ? 4 : 8, marks = [];
      for (i = 0; i < mk; i++) marks.push({ a: r() * 6.2832, rr: 0.74 + r() * 0.26, k: r() < 0.5 ? "tick" : "bar" });
      env.data.marks = marks;

      // ---- the evidence-ring absence arc carried in from Evidence -------
      // (so this chamber opens on the SAME object the prior one produced).
      env.data.gap0 = -0.5 + r() * 0.5;
      env.data.gapW = 0.6 + r() * 0.18;

      // ---- Luna witness ticks distributed around the governed boundary --
      var wn = mob ? 5 : 9, wit = [];
      for (i = 0; i < wn; i++) wit.push({ a: r() * 6.2832, ph: r() * 6.2832 });
      env.data.wit = wit;
    },

    draw: function (env) {
      var fx = env.fx, C = env.C, w = env.w, h = env.h, p = env.p, t = env.t;
      var ctx = env.ctx, mob = env.mobile;

      // ---- 0. THE PERSISTENT WORLD (always running) ----------------------
      // bias the seat of light right + slightly up so the LEFT caption breathes.
      var cx = w * (mob ? 0.5 : 0.56);
      var cy = h * (mob ? 0.45 : 0.46);
      var R = Math.min(w, h) * (mob ? 0.215 : 0.23);

      fx.worldbg(env, { cx: cx, cy: cy, lift: 0.78, tint: 0.12,
                        accent: C.deep, core: 0.20, coreR: 0.17,
                        dust: mob ? 16 : 38, seed: 41 });

      if (!env.data || !env.data.path) return;

      // ---- master beats --------------------------------------------------
      var descend  = fx.smooth(0.00, 0.30, p);   // rings drop + enclose the signal
      var enclose  = fx.smooth(0.10, 0.34, p);   // enclosure tightens to the signal
      var resolve  = fx.smooth(0.30, 0.80, p);   // criteria resolve one by one
      var gather   = fx.smooth(0.80, 1.00, p);   // resolved states orbit into the field
      var verified = fx.smooth(0.90, 1.00, p);   // one verified signal stands

      var breathe = 0.5 + 0.5 * Math.sin(t * 0.9);

      // a centre hover gathers the decision field EARLY (preview of the verdict).
      var ctrPull = fx.proximity(env, cx, cy, R * 1.1);
      var fieldT = fx.clamp(gather + ctrPull * 0.5 * (1 - gather), 0, 1);
      var fieldE = fx.easeInOut(fieldT);

      // ---- the REVIEW chamber: a protected threshold at the system EDGE --
      // sits lower-right, beyond the governed core, clear of the caption.
      var rvX = cx + R * (mob ? 1.62 : 1.92);
      var rvY = cy + R * (mob ? 1.06 : 0.74);
      var rvMax = w - R * 0.62; if (rvX > rvMax) rvX = rvMax;
      var rvR = R * (mob ? 0.46 : 0.5);
      // amber hover expands the chamber to reveal the protected handoff motion.
      var rvHover = fx.proximity(env, rvX, rvY, rvR * 2.4);
      var chamber = fx.smooth(0.58, 0.92, p);
      var chamberOpen = chamber * (0.74 + 0.26 * fx.easeOut(chamber)) + rvHover * 0.4 * (1 - gather * 0.5);

      // ====================================================================
      // 1. THE GOVERNED STRUCTURE DESCENDS AND ENCLOSES THE SIGNAL
      // ====================================================================
      // Concentric governance rings drop from above, settle, and tighten. As
      // judgment begins they re-quiet (they never gape).
      var rings = env.data.rings || [];
      var quiet = 1 - resolve * 0.30 - gather * 0.25;
      for (var ri = 0; ri < rings.length; ri++) {
        var rg = rings[ri];
        var rdesc = fx.smooth(rg.ord, rg.ord + 0.28, p);
        if (rdesc <= 0.001) continue;
        var ddrop = (1 - fx.easeOut(rdesc)) * R * rg.drop;     // vertical entrance
        // enclosure tightens the resting radius inward as it seats.
        var radf = fx.lerp(rg.radf + 0.35, rg.radf, fx.easeInOut(enclose));
        // and the whole cluster compacts as the decision field forms.
        radf = fx.lerp(radf, radf * 0.62, fieldE);
        var rr = R * radf;
        var rot = rg.rotoff + t * 0.03 * rg.rotdir * (0.5 + ri * 0.3);
        var col = C[rg.col] || C.steel;
        var a = (0.10 + 0.20 * rdesc) * quiet * (rg.col === "deep" ? 0.7 : 1);
        // gap closes as the structure settles (open dial → governed ring).
        var gap = 0.5 - rdesc * 0.36 + 0.05;
        fx.ring(env, cx, cy - ddrop, rr, col, a, { flat: 0.9, seg: rg.seg, gap: gap, rot: rot, w: 1.1 });
      }

      // ---- Luna witness arc: a faint purple provenance ring is present ----
      // throughout — every consequential movement is witnessed.
      var wit = env.data.wit || [];
      var witR = R * fx.lerp(2.05, 1.28, fx.easeInOut(enclose));
      witR = fx.lerp(witR, witR * 0.66, fieldE);
      var witA = (0.05 + 0.10 * enclose) * (0.6 + 0.4 * breathe) * quiet;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = fx.rgba(C.luna, witA);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(cx, cy, witR, witR * 0.9, t * 0.02, 0, 6.2832);
      ctx.stroke();
      ctx.restore();
      for (var wi = 0; wi < wit.length; wi++) {
        var wt = wit[wi], wa = wt.a + t * 0.04;
        var wx = cx + Math.cos(wa) * witR, wy = cy + Math.sin(wa) * witR * 0.9;
        fx.node(env, wx, wy, 1.1, "luna", (0.18 + 0.18 * Math.sin(t * 1.3 + wt.ph)) * enclose * quiet, 0.3);
      }

      // ====================================================================
      // 2. THE BOUNDED SIGNAL CARRIED IN FROM EVIDENCE (then enclosed)
      // ====================================================================
      // It arrives carrying its evidence ring + amber arc-of-absence; as the
      // structure encloses it, its exposed glow draws in and the absence is
      // taken into governance (it does not vanish — it is given a place).
      var rot0 = t * 0.05;
      var sigPulse = 0.5 + 0.5 * Math.sin(t * 1.3);
      var sigExposed = 1 - enclose;                 // how "open to the dark" it still is
      var sigR = R * fx.lerp(0.62, 0.40, fx.easeInOut(enclose));
      sigR = fx.lerp(sigR, sigR * 0.5, verified);   // compacts to the verified point

      // permission halo around the protected presence, drawing inward
      fx.halo(env, cx, cy, sigR * (2.0 + 0.2 * sigPulse), C.deep,
              (0.14 - enclose * 0.05 + verified * 0.06) * (0.6 + 0.4 * sigPulse));

      // residue marks: present before enclosure, absorbed as it closes
      var marks = env.data.marks || [];
      var mFade = sigExposed * 0.5;
      if (mFade > 0.01) {
        for (var mi = 0; mi < marks.length; mi++) {
          var mm = marks[mi], ma = mm.a + rot0;
          var mx = cx + Math.cos(ma) * R * mm.rr * 1.05;
          var my = cy + Math.sin(ma) * R * mm.rr * 0.95;
          fx.fragment(env, mx, my, 3.2, mm.k, C.dim, mFade);
        }
      }

      // the inbound evidence ring + its amber arc of absence (the Evidence motif).
      // It stays segmented and broken across the gap until enclosure governs it.
      var gap0 = (env.data.gap0 == null ? -0.5 : env.data.gap0);
      var gapW = (env.data.gapW == null ? 0.6 : env.data.gapW);
      var evN = mob ? 16 : 24;
      var evA = (0.30 - enclose * 0.12) * (0.6 + 0.4 * sigPulse);
      if (evA > 0.01) {
        for (var ei = 0; ei < evN; ei++) {
          var ea0 = (ei / evN) * 6.2832 + rot0;
          var rel = ea0 - (gap0 + rot0);
          while (rel > Math.PI) rel -= 6.2832;
          while (rel < -Math.PI) rel += 6.2832;
          if (Math.abs(rel) < gapW * 0.5) continue;       // the unknown stays unfilled
          ctx.strokeStyle = fx.rgba(C.steel, evA);
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.ellipse(cx, cy, sigR, sigR * 0.9, 0, ea0 + 0.02, ea0 + (6.2832 / evN) - 0.02);
          ctx.stroke();
        }
        // the arc of absence: two faint amber edge markers + a held dashed mouth.
        var gC = gap0 + rot0, gHalf = gapW * 0.5;
        var unk = 0.5 + 0.5 * Math.sin(t * 0.7);
        ctx.save();
        ctx.setLineDash([1, 6]); ctx.lineDashOffset = -t * 6;
        ctx.strokeStyle = fx.rgba(C.amber, (0.12 + 0.10 * unk) * evA * 3);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(cx, cy, sigR, sigR * 0.9, 0, gC - gHalf, gC + gHalf);
        ctx.stroke();
        ctx.setLineDash([]); ctx.lineDashOffset = 0;
        ctx.restore();
      }

      // ====================================================================
      // 3. CRITERION-PATHWAYS RESOLVE, ONE BY ONE, UNDER CONSTRAINT
      // ====================================================================
      var path = env.data.path || [];
      var pi;
      for (pi = 0; pi < path.length; pi++) {
        var c = path[pi];
        var a = c.a;

        // rim anchor on the enclosed core
        var ex = cx + Math.cos(a) * sigR * 1.02;
        var ey = cy + Math.sin(a) * sigR * 0.9 * 1.02;
        // resting satellite position
        var rad = R * c.rad;
        var sx = cx + Math.cos(a) * rad, sy = cy + Math.sin(a) * rad * 0.9;

        // per-pathway resolution (staggered around its ordinal) + emergence.
        var rp = fx.smooth(c.ord - 0.10, c.ord + 0.12, p);
        var emerge = fx.smooth(0.14, c.ord, p);
        if (emerge <= 0.001) continue;

        // gather phase: every resolved node draws into the compact decision field.
        var gx = cx + Math.cos(a) * R * 0.5, gy = cy + Math.sin(a) * R * 0.5 * 0.9;

        if (c.kind === "lock") {
          // LOCKS green (pass) — a QUIET lock: it firms from deep→green and snaps
          // still. No fireworks; the only event is that the jitter stops.
          var lset = fx.easeOut(rp);
          var jit = (1 - rp) * 1.8;
          var lx = sx + Math.sin(t * 1.9 + c.ph) * jit, ly = sy + Math.cos(t * 1.6 + c.ph) * jit;
          // hover a green node → its source provenance traces briefly illuminate.
          var gHov = fx.proximity(env, lx, ly, R * 0.7) * lset;
          // settle toward the decision field at gather.
          lx = fx.lerp(lx, gx, fieldE); ly = fx.lerp(ly, gy, fieldE);
          var lcol = fx.mixc(C.deep, C.ok, lset);
          fx.link(env, ex, ey, lx, ly, lcol, (0.18 + 0.22 * lset) * emerge * (1 - fieldE * 0.3), 0.8 + lset * 0.6);
          // a single quiet confirming tick at the instant of lock, then steady.
          var lockFlash = fx.smooth(0.55, 0.72, rp) * (1 - fx.smooth(0.72, 0.96, rp));
          if (lockFlash > 0.01 && !mob) fx.ring(env, lx, ly, 5 + (1 - lockFlash) * 5, C.ok, lockFlash * 0.4, { w: 1 });
          // hover: illuminate source provenance (purple Luna threads back to rim).
          if (gHov > 0.02) {
            var midx = (ex + lx) * 0.5 + Math.cos(a + 1.57) * 8;
            var midy = (ey + ly) * 0.5 + Math.sin(a + 1.57) * 8;
            fx.trace(env, [{ x: lx, y: ly }, { x: midx, y: midy }, { x: ex, y: ey }], C.luna, 0.4 * gHov, t * 20);
            fx.trace(env, [{ x: ex, y: ey }, { x: cx, y: cy }], C.ok, 0.3 * gHov, -t * 16);
          }
          fx.node(env, lx, ly, 2.6, "pass", (0.48 + 0.46 * lset) * emerge, 0.5 + 0.5 * lset);
          if (!mob && lset > 0.7 && pi === 0) {
            fx.label(env, "PASS", lx, ly - 14, { size: 8, col: C.ok, alpha: (lset - 0.7) * 1.6 * (1 - fieldE), spacing: 2.6 });
          }

        } else if (c.kind === "close") {
          // CLOSES red (fail) — clean, mechanical finality. The pathway retracts
          // toward the core and the node closes; a precise red seal, no drama.
          var rcRaw = rp;
          // hover a red path → close with restrained finality (advance it slightly).
          var rHov = fx.proximity(env, sx, sy, R * 0.7);
          rcRaw = fx.clamp(rcRaw + rHov * 0.25 * (1 - rcRaw), 0, 1);
          var rc = fx.easeInOut(rcRaw);
          var txp = fx.lerp(sx, ex, rc), typ = fx.lerp(sy, ey, rc);
          // the line firms briefly to red, then withdraws as it seals shut.
          var fcol = fx.mixc(C.deep, C.breach, fx.smooth(0, 0.6, rcRaw));
          fx.link(env, ex, ey, txp, typ, fcol, 0.18 * emerge * (1 - rc * 0.65), 1);
          var cnA = emerge * (1 - rc);
          if (cnA > 0.02) fx.node(env, txp, typ, 2.2 * (1 - rc * 0.45), "fail", cnA * 0.8, 0.4);
          // the mechanical close: a single hard red ring contracting to nothing.
          var sealT = fx.smooth(0.5, 0.92, rcRaw);
          if (sealT > 0.01 && sealT < 0.999) {
            fx.ring(env, ex, ey, 7 * (1 - sealT) + 1.5, C.breach, (1 - sealT) * 0.5 * sealT * 4, { w: 1.4 });
          }
          // a small final red residue mark sealed against the rim — finality.
          if (rc > 0.55) fx.fragment(env, ex, ey, 3, "cross", C.breach, (rc - 0.55) * 0.7 * (1 - fieldE * 0.4));

        } else if (c.kind === "suspend") {
          // SUSPENDS amber (review) — unsupported; it holds, breathing, in place.
          // It does NOT migrate; it is given a governed place to live, right here.
          var hold = 0.4 + 0.3 * Math.sin(t * 2.0 + c.ph);
          var aset = fx.easeOut(rp);
          var hx = sx + Math.sin(t * 1.7 + c.ph) * 1.6;
          var hy = sy + Math.cos(t * 1.5 + c.ph) * 1.6;
          hx = fx.lerp(hx, gx, fieldE); hy = fx.lerp(hy, gy, fieldE);
          var scol = fx.mixc(C.deep, C.amber, aset);
          fx.link(env, ex, ey, hx, hy, scol, (0.16 + 0.10 * aset) * emerge * (1 - fieldE * 0.3), 1);
          // a faint amber holding ring — suspended, not failed, not passed.
          if (aset > 0.4 && !mob) fx.ring(env, hx, hy, 6 + 1.5 * hold, C.amber, (aset - 0.4) * 0.4 * (0.5 + 0.5 * hold) * (1 - fieldE), { w: 1 });
          fx.node(env, hx, hy, 2.3, rp > 0.5 ? "review" : "deep", (hold + 0.25) * emerge, rp > 0.5 ? 0.6 : 0.3);

        } else if (c.kind === "chamber") {
          // MIGRATES INTO THE PROTECTED REVIEW CHAMBER — the machine stops here
          // because human judgment must begin. The signal is carried across the
          // threshold INTACT, witnessed by a purple provenance trace. Sacred.
          var mig = fx.smooth(c.ord + 0.04, 0.9, p);
          var hx2 = sx + Math.sin(t * 1.6 + c.ph) * 1.4 * (1 - mig);
          var hy2 = sy + Math.cos(t * 1.5 + c.ph) * 1.4 * (1 - mig);
          // destination: a protected seat inside the REVIEW chamber.
          var dgx = rvX + Math.cos(c.slot) * rvR * 0.4, dgy = rvY + Math.sin(c.slot) * rvR * 0.4;
          var mp = fx.easeInOut(mig);
          var px = fx.lerp(hx2, dgx, mp), py = fx.lerp(hy2, dgy, mp);
          // tether thins as it leaves the core's jurisdiction.
          fx.link(env, ex, ey, px, py, C.dim, 0.15 * emerge * (1 - mig * 0.9), 1);
          // the provenance trace handing it, intact, across the threshold (Luna).
          if (mig > 0.02) fx.trace(env, [{ x: hx2, y: hy2 }, { x: (hx2 + px) * 0.5, y: (hy2 + py) * 0.5 - 6 }, { x: px, y: py }], C.luna, 0.34 * mig, t * 16);
          fx.node(env, px, py, 2.2, mig > 0.5 ? "review" : "deep", (0.5 + 0.2 * breathe) * emerge, mig > 0.5 ? 0.65 : 0.3);

        } else { // await — WAITS for human confirmation. It NEVER self-resolves.
          // It holds at the rim, a patient cold/luna point under a soft pulse —
          // the system declines to counterfeit a verdict it cannot earn.
          var wpulse = 0.45 + 0.35 * Math.sin(t * 1.6 + c.ph);
          var wx2 = sx, wy2 = sy;
          wx2 = fx.lerp(wx2, gx, fieldE); wy2 = fx.lerp(wy2, gy, fieldE);
          fx.link(env, ex, ey, wx2, wy2, C.luna, 0.14 * emerge * (1 - fieldE * 0.3), 1);
          // a slow expectant ring breathing outward — awaiting a hand, not resolving.
          if (!mob) fx.ring(env, wx2, wy2, 7 + 3 * wpulse, C.luna, 0.16 * emerge * (1 - wpulse * 0.4) * (1 - fieldE * 0.5), { w: 1 });
          fx.node(env, wx2, wy2, 2.2, "luna", (0.4 + 0.4 * wpulse) * emerge, 0.5);
        }
      }

      // ====================================================================
      // 4. THE SIGNAL CORE — enclosed, governed, then VERIFIED
      // ====================================================================
      // A quiet point at the heart. Deep/uncertain under enclosure → settles to
      // a verified steel/green presence as the decision field closes. PASS is
      // quiet: the verified state is a calm, certain light, not a celebration.
      var coreState = verified > 0.5 ? "pass" : (resolve > 0.3 ? "cold" : "deep");
      var coreA = (0.55 + 0.35 * sigPulse);
      fx.node(env, cx, cy, mob ? 2.8 : 3.2 + verified * 0.8, coreState, coreA, 0.5 + 0.4 * (1 - resolve * 0.4) + 0.3 * verified);

      // as the machine quiets, a thin governed seal settles over the signal.
      if (resolve > 0.2) {
        fx.ring(env, cx, cy, sigR * 1.15, C.steel, 0.20 * resolve * (1 - fieldE * 0.3), { flat: 0.9, w: 1 });
      }

      // ---- the DECISION FIELD: resolved states orbit into one verdict ----
      if (fieldT > 0.01) {
        // a compact governed ring gathers the resolved outcomes inward.
        fx.ring(env, cx, cy, R * (0.62 + 0.06 * breathe), C.steel, 0.26 * fieldE, { flat: 0.9, w: 1.1 });
        // a faint purple provenance halo — the whole verdict is witnessed.
        fx.halo(env, cx, cy, R * (0.9 + 0.2 * breathe), C.luna, 0.06 * fieldE);
      }

      // ---- VERIFIED: one signal stands, ready to hand off to Replay ------
      if (verified > 0.01) {
        // a single quiet confirming seal — expands once, no spectacle.
        fx.ring(env, cx, cy, R * (0.4 + (1 - verified) * 1.0), C.cold, verified * 0.34, { flat: 0.9, w: 1.3 });
        fx.halo(env, cx, cy, R * (1.3 + 0.18 * breathe), C.ok, 0.10 * verified);
        // a faint inner steel ring — the governed boundary, complete & answerable.
        fx.ring(env, cx, cy, sigR * 1.0, C.ok, 0.30 * verified, { flat: 0.9, w: 1 });
        // a couple of quiet motes settle around it — the seed of Replay's lone
        // signal waiting in the dark (continuity hand-off).
        if (!mob) {
          for (var vi = 0; vi < 3; vi++) {
            var va = rot0 * 1.2 + vi * 2.094;
            var vr = R * (0.9 + 0.2 * Math.sin(t * 1.1 + vi));
            fx.node(env, cx + Math.cos(va) * vr, cy + Math.sin(va) * vr * 0.9, 1.2, "dim", 0.22 * verified * (0.5 + 0.5 * Math.sin(t * 2 + vi)), 0.3);
          }
        }
      }

      // ====================================================================
      // 5. THE REVIEW THRESHOLD ITSELF (drawn last so it reads as a place)
      // ====================================================================
      if (chamber > 0.01) {
        // a short conduit from the governed system to the threshold's edge.
        var conA = chamber * 0.4 * (1 - gather * 0.3);
        fx.link(env, cx + sigR * 1.05, cy + sigR * 0.3, rvX - rvR * 0.9, rvY - rvR * 0.1, C.amber, conA * 0.5, 1);
        fx.reviewChamber(env, rvX, rvY, rvR * (0.7 + 0.3 * fx.easeOut(chamberOpen)), chamberOpen);
        // hover: the protected HANDOFF motion — a witnessed point crossing in,
        // an explicit gesture toward human judgment (purple, sacred, unhurried).
        if (rvHover > 0.02 && !mob) {
          var ho = (t * 0.18) % 1;
          var hax = fx.lerp(rvX - rvR * 1.2, rvX, fx.easeInOut(ho));
          var hay = fx.lerp(rvY - rvR * 0.4, rvY, fx.easeInOut(ho));
          fx.trace(env, [{ x: rvX - rvR * 1.2, y: rvY - rvR * 0.4 }, { x: hax, y: hay }], C.luna, 0.4 * rvHover, t * 22);
          fx.node(env, hax, hay, 1.8, "review", 0.6 * rvHover * (1 - ho * 0.5), 0.6);
        }
        if (!mob && chamber > 0.5) {
          fx.label(env, "REVIEW", rvX, rvY + rvR + 16, { size: 9, col: C.amber, alpha: (chamber - 0.5) * 1.4, spacing: 3 });
        }
      }
    }
  });
})();
