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
  const segmentProgress = useGameStore((state) => state.segmentProgress);
  const isDebugCameraLocked = useGameStore((state) => state.isDebugCameraLocked);
  const setDebugCameraLocked = useGameStore((state) => state.setDebugCameraLocked);
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
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.key.toLowerCase() !== "l") return;

      const nextLocked = !useGameStore.getState().isDebugCameraLocked;
      setDebugCameraLocked(nextLocked);
      hasTrackPosition.current = false;

      console.info(nextLocked ? "Camera locked" : "Camera free to move");
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [setDebugCameraLocked]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (useGameStore.getState().isDebugCameraLocked) return;

      const sensitivity = 0.0035;

      targetYaw.current -= event.movementX * sensitivity;
      targetPitch.current -= event.movementY * sensitivity;
    };

    // Touch-based camera rotation for mobile (swipe to rotate)
    let lastTouchX = 0;
    let lastTouchY = 0;
    let isTouching = false;

    const handleTouchStart = (event: TouchEvent) => {
      if (useGameStore.getState().isDebugCameraLocked) return;
      isTouching = true;
      lastTouchX = event.touches[0].clientX;
      lastTouchY = event.touches[0].clientY;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (useGameStore.getState().isDebugCameraLocked || !isTouching) return;
      const touch = event.touches[0];
      const deltaX = touch.clientX - lastTouchX;
      const deltaY = touch.clientY - lastTouchY;

      const sensitivity = 0.005;

      targetYaw.current -= deltaX * sensitivity;
      targetPitch.current -= deltaY * sensitivity;

      lastTouchX = touch.clientX;
      lastTouchY = touch.clientY;
    };

    const handleTouchEnd = () => {
      isTouching = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  useFrame(() => {
    if (!currentTrack) return;

    if (isDebugCameraLocked) {
      camera.up.copy(baseUp.current);
      return;
    }

    const trackPosition = currentTrack.getPointAt(segmentProgress);
    const trackTangent = currentTrack.getTangentAt(segmentProgress).normalize();
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

    camera.position.lerp(seatPosition, 0.12);

    currentYaw.current = MathUtils.lerp(currentYaw.current, targetYaw.current, 0.08);
    currentPitch.current = MathUtils.lerp(currentPitch.current, targetPitch.current, 0.08);
    camera.quaternion.setFromEuler(
      new Euler(currentPitch.current, currentYaw.current, 0, "YXZ")
    );
    camera.up.copy(baseUp.current);
  });

  return null;
};
