import { NEON_BACKGROUND_KEY } from "../lib/backgroundPreferences.js";
import useBackgroundActive from "../hooks/useBackgroundActive.js";
import styles from "./NeonBackground.module.css";

export default function NeonBackground() {
    const active = useBackgroundActive(NEON_BACKGROUND_KEY);
    if (!active) return null;

    return (
        <div className={styles.overlay} aria-hidden="true">
            <div className={styles.container} />
        </div>
    );
}
