import { AURORA_BACKGROUND_KEY } from "../lib/backgroundPreferences.js";
import useBackgroundActive from "../hooks/useBackgroundActive.js";
import Aurora from "./Aurora.jsx";
import styles from "../assets/css/AuroraBackground.module.css";

export default function AuroraBackground() {
  const active = useBackgroundActive(AURORA_BACKGROUND_KEY);
  if (!active) return null;

  // Render WebGL aurora shader as a fixed, full-viewport overlay
  return (
    <div className={styles.overlay} aria-hidden="true">
      <Aurora amplitude={1.15} blend={0.7} colorStops={["#5227FF", "#7CFF67", "#5227FF"]} speed={1.0} />
    </div>
  );
}
