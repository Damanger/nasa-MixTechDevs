import { useEffect, useId, useMemo, useState } from "react";
import {
  DEFAULT_LANG,
  LANG_COOKIE,
  LANG_EVENT,
  detectClientLanguage,
  getLanguageSafe
} from "../i18n/translations.js";

const persistLanguage = (value) => {
  try {
    localStorage.setItem(LANG_COOKIE, value);
  } catch (err) {
    // ignore storage errors (private mode, etc.)
  }
  try {
    document.cookie = `${LANG_COOKIE}=${value};path=/;max-age=31536000;samesite=lax`;
  } catch (err) {
    // ignore cookie write errors
  }
};

const LanguageSwitcher = ({ lang = DEFAULT_LANG, label = "Idioma", options = {} }) => {
  const entries = useMemo(() => Object.entries(options), [options]);
  const [current, setCurrent] = useState(lang);

  useEffect(() => {
    setCurrent(lang);
  }, [lang]);

  const handleSelect = (targetLang) => {
    const safeTarget = getLanguageSafe(targetLang);
    if (safeTarget === current) return;
    setCurrent(safeTarget);

    const url = new URL(window.location.href);
    if (safeTarget === DEFAULT_LANG) {
      url.searchParams.delete("lang");
    } else {
      url.searchParams.set("lang", safeTarget);
    }

    persistLanguage(safeTarget);
    window.history.replaceState({}, "", url.toString());
    window.dispatchEvent(new CustomEvent(LANG_EVENT, { detail: { lang: safeTarget } }));
  };

  const labelId = useId();

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const preferred = detectClientLanguage(lang);
    const safePreferred = getLanguageSafe(preferred);

    setCurrent((prev) => (prev === safePreferred ? prev : safePreferred));

    // ensure URL reflects preferred language without causing navigation
    const url = new URL(window.location.href);
    if (safePreferred === DEFAULT_LANG) {
      url.searchParams.delete("lang");
    } else {
      url.searchParams.set("lang", safePreferred);
    }
    window.history.replaceState({}, "", url.toString());

    persistLanguage(safePreferred);
    window.dispatchEvent(new CustomEvent(LANG_EVENT, { detail: { lang: safePreferred } }));

    const syncListener = (event) => {
      const nextLang = getLanguageSafe(event.detail?.lang ?? DEFAULT_LANG);
      setCurrent(nextLang);
    };

    window.addEventListener(LANG_EVENT, syncListener);
    return () => {
      window.removeEventListener(LANG_EVENT, syncListener);
    };
  }, [lang]);

  return (
    <div className="language-switcher">
      <span className="language-switcher__label" id={labelId}>{label}</span>
      <div className="language-switcher__group" role="group" aria-labelledby={labelId}>
        {entries.map(([value, text]) => (
          <button
            key={value}
            type="button"
            className="language-switcher__button"
            data-active={value === current}
            onClick={() => handleSelect(value)}
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSwitcher;
