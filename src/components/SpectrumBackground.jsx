import { SPECTRUM_BACKGROUND_KEY } from "../lib/backgroundPreferences.js";
import useBackgroundActive from "../hooks/useBackgroundActive.js";
import styles from "./SpectrumBackground.module.css";

export default function SpectrumBackground() {
    const active = useBackgroundActive(SPECTRUM_BACKGROUND_KEY);
    if (!active) return null;

    return (
        <div className={styles.overlay} aria-hidden="true">
            <div className={styles.container} />
        </div>
    );
}
