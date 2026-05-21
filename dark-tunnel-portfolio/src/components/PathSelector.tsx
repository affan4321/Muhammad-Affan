"use client";

import { useState, useEffect, useMemo } from "react";
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
      minWidth: "110px",
      textAlign: "center",
    }}
  >
    {path.label}
    {path.kind === "branch" && (
      <div style={{ fontSize: "10px", marginTop: "4px", opacity: 0.8 }}>
        → Information Igloo
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
  const mainSegmentIndex = useGameStore((state) => state.mainSegmentIndex);
  const journey = useGameStore((state) => state.journey);

  const { leftPaths, centerPath, rightPaths, flatList } = useMemo(() => {
    const branches = availablePaths.filter((p) => p.kind === "branch");
    const cont = availablePaths.find((p) => p.kind === "continue") ?? null;
    const left = branches.filter((p) => p.side !== "right");
    const right = branches.filter((p) => p.side === "right");
    const flat: PathOption[] = [...left, ...(cont ? [cont] : []), ...right];
    return {
      leftPaths: left,
      centerPath: cont,
      rightPaths: right,
      flatList: flat,
    };
  }, [availablePaths]);

  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [availablePaths]);

  const confirmSelection = (index: number) => {
    const path = flatList[index];
    if (!path) return;
    selectPathAtFork(path);
    setSelectedIndex(0);
  };

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
          confirmSelection(selectedIndex);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [gameState, flatList, selectedIndex, selectPathAtFork]);

  if (gameState !== "CHOOSING_PATH" || flatList.length === 0) {
    return null;
  }

  const forkLabel = journey[mainSegmentIndex]?.forkLabel ?? "Choose Your Path";
  const isTerminalFork = journey[mainSegmentIndex]?.isTerminalFork;

  const selectedId = flatList[selectedIndex]?.id;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 40,
        left: "50%",
        transform: "translateX(-50%)",
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
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            justifyContent: "flex-end",
          }}
        >
          {leftPaths.map((path) => (
            <PathButton
              key={path.id}
              path={path}
              selected={selectedId === path.id}
              onSelect={() => setSelectedIndex(flatList.findIndex((p) => p.id === path.id))}
              onConfirm={() =>
                confirmSelection(flatList.findIndex((p) => p.id === path.id))
              }
            />
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "center" }}>
          {centerPath ? (
            <PathButton
              path={centerPath}
              selected={selectedId === centerPath.id}
              onSelect={() =>
                setSelectedIndex(flatList.findIndex((p) => p.id === centerPath.id))
              }
              onConfirm={() =>
                confirmSelection(flatList.findIndex((p) => p.id === centerPath.id))
              }
            />
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            justifyContent: "flex-start",
          }}
        >
          {rightPaths.map((path) => (
            <PathButton
              key={path.id}
              path={path}
              selected={selectedId === path.id}
              onSelect={() => setSelectedIndex(flatList.findIndex((p) => p.id === path.id))}
              onConfirm={() =>
                confirmSelection(flatList.findIndex((p) => p.id === path.id))
              }
            />
          ))}
        </div>
      </div>

      <p style={{ color: "#888", marginTop: "15px", fontSize: "12px" }}>
        ← → Select (left · center main · right) | Enter Confirm
      </p>
    </div>
  );
};
