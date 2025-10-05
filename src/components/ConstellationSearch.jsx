// src/components/ConstellationSearch.tsx (o donde lo tengas)
import { useEffect, useMemo, useState } from "react";
import { skyviewQuicklookURL } from "../utils/skyview";

export default function ConstellationSearch({ visible = true, onClose } = {}) {
  const [data, setData] = useState([]);
  const [centers, setCenters] = useState({});
  const [selected, setSelected] = useState(null);
  const [details, setDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Cargar datasets estáticos desde /public
  useEffect(() => {
    fetch("/data/constellations.json")
      .then((r) => r.json())
      .then(setData)
      .catch(async () => {
        try {
          const r = await fetch("/constellations.json");
          setData(await r.json());
        } catch {
          setData([]);
        }
      });

    fetch("/data/constellation_centers.json")
      .then((r) => r.json())
      .then(setCenters)
      .catch(async () => {
        try {
          const r = await fetch("/constellation_centers.json");
          setCenters(await r.json());
        } catch {
          setCenters({});
        }
      });
  }, []);

  // Bloqueo de scroll y ESC (robusto para iOS)
  useEffect(() => {
    if (!visible) return;
    const html = document.documentElement;
    const body = document.body;
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const prev = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
    };
    // Evita el scroll y el "bounce" en iOS
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    body.style.overscrollBehavior = "contain";
    html.classList.add("modal-open");
    body.classList.add("modal-open");

    const onKey = (e) => {
      if (e.key === "Escape" || e.key === "Esc") onClose?.();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      html.style.overflow = prev.htmlOverflow;
      body.style.overflow = prev.bodyOverflow;
      body.style.position = prev.position;
      const y = Math.abs(parseInt(body.style.top || "0", 10)) || 0;
      body.style.top = prev.top;
      body.style.width = prev.width;
      body.style.overscrollBehavior = "";
      html.classList.remove("modal-open");
      body.classList.remove("modal-open");
      // restaurar la posición original
      window.scrollTo(0, y);
    };
  }, [visible, onClose]);

  const filtered = useMemo(() => data, [data]);

  // Utilitarios
  const normalize = (u) => {
    if (!u) return null;
    if (u.startsWith("//")) return `https:${u}`;
    if (u.startsWith("/")) return `https://en.wikipedia.org${u}`;
    return u;
  };

  const checkImage = (u) =>
    new Promise((resolve) => {
      if (!u) return resolve(false);
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = u;
    });

  // Carga de ficha + imagen
  const fetchDetailsFor = async (name, item = null) => {
    if (!name) return;
    setDetailsLoading(true);
    setDetails(null);
    try {
      const trySummary = async (title) => {
        const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("no-summary");
        const json = await res.json();
        return json;
      };

      let summary = null;
      const candidateTitles = [];

      const baseName = typeof name === "string" ? name.trim() : name;
      if (item?.wikiTitle) candidateTitles.push(item.wikiTitle);
      if (item?.name && item.name !== baseName) candidateTitles.push(item.name);
      if (baseName) {
        const hasParens = /\(.*\)/.test(baseName);
        const containsConstellation = /constellation/i.test(baseName);
        if (!hasParens && !containsConstellation) {
          candidateTitles.push(`${baseName} (constellation)`);
        }
        candidateTitles.push(baseName);
      }

      const uniqueCandidates = Array.from(new Set(candidateTitles.filter(Boolean)));

      for (const candidate of uniqueCandidates) {
        try {
          const candidateSummary = await trySummary(candidate);
          if (!candidateSummary) continue;

          const candidateIsDisamb = candidateSummary.type === "disambiguation";
          const candidateHasUseful =
            candidateSummary.extract ||
            candidateSummary.thumbnail?.source ||
            candidateSummary.originalimage?.source;

          if (!summary) summary = candidateSummary;
          if (!candidateIsDisamb && candidateHasUseful) {
            summary = candidateSummary;
            break;
          }
        } catch (err) {
          // Ignorar y pasar al siguiente candidato
        }
      }

      const isDisamb = summary && summary.type === "disambiguation";
      const hasUseful =
        summary && (summary.extract || summary.thumbnail?.source || summary.originalimage?.source);

      if (!summary || isDisamb || !hasUseful) {
        const searchTerm = `${name} constellation`;
        const api = `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&list=search&srsearch=${encodeURIComponent(
          searchTerm
        )}&srlimit=1`;
        const r = await fetch(api);
        if (r.ok) {
          const jr = await r.json();
          const first = jr?.query?.search?.[0];
          if (first?.title) {
            try {
              summary = await trySummary(first.title);
            } catch {
              summary = null;
            }
          }
        }
      }

      if (!summary) {
        try {
          const lookupTitle = summary?.title || `${name} (constellation)`;
          const exApi = `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=extracts&exintro=1&explaintext=1&titles=${encodeURIComponent(
            lookupTitle
          )}&redirects=1`;
          const rex = await fetch(exApi);
          if (rex.ok) {
            const jex = await rex.json();
            const pages = jex?.query?.pages || {};
            const firstPage = Object.values(pages)?.[0];
            if (firstPage && (firstPage.extract || firstPage.title)) {
              summary = {
                title: firstPage.title || name,
                extract: firstPage.extract || null,
                description: null,
              };
            }
          }
        } catch {}
      }

      let image = null;
      let source = null;

      // 0) Intentar imagen provista por Wikipedia
      try {
        const wikiCandidate = normalize(
          summary?.originalimage?.source || summary?.thumbnail?.source || null
        );
        if (wikiCandidate && (await checkImage(wikiCandidate))) {
          image = wikiCandidate;
          source = "wikipedia";
        }
      } catch {}

      // 1) Intentar imagen local del dataset
      if (!image) {
        try {
          const local =
            item?.image || item?.imageUrl || item?.thumbnail || item?.thumb || null;
          if (local) {
            const localUrl = normalize(local);
            if (await checkImage(localUrl)) {
              image = localUrl;
              source = "local";
            }
          }
        } catch {}
      }

      // 2) Intentar SkyView (vía nuestro endpoint local, sin CORS)
      if (!image) {
        const center = centers?.[name];
        if (center && center.ra != null && center.dec != null) {
          const sv = skyviewQuicklookURL({
            ra: center.ra,
            dec: center.dec,
            fovDeg: 8,
            pixels: 1200,
          });
          if (await checkImage(sv)) {
            image = sv;
            source = "skyview";
          }
        }
      }

      // 3) Intentar Wikimedia Commons (como fallback)
      if (!image) {
        try {
          const commonsApi = `https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrsearch=${encodeURIComponent(
            name
          )}&gsrlimit=3&prop=imageinfo&iiprop=url`;
          const rc = await fetch(commonsApi);
          if (rc.ok) {
            const jc = await rc.json();
            const pages = jc?.query?.pages || {};
            const candidates = Object.values(pages || {});
            for (const p of candidates) {
              const cand = p?.imageinfo?.[0]?.url || null;
              if (cand && (await checkImage(cand))) {
                image = cand;
                source = "commons";
                break;
              }
            }
          }
        } catch {}
      }

      // Extracto (si REST no lo dio)
      let extract = summary?.extract ?? null;
      if (!extract) {
        try {
          const rawTitle = summary?.title || summary?.displaytitle || name;
          const title =
            rawTitle && (/constellation/i.test(rawTitle) || /\(.*\)/.test(rawTitle))
              ? rawTitle
              : `${rawTitle} (constellation)`;
          const exApi = `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=extracts&exintro=1&explaintext=1&titles=${encodeURIComponent(
            title
          )}`;
          const rex = await fetch(exApi);
          if (rex.ok) {
            const jex = await rex.json();
            const pages = jex?.query?.pages || {};
            const firstPage = Object.values(pages)?.[0];
            if (firstPage?.extract) extract = firstPage.extract;
          }
        } catch {}
      }

      let googleSearch = null;
      if (!image) {
        const query = encodeURIComponent(`${name} constellation`);
        googleSearch = `https://www.google.com/search?tbm=isch&q=${query}`;
      }

      setDetails({
        extract: extract ?? null,
        description: summary?.description ?? null,
        image,
        source,
        googleSearch,
      });
    } catch (err) {
      setDetails({ error: String(err?.message ?? err) });
    } finally {
      setDetailsLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div
      style={overlayStyle}
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div style={modalStyle} className="glass" onMouseDown={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
          <h3 style={{ margin: 0 }}>Buscar constelación</h3>
        </div>

        <div style={{ marginTop: 12 }}>
          <ul style={{ marginTop: 0, overflowX: "auto", gap: 2, display: "flex", flexDirection: "row", width: '100%', padding: 2, listStyle: "none", justifyContent: "center", alignItems: "center" }}>
            {filtered.length === 0 ? (
              <li style={{ color: "var(--muted)" }}>Sin constelaciones.</li>
            ) : (
              filtered.map((item) => (
                <li
                  key={item.abbr}
                  onClick={() => {
                    setSelected(item);
                    fetchDetailsFor(item.name, item);
                  }}
                  style={{
                    cursor: "pointer",
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.08)",
                    padding: 12,
                    minWidth: 220,
                    marginRight: 8,
                    background:
                      selected && selected.abbr === item.abbr
                        ? "linear-gradient(180deg, rgba(137,180,255,0.06), rgba(51,75,133,0.03))"
                        : "rgba(10,16,34,0.2)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <h4 style={{ margin: 0 }}>{item.name}</h4>
                    <span style={{ fontFamily: "monospace", fontSize: "0.82rem" }}>IAU: {item.abbr}</span>
                  </div>
                </li>
              ))
            )}
          </ul>

          <div style={{ marginTop: 12, width: "100%", maxHeight: "64vh", overflow: "auto" }}>
            {selected ? (
              <div style={{ borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", padding: 16, background: "rgba(10,16,34,0.16)" }}>
                <h4 style={{ marginTop: 0 }}>
                  {selected.name} <small style={{ fontFamily: "monospace", opacity: 0.85 }}>({selected.abbr})</small>
                </h4>

                {detailsLoading ? (
                  <p>Cargando información…</p>
                ) : details ? (
                  details.error ? (
                    <p style={{ color: "#ff7a90" }}>{details.error}</p>
                  ) : (
                    <>
                      {details.extract ? <p style={{ marginTop: 6 }}>{details.extract}</p> : null}
                      {details.description ? (
                        <p style={{ color: "var(--muted)", marginTop: 6 }}>{details.description}</p>
                      ) : null}
                    </>
                  )
                ) : (
                  <p style={{ color: "var(--muted)" }}>Selecciona una constelación para ver la ficha e imagen.</p>
                )}

                <div style={{ marginTop: 12, display: "flex", justifyContent: "center" }}>
                  {details?.image ? (
                    <div style={{ background: "#fff", padding: 16, borderRadius: 12, boxShadow: "0 6px 20px rgba(0,0,0,0.15)" }}>
                      <div style={{ maxWidth: "min(840px, 86vw)", width: "100%" }}>
                        <img
                          src={details.image}
                          alt={`${selected.name} image`}
                          loading="lazy"
                          style={{ width: "100%", height: "auto", maxHeight: "60vh", borderRadius: 10, objectFit: "contain", display: "block" }}
                        />
                        {details.source ? (
                          <div style={{ marginTop: 8, fontSize: "0.85rem", color: "var(--muted)", textAlign: "right" }}>
                            {details.source === "wikipedia"
                              ? "Fuente: Wikipedia"
                              : details.source === "skyview"
                              ? "Fuente: SkyView (NASA)"
                              : details.source === "commons"
                              ? "Fuente: Wikimedia Commons"
                              : details.source === "local"
                              ? "Fuente: Local"
                              : null}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        width: "min(840px, 86vw)",
                        height: 360,
                        borderRadius: 8,
                        background: "rgba(255,255,255,0.02)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--muted)",
                      }}
                    >
                      No image
                    </div>
                  )}
                </div>

                {details && !details.image && details.googleSearch ? (
                  <div style={{ marginTop: 10, textAlign: "center" }}>
                    <a href={details.googleSearch} target="_blank" rel="noopener noreferrer" className="btn" style={{ display: "inline-block" }}>
                      Buscar imagen en Google Imágenes
                    </a>
                  </div>
                ) : null}
              </div>
            ) : (
              <div style={{ color: "var(--muted)", padding: 8 }}>Selecciona una constelación para ver detalles.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 2000,
  // Cubrir completamente zonas seguras en iOS y dar oscurecimiento uniforme
  background: "rgba(3, 6, 12, 0.62)",
  WebkitTapHighlightColor: "transparent",
  touchAction: "none",
};

const modalStyle = {
  width: "min(780px, 92vw)",
  maxHeight: "86vh",
  overflow: "auto",
  padding: "1rem",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.12)",
};
