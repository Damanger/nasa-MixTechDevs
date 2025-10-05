import useBackgroundActive from "../hooks/useBackgroundActive.js";
import { GRID_BACKGROUND_KEY } from "../lib/backgroundPreferences.js";
import Squares from "./Squares.jsx";

export default function SquaresBackground() {
  const active = useBackgroundActive(GRID_BACKGROUND_KEY);
  if (!active) return null;

  const overlayStyle = {
    position: "fixed",
    inset: 0,
    pointerEvents: "none",
    zIndex: -1,
  };

  return (
    <div style={overlayStyle} aria-hidden="true">
      <Squares
        className="grid-squares"
        direction="diagonal"
        speed={0.35}
        squareSize={48}
        borderColor="rgba(255,255,255,0.12)"
        hoverFillColor="rgba(255,255,255,0.06)"
      />
    </div>
  );
}

