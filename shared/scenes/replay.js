/* 04 REPLAY — a decision becomes memory. THE TRUST CLIMAX.
   One verified proof point waits alone in near-darkness (colour drained
   slightly vs the other chambers). Then it OPENS into RINGS OF LINEAGE — a
   memory RECONSTRUCTION, not a log. Concentric strata outward from the core:
     core      = the original governed DECISION (white proof)
     protocol  = the protocol version it ran under (blue structure)
     evidence  = the evidence traces admitted                (white proof)
     criterion = the resolved screening criterion states  (faint green/red)
     action    = the human action taken                       (amber lineage)
     authz     = the authorization that permitted it          (blue structure)
     context   = the execution context it ran in (outermost; blue structure)
   The camera moves THROUGH the rings in REVERSE then FORWARD — the decision
   reconstructs from either direction. A PURPLE provenance thread ties every
   ancestor back to the centre: every conclusion has ancestry. It ends fully
   reconstructed (and able to collapse to one proof and re-expand), exposing
   the need for the instrument (Trident) and the witness (Luna). Forensic.

   Signal in from SCREENING (an enclosed signal beside an amber review residue).
   Hover near the centre unfolds the chain outward; moving away collapses it
   toward the single proof object (fx.proximity to centre, vanishes on touch).
   Scroll velocity: slow scroll lets tiers settle crisply; faster scrub speeds
   the reconstruction (subtle). Caption sits bottom-LEFT → bias up/right. */
