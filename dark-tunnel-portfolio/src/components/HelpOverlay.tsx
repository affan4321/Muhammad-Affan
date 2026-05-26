"use client";

import { useState, useEffect } from "react";

export const HelpOverlay = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "h") {
        setIsOpen(!isOpen);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          top: 10,
          right: 10,
          backgroundColor: isOpen ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.6)",
          color: "#fff",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "10px 16px",
          fontSize: "14px",
          fontWeight: 600,
          zIndex: 120,
          borderRadius: "8px",
          cursor: "pointer",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          backdropFilter: "blur(10px)",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.25)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = isOpen ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.6)";
        }}
      >
        {isOpen ? "✕ Close" : "H for Help"}
      </button>

      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: 60,
            right: 10,
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            color: "#fff",
            fontFamily: "system-ui, -apple-system, sans-serif",
            padding: "20px",
            fontSize: "14px",
            zIndex: 119,
            borderRadius: "12px",
            maxWidth: "320px",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
          }}
        >
          <div style={{ marginBottom: "16px" }}>
            <h3 style={{ margin: "0 0 12px 0", fontSize: "16px", fontWeight: 700 }}>
              Controls
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <kbd
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontFamily: "monospace",
                    minWidth: "80px",
                    textAlign: "center",
                  }}
                >
                  W / ↑ / Click
                </kbd>
                <span style={{ color: "rgba(255, 255, 255, 0.8)" }}>Move Forward</span>
              </div>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <kbd
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontFamily: "monospace",
                    minWidth: "80px",
                    textAlign: "center",
                  }}
                >
                  S / ↓ / R-Click
                </kbd>
                <span style={{ color: "rgba(255, 255, 255, 0.8)" }}>Move Backward</span>
              </div>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <kbd
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontFamily: "monospace",
                    minWidth: "80px",
                    textAlign: "center",
                  }}
                >
                  Mouse
                </kbd>
                <span style={{ color: "rgba(255, 255, 255, 0.8)" }}>Look Around</span>
              </div>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <kbd
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontFamily: "monospace",
                    minWidth: "80px",
                    textAlign: "center",
                  }}
                >
                  Enter / Click
                </kbd>
                <span style={{ color: "rgba(255, 255, 255, 0.8)" }}>Select / Exit Chamber</span>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <h3 style={{ margin: "0 0 12px 0", fontSize: "16px", fontWeight: 700 }}>
              Navigation
            </h3>
            <div style={{ color: "rgba(255, 255, 255, 0.8)", lineHeight: "1.5" }}>
              Ride through the dark tunnel and explore different paths at each
              junction. Visit chambers to discover more about the journey.
            </div>
          </div>

          <div>
            <h3 style={{ margin: "0 0 12px 0", fontSize: "16px", fontWeight: 700 }}>
              Tips
            </h3>
            <ul
              style={{
                margin: 0,
                paddingLeft: "20px",
                color: "rgba(255, 255, 255, 0.8)",
                lineHeight: "1.6",
                listStyleType: "disc",
                listStylePosition: "inside",
              }}
            >
              <li style={{ marginBottom: "6px" }}>Use arrow keys or mouse clicks to move</li>
              <li style={{ marginBottom: "6px" }}>Explore all branches to complete the journey</li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

export default HelpOverlay;
