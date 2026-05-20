"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Vector3 } from "three";
import { useGameStore } from "@/store/gameStore";

/**
 * Camera controller that rides with the handcar but lets the user look around freely.
 */
export const CameraController = () => {
  const camera = useThree((state) => state.camera);
  const currentTrack = useGameStore((state) => state.currentTrack);
  const progress = useGameStore((state) => state.progress);
  const controlsRef = useRef<any>(null);
  const lastTarget = useRef(new Vector3());
  const hasTarget = useRef(false);

  useEffect(() => {
    hasTarget.current = false;
  }, [currentTrack]);

  useFrame(() => {
    if (!currentTrack || !controlsRef.current) return;

    const target = currentTrack.getPointAt(progress).clone().add(new Vector3(0, 1.1, 0));

    if (!hasTarget.current) {
      controlsRef.current.target.copy(target);
      camera.position.copy(target).add(new Vector3(0, 0.4, -3.2));
      lastTarget.current.copy(target);
      hasTarget.current = true;
    } else {
      const delta = target.clone().sub(lastTarget.current);
      camera.position.add(delta);
      controlsRef.current.target.add(delta);
      lastTarget.current.copy(target);
    }

    controlsRef.current.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enablePan={false}
      enableZoom={false}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.35}
      minPolarAngle={0.2}
      maxPolarAngle={Math.PI - 0.2}
    />
  );
};
