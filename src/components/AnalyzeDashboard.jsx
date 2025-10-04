import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import Papa from "papaparse";
import "../assets/css/Analyze.css";
import parseCSV from "../lib/csv.js";

// Chart.js + react-chartjs-2 + matrix plugin (ESM)
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, PointElement, LineElement, BarElement,
    Tooltip, Legend, Title
} from "chart.js";
import { Line, Bar, Chart as ChartAny } from "react-chartjs-2";
import { MatrixController, MatrixElement } from "chartjs-chart-matrix";
import { DEFAULT_LANG, getLanguageSafe, getTranslations, LANG_EVENT, detectClientLanguage } from "../i18n/translations.js";

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement, BarElement,
    Tooltip, Legend, Title, MatrixController, MatrixElement
);

// ---------- Utilidades de métricas ----------
function confusionMatrix(yTrue, yPred, labels) {
    const idx = new Map(labels.map((l, i) => [String(l), i]));
    const n = labels.length;
    const M = Array.from({ length: n }, () => Array(n).fill(0));
    for (let i = 0; i < yTrue.length; i++) {
        const r = idx.get(String(yTrue[i]));
        const c = idx.get(String(yPred[i]));
        if (r != null && c != null) M[r][c] += 1;
    }
    return M;
}

function precisionRecallF1(yTrue, yPred, labels) {
    const n = labels.length;
    const idx = new Map(labels.map((l, i) => [String(l), i]));
    const tp = Array(n).fill(0), fp = Array(n).fill(0), fn = Array(n).fill(0);
    for (let i = 0; i < yTrue.length; i++) {
        const t = idx.get(String(yTrue[i]));
        const p = idx.get(String(yPred[i]));
        if (t == null || p == null) continue;
        if (t === p) tp[t]++; else { fp[p]++; fn[t]++; }
    }
    const prec = tp.map((v, i) => v / Math.max(v + fp[i], 1));
    const rec = tp.map((v, i) => v / Math.max(v + fn[i], 1));
    const f1 = tp.map((_v, i) => {
        const p = prec[i], r = rec[i]; return (p + r) ? (2 * p * r) / (p + r) : 0;
    });
    const support = labels.map((_, i) => tp[i] + fn[i]);
    const macro = {
        precision: prec.reduce((a, b) => a + b, 0) / n,
        recall: rec.reduce((a, b) => a + b, 0) / n,
        f1: f1.reduce((a, b) => a + b, 0) / n
    };
    const micro = (() => {
        const TP = tp.reduce((a, b) => a + b, 0);
        const FP = fp.reduce((a, b) => a + b, 0);
        const FN = fn.reduce((a, b) => a + b, 0);
        const precision = TP / Math.max(TP + FP, 1);
        const recall = TP / Math.max(TP + FN, 1);
        const f1 = (precision + recall) ? (2 * precision * recall) / (precision + recall) : 0;
        return { precision, recall, f1 };
    })();
    const accuracy = yTrue.reduce((acc, y, i) => acc + (String(y) === String(yPred[i]) ? 1 : 0), 0) / Math.max(yTrue.length, 1);
    return { perClass: { precision: prec, recall: rec, f1, support }, macro, micro, accuracy };
}

// ROC binaria + AUC
function rocCurve(yTrue, probPos, posLabel) {
    const pairs = yTrue.map((y, i) => ({ y: y === posLabel ? 1 : 0, p: Number(probPos[i]) || 0 }));
    pairs.sort((a, b) => b.p - a.p);
    let P = pairs.reduce((s, o) => s + (o.y === 1), 0), N = pairs.length - P;
    let tp = 0, fp = 0;
    const roc = [{ fpr: 0, tpr: 0, thr: +Infinity }];
    let cursor = 0;
    while (cursor < pairs.length) {
        const thr = pairs[cursor].p;
        while (cursor < pairs.length && pairs[cursor].p === thr) {
            if (pairs[cursor].y === 1) tp++; else fp++;
            cursor++;
        }
        roc.push({ fpr: fp / Math.max(N, 1), tpr: tp / Math.max(P, 1), thr });
    }
    if (roc[roc.length - 1].fpr !== 1 || roc[roc.length - 1].tpr !== 1) roc.push({ fpr: 1, tpr: 1, thr: -Infinity });
    let auc = 0;
    for (let i = 1; i < roc.length; i++) {
        const x1 = roc[i - 1].fpr, y1 = roc[i - 1].tpr;
        const x2 = roc[i].fpr, y2 = roc[i].tpr;
        auc += (x2 - x1) * (y1 + y2) / 2;
    }
    return { roc, auc };
}

