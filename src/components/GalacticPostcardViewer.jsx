import { useEffect, useMemo, useState, useRef } from "react";
import "../assets/css/GalacticPostcardStudio.css";
import {
  DESIGN_CLASS_MAP,
  SHARE_PARAM,
  decodePayload,
  readShareTokenFromLocation
} from "./GalacticPostcardStudio.jsx";
import PostcardIntro from './PostcardIntro.jsx';

const DEFAULT_DESIGN = "aurora";

function normalizeLocationHash(token) {
  if (typeof window === "undefined") return;
  try {
    const encoded = encodeURIComponent(token);
    const url = new URL(window.location.href);
    if (url.searchParams.has(SHARE_PARAM)) {
      url.searchParams.delete(SHARE_PARAM);
    }
    const targetHash = `${SHARE_PARAM}=${encoded}`;
    if (url.hash.slice(1) !== targetHash) {
      url.hash = targetHash;
      if (window.history && window.history.replaceState) {
        const title = typeof document !== "undefined" ? document.title : "";
        window.history.replaceState({}, title, url.toString());
      }
    }
  } catch {
    /* ignore */
  }
}

function sanitizePayload(payload, sampleMessage, sampleSender) {
  const design = typeof payload?.d === "string" ? payload.d : DEFAULT_DESIGN;
  const message = (payload?.m ?? "").trim() || sampleMessage;
  const sender = (payload?.s ?? "").trim() || sampleSender;
  const recipient = (payload?.r ?? "").trim() || "";
  const photo = typeof payload?.p === "string" ? payload.p : null;
  return { design, message, sender, recipient, photo };
}

