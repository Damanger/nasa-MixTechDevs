import { useId } from "react";
import { TERRAIN_BACKGROUND_KEY } from "../lib/backgroundPreferences.js";
import useBackgroundActive from "../hooks/useBackgroundActive.js";
import styles from "../assets/css/TerrainBackground.module.css";

function sanitizeId(raw) {
    return raw.replace(/[^a-zA-Z0-9_-]/g, "");
}

export default function TerrainBackground() {
    const active = useBackgroundActive(TERRAIN_BACKGROUND_KEY);
    const rawId = useId();
    const filterId = `terrainFilter-${sanitizeId(rawId)}`;

    if (!active) return null;

    return (
        <div className={styles.overlay} aria-hidden="true">
            <div
                className={styles.surface}
                style={{ filter: `url(#${filterId})`, WebkitFilter: `url(#${filterId})` }}
            />
            <svg className={styles.svg} height="0" width="0" aria-hidden="true">
                <filter id={filterId}>
                    <feTurbulence type="fractalNoise" baseFrequency="0.002" numOctaves="8" seed="4" result="o1" />
                    <feTurbulence type="fractalNoise" baseFrequency="0.004" numOctaves="8" seed="4" result="o2" />
                    <feTurbulence type="fractalNoise" baseFrequency="0.0005" numOctaves="8" seed="4" result="o3" />
                    <feTurbulence type="fractalNoise" baseFrequency="0.009" numOctaves="8" seed="4" result="o4" />
                    <feMerge result="finalIsland">
                        <feMergeNode in="o1" />
                        <feMergeNode in="o3" />
                        <feMergeNode in="o1" />
                        <feMergeNode in="o3" />
                    </feMerge>
                    <feGaussianBlur in="finalIsland" stdDeviation="5" result="noiseo" />
                    <feTurbulence type="fractalNoise" baseFrequency="0.004" numOctaves="8" seed="4" result="o1" />
                    <feTurbulence type="fractalNoise" baseFrequency="0.008" numOctaves="8" seed="4" result="o2" />
                    <feMerge result="noiseo">
                        <feMergeNode in="o2" />
                        <feMergeNode in="o4" />
                        <feMergeNode in="noiseo" />
                    </feMerge>
                    <feGaussianBlur in="noiseo" stdDeviation="5" result="noiseo" />
                    <feTurbulence type="fractalNoise" baseFrequency="0.008" numOctaves="8" seed="4" result="o1" />
                    <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="8" seed="4" result="o2" />
                    <feMerge result="noiseo">
                        <feMergeNode in="o1" />
                        <feMergeNode in="o1" />
                        <feMergeNode in="noiseo" />
                    </feMerge>
                    <feGaussianBlur in="noiseo" stdDeviation="5" result="noiseo" />
                    <feDiffuseLighting in="noiseo" surfaceScale="12" diffuseConstant="1" lightingColor="#11111" result="lit">
                        <feDistantLight azimuth="0" elevation="1" />
                    </feDiffuseLighting>
                    <feBlend in="lit" in2="SourceGraphic" mode="normal" />
                </filter>
            </svg>
        </div>
    );
}
