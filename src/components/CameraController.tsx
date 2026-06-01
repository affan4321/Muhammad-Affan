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
  const canvasElement = useThree((state) => state.gl.domElement);
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
  const isIOSRef = useRef(false);
  const lastTouchX = useRef(0);
  const lastTouchY = useRef(0);
  const isTouchingRef = useRef(false);
  const hasTriggeredUiHideRef = useRef(false);

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
    const checkIOS = () => {
      isIOSRef.current = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    };
    checkMobile();
    checkIOS();
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

    // Pointer-based camera rotation for mobile (drag to rotate)
    let activePointerId: number | null = null;

    const shouldIgnorePointer = (event: PointerEvent) => {
      if (!isMobileRef.current) return true;
      if (event.pointerType !== "touch") return true;
      if (isUiTarget(event.target)) return true;

      // Exclude the bottom-right area where mobile controls are
      if (event.clientX > window.innerWidth - 140 && event.clientY > window.innerHeight - 180) {
        return true;
      }

      return false;
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (useGameStore.getState().isDebugCameraLocked) return;
      if (shouldIgnorePointer(event)) return;

      if (isIOSRef.current && !hasTriggeredUiHideRef.current) {
        hasTriggeredUiHideRef.current = true;
        // Temporarily allow a tiny scroll to encourage Safari UI collapse.
        const prevBodyOverflow = document.body.style.overflow;
        const prevHtmlOverflow = document.documentElement.style.overflow;
        const prevBodyHeight = document.body.style.height;
        document.body.style.overflow = "auto";
        document.documentElement.style.overflow = "auto";
        document.body.style.height = "calc(100% + 1px)";
        window.scrollTo(0, 1);
        window.setTimeout(() => {
          document.body.style.overflow = prevBodyOverflow;
          document.documentElement.style.overflow = prevHtmlOverflow;
          document.body.style.height = prevBodyHeight;
        }, 250);
      }

      activePointerId = event.pointerId;
      isTouchingRef.current = true;
      lastTouchX.current = event.clientX;
      lastTouchY.current = event.clientY;
      if (canvasElement && canvasElement.setPointerCapture) {
        canvasElement.setPointerCapture(event.pointerId);
      }
      event.preventDefault();
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (useGameStore.getState().isDebugCameraLocked || !isTouchingRef.current) return;
      if (activePointerId !== event.pointerId) return;

      const deltaX = event.clientX - lastTouchX.current;
      const deltaY = event.clientY - lastTouchY.current;

      // Higher sensitivity for continuous swipe rotation on mobile
      const sensitivity = 0.01;

      targetYaw.current -= deltaX * sensitivity;
      targetPitch.current -= deltaY * sensitivity;

      lastTouchX.current = event.clientX;
      lastTouchY.current = event.clientY;
      event.preventDefault();
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (activePointerId !== event.pointerId) return;
      activePointerId = null;
      isTouchingRef.current = false;
    };

    const handlePointerCancel = (event: PointerEvent) => {
      if (activePointerId !== event.pointerId) return;
      activePointerId = null;
      isTouchingRef.current = false;
    };

    if (canvasElement) {
      canvasElement.style.touchAction = "none";
      canvasElement.style.webkitUserSelect = "none";
      canvasElement.style.userSelect = "none";
      canvasElement.addEventListener("pointerdown", handlePointerDown, { passive: false });
      canvasElement.addEventListener("pointermove", handlePointerMove, { passive: false });
      canvasElement.addEventListener("pointerup", handlePointerUp);
      canvasElement.addEventListener("pointercancel", handlePointerCancel);
    }
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      if (canvasElement) {
        canvasElement.removeEventListener("pointerdown", handlePointerDown);
        canvasElement.removeEventListener("pointermove", handlePointerMove);
        canvasElement.removeEventListener("pointerup", handlePointerUp);
        canvasElement.removeEventListener("pointercancel", handlePointerCancel);
      }
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [canvasElement]);

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
    const lerpSmooth = isMobileRef.current
      ? (isTouchingRef.current ? 0.25 : 0.18)
      : 0.08;
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
