/**
 * core.registry.js — the 9-step core: the single source of truth for the
 * scrollytelling spine (tracker B3).
 *
 * ONE array in ONE file on purpose. Decisions O1 (merge Place/Time) and the
 * final narrative order are still open, so the core must be trivially
 * reorderable: reorder / add / remove rows here and nothing else changes.
 *
 * Fields:
 *  - id:    stable step key (also data-step, and the i18n copy namespace).
 *  - scene: which graphic the sticky panel renders. Consecutive steps sharing
 *           a scene value must NOT remount the graphic between them — the core
 *           keys the active scene by this value (see core.jsx).
 *  - phase: passed to the scene so one scene can stage multiple steps.
 *  - Step:  the component rendered in the scrolling column.
 *
 * Naming note: the brief's `spine`→`core` rename would have made the array a
 * lowercase `core`, colliding with the <Core /> component. Kept all-caps
 * (CORE, matching the original SPINE convention) to avoid that.
 */
import PlaceholderStep from "../scenes/placeholder/PlaceholderStep.jsx";
import PlaceholderScene from "../scenes/placeholder/PlaceholderScene.jsx";

export const CORE = [
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

export const SCENES = {
  openers:    PlaceholderScene,
  sceneA:     PlaceholderScene,
  makerScene: PlaceholderScene,
  visScene:   PlaceholderScene,
  grid:       PlaceholderScene,
};
