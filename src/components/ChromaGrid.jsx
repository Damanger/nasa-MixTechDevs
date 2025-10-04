import { useEffect, useRef, useState } from 'react';
import '../assets/css/ChromaGrid.css';

export default function ChromaGrid({
    items = [],
    radius = 300,
    damping = 0.45,
    fadeOut = 0.6,
    ease = 'ease-out'
}) {
    const ref = useRef(null);
    const target = useRef({ x: 0, y: 0 });
    const pos = useRef({ x: 0, y: 0 });
    const raf = useRef(0);
    const [isMobile, setIsMobile] = useState(false);
    const [activeIndex, setActiveIndex] = useState(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const onMove = (e) => {
            const r = el.getBoundingClientRect();
            target.current.x = ((e.clientX - r.left) / r.width) * 100;
            target.current.y = ((e.clientY - r.top) / r.height) * 100;
            el.style.setProperty('--cursor-opacity', '1');
        };

        const onLeave = () => {
            el.style.setProperty('--cursor-opacity', String(fadeOut));
        };

        function tick() {
            raf.current = requestAnimationFrame(tick);
            pos.current.x += (target.current.x - pos.current.x) * damping;
            pos.current.y += (target.current.y - pos.current.y) * damping;
            el.style.setProperty('--mx', `${pos.current.x}%`);
            el.style.setProperty('--my', `${pos.current.y}%`);
            el.style.setProperty('--spot-radius', `${radius}px`);
        }
        raf.current = requestAnimationFrame(tick);

        el.addEventListener('mousemove', onMove);
        el.addEventListener('mouseleave', onLeave);
        return () => {
            cancelAnimationFrame(raf.current);
            el.removeEventListener('mousemove', onMove);
            el.removeEventListener('mouseleave', onLeave);
        };
    }, [radius, damping, fadeOut]);

    useEffect(() => {
        const update = () => {
            const touch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
            setIsMobile(window.innerWidth <= 768 || touch);
        };
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);

    const onCardClick = (e, i) => {
        if (!isMobile) return; // desktop: navegar normal
        if (activeIndex === i) return; // segundo toque: permite navegar
        e.preventDefault();
        setActiveIndex((prev) => (prev === i ? null : i));
    };

    return (
        <div className="chroma-grid" ref={ref} style={{ '--cursor-opacity': fadeOut, transition: `--cursor-opacity 250ms ${ease}` }}>
            {items.map((it, i) => (
                <a
                    className="chroma-card"
                    key={i}
                    href={it.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => onCardClick(e, i)}
                    aria-expanded={isMobile && activeIndex === i ? 'true' : 'false'}
                    data-show-role={isMobile && activeIndex === i ? 'true' : 'false'}
                    style={{ '--border': it.borderColor || '#3B82F6', '--grad': it.gradient || 'linear-gradient(145deg,#3B82F6,#000)' }}
                >
                    <div className="chroma-img-wrapper">
                        {it.image ? (
                            <div className="chroma-img-frame">
                                <img src={it.image} alt={it.title} loading="lazy" />
                            </div>
                        ) : null}
                    </div>
                    <div className="chroma-info">
                        <h3>{it.title}</h3>
                        <p className="role">{it.role || it.subtitle}</p>
                        <span className="handle">{it.handle}</span>
                    </div>
                </a>
            ))}
        </div>
    );
}
