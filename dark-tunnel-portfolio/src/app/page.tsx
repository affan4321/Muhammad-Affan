"use client";

import { GameCanvas } from "@/components";
import { DebugUI } from "@/components/DebugUI";
import { HelpOverlay } from "@/components/HelpOverlay";
import { PathSelector } from "@/components/PathSelector";
import { ChamberPanel } from "@/components/ChamberPanel";
import { useGameStore } from "@/store/gameStore";

export default function Home() {
  const isSceneLoading = useGameStore((state) => state.isSceneLoading);

  return (
    <div style={{ width: "100%", height: "100vh", overflow: "hidden" }} suppressHydrationWarning>
      <GameCanvas />
      {!isSceneLoading && (
        <>
          <DebugUI />
          <HelpOverlay />
          <PathSelector />
          <ChamberPanel />
        </>
      )}
    </div>
  );
}
