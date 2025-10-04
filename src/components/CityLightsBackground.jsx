import { CITY_BACKGROUND_KEY } from "../lib/backgroundPreferences.js";
import useBackgroundActive from "../hooks/useBackgroundActive.js";
import styles from "./CityLightsBackground.module.css";

export default function CityLightsBackground() {
    const active = useBackgroundActive(CITY_BACKGROUND_KEY);
    if (!active) return null;

    return (
        <div className={styles.overlay} aria-hidden="true">
            <div className={styles.container} />
        </div>
    );
}
