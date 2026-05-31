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
  const setMasterVolume = useGameStore((s) => s.setMasterVolume);
  const setMusicVolume = useGameStore((s) => s.setMusicVolume);
  const setSfxVolume = useGameStore((s) => s.setSfxVolume);
  const setMuted = useGameStore((s) => s.setMuted);
  const [isReady, setIsReady] = useState(false);
  const [hasCompletedSetup, setHasCompletedSetup] = useState(false);
  const [initialName, setInitialName] = useState(DEFAULT_USER_SETTINGS.playerName);
  const [initialQuality, setInitialQuality] = useState(DEFAULT_USER_SETTINGS.graphicsQuality);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      console.log("BootstrapGate: Loading user settings");
      const savedSettings = loadUserSettings();

      if (savedSettings) {
        console.log("BootstrapGate: Found saved settings", savedSettings);
        setInitialName(savedSettings.playerName);
        setInitialQuality(savedSettings.graphicsQuality);
        setPlayerName(savedSettings.playerName);
        setGraphicsQuality(savedSettings.graphicsQuality);
        if (typeof savedSettings.masterVolume === "number") setMasterVolume(savedSettings.masterVolume);
        if (typeof savedSettings.musicVolume === "number") setMusicVolume(savedSettings.musicVolume);
        if (typeof savedSettings.sfxVolume === "number") setSfxVolume(savedSettings.sfxVolume);
        if (typeof savedSettings.isMuted === "boolean") setMuted(savedSettings.isMuted);
        setHasCompletedSetup(true);
        console.log("BootstrapGate: Setup already completed, skipping to game");
      } else {
        console.log("BootstrapGate: No saved settings found, showing setup screen");
      }

      setIsReady(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [setGraphicsQuality, setPlayerName, setMasterVolume, setMusicVolume, setSfxVolume, setMuted]);

  const handleStart = (nextPlayerName: string, nextGraphicsQuality: typeof graphicsQuality) => {
    console.log("BootstrapGate: handleStart called", { nextPlayerName, nextGraphicsQuality });
    setPlayerName(nextPlayerName);
    setGraphicsQuality(nextGraphicsQuality);
    setIsReady(true);
    setHasCompletedSetup(true);
    try {
      saveUserSettings({
        playerName: nextPlayerName,
        graphicsQuality: nextGraphicsQuality,
        masterVolume: 1,
        musicVolume: 0.8,
        sfxVolume: 0.9,
        isMuted: false,
      });
      console.log("BootstrapGate: Settings saved successfully");
    } catch (e) {
      console.error("BootstrapGate: Failed to save settings", e);
    }
  };

  if (!isReady) {
    return null;
  }

  if (!hasCompletedSetup) {
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