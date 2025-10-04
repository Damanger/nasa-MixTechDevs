import { useEffect, useState } from "react";

export default function ScrollToTopButton({ threshold = 420 }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    let ticking = false;

    const updateVisibility = () => {
      const shouldShow = window.scrollY > threshold;
      setVisible((prev) => (prev === shouldShow ? prev : shouldShow));
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateVisibility);
        ticking = true;
      }
    };

    updateVisibility();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  const scrollToTop = () => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      aria-label="Volver al inicio"
      className="scroll-to-top"
      onClick={scrollToTop}
    >
      <span className="scroll-to-top__icon" aria-hidden="true">
        <span className="scroll-to-top__planet" />
      </span>
      <span className="sr-only">Volver al inicio</span>
    </button>
  );
}
