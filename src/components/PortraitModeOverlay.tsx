"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/store/gameStore";

export const PortraitModeOverlay = () => {
  const gameState = useGameStore((state) => state.gameState);
  const [isPortrait, setIsPortrait] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    };

    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };

    checkMobile();
    checkOrientation();

    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);

    return () => {
      window.removeEventListener("resize", checkOrientation);
      window.removeEventListener("orientationchange", checkOrientation);
    };
  }, []);

  // Only show overlay during gameplay (not IDLE) and when in portrait mode on mobile
  const hasStartedGame = gameState !== "IDLE";
  if (!isMobile || !hasStartedGame || !isPortrait) return null;

  const toggleFullscreen = () => {
    console.log("PortraitModeOverlay: Toggle fullscreen clicked, current fullscreen state:", !!document.fullscreenElement);
    if (!document.fullscreenElement) {
      console.log("PortraitModeOverlay: Requesting fullscreen");
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      // Try to lock orientation to landscape
      if ((screen.orientation as any)?.lock) {
        console.log("PortraitModeOverlay: Locking orientation to landscape");
        (screen.orientation as any).lock('landscape').catch((err: any) => {
          console.error(`Error attempting to lock orientation: ${err.message}`);
        });
      }
    } else {
      // If already in fullscreen, exit it first
      console.log("PortraitModeOverlay: Exiting fullscreen");
      document.exitFullscreen().catch((err) => {
        console.error(`Error attempting to exit fullscreen: ${err.message}`);
      });
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        zIndex: 10000,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 48,
          marginBottom: 20,
        }}
      >
        📱
      </div>
      <h2
        style={{
          color: "#e7ffe9",
          fontSize: 24,
          fontWeight: 700,
          marginBottom: 16,
          margin: 0,
        }}
      >
        Rotate Your Device
      </h2>
      <p
        style={{
          color: "rgba(231, 255, 233, 0.8)",
          fontSize: 16,
          marginBottom: 32,
          lineHeight: 1.5,
          margin: 0,
        }}
      >
        For the best experience, please rotate your device to landscape mode or enable fullscreen.
      </p>
      <button
        onClick={toggleFullscreen}
        style={{
          padding: "16px 32px",
          borderRadius: 12,
          border: "1px solid rgba(160, 255, 183, 0.22)",
          background: "rgba(31, 255, 95, 0.12)",
          color: "#f2fff4",
          cursor: "pointer",
          fontSize: 16,
          fontWeight: 600,
          backdropFilter: "blur(10px)",
        }}
      >
        Enable Fullscreen
      </button>
    </div>
  );
};

export default PortraitModeOverlay;
