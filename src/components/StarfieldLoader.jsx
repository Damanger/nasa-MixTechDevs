import React, { useEffect, useRef } from 'react';
import Style from '../css/loading.module.css';

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function StarfieldLoader({ backgroundSrc = '/MixTechDevs.webp', speed = 0.5, blur = 1 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const state = { halfw: 0, halfh: 0, speed: speed, warpZ: 12 };

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = Math.floor(w * ratio);
      canvas.height = Math.floor(h * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      state.halfw = w / 2;
      state.halfh = h / 2;
    };
    resize();

    const getColor = () => `hsla(200, 100%, ${rand(50, 100)}%, 1)`;

    class Star {
      constructor() { this.reset(); }
      reset() {
        this.x0 = rand(-state.halfw, state.halfw);
        this.y0 = rand(-state.halfh, state.halfh);
        this.z = rand(1, state.warpZ);
        this.color = getColor();
      }
      step() {
        this.z -= state.speed;
        if (this.z <= 0) this.reset();
        const x = this.x0 / this.z;
        const y = this.y0 / this.z;
        const x2 = this.x0 / (this.z + state.speed * 0.5);
        const y2 = this.y0 / (this.z + state.speed * 0.5);
        if (x < -state.halfw || x > state.halfw || y < -state.halfh || y > state.halfh) this.reset();
        ctx.strokeStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(x + state.halfw, y + state.halfh);
        ctx.lineTo(x2 + state.halfw, y2 + state.halfh);
        ctx.stroke();
      }
    }

    const stars = Array.from({ length: 250 }, () => new Star());
    let rafId;
    const tick = () => {
      rafId = requestAnimationFrame(tick);
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      for (const s of stars) s.step();
    };
    tick();

    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(rafId); window.removeEventListener('resize', resize); };
  }, [speed]);

  return (
    <section className={Style.spaceShipContainer} aria-hidden>
      <img src={backgroundSrc} alt="" className={Style.backgroundImage} />
      <canvas ref={canvasRef} className={Style.canvas} style={{ filter: `blur(${blur}px)` }} />
    </section>
  );
}
