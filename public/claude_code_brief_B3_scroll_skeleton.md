# Claude Code Brief — B3: Scroll skeleton (the 9-step core)

*Repo: `designing-with-absence` (Vite + React, July 2026 codebase). Tracker task **B3**.
Read `README.md` and this brief fully before writing code.*

---

## Goal

Build the scrollytelling skeleton: a sticky graphic + scrolling steps layout,
one scrollama observer wrapped in a React hook, and a core registry of 9
placeholder steps. **No real scenes, no motion, no progress-driven animation.**
Empty slots that scenes drop into later. When this lands, `App.jsx`'s smoke
body is replaced by the core.

## Context you must not violate (standing rules, from README.md)

- **B4 — no hardcoded figures.** Any number shown on screen templates from
  `stats.json` via ICU (`useTranslation` + variables). Placeholder copy may be
  lorem-style prose but must contain **zero literal statistics**.
- **B2 — logical CSS properties only.** `margin-inline-start`, `inset-block-start`,
  `min-block-size` — never `left/right/top/bottom/width/height` physical
  equivalents in authored CSS. All colors/type/spacing come from the existing
  tokens in `src/styles/tokens.css`; do not add new colors or fonts.
- **Bilingual/RTL from day one.** The site runs under `?lang=ar` with
  `dir="rtl"` set on `<html>` by the existing i18n layer. The skeleton must
  work in both without conditional code. Scroll axis is vertical (block),
  so this is nearly free if you use logical properties. New UI strings go in
  **both** `src/i18n/locales/en.json` and `ar.json` (Arabic may be a rough
  draft, marked in the file's `_note` convention).
- **Data access:** components read data only via `useCorpus()` from
  `src/corpus/CorpusProvider.jsx`. Never `fetch` in a scene/step. Do not
  modify `CorpusProvider`, `artifacts.js`, or `src/i18n/index.js` except
  additively if strictly required (state why in the commit message).
- **Reduced motion:** `base.css` already zeroes transitions under
  `prefers-reduced-motion`. Do not add JS animation in this brief at all.

## Dependency

```
npm install scrollama
```

Nothing else. No animation libraries, no scroll libraries besides scrollama,
no CSS frameworks.

---

## Architecture (decided — do not redesign)

**Step ≠ scene.** A *step* is a scrolling text block that trips the observer.
A *scene* is what the sticky graphic renders. Multiple consecutive steps can
drive one scene (Scene A will have several); the graphic must **not unmount**
between two steps that share a scene.

**One observer, owned by the core.** Steps are dumb: they receive `active`
(and the plumbing for `progress` later) as props and never import scrollama.

### Files to create

```
src/core/
  core.jsx          the layout + observer wiring + graphic switcher
  core.registry.js  core: the ordered 9 steps (single source of truth)
  useScrollama.js    the hook wrapping scrollama
  core.css          sticky layout styles (logical properties only)
src/scenes/
  placeholder/
    PlaceholderScene.jsx   graphic slot: shows scene id + current phase
    PlaceholderStep.jsx    step text slot: shows step id + active state
```

### `core.registry.js`

```js
// The 9-step core. Order = the narrative order from the brief.
// scene: which graphic the sticky panel shows (steps sharing a scene value
//        must not remount the graphic between them).
// phase: passed to the scene so one scene can stage multiple steps.
export const core = [
  { id: "opener-place",      scene: "openers",    phase: "place",      Step: PlaceholderStep },
  { id: "opener-time",       scene: "openers",    phase: "time",       Step: PlaceholderStep },
  { id: "opener-maker",      scene: "openers",    phase: "maker",      Step: PlaceholderStep },
  { id: "opener-context",    scene: "openers",    phase: "context",    Step: PlaceholderStep },
  { id: "opener-visibility", scene: "openers",    phase: "visibility", Step: PlaceholderStep },
  { id: "scene-a",           scene: "sceneA",     phase: "field",      Step: PlaceholderStep },
  { id: "maker-context",     scene: "makerScene", phase: "main",       Step: PlaceholderStep },
  { id: "visibility",        scene: "visScene",   phase: "main",       Step: PlaceholderStep },
  { id: "grid-finale",       scene: "grid",       phase: "main",       Step: PlaceholderStep },
];

export const SCENES = { openers: PlaceholderScene, sceneA: PlaceholderScene,
  makerScene: PlaceholderScene, visScene: PlaceholderScene, grid: PlaceholderScene };
```

Note: openers currently occupy 5 steps sharing one scene component
parameterised by `phase`. Decisions O1 (merge Place/Time) and the final
core order are open — the registry must be trivially reorderable (this is
why it's one array in one file). Add a comment saying exactly that.

### `useScrollama.js` — hook contract

Signature: `useScrollama({ offset = 0.5, progress = false })` returning
`{ containerRef, index, direction, progress }`.

Hard requirements:

1. `setup()` targets `containerRef.current.querySelectorAll(".step")`.
2. `onStepEnter` sets `{ index, direction }`; `onStepExit` when leaving the
   last step **upward past the container start** resets index to `-1` (so the
   pre-core state is representable).
3. **Cleanup calls `scroller.destroy()`** in the effect return. The app runs
   in StrictMode: mount → unmount → remount in dev must leave exactly one
   live observer (verify: no double `onStepEnter` logs).
4. `window.addEventListener("resize", scroller.resize)` with removal on
   cleanup.
5. Subscribe to i18n language changes and call `scroller.resize()` after the
   locale flips (Arabic copy has different heights, which invalidates
   scrollama's cached positions):
   ```js
   import i18n from "../i18n/index.js";
   useEffect(() => {
     const h = () => scrollerRef.current?.resize();
     i18n.on("languageChanged", h);
     return () => i18n.off("languageChanged", h);
   }, []);
   ```
6. `progress` plumbing exists (option + returned value) but the core calls
   the hook with `progress: false`. Do not wire progress into any rendering.
7. Accept a `debug` option passed through to scrollama's `debug` (trigger-line
   overlay); default false; the core enables it via
   `import.meta.env.DEV && new URLSearchParams(location.search).has("debug")`.

### `core.jsx`

- Renders:
  ```jsx
  <section className="core" ref={containerRef}>
    <div className="graphic" aria-hidden="true">
      <ActiveScene phase={activePhase} active={index >= 0} />
    </div>
    <div className="steps">
      {core.map(({ id, Step }, i) => (
        <div className="step" key={id} data-step={id}>
          <Step id={id} active={i === index} />
        </div>
      ))}
    </div>
  </section>
  ```
- `ActiveScene` = `SCENES[core[clampedIndex].scene]`. **Keyed by the scene
  name**, so React reconciles (not remounts) across steps sharing a scene,
  and remounts only when the scene changes. Before the first step
  (`index === -1`), show the first scene in its inactive state.
- The step wrapper (`.step`) owns all outer sizing. Step components must not
  change their own outer height on `active` — that would move their own
  trigger line. Enforce with a comment in `PlaceholderStep`.

### `core.css`

- `.core` — two-column layout: graphic + steps. Use grid with
  `grid-template-columns` and let RTL flip it for free; steps column
  `max-inline-size: var(--measure)`.
- `.graphic` — `position: sticky; inset-block-start: 0; block-size: 100svh;`
  (**svh**, not vh — mobile URL bars). Dark field ground: `background:
  var(--field); color: var(--bone);` (Scene A's ground; placeholders live on
  it fine).
- `.step` — `min-block-size: 100svh;` generous `padding-block`; step text on
  a paper card (`background: var(--paper); border: 1px solid var(--paper-deep)`)
  so it reads over whatever the graphic does.
- Below `~900px` inline size: single column, graphic sticky behind, steps
  scrolling over it (standard mobile scrollytelling collapse). One media
  query, still logical properties.
- No new colors, no shadows/gradients — quiet skeleton.

### Placeholders

- `PlaceholderScene` shows: scene name, current `phase`, and dims itself via
  the existing `.metadata-only` class when `active` is false. Nothing else.
- `PlaceholderStep` shows: step id and one short i18n'd placeholder sentence
  (`core.placeholder` key, both locales). When `active`, a subtle
  border-inline-start in `var(--accent)`.

### `App.jsx`

Replace the smoke `<section>`s with `<core />`, keeping: the header
(title/subtitle/LangToggle), the missing-artifacts dev notice, and the
footer. Move the current stats sentences (`smoke.corpus` etc.) into the
**first step's** placeholder content — they prove B4 survives inside the
scroll. Keep `smoke.css` for what remains or fold it into core.css and
delete it; either way no dead CSS files.

---

## Acceptance checks (run all; put results in the final report)

1. `npm run build` passes; `npm run dev` renders the core in **en** and
   **ar** (`?lang=ar`): RTL flips the two columns, scrolling works, no
   horizontal scrollbar in either direction.
2. Scrolling down fires steps 0→8 exactly once each (console-log in dev);
   scrolling back up fires with `direction: "up"` and reaches `index: -1`
   above the core.
3. StrictMode double-mount produces **no duplicated observer** (no double
   enter events after remount).
4. Toggling the language mid-scroll then continuing to scroll still fires
   correct indices (the languageChanged→resize wiring works).
5. Steps sharing `scene: "openers"` do **not** remount `PlaceholderScene`
   (verify with a mount-count `useEffect` log, then remove the log).
6. `grep -rn -E "margin-left|margin-right|padding-left|padding-right|(^|[^-])left:|right:|top:|bottom:|width:|height:" src/core src/scenes` →
   only justified hits (e.g. `inline-size`/`block-size` are fine; physical
   properties are not). Zero physical properties in new CSS.
7. `grep -rn -E "[0-9]{2,}" src/core src/scenes` → no literal statistics in
   placeholder copy (viewport numbers in CSS are fine).
8. New i18n keys exist in **both** locale files; `?lang=ar` shows no raw keys.
9. `?debug` in dev shows scrollama's trigger line; absent in prod build.

## Out of scope — do not build

- Any real scene (Scene A field, grid, ghost frames) — placeholders only.
- Progress-driven rendering, transitions, camera motion (B10).
- Touching `public/data/`, `CorpusProvider` internals, tokens, or the
  pipeline. No new dependencies beyond scrollama.
- Routing, deploy config (B11), contribution UI (Track C).

## Commits

Logical commits in this order: (1) core layout static, no JS;
(2) useScrollama hook; (3) registry + graphic switching + App integration;
(4) i18n keys + acceptance-check fixes. Conventional messages, reference B3.
