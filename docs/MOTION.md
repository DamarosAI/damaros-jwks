# Damaros — Motion & Immersion System

**House style: "DATUM LATTICE — the governed execution graph, drawn as an
instrument."** The live experience is a **WebGL (Three.js) instrument**: a camera
flies a stepped journey over a flat wireframe **datum grid** (the graph paper) and
stops at ten **landmarks**. There is really **one subject — the execution graph**
(criteria, evidence, sites, reviewers, amendments, outcomes fused into one
governed record) — seen from **ten governance vantages**, so the whole journey
reads as authored by one hand.

Everything is built from **one vocabulary**:
- **wire-octahedron NODES** + straight **directed EDGES**
- a **calibration-tick RULER** (the connective tissue; the terrain is the same grid)
- a **HUD LOCK-RETICLE** that locks onto the measured centre / the probed node

Crisp additive **lines on black**; **bloom is near-off**; crispness is contrast,
never blur. No particle fields, no haze, no blobs, no "orbs".

Files:
- `shared/space.js` — the whole engine (ES module): palette, the graph buffers,
  the single `graphForm()` engine, the ten landmark data definitions, the datum
  terrain, camera + navigation, near-off bloom, boot loader.
- `assets/vendor/three/` — vendored **Three.js** core + postprocessing addons,
  loaded via an **importmap** → **no build step, works offline**.
- `shared/terrain.css` — deck layout + stepped-nav UI + caption legibility.
- `index.html` — importmap, the `#world` canvas, captions, nav, boot loader.
- `tests/visual-smoke.mjs` — the motion-contract test suite.

> Earlier engines remain in the repo but are **not loaded** (canvas-2D terrain
> deck `shared/terrain.js`; scroll engine `shared/journey.js` + `shared/scenes/*`).
> The biological/cellular landmark version was **replaced** by this instrument
> system. Don't re-enable old engines without being asked.

---

## 1. The three motion states (every landmark, identical grammar)

1. **ASSEMBLE** — as camera proximity `near` rises 0→1 the graph **draws itself**:
   it does NOT fade in. A wavefront `w = smoothstep(near)` reveals, in order,
   ruler → nodes (octahedra scale up from their centres) → edges (each edge
   **plots like a pen**, its far endpoint lerping out from the near one) → the
   lock-reticle, last. Leaving plays it exactly backward (powering down).
2. **SETTLE** — when `near` crosses ~0.9, exactly **one** critically-damped seat
   fires (≤2% scale overshoot, ~220 ms) plus a one-shot core bump; the reticle
   snaps to centre. Then dead still.
3. **BREATH** — the ONLY idle motion: `rotation.y = sin(t*0.18)*0.05`,
   `rotation.x = sin(t*0.13)*0.03` (~0.009 rad/s peak — a held instrument
   breathing) + a ±1.2% scale breath. **Nothing free-spins. No turntables.**

---

## 2. Interaction — ONE verb everywhere

The cursor is a **measurement PROBE**. The engine intersects the cursor ray with
each nearby landmark's facing plane and maps it into that landmark's **local
space** (`group.worldToLocal`), then:
- finds the **single nearest node** and lights only it (core grows ~1.4→2.6, the
  reticle slides onto it). Monotonic in proximity, one element at a time.
- fires **one bright travelling TICK downstream** along the edges that node
  governs; each node it reaches **resolves its state colour**. You read the graph
  by touching a node and watching what it controls.
- **releases precisely**: the tick retracts, colours ease back to cool structure,
  the reticle unlocks. Nothing spins, scatters, or drifts toward the cursor.

The travelling tick has per-landmark modes (all one engine): `downstream`
(protocol, evidence, luna), `rows` (replay — scrub the version stack),
`converge` (trident — three inputs into one decision), `chain` (node — the
governed emission), `loop` (final — confirm the closed cycle).

