import { useEffect, useMemo, useRef, useState } from "react";

function getMoonIllumination(date) {
  const t = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12, 0, 0);
  const jd = t / 86400000 + 2440587.5;
  const synodic = 29.530588853;
  const newMoonJD0 = 2451550.1;
  let phase = (jd - newMoonJD0) / synodic;
  phase = phase - Math.floor(phase);
  const angle = phase * 2 * Math.PI;
  const fraction = 0.5 * (1 - Math.cos(angle));
  return { phase, fraction };
}

function phaseLabel(phase, names) {
  const x = ((phase % 1) + 1) % 1;
  const L = names || [
    "Luna nueva",
    "Creciente iluminante",
    "Cuarto creciente",
    "Gibosa creciente",
    "Luna llena",
    "Gibosa menguante",
    "Cuarto menguante",
    "Creciente menguante",
  ];
  if (x < 0.03 || x >= 0.97) return L[0];
  if (x < 0.22) return L[1];
  if (x < 0.28) return L[2];
  if (x < 0.47) return L[3];
  if (x < 0.53) return L[4];
  if (x < 0.72) return L[5];
  if (x < 0.78) return L[6];
  return L[7];
}

function phaseIndex(p) {
  const x = ((p % 1) + 1) % 1;
  if (x < 0.03 || x >= 0.97) return 0; // nueva
  if (x < 0.22) return 1; // creciente iluminante
  if (x < 0.28) return 2; // cuarto creciente
  if (x < 0.47) return 3; // gibosa creciente
  if (x < 0.53) return 4; // llena
  if (x < 0.72) return 5; // gibosa menguante
  if (x < 0.78) return 6; // cuarto menguante
  return 7; // creciente menguante
}

const PHASE_IMAGES = [
  "/nueva.png",
  "/creciente.png",
  "/ccreciente.png",
  "/gcreciente.png",
  "/llena.png",
  "/gmenguante.png",
  "/cmenguante.png",
  "/menguante.png",
];

function MoonImage({ phase, fraction, label }) {
  const idx = useMemo(() => phaseIndex(phase), [phase]);
  const percent = Math.round(fraction * 100);
  return (
    <figure className="moonimg" style={{ textAlign: 'center' }}>
      <img src={PHASE_IMAGES[idx]} alt={label} width={180} height={180} style={{ borderRadius: '50%', boxShadow: '0 8px 24px rgba(0,0,0,.35), inset 0 2px 8px rgba(255,255,255,.08)', background: '#0b1020' }} onError={(e)=>{ if (e.currentTarget.src.endsWith('moon-texture.svg')) return; e.currentTarget.src='/moon-texture.svg'; }} />
      <figcaption>
        <div className="moonimg__label" style={{ fontWeight: 700, marginTop: '.35rem' }}>{label}</div>
        <div className="moonimg__meta" style={{ fontVariantNumeric: 'tabular-nums', opacity: .85 }}>{percent}%</div>
      </figcaption>
      <style jsx>{`
        @media (max-width: 560px){ .moonimg img{ width: 140px; height: 140px; } }
      `}</style>
    </figure>
  );
}

