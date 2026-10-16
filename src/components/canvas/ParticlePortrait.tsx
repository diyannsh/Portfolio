import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { store } from "@/lib/store";

const vertex = /* glsl */ `
uniform float uTime, uProgress, uExplode, uSize, uPR;
uniform vec2 uMouse;
attribute vec3 aRandom;
attribute float aBright;
varying float vB;
varying float vA;
float hash(float n){ return fract(sin(n)*43758.5453); }
void main(){
  float t = smoothstep(0.0, 1.0, clamp(uProgress * 1.2 - aRandom.z * 0.04, 0.0, 1.0));
  vec3 p = mix(aRandom * vec3(2.2, 1.6, 1.0), position, t);
  // idle shimmer
  p.x += sin(uTime * 1.3 + position.y * 9.0 + aRandom.x * 3.0) * 0.006;
  p.y += cos(uTime * 1.1 + position.x * 7.0) * 0.005;
  p.z += sin(uTime * 0.7 + position.x * 4.0 + position.y * 3.0) * 0.05;
  // digital glitch bands
  float row = floor(position.y * 45.0);
  float g = step(0.975, hash(row + floor(uTime * 7.0)));
  p.x += g * (hash(row) - 0.5) * 0.12 * t;
  // mouse repel
  vec2 d = p.xy - uMouse;
  float dist = length(d);
  float f = smoothstep(0.55, 0.0, dist) * t;
  p.xy += normalize(d + 1e-4) * f * 0.32;
  p.z += f * 0.5;
  // scroll explode
  p += normalize(aRandom + 1e-4) * uExplode * (2.0 + aRandom.z * 2.0);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * (0.35 + aBright * 0.9) * uPR / -mv.z;
  vB = aBright;
  vA = (1.0 - uExplode) * (0.25 + 0.75 * t);
}`;

const fragment = /* glsl */ `
varying float vB;
varying float vA;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.0, d);
  float scan = 0.8 + 0.2 * sin(gl_FragCoord.y * 1.6);
  vec3 col = mix(vec3(0.55, 0.62, 0.72), vec3(1.0), vB) * vB * scan;
  gl_FragColor = vec4(col, a * vA);
}`;

export function ParticlePortrait({ src, count }: { src: string; count: number }) {
  const [geo, setGeo] = useState<THREE.BufferGeometry | null>(null);
  const mat = useRef<THREE.ShaderMaterial>(null);
  const mouse = useRef(new THREE.Vector2(9, 9));
  const { viewport, gl } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uExplode: { value: 0 },
      uSize: { value: 22 },
      uPR: { value: Math.min(gl.getPixelRatio(), 2) },
      uMouse: { value: new THREE.Vector2(9, 9) },
    }),
    [gl],
  );

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      const W = 260;
      const H = Math.round((img.height / img.width) * W);
      const c = document.createElement("canvas");
      c.width = W;
      c.height = H;
      const ctx = c.getContext("2d")!;
      ctx.drawImage(img, 0, 0, W, H);
      const data = ctx.getImageData(0, 0, W, H).data;
      const cand: number[] = [];
      for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
          const i = (y * W + x) * 4;
          const b = (data[i]! * 0.299 + data[i + 1]! * 0.587 + data[i + 2]! * 0.114) / 255;
          if (b > 0.09) cand.push(x, y, b);
        }
      const total = cand.length / 3;
      const n = Math.min(count, total);
      const pos = new Float32Array(n * 3);
      const rnd = new Float32Array(n * 3);
      const br = new Float32Array(n);
      const h = 3.3;
      const w = (W / H) * h;
      for (let k = 0; k < n; k++) {
        const j = Math.floor((k / n) * total + Math.random() * (total / n)) * 3;
        const x = cand[j]! + Math.random() - 0.5;
        const y = cand[j + 1]! + Math.random() - 0.5;
        const b = cand[j + 2]!;
        pos[k * 3] = (x / W - 0.5) * w;
        pos[k * 3 + 1] = -(y / H - 0.5) * h;
        pos[k * 3 + 2] = (b - 0.5) * 0.25;
        rnd[k * 3] = (Math.random() - 0.5) * 6;
        rnd[k * 3 + 1] = (Math.random() - 0.5) * 6;
        rnd[k * 3 + 2] = (Math.random() - 0.5) * 4;
        br[k] = Math.pow(b, 1.2);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      g.setAttribute("aRandom", new THREE.BufferAttribute(rnd, 3));
      g.setAttribute("aBright", new THREE.BufferAttribute(br, 1));
      setGeo(g);
    };
  }, [src, count]);

  useFrame((state, raw) => {
    const dt = Math.min(raw, 0.05);
    const m = mat.current;
    if (!m) return;
    uniforms.uTime.value += dt;
    uniforms.uProgress.value = store.portrait;
    uniforms.uExplode.value = THREE.MathUtils.clamp(store.heroProgress * 1.4, 0, 1);
    const groupY = 0.35;
    const target = new THREE.Vector2(
      (store.mouse.x * viewport.width) / 2,
      (store.mouse.y * viewport.height) / 2 - groupY,
    );
    if (!store.mouse.active) target.set(9, 9);
    mouse.current.lerp(target, 1 - Math.exp(-8 * dt));
    uniforms.uMouse.value.copy(mouse.current);
  });

  if (!geo) return null;
  return (
    <points geometry={geo} position={[0, 0.35, 0]}>
      <shaderMaterial
        ref={mat}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