**MACRO (camera):** calm, controlled parallax — the view leans a few degrees with
the cursor and the **aim stays glued** to the landmark (same offset on position
and look-target), so it never swims or spins. Heavily smoothed; auto-returns.

---

## 3. The ten vantages

| Landmark | Vantage on the execution graph | Probe resolves |
|---|---|---|
| Opening | THE GAP — two ruled rows, the centre field-node **missing**, a reticle in the hole | the gap → **amber / unresolved** (bookend) |
| Protocol | VERSIONED EXECUTABLE LOGIC — a clause column compiled into a criteria tree | clear criteria → green; ambiguous → amber |
| Evidence | INSPECTABLE LINEAGE — sources route to a criterion; one link is **missing/stale** | intact → green; the broken link → amber |
| Screening | CRITERION-LEVEL DETERMINISTIC STATE — a criterion fan | each criterion → fixed PASS/REVIEW/FAIL |
| Replay | RECONSTRUCTABLE IMMUTABLE CHAIN — a version stack; one row **forks** | scrub a row; the amendment fork lights **luna** |
| Trident | THE GOVERNANCE TRIAD — agentic + deterministic + clinician | three ticks converge → one **green** decision |
| Luna | PROVENANCE / WITNESS — an append-only ledger | proof traces **down to the sealed root** (luna) |
| Node | GOVERNED EXECUTION AT THE SITE — a closed cage + worklist | emits ONE **verified green** signal out the port |
| Console | SPONSOR OPERATING PICTURE — the aggregated matrix | receives the signal; review/fail cells flagged |
| Final | THE CLOSED GOVERNED LOOP — the opening ring, sealed | one green tick confirms the **whole cycle** |

**Node ↔ Console dual:** the Node emits a verified green signal out its sanctioned
port; the Console is where that aggregated picture is read — same green signal,
two halves.

**Colour = state, nothing else.** Resting palette is cool structure only (deep
edges, steel ruler/reticle, cold cores). Green/amber/red/purple appear ONLY at
the instant a measurement resolves, then ease back. At most **one** saturated
state colour bright at a time.

---

## 4. Camera, navigation, bloom

- **Swoopy damped camera:** exponential smoothing toward each waypoint (no
  bounce) + wall-clock arrival safety. Waypoints sit **close** (~12.5 u) so each
  landmark fills the frame; arrival fires the SETTLE beat.
- **Stepped navigation:** `go(i)`/`next()`/`prev()` — click arrows · keys/space ·
  dots · swipe · wheel. `DamarosSpace.state()` → `{cur, target, flying, frames}`.
- **Bloom near-off:** `UnrealBloomPass(0.10, 0.10, 0.85)`, exposure 0.92 — only
  the brightest white/lit cores get a one-pixel halo; structure stays pin-sharp.

**Tune:** `graphForm()` (assemble/settle/probe constants); per-landmark node/edge
data in the `b*()` builders; bloom params + exposure; STEP + station positions.

---

## 5. Performance & accessibility

- **Device-adaptive:** capped pixel ratio (≤2 desktop, ≤1.5 mobile), counts scaled
  by `Q`, bloom off on mobile, antialias off on mobile.
- **Lines + a few points only** → one draw call each, no triangle artifacts.
- **Paused when hidden**; **reduced-motion** renders at `near=1` locked (no
  assemble/breath/ticks) and disables cursor-driven camera motion.
- Boot loader (`#boot`) tracks fonts + first painted frame, then lifts.

---

## 6. Testing

`tests/visual-smoke.mjs` — self-contained Playwright suite (serves the repo,
Chromium + SwiftShader for headless WebGL). Asserts loader lifecycle, the render
loop, navigation (counter/dot/caption commit), all 10 reachable, the terminal
frame, alive-when-idle, and error-free desktop / mobile / reduced-motion.

```bash
npm i -D playwright && npx playwright install chromium   # once
node tests/visual-smoke.mjs                              # exit 0 = all pass
```
