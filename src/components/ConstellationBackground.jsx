import { CONSTELLATION_BACKGROUND_KEY } from "../lib/backgroundPreferences.js";
import useBackgroundActive from "../hooks/useBackgroundActive.js";
import styles from "../assets/css/ConstellationBackground.module.css";

export default function ConstellationBackground() {
    const active = useBackgroundActive(CONSTELLATION_BACKGROUND_KEY);
    if (!active) return null;

    return (
        <div className={styles.overlay} aria-hidden="true">
            <div className={styles.container} />
        </div>
    );
}
