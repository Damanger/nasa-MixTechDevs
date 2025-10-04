export const CSS_VARIABLE = "--layout-background";
export const DEFAULT_BACKGROUND_KEY = "default";
export const MATRIX_BACKGROUND_KEY = "matrix";
export const GRID_BACKGROUND_KEY = "grid";
export const CITY_BACKGROUND_KEY = "city";
export const SPECTRUM_BACKGROUND_KEY = "spectrum";
export const TERRAIN_BACKGROUND_KEY = "terrain";
export const SHARDS_BACKGROUND_KEY = "shards";
export const AURORA_BACKGROUND_KEY = "aurora";
export const FUTURISTIC_BACKGROUND_KEY = "futuristic";
export const RAIN_BACKGROUND_KEY = "rain";
export const CONSTELLATION_BACKGROUND_KEY = "constellation";
export const NEON_BACKGROUND_KEY = "neon";
export const BACKGROUND_STORAGE_KEY = "mixtechdevs:bg-preference";

const LEGACY_ALIASES = new Map([["island", GRID_BACKGROUND_KEY]]);

const OVERLAY_KEYS = new Set([
    MATRIX_BACKGROUND_KEY,
    GRID_BACKGROUND_KEY,
    CITY_BACKGROUND_KEY,
    SPECTRUM_BACKGROUND_KEY,
    TERRAIN_BACKGROUND_KEY,
    SHARDS_BACKGROUND_KEY,
    AURORA_BACKGROUND_KEY,
    FUTURISTIC_BACKGROUND_KEY,
    RAIN_BACKGROUND_KEY,
    CONSTELLATION_BACKGROUND_KEY,
    NEON_BACKGROUND_KEY,
]);

const ALLOWED_KEYS = new Set([DEFAULT_BACKGROUND_KEY, ...OVERLAY_KEYS]);

export const sanitizeBackgroundValue = (value) => {
    if (typeof value !== "string") return null;
    const normalized = value.trim().toLowerCase();
    if (!normalized) return null;
    const alias = LEGACY_ALIASES.get(normalized);
    if (alias) return alias;
    if (ALLOWED_KEYS.has(normalized)) return normalized;
    return null;
};

const getLocalStorage = () => {
    if (typeof window === "undefined") return null;
    try {
        return window.localStorage ?? null;
    } catch (error) {
        console.warn("Local storage unavailable", error);
        return null;
    }
};

export const readCachedBackground = () => {
    const storage = getLocalStorage();
    if (!storage) return null;
    try {
        const rawValue = storage.getItem(BACKGROUND_STORAGE_KEY);
        return sanitizeBackgroundValue(rawValue);
    } catch (error) {
        console.warn("Failed to read cached background", error);
        return null;
    }
};

export const cacheBackgroundPreference = (value) => {
    const storage = getLocalStorage();
    if (!storage) return;
    try {
        const normalized = sanitizeBackgroundValue(value);
        if (!normalized) {
            storage.removeItem(BACKGROUND_STORAGE_KEY);
            return;
        }
        storage.setItem(BACKGROUND_STORAGE_KEY, normalized);
    } catch (error) {
        console.warn("Failed to cache background preference", error);
    }
};

export const clearCachedBackground = () => {
    const storage = getLocalStorage();
    if (!storage) return;
    try {
        storage.removeItem(BACKGROUND_STORAGE_KEY);
    } catch (error) {
        console.warn("Failed to clear cached background", error);
    }
};

export const applyBackgroundToDocument = (key) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const body = document.body;
    if (!root || !body) return;

    const normalized = sanitizeBackgroundValue(key) ?? DEFAULT_BACKGROUND_KEY;
    body.dataset.background = normalized;

    if (normalized === DEFAULT_BACKGROUND_KEY || OVERLAY_KEYS.has(normalized)) {
        root.style.removeProperty(CSS_VARIABLE);
        return;
    }

    root.style.setProperty(CSS_VARIABLE, normalized);
};
