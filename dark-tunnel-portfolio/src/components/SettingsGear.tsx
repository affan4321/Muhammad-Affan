"use client";

import { useEffect, useState } from "react";
import { GRAPHICS_QUALITY_ORDER, GRAPHICS_QUALITY_PRESETS } from "@/lib/graphicsQuality";
import { useGameStore } from "@/store/gameStore";

export const SettingsGear = () => {
  const playerName = useGameStore((state) => state.playerName);
  const graphicsQuality = useGameStore((state) => state.graphicsQuality);
  const setGraphicsQuality = useGameStore((state) => state.setGraphicsQuality);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        aria-label="Open graphics settings"
        style={{
          position: "fixed",
          top: 10,
          right: 10,
          zIndex: 125,
          width: 46,
          height: 46,
          borderRadius: 14,
          border: "1px solid rgba(160, 255, 183, 0.22)",
          background: isOpen ? "rgba(31, 255, 95, 0.12)" : "rgba(0, 0, 0, 0.58)",
          color: "#e7ffe9",
          cursor: "pointer",
          backdropFilter: "blur(10px)",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.35)",
          fontSize: 20,
          fontWeight: 800,
        }}
      >
        ⚙
      </button>

      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: 62,
            right: 10,
            zIndex: 124,
            width: "min(320px, calc(100vw - 20px))",
            borderRadius: 18,
            border: "1px solid rgba(160, 255, 183, 0.18)",
            background: "rgba(6, 10, 7, 0.92)",
            color: "#f2fff4",
            padding: 16,
            boxShadow: "0 22px 70px rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(14px)",
          }}
        >
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.11em", color: "#9dffb9" }}>SETTINGS</div>
            <div style={{ fontSize: 18, fontWeight: 800, marginTop: 4 }}>Hello, {playerName}</div>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {GRAPHICS_QUALITY_ORDER.map((quality) => {
              const preset = GRAPHICS_QUALITY_PRESETS[quality];
              const isSelected = graphicsQuality === quality;

              return (
                <button
                  key={quality}
                  type="button"
                  onClick={() => setGraphicsQuality(quality)}
                  style={{
                    textAlign: "left",
                    borderRadius: 12,
                    border: isSelected ? "1px solid #9dffb9" : "1px solid rgba(160, 255, 183, 0.12)",
                    background: isSelected ? "rgba(31, 255, 95, 0.12)" : "rgba(255, 255, 255, 0.04)",
                    color: "#f2fff4",
                    padding: "12px 14px",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{preset.label}</div>
                      <div style={{ fontSize: 12, color: "rgba(231, 255, 233, 0.68)", marginTop: 4 }}>
                        {preset.description}
                      </div>
                    </div>
                    {isSelected && <span style={{ color: "#9dffb9", fontSize: 12, fontWeight: 700 }}>ACTIVE</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default SettingsGear;