# Designing with Absence — frontend

Scrollytelling site for the Saudi photographic archive missingness project.
Fresh codebase (July 2026), replacing the June prototype; the `CorpusProvider`
contract carries over, rebuilt on the A8 JSON artifacts.

## Run

```
npm install
npm run dev          # http://localhost:5173  (?lang=ar for Arabic/RTL)
```

## Data

`public/data/` is the entire data layer — output of `export_artifacts.py`
(see `public/data/README.md`). Data refresh = re-run pipeline + redeploy.
No backend; the only future write path is the contribution layer (Track C),
whose frontend socket is already in `CorpusProvider`.

## Structure

```
src/
  corpus/      artifacts.js (A8 contract + loader) · CorpusProvider.jsx (useCorpus)
  i18n/        react-i18next + ICU · locales/en.json · locales/ar.json
  styles/      tokens.css (the design language, B2) · base.css · smoke.css
  legacy/      slot for TemporalCoverage.jsx (decision O4 pending)
  App.jsx      smoke screen — replaced by the 9-step scroll skeleton (B3)
```

## Standing rules (do not violate)

- **B4** — no hardcoded figures. Every number templates from `stats.json`
  through ICU MessageFormat (Arabic has six plural forms; never concat).
- **B2** — logical CSS properties only; `dir` set at the root; viewable =
  bright/solid, metadata-only = dim/eroded, everywhere.
- Record-level data (titles, notes) is never translated — verbatim, with a
  correct `lang` attribute inside the other locale.
- Aggregates come from the pipeline, never computed in components.

## Open decisions that touch this code

O4 (TemporalCoverage — `src/legacy/`) · L1 (numeral system in ar — currently
Western digits; flip `AR_LOCALE` in `src/i18n/index.js` to `ar-u-nu-arab`
for Eastern ٧٬٧٦٠) · L2 (data graphics don't mirror in RTL; layout does).
