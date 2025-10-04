import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { onValue, ref, set } from "firebase/database";
import { auth, db } from "../lib/firebaseClient.js";
import {
    applyBackgroundToDocument,
    DEFAULT_BACKGROUND_KEY,
    MATRIX_BACKGROUND_KEY,
    sanitizeBackgroundValue
} from "../lib/backgroundPreferences.js";

export default function BackgroundColorSettings({ strings }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [draftChoice, setDraftChoice] = useState(DEFAULT_BACKGROUND_KEY);
    const [storedChoice, setStoredChoice] = useState(DEFAULT_BACKGROUND_KEY);
    const [status, setStatus] = useState("idle");
    const [errorDetail, setErrorDetail] = useState(null);

    const labels = useMemo(
        () => ({
            title: strings?.title ?? "Fondo personalizado",
            description: strings?.description ?? "Elige un fondo alternativo para MixTechDevs.",
            options: {
                default: {
                    label: strings?.options?.default?.label ?? "Gradiente MixTechDevs",
                    description:
                        strings?.options?.default?.description ?? "Usa el fondo espacial predeterminado.",
                },
                matrix: {
                    label: strings?.options?.matrix?.label ?? "Matrix digital",
                    description:
                        strings?.options?.matrix?.description ?? "Códigos verdes descendiendo en la pantalla.",
                },
            },
            loading: strings?.loading ?? "Cargando preferencia…",
            signedOut:
                strings?.signedOut ?? "Inicia sesión con Google para editar tu fondo.",
            statusSaving: strings?.statusSaving ?? "Guardando…",
            statusSaved: strings?.statusSaved ?? "Preferencia guardada",
            statusError: strings?.statusError ?? "No se pudo guardar la preferencia.",
            saveError: strings?.saveError ?? "Intenta de nuevo más tarde.",
        }),
        [strings]
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
            applyBackgroundToDocument(DEFAULT_BACKGROUND_KEY);
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
                        })}
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
          }
          .background-option {
            display: grid;
            grid-template-columns: 80px 1fr;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem;
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
            width: 80px;
            height: 72px;
            border-radius: 10px;
            overflow: hidden;
            position: relative;
          }
          .background-option__preview::after {
            content: "";
            position: absolute;
            inset: 0;
            border-radius: inherit;
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
          @keyframes background-option-matrix {
            from { background-position: 0 0, 0 0; }
            to { background-position: 0 20px, 0 24px; }
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
          @media (max-width: 520px) {
            .background-option {
              grid-template-columns: 1fr;
            }
            .background-option__preview {
              width: 100%;
              height: 120px;
            }
          }
        `}</style>
        </>
    );
}
