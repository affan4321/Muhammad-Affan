"use client";

import { useCallback, useEffect, useRef } from "react";
import { MathUtils } from "three";
import { useGameStore } from "@/store/gameStore";
import { CART_RIG } from "@/lib/cartRig";

const isLookLocked = (gameState: string, isMapOpen: boolean) =>
  gameState === "CHOOSING_PATH" || isMapOpen;

/**
 * Mouse-look offsets relative to the cart heading (does not move the cart on the track).
 * Locked and reset to forward while CHOOSING_PATH.
 */
export const useCartMouseLook = () => {
  const gameState = useGameStore((state) => state.gameState);
  const currentTrack = useGameStore((state) => state.currentTrack);
  const isMapOpen = useGameStore((state) => Boolean(state.openMapBoardId));
  const targetYaw = useRef(0);
  const targetPitch = useRef(0);
  const currentYaw = useRef(0);
  const currentPitch = useRef(0);
  const lastMousePointer = useRef<{ x: number; y: number } | null>(null);
  const lastTouchPointer = useRef<{ x: number; y: number } | null>(null);
  const lastMoveAt = useRef(0);

  const resetLook = useCallback(() => {
    targetYaw.current = 0;
    targetPitch.current = 0;
    currentYaw.current = 0;
    currentPitch.current = 0;
    lastMousePointer.current = null;
    lastTouchPointer.current = null;
    lastMoveAt.current = performance.now();
  }, []);

  useEffect(() => {
    if (isLookLocked(gameState, isMapOpen)) {
      resetLook();
    }
  }, [gameState, isMapOpen, resetLook]);

  useEffect(() => {
    lastMoveAt.current = performance.now();
  }, []);

  useEffect(() => {
    resetLook();
  }, [currentTrack, resetLook]);

  useEffect(() => {
    const isUiTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      return Boolean(
        target.closest("button, a, input, textarea, select, [role='button']")
      );
    };

    const isMobile =
      window.innerWidth <= 768 ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    let activeTouchId: number | null = null;

    const getActiveTouch = (touches: TouchList) => {
      if (touches.length === 0) return null;
      if (activeTouchId === null) return touches[0];
      for (let i = 0; i < touches.length; i += 1) {
        if (touches[i]?.identifier === activeTouchId) return touches[i];
      }
      return null;
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (useGameStore.getState().gameState === "IDLE") return;
      if (isLookLocked(useGameStore.getState().gameState, Boolean(useGameStore.getState().openMapBoardId))) return;
      if (isUiTarget(event.target)) return;

      // Ignore synthetic mouse events generated from touch input.
      const sourceCapabilities = (event as any).sourceCapabilities;
      if (sourceCapabilities?.firesTouchEvents) return;

      const { sensitivity, pitchMin, pitchMax } = CART_RIG.mouseLook;

      let dx = 0;
      let dy = 0;

      if (event.movementX !== 0 || event.movementY !== 0) {
        dx = event.movementX;
        dy = event.movementY;
      } else if (lastMousePointer.current) {
        dx = event.clientX - lastMousePointer.current.x;
        dy = event.clientY - lastMousePointer.current.y;
      }

      lastMousePointer.current = { x: event.clientX, y: event.clientY };

      if (dx === 0 && dy === 0) return;

      lastMoveAt.current = performance.now();
      targetYaw.current -= dx * sensitivity;
      targetPitch.current = MathUtils.clamp(
        targetPitch.current - dy * sensitivity,
        pitchMin,
        pitchMax
      );
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (!isMobile) return;
      if (useGameStore.getState().gameState === "IDLE") return;
      if (isLookLocked(useGameStore.getState().gameState, Boolean(useGameStore.getState().openMapBoardId))) return;

      // Find a touch that's not on a UI element
      for (let i = 0; i < event.touches.length; i++) {
        const touch = event.touches[i];
        if (!touch) continue;
        if (!isUiTarget(touch.target as EventTarget)) {
          activeTouchId = touch.identifier;
          lastTouchPointer.current = { x: touch.clientX, y: touch.clientY };
          lastMoveAt.current = performance.now();
          return;
        }
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!isMobile) return;
      if (activeTouchId === null) return;
      if (useGameStore.getState().gameState === "IDLE") return;
      if (isLookLocked(useGameStore.getState().gameState, Boolean(useGameStore.getState().openMapBoardId))) return;

      const touch = getActiveTouch(event.touches);
      const last = lastTouchPointer.current;
      if (!touch || !last) return;

      const dx = touch.clientX - last.x;
      const dy = touch.clientY - last.y;
      if (dx === 0 && dy === 0) return;

      const { sensitivity, pitchMin, pitchMax } = CART_RIG.mouseLook;
      const touchSensitivity = sensitivity * 3.6;

      lastTouchPointer.current = { x: touch.clientX, y: touch.clientY };
      lastMoveAt.current = performance.now();
      targetYaw.current -= dx * touchSensitivity;
      targetPitch.current = MathUtils.clamp(
        targetPitch.current - dy * touchSensitivity,
        pitchMin,
        pitchMax
      );

      event.preventDefault();
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (!isMobile) return;
      if (activeTouchId === null) return;

      for (let i = 0; i < event.changedTouches.length; i += 1) {
        const touch = event.changedTouches[i];
        if (touch?.identifier === activeTouchId) {
          activeTouchId = null;
          lastTouchPointer.current = null;
          return;
        }
      }
    };

    const handleTouchCancel = () => {
      if (!isMobile) return;
      activeTouchId = null;
      lastTouchPointer.current = null;
    };

    const clearPointer = () => {
      lastMousePointer.current = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", clearPointer);
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("touchcancel", handleTouchCancel);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", clearPointer);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchCancel);
    };
  }, []);

  const getSmoothedLook = () => {
    const state = useGameStore.getState().gameState;
    const { smooth, resetSmooth } = CART_RIG.mouseLook;

    if (isLookLocked(state, Boolean(useGameStore.getState().openMapBoardId))) {
      targetYaw.current = 0;
      targetPitch.current = 0;
      currentYaw.current = MathUtils.lerp(currentYaw.current, 0, resetSmooth);
      currentPitch.current = MathUtils.lerp(currentPitch.current, 0, resetSmooth);
      return { yaw: currentYaw.current, pitch: currentPitch.current };
    }

    const { idleMs, idleRecenterSmooth } = CART_RIG.mouseLook;
    if (performance.now() - lastMoveAt.current > idleMs) {
      targetYaw.current = MathUtils.lerp(targetYaw.current, 0, idleRecenterSmooth);
      targetPitch.current = MathUtils.lerp(targetPitch.current, 0, idleRecenterSmooth);
    }

    currentYaw.current = MathUtils.lerp(currentYaw.current, targetYaw.current, smooth);
    currentPitch.current = MathUtils.lerp(
      currentPitch.current,
      targetPitch.current,
      smooth
    );
    return { yaw: currentYaw.current, pitch: currentPitch.current };
  };

  return { getSmoothedLook, resetLook, isLocked: isLookLocked(gameState, isMapOpen) };
};
