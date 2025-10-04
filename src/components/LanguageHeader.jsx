import { useEffect, useMemo, useState } from "react";
import LanguageSwitcher from "./LanguageSwitcher.jsx";
import {
  DEFAULT_LANG,
  LANG_EVENT,
  getLanguageSafe,
  getTranslations,
  detectClientLanguage
} from "../i18n/translations.js";
import '../assets/css/LanguageHeader.css';

const LanguageHeader = ({ initialLang = DEFAULT_LANG }) => {
  const [lang, setLang] = useState(initialLang);

  // Pathname actual (SSR-safe)
  const [path, setPath] = useState("/");
  useEffect(() => {
    if (typeof window !== "undefined") {
      setPath(window.location.pathname || "/");
    }
  }, []);

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

  const layoutMessages = useMemo(() => getTranslations(lang).layout, [lang]);
  const homeBase = lang === DEFAULT_LANG ? "/" : `/?lang=${lang}`;
  const analyzeBase = lang === DEFAULT_LANG ? "/analizar" : `/analizar?lang=${lang}`;
  const teamBase = lang === DEFAULT_LANG ? "/equipo" : `/equipo?lang=${lang}`;

  // Helper para extraer pathname de un href relativo/absoluto
  const hrefToPath = (href) => {
    if (typeof window === "undefined") return href;
    try {
      return new URL(href, window.location.origin).pathname.replace(/\/+$/, "") || "/";
    } catch {
      return href;
    }
  };

  const normalizedPath = useMemo(
    () => (path ? path.replace(/\/+$/, "") || "/" : "/"),
    [path]
  );

  const navLinks = useMemo(
    () => [
      { href: homeBase, label: layoutMessages.nav.home },
      { href: analyzeBase, label: layoutMessages.nav.analyze },
      { href: teamBase, label: layoutMessages.nav.team }
    ],
    [homeBase, analyzeBase, teamBase, layoutMessages]
  );

  // Texto del indicador según la ruta
  const currentSection = useMemo(() => {
    if (normalizedPath.startsWith("/analizar")) return layoutMessages.nav.analyze;
    if (normalizedPath.startsWith("/equipo")) return layoutMessages.nav.team;
    return layoutMessages.nav.home;
  }, [normalizedPath, layoutMessages]);

  return (
    <>
      <div className="badge">{layoutMessages.badge}</div>

      {/* Indicador accesible del lugar actual */}
      <div className="route-indicator" role="status" aria-live="polite">
        {currentSection}
      </div>

      <nav>
        {navLinks.map((link) => {
          const isActive = hrefToPath(link.href) === normalizedPath;
          return (
            <a
              href={link.href}
              key={link.href}
              aria-current={isActive ? "page" : undefined}
              className={isActive ? "active" : undefined}
              data-active={isActive ? "true" : "false"}
            >
              {link.label}
            </a>
          );
        })}

        <LanguageSwitcher
          lang={lang}
          label={layoutMessages.languageSwitcher.label}
          options={layoutMessages.languageSwitcher.options}
        />
      </nav>
    </>
  );
};

export default LanguageHeader;