// Calibración (reliability diagram)
function calibrationCurve(yTrue, probPos, posLabel, bins = 10) {
    const arr = yTrue.map((y, i) => ({ y: y === posLabel ? 1 : 0, p: Math.min(1, Math.max(0, Number(probPos[i]) || 0)) }));
    const buckets = Array.from({ length: bins }, () => ({ sumP: 0, sumY: 0, n: 0 }));
    for (const { y, p } of arr) {
        let b = Math.min(bins - 1, Math.floor(p * bins));
        buckets[b].sumP += p; buckets[b].sumY += y; buckets[b].n += 1;
    }
    return buckets.filter(b => b.n > 0).map((b, i) => ({ x: b.sumP / b.n, y: b.sumY / b.n, bin: i, n: b.n }));
}

// Simulación de salida de modelo (placeholder)
function simulateModelProbs(rows, numericCols, classes, seed = 1234) {
    function rng() { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }
    return rows.map(r => {
        const z = numericCols.map(c => Number(r[c]) || 0).reduce((a, b) => a + b, 0);
        const logits = classes.map((_, i) => (z * 0.01 + i * 0.3) + (rng() - 0.5));
        const max = Math.max(...logits);
        const exps = logits.map(v => Math.exp(v - max));
        const sum = exps.reduce((a, b) => a + b, 0);
        const probs = exps.map(v => v / sum);
        const argmax = probs.indexOf(Math.max(...probs));
        return { label: classes[argmax], probs };
    });
}

// LocalStorage key for mapping persistence
const LS_KEY = (src) => `anlz:mapping:${src || 'default'}`;

