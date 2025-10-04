import { useEffect, useMemo, useState } from "react";
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

  const handleAnimationComplete = () => {
    console.log("Animation completed!");
  };

  return (
    <div className="glass hero">
      <div>
        <span className="badge">{heroMessages.badge}</span>
        <BlurText
          as="h1"
          className="title"
          text={heroMessages.title}
          delay={150}
          animateBy="words"
          direction="top"
          onAnimationComplete={handleAnimationComplete}
        />
        <p className="subtitle">
          {heroMessages.subtitle.leading}
          <em>{heroMessages.subtitle.highlight}</em>
          {heroMessages.subtitle.trailing}
        </p>
        <div className="cta">
          <a className="btn" href="#metodos">{heroMessages.ctaPrimary}</a>
          <a className="btn secondary" href="#recursos">{heroMessages.ctaSecondary}</a>
        </div>
        <p className="subtitle" style={{ marginTop: ".75rem" }} aria-live="polite">{currentHint}</p>
      </div>

      <div className="glass" style={{ padding: "1rem", minHeight: "260px", display: "grid", placeItems: "center" }}>
        <div style={{ opacity: .85, textAlign: "center" }}>
          <p style={{ margin: 0 }}>{heroMessages.placeholder.body}</p>
          <small style={{ opacity: .75 }}>{heroMessages.placeholder.note}</small>
        </div>
      </div>
    </div>
  );
}
