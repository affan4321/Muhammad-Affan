"use client";

import { useEffect } from "react";
import { GameCanvas } from "@/components";
import { BootstrapGate } from "@/components/BootstrapGate";
import { DebugUI } from "@/components/DebugUI";
import { PathSelector } from "@/components/PathSelector";
import { ChamberPanel } from "@/components/ChamberPanel";
import { SettingsGear } from "@/components/SettingsGear";
import { SmartMapPanel } from "@/components/SmartMapPanel";
import { MobileControls } from "@/components/MobileControls";
import { PortraitModeOverlay } from "@/components/PortraitModeOverlay";
import { useGameStore } from "@/store/gameStore";

export default function Home() {
  const isSceneLoading = useGameStore((state) => state.isSceneLoading);
  const gameState = useGameStore((state) => state.gameState);

  useEffect(() => {
    console.log("Home: Component mounted, isSceneLoading =", isSceneLoading);
  }, [isSceneLoading]);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("Home: Global error caught:", event.error);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("Home: Unhandled promise rejection:", event.reason);
    };

    const handleBeforeUnload = () => {
      console.log("Home: Page is about to unload/reload");
    };

    const handleVisibilityChange = () => {
      console.log("Home: Visibility changed to", document.visibilityState);
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <div style={{ width: "100%", height: "100vh", overflow: "hidden" }} suppressHydrationWarning>
      <BootstrapGate>
        <GameCanvas />
        {!isSceneLoading && (
          <>
            <DebugUI />
            <SettingsGear />
            <PathSelector />
            <ChamberPanel />
            <SmartMapPanel />
            <MobileControls />
          </>
        )}
      </BootstrapGate>
      <PortraitModeOverlay />
    </div>
  );
}