export default function AnalyzeDashboard({ lang = DEFAULT_LANG, src = "/exoplanets.csv" }) {
    const safeLang = getLanguageSafe(lang);
    const [currentLang, setCurrentLang] = useState(safeLang);
    useEffect(() => {
        const preferred = detectClientLanguage(safeLang);
        setCurrentLang((prev) => (prev === preferred ? prev : preferred));
        const handle = (event) => setCurrentLang(getLanguageSafe(event.detail?.lang));
        window.addEventListener(LANG_EVENT, handle);
        return () => window.removeEventListener(LANG_EVENT, handle);
    }, [safeLang]);

    const ui = useMemo(() => getTranslations(currentLang).analyzeUI, [currentLang]);

    const [rows, setRows] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [fileMeta, setFileMeta] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [showMetrics, setShowMetrics] = useState(true);
    const [showCharts, setShowCharts] = useState(true);
    const fileInputRef = useRef(null);
    const [yTrueCol, setYTrueCol] = useState("");
    const [yPredCol, setYPredCol] = useState("");
    const [probCols, setProbCols] = useState([]);
    const [posClass, setPosClass] = useState("");
    const [useSimulated, setUseSimulated] = useState(false);
    const [simSeed, setSimSeed] = useState(1234);
    const [activeStep, setActiveStep] = useState(0);

    // Carga CSV
    function onFile(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        Papa.parse(file, {
            header: true, dynamicTyping: true, skipEmptyLines: true, worker: true,
            complete: (res) => {
                const clean = res.data.filter(r => Object.keys(r).length > 0);
                setRows(clean);
                const cols = res.meta.fields || Object.keys(clean[0] || {});
                setHeaders(cols);
                setFileMeta({ name: file.name, rows: clean.length, cols: cols.length });
                const guessY = cols.find(c => /^(y|label|target|clase|verdadero)/i.test(c)) || "";
                const guessP = cols.filter(c => /proba|prob_|p_/i.test(c));
                setYTrueCol(guessY);
                setYPredCol(cols.find(c => /^(y_pred|pred|hat|yhat|predicho|clase_pred)/i.test(c)) || "");
                setProbCols(guessP);
            },
            error: (err) => alert(`Error al parsear CSV: ${err.message}`)
        });
    }

    // Etiquetas
    const labels = useMemo(() => {
        if (!rows.length) return [];
        const L = new Set();
        if (yTrueCol) rows.forEach(r => { if (r[yTrueCol] !== undefined) L.add(String(r[yTrueCol])); });
        if (yPredCol) rows.forEach(r => { if (r[yPredCol] !== undefined) L.add(String(r[yPredCol])); });
        if (!L.size && probCols.length > 1) probCols.forEach(c => L.add(String(c).replace(/^proba?_?/i, "")));
        return Array.from(L);
    }, [rows, yTrueCol, yPredCol, probCols]);

    useEffect(() => {
        if (!posClass && labels.length) setPosClass(labels[0]);
    }, [labels, posClass]);

    // Info de probabilidades
    const probInfo = useMemo(() => {
        if (!rows.length || probCols.length === 0) return null;
        if (probCols.length === 1) {
            return { type: "binary", cols: probCols, classForCol: { [probCols[0]]: posClass || "1" } };
        }
        return { type: "multiclass", cols: probCols, classForCol: Object.fromEntries(probCols.map(c => [c, String(c).replace(/^proba?_?/i, "")])) };
    }, [rows, probCols, posClass]);

    // Predicciones efectivas
    const effective = useMemo(() => {
        if (!rows.length) return null;
        const numericCols = headers.filter(c => rows.some(r => typeof r[c] === "number"));
        const classes = labels.length ? labels : ["ClaseA", "ClaseB"];
        const simulated = useSimulated ? simulateModelProbs(rows, numericCols, classes, simSeed) : null;

        const yTrue = yTrueCol ? rows.map(r => r[yTrueCol]) : Array(rows.length).fill(null);
        const yPred = yPredCol ? rows.map(r => r[yPredCol]) :
            simulated ? simulated.map(s => s.label) : Array(rows.length).fill(null);

        let probPos = null;
        if (probInfo) {
            if (probInfo.type === "binary") {
                probPos = rows.map(r => Number(r[probInfo.cols[0]]) || 0);
            } else if (posClass) {
                const col = probCols.find(c => probInfo.classForCol[c] === posClass);
                if (col) probPos = rows.map(r => Number(r[col]) || 0);
            }
        } else if (simulated && posClass) {
            const k = classes.indexOf(posClass);
            probPos = simulated.map(s => s.probs[k] ?? 0);
        }

        return { yTrue, yPred, probPos, classes, simulated };
    }, [rows, headers, labels, yTrueCol, yPredCol, probInfo, useSimulated, simSeed, posClass]);

    // Guardar mapeo
    useEffect(() => {
        try { localStorage.setItem(LS_KEY(src), JSON.stringify({ yTrueCol, yPredCol, probCols, posClass })); } catch { }
    }, [yTrueCol, yPredCol, probCols, posClass, src]);

    // Métricas
    const metrics = useMemo(() => {
        if (!effective || !labels.length || !effective.yPred.some(v => v !== null) || !effective.yTrue.some(v => v !== null)) return null;
        const M = confusionMatrix(effective.yTrue, effective.yPred, labels);
        const prf = precisionRecallF1(effective.yTrue, effective.yPred, labels);
        return { M, prf };
    }, [effective, labels]);

    const roc = useMemo(() => {
        if (!effective || !effective.probPos || !labels.length || !effective.yTrue.some(v => v !== null)) return null;
        const pos = posClass || labels[0];
        return rocCurve(effective.yTrue, effective.probPos, pos);
    }, [effective, labels, posClass]);

    const calib = useMemo(() => {
        if (!effective || !effective.probPos || !labels.length || !effective.yTrue.some(v => v !== null)) return null;
        const pos = posClass || labels[0];
        return calibrationCurve(effective.yTrue, effective.probPos, pos, 10);
    }, [effective, labels, posClass]);

    // Datos para charts
    const confusionData = useMemo(() => {
        if (!metrics) return null;
        const cells = [];
        metrics.M.forEach((row, i) => row.forEach((v, j) => cells.push({ x: j, y: i, v })));
        const maxV = cells.reduce((m, c) => Math.max(m, c.v), 1);
        return {
            data: {
                datasets: [{
                    label: "Matriz de confusión",
                    data: cells,
                    width: ({ chart }) => (chart.chartArea?.width || 1) / Math.max(labels.length, 1),
                    height: ({ chart }) => (chart.chartArea?.height || 1) / Math.max(labels.length, 1),
                    backgroundColor: ctx => {
                        const v = ctx.raw.v / maxV;
                        const alpha = 0.15 + 0.85 * v;
                        return `rgba(33, 150, 243, ${alpha})`;
                    },
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.45)"
                }]
            },
            options: {
                plugins: {
                    legend: { display: false }, title: { display: true, text: "Matriz de confusión" },
                    tooltip: { callbacks: { label: ctx => `(${labels[ctx.raw.y]} → ${labels[ctx.raw.x]}): ${ctx.raw.v}` } }
                },
                scales: {
                    x: { type: "category", labels, position: "top", title: { display: true, text: "Predicho" } },
                    y: { type: "category", labels: labels.slice().reverse(), reverse: true, title: { display: true, text: "Verdadero" } }
                },
                maintainAspectRatio: false
            }
        };
    }, [metrics, labels]);

    const rocData = useMemo(() => {
        if (!roc) return null;
        const xs = roc.roc.map(p => p.fpr), ys = roc.roc.map(p => p.tpr);
        return {
            data: {
                labels: xs,
                datasets: [
                    { label: `ROC (AUC=${roc.auc.toFixed(3)})`, data: xs.map((x, i) => ({ x, y: ys[i] })), parsing: false, borderWidth: 2 },
                    { label: "Azar", data: [{ x: 0, y: 0 }, { x: 1, y: 1 }], parsing: false, borderDash: [5, 5], borderWidth: 1 }
                ]
            },
            options: {
                plugins: { legend: { position: "bottom" }, title: { display: true, text: "Curva ROC" } },
                scales: { x: { min: 0, max: 1, title: { display: true, text: "FPR" } }, y: { min: 0, max: 1, title: { display: true, text: "TPR" } } },
                maintainAspectRatio: false
            }
        };
    }, [roc]);

    const calibData = useMemo(() => {
        if (!calib) return null;
        return {
            data: {
                labels: calib.map(p => p.x.toFixed(2)),
                datasets: [
                    { label: "Calibración", data: calib.map(p => ({ x: p.x, y: p.y })), parsing: false, borderWidth: 2, pointRadius: 3 },
                    { label: "Ideal", data: [{ x: 0, y: 0 }, { x: 1, y: 1 }], parsing: false, borderDash: [5, 5], borderWidth: 1 }
                ]
            },
            options: {
                plugins: { legend: { position: "bottom" }, title: { display: true, text: "Curva de calibración (fiabilidad)" } },
                scales: { x: { min: 0, max: 1, title: { display: true, text: "p̂ (media por bin)" } }, y: { min: 0, max: 1, title: { display: true, text: "frecuencia observada" } } },
                maintainAspectRatio: false
            }
        };
    }, [calib]);

    const probHist = useMemo(() => {
        if (!effective?.probPos) return null;
        const bins = 20;
        const counts = Array(bins).fill(0);
        effective.probPos.forEach(p => { const b = Math.min(bins - 1, Math.floor(p * bins)); counts[b]++; });
        const labelsH = Array(bins).fill(0).map((_, i) => `${(i / bins).toFixed(2)}–${((i + 1) / bins).toFixed(2)}`);
        return {
            data: {
                labels: labelsH,
                datasets: [{ label: `Distribución de p(${posClass || "pos"})`, data: counts, borderWidth: 1 }]
            },
            options: {
                plugins: { legend: { display: false }, title: { display: true, text: "Histograma de probabilidades" } },
                scales: { x: { ticks: { maxRotation: 0, autoSkip: true } }, y: { beginAtZero: true } },
                maintainAspectRatio: false
            }
        };
    }, [effective, posClass]);

    function downloadMock() {
        if (!effective) return;
        const classes = effective.classes;
        const out = rows.slice(0, 20).map((r, i) => {
            const probs = (useSimulated && effective.simulated)
                ? Object.fromEntries(classes.map((c, k) => [c, Number(effective.simulated[i].probs[k].toFixed(6))]))
                : (() => {
                    if (probCols.length > 1) {
                        // multiclase desde CSV
                        const P = Object.fromEntries(probCols.map((c, k) => [classes[k] || String(c), Number((Number(r[c]) || 0).toFixed(6))]));
                        return P;
                    } else if (effective.probPos) {
                        const p = Number(effective.probPos[i] || 0);
                        const other = classes.filter(c => c !== (posClass || classes[0]));
                        const obj = { [posClass || classes[0]]: Number(p.toFixed(6)) };
                        other.forEach(c => obj[c] = Number(((1 - p) / Math.max(other.length, 1)).toFixed(6)));
                        return obj;
                    }
                    return Object.fromEntries(classes.map(c => [c, Number((1 / classes.length).toFixed(6))]));
                })();
            const pred = Object.entries(probs).sort((a, b) => b[1] - a[1])[0][0];
            return { id: i, predicted_label: pred, probabilities: probs, explanation: null };
        });
        const blob = new Blob([JSON.stringify(out, null, 2)], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "model_output_example.json";
        a.click();
        URL.revokeObjectURL(a.href);
    }

    const onLocalFile = async (f) => {
        if (!f) return; const txt = await f.text();
        const data = parseCSV(txt); const clean = Array.isArray(data) ? data.map(mapRow) : [];
        setRows(clean); const cols = Object.keys(clean[0] || {});
        setHeaders(cols); setFileMeta({ name: f.name, rows: clean.length, cols: cols.length });
    };

    const stepLabels = useMemo(() => [ui.uploadHeading, ui.mappingHeading, ui.metricsHeading, ui.previewHeading].map(s => String(s).replace(/^\d+\)\s*/, '')), [ui]);
    const canGo = (idx) => idx === 0 || rows.length > 0;

    return (
        <motion.div
            className="analyze-root"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
            <motion.div
                className="panel"
                style={{ padding: '.75rem 1rem' }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            >
                <div className="stepper">
                    {stepLabels.map((label, i) => (
                        <button key={i} type="button" className="step" data-active={i === activeStep} data-disabled={!canGo(i)} onClick={() => canGo(i) && setActiveStep(i)}>
                            <span className="bullet">{i + 1}</span>
                            <span>{label}</span>
                        </button>
                    ))}
                    <div className="stepper-nav">
                        <button className="btn" type="button" onClick={() => setActiveStep(s => Math.max(0, s - 1))} disabled={activeStep === 0}>←</button>
                        <button className="btn" type="button" onClick={() => setActiveStep(s => Math.min(3, s + 1))} disabled={activeStep === 3 || !canGo(activeStep + 1)}>→</button>
                    </div>
                </div>
            </motion.div>
            {activeStep === 0 && (<motion.div
                className="panel"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
                <h3>{ui.uploadHeading}</h3>
                <div
                    className="dropzone"
                    data-active={dragActive}
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={(e) => { e.preventDefault(); setDragActive(false); const f = e.dataTransfer.files?.[0]; if (f) onLocalFile(f); }}
                    onClick={() => fileInputRef.current?.click()}
                    role="button"
                    aria-label={ui.dropHint}
                >
                    <input ref={fileInputRef} type="file" accept=".csv,text/csv" onChange={onFile} />
                    <span className="hint">{ui.dropHint}</span>
                </div>
                {fileMeta && (
                    <div className="file-info" style={{ marginTop: '.6rem' }}>
                        <span><b>{ui.fileInfo.name}:</b> {fileMeta.name}</span>
                        <span><b>{ui.fileInfo.rows}:</b> {fileMeta.rows.toLocaleString(currentLang)}</span>
                        <span><b>{ui.fileInfo.cols}:</b> {fileMeta.cols.toLocaleString(currentLang)}</span>
                        <div className="toolbar" style={{ marginLeft: 'auto' }}>
                            <button className="btn" onClick={() => setShowMetrics(v => !v)}>{ui.showMetrics}</button>
                            <button className="btn" onClick={() => setShowCharts(v => !v)}>{ui.showCharts}</button>
                            <button className="btn" onClick={() => { setRows([]); setHeaders([]); setFileMeta(null); }}>{ui.clear}</button>
                        </div>
                    </div>
                )}
                <p className="hint">{ui.headersHint}</p>
            </motion.div>)}

            {activeStep === 1 && (<motion.div
                className="panel"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
                <h3>{ui.mappingHeading}</h3>
                {!rows.length ? <p className="muted">Carga un CSV para continuar.</p> : (
                    <>
                        <div className="grid2">
                            <label>Columna “verdadero” (y)
                                <select value={yTrueCol} onChange={e => setYTrueCol(e.target.value)}>
                                    <option value="">(ninguna)</option>
                                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                                </select>
                            </label>

                            <label>Columna “predicho” (ŷ)
                                <select value={yPredCol} onChange={e => setYPredCol(e.target.value)}>
                                    <option value="">(ninguna)</option>
                                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                                </select>
                            </label>
                        </div>

                        <label>Columnas de probabilidad (p)
                            <select multiple value={probCols} onChange={e => {
                                const vals = Array.from(e.target.selectedOptions).map(o => o.value);
                                setProbCols(vals);
                            }}>
                                {headers.map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                            <small className="hint">Selecciona 1 columna para binaria o varias para multiclase.</small>
                        </label>

                        {!!labels.length && (
                            <label>Clase positiva (para ROC/Calibración)
                                <select value={posClass} onChange={e => setPosClass(e.target.value)}>
                                    {labels.map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                            </label>
                        )}

                        <label className="row">
                            <input type="checkbox" checked={useSimulated} onChange={e => setUseSimulated(e.target.checked)} />
                            <span>Simular salida de modelo (placeholder)</span>
                            {useSimulated && (
                                <span className="seed">
                                    Semilla:&nbsp;
                                    <input type="number" value={simSeed} onChange={e => setSimSeed(Number(e.target.value) || 0)} style={{ width: "7rem" }} />
                                </span>
                            )}
                        </label>
                    </>
                )}
            </motion.div>)}

            {activeStep === 2 && (<motion.div
                className="panel"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
                <h3>{ui.metricsHeading}</h3>
                {!metrics ? <p className="muted">Asigna al menos y y ŷ para ver métricas.</p> : (
                    <>
                        {showMetrics && (<div className="cards">
                            <div className="card"><div className="kpi">{(metrics.prf.accuracy * 100).toFixed(2)}%</div><div className="kpi-label">Exactitud</div></div>
                            <div className="card"><div className="kpi">{(metrics.prf.micro.precision * 100).toFixed(2)}%</div><div className="kpi-label">Precisión (micro)</div></div>
                            <div className="card"><div className="kpi">{(metrics.prf.micro.recall * 100).toFixed(2)}%</div><div className="kpi-label">Recall (micro)</div></div>
                            <div className="card"><div className="kpi">{(metrics.prf.micro.f1 * 100).toFixed(2)}%</div><div className="kpi-label">F1 (micro)</div></div>
                        </div>)}

                        {showCharts && (<div className="charts">
                            <div className="chart">{confusionData && <ChartAny type="matrix" data={confusionData.data} options={confusionData.options} />}</div>
                            <div className="chart">{roc && <Line data={rocData.data} options={rocData.options} />}</div>
                            <div className="chart">{calib && <Line data={calibData.data} options={calibData.options} />}</div>
                            <div className="chart">{probHist && <Bar data={probHist.data} options={probHist.options} />}</div>
                        </div>)}
                    </>
                )}
            </motion.div>)}

            {activeStep === 3 && (<motion.div
                className="panel"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
                <h3>{ui.previewHeading}</h3>
                {!rows.length ? <p className="muted">Carga un CSV para previsualizar resultados.</p> : (
                    <>
                        <p className="muted">
                            Este módulo muestra cómo se visualizarán etiquetas y probabilidades por fila cuando conectes tu modelo
                            (p. ej., a un endpoint <code>/api/predict</code>). Por ahora, puedes usar “Simular salida de modelo”.
                        </p>
                        <div className="preview" style={{ marginTop: '.6rem' }}>
                            <table className="table">
                                <thead><tr>{headers.map(h => <th key={h}>{h}</th>)}</tr></thead>
                                <tbody>
                                    {rows.slice(0, 10).map((r, i) => (
                                        <tr key={i}>{headers.map(h => <td key={h}>{String(r[h] ?? '')}</td>)}</tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <button className="btn" onClick={downloadMock} style={{ marginTop: '.6rem' }}>{ui.downloadExample}</button>
                    </>
                )}
            </motion.div>)}
        </motion.div>
    );
}
