import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { store } from "@/lib/store";

const vertex = /* glsl */ `
uniform float uTime, uPR, uReveal;
attribute float aSeed;
varying float vA;
void main(){
  vec3 p = position;
  p.y = mod(position.y + uTime * 0.04 * (0.3 + aSeed) + 10.0, 20.0) - 10.0;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = (1.0 + aSeed * 2.5) * uPR * 6.0 / -mv.z;
  vA = uReveal * (0.25 + 0.75 * fract(aSeed * 13.0 + uTime * 0.2 * aSeed));
}`;
const fragment = /* glsl */ `
varying float vA;
void main(){
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  gl_FragColor = vec4(vec3(0.9), smoothstep(0.5, 0.0, d) * vA);
}`;

export function Starfield({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const mat = useRef<THREE.ShaderMaterial>(null);
  const geo = useMemo(() => {
    const p = new Float32Array(count * 3);
    const s = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 24;
      p[i * 3 + 1] = (Math.random() - 0.5) * 20;
      p[i * 3 + 2] = -Math.random() * 14 + 2;
      s[i] = Math.random();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(s, 1));
    return g;
  }, [count]);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uPR: { value: 1 }, uReveal: { value: 0 } }), []);

  useFrame((state, raw) => {
    const dt = Math.min(raw, 0.05);
    if (!mat.current || !ref.current) return;
    uniforms.uTime.value += dt;
    uniforms.uPR.value = state.gl.getPixelRatio();
    uniforms.uReveal.value = store.stars;
    ref.current.rotation.y = store.mouse.x * 0.06 + store.scroll * 0.00005;
    ref.current.rotation.x = -store.mouse.y * 0.04;
  });

  return (
    <points ref={ref} geometry={geo}>
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
