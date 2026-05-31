"use client";

import { useEffect, useMemo } from "react";
import { useGameStore } from "@/store/gameStore";
import { SMART_MAP_MARKERS } from "@/lib/smartMap";

export const SmartMapPanel = () => {
  const gameState = useGameStore((state) => state.gameState);
  const journey = useGameStore((state) => state.journey);
  const mainSegmentIndex = useGameStore((state) => state.mainSegmentIndex);
  const overallProgress = useGameStore((state) => state.overallProgress);
  const completedChambers = useGameStore((state) => state.completedChambers);
  const totalChambers = useGameStore((state) => state.totalChambers);
  const openMapBoardId = useGameStore((state) => state.openMapBoardId);
  const setOpenMapBoardId = useGameStore((state) => state.setOpenMapBoardId);

  const currentBoard = useMemo(
    () => SMART_MAP_MARKERS.find((marker) => marker.id === openMapBoardId) ?? null,
    [openMapBoardId]
  );

  const nextForks = useMemo(() => {
    return journey.slice(mainSegmentIndex, mainSegmentIndex + 3).map((segment, index) => {
      const branchNames = segment.branches.map((branch) => branch.label).join(" / ");
      return {
        id: segment.id,
        label: segment.forkLabel,
        branchNames,
        status: index === 0 ? "YOU ARE HERE" : "UPCOMING",
      };
    });
  }, [journey, mainSegmentIndex]);

  useEffect(() => {
    if (!openMapBoardId) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpenMapBoardId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openMapBoardId, setOpenMapBoardId]);

  useEffect(() => {
    if (gameState === "INSIDE_CHAMBER") {
      setOpenMapBoardId(null);
    }
  }, [gameState, setOpenMapBoardId]);

  if (!openMapBoardId || !currentBoard) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 110,
        background: "rgba(0, 0, 0, 0.64)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={() => setOpenMapBoardId(null)}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          width: "min(760px, 94vw)",
          borderRadius: "16px",
          border: "1px solid rgba(24, 255, 95, 0.45)",
          background:
            "linear-gradient(140deg, rgba(8,18,10,0.98), rgba(8,12,10,0.96) 45%, rgba(4,8,5,0.95))",
          color: "#d8ffe3",
          padding: "20px",
          boxShadow: "0 28px 80px rgba(0, 0, 0, 0.72)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
          <div>
            <div style={{ fontSize: "12px", letterSpacing: "0.11em", color: "#8df5ad" }}>{currentBoard.label}</div>
            <div style={{ marginTop: "6px", fontSize: "24px", fontWeight: 700 }}>Smart Path Map</div>
          </div>
          <button
            type="button"
            onClick={() => setOpenMapBoardId(null)}
            style={{
              padding: "7px 12px",
              background: "transparent",
              border: "1px solid rgba(24, 255, 95, 0.5)",
              color: "#9dffb9",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Close (Esc)
          </button>
        </div>

        <div style={{ marginTop: "16px", marginBottom: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#9ce9b1", marginBottom: "7px" }}>
            <span>Journey Completion</span>
            <span>{Math.round(overallProgress * 100)}%</span>
          </div>
          <div style={{ width: "100%", height: "10px", borderRadius: "999px", background: "rgba(255, 255, 255, 0.12)", overflow: "hidden" }}>
            <div
              style={{
                width: `${Math.max(4, Math.round(overallProgress * 100))}%`,
                height: "100%",
                background: "linear-gradient(90deg, #14ff67, #98ffbd)",
                boxShadow: "0 0 18px rgba(24, 255, 95, 0.45)",
              }}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "12px" }}>
          {nextForks.map((fork) => (
            <div
              key={fork.id}
              style={{
                border: "1px solid rgba(24, 255, 95, 0.24)",
                borderRadius: "12px",
                padding: "12px",
                background: fork.status === "YOU ARE HERE" ? "rgba(24, 255, 95, 0.14)" : "rgba(255, 255, 255, 0.04)",
              }}
            >
              <div style={{ fontSize: "11px", color: "#8df5ad", letterSpacing: "0.07em", marginBottom: "7px" }}>{fork.status}</div>
              <div style={{ fontWeight: 700, marginBottom: "6px", color: "#d7ffe2" }}>{fork.label}</div>
              <div style={{ fontSize: "12px", lineHeight: 1.5, color: "#9fbcaa" }}>{fork.branchNames || "Continue Forward"}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "14px", fontSize: "12px", color: "#8fb59a" }}>
          Chambers completed: {completedChambers} / {totalChambers}
        </div>
      </div>
    </div>
  );
};

export default SmartMapPanel;
