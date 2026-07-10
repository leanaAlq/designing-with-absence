/**
 * artifacts.js — the frontend's single point of contact with the A8 export.
 *
 * Contract (export_artifacts.py v1, see export_report.md):
 *
 *   public/data/
 *     meta.json          version, run_date, counts, freeze_tag, attributions
 *     stats.json         every figure the narrative may cite (rule B4)
 *     completeness.json  per-record {id, score, flags, decade, region, layer}
 *     geo.json           placed records {id, lat, lon, decade, region, viewable}
 *     settlements.json   GeoNames P-class reference set (the dark field)
 *     matrix.json        region × decade aggregates
 *     bboxes.json        city bounding boxes
 *     labels.json        every label, bilingual {en, ar}
 *     scenes/openers.json    the five chosen records, full provenance chain
 *     scenes/makers.json     origin × basis aggregates
 *     scenes/visibility.json access-tier counts + samples
 *
 * Rules:
 *  - Aggregates are computed in the pipeline, NEVER here.
 *  - stats.json numbers are the only numbers the site may display.
 *  - `layer` is present on per-record rows: the cutoff is a filter, not a fork.
 */

const BASE = `data`;

/** Required for the app to boot at all. */
const CORE = {
  meta: "meta.json",
  stats: "stats.json",
  labels: "labels.json",
};

/** Scene data — loaded with the same call, but a miss is reported, not fatal,
 *  so the scaffold runs before every artifact is dropped in. */
const SCENE = {
  completeness: "completeness.json",
  geo: "geo.json",
  settlements: "settlements.json",
  matrix: "matrix.json",
  bboxes: "bboxes.json",
  openers: "scenes/openers.json",
  makers: "scenes/makers.json",
  visibility: "scenes/visibility.json",
};

async function fetchJson(path) {
  const res = await fetch(`${BASE}/${path}`);
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return res.json();
}

/**
 * Per-record files document their own key map (export acceptance check 6):
 * accept either an array of objects, or a compact {keys, rows} table and
 * expand it. Anything else is passed through untouched.
 */
export function expandKeyed(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.keys) && Array.isArray(payload.rows)) {
    const { keys, rows } = payload;
    return rows.map((r) =>
      Object.fromEntries(keys.map((k, i) => [k, r[i]]))
    );
  }
  return payload;
}

export async function loadArtifacts() {
  const core = {};
  for (const [name, path] of Object.entries(CORE)) {
    core[name] = await fetchJson(path); // fail loudly: these are required
  }

  const scene = {};
  const missing = [];
  await Promise.all(
    Object.entries(SCENE).map(async ([name, path]) => {
      try {
        scene[name] = await fetchJson(path);
      } catch {
        missing.push(path);
      }
    })
  );

  return { ...core, ...scene, missing };
}
