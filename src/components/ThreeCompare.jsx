import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";

function RotSphere({ color = "#6ba3ff", radius = 1, label = "Earth", spin = true }) {
    const ref = useRef();
    useFrame((_, dt) => {
        if (!ref.current || !spin) return;
        ref.current.rotation.y += dt * 0.25;
    });
    return (
        <group>
            <mesh ref={ref}>
                <sphereGeometry args={[radius, Math.max(16, Math.min(48, Math.round(radius * 16))), Math.max(16, Math.min(48, Math.round(radius * 16)))]} />
                <meshStandardMaterial color={color} roughness={0.8} metalness={0.05} />
            </mesh>
            <Html position={[0, radius + 0.4, 0]} center>
                <div
                    style={{
                        padding: ".25rem .6rem",
                        borderRadius: "999px",
                        fontWeight: 700,
                        background: "rgba(255,255,255,.08)",
                        border: "1px solid rgba(255,255,255,.2)",
                        backdropFilter: "blur(8px)",
                        WebkitBackdropFilter: "blur(8px)",
                    }}
                >
                    {label}
                </div>
            </Html>
        </group>
    );
}

// bodies: [{ label, radius, color }]
export default function ThreeCompare({ bodies = [], autoRotate = true }) {
    const [reduced, setReduced] = useState(false);
    useEffect(() => {
        const mq = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => setReduced(!!(mq && mq.matches));
        update();
        if (mq && mq.addEventListener) {
            mq.addEventListener('change', update);
            return () => mq.removeEventListener('change', update);
        }
        return undefined;
    }, []);
    const maxRadius = Math.max(1, ...bodies.map((b) => b.radius || 1));
    const gap = Math.max(0.6, maxRadius * 0.25);
    const sumR = bodies.reduce((s, b) => s + (b.radius || 1), 0);
    const totalWidth = 2 * sumR + gap * Math.max(bodies.length - 1, 0);
    const cameraZ = Math.max(10, totalWidth * 1.25);
    const cameraY = Math.max(3.5, maxRadius * 0.75 + 1.5);

    // Centered x positions from left to right
    const positions = [];
    let x = -totalWidth / 2 + (bodies[0]?.radius || 1);
    for (let i = 0; i < bodies.length; i++) {
        positions.push([x, 0, 0]);
        const r = bodies[i]?.radius || 1;
        const nextR = bodies[i + 1]?.radius || 0;
        x += r + nextR + gap;
    }

    const spin = autoRotate && !reduced;
    const frameLoop = spin ? undefined : 'demand';

    return (
        <Canvas
            camera={{ position: [0, cameraY, cameraZ], fov: 45 }}
            frameloop={frameLoop}
            dpr={[1, 1.5]}
            gl={{ antialias: false, powerPreference: 'low-power', alpha: true, stencil: false, depth: true }}
        >
            <ambientLight intensity={0.35} />
            <directionalLight position={[5, 8, 5]} intensity={0.8} />
            <group position={[0, 0, 0]}>
                {bodies.map((b, i) => (
                    <group key={i} position={positions[i]}>
                        <RotSphere color={b.color} radius={b.radius} label={b.label} spin={spin} />
                    </group>
                ))}
            </group>
            {!reduced && (
                <OrbitControls
                    enablePan={false}
                    enableDamping={false}
                    autoRotate={spin}
                    autoRotateSpeed={0.25}
                />
            )}
        </Canvas>
    );
}
