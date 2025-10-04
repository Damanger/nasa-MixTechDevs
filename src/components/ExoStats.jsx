import { useEffect, useMemo, useState } from "react";
import {
    DEFAULT_LANG,
    LANG_EVENT,
    detectClientLanguage,
    getLanguageSafe,
    getTranslations
} from "../i18n/translations.js";

// Utilidades de normalización
const toNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
};
const key = (r, k) => r[k] ?? r[k.replaceAll(" ", "_")] ?? r[k.replaceAll(".", "")];

// Heurística *opcional* para "potencialmente habitables":
// usa temperatura de equilibrio (180–310 K) o insolación (0.25–1.5) si existen.
// Es un proxy simplificado para UI; no es una clasificación científica formal.
const isTempered = (r) => {
    const t = toNum(r["Equilibrium Temperature"]);
    const f = toNum(r["Insolation Flux"]);
    const okT = t != null && t >= 180 && t <= 310;
    const okF = f != null && f >= 0.25 && f <= 1.5;
    return okT || okF;
};

function approx(n, locale) {
    if (n == null) return "—";
    if (n < 1000) return `${n.toLocaleString(locale)}+`;
    // redondeo/approximation a la centena más cercana con sufijo "+"
    const rounded = Math.round(n / 100) * 100;
    return `${rounded.toLocaleString(locale)}+`;
}

export default function ExoStats({ src = "/exoplanets.json", lang = DEFAULT_LANG, messages }) {
    const [rows, setRows] = useState(null);
    const [err, setErr] = useState(null);
    const safeLang = getLanguageSafe(lang);
    const [currentLang, setCurrentLang] = useState(safeLang);
    const statsMessages = useMemo(() => {
        if (messages && currentLang === safeLang) return messages;
        return getTranslations(currentLang).stats;
    }, [currentLang, messages, safeLang]);

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
                setRows(Array.isArray(data) ? data : []);
            } catch (e) {
                if (e.name !== "AbortError") setErr(e);
            }
        })();
        return () => ac.abort();
    }, [src]);

    const stats = useMemo(() => {
        if (!rows) return null;

        const total = rows.length;

        // Sistemas planetarios = hosts únicos
        const hosts = new Set();
        // Conteo por host para multi-planeta
        const hostCounts = new Map();

        // Posibles “templados”
        let tempered = 0;

        for (const r of rows) {
            const host = key(r, "Planet Host");
            if (host) {
                hosts.add(host);
                hostCounts.set(host, (hostCounts.get(host) ?? 0) + 1);
            }
            if (isTempered(r)) tempered++;
        }

        const systems = hosts.size;

        // Multi-planeta: hosts con ≥ 2 planetas (por repetición en el dataset)
        let multiSystems = 0;
        for (const [, c] of hostCounts) if (c >= 2) multiSystems++;

        return { total, systems, multiSystems, tempered };
    }, [rows]);

    if (err) {
        return <section className="glass card" style={{ padding: "1rem" }}>{statsMessages.errorPrefix}: {String(err)}</section>;
    }
    if (!stats) {
        return <section className="glass card" style={{ padding: "1rem" }}>{statsMessages.loading}</section>;
    }

    const { total, systems, multiSystems, tempered } = stats;
    const { ariaLabel, heading, intro, cards } = statsMessages;

    return (
        <section aria-label={ariaLabel} style={{ marginTop: "1rem" }}>
            <h2 style={{ textAlign: "center", margin: "0 0 .5rem" }}>{heading}</h2>
            <p className="subtitle" style={{ textAlign: "center", margin: "0 0 1rem" }}>
                {intro}
            </p>

            <div className="grid">
                <article className="glass card stat">
                    <div className="kicker">{cards.planets.kicker}</div>
                    <div className="big">{approx(total, currentLang)}</div>
                    <h3 style={{ margin: ".25rem 0 .35rem" }}>{cards.planets.title}</h3>
                    <p className="subtitle">{cards.planets.description}</p>
                </article>

                <article className="glass card stat">
                    <div className="kicker">{cards.systems.kicker}</div>
                    <div className="big">{approx(systems, currentLang)}</div>
                    <h3 style={{ margin: ".25rem 0 .35rem" }}>{cards.systems.title}</h3>
                    <p className="subtitle">{cards.systems.description}</p>
                </article>

                <article className="glass card stat">
                    <div className="kicker">{cards.multi.kicker}</div>
                    <div className="big">{approx(multiSystems, currentLang)}</div>
                    <h3 style={{ margin: ".25rem 0 .35rem" }}>{cards.multi.title}</h3>
                    <p className="subtitle">{cards.multi.description}</p>
                </article>

                <article className="glass card stat">
                    <div className="kicker">{cards.tempered.kicker}</div>
                    <div className="big">{approx(tempered, currentLang)}</div>
                    <h3 style={{ margin: ".25rem 0 .35rem" }}>{cards.tempered.title}</h3>
                    <p className="subtitle">{cards.tempered.description}</p>
                </article>
            </div>

            {/* Estilos locales para el “glow” del rótulo */}
            <style>{`
        .stat { text-align:center; padding:1.25rem; position:relative; }
        .kicker{
          display:inline-block; padding:.35rem .6rem; border-radius:999px;
          border:1px solid var(--glass-brd); background:rgba(255,255,255,.06);
          margin-bottom:.5rem;
          box-shadow: 0 0 30px rgba(137,180,255,.25), inset 0 1px 0 rgba(255,255,255,.05);
        }
        .big{
          font-weight:900; font-size: clamp(1.8rem, 5.5vw, 2.6rem);
          letter-spacing:.5px; margin:.1rem 0;
          background:linear-gradient(180deg, #e6eaff 0%, #b7c0e6 100%);
          -webkit-background-clip:text; background-clip:text; color:transparent;
          text-shadow: 0 0 32px rgba(137,180,255,.15);
        }
      `}</style>
        </section>
    );
}
