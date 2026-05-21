"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Euler, Vector3, MathUtils } from "three";
import { useGameStore } from "@/store/gameStore";

/**
 * Camera controller that rides with the cart and responds to mouse movement
 * without requiring a click or drag gesture.
 */
export const CameraController = () => {
  const camera = useThree((state) => state.camera);
  const currentTrack = useGameStore((state) => state.currentTrack);
  const progress = useGameStore((state) => state.progress);
  const lastTrackPosition = useRef(new Vector3());
  const hasTrackPosition = useRef(false);
  const currentYaw = useRef(0);
  const currentPitch = useRef(0);
  const targetYaw = useRef(0);
  const targetPitch = useRef(0);
  const baseUp = useRef(new Vector3(0, 1, 0));

  useEffect(() => {
    hasTrackPosition.current = false;
  }, [currentTrack]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const sensitivity = 0.0025;

      targetYaw.current -= event.movementX * sensitivity;
      targetPitch.current = MathUtils.clamp(
        targetPitch.current - event.movementY * sensitivity,
        -0.5,
        0.5
      );
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useFrame(() => {
    if (!currentTrack) return;

    const trackPosition = currentTrack.getPointAt(progress);
    const trackTangent = currentTrack.getTangentAt(progress).normalize();
    const seatPosition = trackPosition
      .clone()
      .add(baseUp.current.clone().multiplyScalar(1.15))
      .add(trackTangent.clone().multiplyScalar(-2.8));

    if (!hasTrackPosition.current) {
      camera.position.copy(seatPosition);
      lastTrackPosition.current.copy(trackPosition);
      const initialYaw = Math.atan2(trackTangent.x, -trackTangent.z);

      currentYaw.current = initialYaw;
      targetYaw.current = initialYaw;
      currentPitch.current = 0;
      targetPitch.current = 0;
      hasTrackPosition.current = true;
    } else {
      const delta = trackPosition.clone().sub(lastTrackPosition.current);
      camera.position.add(delta);
      lastTrackPosition.current.copy(trackPosition);
    }

    currentYaw.current = MathUtils.lerp(currentYaw.current, targetYaw.current, 0.08);
    currentPitch.current = MathUtils.lerp(currentPitch.current, targetPitch.current, 0.08);

    camera.position.lerp(seatPosition, 0.12);
    camera.quaternion.setFromEuler(
      new Euler(currentPitch.current, currentYaw.current, 0, "YXZ")
    );
    camera.up.copy(baseUp.current);
  });

  return null;
};
