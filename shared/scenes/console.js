/* 08 CONSOLE — a network becomes command. ONE node becomes MANY.
   The camera RISES out of the single Node into scale: the local cockpit
   expands into a distributed COMMAND TERRAIN — a living field of governed
   site points receding into distance, NOT a map / surveillance grid /
   analytics dashboard. Every point carries STATE: green ready, amber
   review-burden rising, red blocked, blue-white active signal, purple
   governed-action recorded, dim silent.

   The argument is governed VISIBILITY, not exposure: the sponsor does NOT
   see everything — many points stay silent/dim, and there is no
   patient-level detail anywhere. The verb is a transformation you can
   watch: a protocol amendment sends a RIPPLE across the field that
   re-states points as it passes; evidence gaps gather into amber
   CLUSTERS; a blocked site dims to red; a ready site brightens green; a
   verified signal travels UPWARD into Console visibility on a rising
   provenance trace; finally the command field ALIGNS into one coherent,
   still-alive field of view. See the trial while it is still alive.

   Continuity: scales UP from Node (the same execution field, now at
   network scale) and hands off to the resolved whole-system FINAL frame.
   Matches the gold standard: belief before caption, every motion a state
   change, restraint over spectacle. */
(function () {
  if (!window.Damaros) return;

  Damaros.registerScene("console", {
    hud: "console",

    init: function (env) {
      var r = env.rng, w = env.w, h = env.h, mobile = env.mobile;

      // Origin: the single Node we rise out of — low, biased right (caption
      // lives lower-LEFT). The terrain recedes UP toward a high vanishing
      // point as the camera climbs into scale.
      var ox = w * (mobile ? 0.54 : 0.6);
      var oy = h * 0.92;
      var vpx = w * (mobile ? 0.5 : 0.54);   // vanishing point (governed distance)
      var vpy = h * 0.18;
      env.data.origin = { x: ox, y: oy };
      env.data.vp = { x: vpx, y: vpy };

      var n = mobile ? 26 : 58;
      env.data.n = n;
      var arr = [];

      // Compose deterministic "feature" seats so the field reads authored at
      // p=1, not random: exactly ONE blocked site (red), a couple of READY
      // sites that brighten green, and a couple of evidence-gap CLUSTER
      // centres that gather amber review-burden.
      var blockIx = Math.floor(n * (0.30 + r() * 0.16));     // mid-depth, never closest
      var readyA  = Math.floor(n * (0.52 + r() * 0.10));
      var readyB  = Math.floor(n * (0.70 + r() * 0.12));
      var nClust  = mobile ? 2 : 3;
      var clusters = [];

      for (var i = 0; i < n; i++) {
        // z: 1 = near (the Node we rise from), 0 = far (vanishing point).
        // Bias the count toward the distance so the field genuinely recedes.
        var u = i / (n - 1);
        var z = 1 - Math.pow(u, 0.76);                       // many far, few near
        z = fx_clamp(z + (r() - 0.5) * 0.06, 0.02, 1);

        // Perspective placement: lateral spread widens toward the camera,
        // narrows to the vanishing point. Jitter keeps it a living field,
        // never a grid / dashboard.
        var spread = (mobile ? 0.38 : 0.5);
        var lateral = (r() - 0.5) * 2;                       // -1..1
        var lx = lateral * spread * (0.16 + z * 0.94);       // far things converge
        var x = fx_lerp(vpx, ox, z) + lx * w;
        var rowJ = (r() - 0.5) * h * 0.05 * z;
        var y = fx_lerp(vpy, oy, z) + rowJ;

        // BASE state (pre-ripple) — governed visibility, NOT exposure.
        // Default: silent/unknown (the majority — the sponsor cannot see
        // everything). A minority are governed-visible structure / signal.
        var base = "deep";
        var silent = true;
        var rr = r();
        if (rr < 0.20) { base = "deep"; silent = false; }    // visible structure
        else if (rr < 0.30) { base = "cold"; silent = false; } // active signal (blue-white)
        else if (rr < 0.40) { base = "luna"; silent = false; } // governed-action recorded
        // else: stays silent "deep" / low alpha.

        arr.push({
          x: x, y: y, z: z,
          base: base, silent: silent,
          ph: r() * 6.2832,
          // angle of this point around the field centre — the amendment
          // RIPPLE sweeps as a radial wave from the origin and re-states
          // points by their distance from origin (precomputed below).
          rd: 0,                  // ripple distance (normalised), filled below
          // does this point's link carry a traveling pressure pulse?
          live: rr < 0.16,
          flow: r(),              // phase offset for the traveling pulse
          link: -1,               // deeper neighbour (assigned 2nd pass)
          clu: -1,                // cluster membership (assigned below)
          wake: 0                 // reveal order (filled below)
        });
      }

      // Ripple distance: normalised radial distance of each point from the
      // origin, so the amendment wave can re-state points front-to-far.
      var maxRD = 1;
      for (var d0 = 0; d0 < n; d0++) {
        var nd = arr[d0];
        var ddx = nd.x - ox, ddy = nd.y - oy;
        nd.rd = Math.sqrt(ddx * ddx + ddy * ddy);
        if (nd.rd > maxRD) maxRD = nd.rd;
      }
      for (var d1 = 0; d1 < n; d1++) {
        arr[d1].rd /= maxRD;                                  // 0 (at origin) .. 1 (far)
        // wake order tracks the rising camera: near/lower wakes first.
        arr[d1].wake = fx_clamp((1 - arr[d1].z) * 0.8 + env.rng() * 0.2, 0, 1);
      }

      // Evidence-gap CLUSTERS: pick deeper-ish seats; nearby points become
      // amber review-burden as pressure arrives. A cluster is a PLACE of
      // friction, not an error — related nodes that light pressure LINES on
      // hover. Choose centres, then tag members by proximity.
      for (var cI = 0; cI < nClust; cI++) {
        var seed = arr[Math.floor(n * (0.34 + cI * 0.2 + r() * 0.12)) % n];
        clusters.push({ x: seed.x, y: seed.y, z: seed.z, members: [],
                        // each cluster resolves at a slightly different time
                        ph: r() * 6.2832 });
      }
      // assign membership to nearest cluster within a screen radius
      var cR = Math.min(w, h) * (mobile ? 0.16 : 0.14);
      for (var mI = 0; mI < n; mI++) {
        var mn = arr[mI];
        if (mI === blockIx || mI === readyA || mI === readyB) continue;
        var bestC = -1, bestCD = cR * cR;
        for (var cc = 0; cc < clusters.length; cc++) {
          var ddx2 = mn.x - clusters[cc].x, ddy2 = mn.y - clusters[cc].y;
          var dd2 = ddx2 * ddx2 + ddy2 * ddy2;
          if (dd2 < bestCD) { bestCD = dd2; bestC = cc; }
        }
        if (bestC >= 0) {
          // probabilistically include so clusters read organic, not solid blobs
          if (env.rng() < 0.62) { mn.clu = bestC; clusters[bestC].members.push(mI); mn.silent = false; }
        }
      }

      // Second pass: connect each governed-visible node to a plausible DEEPER
      // neighbour (smaller z, nearby in screen space) — signal forms toward
      // the distance / Console. Silent nodes mostly stay unlinked (invisible
      // structure, ungoverned-visible). Build neighbour lists for cluster
      // pressure-lines so hover never does O(n^2).
      for (var a = 0; a < arr.length; a++) {
        var na = arr[a];
        if (na.silent && na.clu < 0 && na.live === false) {
          if (env.rng() > 0.28) continue;                    // ~28% faint tethers
        }
        var best = -1, bestD = 1e9;
        for (var b = 0; b < arr.length; b++) {
          if (b === a) continue;
          var nb = arr[b];
          if (nb.z >= na.z) continue;                        // must be deeper (further)
          var dx = nb.x - na.x, dy = nb.y - na.y;
          var dl = dx * dx + dy * dy;
          if (dl < bestD) { bestD = dl; best = b; }
        }
        na.link = best;
      }

      env.data.nodes = arr;
      env.data.clusters = clusters;
      env.data.blockIx = blockIx;
      env.data.readyA = readyA;
      env.data.readyB = readyB;

      // The verified signal that rises into Console visibility: choose a
      // near, governed-visible source so its ascent reads clearly. Precompute
      // a gentle rising path from source up toward the vanishing point
      // (Console = governed visibility, up and into distance).
      var srcIx = -1, srcZ = -1;
      for (var sI = 0; sI < n; sI++) {
        if (sI === blockIx) continue;
        if (arr[sI].z > srcZ && arr[sI].z < 0.92) { srcZ = arr[sI].z; srcIx = sI; }
      }
      if (srcIx < 0) srcIx = 0;
      env.data.srcIx = srcIx;
      var src = arr[srcIx];
      env.data.signalPath = [
        { x: src.x, y: src.y },
        { x: fx_lerp(src.x, vpx, 0.45), y: fx_lerp(src.y, vpy, 0.5) - h * 0.04 },
        { x: fx_lerp(src.x, vpx, 0.82), y: fx_lerp(src.y, vpy, 0.86) },
        { x: vpx, y: vpy + h * 0.02 }
      ];

      // scratch reused per-frame for hover pressure-line lookups
      env.data._scratch = [];
    },

    draw: function (env) {
      var fx = env.fx, C = env.C, w = env.w, h = env.h, p = env.p, t = env.t;
      var d = env.data;
      // robustness guard — never crash if layout hasn't populated yet
      if (!d || !d.nodes || !d.nodes.length) { fx.worldbg(env); return; }

      var nodes = d.nodes, origin = d.origin, vp = d.vp, clusters = d.clusters || [];
      var veln = env.veln || 0;

      // ---- RISE: the camera climbs; the persistent world opens into
      // distance. worldbg FIRST (the through-line core seat stays the heart
      // of the system). Lift the seat toward the vanishing point as we rise,
      // so the field itself recedes. A faint purple provenance cast is always
      // present (governed actions leave traces everywhere). -------------
      var rise = fx.easeInOut(fx.clamp(p / 0.36, 0, 1));
      var seatY = fx.lerp(h * 0.66, vp.y + h * 0.1, rise);
      fx.worldbg(env, {
        cx: vp.x, cy: seatY,
        lift: 0.6, tint: 0.13,
        accent: fx.mixc(C.deep, C.luna, 0.18),   // structure-blue with a breath of provenance
        core: 0.16 + 0.06 * (1 - rise),          // the Node's seat, receding as we climb
        coreR: 0.13,
        dust: env.mobile ? 16 : 34, seed: 71
      });

      // horizon haze at the vanishing point — governed distance, depth.
      var hazeBreath = 0.5 + 0.5 * Math.sin(t * 0.5);
      fx.halo(env, vp.x, vp.y, Math.min(w, h) * (0.46 + 0.14 * rise),
              C.deep, (0.05 + 0.05 * rise) * (0.7 + 0.3 * hazeBreath));

      // ---- Eased beats (the brief's storyline) -------------------------
      var reveal  = fx.easeOut(fx.smooth(0.0, 0.42, p));   // 0.00–0.40 field opens, points populate
      var amend   = fx.smooth(0.40, 0.80, p);              // 0.40–0.80 amendment ripple sweeps
      var pressure= fx.smooth(0.46, 0.82, p);              // evidence gaps cluster amber
      var blockOn = fx.smooth(0.50, 0.74, p);              // a site dims to red (blocked)
      var readyOn = fx.smooth(0.52, 0.80, p);              // a site brightens green (ready)
      var riseSig = fx.smooth(0.56, 0.92, p);              // verified signal travels UP into Console
      var align   = fx.smooth(0.80, 1.0, p);              // 0.80–1.00 command field ALIGNS

      // The amendment RIPPLE: a wave front sweeping radially out from the
      // origin across the amend beat. Scroll velocity gives it urgency.
      // wf = current wave-front distance (normalised). Points just-crossed
      // by the front get re-stated (a brief flash + state change).
      var wf = fx.lerp(-0.12, 1.18, amend) + veln * 0.06 * Math.sin(t * 6);
      var wband = 0.16;                                    // width of the active front

      // ============================================================
      // ORIGIN — the single Node, before it becomes many. Brightest early;
      // recedes into being one point among the terrain as the field takes
      // over. Belief first: the multiplication is visible. Continuity: this
      // is the verified signal that lifted off-node at the end of NODE.
      // ============================================================
      var originGlow = 1 - fx.smooth(0.16, 0.56, p);
      if (originGlow > 0.01) {
        fx.halo(env, origin.x, origin.y, 64 * (0.5 + 0.7 * originGlow), C.steel, 0.13 * originGlow);
      }
      var originPulse = 0.6 + 0.4 * Math.sin(t * 1.1);
      fx.node(env, origin.x, origin.y, 2.2 + 1.3 * originGlow, "cold",
              0.5 + 0.4 * originGlow * originPulse, 1);

      // Seed sparks: during the rise, light runs from the origin out toward
      // newly-waking nodes — ONE becoming MANY, made literal.
      if (reveal < 0.99) {
        var seeds = env.mobile ? 4 : 7;
        for (var s = 0; s < seeds; s++) {
          var tgt = nodes[(s * 7 + 3) % nodes.length];
          if (!tgt) continue;
          var prog = fx.clamp((reveal * 1.25) - tgt.wake, 0, 1);
          if (prog <= 0.001 || prog >= 0.999) continue;
          var sk = fx.easeOut(prog);
          var sx0 = fx.lerp(origin.x, tgt.x, sk);
          var sy0 = fx.lerp(origin.y, tgt.y, sk);
          fx.link(env, origin.x, origin.y, sx0, sy0, C.steel, 0.16 * (1 - sk) * (1 - align), 1, true);
          fx.node(env, sx0, sy0, 1.3, "cold", 0.55 * (1 - sk * 0.5), 0.8);
        }
      }

      // ============================================================
      // CURSOR FIELD — find the site nearest the cursor (governed local
      // execution state expands on hover). One pass, no allocation.
      // hoverIx = index of nearest woken node within reach; hoverK 0..1.
      // ============================================================
      var hoverIx = -1, hoverK = 0;
      var ptr = env.ptr;
      if (ptr && ptr.has) {
        var hbest = 1e9, hr = (env.mobile ? 90 : 120);
        for (var hi = 0; hi < nodes.length; hi++) {
          var hn = nodes[hi];
          var hw = fx.smooth(hn.wake, hn.wake + 0.14, reveal);
          if (hw <= 0.2) continue;
          var hdx = ptr.x - hn.x, hdy = ptr.y - hn.y;
          var hd = hdx * hdx + hdy * hdy;
          if (hd < hbest) { hbest = hd; hoverIx = hi; }
        }
        if (hoverIx >= 0) {
          hoverK = fx.clamp(1 - Math.sqrt(hbest) / hr, 0, 1);
          if (hoverK <= 0.001) hoverIx = -1;
        }
      }

      // ============================================================
      // LINKS — pressure / signal propagating toward distance (Console).
      // Only between woken nodes. Silent tethers fainter. A faint PURPLE
      // provenance thread rides governed-action ("luna") links: every
      // consequential movement leaves a trace.
      // ============================================================
      for (var i = 0; i < nodes.length; i++) {
        var nn = nodes[i];
        var woke = fx.smooth(nn.wake, nn.wake + 0.12, reveal);
        if (woke <= 0.01 || nn.link < 0) continue;
        var mm = nodes[nn.link];
        if (!mm) continue;
        var mWoke = fx.smooth(mm.wake, mm.wake + 0.12, reveal);
        var lvis = Math.min(woke, mWoke);
        if (lvis <= 0.01) continue;

        var depthK = (nn.z + mm.z) * 0.5;
        var silentLink = nn.silent && mm.silent;
        var provLink = (nn.base === "luna" || mm.base === "luna");
        var lcol = silentLink ? C.deep : (provLink ? C.luna : C.steel);
        var la = (silentLink ? 0.06 : (provLink ? 0.10 : 0.15)) *
                 lvis * (0.4 + 0.6 * depthK) * (0.45 + 0.55 * (0.3 + 0.7 * align));
        fx.link(env, nn.x, nn.y, mm.x, mm.y, lcol, la, 1, provLink);

        // Traveling pulse: pressure becoming signal along a live link.
        if (nn.live && !silentLink) {
          var fp = (t * (0.32 + veln * 0.4) + nn.flow) % 1;  // velocity nudges flow speed
          var px = fx.lerp(nn.x, mm.x, fp);
          var py = fx.lerp(nn.y, mm.y, fp);
          var pa = Math.sin(fp * Math.PI);
          var pulseState = provLink ? "luna" : (nn.base === "cold" ? "cold" : "steel");
          fx.node(env, px, py, 1.1 + 0.8 * depthK, pulseState,
                  0.5 * pa * lvis * (0.5 + 0.5 * reveal), depthK);
        }
      }

      // ============================================================
      // HOVER: friction CLUSTER pressure-lines. If the hovered node belongs
      // to an evidence-gap cluster, light the pressure links across its
      // related nodes (governed visibility of WHERE the burden is — no
      // patient detail). Uses precomputed member lists.
      // ============================================================
      if (hoverIx >= 0 && hoverK > 0.02) {
        var hClu = nodes[hoverIx].clu;
        if (hClu >= 0 && clusters[hClu]) {
          var mem = clusters[hClu].members;
          var cx0 = clusters[hClu].x, cy0 = clusters[hClu].y;
          for (var pm = 0; pm < mem.length; pm++) {
            var pnode = nodes[mem[pm]];
            var pf = (t * 0.6 + pm * 0.3) % 1;
            fx.link(env, cx0, cy0, pnode.x, pnode.y, C.amber, 0.22 * hoverK, 1, true);
            // a small pressure spark traveling the line — friction in motion
            var qx = fx.lerp(cx0, pnode.x, pf), qy = fx.lerp(cy0, pnode.y, pf);
            fx.node(env, qx, qy, 1.2, "review", 0.5 * hoverK * Math.sin(pf * Math.PI), 0.6);
          }
        }
      }

      // ============================================================
      // NODES — state-carrying points (governed visibility). The amendment
      // RIPPLE re-states points as the front passes; evidence gaps gather
      // amber; the blocked site dims red; the ready site brightens green.
      // Drawn after links so points overlay structure.
      // ============================================================
      for (var j = 0; j < nodes.length; j++) {
        var q = nodes[j];
        var qw = fx.smooth(q.wake, q.wake + 0.14, reveal);
        if (qw <= 0.01) continue;

        var z = q.z;
        var rad = 1 + z * 2.0;                              // perspective size
        var breath = 0.6 + 0.4 * Math.sin(t * 1.1 + q.ph);

        // ripple front proximity for this point (re-statement flash)
        var rfront = 1 - fx.clamp(Math.abs(q.rd - wf) / wband, 0, 1);
        var crossed = q.rd < wf;                            // has the amendment reached it?

        // ---- FEATURE points handled explicitly ----
        if (j === d.blockIx) {
          // BLOCKED: was structure, the amendment blocks it → dims to RED.
          // Restraint: a boundary giving, not spectacle.
          var bState = blockOn > 0.5 ? "fail" : (crossed ? "review" : "deep");
          var bWarn = 0.5 + 0.5 * Math.sin(t * 2.6);
          var ba = qw * (0.30 + 0.4 * z);
          if (blockOn > 0.01) {
            fx.halo(env, q.x, q.y, rad * (4 + 2.5 * bWarn), C.breach,
                    0.10 * blockOn * (0.5 + 0.5 * bWarn));
            fx.ring(env, q.x, q.y, rad * (2.4 + 1.0 * bWarn), C.breach,
                    0.32 * blockOn, { flat: 0.85, w: 1.1 });
          }
          fx.node(env, q.x, q.y, rad + 0.3 * blockOn, bState,
                  ba * (0.7 + 0.3 * (blockOn > 0.5 ? bWarn : breath)), z);
          // a single strained link, now red, propagating one step
          if (blockOn > 0.4 && q.link >= 0 && nodes[q.link]) {
            var bm = nodes[q.link];
            fx.link(env, q.x, q.y, bm.x, bm.y, C.breach, 0.24 * blockOn * bWarn, 1.1);
          }
          drawHoverLocal(env, fx, C, q, j, hoverIx, hoverK, t, "fail");
          continue;
        }

        if (j === d.readyA || j === d.readyB) {
          // READY: the amendment resolves this site → brightens GREEN (pass).
          var on = (j === d.readyA) ? readyOn : (readyOn * fx.smooth(0.0, 0.5, readyOn));
          var gState = (crossed && on > 0.35) ? "pass" : (crossed ? "cold" : "deep");
          var gPulse = 0.7 + 0.3 * Math.sin(t * 1.8 + q.ph);
          var ga = qw * (0.34 + 0.5 * z) * (0.6 + 0.4 * on);
          if (on > 0.2) {
            fx.halo(env, q.x, q.y, rad * (3.4 + 1.2 * gPulse), C.ok, 0.12 * on);
            if (align > 0.01) {
              fx.ring(env, q.x, q.y, rad * (2.2 + 0.5 * gPulse), C.ok,
                      0.12 * on * align, { flat: 0.85, w: 1 });
            }
          }
          fx.node(env, q.x, q.y, rad + 0.3 * on, gState, ga * (0.7 + 0.3 * gPulse), z);
          drawHoverLocal(env, fx, C, q, j, hoverIx, hoverK, t, "pass");
          continue;
        }

        // ---- CLUSTER members: evidence-gap review-burden gathers amber ----
        if (q.clu >= 0) {
          var clRise = pressure * (crossed ? 1 : 0.25);     // burden grows after the amendment
          var aState = clRise > 0.45 ? "review" : (crossed ? "review" : "deep");
          var aBreath = 0.55 + 0.45 * Math.sin(t * 1.5 + q.ph);
          var aa = qw * (0.26 + 0.4 * z) * (0.45 + 0.55 * clRise) * (0.7 + 0.3 * aBreath);
          // re-statement flash as the front sweeps over
          if (rfront > 0.01 && amend > 0.01 && amend < 0.99) {
            fx.bloom(env, q.x, q.y, rad * 5 * rfront, C.amber, 0.18 * rfront);
          }
          fx.node(env, q.x, q.y, rad, aState, aa, z * (0.4 + 0.6 * clRise));
          drawHoverLocal(env, fx, C, q, j, hoverIx, hoverK, t, "review");
          continue;
        }

        // ---- ORDINARY points ----
        // re-statement flash as the amendment front sweeps over (any visible pt)
        if (rfront > 0.01 && amend > 0.01 && amend < 0.99 && !q.silent) {
          fx.bloom(env, q.x, q.y, rad * 4.5 * rfront, C.cold, 0.12 * rfront);
        }

        if (q.silent) {
          // unknown / unseen — deep, low alpha, faintly unresolved (drifts a
          // hair because it is NOT pinned by governance). The point of
          // governed visibility: the sponsor does not see everything.
          var jit = (1 - align) * 0.6 + 0.25;
          var sdx = Math.sin(t * 0.9 + q.ph) * 1.3 * jit * z;
          var sdy = Math.cos(t * 0.8 + q.ph) * 1.3 * jit * z;
          var sa2 = qw * (0.09 + 0.15 * z) * (0.6 + 0.4 * breath);
          fx.node(env, q.x + sdx, q.y + sdy, Math.max(0.8, rad * 0.85), "deep", sa2, 0);
        } else if (q.base === "cold") {
          // active signal — blue-white. Sharpens with alignment.
          var ca = qw * (0.34 + 0.5 * z) * (0.6 + 0.4 * (0.4 + 0.6 * align)) * (0.7 + 0.3 * breath);
          fx.node(env, q.x, q.y, rad, "cold", ca, z * (0.5 + 0.5 * align));
        } else if (q.base === "luna") {
          // governed-action recorded — purple provenance point.
          var pa2 = qw * (0.30 + 0.46 * z) * (0.6 + 0.4 * (0.4 + 0.6 * align)) * (0.7 + 0.3 * breath);
          fx.node(env, q.x, q.y, rad, "luna", pa2, z * (0.5 + 0.5 * align));
        } else {
          // visible structure — deep blue, present but quiet.
          var da2 = qw * (0.22 + 0.42 * z) * (0.5 + 0.5 * (0.4 + 0.6 * align)) * (0.7 + 0.3 * breath);
          fx.node(env, q.x, q.y, rad, "deep", da2, z * (0.4 + 0.6 * align));
        }

        drawHoverLocal(env, fx, C, q, j, hoverIx, hoverK, t, null);
      }

      // ============================================================
      // THE RISING VERIFIED SIGNAL — a proof travels UPWARD from its local
      // source into CONSOLE visibility (up and into distance). White signal
      // climbing a faint PURPLE provenance trace: the sponsor sees the
      // verified result, never the patient-level source. This is the FOMO:
      // see the trial while it is still alive.
      // ============================================================
      if (riseSig > 0.01 && d.signalPath && d.signalPath.length > 1) {
        var path = d.signalPath;
        // provenance trace lights progressively along the path
        var traceN = path.length;
        var litTo = fx.clamp(riseSig * 1.1, 0, 1);
        // draw the trace up to litTo
        var pts = d._scratch; pts.length = 0;
        var totalSeg = traceN - 1;
        var litSeg = litTo * totalSeg;
        for (var sp = 0; sp < traceN; sp++) {
          if (sp <= litSeg) { pts.push(path[sp]); }
          else {
            // partial last segment
            var prevP = path[sp - 1];
            var frac = litSeg - (sp - 1);
            if (frac > 0) {
              pts.push({ x: fx.lerp(prevP.x, path[sp].x, frac),
                         y: fx.lerp(prevP.y, path[sp].y, frac) });
            }
            break;
          }
        }
        if (pts.length >= 2) {
          fx.trace(env, pts, C.luna, 0.4 * riseSig, t * 30);
        }

        // the signal node itself, climbing the path
        var sParam = fx.easeInOut(riseSig);
        var seg = sParam * totalSeg;
        var si = Math.min(traceN - 2, Math.floor(seg));
        var sf = seg - si;
        var sgx = fx.lerp(path[si].x, path[si + 1].x, sf);
        var sgy = fx.lerp(path[si].y, path[si + 1].y, sf);
        // it shrinks slightly as it recedes into distance/visibility
        var sShrink = fx.lerp(1.0, 0.6, riseSig);
        var sgPulse = 0.7 + 0.3 * Math.sin(t * 2.4);
        fx.halo(env, sgx, sgy, 10 * sShrink * (0.6 + 0.4 * sgPulse), C.cold, 0.2 * riseSig);
        fx.node(env, sgx, sgy, 2.6 * sShrink, "cold", 0.85 + 0.15 * sgPulse, 1);
        // a faint forward vector toward Console (the vanishing point)
        if (riseSig < 0.99) {
          var vfx = fx.lerp(sgx, vp.x, 0.18);
          var vfy = fx.lerp(sgy, vp.y, 0.18);
          fx.link(env, sgx, sgy, vfx, vfy, C.luna, 0.3 * riseSig * (1 - riseSig * 0.5), 1, true);
        }

        // HOVER on the source site replays the trace back to its local
        // source (purple) — provenance, not patient data.
        if (hoverIx === d.srcIx && hoverK > 0.05) {
          var rback = (t * 0.8) % 1;
          var rbx = fx.lerp(path[0].x, sgx, rback);
          var rby = fx.lerp(path[0].y, sgy, rback);
          fx.node(env, rbx, rby, 1.6, "luna", 0.6 * hoverK * Math.sin(rback * Math.PI), 0.7);
          fx.halo(env, path[0].x, path[0].y, 12, C.luna, 0.2 * hoverK);
        }
      }

      // ============================================================
      // ALIGNMENT — the command field resolves: governed visibility, one
      // coherent (still-alive) field of view. A quiet governing perimeter
      // implies the sponsor's single window over the living trial. NOT
      // exposure — the perimeter is restrained, and silent points stay dim.
      // Scroll velocity firms the alignment (the field "snaps" to command).
      // ============================================================
      if (align > 0.01) {
        var alignV = fx.clamp(align + veln * 0.1, 0, 1);
        var perimR = Math.min(w, h) * 0.46;
        var pcy = (vp.y + origin.y) * 0.5;
        fx.ring(env, vp.x, pcy, perimR, C.steel, 0.10 * alignV, { flat: 0.6, w: 1 });
        // a second, inner aligned ring for depth at full command
        if (align > 0.4) {
          fx.ring(env, vp.x, pcy, perimR * 0.74, C.steel,
                  0.06 * fx.smooth(0.4, 1.0, align), { flat: 0.6, w: 1 });
        }
        // a quiet axis word, canvas-side (the way OPENING names states).
        fx.label(env, "command", vp.x, origin.y - 14, {
          size: env.mobile ? 7.5 : 9, col: C.steel,
          alpha: 0.32 * align, spacing: 3
        });
      }
    }
  });

  /* ---- HOVER local execution state: a small ring/halo around the site
     nearest the cursor — governed LOCAL state, no patient detail. State
     colour follows the node (passed in, or its own resting structure). */
  function drawHoverLocal(env, fx, C, q, j, hoverIx, hoverK, t, stateOverride) {
    if (j !== hoverIx || hoverK <= 0.02) return;
    var col = stateOverride === "fail" ? C.breach
            : stateOverride === "review" ? C.amber
            : stateOverride === "pass" ? C.ok
            : (q.base === "luna" ? C.luna : q.base === "cold" ? C.cold : C.steel);
    var rad = 1 + q.z * 2.0;
    var pulse = 0.5 + 0.5 * Math.sin(t * 2.2);
    // a tightening local ring — "expand local execution state"
    fx.halo(env, q.x, q.y, rad * (4 + 2 * hoverK), col, 0.16 * hoverK);
    fx.ring(env, q.x, q.y, rad * (3.2 + 0.8 * pulse), col, 0.36 * hoverK, { flat: 0.9, w: 1.1 });
    fx.ring(env, q.x, q.y, rad * (2.0 + 0.4 * pulse), col, 0.22 * hoverK, { flat: 0.9, w: 1 });
  }

  /* Local ES5 helpers usable inside init (kept per the existing pattern;
     init stays dependency-light and self-sufficient). */
  function fx_clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function fx_lerp(a, b, t) { return a + (b - a) * t; }
})();
