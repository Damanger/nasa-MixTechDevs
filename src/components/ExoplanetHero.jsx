import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import BlurText from "./BlurText.jsx";
import {
  DEFAULT_LANG,
  LANG_EVENT,
  detectClientLanguage,
  getLanguageSafe,
  getTranslations
} from "../i18n/translations.js";

export default function ExoplanetHero({ lang = DEFAULT_LANG, messages }) {
  const safeLang = getLanguageSafe(lang);
  const [currentLang, setCurrentLang] = useState(safeLang);
  const heroMessages = useMemo(() => {
    if (messages && currentLang === safeLang) return messages;
    return getTranslations(currentLang).hero;
  }, [currentLang, messages, safeLang]);

  const hints = heroMessages.hints ?? [];
  const [hintIndex, setHintIndex] = useState(0);

  useEffect(() => {
    const preferred = detectClientLanguage(safeLang);
    setCurrentLang((prev) => (prev === preferred ? prev : preferred));

    const handle = (event) => {
      const nextLang = getLanguageSafe(event.detail?.lang);
      setCurrentLang(nextLang);
    };

    window.addEventListener(LANG_EVENT, handle);
    return () => window.removeEventListener(LANG_EVENT, handle);
  }, [safeLang]);

  useEffect(() => {
    if (!hints.length) return undefined;
    let current = 0;
    setHintIndex(0);
    const id = setInterval(() => {
      current = (current + 1) % hints.length;
      setHintIndex(current);
    }, 2400);
    return () => clearInterval(id);
  }, [hints]);

  const currentHint = hints[hintIndex] ?? "";

  return (
    <motion.div
      className="glass hero"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 0.7, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="badge">{heroMessages.badge}</span>
        <BlurText
          as="h1"
          className="title"
          text={heroMessages.title}
          delay={150}
          animateBy="words"
          direction="top"
        />
        <p className="subtitle">
          {heroMessages.subtitle.leading}
          <em>{heroMessages.subtitle.highlight}</em>
          {heroMessages.subtitle.trailing}
        </p>
        <div className="cta">
          <a className="btn" href="/analizar">{heroMessages.ctaPrimary}</a>
        </div>
        <p className="subtitle" style={{ marginTop: ".75rem" }} aria-live="polite">{currentHint}</p>
      </motion.div>

      <motion.div
        className="glass"
        style={{
          padding: "1rem",
          minHeight: "320px",
          display: "grid",
          placeItems: "center",
          overflow: "hidden"
        }}
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          style={{
            width: "min(100%, 460px)",
            aspectRatio: "1 / 1",
            display: "grid",
            placeItems: "center"
          }}
        >
          <img
            src="/exoplanet-512.webp"
            srcSet="/exoplanet-512.webp 512w, /exoplanet.webp 1024w"
            sizes="(max-width: 768px) 80vw, 460px"
            alt="Exoplaneta"
            width={512}
            height={512}
            fetchpriority="high"
            decoding="async"
            loading="eager"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              borderRadius: "14px",
              display: "block",
              boxShadow: "0 10px 30px rgba(0,0,0,.25)"
            }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
