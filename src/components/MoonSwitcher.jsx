import { useEffect, useMemo, useState } from "react";
import MoonPhaseByDate from "./MoonPhaseByDate.jsx";
import MoonCouple from "./MoonCouple.jsx";
import { DEFAULT_LANG, LANG_EVENT, getTranslations, getLanguageSafe, detectClientLanguage } from "../i18n/translations.js";

export default function MoonSwitcher({ messages }) {
  const getInitial = () => {
    try {
      const url = new URL(window.location.href);
      const q = (url.searchParams.get("mode") || "").toLowerCase();
      if (q === "single" || q === "one") return "single";
      if (q === "couple" || q === "two") return "couple";
    } catch {}
    return "couple"; // por defecto mostrar 2 personas
  };

  const [mode, setMode] = useState(typeof window === "undefined" ? "couple" : getInitial());
  const [strings, setStrings] = useState(messages);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("mode", mode);
    window.history.replaceState({}, "", url.toString());
  }, [mode]);

  // Keep translations in sync with client language changes
  useEffect(() => {
    // If messages were provided by server, use them initially; then listen to changes
    const applyLang = (nextLang) => {
      try {
        const safe = getLanguageSafe(nextLang || detectClientLanguage(DEFAULT_LANG));
        setStrings(getTranslations(safe).moon);
      } catch {
        setStrings(messages);
      }
    };

    applyLang();

    const handler = (ev) => {
      const next = ev?.detail?.lang;
      applyLang(next);
    };
    window.addEventListener(LANG_EVENT, handler);
    return () => window.removeEventListener(LANG_EVENT, handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Also update if parent passes new messages (e.g., navigation)
  useEffect(() => {
    if (messages) setStrings(messages);
  }, [messages]);

  const labels = useMemo(() => ({
    label: strings?.modeLabel || "People",
    one: strings?.modeOne || "1 person",
    two: strings?.modeTwo || "2 people",
  }), [strings]);

  return (
    <div className="moonswitcher">
      <div className="moonswitcher__bar" role="group" aria-label={labels.label}>
        <button
          type="button"
          className="moonswitcher__btn"
          data-active={mode === 'single'}
          onClick={() => setMode('single')}
          aria-pressed={mode === 'single'}
        >
          {labels.one}
        </button>
        <button
          type="button"
          className="moonswitcher__btn"
          data-active={mode === 'couple'}
          onClick={() => setMode('couple')}
          aria-pressed={mode === 'couple'}
        >
          {labels.two}
        </button>
      </div>

      <div className="moonswitcher__view">
        {mode === 'single' ? (
          <MoonPhaseByDate messages={strings} />
        ) : (
          <MoonCouple messages={strings} />
        )}
      </div>

      <style>{`
        .moonswitcher{ display:grid; gap:.75rem; }
        .moonswitcher__bar{ display:inline-flex; margin: 0 auto; gap:.35rem; background: rgba(255,255,255,.06); padding:.25rem; border-radius:999px; border:1px solid rgba(255,255,255,.18); width:max-content; }
        .moonswitcher__btn{ border:0; background:transparent; color:inherit; padding:.4rem .8rem; border-radius:999px; cursor:pointer; }
        .moonswitcher__btn[data-active="true"]{ background: var(--accent, #89b4ff); color:#0b1020; font-weight:700; }
      `}</style>
    </div>
  );
}

