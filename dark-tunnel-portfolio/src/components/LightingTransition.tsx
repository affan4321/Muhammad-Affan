"use client";

import { useEffect, useRef } from "react";
import { useGameStore } from "@/store/gameStore";
import { useFrame } from "@react-three/fiber";
import { DirectionalLight } from "three";
import gsap from "gsap";

const TUNNEL_INTENSITY = 0.45;
const FORK_INTENSITY = 2.8;
const CHAMBER_INTENSITY = 3.0;

export const LightingTransition = () => {
  const dirRef = useRef<DirectionalLight | null>(null);
  const gameState = useGameStore((s) => s.gameState);
  const segmentProgress = useGameStore((s) => s.segmentProgress);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  const targetIntensity = () => {
    if (gameState === "INSIDE_CHAMBER") return CHAMBER_INTENSITY;
    if (gameState === "CHOOSING_PATH" && segmentProgress >= 0.88) {
      return FORK_INTENSITY;
    }
    return TUNNEL_INTENSITY;
  };

  useEffect(() => {
    if (!dirRef.current) return;
    dirRef.current.intensity = TUNNEL_INTENSITY;
  }, []);

  useEffect(() => {
    if (!dirRef.current) return;

    tweenRef.current?.kill();
    tweenRef.current = gsap.to(dirRef.current, {
      intensity: targetIntensity(),
      duration: 0.35,
      ease: "power2.out",
      overwrite: true,
    });

    return () => {
      tweenRef.current?.kill();
    };
  }, [gameState, segmentProgress]);

  useFrame(() => {
    if (dirRef.current) {
      dirRef.current.position.set(10, 20, 10);
    }
  });

  return (
    <directionalLight
      ref={(r) => (dirRef.current = r as unknown as DirectionalLight)}
      castShadow
      intensity={TUNNEL_INTENSITY}
      position={[10, 20, 10]}
    />
  );
};

export default LightingTransition;
