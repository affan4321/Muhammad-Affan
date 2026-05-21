"use client";

import { useEffect } from "react";
import { useGameStore } from "@/store/gameStore";

export const CaveTrigger = ({ threshold = 1 }: { threshold?: number }) => {
  const currentTrack = useGameStore((s) => s.currentTrack);
  const progress = useGameStore((s) => s.progress);
  const gameState = useGameStore((s) => s.gameState);
  const setGameState = useGameStore((s) => s.setGameState);
  const incrementCompletedCaves = useGameStore((s) => s.incrementCompletedCaves);
  const availablePaths = useGameStore((s) => s.availablePaths);

  useEffect(() => {
    if (!currentTrack) return;

    if (gameState === "RIDING") {
      if (!availablePaths || availablePaths.length === 0) return;
      if (progress >= threshold) {
        incrementCompletedCaves();
        setGameState("CHOOSING_PATH");
      }
      return;
    }

    if (gameState === "CHOOSING_PATH" && progress < threshold) {
      setGameState("RIDING");
    }
  }, [
    progress,
    currentTrack,
    gameState,
    setGameState,
    threshold,
    availablePaths,
    incrementCompletedCaves,
  ]);

  return null;
};

export default CaveTrigger;
