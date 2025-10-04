import { useMemo, useRef, useState, useEffect } from "react";

// Aproximación ligera sin dependencias externas
function getMoonIllumination(date) {
  // Julian Day
  const t = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    12, 0, 0
  );
  const jd = t / 86400000 + 2440587.5;
  // Época de luna nueva cercana a J2000 (Meeus, aproximado)
  const synodic = 29.530588853; // días
  const newMoonJD0 = 2451550.1; // 2000-01-06 18:14 UT aprox.
  let phase = (jd - newMoonJD0) / synodic;
  phase = phase - Math.floor(phase); // [0,1)
  const angle = phase * 2 * Math.PI;
  const fraction = 0.5 * (1 - Math.cos(angle)); // fracción iluminada ~ [0,1]
  return { phase, fraction, angle };
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

const PHASE_LABELS_ES = [
  "Luna nueva", // nueva.png
  "Creciente iluminante", // creciente.png
  "Cuarto creciente", // ccreciente.png
  "Gibosa creciente", // gcreciente.png
  "Luna llena", // llena.png
  "Gibosa menguante", // gmenguante.png
  "Cuarto menguante", // cmenguante.png
  "Creciente menguante", // menguante.png
];

// Mapear índice de fase -> archivo en /public
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

// Conversión de fase a variables CSS para máscara elíptica sobre textura
function phaseToCSSVars(phase) {
  const f = 0.5 * (1 - Math.cos(2 * Math.PI * phase)); // 0..1
  const rx = Math.max(0, Math.min(100, (1 - f) * 100));
  const waxing = phase < 0.5;
  const cx = waxing ? "30%" : "70%";
  return { rx, cx, waxing };
}

export default function MoonPhaseByDate({ messages }) {
  const [dateStr, setDateStr] = useState(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  });

  const { label, fraction, phaseVal, idx } = useMemo(() => {
    const dt = new Date(`${dateStr}T12:00:00`);
    if (Number.isNaN(dt.getTime())) {
      return { label: "Fecha inválida", fraction: 0, phaseVal: 0, idx: 0 };
    }
    const illum = getMoonIllumination(dt);
    const i = phaseIndex(illum.phase);
    const label = (messages?.phaseNames || PHASE_LABELS_ES)[i] || PHASE_LABELS_ES[i];
    return { label, fraction: illum.fraction, phaseVal: illum.phase, idx: i };
  }, [dateStr, messages]);

  const rootRef = useRef(null);
  const [imgSize, setImgSize] = useState(140);

  useEffect(() => {
    const update = () => {
      const w = rootRef.current?.offsetWidth || window.innerWidth || 360;
      // tamaños aproximados por breakpoint para que quepa bien en landscape móvil
      const next = w < 420 ? 110 : w < 560 ? 130 : w < 820 ? 140 : 160;
      setImgSize(next);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const percent = Math.round(100 * fraction);

  return (
    <div ref={rootRef} className="mpb" style={{ display: "grid", gap: 12 }}>
      <label className="mpb-field" style={{ fontWeight: 600 }}>
        {messages?.dateLabel || "Fecha"}
        <input
          type="date"
          value={dateStr}
          onChange={(e) => setDateStr(e.target.value)}
          style={{ marginLeft: 8 }}
        />
      </label>

      <div className="mpb-row" style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <img
          src={PHASE_IMAGES[idx]}
          width={imgSize}
          height={imgSize}
          alt={label}
          style={{ borderRadius: "50%", boxShadow: "0 8px 24px rgba(0,0,0,.35), inset 0 2px 8px rgba(255,255,255,.08)", background: "#0b1020" }}
          onError={(e) => { if (e.currentTarget.src.endsWith('moon-texture.svg')) return; e.currentTarget.src = '/moon-texture.svg'; }}
        />
        <div className="mpb-info" style={{ minWidth: 220, flex: "1 1 240px" }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{label}</div>
          <div>{(messages?.illumination || "Iluminación")} : {percent}%</div>
          <div>phase 0–1: {phaseVal.toFixed(3)}</div>
        </div>
      </div>

      <small style={{ opacity: 0.8 }}>
        {messages?.note || "Nota: aproximación visual; puede variar ±1 día según efemérides y zona horaria."}
      </small>
      
    </div>
  );
}
