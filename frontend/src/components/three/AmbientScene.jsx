import { Suspense, useRef, createElement as h } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment } from "@react-three/drei";

function Knot({ color = "#ff4500", position = [0, 0, 0], scale = 1 }) {
  const ref = useRef();
  useFrame((s) => {
    const t = s.clock.getElapsedTime();
    if (ref.current) {
      ref.current.rotation.x = t * 0.3;
      ref.current.rotation.y = t * 0.4;
    }
  });
  return (
    <Float speed={1.5} rotationIntensity={0.6} floatIntensity={0.8}>
      {h(
        "mesh",
        { ref, position, scale },
        h("torusKnotGeometry", { args: [0.8, 0.25, 120, 18] }),
        h("meshStandardMaterial", { color, roughness: 0.3, metalness: 0.25 }),
      )}
    </Float>
  );
}

export default function AmbientScene({ color = "#ff4500" }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 4.5], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: "100%", height: "100%" }}
    >
      {h("ambientLight", { intensity: 0.7 })}
      {h("directionalLight", { position: [3, 4, 3], intensity: 1.1 })}
      {h("directionalLight", { position: [-3, -2, -2], intensity: 0.4, color })}
      <Suspense fallback={null}>
        <Knot color={color} />
        <Environment preset="city" />
      </Suspense>
    </Canvas>
  );
}
