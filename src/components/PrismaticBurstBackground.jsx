import useBackgroundActive from "../hooks/useBackgroundActive.js";
import { PRISMATIC_BACKGROUND_KEY } from "../lib/backgroundPreferences.js";
import PrismaticBurst from "./PrismaticBurst.jsx";

export default function PrismaticBurstBackground() {
  const active = useBackgroundActive(PRISMATIC_BACKGROUND_KEY);
  if (!active) return null;
  const style = { position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none" };
  return (
    <div style={style} aria-hidden="true">
      <PrismaticBurst intensity={1.6} speed={0.6} animationType="rotate3d" rayCount={8} mixBlendMode="screen" />
    </div>
  );
}

