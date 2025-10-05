import { useEffect, useMemo, useState } from "react";
import "../assets/css/GalacticPostcardStudio.css";
import {
  DESIGN_CLASS_MAP,
  SHARE_PARAM,
  decodePayload,
  readShareTokenFromLocation
} from "./GalacticPostcardStudio.jsx";

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
  const photo = typeof payload?.p === "string" ? payload.p : null;
  return { design, message, sender, photo };
}

export default function GalacticPostcardViewer({ strings, postcardStrings }) {
  const [status, setStatus] = useState("loading");
  const [data, setData] = useState(null);

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
              const endpoint = `${databaseURL.replace(/\/+$/, "")}/postalesTemp/${key}.json`;
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
      };
    }
    return undefined;
  }, [sampleMessage, sampleSender]);

  const designClassName = useMemo(() => {
    if (status !== "ready" || !data) return "design-generic";
    return DESIGN_CLASS_MAP[data.design] ? DESIGN_CLASS_MAP[data.design] : "design-generic";
  }, [status, data]);

  if (status === "loading") {
    return (
      <section className="viewer-card" aria-live="polite">
        <p className="helper-text viewer-status">{strings?.loading ?? "Loading postcard…"}</p>
      </section>
    );
  }

  if (status !== "ready" || !data) {
    return (
      <section className="viewer-card" aria-live="polite">
        <p className="helper-text viewer-status">
          {strings?.missing ?? "We couldn't load the shared postcard."}
        </p>
      </section>
    );
  }

  return (
    <section className="viewer-card" aria-live="polite">
      <div className={["postcard-preview", designClassName].join(" ")}
        role="img"
        aria-label={data.message}
      >
        {data.photo ? (
          <img src={data.photo} alt="" className="postcard-photo" />
        ) : (
          <div className="photo-placeholder" aria-hidden="true">
            <span>★</span>
          </div>
        )}
        <div className="message-block">
          <p className="message-text">{data.message}</p>
          {data.sender ? (
            <span className="sender-text">{data.sender}</span>
          ) : null}
        </div>
      </div>
    </section>
  );
}
