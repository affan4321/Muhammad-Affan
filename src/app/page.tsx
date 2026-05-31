"use client";

import { GameCanvas } from "@/components";
import { BootstrapGate } from "@/components/BootstrapGate";
import { DebugUI } from "@/components/DebugUI";
import { PathSelector } from "@/components/PathSelector";
import { ChamberPanel } from "@/components/ChamberPanel";
import { SettingsGear } from "@/components/SettingsGear";
import { SmartMapPanel } from "@/components/SmartMapPanel";
import { MobileControls } from "@/components/MobileControls";
import { useGameStore } from "@/store/gameStore";

export default function Home() {
  const isSceneLoading = useGameStore((state) => state.isSceneLoading);

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
    </div>
  );
}
