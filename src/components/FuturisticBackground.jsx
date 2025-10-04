import { useId } from "react";
import { FUTURISTIC_BACKGROUND_KEY } from "../lib/backgroundPreferences.js";
import useBackgroundActive from "../hooks/useBackgroundActive.js";
import styles from "./FuturisticBackground.module.css";

function sanitizeId(raw) {
    return raw.replace(/[^a-zA-Z0-9_-]/g, "");
}

export default function FuturisticBackground() {
    const active = useBackgroundActive(FUTURISTIC_BACKGROUND_KEY);
    const rawId = useId();
    const filterId = `futuristic-${sanitizeId(rawId)}`;

    if (!active) return null;

    return (
        <div className={styles.overlay} aria-hidden="true">
            <div className={styles.layer} style={{ filter: `url(#${filterId})`, WebkitFilter: `url(#${filterId})` }} />
            <svg className={styles.svg} aria-hidden="true">
                <filter id={filterId}>
                    <feTurbulence result="noise" numOctaves="3" baseFrequency="0.7" type="fractalNoise" />
                    <feSpecularLighting
                        result="specular"
                        lightingColor="#fff"
                        specularExponent="20"
                        specularConstant="0.8"
                        surfaceScale="2"
                        in="noise"
                    >
                        <fePointLight x="50" y="50" z="100" />
                    </feSpecularLighting>
                    <feComposite result="litNoise" operator="in" in2="SourceGraphic" in="specular" />
                    <feBlend mode="overlay" in2="litNoise" in="SourceGraphic" />
                </filter>
            </svg>
        </div>
    );
}
