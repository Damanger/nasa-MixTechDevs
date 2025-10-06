import { useEffect, useMemo, useRef, useState, useId } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getStorage, ref as storageRef, uploadString, uploadBytes, getDownloadURL } from "firebase/storage";
import "../assets/css/GalacticPostcardStudio.css";
import { DEFAULT_LANG } from "../i18n/translations.js";
import { emitToast } from "../lib/toast.js";

const FALLBACK_STRINGS = {
  designHeading: "Pick a sketch",
  designDescription: "Browse six concepts inspired by nebulas and orbital stations.",
  messageHeading: "Customize your message",
  messageLabel: "Message",
  messagePlaceholder: "Your cosmic note goes here…",
  senderLabel: "Sender name",
  senderPlaceholder: "e.g., Commander Vega",
  photoHeading: "Optional photo",
  photoDropHint: "Drag & drop or click to upload a square image (JPG/PNG ~1–2 MB).",
  photoRemove: "Remove photo",
  shareHeading: "Share your postcard",
  shareDescription: "Generate a link that others can open to preview your design.",
  shareButton: "Create link",
  createButton: "Create your postcard",
  shareGenerating: "Generating…",
  shareCopy: "Copy link",
  shareCopied: "Link copied!",
  shareError: "We couldn't create the link.",
  sharePreview: "Send this link to your crew so they can preview the card.",
  shareTooLarge: "Image is too large for a temporary link. Try a smaller file.",
  shareStale: "You've updated the postcard. Create a new link to share the changes.",
  shareViewingNotice: "You're viewing a shared postcard. Want to make your own?",
  shareMakeYourOwn: "Create your own postcard",
  previewHeading: "Shared preview",
  previewDescription: "Someone shared this postcard with you. Enjoy the view!",
};

const DESIGNS = [
  { id: "nebula-aurora", name: "Nebula Aurora", className: "design-nebula-aurora" },
  { id: "orbital-crossing", name: "Orbital Crossing", className: "design-orbital-crossing" },
  { id: "ion-trail", name: "Ion Trail", className: "design-ion-trail" },
  { id: "ring-halo", name: "Ring Halo", className: "design-ring-halo" },
  { id: "solar-panel", name: "Solar Panel", className: "design-solar-panel" },
  { id: "starlit-grid", name: "Starlit Grid", className: "design-starlit-grid" },
];

const DESIGN_CLASS_MAP = {
  "nebula-aurora": "design-nebula-aurora",
  "orbital-crossing": "design-orbital-crossing",
  "ion-trail": "design-ion-trail",
  "ring-halo": "design-ring-halo",
  "solar-panel": "design-solar-panel",
  "starlit-grid": "design-starlit-grid",
};

// Star colors for animated background per design
const STAR_COLOR_MAP = {
  'nebula-aurora': 'rgba(255, 220, 255, 0.9)',
  'orbital-crossing': 'rgba(160, 235, 255, 0.95)',
  'ion-trail': 'rgba(160, 255, 220, 0.95)',
  'ring-halo': 'rgba(255, 230, 180, 0.95)',
  'solar-panel': 'rgba(255, 238, 140, 0.95)',
  'starlit-grid': 'rgba(200, 230, 255, 0.95)',
  'default': 'rgba(200,200,255,0.9)'
};

const MAX_EMBED_KB = 1800; // safety threshold for URL-length constrained share payloads
const SHARE_PARAM = "share";

// Optional Firebase helpers (upload photo to storage for stable URLs)
function ensureFirebase() {
  const cfgRaw = import.meta.env.PUBLIC_FIREBASE_CONFIG || null;
  if (!cfgRaw) return null;
  let cfg = null;
  try {
    cfg = JSON.parse(cfgRaw);
  } catch {
    console.warn("PUBLIC_FIREBASE_CONFIG is not valid JSON.");
    return null;
  }
  if (!cfg || typeof cfg !== "object") return null;
  if (!getApps().length) initializeApp(cfg);
  return cfg;
}

