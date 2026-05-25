"use client";

import { GameCanvas } from "@/components";
import { DebugUI } from "@/components/DebugUI";
import { PerformanceHUD } from "@/components/PerformanceHUD";
import { PathSelector } from "@/components/PathSelector";
import { IglooPanel } from "@/components/IglooPanel";
import { useGameStore } from "@/store/gameStore";

export default function Home() {
  const isSceneLoading = useGameStore((state) => state.isSceneLoading);

  return (
    <div style={{ width: "100%", height: "100vh", overflow: "hidden" }}>
      <GameCanvas />
      {!isSceneLoading && (
        <>
          <DebugUI />
          <PerformanceHUD />
          <PathSelector />
          <IglooPanel />
        </>
      )}
    </div>
  );
}
