import useBackgroundActive from "../hooks/useBackgroundActive.js";
import { DARKVEIL_BACKGROUND_KEY } from "../lib/backgroundPreferences.js";
import DarkVeil from "./DarkVeil.jsx";

export default function DarkVeilBackground() {
  const active = useBackgroundActive(DARKVEIL_BACKGROUND_KEY);
  if (!active) return null;

  const style = { position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none" };

  // DarkVeil renders a canvas that fills its container via CSS; wrapper ensures full-viewport placement
  return (
    <div style={style} aria-hidden="true">
      <DarkVeil hueShift={210} noiseIntensity={0.15} scanlineIntensity={0.12} scanlineFrequency={1.4} warpAmount={0.08} speed={0.9} resolutionScale={1.0} />
    </div>
  );
}

