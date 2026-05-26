"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useGameStore } from "@/store/gameStore";
import { DEFAULT_USER_SETTINGS, loadUserSettings, saveUserSettings } from "@/lib/userSettings";
import { SetupScreen } from "./SetupScreen";

type BootstrapGateProps = {
  children: ReactNode;
};

export const BootstrapGate = ({ children }: BootstrapGateProps) => {
  const playerName = useGameStore((state) => state.playerName);
  const graphicsQuality = useGameStore((state) => state.graphicsQuality);
  const setPlayerName = useGameStore((state) => state.setPlayerName);
  const setGraphicsQuality = useGameStore((state) => state.setGraphicsQuality);
  const [isReady, setIsReady] = useState(false);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [initialName, setInitialName] = useState(DEFAULT_USER_SETTINGS.playerName);
  const [initialQuality, setInitialQuality] = useState(DEFAULT_USER_SETTINGS.graphicsQuality);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const savedSettings = loadUserSettings();

      if (savedSettings) {
        setInitialName(savedSettings.playerName);
        setInitialQuality(savedSettings.graphicsQuality);
        setPlayerName(savedSettings.playerName);
        setGraphicsQuality(savedSettings.graphicsQuality);
        setIsSetupComplete(savedSettings.setupComplete);
      }

      setIsReady(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [setGraphicsQuality, setPlayerName]);

  useEffect(() => {
    if (!isReady || !isSetupComplete) return;

    saveUserSettings({
      playerName,
      graphicsQuality,
      setupComplete: true,
    });
  }, [graphicsQuality, isReady, isSetupComplete, playerName]);

  const handleStart = (nextPlayerName: string, nextGraphicsQuality: typeof graphicsQuality) => {
    setPlayerName(nextPlayerName);
    setGraphicsQuality(nextGraphicsQuality);
    setIsSetupComplete(true);
    setIsReady(true);
    saveUserSettings({
      playerName: nextPlayerName,
      graphicsQuality: nextGraphicsQuality,
      setupComplete: true,
    });
  };

  if (!isReady) {
    return null;
  }

  if (!isSetupComplete) {
    return (
      <SetupScreen
        initialName={initialName}
        initialQuality={initialQuality}
        onStart={handleStart}
      />
    );
  }

  return <>{children}</>;
};

export default BootstrapGate;