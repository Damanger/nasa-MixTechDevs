import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { onValue, push, ref, remove, set } from "firebase/database";
import { auth, db } from "../lib/firebaseClient.js";

const defaultStrings = {
    titleLabel: "Título",
    titlePlaceholder: "Escribe un título",
    contentLabel: "Contenido",
    contentPlaceholder: "Escribe tu nota…",
    fontSizeLabel: "Tamaño de texto",
    fontSizeHint: "Introduce el tamaño en px (ej. 14)",
    fontSizeTitleLabel: "Tamaño título",
    fontSizeContentLabel: "Tamaño contenido",
    underlineLabel: "Subrayado",
    imageLabel: "Imagen (opcional)",
    boldLabel: "Negrita",
    italicLabel: "Cursiva",
    uploadImageButton: "Subir imagen",
    saveButton: "Guardar",
    loading: "Cargando…",
    saving: "Guardando…",
    deleting: "Eliminando…",
    empty: "No hay notas por ahora.",
    signedOut: "Inicia sesión para gestionar tus notas.",
    delete: "Eliminar",
    error: "No se pudo guardar la nota.",
    previewLabel: "Vista previa",
    lastUpdated: "Última actualización",
    missingFields: "Completa el título y el contenido.",
    imageTooLarge: "La imagen excede el límite de 200KB.",
};

const FONT_SIZE_MAP = {
    small: "0.95rem",
    medium: "1.1rem",
    large: "1.35rem",
};

const FONT_SIZE_OPTIONS = Array.from({ length: 23 }, (_, i) => 10 + i); // 10..32

const emptyForm = {
    title: "",
    content: "",
    // fontSize stored as number (px). Keep backward compat with strings.
    fontSize: 16,
    fontSizeTitle: 20,
    fontSizeContent: 16,
    bold: false,
    italic: false,
    underline: false,
    imageData: null,
    imageName: '',
};

function formatTimestamp(timestamp) {
    if (!timestamp) return "";
    try {
        return new Date(timestamp).toLocaleString();
    } catch (error) {
        return String(timestamp);
    }
}

