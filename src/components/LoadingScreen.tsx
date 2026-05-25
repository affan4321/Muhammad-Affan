"use client";

import { Suspense, useRef, useState } from "react";
import { Html, Center, PerspectiveCamera, useProgress, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "@/store/gameStore";

useGLTF.preload("/models/muhammad-affan-model-compressed.glb");

const LoadingModel = () => {
  const { scene } = useGLTF("/models/muhammad-affan-model-compressed.glb");

  return (
    <Center>
      <primitive object={scene} scale={1.05} />
    </Center>
  );
};

export const LoadingScreen = () => {
  const progress = useProgress((state) => state.progress);
  const isSceneLoading = useGameStore((state) => state.isSceneLoading);
  const modelGroup = useRef<THREE.Group | null>(null);
  const [displayProgress, setDisplayProgress] = useState(0);
  const maxProgress = useRef(0);

  useFrame((_, delta) => {
    // Stop useFrame when not loading to prevent performance drain
    if (!isSceneLoading) return;
    
    if (modelGroup.current) {
      modelGroup.current.rotation.y += delta * 0.6;
    }

    const nextProgress = Math.min(100, progress);
    if (nextProgress > maxProgress.current) {
      maxProgress.current = nextProgress;
      setDisplayProgress(nextProgress);
    }
  });

  if (!isSceneLoading) return null;

  return (
    <>
      <PerspectiveCamera makeDefault fov={33} position={[0, 0, 8.2]} />
      <color attach="background" args={["#050000"]} />
      <fog attach="fog" args={["#050000", 5, 18]} />
      <ambientLight intensity={0.05} />
      <directionalLight position={[-7, 2.5, 7]} intensity={3.6} color="#ffd2b8" />
      <directionalLight position={[6, 0, -4]} intensity={0.35} color="#5a1820" />

      <group ref={modelGroup} position={[-1.05, -0.3, 0]} scale={4}>
        <Suspense fallback={null}>
          <LoadingModel />
        </Suspense>
      </group>

      <Html
        fullscreen
        transform={false}
        style={{ pointerEvents: "none", width: "100vw", height: "100vh" }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            color: "#ffd9d9",
            fontFamily:
              'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            background: "transparent",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "end",
              justifyContent: "center",
              paddingLeft: "2rem",
              paddingRight: "2rem",
              gap: 10,
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              paddingLeft: "2rem",
              paddingRight: "2rem",
              gap: 10,
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: "0.18em" }}>
              Loading...
            </div>
            <div style={{ fontSize: 82, fontWeight: 600, lineHeight: 0.92, color: "#ff6e6e" }}>
              {displayProgress.toFixed(1)}
            </div>
          </div>
        </div>
      </Html>
    </>
  );
};

export default LoadingScreen;