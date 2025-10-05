import { useEffect, useMemo, useState } from "react";
import { DEFAULT_LANG, LANG_EVENT, detectClientLanguage, getLanguageSafe, getTranslations } from "../i18n/translations.js";

export default function SolarSystemHero({ initialLang = DEFAULT_LANG }) {
  const [lang, setLang] = useState(getLanguageSafe(initialLang));

  useEffect(() => {
    const preferred = detectClientLanguage(initialLang);
    setLang((p) => (p === preferred ? p : preferred));
    const handler = (e) => setLang(getLanguageSafe(e.detail?.lang));
    window.addEventListener(LANG_EVENT, handler);
    return () => window.removeEventListener(LANG_EVENT, handler);
  }, [initialLang]);

  const solar = useMemo(() => getTranslations(lang).solar, [lang]);

  return (
    <div>
      <h1 style={{ margin: 0, fontSize: "clamp(2rem,5vw,2.6rem)" }}>{solar.title}</h1>
      <h3 className="subtitle" style={{ maxWidth: 560, margin: "0.5rem auto 0", fontWeight: 500, color: "var(--text-secondary)" }}>{solar.subtitle}</h3>
    </div>
  );
}

