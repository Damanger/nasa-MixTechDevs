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
export const NEON_BACKGROUND_KEY = "neon";
// Removed Iridescence; replaced with Prismatic, Lightning, Plasma
export const PRISMATIC_BACKGROUND_KEY = "prismatic";
export const LIGHTNING_BACKGROUND_KEY = "lightning";
export const PLASMA_BACKGROUND_KEY = "plasma";
export const GALAXY_BACKGROUND_KEY = "galaxy";
export const LIGHTRAYS_BACKGROUND_KEY = "lightrays";
export const BACKGROUND_STORAGE_KEY = "mixtechdevs:bg-preference";

const LEGACY_ALIASES = new Map([["island", GRID_BACKGROUND_KEY]]);

export const OVERLAY_KEYS = new Set([
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
    LIGHTRAYS_BACKGROUND_KEY,
]);

export const ALLOWED_KEYS = new Set([DEFAULT_BACKGROUND_KEY, ...OVERLAY_KEYS]);

export const THEME_COLOR_MAP = {
    [DEFAULT_BACKGROUND_KEY]: "#0b1020",
    [MATRIX_BACKGROUND_KEY]: "#000000",
    [GRID_BACKGROUND_KEY]: "#191a1a",
    [CITY_BACKGROUND_KEY]: "#111111",
    [SPECTRUM_BACKGROUND_KEY]: "#000000",
    [TERRAIN_BACKGROUND_KEY]: "#343a40",
    [SHARDS_BACKGROUND_KEY]: "#161616",
    [AURORA_BACKGROUND_KEY]: "#050314",
    [FUTURISTIC_BACKGROUND_KEY]: "#1f1727",
    [RAIN_BACKGROUND_KEY]: "#000000",
    [NEON_BACKGROUND_KEY]: "#0a0005",
    [GALAXY_BACKGROUND_KEY]: "#000010",
    [PRISMATIC_BACKGROUND_KEY]: "#0a0a12",
    [LIGHTNING_BACKGROUND_KEY]: "#050510",
    [PLASMA_BACKGROUND_KEY]: "#06060d",
    [LIGHTRAYS_BACKGROUND_KEY]: "#0a0a12",
};

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
    // Mantener html y body sincronizados para que el overscroll/safe-area
    // tome el mismo color que el usuario eligió.
    root.dataset.background = normalized;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
        const color = THEME_COLOR_MAP[normalized] ?? THEME_COLOR_MAP[DEFAULT_BACKGROUND_KEY];
        meta.setAttribute("content", color);
    }

    if (normalized === DEFAULT_BACKGROUND_KEY || OVERLAY_KEYS.has(normalized)) {
        root.style.removeProperty(CSS_VARIABLE);
        return;
    }

    root.style.setProperty(CSS_VARIABLE, normalized);
};
