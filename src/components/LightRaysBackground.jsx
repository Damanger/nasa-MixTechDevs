import useBackgroundActive from "../hooks/useBackgroundActive.js";
import { LIGHTRAYS_BACKGROUND_KEY } from "../lib/backgroundPreferences.js";
import LightRays from "./LightRays.jsx";

export default function LightRaysBackground() {
  const active = useBackgroundActive(LIGHTRAYS_BACKGROUND_KEY);
  if (!active) return null;

  const style = { position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none" };

  return (
    <div style={style} aria-hidden="true">
      <LightRays
        className="mix-blend-screen"
        raysOrigin="top-center"
        raysColor="#ffffff"
        raysSpeed={0.9}
        lightSpread={1.2}
        rayLength={2.0}
        pulsating={true}
        fadeDistance={1.2}
        saturation={1.0}
        followMouse={false}
        mouseInfluence={0.0}
        noiseAmount={0.06}
        distortion={0.1}
      />
    </div>
  );
}

