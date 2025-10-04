import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_LANG,
  LANG_EVENT,
  getLanguageSafe,
  getTranslations,
  detectClientLanguage
} from "../i18n/translations.js";

const LanguageFooter = ({ initialLang = DEFAULT_LANG }) => {
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

  const footerText = useMemo(() => {
    const layoutMessages = getTranslations(lang).layout;
    return layoutMessages.footer.replace("{year}", new Date().getFullYear().toString());
  }, [lang]);

  return (
    <footer>
      <div className="container">
        <div className="navbar footerbar" role="contentinfo" aria-label="Site footer">
          {footerText}
        </div>
      </div>
    </footer>
  );
};

export default LanguageFooter;
