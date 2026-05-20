"use client";

import { useGameStore } from "@/store/gameStore";

/**
 * Debug UI component to display game state and progress
 * Will be removed in later phases
 */
export const DebugUI = () => {
  const progress = useGameStore((state) => state.progress);
  const gameState = useGameStore((state) => state.gameState);
  const isMovingForward = useGameStore((state) => state.isMovingForward);
  const isMovingBackward = useGameStore((state) => state.isMovingBackward);
  const availablePaths = useGameStore((state) => state.availablePaths);
  const setProgress = useGameStore((state) => state.setProgress);
  const currentTrack = useGameStore((state) => state.currentTrack);
  const setGameState = useGameStore((state) => state.setGameState);
  const speed = useGameStore((state) => state.speed);

  const handleTestMove = () => {
    if (gameState === "RIDING" && currentTrack) {
      setProgress(progress + speed * 10);
    }
  };

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
        maxWidth: "300px",
      }}
    >
      <div>
        <strong>DEBUG INFO</strong>
      </div>
      <div>State: {gameState}</div>
      <div>Progress: {(progress * 100).toFixed(1)}%</div>
      <div>Forward: {isMovingForward ? "✓" : "✗"}</div>
      <div>Backward: {isMovingBackward ? "✓" : "✗"}</div>
      <div>Available Paths: {availablePaths.length}</div>
      {availablePaths.length > 0 && (
        <div style={{ marginTop: "10px" }}>
          <strong>Path Options:</strong>
          {availablePaths.map((path) => (
            <div key={path.id}>- {path.label}</div>
          ))}
        </div>
      )}
      <div style={{ marginTop: "10px", fontSize: "11px" }}>
        <strong>Controls:</strong>
        <div>↑ / Left Click: Forward</div>
        <div>↓ / Right Click: Backward</div>
        <div>Enter: Select Path</div>
        <button
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
