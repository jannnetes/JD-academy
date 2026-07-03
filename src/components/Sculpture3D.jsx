import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, Lightformer } from "@react-three/drei";

function Globe() {
  const ring = useRef();
  const core = useRef();
  useFrame((_, d) => {
    if (ring.current) ring.current.rotation.z += d * 0.3;
    if (core.current) core.current.rotation.y += d * 0.2;
  });
  return (
    <group rotation={[0.5, 0, 0.2]}>
      <mesh ref={core}>
        <sphereGeometry args={[1.05, 64, 64]} />
        <meshStandardMaterial color="#f5a623" metalness={0.7} roughness={0.25} envMapIntensity={1.3} />
      </mesh>
      <mesh ref={ring}>
        <torusGeometry args={[1.7, 0.05, 24, 160]} />
        <meshStandardMaterial color="#e8743b" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
}

function Orbit() {
  const g = useRef();
  useFrame((_, d) => {
    if (g.current) g.current.rotation.y += d * 0.4;
  });
  const sats = [
    { p: [2, 0.4, 0], s: 0.28, c: "#f5a623" },
    { p: [-1.6, 1, 0.5], s: 0.22, c: "#e8743b" },
    { p: [0.4, -1.6, -0.6], s: 0.3, c: "#f3ece0" },
  ];
  return (
    <group ref={g}>
      <mesh>
        <icosahedronGeometry args={[0.95, 1]} />
        <meshStandardMaterial color="#f5a623" metalness={0.85} roughness={0.2} flatShading />
      </mesh>
      {sats.map((s, i) => (
        <Float key={i} speed={2} floatIntensity={1.5} rotationIntensity={1.5}>
          <mesh position={s.p}>
            <dodecahedronGeometry args={[s.s, 0]} />
            <meshStandardMaterial color={s.c} metalness={0.7} roughness={0.3} />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

// variant: "globe" | "orbit"
export default function Sculpture3D({ variant = "globe" }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 42 }}
      gl={{ alpha: true, antialias: true }}
      style={{ background: "transparent" }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.55} />
      <spotLight position={[4, 5, 4]} intensity={2.2} color="#fff1d4" />
      <Float speed={1} rotationIntensity={0.3} floatIntensity={1}>
        {variant === "orbit" ? <Orbit /> : <Globe />}
      </Float>
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={3} position={[3, 3, 3]} scale={4} color="#ffd27a" />
        <Lightformer form="rect" intensity={2} position={[-3, -2, 2]} scale={4} color="#e8743b" />
      </Environment>
    </Canvas>
  );
}
