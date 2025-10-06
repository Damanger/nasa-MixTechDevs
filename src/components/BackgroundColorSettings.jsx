import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { onValue, ref, set } from "firebase/database";
import { auth, db } from "../lib/firebaseClient.js";
import { emitToast } from "../lib/toast.js";
import { DEFAULT_LANG, LANG_EVENT, detectClientLanguage, getLanguageSafe, getTranslations } from "../i18n/translations.js";
    import {
        applyBackgroundToDocument,
        cacheBackgroundPreference,
        DEFAULT_BACKGROUND_KEY,
        MATRIX_BACKGROUND_KEY,
        GRID_BACKGROUND_KEY,
        CITY_BACKGROUND_KEY,
        SPECTRUM_BACKGROUND_KEY,
        TERRAIN_BACKGROUND_KEY,
        SHARDS_BACKGROUND_KEY,
        AURORA_BACKGROUND_KEY,
        FUTURISTIC_BACKGROUND_KEY,
        RAIN_BACKGROUND_KEY,
        NEON_BACKGROUND_KEY,
        GALAXY_BACKGROUND_KEY,
        PRISMATIC_BACKGROUND_KEY,
        LIGHTNING_BACKGROUND_KEY,
        PLASMA_BACKGROUND_KEY,
        sanitizeBackgroundValue
    } from "../lib/backgroundPreferences.js";

