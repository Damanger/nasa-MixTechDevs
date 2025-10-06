import { useEffect, useState } from "react";
import { DEFAULT_LANG, LANG_EVENT, detectClientLanguage, getLanguageSafe, getTranslations } from "../i18n/translations.js";

export default function MoonHeader({ messages }) {
    const [strings, setStrings] = useState(messages);

    useEffect(() => {
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

    useEffect(() => {
        if (messages) setStrings(messages);
    }, [messages]);

    if (!strings) return null;

    return (
        <>
            <h1 className="moon-title" style={{ marginBottom: ".5rem" }}>{strings.title}</h1>
            <p className="moon-sub">{strings.subtitle}</p>
        </>
    );
}
