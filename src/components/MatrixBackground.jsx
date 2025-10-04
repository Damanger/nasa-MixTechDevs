import { useMemo } from "react";
import { MATRIX_BACKGROUND_KEY } from "../lib/backgroundPreferences.js";
import useBackgroundActive from "../hooks/useBackgroundActive.js";
import styles from "./MatrixBackground.module.css";

const PATTERN_COUNT = 5;
const COLUMNS_PER_PATTERN = 40;

export default function MatrixBackground() {
    const active = useBackgroundActive(MATRIX_BACKGROUND_KEY);

    const columns = useMemo(
        () =>
            Array.from({ length: PATTERN_COUNT }, (_, patternIndex) => (
                <div className={styles.pattern} key={`pattern-${patternIndex}`}>
                    {Array.from({ length: COLUMNS_PER_PATTERN }, (_, columnIndex) => (
                        <div className={styles.column} key={`column-${patternIndex}-${columnIndex}`} />
                    ))}
                </div>
            )),
        []
    );

    if (!active) return null;

    return (
        <div className={styles.overlay} aria-hidden="true">
            <div className={styles.container}>{columns}</div>
        </div>
    );
}
