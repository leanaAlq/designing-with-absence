/**
 * PlaceholderStep.jsx — the scrolling text slot (tracker B3, placeholder).
 *
 * A dumb step: it receives `active` and renders content; it knows nothing
 * about scrollama or the registry. Real scenes swap in their own Step later.
 *
 * OUTER-HEIGHT RULE: the .step wrapper (core.jsx) owns ALL outer sizing. This
 * component must NEVER change its own outer height on `active` — that would
 * move its own scrollama trigger line. `active` only re-colours the card's
 * accent rail; the rail width is reserved in core.css so nothing reflows.
 */
import { useTranslation } from "react-i18next";

export default function PlaceholderStep({ id, active = false, children }) {
  const { t } = useTranslation();
  return (
    <div className={active ? "step-card step-card--active" : "step-card"}>
      <p className="step-card__id">{id}</p>
      <p>{t("core.placeholder")}</p>
      {children}
    </div>
  );
}