export default function MoonCouple({ messages }) {
  const todayStr = useMemo(() => {
    const t = new Date();
    const y = t.getFullYear();
    const m = String(t.getMonth() + 1).padStart(2, '0');
    const d = String(t.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  const [a, setA] = useState(todayStr);
  const [b, setB] = useState(todayStr);

  const A = useMemo(() => {
    const dt = new Date(`${a}T12:00:00`);
    const { phase, fraction } = getMoonIllumination(dt);
    return { phase, fraction, label: phaseLabel(phase, messages?.phaseNames) };
  }, [a, messages]);
  const B = useMemo(() => {
    const dt = new Date(`${b}T12:00:00`);
    const { phase, fraction } = getMoonIllumination(dt);
    return { phase, fraction, label: phaseLabel(phase, messages?.phaseNames) };
  }, [b, messages]);

  const diff = Math.min(Math.abs(A.phase - B.phase), 1 - Math.abs(A.phase - B.phase));
  const match = Math.round((1 - diff * 2) * 100); // 0..100 aprox
  const combinedPercent = Math.min(100, Math.round((A.fraction + B.fraction) * 100));

  const [overlay, setOverlay] = useState({ srcA: "", srcB: "", visible: false });

  const combine = () => {
    const idxA = phaseIndex(A.phase);
    const idxB = phaseIndex(B.phase);
    setOverlay({ srcA: PHASE_IMAGES[idxA], srcB: PHASE_IMAGES[idxB], visible: true });
  };

  return (
    <div className="mooncouple">
      <div className="mooncouple__controls">
        <label className="mooncouple__label">
          {(messages?.dateA || 'Persona 1')}
          <input
            type="date"
            value={a}
            onChange={(e)=>setA(e.target.value)}
            className="mooncouple__input"
          />
        </label>
        <label className="mooncouple__label">
          {(messages?.dateB || 'Persona 2')}
          <input
            type="date"
            value={b}
            onChange={(e)=>setB(e.target.value)}
            className="mooncouple__input"
          />
        </label>
      </div>

      <div className="mooncouple__grid">
        <div className="mooncard">
          <MoonImage phase={A.phase} fraction={A.fraction} label={A.label} />
        </div>
        <div className="mooncard">
          <MoonImage phase={B.phase} fraction={B.fraction} label={B.label} />
        </div>
      </div>

      <div className="mooncouple__match">
        {(messages?.match || 'Concordancia')}: <strong>{match}%</strong>
        {" · "}
        {(messages?.combined || 'Combinada')}: <strong>{combinedPercent}%</strong>
      </div>

      <div className="mooncouple__actions">
        <button type="button" className="btn" onClick={combine}>{messages?.compareCta || 'Comparar'}</button>
      </div>

      {overlay.visible && (
        <div className="mooncouple__result">
          <div className="overlay-moon" aria-label={messages?.combined || 'Combinada'}>
            <img src={overlay.srcA} alt={(messages?.dateA || 'Fecha A')} />
            <img src={overlay.srcB} alt={(messages?.dateB || 'Fecha B')} />
          </div>
        </div>
      )}

      <style jsx>{`
        .mooncouple{ display:grid; gap:.75rem; }
        .mooncouple__controls{ display:grid; grid-template-columns:1fr 1fr; gap:.5rem; align-items:end; place-items:center; text-align:center; }
        .mooncouple__label{ display:grid; gap:.35rem; font-weight:600; }
        .mooncouple__input{
          width: 90%;
          padding: 0.45rem 0.65rem;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.22);
          background: rgba(255, 255, 255, 0.08);
          color: inherit;
          font-size: 1rem;
          font-variant-numeric: tabular-nums;
        }
        .mooncouple__input:focus{
          outline: 2px solid rgba(137, 180, 255, 0.6);
          outline-offset: 2px;
        }
        .mooncouple__grid{ display:grid; grid-template-columns: 1fr 1fr; gap: .75rem; align-items:center; justify-items:center; }
        .mooncard{ display:flex; align-items:center; justify-content:center; padding:.25rem; }
        .mooncouple__match{ text-align:center; margin-top:.25rem; }
        .mooncouple__actions{ display:flex; justify-content:center; margin-top:.25rem; }
        .mooncouple__result{ display:flex; justify-content:center; margin-top:.5rem; }
        .overlay-moon{ position:relative; width:220px; height:220px; border-radius:50%; }
        .overlay-moon img{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; border-radius:50%; opacity:.5; box-shadow: 0 8px 24px rgba(0,0,0,.35), inset 0 2px 8px rgba(255,255,255,.08); background:#0b1020; }
        @media (max-width: 620px){
          .mooncouple__controls{ grid-template-columns:1fr; }
          .mooncouple__grid{ grid-template-columns:1fr; }
        }
      `}</style>
    </div>
  );
}
