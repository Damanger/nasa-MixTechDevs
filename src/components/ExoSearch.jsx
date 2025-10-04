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
import "../assets/css/SearchTable.css";

const toNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
};
const mapRow = (r, idx) => ({
    id: r.pl_name || `${r.pl_name}|${r.hostname}|${idx}`,
    name: r.pl_name,
    host: r.hostname,
    method: r.discoverymethod || "",
    year: toNum(r.disc_year),
    mass: toNum(r.pl_bmasse),
    distance: toNum(r.sy_dist),
});

export default function ExoSearch({ src = "/exoplanets.csv", lang = DEFAULT_LANG, messages }) {
    const [rows, setRows] = useState([]);
    const [q, setQ] = useState("");
    const safeLang = getLanguageSafe(lang);
    const [currentLang, setCurrentLang] = useState(safeLang);
    const searchMessages = useMemo(() => {
        if (messages && currentLang === safeLang) return messages;
        return getTranslations(currentLang).search;
    }, [currentLang, messages, safeLang]);
    const { filters, tableHeaders } = searchMessages;
    const [method, setMethod] = useState(filters.methodAll);
    const [yearMin, setYearMin] = useState("");
    const [yearMax, setYearMax] = useState("");

    useEffect(() => {
        const ac = new AbortController();
        (async () => {
            try {
                const data = await fetchCSV(src, { signal: ac.signal });
                setRows(Array.isArray(data) ? data.map(mapRow) : []);
            } catch {
                // swallow for now
            }
        })();
        return () => ac.abort();
    }, [src]);

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
        setMethod(filters.methodAll);
    }, [filters.methodAll]);

    const methods = useMemo(() => {
        const unique = Array.from(new Set(rows.map(r => r.method).filter(Boolean))).sort();
        return [filters.methodAll, ...unique];
    }, [rows, filters.methodAll]);

    const filtered = useMemo(() => {
        const qx = q.trim().toLowerCase();
        const yMin = yearMin ? Number(yearMin) : -Infinity;
        const yMax = yearMax ? Number(yearMax) : Infinity;

        return rows.filter(r => {
            const okQ = !qx || r.name.toLowerCase().includes(qx) || (r.host || "").toLowerCase().includes(qx);
            const okM = method === filters.methodAll || r.method === method;
            const y = r.year ?? NaN;
            const okY = Number.isNaN(y) ? true : (y >= yMin && y <= yMax);
            return okQ && okM && okY;
        }).slice(0, 20);
    }, [rows, q, method, yearMin, yearMax, filters.methodAll]);

    const fmt = (n, opts={}) => (n == null ? "—" : Number(n).toLocaleString(currentLang, { maximumFractionDigits: 2, ...opts }));

    const labels = useMemo(() => {
        const map = {
            es: { search: "Buscar por planeta u host", method: "Filtrar por método" },
            en: { search: "Search by planet or host", method: "Filter by method" },
            de: { search: "Nach Planet oder Stern suchen", method: "Nach Methode filtern" },
        };
        return map[currentLang] || map.en;
    }, [currentLang]);

    const emptyState = useMemo(() => {
        const map = {
            es: "Sin resultados. Ajusta los filtros o la búsqueda.",
            en: "No results. Adjust filters or search.",
            de: "Keine Ergebnisse. Filter oder Suche anpassen.",
        };
        return map[currentLang] || map.en;
    }, [currentLang]);

    return (
        <motion.section
            className="glass card"
            style={{ marginTop: "1rem" }}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
            <h3 style={{ marginTop: 0 }}>{searchMessages.title}</h3>
            <div className="search-controls">
                <input
                    className="glass"
                    placeholder={filters.queryPlaceholder}
                    aria-label={labels.search}
                    value={q}
                    onChange={e => setQ(e.target.value)}
                    style={{ padding: ".6rem .8rem" }}
                />
                <select
                    className="glass"
                    value={method}
                    onChange={e => setMethod(e.target.value)}
                    style={{ padding: ".6rem .8rem" }}
                    aria-label={labels.method}
                >
                    {methods.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <input
                    className="glass"
                    type="number"
                    placeholder={filters.yearMin}
                    aria-label={filters.yearMin}
                    value={yearMin}
                    onChange={e => setYearMin(e.target.value)}
                    style={{ padding: ".6rem .8rem" }}
                />
                <input
                    className="glass"
                    type="number"
                    placeholder={filters.yearMax}
                    aria-label={filters.yearMax}
                    value={yearMax}
                    onChange={e => setYearMax(e.target.value)}
                    style={{ padding: ".6rem .8rem" }}
                />
            </div>

            <div className="exo-info">
                <span className="exo-chip" title={searchMessages.legend.planetHint}>{searchMessages.legend.planet}</span>
                <span className="exo-chip" title={searchMessages.legend.hostHint}>{searchMessages.legend.host}</span>
                <span className="exo-chip" title={searchMessages.legend.methodHint}>{searchMessages.legend.method}</span>
                <span className="exo-chip" title={searchMessages.legend.yearHint}>{searchMessages.legend.year}</span>
                <span className="exo-chip" title={searchMessages.legend.massHint}>{searchMessages.legend.mass}</span>
                <span className="exo-chip" title={searchMessages.legend.distanceHint}>{searchMessages.legend.distance}</span>
            </div>

            <div className="exo-table-wrap">
                <div className="exo-table-glow" aria-hidden />
                {filtered.length > 0 ? (
                    <table className="exo-table">
                        <caption className="sr-only">{searchMessages.title}</caption>
                        <thead>
                            <tr>
                                <th scope="col" className="left" title={tableHeaders.planetHint}>{tableHeaders.planet}</th>
                                <th scope="col" className="left" title={tableHeaders.hostHint}>{tableHeaders.host}</th>
                                <th scope="col" title={tableHeaders.methodHint}>{tableHeaders.method}</th>
                                <th scope="col" title={tableHeaders.yearHint}>{tableHeaders.year}</th>
                                <th scope="col" title={tableHeaders.massHint}>{tableHeaders.mass}</th>
                                <th scope="col" title={tableHeaders.distanceHint}>{tableHeaders.distance}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((r, idx) => (
                                <motion.tr
                                    key={r.id}
                                    className="exo-row"
                                    initial={{ opacity: 0, y: 18 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-25% 0px" }}
                                    transition={{ duration: 0.45, delay: idx * 0.035, ease: [0.16, 1, 0.3, 1] }}
                                >
                                    <td className="pad left">
                                        <span className="cell-heading">{tableHeaders.planet}</span>
                                        <span className="cell-value">{r.name}</span>
                                    </td>
                                    <td className="pad left">
                                        <span className="cell-heading">{tableHeaders.host}</span>
                                        <span className="cell-value">{r.host}</span>
                                    </td>
                                    <td className="num">
                                        <span className="cell-heading">{tableHeaders.method}</span>
                                        <span className="cell-value">{r.method || searchMessages.emptyValue}</span>
                                    </td>
                                    <td className="num">
                                        <span className="cell-heading">{tableHeaders.year}</span>
                                        <span className="cell-value">{r.year ?? searchMessages.emptyValue}</span>
                                    </td>
                                    <td className="num">
                                        <span className="cell-heading">{tableHeaders.mass}</span>
                                        <span className="cell-value">{r.mass == null ? searchMessages.emptyValue : `${fmt(r.mass)} M⊕`}</span>
                                    </td>
                                    <td className="num">
                                        <span className="cell-heading">{tableHeaders.distance}</span>
                                        <span className="cell-value">{r.distance == null ? searchMessages.emptyValue : `${fmt(r.distance)} pc`}</span>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="glass card" role="status" aria-live="polite" style={{ padding: ".9rem", marginTop: ".5rem" }}>
                        {emptyState}
                    </div>
                )}
                <footer className="exo-table-footer">
                    <div className="exo-table-footer__meta">
                        <span className="exo-stats-chip">
                            <span className="dot" aria-hidden />
                            {searchMessages.summary
                                .replace("{shown}", filtered.length.toLocaleString(currentLang))
                                .replace("{total}", rows.length.toLocaleString(currentLang))}
                        </span>
                        <span className="exo-stats-chip ghost">{searchMessages.footerHint}</span>
                    </div>
                    <button
                        type="button"
                        className="exo-scroll-top"
                        onClick={() => {
                            if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                    >
                        {searchMessages.backTop}
                    </button>
                </footer>
            </div>
        </motion.section>
    );
}
