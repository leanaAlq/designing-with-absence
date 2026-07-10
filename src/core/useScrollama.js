/**
 * useScrollama.js — one scrollama observer wrapped as a hook.
 *
 * The core owns exactly one observer. Steps are dumb: they receive `active`
 * as a prop and never import scrollama. Data flows one way: scroll position →
 * { index, direction } → the core re-renders the active step + scene.
 *
 * StrictMode-safe: the effect's cleanup calls scroller.destroy(), so dev's
 * mount → unmount → remount leaves exactly one live observer (no doubled
 * onStepEnter events).
 */
import { useEffect, useRef, useState } from "react";
import scrollama from "scrollama";
import i18n from "../i18n/index.js";

/**
 * @param {object}  [opts]
 * @param {number}  [opts.offset=0.5]     trigger line, 0..1 down the viewport.
 * @param {boolean} [opts.progress=false] enable onStepProgress. Plumbing only
 * @param {boolean} [opts.debug=false]    scrollama trigger-line overlay.
 * @returns {{ containerRef: React.RefObject, index: number,
 *             direction: ("up"|"down"|null), progress: number }}
 *   index === -1 is the pre-core state (above the first step).
 */
export function useScrollama({ offset = 0.5, progress = false, debug = false } = {}) {
  const [state, setState] = useState({ index: -1, direction: null, progress: 0 });
  const containerRef = useRef(null);
  const scrollerRef = useRef(null);

  useEffect(() => {
    const scroller = scrollama();
    scrollerRef.current = scroller;

    scroller
      .setup({
        step: containerRef.current.querySelectorAll(".step"),
        offset,
        progress,
        debug,
      })
      .onStepEnter(({ index, direction }) =>
        setState((s) => ({ ...s, index, direction })))
      .onStepExit(({ index, direction }) => {
        // Leaving the first step upward = scrolled above the whole core.
        // index -1 makes that pre-core state representable (hard req. 2).
        if (direction === "up" && index === 0) {
          setState((s) => ({ ...s, index: -1, direction }));
        }
      })
      .onStepProgress(({ index, progress }) =>
        setState((s) => ({ ...s, index, progress })));

    const onResize = () => scroller.resize();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      scroller.destroy();
      scrollerRef.current = null;
    };
  }, [offset, progress, debug]);

  // Locale flip changes copy heights → scrollama's cached trigger positions
  useEffect(() => {
    const onLang = () => scrollerRef.current?.resize();
    i18n.on("languageChanged", onLang);
    return () => i18n.off("languageChanged", onLang);
  }, []);

  return {
    containerRef,
    index: state.index,
    direction: state.direction,
    progress: state.progress,
  };
}
