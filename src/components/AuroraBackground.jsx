import { AURORA_BACKGROUND_KEY } from "../lib/backgroundPreferences.js";
import useBackgroundActive from "../hooks/useBackgroundActive.js";
import styles from "./AuroraBackground.module.css";

export default function AuroraBackground() {
    const active = useBackgroundActive(AURORA_BACKGROUND_KEY);
    if (!active) return null;

    return (
        <div className={styles.overlay} aria-hidden="true">
            <div className={styles.container} />
        </div>
    );
}
