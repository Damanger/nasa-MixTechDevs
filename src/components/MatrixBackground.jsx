import { useEffect, useMemo, useState } from "react";
import { MATRIX_BACKGROUND_KEY } from "../lib/backgroundPreferences.js";
import "./MatrixBackground.css";

const PATTERN_COUNT = 5;
const COLUMNS_PER_PATTERN = 40;

export default function MatrixBackground() {
    const [active, setActive] = useState(false);

    useEffect(() => {
        if (typeof document === "undefined") return undefined;
        const body = document.body;
        if (!body) return undefined;

        const update = () => {
            setActive(body.dataset.background === MATRIX_BACKGROUND_KEY);
        };

        update();
        const observer = new MutationObserver(update);
        observer.observe(body, { attributes: true, attributeFilter: ["data-background"] });
        return () => observer.disconnect();
    }, []);

    const columns = useMemo(
        () =>
            Array.from({ length: PATTERN_COUNT }, (_, patternIndex) => (
                <div className="matrix-pattern" key={`pattern-${patternIndex}`}>
                    {Array.from({ length: COLUMNS_PER_PATTERN }, (_, columnIndex) => (
                        <div className="matrix-column" key={`column-${patternIndex}-${columnIndex}`} />
                    ))}
                </div>
            )),
        []
    );

    if (!active) return null;

    return (
        <div className="matrix-overlay" aria-hidden="true">
            <div className="matrix-container">{columns}</div>
        </div>
    );
}
