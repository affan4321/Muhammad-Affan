"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useGameStore } from "@/store/gameStore";
import { PathOption } from "@/store/types";

const PathButton = ({
  path,
  selected,
  onSelect,
  onConfirm,
}: {
  path: PathOption;
  selected: boolean;
  onSelect: () => void;
  onConfirm: () => void;
}) => (
  <div
    role="button"
    tabIndex={0}
    onClick={() => {
      onSelect();
      onConfirm();
    }}
    onKeyDown={(e) => e.key === "Enter" && onConfirm()}
    style={{
      padding: "15px 26px",
      backgroundColor: selected ? "#0f0" : "#1a1a1a",
      color: selected ? "#000" : "#0f0",
      border: path.kind === "continue" ? "2px dashed #0f0" : "2px solid #0f0",
      borderRadius: "4px",
      cursor: "pointer",
      fontWeight: "bold",
      transition: "all 0.2s",
      flex: 1,
      minWidth: "140px",
      maxWidth: "200px",
      textAlign: "center",
    }}
  >
    {path.label}
    {path.kind === "branch" && (
      <div style={{ fontSize: "10px", marginTop: "4px", opacity: 0.8 }}>
        → Information Chamber
      </div>
    )}
  </div>
);

/**
 * Fork selector — branches on sides, "Continue on Main" centered on the main path.
 */
export const PathSelector = () => {
  const gameState = useGameStore((state) => state.gameState);
  const availablePaths = useGameStore((state) => state.availablePaths);
  const selectPathAtFork = useGameStore((state) => state.selectPathAtFork);
  const returnToBeginning = useGameStore((state) => state.returnToBeginning);
  const mainSegmentIndex = useGameStore((state) => state.mainSegmentIndex);
  const journey = useGameStore((state) => state.journey);

  const { flatList } = useMemo(() => {
    const branches = availablePaths.filter((p) => p.kind === "branch");
    const cont = availablePaths.find((p) => p.kind === "continue") ?? null;
    const left = branches.filter((p) => p.side !== "right");
    const right = branches.filter((p) => p.side === "right");
    const flat: PathOption[] = [...left, ...(cont ? [cont] : []), ...right];
    return {
      flatList: flat,
    };
  }, [availablePaths]);

  const [selectedIndex, setSelectedIndex] = useState(0);

  const confirmSelection = useCallback((index: number) => {
    const path = flatList[index];
    if (!path) return;
    selectPathAtFork(path);
    setSelectedIndex(0);
  }, [flatList, selectPathAtFork]);

  const safeSelectedIndex =
    flatList.length === 0 ? 0 : Math.min(selectedIndex, flatList.length - 1);

  useEffect(() => {
    if (gameState !== "CHOOSING_PATH" || flatList.length === 0) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : flatList.length - 1));
          break;
        case "ArrowRight":
          setSelectedIndex((prev) => (prev < flatList.length - 1 ? prev + 1 : 0));
          break;
        case "Enter":
          e.preventDefault();
          confirmSelection(safeSelectedIndex);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [gameState, flatList, safeSelectedIndex, confirmSelection]);

  if (gameState !== "CHOOSING_PATH" || flatList.length === 0) {
    return null;
  }

  const forkLabel = journey[mainSegmentIndex]?.forkLabel ?? "Choose Your Path";
  const isTerminalFork = journey[mainSegmentIndex]?.isTerminalFork;

  const selectedId = flatList[safeSelectedIndex]?.id;

  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        backgroundColor: "rgba(0, 0, 0, 0.92)",
        border: "2px solid #0f0",
        borderRadius: "8px",
        padding: "28px 32px",
        zIndex: 50,
        width: "min(92vw, 820px)",
        textAlign: "center",
      }}
    >
      <h3 style={{ color: "#0f0", margin: "0 0 8px 0" }}>{forkLabel}</h3>
      <p style={{ color: "#888", margin: "0 0 20px 0", fontSize: "13px" }}>
        {isTerminalFork
          ? "Choose one of four paths ahead — all connect from where you arrived"
          : `Main track · segment ${mainSegmentIndex + 1} of ${journey.length}`}
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        {flatList.map((path, index) => (
          <PathButton
            key={path.id}
            path={path}
            selected={selectedId === path.id}
            onSelect={() => setSelectedIndex(index)}
            onConfirm={() => confirmSelection(index)}
          />
        ))}
      </div>

      <p style={{ color: "#888", marginTop: "15px", fontSize: "12px" }}>
        ← → Select | Enter Confirm
      </p>

      <button
        type="button"
        onClick={() => returnToBeginning()}
        style={{
          marginTop: "10px",
          padding: "8px 16px",
          backgroundColor: "transparent",
          color: "#0f0",
          border: "1px solid #0f0",
          borderRadius: "4px",
          fontWeight: "bold",
          cursor: "pointer",
          fontSize: "12px",
        }}
      >
        Beginning
      </button>
    </div>
  );
};
