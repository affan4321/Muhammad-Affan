"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Euler, Vector3, MathUtils } from "three";
import { useGameStore } from "@/store/gameStore";

/**
 * Camera controller that rides with the cart and responds to mouse movement
 * without requiring a click or drag gesture.
 * 
 * Mobile: Touch-based camera movement (drag to look around)
 * Desktop: Mouse-based camera movement
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
  
  // Mobile-specific refs
  const isMobileRef = useRef(false);
  const lastTouchX = useRef(0);
  const lastTouchY = useRef(0);
  const isTouchingRef = useRef(false);

  useEffect(() => {
    hasTrackPosition.current = false;
  }, [currentTrack]);

  useEffect(() => {
    // Detect if device is mobile
    const checkMobile = () => {
      isMobileRef.current = 
        window.innerWidth <= 768 || 
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
    const isUiTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      return Boolean(
        target.closest("button, a, input, textarea, select, [role='button']")
      );
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (useGameStore.getState().isDebugCameraLocked) return;
      // Skip mouse handling on mobile - use touch instead
      if (isMobileRef.current && !isTouchingRef.current) return;
      if (isUiTarget(event.target)) return;

      const sensitivity = 0.0035;
      targetYaw.current -= event.movementX * sensitivity;
      targetPitch.current -= event.movementY * sensitivity;
    };

    // Touch-based camera rotation for mobile (swipe to rotate)
    const handleTouchStart = (event: TouchEvent) => {
      if (useGameStore.getState().isDebugCameraLocked) return;
      if (!isMobileRef.current) return;
      if (event.target instanceof HTMLElement && 
          event.target.closest("button, a, input, textarea, select, [role='button']")) {
        return;
      }
      
      // Exclude the bottom-right area where mobile controls are
      if (event.touches[0].clientX > window.innerWidth - 150 && 
          event.touches[0].clientY > window.innerHeight - 200) {
        return;
      }

      isTouchingRef.current = true;
      lastTouchX.current = event.touches[0].clientX;
      lastTouchY.current = event.touches[0].clientY;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (useGameStore.getState().isDebugCameraLocked || !isTouchingRef.current) return;
      
      const touch = event.touches[0];
      const deltaX = touch.clientX - lastTouchX.current;
      const deltaY = touch.clientY - lastTouchY.current;

      // Mobile-optimized sensitivity for smooth camera movement
      const sensitivity = 0.005;

      targetYaw.current -= deltaX * sensitivity;
      targetPitch.current -= deltaY * sensitivity;

      lastTouchX.current = touch.clientX;
      lastTouchY.current = touch.clientY;

      // Prevent default scrolling/pinch behavior
      event.preventDefault?.();
    };

    const handleTouchEnd = (event: TouchEvent) => {
      // Maintain momentum-like effect by NOT resetting immediately
      isTouchingRef.current = false;
    };

    const handleTouchCancel = () => {
      isTouchingRef.current = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("touchcancel", handleTouchCancel, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchCancel);
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

    // Faster response for touch input on mobile
    const lerpSmooth = isMobileRef.current && isTouchingRef.current ? 0.15 : 0.08;
    currentYaw.current = MathUtils.lerp(currentYaw.current, targetYaw.current, lerpSmooth);
    currentPitch.current = MathUtils.lerp(currentPitch.current, targetPitch.current, lerpSmooth);
    
    // Clamp pitch to prevent over-rotation
    currentPitch.current = MathUtils.clamp(currentPitch.current, -1.15, 0.5);
    targetPitch.current = MathUtils.clamp(targetPitch.current, -1.15, 0.5);
    
    camera.quaternion.setFromEuler(
      new Euler(currentPitch.current, currentYaw.current, 0, "YXZ")
    );
    camera.up.copy(baseUp.current);
  });

  return null;
};
