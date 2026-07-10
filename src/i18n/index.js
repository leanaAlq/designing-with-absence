/**
 * i18n foundation (tracker B2b).
 *
 * Rules encoded here:
 *  - Every stats.json-templated sentence goes through ICU MessageFormat —
 *    never string concatenation. Arabic has six plural forms (zero, one,
 *    two, few, many, other); ICU handles them, concat cannot.
 *  - Locale is routed via ?lang= (default en); lang + dir are set on
 *    <html> so the whole token/type system flips with it (see tokens.css).
 *  - Archival record data (titles, notes, _raw_json) is NEVER translated:
 *    render it verbatim inside a element carrying its own lang attribute.
 *
 * Open decisions carried as TODOs, not silently resolved:
 *  - L1: numeral system in the Arabic locale (Western 1932 vs Eastern ١٩٣٢).
 *    Verified in this runtime: bare `ar` renders WESTERN digits (7,760);
 *    `ar-u-nu-arab` (or `ar-SA`) renders Eastern (٧٬٧٦٠). Flip in ONE
 *    place — the AR_LOCALE constant below — when L1 is decided.
 *  - L2: data graphics do not mirror in RTL; layout/nav does. Enforced in
 *    components, noted here as the contract.
 */
import i18n from "i18next";
import ICU from "i18next-icu";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import ar from "./locales/ar.json";

export const SUPPORTED = ["en", "ar"];

/** Decision L1 — numeral system for the Arabic locale.
 *  "ar"           → Western digits (current)
 *  "ar-u-nu-arab" → Eastern Arabic digits
 *  Change this constant only; everything routes through it. */
export const AR_LOCALE = "ar";

export function detectLang() {
  const q = new URLSearchParams(window.location.search).get("lang");
  return SUPPORTED.includes(q) ? q : "en";
}

export function applyDocumentLang(lng) {
  const base = lng.startsWith("ar") ? "ar" : "en";
  document.documentElement.lang = base;
  document.documentElement.dir = base === "ar" ? "rtl" : "ltr";
}

i18n
  .use(ICU)
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en }, ar: { translation: ar }, [AR_LOCALE]: { translation: ar } },
    lng: detectLang() === "ar" ? AR_LOCALE : "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    returnNull: false,
  });

applyDocumentLang(i18n.language);
i18n.on("languageChanged", applyDocumentLang);

export default i18n;
