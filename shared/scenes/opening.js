/* OPENING — arrival into an already-running world (approach, not reveal).
   THE first impression: trial execution after software finally caught up to
   the work. At p=0 the frame is dense, cinematic, alive — a charged execution
   CORE humming at centre, ringed by the whole governed ecosystem in controlled
   synchrony, layered by depth:
     · PROTOCOL geometry rotating with slow authority (plated ring set)
     · EVIDENCE fragments drifting through a faint trust boundary
     · SCREENING state dots pulsing green / amber / red (institutional, small)
     · REPLAY trace-arcs curving backward through memory
     · NODE signals burning close to the surface (bright near foreground)
     · CONSOLE terrain receding into distance (sparse dim field, lower edge)
     · LUNA purple provenance threads around the consequential movements
   Four faint AXES as SYSTEM STATES sit on a flattened ellipse around the core:
   PROTOCOL · EVIDENCE · SCREENING · REPLAY.
   As p rises the CAMERA MOVES FORWARD — core grows & charges, satellites
   organize/tighten inward, depth deepens, axes firm up; at p->1 the system
   hands toward PROTOCOL, the core poised to open.
   HOVER: magnetic — satellites near the cursor tighten & brighten.
   The core seat here IS the worldbg core that persists into every later scene. */
(function () {
  if (!window.Damaros) return;

  var AX = ["Protocol", "Evidence", "Screening", "Replay"];

  Damaros.registerScene("opening", {
    hud: null,

    /* ---- precompute the ecosystem once per (re)layout ---- */
    init: function (env) {
      var r = env.rng, i, n, mob = env.mobile;

      // PROTOCOL — a sparse plated-ring shell of conditional ticks orbiting
      // the core with slow authority. (radius is a fraction of core R)
      n = mob ? 7 : 13; var proto = [];
      for (i = 0; i < n; i++) {
        proto.push({ a: r() * 6.2832, rad: 1.42 + r() * 0.34, flat: 0.6 + r() * 0.06,
          lock: r() < 0.7, ph: r() * 6.2832, sp: 0.5 + r() * 0.6, ord: 0.05 + r() * 0.85 });
      }
      env.data.proto = proto;

      // EVIDENCE — artifacts of reality drifting laterally toward a trust
      // boundary on the right; once admitted they read as proof (white).
      n = mob ? 7 : 14; var evid = [];
      var kinds = ["bar", "tick", "cross", "ring", "dot"];
      for (i = 0; i < n; i++) {
        evid.push({ y: 0.16 + r() * 0.68, x0: 0.04 + r() * 0.34, drift: 0.5 + r() * 0.9,
          kind: kinds[(r() * kinds.length) | 0], s: 1.8 + r() * 2.0, ph: r() * 6.2832,
          admit: r() < 0.6, sp: 0.4 + r() * 0.7 });
      }
      env.data.evid = evid;

      // SCREENING — small institutional state dots on a tight inner band,
      // pulsing pass / review / exclude. Restrained, never a confetti cloud.
      n = mob ? 9 : 18; var scr = [];
      for (i = 0; i < n; i++) {
        var roll = r();
        var st = roll < 0.62 ? "pass" : (roll < 0.86 ? "review" : "fail");
        scr.push({ a: r() * 6.2832, rad: 1.02 + r() * 0.26, flat: 0.52 + r() * 0.08,
          state: st, ph: r() * 6.2832, sp: 0.7 + r() * 0.8 });
      }
      env.data.scr = scr;

      // REPLAY — trace arcs curving backward through memory (faint dashed).
      n = mob ? 3 : 6; var rep = [];
      for (i = 0; i < n; i++) {
        rep.push({ a: r() * 6.2832, far: 2.1 + r() * 1.3, segs: 4 + ((r() * 3) | 0),
          jit: 0.12 + r() * 0.2, ph: r() * 6.2832, sp: 0.4 + r() * 0.6, lo: r() < 0.4 });
      }
      env.data.rep = rep;

      // NODE — a few bright signals burning close to the surface, lower
      // foreground; these are the "clinics as nodes" reading near-camera.
      n = mob ? 3 : 5; var near = [];
      for (i = 0; i < n; i++) {
        near.push({ fx: 0.16 + r() * 0.68, fy: 0.66 + r() * 0.2, s: 2.6 + r() * 1.8,
          ph: r() * 6.2832, sp: 0.6 + r() * 0.7, link: r() < 0.7 });
      }
      env.data.near = near;

      // CONSOLE — sparse terrain receding into distance near the lower edge.
      n = mob ? 12 : 26; var term = [];
      for (i = 0; i < n; i++) {
        var z = r();                                  // depth: 0 far .. 1 near
        term.push({ fx: 0.05 + r() * 0.9, fy: 0.82 + r() * 0.16, z: z,
          state: r() < 0.16 ? "deep" : "idle", ph: r() * 6.2832,
          link: (i > 0 && r() < 0.5) ? ((r() * i) | 0) : -1 });
      }
      env.data.term = term;

      // LUNA — provenance threads anchored to consequential movements; faint
      // ultraviolet, drawn around the core (becomes dominant only in Luna).
      n = mob ? 3 : 5; var prov = [];
      for (i = 0; i < n; i++) {
        prov.push({ a: r() * 6.2832, far: 1.6 + r() * 0.9, segs: 3 + ((r() * 2) | 0),
          jit: 0.1 + r() * 0.16, ph: r() * 6.2832, sp: 0.5 + r() * 0.6 });
      }
      env.data.prov = prov;
    },

    draw: function (env) {
      var fx = env.fx, C = env.C, w = env.w, h = env.h, p = env.p, t = env.t;
      var ctx = env.ctx, d = env.data, mob = env.mobile;

      // core anchor — the persistent seat of light (matches worldbg / final).
      var cx = w * 0.5, cy = h * 0.46;
      var R = Math.min(w, h) * (0.205 + 0.055 * fx.easeInOut(p)); // camera dollies in

      // ===== PERSISTENT WORLD FIRST — the system is already running =====
      // worldbg paints its own faint core seat at (cx,cy); we then build the
      // full living ecosystem and our brighter orb on top of that same seat.
      fx.worldbg(env, {
        cx: cx, cy: cy,
        lift: 0.82 - 0.06 * p,                 // depth deepens as we move in
        tint: 0.12 + 0.05 * p,
        accent: C.deep,
        core: 0.18,                            // worldbg's own seat stays subtle
        coreR: 0.17,
        dust: mob ? 22 : 48,
        seed: 11
      });

      // guard: if init has not run yet, the saturated world is already drawn.
      if (!d || !d.proto) return;

      // ---- camera / state beats (all meaning driven by p) ----
      var approach = fx.easeInOut(p);                  // forward dolly
      var tighten  = fx.smooth(0.0, 0.85, p);          // satellites organize inward
      var firm     = 0.30 + 0.70 * fx.smooth(0.0, 0.68, p); // structure present at rest, firms on scroll
      var charge   = 0.6 + 0.4 * approach;             // already humming at rest, rises on approach
      var handoff  = fx.smooth(0.74, 1.0, p);          // hand toward PROTOCOL
      var veln     = env.veln || 0;                    // scrub-speed nuance
      var ptrOn    = env.ptr && env.ptr.has;

      // ===== layer order: far -> near (additive light composes by depth) =====

      // ---- CONSOLE terrain receding into the distance (lower edge) ----
      var term = d.term || [], ti;
      var termReveal = 0.55 + 0.45 * firm;
      for (ti = 0; ti < term.length; ti++) {
        var m = term[ti];
        if (ti / term.length > termReveal) continue;
        var tx = m.fx * w, ty = m.fy * h;
        // depth pull: nearer-in as the camera advances
        ty -= approach * (10 + m.z * 26);
        if (m.link >= 0 && term[m.link]) {
          var lk = term[m.link];
          fx.link(env, tx, ty, lk.fx * w, lk.fy * h - approach * (10 + lk.z * 26),
            C.deep, 0.10 * m.z * (0.6 + 0.4 * firm), 1, true);
        }
        var pulseT = 0.6 + 0.4 * Math.sin(t * 1.1 + m.ph);
        fx.node(env, tx, ty, 0.8 + m.z * 1.6, m.state,
          (0.18 + 0.4 * m.z) * pulseT * (0.5 + 0.5 * firm),
          m.state === "idle" ? 0.18 : m.z * 0.8);
      }

      // ---- REPLAY trace-arcs curving backward through memory (faint) ----
      var rep = d.rep || [], ri;
      for (ri = 0; ri < rep.length; ri++) {
        var rc = rep[ri];
        var reach = fx.lerp(rc.far, rc.far * 0.7, tighten);  // memory pulls inward
        var pts = [], sN = rc.segs, si;
        for (si = 0; si <= sN; si++) {
          var f = si / sN, rr = fx.lerp(1.12, reach, f);
          var aa = rc.a + t * 0.012 * rc.sp + Math.sin(f * 3.1 + rc.ph + t * 0.2) * rc.jit * (0.5 + 0.5 * (1 - tighten));
          pts.push({ x: cx + Math.cos(aa) * R * rr, y: cy + Math.sin(aa) * R * rr * 0.62 });
        }
        var col = rc.lo ? C.luna : C.deep;            // some replays carry provenance
        fx.trace(env, pts, col, (0.08 + 0.12 * firm) * (rc.lo ? 0.9 : 1), t * 12 + ri * 7);
      }

      // ---- LUNA provenance threads around consequential movements ----
      var prov = d.prov || [], pi;
      for (pi = 0; pi < prov.length; pi++) {
        var pv = prov[pi];
        var pReach = fx.lerp(pv.far, pv.far * 0.78, tighten);
        var ppts = [], pN = pv.segs, ps;
        for (ps = 0; ps <= pN; ps++) {
          var pf = ps / pN, pr = fx.lerp(1.06, pReach, pf);
          var pa = pv.a + t * 0.02 * pv.sp + Math.sin(pf * 2.7 + pv.ph) * pv.jit;
          ppts.push({ x: cx + Math.cos(pa) * R * pr, y: cy + Math.sin(pa) * R * pr * 0.62 });
        }
        fx.trace(env, ppts, C.luna, 0.07 + 0.11 * firm, -(t * 16 + pi * 9));
      }

      // ---- EVIDENCE fragments drifting through a faint trust boundary ----
      // boundary sits to the right of the core; admitted artifacts read white.
      var bx = cx + R * 1.62, by = cy - R * 0.95, bh = R * 1.9;
      fx.boundary(env, bx, by, 1, bh, 0.45 + 0.45 * firm, C.deep, 0.32 + 0.22 * firm);
      var evid = d.evid || [], ei;
      for (ei = 0; ei < evid.length; ei++) {
        var ev = evid[ei];
        // lateral drift toward the boundary; loops in ambient time.
        var phase = (t * 0.05 * ev.sp + ev.ph) % 1; if (phase < 0) phase += 1;
        var ex = (ev.x0 + ev.drift * phase) * w;
        var ey = ev.y * h;
        // pull the whole evidence field a touch inward as the camera advances
        ex = fx.lerp(ex, fx.lerp(ex, cx + R * 1.2, 0.18), tighten);
        var crossed = ex > bx;
        var col = (ev.admit && crossed) ? C.cold : (crossed ? C.dim : C.deep);
        var alpha = (crossed ? (ev.admit ? 0.6 : 0.3) : 0.34) * (0.45 + 0.55 * firm);
        // magnetic hover: nearby evidence tightens toward cursor + brightens
        if (ptrOn) {
          var pu = fx.pull(env, ex, ey, 9, 150);
          ex += pu.dx; ey += pu.dy; alpha += pu.prox * 0.25;
        }
        fx.fragment(env, ex, ey, ev.s, ev.kind, col, fx.clamp(alpha, 0, 1));
        if (ev.admit && crossed) fx.bloom(env, ex, ey, ev.s * 3.2, C.cold, 0.10 * firm);
      }

      // ---- PROTOCOL geometry: plated rings rotating with slow authority ----
      // two flattened plated ring-sets seat the sphere and read as governance.
      fx.ring(env, cx, cy, R * (1.5 - 0.12 * tighten), C.steel, 0.07 + 0.12 * firm,
        { flat: 0.34, w: 1.2, rot: t * 0.05, seg: 5, gap: 0.22 + 0.4 * handoff });
      fx.ring(env, cx, cy, R * (1.9 - 0.14 * tighten), C.deep, 0.05 + 0.09 * firm,
        { flat: 0.34, w: 1.0, rot: -t * 0.035, seg: 7, gap: 0.3 });
      // conditional ticks on the protocol shell — locked = structure, else drift
      var proto = d.proto || [], pri;
      for (pri = 0; pri < proto.length; pri++) {
        var pc = proto[pri];
        var prad = R * fx.lerp(pc.rad, pc.rad * 0.82, tighten);
        var pang = pc.a + t * 0.04 * pc.sp;
        var ppx = cx + Math.cos(pang) * prad;
        var ppy = cy + Math.sin(pang) * prad * pc.flat;
        // magnetic hover on the protocol shell
        var brite = 0;
        if (ptrOn) {
          var pp = fx.pull(env, ppx, ppy, 8, 160);
          ppx += pp.dx; ppy += pp.dy; brite = pp.prox;
        }
        var locked = pc.lock && firm > pc.ord;
        if (locked) {
          fx.node(env, ppx, ppy, 2.0 + brite * 1.2, "deep", (0.5 + 0.35 * firm) + brite * 0.3, 0.7 + brite * 0.5);
        } else {
          var jit = (1 - firm) * (pc.lock ? 0.5 : 1);
          var jx = ppx + Math.sin(t * 1.6 + pc.ph) * 1.1 * jit;
          var jy = ppy + Math.cos(t * 1.3 + pc.ph) * 1.1 * jit;
          fx.node(env, jx, jy, 1.7 + brite, "steel", (0.32 + 0.22 * Math.sin(t * 3 + pc.ph)) * (0.5 + 0.5 * firm) + brite * 0.3, 0.4 + brite * 0.4);
        }
      }

      // ---- SCREENING state dots: institutional pass / review / exclude ----
      var scr = d.scr || [], sci;
      for (sci = 0; sci < scr.length; sci++) {
        var sc = scr[sci];
        var srad = R * fx.lerp(sc.rad, sc.rad * 0.9, tighten);
        var sang = sc.a + t * 0.03 * sc.sp;
        var sxp = cx + Math.cos(sang) * srad;
        var syp = cy + Math.sin(sang) * srad * sc.flat;
        var sbr = 0;
        if (ptrOn) {
          var sp2 = fx.pull(env, sxp, syp, 7, 140);
          sxp += sp2.dx; syp += sp2.dy; sbr = sp2.prox;
        }
        var pulseS = 0.55 + 0.45 * Math.sin(t * 1.3 * sc.sp + sc.ph);
        fx.node(env, sxp, syp, 1.5 + sbr * 1.0, sc.state,
          (0.32 + 0.4 * firm) * pulseS + sbr * 0.3, 0.55 + sbr * 0.5);
      }

      // ===== THE EXECUTION CORE — signature volumetric orb, already humming =====
      // deep atmosphere it sits inside, then the orb; spread tightens slightly
      // as we move in; a sliver of extra charge on fast scrub for life.
      fx.bloom(env, cx, cy, R * (3.0 + 0.3 * Math.sin(t * 0.55)), C.deep, 0.10 + 0.06 * approach);
      fx.orb(env, cx, cy, R, {
        charge: fx.clamp(charge + veln * 0.12 + handoff * 0.06, 0, 1.3),
        spread: 1.16 - 0.14 * tighten,
        pitch: 0.5, yaw: t * 0.13, flat: 0.96
      });

      // ---- NODE signals burning close to the surface (lower foreground) ----
      // bright near nodes, drawn AFTER the core so they read as nearest camera.
      var near = d.near || [], ni;
      for (ni = 0; ni < near.length; ni++) {
        var nd = near[ni];
        var nx = nd.fx * w, ny = nd.fy * h;
        ny += approach * 14;                         // foreground rushes past as we move in
        var nbr = 0;
        if (ptrOn) {
          var np = fx.pull(env, nx, ny, 11, 180);
          nx += np.dx; ny += np.dy; nbr = np.prox;
        }
        // a faint provenance tether from the near node back toward the core
        if (nd.link) fx.link(env, nx, ny, cx, cy + R * 0.5, C.luna, (0.07 + 0.08 * firm) + nbr * 0.12, 1, true);
        var pulseN = 0.6 + 0.4 * Math.sin(t * 1.0 * nd.sp + nd.ph);
        fx.node(env, nx, ny, nd.s + nbr * 1.4, "signal",
          (0.45 + 0.3 * firm) * pulseN + nbr * 0.3, 1.0 + nbr * 0.5);
      }

      // ===== four AXES as SYSTEM STATES on a flattened ellipse =====
      // PROTOCOL · EVIDENCE · SCREENING · REPLAY — firm up as the camera moves
      // in; at handoff PROTOCOL lifts forward (the system poised to open there).
      var ringR = R * (2.12 - 0.14 * tighten);
      var axi;
      for (axi = 0; axi < 4; axi++) {
        var a = -Math.PI / 2 + axi * (Math.PI / 2) + t * 0.018;
        var isProto = axi === 0;
        var lead = isProto ? handoff : 0;            // PROTOCOL gets the hand-off
        var axr = ringR * (1 + 0.06 * lead);
        var axx = cx + Math.cos(a) * axr;
        var axy = cy + Math.sin(a) * axr * 0.36;
        var ix = cx + Math.cos(a) * R * 1.12, iy = cy + Math.sin(a) * R * 1.12 * 0.36;
        // connector from core out to the axis marker
        fx.link(env, ix, iy, axx, axy, isProto ? C.steel : C.deep,
          (0.16 + 0.12 * lead) * firm, 1, true);
        // axis marker — PROTOCOL warms toward white at hand-off
        var axState = isProto && handoff > 0.4 ? "cold" : "deep";
        fx.node(env, axx, axy, 2.0 + 1.2 * lead, axState, (0.55 + 0.25 * lead) * firm, 0.8 + 0.6 * lead);
        fx.label(env, AX[axi], axx, axy - 15,
          { size: mob ? 7.5 : 9.5, col: isProto && handoff > 0.4 ? C.cold : C.steel,
            alpha: (0.5 + 0.3 * lead) * firm, spacing: 2.6 });
      }

      // ---- hand-off flourish: as p->1, the core is poised to open ----
      if (handoff > 0.001) {
        // a tightening equatorial ring + a held breath of light at the seam.
        fx.ring(env, cx, cy, R * (1.22 - 0.04 * handoff), C.cold, 0.18 * handoff,
          { flat: 0.5, w: 1.4, rot: t * 0.16 });
        fx.bloom(env, cx, cy, R * 1.7, C.cold, 0.07 * handoff);
        // the faintest vertical seam previewing PROTOCOL's opening door.
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        var half = R * 0.5 * handoff;
        ctx.strokeStyle = fx.rgba(C.cold, 0.22 * handoff);
        ctx.lineWidth = 1.1;
        ctx.beginPath(); ctx.moveTo(cx, cy - half); ctx.lineTo(cx, cy + half); ctx.stroke();
        ctx.restore();
      }
    }
  });
})();