export default function BackgroundColorSettings({ strings }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [draftChoice, setDraftChoice] = useState(DEFAULT_BACKGROUND_KEY);
    const [storedChoice, setStoredChoice] = useState(DEFAULT_BACKGROUND_KEY);
    const [status, setStatus] = useState("idle");
    const [errorDetail, setErrorDetail] = useState(null);
  const [labelsSource, setLabelsSource] = useState(strings);

  // React to global language changes so this card's labels update immediately
  useEffect(() => {
    const apply = (nextLang) => {
      try {
        const safe = getLanguageSafe(nextLang || detectClientLanguage(DEFAULT_LANG));
        const t = getTranslations(safe);
        setLabelsSource(t.settings?.background || strings);
      } catch {
        setLabelsSource(strings);
      }
    };
    apply();
    const handler = (ev) => apply(ev?.detail?.lang);
    window.addEventListener(LANG_EVENT, handler);
    return () => window.removeEventListener(LANG_EVENT, handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const labels = useMemo(
        () => ({
      title: labelsSource?.title ?? "Fondo personalizado",
      description: labelsSource?.description ?? "Elige un fondo alternativo para MixTechDevs.",
            options: {
                default: {
          label: labelsSource?.options?.default?.label ?? "Gradiente MixTechDevs",
                    description:
            labelsSource?.options?.default?.description ?? "Usa el fondo espacial predeterminado.",
                },
                matrix: {
          label: labelsSource?.options?.matrix?.label ?? "Matrix digital",
                    description:
            labelsSource?.options?.matrix?.description ?? "Códigos verdes descendiendo en la pantalla.",
                },
                grid: {
          label: labelsSource?.options?.grid?.label ?? "Cuadros negros",
                    description:
            labelsSource?.options?.grid?.description ?? "Retícula gris sobre fondo grafito.",
                },
                city: {
          label: labelsSource?.options?.city?.label ?? "Ciudad nocturna",
                    description:
            labelsSource?.options?.city?.description ?? "Paisaje urbano con haz de luz animado.",
                },
                spectrum: {
          label: labelsSource?.options?.spectrum?.label ?? "Spectrum",
                    description:
            labelsSource?.options?.spectrum?.description ?? "Patrón cromático animado retro.",
                },
                terrain: {
          label: labelsSource?.options?.terrain?.label ?? "Terreno fractal",
                    description:
            labelsSource?.options?.terrain?.description ?? "Ruido procedural con iluminación tenue.",
                },
                shards: {
          label: labelsSource?.options?.shards?.label ?? "Fragmentos neón",
                    description:
            labelsSource?.options?.shards?.description ?? "Destellos diagonales animados sobre un entramado oscuro.",
                },
                aurora: {
          label: labelsSource?.options?.aurora?.label ?? "Aurora vectorial",
                    description:
            labelsSource?.options?.aurora?.description ?? "Radiales multicolor con animación suave.",
                },
                futuristic: {
          label: labelsSource?.options?.futuristic?.label ?? "Textura futurista",
                    description:
            labelsSource?.options?.futuristic?.description ?? "Metal iridiscente con relieve especular.",
                },
                rain: {
          label: labelsSource?.options?.rain?.label ?? "Lluvia azul",
                    description:
            labelsSource?.options?.rain?.description ?? "Cortinas de lluvia neón sobre blur futurista.",
                },
                neon: {
          label: labelsSource?.options?.neon?.label ?? "Geometría neón",
                    description:
            labelsSource?.options?.neon?.description ?? "Patrón vectorial vibrante con acentos magenta.",
                },
                galaxy: {
          label: labelsSource?.options?.galaxy?.label ?? "Galaxia",
          description: labelsSource?.options?.galaxy?.description ?? "Campo de estrellas en parallax.",
                },
                prismatic: {
          label: labelsSource?.options?.prismatic?.label ?? "Destello prismático",
          description: labelsSource?.options?.prismatic?.description ?? "Rayos de color con mezcla aditiva.",
                },
                lightning: {
          label: labelsSource?.options?.lightning?.label ?? "Relámpago",
          description: labelsSource?.options?.lightning?.description ?? "Descargas eléctricas estilizadas.",
                },
                plasma: {
          label: labelsSource?.options?.plasma?.label ?? "Plasma",
          description: labelsSource?.options?.plasma?.description ?? "Neblina energética en movimiento.",
                },
            },
      loading: labelsSource?.loading ?? "Cargando preferencia…",
      signedOut:
        labelsSource?.signedOut ?? "Inicia sesión con Google para editar tu fondo.",
      statusSaving: labelsSource?.statusSaving ?? "Guardando…",
      statusSaved: labelsSource?.statusSaved ?? "Preferencia guardada",
      statusError: labelsSource?.statusError ?? "No se pudo guardar la preferencia.",
      saveError: labelsSource?.saveError ?? "Intenta de nuevo más tarde.",
        }),
    [labelsSource]
    );

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            setStoredChoice(DEFAULT_BACKGROUND_KEY);
            setDraftChoice(DEFAULT_BACKGROUND_KEY);
            // No forzar el fondo por defecto: respetar la preferencia en caché
            return undefined;
        }

        setLoading(true);
        const prefRef = ref(db, `users/${user.uid}/preferences/backgroundColor`);

        const unsubscribe = onValue(
            prefRef,
            (snapshot) => {
                const rawValue = snapshot.val();
                const value = sanitizeBackgroundValue(rawValue) ?? DEFAULT_BACKGROUND_KEY;

                setStoredChoice(value);
                setDraftChoice(value);
                applyBackgroundToDocument(value);
                cacheBackgroundPreference(value);
                setLoading(false);
                setStatus("idle");
                setErrorDetail(null);
            },
            (error) => {
                console.error("Failed to load background preference", error);
                setLoading(false);
                setStatus("error");
                setErrorDetail(labels.saveError);
            }
        );

        return () => {
            unsubscribe();
        };
    }, [user, labels.saveError]);

    useEffect(() => {
        if (status !== "saved") return;
        const timeout = setTimeout(() => setStatus("idle"), 2000);
        return () => clearTimeout(timeout);
    }, [status]);

    const persistChoice = async (value) => {
        if (!user) return;
        const prefRef = ref(db, `users/${user.uid}/preferences/backgroundColor`);
        const normalized = sanitizeBackgroundValue(value) ?? DEFAULT_BACKGROUND_KEY;
        if (normalized === storedChoice) return;
        try {
            setStatus("saving");
            setErrorDetail(null);
            await set(prefRef, normalized);
            setStoredChoice(normalized);
            setStatus("saved");
            try { emitToast(labels.statusSaved ?? "Preferencia guardada", 'success'); } catch {}
        } catch (error) {
            console.error("Failed to save background preference", error);
            setStatus("error");
            setErrorDetail(labels.saveError);
        }
    };

    const selectChoice = (choice) => {
        const normalized = sanitizeBackgroundValue(choice) ?? DEFAULT_BACKGROUND_KEY;
        setDraftChoice(normalized);
        applyBackgroundToDocument(normalized);
        cacheBackgroundPreference(normalized);
        persistChoice(normalized);
    };

    const renderStatus = () => {
        if (status === "saving") return labels.statusSaving;
        if (status === "saved") return labels.statusSaved;
        if (status === "error") return errorDetail ?? labels.statusError;
        return null;
    };

    return (
        <>
        <article className="glass settings-card">
            <h2>{labels.title}</h2>
            <p>{labels.description}</p>

            {!user ? (
                <p style={{ marginTop: "auto", color: "var(--muted)" }}>{labels.signedOut}</p>
            ) : loading ? (
                <p style={{ marginTop: "auto", color: "var(--muted)" }}>{labels.loading}</p>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <div className="background-options">
                        {[
                            {
                                id: DEFAULT_BACKGROUND_KEY,
                                label: labels.options.default.label,
                                description: labels.options.default.description,
                            },
                            {
                                id: MATRIX_BACKGROUND_KEY,
                                label: labels.options.matrix.label,
                                description: labels.options.matrix.description,
                            },
                            {
                                id: GRID_BACKGROUND_KEY,
                                label: labels.options.grid.label,
                                description: labels.options.grid.description,
                            },
                            {
                                id: CITY_BACKGROUND_KEY,
                                label: labels.options.city.label,
                                description: labels.options.city.description,
                            },
                            {
                                id: SPECTRUM_BACKGROUND_KEY,
                                label: labels.options.spectrum.label,
                                description: labels.options.spectrum.description,
                            },
                            {
                                id: TERRAIN_BACKGROUND_KEY,
                                label: labels.options.terrain.label,
                                description: labels.options.terrain.description,
                            },
                            {
                                id: SHARDS_BACKGROUND_KEY,
                                label: labels.options.shards.label,
                                description: labels.options.shards.description,
                            },
                            {
                                id: AURORA_BACKGROUND_KEY,
                                label: labels.options.aurora.label,
                                description: labels.options.aurora.description,
                            },
                            {
                                id: FUTURISTIC_BACKGROUND_KEY,
                                label: labels.options.futuristic.label,
                                description: labels.options.futuristic.description,
                            },
                            {
                                id: RAIN_BACKGROUND_KEY,
                                label: labels.options.rain.label,
                                description: labels.options.rain.description,
                            },
                            {
                                id: NEON_BACKGROUND_KEY,
                                label: labels.options.neon.label,
                                description: labels.options.neon.description,
                            },
                        ].map((option) => {
                            const selected = draftChoice === option.id;
                            const isSaving = status === "saving";
                            return (
                                <label
                                    key={option.id}
                                    className="background-option"
                                    data-selected={selected ? "true" : "false"}
                                >
                                    <input
                                        type="radio"
                                        name="background-option"
                                        value={option.id}
                                        checked={selected}
                                        onChange={() => selectChoice(option.id)}
                                        disabled={isSaving}
                                    />
                                    <div className="background-option__preview" data-kind={option.id} />
                                    <div className="background-option__details">
                                        <span className="background-option__label">{option.label}</span>
                                        <span className="background-option__description">{option.description}</span>
                                    </div>
                                </label>
                            );
                        }).concat([
                            {
                                id: GALAXY_BACKGROUND_KEY,
                                label: labels.options.galaxy.label,
                                description: labels.options.galaxy.description,
                            },
                            {
                                id: PRISMATIC_BACKGROUND_KEY,
                                label: labels.options.prismatic.label,
                                description: labels.options.prismatic.description,
                            },
                            {
                                id: LIGHTNING_BACKGROUND_KEY,
                                label: labels.options.lightning.label,
                                description: labels.options.lightning.description,
                            },
                            {
                                id: PLASMA_BACKGROUND_KEY,
                                label: labels.options.plasma.label,
                                description: labels.options.plasma.description,
                            },
                            {
                                id: "lightrays",
                                label: labels.options.lightrays?.label ?? "Light Rays",
                                description: labels.options.lightrays?.description ?? "Soft volumetric beams with additive blend.",
                            }
                        ].map((option) => {
                            const selected = draftChoice === option.id;
                            const isSaving = status === "saving";
                            return (
                                <label key={option.id} className="background-option" data-selected={selected ? "true" : "false"}>
                                    <input type="radio" name="background-option" value={option.id} checked={selected} onChange={() => selectChoice(option.id)} disabled={isSaving} />
                                    <div className="background-option__preview" data-kind={option.id} />
                                    <div className="background-option__details">
                                        <span className="background-option__label">{option.label}</span>
                                        <span className="background-option__description">{option.description}</span>
                                    </div>
                                </label>
                            );
                        }))}
                    </div>
                    {renderStatus() ? (
                        <span style={{ color: "var(--muted)" }}>{renderStatus()}</span>
                    ) : null}
                </div>
            )}
        </article>
        <style>{`
          .background-options {
            display: grid;
            gap: 0.75rem;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          }
          .background-option {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            padding: 1rem;
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.18);
            background: rgba(255, 255, 255, 0.03);
            transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
            cursor: pointer;
            position: relative;
          }
          .background-option input {
            position: absolute;
            opacity: 0;
            pointer-events: none;
          }
          .background-option[data-selected="true"] {
            border-color: rgba(137, 180, 255, 0.65);
            box-shadow: 0 0 15px rgba(137, 180, 255, 0.25);
            background: rgba(137, 180, 255, 0.08);
          }
          .background-option__preview {
            width: 100%;
            aspect-ratio: 16 / 9;
            border-radius: 12px;
            overflow: hidden;
            position: relative;
          }
          .background-option__preview::after {
            content: "";
            position: absolute;
            inset: 0;
            border-radius: inherit;
          }
          .background-option__details {
            display: flex;
            flex-direction: column;
            gap: 0.35rem;
          }
          .background-option__preview[data-kind="${DEFAULT_BACKGROUND_KEY}"]::after {
            background:
              radial-gradient(260px 180px at 20% 25%, rgba(137, 180, 255, 0.45), transparent 70%),
              radial-gradient(220px 160px at 75% 35%, rgba(14, 40, 95, 0.7), transparent 70%),
              linear-gradient(180deg, #0b1020 0%, #111a35 100%);
          }
          .background-option__preview[data-kind="${MATRIX_BACKGROUND_KEY}"]::after {
            background:
              linear-gradient(180deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 30, 0, 0.95) 100%),
              repeating-linear-gradient(
                90deg,
                rgba(0, 255, 65, 0.35) 0px,
                rgba(0, 255, 65, 0.35) 2px,
                transparent 2px,
                transparent 6px
              );
            animation: background-option-matrix 1.8s linear infinite;
          }
          .background-option__preview[data-kind="${GRID_BACKGROUND_KEY}"]::after {
            --preview-color: rgba(114, 114, 114, 0.3);
            background-color: #191a1a;
            background-image:
              linear-gradient(0deg, transparent 24%, var(--preview-color) 25%, var(--preview-color) 26%, transparent 27%, transparent 74%, var(--preview-color) 75%, var(--preview-color) 76%, transparent 77%, transparent),
              linear-gradient(90deg, transparent 24%, var(--preview-color) 25%, var(--preview-color) 26%, transparent 27%, transparent 74%, var(--preview-color) 75%, var(--preview-color) 76%, transparent 77%, transparent);
            background-size: 26px 26px;
          }
          .background-option__preview[data-kind="${CITY_BACKGROUND_KEY}"]::after {
            background:
              linear-gradient(180deg, rgba(17,17,17,0.9) 0%, rgba(10,10,10,0.95) 100%),
              linear-gradient(90deg, rgba(255,96,64,0.35) 0%, rgba(64,96,255,0.25) 100%);
            background-blend-mode: screen;
          }
          .background-option__preview[data-kind="${SPECTRUM_BACKGROUND_KEY}"]::after {
            background:
              conic-gradient(from 0deg, #ff4d4d, #ffd24d, #4dff88, #4dc6ff, #be4dff, #ff4d4d);
            animation: background-option-spectrum 4s linear infinite;
          }
          .background-option__preview[data-kind="${TERRAIN_BACKGROUND_KEY}"]::after {
            background: radial-gradient(circle at 30% 35%, rgba(255,255,255,0.25), transparent 55%), rgba(52, 65, 73, 1);
          }
          .background-option__preview[data-kind="${SHARDS_BACKGROUND_KEY}"]::after {
            background:
              radial-gradient(circle at 100% 50%, #ff00cc 0% 12%, transparent 70%),
              radial-gradient(circle at 0% 50%, #00ffcc 0% 12%, transparent 70%),
              radial-gradient(ellipse at 50% 0%, rgba(51, 0, 255, 0.8) 0% 30%, transparent 60%),
              repeating-linear-gradient(45deg, #1a1a1a, #1a1a1a 6px, #242424 6px, #242424 12px);
            animation: background-option-shards 10s linear infinite;
          }
          .background-option__preview[data-kind="${AURORA_BACKGROUND_KEY}"]::after {
            background:
              radial-gradient(ellipse at 20% 30%, rgba(138, 43, 226, 0.7) 0%, rgba(138, 43, 226, 0) 60%),
              radial-gradient(ellipse at 80% 50%, rgba(0, 191, 255, 0.6) 0%, rgba(0, 191, 255, 0) 70%),
              radial-gradient(ellipse at 50% 80%, rgba(50, 205, 50, 0.5) 0%, rgba(50, 205, 50, 0) 65%),
              linear-gradient(135deg, #000000 0%, #0a0520 100%);
            animation: background-option-aurora 12s ease-in-out infinite;
          }
          .background-option__preview[data-kind="${FUTURISTIC_BACKGROUND_KEY}"]::after {
            background: linear-gradient(145deg, rgba(169, 140, 76, 0.95), rgba(108, 149, 214, 0.95), rgba(124, 43, 117, 0.95));
          }
          .background-option__preview[data-kind="${RAIN_BACKGROUND_KEY}"]::after {
            background:
              radial-gradient(ellipse at 50% 20%, rgba(0, 153, 255, 0.6) 0%, transparent 55%),
              radial-gradient(ellipse at 20% 80%, rgba(0, 204, 255, 0.4) 0%, transparent 60%),
              #02050a;
          }
          
          .background-option__preview[data-kind="${NEON_BACKGROUND_KEY}"]::after {
            background:
              linear-gradient(135deg, #11000d, #2c0015);
          }
          .background-option__preview[data-kind="${GALAXY_BACKGROUND_KEY}"]::after {
            background:
              radial-gradient(circle at 60% 40%, rgba(255,255,255,0.25) 0%, transparent 45%),
              radial-gradient(circle at 20% 80%, rgba(150,200,255,0.18) 0%, transparent 55%),
              linear-gradient(135deg, #000010 0%, #0a0a20 100%);
          }
          .background-option__preview[data-kind="${PRISMATIC_BACKGROUND_KEY}"]::after {
            background:
              conic-gradient(from 0deg, rgba(255,0,200,0.35), rgba(0,200,255,0.35), rgba(255,255,0,0.35), rgba(255,0,200,0.35)),
              linear-gradient(135deg, #0a0a12 0%, #101020 100%);
          }
          .background-option__preview[data-kind="${LIGHTNING_BACKGROUND_KEY}"]::after {
            background:
              linear-gradient(180deg, rgba(140,160,255,0.35), rgba(0,0,0,0.0)),
              linear-gradient(135deg, #050510 0%, #0a0a18 100%);
          }
          .background-option__preview[data-kind="${PLASMA_BACKGROUND_KEY}"]::after {
            background:
              radial-gradient(circle at 30% 30%, rgba(137,180,255,0.25), transparent 55%),
              linear-gradient(135deg, #06060d 0%, #0a0a14 100%);
          }
          
          .background-option__preview[data-kind="lightrays"]::after {
            background:
              linear-gradient(75deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.0) 45%),
              linear-gradient(65deg, rgba(255,255,255,0.14) 10%, rgba(255,255,255,0.0) 55%),
              linear-gradient(135deg, #0a0a12 0%, #101020 100%);
          }
          @keyframes background-option-matrix {
            from { background-position: 0 0, 0 0; }
            to { background-position: 0 20px, 0 24px; }
          }
          @keyframes background-option-spectrum {
            0% { filter: hue-rotate(0deg); }
            50% { filter: hue-rotate(180deg); }
            100% { filter: hue-rotate(360deg); }
          }
          @keyframes background-option-shards {
            0% { background-position: 0 0, 0 0, 10px 10px, 20px 20px; }
            100% { background-position: 40px 40px, -40px -40px, 50px 50px, 60px 60px; }
          }
          @keyframes background-option-aurora {
            0% { background-position: 0% 0%, 0% 0%, 0% 0%; filter: hue-rotate(0deg); }
            50% { background-position: -10% -5%, 5% 10%, 0% 15%; filter: hue-rotate(40deg); }
            100% { background-position: 5% 10%, -10% -5%, 15% 0%; filter: hue-rotate(80deg); }
          }
          .background-option__details {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
          }
          .background-option__label {
            font-weight: 600;
            color: var(--text);
          }
          .background-option__description {
            color: var(--muted);
            font-size: 0.9rem;
          }
          @media (max-width: 720px) {
            .background-option {
              padding: 0.85rem;
            }
            .background-option__preview {
              aspect-ratio: 4 / 3;
            }
          }
          @media (max-width: 520px) {
            .background-option {
              padding: 0.75rem;
            }
            .background-option__preview {
              aspect-ratio: 1 / 1;
            }
          }
        `}</style>
        </>
    );
}
