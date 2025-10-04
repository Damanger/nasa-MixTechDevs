import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { useRef } from "react";

function RotSphere({ color = "#6ba3ff", radius = 1, label = "Earth" }) {
    const ref = useRef();
    useFrame((_, dt) => {
        if (!ref.current) return;
        ref.current.rotation.y += dt * 0.25;
    });
    return (
        <group>
            <mesh ref={ref} castShadow receiveShadow>
                <sphereGeometry args={[radius, 64, 64]} />
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

    return (
        <Canvas shadows camera={{ position: [0, cameraY, cameraZ], fov: 45 }}>
            <ambientLight intensity={0.35} />
            <directionalLight position={[5, 8, 5]} intensity={1.1} castShadow />
            <group position={[0, 0, 0]}>
                {bodies.map((b, i) => (
                    <group key={i} position={positions[i]}>
                        <RotSphere color={b.color} radius={b.radius} label={b.label} />
                    </group>
                ))}
            </group>
            <OrbitControls
                enablePan={false}
                enableDamping
                dampingFactor={0.08}
                autoRotate={autoRotate}
                autoRotateSpeed={0.5}
            />
        </Canvas>
    );
}
