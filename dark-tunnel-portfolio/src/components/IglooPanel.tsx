"use client";

import { useEffect } from "react";
import { useGameStore } from "@/store/gameStore";

/**
 * Information igloo — end of a branch path; return to main track afterward.
 */
export const IglooPanel = () => {
  const gameState = useGameStore((s) => s.gameState);
  const activeBranch = useGameStore((s) => s.activeBranch);
  const completeIgloo = useGameStore((s) => s.completeIgloo);
  const overallProgress = useGameStore((s) => s.overallProgress);
  const completedCaves = useGameStore((s) => s.completedCaves);
  const totalCaves = useGameStore((s) => s.totalCaves);

  useEffect(() => {
    if (gameState !== "INSIDE_CAVE") return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === "Escape") {
        e.preventDefault();
        completeIgloo();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [gameState, completeIgloo]);

  if (gameState !== "INSIDE_CAVE") {
    return null;
  }

  const title = activeBranch?.label ?? "Information Igloo";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        zIndex: 60,
        pointerEvents: "auto",
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(5, 12, 8, 0.95)",
          border: "2px solid #00ffd5",
          borderRadius: "12px",
          padding: "40px 48px",
          maxWidth: "520px",
          textAlign: "center",
        }}
      >
        <p style={{ color: "#00ffd5", margin: "0 0 8px 0", fontSize: "12px", letterSpacing: "0.15em" }}>
          INFORMATION IGLOO
        </p>
        <h2 style={{ color: "#fff", margin: "0 0 16px 0" }}>{title}</h2>
        <p style={{ color: "#aaa", margin: "0 0 24px 0", lineHeight: 1.5 }}>
          Explore project details here. When you are done, return to the main tunnel to continue your journey.
        </p>
        <p style={{ color: "#666", margin: "0 0 24px 0", fontSize: "13px" }}>
          Overall progress: {(overallProgress * 100).toFixed(0)}% · Caves {completedCaves}/{totalCaves}
        </p>
        <button
          type="button"
          onClick={() => completeIgloo()}
          style={{
            padding: "14px 32px",
            backgroundColor: "#00ffd5",
            color: "#000",
            border: "none",
            borderRadius: "6px",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "15px",
          }}
        >
          Return to Main Track
        </button>
        <p style={{ color: "#555", marginTop: "16px", fontSize: "12px" }}>
          Enter or Esc
        </p>
      </div>
    </div>
  );
};

export default IglooPanel;