export default function GalacticPostcardViewer({ strings, postcardStrings, createHref }) {
  const [status, setStatus] = useState("loading");
  const [data, setData] = useState(null);
  const [introPlaying, setIntroPlaying] = useState(true);
  const [revealPostcard, setRevealPostcard] = useState(false);
  const canvasRef = useRef(null);

  const sampleMessage = postcardStrings?.sampleMessage ?? "";
  const sampleSender = postcardStrings?.sampleSender ?? "";

  useEffect(() => {
    const parseShare = async () => {
      try {
        const token = readShareTokenFromLocation();
        if (!token) {
          setStatus("missing");
          setData(null);
          return;
        }
        let payload = decodePayload(token);
        if (!payload) {
          setStatus("invalid");
          setData(null);
          return;
        }

        // If payload.p references the DB (db:<id>), try to fetch the stored base64 from Realtime DB
        if (payload.p && typeof payload.p === "string" && payload.p.startsWith("db:")) {
          try {
            const key = payload.p.slice(3);
            const env = typeof import.meta !== "undefined" ? import.meta.env : {};
            const firebaseDatabaseUrlEnv = env.PUBLIC_FIREBASE_DATABASE_URL;
            const firebaseProjectId = env.PUBLIC_FIREBASE_PROJECT_ID;
            const databaseURL = firebaseDatabaseUrlEnv
              ? String(firebaseDatabaseUrlEnv)
              : firebaseProjectId
                ? `https://${String(firebaseProjectId)}-default-rtdb.firebaseio.com`
                : null;
            if (databaseURL) {
              const endpoint = `${databaseURL.replace(/\/+$/, "")}/imgTemp/${key}.json`;
              const res = await fetch(endpoint);
              if (res.ok) {
                const body = await res.json();
                if (body && body.p) {
                  payload.p = body.p;
                }
              }
            }
          } catch (err) {
            console.warn("Failed to fetch postcard image from Realtime DB", err);
          }
        }

        normalizeLocationHash(token);
        setData(sanitizePayload(payload, sampleMessage, sampleSender));
        setStatus("ready");
        // Reset intro/reveal state; use PostcardIntro to handle the delay.
        setIntroPlaying(true);
        setRevealPostcard(false);
  try { document.documentElement.classList.add('is-share-view'); } catch (e) {}
      } catch (error) {
        console.error("Failed to parse shared postcard", error);
        setStatus("invalid");
        setData(null);
      }
    };

    parseShare();
    if (typeof window !== "undefined") {
      const onChange = () => parseShare();
      window.addEventListener("hashchange", onChange);
      window.addEventListener("popstate", onChange);
      return () => {
        window.removeEventListener("hashchange", onChange);
        window.removeEventListener("popstate", onChange);
        // cleanup any intro timers
        try {
          const timers = window.__postcardIntroTimers || [];
          timers.forEach((id) => clearTimeout(id));
          window.__postcardIntroTimers = [];
        } catch (e) { }
        try { document.documentElement.removeAttribute('data-allow-animations'); } catch (e) { }
        try { document.documentElement.classList.remove('is-share-view'); } catch (e) { }
      };
    }
    return undefined;
  }, [sampleMessage, sampleSender]);

  const designClassName = useMemo(() => {
    if (status !== "ready" || !data) return "design-generic";
    return DESIGN_CLASS_MAP[data.design] ? DESIGN_CLASS_MAP[data.design] : "design-generic";
  }, [status, data]);

  // Local copy of STAR_COLOR_MAP (kept in studio); used to pick star colors per design
  const STAR_COLOR_MAP = {
    'nebula-aurora': 'rgba(255, 220, 255, 0.9)',
    'orbital-crossing': 'rgba(160, 235, 255, 0.95)',
    'ion-trail': 'rgba(160, 255, 220, 0.95)',
    'ring-halo': 'rgba(255, 230, 180, 0.95)',
    'solar-panel': 'rgba(255, 238, 140, 0.95)',
    'starlit-grid': 'rgba(200, 230, 255, 0.95)',
    'default': 'rgba(200,200,255,0.9)'
  };

  // Initialize lightweight starfield on the viewer canvas so the shared viewer matches the studio
  useEffect(() => {
    if (!canvasRef.current || !data) return;
    const canvas = canvasRef.current;
    const activeColor = STAR_COLOR_MAP[data.design] || STAR_COLOR_MAP.default;
    let ctx = canvas.getContext('2d');
    let dpr = window.devicePixelRatio || 1;
    let w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
    let h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
    canvas.width = w;
    canvas.height = h;

    const stars = [];
    const COUNT = Math.round(Math.max(40, (canvas.clientWidth * canvas.clientHeight) / 6000));
    for (let i = 0; i < COUNT; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.6 + 0.2,
        alpha: Math.random() * 0.9 + 0.05,
        twinkle: Math.random() * 0.04 + 0.01,
        vx: (Math.random() - 0.5) * 0.16,
        vy: (Math.random() - 0.5) * 0.06
      });
    }

    let raf = null;

  function render() {
      ctx.clearRect(0, 0, w, h);
      const t = Date.now() * 0.00012;
      const gx = w * (0.45 + Math.sin(t * 0.7) * 0.08);
      const gy = h * (0.35 + Math.cos(t * 0.9) * 0.06);
      const g = ctx.createRadialGradient(gx, gy, Math.min(w, h) * 0.05, gx, gy, Math.max(w, h) * 0.9);
      try {
        g.addColorStop(0, activeColor.replace(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/, 'rgba($1,$2,$3,0.35)'));
      } catch {
        g.addColorStop(0, 'rgba(255,240,240,0.12)');
      }
      g.addColorStop(0.35, 'rgba(8,10,18,0.12)');
      g.addColorStop(1, 'rgba(4,8,18,0.9)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      stars.forEach((s) => {
        s.x += (s.vx + Math.sin(t + s.x * 0.0005) * 0.02) * (dpr || 1);
        s.y += (s.vy + Math.cos(t + s.y * 0.0006) * 0.01) * (dpr || 1);
        if (s.x < 0) s.x = w;
        if (s.x > w) s.x = 0;
        if (s.y < 0) s.y = h;
        if (s.y > h) s.y = 0;
        s.alpha += (Math.sin((Date.now() * s.twinkle) + (s.x + s.y)) * 0.5) * 0.04;
        s.alpha = Math.max(0.02, Math.min(1, s.alpha));

        const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 8);
        grad.addColorStop(0, activeColor.replace(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/, 'rgba($1,$2,$3,' + (Math.min(1, s.alpha) ) + ')'));
        grad.addColorStop(0.35, activeColor.replace(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/, 'rgba($1,$2,$3,' + (s.alpha * 0.45) + ')'));
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * dpr, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
      raf = requestAnimationFrame(render);
    }

    function onResize() {
      dpr = window.devicePixelRatio || 1;
      w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
      canvas.width = w;
      canvas.height = h;
    }

    window.addEventListener('resize', onResize);
    // Ensure we size the canvas to its actual layout before starting the render loop.
    try { onResize(); } catch (e) { /* ignore */ }
    render();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, [data, revealPostcard]);

  if (status === "loading") {
    return (
      <section className="viewer-card glass" aria-live="polite" style={{ padding: '1rem' }}>
        <p className="helper-text viewer-status">{strings?.loading ?? "Loading postcard…"}</p>
      </section>
    );
  }

  if (status !== "ready" || !data) {
    return (
      <section className="viewer-card glass" aria-live="polite" style={{ padding: '1rem' }}>
        <p className="helper-text viewer-status">
          {strings?.missing ?? "We couldn't load the shared postcard."}
        </p>
      </section>
    );
  }

  return (
    <section className="viewer-card glass" aria-live="polite" style={{ padding: '1rem', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
      {introPlaying ? (
        <PostcardIntro
          duration={(typeof window !== 'undefined' && window.__POSTCARD_INTRO_MS) ? window.__POSTCARD_INTRO_MS : 1000}
          onEnd={() => { setIntroPlaying(false); setTimeout(() => setRevealPostcard(true), 10); }}
        />
      ) : null}

      <div
        className={["postcard-preview", "glass", designClassName].join(" ")}
        role="img"
        aria-label={data.message}
        style={{
          transition: 'opacity 900ms cubic-bezier(.2,.9,.2,1), transform 900ms cubic-bezier(.2,.9,.2,1), filter 700ms ease',
          opacity: revealPostcard ? 1 : 0,
          transform: revealPostcard ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.98)',
          filter: revealPostcard ? 'blur(0px)' : 'blur(6px)',
          pointerEvents: introPlaying ? 'none' : 'auto',
          visibility: revealPostcard ? 'visible' : 'hidden',
          zIndex: 50
        }}
      >
        <div className="stamp">POST</div>
  <canvas ref={canvasRef} className="postcard-canvas" aria-hidden="true" />
        {data.photo ? (
          <img src={data.photo} alt="" className="postcard-photo" />
        ) : (
          <div className="photo-placeholder" aria-hidden="true">
            <span>★</span>
          </div>
        )}
        <div className="message-block">
          <p className="line para-line">
            <span className="message-label">{postcardStrings?.toLabel || 'Para:'}</span>
            <span className="recipient-text"> {data.recipient || ''}</span>
          </p>

          {data.message ? (
            <p className="line message-body">{data.message}</p>
          ) : (
            <p className="line message-body"> </p>
          )}

          <p className="line from-line">
            <span className="from-label">{postcardStrings?.fromLabel || 'De:'}</span>
            <span className="sender-text">{data.sender ? String(data.sender).trim() : ''}</span>
          </p>
        </div>
      </div>
      {/* Duplicate CTA shown below postcard when revealPostcard is true. */}
      {revealPostcard ? (
        <div className="postcard-cta-wrapper" style={{ marginTop: '1rem' }}>
          <a className="btn viewer-cta viewer-cta-below" href={createHref || '/verpostal'}>
            {postcardStrings?.createButton || strings?.cta || 'Create your postcard'}
          </a>
        </div>
      ) : null}
    </section>
  );
}

// Toggle a global class on the document root so page-level chrome can respond when the postcard is visible
// (kept after the component to ensure it's applied when revealPostcard updates)
