"use client";

import { useEffect, useRef } from "react";
import { useGameStore } from "@/store/gameStore";
import { useFrame } from "@react-three/fiber";
import { DirectionalLight } from "three";
import gsap from "gsap";

export const LightingTransition = () => {
  const dirRef = useRef<DirectionalLight | null>(null);
  const progress = useGameStore((s) => s.progress);
  const gameState = useGameStore((s) => s.gameState);

  useEffect(() => {
    if (!dirRef.current) return;

    // Start dim
    dirRef.current.intensity = 0.2;
  }, []);

  // When entering cave (CHOOSING_PATH triggered), animate light up
  useEffect(() => {
    if (!dirRef.current) return;
    if (gameState === "CHOOSING_PATH" || progress >= 0.99) {
      gsap.to(dirRef.current, { intensity: 4, duration: 0.8, ease: "power2.out" });
    } else {
      gsap.to(dirRef.current, { intensity: 0.2, duration: 0.8, ease: "power2.out" });
    }
  }, [gameState, progress]);

  // keep directional light synced in scene
  useFrame(() => {
    if (dirRef.current) {
      dirRef.current.position.set(10, 20, 10);
    }
  });

  return (
    <directionalLight
      ref={(r) => (dirRef.current = r as unknown as DirectionalLight)}
      castShadow
      intensity={0.2}
      position={[10, 20, 10]}
    />
  );
};

export default LightingTransition;
