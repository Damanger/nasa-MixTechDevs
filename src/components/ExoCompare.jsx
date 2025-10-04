import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
// Heavy 3D renderer is split out and lazy-loaded
import { lazy, Suspense } from "react";
import {
    DEFAULT_LANG,
    LANG_EVENT,
    detectClientLanguage,
    getLanguageSafe,
    getTranslations
} from "../i18n/translations.js";
import fetchCSV from "../lib/fetchCSV.js";

const ThreeCompare = lazy(() => import("./ThreeCompare.jsx"));

// --- Utilidades ---
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
    method: r.discoverymethod || "",
    year: toNum(r.disc_year),
    massE: toNum(r.pl_bmasse),
    radiusE: toNum(r.pl_rade),
    tempEq: toNum(r.pl_eqt),
    flux: toNum(r.pl_insol),
    distance: toNum(r.sy_dist, true),
    specType: r.st_spectype || "",
});

const clamp = (x, a, b) => Math.min(Math.max(x, a), b);

// Radio visual (not-to-scale): usa radio real si viene; si no, r ~ M^(1/3) para densidad similar
function visualRadiusR(massE, radiusE) {
    if (radiusE && radiusE > 0) return clamp(radiusE, 0.4, 15);
    if (!massE || massE <= 0) return 1;
    const r = Math.cbrt(massE);
    return clamp(r, 0.4, 15);
}


