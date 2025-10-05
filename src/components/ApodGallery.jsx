import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { onValue, ref, remove } from "firebase/database";
import { auth, db } from "../lib/firebaseClient.js";

const API_KEY = import.meta.env.PUBLIC_NASA_API_KEY || "DEMO_KEY";

async function fetchApod(date) {
  const u = new URL("https://api.nasa.gov/planetary/apod");
  u.searchParams.set("api_key", API_KEY);
  u.searchParams.set("thumbs", "true");
  if (date) u.searchParams.set("date", date);
  const r = await fetch(u.toString());
  if (!r.ok) throw new Error("HTTP " + r.status);
  return r.json();
}

export default function ApodGallery() {
  const [user, setUser] = useState(null);
  const [dates, setDates] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // Leer fechas guardadas
  useEffect(() => {
    if (!user) { setDates([]); setItems([]); setLoading(false); return; }
    const datesRef = ref(db, `users/${user.uid}/apod/savedDates`);
    const unsub = onValue(datesRef, (snap) => {
      const val = snap.val() || {};
      const list = Object.keys(val || {}).sort((a, b) => (a < b ? 1 : -1));
      setDates(list);
    });
    return () => unsub();
  }, [user?.uid]);

  // Traer datos APOD para cada fecha
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!dates.length) { setItems([]); setLoading(false); return; }
      setLoading(true); setError(null);
      try {
        const results = await Promise.allSettled(dates.map((d) => fetchApod(d)));
        if (cancelled) return;
        const ok = results
          .map((r) => (r.status === "fulfilled" ? r.value : null))
          .filter(Boolean);
        setItems(ok);
      } catch (e) {
        if (!cancelled) setError(String(e?.message || e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [dates]);

  if (!user) {
    return (
      <div className="glass" style={{ padding: "1rem" }}>
        <p style={{ color: "var(--muted)" }}>Inicia sesión para ver tus imágenes guardadas del día (APOD).</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, margin: "0 0 12px 0" }}>
        <h2 style={{ margin: 0 }}>Tus imágenes APOD</h2>
        <span style={{ color: "var(--muted)" }}>{dates.length} guardadas</span>
      </div>
      {loading ? (
        <div className="glass" style={{ padding: "1rem" }}>Cargando…</div>
      ) : error ? (
        <div className="glass" style={{ padding: "1rem", color: "#ff8fa3" }}>{error}</div>
      ) : items.length === 0 ? (
        <div className="glass" style={{ padding: "1rem" }}>Aún no guardas imágenes. Entra a APOD y pulsa “Guardar imagen en perfil”.</div>
      ) : (
        <div className="bento-grid">
          {items.map((it, i) => {
            const isImage = it.media_type === "image";
            const url = isImage ? it.url : it.thumbnail_url;
            const big = i % 7 === 0; // patrón simple
            return (
              <a
                key={it.date}
                className={`bento-item ${big ? "big" : ""}`}
                href={it.hdurl || it.url}
                target="_blank"
                rel="noopener noreferrer"
                title={it.title}
              >
                <button
                  className="remove-btn"
                  type="button"
                  aria-label="Eliminar de guardados"
                  title="Eliminar de guardados"
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    try {
                      await remove(ref(db, `users/${user.uid}/apod/savedDates/${it.date}`));
                      // optimista
                      setDates((prev) => prev.filter((d) => d !== it.date));
                      setItems((prev) => prev.filter((x) => x.date !== it.date));
                    } catch (err) {
                      console.error("Failed to remove date", err);
                    }
                  }}
                >
                  ×
                </button>
                {url ? (
                  <img src={url} alt={it.title} loading="lazy" decoding="async" />
                ) : (
                  <div className="placeholder">Sin miniatura</div>
                )}
                <div className="caption">
                  <div className="title">{it.title || "APOD"}</div>
                  <div className="date">{it.date}</div>
                </div>
              </a>
            );
          })}
        </div>
      )}
      <style>{`
        .bento-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 12px;
          grid-auto-flow: dense;
        }
        .bento-item {
          position: relative;
          display: block;
          overflow: hidden;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.18);
          background: rgba(255,255,255,0.06);
          box-shadow: 0 10px 24px rgba(0,0,0,0.28);
          aspect-ratio: 4 / 3;
        }
        .bento-item .remove-btn {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 24px;
          height: 24px;
          line-height: 22px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.25);
          background: rgba(0,0,0,0.45);
          color: #fff;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 2;
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
        }
        .bento-item .remove-btn:hover { background: rgba(0,0,0,0.6); }
        .bento-item.big { grid-column: span 2; aspect-ratio: 16 / 9; }
        .bento-item img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .bento-item .placeholder { display: grid; place-items: center; width: 100%; height: 100%; color: var(--muted); background: rgba(255,255,255,0.04); }
        .bento-item .caption {
          position: absolute; left: 8px; right: 8px; bottom: 8px; padding: 6px 8px; border-radius: 10px;
          background: rgba(0,0,0,0.35); color: #fff; border: 1px solid rgba(255,255,255,0.18);
          backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: space-between; gap: 8px;
        }
        .bento-item .title { font-size: 0.9rem; font-weight: 600; }
        .bento-item .date { font-size: 0.8rem; opacity: 0.85; }
        @media (max-width: 520px) {
          .bento-item.big { grid-column: span 1; }
        }
      `}</style>
    </div>
  );
}
