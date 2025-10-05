import useBackgroundActive from "../hooks/useBackgroundActive.js";
import { PLASMA_BACKGROUND_KEY } from "../lib/backgroundPreferences.js";
import Plasma from "./Plasma.jsx";

export default function PlasmaBackground() {
  const active = useBackgroundActive(PLASMA_BACKGROUND_KEY);
  if (!active) return null;
  const style = { position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none" };
  return (
    <div style={style} aria-hidden="true">
      <Plasma color="#89b4ff" speed={1.0} direction="forward" scale={1.1} opacity={0.85} mouseInteractive={false} />
    </div>
  );
}
