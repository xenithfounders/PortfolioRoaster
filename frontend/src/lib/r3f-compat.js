/**
 * The Emergent visual-edits babel plugin injects debug attrs like
 * `x-line-number` on every lowercase JSX element. react-three-fiber's
 * applyProps then tries to walk kebab-case props as nested property paths
 * (e.g. `x.line.number`) on Three.js objects and crashes.
 *
 * Fix: monkey-patch both `React.createElement` AND the JSX runtime (`jsx`,
 * `jsxs`, `jsxDEV`) to strip `x-*` props from R3F-style intrinsics.
 */
import React from "react";
import * as JSXRuntime from "react/jsx-runtime";
import * as JSXDevRuntime from "react/jsx-dev-runtime";

const R3F_TAGS = new Set([
  "group",
  "mesh",
  "scene",
  "color",
  "fog",
  "fogExp2",
  "primitive",
  "object3D",
  "instancedMesh",
  "lineLoop",
  "lineSegments",
  "points",
  "sprite",
  "perspectiveCamera",
  "orthographicCamera",
  "cubeCamera",
  "arrayCamera",
  "ambientLight",
  "directionalLight",
  "hemisphereLight",
  "pointLight",
  "rectAreaLight",
  "spotLight",
  "planeGeometry",
  "boxGeometry",
  "sphereGeometry",
  "circleGeometry",
  "cylinderGeometry",
  "coneGeometry",
  "torusGeometry",
  "torusKnotGeometry",
  "icosahedronGeometry",
  "octahedronGeometry",
  "tetrahedronGeometry",
  "dodecahedronGeometry",
  "bufferGeometry",
  "extrudeGeometry",
  "latheGeometry",
  "shapeGeometry",
  "tubeGeometry",
  "meshBasicMaterial",
  "meshStandardMaterial",
  "meshPhysicalMaterial",
  "meshPhongMaterial",
  "meshMatcapMaterial",
  "meshLambertMaterial",
  "meshToonMaterial",
  "meshNormalMaterial",
  "meshDepthMaterial",
  "meshDistanceMaterial",
  "lineBasicMaterial",
  "lineDashedMaterial",
  "pointsMaterial",
  "rawShaderMaterial",
  "shaderMaterial",
  "shadowMaterial",
  "spriteMaterial",
  "canvasTexture",
  "texture",
  "videoTexture",
]);

function scrub(props) {
  if (!props) return props;
  let hit = false;
  for (const k in props) {
    if (k.startsWith("x-")) {
      hit = true;
      break;
    }
  }
  if (!hit) return props;
  const clean = {};
  for (const k in props) {
    if (!k.startsWith("x-")) clean[k] = props[k];
  }
  return clean;
}

function wrap(origFn) {
  return function patched(type, props, ...rest) {
    if (typeof type === "string" && R3F_TAGS.has(type)) {
      return origFn(type, scrub(props), ...rest);
    }
    return origFn(type, props, ...rest);
  };
}

function patchModule(mod, keys) {
  for (const k of keys) {
    const fn = mod[k];
    if (typeof fn !== "function" || fn.__r3fPatched) continue;
    try {
      const wrapped = wrap(fn);
      wrapped.__r3fPatched = true;
      Object.defineProperty(mod, k, {
        value: wrapped,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    } catch {
      /* ignore */
    }
  }
}

patchModule(React, ["createElement", "cloneElement"]);
patchModule(JSXRuntime, ["jsx", "jsxs"]);
patchModule(JSXDevRuntime, ["jsxDEV"]);

export {};
