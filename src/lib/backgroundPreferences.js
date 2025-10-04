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
