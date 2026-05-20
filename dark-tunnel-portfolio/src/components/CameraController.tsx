"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { useGameStore } from "@/store/gameStore";

/**
 * Camera controller that follows the handcar along the curve
 * Uses smooth interpolation for natural movement
 */
export const CameraController = () => {
  const camera = useThree((state) => state.camera);
  const currentTrack = useGameStore((state) => state.currentTrack);
  const progress = useGameStore((state) => state.progress);

  useEffect(() => {
    if (!currentTrack) return;

    // Get current position and look-ahead position
    const currentPos = currentTrack.getPointAt(progress);
    const lookAheadDistance = 0.08;
    const lookAheadPos = currentTrack.getPointAt(
      Math.min(1, progress + lookAheadDistance)
    );

    // Smoothly update camera position
    camera.position.lerp(
      currentPos.clone().add({ x: 0, y: 0.5, z: -3 } as any),
      0.15
    );

    // Look at the point ahead
    camera.lookAt(lookAheadPos);
  }, [progress, currentTrack, camera]);

  return null;
};
