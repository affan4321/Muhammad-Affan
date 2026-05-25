"use client";

import { GameCanvas } from "@/components";
import { DebugUI } from "@/components/DebugUI";
import { LoadingScreen } from "@/components/LoadingScreen";
import { PerformanceHUD } from "@/components/PerformanceHUD";
import { PathSelector } from "@/components/PathSelector";
import { IglooPanel } from "@/components/IglooPanel";

export default function Home() {
  return (
    <div style={{ width: "100%", height: "100vh", overflow: "hidden" }}>
      <GameCanvas />
      <LoadingScreen />
      <DebugUI />
      <PerformanceHUD />
      <PathSelector />
      <IglooPanel />
    </div>
  );
}
