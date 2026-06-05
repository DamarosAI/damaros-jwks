# Tests

## `visual-smoke.mjs`

A self-contained [Playwright](https://playwright.dev) smoke test for the
**terrain deck** — the stepped flythrough of the governed landscape. It serves
the repository over a temporary local HTTP server (ephemeral port), so **no
separate dev server is required**, and verifies the motion contract with pixel +
DOM assertions (no screenshots).

### What it checks

- **Loader** appears on load, fills to 100%, then lifts.
- **Landscape** renders (terrain is lit) once the loader clears.
- **Navigation**: `next()` flies to station 02; the counter, active dot, and
  caption all commit on arrival; `go(0)` returns to the start.
- **All ten landmarks** render lit when flown through.
- **Alive when idle**: two frames sampled with no input differ.
- **Terminal frame**: the final landmark is `10 / 10` with its caption shown.
- **No runtime/console errors** across desktop, mobile (390×844), and
  reduced-motion boots; under reduced motion an instant jump lands correctly.

### Run

```bash
# once
npm i -D playwright
npx playwright install chromium

# run
node tests/visual-smoke.mjs
```

Exit code `0` = all checks passed; non-zero = at least one failed (each line is
printed `PASS` / `FAIL` with the measured value).

### Notes

- Navigation is driven through `window.DamarosTerrain` (`go` / `next` / `prev`)
  and via real key events, so the actual flight engine is exercised.
- For a quick manual look, serve the repo (e.g. `npx serve` or any static
  server) and open `index.html`; travel with arrow keys, clicks, dots, scroll,
  or swipe.
