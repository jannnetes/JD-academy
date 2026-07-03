import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const BOUNDS = { x: { min: -4, max: 4 }, z: { min: -1.5, max: 1.5 } };
const WANDER_SPEED = 0.9;
const RUN_SPEED = 4.5;
const TURN = 0.08;

// ── Procedural dachshund built from primitives ──
function Dog({ scrollDelta, mousePos, jumpRef, dogScreen, onBark, reduced }) {
  const group = useRef();
  const head = useRef();
  const tail = useRef();
  const earL = useRef();
  const earR = useRef();
  const { camera, size } = useThree();

  const target = useRef(new THREE.Vector3(0, 0, 0));
  const vel = useRef(new THREE.Vector3());
  const mode = useRef("wander");
  const timer = useRef(0);
  const jumpStart = useRef(-1);
  const tmp = useRef(new THREE.Vector3());

  function randomTarget() {
    target.current.set(
      THREE.MathUtils.randFloat(BOUNDS.x.min, BOUNDS.x.max),
      0,
      THREE.MathUtils.randFloat(BOUNDS.z.min, BOUNDS.z.max)
    );
  }
  useEffect(() => { randomTarget(); }, []);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const d = Math.min(delta, 0.05);
    timer.current += d;

    // reduced motion → static dog facing the camera, no behavior
    if (reduced) {
      tmp.current.copy(g.position); tmp.current.y += 0.6; tmp.current.project(camera);
      dogScreen.current.x = (tmp.current.x * 0.5 + 0.5) * size.width;
      dogScreen.current.y = (-tmp.current.y * 0.5 + 0.5) * size.height;
      return;
    }

    // tail always wags
    if (tail.current) {
      tail.current.rotation.y = Math.sin(t * 9) * 0.6;
      tail.current.rotation.z = 0.5 + Math.sin(t * 9) * 0.25;
    }
    // ears sway
    if (earL.current) earL.current.rotation.x = 0.2 + Math.sin(t * 4) * 0.12;
    if (earR.current) earR.current.rotation.x = 0.2 + Math.sin(t * 4 + Math.PI) * 0.12;

    // ── click jump ──
    if (jumpRef.current && jumpStart.current < 0) {
      jumpStart.current = t;
      jumpRef.current = false;
      onBark();
    }
    let jumpY = 0;
    if (jumpStart.current >= 0) {
      const p = (t - jumpStart.current) / 0.7;
      if (p >= 1) { jumpStart.current = -1; }
      else { jumpY = Math.sin(p * Math.PI) * 1.3; g.rotation.y += d * 9; }
    }

    // ── scroll run ──
    if (Math.abs(scrollDelta.current) > 4 && jumpStart.current < 0) {
      const dir = scrollDelta.current > 0 ? 1 : -1;
      g.position.x = THREE.MathUtils.clamp(g.position.x + dir * RUN_SPEED * d, BOUNDS.x.min, BOUNDS.x.max);
      g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, dir > 0 ? Math.PI / 2 : -Math.PI / 2, TURN * 3);
      scrollDelta.current *= 0.85;
    } else if (jumpStart.current < 0) {
      // ── wander / sniff / sit ──
      if (mode.current === "wander") {
        const dir = tmp.current.copy(target.current).sub(g.position);
        const dist = dir.length();
        if (dist < 0.3) {
          const roll = Math.random();
          if (roll < 0.4) { mode.current = "sniff"; timer.current = 0; }
          else if (roll < 0.65) { mode.current = "sit"; timer.current = 0; }
          else randomTarget();
        } else {
          dir.normalize();
          vel.current.lerp(dir.multiplyScalar(WANDER_SPEED), 0.08);
          g.position.addScaledVector(vel.current, d);
          if (vel.current.length() > 0.01) {
            const angle = Math.atan2(vel.current.x, vel.current.z);
            g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, angle, TURN);
          }
        }
      } else if (mode.current === "sniff") {
        if (timer.current > 2 + Math.random() * 2) { mode.current = "wander"; randomTarget(); }
      } else if (mode.current === "sit") {
        if (timer.current > 1.5 + Math.random() * 2) { mode.current = "wander"; randomTarget(); }
      }
    }

    // breathing + jump height
    g.position.y = jumpY + Math.sin(t * 1.5) * 0.03;

    // head follows cursor + characteristic look-up
    if (head.current) {
      const mx = mousePos.current.x;
      const my = mousePos.current.y;
      head.current.rotation.y = THREE.MathUtils.lerp(head.current.rotation.y, mx * 0.5, 0.08);
      head.current.rotation.x = THREE.MathUtils.lerp(head.current.rotation.x, -0.25 - my * 0.25, 0.08);
    }

    // project to screen for click detection + bark popup
    tmp.current.copy(g.position); tmp.current.y += 0.6;
    tmp.current.project(camera);
    dogScreen.current.x = (tmp.current.x * 0.5 + 0.5) * size.width;
    dogScreen.current.y = (-tmp.current.y * 0.5 + 0.5) * size.height;
  });

  const BROWN = "#8B4513", TAN = "#CD853F", DARK = "#2E1306", NOSE = "#1A0A00";

  return (
    <group ref={group} scale={0.9} rotation={[0, Math.PI / 2, 0]}>
      {/* body (elongated — dachshund) */}
      <mesh position={[0, 0.42, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <capsuleGeometry args={[0.26, 1.25, 8, 16]} />
        <meshStandardMaterial color={BROWN} roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.2, 1.0, 6, 12]} />
        <meshStandardMaterial color={TAN} roughness={0.95} />
      </mesh>

      {/* head group (faces +x) */}
      <group ref={head} position={[0.85, 0.5, 0]}>
        <mesh castShadow><sphereGeometry args={[0.3, 18, 18]} /><meshStandardMaterial color={BROWN} roughness={0.85} /></mesh>
        <mesh position={[0.26, -0.06, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <capsuleGeometry args={[0.14, 0.26, 6, 12]} /><meshStandardMaterial color={TAN} roughness={0.8} />
        </mesh>
        {/* big nose */}
        <mesh position={[0.48, -0.04, 0]}><sphereGeometry args={[0.11, 14, 14]} /><meshStandardMaterial color={NOSE} roughness={0.15} metalness={0.3} /></mesh>
        {/* eyes (look up) */}
        {[0.2, -0.2].map((z) => (
          <group key={z} position={[0.2, 0.12, z]}>
            <mesh><sphereGeometry args={[0.075, 14, 14]} /><meshStandardMaterial color="#F5F5F5" /></mesh>
            <mesh position={[0.05, 0.02, 0]}><sphereGeometry args={[0.05, 12, 12]} /><meshStandardMaterial color="#0D0D0D" roughness={0} metalness={0.4} /></mesh>
            <mesh position={[0.08, 0.05, 0.02]}><sphereGeometry args={[0.016, 8, 8]} /><meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.6} /></mesh>
          </group>
        ))}
        {/* floppy ears */}
        <mesh ref={earL} position={[-0.04, 0.04, 0.27]}><capsuleGeometry args={[0.09, 0.34, 6, 8]} /><meshStandardMaterial color={DARK} roughness={0.95} /></mesh>
        <mesh ref={earR} position={[-0.04, 0.04, -0.27]}><capsuleGeometry args={[0.09, 0.34, 6, 8]} /><meshStandardMaterial color={DARK} roughness={0.95} /></mesh>
      </group>

      {/* legs */}
      {[[0.5, 0.22], [0.5, -0.22], [-0.5, 0.22], [-0.5, -0.22]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.12, z]} castShadow><capsuleGeometry args={[0.08, 0.22, 6, 8]} /><meshStandardMaterial color={BROWN} roughness={0.9} /></mesh>
      ))}

      {/* tail */}
      <mesh ref={tail} position={[-0.78, 0.5, 0]} rotation={[0, 0, 0.5]}><capsuleGeometry args={[0.05, 0.36, 6, 8]} /><meshStandardMaterial color={BROWN} roughness={0.9} /></mesh>
    </group>
  );
}

