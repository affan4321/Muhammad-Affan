"use client";

import { useEffect, useRef } from "react";
import { useGameStore } from "@/store/gameStore";
import { getForkChoices } from "@/lib/journey";

const END_THRESHOLD = 1;
const BACKTRACK_CLEAR = 0.82;

export const ChamberTrigger = () => {
  const currentTrack = useGameStore((s) => s.currentTrack);
  const segmentProgress = useGameStore((s) => s.segmentProgress);
  const gameState = useGameStore((s) => s.gameState);
  const trackContext = useGameStore((s) => s.trackContext);
  const mainSegmentIndex = useGameStore((s) => s.mainSegmentIndex);
  const journey = useGameStore((s) => s.journey);
  const setGameState = useGameStore((s) => s.setGameState);
  const setAvailablePaths = useGameStore((s) => s.setAvailablePaths);
  const forkTriggeredRef = useRef(false);

  useEffect(() => {
    if (!currentTrack) return;

    if (gameState === "RIDING" && segmentProgress < END_THRESHOLD) {
      forkTriggeredRef.current = false;
    }

    if (gameState !== "RIDING" || segmentProgress < END_THRESHOLD) {
      return;
    }

    if (forkTriggeredRef.current) return;
    forkTriggeredRef.current = true;

    if (trackContext === "branch") {
      setGameState("INSIDE_CHAMBER");
      return;
    }

    const segment = journey[mainSegmentIndex];
    if (!segment) return;

    const choices = getForkChoices(segment);
    if (choices.length === 0) return;

    setAvailablePaths(choices);
    setGameState("CHOOSING_PATH");
  }, [
    segmentProgress,
    currentTrack,
    gameState,
    trackContext,
    mainSegmentIndex,
    journey,
    setGameState,
    setAvailablePaths,
  ]);

  useEffect(() => {
    if (gameState === "CHOOSING_PATH" && segmentProgress < BACKTRACK_CLEAR) {
      setGameState("RIDING");
      setAvailablePaths([]);
      forkTriggeredRef.current = false;
    }
  }, [gameState, segmentProgress, setGameState, setAvailablePaths]);

  useEffect(() => {
    if (gameState === "INSIDE_CHAMBER" && segmentProgress < BACKTRACK_CLEAR) {
      setGameState("RIDING");
      forkTriggeredRef.current = false;
    }
  }, [gameState, segmentProgress, setGameState]);

  return null;
};

export default ChamberTrigger;
