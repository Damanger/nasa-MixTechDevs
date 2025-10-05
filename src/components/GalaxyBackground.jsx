import useBackgroundActive from "../hooks/useBackgroundActive.js";
import { GALAXY_BACKGROUND_KEY } from "../lib/backgroundPreferences.js";
import Galaxy from "./Galaxy.jsx";

export default function GalaxyBackground() {
  const active = useBackgroundActive(GALAXY_BACKGROUND_KEY);
  if (!active) return null;

  const style = {
    position: "fixed",
    inset: 0,
    zIndex: -1,
    pointerEvents: "none",
  };

  return (
    <div style={style} aria-hidden="true">
      <Galaxy density={1.1} hueShift={160} twinkleIntensity={0.35} rotationSpeed={0.06} transparent={true} />
    </div>
  );
}

