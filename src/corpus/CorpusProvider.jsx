/**
 * CorpusProvider.jsx
 * ==================
 * The contract that survives the rewrite:
 *   - Scenes NEVER touch data files directly. They call useCorpus() and read
 *     derived values, so a data refresh (re-run export_artifacts.py, redeploy)
 *     is never a code change.
 *   - All selectors are memoized once here, not per-scene.
 *   - The contribution socket (C1) is designed in from day one: the provider
 *     exposes `contributions` (a Map record_id -> [{field, value, kind}]),
 *     empty until Track C ships. Grid cells take it as given.
 *
 * 
 */
import {
  createContext, useContext, useEffect, useMemo, useState,
} from "react";
import { useTranslation } from "react-i18next";
import { loadArtifacts, expandKeyed } from "./artifacts.js";

const CorpusContext = createContext(null);

export function CorpusProvider({ children }) {
  const [state, setState] = useState({ status: "loading" });

  useEffect(() => {
    let alive = true;
    loadArtifacts()
      .then((data) => alive && setState({ status: "ready", data }))
      .catch((error) => alive && setState({ status: "error", error }));
    return () => { alive = false; };
  }, []);

  const value = useMemo(() => {
    if (state.status !== "ready") return state;
    const d = state.data;

    const records = d.completeness ? expandKeyed(d.completeness) : null;
    const geo = d.geo ? expandKeyed(d.geo) : null;

    return {
      status: "ready",
      missing: d.missing,

      // the only numbers the site may display (rule B4)
      stats: d.stats,
      meta: d.meta,

      // per-record + reference layers (null until their artifact is dropped in)
      records,
      geo,
      settlements: d.settlements ?? null,
      matrix: d.matrix ?? null,
      bboxes: d.bboxes ?? null,

      // scene payloads
      scenes: {
        openers: d.openers ?? null,
        makers: d.makers ?? null,
        visibility: d.visibility ?? null,
      },

      // bilingual labels: every region/tier/form/decade label the pipeline
      // emitted as {en, ar}. Resolution by current locale happens in
      // useLabel(), not here.
      labels: d.labels,

      // C1 — the contribution socket. Empty by design until Track C.
      contributions: EMPTY_CONTRIBUTIONS,
    };
  }, [state]);

  return (
    <CorpusContext.Provider value={value}>{children}</CorpusContext.Provider>
  );
}

const EMPTY_CONTRIBUTIONS = new Map();

export function useCorpus() {
  const ctx = useContext(CorpusContext);
  if (!ctx) throw new Error("useCorpus must be used inside <CorpusProvider>");
  return ctx;
}

/**
 * Resolve a bilingual label {en, ar} by the active locale.
 * Usage: const L = useLabel(); L(labels.regions?.["Hejaz"])
 * Falls back across locales rather than rendering blank — a missing
 * translation must be visible in review, not invisible in production.
 */
export function useLabel() {
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith("ar") ? "ar" : "en";
  return (pair) => {
    if (pair == null) return "";
    if (typeof pair === "string") return pair;
    return pair[lang] ?? pair.en ?? pair.ar ?? "";
  };
}
