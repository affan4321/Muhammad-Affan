"use client";

import { useEffect, useRef } from "react";
import { createAmbient, createMusic } from "@/lib/audio";
import { useGameStore } from "@/store/gameStore";

export const AudioManager = ({
  ambientSrc = "/audio/ambient.mp3",
  musicSrc = "/audio/music.mp3",
}: {
  ambientSrc?: string;
  musicSrc?: string;
}) => {
  const ambientRef = useRef<any>(null);
  const musicRef = useRef<any>(null);
  const gameState = useGameStore((s) => s.gameState);

  useEffect(() => {
    ambientRef.current = createAmbient(ambientSrc);
    musicRef.current = createMusic(musicSrc);

    // Start ambient immediately
    try {
      ambientRef.current.play();
    } catch (e) {
      // ignore
    }

    return () => {
      ambientRef.current?.stop();
      musicRef.current?.stop();
    };
  }, [ambientSrc, musicSrc]);

  useEffect(() => {
    if (!musicRef.current) return;
    if (gameState === "RIDING") {
      musicRef.current.play();
    } else {
      musicRef.current.pause && musicRef.current.pause();
    }
  }, [gameState]);

  return null;
};

export default AudioManager;
