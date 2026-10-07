"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AdaptiveDpr } from "@react-three/drei";
import { pointer } from "@/lib/pointer";
import { useUIStore } from "@/store/useUIStore";
import { DIMENSIONS } from "@/lib/data";

/* ═══════════════════════════════════════════════════════════════════════════
   GLSL — Ashima 3D simplex noise, shared by the core displacement shader.
   ═══════════════════════════════════════════════════════════════════════════ */

const SNOISE = /* glsl */ `
vec3 mod289(vec3 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 mod289(vec4 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 permute(vec4 x){ return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;

const PARTICLE_VERT = /* glsl */ `
uniform float uTime;
uniform vec2 uMouse;
uniform float uSize;
uniform float uPixelRatio;
attribute float aScale;
attribute float aSeed;
varying float vMix;
varying float vGlow;
void main() {
  vec3 p = position;
  float t = uTime * 0.14;

  // Organic drift — each particle follows its own phased sine field.
  p.x += sin(t + aSeed * 1.7 + p.y * 0.35) * 0.42;
  p.y += cos(t * 0.85 + aSeed * 2.3 + p.x * 0.30) * 0.38;
  p.z += sin(t * 0.65 + aSeed * 3.1) * 0.30;

  // Cursor repulsion (mouse arrives in world space).
  vec2 toM = p.xy - uMouse;
  float d = length(toM);
  float force = smoothstep(2.6, 0.0, d) * 1.35;
  p.xy += (toM / max(d, 0.001)) * force;
  p.z += force * 0.6;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float size = uSize * aScale * (1.0 + force * 1.8);
  gl_PointSize = min(size * uPixelRatio * (10.0 / -mv.z), 30.0 * uPixelRatio);

  float depthFade = smoothstep(34.0, 6.0, -mv.z);
  vGlow = depthFade * (0.30 + 0.55 * aScale) + force * 0.5;
  vMix = clamp((p.y + 6.0) / 12.0, 0.0, 1.0);
}
`;

const PARTICLE_FRAG = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
varying float vMix;
varying float vGlow;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float disc = smoothstep(0.5, 0.06, d);
  vec3 col = mix(uColorA, uColorB, vMix);
  gl_FragColor = vec4(col, disc * clamp(vGlow, 0.0, 1.0) * 0.55);
}
`;

const CORE_VERT = /* glsl */ `
uniform float uTime;
uniform float uAmplitude;
varying vec3 vNormal;
varying vec3 vView;
varying float vNoise;
${SNOISE}
void main() {
  float t = uTime * 0.35;
  float n = snoise(position * 1.35 + t) * 0.65
          + snoise(position * 3.1 - t * 1.4) * 0.35;
  vec3 p = position + normal * n * uAmplitude;
  vNoise = n;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vNormal = normalize(normalMatrix * normal);
  vView = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}
`;

