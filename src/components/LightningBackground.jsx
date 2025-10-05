import useBackgroundActive from "../hooks/useBackgroundActive.js";
import { LIGHTNING_BACKGROUND_KEY } from "../lib/backgroundPreferences.js";
import Lightning from "./Lightning.jsx";

export default function LightningBackground() {
  const active = useBackgroundActive(LIGHTNING_BACKGROUND_KEY);
  if (!active) return null;
  const style = { position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none" };
  return (
    <div style={style} aria-hidden="true">
      <Lightning hue={220} speed={0.9} intensity={0.9} size={1.1} />
    </div>
  );
}

