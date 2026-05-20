"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGameStore } from "@/store/gameStore";
import * as THREE from "three";

/**
 * Handcar component - renders a cube that moves along the track
 * Phase 1: Simple graybox implementation
 */
export const Handcar = () => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const currentTrack = useGameStore((state) => state.currentTrack);
  const progress = useGameStore((state) => state.progress);
  const setProgress = useGameStore((state) => state.setProgress);
  const speed = useGameStore((state) => state.speed);
  const isMovingForward = useGameStore((state) => state.isMovingForward);
  const isMovingBackward = useGameStore((state) => state.isMovingBackward);
  const gameState = useGameStore((state) => state.gameState);

  useFrame(() => {
    if (!currentTrack || gameState === "IDLE" || gameState === "CHOOSING_PATH") {
      return;
    }

    // Update progress based on input
    let newProgress = progress;
    if (isMovingForward) {
      newProgress += speed;
    }
    if (isMovingBackward) {
      newProgress -= speed;
    }

    // Clamp progress between 0 and 1
    newProgress = Math.max(0, Math.min(1, newProgress));
    setProgress(newProgress);

    // Get position and tangent from curve
    const position = currentTrack.getPointAt(newProgress);
    const tangent = currentTrack.getTangentAt(newProgress).normalize();

    // Position the handcar
    if (meshRef.current) {
      meshRef.current.position.copy(position);

      // Rotate to face direction of curve
      const direction = tangent;
      meshRef.current.lookAt(
        position.x + direction.x,
        position.y + direction.y,
        position.z + direction.z
      );
    }

    // Check if we've reached the end - trigger path selection
    if (newProgress >= 0.99 && gameState === "RIDING") {
      useGameStore.setState({ gameState: "CHOOSING_PATH" });
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <boxGeometry args={[1, 1, 2]} />
      <meshPhongMaterial color="#ff0000" />
    </mesh>
  );
};
