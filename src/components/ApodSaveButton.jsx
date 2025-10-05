import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { ref, onValue, set } from "firebase/database";
import { auth, db } from "../lib/firebaseClient.js";

export default function ApodSaveButton({ initialDate }) {
  const [user, setUser] = useState(null);
  const [currentDate, setCurrentDate] = useState(initialDate || null);
  const [saving, setSaving] = useState(false);
  const [savedDates, setSavedDates] = useState(() => new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // Mantener fecha sincronizada con el selector y con el script inline (apod:datechange)
  useEffect(() => {
    const readNow = () => {
      try {
        const input = document.getElementById("apod-date");
        const v = input?.value || initialDate || null;
        if (v) setCurrentDate(v);
      } catch {}
    };
    readNow();
    const handler = (e) => {
      const d = e?.detail?.date;
      if (d) setCurrentDate(String(d));
    };
    window.addEventListener("apod:datechange", handler);
    return () => window.removeEventListener("apod:datechange", handler);
  }, [initialDate]);

  // Cargar lista de fechas guardadas del usuario
  useEffect(() => {
    if (!user) { setSavedDates(new Set()); setReady(true); return; }
    const datesRef = ref(db, `users/${user.uid}/apod/savedDates`);
    const unsub = onValue(datesRef, (snap) => {
      const val = snap.val() || {};
      const next = new Set(Object.keys(val));
      setSavedDates(next);
      setReady(true);
    }, () => setReady(true));
    return () => unsub();
  }, [user?.uid]);

  const alreadySaved = useMemo(() => currentDate && savedDates.has(currentDate), [currentDate, savedDates]);

  if (!user) return null;
  const disabled = saving || !ready || !currentDate;

  const handleSave = async () => {
    if (disabled || !currentDate) return;
    try {
      setSaving(true);
      await set(ref(db, `users/${user.uid}/apod/savedDates/${currentDate}`), true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <button type="button" className="btn" onClick={handleSave} disabled={disabled || alreadySaved} title={alreadySaved ? "Ya guardada" : "Guardar imagen en perfil"}>
      {alreadySaved ? "Guardada" : (saving ? "Guardando…" : "Guardar imagen en perfil")}
    </button>
  );
}

