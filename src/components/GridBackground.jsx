import useBackgroundActive from "../hooks/useBackgroundActive.js";
import { GRID_BACKGROUND_KEY } from "../lib/backgroundPreferences.js";
import styles from "./GridBackground.module.css";

export default function GridBackground() {
    const active = useBackgroundActive(GRID_BACKGROUND_KEY);

    if (!active) return null;

    return (
        <div className={styles.overlay} aria-hidden="true">
            <div className={styles.grid} />
        </div>
    );
}
