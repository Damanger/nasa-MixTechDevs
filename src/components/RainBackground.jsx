import { RAIN_BACKGROUND_KEY } from "../lib/backgroundPreferences.js";
import useBackgroundActive from "../hooks/useBackgroundActive.js";
import styles from "../assets/css/RainBackground.module.css";

export default function RainBackground() {
    const active = useBackgroundActive(RAIN_BACKGROUND_KEY);
    if (!active) return null;

    return (
        <div className={styles.overlay} aria-hidden="true">
            <div className={styles.layer} />
        </div>
    );
}
