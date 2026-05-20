"use client";

import { useEffect } from "react";
import { useGameStore } from "@/store/gameStore";
import { Vector3 } from "three";

export const CaveTrigger = ({ threshold = 3 }: { threshold?: number }) => {
  const currentTrack = useGameStore((s) => s.currentTrack);
  const currentPosition = useGameStore((s) => s.currentPosition);
  const gameState = useGameStore((s) => s.gameState);
  const setGameState = useGameStore((s) => s.setGameState);

  useEffect(() => {
    if (!currentTrack) return;

    const endPoint = currentTrack.getPointAt(1);

    const dist = currentPosition ? currentPosition.distanceTo(endPoint) : Infinity;
    if (dist <= threshold && gameState === "RIDING") {
      setGameState("CHOOSING_PATH");
    }
  }, [currentPosition, currentTrack, gameState, setGameState, threshold]);

  return null;
};

export default CaveTrigger;
