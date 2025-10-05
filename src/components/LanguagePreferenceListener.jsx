import { useEffect, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { onValue, ref } from "firebase/database";
import { auth, db } from "../lib/firebaseClient.js";
import { DEFAULT_LANG, getLanguageSafe, LANG_COOKIE, LANG_EVENT } from "../i18n/translations.js";

function setClientLanguage(lang) {
  const safe = getLanguageSafe(lang);
  try { window.localStorage?.setItem(LANG_COOKIE, safe); } catch {}
  try { document.cookie = `${LANG_COOKIE}=${safe}; path=/; max-age=${60 * 60 * 24 * 365}`; } catch {}
  try { window.dispatchEvent(new CustomEvent(LANG_EVENT, { detail: { lang: safe } })); } catch {}
}

export default function LanguagePreferenceListener() {
  const subRef = useRef({ unsubscribe: null, current: DEFAULT_LANG });

  useEffect(() => {
    const cleanup = () => { subRef.current.unsubscribe?.(); subRef.current.unsubscribe = null; };
    const handleUser = (user) => {
      cleanup();
      if (!user) return;
      const langRef = ref(db, `users/${user.uid}/preferences/language`);
      subRef.current.unsubscribe = onValue(langRef, (snap) => {
        const raw = snap.val();
        const safe = getLanguageSafe(typeof raw === 'string' ? raw : DEFAULT_LANG);
        if (safe === subRef.current.current) return;
        subRef.current.current = safe;
        setClientLanguage(safe);
      }, (err) => {
        console.error('Failed to read language preference', err);
      });
    };

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      handleUser(user);
    }, (err) => console.error('Auth observer error (lang listener)', err));

    return () => { cleanup(); unsubAuth(); };
  }, []);

  return null;
}

