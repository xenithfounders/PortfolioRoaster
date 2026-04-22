import { Suspense, useRef, createElement as h } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Float,
  Environment,
  ContactShadows,
  RoundedBox,
  useTexture,
} from "@react-three/drei";

/**
 * Every lowercase R3F primitive is built via React.createElement so the
 * visual-edits babel plugin cannot inject `x-line-number` attrs that R3F's
 * applyProps would try to walk as `x.line.number` on Three.js objects.
 * (Belt-and-braces: the runtime shim in src/lib/r3f-compat.js also strips.)
 */

const el = h;

function PhoneScreen({ textureUrl = "/app-preview.jpeg" }) {
  const tex = useTexture(textureUrl);
  // Screen size: 1.8 × 3.75 (matches the phone body inset)
  return el(
    "mesh",
    { position: [0, 0, 0.12] },
    el("planeGeometry", { args: [1.8, 3.75] }),
    el("meshStandardMaterial", {
      map: tex,
      emissive: "#ffffff",
      emissiveMap: tex,
      emissiveIntensity: 0.55,
      roughness: 0.35,
      metalness: 0.0,
      toneMapped: false,
    }),
  );
}

function Phone({ position = [0, 0, 0] }) {
  const ref = useRef();
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ref.current) {
      ref.current.rotation.y = Math.sin(t * 0.4) * 0.35;
      ref.current.rotation.x = Math.sin(t * 0.3) * 0.1;
    }
  });
  return el(
    "group",
    { ref, position, rotation: [0, -0.2, -0.1] },
    el(
      RoundedBox,
      { args: [2.0, 4.0, 0.22], radius: 0.18, smoothness: 6, castShadow: true },
      el("meshStandardMaterial", {
        color: "#0a0a0a",
        roughness: 0.35,
        metalness: 0.6,
      }),
    ),
    el(PhoneScreen, null),
  );
}

function Blob({ position, color = "#ff4500", scale = 1, speed = 1 }) {
  const ref = useRef();
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ref.current) {
      ref.current.rotation.x = t * 0.25 * speed;
      ref.current.rotation.y = t * 0.3 * speed;
    }
  });
  return el(
    Float,
    { speed: 2, rotationIntensity: 0.6, floatIntensity: 1.2 },
    el(
      "mesh",
      { ref, position, scale, castShadow: true },
      el("icosahedronGeometry", { args: [0.6, 1] }),
      el("meshStandardMaterial", {
        color,
        roughness: 0.25,
        metalness: 0.2,
        flatShading: true,
      }),
    ),
  );
}

function Torus({ position, color = "#c8a951" }) {
  const ref = useRef();
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ref.current) {
      ref.current.rotation.x = t * 0.5;
      ref.current.rotation.y = t * 0.3;
    }
  });
  return el(
    Float,
    { speed: 1.4, rotationIntensity: 0.4, floatIntensity: 0.8 },
    el(
      "mesh",
      { ref, position, castShadow: true },
      el("torusGeometry", { args: [0.55, 0.18, 20, 60] }),
      el("meshStandardMaterial", { color, roughness: 0.5, metalness: 0.3 }),
    ),
  );
}

export default function HeroScene() {
  return el(
    Canvas,
    {
      shadows: true,
      dpr: [1, 1.8],
      camera: { position: [0, 0, 6.5], fov: 38 },
      gl: { antialias: true, alpha: true },
      style: { width: "100%", height: "100%" },
    },
    el("color", { attach: "background", args: ["#f5f0e8"] }),
    el("ambientLight", { intensity: 0.6 }),
    el("directionalLight", {
      position: [5, 6, 5],
      intensity: 1.1,
      castShadow: true,
      "shadow-mapSize-width": 1024,
      "shadow-mapSize-height": 1024,
    }),
    el("directionalLight", {
      position: [-4, -3, -2],
      intensity: 0.3,
      color: "#ff4500",
    }),

    el(
      Suspense,
      { fallback: null },
      el(
        Float,
        { speed: 1.2, rotationIntensity: 0.3, floatIntensity: 0.6 },
        el(Phone, { position: [0, 0, 0] }),
      ),
      el(Blob, { position: [-2.6, 1.4, -1], color: "#ff4500", scale: 0.9, speed: 0.8 }),
      el(Blob, { position: [2.4, -1.3, -1.5], color: "#0a0a0a", scale: 0.7, speed: 1.3 }),
      el(Blob, { position: [2.8, 1.7, -2], color: "#ff9d6f", scale: 0.5, speed: 1.6 }),
      el(Torus, { position: [-2.5, -1.5, -0.8], color: "#c8a951" }),
      el(Torus, { position: [2.2, 0.1, -2.5], color: "#0a0a0a" }),
      el(ContactShadows, {
        position: [0, -2.4, 0],
        opacity: 0.35,
        scale: 8,
        blur: 2.6,
        far: 3,
        color: "#0a0a0a",
      }),
      el(Environment, { preset: "city" }),
    ),
  );
}
