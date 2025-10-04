import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import {
    DEFAULT_LANG,
    LANG_EVENT,
    detectClientLanguage,
    getLanguageSafe,
    getTranslations
} from "../i18n/translations.js";

// --- Utilidades ---
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
    method: r["Discovery Method"] || "",
    year: toNum(r["Discovery Year"]),
    massE: toNum(r["Mass"]),                 // en masas terrestres (según dataset)
    radiusE: toNum(r["Radius Earth Radii"]) || toNum(r["Radius"]), // si algún día lo traes
    tempEq: toNum(r["Equilibrium Temperature"]),
    flux: toNum(r["Insolation Flux"]),
    distance: toNum(r["Distance"], true),
    specType: r["Spectral Type"] || "",
});

const clamp = (x, a, b) => Math.min(Math.max(x, a), b);

// Radio visual (not-to-scale): usa radio real si viene; si no, r ~ M^(1/3) para densidad similar
function visualRadiusR(massE, radiusE) {
    if (radiusE && radiusE > 0) return clamp(radiusE, 0.4, 15);
    if (!massE || massE <= 0) return 1;
    const r = Math.cbrt(massE);
    return clamp(r, 0.4, 15);
}

// --- Esfera giratoria simple ---
function RotSphere({ color = "#6ba3ff", radius = 1, label = "Earth" }) {
    const ref = useRef();
    useFrame((_, dt) => {
        if (!ref.current) return;
        ref.current.rotation.y += dt * 0.25;
    });
    return (
        <group>
            <mesh ref={ref} castShadow receiveShadow>
                <sphereGeometry args={[radius, 64, 64]} />
                <meshStandardMaterial color={color} roughness={0.8} metalness={0.05} />
            </mesh>
            <Html position={[0, radius + 0.4, 0]} center>
                <div style={{
                    padding: ".25rem .6rem",
                    borderRadius: "999px",
                    fontWeight: 700,
                    background: "rgba(255,255,255,.08)",
                    border: "1px solid rgba(255,255,255,.2)",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                }}>{label}</div>
            </Html>
        </group>
    );
}

// --- Escena 3D comparativa ---
function CompareScene({ earthLabel = "Earth", earthR = 1, exoName = "Kepler-452b", exoR = 1.6, autoRotate = true }) {
    const maxRadius = Math.max(earthR, exoR);
    const gap = Math.max(0.6, maxRadius * 0.25);
    const separation = earthR + exoR + gap;
    const earthPos = [-separation / 2, 0, 0];
    const exoPos = [separation / 2, 0, 0];
    const cameraZ = Math.max(10, separation * 1.25);
    const cameraY = Math.max(3.5, maxRadius * 0.75 + 1.5);

    return (
        <Canvas shadows camera={{ position: [0, cameraY, cameraZ], fov: 45 }}>
            <ambientLight intensity={0.35} />
            <directionalLight position={[5, 8, 5]} intensity={1.1} castShadow />
            <group position={[0, 0, 0]}>
                <group position={earthPos}>
                    <RotSphere color="#4b84ff" radius={earthR} label={earthLabel} />
                </group>
                <group position={exoPos}>
                    <RotSphere color="#6b3a2a" radius={exoR} label={exoName} />
                </group>
            </group>
            <OrbitControls
                enablePan={false}
                enableDamping
                dampingFactor={0.08}
                autoRotate={autoRotate}
                autoRotateSpeed={0.5}
            />
        </Canvas>
    );
}

export default function ExoCompare({ src = "/exoplanets.json", lang = DEFAULT_LANG, messages }) {
    const [rows, setRows] = useState([]);
    const [q, setQ] = useState("Kepler-452 b"); // valor por defecto habitual
    const [autoRotate, setAutoRotate] = useState(true);
    const safeLang = getLanguageSafe(lang);
    const [currentLang, setCurrentLang] = useState(safeLang);
    const compareMessages = useMemo(() => {
        if (messages && currentLang === safeLang) return messages;
        return getTranslations(currentLang).compare;
    }, [messages, currentLang, safeLang]);
    const nullLabel = compareMessages.nullLabel ?? "Null";

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
            const res = await fetch(src, { signal: ac.signal });
            const data = await res.json();
            setRows(Array.isArray(data) ? data.map(mapRow) : []);
        })().catch(() => { });
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
        <section style={{ marginTop: "1.25rem" }}>
            <h2 style={{ textAlign: "center", margin: "0 0 .4rem" }}>{compareMessages.heading}</h2>
            <p className="subtitle" style={{ textAlign: "center", margin: "0 0 1rem" }}>
                {compareMessages.description.intro}{' '}
                <span aria-label={compareMessages.formula.base} style={{ whiteSpace: "nowrap" }}>
                    {compareMessages.formula.base}
                    <sup>{compareMessages.formula.exponent}</sup>
                </span>
                {compareMessages.description.outro}
            </p>

            <div className="glass" style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "1rem", padding: "1rem" }}>
                <div className="glass" style={{ padding: "0", minHeight: "430px" }}>
                    <CompareScene
                        earthLabel={compareMessages.earthLabel}
                        earthR={1}
                        exoName={planet?.name || "Exoplanet"}
                        exoR={rExo}
                        autoRotate={autoRotate}
                    />
                </div>

                <div className="glass" style={{ padding: "1rem" }}>
                    <div style={{ display: "flex", gap: ".5rem", marginBottom: ".75rem" }}>
                        <input
                            className="glass"
                            list="exo-list"
                            placeholder={compareMessages.inputPlaceholder}
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            style={{ flex: 1, padding: ".6rem .8rem" }}
                        />
                        <datalist id="exo-list">
                            {options.map((name) => <option key={name} value={name} />)}
                        </datalist>
                        <button className="btn secondary" onClick={() => setAutoRotate(a => !a)} aria-pressed={autoRotate}>
                            {autoRotate ? compareMessages.toggle.stop : compareMessages.toggle.rotate}
                        </button>
                    </div>

                    <div className="glass card" style={{ padding: ".9rem" }}>
                        <h3 style={{ marginTop: 0 }}>{planet?.name || nullLabel}</h3>
                        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".35rem .75rem" }}>
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
                </div>
            </div>
        </section>
    );
}
