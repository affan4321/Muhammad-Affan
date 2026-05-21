"use client";

import { useCallback, useEffect, useRef } from "react";
import { MathUtils } from "three";
import { useGameStore } from "@/store/gameStore";
import { CART_RIG } from "@/lib/cartRig";

const isLookLocked = (gameState: string) => gameState === "CHOOSING_PATH";

/**
 * Mouse-look offsets relative to the cart heading (does not move the cart on the track).
 * Locked and reset to forward while CHOOSING_PATH.
 */
export const useCartMouseLook = () => {
  const gameState = useGameStore((state) => state.gameState);
  const currentTrack = useGameStore((state) => state.currentTrack);
  const targetYaw = useRef(0);
  const targetPitch = useRef(0);
  const currentYaw = useRef(0);
  const currentPitch = useRef(0);
  const lastPointer = useRef<{ x: number; y: number } | null>(null);
  const lastMoveAt = useRef(performance.now());

  const resetLook = useCallback(() => {
    targetYaw.current = 0;
    targetPitch.current = 0;
    currentYaw.current = 0;
    currentPitch.current = 0;
    lastPointer.current = null;
    lastMoveAt.current = performance.now();
  }, []);

  useEffect(() => {
    if (isLookLocked(gameState)) {
      targetYaw.current = 0;
      targetPitch.current = 0;
      lastPointer.current = null;
    }
  }, [gameState]);

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

    const handleMouseMove = (event: MouseEvent) => {
      if (useGameStore.getState().gameState === "IDLE") return;
      if (isLookLocked(useGameStore.getState().gameState)) return;
      if (isUiTarget(event.target)) return;

      const { sensitivity, pitchMin, pitchMax } = CART_RIG.mouseLook;

      let dx = 0;
      let dy = 0;

      if (event.movementX !== 0 || event.movementY !== 0) {
        dx = event.movementX;
        dy = event.movementY;
      } else if (lastPointer.current) {
        dx = event.clientX - lastPointer.current.x;
        dy = event.clientY - lastPointer.current.y;
      }

      lastPointer.current = { x: event.clientX, y: event.clientY };

      if (dx === 0 && dy === 0) return;

      lastMoveAt.current = performance.now();
      targetYaw.current -= dx * sensitivity;
      targetPitch.current = MathUtils.clamp(
        targetPitch.current - dy * sensitivity,
        pitchMin,
        pitchMax
      );
    };

    const clearPointer = () => {
      lastPointer.current = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", clearPointer);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", clearPointer);
    };
  }, []);

  const getSmoothedLook = () => {
    const state = useGameStore.getState().gameState;
    const { smooth, resetSmooth } = CART_RIG.mouseLook;

    if (isLookLocked(state)) {
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

  return { getSmoothedLook, resetLook, isLocked: isLookLocked(gameState) };
};
