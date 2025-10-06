import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import Papa from "papaparse";
import "../assets/css/Analyze.css";
// prefer Papa.parse(worker) for local file parsing to avoid blocking the UI thread

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
	const [csvLoading, setCsvLoading] = useState(false);
	const [predictionsTotal, setPredictionsTotal] = useState(0);
	const [predictionsDone, setPredictionsDone] = useState(0);
	const [predictionsInFlight, setPredictionsInFlight] = useState(0);
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
		setCsvLoading(true);
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
				setCsvLoading(false);
				setPredictionsTotal(clean.length);
				// Ir automáticamente a la pestaña de visualización
				setActiveStep(1);
			},
			error: (err) => { setCsvLoading(false); alert(`Error al parsear CSV: ${err.message}`); }
		});
	}

	// Atajos de teclado: ← / → para navegar, Esc para cerrar el panel
	useEffect(() => {
		function onKey(e) {
			if (expandedIndex === null) return;
			if (e.key === 'ArrowLeft') {
				e.preventDefault();
				gotoIndex(expandedIndex - 1);
				return;
			}
			if (e.key === 'ArrowRight') {
				e.preventDefault();
				gotoIndex(expandedIndex + 1);
				return;
			}
			if (e.key === 'Escape') {
				setExpandedIndex(null);
				return;
			}
		}

		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [expandedIndex, rows]);

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
				// Mostrar la pestaña de visualización automáticamente
				setActiveStep(1);
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

	const onLocalFile = (f) => {
		if (!f) return;
		setCsvLoading(true);
		Papa.parse(f, {
			header: true,
			dynamicTyping: true,
			skipEmptyLines: true,
			worker: true,
			complete: (res) => {
				const clean = (res && res.data) ? res.data.filter(r => Object.keys(r).length > 0) : [];
				setRows(clean);
				const cols = res?.meta?.fields || Object.keys(clean[0] || {});
				setHeaders(cols);
				setFileMeta({ name: f.name, rows: clean.length, cols: cols.length });
				const guessY = cols.find(c => /^(y|label|target|clase|verdadero)/i.test(c)) || "";
				const guessP = cols.filter(c => /proba|prob_|p_/i.test(c));
				setYTrueCol(guessY);
				setYPredCol(cols.find(c => /^(y_pred|pred|hat|yhat|predicho|clase_pred)/i.test(c)) || "");
				setProbCols(guessP);
				setCsvLoading(false);
				setPredictionsTotal(clean.length);
				setActiveStep(1);
			},
			error: (err) => { setCsvLoading(false); alert(`Error al parsear CSV: ${err.message || err}`); }
		});
	};

	const stepLabels = useMemo(() => [ui.uploadHeading, ui.previewHeading].map(s => String(s).replace(/^\d+\)\s*/, '')), [ui]);
	const canGo = (idx) => idx === 0 || rows.length > 0;

	// Paginación para la tabla de preview
	const [page, setPage] = useState(0);
	const PAGE_SIZE = 20;
	const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));

	useEffect(() => {
		// resetear página cuando cambian las filas
		setPage(0);
	}, [rows]);

	// Llamada a la API (intenta varias rutas conocidas; envía los campos de la fila como top-level JSON)
	const API_BASE = 'https://mixtechdevs-nasa-exoplanet-detection.hf.space';

	async function fetchPredictionForRow(row) {
		const endpoints = ['/predict_csv_row', '/predict_csv_row/', '/predict_csv', '/predict_csv_raw'];
		let lastError = null;
		for (const ep of endpoints) {
			const url = `${API_BASE}${ep}`;
			try {
				const res = await fetch(url, {
					method: 'POST',
					mode: 'cors',
					headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
					body: JSON.stringify(row)
				});

				if (!res.ok) {
					let bodyText = '';
					try {
						bodyText = await res.text();
						try { const parsed = JSON.parse(bodyText); bodyText = JSON.stringify(parsed, null, 2); } catch { }
					} catch (e) { bodyText = '(no se pudo leer el body)'; }

					lastError = `HTTP ${res.status} from ${ep}\n${bodyText}`;
					if (res.status === 404) {
						// intentar siguiente endpoint
						continue;
					}
					// otros códigos -> devolver error (se usará fallback)
					throw new Error(lastError);
				}

				const data = await res.json();
				if (Array.isArray(data)) return data[0] || data;
				return data;
			} catch (err) {
				console.warn(`request to ${url} failed:`, err);
				lastError = err;
				// probar siguiente endpoint
			}
		}

		console.warn('All endpoint attempts failed, returning simulated output. Last error:', lastError);
		return { error: String(lastError), _simulated: true, ...(simulateModelOutput(row)) };
	}

	// Persistir predicciones en localStorage por src
	const LS_PRED = (s) => `anlz:preds:${s || 'default'}`;

	useEffect(() => {
		try { localStorage.setItem(LS_PRED(src), JSON.stringify(predictions)); } catch { }
	}, [predictions, src]);

	useEffect(() => {
		try {
			const raw = localStorage.getItem(LS_PRED(src));
			if (raw) {
				const parsed = JSON.parse(raw);
				setPredictions(parsed || {});
			}
		} catch { }
	}, [src]);



	function colorFor(p) {
		if (p >= 0.75) return '#2ecc71'; // green
		if (p >= 0.5) return '#f1c40f'; // yellow
		if (p >= 0.25) return '#e67e22'; // orange
		return '#e74c3c'; // red
	}

	function ProbRow({ k, v }) {
		const lk = String(k).toLowerCase();
		if (!(/probability|proba|p_?/i.test(lk) && typeof v === 'number')) return <span>{formatValue(k, v)}</span>;
		const pct = Math.max(0, Math.min(1, Number(v)));
		return (
			<div className="prob-row">
				<div className="prob-track"><div className="prob-fill" style={{ width: `${(pct*100).toFixed(2)}%`, background: colorFor(pct) }} /></div>
				<span className="prob-label">{(pct*100).toFixed(2)} %</span>
			</div>
		);
	}

	function simulateModelOutput(row) {
		const nums = Object.values(row).map(v => (typeof v === 'number' ? v : parseFloat(v))).filter(n => !Number.isNaN(n));
		const base = nums.length ? (nums.reduce((a, b) => a + b, 0) / nums.length) : Math.random();
		const p_confirmed = Math.min(0.995, Math.max(0.001, (Math.abs(Math.sin(base)) || Math.random())));
		return {
			status: 'Predicción completada',
			prediction: p_confirmed > 0.5 ? 'Confirmado' : 'Falso positivo',
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
			setPredictionsInFlight(n => n + 1);
			try {
				const result = await fetchPredictionForRow(rows[idx]);
				setPredictions(prev => ({ ...prev, [idx]: { status: 'success', data: result } }));
				setPredictionsDone(d => d + 1);
			} catch (err) {
				setPredictions(prev => ({ ...prev, [idx]: { status: 'error', error: err?.message || String(err) } }));
				setPredictionsDone(d => d + 1);
			} finally {
				setPredictionsInFlight(n => Math.max(0, n - 1));
			}
	}

// Navegar a un índice global: ajustar página y abrir fila, cargando predicción si es necesario
async function gotoIndex(globalIdx) {
	if (globalIdx == null) return;
	if (globalIdx < 0 || globalIdx >= rows.length) return;

	// ajustar página para que la fila sea visible
	const desiredPage = Math.floor(globalIdx / PAGE_SIZE);
	setPage(desiredPage);

	setExpandedIndex(globalIdx);
	if (predictions[globalIdx]) return;
	setPredictions(prev => ({ ...prev, [globalIdx]: { status: 'loading' } }));
		setPredictionsInFlight(n => n + 1);
		try {
			const result = await fetchPredictionForRow(rows[globalIdx]);
			setPredictions(prev => ({ ...prev, [globalIdx]: { status: 'success', data: result } }));
			setPredictionsDone(d => d + 1);
		} catch (err) {
			setPredictions(prev => ({ ...prev, [globalIdx]: { status: 'error', error: err?.message || String(err) } }));
			setPredictionsDone(d => d + 1);
		} finally {
			setPredictionsInFlight(n => Math.max(0, n - 1));
		}

}

function downloadPredictionsCSV() {
	const headerRow = [...headers, 'prediction', 'probability_confirmed', 'probability_false_positive'];
	const lines = [headerRow.join(',')];
	for (let i = 0; i < rows.length; i++) {
		const r = rows[i] || {};
		const pred = predictions[i]?.data || {};
		const vals = headers.map(h => {
			const v = r[h];
			return typeof v === 'string' ? `"${v.replace(/"/g, '""')}"` : (v ?? '');
		});
		vals.push(pred.prediction ?? '');
		vals.push(pred.probability_confirmed ?? '');
		vals.push(pred.probability_false_positive ?? '');
		lines.push(vals.join(','));
	}
	const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = (fileMeta?.name ? `${fileMeta.name.replace(/\.csv$/i, '')}-predictions.csv` : 'predictions.csv');
	document.body.appendChild(a);
	a.click();
	a.remove();
	setTimeout(() => URL.revokeObjectURL(url), 3000);
}

	const prettyKey = (k) => {
		const map = {
			//status: 'Estado de predicción',
			prediction: ui.prediction,
			probability_confirmed: ui.probability_confirmed,
			probability_false_positive: ui.probability_false_positive,
			//model_used: 'Modelo utilizado'
		};

		const lk = String(k).toLowerCase();
		if (map[lk]) return map[lk];
		return String(k).replace(/_/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase());
	};

	const formatValue = (k, v) => {
		if (v === null || v === undefined) return '';
		if (v === 'FALSE POSITIVE') return ui.falsePositiveResult;
		if (v === 'CONFIRMED') return ui.exoplanetCandidateResult;
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
					{/* <div className="stepper-nav">
						<button className="btn" type="button" onClick={() => setActiveStep(s => Math.max(0, s - 1))} disabled={activeStep === 0}>←</button>
						<button className="btn" type="button" onClick={() => setActiveStep(s => Math.min(1, s + 1))} disabled={activeStep === 1 || !canGo(activeStep + 1)}>→</button>
					</div> */}
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
								📊 {ui.exampleDataset}
							</button>
					<p className="hint" style={{ marginTop: '.3rem', fontSize: '0.85em' }}>
								{ui.orUploadHint || 'O carga tu propio archivo CSV abajo'}
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
				{csvLoading && <p className="muted" style={{ marginTop: '.5rem' }}>{ui.csvLoading || 'Parsing CSV…'}</p>}
								<div className="hint csv-headers">
									<p style={{ margin: 0 }}>{ui.headersHint}</p>
									<ul className="required-cols" style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', padding: 0, listStyle: 'none', marginTop: '.5rem' }}>
										{[
											'koi_prad','koi_dicco_msky','koi_dor','koi_max_mult_ev','koi_model_snr',
											'koi_max_sngle_ev','koi_fwm_stat_sig','koi_num_transits','koi_ror',
											'koi_fwm_srao','koi_srho','koi_insol','koi_duration','koi_teq','koi_period'
										].map(c => (
											<li key={c} style={{ marginRight: '.75rem', background: 'rgba(255,255,255,0.03)', padding: '.18rem .5rem', borderRadius: 6 }}>
												<code style={{ fontSize: '0.92em' }}>{c}</code>
											</li>
										))}
									</ul>
														<p style={{ marginTop: '.5rem', fontSize: '0.85em', opacity: 0.9 }}>{ui.headersExact}</p>
								</div>
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
					{!rows.length ? <p className="muted">{ui.noRowsHint || 'Carga un archivo CSV para ver los resultados.'}</p> : (
					<>
							<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
								<p className="muted" style={{ margin: 0 }}>
									{ui.predictionsDesc}
								</p>
								<div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
									{predictionsTotal > 0 && <div className="muted">{ui.predictionsProgress ? ui.predictionsProgress.replace('{done}', String(predictionsDone)).replace('{total}', String(predictionsTotal)) : `${predictionsDone} / ${predictionsTotal}`}</div>}
									<button className="btn" onClick={downloadPredictionsCSV} disabled={predictionsDone === 0}>{ui.downloadPredictions || 'Download predictions (CSV)'}</button>
								</div>
							</div>
							<div className="preview" style={{ marginTop: '.6rem' }}>
							<table className="table">
								<thead><tr>{headers.map(h => <th key={h}>{h}</th>)}</tr></thead>
								<tbody>
									{rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map((r, idx) => {
										const globalIndex = page * PAGE_SIZE + idx;
										return (
											<tr
												key={globalIndex}
												className="clickable-row"
												onClick={() => handleRowClick(globalIndex)}
												style={{ cursor: 'pointer' }}
											>
												{headers.map(h => <td key={h}>{String(r[h] ?? '')}</td>)}
											</tr>
										);
									})}
								</tbody>
							</table>

							<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '.5rem' }}>
								<div>
									{(() => {
										const start = Math.min(rows.length, page * PAGE_SIZE + 1);
										const end = Math.min(rows.length, (page + 1) * PAGE_SIZE);
										if (ui.pageInfo) return ui.pageInfo.replace('{start}', String(start)).replace('{end}', String(end)).replace('{total}', String(rows.length));
										return `Mostrando ${start} - ${end} de ${rows.length}`;
									})()}
								</div>
								{rows.length > PAGE_SIZE && (
									<div style={{ display: 'flex', gap: '.5rem' }}>
										<button className="btn" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} aria-label={ui.prevButton || 'Anterior'} title={ui.prevButton || 'Anterior'}>‹</button>
										<button className="btn" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} aria-label={ui.nextButton || 'Siguiente'} title={ui.nextButton || 'Siguiente'}>›</button>
									</div>
								)}
							</div>
						</div>
						{}
						{expandedIndex !== null && (
							<div className="panel prediction-panel" ref={expandedRef} style={{ marginTop: '.6rem' }}>
								<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
									<h4 style={{ margin: 0 }}>{ui.prediction || 'Detalle de predicción'} - fila {expandedIndex + 1}</h4>
									<div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
										{/* Prev / Next to navigate between rows */}
										<button
											className="btn"
											onClick={() => gotoIndex(expandedIndex - 1)}
											disabled={expandedIndex <= 0}
										>
											{ui.prevButton || 'Anterior'}
										</button>
										<button
											className="btn"
											onClick={() => gotoIndex(expandedIndex + 1)}
											disabled={expandedIndex >= rows.length - 1}
										>
											{ui.nextButton || 'Siguiente'}
										</button>
										</div>
								</div>
								<div style={{ marginTop: '.5rem' }}>
									{predictions[expandedIndex]?.status === 'loading' && <div className="muted">{ui.loadingPrediction || 'Cargando predicción...'}</div>}
									{predictions[expandedIndex]?.status === 'error' && <div className="error">{(ui.errorLabel || 'Error:')} {predictions[expandedIndex].error}</div>}
									{predictions[expandedIndex]?.status === 'success' && predictions[expandedIndex].data && (
										<>

											<table className="table slim">
												<tbody>
													{/* Mostrar campos en orden fijo */}
													{(() => {
														const data = predictions[expandedIndex].data;
														// Solo mostrar prediction y las dos probabilidades
														const keys = ['prediction', 'probability_confirmed', 'probability_false_positive'];
														return keys.map(k => {
															if (data[k] === undefined) return null;
															const v = data[k];
															return (
																<tr key={k}><th style={{ textAlign: 'left', width: '45%' }}>{prettyKey(k)}</th><td>{(/probability|proba|p_?/i.test(String(k).toLowerCase()) ? <ProbRow k={k} v={v} /> : formatValue(k, v))}</td></tr>
															);
														});
													})()}
												</tbody>
											</table>
											{predictions[expandedIndex].data?._simulated && <div className="muted" style={{ marginTop: '.4rem' }}>Esta predicción es SIMULADA</div>}
										</>
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