(function () {
  if (!window.Damaros) return;

  Damaros.registerScene("replay", {
    hud: "replay",

    init: function (env) {
      var r = env.rng, mob = env.mobile;

      // Strata of provenance, reconstructed core->outward as the camera recalls
      // the chain of cause. radius is a multiple of the core reference scale R.
      // ord = the tier's place in the sweep (0 = the decision, 1 = outermost
      // execution context). state/col carry meaning under the colour-as-state law.
      //   prov:true  => its ancestor traces are PURPLE (AI-origin / governance)
      //   kind:"criterion" => a tier whose nodes reconstruct resolved PASS/FAIL.
      var defs = [
        { key: "PROTOCOL",  rad: 1.78, n: mob ? 2 : 3, state: "deep",   col: "deep",  prov: true  },
        { key: "EVIDENCE",  rad: 2.52, n: mob ? 3 : 5, state: "cold",   col: "cold",  prov: true  },
        { key: "CRITERIA",  rad: 3.30, n: mob ? 3 : 5, state: "pass",   col: "luna",  prov: true,  kind: "criterion" },
        { key: "ACTION",    rad: 4.08, n: mob ? 1 : 2, state: "review", col: "amber", prov: false },
        { key: "AUTHORITY", rad: 4.90, n: mob ? 2 : 3, state: "deep",   col: "deep",  prov: true  },
        { key: "CONTEXT",   rad: 5.76, n: mob ? 2 : 4, state: "deep",   col: "deep",  prov: true  }
      ];

      var strata = [], li, si;
      for (li = 0; li < defs.length; li++) {
        var d = defs[li];
        d.ord = (li + 1) / defs.length;          // 0..1 sweep position (inner first)
        var base = r() * 6.2832, spread = 0.9 + r() * 0.5;
        var anc = [];
        for (si = 0; si < d.n; si++) {
          // distribute ancestors around the stratum, slightly irregular so it
          // reads as recalled structure, not a clock face.
          var frac = d.n > 1 ? (si / (d.n - 1) - 0.5) : 0;
          var a = base + frac * 6.2832 / d.n * spread * d.n + (r() - 0.5) * 0.4;
          anc.push({
            a: a,
            rj: 0.9 + r() * 0.2,         // per-node radial wobble
            ph: r() * 6.2832,            // ambient phase
            ord: si / Math.max(1, d.n),  // sub-order within the stratum
            mid: r() < 0.55 ? 0.4 + r() * 0.18 : 0, // optional waypoint (branch the tree)
            // for the criterion tier: which resolved screening state this ancestor
            // reconstructs to. Mostly PASS; a restrained few FAIL — faint, honest.
            res: r() < 0.78 ? "pass" : "fail"
          });
        }
        strata.push({ key: d.key, rad: d.rad, state: d.state, col: d.col,
                      prov: d.prov, kind: d.kind || "", ord: d.ord, anc: anc,
                      lab: base + (r() - 0.5) * 0.3 });
      }
      env.data.strata = strata;
      env.data.maxRad = defs[defs.length - 1].rad;

      // Unresolved residue motes around the lone signal at the very start —
      // the held question carried in from SCREENING's amber review threshold.
      var motes = [], mn = mob ? 4 : 7;
      for (si = 0; si < mn; si++) {
        motes.push({ a: r() * 6.2832, rad: 0.55 + r() * 0.8, ph: r() * 6.2832,
                     amber: r() < 0.4 });
      }
      env.data.motes = motes;
    },

    draw: function (env) {
      var fx = env.fx, C = env.C, w = env.w, h = env.h, p = env.p, t = env.t;
      var ctx = env.ctx, mob = env.mobile;

      var cx = w * (mob ? 0.5 : 0.55);          // bias right so the LEFT caption breathes
      var cy = h * (mob ? 0.47 : 0.46);
      var R = Math.min(w, h) * (mob ? 0.066 : 0.072);  // the lone signal's reference scale

      // THE PERSISTENT WORLD — drawn first. Colour DRAINS slightly here vs other
      // chambers (lower lift, fainter seat) so the proof reads as recovered from
      // near-darkness. Accent is PURPLE (provenance is the law of this chamber).
      fx.worldbg(env, { cx: cx, cy: cy, lift: 0.5, tint: 0.07,
                        accent: C.luna, core: 0.12, coreR: 0.14,
                        dust: mob ? 14 : 30, seed: 41 });

      var data = env.data;
      if (!data || !data.strata) { return; }
      var strata = data.strata, li, si;

      var breathe = 0.5 + 0.5 * Math.sin(t * 0.7);

      // ---- hover: nearness to the centre unfolds the chain outward ----------
      // (fx.proximity returns 0 on touch / reduced / off-canvas, so the hover
      //  contribution simply vanishes there — the scroll alone drives the scene.)
      var nearC = fx.proximity(env, cx, cy, Math.min(w, h) * 0.34);
      // smoothed hover energy persisted across frames for a weighted settle
      var hv = data.hover || 0; hv += (nearC - hv) * 0.12; data.hover = hv;

      // ---- the act of recall: a scan sweeps OUTWARD (reverse: pulling back
      //      through cause from the decision to its context), then a FORWARD
      //      consolidation sweep re-enters and LOCKS each tier into place.
      //      scroll velocity nudges the scan lead: faster scrub speeds it on
      //      slightly; slow scroll lets each tier settle crisply (env.veln).
      var open    = fx.smooth(0.13, 0.30, p);    // the lone signal first opens
      var reverse = fx.smooth(0.22, 0.55, p);    // outward recall sweep
      var forward = fx.smooth(0.50, 0.82, p);    // inward consolidation sweep
      var anchored = fx.smooth(0.82, 1.0, p);    // fully reconstructed
      var velLead = env.veln * 0.06;             // subtle scrub-speed lead

      // global recall depth (also fed by hover so hovering deepens the chain)
      var recall = fx.clamp(reverse * 0.7 + forward * 0.3 + hv * 0.18, 0, 1);

      // ambient end-state breath: once anchored it can collapse back toward a
      // single proof object and re-expand (slow, t-driven, never a bounce).
      var collapse = anchored * (0.5 + 0.5 * Math.sin(t * 0.5)) * 0.5;

      // atmospheric well behind the chain deepens as memory returns (purple)
      fx.halo(env, cx, cy, R * (4 + recall * 8), C.luna, 0.04 + 0.06 * recall);
      fx.halo(env, cx, cy, R * (2.6 + recall * 5), C.deep, 0.04 + 0.05 * recall);

      // ============================================================
      // STRATA — provenance reconstructed outward, each tied to centre.
      // Each tier's reveal is gated by the OUTWARD scan reaching its radius,
      // then firmed by the FORWARD scan locking it. Hover and the end-state
      // collapse modulate how far each tier stands from the core.
      // ============================================================

      // pass 1: stratum dial rings (behind the ancestor nodes/traces)
      for (li = 0; li < strata.length; li++) {
        var L = strata[li];
        // outward scan reaches this tier around its ord (+velocity lead)
        var reach = fx.smooth(L.ord - 0.34, L.ord + 0.04, reverse + velLead);
        // hover can pull tiers open even before the scan (climax interactivity)
        var rv = fx.clamp(reach + hv * (0.4 - L.ord * 0.25), 0, 1);
        if (rv <= 0.002) continue;
        // tiers ride slightly inward on the end-state collapse, then back out
        var radF = 1 - collapse * (0.2 + 0.5 * L.ord);
        var rr = R * L.rad * radF;
        var lock = fx.smooth(L.ord - 0.16, L.ord + 0.18, forward); // forward firms it
        var seg = mob ? 3 : 4 + li;
        var rot = t * 0.016 * (li % 2 ? -1 : 1) + li * 0.5;
        var colArr = C[L.col];
        // the dial settles from open segments into a near-closed governed ring
        fx.ring(env, cx, cy, rr, colArr, (0.05 + 0.12 * rv + 0.06 * lock) * (L.col === "amber" ? 1.1 : 0.9),
                { flat: 0.82, seg: seg, gap: 0.5 - lock * 0.42 + 0.05, rot: rot, w: 1 });
      }

      // pass 2: provenance traces from centre out to each ancestor, then the
      // ancestor nodes. PURPLE for governed/AI-origin tiers (most of them);
      // the lineage tree branches via optional waypoints.
      for (li = 0; li < strata.length; li++) {
        var S = strata[li];
        var reach2 = fx.smooth(S.ord - 0.34, S.ord + 0.04, reverse + velLead);
        var sv = fx.clamp(reach2 + hv * (0.4 - S.ord * 0.25), 0, 1);
        if (sv <= 0.002) continue;

        var radF2 = 1 - collapse * (0.2 + 0.5 * S.ord);
        var SR = R * S.rad * radF2, scol = C[S.col];
        // node resolves slightly after the outward line draws, then the forward
        // sweep locks it; slow scroll (low veln) sharpens the settle window.
        var lockS = fx.smooth(S.ord - 0.16, S.ord + 0.18, forward);
        var settle = fx.clamp(fx.smooth(S.ord - 0.28, S.ord + 0.06, reverse) * 0.6 + lockS * 0.5 + hv * 0.2, 0, 1);
        // the provenance trace colour: PURPLE where the tier is governed lineage
        var traceCol = S.prov ? C.luna : scol;

        // the AMBER human-ACTION threshold reads as a place, not an error
        if (S.col === "amber" && S.anc.length) {
          var ra = S.anc[0].a + t * 0.02;
          var rx = cx + Math.cos(ra) * SR, ry = cy + Math.sin(ra) * SR * 0.82;
          fx.reviewChamber(env, rx, ry, R * (0.62 + 0.1 * breathe), 0.45 * sv);
        }

        for (si = 0; si < S.anc.length; si++) {
          var a = S.anc[si];
          var ang = a.a + t * 0.018 * (li % 2 ? -1 : 1);
          var rad = SR * a.rj;
          var x = cx + Math.cos(ang) * rad;
          var y = cy + Math.sin(ang) * rad * 0.82;

          // witnessed provenance path: centre -> (optional waypoint) -> ancestor.
          // the far end grows with sv so lineage extends outward; the dash shifts
          // with t so it reads as a LIVE trace (the Luna idiom, prominent here).
          var grow = fx.easeOut(sv);
          var ex = cx + (x - cx) * grow, ey = cy + (y - cy) * grow;
          var pts;
          if (a.mid > 0) {
            var mx = cx + (x - cx) * a.mid, my = cy + (y - cy) * a.mid;
            // bend the waypoint off-axis so the lineage tree branches
            var offb = (si % 2 ? 1 : -1) * R * 0.5 * grow;
            mx += Math.cos(ang + 1.5707) * offb; my += Math.sin(ang + 1.5707) * offb * 0.82;
            if (grow > a.mid) pts = [{ x: cx, y: cy }, { x: mx, y: my }, { x: ex, y: ey }];
            else pts = [{ x: cx, y: cy }, { x: ex, y: ey }];
          } else {
            pts = [{ x: cx, y: cy }, { x: ex, y: ey }];
          }
          fx.trace(env, pts, traceCol, (0.2 + 0.32 * sv + 0.12 * lockS) * (S.prov ? 1 : 0.85), t * 9 + si * 4);

          // the ancestor: a jittering unresolved deep mote -> resolves to state.
          if (settle < 0.5) {
            var jit = (1 - settle * 2) * 1.2;
            var vx = ex + Math.sin(t * 1.8 + a.ph) * jit, vy = ey + Math.cos(t * 1.5 + a.ph) * jit;
            fx.node(env, vx, vy, 1.7, "luna", (0.28 + 0.24 * Math.sin(t * 1.4 + a.ph)) * sv, 0.4);
          } else {
            var rs = fx.smooth(0.5, 1, settle);
            // the criterion tier reconstructs RESOLVED screening states: mostly
            // green PASS, a restrained red FAIL — the only green/red in the scene.
            var nodeState = S.kind === "criterion" ? a.res : S.state;
            var hcol = nodeState === "fail" ? C.breach : (nodeState === "pass" ? C.ok : scol);
            fx.halo(env, ex, ey, R * (0.85 + 0.3 * breathe), hcol, 0.11 * rs * (S.col === "amber" ? 1.2 : 1));
            fx.node(env, ex, ey, 2.1, nodeState, (0.5 + 0.45 * rs) * sv, 0.9);
          }
        }

        // stratum label — restrained, fades in with the layer (skip alt on mobile)
        if (!mob || li % 2 === 0) {
          var lang = S.lab;
          var lx = cx + Math.cos(lang) * SR;
          var ly = cy + Math.sin(lang) * SR * 0.82;
          fx.label(env, S.key, lx, ly - R * 0.92, {
            size: mob ? 7 : 8.5,
            col: S.col === "amber" ? C.amber : (S.prov ? C.luna : C.steel),
            alpha: (0.14 + 0.32 * settle) * (S.col === "amber" ? 0.95 : 0.78),
            spacing: 2.4
          });
        }
      }

      // ============================================================
      // THE LONE PROOF — the consequence at the centre of its memory.
      // 0.00-0.25: a single verified white point, alone, with the unresolved
      // amber/dim residue carried in from SCREENING orbiting it.
      // ============================================================
      var motes = data.motes || [];
      var moteFade = 1 - fx.smooth(0.08, 0.28, p);
      if (moteFade > 0.01) {
        for (si = 0; si < motes.length; si++) {
          var mo = motes[si];
          var mr = R * (1.3 + mo.rad * 1.5);
          var mxx = cx + Math.cos(mo.a) * mr + Math.sin(t * 3 + mo.ph) * 2;
          var myy = cy + Math.sin(mo.a) * mr * 0.82 + Math.cos(t * 2.6 + mo.ph) * 2;
          var mflk = 0.5 + 0.5 * Math.sin(t * 2 + mo.ph);
          fx.fragment(env, mxx, myy, 3, si % 2 ? "tick" : "dot",
                      mo.amber ? C.amber : C.dim, (mo.amber ? 0.32 : 0.42) * moteFade * mflk);
        }
      }

      // the signal opens: a quiet expansion ring as recall begins
      if (open > 0.01 && open < 0.999) {
        fx.ring(env, cx, cy, R * (0.6 + open * 3.2), C.cold, 0.3 * (1 - open) * open * 4, { flat: 0.82, w: 1.2 });
      }

      // a quiet proof halo on the signal itself (whitens as it stands answerable)
      fx.halo(env, cx, cy, R * (1.5 + 0.18 * breathe + anchored * 0.55), C.cold,
              0.09 + 0.05 * breathe + 0.06 * anchored);

      // the central PROOF node: deep/uncertain when alone -> verified white once
      // its memory stands. It rides the end-state collapse-breath inward/out.
      var coreState = recall > 0.4 ? "cold" : "deep";
      var jitC = (1 - recall) * 1.0;
      var coreR = (2.5 + recall * 1.0 + 0.25 * breathe) * (1 + collapse * 0.35);
      var cxx = cx + Math.sin(t * 2.2) * jitC, cyy = cy + Math.cos(t * 1.9) * jitC;
      fx.node(env, cxx, cyy, coreR, coreState, 0.7 + 0.3 * recall, 1);

      // ============================================================
      // ANCHORED — the full event-with-memory stands assembled, and exposes
      // the NEED for the instrument (Trident) and the witness (Luna).
      // ============================================================
      if (anchored > 0) {
        var ap = anchored;
        // a confirming seal pulse expands once, affirming the anchor
        fx.ring(env, cx, cy, R * (0.5 + (1 - ap) * 2.4), C.cold, ap * 0.4, { flat: 0.82, w: 1.3 });

        // the outermost provenance boundary closes — the chain is answerable...
        var outR = R * data.maxRad;
        fx.ring(env, cx, cy, outR * 1.06, C.deep, 0.28 * ap, { flat: 0.82, w: 1.2 });

        // ...but answerable is not yet executed or witnessed. Two restrained
        // hand-offs open outward at the end-state:
        //  - a faint STEEL vector reaches right, toward where the instrument
        //    (TRIDENT) will act on the now-reconstructed field;
        if (!mob) {
          var hx0 = cx + outR * 1.06, hx1 = cx + outR * 1.4;
          var hy = cy + outR * 0.06 * Math.sin(t * 0.4);
          fx.link(env, hx0, hy, hx1, hy, C.steel, 0.22 * ap, 1, true);
          fx.fragment(env, hx1, hy, 4, "cross", C.steel, 0.4 * ap);
        }
        //  - the PURPLE provenance lattice brightens around the whole record,
        //    the witness (LUNA) the chamber now plainly requires.
        var witness = ap * (0.6 + 0.4 * breathe);
        fx.halo(env, cx, cy, outR * 1.1, C.luna, 0.05 * witness);
        for (li = 0; li < strata.length; li++) {
          var W = strata[li]; if (!W.prov) continue;
          var wa = W.anc[0]; if (!wa) continue;
          var wr = R * W.rad * (1 - collapse * (0.2 + 0.5 * W.ord));
          var wx = cx + Math.cos(wa.a + t * 0.018) * wr;
          var wy = cy + Math.sin(wa.a + t * 0.018) * wr * 0.82;
          // a thin witnessing link from each governed tier to the next inward —
          // the record interlinking into one answerable lattice (Luna's idiom).
          if (li > 0) {
            var Wp = strata[li - 1], wap = Wp.anc[0];
            if (wap) {
              var wpr = R * Wp.rad * (1 - collapse * (0.2 + 0.5 * Wp.ord));
              var wpx = cx + Math.cos(wap.a + t * 0.018) * wpr;
              var wpy = cy + Math.sin(wap.a + t * 0.018) * wpr * 0.82;
              fx.link(env, wx, wy, wpx, wpy, C.luna, 0.12 * witness, 0.9, true);
            }
          }
        }
      }
    }
  });
})();
