import { useEffect, useMemo, useState } from "react";
import LanguageSwitcher from "./LanguageSwitcher.jsx";
import {
  DEFAULT_LANG,
  LANG_EVENT,
  getLanguageSafe,
  getTranslations,
  detectClientLanguage
} from "../i18n/translations.js";

const LanguageHeader = ({ initialLang = DEFAULT_LANG }) => {
  const [lang, setLang] = useState(initialLang);

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
  const navLinks = useMemo(
    () => [
      { href: homeBase, label: layoutMessages.nav.home },
      { href: `${homeBase}#metodos`, label: layoutMessages.nav.methods },
      { href: `${homeBase}#recursos`, label: layoutMessages.nav.resources }
    ],
    [homeBase, layoutMessages]
  );

  return (
    <>
      <div className="badge">{layoutMessages.badge}</div>
      <nav>
        {navLinks.map((link) => (
          <a href={link.href} key={link.href}>{link.label}</a>
        ))}
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
