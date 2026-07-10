/**
 * App.jsx — the page shell.
 *
 * Header (title/subtitle/LangToggle) and footer stay in narrow `.smoke` bands;
 * the scrollytelling core (B3) sits between them full-bleed, because its
 * two-column graphic+steps grid needs the whole inline size — nesting it in
 * the narrow `.smoke` container would starve the graphic column.
 *
 * Proves three foundations still hold through the scroll:
 *   B1  CorpusProvider loads the A8 artifacts;
 *   B4  every figure templates from stats.json via ICU (inside the first step);
 *   B2b the same page renders in Arabic, RTL, with its own type scale.
 */
import { useTranslation } from "react-i18next";
import { AR_LOCALE } from "./i18n/index.js";
import { useCorpus } from "./corpus/CorpusProvider.jsx";
import Core from "./core/core.jsx";

function LangToggle() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language.startsWith("ar");
  const next = isAr ? "en" : AR_LOCALE;
  const switchLang = () => {
    i18n.changeLanguage(next);
    const url = new URL(window.location);
    url.searchParams.set("lang", next.startsWith("ar") ? "ar" : "en");
    window.history.replaceState(null, "", url);
  };
  return (
    <button type="button" onClick={switchLang} className="lang-toggle">
      {t("site.langToggle")}
    </button>
  );
}

export default function App() {
  const { t, i18n } = useTranslation();
  const corpus = useCorpus();

  if (corpus.status === "loading") {
    return <main className="smoke"><p>{t("smoke.loading")}</p></main>;
  }
  if (corpus.status === "error") {
    return (
      <main className="smoke">
        <p className="absent">{t("smoke.dataMissing")}</p>
        <p className="caption">{String(corpus.error)}</p>
      </main>
    );
  }

  const { meta, missing } = corpus;
  const dateLocale = i18n.language.startsWith("ar") ? "ar-SA-u-ca-gregory" : "en-GB";

  return (
    <main>
      <header className="smoke">
        <LangToggle />
        <h1>{t("site.title")}</h1>
        <p className="lede">{t("site.subtitle")}</p>
      </header>

      <Core />

      <div className="smoke">
        {missing.length > 0 && (
          <section className="caption">
            <p className="absent" style={{ padding: "var(--space-2)" }}>
              dev: artifacts not yet in public/data/ — {missing.join(" · ")}
            </p>
          </section>
        )}

        <footer className="caption">
          <p>
            {t("footer.version", {
              version: meta.version ?? "?",
              date: meta.run_date
                ? new Date(meta.run_date).toLocaleDateString(dateLocale)
                : "—",
            })}
          </p>
        </footer>
      </div>
    </main>
  );
}
