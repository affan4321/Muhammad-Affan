"use client";

import { useState } from "react";
import { GRAPHICS_QUALITY_ORDER, GRAPHICS_QUALITY_PRESETS, type GraphicsQuality } from "@/lib/graphicsQuality";

type SetupScreenProps = {
  initialName: string;
  initialQuality: GraphicsQuality;
  onStart: (playerName: string, graphicsQuality: GraphicsQuality) => void;
};

export const SetupScreen = ({ initialName, initialQuality, onStart }: SetupScreenProps) => {
  const [playerName, setPlayerName] = useState(initialName);
  const [graphicsQuality, setGraphicsQuality] = useState<GraphicsQuality>(initialQuality);
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(16px, 4vw, 24px)",
        background:
          "radial-gradient(circle at top, rgba(32, 255, 95, 0.12), transparent 28%), linear-gradient(180deg, #050606 0%, #020202 100%)",
        color: "#e7ffe9",
      }}
    >
      <div
        style={{
          width: "min(920px, 94vw)",
          borderRadius: "clamp(16px, 3vw, 24px)",
          border: "1px solid rgba(160, 255, 183, 0.2)",
          background: "rgba(7, 9, 8, 0.92)",
          boxShadow: "0 30px 120px rgba(0, 0, 0, 0.65)",
          padding: "clamp(20px, 4vw, 28px)",
          backdropFilter: "blur(14px)",
        }}
      >
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <div style={{ color: "#9dffb9", letterSpacing: "0.12em", fontSize: "clamp(10px, 2vw, 12px)", marginBottom: 10, textAlign: "center" }}>
            PRE-JOURNEY SETUP
          </div>
          <h1 style={{ margin: 0, fontSize: "clamp(24px, 5vw, 58px)", lineHeight: 0.95, textAlign: "center" }}>
            Welcome <span style={{ color: "#9dffb9" }}>{playerName || "Traveler"}</span>, in my portfolio gameplay!
          </h1>
          <p style={{ margin: "14px 0 0", color: "rgba(231, 255, 233, 0.72)", lineHeight: 1.6, textAlign: "center", maxWidth: "75%", marginInline: "auto", fontSize: "clamp(14px, 2.5vw, 16px)" }}>
            This helps with smooth gameplay and can be changed later with the gear in the top-right.
          </p>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            onStart(playerName.trim() || "Traveler", graphicsQuality);
          }}
          style={{ marginTop: 28, display: "grid", gap: 20 }}
        >
          <label style={{ display: "grid", gap: 10 }}>
            <span style={{ fontSize: "clamp(12px, 2.5vw, 13px)", letterSpacing: "0.08em", color: "#9dffb9" }}>Your Name</span>
            <input
              value={playerName}
              onChange={(event) => setPlayerName(event.target.value)}
              placeholder="Traveler"
              autoComplete="name"
              spellCheck={false}
              style={{
                borderRadius: 14,
                border: "1px solid rgba(160, 255, 183, 0.18)",
                background: "rgba(255, 255, 255, 0.04)",
                color: "#fff",
                padding: "clamp(12px, 3vw, 14px) clamp(14px, 3vw, 16px)",
                fontSize: "clamp(16px, 3vw, 18px)",
                outline: "none",
              }}
            />
          </label>

          <div style={{ display: "grid", gap: 12 }}>
            <span style={{ fontSize: "clamp(12px, 2.5vw, 13px)", letterSpacing: "0.08em", color: "#9dffb9" }}>Graphics Quality</span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
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
                      borderRadius: 16,
                      border: isSelected ? "1px solid #9dffb9" : "1px solid rgba(160, 255, 183, 0.14)",
                      background: isSelected ? "rgba(31, 255, 95, 0.12)" : "rgba(255, 255, 255, 0.04)",
                      color: "#f2fff4",
                      padding: "clamp(12px, 3vw, 14px)",
                      cursor: "pointer",
                      transition: "transform 0.15s ease, background 0.15s ease, border-color 0.15s ease",
                      transform: isSelected ? "translateY(-1px)" : "translateY(0)",
                    }}
                  >
                    <div style={{ fontSize: "clamp(16px, 3vw, 18px)", fontWeight: 700, marginBottom: 6 }}>{preset.label}</div>
                    <div style={{ fontSize: "clamp(11px, 2vw, 12px)", color: "rgba(231, 255, 233, 0.7)", lineHeight: 1.5 }}>
                      {preset.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", flexDirection: window.innerWidth <= 768 ? "column" : "row" }}>
            <div style={{ fontSize: "clamp(11px, 2vw, 12px)", color: "rgba(231, 255, 233, 0.7)", textAlign: window.innerWidth <= 768 ? "center" : "left" }}>
              You can change graphics mode later from the gear menu.
            </div>
            <button
              type="submit"
              onMouseEnter={() => setIsButtonHovered(true)}
              onMouseLeave={() => setIsButtonHovered(false)}
              style={{
                border: "none",
                borderRadius: 999,
                padding: "clamp(12px, 3vw, 13px) clamp(18px, 4vw, 22px)",
                background: "linear-gradient(135deg, #9dffb9, #4cff7b)",
                color: isButtonHovered ? "#1d7f05" : "#031006",
                fontWeight: 800,
                letterSpacing: "0.03em",
                cursor: "pointer",
                boxShadow: "0 12px 30px rgba(31, 255, 95, 0.2)",
                transform: isButtonHovered ? " scale(1.05) " : "translateY(0)",
                transition: "transform 0.2s ease",
                fontSize: "clamp(14px, 2.5vw, 16px)",
                width: window.innerWidth <= 768 ? "100%" : "auto",
              }}
            >
              Begin Journey
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SetupScreen;