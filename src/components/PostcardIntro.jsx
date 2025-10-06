import { useEffect, useRef, useState } from 'react';
import '../assets/css/PostcardIntro.css';

export default function PostcardIntro({ duration = 5000, onEnd }) {
  const alienRef = useRef(null);
  const [showPostcard, setShowPostcard] = useState(false);

  useEffect(() => {
    // habilita animaciones solo durante la intro
    try { document.documentElement.setAttribute('data-allow-animations', 'true'); } catch {}
    const t = setTimeout(() => {
      try { document.documentElement.removeAttribute('data-allow-animations'); } catch {}
      try { onEnd && onEnd(); } catch {}
    }, duration);

    return () => {
      clearTimeout(t);
      try { document.documentElement.removeAttribute('data-allow-animations'); } catch {}
    };
  }, [duration, onEnd]);

  useEffect(() => {
    const el = alienRef.current;
    if (!el) return;

    // cuando la animación del OVNI termine, mostramos el postal
    const onAnimationEnd = (e) => {
      // Solo reaccionamos al final de la animación del OVNI (no de sub-elementos)
      if (e.target === el) {
        // pequeño retardo para que el efecto se sienta natural
        setTimeout(() => setShowPostcard(true), 1);
      }
    };

    el.addEventListener('animationend', onAnimationEnd);
    return () => el.removeEventListener('animationend', onAnimationEnd);
  }, []);

  return (
    <div className="postcard-intro" aria-hidden="true">
      <div className="ciel">
        {/* Estrellas decorativas (opcionales) */}
        <div className="etoiles">
          <div></div><div></div><div></div><div></div><div></div>
        </div>

        {/* OVNI */}
        <div className="alien" ref={alienRef}>
          <div className="ombre" />
          <div className="rayon"><div className="rayonBas" /></div>
          <div className="basVaisseau" />
          <div className="corpVaisseau">
            <div className="rond3"><div></div><div></div><div></div></div>
          </div>
          <div className="habitacle"><div /></div>
          <div className="habitacleBas" />
          <div className="refletHabitacle"><div></div><div></div></div>
        </div>

        <div className={`postcard ${showPostcard ? 'show' : ''}`}>
          <div className="postcard-card">
            <div className="postcard-header">Saludos desde el espacio</div>
            <div className="postcard-body">¡Te llegó una postal!</div>
          </div>
        </div>
      </div>
    </div>
  );
}
