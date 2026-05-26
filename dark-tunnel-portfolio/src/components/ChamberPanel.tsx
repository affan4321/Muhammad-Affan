"use client";

import { useEffect } from "react";
import { useGameStore } from "@/store/gameStore";
import { CHAMBER_CONTENT, ChamberContentType } from "@/lib/chamberContent";
import PDFViewer from "./PDFViewer";

/**
 * Information chamber — end of a branch path; return to main track afterward.
 */
export const ChamberPanel = () => {
  const gameState = useGameStore((s) => s.gameState);
  const activeBranch = useGameStore((s) => s.activeBranch);
  const completeChamber = useGameStore((s) => s.completeChamber);
  const overallProgress = useGameStore((s) => s.overallProgress);
  const completedChambers = useGameStore((s) => s.completedChambers);
  const totalChambers = useGameStore((s) => s.totalChambers);

  useEffect(() => {
    if (gameState !== "INSIDE_CHAMBER") return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === "Escape") {
        e.preventDefault();
        completeChamber();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [gameState, completeChamber]);

  // Hide panel when inside chamber - information will be displayed in-world
  if (gameState !== "INSIDE_CHAMBER") {
    return null;
  }

  // Show minimal HUD instead of full panel
  const branchId = activeBranch?.id;
  const content = branchId ? CHAMBER_CONTENT[branchId] : null;
  const title = content?.title ?? activeBranch?.label ?? "Information Chamber";

  const renderContent = () => {
    // Information will be displayed in-world on objects
    return null;
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        left: 20,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        border: "1px solid #00ffd5",
        borderRadius: "8px",
        padding: "16px 20px",
        zIndex: 60,
        pointerEvents: "auto",
      }}
    >
      <p style={{ color: "#00ffd5", margin: "0 0 8px 0", fontSize: "11px", letterSpacing: "0.1em" }}>
        {title}
      </p>
      <p style={{ color: "#666", margin: "0 0 12px 0", fontSize: "12px" }}>
        WASD/Arrows to move · Mouse to look
      </p>
      <button
        type="button"
        onClick={() => completeChamber()}
        style={{
          padding: "8px 16px",
          backgroundColor: "#00ffd5",
          color: "#000",
          border: "none",
          borderRadius: "4px",
          fontWeight: "bold",
          cursor: "pointer",
          fontSize: "12px",
        }}
      >
        Exit Chamber (Esc)
      </button>
    </div>
  );
};

export default ChamberPanel;
