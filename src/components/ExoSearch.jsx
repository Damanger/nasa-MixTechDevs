import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
    DEFAULT_LANG,
    LANG_EVENT,
    detectClientLanguage,
    getLanguageSafe,
    getTranslations
} from "../i18n/translations.js";
import parseCSV from "../lib/csv.js";
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
            const res = await fetch(src, { signal: ac.signal });
            const txt = await res.text();
            const data = parseCSV(txt);
            setRows(Array.isArray(data) ? data.map(mapRow) : []);
        })().catch(() => { });
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
                <input className="glass" placeholder={filters.queryPlaceholder} value={q} onChange={e => setQ(e.target.value)} style={{ padding: ".6rem .8rem" }} />
                <select className="glass" value={method} onChange={e => setMethod(e.target.value)} style={{ padding: ".6rem .8rem" }}>
                    {methods.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <input className="glass" type="number" placeholder={filters.yearMin} value={yearMin} onChange={e => setYearMin(e.target.value)} style={{ padding: ".6rem .8rem" }} />
                <input className="glass" type="number" placeholder={filters.yearMax} value={yearMax} onChange={e => setYearMax(e.target.value)} style={{ padding: ".6rem .8rem" }} />
            </div>

            <div className="exo-info">
                <span className="exo-chip" title="Nombre oficial o designación del planeta detectado.">Planeta: nombre/designación del exoplaneta.</span>
                <span className="exo-chip" title="Estrella alrededor de la que orbita el planeta.">Host: estrella anfitriona.</span>
                <span className="exo-chip" title="Técnica observacional que permitió la detección (p. ej., Tránsitos, Velocidad Radial, Imagen Directa).">Método: técnica de detección.</span>
                <span className="exo-chip" title="Año de anuncio/confirmación reportado en el catálogo.">Año: descubrimiento reportado.</span>
                <span className="exo-chip" title="Masa aproximada del planeta en masas terrestres (M⊕).">Masa: en M⊕ (Tierras).</span>
                <span className="exo-chip" title="Distancia al sistema en pársecs (pc). 1 pc ≈ 3,26 años luz.">Distancia: en pc (1 pc ≈ 3,26 al).</span>
            </div>

            <div className="exo-table-wrap">
                <table className="exo-table">
                    <thead>
                        <tr>
                            <th className="left" title="Nombre o designación del exoplaneta">{tableHeaders.planet}</th>
                            <th className="left" title="Estrella anfitriona (host)">{tableHeaders.host}</th>
                            <th title="Técnica de detección (Tránsitos, Velocidad Radial, etc.)">{tableHeaders.method}</th>
                            <th title="Año de descubrimiento/confirmación">{tableHeaders.year}</th>
                            <th title="Masa aproximada del planeta en masas terrestres (M⊕)">{tableHeaders.mass}</th>
                            <th title="Distancia al sistema en pársecs (pc). 1 pc ≈ 3,26 años luz">{tableHeaders.distance}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((r, idx) => (
                            <motion.tr
                                key={r.id}
                                className="exo-row glass"
                                initial={{ opacity: 0, y: 12 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-25% 0px" }}
                                transition={{ duration: 0.45, delay: idx * 0.03, ease: [0.16, 1, 0.3, 1] }}
                            >
                                <td className="pad left">{r.name}</td>
                                <td className="pad left">{r.host}</td>
                                <td className="num">{r.method || "—"}</td>
                                <td className="num">{r.year ?? "—"}</td>
                                <td className="num">{r.mass == null ? "—" : `${fmt(r.mass)} M⊕`}</td>
                                <td className="num">{r.distance == null ? "—" : `${fmt(r.distance)} pc`}</td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
                <p style={{ opacity: .7, marginTop: ".5rem" }}>
                    {searchMessages.summary
                        .replace("{shown}", filtered.length.toLocaleString(currentLang))
                        .replace("{total}", rows.length.toLocaleString(currentLang))}
                </p>
            </div>
        </motion.section>
    );
}
