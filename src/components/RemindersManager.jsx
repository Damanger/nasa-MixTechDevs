import { useCallback, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { onValue, push, ref, remove, set } from "firebase/database";
import { auth, db } from "../lib/firebaseClient.js";
import { emitToast } from "../lib/toast.js";

const defaultStrings = {
    messageLabel: "Recordatorio",
    messagePlaceholder: "Escribe el texto a recordar…",
    dateLabel: "Recordar hasta",
    dateHint: "Selecciona la fecha límite para este recordatorio.",
    saveButton: "Guardar recordatorio",
    saving: "Guardando…",
    loading: "Cargando recordatorios…",
    empty: "No tienes recordatorios activos.",
    signedOut: "Inicia sesión para gestionar tus recordatorios.",
    delete: "Eliminar",
    deleting: "Eliminando…",
    error: "No se pudo guardar el recordatorio.",
    dateError: "Selecciona una fecha válida.",
    lastUpdated: "Última edición",
    expiresOn: "Expira",
    assistantHint: "Tienes {count} recordatorios activos.",
    assistantHintOne: "Tienes 1 recordatorio activo.",
};

// ASTER image (assistant UI moved to a global component)
const ASTER_IMAGE = "/Aster.webp";

const todayISO = () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${now.getFullYear()}-${month}-${day}`;
};

const initialForm = {
    message: "",
    endDate: todayISO(),
};

function normalizeDate(input) {
    if (!input) return null;
    const timestamp = Date.parse(input);
    if (Number.isNaN(timestamp)) return null;
    return new Date(timestamp);
}

function formatDate(dateValue, locale) {
    if (!dateValue) return "";
    try {
        return new Date(dateValue).toLocaleDateString(locale ?? undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    } catch {
        return String(dateValue);
    }
}

export default function RemindersManager({ strings, lang }) {
    const copy = useMemo(() => ({ ...defaultStrings, ...strings }), [strings]);

    const [user, setUser] = useState(null);
    const [authReady, setAuthReady] = useState(false);
    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState(initialForm);
    const [status, setStatus] = useState("idle");
    const [error, setError] = useState(null);
    const [deleteStatus, setDeleteStatus] = useState({});

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setAuthReady(true);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!user) {
            setReminders([]);
            setLoading(false);
            return undefined;
        }

        const remindersRef = ref(db, `users/${user.uid}/reminders`);
        setLoading(true);
        const unsubscribe = onValue(
            remindersRef,
            (snapshot) => {
                const raw = snapshot.val();
                if (!raw) {
                    setReminders([]);
                    setLoading(false);
                    return;
                }
                const all = Object.entries(raw).map(([id, value]) => ({ id, ...value }));
                all.sort((a, b) => {
                    const aTs = a.endDateTs ?? Date.parse(a.endDate ?? "");
                    const bTs = b.endDateTs ?? Date.parse(b.endDate ?? "");
                    if (Number.isFinite(aTs) && Number.isFinite(bTs) && aTs !== bTs) {
                        return aTs - bTs;
                    }
                    const aUpdated = a.updatedAt ?? a.createdAt ?? 0;
                    const bUpdated = b.updatedAt ?? b.createdAt ?? 0;
                    return bUpdated - aUpdated;
                });
                setReminders(all);
                setLoading(false);
            },
            (err) => {
                console.error("Failed to load reminders", err);
                setReminders([]);
                setLoading(false);
                setError(copy.error);
            }
        );

        return () => unsubscribe();
    }, [user, copy.error]);

    const onFormChange = useCallback((field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setError(null);
    }, []);

    const resetForm = useCallback(() => {
        setForm({ ...initialForm, endDate: todayISO() });
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!user) return;

        const message = form.message.trim();
        const endDateRaw = form.endDate;
        const parsedDate = normalizeDate(endDateRaw);

        if (!message || !parsedDate) {
            setError(!parsedDate ? copy.dateError : copy.error);
            return;
        }

        const endDateIso = endDateRaw;
        const endDateTs = parsedDate.getTime();

        try {
            setStatus("saving");
            setError(null);
            const reminderRef = push(ref(db, `users/${user.uid}/reminders`));
            const timestamp = Date.now();
            const payload = {
                message,
                endDate: endDateIso,
                endDateTs,
                createdAt: timestamp,
                updatedAt: timestamp,
            };
            await set(reminderRef, payload);
            setStatus("success");
            try { emitToast(copy.saveButton ?? 'Recordatorio guardado', 'success'); } catch {}
            resetForm();
        } catch (err) {
            console.error("Failed to save reminder", err);
            setStatus("error");
            setError(copy.error);
        }
    };

    const handleDelete = async (reminderId) => {
        if (!user || !reminderId) return;
        try {
            setDeleteStatus((prev) => ({ ...prev, [reminderId]: "deleting" }));
            await remove(ref(db, `users/${user.uid}/reminders/${reminderId}`));
        } catch (err) {
            console.error("Failed to delete reminder", err);
        } finally {
            setDeleteStatus((prev) => {
                const next = { ...prev };
                delete next[reminderId];
                return next;
            });
        }
    };

    const statusLabel = status === "saving"
        ? copy.saving
        : status === "error"
            ? error ?? copy.error
            : null;

    useEffect(() => {
        if (status !== "success") return undefined;
        const timer = setTimeout(() => setStatus("idle"), 1200);
        return () => clearTimeout(timer);
    }, [status]);

    const assistantMessage = useMemo(() => {
        if (!reminders.length) return null;
        if (reminders.length === 1) return copy.assistantHintOne ?? copy.assistantHint?.replace("{count}", "1");
        return (copy.assistantHint ?? "").replace("{count}", String(reminders.length));
    }, [reminders.length, copy.assistantHint, copy.assistantHintOne]);

    if (!authReady) {
        return (
            <section className="glass card reminders-card">
                <p style={{ margin: 0 }}>{copy.loading}</p>
            </section>
        );
    }

    if (!user) {
        return (
            <section className="glass card reminders-card">
                <p style={{ margin: 0 }}>{copy.signedOut}</p>
            </section>
        );
    }

    return (
        <div className="reminders-wrapper">
            <section className="glass card reminders-card">
                <form className="reminders-form" onSubmit={handleSubmit}>
                    <label className="form-field">
                        <span>{copy.messageLabel}</span>
                        <textarea
                            value={form.message}
                            onChange={(e) => onFormChange("message", e.target.value)}
                            placeholder={copy.messagePlaceholder}
                            rows={4}
                            required
                        />
                    </label>
                    <label className="form-field">
                        <span>{copy.dateLabel}</span>
                        <input
                            type="date"
                            value={form.endDate}
                            onChange={(e) => onFormChange("endDate", e.target.value)}
                            required
                            min={todayISO()}
                        />
                        <small className="field-hint">{copy.dateHint}</small>
                    </label>
                    {statusLabel ? <p className="status-message">{statusLabel}</p> : null}
                    <button type="submit" className="btn" disabled={status === "saving"}>
                        {status === "saving" ? copy.saving : copy.saveButton}
                    </button>
                </form>
            </section>
            <section className="glass card reminders-card">
                {loading ? (
                    <p style={{ margin: 0 }}>{copy.loading}</p>
                ) : reminders.length === 0 ? (
                    <p style={{ margin: 0 }}>{copy.empty}</p>
                ) : (
                    <div className="reminders-list">
                        {reminders.map((reminder) => (
                            <article key={reminder.id} className="reminder-item">
                                <header>
                                    <p className="reminder-message">{reminder.message}</p>
                                    <div className="reminder-meta">
                                        <span>{copy.expiresOn}: {formatDate(reminder.endDate, lang)}</span>
                                        <span>{copy.lastUpdated}: {formatDate(reminder.updatedAt ?? reminder.createdAt, lang)}</span>
                                    </div>
                                </header>
                                <button
                                    type="button"
                                    className="btn btn--danger"
                                    onClick={() => handleDelete(reminder.id)}
                                    disabled={deleteStatus[reminder.id] === "deleting"}
                                >
                                    {deleteStatus[reminder.id] === "deleting" ? copy.deleting : copy.delete}
                                </button>
                            </article>
                        ))}
                    </div>
                )}
            </section>
            {/* Assistant message now rendered globally via ReminderAssistant component in the layout */}
        </div>
    );
}

let styles = null;
if (typeof document !== "undefined") {
    styles = (() => {
        const style = document.createElement("style");
        style.textContent = `
            .reminders-wrapper {
                display: grid;
                gap: 1.25rem;
            }
            @media (min-width: 960px) {
                .reminders-wrapper {
                    grid-template-columns: 1fr 1fr;
                }
            }
            .reminders-card {
                padding: clamp(1.25rem, 4vw, 1.75rem);
            }
            .reminders-form {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }
            .form-field {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
                font-size: 0.95rem;
            }
            .form-field textarea,
            .form-field input[type="date"] {
                border-radius: 0.75rem;
                border: 1px solid rgba(255,255,255,0.16);
                background: rgba(10,16,34,0.35);
                color: inherit;
                padding: 0.7rem 0.85rem;
                font-size: 1rem;
            }
            .form-field textarea {
                resize: vertical;
                min-height: 120px;
                line-height: 1.5;
            }
            .field-hint {
                font-size: 0.8rem;
                color: var(--text-secondary, rgba(255,255,255,0.65));
            }
            .status-message {
                margin: 0;
                font-size: 0.9rem;
                color: var(--text-secondary, rgba(255,255,255,0.75));
            }
            /* use global .btn styles from layout */
            .reminders-list {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }
            .reminder-item {
                border-radius: 1rem;
                border: 1px solid rgba(255,255,255,0.12);
                background: rgba(10,16,34,0.25);
                padding: 1rem;
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
            }
            .reminder-item header {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }
            .reminder-message {
                margin: 0;
                font-size: 1.05rem;
                line-height: 1.6;
                white-space: pre-wrap;
            }
            .reminder-meta {
                font-size: 0.85rem;
                color: var(--text-secondary, rgba(255,255,255,0.65));
                display: flex;
                flex-direction: column;
                gap: 0.2rem;
            }
            /* danger variant for .btn */
            .btn--danger {
                background: linear-gradient(180deg, rgba(168,56,56,0.12), rgba(168,56,56,0.08));
                border-color: rgba(168,56,56,0.28);
                color: #fff;
            }
            /* assistant moved to a global component */
        `;
        document.head.appendChild(style);
        return style;
    })();
}

if (import.meta.hot && styles) {
    import.meta.hot.accept(() => {});
    import.meta.hot.dispose(() => {
        styles?.remove();
    });
}
