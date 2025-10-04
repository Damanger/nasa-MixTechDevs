import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
    DEFAULT_LANG,
    LANG_EVENT,
    detectClientLanguage,
    getLanguageSafe,
    getTranslations
} from "../i18n/translations.js";
import fetchCSV from "../lib/fetchCSV.js";

/** Normaliza números; opcionalmente trata 0 como null (caso datasets con 0=sin dato). */
const toNum = (v, treatZeroAsNull = false) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return null;
    if (treatZeroAsNull && n === 0) return null;
    return n;
};

const mapRow = (r, idx) => ({
    id: r.pl_name || `${r.pl_name}|${r.hostname}|${idx}`,
    name: r.pl_name,
    host: r.hostname,
    method: r.discoverymethod || null,
    year: toNum(r.disc_year),
    mass: toNum(r.pl_bmasse),
    distance: toNum(r.sy_dist, true),
});

export default function ExoSummary({ src = "/exoplanets.csv", lang = DEFAULT_LANG, messages }) {
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
                const data = await fetchCSV(src, { signal: ac.signal });
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
        return (
            <motion.div
                className="glass card"
                style={{ padding: "1rem" }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
                {summaryMessages.errorPrefix}: {String(err)}
            </motion.div>
        );
    }
    if (!stats) {
        return (
            <motion.div
                className="glass card"
                style={{ padding: "1rem" }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
                {summaryMessages.loading}
            </motion.div>
        );
    }

    const { total, minYear, maxYear, topMethods, nearest } = stats;

    const formatNumber = (value) => (value == null ? nullLabel : value.toLocaleString(currentLang));

    const formatYear = (value) => (value == null ? nullLabel : value.toLocaleString(currentLang));

    return (
        <motion.section
            className="summary-bento"
            aria-label={summaryMessages.ariaLabel}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        >
            {/* Tile grande vertical */}
            <motion.article
                className="glass card tile total"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10% 0px" }}
                transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
                <div className="kicker" aria-hidden>🪐</div>
                <div className="numb">{formatNumber(total)}</div>
                <h3 className="heading">{cards.total.title}</h3>
                <p className="copy">{cards.total.description}</p>
            </motion.article>

            {/* Arriba: dos tiles pequeñas */}
            <motion.article
                className="glass card tile time"
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-15% 0px" }}
                transition={{ duration: 0.65, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            >
                <div className="kicker" aria-hidden>⏱️</div>
                <h3 className="heading small">{cards.timeRange.title}</h3>
                <div className="value">{formatYear(minYear)}–{formatYear(maxYear)}</div>
                <p className="copy muted">{cards.timeRange.description}</p>
            </motion.article>

            <motion.article
                className="glass card tile methods"
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-15% 0px" }}
                transition={{ duration: 0.65, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
            >
                <div className="kicker" aria-hidden>🔭</div>
                <h3 className="heading small">{cards.topMethods.title}</h3>
                <ul className="list">
                    {topMethods.map(([m, n]) => (
                        <li key={m}><strong>{m}</strong><span>{n.toLocaleString(currentLang)}</span></li>
                    ))}
                </ul>
            </motion.article>

            {/* Abajo: tile ancho */}
            <motion.article
                className="glass card tile nearest"
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-15% 0px" }}
                transition={{ duration: 0.65, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
                <div className="kicker" aria-hidden>🛰️</div>
                <h3 className="heading small">{cards.nearest.title}</h3>
                <ol className="list">
                    {nearest.map(p => (
                        <li key={p.id}><strong>{p.name}</strong><span>{p.distance != null ? `${formatNumber(p.distance)} pc` : nullLabel}</span></li>
                    ))}
                </ol>
                <p className="copy muted note">{cards.nearest.note}</p>
            </motion.article>

            <style>{`
              .summary-bento{ display:grid; gap:.8rem; grid-template-columns:1.4fr 1fr 1fr; align-items:stretch; margin-top:1rem; }
              @media (max-width:1024px){ .summary-bento{ grid-template-columns:1fr 1fr; } }
              @media (max-width:640px){ .summary-bento{ grid-template-columns:1fr; gap:.7rem; } }
              .tile{ position:relative; padding:1.1rem; border-radius:16px; overflow:hidden; }
              .tile .kicker{ display:inline-flex; align-items:center; justify-content:center; width:34px; height:34px; border-radius:999px; background:rgba(255,255,255,.06); border:1px solid var(--glass-brd); box-shadow:0 0 28px rgba(137,180,255,.25), inset 0 1px 0 rgba(255,255,255,.05); }
              .tile .heading{ margin:.5rem 0 .25rem; }
              .tile .heading.small{ margin:.25rem 0; font-size:1.05rem; }
              .tile .copy{ margin:.35rem 0 0; }
              .tile .copy.muted{ opacity:.8; }
              .tile.total{ grid-row:1 / span 2; grid-column:1; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:2rem 1.5rem; }
              .tile.total .numb{ font-weight:900; font-size: clamp(2rem, 6.5vw, 3.4rem); letter-spacing:.5px; background:linear-gradient(180deg,#e6eaff 0%,#b7c0e6 100%); -webkit-background-clip:text; background-clip:text; color:transparent; text-shadow:0 0 32px rgba(137,180,255,.15); }
              .tile.total::before{ content:""; position:absolute; right:-140px; top:-140px; width:360px; height:360px; border-radius:50%; background: radial-gradient(closest-side, rgba(137,180,255,.22), rgba(137,180,255,.1) 50%, transparent 70%); filter:blur(12px); }
              .tile.total::after{ content:""; position:absolute; left:-60px; bottom:-60px; width:150px; height:150px; border-radius:50%; background: radial-gradient(circle, rgba(255,255,255,.08), transparent 70%); filter: blur(8px); }
              @media (max-width:640px){
                .tile{ padding:.9rem; border-radius:14px; }
                .tile .heading.small{ font-size:1rem; }
                .tile.total{ grid-row:auto; grid-column:auto; padding:1.4rem 1rem; }
                .tile.total .numb{ font-size: clamp(1.8rem, 9vw, 2.4rem); }
                .tile.total::before, .tile.total::after{ display:none; }
              }
              .tile.time{ grid-column:2; }
              .tile.methods{ grid-column:3; }
              .tile.nearest{ grid-column:2 / span 2; display:flex; flex-direction:column; }
              @media (max-width:640px){
                .tile.time, .tile.methods, .tile.nearest{ grid-column:auto; }
              }
              .tile .list{ margin:.25rem 0 0; padding:0; list-style:none; display:grid; gap:.25rem; }
              .tile .list li{ display:flex; justify-content:space-between; gap:.75rem; border:1px solid var(--glass-brd); background:rgba(255,255,255,.04); padding:.5rem .6rem; border-radius:10px; }
              .tile .list li span{ opacity:.85; }
              .tile.nearest .list{ grid-template-columns:1fr; max-height:200px; overflow:auto; padding-right:.25rem; }
              @media (max-width:640px){ .tile.nearest .list{ max-height:260px; } }
              .tile.nearest .note{ margin-top:.5rem; }
            `}</style>
        </motion.section>
    );
}
