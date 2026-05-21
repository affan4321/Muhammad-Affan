"use client";

import { useGameStore } from "@/store/gameStore";

export const DebugUI = () => {
  const segmentProgress = useGameStore((state) => state.segmentProgress);
  const overallProgress = useGameStore((state) => state.overallProgress);
  const gameState = useGameStore((state) => state.gameState);
  const trackContext = useGameStore((state) => state.trackContext);
  const isMovingForward = useGameStore((state) => state.isMovingForward);
  const isMovingBackward = useGameStore((state) => state.isMovingBackward);
  const availablePaths = useGameStore((state) => state.availablePaths);
  const setSegmentProgress = useGameStore((state) => state.setSegmentProgress);
  const currentTrack = useGameStore((state) => state.currentTrack);
  const speed = useGameStore((state) => state.speed);
  const mainSegmentIndex = useGameStore((state) => state.mainSegmentIndex);
  const completedCaves = useGameStore((state) => state.completedCaves);
  const totalCaves = useGameStore((state) => state.totalCaves);
  const activeBranch = useGameStore((state) => state.activeBranch);

  const handleTestMove = () => {
    if (gameState === "RIDING" && currentTrack) {
      setSegmentProgress(segmentProgress + speed * 10);
    }
  };

  const segmentLabel =
    trackContext === "branch"
      ? `Branch: ${activeBranch?.label ?? "?"}`
      : `Main segment ${mainSegmentIndex + 1}/${totalCaves}`;

  return (
    <div
      style={{
        position: "fixed",
        top: 10,
        left: 10,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        color: "#0f0",
        fontFamily: "monospace",
        padding: "10px",
        fontSize: "12px",
        zIndex: 100,
        borderRadius: "4px",
        maxWidth: "320px",
      }}
    >
      <div>
        <strong>DEBUG INFO</strong>
      </div>
      <div>State: {gameState}</div>
      <div>Track: {trackContext}</div>
      <div>{segmentLabel}</div>
      <div>Segment: {(segmentProgress * 100).toFixed(1)}%</div>
      <div>Overall: {(overallProgress * 100).toFixed(1)}%</div>
      <div>
        Caves: {completedCaves}/{totalCaves}
      </div>
      <div>Forward: {isMovingForward ? "✓" : "✗"}</div>
      <div>Backward: {isMovingBackward ? "✓" : "✗"}</div>
      {availablePaths.length > 0 && (
        <div style={{ marginTop: "10px" }}>
          <strong>Fork options:</strong>
          {availablePaths.map((path) => (
            <div key={path.id}>
              - {path.label} ({path.kind})
            </div>
          ))}
        </div>
      )}
      <div style={{ marginTop: "10px", fontSize: "11px" }}>
        <strong>Controls:</strong>
        <div>↑ / Left Click: Forward</div>
        <div>↓ / Right Click: Backward</div>
        <div>Mouse: Look around</div>
        <div>Enter: Select / Igloo exit</div>
        <button
          type="button"
          onClick={handleTestMove}
          style={{
            marginTop: "5px",
            padding: "5px 10px",
            backgroundColor: "#0f0",
            color: "#000",
            border: "none",
            borderRadius: "3px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "11px",
          }}
        >
          Test Move →
        </button>
      </div>
    </div>
  );
};
