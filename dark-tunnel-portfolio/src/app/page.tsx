"use client";

import { GameCanvas } from "@/components";
import { DebugUI } from "@/components/DebugUI";
import { PathSelector } from "@/components/PathSelector";

export default function Home() {
  return (
    <div style={{ width: "100%", height: "100vh", overflow: "hidden" }}>
      <GameCanvas />
      <DebugUI />
      <PathSelector />
    </div>
  );
}