const CORE_FRAG = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
varying vec3 vNormal;
varying vec3 vView;
varying float vNoise;
void main() {
  float fresnel = pow(1.0 - max(dot(vNormal, vView), 0.0), 2.4);
  vec3 base = mix(uColorA, uColorB, smoothstep(-0.7, 0.9, vNoise));
  vec3 col = base * 0.16 + uColorC * fresnel * 1.45 + base * fresnel * 0.35;
  gl_FragColor = vec4(col, 0.42 + fresnel * 0.58);
}
`;

const HALO_FRAG = /* glsl */ `
uniform vec3 uColor;
varying vec2 vUv;
void main() {
  float d = length(vUv - 0.5) * 2.0;
  float alpha = pow(max(1.0 - d, 0.0), 2.8) * 0.42;
  gl_FragColor = vec4(uColor, alpha);
}
`;

const HALO_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

/* ═══════════════════════════════════════════════════════════════════════════
   RENDER GATE — demand-driven loop, hard-capped at ~60fps, fully suspended
   when the canvas leaves the viewport or the tab is hidden.
   ═══════════════════════════════════════════════════════════════════════════ */

function RenderGate({ active, reduced }: { active: boolean; reduced: boolean }) {
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    if (reduced) {
      invalidate(); // one static frame
      return;
    }
    if (!active) return;
    const id = window.setInterval(() => invalidate(), 1000 / 60);
    invalidate();
    return () => window.clearInterval(id);
  }, [active, reduced, invalidate]);

  return null;
}

/* ═══════════════════════════════════════════════════════════════════════════
   SCENE OBJECTS
   ═══════════════════════════════════════════════════════════════════════════ */

function ParticleField({ count }: { count: number }) {
  const dimension = useUIStore((s) => s.dimension);

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // Spherical shell, flattened toward the camera plane for depth layering.
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 4.2 + Math.pow(Math.random(), 0.65) * 9.5;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi) * 0.62;
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta) * 0.8;
      scales[i] = 0.4 + Math.random() * 1.35;
      seeds[i] = Math.random() * 100;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    return g;
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(99, 99) },
      uSize: { value: 9 },
      uPixelRatio: { value: 1 },
      uColorA: { value: new THREE.Color(DIMENSIONS.graphite.colorA) },
      uColorB: { value: new THREE.Color(DIMENSIONS.graphite.colorB) },
    }),
    []
  );

  const targets = useMemo(() => {
    const p = DIMENSIONS[dimension];
    return {
      a: new THREE.Color(p.colorA),
      b: new THREE.Color(p.colorB),
    };
  }, [dimension]);

  useFrame((state, delta) => {
    const u = uniforms;
    u.uTime.value += delta;
    u.uPixelRatio.value = state.viewport.dpr;
    const m = u.uMouse.value as THREE.Vector2;
    m.x += (pointer.ndcX * 8.5 - m.x) * 0.055;
    m.y += (pointer.ndcY * 4.8 - m.y) * 0.055;
    (u.uColorA.value as THREE.Color).lerp(targets.a, 0.06);
    (u.uColorB.value as THREE.Color).lerp(targets.b, 0.06);
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={PARTICLE_VERT}
        fragmentShader={PARTICLE_FRAG}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function CoreMesh({ isMobile, reduced }: { isMobile: boolean; reduced: boolean }) {
  const dimension = useUIStore((s) => s.dimension);
  const group = useRef<THREE.Group>(null);
  const detail = isMobile ? 12 : 24;

  const geometry = useMemo(
    () => new THREE.IcosahedronGeometry(2.1, detail),
    [detail]
  );

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAmplitude: { value: reduced ? 0.1 : 0.3 },
      uColorA: { value: new THREE.Color(DIMENSIONS.graphite.colorA) },
      uColorB: { value: new THREE.Color(DIMENSIONS.graphite.colorB) },
      uColorC: { value: new THREE.Color(DIMENSIONS.graphite.colorC) },
    }),
    [reduced]
  );

  const targets = useMemo(() => {
    const p = DIMENSIONS[dimension];
    return {
      a: new THREE.Color(p.colorA),
      b: new THREE.Color(p.colorB),
      c: new THREE.Color(p.colorC),
    };
  }, [dimension]);

  useFrame((_, delta) => {
    uniforms.uTime.value += delta;
    (uniforms.uColorA.value as THREE.Color).lerp(targets.a, 0.06);
    (uniforms.uColorB.value as THREE.Color).lerp(targets.b, 0.06);
    (uniforms.uColorC.value as THREE.Color).lerp(targets.c, 0.06);

    const g = group.current;
    if (!g) return;
    const targetRotY = pointer.ndcX * 0.35 + (pointer.tiltX * 0.3);
    const targetRotX = -pointer.ndcY * 0.25 + (pointer.tiltY * 0.2);
    if (reduced) {
      g.rotation.y = 0.6;
      g.rotation.x = 0.1;
    } else {
      g.rotation.y += (targetRotY - g.rotation.y) * 0.04 + delta * 0.07;
      g.rotation.x += (targetRotX - g.rotation.x) * 0.04;
    }
  });

  return (
    <group ref={group}>
      <mesh geometry={geometry}>
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={CORE_VERT}
          fragmentShader={CORE_FRAG}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* Holographic wireframe cage, counter-rotating. */}
      <mesh geometry={geometry} scale={1.42}>
        <meshBasicMaterial
          color={DIMENSIONS[dimension].accent2}
          wireframe
          transparent
          opacity={0.07}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function GlowHalo() {
  const dimension = useUIStore((s) => s.dimension);
  const uniforms = useMemo(
    () => ({ uColor: { value: new THREE.Color(DIMENSIONS.graphite.accent) } }),
    []
  );
  const target = useMemo(
    () => new THREE.Color(DIMENSIONS[dimension].accent),
    [dimension]
  );

  useFrame((_, delta) => {
    (uniforms.uColor.value as THREE.Color).lerp(target, 0.06);
    void delta;
  });

  return (
    <mesh position={[0, 0, -4.5]}>
      <planeGeometry args={[26, 26]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={HALO_VERT}
        fragmentShader={HALO_FRAG}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/** Subtle camera parallax toward the pointer. */
function Rig({ reduced }: { reduced: boolean }) {
  useFrame((state) => {
    if (reduced) return;
    const cam = state.camera;
    cam.position.x += (pointer.ndcX * 0.7 - cam.position.x) * 0.045;
    cam.position.y += (pointer.ndcY * 0.45 - cam.position.y) * 0.045;
    cam.lookAt(0, 0, 0);
  });
  return null;
}

/* ═══════════════════════════════════════════════════════════════════════════
   CANVAS
   ═══════════════════════════════════════════════════════════════════════════ */

export interface HeroSceneProps {
  /** Scene runs only while visible & the tab is focused. */
  active: boolean;
  reduced: boolean;
  /** Fired once the GL context exists (used to fade the canvas in). */
  onInit?: () => void;
}

export default function HeroScene({ active, reduced, onInit }: HeroSceneProps) {
  const isMobile = useMemo(() => {
    if (typeof window === "undefined") return false;
    const cores = navigator.hardwareConcurrency ?? 8;
    return window.innerWidth < 768 || cores <= 4;
  }, []);

  return (
    <Canvas
      frameloop="demand"
      dpr={isMobile ? [1, 1.5] : [1, 1.75]}
      camera={{ fov: 42, position: [0, 0, 13], near: 0.1, far: 70 }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      }}
      performance={{ min: 0.4 }}
      onCreated={() => onInit?.()}
      aria-hidden="true"
    >
      <RenderGate active={active} reduced={reduced} />
      <AdaptiveDpr pixelated={false} />
      <Rig reduced={reduced} />
      <GlowHalo />
      <CoreMesh isMobile={isMobile} reduced={reduced} />
      <ParticleField count={isMobile ? 1600 : 4200} />
    </Canvas>
  );
}
