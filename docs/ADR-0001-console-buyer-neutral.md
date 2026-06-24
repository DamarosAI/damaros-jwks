# ADR-0001 — Console is buyer-neutral field command; site networks are the initial GTM persona

Status: Accepted
Date: 2026-06-24

## Context

Console was originally framed as a sponsor command center. Field feedback (Raj) is that
leading with sponsors front-loads scope, sales-cycle, validation, and credibility burden
before Node has enough installed execution memory. The sharper near-term wedge is selling
Damaros to **sites and site networks** as the execution system that makes them trial-capable.

The Console backend is unchanged: a PHI-free projection layer over Node's Execution Graph
with four engines — Trust, Activation, Friction, and Eye/Field Command. Those primitives are
correct for either buyer. What changes is the **persona, public surface language, and proof story**,
not the engine.

## Decision

1. **Console is buyer-neutral field command.** Public copy says "Console" (and "Network Console"
   when specificity helps). "Sponsor Console" is retired as visible copy.
2. **Initial GTM persona is the site network.** The site-network operator is the first user of
   Console and Damaros Eye. Sponsor/CRO is a **downstream** persona and pull-through, not the wedge.
3. **The four engines do not change.** Their public framing shifts to the network job:
   - Trust Profile -> "Which clinics in my network are execution-ready and provable?"
   - Activation Readiness -> "Which clinics can we stand up for this protocol, and what blocks them?"
   - Eligibility Friction -> "Where is this protocol colliding with our field reality?"
   - Eye -> "Where is execution pressure moving across our network?"
4. **Damaros Eye is Console-only (not Node).** Initial user: site-network operator. Future user:
   sponsor/CRO.

## Canon

> Node runs the clinic. Console runs the network. Replay proves the work.

Expanded:

> Node gives each clinic governed trial execution. Console gives the site network an operating
> picture across clinics. Replay gives the network proof it can show sponsors, CROs, QA, and regulators.

Website lead: **Damaros makes site networks trial-capable.**
Subline: **Node governs execution at each clinic. Console shows readiness, friction, trust, and
pressure across the network. Replay proves the chain.**

## Invariants (unchanged)

- PHI never touches an LLM.
- Eligibility decisions are deterministic and traceable.
- Screening runs and protocol versions are immutable once written.
- No candidacy claims. No eligible-patient claims. No patient matching. No sponsor authority.
- PHI-free projection and Replay proof remain the basis of Console.

## Consequences / deferred work

- **Public surface** (this change): runtime.html, docs/fhir.html, docs/privacy.html, and homepage
  copy reframed from sponsor-first to network-first. Homepage was already network-framed
  ("THE SITE NETWORK", "Aggregated view across your network").
- **Internal identifiers are intentionally left in place** to avoid churn and CSS/JS coupling risk:
  - CSS: `.ti-sponsor`, `.ey-zone--sponsor`, keyframe `eyZoneGlowSponsor` (`shared/sections.css`)
  - JS: `var sponsor` / `ey-zone--sponsor` in `index.html` Eye builder
  - Legacy/unreferenced canvas modules: `shared/trust-membrane.js`, `shared/terrain.js`,
    `shared/scenes/console.js` (not loaded by any page)
  These are non-visible. A future **persona-neutral pass** should introduce a role abstraction:
  `sponsor` (external funder), `network_operator` (site-network operator), `site_admin`
  (clinic/site admin), `cra_or_ops` (optional). Backend may keep sponsor-egress machinery under
  the hood; the public surface must not expose it.
- **Routes (backend, not in this repo):** keep `/v1/console/*`; do not add a divergent API. Neutral
  aliases (`/v1/network/*` or `/v1/console/network/*`) can be added later without breaking working routes.
- **damaros.ai marketing copy:** if a source other than this repo, treat as drift to reconcile in
  the next marketing-copy update.
