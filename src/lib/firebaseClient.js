// Firebase client initialization for the browser
// Uses Astro public env vars (PUBLIC_*) so they're safe to expose on the client
import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
    authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.PUBLIC_FIREBASE_APP_ID,
    measurementId: import.meta.env.PUBLIC_FIREBASE_MEASUREMENT_ID,
    databaseURL: import.meta.env.PUBLIC_FIREBASE_DATABASE_URL,
};

// Ensure we only initialize once in the client runtime
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// Auth + Google provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Realtime Database handle for client usage
export const db = getDatabase(app);

// Analytics is only supported in the browser and when measurementId exists
export const analyticsPromise = (async () => {
    try {
        if (typeof window === "undefined") return null;
        if (!firebaseConfig.measurementId) return null;
        const supported = await isSupported();
        return supported ? getAnalytics(app) : null;
    } catch {
        return null;
    }
})();

export default app;
