export const meta = {
  name: 'damaros-brief6-acceptance-audit',
  description: 'Per-scene visual acceptance audit of the Brief 6 re-author: 10 judges read autonomous + cursor frames and score against the brief',
  phases: [{ title: 'Audit', detail: 'one judge per scene, reads both frames, scores criteria' }],
}

const DIR = 'C:\\repos\\damaros-jwks'
// [name, concept, criteria[], banned]
const SCENES = [
  ['hero', 'A calm doorway: NO active product object behind the headline — only dark topology depth + faint distant particles. Text must dominate.',
    ['No central product object / ring / particle mass behind the headline', 'Reads calm and premium, lots of negative space', 'Topology field present but quiet'],
    'any centered glowing object, ring, particle sculpture, or moving system behind the text'],
  ['protocol', 'A compressed monolith that has spread RIGHTWARD into a wide horizontal row of executable blocks/slices and HOLDS there. Blue-white = stable executable logic; amber = unresolved/unstable blocks. Thin seams/segmentation.',
    ['Spread wide and horizontal (not a centered clump)', 'Distinct executable blocks/slices, segmented', 'Blue-white blocks + a couple amber unstable ones', 'Cursor frame shows LOCAL change near the pointer (granular decomposition), not a global cut/scatter'],
    'potato-chip cylinder/stack, a single dense slab, knife-cut snapping, global scatter'],
  ['evidence', 'A normalization PLANE: messy/disorganized fragments approach from one side, reorganize, and clean governed streams exit the other side. Thin elegant membrane, not a wall/cube/bar. Cursor depresses/punctures the plane locally (aperture) and dots route around it.',
    ['Messy fragments on one side, clean lanes/streams on the other (visible transformation)', 'No thick bright vertical bar / cube / solid divider', 'Cursor frame shows a LOCAL depression/aperture or routing near the pointer', 'Premium, not a dense blob'],
    'cube-with-streams, thick ugly vertical divider/bar, a static cloud, random scatter'],
  ['screening', 'A central amber REVIEW chamber that continuously resolves UP into a green PASS field and DOWN into a red FAIL field, with streams between; some dots circulate in REVIEW. Airy outcome fields, not rigid rectangles. Cursor intensifies one outcome (field expands / stream accelerates).',
    ['Clear central REVIEW (amber) with PASS (green, up) and FAIL (red, down)', 'Streams/routes visible between center and the fields', 'Airy deconstructed fields (not solid blocks)', 'Cursor frame intensifies/expands one field locally'],
    'three static colored blocks, a fixed green block at top + red block at bottom, a generic random tri-color cloud'],
  ['replay', 'A concentric proof well, slightly off-center: lineage rings stacked in depth, dots flowing inward, center stays DARK (compression/gravity). Background topology must NOT compete. Cursor pulls proof/lineage back outward.',
    ['Concentric rings clearly readable', 'Center stays dark — NOT an overbright glowing ball', 'Background terrain is calm / not competing with the well', 'Cursor frame shows lineage pulled outward / held open'],
    'a white glowing ball/blob at center, a busy competing background'],
  ['trident', 'A neuromorphic logic LOOM reading as COMPUTATION (not a symbol): tangled/dim INPUT on the left, pulsing compute nodes in the middle, clean structured gates/paths on the right. Low-glow blue-white + amber unresolved branches. Cursor expands local computation (sharpens, does not explode).',
    ['Reads as a network/loom of nodes + fine edges, NOT a single symbol', 'Left looks messier/tangled, right looks cleaner/structured (a gradient)', 'Low glow, line clarity, amber on some unresolved branches', 'Cursor frame sharpens/extends the local network near the pointer'],
    'a trident / star / jack / central radial burst / logo-like silhouette'],
  ['luna', 'A Saturn-like governance harness: an airy central body, a thin blue rotating ring, and violet/purple provenance tagging. Smooth and slow. Cursor gradually increases local purple tagging.',
    ['Airy central body + a thin distinct ring (Saturn read)', 'Violet/purple provenance present but not noisy', 'Not a dense ball; restrained glow (no blast)', 'Cursor frame adds more local purple tagging / trails'],
    'a dense purple ball/blob, a cube, a strobey/over-bright core'],
  ['node', 'A local execution CHAMBER — a semi-transparent CUBE suspended low over the terrain. Inside: multicolor streams — blue/white intake on one side, a bounded amber review pocket, green ready exit, violet governed handoffs. Internal partitions shift; the cube breathes. Cursor focuses ONE zone while the chamber keeps running.',
    ['Reads as a CUBE / chamber (wireframe box visible), NOT a sphere/planet', 'Internal streams in distinct zones (blue intake / amber review / green ready / violet handoff)', 'Airy interior — not a single hot streak/lens/blob', 'Cursor frame changes ONE local zone, chamber still intact'],
    'a planet / orb / fried egg / amoeba / comet / biological blob / a single hot streak'],
  ['console', 'A distributed command CONSTELLATION / execution BOARD: ~9 site node clusters spread WIDE and low across the terrain, with a clean command PLANE/horizon ABOVE them; state streams rise from nodes into the plane, organizing into faint rows/bands. Colors: green ready / amber friction / red blocked / blue-white movement / violet trace. Cursor = a command lens (a node route brightens, or the plane organizes).',
    ['Wide & distributed (nodes spread across the field), NOT centered', 'A clean command plane/horizon ABOVE with row/band structure', 'Streams rise from nodes into the plane', 'Restrained glow / premium darkness (not a glowing solid bar/table)', 'Cursor frame brightens a local route / organizes locally'],
    'an octopus / tentacles, a central blob or orb, a glowing solid table/bar'],
  ['final', 'Terminal calm that mirrors the hero: NO active product object, just dark topology + faint depth. Text ("Clinical trials, democratized.") dominates.',
    ['No active product object / convergence sculpture', 'Calm, premium, lots of negative space', 'Mirrors the hero treatment'],
    'any spinning/convergence product object or sculpture'],
]