export default function DachshundScene() {
  const scrollDelta = useRef(0);
  const mousePos = useRef({ x: 0, y: 0 });
  const jumpRef = useRef(false);
  const dogScreen = useRef({ x: 0, y: 0 });
  const [bark, setBark] = useState(null);
  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Nudge R3F to (re)measure the canvas to the viewport right after mount.
  useEffect(() => {
    const id = setTimeout(() => window.dispatchEvent(new Event("resize")), 120);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (reduced) return undefined;
    let lastY = window.scrollY;
    const onScroll = () => { scrollDelta.current = window.scrollY - lastY; lastY = window.scrollY; };
    const onMouse = (e) => {
      mousePos.current = { x: (e.clientX / window.innerWidth) * 2 - 1, y: -(e.clientY / window.innerHeight) * 2 + 1 };
    };
    const onClick = (e) => {
      const dx = e.clientX - dogScreen.current.x;
      const dy = e.clientY - dogScreen.current.y;
      if (Math.hypot(dx, dy) < 110) {
        jumpRef.current = true;
        setBark({ x: dogScreen.current.x, y: dogScreen.current.y });
        setTimeout(() => setBark(null), 1400);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMouse);
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("click", onClick);
    };
  }, [reduced]);

  return (
    <>
      <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", pointerEvents: "none", zIndex: 60 }}>
        <Canvas shadows camera={{ position: [0, 1.6, 7], fov: 45 }} gl={{ alpha: true, antialias: true }} style={{ background: "transparent" }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 10, 5]} intensity={1.3} castShadow shadow-mapSize={[1024, 1024]} />
          <pointLight position={[-3, 3, -3]} intensity={0.4} color="#F7F4EE" />
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
            <planeGeometry args={[30, 14]} />
            <shadowMaterial opacity={0.16} />
          </mesh>
          <Dog
            scrollDelta={scrollDelta}
            mousePos={mousePos}
            jumpRef={jumpRef}
            dogScreen={dogScreen}
            onBark={() => {}}
            reduced={reduced}
          />
        </Canvas>
      </div>

      {bark && (
        <div style={{
          position: "fixed", left: bark.x, top: bark.y - 70, transform: "translateX(-50%)",
          background: "#0D0D0D", color: "#F7F4EE", fontFamily: "'Space Mono', monospace",
          fontSize: 13, letterSpacing: "0.08em", padding: "8px 18px", borderRadius: 150,
          zIndex: 9999, pointerEvents: "none", whiteSpace: "nowrap",
        }}>WOOF! 🐾</div>
      )}
    </>
  );
}
