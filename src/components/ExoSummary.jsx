import { useEffect, useMemo, useState } from "react";
import {
    DEFAULT_LANG,
    LANG_EVENT,
    detectClientLanguage,
    getLanguageSafe,
    getTranslations
} from "../i18n/translations.js";

/** Normaliza números; opcionalmente trata 0 como null (caso datasets con 0=sin dato). */
const toNum = (v, treatZeroAsNull = false) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return null;
    if (treatZeroAsNull && n === 0) return null;
    return n;
};

const mapRow = (r) => ({
    id: r["No."],
    name: r["Planet Name"],
    host: r["Planet Host"],
    method: r["Discovery Method"] || null,
    year: toNum(r["Discovery Year"]),
    mass: toNum(r["Mass"]),
    distance: toNum(r["Distance"], true),
});

export default function ExoSummary({ src = "/exoplanets.json", lang = DEFAULT_LANG, messages }) {
    const [rows, setRows] = useState(null);
    const [err, setErr] = useState(null);
    const safeLang = getLanguageSafe(lang);
    const [currentLang, setCurrentLang] = useState(safeLang);
    const summaryMessages = useMemo(() => {
        if (messages && currentLang === safeLang) return messages;
        return getTranslations(currentLang).summary;
    }, [currentLang, messages, safeLang]);
    const { cards, nullLabel = "Null" } = summaryMessages;

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
        const ac = new AbortController();
        (async () => {
            try {
                const res = await fetch(src, { signal: ac.signal });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                setRows(Array.isArray(data) ? data.map(mapRow) : []);
            } catch (e) {
                if (e.name !== "AbortError") setErr(e);
            }
        })();
        return () => ac.abort();
    }, [src]);

    const stats = useMemo(() => {
        if (!rows) return null;
        const total = rows.length;

        const years = rows.map(r => r.year).filter(Boolean);
        const minYear = years.length ? Math.min(...years) : null;
        const maxYear = years.length ? Math.max(...years) : null;

        const mCount = new Map();
        for (const r of rows) if (r.method) mCount.set(r.method, (mCount.get(r.method) ?? 0) + 1);
        const topMethods = [...mCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);

        const nearest = rows.filter(r => r.distance != null)
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 5);

        return { total, minYear, maxYear, topMethods, nearest };
    }, [rows]);

    if (err) {
        return <div className="glass card" style={{ padding: "1rem" }}>{summaryMessages.errorPrefix}: {String(err)}</div>;
    }
    if (!stats) {
        return <div className="glass card" style={{ padding: "1rem" }}>{summaryMessages.loading}</div>;
    }

    const { total, minYear, maxYear, topMethods, nearest } = stats;

    const formatNumber = (value) => (value == null ? nullLabel : value.toLocaleString(currentLang));

    const formatYear = (value) => (value == null ? nullLabel : value.toLocaleString(currentLang));

    return (
        <section className="grid" aria-label={summaryMessages.ariaLabel}>
            <article className="glass card">
                <h3>{cards.total.title}</h3>
                <p style={{ fontSize: "2rem", margin: 0 }}>{formatNumber(total)}</p>
                <p>{cards.total.description}</p>
            </article>

            <article className="glass card">
                <h3>{cards.timeRange.title}</h3>
                <p style={{ margin: 0 }}>
                    {formatYear(minYear)}–{formatYear(maxYear)}
                </p>
                <p>{cards.timeRange.description}</p>
            </article>

            <article className="glass card">
                <h3>{cards.topMethods.title}</h3>
                <ul style={{ margin: 0, paddingLeft: "1rem" }}>
                    {topMethods.map(([m, n]) => (
                        <li key={m}>{m} — {n.toLocaleString(currentLang)}</li>
                    ))}
                </ul>
            </article>

            <article className="glass card">
                <h3>{cards.nearest.title}</h3>
                <ol style={{ margin: 0, paddingLeft: "1rem" }}>
                    {nearest.map(p => (
                        <li key={p.id}>
                            {p.name} <span style={{ opacity: .75 }}>({p.distance != null ? `${formatNumber(p.distance)} pc` : nullLabel})</span>
                        </li>
                    ))}
                </ol>
                <p style={{ opacity: .75, marginTop: ".5rem" }}>{cards.nearest.note}</p>
            </article>
        </section>
    );
}
