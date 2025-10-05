import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import Papa from "papaparse";
import "../assets/css/Analyze.css";
import parseCSV from "../lib/csv.js";

import {
	Chart as ChartJS,
	CategoryScale, LinearScale, PointElement, LineElement, BarElement,
	Tooltip, Legend, Title
} from "chart.js";
import { MatrixController, MatrixElement } from "chartjs-chart-matrix";
import { DEFAULT_LANG, getLanguageSafe, getTranslations, LANG_EVENT, detectClientLanguage } from "../i18n/translations.js";

ChartJS.register(
	CategoryScale, LinearScale, PointElement, LineElement, BarElement,
	Tooltip, Legend, Title, MatrixController, MatrixElement
);

const LS_KEY = (src) => `anlz:mapping:${src || 'default'}`;

export default function AnalyzeDashboard({ lang = DEFAULT_LANG, src = "/example-dataset.csv" }) {
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
	const [expandedIndex, setExpandedIndex] = useState(null);
	const [predictions, setPredictions] = useState({});
	const expandedRef = useRef(null);
	const [dragActive, setDragActive] = useState(false);
	const fileInputRef = useRef(null);
	const [yTrueCol, setYTrueCol] = useState("");
	const [yPredCol, setYPredCol] = useState("");
	const [probCols, setProbCols] = useState([]);
	const [posClass, setPosClass] = useState("");
	const [activeStep, setActiveStep] = useState(0);

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

	function loadExampleCSV() {
		fetch(src)
			.then(response => {
				if (!response.ok) throw new Error("Error al cargar el CSV de ejemplo");
				return response.text();
			})
			.then(data => {
				const blob = new Blob([data], { type: "text/csv" });
				const file = new File([blob], "example-dataset.csv");
				onFile({ target: { files: [file] } });
			})
			.catch(error => {
				console.error(error);
				alert(`Error al cargar el CSV de ejemplo: ${error.message}`);
			});
	}


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


	useEffect(() => {
		try { localStorage.setItem(LS_KEY(src), JSON.stringify({ yTrueCol, yPredCol, probCols, posClass })); } catch { }
	}, [yTrueCol, yPredCol, probCols, posClass, src]);

	const onLocalFile = async (f) => {
		if (!f) return; const txt = await f.text();
		const data = parseCSV(txt); const clean = Array.isArray(data) ? data.map(mapRow) : [];
		setRows(clean); const cols = Object.keys(clean[0] || {});
		setHeaders(cols); setFileMeta({ name: f.name, rows: clean.length, cols: cols.length });
	};

	const stepLabels = useMemo(() => [ui.uploadHeading, ui.previewHeading].map(s => String(s).replace(/^\d+\)\s*/, '')), [ui]);
	const canGo = (idx) => idx === 0 || rows.length > 0;

	// Llamada a la API 
	async function fetchPredictionForRow(row) {
		try {
			const res = await fetch('/predict_csv_row', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ row })
			});
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const data = await res.json();
			if (Array.isArray(data)) return data[0] || data;
			return data;
		} catch (err) {
			return simulateModelOutput(row);
		}
	}

	function simulateModelOutput(row) {
		const nums = Object.values(row).map(v => (typeof v === 'number' ? v : parseFloat(v))).filter(n => !Number.isNaN(n));
		const base = nums.length ? (nums.reduce((a, b) => a + b, 0) / nums.length) : Math.random();
		const p_confirmed = Math.min(0.995, Math.max(0.001, (Math.abs(Math.sin(base)) || Math.random())));
		return {
			status: 'Predicción completada',
			prediction: p_confirmed > 0.5 ? 'Confirmado' : 'Falso postivo',
			probability_confirmed: Number(p_confirmed.toFixed(6)),
			probability_false_positive: Number((1 - p_confirmed).toFixed(6)),
			model_used: 'XGBoom + SMOTE'
		};
	}

	async function handleRowClick(idx) {
		if (expandedIndex === idx) {
			setExpandedIndex(null);
			return;
		}
		setExpandedIndex(idx);
		if (predictions[idx]) return; 
		setPredictions(prev => ({ ...prev, [idx]: { status: 'loading' } }));
		try {
			const result = await fetchPredictionForRow(rows[idx]);
			setPredictions(prev => ({ ...prev, [idx]: { status: 'success', data: result } }));
		} catch (err) {
			setPredictions(prev => ({ ...prev, [idx]: { status: 'error', error: err?.message || String(err) } }));
		}
	}

	const prettyKey = (k) => {
		const map = {
			status: 'Estado de predicción',
			prediction: 'Predicción del modelo',
			probability_confirmed: 'Probabilidad de confirmado',
			probability_false_positive: 'Probabilidad de que sea un falso positivo',
			model_used: 'Modelo utilizado'
		};

		const lk = String(k).toLowerCase();
		if (map[lk]) return map[lk];
		return String(k).replace(/_/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase());
	};

	const formatValue = (k, v) => {
		if (v === null || v === undefined) return '';
		const lk = String(k).toLowerCase();
		if (/probability|proba|p_?/i.test(lk) && typeof v === 'number') return `${(v * 100).toFixed(2)} %`;
		return String(v);
	};

	useEffect(() => {
		if (expandedIndex !== null && expandedRef.current) {
			expandedRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
		}
	}, [expandedIndex]);

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
						<button className="btn" type="button" onClick={() => setActiveStep(s => Math.min(1, s + 1))} disabled={activeStep === 1 || !canGo(activeStep + 1)}>→</button>
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
				<div style={{ marginTop: '.6rem', textAlign: 'center' }}>
					<button
						className="btn"
						onClick={() => loadExampleCSV()}
						style={{ backgroundColor: 'var(--accent)', color: 'white' }}
					>
						📊 Usar CSV de ejemplo
					</button>
					<p className="hint" style={{ marginTop: '.3rem', fontSize: '0.85em' }}>
						O carga tu propio archivo CSV abajo
					</p>
				</div>
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
				<p className="hint">{ui.headersHint}</p>
				{fileMeta && (
					<div className="file-info" style={{ marginTop: '.6rem' }}>
						<span><b>{ui.fileInfo.name}:</b> {fileMeta.name}</span>
						<span><b>{ui.fileInfo.rows}:</b> {fileMeta.rows.toLocaleString(currentLang)}</span>
						<span><b>{ui.fileInfo.cols}:</b> {fileMeta.cols.toLocaleString(currentLang)}</span>
					</div>
				)}
			</motion.div>)}

			{activeStep === 1 && (<motion.div
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
							Haz click en un elemento para visualizar su predicción y probabilidad.
						</p>
						<div className="preview" style={{ marginTop: '.6rem' }}>
							<table className="table">
								<thead><tr>{headers.map(h => <th key={h}>{h}</th>)}</tr></thead>
								<tbody>
									{rows.slice(0, 10).map((r, i) => (
										<tr
											key={i}
											className="clickable-row"
											onClick={() => handleRowClick(i)}
											style={{ cursor: 'pointer' }}
										>
											{headers.map(h => <td key={h}>{String(r[h] ?? '')}</td>)}
										</tr>
									))}
								</tbody>
							</table>
						</div>
						{}
						{expandedIndex !== null && (
							<div className="panel prediction-panel" ref={expandedRef} style={{ marginTop: '.6rem' }}>
								<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
									<h4 style={{ margin: 0 }}>Detalle de predicción - fila {expandedIndex + 1}</h4>
									<button className="btn" onClick={() => setExpandedIndex(null)}>Cerrar</button>
								</div>
								<div style={{ marginTop: '.5rem' }}>
									{predictions[expandedIndex]?.status === 'loading' && <div className="muted">Cargando predicción...</div>}
									{predictions[expandedIndex]?.status === 'error' && <div className="error">Error: {predictions[expandedIndex].error}</div>}
									{predictions[expandedIndex]?.status === 'success' && predictions[expandedIndex].data && (
										<table className="table slim">
											<tbody>
												{Object.entries(predictions[expandedIndex].data).map(([k, v]) => (
													<tr key={k}><th style={{ textAlign: 'left', width: '45%' }}>{prettyKey(k)}</th><td>{formatValue(k, v)}</td></tr>
												))}
											</tbody>
										</table>
									)}
								</div>
							</div>
						)}
					</>
				)}
			</motion.div>)}
		</motion.div>
	);
}