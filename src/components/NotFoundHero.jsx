import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { DEFAULT_LANG, LANG_EVENT, detectClientLanguage, getLanguageSafe, getTranslations } from "../i18n/translations.js";

export default function NotFoundHero({ initialLang = DEFAULT_LANG }) {
  const [lang, setLang] = useState(getLanguageSafe(initialLang));

  useEffect(() => {
    const preferred = detectClientLanguage(initialLang);
    setLang((p) => (p === preferred ? p : preferred));
    const handler = (e) => setLang(getLanguageSafe(e.detail?.lang));
    window.addEventListener(LANG_EVENT, handler);
    return () => window.removeEventListener(LANG_EVENT, handler);
  }, [initialLang]);

  const nf = useMemo(() => getTranslations(lang).notFound, [lang]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <h1>{nf.heading}</h1>
      <p className="subtitle">{nf.description}</p>
      <div className="cta">
        <a href="/" className="btn">{nf.ctaHome}</a>
        <a href="/analizar" className="btn secondary">{nf.ctaExplore}</a>
      </div>
    </motion.div>
  );
}