export default function NotesManager({ strings }) {
    const copy = useMemo(() => ({
        ...defaultStrings,
        ...strings,
        fontSizes: {
            ...defaultStrings.fontSizes,
            ...strings?.fontSizes,
        },
    }), [strings]);

    const [user, setUser] = useState(null);
    const [authReady, setAuthReady] = useState(false);
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState(emptyForm);
    const fileInputRef = useRef(null);
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
            setNotes([]);
            setLoading(false);
            return undefined;
        }

        const notesRef = ref(db, `users/${user.uid}/notes`);
        setLoading(true);
        const unsubscribe = onValue(
            notesRef,
            (snapshot) => {
                const raw = snapshot.val();
                if (!raw) {
                    setNotes([]);
                    setLoading(false);
                    return;
                }
                const allNotes = Object.entries(raw).map(([id, value]) => ({ id, ...value }));
                allNotes.sort((a, b) => (b.updatedAt ?? b.createdAt ?? 0) - (a.updatedAt ?? a.createdAt ?? 0));
                setNotes(allNotes);
                setLoading(false);
            },
            (err) => {
                console.error("Failed to load notes", err);
                setNotes([]);
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
        setForm(emptyForm);
        // clear file input if present
        try {
            if (fileInputRef?.current) fileInputRef.current.value = '';
        } catch {}
    }, []);

    const handleFileChange = useCallback((file) => {
        if (!file) {
            setForm((prev) => ({ ...prev, imageData: null, imageName: '' }));
            return;
        }

        // Enforce 200KB limit
        const maxBytes = 200 * 1024;
        if (file.size > maxBytes) {
            setError(copy.imageTooLarge);
            // clear any previously set imageData
            setForm((prev) => ({ ...prev, imageData: null }));
            try { if (fileInputRef?.current) fileInputRef.current.value = ''; } catch {}
            return;
        }

        // Read file as data URL first
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result;
            if (!result) return;

            // Create an image to draw on canvas and resize to 320px width
            const img = new Image();
            img.onload = () => {
                try {
                    const targetWidth = 320;
                    const scale = img.width > 0 ? targetWidth / img.width : 1;
                    const targetHeight = Math.round(img.height * scale);

                    // create canvas (OffscreenCanvas if available)
                    let canvas;
                    let ctx;
                    if (typeof OffscreenCanvas !== 'undefined') {
                        canvas = new OffscreenCanvas(targetWidth, targetHeight);
                        ctx = canvas.getContext('2d');
                    } else {
                        canvas = document.createElement('canvas');
                        canvas.width = targetWidth;
                        canvas.height = targetHeight;
                        ctx = canvas.getContext('2d');
                    }

                    // If image is smaller than target and we prefer not to upscale, use original
                    if (img.width <= targetWidth) {
                        // keep original result
                        setForm((prev) => ({ ...prev, imageData: result, imageName: file.name }));
                        return;
                    }

                    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

                    // prefer JPEG to save size; fallback to PNG if canvas can't export jpeg
                    let dataUrl;
                    try {
                        dataUrl = canvas.convertToBlob ? null : canvas.toDataURL('image/jpeg', 0.85);
                    } catch (err) {
                        // older browsers
                        try {
                            dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                        } catch (err2) {
                            dataUrl = result; // fallback to original
                        }
                    }

                    // convertOffscreen canvas to dataURL if needed
                    if (!dataUrl && typeof canvas.convertToBlob === 'function') {
                        canvas.convertToBlob({ type: 'image/jpeg', quality: 0.85 }).then((blob) => {
                            const r2 = new FileReader();
                            r2.onload = () => {
                                setForm((prev) => ({ ...prev, imageData: r2.result, imageName: file.name }));
                            };
                            r2.readAsDataURL(blob);
                        }).catch(() => setForm((prev) => ({ ...prev, imageData: result })));
                    } else {
                        setForm((prev) => ({ ...prev, imageData: dataUrl, imageName: file.name }));
                    }
                } catch (err) {
                    console.error('Canvas resize failed', err);
                    setForm((prev) => ({ ...prev, imageData: result }));
                }
            };
            img.onerror = (err) => {
                console.error('Image load failed', err);
                    setForm((prev) => ({ ...prev, imageData: result, imageName: file.name }));
            };
            img.src = result;
        };
        reader.onerror = (err) => {
            console.error("Failed reading image file", err);
        };
        reader.readAsDataURL(file);
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!user) return;
        const title = form.title.trim();
        const content = form.content.trim();
        if (!title || !content) {
            setError(copy.missingFields ?? copy.error);
            return;
        }

        try {
            setStatus("saving");
            setError(null);
            const noteRef = push(ref(db, `users/${user.uid}/notes`));
            const timestamp = Date.now();
            const payload = {
                title,
                content,
                formatting: {
                    // persist numeric px value; older notes may have strings
                    fontSize: form.fontSize,
                    fontSizeTitle: form.fontSizeTitle,
                    fontSizeContent: form.fontSizeContent,
                    bold: form.bold,
                    italic: form.italic,
                    underline: form.underline,
                },
                imageData: form.imageData ?? null,
                createdAt: timestamp,
                updatedAt: timestamp,
            };
            await set(noteRef, payload);
            setStatus("success");
            resetForm();
        } catch (err) {
            console.error("Failed to save note", err);
            setStatus("error");
            setError(copy.error);
        }
    };

    const handleDelete = async (noteId) => {
        if (!user || !noteId) return;
        try {
            setDeleteStatus((prev) => ({ ...prev, [noteId]: "deleting" }));
            await remove(ref(db, `users/${user.uid}/notes/${noteId}`));
        } catch (err) {
            console.error("Failed to delete note", err);
        } finally {
            setDeleteStatus((prev) => {
                const next = { ...prev };
                delete next[noteId];
                return next;
            });
        }
    };

    const previewStyles = {
        fontSize: typeof form.fontSizeContent === 'number' ? `${form.fontSizeContent}px` : (FONT_SIZE_MAP[form.fontSizeContent] ?? FONT_SIZE_MAP.medium),
        fontWeight: form.bold ? 700 : 400,
        fontStyle: form.italic ? "italic" : "normal",
        textDecoration: form.underline ? 'underline' : 'none',
        whiteSpace: "pre-wrap",
        lineHeight: 1.6,
    };

    if (!authReady) {
        return (
            <section className="glass card notes-card">
                <p style={{ margin: 0 }}>{copy.loading}</p>
            </section>
        );
    }

    if (!user) {
        return (
            <section className="glass card notes-card">
                <p style={{ margin: 0 }}>{copy.signedOut}</p>
            </section>
        );
    }

    return (
        <div className="notes-grid">
            <section className="glass card notes-card">
                <form className="notes-form" onSubmit={handleSubmit}>
                    <label className="form-field">
                        <span>{copy.titleLabel}</span>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => onFormChange("title", e.target.value)}
                            placeholder={copy.titlePlaceholder}
                            required
                        />
                    </label>
                    <label className="form-field">
                        <span>{copy.contentLabel}</span>
                        <textarea
                            value={form.content}
                            onChange={(e) => onFormChange("content", e.target.value)}
                            placeholder={copy.contentPlaceholder}
                            rows={6}
                            required
                        />
                    </label>
                    <div className="form-row font-size-row">
                        <label className="form-field compact">
                            <span>{copy.fontSizeTitleLabel}</span>
                            <select
                                value={form.fontSizeTitle}
                                onChange={(e) => onFormChange("fontSizeTitle", Number(e.target.value))}
                                aria-label="Tamaño de título en px"
                            >
                                {FONT_SIZE_OPTIONS.map((v) => (
                                    <option key={v} value={v}>{v}px</option>
                                ))}
                            </select>
                        </label>
                        <label className="form-field compact">
                            <span>{copy.fontSizeContentLabel}</span>
                            <select
                                value={form.fontSizeContent}
                                onChange={(e) => onFormChange("fontSizeContent", Number(e.target.value))}
                                aria-label="Tamaño de contenido en px"
                            >
                                {FONT_SIZE_OPTIONS.map((v) => (
                                    <option key={v} value={v}>{v}px</option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <div className="form-row format-row">
                        <label className="toggle">
                            <input
                                type="checkbox"
                                checked={form.bold}
                                onChange={(e) => onFormChange("bold", e.target.checked)}
                            />
                            <span>{copy.boldLabel}</span>
                        </label>
                        <label className="toggle">
                            <input
                                type="checkbox"
                                checked={form.italic}
                                onChange={(e) => onFormChange("italic", e.target.checked)}
                            />
                            <span>{copy.italicLabel}</span>
                        </label>
                        <label className="toggle">
                            <input
                                type="checkbox"
                                checked={form.underline}
                                onChange={(e) => onFormChange("underline", e.target.checked)}
                            />
                            <span>{copy.underlineLabel}</span>
                        </label>
                    </div>

                    <div className="form-row image-row">
                        <label className="form-field file-field" style={{ alignItems: 'center' }}>
                            <span>{copy.imageLabel}</span>
                            <div className="file-input-wrapper">
                                <input
                                    ref={fileInputRef}
                                    id="note-image-input"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                                />
                                <button
                                    type="button"
                                    className="file-btn"
                                    onClick={() => { try { fileInputRef?.current?.click(); } catch {} }}
                                >
                                    {form.imageName ? form.imageName : 'Choose File'}
                                </button>
                                <small className="file-hint">{copy.uploadImageButton}</small>
                            </div>
                        </label>
                    </div>
                    <div className="preview">
                        <span className="preview-label">{copy.previewLabel}</span>
                        <div className="preview-box" style={previewStyles}>
                            {form.content.trim() || copy.contentPlaceholder}
                            {form.imageData ? (
                                <img src={form.imageData} alt="preview" style={{ width: '5rem', height: 'auto', display: 'block', marginTop: '0.75rem', borderRadius: '8px' }} />
                            ) : null}
                        </div>
                    </div>
                    {error ? <p className="error-message">{error}</p> : null}
                    <button type="submit" className="btn" disabled={status === "saving"}>
                        {status === "saving" ? copy.saving : copy.saveButton}
                    </button>
                </form>
            </section>
            <section className="glass card notes-card">
                {loading ? (
                    <p style={{ margin: 0 }}>{copy.loading}</p>
                ) : notes.length === 0 ? (
                    <p style={{ margin: 0 }}>{copy.empty}</p>
                ) : (
                    <div className="notes-list">
                        {notes.map((note) => {
                            const rawTitleFs = note?.formatting?.fontSizeTitle ?? note?.formatting?.fontSize;
                            const rawContentFs = note?.formatting?.fontSizeContent ?? note?.formatting?.fontSize;
                            const titleSize = typeof rawTitleFs === 'number' ? `${rawTitleFs}px` : (FONT_SIZE_MAP[rawTitleFs] ?? '1.2rem');
                            const fontSize = typeof rawContentFs === 'number' ? `${rawContentFs}px` : (FONT_SIZE_MAP[rawContentFs] ?? FONT_SIZE_MAP.medium);
                            const isBold = note?.formatting?.bold;
                            const isItalic = note?.formatting?.italic;
                            const isUnderline = note?.formatting?.underline;
                            return (
                                <article key={note.id} className="note-item">
                                    <header>
                                        <h3 style={{ fontSize: titleSize, margin: 0 }}>{note.title}</h3>
                                        <time dateTime={note.updatedAt ? new Date(note.updatedAt).toISOString() : undefined}>
                                            {copy.lastUpdated}: {formatTimestamp(note.updatedAt ?? note.createdAt)}
                                        </time>
                                    </header>
                                    <p
                                        style={{
                                            fontSize,
                                            fontWeight: isBold ? 700 : 400,
                                            fontStyle: isItalic ? "italic" : "normal",
                                            textDecoration: isUnderline ? 'underline' : 'none',
                                            whiteSpace: "pre-wrap",
                                            lineHeight: 1.6,
                                        }}
                                    >
                                        {note.content}
                                    </p>
                                    {note.imageData ? (
                                        <img src={note.imageData} alt={note.title} style={{ width: '5rem', height: 'auto', borderRadius: '8px' }} />
                                    ) : null}
                                    <button
                                        type="button"
                                        className="btn btn--danger"
                                        onClick={() => handleDelete(note.id)}
                                        disabled={deleteStatus[note.id] === "deleting"}
                                    >
                                        {deleteStatus[note.id] === "deleting" ? copy.deleting : copy.delete}
                                    </button>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}

let styles = null;
if (typeof document !== "undefined") {
    styles = (() => {
        const style = document.createElement("style");
        style.textContent = `
        .notes-grid {
            display: grid;
            gap: 1.25rem;
        }
        @media (min-width: 960px) {
            .notes-grid {
                grid-template-columns: 1fr 1fr;
            }
        }
        .notes-card {
            padding: clamp(1.25rem, 4vw, 1.75rem);
        }
        .notes-form {
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
        .form-field input,
        .form-field textarea,
        .form-field select {
            border-radius: 0.75rem;
            border: 1px solid rgba(255,255,255,0.16);
            background: rgba(10,16,34,0.35);
            color: inherit;
            padding: 0.7rem 0.85rem;
            font-size: 1rem;
        }
        .form-field select {
            min-width: 6.5rem;
            padding: 0.45rem 0.6rem;
        }
        .form-field textarea {
            resize: vertical;
            min-height: 160px;
        }
        .form-row {
            display: flex;
            flex-wrap: wrap;
            gap: 0.75rem;
            align-items: center;
        }
        .font-size-row {
            align-items: center;
        }
        .font-size-row .form-field.compact {
            min-width: 12rem;
            display: flex;
            flex-direction: column;
        }
        .format-row {
            gap: 0.6rem;
            margin-top: 0.25rem;
        }
        .format-row .toggle {
            margin-right: 0.25rem;
        }
        .image-row {
            margin-top: 0.25rem;
        }
        .toggle {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 0.85rem;
            border: 1px solid rgba(255,255,255,0.16);
            border-radius: 999px;
            background: rgba(10,16,34,0.35);
            cursor: pointer;
            user-select: none;
        }
        .toggle input {
            accent-color: #79b8ff;
        }
        /* make toggles more compact and visually pill-like like the screenshot */
        .form-row .toggle {
            padding: 0.45rem 0.75rem;
            font-size: 0.95rem;
        }
        .file-field .file-input-wrapper {
            display: flex;
            align-items: center;
            gap: 0.6rem;
        }
        .file-field input[type="file"] {
            display: none;
        }
        .file-btn {
            --glass-bg: rgba(10,16,34,0.45);
            display: inline-block;
            padding: 0.5rem 0.9rem;
            border-radius: 0.6rem;
            background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
            border: 1px solid rgba(255,255,255,0.12);
            color: inherit;
            cursor: pointer;
            font-size: 0.95rem;
        }
        .file-hint {
            font-size: 0.82rem;
            color: var(--text-secondary, rgba(255,255,255,0.65));
        }
        .preview {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
        .preview-label {
            font-size: 0.95rem;
            color: var(--text-secondary, rgba(255,255,255,0.7));
        }
        .preview-box {
            border-radius: 0.75rem;
            border: 1px solid rgba(255,255,255,0.16);
            background: rgba(10,16,34,0.2);
            padding: 1rem;
            min-height: 120px;
        }
        .preview-box img {
            border-radius: 8px;
        }
        .error-message {
            color: #ff7a90;
            font-size: 0.9rem;
        }
        /* use global .btn styles from layout */
        .notes-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        .note-item {
            border-radius: 1rem;
            border: 1px solid rgba(255,255,255,0.12);
            background: rgba(10,16,34,0.25);
            padding: 1rem;
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }
        .note-item header {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
        }
        .note-item h3 {
            margin: 0;
            font-size: 1.2rem;
        }
        .note-item time {
            font-size: 0.8rem;
            color: var(--text-secondary, rgba(255,255,255,0.65));
        }
        .btn--danger {
            background: linear-gradient(180deg, rgba(168,56,56,0.12), rgba(168,56,56,0.08));
            border-color: rgba(168,56,56,0.28);
            color: #fff;
        }
        /* make submit button full width of card */
        .notes-form > .btn {
            width: 100%;
            margin-top: 0.75rem;
            padding: 0.75rem 1rem;
            border-radius: 0.75rem;
        }
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
