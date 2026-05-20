"use client";

import { useState, useEffect } from "react";
import { useGameStore } from "@/store/gameStore";

/**
 * Path selector UI - shows branching path options when user reaches the end
 * Phase 1: Simple HTML overlay with keyboard control
 */
export const PathSelector = () => {
  const gameState = useGameStore((state) => state.gameState);
  const availablePaths = useGameStore((state) => state.availablePaths);
  const selectPath = useGameStore((state) => state.selectPath);
  const setGameState = useGameStore((state) => state.setGameState);
  const setProgress = useGameStore((state) => state.setProgress);
  const setCurrentTrack = useGameStore((state) => state.setCurrentTrack);
  const selectedPath = useGameStore((state) => state.selectedPath);

  const [selectedIndex, setSelectedIndex] = useState(0);

  // Setup keyboard input
  useEffect(() => {
    if (gameState !== "CHOOSING_PATH" || availablePaths.length === 0) {
      return;
    }

    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : availablePaths.length - 1
          );
          break;
        case "ArrowRight":
          setSelectedIndex((prev) =>
            prev < availablePaths.length - 1 ? prev + 1 : 0
          );
          break;
        case "Enter":
          e.preventDefault();
          const path = availablePaths[selectedIndex];
          selectPath(path.id);

          if (path.curve) {
            setCurrentTrack(path.curve);
            setProgress(0);
            setGameState("RIDING");
            setSelectedIndex(0); // Reset selection
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [
    gameState,
    availablePaths,
    selectedIndex,
    selectPath,
    setCurrentTrack,
    setProgress,
    setGameState,
  ]);

  // Don't render if not in path selection mode
  if (gameState !== "CHOOSING_PATH" || availablePaths.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 40,
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        border: "2px solid #0f0",
        borderRadius: "8px",
        padding: "30px",
        zIndex: 50,
        maxWidth: "600px",
        textAlign: "center",
      }}
    >
      <h3 style={{ color: "#0f0", margin: "0 0 20px 0" }}>Choose Your Path</h3>
      <div
        style={{
          display: "flex",
          gap: "20px",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        {availablePaths.map((path, index) => (
          <div
            key={path.id}
            onClick={() => {
              setSelectedIndex(index);
              selectPath(path.id);

              if (path.curve) {
                setCurrentTrack(path.curve);
                setProgress(0);
                setGameState("RIDING");
                setSelectedIndex(0);
              }
            }}
            style={{
              padding: "15px 30px",
              backgroundColor:
                selectedIndex === index ? "#0f0" : "#1a1a1a",
              color: selectedIndex === index ? "#000" : "#0f0",
              border: "2px solid #0f0",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
              transition: "all 0.2s",
              minWidth: "100px",
            }}
          >
            {path.label}
          </div>
        ))}
      </div>
      <p style={{ color: "#888", marginTop: "15px", fontSize: "12px" }}>
        ← → Select | Enter Confirm
      </p>
    </div>
  );
};
