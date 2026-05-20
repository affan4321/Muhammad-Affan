"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGameStore } from "@/store/gameStore";
import * as THREE from "three";
import CartModel from "./models/CartModel";

/**
 * Handcar component - renders the cart model that moves along the track
 */
export const Handcar = () => {
  const groupRef = useRef<THREE.Group>(null!);
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

    // Position the handcar group
    if (groupRef.current) {
      groupRef.current.position.copy(position);

      // Rotate to face direction of curve
      const direction = tangent;
      groupRef.current.lookAt(
        position.x + direction.x,
        position.y + direction.y,
        position.z + direction.z
      );
    }

    // Publish current position to the global store for triggers
    useGameStore.setState({ currentPosition: position.clone() });

    // Check if we've reached the end - trigger path selection
    if (newProgress >= 0.99 && gameState === "RIDING") {
      useGameStore.setState({ gameState: "CHOOSING_PATH" });
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <CartModel scale={0.5} />
    </group>
  );
};
