"use client";

import { useEffect, useState } from "react";
import { GRAPHICS_QUALITY_ORDER, GRAPHICS_QUALITY_PRESETS } from "@/lib/graphicsQuality";
import { saveUserSettings } from "@/lib/userSettings";
import { useGameStore } from "@/store/gameStore";

export const SettingsGear = () => {
  const playerName = useGameStore((state) => state.playerName);
  const graphicsQuality = useGameStore((state) => state.graphicsQuality);
  const setGraphicsQuality = useGameStore((state) => state.setGraphicsQuality);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"settings" | "help">("settings");
  const masterVolume = useGameStore((s) => s.masterVolume);
  const musicVolume = useGameStore((s) => s.musicVolume);
  const sfxVolume = useGameStore((s) => s.sfxVolume);
  const isMuted = useGameStore((s) => s.isMuted);
  const setMasterVolume = useGameStore((s) => s.setMasterVolume);
  const setMusicVolume = useGameStore((s) => s.setMusicVolume);
  const setSfxVolume = useGameStore((s) => s.setSfxVolume);
  const setMuted = useGameStore((s) => s.setMuted);
  const setUiPaused = useGameStore((s) => s.setUiPaused);
  const setMovementInput = useGameStore((s) => s.setMovementInput);
  const setCartMoving = useGameStore((s) => s.setCartMoving);

  useEffect(() => {
    setUiPaused(isOpen);
    if (isOpen) {
      setMovementInput(false, false);
      setCartMoving(false);
    }
  }, [isOpen, setCartMoving, setMovementInput, setUiPaused]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
      if (event.key.toLowerCase() === "h") {
        setIsOpen(true);
        setActiveTab("help");
      }
      if (event.key === "\\") {
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (!isMobile) return;

    // Removed auto-fullscreen on orientation change to allow user to toggle freely
    // PortraitModeOverlay now handles suggesting landscape mode during gameplay

    return () => {
      // Cleanup if needed
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      console.log("SettingsGear: Entering fullscreen");
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      // Lock to landscape when entering fullscreen
      if ((screen.orientation as any)?.lock) {
        (screen.orientation as any).lock('landscape').catch((err: any) => {
          console.error(`Error attempting to lock orientation: ${err.message}`);
        });
      }
    } else {
      console.log("SettingsGear: Exiting fullscreen");
      document.exitFullscreen().catch((err) => {
        console.error(`Error attempting to exit fullscreen: ${err.message}`);
      });
      // Try to unlock orientation (iOS doesn't support this, but Android does)
      if ((screen.orientation as any)?.unlock) {
        (screen.orientation as any).unlock();
      }
    }
  };

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
          setActiveTab("settings");
        }}
        aria-label="Open settings"
        style={{
          position: "fixed",
          top: 10,
          right: 10,
          zIndex: 125,
          width: 46,
          height: 46,
          borderRadius: 14,
          border: "1px solid rgba(160, 255, 183, 0.22)",
          background: "rgba(0, 0, 0, 0.58)",
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

      <div
        style={{
          position: "fixed",
          top: 14,
          right: 64,
          zIndex: 125,
          fontSize: 11,
          color: "rgba(231, 255, 233, 0.6)",
          letterSpacing: "0.05em",
          pointerEvents: "none",
        }}
      >
        Press H for help
      </div>

      {isMobile && (
        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label="Toggle fullscreen"
          style={{
            position: "fixed",
            top: 64,
            right: 10,
            zIndex: 124,
            width: 46,
            height: 46,
            borderRadius: 14,
            border: "1px solid rgba(160, 255, 183, 0.22)",
            background: "rgba(0, 0, 0, 0.58)",
            color: "#e7ffe9",
            cursor: "pointer",
            backdropFilter: "blur(10px)",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.35)",
            fontSize: 20,
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ⛶
        </button>
      )}
      <div
        style={{
          position: "fixed",
          top: 28,
          right: 64,
          zIndex: 125,
          fontSize: 10,
          color: "rgba(231, 255, 233, 0.5)",
          letterSpacing: "0.05em",
          pointerEvents: "none",
        }}
      >
        Press \ to toggle fullscreen
      </div>

      {isOpen && (
        <>
          <div
            onClick={() => setIsOpen(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              zIndex: 124,
            }}
          />
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 125,
              width: "min(500px, calc(100vw - 40px))",
              maxHeight: "80vh",
              borderRadius: 18,
              border: "1px solid rgba(160, 255, 183, 0.18)",
              background: "rgba(6, 10, 7, 0.96)",
              color: "#f2fff4",
              padding: 24,
              boxShadow: "0 22px 70px rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(14px)",
              overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 11, letterSpacing: "0.11em", color: "#9dffb9" }}>MENU</div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#e7ffe9",
                  fontSize: 24,
                  cursor: "pointer",
                  padding: 0,
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              <button
                type="button"
                onClick={() => setActiveTab("settings")}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: 8,
                  border: activeTab === "settings" ? "1px solid #9dffb9" : "1px solid rgba(160, 255, 183, 0.12)",
                  background: activeTab === "settings" ? "rgba(31, 255, 95, 0.12)" : "rgba(255, 255, 255, 0.04)",
                  color: "#f2fff4",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                Settings
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("help")}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: 8,
                  border: activeTab === "help" ? "1px solid #9dffb9" : "1px solid rgba(160, 255, 183, 0.12)",
                  background: activeTab === "help" ? "rgba(31, 255, 95, 0.12)" : "rgba(255, 255, 255, 0.04)",
                  color: "#f2fff4",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                Help
              </button>
            </div>

            {activeTab === "settings" && (
              <>
                <div style={{ marginBottom: 16 }}>
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

                    <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 12 }}>
                      <h4 style={{ margin: "6px 0", fontSize: 13, fontWeight: 700 }}>Audio</h4>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                        <label style={{ fontSize: 13, color: "rgba(231,255,233,0.8)" }}>Mute</label>
                        <input
                          type="checkbox"
                          checked={isMuted}
                          onChange={(e) => {
                            setMuted(e.target.checked);
                            saveUserSettings({ playerName, graphicsQuality, masterVolume, musicVolume, sfxVolume, isMuted: e.target.checked });
                          }}
                        />
                      </div>

                      <label style={{ fontSize: 12, color: "rgba(231,255,233,0.8)" }}>Master</label>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={masterVolume}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setMasterVolume(v);
                          saveUserSettings({ playerName, graphicsQuality, masterVolume: v, musicVolume, sfxVolume, isMuted });
                        }}
                      />

                      <label style={{ fontSize: 12, color: "rgba(231,255,233,0.8)" }}>Music</label>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={musicVolume}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setMusicVolume(v);
                          saveUserSettings({ playerName, graphicsQuality, masterVolume, musicVolume: v, sfxVolume, isMuted });
                        }}
                      />

                      <label style={{ fontSize: 12, color: "rgba(231,255,233,0.8)" }}>SFX</label>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={sfxVolume}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setSfxVolume(v);
                          saveUserSettings({ playerName, graphicsQuality, masterVolume, musicVolume, sfxVolume: v, isMuted });
                        }}
                      />
                    </div>
              </>
            )}

            {activeTab === "help" && (
              <>
                <div style={{ marginBottom: 16 }}>
                  <h3 style={{ margin: "0 0 12px 0", fontSize: 16, fontWeight: 700 }}>
                    Controls
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <kbd
                        style={{
                          backgroundColor: "rgba(255, 255, 255, 0.15)",
                          padding: "4px 8px",
                          borderRadius: 4,
                          fontSize: 12,
                          fontFamily: "monospace",
                          minWidth: 80,
                          textAlign: "center",
                        }}
                      >
                        \
                      </kbd>
                      <span style={{ color: "rgba(255, 255, 255, 0.8)" }}>Toggle Full screen Mode</span>
                    </div>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <kbd
                        style={{
                          backgroundColor: "rgba(255, 255, 255, 0.15)",
                          padding: "4px 8px",
                          borderRadius: 4,
                          fontSize: 12,
                          fontFamily: "monospace",
                          minWidth: 80,
                          textAlign: "center",
                        }}
                      >
                        W / ↑ / Click
                      </kbd>
                      <span style={{ color: "rgba(255, 255, 255, 0.8)" }}>Move Forward</span>
                    </div>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <kbd
                        style={{
                          backgroundColor: "rgba(255, 255, 255, 0.15)",
                          padding: "4px 8px",
                          borderRadius: 4,
                          fontSize: 12,
                          fontFamily: "monospace",
                          minWidth: 80,
                          textAlign: "center",
                        }}
                      >
                        S / ↓ / R-Click
                      </kbd>
                      <span style={{ color: "rgba(255, 255, 255, 0.8)" }}>Move Backward</span>
                    </div>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <kbd
                        style={{
                          backgroundColor: "rgba(255, 255, 255, 0.15)",
                          padding: "4px 8px",
                          borderRadius: 4,
                          fontSize: 12,
                          fontFamily: "monospace",
                          minWidth: 80,
                          textAlign: "center",
                        }}
                      >
                        Mouse
                      </kbd>
                      <span style={{ color: "rgba(255, 255, 255, 0.8)" }}>Look Around</span>
                    </div>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <kbd
                        style={{
                          backgroundColor: "rgba(255, 255, 255, 0.15)",
                          padding: "4px 8px",
                          borderRadius: 4,
                          fontSize: 12,
                          fontFamily: "monospace",
                          minWidth: 80,
                          textAlign: "center",
                        }}
                      >
                        Enter / Click
                      </kbd>
                      <span style={{ color: "rgba(255, 255, 255, 0.8)" }}>Select / Exit Chamber</span>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <h3 style={{ margin: "0 0 12px 0", fontSize: 16, fontWeight: 700 }}>
                    Navigation
                  </h3>
                  <div style={{ color: "rgba(255, 255, 255, 0.8)", lineHeight: 1.5 }}>
                    Ride through the dark tunnel and explore different paths at each
                    junction. Visit chambers to discover more about the journey.
                  </div>
                </div>

                <div>
                  <h3 style={{ margin: "0 0 12px 0", fontSize: 16, fontWeight: 700 }}>
                    Tips
                  </h3>
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: 20,
                      color: "rgba(255, 255, 255, 0.8)",
                      lineHeight: 1.6,
                      listStyleType: "disc",
                      listStylePosition: "inside",
                    }}
                  >
                    <li style={{ marginBottom: 6 }}>Use arrow keys or mouse clicks to move</li>
                    <li style={{ marginBottom: 6 }}>Explore all branches to complete the journey</li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default SettingsGear;