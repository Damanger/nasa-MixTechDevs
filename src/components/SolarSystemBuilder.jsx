import { useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { auth, db } from '../lib/firebaseClient.js';
import { emitToast } from '../lib/toast.js';
import { DEFAULT_LANG, LANG_EVENT, detectClientLanguage, getLanguageSafe, getTranslations } from "../i18n/translations.js";

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const defaultStar = { color: '#ffd35a', size: 28 };
const defaultPlanet = (i) => ({ color: [
  '#8ab4ff', '#9be7ff', '#ffd180', '#ff9bb3', '#c5ffd0', '#a19cff', '#ffceaa', '#a0ffe7', '#ffaf87'
][i % 9], size: clamp(10 - i, 4, 14), rings: false, ringTilt: 20 });

export default function SolarSystemBuilder() {
  const [lang, setLang] = useState(DEFAULT_LANG);
  useEffect(() => {
    const preferred = detectClientLanguage(DEFAULT_LANG);
    setLang((p) => (p === preferred ? p : preferred));
    const handler = (e) => setLang(getLanguageSafe(e.detail?.lang));
    window.addEventListener(LANG_EVENT, handler);
    return () => window.removeEventListener(LANG_EVENT, handler);
  }, []);
  const ui = useMemo(() => getTranslations(lang).solar?.controls ?? {}, [lang]);
  const [user, setUser] = useState(null);
  const [count, setCount] = useState(5);
  const [star, setStar] = useState(defaultStar);
  const [planets, setPlanets] = useState(() => Array.from({ length: 5 }, (_, i) => defaultPlanet(i)));
  const [showOrbits, setShowOrbits] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [azimuth, setAzimuth] = useState(0.6);   // yaw
  const [elevation, setElevation] = useState(0.35); // pitch
  const [zoom, setZoom] = useState(540);          // camera distance
  const [label, setLabel] = useState("");

  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const dragRef = useRef({ active: false, x: 0, y: 0, az: 0, el: 0 });
  const pinchRef = useRef({ active: false, startDist: 0, startZoom: 0 });

  // Track auth + auto-load once per user
  const loadedForUser = useRef(null);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
      if (u && loadedForUser.current !== u.uid) {
        loadedForUser.current = u.uid;
        // Auto-load saved config if exists
        loadConfigFor(u.uid);
      }
    });
    return () => unsub();
  }, []);

  // keep planets array in sync with count
  useEffect(() => {
    setPlanets((prev) => {
      if (prev.length === count) return prev;
      if (prev.length < count) {
        const extra = Array.from({ length: count - prev.length }, (_, j) => defaultPlanet(prev.length + j));
        return prev.concat(extra);
      }
      return prev.slice(0, count);
    });
  }, [count]);

  const project = (p, w, h, dpr) => {
    // Rotate world by -azimuth (Y) and -elevation (X)
    const sa = Math.sin(-azimuth), ca = Math.cos(-azimuth);
    const se = Math.sin(-elevation), ce = Math.cos(-elevation);
    // y-rotation
    const x1 = ca * p.x + sa * p.z;
    const z1 = -sa * p.x + ca * p.z;
    // x-rotation
    const y2 = ce * p.y - se * z1;
    const z2 = se * p.y + ce * z1;
    const zc = z2 + zoom; // translate so camera is at (0,0,-zoom)
    const fov = 60 * Math.PI / 180;
    const fl = (0.5 * h) / Math.tan(fov / 2);
    const sx = (x1 * fl) / Math.max(1, zc) + w / 2;
    const sy = (y2 * fl) / Math.max(1, zc) + h / 2;
    return { x: sx, y: sy, z: zc, scale: fl / Math.max(1, zc) };
  };

  const draw = (t) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth * dpr;
    const h = canvas.clientHeight * dpr;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w; canvas.height = h;
    }
    ctx.clearRect(0, 0, w, h);

    // background vignette
    const bg = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w, h) * 0.6);
    bg.addColorStop(0, 'rgba(255,255,255,0.02)');
    bg.addColorStop(1, 'rgba(0,0,0,0.12)');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

    // World units
    const starR = star.size; // world radius
    const baseGap = 60;      // world gap between orbits

    // Orbits (draw behind bodies)
    if (showOrbits) {
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 1 * dpr;
      for (let i = 0; i < planets.length; i++) {
        const r = starR + baseGap * (i + 1);
        ctx.beginPath();
        const steps = 128;
        for (let k = 0; k <= steps; k++) {
          const a = (k / steps) * Math.PI * 2;
          const pt = { x: Math.cos(a) * r, y: 0, z: Math.sin(a) * r };
          const q = project(pt, w, h, dpr);
          if (k === 0) ctx.moveTo(q.x, q.y); else ctx.lineTo(q.x, q.y);
        }
        ctx.stroke();
      }
    }

    // Build bodies list (planets + star + rings) and draw back-to-front
    const bodies = [];
    // Star at origin
    const sProj = project({ x: 0, y: 0, z: 0 }, w, h, dpr);
    bodies.push({
      kind: 'star',
      x: sProj.x, y: sProj.y, z: sProj.z,
      r: starR * sProj.scale,
      color: star.color,
      lightDir: { x: 0, y: 0 } // unused for star
    });

    planets.forEach((p, i) => {
      const orbitR = starR + baseGap * (i + 1);
      const angle = (t * 0.0006 * speed) / Math.sqrt(i + 1) + i;
      const world = { x: Math.cos(angle) * orbitR, y: 0, z: Math.sin(angle) * orbitR };
      const q = project(world, w, h, dpr);

      // Light direction on screen (from star to planet in camera space -> project to 2D)
      const lx = q.x - sProj.x;
      const ly = q.y - sProj.y;
      const len = Math.max(1, Math.hypot(lx, ly));
      const ldir = { x: lx / len, y: ly / len };

      const pr = clamp(p.size, 2, 30) * q.scale;

      // Optional rings rendered as an ellipse projected from world XZ plane
      if (p.rings) {
        const tilt = ((p.ringTilt ?? 0) * Math.PI) / 180;
        const ringOuterWorld = p.size * 1.9;
        const ringInnerWorld = p.size * 1.3;
        // Local axes for the ring plane: U = world X, V = world Z tilted around X axis
        const Vz = Math.cos(tilt);
        const Vy = -Math.sin(tilt);
        const qxOuter = project({ x: world.x + ringOuterWorld, y: world.y, z: world.z }, w, h, dpr);
        const qzOuter = project({ x: world.x, y: world.y + Vy * ringOuterWorld, z: world.z + Vz * ringOuterWorld }, w, h, dpr);
        const qxInner = project({ x: world.x + ringInnerWorld, y: world.y, z: world.z }, w, h, dpr);
        const qzInner = project({ x: world.x, y: world.y + Vy * ringInnerWorld, z: world.z + Vz * ringInnerWorld }, w, h, dpr);
        const rxOuter = Math.hypot(qxOuter.x - q.x, qxOuter.y - q.y);
        const ryOuter = Math.hypot(qzOuter.x - q.x, qzOuter.y - q.y);
        const rxInner = Math.hypot(qxInner.x - q.x, qxInner.y - q.y);
        const ryInner = Math.hypot(qzInner.x - q.x, qzInner.y - q.y);
        const angleRot = Math.atan2(qzOuter.y - q.y, qzOuter.x - q.x);
        bodies.push({ kind: 'ring', x: q.x, y: q.y, z: q.z + 0.001, angle: angleRot, rxOuter, ryOuter, rxInner, ryInner, color: p.color });
      }

      bodies.push({ kind: 'planet', x: q.x, y: q.y, z: q.z, r: pr, color: p.color, lightDir: ldir });
    });

    bodies.sort((a, b) => b.z - a.z); // draw far -> near

    for (const b of bodies) {
      if (b.r <= 0.5) continue;
      if (b.kind === 'star') {
        const g = ctx.createRadialGradient(b.x - b.r * 0.2, b.y - b.r * 0.2, b.r * 0.2, b.x, b.y, b.r);
        g.addColorStop(0, '#ffffff');
        g.addColorStop(0.4, b.color);
        g.addColorStop(1, 'rgba(0,0,0,0.35)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
      } else if (b.kind === 'ring') {
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.angle);
        ctx.beginPath();
        ctx.ellipse(0, 0, b.rxOuter, b.ryOuter, 0, 0, Math.PI * 2);
        ctx.ellipse(0, 0, b.rxInner, b.ryInner, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.fill('evenodd');
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.stroke();
        ctx.restore();
      } else {
        const ox = -b.lightDir.x * b.r * 0.35;
        const oy = -b.lightDir.y * b.r * 0.35;
        const pg = ctx.createRadialGradient(b.x + ox, b.y + oy, b.r * 0.15, b.x, b.y, b.r);
        pg.addColorStop(0, '#ffffff');
        pg.addColorStop(0.35, b.color);
        pg.addColorStop(1, 'rgba(0,0,0,0.5)');
        ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
      }
    }

    // Label bottom-right
    if (label && label.trim()) {
      ctx.save();
      ctx.font = `${14 * dpr}px system-ui, -apple-system, Segoe UI, Roboto, Arial`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.strokeStyle = 'rgba(0,0,0,0.55)';
      ctx.lineWidth = 3;
      const pad = 10 * dpr;
      const x = w - pad;
      const y = h - pad;
      ctx.strokeText(label, x, y);
      ctx.fillText(label, x, y);
      ctx.restore();
    }
  };

  // animation + resize
  useEffect(() => {
    const loop = (t) => { draw(t); rafRef.current = requestAnimationFrame(loop); };
    rafRef.current = requestAnimationFrame(loop);
    const onResize = () => draw(performance.now());
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener('resize', onResize); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [star, planets, showOrbits, speed, azimuth, elevation, zoom]);

  // mouse drag orbit controls
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const down = (e) => {
      dragRef.current = { active: true, x: e.clientX, y: e.clientY, az: azimuth, el: elevation };
    };
    const move = (e) => {
      if (!dragRef.current.active) return;
      const dx = e.clientX - dragRef.current.x;
      const dy = e.clientY - dragRef.current.y;
      setAzimuth(dragRef.current.az + dx * 0.005);
      setElevation(clamp(dragRef.current.el + dy * 0.003, -1.2, 1.2));
    };
    const up = () => { dragRef.current.active = false; };
    canvas.addEventListener('mousedown', down);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => {
      canvas.removeEventListener('mousedown', down);
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
  }, [azimuth, elevation]);

  // prevent page scroll when interacting with canvas (wheel/touch)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onWheel = (e) => {
      e.preventDefault();
      setZoom((z) => clamp(z + e.deltaY * 0.5, 220, 1600));
    };
    const dist = (t0, t1) => Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY);
    const onTouchStart = (e) => {
      if (e.touches.length === 1) {
        const t = e.touches[0];
        dragRef.current = { active: true, x: t.clientX, y: t.clientY, az: azimuth, el: elevation };
      } else if (e.touches.length === 2) {
        pinchRef.current = { active: true, startDist: dist(e.touches[0], e.touches[1]), startZoom: zoom };
        dragRef.current.active = false;
        e.preventDefault();
      }
    };
    const onTouchMove = (e) => {
      if (e.touches.length === 1 && dragRef.current.active) {
        e.preventDefault();
        const t = e.touches[0];
        const dx = t.clientX - dragRef.current.x;
        const dy = t.clientY - dragRef.current.y;
        setAzimuth(dragRef.current.az + dx * 0.005);
        setElevation(clamp(dragRef.current.el + dy * 0.003, -1.2, 1.2));
      } else if (e.touches.length === 2 && pinchRef.current.active) {
        e.preventDefault();
        const d = dist(e.touches[0], e.touches[1]);
        const delta = (pinchRef.current.startDist - d) * 1.2; // pinch out => smaller d => zoom out (increase)
        setZoom(clamp(pinchRef.current.startZoom + delta, 220, 1600));
      }
    };
    const onTouchEnd = (e) => {
      if (e.touches.length < 2) pinchRef.current.active = false;
      if (e.touches.length === 0) dragRef.current.active = false;
    };

    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
    };
  }, [azimuth, elevation]);

  const updatePlanet = (idx, patch) => {
    setPlanets((prev) => prev.map((p, i) => (i === idx ? { ...p, ...patch } : p)));
  };

  // Serialize and persist
  const serialize = () => ({
    count,
    star,
    planets,
    showOrbits,
    speed,
    azimuth,
    elevation,
    zoom,
    label,
    savedAt: Date.now(),
  });

  const [saveState, setSaveState] = useState('idle'); // idle | saving | saved | error
  const [saveError, setSaveError] = useState(null);

  const saveConfig = async () => {
    if (!user) return;
    setSaveState('saving');
    setSaveError(null);
    try {
      const data = serialize();
      await set(ref(db, `users/${user.uid}/solarSystem`), data);
      setSaveState('saved');
      try { emitToast(ui.savedToast || 'Saved', 'success'); } catch {}
      setTimeout(() => setSaveState('idle'), 1500);
    } catch (err) {
      console.error('Failed to save solar system', err);
      setSaveError('No se pudo guardar');
      setSaveState('error');
      setTimeout(() => setSaveState('idle'), 2500);
    }
  };

  const downloadPng = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      // ensure latest frame
      try { draw(performance.now()); } catch {}
      const filename = `mi-sistema-${new Date().toISOString().replace(/[:T]/g,'-').slice(0,19)}.png`;
      const trigger = (blobOrUrl) => {
        const a = document.createElement('a');
        a.href = typeof blobOrUrl === 'string' ? blobOrUrl : URL.createObjectURL(blobOrUrl);
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          if (typeof blobOrUrl !== 'string') URL.revokeObjectURL(a.href);
          document.body.removeChild(a);
        }, 0);
      };
      if (canvas.toBlob) {
        canvas.toBlob((blob) => blob && trigger(blob), 'image/png');
      } else {
        trigger(canvas.toDataURL('image/png'));
      }
    } catch (err) {
      console.error('Failed to download canvas', err);
    }
  };

  // Utility to get a pleasant random pastel-ish color in hex
  const randomHex = () => {
    const h = Math.floor(Math.random() * 360);
    const s = 70;
    const l = 65;
    const c = (1 - Math.abs(2 * l / 100 - 1)) * (s / 100);
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l / 100 - c / 2;
    let r1 = 0, g1 = 0, b1 = 0;
    if (h < 60) { r1 = c; g1 = x; b1 = 0; }
    else if (h < 120) { r1 = x; g1 = c; b1 = 0; }
    else if (h < 180) { r1 = 0; g1 = c; b1 = x; }
    else if (h < 240) { r1 = 0; g1 = x; b1 = c; }
    else if (h < 300) { r1 = x; g1 = 0; b1 = c; }
    else { r1 = c; g1 = 0; b1 = x; }
    const toHex = (v) => {
      const n = Math.round((v + m) * 255);
      return n.toString(16).padStart(2, '0');
    };
    return `#${toHex(r1)}${toHex(g1)}${toHex(b1)}`;
  };

  // Randomize star/planets quickly for inspiration
  const randomize = () => {
    setStar((s) => ({ ...s, color: randomHex(), size: clamp(Math.round(16 + Math.random() * 40), 12, 60) }));
    setPlanets((prev) => prev.map((p, i) => ({
      ...p,
      color: randomHex(),
      size: clamp(Math.round(4 + Math.random() * 26), 2, 30),
      rings: Math.random() < 0.35,
      ringTilt: Math.round(Math.random() * 80),
    })));
  };

  // Reset to defaults while keeping current planet count
  const resetAll = () => {
    setStar({ ...defaultStar });
    setPlanets(Array.from({ length: count }, (_, i) => defaultPlanet(i)));
    setShowOrbits(true);
    setSpeed(1);
    setAzimuth(0.6);
    setElevation(0.35);
    setZoom(540);
  };

  const loadConfigFor = async (uidParam) => {
    const uid = uidParam ?? user?.uid;
    if (!uid) return;
    try {
      const snap = await get(ref(db, `users/${uid}/solarSystem`));
      if (!snap.exists()) return;
      const cfg = snap.val() || {};
      const safeCount = clamp(parseInt(cfg.count ?? 5, 10), 1, 9);
      setCount(safeCount);
      setStar({
        color: cfg.star?.color ?? defaultStar.color,
        size: clamp(parseFloat(cfg.star?.size ?? defaultStar.size), 8, 100),
      });
      const arr = Array.from({ length: safeCount }, (_, i) => ({
        color: cfg.planets?.[i]?.color ?? defaultPlanet(i).color,
        size: clamp(parseFloat(cfg.planets?.[i]?.size ?? defaultPlanet(i).size), 2, 30),
        rings: !!cfg.planets?.[i]?.rings,
        ringTilt: clamp(parseInt(cfg.planets?.[i]?.ringTilt ?? 20, 10), 0, 85),
      }));
      setPlanets(arr);
      setShowOrbits(!!cfg.showOrbits);
      setSpeed(clamp(parseFloat(cfg.speed ?? 1), 0.1, 5));
      setAzimuth(parseFloat(cfg.azimuth ?? 0.6));
      setElevation(clamp(parseFloat(cfg.elevation ?? 0.35), -1.5, 1.5));
      setZoom(clamp(parseInt(cfg.zoom ?? 540, 10), 220, 2000));
      setLabel(String(cfg.label ?? ''));
      try { emitToast(ui.loadedToast || 'Loaded', 'success'); } catch {}
    } catch (err) {
      console.error('Failed to load solar system', err);
    }
  };

  return (
    <div className="solar-builder">
      <div className="solar-controls">
        <div className="group toolbar">
          <div className="fieldset-title">{ui.controls || 'Controles'}</div>
          <div className="actions">
            <button type="button" className="btn-sm" onClick={downloadPng} title={ui.downloadTitle || 'Descargar imagen (PNG)'}>{ui.download || 'Descargar'}</button>
            <button type="button" className="btn-sm" onClick={randomize} title={ui.randomize || 'Aleatorizar'}>{ui.randomize || 'Aleatorizar'}</button>
            <button type="button" className="btn-sm" onClick={resetAll} title={ui.reset || 'Restablecer'}>{ui.reset || 'Restablecer'}</button>
            {user && (
              <button type="button" className="btn-sm primary" onClick={saveConfig} disabled={saveState==='saving'} title={ui.save || 'Guardar'}>
                {saveState==='saving' ? 'Guardando…' : (ui.save || 'Guardar')}
              </button>
            )}
          </div>
          {saveState==='error' && <div style={{color:'#ffb4b4', fontSize:'.9rem'}}>{saveError}</div>}
        </div>

        <div className="group">
          <label>
            <span style={{ marginRight: '.5rem' }}>{ui.name || 'Nombre'}</span>
            <input type="text" placeholder={ui.namePlaceholder || 'Mi sistema'} value={label} onChange={(e) => setLabel(e.target.value)} style={{ flex: 1 }} />
          </label>
        </div>

        <div className="group">
          <label>
            {ui.planetsCount || 'Planetas (1–9)'}
            <select value={count} onChange={(e) => setCount(clamp(parseInt(e.target.value, 10), 1, 9))}>
              {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>
          <label>
            {ui.speed || 'Velocidad'}
            <input type="range" min={0.2} max={3} step={0.1} value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))} />
          </label>
          <label>
            {ui.zoom || 'Zoom'}
            <input type="range" min={220} max={1600} step={10} value={zoom} onChange={(e) => setZoom(parseInt(e.target.value, 10))} />
          </label>
          <label className="row">
            {ui.showOrbits || 'Mostrar órbitas'}
            <input type="checkbox" checked={showOrbits} onChange={(e) => setShowOrbits(e.target.checked)} />
          </label>
        </div>

        <div className="group">
          <div className="fieldset-title">{ui.star || 'Sol'}</div>
          <label>
            {ui.color || 'Color'}
            <input type="color" value={star.color} onChange={(e) => setStar((s) => ({ ...s, color: e.target.value }))} />
          </label>
          <label>
            {ui.size || 'Tamaño'}
            <input type="range" min={12} max={60} step={1} value={star.size} onChange={(e) => setStar((s) => ({ ...s, size: parseInt(e.target.value, 10) }))} />
          </label>
        </div>

        <div className="group">
          <div className="fieldset-title">{ui.planets || 'Planetas'}</div>
          <div className="planets-grid">
            {planets.map((p, i) => (
              <div key={i} className="planet-row">
                <div className="planet-label">#{i + 1}</div>
                <input type="color" value={p.color} aria-label={`Color planeta ${i + 1}`} onChange={(e) => updatePlanet(i, { color: e.target.value })} />
                <input type="range" min={2} max={30} step={1} value={p.size} aria-label={`Tamaño planeta ${i + 1}`} onChange={(e) => updatePlanet(i, { size: parseInt(e.target.value, 10) })} />
                <label className="toggle">
                  <input type="checkbox" checked={!!p.rings} onChange={(e) => updatePlanet(i, { rings: e.target.checked })} />
                  <span>{ui.rings || 'Anillos'}</span>
                </label>
                {p.rings && (
                  <input
                    className="ring-tilt"
                    type="range"
                    min={0}
                    max={80}
                    step={1}
                    value={p.ringTilt ?? 0}
                    onChange={(e) => updatePlanet(i, { ringTilt: parseInt(e.target.value, 10) })}
                    aria-label={`${ui.ringTilt || 'Inclinación'} planeta ${i + 1}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="solar-canvas" aria-label="Solar system canvas (3D)">
        <canvas ref={canvasRef} />
      </div>

      <style>{`
        .solar-builder{ display:grid; grid-template-columns: 320px 1fr; gap:1rem; align-items: start; overflow-x: hidden; }
        @media (max-width: 900px){ .solar-builder{ grid-template-columns: 1fr; } }
        .solar-controls{ border:1px solid var(--glass-brd); background: var(--glass-bg); border-radius: 14px; padding: .9rem; backdrop-filter: blur(14px) saturate(120%); }
        .toolbar .actions{ display:flex; flex-wrap: wrap; gap:.4rem; margin-top:.4rem; }
        .btn-sm{ border:1px solid var(--glass-brd); background: rgba(255,255,255,0.06); color: var(--text); border-radius: 8px; padding:.28rem .55rem; cursor:pointer; }
        .btn-sm:hover{ background: rgba(255,255,255,0.12); }
        .btn-sm.primary{ border-color: rgba(137,180,255,0.55); background: rgba(137,180,255,0.15); }
        .btn-sm.primary:disabled{ opacity:.6; cursor:default; }
        .group{ display:flex; flex-direction: column; gap:.5rem; margin-bottom: .75rem; }
        .group label{ display:flex; justify-content: space-between; align-items:center; gap:.5rem; }
        .group select{ min-width: 82px; }
        .group .row{ gap:.75rem; }
        .fieldset-title{ font-weight: 600; opacity: .9; margin-bottom: .2rem; }
        .planets-grid{ display:flex; flex-direction: column; gap:.45rem; max-height: 40vh; overflow-y:auto; overflow-x:hidden; padding-right: .25rem; }
        .planet-row{ display:grid; grid-template-columns: 44px 56px minmax(0,1fr) auto; align-items:center; gap:.5rem; }
        .planet-label{ color: var(--muted); }
        .toggle{ display:inline-flex; align-items:center; gap:.35rem; white-space:nowrap; }
        .ring-tilt{ grid-column: 2 / span 2; }
        .solar-controls{ overflow-y:auto; overflow-x:hidden; }
        @media (min-width: 901px){
          .solar-controls{ height: 60vh; position: sticky; top: 0; }
          .solar-canvas{ height: 60vh; }
        }
        @media (max-width: 900px){
          .solar-controls{ height: 420px; max-height: 420px; position: static; }
          .planets-grid{ max-height: 220px; }
        }
        .solar-canvas{ min-height: 360px; height: 60vh; border:1px solid var(--glass-brd); border-radius: 14px; background: rgba(0,0,0,0.75); overflow: hidden; cursor: grab; overscroll-behavior: contain; touch-action: none; }
        .solar-canvas:active{ cursor: grabbing; }
        .solar-canvas canvas{ width: 100%; height: 100%; display: block; }
      `}</style>
    </div>
  );
}
