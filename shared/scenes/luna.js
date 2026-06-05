/* 06 LUNA — the witness. Luna is never introduced; it is DISCOVERED.
   The field that was present the ENTIRE time. At first the scene is only
   atmosphere: faint purple seams of light around boundaries, almost nothing.
   As the camera advances the viewer realises every point has carried a thin
   provenance trace back to its origin THE WHOLE TIME; nearest-neighbour
   CUSTODY chains link up; a looser proximity mesh fills in — a pervasive
   witnessing field that envelops everything (Protocol/Evidence/Screening/
   Replay drifting underneath as faint ghosts). It resolves into a calm,
   complete, ANSWERABLE governance field. Luna does NOT do the work — it
   makes the work answerable. Every action has origin; every assisted
   movement provenance; every boundary crossing memory; every handoff
   preserved and accountable. Deep governance ultraviolet — quiet, rare,
   authoritative. The most restrained scene. KEEP & UPGRADE: the existing
   depth-scattered points + custody lattice + looser mesh + staggered
   settling; switch the world to worldbg(accent:C.luna); recolour the field
   to purple (amber only for protected boundary handoffs); add the cursor
   provenance-trail (movement near the field leaves soft purple trails that
   fade into audit marks; origin signatures flicker at edges). */
(function () {
  if (!window.Damaros) return;

  // faint ghost motifs of the forces this field has been witnessing all along
  var GHOSTS = ["PROTOCOL", "EVIDENCE", "SCREENING", "REPLAY"];

  Damaros.registerScene("luna", {
    hud: "luna",

    init: function (env) {
      var r = env.rng, w = env.w, h = env.h;
      var n = env.mobile ? 16 : 30;
      var cx = w * 0.46, cy = h * 0.5;            // sit left of the right-side caption
      var spread = Math.min(w, h);
      var pts = [];
      for (var i = 0; i < n; i++) {
        // depth-biased radial scatter: a field receding into the dark
        var ang = r() * 6.2832;
        var rad = (0.10 + Math.pow(r(), 0.7) * 0.95) * spread * 0.52;
        var z = 0.25 + r() * 0.75;                // 0 far → 1 near
        var x = cx + Math.cos(ang) * rad;
        var y = cy + Math.sin(ang) * rad * 0.84;  // gentle vertical squash → ground plane
        // every point already left provenance: a short tail back toward its origin
        var oa = ang + (r() - 0.5) * 1.5;
        var ol = spread * (0.05 + r() * 0.10);
        pts.push({
          x: x, y: y, z: z,
          ox: x - Math.cos(oa) * ol, oy: y - Math.sin(oa) * ol * 0.84,
          // a few of these were boundary crossings — handoffs that stayed protected
          bound: r() < 0.26,
          ph: r() * 6.2832,
          ord: r(),                               // reveal order for the lattice settling
          sig: r() < 0.34,                        // carries a tiny flickering origin signature
          sigph: r() * 6.2832,
          link: -1, ld: 0
        });
      }
      // precompute the provenance lattice once: each point witnesses its
      // nearest neighbour (the chain of custody) — O(n^2) only here, never per frame.
      for (var a = 0; a < pts.length; a++) {
        var best = -1, bd = 1e9;
        for (var b = 0; b < pts.length; b++) {
          if (b === a) continue;
          var dx = pts[a].x - pts[b].x, dy = pts[a].y - pts[b].y;
          var d = dx * dx + dy * dy;
          if (d < bd) { bd = d; best = b; }
        }
        pts[a].link = best;
        pts[a].ld = Math.sqrt(bd);
      }
      // a second, looser tier of links (proximity mesh) for the enveloping field
      var maxL = spread * 0.30, meshCap = env.mobile ? 22 : 46, mesh = [];
      for (var c = 0; c < pts.length && mesh.length < meshCap; c++) {
        for (var e = c + 1; e < pts.length && mesh.length < meshCap; e++) {
          var mdx = pts[c].x - pts[e].x, mdy = pts[c].y - pts[e].y;
          var md = Math.sqrt(mdx * mdx + mdy * mdy);
          if (md < maxL && md > pts[c].ld * 1.05) {
            mesh.push({ a: c, b: e, d: md, ord: env.rng() });
          }
        }
      }

      // faint ghost motifs underneath the field — the four forces this witness
      // has been recording all along. Placed as quiet rings around the seat.
      var ghosts = [];
      for (var gI = 0; gI < GHOSTS.length; gI++) {
        var ga = -1.05 + gI * (6.2832 / GHOSTS.length);
        ghosts.push({
          key: GHOSTS[gI],
          a: ga,
          rad: spread * (0.30 + (gI % 2) * 0.07),
          ph: env.rng() * 6.2832,
          ord: gI / GHOSTS.length
        });
      }

      env.data.pts = pts;
      env.data.mesh = mesh;
      env.data.ghosts = ghosts;
      env.data.cx = cx; env.data.cy = cy; env.data.spread = spread;
      // smoothed cursor + a persistent ring-buffer of audit marks (the trail
      // the witness records as the pointer moves through the field).
      env.data.sx = cx; env.data.sy = cy;
      env.data.trail = [];
      env.data.tHead = 0;
    },

    draw: function (env) {
      var fx = env.fx, C = env.C, w = env.w, h = env.h, p = env.p, t = env.t;
      var d = env.data;
      if (!d || !d.pts) { fx.worldbg(env, { accent: C.luna, core: 0.16 }); return; }
      var cx = d.cx, cy = d.cy, spread = d.spread, pts = d.pts, mesh = d.mesh, ghosts = d.ghosts;
      var ctx = env.ctx;

      // ---- transformation phases (all from p, eased) -------------------
      // 0.00-0.30 barely-there atmosphere (faint purple points & seams)
      // 0.30-0.85 traces revealed (always there) + custody chains link + mesh fills → pervasive witnessing field
      // 0.85-1.00 calm, complete, answerable governance field
      var presence   = fx.smooth(0.00, 0.30, p);  // points emerge from near-nothing
      var provenance = fx.smooth(0.26, 0.62, p);  // each point's origin-tail is revealed
      var weave      = fx.smooth(0.40, 0.82, p);  // nearest-neighbour custody chains link up
      var envelop    = fx.smooth(0.58, 0.92, p);  // the looser mesh fills in → pervasive field
      var complete   = fx.smooth(0.82, 1.00, p);  // calm, answerable governance field
      var breath     = 0.5 + 0.5 * Math.sin(t * 0.5);

      // ---- the persistent governed world, cast in ultraviolet ----------
      // worldbg first: the seat of light is the through-line that envelops
      // EVERY scene; here it quietly shifts into governance purple. At p=0
      // the core is barely there (this scene almost withholds itself); it
      // firms as the record becomes undeniable.
      fx.worldbg(env, {
        cx: cx, cy: cy,
        accent: C.luna,
        lift: 0.46 + 0.12 * complete,
        tint: 0.05 + 0.05 * envelop,
        core: 0.07 + 0.16 * presence + 0.08 * complete,
        coreR: 0.17,
        dust: env.mobile ? 14 : 28,
        seed: 71
      });

      // ---- the witnessing field: an immense, almost-subliminal purple halo
      //      that only resolves as the record becomes undeniable ----------
      var fieldR = spread * (0.50 + complete * 0.16);
      fx.halo(env, cx, cy, fieldR, C.luna, (0.012 + envelop * 0.05 + complete * 0.055) * (0.85 + 0.15 * breath));
      if (complete > 0) fx.halo(env, cx, cy, spread * 0.30, C.luna, 0.045 * complete);

      // ---- ghost motifs: the forces this field has witnessed all along ---
      //      faint underneath, surfacing only as the field grows pervasive.
      var ghostF = fx.smooth(0.46, 0.86, p) * (1 - complete * 0.25);
      if (ghostF > 0.01) {
        for (var gi = 0; gi < ghosts.length; gi++) {
          var gh = ghosts[gi];
          var gv = fx.clamp(ghostF - gh.ord * 0.18, 0, 1);
          if (gv < 0.02) continue;
          var gx = cx + Math.cos(gh.a + t * 0.012) * gh.rad;
          var gy = cy + Math.sin(gh.a + t * 0.012) * gh.rad * 0.84;
          var gpuls = 0.55 + 0.45 * Math.sin(t * 0.5 + gh.ph);
          // a quiet purple ring + a barely-legible name — a remembered force
          fx.ring(env, gx, gy, spread * 0.05 * (0.8 + 0.2 * gpuls), C.luna,
                  0.05 * gv * (0.6 + 0.4 * gpuls), { flat: 0.84, seg: 3, gap: 0.7, rot: t * 0.05, w: 1 });
          if (!env.mobile) {
            fx.label(env, gh.key, gx, gy + spread * 0.05 + 10, {
              size: 7, col: C.luna, alpha: 0.10 * gv * gpuls, spacing: 3
            });
          }
        }
      }

      // ============================================================
      // CURSOR PROVENANCE-TRAIL — the witness records movement.
      // The pointer leaves a soft purple trail that decays into audit
      // marks; movement energy (env.ptr.mag) drives how vivid it is.
      // Vanishes cleanly when there is no fine pointer.
      // ============================================================
      var ptr = env.ptr;
      var trail = d.trail;
      if (ptr && ptr.has) {
        // smooth the recorded cursor (weighted follow → no jitter)
        d.sx += (ptr.x - d.sx) * 0.28;
        d.sy += (ptr.y - d.sy) * 0.28;
        // deposit an audit mark when the cursor has travelled enough
        var last = trail.length ? trail[trail.length - 1] : null;
        var moved = last ? (Math.abs(d.sx - last.x) + Math.abs(d.sy - last.y)) : 999;
        if (moved > 7) {
          trail.push({ x: d.sx, y: d.sy, life: 1, born: t, mark: ptr.mag > 0.18 });
          if (trail.length > 26) trail.shift();
        }
      }
      // decay every mark (trail persists & fades even after the pointer leaves)
      if (trail.length) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        for (var ti = trail.length - 1; ti >= 0; ti--) {
          var tm = trail[ti];
          tm.life -= 0.018;
          if (tm.life <= 0) { trail.splice(ti, 1); continue; }
          var seg = ti > 0 ? trail[ti - 1] : null;
          var la = tm.life * tm.life;
          // soft purple trail segment
          if (seg) {
            ctx.strokeStyle = fx.rgba(C.luna, 0.16 * la);
            ctx.lineWidth = 1 + 1.6 * la;
            ctx.beginPath(); ctx.moveTo(seg.x, seg.y); ctx.lineTo(tm.x, tm.y); ctx.stroke();
          }
          // the mark itself blooms, then resolves into a tiny audit tick
          fx.bloom(env, tm.x, tm.y, 5 + 5 * la, C.luna, 0.10 * la);
          if (tm.life < 0.55 && tm.mark) {
            // late in life it crystallises into a recorded audit mark (steel tick)
            ctx.globalCompositeOperation = "source-over";
            fx.fragment(env, tm.x, tm.y, 2.2, "tick", C.luna, 0.4 * (0.55 - tm.life) / 0.55);
            ctx.globalCompositeOperation = "lighter";
          }
        }
        ctx.restore();
      }

      // ---- provenance traces: the tail each point left behind ----------
      // present in spirit from the start, but only legible as provenance rises.
      for (var i = 0; i < pts.length; i++) {
        var pt = pts[i];
        var pa = presence * (0.45 + 0.55 * pt.z);
        if (pa < 0.02) continue;
        var shift = t * (6 + pt.z * 10) + pt.ph * 7;
        // the origin-trace — a dashed witnessed path back to where it came from.
        // ordinary movements record in purple; protected handoffs keep an amber seam.
        if (provenance > 0.01) {
          var ta = provenance * (0.16 + 0.24 * pt.z);
          fx.trace(env, [{ x: pt.ox, y: pt.oy }, { x: pt.x, y: pt.y }],
                   pt.bound ? C.amber : C.luna, ta, shift);
        }
      }

      // ---- custody chains: nearest-neighbour links resolve in order ----
      for (var k = 0; k < pts.length; k++) {
        var s = pts[k]; var lk = s.link;
        if (lk < 0) continue;
        var o = pts[lk];
        var gate = fx.smooth(s.ord - 0.18, s.ord + 0.32, weave); // staggered settling
        if (gate < 0.01) continue;
        var depth = (s.z + o.z) * 0.5;
        var la2 = gate * (0.12 + 0.22 * depth);
        // custody = governance lineage → purple, faintly additive so it reads as light
        fx.link(env, s.x, s.y, o.x, o.y, C.luna, la2, depth > 0.7 ? 1.1 : 0.8, true);
      }

      // ---- enveloping mesh: the field becomes pervasive ----------------
      for (var m = 0; m < mesh.length; m++) {
        var ms = mesh[m];
        var ea = envelop - ms.ord * 0.5;
        if (ea < 0.02) continue;
        var A = pts[ms.a], B = pts[ms.b];
        // fade longer links so the weave stays atmospheric, never a net diagram
        var lenF = 1 - fx.clamp(ms.d / (spread * 0.30), 0, 1);
        fx.link(env, A.x, A.y, B.x, B.y, C.luna, fx.clamp(ea, 0, 1) * 0.075 * (0.4 + lenF), 0.7, true);
      }

      // ---- the points themselves: movements that were always witnessed -
      for (var j = 0; j < pts.length; j++) {
        var q = pts[j];
        var ap = presence * (0.40 + 0.60 * q.z);
        if (ap < 0.02) continue;
        var puls = 0.6 + 0.4 * Math.sin(t * (0.7 + q.z * 0.6) + q.ph);

        // HOVER: a provenance halo appears behind points near the cursor —
        // the witness "looks" where you look. Vanishes when no fine pointer.
        var prox = fx.proximity(env, q.x, q.y, 150);
        if (prox > 0.01) {
          fx.halo(env, q.x, q.y, 12 + q.z * 14, C.luna, 0.18 * prox * (0.6 + 0.4 * puls));
        }

        if (q.bound) {
          // a former boundary crossing — a handoff that stayed protected.
          // a restrained amber seam resolves around it as memory brightens.
          var seam = provenance * (0.10 + 0.16 * q.z) * puls;
          if (seam > 0.015) fx.halo(env, q.x, q.y, 9 + q.z * 9, C.amber, seam + 0.14 * prox);
          var ba = ap * (0.32 + 0.4 * provenance);
          fx.node(env, q.x, q.y, 1.4 + q.z * 1.4, "review", ba + 0.2 * prox, q.z * (0.3 + 0.5 * provenance) + 0.3 * prox);
        } else {
          // an ordinary movement — origin recorded in governance purple.
          var seamS = (0.05 + 0.12 * weave) * presence * puls;
          if (seamS > 0.02) fx.halo(env, q.x, q.y, 7 + q.z * 8, C.luna, seamS);
          var na = ap * (0.34 + 0.46 * weave);
          fx.node(env, q.x, q.y, 1.2 + q.z * 1.5, "luna", na * (0.75 + 0.4 * prox), q.z * 0.5 * weave + 0.3 * prox);
        }

        // tiny origin signature flickering at the edge of some points — proof
        // that the movement has a recorded source. Restrained, rare, late.
        if (q.sig && !env.mobile && provenance > 0.2) {
          var sf = provenance * (0.16 + 0.2 * Math.sin(t * 1.7 + q.sigph));
          if (sf > 0.05) {
            fx.label(env, q.bound ? "HANDOFF" : "ORIGIN", q.x + 12 + q.z * 4, q.y - 8,
              { size: 6.5, col: q.bound ? C.amber : C.luna, alpha: fx.clamp(sf, 0, 0.5), align: "left", spacing: 2 });
          }
        }
      }

      // ---- completion: the field is calm, whole and answerable ---------
      if (complete > 0) {
        // a single, quiet confirming ring — the record closed around everything
        fx.ring(env, cx, cy, spread * (0.40 + 0.02 * breath), C.luna,
                0.14 * complete, { flat: 0.84, w: 1 });
        fx.ring(env, cx, cy, spread * 0.40 * 0.62, C.luna,
                0.08 * complete, { flat: 0.84, w: 1 });
        // the witness itself — a faint held centre, never a beacon
        fx.halo(env, cx, cy, spread * 0.07, C.luna, 0.07 * complete * (0.7 + 0.3 * breath));
        fx.halo(env, cx, cy, spread * 0.03, C.cold, 0.04 * complete * (0.7 + 0.3 * breath));
      }
    }
  });
})();
