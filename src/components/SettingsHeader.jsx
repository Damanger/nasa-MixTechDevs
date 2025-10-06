import { useEffect, useState } from "react";
import { DEFAULT_LANG, LANG_EVENT, detectClientLanguage, getLanguageSafe, getTranslations } from "../i18n/translations.js";

export default function SettingsHeader({ initial }) {
  const [strings, setStrings] = useState(initial);

  useEffect(() => {
    const apply = (nextLang) => {
      try {
        const safe = getLanguageSafe(nextLang || detectClientLanguage(DEFAULT_LANG));
        setStrings(getTranslations(safe).settings);
      } catch {
        setStrings(initial);
      }
    };
    apply();
    const handler = (ev) => apply(ev?.detail?.lang);
    window.addEventListener(LANG_EVENT, handler);
    return () => window.removeEventListener(LANG_EVENT, handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { if (initial) setStrings(initial); }, [initial]);

  if (!strings) return null;
  return (
    <>
      <h1 style={{ margin: 0, fontSize: "clamp(2rem,5vw,2.6rem)" }}>{strings.title}</h1>
      <h3 className="subtitle" style={{ maxWidth: 560, margin: ".5rem auto 0", fontWeight: 500, color: "var(--text-secondary)" }}>{strings.subtitle}</h3>
    </>
  );
}
