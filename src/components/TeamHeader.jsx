import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { DEFAULT_LANG, LANG_EVENT, detectClientLanguage, getLanguageSafe, getTranslations } from "../i18n/translations.js";

export default function TeamHeader({ initialLang = DEFAULT_LANG }) {
  const [lang, setLang] = useState(getLanguageSafe(initialLang));

  useEffect(() => {
    const preferred = detectClientLanguage(initialLang);
    setLang((prev) => (prev === preferred ? prev : preferred));

    const handle = (event) => {
      const nextLang = getLanguageSafe(event.detail?.lang);
      setLang(nextLang);
    };
    window.addEventListener(LANG_EVENT, handle);
    return () => window.removeEventListener(LANG_EVENT, handle);
  }, [initialLang]);

  const team = useMemo(() => getTranslations(lang).team, [lang]);

  return (
    <motion.section
      className="glass card team-header"
      style={{ padding: "2rem", textAlign: "center" }}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
    >
      <h1 style={{ margin: 0 }}>{team.title}</h1>
      <p className="subtitle" style={{ maxWidth: "700px", margin: ".5rem auto 0" }}>{team.message}</p>
      <style>{`
        .team-header { margin-top: 0rem; }
        @media (min-width: 821px) {
          .team-header { margin-top: 2rem; }
        }
      `}</style>
    </motion.section>
  );
}
