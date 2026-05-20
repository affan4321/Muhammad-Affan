"use client";

import { useEffect } from "react";
import { useGameStore } from "@/store/gameStore";

/**
 * Hook to handle keyboard and mouse input for handcar movement
 */
export const useHandcarInput = () => {
  const setMovementInput = useGameStore((state) => state.setMovementInput);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const forward = useGameStore.getState().isMovingForward;
      const backward = useGameStore.getState().isMovingBackward;

      switch (e.key.toLowerCase()) {
        case "arrowup":
          setMovementInput(true, backward);
          break;
        case "arrowdown":
          setMovementInput(forward, true);
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const forward = useGameStore.getState().isMovingForward;
      const backward = useGameStore.getState().isMovingBackward;

      switch (e.key.toLowerCase()) {
        case "arrowup":
          setMovementInput(false, backward);
          break;
        case "arrowdown":
          setMovementInput(forward, false);
          break;
        default:
          break;
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      const forward = useGameStore.getState().isMovingForward;
      const backward = useGameStore.getState().isMovingBackward;

      if (e.button === 0) {
        // Left click
        setMovementInput(true, backward);
      } else if (e.button === 2) {
        // Right click
        setMovementInput(forward, true);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      const forward = useGameStore.getState().isMovingForward;
      const backward = useGameStore.getState().isMovingBackward;

      if (e.button === 0) {
        setMovementInput(false, backward);
      } else if (e.button === 2) {
        setMovementInput(forward, false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    // Prevent context menu on right click
    window.addEventListener("contextmenu", (e) => e.preventDefault());

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("contextmenu", (e) => e.preventDefault());
    };
  }, [setMovementInput]);
};
