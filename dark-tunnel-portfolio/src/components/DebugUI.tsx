"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/store/gameStore";

export const DebugUI = () => {
  const segmentProgress = useGameStore((state) => state.segmentProgress);
  const overallProgress = useGameStore((state) => state.overallProgress);
  const gameState = useGameStore((state) => state.gameState);
  const trackContext = useGameStore((state) => state.trackContext);
  const mainSegmentIndex = useGameStore((state) => state.mainSegmentIndex);
  const totalChambers = useGameStore((state) => state.totalChambers);
  const activeBranch = useGameStore((state) => state.activeBranch);
  const [fps, setFps] = useState(0);

  useEffect(() => {
    let frameId = 0;
    let lastTime = performance.now();
    let frames = 0;
    let accumulator = 0;

    const tick = (now: number) => {
      const delta = now - lastTime;
      lastTime = now;
      frames += 1;
      accumulator += delta;

      if (accumulator >= 500) {
        const fpsValue = (frames * 1000) / accumulator;
        setFps(fpsValue);
        frames = 0;
        accumulator = 0;
      }

      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  const segmentLabel =
    trackContext === "branch"
      ? activeBranch?.label ?? "Unknown Branch"
      : `Segment ${mainSegmentIndex + 1}`;

  return (
    <div
      style={{
        position: "fixed",
        top: 10,
        left: 10,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        color: "#fff",
        fontFamily: "system-ui, -apple-system, sans-serif",
        padding: "12px 16px",
        fontSize: "13px",
        zIndex: 100,
        borderRadius: "8px",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ fontWeight: 600, fontSize: "14px" }}>{segmentLabel}</div>
        <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "rgba(255, 255, 255, 0.8)" }}>
          <span>Progress: {(segmentProgress * 100).toFixed(0)}%</span>
          <span>Overall: {(overallProgress * 100).toFixed(0)}%</span>
          <span>FPS: {fps.toFixed(0)}</span>
        </div>
      </div>
    </div>
  );
};
