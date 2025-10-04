export const CSS_VARIABLE = "--layout-background";
export const DEFAULT_BACKGROUND_KEY = "default";
export const MATRIX_BACKGROUND_KEY = "matrix";

const ALLOWED_KEYS = new Set([DEFAULT_BACKGROUND_KEY, MATRIX_BACKGROUND_KEY]);

export const sanitizeBackgroundValue = (value) => {
    if (typeof value !== "string") return null;
    const normalized = value.trim().toLowerCase();
    if (!normalized) return null;
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

    if (normalized === DEFAULT_BACKGROUND_KEY || normalized === MATRIX_BACKGROUND_KEY) {
        root.style.removeProperty(CSS_VARIABLE);
        return;
    }

    root.style.setProperty(CSS_VARIABLE, normalized);
};
