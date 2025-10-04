import { SHARDS_BACKGROUND_KEY } from "../lib/backgroundPreferences.js";
import useBackgroundActive from "../hooks/useBackgroundActive.js";
import styles from "./ShardsBackground.module.css";

export default function ShardsBackground() {
    const active = useBackgroundActive(SHARDS_BACKGROUND_KEY);
    if (!active) return null;

    return (
        <div className={styles.overlay} aria-hidden="true">
            <div className={styles.shards} />
        </div>
    );
}
