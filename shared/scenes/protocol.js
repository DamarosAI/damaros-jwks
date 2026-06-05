/* 01 PROTOCOL — authority becomes executable: language becomes law.
 *
 * A dense, opaque, SEALED institutional form hangs in the saturated world,
 * rotating with authority — its shell carrying abstract seams and scars (never
 * words). It OPENS like machinery: plates separate, rings calibrate, conditional
 * pathways divide out as suspended geometry. The pathways resolve — most LOCK
 * immediately to structure (green PASS); a few remain unresolved, vibrating at
 * the edge of interpretation (amber REVIEW). Finally the geometry ALIGNS into
 * one governed structure and a precise institutional SEAL closes (cold ring +
 * bloom + sealPulse). A MATERIAL PHASE CHANGE — inert obligation → operational
 * control. Opens FROM the hero's core; ends sealed & ready for Evidence below.
 *
 * GOLD-STANDARD reference for the volumetric / fx.core language. */
(function () {
  if (!window.Damaros) return;
  Damaros.registerScene("protocol", {
    hud: "protocol",

    /* Precompute the conditional pathways and the shell scars. Deterministic so
       lock/hold verdicts and scar placement are stable across frames + resize. */
    init: function (env) {
      var r = env.rng;

      // conditional pathways (clauses) that divide out of the opened machinery.
      // ~72% lock immediately to structure; the rest remain at the edge of
      // interpretation (amber). Each carries its own angle, reach, settle slot,
      // and resolution order so they don't all decide at once.
      var n = env.mobile ? 9 : 16, paths = [];
      for (var i = 0; i < n; i++) {
        var lock = r() < 0.72;
        paths.push({
          a: (i / n) * 6.2832 + r() * 0.18,   // emergence angle (roughly even, jittered)
          reach: 0.42 + r() * 0.6,             // how far out the clause hangs
          lock: lock,                          // resolves to structure (green) vs. holds (amber)
          ord: 0.04 + r() * 0.8,               // when in the resolve beat it decides
          ph: r() * 6.2832,                    // vibration / breathing phase
          settle: 0.95 + r() * 0.18,           // aligned radius slot at p=1 (on the governed ring)
          bend: (r() - 0.5) * 0.5,             // slight tangential bend of the divided path
          dot: r() < 0.5                       // mid-path articulation marker
        });
      }
      env.data.paths = paths;

      // calibration rings that spin up while the machinery is open.
      var rings = [], rn = env.mobile ? 3 : 5;
      for (var k = 0; k < rn; k++) {
        rings.push({
          rf: 1.16 + k * 0.2,                  // radius factor of base R
          flat: 0.30 + r() * 0.22,             // dial squash (seated in space)
          seg: 3 + (r() * 5 | 0),              // segments
          dir: r() < 0.5 ? -1 : 1,             // rotation sense
          sp: 0.10 + r() * 0.12,               // rotation speed
          ph: r() * 6.2832
        });
      }
      env.data.rings = rings;

      // shell scars / seams — abstract institutional markings on the sealed form.
      // Never words. A sparse vocabulary of bars / ticks / crosses around the mass.
      var kinds = ["bar", "tick", "cross", "dot"], sn = env.mobile ? 5 : 10, scars = [];
      for (var s = 0; s < sn; s++) {
        scars.push({
          a: r() * 6.2832,                     // position around the shell
          rr: 0.62 + r() * 0.32,               // radial seat on the shell
          kind: kinds[(r() * kinds.length) | 0],
          sz: 1.6 + r() * 2.0,
          ph: r() * 6.2832
        });
      }
      env.data.scars = scars;
    },

    draw: function (env) {
      var fx = env.fx, C = env.C, w = env.w, h = env.h, p = env.p, t = env.t;
      var cx = w * 0.5, cy = h * 0.5;

      // ----- the persistent, already-running world (saturated even at p=0) -----
      // The central seat is THE through-line: protocol opens FROM the hero's core,
      // so we keep that seat present and let our own form take it over.
      fx.worldbg(env, { cx: cx, cy: cy, lift: 0.84, tint: 0.12,
                        core: 0.30, coreR: 0.18, dust: env.mobile ? 30 : 60, seed: 21 });

      // guard: layout not yet computed
      if (!env.data || !env.data.paths) { return; }

      var R = Math.min(w, h) * 0.26;

      // ----- master beats (weighted, dampened; objects SETTLE) -----
      var sealed  = 1 - fx.smooth(0.06, 0.22, p);   // 1 = fully sealed authority (p≈0)
      var open    = fx.smooth(0.18, 0.55, p);       // machinery separates 0→1
      var emerge  = fx.smooth(0.24, 0.62, p);       // conditional pathways divide out
      var resolve = fx.smooth(0.55, 0.86, p);       // pathways lock / hold
      var align   = fx.smooth(0.80, 0.98, p);       // geometry aligns into one structure
      var sealing = fx.smooth(0.86, 1.00, p);       // the institutional seal closes
      // the machinery is "open" between the opening and the final re-seat:
      var aperture = open * (1 - align);            // 0 sealed → 1 wide open → 0 governed

      // overall yaw — slow, authoritative; eases as it locks into governance.
      var yaw = t * (0.13 - 0.07 * align);
      var pitch = 0.5;

      // ===== 1. THE SEALED FORM → THE OPENED MACHINERY =====
      // fx.core is the plated execution body (seams between plates). It opens as
      // aperture rises, then re-seats as the structure aligns. A tight fx.orb
      // lives at its heart — dense and opaque when sealed, expanding as it opens,
      // re-compacting (and brightening to governed white) as the seal closes.
      var sealPulse = sealing * (1 - sealing) * 4;  // 0→1→0 closing flash, peaks mid-seal

      fx.core(env, cx, cy, R * 1.04, aperture, {
        col: fx.mixc(C.steel, C.cold, 0.25 * align),
        layers: env.mobile ? 4 : 6,
        sealPulse: sealPulse * 0.9
      });

      // the heart: opaque sealed mass → opened energy → re-compacted governed core.
      var charge = 0.42 + 0.40 * sealed        // dense & opaque when sealed
                 + 0.30 * aperture             // energised while open
                 + 0.30 * sealing;             // brightens as it seals to governance
      fx.orb(env, cx, cy, R * (0.78 + 0.02 * Math.sin(t * 0.6)), {
        charge: fx.clamp(charge, 0, 1.35),
        spread: 1 + aperture * 0.55,           // opens outward, then re-compacts
        pitch: pitch, yaw: yaw, flat: 0.96,
        col: C.steel, hot: C.cold,
        n: env.mobile ? 90 : 200
      });

      // ===== 2. SHELL SCARS / SEAMS — institutional markings (never words) =====
      // Crisp & dense when sealed; they fade and disperse as the form opens, as if
      // the closed obligation is being read OUT and turned into live structure.
      var scars = env.data.scars;
      var scarA = sealed * 0.7 + 0.10;
      for (var s = 0; s < scars.length; s++) {
        var sc = scars[s];
        var sa = sc.a + yaw;                              // ride the rotation
        var srr = R * sc.rr * (1 + aperture * 0.5);       // drift outward as it opens
        var sx = cx + Math.cos(sa) * srr;
        var sy = cy + Math.sin(sa) * srr * 0.96;
        var twk = 0.7 + 0.3 * Math.sin(t * 1.3 + sc.ph);
        fx.fragment(env, sx, sy, sc.sz, sc.kind, C.steel, scarA * twk * (1 - aperture * 0.6));
      }

      // ===== 3. CALIBRATION RINGS — the machinery dials, spinning up while open =====
      var rings = env.data.rings;
      for (var k = 0; k < rings.length; k++) {
        var rg = rings[k];
        var rr2 = R * rg.rf * (1 + aperture * 0.30);
        var ra = (0.05 + 0.16 * aperture) * (0.7 + 0.3 * Math.sin(t * 0.8 + rg.ph));
        fx.ring(env, cx, cy, rr2, C.steel, ra, {
          flat: rg.flat, seg: rg.seg, gap: 0.14 + aperture * 0.4,
          rot: t * rg.sp * rg.dir + rg.ph, w: 1.2
        });
      }
      // one scanning equatorial dial that widens while the machinery is open
      fx.ring(env, cx, cy, R * (1.24 + aperture * 0.30), C.steel,
              0.08 + 0.14 * aperture, { flat: 0.46, w: 1.3, rot: -t * 0.16 });

      // ===== 4. CONDITIONAL PATHWAYS — clauses divide out, then LOCK or HOLD =====
      // Each clause hangs out on a divided path. Most lock immediately to structure
      // (green PASS). The rest vibrate, unresolved, at the edge of interpretation
      // (amber REVIEW). HOVER: nearby clauses tighten toward the cursor.
      var paths = env.data.paths;
      var holdCount = 0;
      for (var i = 0; i < paths.length; i++) {
        var c = paths[i];
        var a = c.a + yaw;

        // anchor on the body (where the clause divides from the core) →
        // hung position out on the suspended path, pulled IN as it aligns.
        var anchorR = R * 1.02;
        var ax = cx + Math.cos(a) * anchorR, ay = cy + Math.sin(a) * anchorR * 0.96;

        // open reach (suspended), aligned reach (seated on the governed ring)
        var openR = R * (1.46 + c.reach * 0.66);
        var alignR = R * c.settle * 1.34;
        var rad = fx.lerp(openR, alignR, align);

        // tangential bend of the divided path (straightens as it governs)
        var bend = c.bend * (1 - align);
        var bx = cx + Math.cos(a + bend) * rad;
        var by = cy + Math.sin(a + bend) * rad * 0.96;

        // magnetic hover — nearby geometry tightens toward the cursor, vanishing
        // cleanly when there is no fine pointer (fx.pull returns zero then).
        var pl = fx.pull(env, bx, by, 11, 150);
        bx += pl.dx; by += pl.dy;

        // the clause only exists once emergence has begun
        if (emerge < 0.01) continue;

        // verdict: locked clauses resolve as the resolve beat passes their order.
        var locked = c.lock && resolve > c.ord;
        // amber holds may settle to PASS very late as the structure aligns — but
        // a residue of genuine ambiguity is allowed to persist (honoured, not faked).
        var settledLate = !c.lock && align > 0.5 && c.ord < 0.32;

        // the divided path from body → clause (additive; brightens on resolution)
        var pathState = locked ? C.ok : (settledLate ? C.ok : C.deep);
        var pathA = emerge * (0.16 + 0.20 * (locked || settledLate ? 1 : 0)) * (0.7 + 0.3 * pl.prox);
        fx.link(env, ax, ay, bx, by, pathState, pathA, locked ? 1.3 : 1, true);

        // mid-path articulation marker (a clause has internal structure)
        if (c.dot) {
          var mx = fx.lerp(ax, bx, 0.5), my = fx.lerp(ay, by, 0.5);
          fx.fragment(env, mx, my, 1.4, "dot", pathState, pathA * 1.2);
        }

        if (locked || settledLate) {
          // RESOLVED → structure. A brief lock-snap halo at the moment it sets.
          var setT = locked ? fx.smooth(c.ord, c.ord + 0.16, resolve)
                            : fx.smooth(0.5, 0.74, align);
          if (setT > 0.02 && setT < 0.6) {
            fx.halo(env, bx, by, 10 * (1 - setT * 1.4) + 5, C.ok, 0.20 * (1 - setT * 1.4 + 0.0001));
          }
          var nodeA = (0.55 + 0.4 * setT) * emerge;
          fx.node(env, bx, by, 2.6 + pl.prox * 0.8, "pass", nodeA, 1.0 + 0.2 * setT);
        } else {
          // UNRESOLVED → vibrating at the edge of interpretation (amber REVIEW).
          holdCount++;
          var jit = (0.5 + 0.5 * (1 - resolve)) * (0.78 + 0.32 * Math.sin(t * 1.7 + c.ph));
          var vx = bx + Math.sin(t * 1.9 + c.ph) * 1.4 * jit;
          var vy = by + Math.cos(t * 1.6 + c.ph) * 1.4 * jit;
          var hold = 0.5 + 0.5 * Math.sin(t * 1.5 + c.ph);
          fx.node(env, vx, vy, 2.3 + pl.prox * 0.7, "review",
                  (0.40 + 0.30 * hold) * emerge, 0.55 + 0.25 * pl.prox);
          // a faint review threshold around the most active holds (a place, not error)
          if (pl.prox > 0.2 || hold > 0.85) {
            fx.halo(env, vx, vy, 12 + 4 * hold, C.amber, 0.06 * emerge);
          }
        }
      }

      // ===== 5. FAINT PURPLE PROVENANCE — every consequential move leaves a trace =====
      // A thin governance thread orbiting the seat: AI-origin authority, witnessed.
      var provA = (0.10 + 0.10 * aperture + 0.10 * sealing);
      var pr = R * (1.10 + aperture * 0.18);
      var pa = t * 0.07;
      fx.ring(env, cx, cy, pr, C.luna, provA, { flat: 0.42, seg: 5, gap: 0.9, rot: pa, w: 1.1 });
      // a couple of provenance witnesses riding that thread
      var pwN = env.mobile ? 2 : 3;
      for (var pw = 0; pw < pwN; pw++) {
        var pwa = pa * 1.4 + pw * (6.2832 / pwN);
        var pwx = cx + Math.cos(pwa) * pr, pwy = cy + Math.sin(pwa) * pr * 0.42;
        fx.node(env, pwx, pwy, 1.5, "luna", provA * 1.4, 0.5);
      }

      // ===== 6. THE GOVERNED STRUCTURE ALIGNS + THE INSTITUTIONAL SEAL CLOSES =====
      // As the clauses seat onto one ring, a precise cold dial draws itself; then a
      // bright seal contracts and flashes shut — protocol can now govern work.
      if (align > 0.01) {
        // the governed ring the locked clauses have aligned onto
        fx.ring(env, cx, cy, R * 1.34, C.cold, 0.16 * align,
                { flat: 0.96, seg: env.mobile ? 12 : 20, gap: 0.10, rot: yaw * 0.4, w: 1.2 });
        // a tightening inner alignment dial
        fx.ring(env, cx, cy, R * (1.18 - 0.04 * align), C.steel, 0.12 * align,
                { flat: 0.96, w: 1.0, rot: -yaw * 0.6 });
      }

      if (sealing > 0.01) {
        // the seal: a cold ring contracting toward the seat + a clean bloom.
        var sealR = R * (1.30 - 0.46 * sealing);
        fx.ring(env, cx, cy, sealR, C.cold, (0.30 + 0.40 * sealPulse) * sealing,
                { flat: 0.96, w: 1.6 + sealPulse });
        fx.bloom(env, cx, cy, R * (1.9 - 0.5 * sealing), C.cold, 0.10 * sealing + 0.14 * sealPulse);
        // a hairline closure flash at the exact instant of sealing
        if (sealPulse > 0.4) {
          fx.ring(env, cx, cy, R * (0.40 + (1 - sealPulse) * 0.6), C.cold, sealPulse * 0.5,
                  { flat: 0.96, w: 1.4 });
        }
      }

      // ===== 7. HAND-OFF TO EVIDENCE — the sealed seat is ready for descent below =====
      // At the end, lay a soft downward seat-light: Evidence will descend into the
      // colder chamber beneath this governed core (continuity, never a hard cut).
      if (p > 0.9) {
        var hand = fx.smooth(0.9, 1.0, p);
        fx.bloom(env, cx, cy + R * 1.6, R * 1.4, C.deep, 0.07 * hand);
        fx.bloom(env, cx, cy, R * 0.7, C.cold, 0.06 * hand);
      }
    }
  });
})();
