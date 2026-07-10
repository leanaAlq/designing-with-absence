/**
 * PlaceholderScene.jsx — the sticky graphic slot (tracker B3, placeholder).
 *
 * Shows only which scene + phase is on stage. Real scenes replace this via
 * the registry. Dims via the shared .metadata-only treatment when inactive
 * (index === -1, before the first step). Nothing else — no motion, no data.
 *
 * scene/phase are internal ids (dev labels), not user copy — not translated.
 */
export default function PlaceholderScene({ scene, phase, active = false }) {
  return (
    <div className={active ? "scene-ph" : "scene-ph metadata-only"}>
      <p className="scene-ph__name">{scene}</p>
      <p className="scene-ph__phase">{phase}</p>
    </div>
  );
}
