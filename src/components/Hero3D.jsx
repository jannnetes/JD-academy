import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, Lightformer } from "@react-three/drei";

function Knot() {
  const ref = useRef();
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.25;
      ref.current.rotation.x += delta * 0.08;
    }
  });
  return (
    <Float speed={1.1} rotationIntensity={0.4} floatIntensity={1.2}>
      <mesh ref={ref}>
        <torusKnotGeometry args={[1, 0.32, 220, 32]} />
        <meshStandardMaterial
          color="#f2a900"
          metalness={0.95}
          roughness={0.18}
          envMapIntensity={1.4}
        />
      </mesh>
    </Float>
  );
}

// Editorial, glossy, slowly-rotating amber sculpture on a transparent stage.
export default function Hero3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.6], fov: 42 }}
      gl={{ alpha: true, antialias: true }}
      style={{ background: "transparent" }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.5} />
      <spotLight position={[5, 6, 4]} intensity={2.4} color="#fff1d4" />
      <Knot />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={3} position={[3, 3, 3]} scale={4} color="#ffd27a" />
        <Lightformer form="rect" intensity={2} position={[-3, -2, 2]} scale={4} color="#fc6c3f" />
      </Environment>
    </Canvas>
  );
}