export default function ExoCompare({ src = "/exoplanets.csv", lang = DEFAULT_LANG, messages }) {
    const [rows, setRows] = useState([]);
    const [q, setQ] = useState("Proxima Cen d");
    const [autoRotate, setAutoRotate] = useState(true);
    const [mode, setMode] = useState("earth-exo"); // 'earth-exo' | 'jupiter-exo' | 'all'
    const safeLang = getLanguageSafe(lang);
    const [currentLang, setCurrentLang] = useState(safeLang);
    const compareMessages = useMemo(() => {
        if (messages && currentLang === safeLang) return messages;
        return getTranslations(currentLang).compare;
    }, [messages, currentLang, safeLang]);
    const nullLabel = compareMessages.nullLabel ?? "Null";

    const modeAriaLabel = useMemo(() => {
        const map = { es: "Modo de comparación", en: "Comparison mode", de: "Vergleichsmodus" };
        return map[currentLang] || map.en;
    }, [currentLang]);

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
            } catch {
                // swallow for now
            }
        })();
        return () => ac.abort();
    }, [src]);

    const options = useMemo(() => rows.map(r => r.name).filter(Boolean).sort(), [rows]);

    const planet = useMemo(() => {
        if (!rows.length) return null;
        const byName = rows.find(r => (r.name || "").toLowerCase() === (q || "").toLowerCase());
        return byName || rows[0];
    }, [rows, q]);

    const rExo = useMemo(() => {
        if (!planet) return 1;
        return visualRadiusR(planet.massE, planet.radiusE);
    }, [planet]);

    const JUPITER_R_EARTH = 11.21; // ~ Jupiter radius in Earth radii

    const facts = useMemo(() => {
        if (!planet) return null;
        const { facts: labels, suffixes } = compareMessages;
        const formatNumber = (value, options = {}) => (value == null ? nullLabel : value.toLocaleString(currentLang, options));
        const withSuffix = (value, suffix = "", options = {}) => (value == null ? nullLabel : `${value.toLocaleString(currentLang, options)}${suffix}`);
        const formatText = (value) => (value ? value : nullLabel);

        return [
            { label: labels.mass, value: withSuffix(planet.massE, suffixes.mass, { maximumFractionDigits: 2 }) },
            { label: labels.radius, value: withSuffix(rExo, suffixes.radius, { maximumFractionDigits: 2 }) },
            { label: labels.tempEq, value: withSuffix(planet.tempEq, suffixes.temp, { maximumFractionDigits: 0 }) },
            { label: labels.method, value: formatText(planet.method) },
            { label: labels.year, value: formatNumber(planet.year) },
            { label: labels.host, value: formatText(planet.host) },
            { label: labels.spectralType, value: formatText(planet.specType) },
            { label: labels.distance, value: withSuffix(planet.distance, suffixes.distance, { maximumFractionDigits: 2 }) },
        ];
    }, [planet, rExo, compareMessages, currentLang, nullLabel]);

    return (
        <motion.section
            style={{ marginTop: "1.25rem" }}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        >
            <h2 style={{ textAlign: "center", margin: "0 0 .4rem" }}>{compareMessages.heading}</h2>
            <p className="subtitle" style={{ textAlign: "center", margin: "0 0 1rem" }}>
                {compareMessages.description.intro}{' '}
                <span aria-label={compareMessages.formula.base} style={{ whiteSpace: "nowrap" }}>
                    {compareMessages.formula.base}
                    <sup>{compareMessages.formula.exponent}</sup>
                </span>
                {compareMessages.description.outro}
            </p>

            <motion.div
                className="glass compare-grid"
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10% 0px" }}
                transition={{ duration: 0.7, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            >
                <motion.div
                    className="glass compare-canvas"
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-10% 0px" }}
                    transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                >
                    {(() => {
                        const bodies = [];
                        const earth = { label: compareMessages.earthLabel, radius: 1, color: "#4b84ff" };
                        const jupiter = { label: compareMessages.jupiterLabel || "Jupiter", radius: JUPITER_R_EARTH, color: "#d0a772" };
                        const exo = { label: planet?.name || "Exoplanet", radius: rExo, color: "#6b3a2a" };
                        if (mode === "earth-exo") bodies.push(earth, exo);
                        else if (mode === "jupiter-exo") bodies.push(exo, jupiter);
                        else bodies.push(earth, exo, jupiter);
                        return (
                            <Suspense fallback={<div style={{textAlign:"center", opacity:.8}}>{compareMessages.loading3D || "Cargando visualización 3D…"}</div>}>
                                <ThreeCompare bodies={bodies} autoRotate={autoRotate} />
                            </Suspense>
                        );
                    })()}
                </motion.div>

                <motion.div
                    className="glass compare-details"
                    initial={{ opacity: 0, x: 24 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-10% 0px" }}
                    transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="search-controls compare-controls">
                        <input
                            className="glass"
                            list="exo-list"
                            placeholder={compareMessages.inputPlaceholder}
                            aria-label={compareMessages.inputPlaceholder}
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            style={{ flex: 1, padding: ".6rem .8rem" }}
                        />
                        <datalist id="exo-list">
                            {options.map((name) => <option key={name} value={name} />)}
                        </datalist>
                        <select
                            className="glass"
                            value={mode}
                            onChange={e => setMode(e.target.value)}
                            aria-label={modeAriaLabel}
                        >
                            <option value="earth-exo">{compareMessages.modes?.earthExo || "Earth + Selected"}</option>
                            <option value="jupiter-exo">{compareMessages.modes?.jupiterExo || "Jupiter + Selected"}</option>
                            <option value="all">{compareMessages.modes?.all || "All three"}</option>
                        </select>
                        <button className="btn secondary compare-toggle" onClick={() => setAutoRotate(a => !a)} aria-pressed={autoRotate}>
                            {autoRotate ? compareMessages.toggle.stop : compareMessages.toggle.rotate}
                        </button>
                    </div>

                    <div className="glass card" style={{ padding: ".9rem" }}>
                        <h3 style={{ marginTop: 0 }}>{planet?.name || nullLabel}</h3>
                        <ul className="compare-facts" style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".35rem .75rem" }}>
                            {facts?.map(({ label, value }) => (
                                <li key={label}><strong>{label}:</strong> <span style={{ opacity: .85 }}>{value}</span></li>
                            ))}
                        </ul>
                        <p className="subtitle" style={{ marginTop: ".75rem" }}>
                            {compareMessages.disclaimer}
                        </p>
                    </div>

                    <div className="glass card" style={{ padding: "0.9rem", marginTop: "0.75rem" }}>
                        <h3 style={{ marginTop: 0 }}>{compareMessages.context.title}</h3>
                        <p style={{ margin: 0 }}>
                            {compareMessages.context.body}
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </motion.section>
    );
}
