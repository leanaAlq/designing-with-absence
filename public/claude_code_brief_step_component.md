# Claude Code Brief — B3 (partial): the Step component only

*Repo: `designing-with-absence` (Vite + React, July 2026 codebase). Read
`README.md` first. This brief covers ONE component and its styles/locale
keys. The core layout, scrollama hook, and registry are being built by hand
separately — **do not create them, do not install anything.***

---

## Goal

A dumb, reusable step component: the scrolling text block of the
scrollytelling core. It receives scroll state as props and renders content;
it knows nothing about scrollama, observers, or the registry.

## Files

```
src/core/Step.jsx          the component
src/core/step.css          its styles (imported by Step.jsx)
src/i18n/locales/en.json    add keys (additive only)
src/i18n/locales/ar.json    add keys (additive only)
```

Touch nothing else. No changes to `CorpusProvider`, `App.jsx`, `main.jsx`,
tokens, or `i18n/index.js`.

## Contract

```jsx
<Step id="opener-place" active={bool} direction={"down"|"up"|null}>
  {children}   // the step's content — copy, later real scene text
</Step>
```

- Renders an outer `<div className="step" data-step={id}>` wrapper and an
  inner content card. **The outer wrapper is the observer target** the
  hand-built core will query (`querySelectorAll(".step")`), so:
  - outer sizing lives on the wrapper: `min-block-size: 100svh`,
    `padding-block` from tokens — and is **identical whether `active` or
    not**. A step must never change its own outer height with state, or it
    moves its own trigger line. Put this rule as a comment in both files.
  - all visual state changes (`active` styling) happen on the **inner card
    only**: opacity/border/color — no size, no margin, no transforms that
    affect layout.
- Inner card: paper on the dark field — `background: var(--paper)`,
  `border: 1px solid var(--paper-deep)`, `max-inline-size: var(--measure)`,
  `border-radius: var(--radius)`, body type from tokens. When `active`:
  `border-inline-start: 3px solid var(--accent)` and full opacity; when
  inactive: the existing `.metadata-only` treatment (opacity/saturation from
  tokens — reuse the class or its variables, don't invent new values).
- `direction` is accepted and currently unused (plumbing for later beats) —
  document that in a comment, don't render it.
- If `children` is empty, render an i18n'd placeholder sentence
  (key `core.stepPlaceholder`) plus the `id` in `--font-data` small caption
  type — so the hand-built core can mount nine empty steps immediately.
- Accessibility: the wrapper gets `role="group"` nothing fancier; inactive
  steps stay in the accessibility tree (they're real document content, the
  dimming is purely visual — do NOT use `aria-hidden` or `visibility`).

## Rules (from README.md — violations = rejected)

1. **Logical CSS properties only.** No `left/right/top/bottom/width/height/
   margin-left/…` — use `inline-size`, `block-size`, `margin-inline-start`,
   `border-inline-start`, etc. Must render correctly under `dir="rtl"`
   (`?lang=ar`) with zero conditional code.
2. **Tokens only.** Every color, size, font, space comes from
   `src/styles/tokens.css` custom properties. No new hex values, no new
   fonts, no shadows/gradients.
3. **No hardcoded figures** in any copy, including placeholders (B4).
4. Any transition added must be trivial (opacity/border-color only) — it is
   already globally disabled under `prefers-reduced-motion` by `base.css`;
   rely on that, add no motion logic.
5. New locale keys go in **both** `en.json` and `ar.json` (Arabic as a rough
   draft is fine — follow the file's existing `_note` convention).

## Acceptance checks (report results)

1. `npm run build` passes.
2. A scratch render of three `<Step>`s (one active, one inactive, one with
   no children) works in both `?lang=` locales — verify visually via
   `npm run dev` by temporarily mounting them in App, then **revert App**
   (git diff on App.jsx must be empty at the end).
3. Toggling `active` does not change the wrapper's measured `offsetHeight`
   (log once in the scratch render, then remove).
4. `grep -n -E "margin-left|margin-right|padding-left|padding-right|text-align: (left|right)|[^-](left|right|top|bottom|width|height):" src/core/step.css` → zero hits.
5. `grep -n "#" src/core/step.css` → zero raw hex colors.
6. No new dependencies in `package.json` (diff must be empty).