async function uploadToFirebaseIfNeeded(fileOrDataUrl, pathHint = "postcards/photo") {
  const cfg = ensureFirebase();
  if (!cfg) return null;
  try {
    const storage = getStorage();
    const key = `${pathHint}-${Date.now()}`;
    const ref = storageRef(storage, key);

    if (typeof fileOrDataUrl === "string" && fileOrDataUrl.startsWith("data:")) {
      // data URL
      await uploadString(ref, fileOrDataUrl, "data_url");
    } else if (fileOrDataUrl instanceof Blob) {
      await uploadBytes(ref, fileOrDataUrl);
    } else {
      return null;
    }
    const url = await getDownloadURL(ref);
    return url;
  } catch (err) {
    console.warn("Firebase upload failed:", err);
    return null;
  }
}

// Upload a data URL to the Realtime Database under /imgTemp/<key>.json as a temporary store.
// Returns a token string of the form `db:<key>` on success, or null on failure.
async function uploadToRealtimeDbTemp(dataUrl, path = 'imgTemp') {
  try {
    const env = typeof import.meta !== 'undefined' ? import.meta.env : {};
    const firebaseDatabaseUrlEnv = env.PUBLIC_FIREBASE_DATABASE_URL;
    const firebaseProjectId = env.PUBLIC_FIREBASE_PROJECT_ID;
    const databaseURL = firebaseDatabaseUrlEnv
      ? String(firebaseDatabaseUrlEnv)
      : firebaseProjectId
        ? `https://${String(firebaseProjectId)}-default-rtdb.firebaseio.com`
        : null;
    if (!databaseURL) return null;

    // Generate a reasonably unique key
    const key = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,9)}`;
    const endpoint = `${databaseURL.replace(/\/+$/, "")}/${path}/${encodeURIComponent(key)}.json`;

    const body = {
      p: dataUrl,
      createdAt: Date.now(),
      // store an expiresAt field (2 days)
      expiresAt: Date.now() + (2 * 24 * 60 * 60 * 1000)
    };

    const res = await fetch(endpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) return null;
    return `db:${key}`;
  } catch (err) {
    console.warn('Failed to upload image to Realtime DB', err);
    return null;
  }
}

// Utility: encode small payload into URL hash safely
function safeEncode(str) {
  try {
    return encodeURIComponent(str);
  } catch {
    return str;
  }
}

// Utility: maybe compress or at least keep only the needed dataURL information
async function maybeOptimizeDataUrl(dataUrl) {
  // For simplicity here, keep as is. You could downscale or re-encode with canvas if needed.
  return dataUrl;
}

function parseShareFromHash() {
  if (typeof window === "undefined") return null;
  const rawHash = window.location.hash.replace(/^#/, "");

  if (!rawHash) return null;

  // Support both "share=..." and custom hash strings without key/value pairs
  if (rawHash.startsWith(`${SHARE_PARAM}=`)) {
    const candidate = rawHash.slice(SHARE_PARAM.length + 1);
    try {
      return decodeURIComponent(candidate);
    } catch {
      return candidate;
    }
  }

  const hashParams = new URLSearchParams(rawHash);
  const candidate = hashParams.get(SHARE_PARAM);
  if (!candidate) return null;
  try {
    return decodeURIComponent(candidate);
  } catch {
    return candidate;
  }
}

// Read the raw share token from the location hash without decoding it.
// Returns the token string (may be encoded) or null.
function readShareTokenFromLocation() {
  if (typeof window === "undefined") return null;
  const rawHash = window.location.hash.replace(/^#/, "");
  if (!rawHash) return null;
  if (rawHash.startsWith(`${SHARE_PARAM}=`)) {
    return rawHash.slice(SHARE_PARAM.length + 1);
  }
  const hashParams = new URLSearchParams(rawHash);
  return hashParams.get(SHARE_PARAM);
}

// Decode a token (URL-encoded base64) into the JSON payload object.
function decodePayload(token) {
  if (!token) return null;
  try {
    // try decodeURIComponent then atob
    let candidate = token;
    try {
      candidate = decodeURIComponent(token);
    } catch (_e) {
      // ignore
    }
    try {
      const json = atob(candidate);
      return JSON.parse(json);
    } catch (_e) {
      // fallback: if candidate wasn't base64, try atob on original token
      try {
        const json = atob(token);
        return JSON.parse(json);
      } catch (err) {
        console.warn('decodePayload: failed to decode token', err);
        return null;
      }
    }
  } catch (err) {
    console.warn('decodePayload: unexpected error', err);
    return null;
  }
}

function useStrings(lang) {
  // If you have i18n, wire it here; fallback uses English literals above.
  return FALLBACK_STRINGS;
}

function ensureSquareViaCSS(url) {
  // Handled by CSS object-fit, but sampler remains
  return url;
}

function getLangOrDefault() {
  try {
    const url = new URL(window.location.href);
    const lang = url.searchParams.get("lang") || DEFAULT_LANG || "en";
    return lang;
  } catch {
    return DEFAULT_LANG || "en";
  }
}

function dataUrlSizeKB(dataUrl) {
  if (!dataUrl?.startsWith?.("data:")) return 0;
  const comma = dataUrl.indexOf(",");
  if (comma < 0) return 0;
  const base64 = dataUrl.slice(comma + 1);
  // 4/3 expansion
  const bytes = Math.ceil((base64.length * 3) / 4);
  return Math.round(bytes / 1024);
}

function GalacticPostcardStudio() {
  const [lang, setLang] = useState(getLangOrDefault());
  const strings = useStrings(lang);

  // Share route path (configurable via PUBLIC_SHARE_PATH). Keep here so multiple hooks can use it.
  const sharePath = (import.meta.env && import.meta.env.PUBLIC_SHARE_PATH) || '/verpostal';

  const designs = DESIGNS;

  const [selectedDesign, setSelectedDesign] = useState(designs[0].id);
  const previousSamplesRef = useRef({ message: "", sender: "" });
  const [message, setMessage] = useState("");
  const [sender, setSender] = useState("");
  const [recipient, setRecipient] = useState("");
  const [sampleMessage, setSampleMessage] = useState("Wishing you clear skies and gentle gravity.");
  const [sampleSender, setSampleSender] = useState("— Commander Vega");

  useEffect(() => {
    const prevSampleMessage = previousSamplesRef.current.message || sampleMessage;
    const prevSampleSender = previousSamplesRef.current.sender || sampleSender;
    setMessage((current) => (current === prevSampleMessage ? sampleMessage : current));
    setSender((current) => (current === prevSampleSender ? sampleSender : current));
    setRecipient((current) => current);
    previousSamplesRef.current = { message: sampleMessage, sender: sampleSender };
  }, [sampleMessage, sampleSender]);

  const [photo, setPhoto] = useState(null);
  const photoInputId = useId();
  const previewCanvasRef = useRef(null);
  const sharedPreviewCanvasRef = useRef(null);
  const parsedShareRef = useRef(false);
  const copyTimeoutRef = useRef(null);
  const shareInputRef = useRef(null);
  const [shareUrl, setShareUrl] = useState(null);
  const [shareState, setShareState] = useState("idle");
  const [shareError, setShareError] = useState(null);
  const [copyFeedback, setCopyFeedback] = useState(null);
  const [isShareView, setIsShareView] = useState(false);
  const [introPlaying, setIntroPlaying] = useState(true);
  const [revealPostcard, setRevealPostcard] = useState(false);

  // If opening a shared URL, parse the payload to show a minimal read-only preview
  useEffect(() => {
    // If there's a share token in the hash but the current pathname isn't the canonical
    // share path, update the URL shown in the browser to the canonical one while
    // preserving the hash. This doesn't reload the page and preserves the current UI
    // (so the design from /postal stays intact) but ensures shared links normalize
  // to the dedicated route (e.g. /postal#share=...).
    try {
      const rawHash = window.location.hash.replace(/^#/, '');
      if (rawHash && window.location.pathname !== sharePath) {
        // Use replaceState to avoid adding history entries and to keep the app state.
        window.history.replaceState(null, '', sharePath + window.location.hash);
      }
    } catch (e) {
      // ignore (server-side rendering or other issues)
    }

    const encoded = parseShareFromHash();
    if (!encoded || parsedShareRef.current) return;

    parsedShareRef.current = true;
    try {
      const raw = atob(decodeURIComponent(encoded));
      const payload = JSON.parse(raw);
      // payload: { d: designId, m: message, s: sender, p: photoUrl? }
      if (payload?.d && DESIGN_CLASS_MAP[payload.d]) setSelectedDesign(payload.d);
      if (typeof payload?.m === "string") setMessage(payload.m.slice(0, 500));
      if (typeof payload?.s === "string") setSender(payload.s.slice(0, 100));
      if (payload?.p) {
        const url = ensureSquareViaCSS(payload.p);
        setPhoto({ url, dataUrl: null });
      }
      setIsShareView(true);
      // Start intro timers so recipients see the OVNI intro before the postcard
      try {
        setIntroPlaying(true);
        setRevealPostcard(false);
        const INTRO_MS = (typeof window !== 'undefined' && window.__POSTCARD_INTRO_MS) ? window.__POSTCARD_INTRO_MS : 6000;
        try { (window.__postcardIntroTimers || []).forEach(id => clearTimeout(id)); } catch(e){}
        window.__postcardIntroTimers = [];
        try { document.documentElement.setAttribute('data-allow-animations','true'); } catch(e){}
        const t = setTimeout(() => {
          try { document.documentElement.setAttribute('data-allow-animations','false'); } catch(e){}
          setIntroPlaying(false);
          setTimeout(() => setRevealPostcard(true), 40);
        }, INTRO_MS);
        window.__postcardIntroTimers.push(t);
      } catch (e) {
        // ignore
      }
      try {
        // Add a global class so page-level chrome (like the page header) can be hidden
        document.documentElement.classList.add('is-share-view');
      } catch (e) {
        // ignore (SSR or private envs)
      }
    } catch (err) {
      console.warn("Failed to parse shared payload:", err);
    }
  }, []);

  // Cleanup: ensure we remove the global class if component unmounts or share view toggles off
  useEffect(() => {
    return () => {
      try { document.documentElement.classList.remove('is-share-view'); } catch (e) {}
      try {
        const timers = window.__postcardIntroTimers || [];
        timers.forEach((id) => clearTimeout(id));
        window.__postcardIntroTimers = [];
      } catch (e) {}
      try { document.documentElement.removeAttribute('data-allow-animations'); } catch(e){}
    };
  }, []);

  // Any change after generating a link should mark the link as "stale"
  const shareSnapshotRef = useRef(null);
  useEffect(() => {
    if (!shareUrl) return;
    const currentPhotoData =
      photo?.url && !photo?.dataUrl ? photo.url : photo?.dataUrl ? "dataurl" : null;

    const snapshot = JSON.stringify({
      d: selectedDesign,
      m: message.trim() || sampleMessage,
      s: sender.trim() || sampleSender,
      r: recipient.trim() || "",
      p: currentPhotoData,
    });

    if (snapshot !== shareSnapshotRef.current) {
      setShareState("stale");
    }
  }, [selectedDesign, message, sender, photo?.dataUrl, photo?.url, sampleMessage, sampleSender, shareState]);

  const handleGenerateShareLink = async () => {
    if (typeof window === "undefined") return;
    setShareState("loading");
    setShareError(null);
    setCopyFeedback(null);

    try {
      let payload = {
        d: selectedDesign,
        m: message.trim() || sampleMessage,
        s: sender.trim() || sampleSender,
        r: recipient.trim() || "",
        p: null,
      };

      // If photo is present, try to upload to Firebase for a stable URL
      if (photo?.dataUrl) {
        // Prefer storing the dataUrl temporarily in Realtime DB if Firebase is configured
        // to avoid excessively long share URLs. If upload fails, fall back to embedding
        // when the size is within limits.
        const kb = dataUrlSizeKB(photo.dataUrl);
        let dbToken = null;
        try {
          dbToken = await uploadToRealtimeDbTemp(photo.dataUrl, 'imgTemp');
        } catch (e) {
          dbToken = null;
        }

        if (dbToken) {
          payload.p = dbToken; // db:<key>
        } else {
          // If Realtime DB isn't available or upload failed, fall back to prior behavior.
          if (kb > MAX_EMBED_KB) {
            // try to upload to storage if configured
            const uploaded = await uploadToFirebaseIfNeeded(photo.dataUrl, "postcards/photo");
            if (uploaded) {
              payload.p = uploaded;
            } else {
              const optimized = await maybeOptimizeDataUrl(photo.dataUrl);
              if (dataUrlSizeKB(optimized) > MAX_EMBED_KB) {
                throw Object.assign(new Error("PHOTO_TOO_LARGE"), { code: "PHOTO_TOO_LARGE" });
              }
              payload.p = optimized;
            }
          } else {
            payload.p = await maybeOptimizeDataUrl(photo.dataUrl);
          }
        }
      } else if (photo?.url) {
        payload.p = photo.url;
      }

      // Encode compact payload to URL hash
      const json = JSON.stringify(payload);
      const base64 = btoa(json);
      const encoded = safeEncode(base64);

    // Prefer a dedicated share/view route so shared links are consistent
    // Use the component-level `sharePath` (configurable via PUBLIC_SHARE_PATH)
    const base = window.location.origin + sharePath;
  const url = `${base}#share=${encoded}`;
      setShareUrl(url);

      // Track snapshot for staleness detection
      const snapshot = JSON.stringify({
        d: payload.d,
        m: payload.m,
        s: payload.s,
        r: payload.r ?? "",
        p: payload.p ?? null,
      });
      shareSnapshotRef.current = snapshot;
      setShareState("success");

      try { emitToast("Share link ready.", "success"); } catch {}
    } catch (error) {
      console.error("Failed to generate share link", error);
      if (error?.code === "PHOTO_TOO_LARGE") {
        setShareError(strings.shareTooLarge ?? FALLBACK_STRINGS.shareTooLarge);
      } else {
        setShareError(strings.shareError);
      }
      setShareState("error");
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    let copied = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(shareUrl);
          copied = true;
        } catch (e) {
          copied = false;
        }
      }

      if (!copied) {
        // Try selecting the visible input
        try {
          const inputEl = shareInputRef.current || document.querySelector('.share-output input');
          if (inputEl) {
            inputEl.focus();
            inputEl.select();
            // iOS sometimes needs a real selection range
            inputEl.setSelectionRange(0, inputEl.value.length);
            const ok = document.execCommand('copy');
            if (ok) copied = true;
          }
        } catch (e) {
          copied = false;
        }
      }

      if (!copied) {
        // Final fallback: offscreen textarea
        const ta = document.createElement('textarea');
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        ta.value = shareUrl;
        document.body.appendChild(ta);
        ta.select();
        try {
          const ok = document.execCommand('copy');
          if (ok) copied = true;
        } catch (e) {
          copied = false;
        }
        document.body.removeChild(ta);
      }

      if (!copied) throw new Error('COPY_FAILED');

      setCopyFeedback('copied');
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopyFeedback(null), 2200);

      // NOTA: si el enlace está "stale", muestra advertencia; de lo contrario, éxito.
      (shareState === 'stale')
        ? emitToast(strings.shareStale ?? FALLBACK_STRINGS.shareStale, 'warning')
        : emitToast(strings.shareCopied ?? FALLBACK_STRINGS.shareCopied, 'success');
    } catch (error) {
      console.error('Failed to copy share link', error);
      setCopyFeedback(null);
      setShareError(strings.shareError);
      try { emitToast(strings.shareError ?? FALLBACK_STRINGS.shareError, 'error'); } catch {}
    }
  };

  const designClassName = DESIGN_CLASS_MAP[selectedDesign] ?? "design-generic";
  const canCopyLink = Boolean(
    shareUrl && (shareState === "success" || shareState === "stale")
  );

  // Initialize a lightweight starfield on a canvas element
  useEffect(() => {
    const canvases = [previewCanvasRef.current, sharedPreviewCanvasRef.current].filter(Boolean);
    const activeColor = STAR_COLOR_MAP[selectedDesign] || STAR_COLOR_MAP.default;
    const instances = [];

    canvases.forEach((canvas) => {
      let ctx = canvas.getContext('2d');
      let dpr = window.devicePixelRatio || 1;
      let w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      let h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
      canvas.width = w;
      canvas.height = h;

      const stars = [];
      // More stars to fill the postcard and make movement notable. Tuned divisor for density.
      const COUNT = Math.round(Math.max(40, (canvas.clientWidth * canvas.clientHeight) / 6000));
      for (let i = 0; i < COUNT; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.6 + 0.2,
          alpha: Math.random() * 0.9 + 0.05,
          // stronger twinkle variation
          twinkle: Math.random() * 0.04 + 0.01,
          // slightly faster drift
          vx: (Math.random() - 0.5) * 0.16,
          vy: (Math.random() - 0.5) * 0.06
        });
      }

      let raf = null;

      function render() {
        ctx.clearRect(0, 0, w, h);
        // draw a moving nebula gradient behind the stars for depth
        const t = Date.now() * 0.00012;
        const gx = w * (0.45 + Math.sin(t * 0.7) * 0.08);
        const gy = h * (0.35 + Math.cos(t * 0.9) * 0.06);
        const g = ctx.createRadialGradient(gx, gy, Math.min(w, h) * 0.05, gx, gy, Math.max(w, h) * 0.9);
        // dynamic color based on activeColor (fallback)
        try {
          g.addColorStop(0, activeColor.replace(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/, 'rgba($1,$2,$3,0.35)'));
        } catch {
          g.addColorStop(0, 'rgba(255,240,240,0.12)');
        }
        g.addColorStop(0.35, 'rgba(8,10,18,0.12)');
        g.addColorStop(1, 'rgba(4,8,18,0.9)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);

        // draw subtle glow by blending stars with 'lighter'
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        stars.forEach((s) => {
          // small oscillation for parallax-like motion
          s.x += (s.vx + Math.sin(t + s.x * 0.0005) * 0.02) * (dpr || 1);
          s.y += (s.vy + Math.cos(t + s.y * 0.0006) * 0.01) * (dpr || 1);
          if (s.x < 0) s.x = w;
          if (s.x > w) s.x = 0;
          if (s.y < 0) s.y = h;
          if (s.y > h) s.y = 0;
          // twinkle
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

      // handle resize
      function onResize() {
        dpr = window.devicePixelRatio || 1;
        w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
        h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
        canvas.width = w;
        canvas.height = h;
      }

      window.addEventListener('resize', onResize);
      render();

      instances.push({ raf, onResize, canvas });
    });

    return () => {
      instances.forEach((it) => {
        if (it.raf) cancelAnimationFrame(it.raf);
        window.removeEventListener('resize', it.onResize);
      });
    };
  }, [selectedDesign]);

  if (isShareView) {
    // Minimal read-only view for recipients. Show only the postcard preview and a CTA to create their own.
    return (
      <section className="postcard-studio shared-view glass">
        <div className="shared-header">
          <h2>{strings.previewHeading}</h2>
          <p className="helper-text">{strings.sharePreview}</p>
        </div>
        <div style={{ padding: '1rem', position: 'relative' }}>
          {introPlaying ? (
            <PostcardIntro duration={(typeof window !== 'undefined' && window.__POSTCARD_INTRO_MS) ? window.__POSTCARD_INTRO_MS : 5000} onEnd={() => { setIntroPlaying(false); setTimeout(() => setRevealPostcard(true), 40); }} />
          ) : null}

          <div
            className={["postcard-preview", "glass", designClassName].join(" ")}
            role="img"
            aria-label={message || sampleMessage}
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
            <canvas ref={sharedPreviewCanvasRef} className="postcard-canvas" aria-hidden="true" />
            {photo ? (
              <img src={photo.url} alt="" className="postcard-photo" />
            ) : (
              <div className="photo-placeholder" aria-hidden="true">
                <span>★</span>
              </div>
            )}
            <div className="message-block">
              <p className="message-text">{message || sampleMessage}</p>
              <span className="sender-text">{`- ${(sender || sampleSender).toString().trim()}`}</span>
            </div>
          </div>

          <div className="shared-actions" style={{ marginTop: '0.75rem' }}>
            <a href={window.location.origin + window.location.pathname} className="btn">
              {strings.shareMakeYourOwn}
            </a>
          </div>
        </div>
      </section>
    );
  }

  // Controlled photo input handler
  const handlePhotoChange = async (event) => {
    const file = event?.target?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target.result;
      setPhoto({ dataUrl, url: null });
      setShareState("stale");
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoDrop = async (event) => {
    event.preventDefault();
    const file = event?.dataTransfer?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target.result;
      setPhoto({ dataUrl, url: null });
      setShareState("stale");
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
    setShareState("stale");
  };

  return (
    <section className="postcard-studio glass" style={{ padding: '1rem' }}>
      <header className="studio-header">
        <h2>Galactic Postcard Studio</h2>
        <p className="helper-text">
          Design and share cosmic postcards—pick a style, add a message, and optionally attach a photo.
        </p>
      </header>

      <div className="studio-grid">
        <div className="controls-column" style={{ display: 'grid', gap: '1rem' }}>
          <section className="design-section glass" style={{ padding: '1rem' }}>
            <header>
              <h2>{strings.designHeading}</h2>
              <p>{strings.designDescription}</p>
            </header>
            <div className="design-grid" role="list">
              {designs.map((design) => {
                const isActive = design.id === selectedDesign;
                const optionClass = [
                  "design-option",
                  "glass",
                  design.className,
                  isActive ? "is-selected" : null,
                ]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <button
                    key={design.id}
                    type="button"
                    role="listitem"
                    className={optionClass}
                    aria-pressed={isActive ? "true" : "false"}
                    onClick={() => {
                      setSelectedDesign(design.id);
                      setShareState("stale");
                    }}
                    title={design.name}
                  >
                    <span className="design-name">{design.name}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="message-section glass" style={{ padding: '1rem' }}>
            <header>
              <h2>{strings.messageHeading}</h2>
            </header>
            <div className="field">
              <label htmlFor="msg-input">{strings.messageLabel}</label>
              <textarea
                id="msg-input"
                rows={4}
                maxLength={500}
                placeholder={strings.messagePlaceholder}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  setShareState("stale");
                }}
                className="glass"
                style={{ width: '100%', padding: '0.75rem' }}
              />
            </div>
            <div className="field">
              <label htmlFor="sender-input">{strings.senderLabel}</label>
              <input
                id="sender-input"
                type="text"
                maxLength={100}
                placeholder={strings.senderPlaceholder}
                value={sender}
                onChange={(e) => {
                  setSender(e.target.value);
                  setShareState("stale");
                }}
                className="glass"
                style={{ width: '100%', padding: '0.6rem' }}
              />
            </div>
            <div className="field">
              <label htmlFor="recipient-input">Para (recipient)</label>
              <input
                id="recipient-input"
                type="text"
                maxLength={100}
                placeholder="e.g., Friends of the Crew"
                value={recipient}
                onChange={(e) => { setRecipient(e.target.value); setShareState('stale'); }}
                className="glass"
                style={{ width: '100%', padding: '0.6rem' }}
              />
            </div>
          </section>

          <section className="photo-section glass" style={{ padding: '1rem' }}>
            <header>
              <h2>{strings.photoHeading}</h2>
            </header>
            <div
              className="photo-dropzone glass"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handlePhotoDrop}
              style={{ padding: '0.75rem' }}
            >
              <input
                id={photoInputId}
                type="file"
                accept="image/png,image/jpeg"
                onChange={handlePhotoChange}
                hidden
              />
              <label htmlFor={photoInputId} className="photo-label">
                {strings.photoDropHint}
              </label>
              {photo ? (
                <div className="photo-preview">
                  <img
                    src={photo.url || photo.dataUrl}
                    alt=""
                    className="photo-img"
                  />
                  <button type="button" className="btn secondary" onClick={handleRemovePhoto}>
                    {strings.photoRemove}
                  </button>
                </div>
              ) : null}
            </div>
          </section>

          <section className="share-section glass" style={{ padding: '1rem' }}>
            <header>
              <h2>{strings.shareHeading}</h2>
              <p className="helper-text">{strings.shareDescription}</p>
            </header>

            <div className="actions-row" style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn"
                onClick={handleGenerateShareLink}
                disabled={shareState === "loading"}
              >
                {shareState === "loading" ? strings.shareGenerating : strings.shareButton}
              </button>
              {canCopyLink ? (
                <button
                  type="button"
                  className="btn secondary"
                  onClick={handleCopyLink}
                >
                  {copyFeedback === "copied" ? strings.shareCopied : strings.shareCopy}
                </button>
              ) : null}
            </div>
            {shareError ? (
              <p className="helper-text error-text" role="status">
                {shareError}
              </p>
            ) : null}
            {canCopyLink ? (
              <div className="share-output">
                <input
                  ref={shareInputRef}
                  type="text"
                  value={shareUrl}
                  readOnly
                  onFocus={(event) => event.target.select()}
                  onClick={(event) => event.target.select()}
                  aria-describedby="share-hint"
                  className="glass"
                  style={{ width: '100%', padding: '0.6rem' }}
                />
                <p id="share-hint" className="helper-text">
                  {strings.sharePreview}
                </p>
              </div>
            ) : null}
          </section>
        </div>

        <div className="studio-column preview-column">
          <header className="section-header">
            <h2>Preview</h2>
          </header>
          <div
            className={["postcard-preview", "glass", designClassName].join(" ")}
            role="img"
            aria-label={message || sampleMessage}
          >
            <div className="stamp">POST</div>
            <canvas ref={previewCanvasRef} className="postcard-canvas" aria-hidden="true" />
            {photo ? (
              <img src={(photo.url || photo.dataUrl)} alt="" className="postcard-photo" />
            ) : (
              <div className="photo-placeholder" aria-hidden="true">
                <span>★</span>
              </div>
            )}
            <div className="message-block">
              <p className="line para-line">
                <span className="message-label">Para:</span>
                <span className="recipient-text">{recipient || ''}</span>
              </p>

              <p className="line message-body">{message || sampleMessage}</p>

              <p className="line from-line">
                <span className="from-label">De:</span>
                <span className="sender-text">{sender ? String(sender).trim() : ''}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export { DESIGN_CLASS_MAP, SHARE_PARAM, decodePayload, readShareTokenFromLocation };

export default GalacticPostcardStudio;
