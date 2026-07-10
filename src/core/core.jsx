/**
 * core.jsx — the scrollytelling core: sticky graphic + scrolling
 * steps, one scrollama observer (via useScrollama), and the graphic switcher.
 * Owns the single observer. The active step index drives BOTH the active step
 * (dumb, gets `active`) and which scene the sticky graphic shows. Scenes are
 * keyed by scene NAME, so React reconciles across steps that share a scene and
 * remounts only when the scene actually changes (the graphic must not blink
 * between two steps of one scene).
 *
 */
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useCorpus } from "../corpus/CorpusProvider.jsx";
import { useScrollama } from "./useScrollama.js";
import { CORE, SCENES, SCENE_TABS } from "./core.registry.js";
import "./core.css";

const DEBUG = import.meta.env.DEV && new URLSearchParams(location.search).has("debug");

/**
 * The live stats sentences, mounted inside the first step — proof that B4
 * survives inside the scroll (every figure still templates from stats.json
 * via ICU, never hardcoded).
 */
function CorpusStats() {
  const { t } = useTranslation();
  const { stats } = useCorpus();
  const site = stats.totals.site;
  const archives = Object.keys(stats.per_archive).length;
  return (
    <>
      <p>{t("smoke.corpus", { site, archives })}</p>
      <p>
        {t("smoke.undated", {
          undated: stats.absence.undated.n,
          undatedPct: stats.absence.undated.pct / 100,
        })}
      </p>
      <p>{t("smoke.unplaced", { unplaced: stats.absence.unplaced.n })}</p>
      <p className="metadata-only">
        {t("smoke.notViewable", { notViewable: stats.absence.not_viewable.n })}
      </p>
    </>
  );
}

function SceneNav({ activeScene, onSelect }) {
  const { t } = useTranslation();
  return (
    <nav className="scene-nav" aria-label={t("core.nav.label")}>
      <ul className="scene-nav__list">
        {SCENE_TABS.map(({ scene, id }) => {
          const isActive = scene === activeScene;
          return (
            <li key={scene}>
              <button
                type="button"
                className={isActive ? "scene-nav__tab scene-nav__tab--active" : "scene-nav__tab"}
                aria-current={isActive ? "step" : undefined}
                onClick={() => onSelect(id)}
              >
                {t(`core.tabs.${scene}`)}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default function Core() {
  const { containerRef, index, direction } = useScrollama({
    offset: 0.5,
    progress: false,
    debug: DEBUG,
  });

  const scrollToStep = (id) => {
    containerRef.current
      ?.querySelector(`[data-step="${id}"]`)
      ?.scrollIntoView({ block: "start" });
  };

  // Dev trace for acceptance check 2 (steps fire 0→8; up → -1 above the core).
  // Guarded, so it is inert in the production build.
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log(`[core] index=${index} direction=${direction ?? "–"}`);
    }
  }, [index, direction]);

  // Before the first step (index === -1) show the first scene, inactive.
  const clampedIndex = index < 0 ? 0 : index;
  const activeName = CORE[clampedIndex].scene;
  const activePhase = CORE[clampedIndex].phase;
  const ActiveScene = SCENES[activeName];

  return (
    <section className="core" ref={containerRef}>
      <SceneNav activeScene={activeName} onSelect={scrollToStep} />
      <div className="graphic" data-scene={activeName} aria-hidden="true">
        {/* keyed by scene NAME: reconcile within a scene, remount across scenes */}
        <ActiveScene
          key={activeName}
          scene={activeName}
          phase={activePhase}
          active={index >= 0}
        />
      </div>
      <div className="steps">
        {CORE.map(({ id, Step }, i) => (
          <div className="step" key={id} data-step={id}>
            <Step id={id} active={i === index}>
              {i === 0 ? <CorpusStats /> : null}
            </Step>
          </div>
        ))}
      </div>
    </section>
  );
}
