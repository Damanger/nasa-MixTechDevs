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
import CountUp from "./CountUp.jsx";

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
    const t = toNum(r.pl_eqt);
    const f = toNum(r.pl_insol);
    const okT = t != null && t >= 180 && t <= 310;
    const okF = f != null && f >= 0.25 && f <= 1.5;
    return okT || okF;
}

export default function ExoStats({ src = "/exoplanets.csv", lang = DEFAULT_LANG, messages }) {
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
                const txt = await res.text();
                const data = parseCSV(txt);
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
            const host = r.hostname;
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

    const { ariaLabel, heading, intro, cards } = statsMessages;

    // Preparar items como "bento" reordenables (usar 0 si aún no hay stats)
    const items = useMemo(() => ([
        {
            id: 'planets',
            kicker: cards.planets.kicker,
            value: stats?.total ?? 0,
            title: cards.planets.title,
            description: cards.planets.description
        },
        {
            id: 'systems',
            kicker: cards.systems.kicker,
            value: stats?.systems ?? 0,
            title: cards.systems.title,
            description: cards.systems.description
        },
        {
            id: 'multi',
            kicker: cards.multi.kicker,
            value: stats?.multiSystems ?? 0,
            title: cards.multi.title,
            description: cards.multi.description
        },
        {
            id: 'tempered',
            kicker: cards.tempered.kicker,
            value: stats?.tempered ?? 0,
            title: cards.tempered.title,
            description: cards.tempered.description
        }
    ]), [cards, stats]);

    const [order, setOrder] = useState(items.map(i => i.id));
    // Mantener sincronizado si cambia el número de items
    useEffect(() => {
        const ids = items.map(i => i.id);
        setOrder(prev => {
            const filtered = prev.filter(id => ids.includes(id));
            const missing = ids.filter(id => !filtered.includes(id));
            return [...filtered, ...missing];
        });
    }, [items]);

    const onSwap = (from, to) => {
        setOrder(prev => {
            const next = [...prev];
            const i = next.indexOf(from);
            const j = next.indexOf(to);
            if (i === -1 || j === -1) return prev;
            [next[i], next[j]] = [next[j], next[i]];
            return next;
        });
    };

    const [dragging, setDragging] = useState(null);

    if (err) {
        return (
            <motion.section
                className="glass card"
                style={{ padding: "1rem" }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
                {statsMessages.errorPrefix}: {String(err)}
            </motion.section>
        );
    }
    if (!stats) {
        // Mostrar loading pero mantener hooks en orden estable
        return (
            <motion.section
                className="glass card"
                style={{ padding: "1rem" }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
                {statsMessages.loading}
            </motion.section>
        );
    }

    const getApproxValue = (n) => {
        if (n == null) return 0;
        if (n < 1000) return n;
        return Math.round(n / 100) * 100;
    };

    const StatCard = ({ kicker, value, title, description, featured = false }) => {
        const approxValue = getApproxValue(value);

        return (
            <article className={`glass card stat ${featured ? 'featured' : ''}`}>
                <div className="kicker">{kicker}</div>
                <div className="big">
                    {value == null ? (
                        "—"
                    ) : (
                        <>
                            <CountUp
                                to={approxValue}
                                duration={2}
                                locale={currentLang}
                            />
                            +
                        </>
                    )}
                </div>
                <h3 style={{ margin: ".25rem 0 .35rem" }}>{title}</h3>
                <p className="subtitle">{description}</p>
            </article>
        );
    };

    return (
        <motion.section
            aria-label={ariaLabel}
            style={{ marginTop: "1rem" }}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        >
            <h2 style={{ textAlign: "center", margin: "0 0 .5rem" }}>{heading}</h2>
            <p className="subtitle" style={{ textAlign: "center", margin: "0 0 1rem" }}>
                {intro}
            </p>
            <div className="bento-grid" role="list">
                {order.map((id, idx) => {
                    const it = items.find(x => x.id === id);
                    if (!it) return null;
                    return (
                        <motion.div
                            key={id}
                            role="listitem"
                            className={`bento-item glass`}
                            draggable
                            onDragStart={() => setDragging(id)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => dragging && onSwap(dragging, id)}
                            onDragEnd={() => setDragging(null)}
                            aria-grabbed={dragging === id}
                            title="Arrastra para reordenar"
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-15% 0px" }}
                            transition={{ duration: 0.55, delay: 0.1 + idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <StatCard kicker={it.kicker} value={it.value} title={it.title} description={it.description} featured={idx === 0} />
                        </motion.div>
                    );
                })}
            </div>

            {/* Estilos locales para el “glow” del rótulo */}
            <style>{`
        .bento-grid{ display:grid; gap:.75rem; grid-template-columns:repeat(4,minmax(0,1fr)); }
        .bento-item{ border-radius:16px; cursor: grab; }
        .bento-item:active{ cursor: grabbing; }
        /* Patrón Bento: posición depende del orden visual */
        @media (min-width:1024px){
          .bento-item:nth-child(1){ grid-column:span 2; grid-row:span 2; }
          .bento-item:nth-child(2){ grid-column:span 1; grid-row:span 1; }
          .bento-item:nth-child(3){ grid-column:span 1; grid-row:span 1; }
          .bento-item:nth-child(4){ grid-column:span 2; }
        }
        @media (max-width:1023px){ .bento-grid{ grid-template-columns:repeat(2,minmax(0,1fr)); } }
        @media (max-width:640px){ .bento-grid{ grid-template-columns:1fr; } }

        .stat { text-align:center; padding:1.25rem; position:relative; height:100%; }
        .stat.featured{ display:flex; flex-direction:column; justify-content:center; align-items:center; padding:2rem; overflow:hidden; }
        .stat.featured .big{ font-size: clamp(2.4rem, 6.5vw, 3.6rem); }
        .stat.featured::before{ content:""; position:absolute; inset:auto; width:380px; height:380px; border-radius:50%; right:-140px; top:-140px; background: radial-gradient(closest-side, rgba(137,180,255,.25), rgba(137,180,255,.12) 50%, transparent 70%); filter: blur(12px); pointer-events:none; }
        .stat.featured::after{ content:""; position:absolute; width: 120px; height: 120px; left: -50px; bottom: -50px; border-radius: 50%; background: radial-gradient(circle, rgba(255,255,255,.08), transparent 70%); filter: blur(6px); pointer-events:none; }
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
        </motion.section>
    );
}
