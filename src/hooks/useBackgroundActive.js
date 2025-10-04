import { useEffect, useState } from "react";
import { DEFAULT_BACKGROUND_KEY } from "../lib/backgroundPreferences.js";

export default function useBackgroundActive(targetKey) {
    const [active, setActive] = useState(false);

    useEffect(() => {
        if (typeof document === "undefined") return undefined;
        const body = document.body;
        if (!body) return undefined;

        const readKey = () => body.dataset.background ?? DEFAULT_BACKGROUND_KEY;
        const update = () => setActive(readKey() === targetKey);
        update();

        const observer = new MutationObserver(update);
        observer.observe(body, { attributes: true, attributeFilter: ["data-background"] });
        return () => observer.disconnect();
    }, [targetKey]);

    return active;
}
