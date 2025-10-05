import { useEffect, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { onValue, ref } from "firebase/database";
import { auth, db } from "../lib/firebaseClient.js";
import {
    applyBackgroundToDocument,
    cacheBackgroundPreference,
    DEFAULT_BACKGROUND_KEY,
    readCachedBackground,
    sanitizeBackgroundValue
} from "../lib/backgroundPreferences.js";

export default function BackgroundPreferenceListener() {
    const listeners = useRef({ unsubscribeDb: null, lastValue: DEFAULT_BACKGROUND_KEY });

    useEffect(() => {
        if (typeof window === "undefined") return undefined;

        const cached = readCachedBackground();
        if (cached && cached !== listeners.current.lastValue) {
            listeners.current.lastValue = cached;
            applyBackgroundToDocument(cached);
        }

        const cleanupDb = () => {
            listeners.current.unsubscribeDb?.();
            listeners.current.unsubscribeDb = null;
        };

        const handleUser = (user) => {
            if (!user) {
                cleanupDb();
                listeners.current.lastValue = DEFAULT_BACKGROUND_KEY;
                applyBackgroundToDocument(DEFAULT_BACKGROUND_KEY);
                cacheBackgroundPreference(DEFAULT_BACKGROUND_KEY);
                return;
            }

            const backgroundRef = ref(db, `users/${user.uid}/preferences/backgroundColor`);

            cleanupDb();
            listeners.current.unsubscribeDb = onValue(
                backgroundRef,
                (snapshot) => {
                    const rawValue = snapshot.val();
                    const value = sanitizeBackgroundValue(rawValue) ?? DEFAULT_BACKGROUND_KEY;
                    if (value === listeners.current.lastValue) return;
                    listeners.current.lastValue = value;
                    applyBackgroundToDocument(value);
                    cacheBackgroundPreference(value);
                },
                (error) => {
                    console.error("Failed to read background preference", error);
                }
            );
        };

        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            // Si no hay usuario, mantenemos la preferencia en caché
            // (ya fue aplicada arriba si existía). No la sobreescribimos.
            if (!user) {
                cleanupDb();
                return;
            }
            handleUser(user);
        }, (error) => {
            console.error("Auth observer error", error);
        });

        return () => {
            cleanupDb();
            unsubscribeAuth();
        };
    }, []);

    return null;
}
