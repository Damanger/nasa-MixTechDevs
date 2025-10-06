import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { onValue, ref, set } from "firebase/database";
import { auth, db } from "../lib/firebaseClient.js";
import { DEFAULT_LANG, SUPPORTED_LANGUAGES, getLanguageSafe, LANG_COOKIE, LANG_EVENT, detectClientLanguage, getTranslations } from "../i18n/translations.js";
import { emitToast } from "../lib/toast.js";

function setClientLanguage(lang) {
  const safe = getLanguageSafe(lang);
  try {
    window.localStorage?.setItem(LANG_COOKIE, safe);
  } catch {}
  try {
    document.cookie = `${LANG_COOKIE}=${safe}; path=/; max-age=${60 * 60 * 24 * 365}`;
  } catch {}
  try {
    window.dispatchEvent(new CustomEvent(LANG_EVENT, { detail: { lang: safe } }));
  } catch {}
}

export default function LanguagePreferenceSettings({ strings }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [draftChoice, setDraftChoice] = useState(DEFAULT_LANG);
  const [storedChoice, setStoredChoice] = useState(DEFAULT_LANG);
  const [status, setStatus] = useState("idle");
  const [errorDetail, setErrorDetail] = useState(null);
  const [labelsSource, setLabelsSource] = useState(strings);

  const labels = useMemo(() => ({
    title: labelsSource?.title ?? "Idioma predeterminado",
    description: labelsSource?.description ?? "Selecciona el idioma por defecto para MixTechDevs.",
    loading: labelsSource?.loading ?? "Cargando preferencia…",
    signedOut: labelsSource?.signedOut ?? "Inicia sesión con Google para elegir tu idioma.",
    statusSaving: labelsSource?.statusSaving ?? "Guardando…",
    statusSaved: labelsSource?.statusSaved ?? "Preferencia guardada",
    statusError: labelsSource?.statusError ?? "No se pudo guardar la preferencia.",
    saveError: labelsSource?.saveError ?? "Intenta de nuevo más tarde.",
    options: labelsSource?.options ?? { es: "Español", en: "Inglés", de: "Alemán" },
  }), [labelsSource]);

  // React to global language changes so this card's labels update immediately
  useEffect(() => {
    const apply = (nextLang) => {
      try {
        const safe = getLanguageSafe(nextLang || detectClientLanguage(DEFAULT_LANG));
        const t = getTranslations(safe);
        setLabelsSource(t.settings?.language || strings);
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

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setStoredChoice(DEFAULT_LANG);
      setDraftChoice(DEFAULT_LANG);
      return undefined;
    }

    setLoading(true);
    const prefRef = ref(db, `users/${user.uid}/preferences/language`);
    const unsubscribe = onValue(prefRef, (snapshot) => {
      const raw = snapshot.val();
      const val = getLanguageSafe(typeof raw === 'string' ? raw : DEFAULT_LANG);
      setStoredChoice(val);
      setDraftChoice(val);
      setClientLanguage(val);
      setLoading(false);
      setStatus("idle");
      setErrorDetail(null);
    }, (error) => {
      console.error("Failed to load language preference", error);
      setLoading(false);
      setStatus("error");
      setErrorDetail(labels.saveError);
    });

    return () => unsubscribe();
  }, [user, labels.saveError]);

  useEffect(() => {
    if (status !== "saved") return;
    const t = setTimeout(() => setStatus("idle"), 2000);
    return () => clearTimeout(t);
  }, [status]);

  const persistChoice = async (value) => {
    if (!user) return;
    const safe = getLanguageSafe(value);
    if (safe === storedChoice) return;
    try {
      setStatus("saving");
      setErrorDetail(null);
      await set(ref(db, `users/${user.uid}/preferences/language`), safe);
      setStoredChoice(safe);
      setStatus("saved");
      try { emitToast(labels.statusSaved ?? "Preferencia guardada", 'success'); } catch {}
    } catch (error) {
      console.error("Failed to save language preference", error);
      setStatus("error");
      setErrorDetail(labels.saveError);
    }
  };

  const selectChoice = (choice) => {
    const safe = getLanguageSafe(choice);
    setDraftChoice(safe);
    setClientLanguage(safe);
    persistChoice(safe);
  };

  const renderStatus = () => {
    if (status === "saving") return labels.statusSaving;
    if (status === "saved") return labels.statusSaved;
    if (status === "error") return errorDetail ?? labels.statusError;
    return null;
  };

  return (
    <section className="settings-language">
      <h2 className="settings-language__title">{labels.title}</h2>
      <p className="settings-language__desc">{labels.description}</p>

      {!user ? (
        <p className="settings-language__hint">{labels.signedOut}</p>
      ) : loading ? (
        <p className="settings-language__hint">{labels.loading}</p>
      ) : (
        <fieldset className="lang-fieldset">
          <legend className="sr-only">{labels.title}</legend>
          <div className="lang-group">
            {SUPPORTED_LANGUAGES.map((code) => {
              const selected = draftChoice === code;
              const isSaving = status === "saving";
              return (
                <label key={code} className={`lang-option ${selected ? 'selected' : ''}`.trim()}>
                  <input
                    type="radio"
                    name="language-option"
                    value={code}
                    checked={selected}
                    onChange={() => selectChoice(code)}
                    disabled={isSaving}
                  />
                  <span className="lang-name">{labels.options?.[code] ?? code.toUpperCase()}</span>
                  <span className="lang-code">{code.toUpperCase()}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}
      <div className="settings-language__status" aria-live="polite">{renderStatus()}</div>

      <style>{`
        .settings-language { margin-top: 1rem; display:flex; flex-direction:column; justify-content:center; align-items:center; padding: 1rem; border: 1px solid var(--glass-brd); border-radius: 12px; background: var(--glass-bg); box-shadow: 0 4px 30px rgba(0,0,0,0.1); margin-bottom: 2rem; }
        .settings-language__title { margin: 0 0 .25rem; font-size: clamp(1.25rem, 2vw, 1.4rem); }
        .settings-language__desc { margin: 0 0 .75rem; color: var(--muted); }
        .settings-language__hint { color: var(--muted); }

        .lang-fieldset { border: 0; padding: 0; margin: 0; }
        .lang-group { display: flex; flex-wrap: wrap; gap: .5rem; }
        .lang-option { display: inline-flex; align-items: center; gap: .5rem; padding: .4rem .6rem; border: 1px solid var(--glass-brd); border-radius: 999px; background: transparent; cursor: pointer; }
        .lang-option:hover { border-color: rgba(255,255,255,0.35); background: rgba(255,255,255,0.06); }
        .lang-option.selected { border-color: rgba(137, 180, 255, 0.55); box-shadow: 0 0 0 2px rgba(137,180,255,0.18) inset; }
        .lang-option input { appearance: none; width: 10px; height: 10px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.5); display: inline-block; position: relative; }
        .lang-option.selected input { background: rgba(137,180,255,0.9); border-color: rgba(137,180,255,0.9); }
        .lang-name { font-weight: 600; }
        .lang-code { color: var(--muted); font-size: .9rem; }
        .settings-language__status { min-height: 1.25rem; color: var(--muted); margin-top: .5rem; }
        .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
      `}</style>
    </section>
  );
}
