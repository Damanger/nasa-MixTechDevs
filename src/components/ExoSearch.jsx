import { useEffect, useMemo, useState } from "react";
import {
    DEFAULT_LANG,
    LANG_EVENT,
    detectClientLanguage,
    getLanguageSafe,
    getTranslations
} from "../i18n/translations.js";

const toNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
};
const mapRow = (r) => ({
    id: r["No."],
    name: r["Planet Name"],
    host: r["Planet Host"],
    method: r["Discovery Method"] || "",
    year: toNum(r["Discovery Year"]),
    mass: toNum(r["Mass"]),
    distance: toNum(r["Distance"]),
});

export default function ExoSearch({ src = "/exoplanets.json", lang = DEFAULT_LANG, messages }) {
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
            const data = await res.json();
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

    return (
        <section className="glass card" style={{ marginTop: "1rem" }}>
            <h3 style={{ marginTop: 0 }}>{searchMessages.title}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "0.75rem" }}>
                <input className="glass" placeholder={filters.queryPlaceholder} value={q} onChange={e => setQ(e.target.value)} style={{ padding: ".6rem .8rem" }} />
                <select className="glass" value={method} onChange={e => setMethod(e.target.value)} style={{ padding: ".6rem .8rem" }}>
                    {methods.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <input className="glass" type="number" placeholder={filters.yearMin} value={yearMin} onChange={e => setYearMin(e.target.value)} style={{ padding: ".6rem .8rem" }} />
                <input className="glass" type="number" placeholder={filters.yearMax} value={yearMax} onChange={e => setYearMax(e.target.value)} style={{ padding: ".6rem .8rem" }} />
            </div>

            <div style={{ marginTop: "1rem", overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 .5rem" }}>
                    <thead style={{ opacity: .8, fontSize: ".9rem" }}>
                        <tr>
                            <th style={{ textAlign: "left" }}>{tableHeaders.planet}</th>
                            <th style={{ textAlign: "left" }}>{tableHeaders.host}</th>
                            <th>{tableHeaders.method}</th>
                            <th>{tableHeaders.year}</th>
                            <th>{tableHeaders.mass}</th>
                            <th>{tableHeaders.distance}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(r => (
                            <tr key={r.id} className="glass" style={{ borderRadius: "10px" }}>
                                <td style={{ padding: ".6rem .8rem" }}>{r.name}</td>
                                <td style={{ padding: ".6rem .8rem" }}>{r.host}</td>
                                <td style={{ textAlign: "center" }}>{r.method || "—"}</td>
                                <td style={{ textAlign: "center" }}>{r.year ?? "—"}</td>
                                <td style={{ textAlign: "center" }}>{r.mass ?? "—"}</td>
                                <td style={{ textAlign: "center" }}>{r.distance ?? "—"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <p style={{ opacity: .7, marginTop: ".5rem" }}>
                    {searchMessages.summary
                        .replace("{shown}", filtered.length.toLocaleString(currentLang))
                        .replace("{total}", rows.length.toLocaleString(currentLang))}
                </p>
            </div>
        </section>
    );
}
