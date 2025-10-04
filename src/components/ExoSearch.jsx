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

    const filteredAll = useMemo(() => {
        const qx = q.trim().toLowerCase();
        const yMin = yearMin ? Number(yearMin) : -Infinity;
        const yMax = yearMax ? Number(yearMax) : Infinity;

        return rows.filter(r => {
            const okQ = !qx || r.name.toLowerCase().includes(qx) || (r.host || "").toLowerCase().includes(qx);
            const okM = method === filters.methodAll || r.method === method;
            const y = r.year ?? NaN;
            const okY = Number.isNaN(y) ? true : (y >= yMin && y <= yMax);
            return okQ && okM && okY;
        });
    }, [rows, q, method, yearMin, yearMax, filters.methodAll]);

    // Pagination
    const PAGE_SIZE = 20;
    const [page, setPage] = useState(1);
    const totalPages = Math.max(1, Math.ceil(filteredAll.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const startIdx = (currentPage - 1) * PAGE_SIZE;
    const pageItems = filteredAll.slice(startIdx, startIdx + PAGE_SIZE);

    // Reset/clamp page when filters or dataset change
    useEffect(() => { setPage(1); }, [q, method, yearMin, yearMax, rows]);

    const fmt = (n, opts={}) => (n == null ? "—" : Number(n).toLocaleString(currentLang, { maximumFractionDigits: 2, ...opts }));

    const labels = useMemo(() => {
        const map = {
            es: { search: "Buscar por planeta u host", method: "Filtrar por método" },
            en: { search: "Search by planet or host", method: "Filter by method" },
            de: { search: "Nach Planet oder Stern suchen", method: "Nach Methode filtern" },
        };
        return map[currentLang] || map.en;
    }, [currentLang]);

    const paginationLang = useMemo(() => {
        const map = {
            es: {
                nav: "Paginación",
                first: "Primera página",
                prev: "Página anterior",
                next: "Página siguiente",
                last: "Última página",
            },
            en: {
                nav: "Pagination",
                first: "First page",
                prev: "Previous page",
                next: "Next page",
                last: "Last page",
            },
            de: {
                nav: "Seitennavigation",
                first: "Erste Seite",
                prev: "Vorherige Seite",
                next: "Nächste Seite",
                last: "Letzte Seite",
            },
        };
        return map[currentLang] || map.en;
    }, [currentLang]);

    // Year range (from first exoplanet discovery or dataset min to current year)
    const yearsRange = useMemo(() => {
        const now = new Date().getFullYear();
        const years = rows.map(r => r.year).filter(y => Number.isFinite(y));
        const minData = years.length ? Math.min(...years) : 1992; // 1992: primeros exoplanetas
        const start = Math.min(1992, minData);
        const list = Array.from({ length: now - start + 1 }, (_, i) => String(start + i));
        return { start, now, list };
    }, [rows]);

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
                    min={yearsRange.start}
                    max={yearsRange.now}
                    step={1}
                    list="exo-years"
                />
                <input
                    className="glass"
                    type="number"
                    placeholder={filters.yearMax}
                    aria-label={filters.yearMax}
                    value={yearMax}
                    onChange={e => setYearMax(e.target.value)}
                    style={{ padding: ".6rem .8rem" }}
                    min={yearsRange.start}
                    max={yearsRange.now}
                    step={1}
                    list="exo-years"
                />
            </div>

            {/* Year suggestions shared by both inputs */}
            <datalist id="exo-years">
                {yearsRange.list.map((y) => (
                    <option key={y} value={y} />
                ))}
            </datalist>

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
                {filteredAll.length > 0 ? (
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
                            {pageItems.map((r, idx) => (
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
                                .replace("{shown}", pageItems.length.toLocaleString(currentLang))
                                .replace("{total}", rows.length.toLocaleString(currentLang))}
                        </span>
                        <span className="exo-stats-chip ghost">{searchMessages.footerHint}</span>
                    </div>
                    {totalPages > 1 && (
                        <nav className="exo-pagination" aria-label={paginationLang.nav} style={{ display: "flex", gap: ".4rem", alignItems: "center", flexWrap: "wrap" }}>
                            <button className="btn secondary" onClick={() => setPage(1)} disabled={currentPage === 1} aria-label={paginationLang.first}>&laquo;</button>
                            <button className="btn secondary" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} aria-label={paginationLang.prev}>&lsaquo;</button>
                            {(() => {
                                const windowSize = 5;
                                const start = Math.max(1, currentPage - Math.floor(windowSize / 2));
                                const end = Math.min(totalPages, start + windowSize - 1);
                                const items = [];
                                for (let i = start; i <= end; i++) {
                                    items.push(
                                        <button
                                            key={i}
                                            className="btn secondary"
                                            aria-current={i === currentPage ? "page" : undefined}
                                            onClick={() => setPage(i)}
                                            style={i === currentPage ? { borderColor: "rgba(137,180,255,.5)" } : undefined}
                                        >
                                            {i}
                                        </button>
                                    );
                                }
                                return items;
                            })()}
                            <button className="btn secondary" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} aria-label={paginationLang.next}>&rsaquo;</button>
                            <button className="btn secondary" onClick={() => setPage(totalPages)} disabled={currentPage === totalPages} aria-label={paginationLang.last}>&raquo;</button>
                        </nav>
                    )}
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