const VERDICT = {
  type: 'object', additionalProperties: false,
  required: ['scene', 'identifiable', 'autonomousReadsAs', 'cursorEffect', 'bannedShapePresent', 'glow', 'criteria', 'topFix'],
  properties: {
    scene: { type: 'string' },
    identifiable: { type: 'string', enum: ['YES', 'WEAK', 'NO'], description: 'Could you name this scene from its structure alone (labels hidden)?' },
    autonomousReadsAs: { type: 'string', description: 'In one sentence, what the no-cursor frame actually depicts.' },
    cursorEffect: { type: 'string', description: 'What changed between the autonomous and cursor frames; is it LOCAL/sensible, GLOBAL/chaotic, or NONE-visible?' },
    bannedShapePresent: { type: 'string', description: '"none", or which banned silhouette it resembles.' },
    glow: { type: 'string', enum: ['OK', 'SLIGHTLY_HOT', 'TOO_HOT'] },
    criteria: {
      type: 'array', description: 'One entry per acceptance criterion given.',
      items: {
        type: 'object', additionalProperties: false, required: ['c', 'v', 'note'],
        properties: { c: { type: 'string' }, v: { type: 'string', enum: ['PASS', 'PARTIAL', 'FAIL'] }, note: { type: 'string' } },
      },
    },
    topFix: { type: 'string', description: 'The single most important concrete fix, or "none".' },
  },
}

phase('Audit')
const results = await parallel(SCENES.map(([name, concept, criteria, banned]) => () =>
  agent(
    `You are a demanding art director auditing one scene of an immersive WebGL site (Damaros — "governed execution infrastructure for distributed clinical trials"). Judge ONLY from the two rendered frames; be skeptical and specific.

SCENE: ${name}
INTENDED CONCEPT: ${concept}

Read BOTH images (they are PNG screenshots, 1440x810; ignore the small caption text + nav chrome, judge the WebGL field):
- Autonomous (cursor never moved): ${DIR}\\auto-${name}-a.png
- Cursor-driven (pointer moved to a scene-relevant spot): ${DIR}\\auto-${name}-cur.png

ACCEPTANCE CRITERIA (score each PASS / PARTIAL / FAIL):
${criteria.map((c, i) => `  ${i + 1}. ${c}`).join('\n')}

BANNED — must NOT resemble: ${banned}

Global bar: less glow / premium darkness / negative space / line clarity; the scene must be ALIVE and legible; the cursor must ENHANCE locally, never cause global chaos.

Return the structured verdict. For "identifiable", answer whether a viewer could name this scene's concept from structure alone. Keep notes terse and concrete (what to change, where).`,
    { label: `audit:${name}`, phase: 'Audit', schema: VERDICT }
  )
))
return results.filter(Boolean)
