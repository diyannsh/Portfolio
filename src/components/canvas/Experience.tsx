import { Canvas, useFrame } from "@react-three/fiber";
import { AdaptiveDpr, PerformanceMonitor } from "@react-three/drei";
import { Bloom, ChromaticAberration, EffectComposer, Vignette } from "@react-three/postprocessing";
import { useRef, useState } from "react";
import * as THREE from "three";
import { ParticlePortrait } from "./ParticlePortrait";
import { Starfield } from "./Starfield";
import { store } from "@/lib/store";

function CameraRig() {
  useFrame((state, raw) => {
    const dt = Math.min(raw, 0.05);
    const cam = state.camera;
    const k = 1 - Math.exp(-4 * dt);
    const z = 5 + store.heroProgress * 1.5 - (1 - store.stars) * 1.2;
    cam.position.x += (store.mouse.x * 0.25 - cam.position.x) * k;
    cam.position.y += (store.mouse.y * 0.15 - store.heroProgress * 0.6 - cam.position.y) * k;
    cam.position.z += (z - cam.position.z) * k;
    cam.lookAt(0, -store.heroProgress * 0.6, 0);
  });
  return null;
}

function Effects() {
  const ca = useRef<any>(null);
  const off = useRef(new THREE.Vector2(0.0004, 0.0004));
  useFrame(() => {
    const v = Math.min(Math.abs(store.velocity) * 0.00012, 0.006);
    off.current.set(0.0004 + v, 0.0004 + v * 0.5);
    if (ca.current?.offset) ca.current.offset.copy(off.current);
  });
  return (
    <EffectComposer multisampling={0}>
      <Bloom luminanceThreshold={0.2} intensity={0.7} mipmapBlur radius={0.6} />
      <ChromaticAberration ref={ca} offset={off.current} radialModulation={false} modulationOffset={0} />
      <Vignette eskil={false} offset={0.25} darkness={0.85} />
    </EffectComposer>
  );
}

export function Experience({ photo, mobile }: { photo: string; mobile: boolean }) {
  const [lowEnd, setLowEnd] = useState(false);
  return (
    <div className="fixed inset-0 z-0">
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 5], fov: 45 }} gl={{ antialias: false, powerPreference: "high-performance" }}>
        <color attach="background" args={["#000000"]} />
        <PerformanceMonitor onDecline={() => setLowEnd(true)} />
        <AdaptiveDpr pixelated />
        <CameraRig />
        <Starfield count={mobile ? 1800 : 5000} />
        <ParticlePortrait src={photo} count={mobile ? 15000 : 55000} />
        {!lowEnd && !mobile && <Effects />}
      </Canvas>
    </div>
  );
}
